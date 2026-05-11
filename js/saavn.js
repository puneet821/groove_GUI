/* ==========================================
   saavn.js — JioSaavn API (via local proxy)
   ========================================== */

const Saavn = (() => {
    const BASE = '/api/saavn';

    function getBestLink(urls) {
        if (!urls || !urls.length) return null;
        const order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
        for (const q of order) {
            // API uses both 'url' and 'link' depending on version
            const found = urls.find(u => u.quality === q);
            if (found) return found.url || found.link || null;
        }
        const first = urls[0];
        return first?.url || first?.link || null;
    }

    function getBestImage(imgs) {
        if (!imgs || !imgs.length) return '';
        const big = imgs.find(i => i.quality === '500x500' || i.quality === '150x150');
        if (big) return big.url || big.link || '';
        const last = imgs[imgs.length - 1];
        return last?.url || last?.link || '';
    }

    function formatSong(s) {
        const rawUrl = getBestLink(s.downloadUrl || []);
        return {
            id:       s.id,
            title:    s.name || s.title || 'Unknown',
            artist:   s.primaryArtists || s.artist
                        || (s.artists?.primary || []).map(a => a.name).join(', ')
                        || 'Unknown Artist',
            album:    (typeof s.album === 'object' ? s.album?.name : s.album) || '',
            duration: parseInt(s.duration) || 0,
            image:    getBestImage(s.image || []),
            url:      rawUrl ? `/audio?url=${encodeURIComponent(rawUrl)}` : null,
            source:   'saavn'
        };
    }

    async function searchSongs(query, limit = 10) {
        const q = encodeURIComponent(query);
        const urls = [
            `${BASE}/search/songs?query=${q}&limit=${limit}`, // Proxy
            `https://saavn.dev/api/search/songs?query=${q}&limit=${limit}`, // Direct
            `https://jiosaavn-api-2.vercel.app/search/songs?query=${q}&limit=${limit}` // Direct 2
        ];

        let lastErr = null;
        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();

                let raw = [];
                if (data.status === 'SUCCESS' && data.data?.results) raw = data.data.results;
                else if (Array.isArray(data.results)) raw = data.results;
                else if (Array.isArray(data)) raw = data;
                else continue;

                const songs = raw.map(formatSong).filter(s => s.url);
                if (songs.length) return songs;
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr || new Error('All search sources failed');
    }

    return { searchSongs, formatSong };
})();
