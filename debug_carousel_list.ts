import { RapidAPIFetcher } from './src/lib/rapidapi-fetcher';
import dotenv from 'dotenv';
import fs from 'fs';

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
    const result = await fetcher.fetchUserPosts('f1');

    const carousels = result.posts.filter(p => p.type === 'carousel');
    console.log(`Found ${carousels.length} carousel posts out of ${result.posts.length} total.`);

    if (carousels.length > 0) {
        const firstCarousel = carousels[0];
        console.log('First Carousel Object Keys:', Object.keys(firstCarousel));
        console.log('Media property:', JSON.stringify(firstCarousel.media, null, 2));

        // We also want to see the RAW item from the fetcher to see if we missed mapping it
        // But fetchUserPosts returns mapped objects.
        // I'll modify the fetcher temporarily or just trust the mapped result for now.
        // If media is undefined here, it means it wasn't mapped or wasn't in the source.
    } else {
        console.log('No carousel posts found in the first batch.');
    }
}

test();
