
const fetch = require('node-fetch');

async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://www.instagram.com/f1/' })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
