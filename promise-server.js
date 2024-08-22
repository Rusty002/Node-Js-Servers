const http = require('http');
const url = require('url');
const https = require('https');
const { normalizeUrl } = require('./url-mapper');

function fetchTitle(address) {
    return new Promise((resolve, reject) => {
        https.get(address, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const match = data.match(/<title>([^<]*)<\/title>/);
                resolve(`<li>${address} - "${match ? match[1] : 'NO RESPONSE'}"</li>`);
            });
        }).on('error', () => resolve(`<li>${address} - NO RESPONSE</li>`));
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/I/want/title') {
        const addresses = [].concat(parsedUrl.query.address);
        try {
            const results = await Promise.all(addresses.map(address => fetchTitle(normalizeUrl(address))));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<html><body><h1> Following are the titles of given websites: </h1><ul>${results.join('')}</ul></body></html>`);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Server is running on port 3000'));