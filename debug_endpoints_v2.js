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

const username = 'stevengerrard';
// I'll fetch the user ID first to test ID-based endpoints
let userId = '';

async function fetchUserId() {
    return new Promise((resolve) => {
        const options = {
            hostname: apiHost,
            path: `/api/v1/info?username=${username}`,
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
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        userId = json.data.pk || json.data.id;
                        console.log(`Fetched User ID for ${username}: ${userId}`);
                        resolve(userId);
                    } catch (e) {
                        console.error('Failed to parse user info');
                        resolve(null);
                    }
                } else {
                    console.error('Failed to fetch user info:', res.statusCode);
                    resolve(null);
                }
            });
        });
        req.end();
    });
}

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
    await fetchUserId();
    if (!userId) {
        console.error('Skipping ID-based tests due to missing User ID');
    }

    const endpoints = [
        // Username based
        `/api/v1/stories?username=${username}`,
        `/api/v1/user/stories?username=${username}`,
        `/api/v1/story?username=${username}`,

        // ID based
        userId ? `/api/v1/users/${userId}/stories` : null,
        userId ? `/api/v1/stories?user_id=${userId}` : null,
        userId ? `/api/v1/user_stories?user_id=${userId}` : null,

        // Highlights
        `/api/v1/highlights?username=${username}`,
        userId ? `/api/v1/users/${userId}/highlights` : null,
    ].filter(Boolean);

    console.log('Testing Endpoints...');
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
}

run();
