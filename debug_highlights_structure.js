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
const username = 'f1';
const url = `https://${apiHost}/api/v1/highlights?id_or_username=${username}`;

console.log(`Fetching from ${url}...`);

async function run() {
    try {
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Error:', await response.text());
            return;
        }

        const json = await response.json();
        const items = json.data?.items || json.data?.highlights || [];
        console.log(`Found ${items.length} highlights.`);

        if (items.length > 0) {
            console.log('First Highlight Structure:');
            console.log(JSON.stringify(items[0], null, 2));
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

run();
