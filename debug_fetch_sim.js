const fs = require('fs');

const INSTAGRAM_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Upgrade-Insecure-Requests": "1",
};

async function run() {
    try {
        console.log("Fetching...");
        const response = await fetch("https://www.instagram.com/leomessi/", { headers: INSTAGRAM_HEADERS });
        const html = await response.text();
        console.log("Status:", response.status);
        console.log("HTML Length:", html.length);

        fs.writeFileSync('server_response.html', html);
        console.log("Saved to server_response.html");

        // Simple check for article tags
        if (html.includes('<article')) {
            console.log("SUCCESS: Found <article> tags");
        } else {
            console.log("FAILURE: No <article> tags found");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
