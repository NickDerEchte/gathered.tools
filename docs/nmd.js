// --- ICONS ---
const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const ICON_FULL = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
const ICON_EXIT = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
const ICON_VOL_HIGH = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
const ICON_VOL_MUTE = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;

// --- RESIZER ---
const resizer = document.getElementById('resizer');
const editorPane = document.getElementById('editor-pane');
let isResizing = false;
resizer.addEventListener('mousedown', (e) => { isResizing = true; resizer.classList.add('active'); document.body.style.cursor = 'col-resize'; e.preventDefault(); });
document.addEventListener('mousemove', (e) => { if (isResizing) { const w = (e.clientX / document.body.clientWidth) * 100; if (w > 10 && w < 90) editorPane.style.width = `${w}%`; } });
document.addEventListener('mouseup', () => { isResizing = false; resizer.classList.remove('active'); document.body.style.cursor = 'default'; });

// --- SYNTAX HIGHLIGHTER ---
function highlightSyntax(code, lang) {
lang = (lang || '').toLowerCase();
const tokens = [];
const save = (html) => { tokens.push(html); return `%%%TOK_${tokens.length - 1}%%%`; };

if (lang === 'html' || lang === 'xml') {
    code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (m) => save(`<span class="tok-com">${m}</span>`));
    code = code.replace(/(["'])(.*?)\1/g, (m) => save(`<span class="tok-str">${m}</span>`));
    code = code.replace(/(&lt;\/?)(\w+)/g, (m, p, n) => p + save(`<span class="tok-tag">${n}</span>`));
    code = code.replace(/(\s)([a-z\-]+)(=)/g, (m, s, n, e) => s + save(`<span class="tok-attr">${n}</span>`) + e);
} else if (lang === 'css') {
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => save(`<span class="tok-com">${m}</span>`));
    code = code.replace(/(['"])(.*?)\1/g, (m) => save(`<span class="tok-str">${m}</span>`));
    code = code.replace(/([a-z\-]+)(?=:)/g, (m) => save(`<span class="tok-prop">${m}</span>`));
// CHANGED: specifically check for JS identifiers instead of using a generic 'else'
} else if (lang === 'js' || lang === 'javascript') {
    code = code.replace(/(\/\/.*)/g, (m) => save(`<span class="tok-com">${m}</span>`));
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => save(`<span class="tok-com">${m}</span>`));
    code = code.replace(/(['"`])(.*?)\1/g, (m) => save(`<span class="tok-str">${m}</span>`));
    const kws = "const|let|var|function|return|if|else|for|while|class|import|from|async|await";
    code = code.replace(new RegExp(`\\b(${kws})\\b`, 'g'), (m) => save(`<span class="tok-kwd">${m}</span>`));
    code = code.replace(/\b(\d+)\b/g, (m) => save(`<span class="tok-num">${m}</span>`));
    code = code.replace(/(\w+)(?=\()/g, (m) => save(`<span class="tok-fn">${m}</span>`));
}

// If lang was unknown, 'tokens' is empty and this loop does nothing
tokens.forEach((token, i) => { code = code.replace(`%%%TOK_${i}%%%`, token); });
return code;
}

// --- UTILS ---
window.copyCode = function(encodedText, btn) {
    const text = decodeURIComponent(encodedText);
    const showSuccess = () => { const original = btn.innerText; btn.innerText = "Copied!"; setTimeout(() => btn.innerText = original, 2000); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(showSuccess).catch(() => fallbackCopy(text)); } else { fallbackCopy(text); }
    function fallbackCopy(textToCopy) {
        const textArea = document.createElement("textarea"); textArea.value = textToCopy;
        textArea.style.position = "fixed"; textArea.style.left = "-9999px"; document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        try { if (document.execCommand('copy')) showSuccess(); } catch (err) {}
        document.body.removeChild(textArea);
    }
};
window.togglePlay = function(id) { const media = document.getElementById(`media-${id}`); const btn = document.getElementById(`btn-${id}`); if (media.paused) { media.play(); btn.innerHTML = ICON_PAUSE; } else { media.pause(); btn.innerHTML = ICON_PLAY; } };
window.toggleMute = function(id) { const media = document.getElementById(`media-${id}`); const btn = document.getElementById(`vol-${id}`); media.muted = !media.muted; btn.innerHTML = media.muted ? ICON_VOL_MUTE : ICON_VOL_HIGH; };
window.toggleFullscreen = function(id) { const wrapper = document.getElementById(`wrap-${id}`); const fsBtn = document.getElementById(`fs-${id}`); if (!document.fullscreenElement) { wrapper.requestFullscreen().catch(err => alert(err.message)); fsBtn.innerHTML = ICON_EXIT; } else { document.exitFullscreen(); fsBtn.innerHTML = ICON_FULL; } };
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.querySelectorAll('.fullscreen-btn').forEach(btn => btn.innerHTML = ICON_FULL); });
window.seek = function(e, id) { const media = document.getElementById(`media-${id}`); const rect = e.currentTarget.getBoundingClientRect(); const percent = (e.clientX - rect.left) / rect.width; if (Number.isFinite(media.duration)) media.currentTime = percent * media.duration; };
function updatePlayers() {
    document.querySelectorAll('audio, video').forEach(media => {
        const id = media.id.split('-')[1]; const bar = document.getElementById(`bar-${id}`); const time = document.getElementById(`time-${id}`); const btn = document.getElementById(`btn-${id}`);
        if (bar && time) {
            const percent = (media.currentTime / media.duration) * 100 || 0; bar.style.width = `${percent}%`;
            const min = Math.floor(media.currentTime / 60); const sec = Math.floor(media.currentTime % 60).toString().padStart(2,'0'); time.textContent = `${min}:${sec}`;
            if (media.ended && btn.innerHTML !== ICON_PAUSE) btn.innerHTML = ICON_PLAY;
        }
    });
    requestAnimationFrame(updatePlayers);
}
requestAnimationFrame(updatePlayers);

// --- PARSER ---
function parseNative(text) {
    let html = text;

    // 0. PRE-PROCESS CODE BLOCKS
    const codeBlocks = [];
    html = html.replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
        const cleanCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        codeBlocks.push({ lang: lang || 'TEXT', code: cleanCode, raw: code.trim() });
        return `%%%CODEBLOCK_${codeBlocks.length - 1}%%%`;
    });
    
    const inlineCodeBlocks = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        inlineCodeBlocks.push(code.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        return `%%%INLINE_${inlineCodeBlocks.length - 1}%%%`;
    });

    // 1. HEADER
    if (html.startsWith('---')) {
        const end = html.indexOf('---', 3);
        if (end !== -1) {
            const content = html.substring(3, end);
            let title = "Untitled"; let metaHtml = "";
            content.split('\n').forEach(line => {
                let parts = line.split(':');
                if (parts.length >= 2) {
                    let k = parts[0].trim(); let v = parts.slice(1).join(':').trim();
                    if(k.toLowerCase() === 'title') title = v; 
                    else if(v) metaHtml += `<div class="meta-pill"><span class="meta-key">${k}</span><span class="meta-val">${v}</span></div>`;
                }
            });
            html = `<div class="native-header"><div class="title">${title}</div><div class="native-meta">${metaHtml}</div></div>` + html.substring(end + 3);
        }
    }
    
    // --- NEW: TOGGLES PROCESSED BEFORE QUOTES ---
    html = html.replace(/>>> (.*?)\n([\s\S]*?)\n>>>/g, (_, title, content) => `<details class="native-drop"><summary>${title}</summary><div class="drop-content">${content}</div></details>`);


    // 1.5. HORIZONTAL RULES (New Feature)
    // Must be done after Header extraction so we don't break metadata
    html = html.replace(/^---$/gm, '<hr>');
    // 2. HEADERS
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // 3. QUOTES
    while (html.match(/^> ?/m)) {
        html = html.replace(/^(?:> ?.*(?:\n|$))+/gm, (block) => {
            const content = block.replace(/^> ?/gm, '');
            return `<blockquote>${content}</blockquote>`;
        });
    }

    // 4. LISTS
    html = html.replace(/^(?:[\*\-\+]|\d+\.) (?:.*)(?:\n(?:[ \t]*(?:[\*\-\+]|\d+\.) .*|\n)*)?/gm, (block) => {
        const lines = block.split('\n').filter(l => l.trim() !== '');
        let result = ''; let stack = [];
        lines.forEach(line => {
            const indent = line.search(/\S/); const level = Math.floor(indent / 2); const trimmed = line.trim();
            const isOrdered = /^\d+\./.test(trimmed); const tag = isOrdered ? 'ol' : 'ul';
            const content = trimmed.replace(/^(\d+\.|[\*\-\+])\s+/, '');
            while (stack.length > level) { result += `</${stack.pop()}></li>`; }
            if (stack.length < level) { result += `<${tag}>`; stack.push(tag); }
            else if (stack.length > 0 && stack[stack.length-1] !== tag) { result += `</${stack.pop()}>`; result += `<${tag}>`; stack.push(tag); }
            else if (stack.length === 0) { result += `<${tag}>`; stack.push(tag); }
            result += `<li>${content}</li>`; 
        });
        while (stack.length > 0) { result += `</${stack.pop()}>`; }
        return result;
    });

    // 5. TODO
    html = html.replace(/\[x\]\s?(.*)/gi, `<div class="todo-item"><div class="todo-checkbox" checked></div><span class="todo-done">$1</span></div>`);
    html = html.replace(/\[ \]\s?(.*)/g, `<div class="todo-item"><div class="todo-checkbox"></div><span>$1</span></div>`);

    // 6. TABLES
    html = html.replace(/(\|[^\n]+\|\n)((?:\|[^\n]+\|\n)+)/g, (match, headerRow, bodyRows) => {
        const rows = (headerRow + bodyRows).trim().split('\n');
        let tableHTML = '<table>';
        const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
        const separators = rows[1].split('|').filter(cell => cell.trim() !== '');
        const aligns = separators.map(s => { if (s.startsWith(':') && s.endsWith(':')) return 'center'; if (s.endsWith(':')) return 'right'; return 'left'; });
        tableHTML += '<thead><tr>'; headers.forEach((h, i) => { tableHTML += `<th style="text-align: ${aligns[i] || 'left'}">${h.trim()}</th>`; }); tableHTML += '</tr></thead><tbody>';
        for (let i = 2; i < rows.length; i++) {
            const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
            tableHTML += '<tr>'; cells.forEach((c, j) => { tableHTML += `<td style="text-align: ${aligns[j] || 'left'}">${c.trim()}</td>`; }); tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        return tableHTML;
    });

    // 7. IMAGES
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, `<div class="image-wrapper"><img src="$2" alt="$1"><span class="image-caption">$1</span></div>`);

    // 8. MEDIA
    const createPlayer = (type, url, arg) => {
        const id = Math.random().toString(36).substr(2, 9);
        const isVideo = type === 'Video';
        const wrapperClass = isVideo ? 'media-wrapper' : 'media-wrapper audio-wrapper';
        const isAutoplay = arg && arg.toLowerCase().includes('autoplay');
        const autoAttr = isAutoplay ? 'autoplay muted' : '';
        const initVolIcon = isAutoplay ? ICON_VOL_MUTE : ICON_VOL_HIGH;
        const initPlayIcon = isAutoplay ? ICON_PAUSE : ICON_PLAY;

        const screen = isVideo ? 
            `<div class="video-screen"><video id="media-${id}" src="${url}" ${autoAttr} playsinline onclick="togglePlay('${id}')"></video></div>` : 
            `<audio id="media-${id}" src="${url}" ${autoAttr}></audio>`;
        const fsBtn = isVideo ? 
            `<button class="control-btn fullscreen-btn" id="fs-${id}" onclick="toggleFullscreen('${id}')">${ICON_FULL}</button>` : '';

        return `
        <div class="${wrapperClass}" id="wrap-${id}">
            ${screen}
            <div class="media-controls">
                <button class="control-btn" id="btn-${id}" onclick="togglePlay('${id}')">${initPlayIcon}</button>
                <span class="time-display" id="time-${id}">00:00</span>
                <div class="progress-container" onclick="seek(event, '${id}')">
                    <div class="progress-fill" id="bar-${id}"></div>
                </div>
                <button class="control-btn" id="vol-${id}" onclick="toggleMute('${id}')">${initVolIcon}</button>
                ${fsBtn}
            </div>
        </div>`;
    };
    html = html.replace(/@\[Video\]\((.*?)(?:\s+"(.*?)")?\)/gi, (_, url, arg) => createPlayer('Video', url, arg));
    html = html.replace(/@\[Audio\]\((.*?)(?:\s+"(.*?)")?\)/gi, (_, url, arg) => createPlayer('Audio', url, arg));

    // 9. OTHER (Buttons, Embeds)
    html = html.replace(/@\[Web\]\((.*?)\)/gi, `<div class="embed-wrapper"><iframe src="$1"></iframe></div>`);
    html = html.replace(/\(\((.*?)\)\)/g, (_, t) => `<span class="badge" data-label="${t.toUpperCase()}">${t}</span>`);
    
    html = html.replace(/\[\[(.*?)\]\]\((.*?)(?:\s+"(.*?)")?\)/g, (match, text, url, type) => {
        const mode = (type && type.toLowerCase().includes('sec')) ? 'btn-secondary' : 'btn-primary';
        return `<a href="${url}" class="native-btn ${mode}">${text}</a>`;
    });
    html = html.replace(/\{\{(.*?)\}\}/g, '<kbd>$1</kbd>');

    // 10. FORMATTING
    html = html.replace(/([^!@])\[(.*?)\]\((.*?)\)/g, '$1<a href="$3">$2</a>');
    html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    html = html.replace(/(^|[^\w])(\*|_)([^\s].*?[^\s])\2(?=[^\w]|$)/g, '$1<em>$3</em>');
    
    // --- NEWLINE FIX (Applied BEFORE Code Block Restore) ---
    // This ensures Markdown newlines become <br>, but code blocks remain untouched.
    html = html.replace(/\n/g, '<br>');
    
    // 11. RESTORE CODE
    html = html.replace(/%%%INLINE_(\d+)%%%/g, (match, index) => {
        const block = inlineCodeBlocks[index];
        return block ? `<code class="inline">${block}</code>` : '';
    });
    
    html = html.replace(/%%%CODEBLOCK_(\d+)%%%/g, (match, index) => {
        const block = codeBlocks[index];
        if (!block) return "";
        const encodedRaw = encodeURIComponent(block.raw).replace(/'/g, "%27");
        const highlightedCode = highlightSyntax(block.code, block.lang);

        return `
        <div class="code-wrapper">
            <div class="code-header">
                <span class="lang-label">${block.lang || 'TEXT'}</span>
                <button class="copy-btn" onclick="copyCode('${encodedRaw}', this)">Copy</button>
            </div>
            <pre><code>${highlightedCode}</code></pre>
        </div>`;
    });
    
    // 12. CLEANUP (Remove <br> where it breaks layout)
    // We clean up invalid breaks after blocks, but preserve breaks in text paragraphs.
    const blocks = 'h\\d|div|ul|ol|li|table|thead|tbody|tr|td|blockquote|details|summary';
    html = html.replace(new RegExp(`<br>\\s*<\\/?(${blocks})`, 'g'), (m) => m.replace('<br>', ''));
    html = html.replace(new RegExp(`<\\/(${blocks})>\\s*<br>`, 'g'), (m) => m.replace('<br>', ''));

    return html;
}

// --- INIT ---
const editor = document.getElementById('editor');
const preview = document.getElementById('preview-content');
function update() { preview.innerHTML = parseNative(editor.value); }
editor.addEventListener('input', update);
fetch('index.md').then(r => r.text()).then(t => { editor.value = t; update(); }).catch(e => console.log('No index.md'));