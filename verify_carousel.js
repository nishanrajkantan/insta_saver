const { RapidAPIFetcher } = require('./src/lib/rapidapi-fetcher');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        console.error('Missing API key or host');
        return;
    }

    const fetcher = new RapidAPIFetcher(apiKey, apiHost);
    const result = await fetcher.fetchUserPosts('f1');

    console.log(`Found ${result.posts.length} posts`);

    const carousels = result.posts.filter(p => p.type === 'carousel');
    console.log(`Found ${carousels.length} carousel posts`);

    if (carousels.length > 0) {
        const firstCarousel = carousels[0];
        console.log('First Carousel:', {
            id: firstCarousel.id,
            mediaCount: firstCarousel.media ? firstCarousel.media.length : 0,
            media: firstCarousel.media ? firstCarousel.media.slice(0, 2) : 'No media'
        });
    }
}

// Mock fetch for Node.js environment if needed, or rely on Next.js polyfills if running in that context.
// Since we are running this as a standalone script with node, we need to ensure fetch is available.
// Node 18+ has fetch built-in.
test();
