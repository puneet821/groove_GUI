// ============================================
// server.js — GROOVECMD local proxy server
// Run: node server.js
// ============================================

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT    = 3030;
const STATIC  = __dirname;

// MIME types
const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.mp3':  'audio/mpeg',
    '.woff2':'font/woff2'
};

// JioSaavn API targets (with fallback)
const SAAVN_BASES = [
    'https://saavn.dev/api',
    'https://jiosaavn-api-privatecvc2.vercel.app'
];

// Invidious instances for YouTube search
const INVIDIOUS_BASES = [
    'https://invidious.privacyredirect.com',
    'https://yt.cdaut.de',
    'https://invidious.nerdvpn.de',
    'https://invidious.fdn.fr'
];

function fetchJSON(targetUrl) {
    return new Promise((resolve, reject) => {
        const u = new url.URL(targetUrl);
        const opts = {
            hostname: u.hostname,
            path:     u.pathname + u.search,
            method:   'GET',
            headers:  {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept':     'application/json'
            },
            timeout: 8000
        };
        const req = https.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: data }); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
    });
}

async function proxyRequest(endpoint, bases, res) {
    for (const base of bases) {
        try {
            const { status, body } = await fetchJSON(`${base}${endpoint}`);
            if (status >= 200 && status < 300) {
                res.writeHead(200, {
                    'Content-Type':                'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(body);
                return true;
            }
        } catch (_) { /* try next */ }
    }
    return false;
}

function serveStatic(pathname, res) {
    // Default to index.html
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(STATIC, pathname);
    const ext      = path.extname(filePath);
    const mime     = MIME[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404); res.end('Not found'); return;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    const parsed   = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' });
        res.end(); return;
    }

    // Proxy: /api/saavn/* → JioSaavn
    if (pathname.startsWith('/api/saavn')) {
        const endpoint = pathname.replace('/api/saavn', '') + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
        const ok = await proxyRequest(endpoint, SAAVN_BASES, res);
        if (!ok) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'All JioSaavn endpoints failed' }));
        }
        return;
    }

    // Proxy: /api/yt/* → Invidious
    if (pathname.startsWith('/api/yt')) {
        const endpoint = pathname.replace('/api/yt', '/api/v1') + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
        const ok = await proxyRequest(endpoint, INVIDIOUS_BASES, res);
        if (!ok) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'All YouTube endpoints failed' }));
        }
        return;
    }

    // Serve static files
    serveStatic(pathname, res);
});

server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   GROOVECMD Server  —  Running!      ║');
    console.log(`  ║   http://localhost:${PORT}              ║`);
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
    console.log('  Open http://localhost:3030 in your browser');
    console.log('  Press Ctrl+C to stop');
    console.log('');
});
