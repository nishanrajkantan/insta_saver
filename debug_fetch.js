const fs = require('fs');
const https = require('https');

const url = "https://www.instagram.com/leomessi/";
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1",
};

https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('debug_insta.html', data);
        console.log('HTML saved to debug_insta.html');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
