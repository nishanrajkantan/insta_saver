import { RapidAPIFetcher } from './src/lib/rapidapi-fetcher';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function resolveCarousel(shortcode: string) {
    console.log('[Test] resolveCarousel called for:', shortcode);
    const startTime = Date.now();
    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
            console.error('[Test] API key or host missing');
            return { error: 'API configuration missing' };
        }

        console.log('[Test] Using API Key:', apiKey.substring(0, 5) + '...');

        const fetcher = new RapidAPIFetcher(apiKey, apiHost);
        console.log('[Test] Fetching post...');
        const post = await fetcher.fetchPost(shortcode);

        const duration = Date.now() - startTime;
        console.log(`[Test] Fetch took ${duration}ms`);

        if (!post) {
            console.error('[Test] Post not found');
            return { error: 'Post not found' };
        }

        console.log('[Test] Post resolved:', {
            id: post.id,
            type: post.type,
            mediaCount: post.media?.length,
            media: post.media ? post.media.map(m => m.type) : []
        });

        return {
            success: true,
            media: post.media || []
        };
    } catch (error: any) {
        console.error('[Test] Error:', error);
        return { error: error.message };
    }
}

// Test with the known carousel shortcode
resolveCarousel('DRxJCVNj304');
