import type { InstagramPost, InstagramProfile } from './types';

export class RapidAPIFetcher {
    private apiKey: string;
    private apiHost: string;

    constructor(apiKey: string, apiHost: string) {
        this.apiKey = apiKey;
        this.apiHost = apiHost;
    }

    private getHeaders(): Record<string, string> {
        return {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': this.apiHost,
        };
    }

    async fetchUserInfo(username: string): Promise<any | null> {
        try {
            console.log('[RapidAPI] Fetching user info:', username);
            const url = `https://${this.apiHost}/api/v1/info?id_or_username=${encodeURIComponent(username)}`;

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Info fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            let data = json.data;
            if (!data) return null;

            if (data.user) {
                data = data.user;
            }

            return {
                username: data.username,
                fullName: data.full_name || data.username,
                profilePic: data.profile_pic_url || '',
                userId: data.pk || data.id,
            };
        } catch (error) {
            console.error('[RapidAPI] Info error:', error);
            return null;
        }
    }

    async fetchUserProfile(username: string): Promise<InstagramProfile | null> {
        try {
            // Parallelize fetching info and posts
            const [userInfo, postsResult] = await Promise.all([
                this.fetchUserInfo(username),
                this.fetchUserPosts(username)
            ]);

            if (!userInfo) return null;

            return {
                ...userInfo,
                posts: postsResult.posts,
                nextCursor: postsResult.nextCursor,
            };
        } catch (error) {
            console.error('[RapidAPI] Error:', error);
            return null;
        }
    }

    async fetchUserPosts(username: string, cursor?: string): Promise<{ posts: InstagramPost[], nextCursor?: string }> {
        try {
            let postsUrl = `https://${this.apiHost}/api/v1/posts?username=${encodeURIComponent(username)}&limit=12&include_captions=true`;
            if (cursor) {
                postsUrl += `&cursor=${encodeURIComponent(cursor)}`;
            }

            console.log('[RapidAPI] Fetching posts from:', postsUrl);

            const postsResponse = await fetch(postsUrl, {
                headers: this.getHeaders(),
            });

            let posts: InstagramPost[] = [];
            let nextCursor: string | undefined;

            if (postsResponse.ok) {
                const postsJson = await postsResponse.json();
                const items = postsJson.data?.posts || [];

                console.log('[RapidAPI] Response keys:', Object.keys(postsJson));
                console.log('[RapidAPI] Data keys:', postsJson.data ? Object.keys(postsJson.data) : 'no data');

                // The API returns next_cursor directly in data
                if (postsJson.data?.next_cursor) {
                    nextCursor = postsJson.data.next_cursor;
                }

                console.log('[RapidAPI] Found posts:', items.length, 'Next cursor:', nextCursor);

                posts = items.map((item: any) => {
                    const thumbnail = item.image?.[0]?.url ||
                        item.thumbnail_url ||
                        item.image_versions2?.candidates?.[0]?.url ||
                        item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
                        '';

                    return {
                        id: item.id || item.pk,
                        type: (item.media_type === 8 || item.carousel_media_count > 0 || (item.carousel_media && item.carousel_media.length > 0)) ? 'carousel' : item.media_type === 2 ? 'video' : 'image',
                        thumbnail: thumbnail,
                        url: '',
                        title: item.caption?.text || item.caption || '',
                        description: '',
                        shortcode: item.code,
                        media: item.carousel_media?.map((m: any) => ({
                            type: m.media_type === 2 ? 'video' : 'image',
                            url: m.video_versions?.[0]?.url || m.image_versions2?.candidates?.[0]?.url || '',
                            thumbnail: m.image_versions2?.candidates?.[0]?.url || ''
                        }))
                    };
                });
            }

            return { posts, nextCursor };
        } catch (error) {
            console.error('[RapidAPI] Fetch posts error:', error);
            return { posts: [] };
        }
    }

    async fetchPost(shortcode: string): Promise<InstagramPost | null> {
        try {
            // User specified 'code' parameter for post-info
            const url = `https://${this.apiHost}/api/v1/post-info?code=${shortcode}`;
            console.log('[RapidAPI] Fetching post info:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Post fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            console.log('[RapidAPI] Post info response keys:', Object.keys(json));
            console.log('[RapidAPI] Post info data keys:', json.data ? Object.keys(json.data) : 'no data');
            const item = json.data?.post || json.data;

            if (!item) {
                console.error('[RapidAPI] No data in post info response');
                return null;
            }

            console.log('[RapidAPI] Item keys:', Object.keys(item));
            console.log('[RapidAPI] Has carousel_media?', !!item.carousel_media);
            console.log('[RapidAPI] Has edge_sidecar_to_children?', !!item.edge_sidecar_to_children);
            console.log('[RapidAPI] Carousel media count:', item.carousel_media?.length || 0);

            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || item.display_url || '';
            // console.log('[RapidAPI] Extracted media URL:', mediaUrl ? 'Found' : 'Not Found');

            // Handle GraphQL format (edge_sidecar_to_children) or private API format (carousel_media)
            let mediaItems = undefined;
            if (item.edge_sidecar_to_children?.edges) {
                // GraphQL format
                console.log('[RapidAPI] Using GraphQL carousel format, edge count:', item.edge_sidecar_to_children.edges.length);
                mediaItems = item.edge_sidecar_to_children.edges.map((edge: any) => {
                    const node = edge.node;
                    const rawUrl = node.video_url || node.display_url || '';
                    const rawThumbnail = node.display_url || '';
                    return {
                        type: node.is_video ? 'video' : 'image',
                        url: rawUrl ? `/api/proxy?url=${encodeURIComponent(rawUrl)}` : '',
                        thumbnail: rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : ''
                    };
                });
            } else if (item.carousel_media) {
                // Private API format
                console.log('[RapidAPI] Using private API carousel format');
                mediaItems = item.carousel_media.map((m: any) => ({
                    type: m.media_type === 2 ? 'video' : 'image',
                    url: m.video_versions?.[0]?.url || m.image_versions2?.candidates?.[0]?.url || '',
                    thumbnail: m.image_versions2?.candidates?.[0]?.url || ''
                }));
            }

            return {
                id: item.id || item.pk,
                type: item.is_video ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates?.[0]?.url || item.display_url || '',
                url: mediaUrl,
                title: item.caption?.text || item.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                description: '',
                shortcode: item.code || item.shortcode || shortcode,
                media: mediaItems
            };
        } catch (error) {
            console.error('[RapidAPI] Post error:', error);
            return null;
        }
    }

    async fetchStory(storyId: string): Promise<InstagramPost | null> {
        try {
            // Try using the same endpoint as posts, as it often handles media IDs
            const url = `https://${this.apiHost}/api/v1/post-info?code_or_id_or_url=${storyId}`;
            console.log('[RapidAPI] Fetching story info:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Story fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            const item = json.data;

            if (!item) {
                console.error('[RapidAPI] No data in story info response');
                return null;
            }

            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || '';

            return {
                id: item.id || item.pk,
                type: item.media_type === 2 ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates?.[0]?.url || '',
                url: mediaUrl,
                title: 'Instagram Story',
                description: '',
                shortcode: item.code || storyId,
            };
        } catch (error) {
            console.error('[RapidAPI] Story error:', error);
            return null;
        }
    }
    async fetchUserProfile(username: string): Promise<InstagramProfile | null> {
        try {
            // Parallelize fetching info and posts
            const [userInfo, postsResult] = await Promise.all([
                this.fetchUserInfo(username),
                this.fetchUserPosts(username)
            ]);

            if (!userInfo) return null;

            return {
                ...userInfo,
                posts: postsResult.posts,
                nextCursor: postsResult.nextCursor,
            };
        } catch (error) {
            console.error('[RapidAPI] Error:', error);
            return null;
        }
    }

    async fetchUserPosts(username: string, cursor?: string): Promise<{ posts: InstagramPost[], nextCursor?: string }> {
        try {
            let postsUrl = `https://${this.apiHost}/api/v1/posts?username=${encodeURIComponent(username)}&limit=12&include_captions=true`;
            if (cursor) {
                postsUrl += `&cursor=${encodeURIComponent(cursor)}`;
            }

            console.log('[RapidAPI] Fetching posts from:', postsUrl);

            const postsResponse = await fetch(postsUrl, {
                headers: this.getHeaders(),
            });

            let posts: InstagramPost[] = [];
            let nextCursor: string | undefined;

            if (postsResponse.ok) {
                const postsJson = await postsResponse.json();
                const items = postsJson.data?.posts || [];

                console.log('[RapidAPI] Response keys:', Object.keys(postsJson));
                console.log('[RapidAPI] Data keys:', postsJson.data ? Object.keys(postsJson.data) : 'no data');

                // The API returns next_cursor directly in data
                if (postsJson.data?.next_cursor) {
                    nextCursor = postsJson.data.next_cursor;
                }

                console.log('[RapidAPI] Found posts:', items.length, 'Next cursor:', nextCursor);

                posts = items.map((item: any) => {
                    const thumbnail = item.image?.[0]?.url ||
                        item.thumbnail_url ||
                        item.image_versions2?.candidates?.[0]?.url ||
                        item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
                        '';

                    return {
                        id: item.id || item.pk,
                        type: (item.media_type === 8 || item.carousel_media_count > 0 || (item.carousel_media && item.carousel_media.length > 0)) ? 'carousel' : item.media_type === 2 ? 'video' : 'image',
                        thumbnail: thumbnail,
                        url: '',
                        title: item.caption?.text || item.caption || '',
                        description: '',
                        shortcode: item.code,
                        media: item.carousel_media?.map((m: any) => ({
                            type: m.media_type === 2 ? 'video' : 'image',
                            url: m.video_versions?.[0]?.url || m.image_versions2?.candidates?.[0]?.url || '',
                            thumbnail: m.image_versions2?.candidates?.[0]?.url || ''
                        }))
                    };
                });
            }

            return { posts, nextCursor };
        } catch (error) {
            console.error('[RapidAPI] Fetch posts error:', error);
            return { posts: [] };
        }
    }

    async fetchPost(shortcode: string): Promise<InstagramPost | null> {
        try {
            // User specified 'code' parameter for post-info
            const url = `https://${this.apiHost}/api/v1/post-info?code=${shortcode}`;
            console.log('[RapidAPI] Fetching post info:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Post fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            console.log('[RapidAPI] Post info response keys:', Object.keys(json));
            console.log('[RapidAPI] Post info data keys:', json.data ? Object.keys(json.data) : 'no data');
            const item = json.data?.post || json.data;

            if (!item) {
                console.error('[RapidAPI] No data in post info response');
                return null;
            }

            console.log('[RapidAPI] Item keys:', Object.keys(item));
            console.log('[RapidAPI] Has carousel_media?', !!item.carousel_media);
            console.log('[RapidAPI] Has edge_sidecar_to_children?', !!item.edge_sidecar_to_children);
            console.log('[RapidAPI] Carousel media count:', item.carousel_media?.length || 0);

            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || item.display_url || '';
            // console.log('[RapidAPI] Extracted media URL:', mediaUrl ? 'Found' : 'Not Found');

            // Handle GraphQL format (edge_sidecar_to_children) or private API format (carousel_media)
            let mediaItems = undefined;
            if (item.edge_sidecar_to_children?.edges) {
                // GraphQL format
                console.log('[RapidAPI] Using GraphQL carousel format, edge count:', item.edge_sidecar_to_children.edges.length);
                mediaItems = item.edge_sidecar_to_children.edges.map((edge: any) => {
                    const node = edge.node;
                    const rawUrl = node.video_url || node.display_url || '';
                    const rawThumbnail = node.display_url || '';
                    return {
                        type: node.is_video ? 'video' : 'image',
                        url: rawUrl ? `/api/proxy?url=${encodeURIComponent(rawUrl)}` : '',
                        thumbnail: rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : ''
                    };
                });
            } else if (item.carousel_media) {
                // Private API format
                console.log('[RapidAPI] Using private API carousel format');
                mediaItems = item.carousel_media.map((m: any) => ({
                    type: m.media_type === 2 ? 'video' : 'image',
                    url: m.video_versions?.[0]?.url || m.image_versions2?.candidates?.[0]?.url || '',
                    thumbnail: m.image_versions2?.candidates?.[0]?.url || ''
                }));
            }

            return {
                id: item.id || item.pk,
                type: item.is_video ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates?.[0]?.url || item.display_url || '',
                url: mediaUrl,
                title: item.caption?.text || item.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                description: '',
                shortcode: item.code || item.shortcode || shortcode,
                media: mediaItems
            };
        } catch (error) {
            console.error('[RapidAPI] Post error:', error);
            return null;
        }
    }

    async fetchStory(storyId: string): Promise<InstagramPost | null> {
        try {
            // Try using the same endpoint as posts, as it often handles media IDs
            const url = `https://${this.apiHost}/api/v1/post-info?code_or_id_or_url=${storyId}`;
            console.log('[RapidAPI] Fetching story info:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Story fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            const item = json.data;

            if (!item) {
                console.error('[RapidAPI] No data in story info response');
                return null;
            }

            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || '';

            return {
                id: item.id || item.pk,
                type: item.media_type === 2 ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates?.[0]?.url || '',
                url: mediaUrl,
                title: 'Instagram Story',
                description: '',
                shortcode: item.code || storyId,
            };
        } catch (error) {
            console.error('[RapidAPI] Story error:', error);
            return null;
        }
    }

    async fetchUserStories(userId: string): Promise<InstagramPost[]> {
        // Disabled for now as per user request to avoid 429s and slow loading
        console.log('[RapidAPI] User stories fetching disabled (Coming Soon mode)');
        return [];
    }

    async fetchHighlightStories(highlightId: string): Promise<InstagramPost[]> {
        try {
            console.log('[RapidAPI] Fetching highlight stories for:', highlightId);

            // Strip "highlight:" prefix if present
            const cleanId = highlightId.replace(/^highlight:/, '');

            // Try multiple possible endpoint formats
            const endpoints = [
                `https://${this.apiHost}/api/v1/highlight?highlight_id=${cleanId}`,
                `https://${this.apiHost}/api/v1/highlight/${cleanId}`,
                `https://${this.apiHost}/api/v1/highlight-items?highlight_id=${cleanId}`,
            ];

            for (const url of endpoints) {
                console.log('[RapidAPI] Trying endpoint:', url);
                const response = await fetch(url, {
                    headers: this.getHeaders(),
                });

                if (response.ok) {
                    const json = await response.json();
                    console.log('[RapidAPI] Highlight stories response keys:', Object.keys(json));
                    console.log('[RapidAPI] Highlight stories data keys:', json.data ? Object.keys(json.data) : 'no data');

                    const items = json.data?.items || json.data?.stories || json.data || [];

                    if (Array.isArray(items) && items.length > 0) {
                        return items.map((item: any) => {
                            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || item.display_url || '';
                            const thumbnail = item.image_versions2?.candidates?.[0]?.url || item.display_url || '';

                            return {
                                id: item.id || item.pk,
                                type: item.is_video || item.media_type === 2 ? 'video' : 'image',
                                thumbnail: thumbnail ? `/api/proxy?url=${encodeURIComponent(thumbnail)}` : '',
                                url: mediaUrl ? `/api/proxy?url=${encodeURIComponent(mediaUrl)}` : '',
                                title: 'Highlight Story',
                                description: '',
                                shortcode: item.code || item.id,
                            };
                        });
                    }
                } else {
                    console.log('[RapidAPI] Endpoint failed with status:', response.status);
                }
            }

            console.error('[RapidAPI] All highlight story endpoints failed');
            return [];
        } catch (error) {
            console.error('[RapidAPI] Highlight stories error:', error);
            return [];
        }
    }

    async fetchUserHighlights(username: string): Promise<InstagramPost[]> {
        try {
            console.log('[RapidAPI] Fetching user highlights for:', username);

            // Use the endpoint provided by user: /api/v1/highlights?id_or_username=...
            const url = `https://${this.apiHost}/api/v1/highlights?id_or_username=${encodeURIComponent(username)}`;

            const response = await fetch(url, {
                headers: this.getHeaders(),
                cache: 'no-store',
            });

            if (!response.ok) {
                console.error('[RapidAPI] Highlights fetch failed:', response.status);
                return [];
            }

            const json = await response.json();
            const items = json.data?.items || json.data?.highlights || [];

            // console.log('[RapidAPI] Found highlights:', items.length);

            return items.map((item: any) => {
                // Highlights often have a cover image
                const rawThumbnail = item.cover_media?.cropped_image_version?.url ||
                    item.cover_media?.image_versions2?.candidates?.[0]?.url ||
                    item.cover_media?.url ||
                    item.thumbnail_src ||
                    item.url ||
                    '';

                // Use proxy to avoid CORS issues
                const thumbnail = rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : '';

                return {
                    id: item.id || item.pk,
                    type: 'highlight', // Highlights are collections
                    thumbnail: thumbnail,
                    url: '', // Clicking should maybe open the highlight? Or we fetch highlight items?
                    title: item.title || 'Highlight',
                    description: '',
                    shortcode: item.id, // Highlights use ID usually
                };
            });
        } catch (error) {
            console.error('[RapidAPI] Highlights error:', error);
            return [];
        }
    }
}
