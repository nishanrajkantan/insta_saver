
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

function request(endpoint) {
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
                resolve({ statusCode: res.statusCode, data });
            });
        });

        req.on('error', (e) => {
            console.error(`Error fetching ${endpoint}:`, e.message);
            resolve({ statusCode: 0, error: e.message });
        });

        req.end();
    });
}

const logFile = 'highlight_content_log.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function run() {
    log(`Fetching highlights for ${username}...`);
    const highlightsRes = await request(`/api/v1/highlights?id_or_username=${username}`);

    if (highlightsRes.statusCode !== 200) {
        log('Failed to fetch highlights: ' + highlightsRes.statusCode);
        return;
    }

    const highlightsJson = JSON.parse(highlightsRes.data);
    const highlights = highlightsJson.data?.items || highlightsJson.data?.highlights || [];

    if (highlights.length === 0) {
        log('No highlights found.');
        return;
    }

    const firstHighlight = highlights[0];
    const highlightId = firstHighlight.id;
    log(`Found highlight: ${firstHighlight.title} (ID: ${highlightId})`);

    const probeEndpoints = [
        `/api/v1/highlight?id=${highlightId}`,
        `/api/v1/highlights?id=${highlightId}`,
        `/api/v1/stories?id=${highlightId}`,
        `/api/v1/post-info?code_or_id_or_url=${highlightId}`
    ];

    for (const endpoint of probeEndpoints) {
        log(`Probing ${endpoint}...`);
        const res = await request(endpoint);
        log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(res.data);
                const data = json.data;
                const items = data?.items || data?.stories || (Array.isArray(data) ? data : []);
                log(`Success? Found ${items.length || 'unknown'} items.`);
                if (items.length > 0) {
                    log('Sample item keys: ' + Object.keys(items[0]).join(', '));
                } else if (data) {
                    log('Data keys: ' + Object.keys(data).join(', '));
                }
            } catch (e) {
                log('Could not parse JSON');
            }
        }
    }
}

run();
