/* =============================================
   terminal.js — Terminal UI engine
   ============================================= */

const Terminal = (() => {
    const output  = document.getElementById('output');
    const input   = document.getElementById('cmd-input');
    const history = [];
    let histIdx   = -1;

    /* ── Autoplay Unlock ── */
    const unlockAudio = () => {
        const audio = document.getElementById('audio-el');
        if (audio) {
            audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
            audio.play().then(() => audio.pause()).catch(() => {});
        }
        if (typeof Player !== 'undefined' && Player.initEqualizer) {
            Player.initEqualizer();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    function print(text, cls = 'g') {
        const div = document.createElement('div');
        div.className = `ln ${cls}`;
        div.textContent = text;
        output.appendChild(div);
        scrollToBottom();
    }

    function printHTML(html, cls = 'g') {
        const div = document.createElement('div');
        div.className = `ln ${cls}`;
        div.innerHTML = html;
        output.appendChild(div);
        scrollToBottom();
    }

    function clear() {
        output.innerHTML = '';
    }

    function scrollToBottom() {
        const area = document.getElementById('output-area');
        area.scrollTop = area.scrollHeight;
    }

    function echoCommand(cmd) {
        print(`groovecmd@music:~$ ${cmd}`, 'cmd');
    }

    function focus() { input.focus(); }

    /* ── Command history navigation ── */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                input.value = history[history.length - 1 - histIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                input.value = history[history.length - 1 - histIdx];
            } else {
                histIdx = -1;
                input.value = '';
            }
        } else if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (!cmd) return;
            history.push(cmd);
            histIdx = -1;
            echoCommand(cmd);
            input.value = '';
            Commands.handle(cmd);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Basic tab autocomplete
            const val = input.value.toLowerCase();
            const cmds = ['search','play','yt','next','prev','fwd','back','jump','seek','pause','resume','vol','shuffle','repeat','like','liked','np','queue','add','clear','help','quit'];
            const match = cmds.find(c => c.startsWith(val));
            if (match) input.value = match + ' ';
        }
    });

    /* Always refocus input on body click */
    document.addEventListener('click', () => focus());

    return { print, printHTML, clear, scrollToBottom, focus };
})();
