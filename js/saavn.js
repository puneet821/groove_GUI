/* ==========================================
   saavn.js — JioSaavn API (via local proxy)
   ========================================== */

const Saavn = (() => {
    const BASE = '/api/saavn';

    function getBestLink(urls) {
        if (!urls || !urls.length) return null;
        const pref = localStorage.getItem('groovecmd_quality') || '160kbps';
        let order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
        if (pref === '160kbps') {
            order = ['160kbps', '96kbps', '320kbps', '48kbps', '12kbps'];
        } else if (pref === '96kbps') {
            order = ['96kbps', '48kbps', '160kbps', '320kbps', '12kbps'];
        }
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
        if (s.media_url) {
            return {
                id:       s.id,
                title:    s.song || s.title || 'Unknown',
                artist:   s.singers || s.primary_artists || 'Unknown Artist',
                album:    s.album || '',
                duration: parseInt(s.duration) || 0,
                image:    s.image || '',
                url:      `/audio?url=${encodeURIComponent(s.media_url)}`,
                source:   'saavn',
                downloadUrls: [{ quality: '320kbps', link: s.media_url }]
            };
        }
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
            source:   'saavn',
            downloadUrls: s.downloadUrl || []
        };
    }

    async function searchSongs(query, limit = 10) {
        const q = encodeURIComponent(query);
        const urls = [
            `https://saavnapi-nine.vercel.app/result/?query=${q}`, // Cyberboysumanjay (WORKING!)
            `https://jiosaavn-api-2.vercel.app/search/songs?query=${q}&limit=${limit}`, // Sumitkolhe Vercel fallback
            `${BASE}/search/songs?query=${q}&limit=${limit}` // Local proxy fallback
        ];

        let lastErr = null;
        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();

                let raw = [];
                if (Array.isArray(data)) raw = data;
                else if (data.status === 'SUCCESS' && data.data?.results) raw = data.data.results;
                else if (Array.isArray(data.results)) raw = data.results;
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
