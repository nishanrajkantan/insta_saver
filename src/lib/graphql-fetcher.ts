import type { InstagramPost, InstagramProfile, InstagramStory } from './types';

const INSTAGRAM_APP_ID = '936619743392459';

interface GraphQLHeaders extends Record<string, string> {
    'User-Agent': string;
    'x-ig-app-id': string;
}

export class InstagramGraphQLFetcher {
    private sessionId?: string;

    constructor(sessionId?: string) {
        this.sessionId = sessionId;
    }

    private getHeaders(): GraphQLHeaders {
        const headers: GraphQLHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'x-ig-app-id': INSTAGRAM_APP_ID,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.instagram.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
        };

        if (this.sessionId) {
            headers['Cookie'] = `sessionid=${this.sessionId}`;
        }

        return headers;
    }

    async fetchUserProfile(username: string): Promise<InstagramProfile | null> {
        try {
            // Use the legacy endpoint - more reliable
            const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;

            console.log('[IG] Fetching profile:', username);
            console.log('[IG] URL:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
                redirect: 'manual', // Don't follow redirects
            });

            console.log('[IG] Response status:', response.status);

            // If we get a redirect, Instagram is blocking us
            if (response.status === 301 || response.status === 302) {
                console.error('[IG] Instagram redirected (blocking request)');
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[IG] Failed:`, {
                    status: response.status,
                    body: errorText.substring(0, 300),
                });
                return null;
            }

            const json = await response.json();

            // Try different JSON structures
            const user = json.graphql?.user || json.data?.user || json.user;

            if (!user) {
                console.error('[IG] No user in response');
                console.log('[IG] Keys:', Object.keys(json));
                return null;
            }

            const posts: InstagramPost[] = [];
            const edges = user.edge_owner_to_timeline_media?.edges || [];

            console.log('[IG] Found posts:', edges.length);

            for (const edge of edges.slice(0, 12)) {
                const node = edge.node;
                posts.push({
                    id: node.id,
                    type: node.is_video ? 'video' : node.__typename === 'GraphSidecar' ? 'carousel' : 'image',
                    thumbnail: node.display_url || node.thumbnail_src,
                    url: `https://www.instagram.com/p/${node.shortcode}/`,
                    title: node.edge_media_to_caption?.edges[0]?.node?.text || '',
                    description: '',
                    shortcode: node.shortcode,
                });
            }

            return {
                username: user.username,
                fullName: user.full_name,
                profilePic: user.profile_pic_url_hd || user.profile_pic_url,
                userId: user.id,
                posts,
            };
        } catch (error) {
            console.error('[IG] Error:', error);
            return null;
        }
    }

    async fetchStories(userId: string): Promise<InstagramStory[]> {
        if (!this.sessionId) {
            console.warn('Stories require auth');
            return [];
        }

        try {
            const url = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${userId}`;

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error(`Stories failed: ${response.status}`);
                return [];
            }

            const json = await response.json();
            const reels = json.reels_media?.[0];

            if (!reels?.items) return [];

            return reels.items.map((item: any) => ({
                id: item.id,
                type: item.media_type === 2 ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates[0]?.url || '',
                url: item.video_versions?.[0]?.url || item.image_versions2?.candidates[0]?.url || '',
                expiresAt: item.expiring_at_timestamp,
            }));
        } catch (error) {
            console.error('Stories error:', error);
            return [];
        }
    }

    async fetchPost(shortcode: string): Promise<InstagramPost | null> {
        try {
            const url = `https://www.instagram.com/p/${shortcode}/`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.getHeaders()['User-Agent'],
                },
            });

            if (!response.ok) return null;

            const html = await response.text();

            const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
            const ogVideo = html.match(/<meta property="og:video" content="([^"]+)"/)?.[1];
            const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '';
            const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || '';

            if (!ogImage && !ogVideo) return null;

            return {
                id: shortcode,
                type: ogVideo ? 'video' : 'image',
                thumbnail: ogImage || '',
                url: ogVideo || ogImage || '',
                title: ogTitle,
                description: ogDescription,
                shortcode,
            };
        } catch (error) {
            console.error('Post error:', error);
            return null;
        }
    }
}
