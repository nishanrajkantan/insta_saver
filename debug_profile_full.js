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

const username = 'coldplay';

const endpoints = [
    `/api/v1/user_stories?username=${username}`,
    `/api/v1/highlights?username=${username}`,
    `/api/v1/user_highlights?username=${username}`,
    `/api/v1/user/highlights?username=${username}`
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
                    console.log('Success! Response snippet:', data.substring(0, 500));
                    try {
                        const json = JSON.parse(data);
                        const items = json.data?.items || json.data?.stories || json.data?.highlights || [];
                        console.log(`Found ${items.length} items.`);
                    } catch (e) {
                        console.log('Could not parse JSON');
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Error fetching ${endpoint}:`, e.message);
            resolve(false);
        });

        req.end();
    });
}

async function run() {
    console.log(`Testing Endpoints for ${username}...`);
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
}

run();
