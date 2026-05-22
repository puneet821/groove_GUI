/* =============================================
   app.js — Boot sequence & initialization
   ============================================= */

/* ── Clock ── */
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ── Live Status Dashboard ── */
function updateStats() {
    const cpuVal = Math.random() * 5 + 2;
    const memVal = Math.random() * 10 + 45;
    const cpu = cpuVal.toFixed(1) + '%';
    const mem = memVal.toFixed(1) + 'MB';
    const net = (Math.random() * 200 + 50).toFixed(1) + 'KB/s';
    
    document.getElementById('stat-cpu').textContent = cpu;
    document.getElementById('stat-mem').textContent = mem;
    document.getElementById('stat-net').textContent = net;

    // Update side panel bars
    if (document.getElementById('bar-cpu')) {
        document.getElementById('bar-cpu').style.width = (cpuVal * 10) + '%';
        document.getElementById('bar-mem').style.width = (memVal / 2) + '%';
    }

    // Add random network log
    const feed = document.getElementById('net-feed');
    if (feed) {
        const logs = ['GET /api/audio', 'PING saavn-cdn', 'SOCKET_CONNECT', 'BUFFER_LOADED', 'SYNC_QUEUE'];
        const line = document.createElement('div');
        line.textContent = `> ${logs[Math.floor(Math.random() * logs.length)]}`;
        feed.prepend(line);
        if (feed.children.length > 6) feed.lastChild.remove();
    }
}
setInterval(updateStats, 2000);
updateStats();

/* ── ASCII Spectrum Visualizer ── */
const specChars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
function updateSpectrum() {
    const el = document.getElementById('np-spectrum');
    if (!el) return;
    let bars = '';
    for (let i = 0; i < 12; i++) {
        bars += specChars[Math.floor(Math.random() * specChars.length)];
    }
    el.textContent = bars;
}
setInterval(updateSpectrum, 150);
updateSpectrum();

/* ── Theme Engine ── */
const ThemeEngine = (() => {
    const bg = document.getElementById('theme-bg');
    let currentTheme = 'matrix';

    function clear() { bg.innerHTML = ''; }

    function set(theme) {
        document.body.className = `theme-${theme}`;
        currentTheme = theme;
        clear();
        
        // Background animations now properly render behind content
        if (theme === 'matrix') initMatrix();
        if (theme === 'nebula') initStars();
        if (theme === 'cyber') initWaves();
        if (theme === 'retro') initFlicker();
    }

    function initMatrix() {
        // Falling animation removed per user request
    }


    function initStars() {
        const isNebula = document.body.classList.contains('theme-nebula');
        const color = isNebula ? '#ff79c6' : '#ffffff';
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2 + 1 + 'px';
            star.style.width = size; star.style.height = size;
            star.style.left = Math.random() * 100 + 'vw';
            star.style.background = color;
            star.style.boxShadow = `0 0 8px ${color}`;
            star.style.animationDuration = Math.random() * 8 + 4 + 's';
            star.style.animationDelay = Math.random() * 10 + 's';
            star.style.opacity = Math.random();
            bg.appendChild(star);
        }
    }

    function initWaves() {
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave';
            wave.style.bottom = (i * 20) + 'px';
            wave.style.opacity = (0.1 + i * 0.05);
            wave.style.animationDelay = (i * 0.5) + 's';
            bg.appendChild(wave);
        }
    }

    function cycle() {
        const list = ['matrix', 'nebula', 'cyber', 'retro', 'ghost'];
        let idx = list.indexOf(currentTheme);
        if (idx === -1) idx = 0;
        const nextTheme = list[(idx + 1) % list.length];
        set(nextTheme);
        Terminal.print(`  [THEME] Switched theme to: ${nextTheme.toUpperCase()}`, 'gb');
    }

    return { set, current: () => currentTheme, cycle };
})();

// Initialize default theme
ThemeEngine.set('matrix');

/* ── ASCII Logo & Boot Sequence ── */
const LOGO = [
    '',
    '  ██████╗ ██████╗  ██████╗  ██████╗ ██╗   ██╗███████╗',
    '  ██╔════╝ ██╔══██╗██╔═══██╗██╔═══██╗██║   ██║██╔════╝',
    '  ██║  ███╗██████╔╝██║   ██║██║   ██║██║   ██║█████╗  ',
    '  ██║   ██║██╔══██╗██║   ██║██║   ██║╚██╗ ██╔╝██╔══╝  ',
    '  ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝ ╚████╔╝ ███████╗',
    '   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═══╝  ╚══════╝',
    '',
    '             C M D   M U S I C   P L A Y E R',
    '          ────────────────────────────────────',
    '          Powered by JioSaavn  +  YouTube',
    '          Made with ♥ by Puneet',
    ''
];

const BOOT = [
    { text: '  [OK]  Loading audio engine...', cls: 'gd', delay: 200 },
    { text: '  [OK]  Connecting to JioSaavn API...', cls: 'gd', delay: 400 },
    { text: '  [OK]  Initializing YouTube player...', cls: 'gd', delay: 600 },
    { text: '  [OK]  Loading user library...', cls: 'gd', delay: 800 },
    { text: '  [OK]  System ready.', cls: 'gb', delay: 1000 },
    { text: '', cls: 'g', delay: 1100 },
    { text: '  Type `help` to see all commands.', cls: 'y', delay: 1200 },
    { text: '  Try:  search Tum Hi Ho  |  play Kesariya  |  yt Shape of You', cls: 'gd', delay: 1300 },
    { text: '', cls: 'g', delay: 1400 },
];

(function boot() {
    // Print logo immediately
    LOGO.forEach(line => Terminal.print(line, 'gb'));

    // Print boot sequence with delays
    BOOT.forEach(({ text, cls, delay }) => {
        setTimeout(() => {
            Terminal.print(text, cls);
            if (delay === 1400) Terminal.focus();
        }, delay);
    });
})();

/* ── Interactive Equalizer Controls (Circular Knobs & Spotify Pill Buttons) ── */
function updateKnobUI(knobEl, val) {
    const valEl = knobEl.parentElement.querySelector('.knob-value');
    const param = knobEl.getAttribute('data-param');
    if (valEl) {
        if (param === 'reverb') {
            valEl.textContent = val.toFixed(0) + '%';
        } else {
            valEl.textContent = (val > 0 ? '+' : '') + val.toFixed(0) + 'dB';
        }
    }
    
    let deg = 0;
    if (param === 'reverb') {
        deg = -135 + (val / 100) * 270;
    } else if (param === 'boost') {
        deg = -135 + (val / 6) * 270;
    } else {
        deg = (val / 10) * 135;
    }
    knobEl.style.transform = `rotate(${deg}deg)`;
}

function bindKnob(knobId, onUpdate) {
    const knob = document.getElementById(knobId);
    if (!knob) return;
    
    const param = knob.getAttribute('data-param');
    let min = -10, max = 10, step = 1;
    if (param === 'reverb') { min = 0; max = 100; step = 5; }
    else if (param === 'boost') { min = 0; max = 6; step = 1; }
    
    const initialVal = parseFloat(localStorage.getItem(`groovecmd_${param}`) || '0');
    updateKnobUI(knob, initialVal);
    
    // Drag control mouse listener
    knob.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startVal = parseFloat(localStorage.getItem(`groovecmd_${param}`) || '0');
        
        function onMouseMove(moveEvent) {
            const deltaY = startY - moveEvent.clientY;
            let sensitivity = 0.2;
            if (param === 'reverb') sensitivity = 1.0;
            
            let val = startVal + deltaY * sensitivity;
            val = Math.max(min, Math.min(max, val));
            val = Math.round(val / step) * step;
            
            updateKnobUI(knob, val);
            onUpdate(val);
            
            // Deactivate preset buttons when tweaked manually
            document.querySelectorAll('[data-preset]').forEach(btn => btn.classList.remove('active'));
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // Drag control touch listener for mobile/tablets
    knob.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        const startY = e.touches[0].clientY;
        const startVal = parseFloat(localStorage.getItem(`groovecmd_${param}`) || '0');
        
        function onTouchMove(moveEvent) {
            if (moveEvent.touches.length !== 1) return;
            const deltaY = startY - moveEvent.touches[0].clientY;
            let sensitivity = 0.2;
            if (param === 'reverb') sensitivity = 1.0;
            
            let val = startVal + deltaY * sensitivity;
            val = Math.max(min, Math.min(max, val));
            val = Math.round(val / step) * step;
            
            updateKnobUI(knob, val);
            onUpdate(val);
            
            // Deactivate preset buttons
            document.querySelectorAll('[data-preset]').forEach(btn => btn.classList.remove('active'));
        }
        
        function onTouchEnd() {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });
}

function selectQuality(qualityStr) {
    const val = qualityStr.replace('kbps', '');
    document.querySelectorAll('.q-btn').forEach(btn => {
        if (btn.getAttribute('data-quality') === val) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Sync GUI quality buttons
    const guiQualities = { '320': 'gui-q-320', '160': 'gui-q-160', '96': 'gui-q-96' };
    Object.keys(guiQualities).forEach(q => {
        const btn = document.getElementById(guiQualities[q]);
        if (btn) {
            if (q === val) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    Player.changeQuality(qualityStr);
}

// Attach globally for access in commands.js
window.updateKnobUI = updateKnobUI;
window.selectQuality = selectQuality;

// Bind all 4 knobs
bindKnob('knob-bass', (val) => Player.setBass(val));
bindKnob('knob-treble', (val) => Player.setTreble(val));
bindKnob('knob-reverb', (val) => Player.setReverb(val));
bindKnob('knob-boost', (val) => Player.setBoost(val));

// Bind EQ presets
document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
        const presetName = btn.getAttribute('data-preset');
        Player.applyPreset(presetName);
    });
});

// Bind Quality Selector buttons
const qualityBtnHifi = document.getElementById('q-btn-hifi');
const qualityBtnMid  = document.getElementById('q-btn-mid');
const qualityBtnEco  = document.getElementById('q-btn-eco');

if (qualityBtnHifi) qualityBtnHifi.addEventListener('click', () => selectQuality('320kbps'));
if (qualityBtnMid)  qualityBtnMid.addEventListener('click', () => selectQuality('160kbps'));
if (qualityBtnEco)  qualityBtnEco.addEventListener('click', () => selectQuality('96kbps'));

// Initialize initial dashboard quality
const initialQuality = localStorage.getItem('groovecmd_quality') || '160kbps';
selectQuality(initialQuality);

// Mobile EQ Toggle Handler
const App = (() => {
    let currentMode = 'terminal';
    let activeTab = 'scanner';

    // Curated High-Fidelity Cyber Tracks
    const CURATED_TRACKS = [
        { id: '8GW6sLrK40k', title: 'Resonance', artist: 'HOME', album: 'Odyssey', duration: 212, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/8GW6sLrK40k/hqdefault.jpg' },
        { id: 'MV_3Dpw-BRY', title: 'Nightcall', artist: 'Kavinsky', album: 'Outrun', duration: 258, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/MV_3Dpw-BRY/hqdefault.jpg' },
        { id: '4NRXx6caWDU', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/4NRXx6caWDU/hqdefault.jpg' },
        { id: 't371L3r2n5g', title: 'Days of Thunder', artist: 'The Midnight', album: 'Days of Thunder', duration: 335, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/t371L3r2n5g/hqdefault.jpg' },
        { id: 'rDBbaGCCIhk', title: 'Sunset', artist: 'The Midnight', album: 'Endless Summer', duration: 341, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/rDBbaGCCIhk/hqdefault.jpg' },
        { id: '-nC5TBv3sfU', title: 'Tech Noir', artist: 'Gunship', album: 'Gunship', duration: 290, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/-nC5TBv3sfU/hqdefault.jpg' },
        { id: 'ygTZZpVNJMc', title: 'After Hours', artist: 'The Weeknd', album: 'After Hours', duration: 361, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/ygTZZpVNJMc/hqdefault.jpg' },
        { id: 'dX3kKvKyUsA', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 243, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/dX3kKvKyUsA/hqdefault.jpg' },
        { id: 'y4Dcw2_C2E0', title: 'The Perfect Girl', artist: 'Mareux', album: 'The Perfect Girl', duration: 194, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/y4Dcw2_C2E0/hqdefault.jpg' },
        { id: 'sVx1mJDeUjY', title: 'After Dark', artist: 'Mr.Kitty', album: 'Time', duration: 257, source: 'yt', genre: 'synthwave', image: 'https://i.ytimg.com/vi/sVx1mJDeUjY/hqdefault.jpg' },
        
        { id: 'jfKfPfyJRdk', title: 'Lofi Chill Beats', artist: 'Lofi Girl', album: 'Coding Sessions', duration: 180, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
        { id: '5qap5aO4i9A', title: 'Synthwave Lofi Mix', artist: 'Lofi Cyber', album: 'Late Night Code', duration: 240, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' },
        { id: '2S_Z9k2iP3o', title: 'Retro Sunset Lofi', artist: 'ChilledCow', album: 'Lofi Horizon', duration: 215, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/2S_Z9k2iP3o/hqdefault.jpg' },
        { id: 'k70O8_3n2kQ', title: 'Rainy Night In Tokyo', artist: 'Tokyo Lofi', album: 'Neon Rain', duration: 195, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/k70O8_3n2kQ/hqdefault.jpg' },
        { id: '72u8-T9-N24', title: 'Coffee Breath', artist: 'Sofia', album: 'Coffee Breath', duration: 132, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/72u8-T9-N24/hqdefault.jpg' },
        { id: '5wRWniH7rt8', title: 'Cozy Sleep Beats', artist: 'Lofi Girl', album: 'Sleep Frequencies', duration: 205, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/5wRWniH7rt8/hqdefault.jpg' },
        { id: 'V12_Vw-RUX8', title: 'Tokyo Midnight Lofi', artist: 'Tokyo Lofi Hip Hop', album: 'Midnight Tokyo', duration: 220, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/V12_Vw-RUX8/hqdefault.jpg' },
        { id: '2tD489aKkkg', title: 'Lofi Cafe Cozy', artist: 'Lofi Cove', album: 'Cozy Coffee', duration: 185, source: 'yt', genre: 'lofi', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80' },
        { id: 'sV4_wYfdg78', title: 'Intro (Lofi Version)', artist: 'The xx', album: 'Intro', duration: 128, source: 'yt', genre: 'lofi', image: 'https://i.ytimg.com/vi/sV4_wYfdg78/hqdefault.jpg' },

        { id: 'U7NItLp8gQ4', title: 'Cyberpunk 2077 Main Theme', artist: 'P.T. Adamczyk', album: 'Cyberpunk 2077 OST', duration: 130, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/U7NItLp8gQ4/hqdefault.jpg' },
        { id: 'F0B6bU689_Y', title: 'Upgrade', artist: 'Cyberpunk Electro', album: 'Hardwired Ops', duration: 245, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/F0B6bU689_Y/hqdefault.jpg' },
        { id: '9k1p8R3n6kQ', title: 'Turbo Killer', artist: 'Carpenter Brut', album: 'Trilogy', duration: 208, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/9k1p8R3n6kQ/hqdefault.jpg' },
        { id: '8K0O2_3n8kQ', title: 'Roller Mobster', artist: 'Carpenter Brut', album: 'Trilogy', duration: 214, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/8K0O2_3n8kQ/hqdefault.jpg' },
        { id: '1K1oXb4R3YQ', title: 'Spoiler', artist: 'Hyper', album: 'Spoiler', duration: 270, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/1K1oXb4R3YQ/hqdefault.jpg' },
        { id: 'a5uQMwRM24A', title: 'Instant Crush', artist: 'Daft Punk ft. Julian Casablancas', album: 'Random Access Memories', duration: 337, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/a5uQMwRM24A/hqdefault.jpg' },
        { id: 'h5EofwRzit0', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', album: 'Random Access Memories', duration: 248, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/h5EofwRzit0/hqdefault.jpg' },
        { id: 'gAjR4_CbPpQ', title: 'Harder Better Faster Stronger', artist: 'Daft Punk', album: 'Discovery', duration: 224, source: 'yt', genre: 'cyberpunk', image: 'https://i.ytimg.com/vi/gAjR4_CbPpQ/hqdefault.jpg' },
        { id: 'nOr0naS9fKg', title: 'Retro Run', artist: 'Synthwave Arcade', album: 'Turbo Run', duration: 198, source: 'yt', genre: 'cyberpunk', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80' },
        { id: 'P6fH8sWnKkg', title: 'Grid Runner', artist: 'Cyberpunk Electro', album: 'Neon Grid', duration: 215, source: 'yt', genre: 'cyberpunk', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
        { id: 'E8O4_9n3kQg', title: 'Hacker Mode', artist: 'Netrunner Synth', album: 'Cyber City', duration: 232, source: 'yt', genre: 'cyberpunk', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80' }
    ];

    const CURATED_PLAYLISTS = [
        {
            id: 'synthwave_horizon',
            title: 'Synthwave Horizon',
            desc: 'Drive into the neon sunset. Retro synth hits.',
            gradient: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
            genre: 'synthwave',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
        },
        {
            id: 'lofi_cyber_cafe',
            title: 'Lo-Fi Cyber Café',
            desc: 'Late night chill coding frequencies.',
            gradient: 'linear-gradient(135deg, #38bdf8 0%, #7c3aed 100%)',
            genre: 'lofi',
            image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80'
        },
        {
            id: 'hardwired_cyberpunk',
            title: 'Hardwired Cyberpunk',
            desc: 'High-octane synth and electro for netrunners.',
            gradient: 'linear-gradient(135deg, #fb923c 0%, #ef4444 100%)',
            genre: 'cyberpunk',
            image: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400&q=80'
        }
    ];

    function playChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            
            // Beep 1 (C5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
            gain1.gain.setValueAtTime(0.15, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.16);

            // Beep 2 (E5)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
            gain2.gain.setValueAtTime(0, ctx.currentTime);
            gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.08);
            osc2.stop(ctx.currentTime + 0.26);
        } catch (e) {
            console.log('Chime sound synth blocked or unavailable:', e);
        }
    }

    function setMode(mode, fromBoot = false) {
        currentMode = mode;
        const body = document.body;
        const btnCli = document.getElementById('btn-layout-cli');
        const btnGui = document.getElementById('btn-layout-gui');

        if (mode === 'gui') {
            body.classList.add('mode-gui');
            if (btnCli) btnCli.classList.remove('active');
            if (btnGui) btnGui.classList.add('active');
            syncGuiLists();
            syncSlidersWithPlayer();
        } else {
            body.classList.remove('mode-gui');
            if (btnCli) btnCli.classList.add('active');
            if (btnGui) btnGui.classList.remove('active');
            const cmdInput = document.getElementById('cmd-input');
            if (cmdInput) cmdInput.focus();
        }

        // Auto-save setting if preference memory is enabled
        const isRemember = localStorage.getItem('groovecmd_remember_choice') !== 'false';
        if (isRemember) {
            localStorage.setItem('groovecmd_boot_choice', mode);
        }

        syncPreferencesUI();
    }

    function bootToMode(mode) {
        playChime();
        if (window.Player && Player.prepareForPlayback) {
            Player.prepareForPlayback();
        }

        const rememberCheckbox = document.getElementById('remember-boot-choice');
        const isRemember = rememberCheckbox ? rememberCheckbox.checked : true;
        
        localStorage.setItem('groovecmd_remember_choice', isRemember ? 'true' : 'false');
        if (isRemember) {
            localStorage.setItem('groovecmd_boot_choice', mode);
        } else {
            localStorage.removeItem('groovecmd_boot_choice');
        }

        setMode(mode, true);

        const bootSelector = document.getElementById('boot-selector');
        if (bootSelector) {
            bootSelector.classList.add('fade-out');
            setTimeout(() => {
                bootSelector.style.display = 'none';
            }, 600);
        }
    }

    function resetBootChoice() {
        localStorage.removeItem('groovecmd_boot_choice');
        localStorage.setItem('groovecmd_remember_choice', 'false');
        syncPreferencesUI();
        
        const bootSelector = document.getElementById('boot-selector');
        if (bootSelector) {
            bootSelector.style.display = 'flex';
            bootSelector.offsetHeight; // force reflow
            bootSelector.classList.remove('fade-out');
        }
        Terminal.print('  [SYSTEM] Boot selection cleared. Restoring splash interface...', 'y');
    }

    function syncPreferencesUI() {
        const isRemember = localStorage.getItem('groovecmd_remember_choice') !== 'false';
        
        const checkbox = document.getElementById('remember-boot-choice');
        if (checkbox) {
            checkbox.checked = isRemember;
        }

        const btn = document.getElementById('gui-btn-remember-choice');
        if (btn) {
            if (isRemember) {
                btn.textContent = 'AUTO-BOOT: ENABLED';
                btn.classList.add('active');
            } else {
                btn.textContent = 'AUTO-BOOT: DISABLED';
                btn.classList.remove('active');
            }
        }
    }

    function toggleRememberPreference() {
        const currentPref = localStorage.getItem('groovecmd_remember_choice') !== 'false';
        const newPref = !currentPref;
        localStorage.setItem('groovecmd_remember_choice', newPref ? 'true' : 'false');
        
        if (newPref) {
            localStorage.setItem('groovecmd_boot_choice', currentMode);
            Terminal.print(`  [SYSTEM] Auto-boot enabled. Locked default startup to: ${currentMode.toUpperCase()}`, 'gb');
        } else {
            localStorage.removeItem('groovecmd_boot_choice');
            Terminal.print(`  [SYSTEM] Auto-boot disabled. Splash screen will show on next boot.`, 'y');
        }

        syncPreferencesUI();
    }

    let currentImportedPlaylist = null;

    /* ── Spotify-Style Discovery UI Renderers ── */
    function renderDiscoverHome() {
        // Render saved playlists section if they exist
        renderSavedPlaylists();

        // 1. Featured Playlists Grid
        const playlistsContainer = document.getElementById('discover-playlists');
        if (playlistsContainer) {
            playlistsContainer.innerHTML = '';
            
            // Using exact gradients from the mockup
            const mockupGradients = [
                'linear-gradient(145deg, #df9023, #c47610)', // Orange
                'linear-gradient(145deg, #2d558d, #1b3a66)', // Blue
                'linear-gradient(145deg, #b091f0, #8865d6)', // Purple
                'linear-gradient(145deg, #6c9a72, #47704c)'  // Green
            ];
            
            CURATED_PLAYLISTS.slice(0, 4).forEach((playlist, idx) => {
                const card = document.createElement('div');
                card.className = 'discover-playlist-card';
                card.style.background = mockupGradients[idx % 4];
                card.onclick = () => showPlaylistTracklist(playlist.id);
                
                // Track count mock text matching the mockup
                const tracksCount = [30, 28, 37, 17][idx % 4] + " tracks";
                
                card.innerHTML = `
                    <div class="playlist-info">
                        <h4 class="playlist-title">${playlist.title}</h4>
                        <p class="playlist-desc">${tracksCount}</p>
                    </div>
                    <div class="playlist-cover-art">
                        <img src="${playlist.image}" alt="${playlist.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `;
                playlistsContainer.appendChild(card);
            });
        }

        // 2. Trending Curated Songs (Expanded to 12 Cards)
        const trendingContainer = document.getElementById('discover-trending-songs');
        if (trendingContainer) {
            trendingContainer.innerHTML = '';
            const trendingSongs = CURATED_TRACKS.slice(0, 12);
            const gradients = [
                'linear-gradient(135deg,#1e3a5f,#0d1b2a)',
                'linear-gradient(135deg,#2d1b4e,#12091f)',
                'linear-gradient(135deg,#1a3a2a,#0a1a12)',
                'linear-gradient(135deg,#3a1a1a,#1a0808)',
                'linear-gradient(135deg,#1a2a3a,#080f1a)',
                'linear-gradient(135deg,#2a1a3a,#100818)',
            ];
            trendingSongs.forEach((song, idx) => {
                const card = document.createElement('div');
                card.className = 'discover-song-card';
                card.onclick = () => playDiscoverSong(song);
                const fallbackGrad = gradients[idx % gradients.length];
                card.innerHTML = `
                    <div class="song-card-art">
                        <img src="${song.image}" alt="${song.title}" onerror="this.style.display='none'; this.parentElement.style.background='${fallbackGrad}'; this.parentElement.querySelector('.song-art-fallback').style.display='flex';">
                        <div class="song-art-fallback" style="display:none;position:absolute;inset:0;background:${fallbackGrad};align-items:center;justify-content:center;font-size:24px;">🎵</div>
                    </div>
                    <div class="song-card-meta" style="flex: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden;">
                        <div class="song-card-title" title="${song.title}" style="color: #fff; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</div>
                        <div class="song-card-artist" title="${song.artist}" style="color: #a0a0a0; font-size: 13px;">${song.artist}</div>
                    </div>
                    <div class="song-card-duration" style="color: #a0a0a0; font-size: 12px; margin-left: auto; padding-right: 10px;">${["3:13", "4:04", "2:45", "3:50"][idx % 4]}</div>
                `;
                trendingContainer.appendChild(card);
            });
        }
    }

    function showPlaylistTracklist(playlistId) {
        let playlist = CURATED_PLAYLISTS.find(p => p.id === playlistId);
        let isSavedPlaylist = false;
        let songs = [];
        
        if (!playlist) {
            const saved = JSON.parse(localStorage.getItem('groovecmd_saved_playlists') || '[]');
            playlist = saved.find(p => p.id === playlistId);
            if (playlist) {
                isSavedPlaylist = true;
                songs = playlist.tracks;
            }
        } else {
            songs = CURATED_TRACKS.filter(s => s.genre === playlist.genre);
        }
        
        if (!playlist) return;

        // Hide panel-scanner main content, show tracklist overlay inside it
        const scannerPanel = document.getElementById('panel-scanner');
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        if (!scannerPanel || !tracklistPanel) return;

        // Hide the scanner content sections
        Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
            el.style.display = 'none';
        });
        tracklistPanel.classList.remove('hidden');

        let rowsHTML = '';
        songs.forEach((song, idx) => {
            const songJson = JSON.stringify(song).replace(/"/g, '&quot;');
            rowsHTML += `
                <div class="cassette-list-item">
                    <span class="item-num">${String(idx + 1).padStart(2, '0')}.</span>
                    <div class="item-info">
                        <span class="item-title" title="${song.title}">${song.title}</span>
                        <span class="item-artist" title="${song.artist}">${song.artist}</span>
                    </div>
                    ${song.source === 'spotify' ? `<span class="item-src-badge tag-spotify">SPOTIFY</span>` : ''}
                    <button class="action-btn-play" onclick="App.playDiscoverSong(${songJson}, ${JSON.stringify(songs).replace(/"/g, '&quot;')})">▶ Play</button>
                    <button class="action-btn-queue" onclick="App.queueDiscoverSong(${songJson})">＋ Queue</button>
                </div>
            `;
        });

        const bgStyle = isSavedPlaylist ? `linear-gradient(135deg, #0b3c20 0%, #0d1217 100%)` : playlist.gradient;
        const subtitle = isSavedPlaylist ? `⚡ SAVED SPOTIFY PLAYLIST` : `PLAYLIST DECK`;

        tracklistPanel.innerHTML = `
            <div class="tracklist-header-banner" style="background: ${bgStyle}; border-color: #1db954; position: relative; display: flex; align-items: center; gap: 15px; padding: 15px;">
                <button class="tracklist-back-btn" onclick="App.hidePlaylistTracklist()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 4px;">← BACK</button>
                <div class="tracklist-cover-art" style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.5); flex-shrink: 0;">
                    <img src="${playlist.image || 'logo.svg'}" alt="${playlist.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="tracklist-header-content" style="flex: 1;">
                    <span class="tracklist-subtitle" style="color: #1db954; font-weight: bold; letter-spacing: 2px; font-size: 11px;">${subtitle}</span>
                    <h2 class="tracklist-title" style="margin: 4px 0 2px 0; font-size: 18px; color: #fff;">${playlist.title}</h2>
                    <p class="tracklist-desc" style="opacity: 0.8; font-size: 12px; line-height: 1.4; color: #a1a1aa; margin: 0;">${playlist.desc || playlist.description || ''}</p>
                    <div class="tracklist-actions" style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                        <button class="gui-btn-primary" onclick="App.playAllTracks(${JSON.stringify(songs).replace(/"/g, '&quot;')})" style="background: #1db954; color: #000; font-weight: bold; border: none; padding: 6px 15px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s ease;">
                            <span>▶</span> PLAY ALL
                        </button>
                        ${isSavedPlaylist ? `
                        <button class="gui-btn-secondary" onclick="App.toggleSaveSpotify('${playlist.id}')" style="background: #ef4444; color: #fff; border: 1px solid #ef4444; padding: 6px 15px; border-radius: 20px; font-size: 12px; cursor: pointer;">
                            ✕ REMOVE PLAYLIST
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="cassette-list">
                ${rowsHTML}
            </div>
        `;
    }

    function hidePlaylistTracklist() {
        const scannerPanel = document.getElementById('panel-scanner');
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        if (scannerPanel && tracklistPanel) {
            tracklistPanel.classList.add('hidden');
            // Restore hidden sections
            Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
                el.style.display = '';
            });
        }
    }

    function playDiscoverSong(song, contextTracks) {
        if (contextTracks) {
            Player.setActivePlaylistTracks(contextTracks);
        } else {
            Player.setActivePlaylistTracks(null);
        }
        Player.playSong(song);
        Terminal.print(`  [DISCOVER] Loaded and playing: ${song.title} by ${song.artist}`, 'gb');
    }

    function playAllTracks(songs) {
        if (!songs || songs.length === 0) return;
        Player.setActivePlaylistTracks(songs);
        Player.playSong(songs[0]);
        Terminal.print(`  [PLAYLIST] Playing all ${songs.length} songs starting with "${songs[0].title}"`, 'gb');
    }

    function getCurrentImportedTracks() {
        return currentImportedPlaylist ? currentImportedPlaylist.tracks : [];
    }

    function toggleSaveSpotify(playlistId) {
        const id = playlistId || (currentImportedPlaylist ? currentImportedPlaylist.id : null);
        if (!id) return;
        
        const savedPlaylists = JSON.parse(localStorage.getItem('groovecmd_saved_playlists') || '[]');
        const existingIdx = savedPlaylists.findIndex(p => p.id === id);
        
        if (existingIdx !== -1) {
            const removed = savedPlaylists.splice(existingIdx, 1)[0];
            localStorage.setItem('groovecmd_saved_playlists', JSON.stringify(savedPlaylists));
            Terminal.print(`  [SPOTIFY] Removed playlist "${removed.title}" from saved decks.`, 'r');
            
            const btn = document.getElementById('btn-save-playlist');
            if (btn) {
                btn.textContent = '💾 SAVE PLAYLIST';
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.borderColor = 'rgba(255,255,255,0.3)';
            }
        } else {
            const playlistToSave = currentImportedPlaylist || savedPlaylists.find(p => p.id === id);
            if (!playlistToSave) return;
            
            savedPlaylists.push({
                id: playlistToSave.id,
                title: playlistToSave.title,
                desc: playlistToSave.desc || playlistToSave.description || 'Imported Spotify Playlist',
                image: playlistToSave.image || 'logo.svg',
                tracks: playlistToSave.tracks
            });
            localStorage.setItem('groovecmd_saved_playlists', JSON.stringify(savedPlaylists));
            Terminal.print(`  [SPOTIFY] Saved playlist "${playlistToSave.title}" to saved decks!`, 'gb');
            
            const btn = document.getElementById('btn-save-playlist');
            if (btn) {
                btn.textContent = '✕ REMOVE PLAYLIST';
                btn.style.background = '#ef4444';
                btn.style.borderColor = '#ef4444';
            }
        }
        
        renderSavedPlaylists();
        
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        if (tracklistPanel && !tracklistPanel.classList.contains('hidden') && id) {
            const isSavedStill = JSON.parse(localStorage.getItem('groovecmd_saved_playlists') || '[]').some(p => p.id === id);
            if (!isSavedStill && !currentImportedPlaylist) {
                hidePlaylistTracklist();
            }
        }
    }

    function renderSavedPlaylists() {
        const section = document.getElementById('gui-saved-playlists-section');
        const container = document.getElementById('gui-saved-playlists');
        if (!section || !container) return;
        
        const savedPlaylists = JSON.parse(localStorage.getItem('groovecmd_saved_playlists') || '[]');
        if (savedPlaylists.length === 0) {
            section.style.display = 'none';
            container.innerHTML = '';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = '';
        
        savedPlaylists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'discover-playlist-card';
            card.style.background = 'linear-gradient(135deg, #0b3c20 0%, #0d1217 100%)';
            card.onclick = () => showPlaylistTracklist(playlist.id);
            card.innerHTML = `
                <div class="playlist-card-glow" style="background: radial-gradient(circle at center, rgba(29, 185, 84, 0.15) 0%, transparent 70%);"></div>
                <div class="playlist-cover-art" style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(29, 185, 84, 0.3); flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    <img src="${playlist.image || 'logo.svg'}" alt="${playlist.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="playlist-info">
                    <h4 class="playlist-title" style="color: #fff; font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${playlist.title}</h4>
                    <p class="playlist-desc" style="font-size: 11px; opacity: 0.7; color: #a1a1aa; margin: 0; line-height: 1.3;">${playlist.desc || 'Saved Spotify Playlist'}</p>
                </div>
                <button class="playlist-delete-card-btn" onclick="event.stopPropagation(); App.toggleSaveSpotify('${playlist.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 14px; cursor: pointer; padding: 5px; opacity: 0.6; transition: opacity 0.2s; margin-left: auto;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6" title="Delete playlist">✕</button>
            `;
            container.appendChild(card);
        });
    }

    function queueDiscoverSong(song) {
        Player.addToQueue(song);
        syncGuiLists();
        Terminal.print(`  [DISCOVER] Added to queue: ${song.title}`, 'gb');
    }

    function updateResonatorRecommendations(currentSong) {
        if (!currentSong || !currentSong.genre) return;

        const recommContainer = document.getElementById('gui-resonator-recommendations');
        const relatedSongsContainer = document.getElementById('discover-related-songs');
        if (!recommContainer || !relatedSongsContainer) return;

        let related = CURATED_TRACKS.filter(s => s.genre === currentSong.genre && s.id !== currentSong.id);
        if (related.length === 0) {
            related = CURATED_TRACKS.filter(s => s.genre === currentSong.genre);
        }
        related = related.slice(0, 4);

        if (related.length === 0) {
            recommContainer.style.display = 'none';
            return;
        }

        recommContainer.style.display = 'block';
        relatedSongsContainer.innerHTML = '';

        const gradients = [
            'linear-gradient(135deg,#1e3a5f,#0d1b2a)',
            'linear-gradient(135deg,#2d1b4e,#12091f)',
            'linear-gradient(135deg,#1a3a2a,#0a1a12)',
            'linear-gradient(135deg,#3a1a1a,#1a0808)',
        ];
        related.forEach((song, idx) => {
            const card = document.createElement('div');
            card.className = 'discover-song-card';
            card.onclick = () => playDiscoverSong(song);
            const fallbackGrad = gradients[idx % gradients.length];
            card.innerHTML = `
                <div class="song-card-art">
                    <img src="${song.image}" alt="${song.title}" onerror="this.style.display='none'; this.parentElement.querySelector('.song-art-fallback').style.display='flex';">
                    <div class="song-art-fallback" style="display:none;position:absolute;inset:0;background:${fallbackGrad};align-items:center;justify-content:center;font-size:32px;">🎵</div>
                    <button class="song-play-overlay-btn" onclick="event.stopPropagation(); App.playDiscoverSong(${JSON.stringify(song).replace(/"/g, '&quot;')})">▶</button>
                </div>
                <div class="song-card-meta">
                    <div class="song-card-title" title="${song.title}">${song.title}</div>
                    <div class="song-card-artist" title="${song.artist}">${song.artist}</div>
                </div>
                <button class="song-card-queue-btn" onclick="event.stopPropagation(); App.queueDiscoverSong(${JSON.stringify(song).replace(/"/g, '&quot;')})" title="Add to Queue">＋ Queue</button>
            `;
            relatedSongsContainer.appendChild(card);
        });
    }

    function fmtTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    async function triggerGuiSearch() {
        const input = document.getElementById('gui-search-input');
        const query = input ? input.value.trim() : '';
        if (!query) return;

        // Hide scanner sections, show results
        const scannerPanel = document.getElementById('panel-scanner');
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        const resultsContainer = document.getElementById('gui-search-results');

        if (scannerPanel) {
            Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
                el.style.display = 'none';
            });
        }
        if (tracklistPanel) tracklistPanel.classList.add('hidden');
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = '<div class="gui-panel-empty-text animate-pulse">Scanning frequencies...</div>';
        }

        try {
            let songs = [];
            const provider = document.getElementById('gui-search-provider') ? document.getElementById('gui-search-provider').value : 'saavn';
            
            if (provider === 'yt') {
                try {
                    console.log('Fetching from /api/yt/search...');
                    let items = null;
                    try {
                        const r = await fetch(`/api/yt/search?q=${encodeURIComponent(query)}`);
                        if (r.ok) {
                            items = await r.json();
                        }
                    } catch (e) {
                        console.log('Local YT proxy failed:', e);
                    }
                    
                    // Fallback to direct Piped API if proxy failed or returned nothing
                    if (!items || items.error || (Array.isArray(items) && items.length === 0)) {
                        console.log('Trying Piped API fallback...');
                        const piped = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=music_songs`);
                        if (piped.ok) {
                            items = await piped.json();
                        }
                    }

                    console.log('YT Search response:', items);
                    
                    if (Array.isArray(items)) {
                        songs = items.map(v => {
                            const vId = v.videoId || v.id;
                            return {
                                id: vId,
                                title: v.title || 'Unknown Title',
                                artist: v.author || 'YouTube',
                                album: 'YouTube',
                                duration: v.lengthSeconds || 0,
                                image: vId ? `https://i.ytimg.com/vi/${vId}/hqdefault.jpg` : 'logo.svg',
                                url: `https://www.youtube.com/watch?v=${vId}`,
                                source: 'yt'
                            };
                        }).filter(s => s.id);
                    } else if (items && items.items && Array.isArray(items.items)) {
                        songs = items.items.map(v => {
                            const url = v.url || '';
                            const vId = url.includes('?v=') ? url.split('?v=')[1] : (url.includes('/watch?v=') ? url.split('/watch?v=')[1] : (v.videoId || v.id));
                            return {
                                id: vId,
                                title: v.title || 'Unknown Title',
                                artist: v.uploaderName || v.uploader || v.author || 'YouTube',
                                album: 'YouTube',
                                duration: v.duration || v.lengthSeconds || 0,
                                image: v.thumbnail || (vId ? `https://i.ytimg.com/vi/${vId}/hqdefault.jpg` : 'logo.svg'),
                                url: `https://www.youtube.com/watch?v=${vId}`,
                                source: 'yt'
                            };
                        }).filter(s => s.id);
                    } else {
                        console.log('YT search returned unexpected format:', items);
                    }
                } catch (e) {
                    console.log('YouTube failed in GUI Search entirely:', e);
                }
            } else {
                try {
                    songs = await Saavn.searchSongs(query, 12);
                } catch (e) {
                    console.log('Saavn failed in GUI Search:', e);
                }
            }

            if (!songs || songs.length === 0) {
                if (resultsContainer) {
                    resultsContainer.innerHTML = `
                        <div class="tracklist-header-banner" style="background: linear-gradient(135deg, rgba(255, 184, 108, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%); border-color: var(--primary-dim); margin-bottom: 20px; position: relative;">
                            <button class="tracklist-back-btn" onclick="App.hideGuiSearch()">✕ BACK TO FEED</button>
                            <div class="tracklist-header-content">
                                <span class="tracklist-subtitle">🔍 NO RESULTS</span>
                                <h2 class="tracklist-title">Frequencies Empty</h2>
                                <p class="tracklist-desc">No frequencies matched "${query}" on ${provider === 'yt' ? 'YouTube' : 'JioSaavn'}. Try another query or source.</p>
                            </div>
                        </div>
                    `;
                }
                return;
            }

            window.guiLastResults = songs;

            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="tracklist-header-banner" style="background: linear-gradient(135deg, rgba(0, 255, 65, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%); border-color: var(--primary-dim); margin-bottom: 20px; position: relative;">
                        <button class="tracklist-back-btn" onclick="App.hideGuiSearch()">✕ CLEAR SEARCH</button>
                        <div class="tracklist-header-content">
                            <span class="tracklist-subtitle">🔍 SEARCH RESULTS</span>
                            <h2 class="tracklist-title">Frequencies Matched</h2>
                            <p class="tracklist-desc">Scanned ${provider === 'yt' ? 'YouTube' : 'JioSaavn'} for "${query}"</p>
                        </div>
                    </div>
                    <div class="discover-songs-grid" id="gui-search-songs-grid"></div>
                `;

                const grid = document.getElementById('gui-search-songs-grid');
                if (grid) {
                    const gradients = [
                        'linear-gradient(135deg,#1e3a5f,#0d1b2a)',
                        'linear-gradient(135deg,#2d1b4e,#12091f)',
                        'linear-gradient(135deg,#1a3a2a,#0a1a12)',
                        'linear-gradient(135deg,#3a1a1a,#1a0808)'
                    ];
                    songs.forEach((song, idx) => {
                        const card = document.createElement('div');
                        card.className = 'discover-song-card';
                        
                        const fallbackGrad = gradients[idx % gradients.length];
                        
                        card.innerHTML = `
                            <div class="song-card-art">
                                <img src="${song.image || 'logo.svg'}" alt="${song.title}" onerror="this.style.display='none'; this.parentElement.querySelector('.song-art-fallback').style.display='flex';">
                                <div class="song-art-fallback" style="display:none;position:absolute;inset:0;background:${fallbackGrad};align-items:center;justify-content:center;font-size:32px;">🎵</div>
                                <button class="song-play-overlay-btn" onclick="event.stopPropagation(); App.playGuiSearchResult(${idx})">▶</button>
                            </div>
                            <div class="song-card-meta">
                                <div class="song-card-title" title="${song.title}">${song.title}</div>
                                <div class="song-card-artist" title="${song.artist}">${song.artist}</div>
                            </div>
                            <button class="song-card-queue-btn" onclick="event.stopPropagation(); App.queueGuiSearchResult(${idx})" title="Add to Queue">＋ Queue</button>
                        `;
                        grid.appendChild(card);
                    });
                }
            }

        } catch (err) {
            console.error('GUI Search error:', err);
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="tracklist-header-banner" style="background: linear-gradient(135deg, rgba(255, 77, 77, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%); border-color: var(--red); margin-bottom: 20px; position: relative;">
                        <button class="tracklist-back-btn" onclick="App.hideGuiSearch()">✕ BACK TO FEED</button>
                        <div class="tracklist-header-content">
                            <span class="tracklist-subtitle" style="color: var(--red);">⚠️ SCAN ERROR</span>
                            <h2 class="tracklist-title" style="color: var(--red);">Scan Failed</h2>
                            <p class="tracklist-desc">${err.message}</p>
                        </div>
                    </div>
                `;
            }
        }
    }
    async function importSpotifyPlaylist() {
        const input = document.getElementById('gui-spotify-input');
        const query = input ? input.value.trim() : '';
        if (!query) return;

        const scannerPanel = document.getElementById('panel-scanner');
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        const resultsContainer = document.getElementById('gui-search-results');

        if (scannerPanel) {
            Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
                el.style.display = 'none';
            });
        }
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (tracklistPanel) {
            tracklistPanel.classList.remove('hidden');
            tracklistPanel.innerHTML = '<div class="gui-panel-empty-text animate-pulse">⚡ Intercepting Spotify frequency... Sourcing metadata...</div>';
        }

        Terminal.print(`  [SPOTIFY IMPORT] Initializing connection to Spotify embed Proxy...`, 'c');

        try {
            // Parse ID
            let playlistId = query;
            const match = query.match(/(?:playlist\/|playlist:)([a-zA-Z0-9]{22})/);
            if (match) {
                playlistId = match[1];
            }

            const response = await fetch(`/api/spotify/playlist?id=${encodeURIComponent(playlistId)}`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server status ${response.status}`);
            }

            const data = await response.json();
            if (!data.tracks || data.tracks.length === 0) {
                throw new Error("No tracks found in playlist (it might be private or empty).");
            }

            Terminal.print(`  [SPOTIFY IMPORT] Successfully imported playlist: "${data.title}"`, 'gb');
            Terminal.print(`  [SPOTIFY IMPORT] Sourced metadata for ${data.tracks.length} tracks.`, 'c');

            data.id = playlistId;
            currentImportedPlaylist = data;

            // Render beautiful tracklist in the panel
            let rowsHTML = '';
            data.tracks.forEach((song, idx) => {
                const songJson = JSON.stringify(song).replace(/"/g, '&quot;');
                rowsHTML += `
                    <div class="cassette-list-item">
                        <span class="item-num">${String(idx + 1).padStart(2, '0')}.</span>
                        <div class="item-info">
                            <span class="item-title" title="${song.title}">${song.title}</span>
                            <span class="item-artist" title="${song.artist}">${song.artist}</span>
                        </div>
                        <span class="item-src-badge tag-spotify" style="background: #1db954; color: #000; font-weight: bold; border-radius: 4px; padding: 2px 6px; font-size: 10px; margin-right: 10px;">SPOTIFY</span>
                        <button class="action-btn-play" onclick="App.playDiscoverSong(${songJson}, App.getCurrentImportedTracks())">▶ Play</button>
                        <button class="action-btn-queue" onclick="App.queueDiscoverSong(${songJson})">＋ Queue</button>
                    </div>
                `;
            });

            const saved = JSON.parse(localStorage.getItem('groovecmd_saved_playlists') || '[]');
            const isSaved = saved.some(p => p.id === playlistId);
            const saveBtnText = isSaved ? '✕ REMOVE PLAYLIST' : '💾 SAVE PLAYLIST';
            const saveBtnBg = isSaved ? '#ef4444' : 'rgba(255,255,255,0.1)';
            const saveBtnBorder = isSaved ? '#ef4444' : 'rgba(255,255,255,0.3)';

            tracklistPanel.innerHTML = `
                <div class="tracklist-header-banner" style="background: linear-gradient(135deg, #1db954 0%, #12181f 100%); border-color: #1db954; position: relative; display: flex; align-items: center; gap: 15px; padding: 15px;">
                    <button class="tracklist-back-btn" onclick="App.hidePlaylistTracklist()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 4px;">← BACK</button>
                    <div class="tracklist-cover-art" style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.5); flex-shrink: 0;">
                        <img src="${data.image || 'logo.svg'}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="tracklist-header-content" style="flex: 1;">
                        <span class="tracklist-subtitle" style="color: #1db954; font-weight: bold; letter-spacing: 2px; font-size: 11px;">⚡ SPOTIFY PLAYLIST IMPORTER</span>
                        <h2 class="tracklist-title" style="margin: 4px 0 2px 0; font-size: 18px; color: #fff;">${data.title}</h2>
                        <p class="tracklist-desc" style="opacity: 0.8; font-size: 12px; line-height: 1.4; color: #a1a1aa; margin: 0;">${data.description || 'Imported tracks from public playlist embed.'}</p>
                        <div class="tracklist-actions" style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                            <button class="gui-btn-primary" onclick="App.playAllTracks(App.getCurrentImportedTracks())" style="background: #1db954; color: #000; font-weight: bold; border: none; padding: 6px 15px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s ease;">
                                <span>▶</span> PLAY ALL
                            </button>
                            <button id="btn-save-playlist" class="gui-btn-secondary" onclick="App.toggleSaveSpotify('${playlistId}')" style="background: ${saveBtnBg}; color: #fff; border: 1px solid ${saveBtnBorder}; padding: 6px 15px; border-radius: 20px; font-size: 12px; cursor: pointer;">
                                ${saveBtnText}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="cassette-list">
                    ${rowsHTML}
                </div>
            `;

        } catch (err) {
            console.error('Spotify import error:', err);
            Terminal.print(`  [ERROR] Spotify playlist import failed: ${err.message}`, 'r');
            if (tracklistPanel) {
                tracklistPanel.innerHTML = `
                    <div class="tracklist-header-banner" style="background: linear-gradient(135deg, rgba(255, 77, 77, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%); border-color: var(--red); margin-bottom: 20px; position: relative;">
                        <button class="tracklist-back-btn" onclick="App.hidePlaylistTracklist()">✕ BACK TO HOME</button>
                        <div class="tracklist-header-content">
                            <span class="tracklist-subtitle" style="color: var(--red);">⚠️ IMPORT ERROR</span>
                            <h2 class="tracklist-title" style="color: var(--red);">Import Failed</h2>
                            <p class="tracklist-desc">${err.message}</p>
                        </div>
                    </div>
                `;
            }
        }
    }
    function hideGuiSearch() {
        const scannerPanel = document.getElementById('panel-scanner');
        const resultsContainer = document.getElementById('gui-search-results');
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        const searchInput = document.getElementById('gui-search-input');
        if (searchInput) searchInput.value = '';
        if (scannerPanel) {
            Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
                el.style.display = '';
            });
        }
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (tracklistPanel) tracklistPanel.classList.add('hidden');
    }

    function playGuiSearchResult(idx) {
        if (!window.guiLastResults || !window.guiLastResults[idx]) return;
        const song = window.guiLastResults[idx];
        Player.setActivePlaylistTracks(null);
        Player.playSong(song);
        Terminal.print(`  [GUI] Playing: ${song.title}`, 'gb');
    }

    function queueGuiSearchResult(idx) {
        if (!window.guiLastResults || !window.guiLastResults[idx]) return;
        const song = window.guiLastResults[idx];
        Player.addToQueue(song);
        syncGuiLists();
        Terminal.print(`  [GUI] Queued: ${song.title}`, 'gb');
    }

    function syncGuiLists() {
        const playerState = Player.getState();
        
        // 1. Queue Cassettes
        const queueContainer = document.getElementById('gui-queue-list');
        if (queueContainer) {
            if (playerState.queue.length === 0) {
                queueContainer.innerHTML = '<div class="gui-panel-empty-text">Queue is empty.</div>';
            } else {
                queueContainer.innerHTML = '';
                playerState.queue.forEach((song, idx) => {
                    const row = document.createElement('div');
                    row.className = 'cassette-list-item';
                    row.innerHTML = `
                        <span class="item-num">${String(idx + 1).padStart(2, '0')}.</span>
                        <div class="item-info">
                            <span class="item-title" title="${song.title}">${song.title}</span>
                            <span class="item-artist" title="${song.artist}">${song.artist}</span>
                        </div>
                        <span class="item-src-badge ${song.source === 'yt' ? 'tag-yt' : 'tag-saavn'}">${song.source === 'yt' ? 'YT' : 'SV'}</span>
                        <span class="item-duration">${fmtTime(song.duration)}</span>
                        <button class="item-remove-btn" onclick="App.removeFromQueue(${idx})" title="Remove from queue">✕</button>
                    `;
                    queueContainer.appendChild(row);
                });
            }
        }

        // 2. Liked Tapes Grid
        const likedContainer = document.getElementById('gui-liked-list');
        if (likedContainer) {
            if (playerState.liked.length === 0) {
                likedContainer.innerHTML = '<div class="gui-panel-empty-text">No saved tapes in the vault.</div>';
            } else {
                likedContainer.innerHTML = '';
                playerState.liked.forEach((song, idx) => {
                    const card = document.createElement('div');
                    card.className = 'mini-cassette';
                    card.innerHTML = `
                        <div class="mini-label">
                            <div class="mini-title" title="${song.title}">${song.title}</div>
                            <div class="mini-artist" title="${song.artist}">${song.artist}</div>
                        </div>
                        <div class="mini-meta">
                            <button class="mini-play-btn" onclick="App.playLikedSong(${idx})">▶</button>
                            <button class="mini-remove-btn" onclick="App.unlikeSong(${idx})">✕</button>
                        </div>
                    `;
                    likedContainer.appendChild(card);
                });
            }
        }

        // 3. Compact Sidebar Queue List
        const sidebarQueueContainer = document.getElementById('gui-sidebar-queue-list');
        if (sidebarQueueContainer) {
            if (playerState.queue.length === 0) {
                sidebarQueueContainer.innerHTML = '<div class="gui-panel-empty-text">No upcoming tracks</div>';
            } else {
                sidebarQueueContainer.innerHTML = '';
                playerState.queue.forEach((song, idx) => {
                    const row = document.createElement('div');
                    row.className = 'compact-queue-item';
                    const songJson = JSON.stringify(song).replace(/"/g, '&quot;');
                    row.innerHTML = `
                        <div class="compact-queue-img-wrap" onclick="App.playFromQueue(${idx})">
                            <img src="${song.image || 'logo.svg'}" alt="${song.title}">
                            <div class="compact-queue-play-overlay">▶</div>
                        </div>
                        <div class="compact-queue-details" onclick="App.playFromQueue(${idx})">
                            <div class="compact-queue-title" title="${song.title}">${song.title}</div>
                            <div class="compact-queue-artist" title="${song.artist}">${song.artist}</div>
                        </div>
                        <div class="compact-queue-right">
                            <span class="compact-queue-duration">${fmtTime(song.duration)}</span>
                            <button class="compact-queue-remove-btn" onclick="App.removeFromQueue(${idx})" title="Remove">✕</button>
                        </div>
                    `;
                    sidebarQueueContainer.appendChild(row);
                });
            }
        }
    }

    function removeFromQueue(idx) {
        const playerState = Player.getState();
        if (playerState.queue[idx]) {
            const removed = playerState.queue.splice(idx, 1)[0];
            Terminal.print(`  [GUI] Removed from queue: ${removed.title}`, 'y');
            syncGuiLists();
        }
     }

    function playLikedSong(idx) {
        const playerState = Player.getState();
        if (playerState.liked[idx]) {
            Player.setActivePlaylistTracks(null);
            Player.playSong(playerState.liked[idx]);
        }
    }

    function playFromQueue(idx) {
        if (Player.playFromQueue) {
            Player.playFromQueue(idx);
        }
    }

    function unlikeSong(idx) {
        const playerState = Player.getState();
        if (playerState.liked[idx]) {
            const removed = playerState.liked.splice(idx, 1)[0];
            localStorage.setItem('groovecmd_liked', JSON.stringify(playerState.liked));
            Terminal.print(`  [GUI] Unliked: ${removed.title}`, 'r');
            syncGuiLists();
            
            if (playerState.current && playerState.current.id === removed.id) {
                const heartBtn = document.getElementById('gui-btn-like');
                if (heartBtn) heartBtn.classList.remove('liked');
            }
        }
    }

    function switchGuiTab(tabName) {
        activeTab = tabName;
        
        // Hide overlays to prevent stacking over other tabs
        const tracklistPanel = document.getElementById('gui-playlist-tracklist');
        const searchResults = document.getElementById('gui-search-results');
        if (tracklistPanel) tracklistPanel.classList.add('hidden');
        if (searchResults) searchResults.classList.add('hidden');
        
        // Restore scanner original content if returning to the Main tab
        if (tabName === 'scanner') {
            const scannerPanel = document.getElementById('panel-scanner');
            if (scannerPanel) {
                Array.from(scannerPanel.querySelectorAll('.featured-hero-banner, .discover-section')).forEach(el => {
                    el.style.display = '';
                });
            }
        }
        
        // Sync sidebar nav items active state
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            const onclickAttr = item.getAttribute('onclick') || '';
            if (onclickAttr.includes(`'${tabName}'`)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        document.querySelectorAll('.hud-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('.gui-tab-panel').forEach(panel => {
            if (panel.id === `panel-${tabName}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        if (tabName === 'vault') {
            syncGuiLists();
        }
    }

    let currentLyrics = [];
    async function fetchLyrics(song) {
        currentLyrics = [];
        const container = document.getElementById('gui-lyrics-container');
        if (!container) return;
        
        container.innerHTML = '<div class="gui-panel-empty-text animate-pulse">Decrypting lyrics stream...</div>';

        if (song.source === 'saavn') {
            const urls = [
                `https://saavnapi-nine.vercel.app/lyrics/?query=${song.id}`,
                `https://jiosaavn-api-2.vercel.app/songs/${song.id}/lyrics`
            ];

            for (const url of urls) {
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        let text = '';
                        if (data.status === 'SUCCESS' && data.data?.lyrics) {
                            text = data.data.lyrics;
                        } else if (data.lyrics) {
                            text = data.lyrics;
                        }
                        
                        if (text) {
                            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            if (lines.length > 0) {
                                currentLyrics = lines;
                                renderLyrics(lines);
                                return;
                            }
                        }
                    }
                } catch (e) {
                    console.log('Lyrics fetch failed for', url, e);
                }
            }
        }

        generateSciFiLyrics(song);
    }

    function renderLyrics(lines) {
        const container = document.getElementById('gui-lyrics-container');
        if (!container) return;
        
        container.innerHTML = '';
        lines.forEach((line, idx) => {
            const el = document.createElement('div');
            el.className = 'lyric-line';
            el.id = `lyric-line-${idx}`;
            el.textContent = line;
            container.appendChild(el);
        });
    }

    function generateSciFiLyrics(song) {
        const title = song.title.toUpperCase();
        const artist = song.artist.toUpperCase();
        const techJargon = [
            `DECODER_STATUS: ONLINE`,
            `STREAM_SOURCE: ${song.source.toUpperCase()}`,
            `AUDIO_FREQ_BAND: INTENSITY_NORMALIZED`,
            `MATRIX_HASH: 0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`,
            `SIGNAL_NOISE_RATIO: 94.2dB`,
            `BITRATE_LOCK: ${localStorage.getItem('groovecmd_quality') || '160KBPS'}`,
            `CYBERDECK_INSTRUMENT_DECODER: SYNCED`,
            `[SCANNER] COMPILING WAVELENGTH DATA...`,
            `[REACTOR] TURNTABLE DISC STABLE AT 33 RPM`,
            `[MIXER] ANALOG SIGNAL ROUTING GRAPH COMPLETED`,
            `[VAULT] PLAYBACK LOGGER ENGAGED`,
            `[STATUS] ENJOY THE GROOVE...`
        ];

        const lines = [
            `>>> INITIALIZING CYBERNETIC LYRICS DECODER <<<`,
            `SONG_TITLE: ${title}`,
            `SONG_ARTIST: ${artist}`,
            `----------------------------------------`
        ];

        for (let i = 0; i < 20; i++) {
            lines.push(`[LOG_${i.toString().padStart(2,'0')}] ${techJargon[i % techJargon.length]}`);
            lines.push(`>> SYNCHRONIZING DECODER TIMELINE SIGNAL...`);
        }

        currentLyrics = lines;
        renderLyrics(lines);
    }

    function updateLyricsHighlight(currentTime, duration) {
        if (currentLyrics.length === 0) return;
        const container = document.getElementById('gui-lyrics-container');
        if (!container) return;

        const pct = currentTime / (duration || 1);
        const activeIdx = Math.min(currentLyrics.length - 1, Math.floor(pct * currentLyrics.length));

        for (let i = 0; i < currentLyrics.length; i++) {
            const line = document.getElementById(`lyric-line-${i}`);
            if (line) {
                if (i === activeIdx) {
                    line.classList.add('active');
                    const topPos = line.offsetTop - container.offsetHeight / 2 + line.offsetHeight / 2;
                    container.scrollTo({ top: topPos, behavior: 'smooth' });
                } else {
                    line.classList.remove('active');
                }
            }
        }
    }

    function syncSlidersWithPlayer() {
        const bassVal = parseFloat(localStorage.getItem('groovecmd_bass') || '0');
        const trebleVal = parseFloat(localStorage.getItem('groovecmd_treble') || '0');
        const reverbVal = parseFloat(localStorage.getItem('groovecmd_reverb') || '0');
        const boostVal = parseFloat(localStorage.getItem('groovecmd_boost') || '0');

        const sliders = {
            bass: { el: document.getElementById('gui-slider-bass'), label: document.getElementById('gui-val-bass'), unit: 'dB', sign: true },
            treble: { el: document.getElementById('gui-slider-treble'), label: document.getElementById('gui-val-treble'), unit: 'dB', sign: true },
            reverb: { el: document.getElementById('gui-slider-reverb'), label: document.getElementById('gui-val-reverb'), unit: '%', sign: false },
            boost: { el: document.getElementById('gui-slider-boost'), label: document.getElementById('gui-val-boost'), unit: 'dB', sign: true }
        };

        const vals = { bass: bassVal, treble: trebleVal, reverb: reverbVal, boost: boostVal };

        Object.keys(sliders).forEach(key => {
            const { el, label, unit, sign } = sliders[key];
            if (el) {
                el.value = vals[key];
                if (label) {
                    const formatted = (sign && vals[key] > 0 ? '+' : '') + vals[key] + unit;
                    label.textContent = formatted;
                }
            }
        });
    }

    function setupMixerSliders() {
        const sliders = {
            bass: { id: 'gui-slider-bass', valId: 'gui-val-bass', setter: Player.setBass, unit: 'dB', sign: true },
            treble: { id: 'gui-slider-treble', valId: 'gui-val-treble', setter: Player.setTreble, unit: 'dB', sign: true },
            reverb: { id: 'gui-slider-reverb', valId: 'gui-val-reverb', setter: Player.setReverb, unit: '%', sign: false },
            boost: { id: 'gui-slider-boost', valId: 'gui-val-boost', setter: Player.setBoost, unit: 'dB', sign: true }
        };

        Object.keys(sliders).forEach(key => {
            const config = sliders[key];
            const el = document.getElementById(config.id);
            const valEl = document.getElementById(config.valId);

            if (el) {
                el.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    config.setter(val);
                    
                    if (valEl) {
                        const formatted = (config.sign && val > 0 ? '+' : '') + val + config.unit;
                        valEl.textContent = formatted;
                    }

                    const terminalKnob = document.getElementById(`knob-${key}`);
                    if (terminalKnob && window.updateKnobUI) {
                        window.updateKnobUI(terminalKnob, val);
                    }
                });
            }
        });
    }

    function setupSeekerListener() {
        const seekSlider = document.getElementById('gui-seek-slider');
        if (seekSlider) {
            seekSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                const progressFill = document.getElementById('gui-seek-progress-fill');
                if (progressFill && seekSlider.max > 0) {
                    const pct = (val / seekSlider.max) * 100;
                    progressFill.style.width = pct + '%';
                }
            });
            seekSlider.addEventListener('change', (e) => {
                const val = parseFloat(e.target.value);
                Player.jumpTo(val);
            });
        }
    }

    function syncGuiPlayingUI() {
        const playerState = Player.getState();
        if (!playerState.current) return;

        const titleEl = document.getElementById('gui-song-title');
        const artistEl = document.getElementById('gui-song-artist');
        const badgeEl = document.getElementById('gui-source-badge');
        
        if (titleEl) titleEl.textContent = playerState.current.title;
        if (artistEl) artistEl.textContent = playerState.current.artist;
        if (badgeEl) badgeEl.textContent = playerState.source.toUpperCase();

        // Sync Now Playing Right Sidebar details
        const sbTitleEl = document.getElementById('gui-sidebar-song-title');
        const sbArtistEl = document.getElementById('gui-sidebar-song-artist');
        const sbBadgeEl = document.getElementById('gui-sidebar-source-badge');
        
        if (sbTitleEl) sbTitleEl.textContent = playerState.current.title;
        if (sbArtistEl) sbArtistEl.textContent = playerState.current.artist;
        if (sbBadgeEl) sbBadgeEl.textContent = playerState.source.toUpperCase();

        const playBtn = document.getElementById('gui-btn-play');
        if (playBtn) {
            playBtn.textContent = playerState.playing ? '⏸' : '▶';
        }

        const vinyl = document.getElementById('gui-sidebar-vinyl-disc');
        if (vinyl) {
            if (playerState.playing) vinyl.classList.add('playing');
            else vinyl.classList.remove('playing');
        }

        const artImg = document.getElementById('gui-album-art');
        if (artImg) {
            const artwork = playerState.current.image || 'logo.svg';
            if (artImg.getAttribute('src') !== artwork) {
                artImg.setAttribute('src', artwork);
            }
        }

        const sbArtImg = document.getElementById('gui-sidebar-album-art');
        if (sbArtImg) {
            const artwork = playerState.current.image || 'logo.svg';
            if (sbArtImg.getAttribute('src') !== artwork) {
                sbArtImg.setAttribute('src', artwork);
            }
        }

        let cur = 0, dur = 0;
        const audio = document.getElementById('audio-el');
        if (playerState.source === 'yt' && window.ytReady && window.ytPlayer && window.ytPlayer.getCurrentTime) {
            cur = window.ytPlayer.getCurrentTime();
            dur = window.ytPlayer.getDuration();
        } else if (audio) {
            cur = audio.currentTime;
            dur = audio.duration || playerState.current.duration || 0;
        }

        const seekSlider = document.getElementById('gui-seek-slider');
        const progressFill = document.getElementById('gui-seek-progress-fill');
        const timeCurrent = document.getElementById('gui-time-current');
        const timeTotal = document.getElementById('gui-time-total');

        if (timeCurrent) timeCurrent.textContent = fmtTime(cur);
        if (timeTotal) timeTotal.textContent = fmtTime(dur);

        if (seekSlider && dur > 0) {
            seekSlider.max = dur;
            seekSlider.value = cur;
        }
        
        if (progressFill && dur > 0) {
            const pct = (cur / dur) * 100;
            progressFill.style.width = pct + '%';
        }

        const volSlider = document.getElementById('gui-vol-slider');
        const volVal = document.getElementById('gui-vol-val');
        if (volSlider) volSlider.value = playerState.volume * 100;
        if (volVal) volVal.textContent = Math.round(playerState.volume * 100) + '%';

        const shufBtn = document.getElementById('gui-btn-shuf');
        const repBtn = document.getElementById('gui-btn-rep');
        
        if (shufBtn) {
            if (playerState.shuffle) shufBtn.classList.add('active');
            else shufBtn.classList.remove('active');
        }

        if (repBtn) {
            if (playerState.repeat !== 'off') {
                repBtn.classList.add('active');
                repBtn.textContent = playerState.repeat === 'one' ? '🔂' : '🔁';
            } else {
                repBtn.classList.remove('active');
                repBtn.textContent = '🔁';
            }
        }

        const heartBtn = document.getElementById('gui-btn-like');
        if (heartBtn) {
            const isLiked = playerState.liked.some(s => s.id === playerState.current.id);
            if (isLiked) {
                heartBtn.classList.add('liked');
                heartBtn.textContent = '❤️';
            } else {
                heartBtn.classList.remove('liked');
                heartBtn.textContent = '🖤';
            }
        }

        const autoBtn = document.getElementById('gui-btn-autoplay');
        if (autoBtn) {
            if (playerState.autoplay) {
                autoBtn.classList.add('active');
                autoBtn.textContent = 'RADIO: ON';
            } else {
                autoBtn.classList.remove('active');
                autoBtn.textContent = 'RADIO: OFF';
            }
        }

        updateLyricsHighlight(cur, dur);

        if (window.guiLastSongId !== playerState.current.id) {
            window.guiLastSongId = playerState.current.id;
            fetchLyrics(playerState.current);

            // Dynamic related recommendations update on song change
            let matchedSong = CURATED_TRACKS.find(s => s.id === playerState.current.id);
            if (!matchedSong) {
                const genre = (playerState.source === 'yt') ? 'cyberpunk' : 'synthwave';
                matchedSong = { id: playerState.current.id, genre: genre };
            }
            updateResonatorRecommendations(matchedSong);
        }
    }

    function playFeaturedSong() {
        const song = {
            id: 'cW8V0B3tKSA',
            title: 'What Was I Made For?',
            artist: 'Billie Eilish',
            album: 'Barbie The Album',
            duration: 222,
            source: 'yt',
            genre: 'pop',
            image: 'https://i.ytimg.com/vi/cW8V0B3tKSA/hqdefault.jpg'
        };
        Player.setActivePlaylistTracks(null);
        Player.playSong(song);
        Terminal.print(`  [HERO] Sourcing Billie Eilish's "What Was I Made For?" on YouTube... Playing now.`, 'gb');
    }

    function init() {
        setupSeekerListener();
        setupMixerSliders();

        const searchInput = document.getElementById('gui-search-input');
        const searchBtn = document.getElementById('gui-search-btn');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') triggerGuiSearch();
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', triggerGuiSearch);
        }

        // Initialize zero-search Discover Cockpit Home
        renderDiscoverHome();

        // Check startup auto-boot choices
        const isRemember = localStorage.getItem('groovecmd_remember_choice') !== 'false';
        const bootChoice = localStorage.getItem('groovecmd_boot_choice');
        const bootSelector = document.getElementById('boot-selector');

        syncPreferencesUI();

        if (isRemember && (bootChoice === 'terminal' || bootChoice === 'gui')) {
            if (bootSelector) {
                bootSelector.style.display = 'none';
                bootSelector.classList.add('fade-out');
            }
            setMode(bootChoice, true);
        } else {
            if (bootSelector) bootSelector.style.display = 'flex';
            setMode('terminal', true);
        }

        syncSlidersWithPlayer();
    }

    return {
        init, setMode, bootToMode, resetBootChoice, syncGuiPlayingUI, switchGuiTab,
        triggerGuiSearch, playGuiSearchResult, queueGuiSearchResult,
        removeFromQueue, playLikedSong, unlikeSong, syncGuiLists,
        renderDiscoverHome, showPlaylistTracklist, hidePlaylistTracklist: () => hidePlaylistTracklist(),
        playDiscoverSong, queueDiscoverSong, toggleRememberPreference,
        hideGuiSearch: () => hideGuiSearch(), importSpotifyPlaylist,
        toggleSaveSpotify, playAllTracks, getCurrentImportedTracks, renderSavedPlaylists,
        syncSlidersWithPlayer: () => syncSlidersWithPlayer(), playFeaturedSong
    };
})();

// Assign to window for global access
window.App = App;

// Unified DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize cockpit controller App
    App.init();

    // 2. Mobile EQ side panel drawer slider handler
    const eqBtn = document.getElementById('eq-toggle-btn');
    const sidePanel = document.getElementById('side-panel');
    if (eqBtn && sidePanel) {
        eqBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidePanel.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if (sidePanel.classList.contains('open') && !sidePanel.contains(e.target) && !eqBtn.contains(e.target)) {
                sidePanel.classList.remove('open');
            }
        });
    }

    // 3. Immersive hardware keyboard shortcut listener
    document.addEventListener('keydown', (e) => {
        const bootSelector = document.getElementById('boot-selector');
        const isBootVisible = bootSelector && !bootSelector.classList.contains('fade-out') && bootSelector.style.display !== 'none';
        
        if (isBootVisible) {
            if (e.key.toLowerCase() === 't') {
                App.bootToMode('terminal');
            } else if (e.key.toLowerCase() === 'g') {
                App.bootToMode('gui');
            }
        } else {
            // CTRL + ALT + T/G switching
            if (e.ctrlKey && e.altKey) {
                if (e.key.toLowerCase() === 't') {
                    App.setMode('terminal');
                    e.preventDefault();
                } else if (e.key.toLowerCase() === 'g') {
                    App.setMode('gui');
                    e.preventDefault();
                }
            }
        }
    });
});
