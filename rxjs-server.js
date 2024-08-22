const http = require('http');
const url = require('url');
const https = require('https');
const { from } = require('rxjs');
const { map, mergeMap, toArray } = require('rxjs/operators');
const { normalizeUrl } = require('./url-mapper');

function fetchTitle(address) {
    return new Promise((resolve) => {
        https.get(address, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const match = data.match(/<title>([^<]*)<\/title>/);
                resolve(`<li>${address} - "${match ? match[1] : 'NO RESPONSE'}"</li>`);
            });
        }).on('error', () => resolve(`<li>${address} - NO RESPONSE</li>`));
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/I/want/title') {
        const addresses = [].concat(parsedUrl.query.address);
        from(addresses).pipe(
            mergeMap(address => from(fetchTitle(normalizeUrl(address)))),
            toArray(),
            map(results => results.join(''))
        ).subscribe(results => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<html><body><h1> Following are the titles of given websites: </h1><ul>${results}</ul></body></html>`);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => console.log('Server is running on port 3000'));