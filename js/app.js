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
        
        // Background animations disabled to prevent obscuring content
        // if (theme === 'matrix') initMatrix();
        // if (theme === 'nebula') initStars();
        if (theme === 'cyber') initWaves();
        if (theme === 'retro') initFlicker();
    }

    function initMatrix() {
        const chars = '01♪♫♩♬';
        for (let i = 0; i < 25; i++) {
            const col = document.createElement('div');
            col.className = 'matrix-column';
            col.style.left = Math.random() * 100 + 'vw';
            col.style.animationDuration = Math.random() * 3 + 2 + 's';
            col.style.animationDelay = Math.random() * 5 + 's';
            col.textContent = Array(15).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            bg.appendChild(col);
        }
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
