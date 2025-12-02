const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/RAPIDAPI_KEY=(.+)/);
const apiHostMatch = envContent.match(/RAPIDAPI_HOST=(.+)/);

if (!apiKeyMatch || !apiHostMatch) {
    console.error('Could not find API key or host in .env.local');
    process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
const apiHost = apiHostMatch[1].trim();

// Use a profile known to have carousel posts - f1 should have some
const username = 'f1';

async function run() {
    try {
        const url = `https://${apiHost}/api/v1/posts?username=${username}&limit=20`;

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        });

        if (!response.ok) {
            console.log('Error:', response.status);
            return;
        }

        const json = await response.json();
        const posts = json.data?.posts || [];

        console.log(`Found ${posts.length} posts`);

        // Find carousel posts
        const carouselPosts = posts.filter(p => p.media_type === 8 || p.carousel_media);
        console.log(`Found ${carouselPosts.length} carousel posts`);

        if (carouselPosts.length > 0) {
            const firstCarousel = carouselPosts[0];
            console.log('\nFirst carousel post structure:');
            console.log('ID:', firstCarousel.id);
            console.log('Code:', firstCarousel.code);
            console.log('Media type:', firstCarousel.media_type);
            console.log('Has carousel_media:', !!firstCarousel.carousel_media);

            if (firstCarousel.carousel_media) {
                console.log('Carousel items:', firstCarousel.carousel_media.length);
                console.log('\nFirst item keys:', Object.keys(firstCarousel.carousel_media[0]));
            }

            // Save full structure for inspection
            fs.writeFileSync('carousel_post_sample.json', JSON.stringify(firstCarousel, null, 2));
            console.log('\nSaved full carousel structure to carousel_post_sample.json');
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

run();
