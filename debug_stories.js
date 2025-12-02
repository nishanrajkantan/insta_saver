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

const endpoints = [
    '/api/v1/stories?username=cristiano',
    '/api/v1/user_stories?username=cristiano',
    '/api/v1/story?username=cristiano',
    '/api/v1/user/stories?username=cristiano'
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
                    console.log('Success! Response snippet:', data.substring(0, 200));
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
    console.log('Testing Stories Endpoints...');
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
}

run();
