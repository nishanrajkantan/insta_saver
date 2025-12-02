
const fs = require('fs');

async function run() {
    try {
        const response = await fetch('http://localhost:3000/api/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://www.instagram.com/f1/' })
        });
        const data = await response.json();
        fs.writeFileSync('response.json', JSON.stringify(data, null, 2));
        console.log('Done');
    } catch (error) {
        fs.writeFileSync('response.json', JSON.stringify({ error: error.message }));
    }
}

run();
