const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
}

function animateScore(finalScore) {
    const duration = 600;
    const startTime = performance.now();
    const startScore = 0;
    
    scoreValue.classList.add('score-animating');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentScore = startScore + (finalScore - startScore) * progress;
        scoreValue.textContent = currentScore.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            scoreValue.textContent = finalScore.toFixed(1);
            scoreValue.classList.remove('score-animating');
        }
    }
    
    requestAnimationFrame(update);
}

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const inspectionPanel = document.getElementById('inspectionPanel');
const filePreview = document.getElementById('filePreview');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const privacyStatus = document.getElementById('privacyStatus');
const btnClean = document.getElementById('btnClean');
const btnSelectiveClean = document.getElementById('btnSelectiveClean');
const cleaningProgress = document.getElementById('cleaningProgress');
const progressFill = document.querySelector('.progress-fill');

const identityGrid = document.getElementById('identityGrid');
const structureGrid = document.getElementById('structureGrid');
const geoGrid = document.getElementById('geoGrid');
const exifGrid = document.getElementById('exifGrid');
const extendedGrid = document.getElementById('extendedGrid');
const rawGrid = document.getElementById('rawGrid');
const contentGrid = document.getElementById('contentGrid');

const geoSection = document.getElementById('geoSection');
const exifSection = document.getElementById('exifSection');
const extendedSection = document.getElementById('extendedSection');
const rawSection = document.getElementById('rawSection');
const contentSection = document.getElementById('contentSection');
const noMetadataMsg = document.getElementById('noMetadataMsg');

const searchContainer = document.getElementById('searchContainer');
const metadataSearch = document.getElementById('metadataSearch');
const searchResults = document.getElementById('searchResults');

const resultSection = document.getElementById('resultSection');
const resultStats = document.getElementById('resultStats');
const diffGrid = document.getElementById('diffGrid');
const btnDownload = document.getElementById('btnDownload');
const btnExport = document.getElementById('btnExport');
const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');

const privacyScoreBadge = document.getElementById('privacyScoreBadge');
const scoreIcon = document.getElementById('scoreIcon');
const scoreValue = document.getElementById('scoreValue');

let currentFile = null;
let cleanBlobUrl = null;
let originalSize = 0;
let cleanSize = 0;
let originalHash = '';
let cleanHash = '';
let extractedTags = {};

// Undo/Redo State
let historyStack = [];
let historyIndex = -1;

function saveState(blob, removedKeys, type) {
    // Remove any future states if we are not at the end of the stack
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    
    historyStack.push({
        blob: blob,
        removedKeys: removedKeys,
        type: type // 'full' or 'selective'
    });
    
    historyIndex++;
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    if (historyIndex > 0) {
        btnUndo.disabled = false;
        btnUndo.style.background = 'var(--warning)';
    } else {
        btnUndo.disabled = true;
        btnUndo.style.background = 'var(--text-muted)';
    }
    
    if (historyIndex < historyStack.length - 1) {
        btnRedo.disabled = false;
        btnRedo.style.background = 'var(--accent)';
    } else {
        btnRedo.disabled = true;
        btnRedo.style.background = 'var(--text-muted)';
    }
}

async function applyState(state) {
    cleanSize = state.blob.size;
    if (cleanBlobUrl) URL.revokeObjectURL(cleanBlobUrl);
    cleanBlobUrl = URL.createObjectURL(state.blob);
    
    if (state.blob.type.startsWith('image/')) {
        filePreview.src = cleanBlobUrl;
        btnClean.style.display = 'inline-flex';
        if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'inline-flex';
    } else {
        btnClean.style.display = 'none';
        if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'none';
    }
    
    cleanHash = await calculateSHA512(state.blob);
    const cleanHash256 = await calculateSHA256(state.blob);
    const cleanHashMD5 = await calculateMD5(state.blob);
    const cleanHashCRC32 = await calculateCRC32(state.blob);
    
    resultStats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Original Size</span>
            <span class="stat-value strike">${formatBytes(originalSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Clean Size</span>
            <span class="stat-value new">${formatBytes(cleanSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Saved</span>
            <span class="stat-value">${formatBytes(originalSize - cleanSize)}</span>
        </div>
        <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
            <span class="stat-label">Clean CRC32</span>
            <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span>
        </div>
        <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
            <span class="stat-label">Clean MD5</span>
            <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span>
        </div>
        <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
            <span class="stat-label">Clean SHA-256</span>
            <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span>
        </div>
        <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
            <span class="stat-label">Clean SHA-512</span>
            <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
        </div>
    `;
    
    showDiffs(state.removedKeys);
    updateUndoRedoButtons();
}

btnUndo.addEventListener('click', async () => {
    if (historyIndex > 0) {
        historyIndex--;
        await applyState(historyStack[historyIndex]);
    }
});

btnRedo.addEventListener('click', async () => {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        await applyState(historyStack[historyIndex]);
    }
});

const SENSITIVE_KEYS = ['GPS', 'Latitude', 'Longitude', 'Altitude', 'Location'];
const WARNING_KEYS = ['Make', 'Model', 'Software', 'SerialNumber', 'LensSerialNumber', 'CameraSerialNumber'];

const REGEX_PATTERNS = {
    'Email': { regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, penalty: 1.0, validator: isValidEmail },
    'IPv4': { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, penalty: 0.5, validator: isValidIPv4 },
    'URL': { regex: /https?:\/\/[^\s"'<>]+/g, penalty: 0.2, validator: isValidUrl },
    'MAC Address': { regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g, penalty: 1.0 },
    'IMEI': { regex: /\b\d{15}\b/g, penalty: 2.0, validator: isValidIMEI },
    'IMSI': { regex: /\b\d{15}\b/g, penalty: 2.0, validator: isLikelyIMSI },
    'CreditCard': { regex: /\b(?:\d[ -]*?){13,19}\b/g, penalty: 3.0, validator: isValidCreditCard },
    'Phone': { regex: /(?:^|[^\d])((?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-])\d{2,4}[\s.-]\d{3,5})(?!\d)/g, penalty: 1.5, validator: isLikelyPhone, useCaptureGroup: true },
    'Passport': { regex: /\b[A-Z]{1,2}\d{6,9}\b/g, penalty: 3.0 },
    'SSN': { regex: /\b\d{3}-\d{2}-\d{4}\b/g, penalty: 3.0 },
    'Coordinates': { regex: /[-+]?\d{1,3}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+/g, penalty: 2.0, validator: isValidCoordinates },
    'Bitcoin Address': { regex: /\b(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b/g, penalty: 1.0 },
    'Ethereum Address': { regex: /\b0x[a-fA-F0-9]{40}\b/g, penalty: 1.0 },
    'Base64 (Posible)': { regex: /\b(?:[A-Za-z0-9+/]{4}){12,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\b/g, penalty: 0.05, validator: isLikelySensitiveBase64 }
};

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'json', 'xml', 'csv', 'log', 'html', 'htm', 'js', 'ts', 'css', 'yaml', 'yml', 'ini', 'conf']);
const NUMERIC_PRIORITY_LABELS = new Set(['IMEI', 'IMSI', 'CreditCard']);

function normalizeDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function luhnCheck(value) {
    const digits = normalizeDigits(value);
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = Number(digits[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

function isValidEmail(value) {
    if (!value) return false;
    const v = String(value).trim();
    if (v.length > 254) return false;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
}

function isValidIPv4(value) {
    const parts = String(value || '').trim().split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const n = Number(part);
        return n >= 0 && n <= 255;
    });
}

function isValidUrl(value) {
    try {
        const url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function isValidIMEI(value) {
    const digits = normalizeDigits(value);
    return digits.length === 15 && luhnCheck(digits);
}

function isLikelyIMSI(value) {
    const digits = normalizeDigits(value);
    if (digits.length !== 15) return false;
    if (/^(\d)\1{14}$/.test(digits)) return false;
    if (/^0+$/.test(digits)) return false;
    return !luhnCheck(digits);
}

function isLikelyPhone(value) {
    const raw = String(value || '').trim();
    if (!raw || /^-\d+$/.test(raw)) return false;
    if (!/[+\s().-]/.test(raw)) return false;
    const digits = normalizeDigits(raw);
    if (digits.length < 10 || digits.length > 15) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    if (luhnCheck(digits)) return false;
    return true;
}

function isValidCreditCard(value) {
    const digits = normalizeDigits(value);
    if (digits.length < 13 || digits.length > 19) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    return luhnCheck(digits);
}

function isValidCoordinates(value) {
    const match = String(value || '').trim().match(/^([-+]?\d{1,3}\.\d+)\s*,\s*([-+]?\d{1,3}\.\d+)$/);
    if (!match) return false;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function isLikelySensitiveBase64(value) {
    const raw = String(value || '').trim();
    if (raw.length < 48) return false;
    if (!/[+/=]/.test(raw)) return false;
    if (/^[A-Za-z]+$/.test(raw)) return false;
    return raw.length % 4 === 0;
}

function isTextLikeFile(file, extLower) {
    if (file.type && (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/javascript' || file.type === 'application/xml')) {
        return true;
    }
    return TEXT_EXTENSIONS.has(extLower);
}

function normalizeSensitiveValue(label, value) {
    const raw = String(value || '').trim();
    if (['Phone', 'IMEI', 'IMSI', 'CreditCard', 'SSN'].includes(label)) {
        return normalizeDigits(raw);
    }
    return raw.toLowerCase();
}

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFile(file);
});

document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
                e.preventDefault();
                handleFile(file);
                break;
            }
        }
    }
});

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function calculateHash(blob, algorithm = 'SHA-512') {
    try {
        if (!window.crypto || !window.crypto.subtle) {
            return "No disponible (requiere HTTPS)";
        }
        const buffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
        console.error(`Error hashing ${algorithm}:`, err);
        return "Error al calcular hash";
    }
}

async function calculateSHA512(blob) {
    return calculateHash(blob, 'SHA-512');
}

async function calculateSHA256(blob) {
    return calculateHash(blob, 'SHA-256');
}

async function calculateMD5(blob) {
    try {
        if (typeof CryptoJS === 'undefined') return "Librería no cargada";
        const buffer = await blob.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(buffer);
        return CryptoJS.MD5(wordArray).toString();
    } catch (err) {
        console.error("Error hashing MD5:", err);
        return "Error al calcular hash";
    }
}

async function calculateCRC32(blob) {
    try {
        const buffer = await blob.arrayBuffer();
        const view = new Uint8Array(buffer);
        let crc = 0 ^ (-1);
        for (let i = 0; i < view.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ view[i]) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    } catch (err) {
        console.error("Error hashing CRC32:", err);
        return "Error al calcular hash";
    }
}

// Precompute CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[i] = c;
}

function formatDate(date) {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
}

function addInfoRow(container, label, value, valueClass = '', isRemovable = false, tagKey = '') {
    const row = document.createElement('div');
    row.className = 'data-row';
    
    const lbl = document.createElement('span');
    lbl.className = 'data-label';
    lbl.textContent = label;
    
    const val = document.createElement('span');
    val.className = `data-value ${valueClass}`;
    val.textContent = value;
    
    if (isRemovable) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'remove-checkbox';
        checkbox.dataset.key = tagKey;
        checkbox.title = 'Marcar para eliminar';
        
        const labelWrapper = document.createElement('div');
        labelWrapper.style.display = 'flex';
        labelWrapper.style.alignItems = 'center';
        labelWrapper.style.gap = '8px';
        labelWrapper.appendChild(checkbox);
        labelWrapper.appendChild(lbl);
        
        row.appendChild(labelWrapper);
    } else {
        row.appendChild(lbl);
    }
    
    row.appendChild(val);
    container.appendChild(row);
}

function setPrivacyStatus(type, icon, text) {
    privacyStatus.className = `status-indicator ${type}`;
    privacyStatus.innerHTML = `
        <span class="material-symbols-rounded status-icon">${icon}</span>
        <span class="status-text">${text}</span>
    `;
}

function filterMetadata(query) {
    const q = query.toLowerCase().trim();
    let totalMatches = 0;
    
    const sections = [
        { section: document.querySelector('#identityGrid').closest('details'), grid: identityGrid, alwaysShow: true },
        { section: document.querySelector('#structureGrid').closest('details'), grid: structureGrid, alwaysShow: true },
        { section: contentSection, grid: contentGrid, alwaysShow: false },
        { section: geoSection, grid: geoGrid, alwaysShow: false },
        { section: exifSection, grid: exifGrid, alwaysShow: false },
        { section: extendedSection, grid: extendedGrid, alwaysShow: false }
    ];

    sections.forEach(({ section, grid, alwaysShow }) => {
        if (!section) return;
        
        const rows = grid.querySelectorAll('.data-row');
        if (rows.length === 0 && !alwaysShow) {
            section.style.display = 'none';
            return;
        }
        
        let sectionMatches = 0;
        
        rows.forEach(row => {
            const labelEl = row.querySelector('.data-label');
            const valueEl = row.querySelector('.data-value');
            
            // Reset highlights
            labelEl.innerHTML = labelEl.textContent;
            valueEl.innerHTML = valueEl.textContent;
            
            if (!q) {
                row.style.display = 'flex';
                sectionMatches++;
                return;
            }
            
            const labelText = labelEl.textContent;
            const valueText = valueEl.textContent;
            const labelMatch = labelText.toLowerCase().includes(q);
            const valueMatch = valueText.toLowerCase().includes(q);
            
            if (labelMatch || valueMatch) {
                row.style.display = 'flex';
                sectionMatches++;
                totalMatches++;
                
                // Highlight matches
                if (labelMatch) {
                    const regex = new RegExp(`(${q})`, 'gi');
                    labelEl.innerHTML = labelText.replace(regex, '<mark>$1</mark>');
                }
                if (valueMatch) {
                    const regex = new RegExp(`(${q})`, 'gi');
                    valueEl.innerHTML = valueText.replace(regex, '<mark>$1</mark>');
                }
            } else {
                row.style.display = 'none';
            }
        });
        
        if (q) {
            section.style.display = sectionMatches > 0 ? 'block' : 'none';
            if (sectionMatches > 0) section.open = true;
        } else {
            section.style.display = (alwaysShow || rows.length > 0) ? 'block' : 'none';
        }
    });
    
    if (q) {
        searchResults.textContent = `${totalMatches} resultado${totalMatches !== 1 ? 's' : ''}`;
    } else {
        searchResults.textContent = '';
    }
}

metadataSearch.addEventListener('input', (e) => {
    filterMetadata(e.target.value);
});

async function handleFile(file) {
    try {
        currentFile = file;
        originalSize = file.size;
        const extLower = (file.name.split('.').pop() || '').toLowerCase();
        
        if (cleanBlobUrl) URL.revokeObjectURL(cleanBlobUrl);
        cleanBlobUrl = null;
        
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const isPdf = file.type === 'application/pdf';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isText = isTextLikeFile(file, extLower);
        
        dropZone.classList.add('compact');
        inspectionPanel.style.display = 'flex';
        resultSection.style.display = 'none';
        
        if (isImage) {
            btnClean.style.display = 'inline-flex';
            btnSelectiveClean.style.display = 'inline-flex';
            btnClean.disabled = false;
            btnSelectiveClean.disabled = false;
        } else {
            btnClean.style.display = 'none';
            btnSelectiveClean.style.display = 'none';
        }
        
        cleaningProgress.style.display = 'none';
        progressFill.style.width = '0%';
        
        geoSection.style.display = 'none';
        exifSection.style.display = 'none';
        extendedSection.style.display = 'none';
        rawSection.style.display = 'none';
        contentSection.style.display = 'none';
        noMetadataMsg.style.display = 'none';
        searchContainer.style.display = 'block';
        metadataSearch.value = '';
        searchResults.textContent = '';
        
        document.querySelectorAll('.select-all-cb').forEach(cb => cb.checked = false);
        
        if (isImage) {
            filePreview.src = URL.createObjectURL(file);
            filePreview.style.display = 'block';
        } else if (isPdf) {
            filePreview.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>';
            filePreview.style.display = 'block';
        } else if (isDocx) {
            filePreview.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232563eb"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';
            filePreview.style.display = 'block';
        } else {
            filePreview.src = '';
            filePreview.style.display = 'none';
        }
        
        // Reset Undo/Redo state for new file
        historyStack = [];
        historyIndex = -1;
        saveState(file, [], 'original');
        
        fileNameDisplay.textContent = file.name;
        setPrivacyStatus('success', 'check_circle', 'Analizando...');
        
        identityGrid.innerHTML = '';
        const ext = file.name.split('.').pop().toUpperCase();
        addInfoRow(identityGrid, 'Nombre completo', file.name);
        addInfoRow(identityGrid, 'Extensión real', `.${ext}`);
        addInfoRow(identityGrid, 'Tipo MIME', file.type || 'Unknown');
        addInfoRow(identityGrid, 'Tamaño exacto', `${file.size} bytes`);
        addInfoRow(identityGrid, 'Tamaño legible', formatBytes(file.size));
        addInfoRow(identityGrid, 'Modificado', formatDate(file.lastModified));
        
        originalHash = await calculateSHA512(file);
        const originalHash256 = await calculateSHA256(file);
        const originalHashMD5 = await calculateMD5(file);
        const originalHashCRC32 = await calculateCRC32(file);
        
        addInfoRow(identityGrid, 'Hash CRC32', originalHashCRC32, 'hash-value');
        addInfoRow(identityGrid, 'Hash MD5', originalHashMD5, 'hash-value');
        addInfoRow(identityGrid, 'Hash SHA-256', originalHash256, 'hash-value');
        addInfoRow(identityGrid, 'Hash SHA-512', originalHash, 'hash-value');
        
        structureGrid.innerHTML = '';
        addInfoRow(structureGrid, 'Formato', ext);
        
        if (isImage) {
            const img = new Image();
            img.src = filePreview.src;
            await new Promise(resolve => {
                img.onload = () => {
                    addInfoRow(structureGrid, 'Resolución exacta', `${img.width} × ${img.height} px`);
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const r = gcd(img.width, img.height);
                    if (r > 0) {
                        addInfoRow(structureGrid, 'Relación de aspecto', `${img.width/r}:${img.height/r}`);
                    }
                    resolve();
                };
                img.onerror = () => {
                    addInfoRow(structureGrid, 'Resolución', 'No disponible');
                    resolve();
                };
            });
        } else if (isVideo || isAudio) {
            const media = document.createElement(isVideo ? 'video' : 'audio');
            media.src = URL.createObjectURL(file);
            await new Promise(resolve => {
                media.onloadedmetadata = () => {
                    addInfoRow(structureGrid, 'Duración', `${media.duration.toFixed(2)} s`);
                    if (isVideo) {
                        addInfoRow(structureGrid, 'Resolución', `${media.videoWidth} × ${media.videoHeight} px`);
                    }
                    resolve();
                };
                media.onerror = resolve;
            });
        }

        exifGrid.innerHTML = '';
        geoGrid.innerHTML = '';
        extendedGrid.innerHTML = '';
        rawGrid.innerHTML = '';
        contentGrid.innerHTML = '';
        extractedTags = {};
        
        let hasExif = false;
        let hasGeo = false;
        let hasExtended = false;
        let hasSensitive = false;
        const sensitiveFindings = [];
        const sensitiveFindingKeys = new Set();
        const numericSensitiveTokens = new Set();
        
        let score = 10;
        let totalTags = 0;

        const registerSensitiveFinding = (label, rawValue, penalty) => {
            const value = String(rawValue || '').trim();
            if (!value) return;
            const normalized = normalizeSensitiveValue(label, value);
            if (!normalized) return;
            if (label === 'Phone' && numericSensitiveTokens.has(normalized)) return;
            const findingKey = `${label}:${normalized}`;
            if (sensitiveFindingKeys.has(findingKey)) return;
            sensitiveFindingKeys.add(findingKey);
            if (NUMERIC_PRIORITY_LABELS.has(label)) {
                numericSensitiveTokens.add(normalized);
            }
            sensitiveFindings.push({ label, value, penalty });
            hasSensitive = true;
            contentSection.style.display = 'block';
        };

        const analyzeSensitiveText = (rawText) => {
            if (!rawText || typeof rawText !== 'string') return;
            for (const [label, patternData] of Object.entries(REGEX_PATTERNS)) {
                const regex = new RegExp(patternData.regex.source, patternData.regex.flags);
                for (const match of rawText.matchAll(regex)) {
                    const candidate = (patternData.useCaptureGroup ? match[1] : match[0]) || '';
                    const value = String(candidate).trim();
                    if (!value) continue;
                    if (patternData.validator && !patternData.validator(value)) continue;
                    registerSensitiveFinding(label, value, patternData.penalty);
                }
            }
        };
        
        let textContent = '';
        try {
            if (isText) {
                textContent = await file.slice(0, 2 * 1024 * 1024).text();
            }
            if (textContent) {
                analyzeSensitiveText(textContent);
            }
        } catch (e) {
            console.log("Error reading content for analysis", e);
        }
        
        // EXIF Analysis (only for images)
        if (isImage) {
            try {
                const buffer = await file.arrayBuffer();
                if (typeof ExifReader !== 'undefined') {
                    const tags = ExifReader.load(buffer, {expanded: true});
                    
                    rawGrid.textContent = JSON.stringify(tags, null, 2);
                    rawSection.style.display = 'block';
                    
                    if (tags.exif && Object.keys(tags.exif).length > 0) {
                        hasExif = true;
                        exifSection.style.display = 'block';
                        for (const [key, tag] of Object.entries(tags.exif)) {
                            const val = tag.description || tag.value;
                            extractedTags[`EXIF:${key}`] = val;
                            totalTags++;
                            analyzeSensitiveText(String(val || ''));
                            
                            const isSens = SENSITIVE_KEYS.some(k => key.includes(k));
                            const isWarn = WARNING_KEYS.some(k => key.includes(k));
                            if (isSens) {
                                hasSensitive = true;
                                score -= 1.5;
                            } else if (isWarn) {
                                score -= 0.5;
                            }
                            
                            let valClass = isSens ? 'sensitive' : (isWarn ? 'warning' : '');
                            addInfoRow(exifGrid, key, val, valClass, true, `EXIF:${key}`);
                        }
                    }
                    
                    if (tags.gps && Object.keys(tags.gps).length > 0) {
                        hasGeo = true;
                        hasSensitive = true;
                        geoSection.style.display = 'block';
                        for (const [key, tag] of Object.entries(tags.gps)) {
                            const val = tag.description || tag.value;
                            extractedTags[`GPS:${key}`] = val;
                            totalTags++;
                            analyzeSensitiveText(String(val || ''));
                            score -= 1.5;
                            addInfoRow(geoGrid, key, val, 'sensitive', true, `GPS:${key}`);
                        }
                    }
                    
                    const extendedTypes = ['xmp', 'iptc', 'icc'];
                    extendedTypes.forEach(type => {
                        if (tags[type] && Object.keys(tags[type]).length > 0) {
                            hasExtended = true;
                            extendedSection.style.display = 'block';
                            for (const [key, tag] of Object.entries(tags[type])) {
                                const val = tag.description || tag.value;
                                extractedTags[`${type.toUpperCase()}:${key}`] = val;
                                totalTags++;
                                analyzeSensitiveText(String(val || ''));
                                addInfoRow(extendedGrid, `[${type.toUpperCase()}] ${key}`, val, '', true, `${type.toUpperCase()}:${key}`);
                            }
                        }
                    });
                }
            } catch (e) {
                console.log("No EXIF data or error reading EXIF", e);
            }
        } else if (isPdf) {
            try {
                if (typeof pdfjsLib !== 'undefined') {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
                    const metadata = await pdf.getMetadata();
                    
                    rawGrid.textContent = JSON.stringify(metadata, null, 2);
                    rawSection.style.display = 'block';
                    
                    if (metadata.info && Object.keys(metadata.info).length > 0) {
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        for (const [key, val] of Object.entries(metadata.info)) {
                            if (val && typeof val === 'string' && val.trim() !== '') {
                                extractedTags[`PDF:${key}`] = val;
                                totalTags++;
                                analyzeSensitiveText(val);
                                
                                let valClass = '';
                                if (key.toLowerCase().includes('author') || key.toLowerCase().includes('creator')) {
                                    hasSensitive = true;
                                    score -= 1.0;
                                    valClass = 'sensitive';
                                }
                                
                                addInfoRow(extendedGrid, `[PDF] ${key}`, val, valClass);
                            }
                        }
                    }
                }
            } catch (e) {
                console.log("Error reading PDF metadata", e);
            }
        } else if (isDocx) {
            try {
                if (typeof JSZip !== 'undefined') {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    
                    if (contents.files['docProps/core.xml']) {
                        const coreXml = await contents.files['docProps/core.xml'].async('string');
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(coreXml, "text/xml");
                        
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        
                        const elements = xmlDoc.documentElement.children;
                        const docxMeta = {};
                        
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i];
                            const key = el.tagName.split(':').pop();
                            const val = el.textContent;
                            
                            if (val && val.trim() !== '') {
                                docxMeta[key] = val;
                                extractedTags[`DOCX:${key}`] = val;
                                totalTags++;
                                analyzeSensitiveText(val);
                                
                                let valClass = '';
                                if (key.toLowerCase().includes('creator') || key.toLowerCase().includes('lastmodifiedby')) {
                                    hasSensitive = true;
                                    score -= 1.0;
                                    valClass = 'sensitive';
                                }
                                
                                addInfoRow(extendedGrid, `[DOCX] ${key}`, val, valClass);
                            }
                        }
                        
                        rawGrid.textContent = JSON.stringify(docxMeta, null, 2);
                        rawSection.style.display = 'block';
                    }
                }
            } catch (e) {
                console.log("Error reading DOCX metadata", e);
            }
        }

        if (sensitiveFindings.length > 0) {
            const groupedFindings = sensitiveFindings.reduce((acc, finding) => {
                if (!acc[finding.label]) acc[finding.label] = [];
                acc[finding.label].push(finding.value);
                return acc;
            }, {});

            score -= sensitiveFindings.reduce((acc, finding) => acc + finding.penalty, 0);

            for (const [label, values] of Object.entries(groupedFindings)) {
                values.slice(0, 5).forEach(value => {
                    addInfoRow(contentGrid, label, value, 'sensitive');
                });
                if (values.length > 5) {
                    addInfoRow(contentGrid, `${label} (Otros)`, `+${values.length - 5} encontrados`, 'warning');
                }
            }
        }
        
        score -= Math.floor(totalTags / 10) * 0.1;
        score = Math.max(0, Math.min(10, score));
        
        privacyScoreBadge.style.display = 'flex';
        
        let scoreColor = '#059669';
        if (score < 4) {
            scoreColor = '#dc2626';
        } else if (score < 6) {
            scoreColor = '#d97706';
        } else if (score < 8) {
            scoreColor = '#0ea5e9';
        }
        scoreValue.style.color = scoreColor;
        
        privacyScoreBadge.className = 'privacy-score-badge';
        if (score >= 9) {
            privacyScoreBadge.classList.add('score-excellent');
            scoreIcon.textContent = 'verified_user';
        } else if (score >= 7) {
            privacyScoreBadge.classList.add('score-good');
            scoreIcon.textContent = 'gpp_good';
        } else if (score >= 4) {
            privacyScoreBadge.classList.add('score-warning');
            scoreIcon.textContent = 'gpp_maybe';
        } else {
            privacyScoreBadge.classList.add('score-poor');
            scoreIcon.textContent = 'gpp_bad';
        }
        
        animateScore(score);
        
        if (!hasExif && !hasGeo && !hasExtended && !hasSensitive) {
            noMetadataMsg.style.display = 'flex';
            setPrivacyStatus('success', 'check_circle', 'Archivo limpio (Sin datos sensibles)');
        } else {
            if (hasSensitive) {
                setPrivacyStatus('danger', 'warning', 'Datos sensibles detectados');
            } else {
                setPrivacyStatus('warning', 'info', 'Metadata detectada');
            }
        }
        
    } catch (error) {
        console.error(error);
        noMetadataMsg.style.display = 'flex';
        noMetadataMsg.innerHTML = `<span class="material-symbols-rounded">error</span> Error al analizar archivo`;
        setPrivacyStatus('warning', 'error', 'Análisis fallido');
    }
}

document.querySelectorAll('.select-all-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
        const targetId = e.target.dataset.target;
        const grid = document.getElementById(targetId);
        if (grid) {
            const checkboxes = grid.querySelectorAll('.remove-checkbox');
            checkboxes.forEach(c => {
                // Only check visible checkboxes (in case of search filter)
                if (c.closest('.data-row').style.display !== 'none') {
                    c.checked = e.target.checked;
                }
            });
        }
    });
});

function showDiffs(removedKeys) {
    diffGrid.innerHTML = `
        <div class="diff-row diff-header-row">
            <span>Campo</span>
            <span>Antes</span>
            <span>Después</span>
        </div>
    `;
    
    if (removedKeys.length === 0) {
        diffGrid.innerHTML += `<div style="padding: 16px; text-align: center; color: var(--text-muted);">No se eliminaron metadatos específicos.</div>`;
        return;
    }
    
    removedKeys.forEach(key => {
        const originalValue = extractedTags[key] || 'Desconocido';
        
        const row = document.createElement('div');
        row.className = 'diff-row';
        
        const keySpan = document.createElement('span');
        keySpan.className = 'diff-key';
        keySpan.textContent = key.split(':').pop();
        
        const beforeSpan = document.createElement('span');
        beforeSpan.className = 'diff-before';
        beforeSpan.textContent = originalValue;
        
        const afterSpan = document.createElement('span');
        afterSpan.className = 'diff-after diff-removed';
        afterSpan.textContent = 'Eliminado';
        
        row.appendChild(keySpan);
        row.appendChild(beforeSpan);
        row.appendChild(afterSpan);
        
        diffGrid.appendChild(row);
    });
}

btnClean.addEventListener('click', async () => {
    if (!currentFile) return;
    
    btnClean.style.display = 'none';
    if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'none';
    cleaningProgress.style.display = 'flex';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = `${progress}%`;
    }, 100);
    
    try {
        const img = new Image();
        img.src = URL.createObjectURL(currentFile);
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("No se pudo cargar la imagen para limpiar"));
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const type = currentFile.type || 'image/jpeg';
        const quality = 0.95;
        
        canvas.toBlob(async (blob) => {
            clearInterval(interval);
            progressFill.style.width = '100%';
            
            cleanHash = await calculateSHA512(blob);
            const cleanHash256 = await calculateSHA256(blob);
            const cleanHashMD5 = await calculateMD5(blob);
            const cleanHashCRC32 = await calculateCRC32(blob);
            
            setTimeout(() => {
                cleanSize = blob.size;
                cleanBlobUrl = URL.createObjectURL(blob);
                
                cleaningProgress.style.display = 'none';
                setPrivacyStatus('success', 'verified_user', 'Metadata eliminada');
                
                resultSection.style.display = 'block';
                resultStats.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Original Size</span>
                        <span class="stat-value strike">${formatBytes(originalSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Clean Size</span>
                        <span class="stat-value new">${formatBytes(cleanSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Saved</span>
                        <span class="stat-value">${formatBytes(originalSize - cleanSize)}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                        <span class="stat-label">Clean CRC32</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">Clean MD5</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">Clean SHA-256</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">Clean SHA-512</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
                    </div>
                `;
                
                const removedKeys = Object.keys(extractedTags);
                showDiffs(removedKeys);
                saveState(blob, removedKeys, 'full');
                
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
        }, type, quality);
        
    } catch (error) {
        clearInterval(interval);
        console.error(error);
        alert("Error al limpiar la imagen. Asegúrate de que sea un formato de imagen válido.");
        btnClean.style.display = 'inline-flex';
        if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'inline-flex';
        cleaningProgress.style.display = 'none';
    }
});

function removeJpegSegments(jpegData, removeXmp, removeIptc, removeIcc) {
    const byteString = atob(jpegData.split(',')[1]);
    let offset = 2; // Skip FF D8
    let newSegments = [byteString.slice(0, 2)];
    
    while (offset < byteString.length) {
        if (byteString.charCodeAt(offset) !== 0xFF) break;
        const marker = byteString.charCodeAt(offset + 1);
        if (marker === 0xDA || marker === 0xD9) { // SOS or EOI
            newSegments.push(byteString.slice(offset));
            break;
        }
        
        const length = (byteString.charCodeAt(offset + 2) << 8) | byteString.charCodeAt(offset + 3);
        const segment = byteString.slice(offset, offset + 2 + length);
        
        let keep = true;
        if (marker === 0xE1 && removeXmp) { // APP1
            if (segment.slice(4, 33) === "http://ns.adobe.com/xap/1.0/\x00") keep = false;
        } else if (marker === 0xED && removeIptc) { // APP13
            if (segment.slice(4, 18) === "Photoshop 3.0\x00") keep = false;
        } else if (marker === 0xE2 && removeIcc) { // APP2
            if (segment.slice(4, 16) === "ICC_PROFILE\x00") keep = false;
        }
        
        if (keep) newSegments.push(segment);
        offset += 2 + length;
    }
    
    return "data:image/jpeg;base64," + btoa(newSegments.join(""));
}

btnSelectiveClean.addEventListener('click', async () => {
    if (!currentFile) return;
    
    const checkboxes = document.querySelectorAll('.remove-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Selecciona al menos un campo para eliminar.");
        return;
    }
    
    const isJpeg = currentFile.type === 'image/jpeg' || currentFile.type === 'image/jpg';
    if (!isJpeg) {
        alert("La limpieza selectiva actualmente solo está soportada para imágenes JPEG.");
        return;
    }
    
    btnClean.style.display = 'none';
    btnSelectiveClean.style.display = 'none';
    cleaningProgress.style.display = 'flex';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = `${progress}%`;
    }, 100);
    
    try {
        const reader = new FileReader();
        reader.readAsDataURL(currentFile);
        
        await new Promise((resolve, reject) => {
            reader.onload = resolve;
            reader.onerror = reject;
        });
        
        let jpegData = reader.result;
        
        // Load EXIF data
        let exifObj;
        try {
            exifObj = piexif.load(jpegData);
        } catch (e) {
            exifObj = {"0th":{}, "Exif":{}, "GPS":{}, "Interop":{}, "1st":{}, "thumbnail":null};
        }
        
        // Build reverse map for piexif tags
        const nameToTag = {};
        for (const ifd in piexif.TAGS) {
            if (ifd === 'Image' || ifd === '0th') {
                for (const tagId in piexif.TAGS[ifd]) {
                    nameToTag[piexif.TAGS[ifd][tagId].name] = { ifd: '0th', id: parseInt(tagId) };
                }
            } else if (ifd === 'Exif') {
                for (const tagId in piexif.TAGS[ifd]) {
                    nameToTag[piexif.TAGS[ifd][tagId].name] = { ifd: 'Exif', id: parseInt(tagId) };
                }
            } else if (ifd === 'GPS') {
                for (const tagId in piexif.TAGS[ifd]) {
                    nameToTag[piexif.TAGS[ifd][tagId].name] = { ifd: 'GPS', id: parseInt(tagId) };
                }
            } else if (ifd === '1st') {
                for (const tagId in piexif.TAGS[ifd]) {
                    nameToTag[piexif.TAGS[ifd][tagId].name] = { ifd: '1st', id: parseInt(tagId) };
                }
            }
        }
        
        // Remove selected tags
        let removeXmp = false;
        let removeIptc = false;
        let removeIcc = false;
        const removedKeys = [];
        
        checkboxes.forEach(cb => {
            const keyParts = cb.dataset.key.split(':');
            const type = keyParts[0];
            const name = keyParts[1];
            
            removedKeys.push(cb.dataset.key);
            
            if (type === 'EXIF' || type === 'GPS') {
                const tagInfo = nameToTag[name];
                if (tagInfo && exifObj[tagInfo.ifd] && exifObj[tagInfo.ifd][tagInfo.id] !== undefined) {
                    delete exifObj[tagInfo.ifd][tagInfo.id];
                }
            } else if (type === 'XMP') {
                removeXmp = true;
            } else if (type === 'IPTC') {
                removeIptc = true;
            } else if (type === 'ICC') {
                removeIcc = true;
            }
        });
        
        // Dump and insert back
        const exifBytes = piexif.dump(exifObj);
        let newJpegData = piexif.insert(exifBytes, jpegData);
        
        // Remove other segments if requested
        if (removeXmp || removeIptc || removeIcc) {
            newJpegData = removeJpegSegments(newJpegData, removeXmp, removeIptc, removeIcc);
        }
        
        // Convert base64 back to blob
        const byteString = atob(newJpegData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        
        clearInterval(interval);
        progressFill.style.width = '100%';
        
        cleanHash = await calculateSHA512(blob);
        const cleanHash256 = await calculateSHA256(blob);
        const cleanHashMD5 = await calculateMD5(blob);
        const cleanHashCRC32 = await calculateCRC32(blob);
        
        setTimeout(() => {
            cleanSize = blob.size;
            cleanBlobUrl = URL.createObjectURL(blob);

            cleaningProgress.style.display = 'none';
            setPrivacyStatus('success', 'verified_user', 'Metadata seleccionada eliminada');
            
            resultSection.style.display = 'block';
            resultStats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Original Size</span>
                    <span class="stat-value strike">${formatBytes(originalSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Clean Size</span>
                    <span class="stat-value new">${formatBytes(cleanSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Saved</span>
                    <span class="stat-value">${formatBytes(originalSize - cleanSize)}</span>
                </div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                    <span class="stat-label">Clean CRC32</span>
                    <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span>
                </div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                    <span class="stat-label">Clean MD5</span>
                    <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span>
                </div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                    <span class="stat-label">Clean SHA-256</span>
                    <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span>
                </div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                    <span class="stat-label">Clean SHA-512</span>
                    <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
                </div>
            `;

            showDiffs(removedKeys);
            saveState(blob, removedKeys, 'selective');

            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 400);

    } catch (error) {
        clearInterval(interval);
        console.error(error);
        alert("Error al limpiar la imagen selectivamente.");
        btnClean.style.display = 'inline-flex';
        btnSelectiveClean.style.display = 'inline-flex';
        cleaningProgress.style.display = 'none';
    }
});

btnDownload.addEventListener('click', () => {
    if (!cleanBlobUrl || !currentFile) return;
    
    const link = document.createElement('a');
    link.href = cleanBlobUrl;
    
    const originalName = currentFile.name;
    const dotIndex = originalName.lastIndexOf('.');
    const name = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const ext = dotIndex !== -1 ? originalName.substring(dotIndex) : '.jpg';
    
    link.download = `${name}_clean${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

btnExport.addEventListener('click', () => {
    if (!currentFile) return;
    
    const report = {
        tool: "Privacy Inspector",
        timestamp: new Date().toISOString(),
        file: {
            name: currentFile.name,
            type: currentFile.type,
            originalSize: originalSize,
            cleanSize: cleanSize,
            bytesSaved: originalSize - cleanSize
        },
        security: {
            originalSHA512: originalHash,
            cleanSHA512: cleanHash
        },
        metadataRemoved: extractedTags
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const originalName = currentFile.name;
    const dotIndex = originalName.lastIndexOf('.');
    const name = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    
    link.download = `${name}_privacy_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});
