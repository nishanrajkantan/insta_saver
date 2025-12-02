const fs = require('fs');
const path = require('path');
const https = require('https');

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

const userId = '1692820292'; // F1 User ID

const endpoints = [
    // Stories
    `/api/v1/stories?user_id=${userId}`,
    `/api/v1/user_stories?user_id=${userId}`,
    `/api/v1/users/${userId}/stories`,

    // Highlights
    `/api/v1/highlights?user_id=${userId}`,
    `/api/v1/users/${userId}/highlights_tray`,
    `/api/v1/users/${userId}/highlights`,
    `/api/v1/user_highlights?user_id=${userId}`
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const options = {
            hostname: apiHost,
            path: endpoint,
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${endpoint}`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const items = json.data?.items || json.data?.stories || json.data?.highlights || json.data?.tray || [];
                        console.log(`Success! Found ${items.length} items.`);
                        if (items.length > 0) {
                            console.log('Sample item keys:', Object.keys(items[0]));
                        }
                    } catch (e) {
                        console.log('Could not parse JSON');
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Error fetching ${endpoint}:`, e.message);
            resolve();
        });

        req.end();
    });
}

async function run() {
    console.log(`Testing Endpoints for User ID ${userId}...`);
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
}

run();
