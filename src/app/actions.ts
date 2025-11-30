'use server'

import { RapidAPIFetcher } from '@/lib/rapidapi-fetcher';

export async function downloadMedia(shortcode: string, thumbnailUrl?: string) {
    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        let mediaUrl: string | undefined;
        let type: 'video' | 'image' = 'image';

        if (apiKey && apiHost) {
            const fetcher = new RapidAPIFetcher(apiKey, apiHost);
            const post = await fetcher.fetchPost(shortcode);
            if (post && post.url) {
                mediaUrl = post.url;
                type = post.type === 'video' ? 'video' : 'image';
            }
        }

        // Fallback to thumbnail if API failed or returned no URL
        if (!mediaUrl && thumbnailUrl) {
            console.log('Using thumbnail URL as fallback');
            mediaUrl = thumbnailUrl;
        }

        if (!mediaUrl) {
            return { error: 'Media URL not found' };
        }

        // Fetch the media on the server
        const mediaRes = await fetch(mediaUrl);
        if (!mediaRes.ok) {
            return { error: 'Failed to fetch media' };
        }

        const arrayBuffer = await mediaRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = mediaRes.headers.get('content-type') || 'application/octet-stream';

        return {
            success: true,
            data: `data:${mimeType};base64,${base64}`,
            filename: `instagram-${shortcode}.${type === 'video' ? 'mp4' : 'jpg'}`
        };

    } catch (error: any) {
        console.error('Download error:', error);
        return {
            error: error.message || 'Internal server error',
            debug: {
                shortcode,
                hasThumbnail: !!thumbnailUrl,
                errorDetail: JSON.stringify(error, Object.getOwnPropertyNames(error))
            }
        };
    }
}
