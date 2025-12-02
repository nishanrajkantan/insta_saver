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

const username = 'f1';

async function fetchProfile() {
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
                console.log(`[${res.statusCode}] /api/v1/info`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log('Data Keys:', Object.keys(json.data || {}));
                        console.log('Full Data:', JSON.stringify(json.data, null, 2));
                    } catch (e) {
                        console.error('Failed to parse JSON');
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Error fetching profile:`, e.message);
            resolve();
        });

        req.end();
    });
}

fetchProfile();
