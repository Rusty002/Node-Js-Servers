const http = require('http');
const url = require('url');
const https = require('https');
const { normalizeUrl } = require('./url-mapper');

function fetchTitle(address, callback) {
    https.get(address, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const match = data.match(/<title>([^<]*)<\/title>/);
            callback(null, match ? match[1] : 'NO RESPONSE');
        });
    }).on('error', () => callback(null, 'NO RESPONSE'));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/I/want/title') {
        const addresses = [].concat(parsedUrl.query.address);
        let results = [];
        let completedRequests = 0;

        addresses.forEach((address) => {
            fetchTitle(normalizeUrl(address), (err, title) => {
                results.push(`<li>${address} - "${title}"</li>`);
                completedRequests++;
                if (completedRequests === addresses.length) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`<html><body><h1> Following are the titles of given websites: </h1><ul>${results.join('')}</ul></body></html>`);
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Server is running on port 3000'));