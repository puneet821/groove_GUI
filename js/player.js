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
        source:   'saavn',
        autoplay: JSON.parse(localStorage.getItem('groovecmd_autoplay') !== 'false')
    };

    audio.volume = state.volume;

    /* ── Web Audio Equalizer ── */
    let audioCtx = null;
    let sourceNode = null;
    let bassNode = null;
    let trebleNode = null;
    let convolverNode = null;
    let dryGainNode = null;
    let wetGainNode = null;
    let boostGainNode = null;

    function createReverbImpulseResponse(seconds, decay) {
        if (!audioCtx) return null;
        const rate = audioCtx.sampleRate;
        const len = rate * seconds;
        const impulse = audioCtx.createBuffer(2, len, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < len; i++) {
            const decayValue = Math.exp(-i / (rate * decay));
            left[i] = (Math.random() * 2 - 1) * decayValue;
            right[i] = (Math.random() * 2 - 1) * decayValue;
        }
        return impulse;
    }

    function initEqualizer() {
        if (audioCtx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            sourceNode = audioCtx.createMediaElementSource(audio);
            
            // Bass
            bassNode = audioCtx.createBiquadFilter();
            bassNode.type = 'lowshelf';
            bassNode.frequency.value = 150;
            bassNode.gain.value = parseFloat(localStorage.getItem('groovecmd_bass') || '0');
            
            // Treble
            trebleNode = audioCtx.createBiquadFilter();
            trebleNode.type = 'highshelf';
            trebleNode.frequency.value = 4000;
            trebleNode.gain.value = parseFloat(localStorage.getItem('groovecmd_treble') || '0');
            
            // Reverb
            convolverNode = audioCtx.createConvolver();
            convolverNode.buffer = createReverbImpulseResponse(2.0, 1.5);
            
            dryGainNode = audioCtx.createGain();
            dryGainNode.gain.value = 1.0;
            
            wetGainNode = audioCtx.createGain();
            const savedReverb = parseFloat(localStorage.getItem('groovecmd_reverb') || '0');
            wetGainNode.gain.value = savedReverb / 100;
            
            // Pre-amp Boost
            boostGainNode = audioCtx.createGain();
            const savedBoost = parseFloat(localStorage.getItem('groovecmd_boost') || '0');
            boostGainNode.gain.value = Math.pow(10, savedBoost / 20);
            
            // Routing graph:
            sourceNode.connect(bassNode);
            bassNode.connect(trebleNode);
            
            // Split to dry & wet convolver
            trebleNode.connect(dryGainNode);
            trebleNode.connect(convolverNode);
            convolverNode.connect(wetGainNode);
            
            // Merge dry and wet convolver signals
            dryGainNode.connect(boostGainNode);
            wetGainNode.connect(boostGainNode);
            
            boostGainNode.connect(audioCtx.destination);
            
            console.log('Web Audio Advanced Sound Core Initialized.');
        } catch (e) {
            console.error('Failed to initialize advanced sound engine:', e);
        }
    }

    function setBass(val) {
        localStorage.setItem('groovecmd_bass', val);
        if (!audioCtx) initEqualizer();
        if (bassNode) {
            bassNode.gain.value = val;
        }
    }

    function setTreble(val) {
        localStorage.setItem('groovecmd_treble', val);
        if (!audioCtx) initEqualizer();
        if (trebleNode) {
            trebleNode.gain.value = val;
        }
    }

    function setReverb(val) {
        localStorage.setItem('groovecmd_reverb', val);
        if (!audioCtx) initEqualizer();
        if (wetGainNode) {
            wetGainNode.gain.value = val / 100;
        }
    }

    function setBoost(val) {
        localStorage.setItem('groovecmd_boost', val);
        if (!audioCtx) initEqualizer();
        if (boostGainNode) {
            boostGainNode.gain.value = Math.pow(10, val / 20);
        }
    }

    function applyPreset(presetName) {
        let bass = 0, treble = 0, reverb = 0, boost = 0;
        if (presetName === 'bassboost') {
            bass = 8; treble = 0; reverb = 0; boost = 2;
        } else if (presetName === 'vocal') {
            bass = -2; treble = 5; reverb = 10; boost = 1;
        } else if (presetName === 'hall') {
            bass = 0; treble = 3; reverb = 60; boost = 0;
        }
        
        localStorage.setItem('groovecmd_bass', bass);
        localStorage.setItem('groovecmd_treble', treble);
        localStorage.setItem('groovecmd_reverb', reverb);
        localStorage.setItem('groovecmd_boost', boost);
        
        if (!audioCtx) initEqualizer();
        if (bassNode) bassNode.gain.value = bass;
        if (trebleNode) trebleNode.gain.value = treble;
        if (wetGainNode) wetGainNode.gain.value = reverb / 100;
        if (boostGainNode) boostGainNode.gain.value = Math.pow(10, boost / 20);
        
        ['bass', 'treble', 'reverb', 'boost'].forEach(p => {
            const knobEl = document.getElementById(`knob-${p}`);
            const val = p === 'bass' ? bass : (p === 'treble' ? treble : (p === 'reverb' ? reverb : boost));
            if (knobEl && window.updateKnobUI) {
                window.updateKnobUI(knobEl, val);
            }
        });
        
        document.querySelectorAll('[data-preset]').forEach(btn => {
            if (btn.getAttribute('data-preset') === presetName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        Terminal.print(`  [PRESET] Applied sound profile: ${presetName.toUpperCase()}`, 'c');
    }

    async function changeQuality(qualityStr) {
        localStorage.setItem('groovecmd_quality', qualityStr);
        
        // Update dashboard bitrate indicator if it exists
        const bitrateEl = document.getElementById('stat-bitrate');
        if (bitrateEl) {
            bitrateEl.textContent = qualityStr === '320kbps' ? '320kbps' : (qualityStr === '160kbps' ? '160kbps' : '96kbps');
        }

        // If currently playing a Saavn song, hot-reload it at the exact current time
        if (state.current && state.current.source === 'saavn' && state.current.downloadUrls) {
            const curTime = audio.currentTime;
            const wasPlaying = state.playing;
            
            const newSong = Saavn.formatSong({
                id: state.current.id,
                title: state.current.title,
                artist: state.current.artist,
                album: state.current.album,
                duration: state.current.duration,
                image: state.current.image,
                downloadUrl: state.current.downloadUrls
            });
            
            if (newSong && newSong.url) {
                state.current.url = newSong.url;
                audio.src = newSong.url;
                audio.currentTime = curTime;
                if (wasPlaying) {
                    try {
                        await audio.play();
                        state.playing = true;
                        if (audioCtx && audioCtx.state === 'suspended') {
                            audioCtx.resume();
                        }
                    } catch (e) {
                        console.log('Reload play error:', e);
                    }
                }
                updateUI();
            }
        } else if (state.current && state.current.source === 'yt' && ytReady) {
            // YouTube dynamic quality change
            let ytQuality = 'default';
            if (qualityStr === '320kbps') ytQuality = 'highres';
            else if (qualityStr === '160kbps') ytQuality = 'medium';
            else if (qualityStr === '96kbps') ytQuality = 'small';
            
            if (ytPlayer && ytPlayer.setPlaybackQuality) {
                ytPlayer.setPlaybackQuality(ytQuality);
            }
        }
    }

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
            initEqualizer();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            try {
                await audio.play();
                state.playing = true;
            } catch (e) {
                console.log('Autoplay blocked:', e);
                Terminal.print('  [NOTICE] Browser blocked autoplay. CLICK ANYWHERE on the screen to play!', 'y');
                const resume = () => {
                    if (audioCtx && audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }
                    audio.play().then(() => {
                        state.playing = true;
                        updateUI();
                    }).catch(err => console.log('Resume click failed:', err));
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

    audio.addEventListener('ended', handleEnd);

    async function playSimilarRadio() {
        if (!state.current) return;
        const lastSong = state.current;
        Terminal.print(`\n  📻  [AUTOPLAY RADIO] Queue ended. Recommending similar songs based on "${decodeHTML(lastSong.title)}"...`, 'c');
        
        let recommendedSongs = [];
        
        // 1. Try JioSaavn Recommendations API if last song was from JioSaavn
        if (lastSong.source === 'saavn') {
            try {
                const res = await fetch(`https://jiosaavn-api-2.vercel.app/songs/${lastSong.id}/suggestions`);
                if (res.ok) {
                    const data = await res.json();
                    let raw = [];
                    if (data.status === 'SUCCESS' && Array.isArray(data.data)) {
                        raw = data.data;
                    } else if (Array.isArray(data)) {
                        raw = data;
                    }
                    if (raw.length > 0) {
                        recommendedSongs = raw.map(Saavn.formatSong).filter(s => s.url && s.id !== lastSong.id);
                    }
                }
            } catch (e) {
                console.log('JioSaavn recommendations API failed, falling back to artist search:', e);
            }
        }
        
        // 2. Fallback: Search for the same artist on JioSaavn or YouTube
        if (recommendedSongs.length === 0) {
            try {
                // Search for the artist to get similar hits
                const searchQ = lastSong.artist.split(',')[0].trim(); // Take the primary artist
                const results = await Saavn.searchSongs(searchQ, 10);
                recommendedSongs = results.filter(s => s.id !== lastSong.id);
            } catch (e) {
                console.log('Saavn artist search failed, falling back to YouTube artist search:', e);
            }
        }
        
        // 3. YouTube Fallback: If both fail, search YouTube for artist hits
        if (recommendedSongs.length === 0) {
            try {
                const searchQ = `${lastSong.artist.split(',')[0].trim()} hits`;
                const r = await fetch(`/api/yt/search?q=${encodeURIComponent(searchQ)}`);
                if (r.ok) {
                    const items = await r.json();
                    recommendedSongs = items.map(v => ({
                        id: v.videoId, title: v.title, artist: v.author, source: 'yt', duration: v.lengthSeconds
                    })).filter(s => s.id !== lastSong.id);
                }
            } catch (e) {
                console.log('YouTube fallback search failed:', e);
            }
        }
        
        // Filter out recently played songs from state.history to prevent repetition loops
        const historyIds = state.history.map(s => s.id);
        let freshSongs = recommendedSongs.filter(s => !historyIds.includes(s.id));
        if (freshSongs.length === 0) freshSongs = recommendedSongs;
        
        if (freshSongs.length > 0) {
            // Pick a random song from the top 5 recommended to make it dynamic and feel alive!
            const pickIdx = Math.floor(Math.random() * Math.min(freshSongs.length, 5));
            const nextSong = freshSongs[pickIdx];
            
            Terminal.print(`  📻  [AUTOPLAY RADIO] Recommended next: "${decodeHTML(nextSong.title)}" by ${decodeHTML(nextSong.artist)}`, 'y');
            
            // Queue and play it!
            addToQueue(nextSong);
            next();
        } else {
            Terminal.print('  📻  [AUTOPLAY RADIO] Could not find any similar songs. Try searching for a new song!', 'r');
        }
    }

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
        if (state.queue.length > 0) {
            playSong(state.queue.shift());
        } else if (state.autoplay && state.current) {
            playSimilarRadio();
        } else {
            Terminal.print('  Queue ended.', 'gd');
        }
    }

    function prev() {
        if (state.history.length > 0) playSong(state.history.pop());
    }

    function addToQueue(song) {
        state.queue.push(song);
        Terminal.print(`  + Queued: ${decodeHTML(song.title)}`, 'gd');
    }

    function seek(seconds) {
        if (!state.current) return;
        if (state.source === 'yt' && ytReady) {
            const cur = ytPlayer.getCurrentTime();
            ytPlayer.seekTo(cur + seconds, true);
        } else {
            audio.currentTime += seconds;
        }
        updateUI();
    }

    function jumpTo(seconds) {
        if (!state.current) return;
        if (state.source === 'yt' && ytReady) {
            ytPlayer.seekTo(seconds, true);
        } else {
            audio.currentTime = seconds;
        }
        updateUI();
    }

    function prepareForPlayback() {
        try {
            if (!audio.src || audio.src.startsWith('data:')) {
                audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
            }
            audio.play().then(() => {
                audio.pause();
            }).catch(() => {});
        } catch (e) {}

        initEqualizer();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
    }

    setInterval(() => { if (state.playing) updateUI(); }, 1000);

    return {
        playSong, togglePause, setVolume, next, prev, addToQueue, seek, jumpTo, prepareForPlayback,
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
        getState: () => state,
        setBass, setTreble, setReverb, setBoost, applyPreset, changeQuality, initEqualizer
    };
})();
