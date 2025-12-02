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
    console.log('Fetching posts for f1...');

    // We need to access the raw response, but fetchUserPosts returns mapped objects.
    // I will use the private method logic here directly to see the raw data.
    const url = `https://${apiHost}/api/v1/posts?username=f1&limit=5`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost,
            }
        });

        const json = await response.json();
        const items = json.data?.posts || [];

        console.log(`Found ${items.length} items.`);

        items.forEach((item: any, index: number) => {
            console.log(`--- Item ${index} ---`);
            console.log('ID:', item.id || item.pk);
            console.log('Code:', item.code);
            console.log('Media Type:', item.media_type);
            console.log('Carousel Media Count:', item.carousel_media_count);
            console.log('Carousel Media:', item.carousel_media ? 'Present' : 'Missing');
            // Log keys to see if there's anything else indicating carousel
            console.log('Keys:', Object.keys(item));
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

test();
