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

    function initFlicker() {
        // Retro theme uses CSS animations primarily, no extra elements needed
    }

    return { set, current: () => currentTheme };
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
document.addEventListener('DOMContentLoaded', () => {
    const eqBtn = document.getElementById('eq-toggle-btn');
    const sidePanel = document.getElementById('side-panel');
    if (eqBtn && sidePanel) {
        eqBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidePanel.classList.toggle('open');
        });
        
        // Close if tapped outside
        document.addEventListener('click', (e) => {
            if (sidePanel.classList.contains('open') && !sidePanel.contains(e.target) && !eqBtn.contains(e.target)) {
                sidePanel.classList.remove('open');
            }
        });
    }
});
