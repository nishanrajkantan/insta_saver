
const fs = require('fs');
const http = require('http');

const targetUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/220px-Image_created_with_a_mobile_phone.png';
const proxyUrl = `http://localhost:3000/api/proxy?url=${encodeURIComponent(targetUrl)}`;

const logFile = 'proxy_internal_log.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

log('Fetching from proxy: ' + proxyUrl);

http.get(proxyUrl, (res) => {
    log('Status Code: ' + res.statusCode);
    log('Headers: ' + JSON.stringify(res.headers));

    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        log('Body length: ' + buffer.length);
        fs.writeFileSync('proxy_test_image.png', buffer);
        log('Saved to proxy_test_image.png');
    });
}).on('error', (e) => {
    log('Error: ' + e.message);
});
