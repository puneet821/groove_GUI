/* =============================================
   commands.js — Command parser & handlers
   ============================================= */

const Commands = (() => {
    let lastResults = [];  // Last search results

    const HELP_TEXT = `
  ┌─────────────────────────────────────────────────────┐
  │              GROOVECMD — COMMAND REFERENCE           │
  ├──────────────────┬──────────────────────────────────┤
  │  PLAYBACK        │                                  │
  │  play <song>     │  Direct play (Saavn -> YouTube)  │
  │  playyt <song>   │  Direct play from YouTube        │
  │  playsv <song>   │  Direct play from JioSaavn       │
  │  play <#>        │  Play from search results        │
  │  pause           │  Pause / resume toggle           │
  │  next  / n       │  Next song in queue              │
  │  prev  / p       │  Previous song                   │
  │  fwd / f         │  Forward 10 seconds              │
  │  back / b        │  Backward 10 seconds             │
  │  jump <time>     │  Jump to timestamp (1:30 or 90)  │
  │  vol <0-100>     │  Set volume                      │
  │  shuffle         │  Toggle shuffle mode             │
  │  repeat          │  Toggle repeat (off/1/all)       │
  │  autoplay / radio│  Toggle Smart Autoplay Radio     │
  ├──────────────────┼──────────────────────────────────┤
  │  SEARCH & QUEUE  │                                  │
  │  search <query>  │  Search JioSaavn                 │
  │  yt <query>      │  Search & play from YouTube      │
  │  add <#>         │  Add result to queue             │
  │  queue / q       │  Show current queue              │
  ├──────────────────┼──────────────────────────────────┤
  │  EQUALIZER & EQ  │                                  │
  │  bass <dB>       │  Adjust Bass (-10 to 10 dB)      │
  │  treble <dB>     │  Adjust Treble (-10 to 10 dB)    │
  │  reverb <0-100>  │  Adjust Reverb Space (0-100%)    │
  │  boost <0-6dB>   │  Pre-amp Master Volume Boost     │
  │  preset <name>   │  Load profile (flat/vocal/hall/..)│
  │  quality <kbps>  │  Change quality (320/160/96)     │
  │  eq              │  Display sound core status       │
  ├──────────────────┼──────────────────────────────────┤
  │  SYSTEM          │                                  │
  │  theme <name>    │  Change UI theme                 │
  │  clear / cls     │  Clear terminal                  │
  │  help / h        │  Show this help                  │
  └──────────────────┴──────────────────────────────────┘
`;

    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    function printResults(results) {
        Terminal.print(`\n  Found ${results.length} results:\n`, 'c');
        results.forEach((s, i) => {
            const num    = String(i + 1).padStart(2, ' ');
            const dur    = fmtDur(s.duration);
            const title  = truncate(decodeHTML(s.title), 35).padEnd(35);
            const artist = truncate(decodeHTML(s.artist), 22).padEnd(22);
            const src    = s.source === 'yt' ? '[YT]' : '[SV]';
            Terminal.print(`  ${num}.  ${title}  ${artist}  ${dur}  ${src}`, 'w');
        });
        Terminal.print('\n  Tip: `play <#>` to play  |  `add <#>` to queue\n', 'gd');
    }

    function truncate(str, len) {
        if (!str) return ''.padEnd(len);
        return str.length > len ? str.slice(0, len - 1) + '…' : str;
    }

    function fmtDur(sec) {
        if (!sec) return '--:--';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function parseTime(str) {
        if (!str) return null;
        if (str.includes(':')) {
            const parts = str.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return parseInt(str);
    }

    async function cmdSearch(query) {
        if (!query) { Terminal.print('Usage: search <song name>', 'r'); return; }
        Terminal.print(`  Searching for "${query}"...`, 'gd');
        try {
            // Try Saavn first
            let songs = [];
            try {
                songs = await Saavn.searchSongs(query, 10);
            } catch (e) {
                Terminal.print('  JioSaavn mirrors busy. Using YouTube engine...', 'y');
            }

            if (!songs || !songs.length) {
                const r = await fetch(`/api/yt/search?q=${encodeURIComponent(query)}`);
                const items = await r.json();
                songs = items.map(v => ({
                    id: v.videoId, title: v.title, artist: v.author, source: 'yt', duration: v.lengthSeconds
                }));
            }

            if (!songs.length) { Terminal.print('No results found.', 'r'); return; }
            lastResults = songs;
            printResults(songs);
        } catch (e) {
            Terminal.print(`[ERROR] ${e.message}`, 'r');
        }
    }

    async function cmdYT(query) {
        if (!query) { Terminal.print('Usage: yt <song name>', 'r'); return; }
        Terminal.print(`  Searching YouTube for "${query}"...`, 'gd');
        try {
            const r = await fetch(`/api/yt/search?q=${encodeURIComponent(query)}`);
            if (!r.ok) throw new Error('YouTube search failed');
            const items = await r.json();
            if (!items.length) { Terminal.print('No YouTube results found.', 'r'); return; }

            const ytResults = items.map(v => ({
                id:       v.videoId,
                title:    v.title,
                artist:   v.author,
                album:    'YouTube',
                duration: v.lengthSeconds,
                image:    `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                url:      `https://www.youtube.com/watch?v=${v.videoId}`,
                source:   'yt'
            }));

            lastResults = ytResults;
            printResults(ytResults);
        } catch (e) {
            Terminal.print(`[ERROR] ${e.message}`, 'r');
        }
    }

    async function handle(rawCmd) {
        const parts = rawCmd.trim().split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1).join(' ');
        const num   = parseInt(parts[1]);

        switch (cmd) {
            case 'search': case 's':
                await cmdSearch(args);
                break;

            case 'yt':
                await cmdYT(args);
                break;

            case 'playyt': case 'ytplay':
                if (!args) { Terminal.print('Usage: playyt <song name>', 'r'); break; }
                if (typeof Player.prepareForPlayback === 'function') {
                    Player.prepareForPlayback();
                }
                Terminal.print(`  Direct YouTube play: "${args}"...`, 'gd');
                try {
                    const r = await fetch(`/api/yt/search?q=${encodeURIComponent(args)}`);
                    const items = await r.json();
                    if (items.length > 0) {
                        const v = items[0];
                        Player.playSong({
                            id: v.videoId,
                            title: v.title,
                            artist: v.author,
                            album: 'YouTube',
                            duration: v.lengthSeconds,
                            image: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                            url: `https://www.youtube.com/watch?v=${v.videoId}`,
                            source: 'yt'
                        });
                    } else {
                        Terminal.print('No YouTube results found.', 'r');
                    }
                } catch (e) {
                    Terminal.print(`[ERROR] ${e.message}`, 'r');
                }
                break;

            case 'playsv': case 'playsaavn': case 'svplay':
                if (!args) { Terminal.print('Usage: playsv <song name>', 'r'); break; }
                if (typeof Player.prepareForPlayback === 'function') {
                    Player.prepareForPlayback();
                }
                Terminal.print(`  Direct JioSaavn play: "${args}"...`, 'gd');
                try {
                    const songs = await Saavn.searchSongs(args, 1);
                    if (songs.length > 0) {
                        await Player.playSong(songs[0]);
                    } else {
                        Terminal.print('No JioSaavn results found.', 'r');
                    }
                } catch (e) {
                    Terminal.print(`[ERROR] ${e.message}`, 'r');
                }
                break;

            case 'play': case 'p':
                if (!args) { Player.togglePause(); break; }
                if (typeof Player.prepareForPlayback === 'function') {
                    Player.prepareForPlayback();
                }
                
                if (!isNaN(num) && num >= 1 && num <= lastResults.length) {
                    await Player.playSong(lastResults[num - 1]);
                } else {
                    Terminal.print(`  Direct play: "${args}"...`, 'gd');
                    try {
                        let songPlayed = false;
                        try {
                            const songs = await Saavn.searchSongs(args, 1);
                            if (songs.length > 0) {
                                await Player.playSong(songs[0]);
                                songPlayed = true;
                            }
                        } catch (e) {
                            Terminal.print('  JioSaavn search failed/busy, trying YouTube...', 'y');
                        }

                        if (!songPlayed) {
                            const r = await fetch(`/api/yt/search?q=${encodeURIComponent(args)}`);
                            const items = await r.json();
                            if (items.length > 0) {
                                const v = items[0];
                                Player.playSong({
                                    id: v.videoId, title: v.title, artist: v.author, source: 'yt', duration: v.lengthSeconds
                                });
                            } else {
                                Terminal.print('No results found.', 'r');
                            }
                        }
                    } catch (e) {
                        Terminal.print(`[ERROR] ${e.message}`, 'r');
                    }
                }
                break;

            case 'pause': case 'resume': Player.togglePause(); break;
            case 'next': case 'n': Player.next(); break;
            case 'prev': case 'p': Player.prev(); break;
            case 'fwd': case 'f': Player.seek(10); break;
            case 'back': case 'b': Player.seek(-10); break;
            case 'jump': case 'seek':
                const sec = parseTime(args);
                if (isNaN(sec) || sec === null) {
                    Terminal.print('Usage: jump <time> (e.g. 1:30 or 90)', 'r');
                } else {
                    Player.jumpTo(sec);
                }
                break;
            case 'vol': case 'volume':
                if (isNaN(num)) { Terminal.print('Usage: vol <0-100>', 'r'); break; }
                Player.setVolume(num);
                break;
            case 'shuffle': Player.toggleShuffle(); break;
            case 'repeat': case 'rep': Player.toggleRepeat(); break;
            case 'autoplay': case 'ap': case 'radio':
                const playerState = Player.getState();
                playerState.autoplay = !playerState.autoplay;
                localStorage.setItem('groovecmd_autoplay', playerState.autoplay);
                Terminal.print(`  📻  Autoplay Radio is now: ${playerState.autoplay ? 'ENABLED (similar songs will play automatically)' : 'DISABLED'}`, 'gb');
                break;
            case 'add':
                if (isNaN(num) || !lastResults[num - 1]) {
                    Terminal.print('Usage: add <#>  (from search results)', 'r'); break;
                }
                Player.addToQueue(lastResults[num - 1]);
                break;
            case 'queue': case 'q': Player.showQueue(); break;
            case 'np': case 'nowplaying': Player.showNowPlaying(); break;
            case 'like': Player.likeCurrent(); break;
            case 'liked': Player.showLiked(); break;
            case 'theme':
                const themes = ['matrix', 'nebula', 'stars', 'cyber', 'retro', 'ghost'];
                if (!args || !themes.includes(args.toLowerCase())) {
                    Terminal.print('Available themes: ' + themes.join(', '), 'y');
                } else {
                    const t = args.toLowerCase();
                    ThemeEngine.set(t === 'stars' ? 'nebula' : t);
                    Terminal.print(`  Theme switched to: ${args.toUpperCase()}`, 'gb');
                }
                break;
            case 'clear': case 'cls': Terminal.clear(); break;
            case 'help': case 'h': case '?': Terminal.print(HELP_TEXT, 'gd'); break;
            case 'bass':
                if (isNaN(num)) {
                    const currentBass = parseFloat(localStorage.getItem('groovecmd_bass') || '0');
                    Terminal.print(`  Current Bass Level: ${currentBass > 0 ? '+' : ''}${currentBass}dB`, 'c');
                } else {
                    const clamped = Math.max(-10, Math.min(10, num));
                    Player.setBass(clamped);
                    const knobEl = document.getElementById('knob-bass');
                    if (knobEl && window.updateKnobUI) {
                        window.updateKnobUI(knobEl, clamped);
                    }
                    Terminal.print(`  Bass level set to: ${clamped > 0 ? '+' : ''}${clamped}dB`, 'gb');
                }
                break;
            case 'treble':
                if (isNaN(num)) {
                    const currentTreble = parseFloat(localStorage.getItem('groovecmd_treble') || '0');
                    Terminal.print(`  Current Treble Level: ${currentTreble > 0 ? '+' : ''}${currentTreble}dB`, 'c');
                } else {
                    const clamped = Math.max(-10, Math.min(10, num));
                    Player.setTreble(clamped);
                    const knobEl = document.getElementById('knob-treble');
                    if (knobEl && window.updateKnobUI) {
                        window.updateKnobUI(knobEl, clamped);
                    }
                    Terminal.print(`  Treble level set to: ${clamped > 0 ? '+' : ''}${clamped}dB`, 'gb');
                }
                break;
            case 'quality':
                if (!args) {
                    const currentQuality = localStorage.getItem('groovecmd_quality') || '160kbps';
                    Terminal.print(`  Current Preferred Quality: ${currentQuality.toUpperCase()}`, 'c');
                } else {
                    let qVal = args.trim().toLowerCase();
                    if (!qVal.endsWith('kbps') && !isNaN(parseInt(qVal))) {
                        qVal = qVal + 'kbps';
                    }
                    if (['320kbps', '160kbps', '96kbps'].includes(qVal)) {
                        if (window.selectQuality) {
                            window.selectQuality(qVal);
                        } else {
                            Player.changeQuality(qVal);
                        }
                        Terminal.print(`  Stream quality preference set to: ${qVal.toUpperCase()}`, 'gb');
                    } else {
                        Terminal.print('  Usage: quality <320 | 160 | 96>', 'r');
                    }
                }
                break;
            case 'reverb':
                if (isNaN(num)) {
                    const currentReverb = parseFloat(localStorage.getItem('groovecmd_reverb') || '0');
                    Terminal.print(`  Current Reverb: ${currentReverb}%`, 'c');
                } else {
                    const clamped = Math.max(0, Math.min(100, num));
                    Player.setReverb(clamped);
                    const knobEl = document.getElementById('knob-reverb');
                    if (knobEl && window.updateKnobUI) {
                        window.updateKnobUI(knobEl, clamped);
                    }
                    Terminal.print(`  Reverb wet mix set to: ${clamped}%`, 'gb');
                }
                break;
            case 'boost': case 'gain':
                if (isNaN(num)) {
                    const currentBoost = parseFloat(localStorage.getItem('groovecmd_boost') || '0');
                    Terminal.print(`  Current Pre-amp Boost: ${currentBoost > 0 ? '+' : ''}${currentBoost}dB`, 'c');
                } else {
                    const clamped = Math.max(0, Math.min(6, num));
                    Player.setBoost(clamped);
                    const knobEl = document.getElementById('knob-boost');
                    if (knobEl && window.updateKnobUI) {
                        window.updateKnobUI(knobEl, clamped);
                    }
                    Terminal.print(`  Pre-amp Master Boost set to: +${clamped}dB`, 'gb');
                }
                break;
            case 'preset':
                const validPresets = ['flat', 'bassboost', 'vocal', 'hall'];
                if (!args || !validPresets.includes(args.toLowerCase())) {
                    Terminal.print('  Available presets: ' + validPresets.join(', '), 'y');
                } else {
                    Player.applyPreset(args.toLowerCase());
                }
                break;
            case 'eq':
                const bassVal = parseFloat(localStorage.getItem('groovecmd_bass') || '0');
                const trebleVal = parseFloat(localStorage.getItem('groovecmd_treble') || '0');
                const reverbVal = parseFloat(localStorage.getItem('groovecmd_reverb') || '0');
                const boostVal = parseFloat(localStorage.getItem('groovecmd_boost') || '0');
                const qualVal = localStorage.getItem('groovecmd_quality') || '160kbps';
                Terminal.print('\n  ♫ ADVANCED SOUND CORE CONFIG:', 'gb');
                Terminal.print(`     BASS         : ${bassVal > 0 ? '+' : ''}${bassVal}dB`, 'y');
                Terminal.print(`     TREBLE       : ${trebleVal > 0 ? '+' : ''}${trebleVal}dB`, 'y');
                Terminal.print(`     REVERB WET   : ${reverbVal}%`, 'y');
                Terminal.print(`     PRE-AMP BOOST: +${boostVal}dB`, 'y');
                Terminal.print(`     STREAM QUAL  : ${qualVal.toUpperCase()}\n`, 'c');
                break;
            case 'quit': case 'exit': Terminal.print('  See ya!', 'y'); break;
            default:
                Terminal.print(`  Command not found: "${cmd}". Type \`help\` for commands.`, 'r');
        }
    }

    return { handle };
})();
