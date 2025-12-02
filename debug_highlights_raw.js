const fs = require('fs');
const https = require('https');

const username = 'f1'; // Famous account with highlights
const apiKey = process.env.RAPIDAPI_KEY;
const apiHost = process.env.RAPIDAPI_HOST;

if (!apiKey || !apiHost) {
    console.error('RAPIDAPI_KEY or RAPIDAPI_HOST not set');
    process.exit(1);
}

const options = {
    method: 'GET',
    hostname: apiHost,
    port: null,
    path: `/api/v1/highlights?id_or_username=${username}`,
    headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
    }
};

console.log(`Fetching highlights for ${username}...`);

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        const jsonString = body.toString();

        try {
            const data = JSON.parse(jsonString);
            console.log('Response status:', res.statusCode);

            // Write full response to file for inspection
            fs.writeFileSync('highlight_response.json', JSON.stringify(data, null, 2));
            console.log('Full response saved to highlight_response.json');

            // Log structure summary
            if (data.data && data.data.items) {
                console.log('Found items:', data.data.items.length);
                const firstItem = data.data.items[0];
                console.log('First item keys:', Object.keys(firstItem));

                // Check for nested items/stories
                if (firstItem.items) {
                    console.log('First highlight has nested items:', firstItem.items.length);
                } else {
                    console.log('First highlight has NO nested items property');
                }
            } else {
                console.log('No items found in data.data');
            }

        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw body:', jsonString.substring(0, 500));
        }
    });
});

req.end();
