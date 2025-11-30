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

    async fetchUserProfile(username: string): Promise<InstagramProfile | null> {
        try {
            console.log('[RapidAPI] Fetching profile:', username);

            const url = `https://${this.apiHost}/api/v1/info?id_or_username=${encodeURIComponent(username)}`;

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            console.log('[RapidAPI] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[RapidAPI] Failed:', {
                    status: response.status,
                    body: errorText.substring(0, 300),
                });
                return null;
            }

            const json = await response.json();
            console.log('[RapidAPI] User data received');

            const data = json.data;
            if (!data) {
                console.error('[RapidAPI] No data in response');
                return null;
            }

            const postsUrl = `https://${this.apiHost}/api/v1/posts?username=${encodeURIComponent(username)}&limit=12`;
            console.log('[RapidAPI] Fetching posts from:', postsUrl);

            const postsResponse = await fetch(postsUrl, {
                headers: this.getHeaders(),
            });

            let posts: InstagramPost[] = [];

            if (postsResponse.ok) {
                const postsJson = await postsResponse.json();
                const items = postsJson.data?.posts || [];
                console.log('[RapidAPI] Found posts:', items.length);

                posts = items.map((item: any) => {
                    const thumbnail = item.image?.[0]?.url ||
                        item.thumbnail_url ||
                        item.image_versions2?.candidates?.[0]?.url ||
                        item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
                        '';

                    return {
                        id: item.id || item.pk,
                        type: item.media_type === 2 ? 'video' : item.media_type === 8 ? 'carousel' : 'image',
                        thumbnail: thumbnail,
                        url: '',
                        title: item.caption?.text || item.caption || '',
                        description: '',
                        shortcode: item.code,
                    };
                });
            }

            return {
                username: data.username,
                fullName: data.full_name || data.username,
                profilePic: data.profile_pic_url || '',
                userId: data.pk || data.id,
                posts,
            };
        } catch (error) {
            console.error('[RapidAPI] Error:', error);
            return null;
        }
    }

    async fetchPost(shortcode: string): Promise<InstagramPost | null> {
        try {
            const url = `https://${this.apiHost}/api/v1/post-info?code_or_id_or_url=${shortcode}`;
            console.log('[RapidAPI] Fetching post info:', url);

            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error('[RapidAPI] Post fetch failed:', response.status);
                return null;
            }

            const json = await response.json();
            console.log('[RapidAPI] Post info response:', JSON.stringify(json).substring(0, 500));
            const item = json.data;

            if (!item) {
                console.error('[RapidAPI] No data in post info response');
                return null;
            }

            const mediaUrl = item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || '';
            console.log('[RapidAPI] Extracted media URL:', mediaUrl ? 'Found' : 'Not Found');

            return {
                id: item.id || item.pk,
                type: item.media_type === 2 ? 'video' : 'image',
                thumbnail: item.image_versions2?.candidates?.[0]?.url || '',
                url: mediaUrl,
                title: item.caption?.text || '',
                description: '',
                shortcode: item.code || shortcode,
            };
        } catch (error) {
            console.error('[RapidAPI] Post error:', error);
            return null;
        }
    }
}
