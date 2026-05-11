/* =============================================
   player.js — Audio engine for GROOVECMD
   ============================================= */

const Player = (() => {
    const audio = document.getElementById('audio-el');
    let ytPlayer = null;
    let ytReady = false;

    const state = {
        current:  null,
        queue:    [],
        history:  [],
        liked:    JSON.parse(localStorage.getItem('groovecmd_liked') || '[]'),
        volume:   parseFloat(localStorage.getItem('groovecmd_vol') || '1'),
        shuffle:  false,
        repeat:   'off',
        playing:  false,
        source:   'saavn'
    };

    audio.volume = state.volume;

    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    /* ── YouTube IFrame setup ── */
    window.onYouTubeIframeAPIReady = () => {
        ytPlayer = new YT.Player('yt-player', {
            height: '1', width: '1',
            playerVars: { autoplay: 0, controls: 0, disablekb: 1 },
            events: {
                onReady: () => { 
                    ytReady = true; 
                    ytPlayer.setVolume(state.volume * 100);
                    console.log('YT Player Ready');
                },
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.ENDED) handleEnd();
                    if (e.data === YT.PlayerState.PLAYING) { state.playing = true; updateUI(); }
                    if (e.data === YT.PlayerState.PAUSED) { state.playing = false; updateUI(); }
                },
                onError: () => {
                    Terminal.print('  [ERROR] YouTube playback failed.', 'r');
                    next();
                }
            }
        });
    };

    function fmtTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function buildProgressBar(current, total, len = 30) {
        if (!total) return '░'.repeat(len);
        const filled = Math.floor((current / total) * len);
        return '█'.repeat(filled) + '░'.repeat(len - filled);
    }

    function updateUI() {
        if (!state.current) return;
        const np = document.getElementById('now-playing');
        np.classList.remove('hidden');

        let cur = 0, dur = 0;
        if (state.source === 'yt' && ytReady && ytPlayer.getCurrentTime) {
            cur = ytPlayer.getCurrentTime();
            dur = ytPlayer.getDuration();
        } else {
            cur = audio.currentTime;
            dur = audio.duration || state.current.duration || 0;
        }

        document.getElementById('np-title').textContent  = truncate(decodeHTML(state.current.title), 25);
        document.getElementById('np-artist').textContent = truncate(decodeHTML(state.current.artist), 15);
        document.getElementById('np-source').textContent = state.source.toUpperCase();
        document.getElementById('np-icon').textContent   = state.playing ? '▶' : '⏸';
        document.getElementById('np-time').textContent   = `${fmtTime(cur)}/${fmtTime(dur)}`;
        document.getElementById('np-prog').textContent   = buildProgressBar(cur, dur);
        
        const shufEl = document.getElementById('np-shuf');
        shufEl.textContent = `SHUF:${state.shuffle ? 'ON' : 'OFF'}`;
        shufEl.className = state.shuffle ? 'on' : 'off';

        const repEl = document.getElementById('np-rep');
        const repMap = { off: 'OFF', one: '1', all: 'ALL' };
        repEl.textContent = `REP:${repMap[state.repeat]}`;
        repEl.className = state.repeat !== 'off' ? 'on' : 'off';
    }

    function truncate(str, len) {
        return str && str.length > len ? str.slice(0, len - 1) + '…' : str;
    }

    async function playSong(song) {
        if (!song) return;
        if (state.current && state.current.id !== song.id) state.history.push(state.current);

        state.current = song;
        state.source  = song.source;

        const title = decodeHTML(song.title);
        const artist = decodeHTML(song.artist);

        Terminal.print(`\n  ♫  Playing: ${title}`, 'gb');
        Terminal.print(`     Artist : ${artist}`, 'y');
        Terminal.print(`     Source : ${song.source.toUpperCase()}\n`, 'c');

        if (song.source === 'yt') {
            if (!ytReady) {
                Terminal.print('  [WAIT] YouTube engine warming up...', 'gd');
                setTimeout(() => playSong(song), 1500);
                return;
            }
            audio.pause();
            audio.src = '';
            ytPlayer.loadVideoById(song.id);
            ytPlayer.playVideo();
            state.playing = true;
        } else {
            if (ytReady) ytPlayer.pauseVideo();
            audio.src = song.url;
            try {
                await audio.play();
                state.playing = true;
            } catch (e) {
                console.log('Autoplay blocked:', e);
                Terminal.print('  [NOTICE] Browser blocked autoplay. CLICK ANYWHERE on the screen to play!', 'y');
                // Listen for a click once to resume
                const resume = () => {
                    audio.play().then(() => {
                        state.playing = true;
                        updateUI();
                    });
                    document.removeEventListener('click', resume);
                };
                document.addEventListener('click', resume);
            }
        }
        updateUI();
    }

    async function fallbackToYouTube(song) {
        Terminal.print(`  [RETRY] JioSaavn failed. Falling back to YouTube...`, 'y');
        
        const title = decodeHTML(song.title);
        const artist = decodeHTML(song.artist);
        const queries = [
            `${title} ${artist} audio`,
            `${title} ${artist} lyrics`,
            title
        ];
        
        for (const q of queries) {
            try {
                Terminal.print(`  [SEARCH] Trying: ${q}...`, 'gd');
                const r = await fetch(`/api/yt/search?q=${encodeURIComponent(q)}`);
                if (!r.ok) continue;
                const data = await r.json();
                const items = Array.isArray(data) ? data : (data.results || data.data || []);
                if (items && items.length > 0) {
                    const v = items[0];
                    await playSong({
                        id: v.videoId || v.id, title: v.title, artist: v.author || v.authorName || artist,
                        source: 'yt', duration: v.lengthSeconds || v.duration
                    });
                    return;
                }
            } catch (e) { console.error('YT attempt failed', e); }
        }
        Terminal.print('  [ERROR] All fallback sources failed. Try another song or check your network.', 'r');
    }

    audio.addEventListener('error', () => {
        if (state.current && state.current.source === 'saavn') {
            fallbackToYouTube(state.current);
        }
    });

    function handleEnd() {
        if (state.repeat === 'one') playSong(state.current);
        else next();
    }

    function togglePause() {
        if (state.playing) {
            if (state.source === 'yt') ytPlayer.pauseVideo(); else audio.pause();
            state.playing = false;
        } else {
            if (state.source === 'yt') ytPlayer.playVideo(); else audio.play();
            state.playing = true;
        }
        updateUI();
    }

    function setVolume(val) {
        state.volume = val / 100;
        audio.volume = state.volume;
        if (ytReady) ytPlayer.setVolume(val);
        updateUI();
    }

    function next() {
        if (state.queue.length > 0) playSong(state.queue.shift());
        else Terminal.print('  Queue ended.', 'gd');
    }

    function prev() {
        if (state.history.length > 0) playSong(state.history.pop());
    }

    function addToQueue(song) {
        state.queue.push(song);
        Terminal.print(`  + Queued: ${decodeHTML(song.title)}`, 'gd');
    }

    setInterval(() => { if (state.playing) updateUI(); }, 1000);

    return {
        playSong, togglePause, setVolume, next, prev, addToQueue,
        toggleShuffle: () => { state.shuffle = !state.shuffle; updateUI(); },
        toggleRepeat: () => { 
            const m = ['off', 'one', 'all'];
            state.repeat = m[(m.indexOf(state.repeat) + 1) % 3];
            updateUI();
        },
        likeCurrent: () => { Terminal.print('  ♥ Liked!', 'r'); },
        showNowPlaying: () => { updateUI(); },
        showQueue: () => { Terminal.print(`  Queue: ${state.queue.length} songs`, 'c'); },
        showLiked: () => { Terminal.print('  No liked songs yet.', 'gd'); },
        getState: () => state
    };
})();
