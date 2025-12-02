import { RapidAPIFetcher } from './src/lib/rapidapi-fetcher';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        console.error('Missing API key or host');
        return;
    }

    const fetcher = new RapidAPIFetcher(apiKey, apiHost);
    const shortcode = 'DRxJCVNj304'; // Known carousel post
    console.log(`Fetching post ${shortcode}...`);

    const post = await fetcher.fetchPost(shortcode);

    if (post) {
        console.log('Post Type:', post.type);
        console.log('Media Count:', post.media ? post.media.length : 0);
        if (post.media && post.media.length > 0) {
            console.log('First Media Item:', post.media[0]);
            console.log('SUCCESS: Carousel media found.');
        } else {
            console.log('FAILURE: No media found.');
        }
    } else {
        console.log('FAILURE: Post not found.');
    }
}

test();
