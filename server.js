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
        const sub = pathname.replace('/api/saavn', '');
        const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
        
        let ok = false;
        if (sub.includes('search/songs')) {
            // Try saavnapi-nine
            ok = await proxyRequest(`/result/${qs}`, ['https://saavnapi-nine.vercel.app'], res);
            if (!ok) {
                console.log('  [PROXY FAILOVER Node] Trying jiosaavn-api-2 fallback...');
                ok = await proxyRequest(`/search/songs${qs}`, ['https://jiosaavn-api-2.vercel.app'], res);
            }
        } else {
            ok = await proxyRequest(`${sub}${qs}`, ['https://saavnapi-nine.vercel.app'], res);
            if (!ok) {
                console.log('  [PROXY FAILOVER Node] Trying jiosaavn-api-2 fallback...');
                ok = await proxyRequest(`${sub}${qs}`, ['https://jiosaavn-api-2.vercel.app'], res);
            }
        }
        
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

    // Spotify Playlist Scraper: /api/spotify/playlist?id=...
    if (pathname.startsWith('/api/spotify/playlist')) {
        const queryParams = parsed.query;
        let playlistId = queryParams.id || queryParams.url || '';
        if (!playlistId) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'Missing playlist ID or URL' }));
            return;
        }

        const match = playlistId.match(/(?:playlist\/|playlist:)([a-zA-Z0-9]{22})/);
        if (match) {
            playlistId = match[1];
        } else if (playlistId.length !== 22) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'Invalid Spotify Playlist ID or URL format.' }));
            return;
        }

        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
        
        const fetchEmbed = () => {
            return new Promise((resolve, reject) => {
                const u = new url.URL(embedUrl);
                const opts = {
                    hostname: u.hostname,
                    path:     u.pathname,
                    method:   'GET',
                    headers:  {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                    },
                    timeout: 8000
                };
                const req = https.request(opts, response => {
                    let data = '';
                    response.on('data', c => data += c);
                    response.on('end', () => resolve({ status: response.statusCode, body: data }));
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
                req.end();
            });
        };

        try {
            const { status, body } = await fetchEmbed();
            if (status !== 200) {
                res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: `Spotify embed returned status ${status}` }));
                return;
            }

            const jsonMatch = body.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
            if (!jsonMatch) {
                res.writeHead(422, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: 'Could not extract metadata from Spotify playlist page.' }));
                return;
            }

            const payload = JSON.parse(jsonMatch[1]);
            const entity = payload?.props?.pageProps?.state?.data?.entity;
            if (!entity) {
                res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: 'Spotify playlist not found or is private.' }));
                return;
            }

            const title = entity.title || entity.name || 'Imported Spotify Playlist';
            const desc = entity.subtitle || entity.description || '';
            
            let coverImage = 'logo.svg';
            if (entity.coverArt?.sources && entity.coverArt.sources.length > 0) {
                coverImage = entity.coverArt.sources[0].url || 'logo.svg';
            } else if (entity.visualIdentity?.image && entity.visualIdentity.image.length > 0) {
                coverImage = entity.visualIdentity.image[0].url || 'logo.svg';
            }

            const rawTracks = entity.trackList || [];
            const tracks = rawTracks.map((t, idx) => {
                const tUri = t.uri || '';
                const tDurationMs = t.duration || 0;
                return {
                    id: tUri ? tUri.split(':').pop() : `track_${idx}`,
                    title: t.title || 'Unknown Title',
                    artist: t.subtitle || 'Unknown Artist',
                    duration: tDurationMs ? Math.floor(tDurationMs / 1000) : 180,
                    source: 'spotify',
                    image: coverImage
                };
            });

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                title,
                description: desc,
                image: coverImage,
                tracks
            }));
            return;
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: `Error parsing playlist: ${err.message}` }));
            return;
        }
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
