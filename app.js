const STORAGE_KEYS = {
    theme: 'privacyInspector.theme',
    batchHistory: 'privacyInspector.batchHistory'
};
const SAFE_THEMES = new Set(['light', 'dark']);

function safeStorageGet(storage, key) {
    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function safeStorageSet(storage, key, value) {
    try {
        storage.setItem(key, value);
    } catch {
        return false;
    }
    return true;
}

function getSavedTheme() {
    const savedTheme = safeStorageGet(localStorage, STORAGE_KEYS.theme);
    return SAFE_THEMES.has(savedTheme) ? savedTheme : 'light';
}

const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

html.setAttribute('data-theme', getSavedTheme());
updateThemeIcon(html.getAttribute('data-theme') || 'light');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

themeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    safeStorageSet(localStorage, STORAGE_KEYS.theme, newTheme);
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
const searchScopeFilter = document.getElementById('searchScopeFilter');
const severityFilter = document.getElementById('severityFilter');
const queryModeSelect = document.getElementById('queryMode');
const onlySensitiveToggle = document.getElementById('onlySensitiveToggle');

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
const screenLockOverlay = document.getElementById('screenLockOverlay');
const appContainer = document.querySelector('.app-container');
const previewStage = document.getElementById('previewStage');
const fileCategoryChip = document.getElementById('fileCategoryChip');
const fileMimeChip = document.getElementById('fileMimeChip');
const cleaningProfile = document.getElementById('cleaningProfile');
const educationModeToggle = document.getElementById('educationModeToggle');
const profileHint = document.getElementById('profileHint');
const riskSection = document.getElementById('riskSection');
const riskSummaryGrid = document.getElementById('riskSummaryGrid');
const riskTopIssues = document.getElementById('riskTopIssues');
const batchSection = document.getElementById('batchSection');
const batchQueueBadge = document.getElementById('batchQueueBadge');
const batchStatusText = document.getElementById('batchStatusText');
const batchSummaryGrid = document.getElementById('batchSummaryGrid');
const batchHistoryBody = document.getElementById('batchHistoryBody');
const batchEmptyState = document.getElementById('batchEmptyState');
const btnClearBatch = document.getElementById('btnClearBatch');
const btnExportBatch = document.getElementById('btnExportBatch');

let isScreenLocked = false;
let unlockTimer = null;
let previewBlobUrl = null;
let previousTitle = document.title;
let educationModeEnabled = false;
let batchQueue = [];
let isBatchProcessing = false;
let analysisHistory = [];
let lastAnalysisSummary = null;

const CODE_EXTENSIONS = new Set(['txt', 'md', 'json', 'xml', 'csv', 'log', 'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'java', 'kt', 'cs', 'cpp', 'c', 'h', 'hpp', 'py', 'rb', 'php', 'go', 'rs', 'swift', 'sql', 'sh', 'bat', 'ps1', 'toml', 'ini', 'conf', 'cfg', 'env', 'dockerfile']);
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'rtf', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif', 'tif', 'tiff']);

const ISO_BMFF_EXTENSIONS = new Set(['mp4', 'm4v', 'm4a', 'mov']);
const MP4_CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'dinf', 'edts', 'udta', 'ilst', 'meta', 'moof', 'traf', 'mfra', 'skip']);
const MP4_REMOVABLE_BOXES = new Set(['udta', 'uuid', 'ilst', 'xmp ']);
const BATCH_HISTORY_LIMIT = 25;

const CLEANING_PROFILES = {
    complete: {
        label: 'Completo',
        hint: 'Elimina toda la metadata compatible cuando el formato lo permite.',
        targets: ['EXIF', 'GPS', 'XMP', 'IPTC', 'ICC'],
        useFullClean: true
    },
    smart: {
        label: 'Privado inteligente',
        hint: 'Prioriza ubicación, identidad del dispositivo, autores y software de edición.',
        targets: ['GPS', 'Serial', 'Author', 'Creator', 'Software', 'Model', 'Make', 'Owner', 'Profile', 'Device']
    },
    basic: {
        label: 'Básico',
        hint: 'Quita geolocalización y rastros comunes de captura sin tocar todo el archivo.',
        targets: ['GPS', 'Latitude', 'Longitude', 'Altitude', 'Location']
    },
    'preserve-author': {
        label: 'Conservar autoría',
        hint: 'Reduce trazas técnicas y GPS, pero intenta conservar datos editoriales de autor.',
        targets: ['GPS', 'Latitude', 'Longitude', 'Altitude', 'Location', 'Serial', 'Software', 'Model', 'Make']
    },
    selective: {
        label: 'Selectivo manual',
        hint: 'Mantén el control manual marcando exactamente los campos a eliminar.',
        targets: []
    }
};

const EDUCATION_HINTS = {
    gps: 'La geolocalización puede revelar dónde vives, trabajas o qué ruta seguiste.',
    location: 'Una ubicación precisa suele ser suficiente para correlacionar hábitos o direcciones.',
    latitude: 'Las coordenadas exactas permiten reconstruir el punto de captura.',
    longitude: 'Combinada con latitud, la longitud ubica el archivo en un mapa real.',
    altitude: 'La altitud ayuda a perfilar el lugar exacto y el contexto del archivo.',
    exif: 'EXIF describe cómo y con qué dispositivo se generó el archivo.',
    software: 'El software usado revela editor, versión o flujo de trabajo.',
    model: 'El modelo del dispositivo ayuda a identificar el equipo de origen.',
    make: 'La marca del hardware permite perfilar fabricante y ecosistema.',
    serial: 'Los números de serie son identificadores persistentes del dispositivo.',
    author: 'Autoría y creador pueden exponer identidad personal o corporativa.',
    creator: 'El campo creador suele viajar con el archivo aunque se comparta externamente.',
    phone: 'Un teléfono puede vincular el archivo con una persona concreta.',
    email: 'Un correo expone identidad y canal directo de contacto.',
    creditcard: 'Números de tarjeta son datos críticos y deben eliminarse o rotarse.',
    imei: 'IMEI identifica de forma única un dispositivo móvil.',
    imsi: 'IMSI identifica la suscripción móvil y es altamente sensible.',
    ssn: 'Identificadores nacionales son datos personales de alta sensibilidad.',
    bitcoin: 'Una dirección de cartera puede vincular actividad financiera.',
    ethereum: 'Una dirección blockchain permite correlacionar operaciones públicas.',
    hash: 'Los hashes permiten verificar integridad, no son metadatos sensibles por sí solos.'
};

function inferMimeType(extLower = '') {
    const ext = String(extLower || '').toLowerCase();
    const mimeMap = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp',
        svg: 'image/svg+xml',
        avif: 'image/avif',
        tif: 'image/tiff',
        tiff: 'image/tiff',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
        mkv: 'video/x-matroska',
        avi: 'video/x-msvideo',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        m4a: 'audio/mp4',
        aac: 'audio/aac',
        flac: 'audio/flac',
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        doc: 'application/msword',
        txt: 'text/plain',
        md: 'text/markdown',
        json: 'application/json',
        js: 'application/javascript',
        mjs: 'application/javascript',
        cjs: 'application/javascript',
        css: 'text/css',
        html: 'text/html',
        htm: 'text/html',
        xml: 'application/xml',
        csv: 'text/csv'
    };
    return mimeMap[ext] || 'application/octet-stream';
}

function getFileCategory(file, extLower = '', mimeType = '') {
    const mime = String(mimeType || file?.type || '').toLowerCase();
    const ext = String(extLower || '').toLowerCase();
    if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) {
        return mime === 'image/gif' || ext === 'gif' ? 'GIF / imagen animada' : 'Imagen';
    }
    if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) return 'Vídeo';
    if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) return 'Audio';
    if (mime === 'application/pdf' || ext === 'pdf') return 'PDF';
    if (mime.includes('wordprocessingml') || ['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'Documento';
    if (isTextLikeFile(file || { type: mime }, ext) || CODE_EXTENSIONS.has(ext)) {
        return CODE_EXTENSIONS.has(ext) ? 'Código / texto' : 'Texto';
    }
    if (DOCUMENT_EXTENSIONS.has(ext)) return 'Documento';
    return 'Archivo binario';
}

function getPreviewIcon(category = '') {
    if (category.includes('Imagen') || category.includes('GIF')) return 'image';
    if (category.includes('Vídeo')) return 'movie';
    if (category.includes('Audio')) return 'audio_file';
    if (category.includes('PDF')) return 'picture_as_pdf';
    if (category.includes('Documento')) return 'description';
    if (category.includes('Código')) return 'code';
    if (category.includes('Texto')) return 'article';
    return 'draft';
}

function getPreviewContainerClass(mimeType = '', category = '', extLower = '') {
    const mime = String(mimeType || '').toLowerCase();
    const ext = String(extLower || '').toLowerCase();
    const cat = String(category || '').toLowerCase();
    
    if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) return 'preview-media--video';
    if (mime.startsWith('image/') && (ext === 'gif' || mime === 'image/gif')) return 'preview-media--gif';
    if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) return 'preview-media--image';
    if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) return 'preview-media--audio';
    if (mime === 'application/pdf' || ext === 'pdf') return 'preview-media--pdf';
    if (isTextLikeFile({ type: mime }, ext) || CODE_EXTENSIONS.has(ext)) return 'preview-media--text';
    return '';
}

function isIsoBmffMedia(extLower = '', mimeType = '') {
    const ext = String(extLower || '').toLowerCase();
    const mime = String(mimeType || '').toLowerCase();
    return ISO_BMFF_EXTENSIONS.has(ext) || mime === 'video/mp4' || mime === 'audio/mp4' || mime === 'video/quicktime';
}

function canCleanMetadata(file, extLower = '', mimeType = '') {
    const mime = String(mimeType || file?.type || '').toLowerCase();
    return mime.startsWith('image/') || isIsoBmffMedia(extLower, mime);
}

function canSelectiveCleanMetadata(file, extLower = '', mimeType = '') {
    const mime = String(mimeType || file?.type || '').toLowerCase();
    return mime.startsWith('image/');
}

function setFileHeader(category, mime) {
    if (fileCategoryChip) fileCategoryChip.textContent = category || 'Sin clasificar';
    if (fileMimeChip) fileMimeChip.textContent = mime || 'MIME no detectado';
}

function formatFindingsSummary(values) {
    const count = values.length;
    if (!count) return 'Sin valores concretos';
    if (count === 1) return '1 valor único detectado';
    return `${count} valores únicos detectados`;
}

function safeJsonParse(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function readBatchHistory() {
    const parsed = safeJsonParse(safeStorageGet(sessionStorage, STORAGE_KEYS.batchHistory), []);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, BATCH_HISTORY_LIMIT);
}

function writeBatchHistory() {
    safeStorageSet(sessionStorage, STORAGE_KEYS.batchHistory, JSON.stringify(analysisHistory.slice(0, BATCH_HISTORY_LIMIT)));
}

function getEducationHint(label = '') {
    const normalized = String(label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = Object.keys(EDUCATION_HINTS).find(entry => normalized.includes(entry));
    return key ? EDUCATION_HINTS[key] : '';
}

function normalizeNullLikeValue(value = '') {
    const raw = String(value ?? '');
    const compact = raw.replace(/[\u0000\s]/g, '');
    if (!compact) return 'No definido (normal en perfil genérico)';
    return raw;
}

function isBenignIccField(label = '', value = '') {
    const normalizedLabel = String(label || '').toLowerCase();
    const normalizedValue = normalizeNullLikeValue(value).toLowerCase();

    const benignKeyPatterns = [
        'preferred cmm type',
        'profile version',
        'profile/device class',
        'color space',
        'connection space',
        'icc profile date',
        'icc signature',
        'primary platform',
        'device manufacturer',
        'device model number',
        'rendering intent',
        'profile creator',
        'icc description',
        'icc copyright'
    ];

    const benignValuePatterns = [
        /^no definido \(normal en perfil genérico\)$/,
        /^srgb$/,
        /^rgb$/,
        /^rgb $/,
        /^xyz$/,
        /^xyz $/,
        /^acsp$/,
        /^mntr$/,
        /^display device profile$/,
        /^relative colorimetric$/,
        /^google inc\. 2016$/,
        /^4\.[0-9.]+$/,
        /^201[0-9]-[0-9]{2}-[0-9]{2}t/i
    ];

    return benignKeyPatterns.some(pattern => normalizedLabel.includes(pattern)) && benignValuePatterns.some(pattern => pattern.test(normalizedValue));
}

function isIccEntryLikelySafe(label = '', value = '') {
    const normalizedLabel = String(label || '').toLowerCase();
    const normalizedValue = normalizeNullLikeValue(value);
    if (!normalizedLabel.includes('icc')) return false;
    if (hasSuspiciousScriptPayload(normalizedValue)) return false;
    return isBenignIccField(label, normalizedValue) || normalizedValue === 'No definido (normal en perfil genérico)';
}

function getIccProfileSummary(iccTags = {}) {
    const description = iccTags['ICC Description']?.description || iccTags['ICC Description']?.value || '';
    const colorSpace = iccTags['Color Space']?.description || iccTags['Color Space']?.value || '';
    const deviceClass = iccTags['Profile/Device class']?.description || iccTags['Profile/Device class']?.value || '';

    if (!description && !colorSpace && !deviceClass) return '';
    const parts = [];
    if (description) parts.push(String(description).trim());
    if (colorSpace) parts.push(String(colorSpace).trim());
    if (deviceClass) parts.push(String(deviceClass).trim());
    return parts.join(' · ');
}

function inferRiskLevel(label = '', value = '', valueClass = '', containerId = '') {
    const haystack = `${label} ${value} ${containerId}`.toLowerCase();
    if (isIccEntryLikelySafe(label, value)) {
        return 'low';
    }
    if (containerId === 'geoGrid' || /creditcard|imei|imsi|ssn|passport|gps|latitude|longitude|path traversal|macro|javascript|script|executable|payload/.test(haystack)) {
        return 'critical';
    }
    if (valueClass.includes('sensitive') || /email|phone|author|creator|serial|wallet|bitcoin|ethereum|url|ipv4|mac address/.test(haystack)) {
        return 'high';
    }
    if (valueClass.includes('warning') || /software|model|make|device|metadata|xmp|iptc|icc|pdf|docx|zip|warning/.test(haystack)) {
        return 'medium';
    }
    return 'low';
}

function getRiskLabel(level) {
    switch (level) {
        case 'critical': return 'Crítico';
        case 'high': return 'Alto';
        case 'medium': return 'Medio';
        default: return 'Bajo';
    }
}

function getRiskIcon(level) {
    switch (level) {
        case 'critical': return 'gpp_bad';
        case 'high': return 'warning';
        case 'medium': return 'report';
        default: return 'info';
    }
}

function clearElement(element) {
    if (!element) return;
    while (element.firstChild) element.removeChild(element.firstChild);
}

function appendTextWithHighlight(element, text, query) {
    const source = String(text || '');
    const normalizedQuery = String(query || '').trim();
    clearElement(element);
    if (!normalizedQuery) {
        element.textContent = source;
        return;
    }

    const lowerSource = source.toLowerCase();
    const lowerQuery = normalizedQuery.toLowerCase();
    let searchIndex = 0;
    let matchIndex = lowerSource.indexOf(lowerQuery);

    while (matchIndex !== -1) {
        if (matchIndex > searchIndex) {
            element.appendChild(document.createTextNode(source.slice(searchIndex, matchIndex)));
        }
        const mark = document.createElement('mark');
        mark.textContent = source.slice(matchIndex, matchIndex + lowerQuery.length);
        element.appendChild(mark);
        searchIndex = matchIndex + lowerQuery.length;
        matchIndex = lowerSource.indexOf(lowerQuery, searchIndex);
    }

    if (searchIndex < source.length) {
        element.appendChild(document.createTextNode(source.slice(searchIndex)));
    }
}

function buildStatItem(label, value, className = '', inlineStyle = '') {
    const item = document.createElement('div');
    item.className = 'stat-item';
    if (inlineStyle) item.style.cssText = inlineStyle;

    const labelEl = document.createElement('span');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = `stat-value${className ? ` ${className}` : ''}`;
    valueEl.textContent = value;

    item.appendChild(labelEl);
    item.appendChild(valueEl);
    return item;
}

function renderResultStats(items) {
    clearElement(resultStats);
    items.forEach(item => {
        resultStats.appendChild(buildStatItem(item.label, item.value, item.className || '', item.style || ''));
    });
}

function collectCheckedKeys() {
    return Array.from(document.querySelectorAll('.remove-checkbox:checked')).map(cb => cb.dataset.key);
}

function applyCleaningProfileSelection(profileName) {
    const profile = CLEANING_PROFILES[profileName] || CLEANING_PROFILES.complete;
    profileHint.textContent = profile.hint;
    const checkboxes = document.querySelectorAll('.remove-checkbox');
    if (!checkboxes.length) return;
    checkboxes.forEach(checkbox => {
        const key = String(checkbox.dataset.key || '').toLowerCase();
        const shouldCheck = profile.targets.some(target => key.includes(String(target).toLowerCase()));
        checkbox.checked = profileName === 'complete' ? true : shouldCheck;
    });
}

function summarizeRiskFromRows() {
    const rows = document.querySelectorAll('#contentGrid .data-row, #geoGrid .data-row, #exifGrid .data-row, #extendedGrid .data-row');
    const buckets = {
        critical: [],
        high: [],
        medium: [],
        low: []
    };

    rows.forEach(row => {
        if (row.style.display === 'none') return;
        const label = row.dataset.label || row.querySelector('.data-label')?.textContent || '';
        const value = row.dataset.value || row.querySelector('.data-value')?.textContent || '';
        const valueClass = row.dataset.valueClass || '';
        const level = row.dataset.riskLevel || inferRiskLevel(label, value, valueClass, row.dataset.containerId || '');
        buckets[level].push({ label, value, level });
    });

    return buckets;
}

function renderRiskPanel() {
    const buckets = summarizeRiskFromRows();
    const totals = Object.fromEntries(Object.entries(buckets).map(([level, entries]) => [level, entries.length]));
    const totalIssues = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

    if (!totalIssues) {
        riskSection.style.display = 'none';
        clearElement(riskSummaryGrid);
        clearElement(riskTopIssues);
        return;
    }

    riskSection.style.display = 'block';
    clearElement(riskSummaryGrid);
    clearElement(riskTopIssues);

    ['critical', 'high', 'medium', 'low'].forEach(level => {
        const card = document.createElement('div');
        card.className = `risk-card risk-card-${level}`;

        const title = document.createElement('span');
        title.className = 'risk-card-title';
        title.textContent = getRiskLabel(level);

        const value = document.createElement('span');
        value.className = 'risk-card-value';
        value.textContent = String(totals[level]);

        const top = document.createElement('span');
        top.className = 'risk-card-top';
        top.textContent = buckets[level].slice(0, 2).map(entry => entry.label).join(' · ') || 'Sin hallazgos';

        card.appendChild(title);
        card.appendChild(value);
        card.appendChild(top);
        riskSummaryGrid.appendChild(card);
    });

    const topIssues = [...buckets.critical, ...buckets.high, ...buckets.medium].slice(0, 8);
    topIssues.forEach(issue => {
        const pill = document.createElement('span');
        pill.className = `risk-issue-pill severity-pill-${issue.level}`;
        pill.textContent = `${getRiskLabel(issue.level)} · ${issue.label}`;
        riskTopIssues.appendChild(pill);
    });
}

function getBatchRiskLevel(score) {
    if (score < 4) return 'critical';
    if (score < 6.5) return 'high';
    if (score < 8.5) return 'medium';
    return 'low';
}

function renderBatchSummary() {
    batchSection.style.display = analysisHistory.length ? 'block' : 'none';
    clearElement(batchSummaryGrid);
    clearElement(batchHistoryBody);

    if (!analysisHistory.length) {
        batchEmptyState.style.display = 'block';
        batchStatusText.textContent = 'Todavía no hay análisis acumulados en esta sesión.';
        return;
    }

    batchEmptyState.style.display = 'none';
    const averageScore = analysisHistory.reduce((sum, entry) => sum + entry.score, 0) / analysisHistory.length;
    const criticalCount = analysisHistory.filter(entry => entry.riskLevel === 'critical').length;
    const sensitiveCount = analysisHistory.reduce((sum, entry) => sum + entry.findings, 0);
    const categories = new Set(analysisHistory.map(entry => entry.category)).size;
    const summaryItems = [
        { label: 'Archivos analizados', value: String(analysisHistory.length) },
        { label: 'Índice medio', value: averageScore.toFixed(1) },
        { label: 'Lotes críticos', value: String(criticalCount) },
        { label: 'Hallazgos totales', value: String(sensitiveCount) },
        { label: 'Categorías vistas', value: String(categories) }
    ];

    summaryItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'batch-stat-card';
        const label = document.createElement('span');
        label.className = 'batch-stat-label';
        label.textContent = item.label;
        const value = document.createElement('span');
        value.className = 'batch-stat-value';
        value.textContent = item.value;
        card.appendChild(label);
        card.appendChild(value);
        batchSummaryGrid.appendChild(card);
    });

    analysisHistory.forEach(entry => {
        const row = document.createElement('tr');
        const cells = [
            `<strong class="batch-file-name">${entry.name}</strong><div class="batch-subtext">${entry.sizeLabel}</div>`,
            `${entry.category}`,
            `${entry.score.toFixed(1)}`,
            `${getRiskLabel(entry.riskLevel)}`,
            `${entry.findings}`,
            `${entry.timeLabel}`
        ];

        cells.forEach((value, index) => {
            const cell = document.createElement('td');
            if (index === 0) {
                const name = document.createElement('div');
                name.className = 'batch-file-name';
                name.textContent = entry.name;
                const meta = document.createElement('div');
                meta.className = 'batch-subtext';
                meta.textContent = entry.sizeLabel;
                cell.appendChild(name);
                cell.appendChild(meta);
            } else if (index === 3) {
                cell.className = `batch-risk-text batch-risk-${entry.riskLevel}`;
                cell.textContent = getRiskLabel(entry.riskLevel);
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });
        batchHistoryBody.appendChild(row);
    });

    batchStatusText.textContent = isBatchProcessing
        ? `Procesando lote: ${batchQueue.length} archivo(s) pendientes.`
        : `Historial activo de ${analysisHistory.length} análisis en esta sesión.`;
}

function addBatchEntry(summary) {
    const exists = analysisHistory.find(entry => entry.name === summary.name && entry.timestamp === summary.timestamp);
    if (exists) return;
    analysisHistory.unshift(summary);
    analysisHistory = analysisHistory.slice(0, BATCH_HISTORY_LIMIT);
    writeBatchHistory();
    renderBatchSummary();
}

function updateBatchQueueBadge() {
    batchQueueBadge.textContent = batchQueue.length
        ? `${batchQueue.length} archivo(s) en cola`
        : 'Sin lote en cola';
}

function clearThreatSummaries() {
    document.querySelectorAll('.security-threat-summary').forEach(node => node.remove());
}

function clearPreviewStage() {
    if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        previewBlobUrl = null;
    }
    if (!previewStage) return;
    
    previewStage.innerHTML = '';
    previewStage.classList.remove('preview-media--video', 'preview-media--audio', 'preview-media--image', 'preview-media--gif', 'preview-media--pdf', 'preview-media--text');
    
    if (previewStage.parentElement?.classList) {
        previewStage.parentElement.classList.remove('preview-wrapper--enhanced');
    }
    
    previewStage.appendChild(filePreview);
    filePreview.removeAttribute('src');
    filePreview.classList.remove('preview-media--video', 'preview-media--audio', 'preview-media--image', 'preview-media--gif', 'preview-media--pdf', 'preview-media--text');
    filePreview.style.display = 'none';
}

function createPreviewFileCard(name, category, mimeType) {
    const card = document.createElement('div');
    card.className = 'preview-file-card';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-rounded';
    icon.textContent = getPreviewIcon(category);

    const type = document.createElement('span');
    type.className = 'preview-file-type';
    type.textContent = category;

    const strong = document.createElement('strong');
    strong.className = 'preview-file-name';
    strong.textContent = name;

    const meta = document.createElement('span');
    meta.className = 'preview-file-meta';
    meta.textContent = mimeType || 'Formato no identificado';

    card.appendChild(icon);
    card.appendChild(type);
    card.appendChild(strong);
    card.appendChild(meta);
    return card;
}

async function renderFilePreview(source, options = {}) {
    const { name = 'archivo', extLower = '', mimeType = inferMimeType(extLower), category = getFileCategory({ type: mimeType }, extLower, mimeType) } = options;
    clearPreviewStage();
    if (!previewStage) return;
    previewBlobUrl = URL.createObjectURL(source);

    const containerClass = getPreviewContainerClass(mimeType, category, extLower);
    if (containerClass && previewStage.parentElement?.classList) {
        previewStage.parentElement.classList.add('preview-wrapper--enhanced');
    }

    if (mimeType.startsWith('image/')) {
        filePreview.src = previewBlobUrl;
        filePreview.classList.add(containerClass);
        filePreview.style.display = 'block';
        return;
    }

    if (mimeType.startsWith('video/')) {
        const video = document.createElement('video');
        video.className = `preview-media ${containerClass}`;
        video.src = previewBlobUrl;
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        previewStage.appendChild(video);
        
        video.addEventListener('loadedmetadata', async () => {
            try {
                if (video.videoWidth <= 0 || video.videoHeight <= 0) {
                    console.warn('Dimensiones de video inválidas (0x0)');
                    return;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                if (canvas.width <= 0 || canvas.height <= 0) {
                    console.warn('Canvas creado con dimensiones inválidas');
                    canvas.remove();
                    return;
                }
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.warn('No se pudo obtener contexto 2D del canvas');
                    canvas.remove();
                    return;
                }
                
                const targetTime = Math.min(1, video.duration * 0.1);
                let thumbnailGenerated = false;
                let seekTimeout = null;
                
                const onSeeked = () => {
                    if (thumbnailGenerated) return;
                    thumbnailGenerated = true;
                    
                    if (seekTimeout) clearTimeout(seekTimeout);
                    
                    try {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
                        if (thumbnailUrl && thumbnailUrl.startsWith('data:')) {
                            video.poster = thumbnailUrl;
                        }
                    } catch (drawErr) {
                        console.warn('Error dibujando thumbnail:', drawErr);
                    } finally {
                        canvas.remove();
                        video.removeEventListener('seeked', onSeeked);
                    }
                };
                
                seekTimeout = setTimeout(() => {
                    if (!thumbnailGenerated) {
                        thumbnailGenerated = true;
                        console.warn('Timeout generando thumbnail de video');
                        video.removeEventListener('seeked', onSeeked);
                        canvas.remove();
                    }
                }, 2000);
                
                video.addEventListener('seeked', onSeeked, { once: true });
                video.currentTime = targetTime;
                
            } catch (e) {
                console.warn('Error al generar thumbnail del vídeo:', e);
            }
        }, { once: true });
        return;
    }

    if (mimeType.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.className = `preview-media ${containerClass}`;
        audio.src = previewBlobUrl;
        audio.controls = true;
        audio.preload = 'metadata';
        previewStage.appendChild(audio);
        previewStage.appendChild(createPreviewFileCard(name, category, mimeType));
        return;
    }

    if (mimeType === 'application/pdf') {
        const frame = document.createElement('iframe');
        frame.className = `preview-frame ${containerClass}`;
        frame.src = previewBlobUrl;
        frame.title = `Vista previa de ${name}`;
        frame.sandbox = '';
        frame.referrerPolicy = 'no-referrer';
        frame.loading = 'lazy';
        previewStage.appendChild(frame);
        return;
    }

    if (isTextLikeFile({ type: mimeType }, extLower) || CODE_EXTENSIONS.has(extLower)) {
        const pre = document.createElement('pre');
        pre.className = `preview-text ${containerClass}`;
        try {
            const snippet = await source.slice(0, 12000).text();
            pre.textContent = snippet || 'Archivo de texto vacío';
        } catch {
            pre.textContent = 'No se pudo leer una vista previa textual del archivo.';
        }
        previewStage.appendChild(pre);
        return;
    }

    previewStage.appendChild(createPreviewFileCard(name, category, mimeType));
}

function setScreenLocked(locked) {
    if (isScreenLocked === locked) return;
    isScreenLocked = locked;

    if (locked) {
        document.body.classList.add('screen-locked');
        previousTitle = document.title;
        document.title = 'Pantalla protegida';
        if (screenLockOverlay) {
            screenLockOverlay.style.display = 'flex';
            screenLockOverlay.setAttribute('aria-hidden', 'false');
        }
        if (appContainer) {
            appContainer.setAttribute('aria-hidden', 'true');
            appContainer.inert = true;
        }
        return;
    }

    document.body.classList.remove('screen-locked');
    document.title = previousTitle || 'Privacy Inspector';
    if (screenLockOverlay) {
        screenLockOverlay.style.display = 'none';
        screenLockOverlay.setAttribute('aria-hidden', 'true');
    }
    if (appContainer) {
        appContainer.removeAttribute('aria-hidden');
        appContainer.inert = false;
    }
}

function scheduleUnlock() {
    if (unlockTimer) clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
        const keepLocked = document.hidden || !document.hasFocus();
        setScreenLocked(keepLocked);
    }, 120);
}

function enforceScreenLock() {
    const shouldLock = document.hidden || !document.hasFocus();
    setScreenLocked(shouldLock);
}

document.addEventListener('visibilitychange', enforceScreenLock, { passive: true });
window.addEventListener('blur', () => setScreenLocked(true), { passive: true });
window.addEventListener('focus', scheduleUnlock, { passive: true });
window.addEventListener('pagehide', () => setScreenLocked(true), { passive: true });
window.addEventListener('pageshow', scheduleUnlock, { passive: true });
document.addEventListener('keydown', (event) => {
    if (event.key === 'PrintScreen' || event.code === 'PrintScreen') {
        setScreenLocked(true);
        // Limpiar portapapeles si es posible
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
        }
    }
}, true);

// Bloquear captura de pantalla
if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
    navigator.mediaDevices.getDisplayMedia = () => Promise.reject(new DOMException('Screen capture blocked', 'NotAllowedError'));
}

// Bloquear salir de la página
window.addEventListener('beforeunload', (e) => {
    setScreenLocked(true);
    e.preventDefault();
    e.returnValue = '';
});

// Prevenir menú contextual y arrastre
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

enforceScreenLock();

analysisHistory = readBatchHistory();
renderBatchSummary();
updateBatchQueueBadge();
if (cleaningProfile && CLEANING_PROFILES[cleaningProfile.value]) {
    profileHint.textContent = CLEANING_PROFILES[cleaningProfile.value].hint;
}

educationModeToggle?.addEventListener('change', () => {
    educationModeEnabled = educationModeToggle.checked;
    if (currentFile) {
        handleFile(currentFile, { preserveBatch: true, source: 'education-toggle' });
    }
});

cleaningProfile?.addEventListener('change', () => {
    applyCleaningProfileSelection(cleaningProfile.value);
});

btnClearBatch?.addEventListener('click', () => {
    analysisHistory = [];
    writeBatchHistory();
    renderBatchSummary();
});

btnExportBatch?.addEventListener('click', () => {
    if (!analysisHistory.length) return;
    const blob = new Blob([JSON.stringify({
        tool: 'Privacy Inspector',
        exportedAt: new Date().toISOString(),
        batch: analysisHistory
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'privacy_inspector_batch_report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

async function processBatch(files) {
    if (!files.length) return;
    batchQueue = [...files];
    isBatchProcessing = true;
    updateBatchQueueBadge();
    renderBatchSummary();

    while (batchQueue.length) {
        const nextFile = batchQueue.shift();
        updateBatchQueueBadge();
        renderBatchSummary();
        await handleFile(nextFile, { source: 'batch' });
    }

    isBatchProcessing = false;
    updateBatchQueueBadge();
    renderBatchSummary();
}

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
    const currentExt = (currentFile?.name.split('.').pop() || '').toLowerCase();
    const activeMime = state.blob.type || currentFile?.type || inferMimeType(currentExt);
    const activeCategory = getFileCategory({ type: activeMime }, currentExt, activeMime);
    
    await renderFilePreview(state.blob, {
        name: currentFile?.name || 'archivo',
        extLower: currentExt,
        mimeType: activeMime,
        category: activeCategory
    });

    if (canCleanMetadata(currentFile, currentExt, activeMime)) {
        btnClean.style.display = 'inline-flex';
        if (typeof btnSelectiveClean !== 'undefined') {
            btnSelectiveClean.style.display = canSelectiveCleanMetadata(currentFile, currentExt, activeMime) ? 'inline-flex' : 'none';
        }
    } else {
        btnClean.style.display = 'none';
        if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'none';
    }

    setFileHeader(activeCategory, state.type === 'original' ? 'Estado original' : 'Vista del archivo limpio');
    
    cleanHash = await calculateSHA512(state.blob);
    const cleanHash256 = await calculateSHA256(state.blob);
    const cleanHashMD5 = await calculateMD5(state.blob);
    const cleanHashCRC32 = await calculateCRC32(state.blob);
    
    renderResultStats([
        { label: 'Original Size', value: formatBytes(originalSize), className: 'strike' },
        { label: 'Clean Size', value: formatBytes(cleanSize), className: 'new' },
        { label: 'Saved', value: formatBytes(originalSize - cleanSize) },
        { label: 'Clean CRC32', value: cleanHashCRC32, className: 'hash-value', style: 'grid-column: 1 / -1; margin-top: 8px;' },
        { label: 'Clean MD5', value: cleanHashMD5, className: 'hash-value', style: 'grid-column: 1 / -1; margin-top: 4px;' },
        { label: 'Clean SHA-256', value: cleanHash256, className: 'hash-value', style: 'grid-column: 1 / -1; margin-top: 4px;' },
        { label: 'Clean SHA-512', value: cleanHash, className: 'hash-value', style: 'grid-column: 1 / -1; margin-top: 4px;' }
    ]);
    
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
const TECHNICAL_FILE_TAGS = new Set([
    'BitsPerSample',
    'ColorComponents',
    'EncodingProcess',
    'FileAccessDate',
    'FileInodeChangeDate',
    'FileModifyDate',
    'FilePermissions',
    'FileSize',
    'FileType',
    'FileTypeExtension',
    'ImageHeight',
    'ImageSize',
    'ImageWidth',
    'JFIFVersion',
    'MIMEType',
    'Megapixels',
    'ResolutionUnit',
    'XResolution',
    'YCbCrSubSampling',
    'YResolution'
]);

const REGEX_PATTERNS = {
    'Email': { regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, penalty: 1.0, validator: isValidEmail },
    'IPv4': { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, penalty: 0.5, validator: isValidIPv4 },
    'URL': { regex: /https?:\/\/[^\s"'<>]+/g, penalty: 0.2, validator: isValidUrl },
    'MAC Address': { regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g, penalty: 1.0, validator: isValidMac },
    'IMEI': { regex: /\b\d{15}\b/g, penalty: 2.0, validator: isValidIMEI },
    'IMSI': { regex: /\b\d{15}\b/g, penalty: 2.0, validator: isLikelyIMSI },
    'CreditCard': { regex: /\b(?:\d[ -]*?){13,19}\b/g, penalty: 3.0, validator: isValidCreditCard },
    'Phone': { regex: /(?:^|[^\d])((?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-])\d{2,4}[\s.-]\d{3,5})(?!\d)/g, penalty: 1.5, validator: isLikelyPhone, useCaptureGroup: true },
    'Passport': { regex: /\b[A-Z]{1,2}\d{6,9}\b/g, penalty: 3.0 },
    'SSN': { regex: /\b\d{3}-\d{2}-\d{4}\b/g, penalty: 3.0, validator: isValidSSN },
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

function isValidIPv4(value, rawText = '', matchIndex = -1) {
    const parts = String(value || '').trim().split('.');
    if (parts.length !== 4) return false;
    
    // Si la cadena "IP" está cerca, dar más peso. Pero para no romper, simplemente comprobamos si son válidos.
    const allPartsValid = parts.every(part => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const n = Number(part);
        return n >= 0 && n <= 255;
    });

    if (!allPartsValid) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 60), matchIndex).toLowerCase();
        if (/\b(?:version|ver|v|id|length|size|type|build)\s*[:=]?\s*$/.test(prefix)) return false;
        
        if (/([a-f0-9,<>{}'"\\]{15,})$/i.test(prefix)) return false; 
    }

    const n0 = Number(parts[0]);
    const n1 = Number(parts[1]);
    const n2 = Number(parts[2]);
    const n3 = Number(parts[3]);

    if (n0 === 0) return false;
    
    // Versiones comunes false positives
    if (n0 <= 20 && n1 <= 20 && n2 <= 20 && n3 <= 255) {
        return false;
    }

    return true;
}

function isValidMac(value, rawText = '', matchIndex = -1) {
    if (!value) return false;
    if (matchIndex > -1 && rawText) {
        const prefixChar = rawText.charAt(matchIndex - 1);
        const suffixChar = rawText.charAt(matchIndex + value.length);
        if (/[A-Fa-f0-9-]/.test(prefixChar) || /[A-Fa-f0-9-]/.test(suffixChar)) {
            return false;
        }
    }
    // Evitar falsos positivos como ceros consecutivos o cadenas tontas
    if (/^(00[:-]){5}00$|^(ff[:-]){5}ff$/i.test(value)) return false;
    return true;
}

function isValidUrl(value) {
    try {
        const url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function isValidIMEI(value, rawText = '', matchIndex = -1) {
    const digits = normalizeDigits(value);
    if (digits.length !== 15 || !luhnCheck(digits)) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 40), matchIndex).toUpperCase();
        if (prefix.includes('MAINWINDOW') || prefix.includes('HDITEM') || 
            prefix.includes('VERSION') || prefix.includes('ID') || 
            prefix.includes('PRODUCT') || prefix.includes('SERIAL') || 
            prefix.includes('LENGTH') || prefix.includes('SIZE')) {
            return false;
        }
        if (/([A-F0-9,<>{}'"\\]{15,})$/i.test(prefix)) {
            return false;
        }
    }
    return true;
}

function isLikelyIMSI(value, rawText = '', matchIndex = -1) {
    const digits = normalizeDigits(value);
    if (digits.length !== 15) return false;
    if (/^(\d)\1{14}$/.test(digits)) return false;
    if (/^0+$/.test(digits)) return false;
    if (luhnCheck(digits)) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 40), matchIndex).toUpperCase();
        if (prefix.includes('MAINWINDOW') || prefix.includes('HDITEM') || 
            prefix.includes('VERSION') || prefix.includes('ID') || 
            prefix.includes('PRODUCT') || prefix.includes('SERIAL') || 
            prefix.includes('LENGTH') || prefix.includes('SIZE')) {
            return false;
        }
        if (/([A-F0-9,<>{}'"\\]{15,})$/i.test(prefix)) {
            return false;
        }
    }
    return true;
}

function isValidSSN(value, rawText = '', matchIndex = -1) {
    if (/^000|666|9\d{2}/.test(value)) return false; 
    if (/-00-/.test(value)) return false;
    if (/0000$/.test(value)) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 40), matchIndex).toUpperCase();
        if (prefix.includes('MAINWINDOW') || prefix.includes('HDITEM') || 
            prefix.includes('VERSION') || prefix.includes('ID') || 
            prefix.includes('PRODUCT') || prefix.includes('SERIAL') || 
            prefix.includes('LENGTH') || prefix.includes('SIZE')) {
            return false;
        }
        if (/([A-F0-9,<>{}'"\\]{15,})$/i.test(prefix)) {
            return false;
        }
    }
    return true;
}

function isLikelyPhone(value, rawText = '', matchIndex = -1) {
    const raw = String(value || '').trim();
    if (!raw || /^-\d+$/.test(raw)) return false;

    if (/^\d{4}[-/.]\d{2}[-/.]\d{2}/.test(raw)) return false;
    if (/^\d{2}[-/.]\d{2}[-/.]\d{4}/.test(raw)) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 60), matchIndex).toUpperCase();
        if (prefix.includes('MAINWINDOW') || prefix.includes('HDITEM') || 
            prefix.includes('VERSION') || prefix.includes('ID') || 
            prefix.includes('PRODUCT') || prefix.includes('SERIAL') || 
            prefix.includes('LENGTH') || prefix.includes('SIZE') ||
            prefix.includes('DATE') || prefix.includes('TIME') ||
            prefix.includes('CREATION') || prefix.includes('MODIFIED')) {
            return false;
        }
        if (/([A-F0-9,<>{}'"\\]{15,})$/i.test(prefix)) {
            return false;
        }
    }

    if (!/[+\s().-]/.test(raw)) return false;
    const digits = normalizeDigits(raw);
    if (digits.length < 10 || digits.length > 15) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    if (/^012345/.test(digits) || /^123456/.test(digits)) return false;
    if (luhnCheck(digits) && digits.length >= 13) return false;
    return true;
}

function isValidCreditCard(value, rawText = '', matchIndex = -1) {
    const digits = normalizeDigits(value);
    if (digits.length < 13 || digits.length > 19) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    if (!/^[3456]/.test(digits)) return false;

    if (matchIndex > -1 && rawText) {
        const prefix = rawText.substring(Math.max(0, matchIndex - 60), matchIndex).toUpperCase();
        if (prefix.includes('MAINWINDOW') || prefix.includes('HDITEM') || 
            prefix.includes('VERSION') || prefix.includes('ID') || 
            prefix.includes('PRODUCT') || prefix.includes('SERIAL') || 
            prefix.includes('LENGTH') || prefix.includes('SIZE')) {
            return false;
        }
        if (/([A-F0-9,<>{}'"\\]{15,})$/i.test(prefix)) {
            return false;
        }
    }
    
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

function isTechnicalExifTag(key, value) {
    if (TECHNICAL_FILE_TAGS.has(key)) return true;
    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) return false;
    if (/^\d+x\d+$/i.test(normalizedValue)) return true;
    if (/^image\/[a-z0-9.+-]+$/i.test(normalizedValue)) return true;
    if (/^progressive dct/i.test(normalizedValue)) return true;
    return false;
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
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    if (files.length > 1) {
        processBatch(files);
        return;
    }
    handleFile(files[0]);
});

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    if (files.length > 1) {
        processBatch(files);
        return;
    }
    handleFile(files[0]);
});

document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
                e.preventDefault();
                processBatch([file]);
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

async function sniffFileSignature(file) {
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const ascii = Array.from(header).map(byte => String.fromCharCode(byte)).join('');
    const hex = Array.from(header).map(byte => byte.toString(16).padStart(2, '0')).join('');

    if (hex.startsWith('ffd8ff')) return 'image/jpeg';
    if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
    if (ascii.startsWith('GIF8')) return 'image/gif';
    if (ascii.startsWith('%PDF')) return 'application/pdf';
    if (ascii.slice(4, 8) === 'ftyp') return 'video/mp4';
    if (ascii.startsWith('PK')) return 'application/zip';
    if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WAVE') return 'audio/wav';
    if (ascii.startsWith('ID3')) return 'audio/mpeg';
    return '';
}

async function calculateSHA512(blob) {
    if (blob.size > 200 * 1024 * 1024) return "Omitido (muy pesado para el móvil)";
    try {
        if (blob.size <= 30 * 1024 * 1024 && window.crypto && window.crypto.subtle) {
            const buffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        if (typeof CryptoJS === 'undefined') return "Librería no cargada";
        const algo = CryptoJS.algo.SHA512.create();
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk para mejor memoria RAM en móviles
        for (let offset = 0; offset < blob.size; offset += CHUNK_SIZE) {
            const chunk = blob.slice(offset, offset + CHUNK_SIZE);
            const buffer = await chunk.arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(buffer);
            algo.update(wordArray);
            await new Promise(resolve => setTimeout(resolve, 5)); // Liberar el hilo principal
        }
        return algo.finalize().toString();
    } catch (err) {
        console.error("Error hashing SHA-512:", err);
        return "Error al calcular hash";
    }
}

async function calculateSHA256(blob) {
    if (blob.size > 200 * 1024 * 1024) return "Omitido (muy pesado para el móvil)";
    try {
        if (blob.size <= 30 * 1024 * 1024 && window.crypto && window.crypto.subtle) {
            const buffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        if (typeof CryptoJS === 'undefined') return "Librería no cargada";
        const algo = CryptoJS.algo.SHA256.create();
        const CHUNK_SIZE = 5 * 1024 * 1024;
        for (let offset = 0; offset < blob.size; offset += CHUNK_SIZE) {
            const chunk = blob.slice(offset, offset + CHUNK_SIZE);
            const buffer = await chunk.arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(buffer);
            algo.update(wordArray);
            await new Promise(resolve => setTimeout(resolve, 5)); // Liberar el hilo
        }
        return algo.finalize().toString();
    } catch (err) {
        console.error("Error hashing SHA-256:", err);
        return "Error al calcular hash";
    }
}

async function calculateMD5(blob) {
    if (blob.size > 200 * 1024 * 1024) return "Omitido (muy pesado para el móvil)";
    try {
        if (typeof CryptoJS === 'undefined') return "Librería no cargada";
        const algo = CryptoJS.algo.MD5.create();
        const CHUNK_SIZE = 5 * 1024 * 1024;
        for (let offset = 0; offset < blob.size; offset += CHUNK_SIZE) {
            const chunk = blob.slice(offset, offset + CHUNK_SIZE);
            const buffer = await chunk.arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(buffer);
            algo.update(wordArray);
            await new Promise(resolve => setTimeout(resolve, 5)); // Evita crasheos de pestaña
        }
        return algo.finalize().toString();
    } catch (err) {
        console.error("Error hashing MD5:", err);
        return "Error al calcular hash";
    }
}

async function calculateCRC32(blob) {
    if (blob.size > 200 * 1024 * 1024) return "Omitido";
    try {
        let crc = 0 ^ (-1);
        const CHUNK_SIZE = 5 * 1024 * 1024;
        for (let offset = 0; offset < blob.size; offset += CHUNK_SIZE) {
            const chunk = blob.slice(offset, offset + CHUNK_SIZE);
            const buffer = await chunk.arrayBuffer();
            const view = new Uint8Array(buffer);
            for (let i = 0; i < view.length; i++) {
                crc = (crc >>> 8) ^ crcTable[(crc ^ view[i]) & 0xFF];
            }
            if (offset % (15 * 1024 * 1024) === 0) await new Promise(resolve => setTimeout(resolve, 5));
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
    if (!date) return 'Desconocido';
    return new Date(date).toLocaleString();
}

function readFourCC(view, offset) {
    if (offset + 4 > view.byteLength) return '';
    let result = '';
    for (let i = 0; i < 4; i++) {
        const code = view.getUint8(offset + i);
        result += code >= 32 && code <= 126 ? String.fromCharCode(code) : String.fromCharCode(code);
    }
    return result;
}

function readUInt64Number(view, offset) {
    if (offset + 8 > view.byteLength) return 0;
    const high = view.getUint32(offset);
    const low = view.getUint32(offset + 4);
    return high * 4294967296 + low;
}

function decodeLatin1(view, offset, length) {
    if (length <= 0 || offset >= view.byteLength) return '';
    const end = Math.min(offset + length, view.byteLength);
    let result = '';
    for (let i = offset; i < end; i++) {
        result += String.fromCharCode(view.getUint8(i));
    }
    return result;
}

function decodeUtf8(bytes) {
    try {
        return new TextDecoder('utf-8', {fatal: false}).decode(bytes);
    } catch {
        let fallback = '';
        for (let i = 0; i < bytes.length; i++) {
            fallback += String.fromCharCode(bytes[i]);
        }
        return fallback;
    }
}

function sanitizeMp4Text(value) {
    return String(value || '')
        .replace(/\u0000/g, '')
        .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractReadableTextFromBytes(bytes, maxBytes = bytes.length, minRunLength = 8) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const limit = Math.min(source.length, maxBytes);
    const segments = [];
    let current = '';

    for (let index = 0; index < limit; index++) {
        const value = source[index];
        const isPrintable = (value >= 32 && value <= 126) || value === 9 || value === 10 || value === 13;
        if (isPrintable) {
            current += String.fromCharCode(value);
            continue;
        }
        if (current.trim().length >= minRunLength) {
            segments.push(sanitizeMp4Text(current));
        }
        current = '';
    }

    if (current.trim().length >= minRunLength) {
        segments.push(sanitizeMp4Text(current));
    }

    return segments.filter(Boolean).join('\n');
}

function hasSuspiciousScriptPayload(text) {
    const normalized = sanitizeMp4Text(text).toLowerCase();
    if (!normalized || normalized.length < 8) return false;
    const directExecutionPatterns = [
        /javascript:/,
        /<script\b/,
        /powershell(?:\.exe)?/,
        /cmd\.exe/,
        /wscript(?:\.exe)?/,
        /cscript(?:\.exe)?/,
        /createobject\s*\(/,
        /shell\.application/,
        /mshta(?:\.exe)?/
    ];
    return directExecutionPatterns.some(pattern => pattern.test(normalized));
}

function looksLikePortableExecutable(uint8, offset) {
    if (offset < 0 || offset + 64 >= uint8.length) return false;
    if (uint8[offset] !== 0x4D || uint8[offset + 1] !== 0x5A) return false;
    const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);
    const peOffset = view.getUint32(offset + 0x3C, true);
    if (!Number.isFinite(peOffset) || peOffset <= 0 || peOffset > 1024 * 1024) return false;
    const signatureOffset = offset + peOffset;
    if (signatureOffset + 4 > uint8.length) return false;
    return uint8[signatureOffset] === 0x50 && uint8[signatureOffset + 1] === 0x45 && uint8[signatureOffset + 2] === 0x00 && uint8[signatureOffset + 3] === 0x00;
}

function looksLikeZipContainer(uint8, offset) {
    if (offset < 0 || offset + 4 >= uint8.length) return false;
    if (!(uint8[offset] === 0x50 && uint8[offset + 1] === 0x4B && uint8[offset + 2] === 0x03 && uint8[offset + 3] === 0x04)) {
        return false;
    }
    const scanEnd = Math.min(uint8.length - 3, offset + 1024 * 1024);
    for (let index = offset + 30; index < scanEnd; index++) {
        if (uint8[index] === 0x50 && uint8[index + 1] === 0x4B && (uint8[index + 2] === 0x01 || uint8[index + 2] === 0x05 || uint8[index + 2] === 0x07)) {
            return true;
        }
    }
    return false;
}

function looksLikeElfBinary(uint8, offset) {
    if (offset < 0 || offset + 16 >= uint8.length) return false;
    return uint8[offset] === 0x7F && uint8[offset + 1] === 0x45 && uint8[offset + 2] === 0x4C && uint8[offset + 3] === 0x46 && (uint8[offset + 4] === 1 || uint8[offset + 4] === 2) && uint8[offset + 6] === 1;
}

function createThreatSummary(typeLabel, countText) {
    const threatSummary = document.createElement('div');
    threatSummary.className = 'security-threat-summary';

    const icon = document.createElement('span');
    icon.textContent = '⚠️ ';

    const strong = document.createElement('strong');
    strong.textContent = typeLabel;

    threatSummary.appendChild(icon);
    threatSummary.appendChild(strong);
    threatSummary.appendChild(document.createTextNode(` ${countText}`));
    return threatSummary;
}

function formatMp4Language(code) {
    if (!code || code === 0) return 'und';
    const chars = [
        ((code >> 10) & 0x1f) + 0x60,
        ((code >> 5) & 0x1f) + 0x60,
        (code & 0x1f) + 0x60
    ];
    return chars.map(charCode => String.fromCharCode(charCode)).join('');
}

function formatSeconds(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return 'Desconocido';
    return `${seconds.toFixed(2)} s`;
}

function formatFixed16_16(value) {
    return value / 65536;
}

function formatFixed8_8(value) {
    return value / 256;
}

function formatBitrateValue(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return 'Desconocido';
    const mbps = numeric / 1000000;
    return `${Math.round(numeric)} bps (${mbps.toFixed(2)} Mbps)`;
}

function getMp4MetadataLabel(type) {
    const labels = {
        '©nam': 'Title',
        '©ART': 'Artist',
        'aART': 'AlbumArtist',
        '©alb': 'Album',
        '©day': 'CreateDate',
        '©too': 'Encoder',
        '©cmt': 'Comment',
        'desc': 'Description',
        'ldes': 'LongDescription',
        'cprt': 'Copyright',
        'covr': 'CoverArt',
        'tmpo': 'Tempo',
        'trkn': 'TrackNumber',
        'disk': 'DiscNumber',
        'gnre': 'Genre',
        'keyw': 'Keywords'
    };
    return labels[type] || `Tag ${type}`;
}

function parseMp4DataBox(itemType, view, start, end) {
    if (end - start < 8) return null;
    const dataType = view.getUint32(start);
    const payloadStart = start + 8;
    if (payloadStart > end) return null;
    const payload = new Uint8Array(view.buffer, view.byteOffset + payloadStart, end - payloadStart);

    if (itemType === 'covr') {
        return {label: getMp4MetadataLabel(itemType), value: `Datos binarios ${payload.length} bytes`, rawValue: payload.length, binary: true};
    }

    if ((itemType === 'trkn' || itemType === 'disk') && payload.length >= 6) {
        const current = (payload[2] << 8) | payload[3];
        const total = (payload[4] << 8) | payload[5];
        const value = total > 0 ? `${current}/${total}` : String(current);
        return {label: getMp4MetadataLabel(itemType), value, rawValue: value};
    }

    if (payload.length === 0) return null;

    if (dataType === 1 || dataType === 0) {
        const value = sanitizeMp4Text(decodeUtf8(payload));
        return value ? {label: getMp4MetadataLabel(itemType), value, rawValue: value} : null;
    }

    if (dataType === 21 || dataType === 22 || dataType === 23 || dataType === 24) {
        let number = 0;
        for (let i = 0; i < Math.min(payload.length, 8); i++) {
            number = (number * 256) + payload[i];
        }
        const value = String(number);
        return {label: getMp4MetadataLabel(itemType), value, rawValue: number};
    }

    const fallback = sanitizeMp4Text(decodeUtf8(payload));
    if (fallback) {
        return {label: getMp4MetadataLabel(itemType), value: fallback, rawValue: fallback};
    }

    return {label: getMp4MetadataLabel(itemType), value: `Datos binarios ${payload.length} bytes`, rawValue: payload.length, binary: true};
}

function parseMp4Metadata(arrayBuffer, fileSize = 0) {
    const view = new DataView(arrayBuffer);
    const structure = [];
    const metadata = [];
    const raw = {brands: {}, movie: {}, tracks: [], metadata: {}};
    const seenStructure = new Set();
    const seenMetadata = new Set();

    const pushStructure = (label, value) => {
        const normalized = sanitizeMp4Text(value);
        if (!normalized) return;
        const key = `${label}:${normalized}`;
        if (seenStructure.has(key)) return;
        seenStructure.add(key);
        structure.push({label, value: normalized});
    };

    const pushMetadata = (label, value) => {
        const normalized = sanitizeMp4Text(value);
        if (!normalized) return;
        const key = `${label}:${normalized}`;
        if (seenMetadata.has(key)) return;
        seenMetadata.add(key);
        metadata.push({label, value: normalized});
        if (!raw.metadata[label]) raw.metadata[label] = [];
        raw.metadata[label].push(normalized);
    };

    const parseBoxes = (start, end, context = {}) => {
        let offset = start;

        while (offset + 8 <= end && offset + 8 <= view.byteLength) {
            let headerSize = 8;
            let size = view.getUint32(offset);
            const type = readFourCC(view, offset + 4);
            if (!type) break;

            if (size === 1) {
                if (offset + 16 > end) break;
                size = readUInt64Number(view, offset + 8);
                headerSize = 16;
            } else if (size === 0) {
                size = end - offset;
            }

            if (!Number.isFinite(size) || size < headerSize || offset + size > end) break;

            const contentStart = offset + headerSize;
            const boxEnd = offset + size;

            if (type === 'ftyp') {
                const majorBrand = readFourCC(view, contentStart);
                const minorVersion = contentStart + 8 <= boxEnd ? view.getUint32(contentStart + 4) : 0;
                const compatibleBrands = [];
                for (let brandOffset = contentStart + 8; brandOffset + 4 <= boxEnd; brandOffset += 4) {
                    const brand = readFourCC(view, brandOffset);
                    if (brand) compatibleBrands.push(brand);
                }
                raw.brands = {majorBrand, minorVersion, compatibleBrands};
                pushStructure('MajorBrand', majorBrand);
                pushStructure('MinorVersion', String(minorVersion));
                if (compatibleBrands.length > 0) {
                    pushStructure('CompatibleBrands', JSON.stringify(compatibleBrands));
                }
            } else if (type === 'moov' || type === 'udta' || type === 'mdia' || type === 'minf' || type === 'stbl') {
                parseBoxes(contentStart, boxEnd, context);
            } else if (type === 'meta') {
                parseBoxes(contentStart + 4, boxEnd, context);
            } else if (type === 'trak') {
                const track = {};
                raw.tracks.push(track);
                parseBoxes(contentStart, boxEnd, {...context, track});
            } else if (type === 'mvhd') {
                const version = view.getUint8(contentStart);
                const timescaleOffset = contentStart + (version === 1 ? 20 : 12);
                const durationOffset = contentStart + (version === 1 ? 24 : 16);
                if (durationOffset + (version === 1 ? 8 : 4) <= boxEnd) {
                    const timescale = view.getUint32(timescaleOffset);
                    const durationUnits = version === 1 ? readUInt64Number(view, durationOffset) : view.getUint32(durationOffset);
                    const rate = formatFixed16_16(view.getUint32(contentStart + (version === 1 ? 32 : 20)));
                    const volume = formatFixed8_8(view.getUint16(contentStart + (version === 1 ? 36 : 24)));
                    const durationSeconds = timescale > 0 ? durationUnits / timescale : 0;
                    raw.movie = {timescale, durationUnits, durationSeconds, rate, volume};
                    pushStructure('TimeScale', String(timescale));
                    pushStructure('Duration', formatSeconds(durationSeconds));
                    pushStructure('MediaDuration', formatSeconds(durationSeconds));
                    pushStructure('PreferredRate', String(Number(rate.toFixed(2))));
                    pushStructure('PreferredVolume', `${(volume * 100).toFixed(2)}%`);
                    if (fileSize > 0 && durationSeconds > 0) {
                        pushStructure('AverageBitrate', formatBitrateValue((fileSize * 8) / durationSeconds));
                    }
                }
            } else if (type === 'tkhd' && context.track) {
                const version = view.getUint8(contentStart);
                const trackIdOffset = contentStart + (version === 1 ? 20 : 12);
                const durationOffset = contentStart + (version === 1 ? 28 : 20);
                const layerOffset = contentStart + (version === 1 ? 40 : 32);
                const volumeOffset = contentStart + (version === 1 ? 44 : 36);
                const widthOffset = contentStart + (version === 1 ? 76 : 64);
                const heightOffset = contentStart + (version === 1 ? 80 : 68);
                const trackId = view.getUint32(trackIdOffset);
                const durationUnits = version === 1 ? readUInt64Number(view, durationOffset) : view.getUint32(durationOffset);
                const layer = view.getInt16(layerOffset);
                const volume = formatFixed8_8(view.getUint16(volumeOffset));
                const width = Math.round(formatFixed16_16(view.getUint32(widthOffset)));
                const height = Math.round(formatFixed16_16(view.getUint32(heightOffset)));
                context.track.trackId = trackId;
                context.track.durationUnits = durationUnits;
                context.track.layer = layer;
                context.track.volume = volume;
                context.track.width = width;
                context.track.height = height;
                pushStructure('TrackID', String(trackId));
                pushStructure('TrackLayer', String(layer));
                pushStructure('TrackVolume', `${(volume * 100).toFixed(2)}%`);
                if (width > 0 && height > 0) {
                    pushStructure('SourceImageWidth', String(width));
                    pushStructure('SourceImageHeight', String(height));
                }
            } else if (type === 'mdhd' && context.track) {
                const version = view.getUint8(contentStart);
                const timescaleOffset = contentStart + (version === 1 ? 20 : 12);
                const durationOffset = contentStart + (version === 1 ? 24 : 16);
                const languageOffset = contentStart + (version === 1 ? 32 : 24);
                const timescale = view.getUint32(timescaleOffset);
                const durationUnits = version === 1 ? readUInt64Number(view, durationOffset) : view.getUint32(durationOffset);
                const languageCode = formatMp4Language(view.getUint16(languageOffset));
                const durationSeconds = timescale > 0 ? durationUnits / timescale : 0;
                context.track.mediaTimeScale = timescale;
                context.track.mediaDuration = durationSeconds;
                context.track.languageCode = languageCode;
                pushStructure('MediaTimeScale', String(timescale));
                pushStructure('TrackDuration', formatSeconds(durationSeconds));
                pushStructure('MediaLanguageCode', languageCode);
            } else if (type === 'hdlr' && context.track) {
                const handlerType = readFourCC(view, contentStart + 8);
                const vendorId = readFourCC(view, contentStart + 12);
                const nameBytes = new Uint8Array(view.buffer, view.byteOffset + contentStart + 24, Math.max(0, boxEnd - (contentStart + 24)));
                let handlerName = sanitizeMp4Text(decodeUtf8(nameBytes));
                if (handlerName && handlerName.charCodeAt(0) === handlerName.length - 1) {
                    handlerName = handlerName.slice(1);
                }
                context.track.handlerType = handlerType;
                context.track.vendorId = vendorId;
                context.track.handlerName = handlerName;
                pushStructure('HandlerType', handlerType || 'unknown');
                if (vendorId && /[A-Za-z0-9]/.test(vendorId)) pushStructure('HandlerVendorID', vendorId);
                if (handlerName) pushStructure('HandlerDescription', handlerName);
            } else if (type === 'stsd' && context.track) {
                const entryCount = view.getUint32(contentStart + 4);
                let sampleOffset = contentStart + 8;
                for (let index = 0; index < entryCount && sampleOffset + 8 <= boxEnd; index++) {
                    const entrySize = view.getUint32(sampleOffset);
                    const sampleType = readFourCC(view, sampleOffset + 4);
                    if (!entrySize || sampleOffset + entrySize > boxEnd) break;
                    context.track.sampleType = sampleType;
                    if (['avc1', 'hvc1', 'hev1', 'mp4v', 'encv'].includes(sampleType) && entrySize >= 86) {
                        const width = view.getUint16(sampleOffset + 32);
                        const height = view.getUint16(sampleOffset + 34);
                        const compressorRaw = decodeLatin1(view, sampleOffset + 50, 32);
                        const compressorLength = compressorRaw.charCodeAt(0);
                        const compressor = sanitizeMp4Text(compressorRaw.slice(1, 1 + Math.min(compressorLength, 31)));
                        const depth = view.getUint16(sampleOffset + 82);
                        context.track.width = width || context.track.width;
                        context.track.height = height || context.track.height;
                        context.track.compressorId = sampleType;
                        context.track.bitDepth = depth;
                        pushStructure('CompressorID', sampleType);
                        if (compressor) pushStructure('CompressorName', compressor);
                        if (width > 0 && height > 0) pushStructure('ImageSize', `${width}x${height}`);
                        if (depth > 0) pushStructure('BitDepth', String(depth));
                        parseBoxes(sampleOffset + 86, sampleOffset + entrySize, context);
                    } else if (['mp4a', 'ac-3', 'ec-3', 'enca'].includes(sampleType) && entrySize >= 36) {
                        const channelCount = view.getUint16(sampleOffset + 24);
                        const sampleSize = view.getUint16(sampleOffset + 26);
                        const sampleRate = Math.round(formatFixed16_16(view.getUint32(sampleOffset + 32)));
                        context.track.audioFormat = sampleType;
                        context.track.audioChannels = channelCount;
                        context.track.audioBitsPerSample = sampleSize;
                        context.track.audioSampleRate = sampleRate;
                        pushStructure('AudioFormat', sampleType);
                        pushStructure('AudioChannels', String(channelCount));
                        pushStructure('AudioBitsPerSample', String(sampleSize));
                        if (sampleRate > 0) pushStructure('AudioSampleRate', String(sampleRate));
                        parseBoxes(sampleOffset + 36, sampleOffset + entrySize, context);
                    } else {
                        parseBoxes(sampleOffset + 16, sampleOffset + entrySize, context);
                    }
                    sampleOffset += entrySize;
                }
            } else if (type === 'btrt') {
                const bufferSize = view.getUint32(contentStart);
                const maxBitrate = view.getUint32(contentStart + 4);
                const avgBitrate = view.getUint32(contentStart + 8);
                pushStructure('BufferSize', String(bufferSize));
                if (maxBitrate > 0) pushStructure('MaxBitrate', formatBitrateValue(maxBitrate));
                if (avgBitrate > 0) pushStructure('AvgBitrate', formatBitrateValue(avgBitrate));
            } else if (type === 'ilst') {
                parseBoxes(contentStart, boxEnd, {...context, inIlst: true});
            } else if (context.inIlst) {
                let childOffset = contentStart;
                while (childOffset + 8 <= boxEnd) {
                    let childSize = view.getUint32(childOffset);
                    const childType = readFourCC(view, childOffset + 4);
                    if (childSize === 1) {
                        childSize = readUInt64Number(view, childOffset + 8);
                    } else if (childSize === 0) {
                        childSize = boxEnd - childOffset;
                    }
                    const childHeader = view.getUint32(childOffset) === 1 ? 16 : 8;
                    if (!childSize || childOffset + childSize > boxEnd) break;
                    if (childType === 'data') {
                        const parsed = parseMp4DataBox(type, view, childOffset + childHeader, childOffset + childSize);
                        if (parsed) {
                            pushMetadata(parsed.label, parsed.value);
                        }
                    }
                    childOffset += childSize;
                }
            }

            offset = boxEnd;
        }
    };

    parseBoxes(0, view.byteLength, {});

    const videoTrack = raw.tracks.find(track => track.width > 0 && track.height > 0);
    if (videoTrack) {
        pushStructure('ImageWidth', String(videoTrack.width));
        pushStructure('ImageHeight', String(videoTrack.height));
        pushStructure('Megapixels', (videoTrack.width * videoTrack.height / 1000000).toFixed(3));
        if (videoTrack.mediaDuration > 0 && fileSize > 0) {
            const estimatedFrameRate = raw.movie.durationSeconds > 0 ? null : null;
            if (videoTrack.mediaDuration > 0 && raw.movie.durationSeconds > 0) {
                const ratio = raw.movie.durationSeconds / videoTrack.mediaDuration;
                if (Number.isFinite(ratio) && ratio > 0) {
                    const normalized = Math.round((1 / ratio) * 100) / 100;
                    if (normalized >= 1 && normalized <= 240) {
                        pushStructure('VideoFrameRate', String(normalized));
                    }
                }
            }
        }
    }

    return {
        found: structure.length > 0 || metadata.length > 0,
        structure,
        metadata,
        raw
    };
}

// ====================================================================
// MÓDULO DE ANÁLISIS DE SEGURIDAD PARA VIDEOS
// Detecta: Scripts incrustados, URLs, Payload binario, Base64, 
// Metadata ofuscada, Cabeceras manipuladas, Esteganografía
// ====================================================================

function analyzeVideoSecurityThreats(arrayBuffer, fileSize = 0) {
    const threats = [];
    const view = new DataView(arrayBuffer);
    const warnings = [];
    const uint8 = new Uint8Array(arrayBuffer);
    const readableText = extractReadableTextFromBytes(uint8, Math.min(1500000, uint8.length), 12);
    
    // 1. DETECCIÓN DE SCRIPTS INCRUSTADOS
    function detectEmbeddedScripts() {
        const scriptPatterns = [
            /javascript:/gi,
            /eval\s*\(/gi,
            /on[a-z]+\s*=/gi,
            /script\s*>/gi,
            /<code>/gi,
            /exec\s*\(/gi,
            /system\s*\(/gi,
            /shell\s*\(/gi
        ];
        
        const text = readableText;
        
        for (const pattern of scriptPatterns) {
            if (pattern.test(text)) {
                threats.push({
                    level: 'CRÍTICO',
                    category: 'Scripts incrustados',
                    description: `Se detectó patrón de script potencial: ${pattern.source}`,
                    severity: 9
                });
                return true;
            }
        }
        return false;
    }

    // 2. DETECCIÓN DE URLs SOSPECHOSAS
    function detectSuspiciousUrls() {
        const text = readableText;
        
        const urlPattern = /https?:\/\/[^\s\x00]+/gi;
        const ipPattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
        const suspiciousDomains = ['malware', 'phishing', 'botnet', 'trojan', 'c2', 'c&c', 'ddos'];
        
        const urls = text.match(urlPattern) || [];
        const ips = text.match(ipPattern) || [];
        
        if (ips.length > 0) {
            threats.push({
                level: 'ALTO',
                category: 'URLs sospechosas',
                description: `Se encontraron ${ips.length} dirección(es) IP incrustada(s): ${ips.slice(0,3).join(', ')}${ips.length > 3 ? '...' : ''}`,
                severity: 8,
                count: ips.length
            });
        }
        
        for (const url of urls) {
            const urlLower = url.toLowerCase();
            if (suspiciousDomains.some(domain => urlLower.includes(domain))) {
                threats.push({
                    level: 'CRÍTICO',
                    category: 'URLs sospechosas',
                    description: `URL potencialmente maliciosa detectada: ${url}`,
                    severity: 9.5
                });
            }
        }
        
        if (urls.length > 5) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'URLs múltiples',
                description: `Se encontraron ${urls.length} URLs en el archivo de video (inusual)`,
                severity: 6
            });
        }
    }

    // 3. DETECCIÓN DE PAYLOAD BINARIO OCULTO
    function detectHiddenBinaryPayload() {
        const uint8 = new Uint8Array(arrayBuffer);
        let offset = 0;
        let anomalousDataSize = 0;
        const boxSizes = [];
        
        try {
            while (offset < Math.min(50000000, uint8.length) && offset < fileSize) {
                if (offset + 8 > uint8.length) break;
                
                const size = view.getUint32(offset);
                const type = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
                
                if (size < 8 || size > 100000000) break;
                if (!/^[a-zA-Z0-9©™®]{4}$/.test(type)) {
                    anomalousDataSize += size;
                }
                
                boxSizes.push({type, size});
                offset += size;
            }
            
            // Detectar boxes desconocidas o anómalas
            const allowedMetadataBoxes = new Set(['ftyp', 'mdat', 'free', 'skip', 'wide', 'uuid', 'udta', 'meta', 'ilst', '©nam', '©ART', 'aART', '©alb', '©day', '©too', '©cmt', 'desc', 'ldes', 'cprt', 'covr', 'tmpo', 'trkn', 'disk', 'gnre', 'keyw', 'data']);
            const unknownBoxes = boxSizes.filter(b => !MP4_CONTAINER_BOXES.has(b.type) && !allowedMetadataBoxes.has(b.type) && /^[\x20-\x7E]{4}$/.test(b.type));
            if (unknownBoxes.length > 0) {
                const totalUnknown = unknownBoxes.reduce((sum, b) => sum + b.size, 0);
                if (totalUnknown > 250000) {
                    threats.push({
                        level: 'ALTO',
                        category: 'Payload binario oculto',
                        description: `${unknownBoxes.length} box(es) desconocida(s) con ${totalUnknown} bytes: ${unknownBoxes.map(b => b.type).join(', ')}.`,
                        severity: 8,
                        count: unknownBoxes.length
                    });
                }
            }
        } catch (e) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Análisis de estructura',
                description: `Error al analizar estructura de contenedor`,
                severity: 3
            });
        }
    }

    // 4. DETECCIÓN DE MÚLTIPLES BLOBS BASE64
    function detectMultipleBase64Blobs() {
        const text = readableText;
        
        // Buscar cadenas base64 largas (>500 chars)
        const base64Pattern = /(?:[A-Za-z0-9+\/]{4}){96,}(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?/g;
        const matches = text.match(base64Pattern) || [];
        
        if (matches.length > 1) {
            threats.push({
                level: 'MEDIO',
                category: `Múltiples blobs Base64`,
                description: `Se encontraron ${matches.length} bloques Base64 codificados (tamaño > 500 chars). Podrían ocultar archivos o scripts.`,
                severity: 7,
                count: matches.length,
                totalSize: matches.reduce((sum, m) => sum + m.length, 0)
            });
        } else if (matches.length === 1 && matches[0].length > 10000) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Base64 muy largo',
                description: `Se encontró un bloque Base64 de ${matches[0].length} caracteres (sospechoso)`,
                severity: 5,
                size: matches[0].length
            });
        }
    }

    // 5. DETECCIÓN DE METADATA OFUSCADA
    function detectObfuscatedMetadata() {
        const uint8 = new Uint8Array(arrayBuffer);
        let offset = 0;
        
        try {
            while (offset + 8 <= uint8.length && offset < 10000000) {
                const size = view.getUint32(offset);
                const type = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
                
                if (size < 8 || size > 100000000 || offset + size > uint8.length) break;
                
                // Analizar metadata box (ilst, meta, etc)
                if (['ilst', 'meta', 'udta'].includes(type)) {
                    const boxContent = uint8.slice(offset + 8, offset + size);
                    
                    // Detectar patrones de ofuscación
                    let entropyScore = 0;
                    const byteFreq = {};
                    for (let i = 0; i < boxContent.length; i++) {
                        byteFreq[boxContent[i]] = (byteFreq[boxContent[i]] || 0) + 1;
                    }
                    
                    // Alta entropía = posible cifrado/ofuscación
                    for (const byte in byteFreq) {
                        const freq = byteFreq[byte] / boxContent.length;
                        if (freq > 0.01) entropyScore += freq * Math.log2(1 / freq);
                    }
                    
                    if (entropyScore > 7.5) {
                        warnings.push({
                            level: 'ADVERTENCIA',
                            category: 'Metadata ofuscada',
                            description: `Box ${type} parece contener datos cifrados o codificados (entropía: ${entropyScore.toFixed(2)})`,
                            severity: 6,
                            entropy: entropyScore.toFixed(2)
                        });
                    }
                }
                
                offset += size;
            }
        } catch (e) {
            console.log('Error detectando metadata ofuscada:', e.message);
        }
    }

    // 6. DETECCIÓN DE CABECERAS MANIPULADAS
    function detectManipulatedHeaders() {
        const uint8 = new Uint8Array(arrayBuffer);
        
        // Verificar integridad estructural de boxes
        let offset = 0;
        const headerErrors = [];
        
        try {
            while (offset + 8 <= uint8.length && offset < 5000000) {
                const size = view.getUint32(offset);
                
                // Validaciones de integridad
                if (size < 8) {
                    headerErrors.push(`Box size inválido (${size} bytes) en offset ${offset}`);
                }
                if (offset + size > uint8.length) {
                    headerErrors.push(`Box size excede buffer en offset ${offset} (size: ${size})`);
                    break;
                }
                
                const type = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
                
                // Detectar types inválidos
                if (!/^[\x20-\x7E]{4}$/.test(type)) {
                    headerErrors.push(`Type de box inválido en offset ${offset}: ${type.charCodeAt(0)}`);
                }
                
                offset += size;
            }
            
            if (headerErrors.length > 3) {
                threats.push({
                    level: 'CRÍTICO',
                    category: 'Cabeceras manipuladas',
                    description: `Se detectaron ${headerErrors.length} anomalías estructurales en el contenedor MP4. El archivo podría estar corrupto o manipulado.`,
                    severity: 9,
                    errors: headerErrors.slice(0, 3)
                });
            }
        } catch (e) {
            console.log('Error verificando cabeceras:', e.message);
        }
    }

    // 7. DETECCIÓN DE ESTEGANOGRAFÍA (Stegomalware)
    function detectSteganography() {
        const uint8 = new Uint8Array(arrayBuffer);
        
        // Buscar patrones de padding anómalo (espacio para ocultar datos)
        let padding = 0;
        let suspicious = false;
        
        // Verificar al final del archivo buscando padding nulls
        if (uint8.length > 1000) {
            let tailStart = uint8.length - 1;
            while (tailStart > 0 && uint8[tailStart] === 0) {
                padding++;
                tailStart--;
            }
            
            if (padding > 100000) {
                threats.push({
                    level: 'MEDIO',
                    category: 'Esteganografía sospechosa',
                    description: `Se detectó ${padding} bytes de padding al final del archivo. Podría contener datos ocultos.`,
                    severity: 7,
                    paddingBytes: padding
                });
                suspicious = true;
            }
        }
        
        // Buscar patrones de ocultación en metadata
        const uint32View = new Uint32Array(arrayBuffer);
        let anomalousBlocks = 0;
        
        for (let i = 0; i < Math.min(100000, uint32View.length); i += 1000) {
            const val = uint32View[i];
            if ((val & 0xFF) === (val >> 8 & 0xFF) && (val >> 16 & 0xFF) === (val >> 24 & 0xFF)) {
                anomalousBlocks++;
            }
        }
        
        if (anomalousBlocks > 50 && !suspicious) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Patrones anómalos',
                description: `Se detectaron ${anomalousBlocks} bloques con patrones repetitivos (posible ocultación).`,
                severity: 5,
                blocks: anomalousBlocks
            });
        }
    }

    // Ejecutar todos los análisis
    detectEmbeddedScripts();
    detectSuspiciousUrls();
    detectHiddenBinaryPayload();
    detectMultipleBase64Blobs();
    detectObfuscatedMetadata();
    detectManipulatedHeaders();
    detectSteganography();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats: threats.sort((a, b) => b.severity - a.severity),
        warnings: warnings.sort((a, b) => b.severity - a.severity),
        criticalThreats: threats.filter(t => t.level === 'CRÍTICO'),
        summary: {
            safe: threats.length === 0,
            riskLevel: threats.length > 0 ? (threats.some(t => t.level === 'CRÍTICO') ? 'CRÍTICO' : 'ALTO') : 'BAJO'
        }
    };
}

// ====================================================================
// ANÁLISIS DE SEGURIDAD PARA IMÁGENES (JPG, PNG, WEBP, etc.)
// ====================================================================

function analyzeImageSecurityThreats(arrayBuffer) {
    const threats = [];
    const warnings = [];
    const uint8 = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    
    // EXIF Injection - detectar EXIF con scripts compilados
    function detectExifInjection() {
        // Buscar marcadores JPEG EXIF (FFE1)
        for (let i = 0; i < uint8.length - 4; i++) {
            if (uint8[i] === 0xFF && uint8[i + 1] === 0xE1) {
                const size = view.getUint16(i + 2);
                const exifData = uint8.slice(i + 4, i + size + 2);
                const exifText = extractReadableTextFromBytes(exifData, exifData.length, 10);
                
                if (hasSuspiciousScriptPayload(exifText)) {
                    threats.push({
                        level: 'CRÍTICO',
                        category: 'EXIF Injection',
                        description: 'Se detectó código potencialmente ejecutable en datos EXIF',
                        severity: 9
                    });
                }
            }
        }
    }
    
    // Detectar embedded ZIP o archivos ejecutables
    function detectEmbeddedFiles() {
        const minEmbeddedOffset = 4096;
        for (let i = minEmbeddedOffset; i < uint8.length - 4; i++) {
            const foundZip = looksLikeZipContainer(uint8, i);
            const foundPe = looksLikePortableExecutable(uint8, i);
            const foundElf = looksLikeElfBinary(uint8, i);

            if (foundZip || foundPe || foundElf) {
                const name = foundZip ? 'ZIP/Office' : foundPe ? 'Ejecutable PE' : 'Ejecutable ELF';
                const sizeHint = uint8.length - i;
                if (sizeHint < 1024) {
                    continue;
                }
                    threats.push({
                        level: 'CRÍTICO',
                        category: 'Archivo ejecutable embedded',
                        description: `Se detectó una firma válida de ${name} incrustada dentro de la imagen`,
                        severity: 9.5
                    });
                    return;
            }
        }
    }
    
    // Detectar IptcData maliciosa
    function detectMaliciousMetadata() {
        for (let i = 0; i < uint8.length - 4; i++) {
            if (uint8[i] === 0x80 && uint8[i + 1] === 0x04) {
                // IPTC marker
                const data = uint8.slice(i, Math.min(i + 1000, uint8.length));
                const text = extractReadableTextFromBytes(data, data.length, 6).toLowerCase();
                
                const suspiciousWords = text.match(/\b(?:malware|virus|trojan|botnet|c2|payload|shell|powershell|cmd\.exe)\b/gi) || [];
                if (suspiciousWords.length >= 2 || (suspiciousWords.length >= 1 && hasSuspiciousScriptPayload(text))) {
                    warnings.push({
                        level: 'ADVERTENCIA',
                        category: 'Metadata sospechosa IPTC',
                        description: 'Se encontraron palabras clave maliciosas en metadata IPTC',
                        severity: 6
                    });
                }
            }
        }
    }
    
    detectExifInjection();
    detectEmbeddedFiles();
    detectMaliciousMetadata();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats: threats.sort((a, b) => b.severity - a.severity),
        warnings: warnings.sort((a, b) => b.severity - a.severity),
        summary: { safe: threats.length === 0 }
    };
}

// ====================================================================
// ANÁLISIS DE SEGURIDAD PARA PDF
// ====================================================================

function analyzePdfSecurityThreats(pdfData) {
    const threats = [];
    const warnings = [];
    
    const text = typeof pdfData === 'string' ? pdfData : new TextDecoder('utf-8', {fatal: false}).decode(new Uint8Array(pdfData));
    
    // Detectar JavaScript en PDF
    function detectPdfJavaScript() {
        if (/\/JavaScript\b|\/JS\b|\/OpenAction\s*<<[^>]*\/S\s*\/JavaScript|\/AA\s*<<[^>]*\/S\s*\/JavaScript|javascript:/gi.test(text)) {
            threats.push({
                level: 'CRÍTICO',
                category: 'JavaScript en PDF',
                description: 'Se detectó código JavaScript potencialmente malicioso en el PDF',
                severity: 9.5
            });
            return true;
        }
        return false;
    }
    
    // Detectar objetos malformed
    function detectMalformedObjects() {
        const objPattern = /\/obj\s|endobj|stream|endstream/gi;
        const matches = (text.match(objPattern) || []).length;
        
        if (matches > 100) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Estructura PDF anómala',
                description: `PDF contiene ${Math.round(matches/2)} objetos (inusualmente alto)`,
                severity: 5
            });
        }
    }
    
    // Detectar launching actions
    function detectLaunchingActions() {
        if (/\/Launch|\/SubmitForm|\/ImportData|\/RichMedia|\/Flash/gi.test(text)) {
            threats.push({
                level: 'ALTO',
                category: 'Acciones de lanzamiento detectadas',
                description: 'El PDF contiene acciones que pueden ejecutar aplicaciones externas',
                severity: 8
            });
        }
    }
    
    // Detectar URLs sospechosas
    function detectSuspiciousUrls() {
        const urlPattern = /https?:\/\/[^\s\)]+/gi;
        const urls = text.match(urlPattern) || [];
        
        const suspicious = urls.filter(u => /malware|virus|trojan|phishing|botnet|c2/gi.test(u));
        if (suspicious.length > 0) {
            threats.push({
                level: 'CRÍTICO',
                category: 'URLs maliciosas en PDF',
                description: `Se encontraron ${suspicious.length} URL(s) potencialmente maliciosa(s)`,
                severity: 9
            });
        }
    }
    
    detectPdfJavaScript();
    detectMalformedObjects();
    detectLaunchingActions();
    detectSuspiciousUrls();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats,
        warnings,
        summary: { safe: threats.length === 0 }
    };
}

// ====================================================================
// ANÁLISIS DE SEGURIDAD PARA DOCX / OFFICE
// ====================================================================

function analyzeDocxSecurityThreats(zipContent) {
    const threats = [];
    const warnings = [];
    
    // Detectar macros VBA
    function detectMacros() {
        if (zipContent.files && zipContent.files['word/vbaProject.bin']) {
            threats.push({
                level: 'CRÍTICO',
                category: 'Macros VBA detectadas',
                description: 'El documento DOCX contiene macros que pueden ejecutar código arbitrario',
                severity: 9.5
            });
            return true;
        }
        return false;
    }
    
    // Detectar links externos no seguros
    async function detectExternalLinks() {
        if (zipContent.files['word/document.xml']) {
            try {
                const docXml = await zipContent.files['word/document.xml'].async('string');
                const externalLinks = (docXml.match(/r:embed|r:link|hyperlink/gi) || []).length;
                
                if (docXml.match(/http[s]?:\/\/[^\s"]+/gi)) {
                    const suspiciousUrls = docXml.match(/(?:malware|trojan|phishing|botnet)[^\s"]*/gi) || [];
                    if (suspiciousUrls.length > 0) {
                        threats.push({
                            level: 'ALTO',
                            category: 'Links potencialmente maliciosos',
                            description: `Se encontraron ${suspiciousUrls.length} enlace(s) sospechoso(s)`,
                            severity: 8
                        });
                    }
                }
                
                if (externalLinks > 10) {
                    warnings.push({
                        level: 'ADVERTENCIA',
                        category: 'Múltiples enlaces externos',
                        description: `El documento contiene ${externalLinks} enlaces externos (inusual)`,
                        severity: 5
                    });
                }
            } catch (e) {
                console.log('Error analizando documento XML:', e);
            }
        }
    }
    
    // Detectar objetos embebidos
    function detectEmbeddedObjects() {
        if (zipContent.files && zipContent.files['word/embeddings']) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Objetos embebidos detectados',
                description: 'El documento contiene objetos embebidos que podrían ejecutar código',
                severity: 6
            });
            return true;
        }
        return false;
    }
    
    detectMacros();
    detectExternalLinks();
    detectEmbeddedObjects();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats,
        warnings,
        summary: { safe: threats.length === 0 }
    };
}

// ====================================================================
// ANÁLISIS DE SEGURIDAD PARA ZIP / ARCHIVOS COMPRIMIDOS
// ====================================================================

function analyzeZipSecurityThreats(zipContent) {
    const threats = [];
    const warnings = [];
    
    // Detectar archivos ejecutables
    function detectExecutables() {
        const executableExts = ['exe', 'dll', 'scr', 'bat', 'cmd', 'com', 'pif', 'vbs', 'ps1', 'jar'];
        const executables = [];
        
        if (zipContent.files) {
            for (const [path, file] of Object.entries(zipContent.files)) {
                const ext = path.split('.').pop().toLowerCase();
                if (executableExts.includes(ext)) {
                    executables.push(path);
                }
            }
        }
        
        if (executables.length > 0) {
            threats.push({
                level: 'CRÍTICO',
                category: 'Archivos ejecutables en ZIP',
                description: `Se detectaron ${executables.length} archivo(s) ejecutable(s): ${executables.slice(0, 3).join(', ')}${executables.length > 3 ? '...' : ''}`,
                severity: 9.5,
                count: executables.length
            });
        }
    }
    
    // Detectar path traversal
    function detectPathTraversal() {
        const maliciousPaths = [];
        
        if (zipContent.files) {
            for (const path of Object.keys(zipContent.files)) {
                if (path.includes('..\\') || path.includes('../') || path.startsWith('/')) {
                    maliciousPaths.push(path);
                }
            }
        }
        
        if (maliciousPaths.length > 0) {
            threats.push({
                level: 'CRÍTICO',
                category: 'Path Traversal detectado',
                description: `El ZIP contiene rutas que pueden escribir fuera del directorio destino (${maliciousPaths.length} archivos)`,
                severity: 9,
                count: maliciousPaths.length
            });
        }
    }
    
    // Detectar bomba ZIP (compresión extrema)
    function detectZipBomb() {
        let compressedSize = 0;
        let uncompressedSize = 0;
        
        if (zipContent.files) {
            for (const file of Object.values(zipContent.files)) {
                compressedSize += file._data ? file._data.compressedSize || 0 : 0;
                uncompressedSize += file._data ? file._data.uncompressedSize || 0 : 0;
            }
        }
        
        // Si la ratio de compresión es > 100x es sospechoso
        if (compressedSize > 0 && uncompressedSize / compressedSize > 100) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Posible ZIP bomb',
                description: `Ratio de compresión muy alta (${(uncompressedSize / compressedSize).toFixed(1)}x). Posible ataque de negación de servicio.`,
                severity: 7,
                ratio: (uncompressedSize / compressedSize).toFixed(1)
            });
        }
    }
    
    // Detectar archivos ocultos
    function detectHiddenOrEncrypted() {
        let encrypted = 0;
        let hidden = 0;
        
        if (zipContent.files) {
            for (const [path, file] of Object.entries(zipContent.files)) {
                if (path.startsWith('.')) hidden++;
                if (file._data && file._data.encrypted) encrypted++;
            }
        }
        
        if (encrypted > 0) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'Archivos encriptados en ZIP',
                description: `${encrypted} archivo(s) están encriptados (imposible verificar contenido)`,
                severity: 6,
                count: encrypted
            });
        }
    }
    
    detectExecutables();
    detectPathTraversal();
    detectZipBomb();
    detectHiddenOrEncrypted();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats,
        warnings,
        summary: { safe: threats.length === 0 }
    };
}

// ====================================================================
// ANÁLISIS DE SEGURIDAD PARA AUDIO (MP3, WAV, FLAC, etc.)
// ====================================================================

function analyzeAudioSecurityThreats(arrayBuffer) {
    const threats = [];
    const warnings = [];
    const uint8 = new Uint8Array(arrayBuffer);
    const text = extractReadableTextFromBytes(uint8, Math.min(500000, uint8.length), 10);
    
    // Detectar metadata maliciosa en tags ID3
    function detectId3Injection() {
        if (/^ID3/i.test(new TextDecoder('utf-8', {fatal: false}).decode(uint8.slice(0, 3)))) {
            if (hasSuspiciousScriptPayload(text)) {
                threats.push({
                    level: 'CRÍTICO',
                    category: 'ID3 Tag Injection',
                    description: 'Se detectó código potencialmente ejecutable en tags ID3 del audio',
                    severity: 9
                });
            }
        }
    }
    
    // Detectar URLs sospechosas en metadata
    function detectSuspiciousUrls() {
        const urlPattern = /https?:\/\/[^\s\)]+/gi;
        const urls = text.match(urlPattern) || [];
        const suspicious = urls.filter(u => /malware|botnet|trojan|phishing|c2/gi.test(u));
        
        if (suspicious.length > 0) {
            warnings.push({
                level: 'ADVERTENCIA',
                category: 'URLs sospechosas en audio',
                description: `Se encontraron ${suspicious.length} URL(s) con patrones maliciosos`,
                severity: 6
            });
        }
    }
    
    // Detectar embedding de archivos
    function detectEmbeddedPayload() {
        for (let i = 2048; i < uint8.length - 4; i++) {
            if (looksLikeZipContainer(uint8, i) || looksLikePortableExecutable(uint8, i)) {
                    warnings.push({
                        level: 'ADVERTENCIA',
                        category: 'Payload embebido detectado',
                        description: 'Se encontró una firma binaria válida incrustada dentro del audio',
                        severity: 7
                    });
                    return;
            }
        }
    }
    
    detectId3Injection();
    detectSuspiciousUrls();
    detectEmbeddedPayload();
    
    return {
        threatCount: threats.length,
        warningCount: warnings.length,
        threats,
        warnings,
        summary: { safe: threats.length === 0 }
    };
}

// ====================================================================
// FUNCIÓN WRAPPER - Análisis automático según tipo de archivo
// ====================================================================

function analyzeFileSecurityThreats(file, buffer, fileCategory) {
    const threats = [];
    const warnings = [];
    
    try {
        if (fileCategory === 'Vídeo' || fileCategory.includes('Vídeo')) {
            return analyzeVideoSecurityThreats(buffer, file.size);
        } else if (fileCategory === 'Imagen' || fileCategory.includes('Imagen') || fileCategory.includes('GIF')) {
            return analyzeImageSecurityThreats(buffer);
        } else if (fileCategory === 'PDF') {
            return analyzePdfSecurityThreats(buffer);
        } else if (fileCategory === 'Audio' || fileCategory.includes('Audio')) {
            return analyzeAudioSecurityThreats(buffer);
        }
    } catch (e) {
        console.warn('Error en análisis de seguridad:', e.message);
        return {
            threatCount: 0,
            warningCount: 1,
            threats: [],
            warnings: [{
                level: 'ADVERTENCIA',
                category: 'Error de análisis',
                description: 'No se pudo completar el análisis de seguridad',
                severity: 2
            }],
            summary: { safe: false }
        };
    }
    
    return {
        threatCount: 0,
        warningCount: 0,
        threats: [],
        warnings: [],
        summary: { safe: true }
    };
}

function concatUint8Arrays(chunks) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(chunk => {
        result.set(chunk, offset);
        offset += chunk.length;
    });
    return result;
}

function createMp4Box(type, content, extendedMetaPrefix = null) {
    const headerLength = extendedMetaPrefix ? 12 : 8;
    const box = new Uint8Array(headerLength + content.length);
    const view = new DataView(box.buffer);
    view.setUint32(0, box.length);
    for (let i = 0; i < 4; i++) {
        box[4 + i] = type.charCodeAt(i);
    }
    if (extendedMetaPrefix) {
        box.set(extendedMetaPrefix, 8);
        box.set(content, 12);
    } else {
        box.set(content, 8);
    }
    return box;
}

function stripMp4Metadata(arrayBuffer) {
    const source = new Uint8Array(arrayBuffer);
    const view = new DataView(source.buffer, source.byteOffset, source.byteLength);

    const rebuildRange = (start, end, parentType = '') => {
        const chunks = [];
        let offset = start;

        while (offset + 8 <= end) {
            let headerSize = 8;
            let size = view.getUint32(offset);
            const type = readFourCC(view, offset + 4);
            if (!type) break;

            if (size === 1) {
                if (offset + 16 > end) break;
                size = readUInt64Number(view, offset + 8);
                headerSize = 16;
            } else if (size === 0) {
                size = end - offset;
            }

            if (!Number.isFinite(size) || size < headerSize || offset + size > end) break;

            const contentStart = offset + headerSize;
            const boxEnd = offset + size;
            const shouldRemove = MP4_REMOVABLE_BOXES.has(type);

            if (!shouldRemove) {
                if (type === 'meta') {
                    const metaPrefix = source.slice(contentStart, contentStart + 4);
                    const rebuiltContent = rebuildRange(contentStart + 4, boxEnd, type);
                    chunks.push(createMp4Box(type, rebuiltContent, metaPrefix));
                } else if (MP4_CONTAINER_BOXES.has(type)) {
                    const rebuiltContent = rebuildRange(contentStart, boxEnd, type);
                    chunks.push(createMp4Box(type, rebuiltContent));
                } else {
                    chunks.push(source.slice(offset, boxEnd));
                }
            }

            offset = boxEnd;
        }

        return concatUint8Arrays(chunks);
    };

    return rebuildRange(0, source.length);
}

function addInfoRow(container, label, value, valueClass = '', isRemovable = false, tagKey = '') {
    const row = document.createElement('div');
    row.className = 'data-row';
    row.dataset.label = String(label || '');
    row.dataset.value = String(value || '');
    row.dataset.valueClass = String(valueClass || '');
    row.dataset.containerId = container.id || '';
    row.dataset.riskLevel = inferRiskLevel(label, value, valueClass, container.id || '');
    
    const lbl = document.createElement('span');
    lbl.className = 'data-label';
    lbl.textContent = label;

    const labelGroup = document.createElement('div');
    labelGroup.className = 'data-label-group';
    labelGroup.appendChild(lbl);

    const riskBadge = document.createElement('span');
    riskBadge.className = `row-risk-badge row-risk-badge-${row.dataset.riskLevel}`;
    riskBadge.textContent = getRiskLabel(row.dataset.riskLevel);
    labelGroup.appendChild(riskBadge);
    
    const val = document.createElement('span');
    val.className = `data-value ${valueClass}`;
    val.textContent = value;

    const valueMeta = document.createElement('div');
    valueMeta.className = 'data-meta';
    valueMeta.appendChild(val);

    if (educationModeEnabled) {
        const hint = getEducationHint(label);
        if (hint) {
            const hintEl = document.createElement('span');
            hintEl.className = 'education-hint';
            hintEl.textContent = hint;
            valueMeta.appendChild(hintEl);
        }
    }
    
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
        labelWrapper.appendChild(labelGroup);
        
        row.appendChild(labelWrapper);
    } else {
        row.appendChild(labelGroup);
    }
    
    row.appendChild(valueMeta);
    container.appendChild(row);
}

function setPrivacyStatus(type, icon, text) {
    privacyStatus.className = `status-indicator ${type}`;
    clearElement(privacyStatus);

    const iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-rounded status-icon';
    iconEl.textContent = icon;

    const textEl = document.createElement('span');
    textEl.className = 'status-text';
    textEl.textContent = text;

    privacyStatus.appendChild(iconEl);
    privacyStatus.appendChild(textEl);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesQuery(labelText, valueText, query, mode) {
    const haystack = `${labelText} ${valueText}`.toLowerCase();
    const normalized = query.toLowerCase().trim();
    if (!normalized) return true;
    if (mode === 'exact') return haystack.includes(normalized);
    if (mode === 'all') {
        return normalized.split(/\s+/).filter(Boolean).every(part => haystack.includes(part));
    }
    return haystack.includes(normalized);
}

function filterMetadata(query) {
    const q = query.toLowerCase().trim();
    const scope = searchScopeFilter?.value || 'all';
    const severity = severityFilter?.value || 'all';
    const mode = queryModeSelect?.value || 'contains';
    const onlySensitive = Boolean(onlySensitiveToggle?.checked);
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
            if (!labelEl || !valueEl) return;

            appendTextWithHighlight(labelEl, row.dataset.label || labelEl.textContent, q);
            appendTextWithHighlight(valueEl, row.dataset.value || valueEl.textContent, q);
            
            const labelText = row.dataset.label || labelEl.textContent;
            const valueText = row.dataset.value || valueEl.textContent;
            const scopeMatch = scope === 'all' || scope === grid.id;
            const severityMatch = severity === 'all' || (row.dataset.riskLevel || 'low') === severity;
            const sensitiveMatch = !onlySensitive || /sensitive|warning/.test(row.dataset.valueClass || '');
            const queryMatch = matchesQuery(labelText, valueText, q, mode);

            if (scopeMatch && severityMatch && sensitiveMatch && queryMatch) {
                row.style.display = 'flex';
                sectionMatches++;
                totalMatches++;
            } else {
                row.style.display = 'none';
            }
        });
        
        if (q) {
            section.style.display = sectionMatches > 0 ? 'block' : 'none';
            if (sectionMatches > 0) section.open = true;
        } else {
            section.style.display = (alwaysShow || rows.length > 0) ? 'block' : 'none';
            sectionMatches = rows.length;
        }

        if (!q) {
            totalMatches += sectionMatches;
        }
    });
    
    const hasActiveFilters = scope !== 'all' || severity !== 'all' || onlySensitive || mode !== 'contains';

    if (q || hasActiveFilters) {
        searchResults.textContent = `${totalMatches} coincidencia${totalMatches !== 1 ? 's' : ''}`;
    } else {
        searchResults.textContent = '';
    }
}

metadataSearch.addEventListener('input', (e) => {
    filterMetadata(e.target.value);
});

[searchScopeFilter, severityFilter, queryModeSelect, onlySensitiveToggle].forEach(control => {
    control?.addEventListener('input', () => filterMetadata(metadataSearch.value));
    control?.addEventListener('change', () => filterMetadata(metadataSearch.value));
});

async function handleFile(file, options = {}) {
    try {
        const { preserveBatch = false } = options;
        currentFile = file;
        originalSize = file.size;
        const extLower = (file.name.split('.').pop() || '').toLowerCase();
        const inferredMime = file.type || inferMimeType(extLower);
        const fileCategory = getFileCategory(file, extLower, inferredMime);
        const signatureMime = await sniffFileSignature(file);
        const hasSignatureMismatch = signatureMime && inferredMime && signatureMime !== inferredMime && !(signatureMime === 'application/zip' && ['docx', 'xlsx', 'pptx'].includes(extLower));
        
        if (cleanBlobUrl) URL.revokeObjectURL(cleanBlobUrl);
        cleanBlobUrl = null;
        
        const isImage = inferredMime.startsWith('image/');
        const isVideo = inferredMime.startsWith('video/');
        const isAudio = inferredMime.startsWith('audio/');
        const isPdf = inferredMime === 'application/pdf';
        const isDocx = inferredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isText = isTextLikeFile(file, extLower);
        
        // Prevención de OOM (Out of Memory) general en móviles
        const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB absoluto max handling sin webworkers
        if (file.size > MAX_TOTAL_SIZE) {
            alert('El archivo es demasiado grande (' + formatBytes(file.size) + ') para procesarse completamente de forma local en el navegador.');
        }
        
        dropZone.classList.add('compact');
        inspectionPanel.style.display = 'flex';
        resultSection.style.display = 'none';
        
        if (canCleanMetadata(file, extLower, inferredMime)) {
            btnClean.style.display = 'inline-flex';
            btnSelectiveClean.style.display = canSelectiveCleanMetadata(file, extLower, inferredMime) ? 'inline-flex' : 'none';
            btnClean.disabled = false;
            btnSelectiveClean.disabled = false;
        } else {
            btnClean.style.display = 'none';
            btnSelectiveClean.style.display = 'none';
        }
        
        cleaningProgress.style.display = 'none';
        progressFill.style.transform = 'scaleX(0)';
        
        geoSection.style.display = 'none';
        exifSection.style.display = 'none';
        extendedSection.style.display = 'none';
        rawSection.style.display = 'none';
        contentSection.style.display = 'none';
        riskSection.style.display = 'none';
        noMetadataMsg.style.display = 'none';
        searchContainer.style.display = 'block';
        metadataSearch.value = '';
        searchResults.textContent = '';
        clearThreatSummaries();
        
        document.querySelectorAll('.select-all-cb').forEach(cb => cb.checked = false);

        await renderFilePreview(file, {
            name: file.name,
            extLower,
            mimeType: inferredMime,
            category: fileCategory
        });
        
        historyStack = [];
        historyIndex = -1;
        saveState(file, [], 'original');
        
        fileNameDisplay.textContent = file.name;
        setFileHeader(fileCategory, inferredMime || 'MIME no detectado');
        setPrivacyStatus('success', 'check_circle', 'Analizando...');
        
        identityGrid.innerHTML = '';
        const ext = file.name.split('.').pop().toUpperCase();
        addInfoRow(identityGrid, 'Nombre completo', file.name);
        addInfoRow(identityGrid, 'Extensión real', `.${ext}`);
        addInfoRow(identityGrid, 'Tipo MIME', inferredMime || 'Desconocido');
        addInfoRow(identityGrid, 'Categoría detectada', fileCategory);
        addInfoRow(identityGrid, 'Tamaño exacto', `${file.size} bytes`);
        addInfoRow(identityGrid, 'Tamaño legible', formatBytes(file.size));
        addInfoRow(identityGrid, 'Modificado', formatDate(file.lastModified));
        if (hasSignatureMismatch) {
            addInfoRow(identityGrid, 'Incongruencia detectada', `Cabecera binaria ${signatureMime} distinta de ${inferredMime}`, 'warning');
        }
        
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
        addInfoRow(structureGrid, 'Visualización', fileCategory);
        if (signatureMime) {
            addInfoRow(structureGrid, 'Firma binaria', signatureMime);
        }
        
        if (isImage) {
            const img = new Image();
            img.src = previewBlobUrl || '';
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
            // ANÁLISIS DE AMENAZAS DE SEGURIDAD PARA AUDIO
            if (isAudio) {
                try {
                    const audioBuffer = await file.arrayBuffer();
                    const securityAnalysisAudio = analyzeAudioSecurityThreats(audioBuffer);
                    if (securityAnalysisAudio.threatCount > 0 || securityAnalysisAudio.warningCount > 0) {
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        
                        const threatSummary = createThreatSummary('Alerta de seguridad audio:', `${securityAnalysisAudio.threatCount} amenaza(s)`);
                        
                        if (extendedGrid && extendedGrid.parentElement) {
                            extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                        }
                        
                        securityAnalysisAudio.threats.forEach(threat => {
                            addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive');
                            score -= 1.5;
                            hasSensitive = true;
                        });
                        
                        securityAnalysisAudio.warnings.forEach(warning => {
                            addInfoRow(extendedGrid, warning.category, warning.description, 'warning');
                            score -= 0.3;
                        });
                    }
                } catch (e) {
                    console.log('Error analizando seguridad de audio:', e);
                }
            }
            
            const media = document.createElement(isVideo ? 'video' : 'audio');
            const mediaUrl = URL.createObjectURL(file);
            media.src = mediaUrl;
            await new Promise(resolve => {
                media.onloadedmetadata = () => {
                    addInfoRow(structureGrid, 'Duración', `${media.duration.toFixed(2)} s`);
                    if (isVideo) {
                        addInfoRow(structureGrid, 'Resolución', `${media.videoWidth} × ${media.videoHeight} px`);
                    }
                    URL.revokeObjectURL(mediaUrl);
                    resolve();
                };
                media.onerror = () => {
                    URL.revokeObjectURL(mediaUrl);
                    resolve();
                };
            });
        } else if (isText || CODE_EXTENSIONS.has(extLower)) {
            const snippet = await file.slice(0, 2000).text();
            addInfoRow(structureGrid, 'Fragmento analizado', `${snippet.length} caracteres`);
            addInfoRow(structureGrid, 'Codificación estimada', 'UTF-8 / texto plano');
        } else if (isPdf || isDocx) {
            addInfoRow(structureGrid, 'Documento', isPdf ? 'Portable Document Format' : 'Office Open XML');
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
        let hasContainerMetadata = false;
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

        const analyzeSensitiveText = (rawText, contextKey = '') => {
            if (!rawText || typeof rawText !== 'string') return;
            
            const isDateOrTime = /time|date|year|month|day|hour|minute|second/i.test(contextKey);
            
            for (const [label, patternData] of Object.entries(REGEX_PATTERNS)) {
                if (isDateOrTime && (label === 'CreditCard' || label === 'IMEI' || label === 'IMSI' || label === 'Phone')) {
                    continue;
                }
                
                const regex = new RegExp(patternData.regex.source, patternData.regex.flags);
                for (const match of rawText.matchAll(regex)) {
                    const candidate = (patternData.useCaptureGroup ? match[1] : match[0]) || '';
                    const value = String(candidate).trim();
                    if (!value) continue;
                    if (patternData.validator && !patternData.validator(value, rawText, match.index)) continue;
                    registerSensitiveFinding(label, value, patternData.penalty);
                }
            }
        };
        
        let textContent = '';
        try {
            if (isText) {
                textContent = await file.slice(0, 2 * 1024 * 1024).text();
                if (textContent) {
                    analyzeSensitiveText(textContent);
                    // Análisis adicional de patrones en archivos de texto
                    const lineCount = textContent.split('\n').length;
                    addInfoRow(structureGrid, 'Número de líneas', String(lineCount));
                    // Detectar codificación
                    const hasUTF8 = /[\u0080-\uFFFF]/.test(textContent);
                    const encoding = hasUTF8 ? 'UTF-8 con caracteres especiales' : 'ASCII / UTF-8';
                    addInfoRow(structureGrid, 'Codificación detectada', encoding);
                }
            }
        } catch (e) {
            console.log("Error reading content for analysis", e);
        }
        
        // EXIF Analysis (only for images)
        if (isImage) {
            try {
                let buffer;
                if (file.size > 20 * 1024 * 1024) { // Only read the first 20MB for EXIF header to save memory
                    buffer = await file.slice(0, 20 * 1024 * 1024).arrayBuffer();
                } else {
                    buffer = await file.arrayBuffer();
                }
                
                // ANÁLISIS DE AMENAZAS DE SEGURIDAD PARA IMÁGENES
                const securityAnalysisImg = analyzeImageSecurityThreats(buffer);
                if (securityAnalysisImg.threatCount > 0 || securityAnalysisImg.warningCount > 0) {
                    hasExtended = true;
                    extendedSection.style.display = 'block';
                    
                    const threatSummary = createThreatSummary('Alerta de seguridad:', `${securityAnalysisImg.threatCount} amenaza(s) detectada(s)`);
                    
                    if (extendedGrid.parentElement) {
                        extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                    }
                    
                    securityAnalysisImg.threats.forEach(threat => {
                        addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive');
                        score -= 1.5;
                        hasSensitive = true;
                    });
                    
                    securityAnalysisImg.warnings.forEach(warning => {
                        addInfoRow(extendedGrid, warning.category, warning.description, 'warning');
                        score -= 0.5;
                    });
                }
                
                if (typeof ExifReader === 'undefined') {
                    console.warn('⚠️ ExifReader no cargó correctamente - omitiendo análisis EXIF');
                } else {
                    let tags = null;
                    try {
                        tags = ExifReader.load(buffer, {expanded: true});
                    } catch (exifErr) {
                        console.warn('⚠️ Error al cargar EXIF:', exifErr.message);
                        tags = {};
                    }
                    
                    if (tags && typeof tags === 'object') {
                    
                    rawGrid.textContent = JSON.stringify(tags, null, 2);
                    rawSection.style.display = 'block';
                    
                    if (tags.exif && Object.keys(tags.exif).length > 0) {
                        const visibleExifEntries = Object.entries(tags.exif).filter(([key, tag]) => {
                            const isBinary = tag.value instanceof Uint8Array || tag.value instanceof ArrayBuffer || (Array.isArray(tag.value) && tag.value.length > 30) || key === 'MakerNote' || key === 'UserComment';
                            if (isBinary && !tag.description) return false; // Hide binary data unless specifically described
                            return !isTechnicalExifTag(key, tag.description || String(tag.value));
                        });

                        if (visibleExifEntries.length > 0) {
                        hasExif = true;
                        exifSection.style.display = 'block';
                        for (const [key, tag] of visibleExifEntries) {
                            const isBinary = tag.value instanceof Uint8Array || tag.value instanceof ArrayBuffer || (Array.isArray(tag.value) && tag.value.length > 30) || key === 'MakerNote' || key === 'UserComment';
                            let val = tag.description;
                            if (isBinary) {
                                val = tag.description || '[Binary Data]';
                            } else {
                                val = tag.description || String(tag.value);
                            }
                            if (val && val.length > 500) val = val.substring(0, 500) + '...';
                            extractedTags[`EXIF:${key}`] = val;
                            totalTags++;
                            analyzeSensitiveText(String(val || ''), key);
                            
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
                    }
                    
                    if (tags.gps && Object.keys(tags.gps).length > 0) {
                        hasGeo = true;
                        hasSensitive = true;
                        geoSection.style.display = 'block';
                        for (const [key, tag] of Object.entries(tags.gps)) {
                            const isBinary = tag.value instanceof Uint8Array || tag.value instanceof ArrayBuffer || (Array.isArray(tag.value) && tag.value.length > 30);
                            let val = tag.description || (isBinary ? '[Binary Data]' : String(tag.value));
                            if (val && val.length > 500) val = val.substring(0, 500) + '...';
                            extractedTags[`GPS:${key}`] = val;
                            totalTags++;
                            analyzeSensitiveText(String(val || ''), key);
                            score -= 1.5;
                            addInfoRow(geoGrid, key, val, 'sensitive', true, `GPS:${key}`);
                        }
                    }
                    
                    const extendedTypes = ['xmp', 'iptc', 'icc'];
                    extendedTypes.forEach(type => {
                        if (tags[type] && Object.keys(tags[type]).length > 0) {
                            hasExtended = true;
                            extendedSection.style.display = 'block';
                            if (type === 'icc') {
                                const iccSummary = getIccProfileSummary(tags[type]);
                                if (iccSummary) {
                                    addInfoRow(structureGrid, 'Perfil ICC', `${iccSummary} · válido`, '', false, 'ICC:summary');
                                }
                            }
                            for (const [key, tag] of Object.entries(tags[type])) {
                                const isBinary = tag.value instanceof Uint8Array || tag.value instanceof ArrayBuffer || (Array.isArray(tag.value) && tag.value.length > 30);
                                let val = tag.description || (isBinary ? '[Binary Data]' : String(tag.value));
                                if (type === 'icc') {
                                    val = normalizeNullLikeValue(val);
                                }
                                if (val && val.length > 500) val = val.substring(0, 500) + '...';
                                extractedTags[`${type.toUpperCase()}:${key}`] = val;
                                totalTags++;
                                if (type !== 'icc' || !isIccEntryLikelySafe(`[${type.toUpperCase()}] ${key}`, val)) {
                                    analyzeSensitiveText(String(val || ''), key);
                                }
                                const valueClass = type === 'icc' && isIccEntryLikelySafe(`[${type.toUpperCase()}] ${key}`, val) ? '' : '';
                                addInfoRow(extendedGrid, `[${type.toUpperCase()}] ${key}`, val, valueClass, true, `${type.toUpperCase()}:${key}`);
                            }
                        }
                    });
                    }
                }
            } catch (e) {
                console.log("No EXIF data or error reading EXIF", e);
            }
        } else if (isVideo || isAudio) {
            try {
                // Soporte expandido para múltiples formatos de video/audio
                const isIsoBmff = ['mp4', 'm4v', 'm4a', 'mov'].includes(extLower) || inferredMime === 'video/mp4' || inferredMime === 'audio/mp4' || inferredMime === 'video/quicktime';
                const isWebM = extLower === 'webm' || inferredMime === 'video/webm' || inferredMime === 'audio/webm';
                const isMatroska = ['mkv', 'mka', 'mks'].includes(extLower) || /matroska/i.test(inferredMime);
                
                if (isIsoBmff) {
                    try {
                        const MAX_MEM = 500 * 1024 * 1024; // 500MB limite seguro para no reventar memoria
                        let buffer;
                        if (file.size > MAX_MEM) {
                            console.warn("Archivo muy grande, leyendo solo los primeros 50MB para metadatos");
                            buffer = await file.slice(0, 50 * 1024 * 1024).arrayBuffer();
                        } else {
                            buffer = await file.arrayBuffer();
                        }
                        const parsedMedia = parseMp4Metadata(buffer, file.size);
                        
                        // ANÁLISIS DE AMENAZAS DE SEGURIDAD
                        const securityAnalysis = analyzeVideoSecurityThreats(buffer, file.size);
                        if (securityAnalysis.threatCount > 0 || securityAnalysis.warningCount > 0) {
                            hasExtended = true;
                            extendedSection.style.display = 'block';
                            
                            // Mostrar resumen de amenazas
                            const riskIcon = securityAnalysis.summary.riskLevel === 'CRÍTICO' ? '🚨' : '⚠️';
                            const threatSummary = createThreatSummary(`Alerta de seguridad ${riskIcon}`, `Se detectaron ${securityAnalysis.threatCount} amenaza(s) y ${securityAnalysis.warningCount} advertencia(s) en el video`);
                            
                            extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                            
                            // Mostrar amenazas críticas
                            securityAnalysis.criticalThreats.forEach(threat => {
                                const threatRow = `[${threat.category}] 🚨 ${threat.description}`;
                                addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive', false, threat.category);
                                score -= 2.0; // Penalidad significativa por amenazas críticas
                            });
                            
                            // Mostrar otras amenazas
                            securityAnalysis.threats.filter(t => t.level !== 'CRÍTICO').forEach(threat => {
                                addInfoRow(extendedGrid, `[Amenaza] ${threat.category}`, threat.description, 'warning', false, threat.category);
                                score -= 1.0;
                            });
                            
                            // Mostrar advertencias
                            securityAnalysis.warnings.forEach(warning => {
                                addInfoRow(extendedGrid, `[Advertencia] ${warning.category}`, warning.description, 'warning', false, warning.category);
                                score -= 0.3;
                                hasSensitive = true;
                            });
                        }
                        
                        if (parsedMedia.found) {
                            hasContainerMetadata = true;
                            hasExtended = true;
                            parsedMedia.structure.forEach(entry => {
                                addInfoRow(structureGrid, entry.label, entry.value);
                            });
                            if (parsedMedia.metadata.length > 0) {
                                extendedSection.style.display = 'block';
                                parsedMedia.metadata.forEach(entry => {
                                    extractedTags[`MP4:${entry.label}`] = entry.value;
                                    totalTags++;
                                    analyzeSensitiveText(String(entry.value || ''), entry.label);
                                    let valueClass = '';
                                    if (/comment|artist|author|copyright|description|encoder/i.test(entry.label)) {
                                        score -= 0.4;
                                        valueClass = /comment|artist|author|copyright/i.test(entry.label) ? 'warning' : '';
                                    }
                                    addInfoRow(extendedGrid, `[MP4] ${entry.label}`, entry.value, valueClass);
                                });
                            }
                            rawGrid.textContent = JSON.stringify(parsedMedia.raw, null, 2);
                            rawSection.style.display = 'block';
                        }
                    } catch (memErr) {
                        console.error('Error de memoria o parseo en MP4:', memErr);
                        addInfoRow(structureGrid, 'Error', 'El archivo es demasiado grande o complejo para analizar todos sus metadatos internos en el navegador.');
                    }
                } else if (isWebM) {
                    // Análisis básico de WebM
                    try {
                        const webmBuffer = await file.arrayBuffer();
                        const view = new DataView(webmBuffer);
                        if (view.byteLength >= 4 && view.getUint8(0) === 0x1A && view.getUint8(1) === 0x45 && view.getUint8(2) === 0xDF && view.getUint8(3) === 0xA3) {
                            addInfoRow(structureGrid, 'Formato contenedor', 'WebM/EBML ✓ válido');
                            hasContainerMetadata = true;
                            
                            // ANÁLISIS DE AMENAZAS PARA WEBM
                            const securityAnalysis = analyzeVideoSecurityThreats(webmBuffer, file.size);
                            if (securityAnalysis.threatCount > 0 || securityAnalysis.warningCount > 0) {
                                hasExtended = true;
                                extendedSection.style.display = 'block';
                                
                                const threatSummary = createThreatSummary('Alerta de seguridad WebM:', `${securityAnalysis.threatCount} amenaza(s) detectada(s)`);
                                extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                                
                                securityAnalysis.threats.forEach(threat => {
                                    addInfoRow(extendedGrid, `[${threat.category}]`, threat.description, threat.level === 'CRÍTICO' ? 'sensitive' : 'warning');
                                    score -= threat.level === 'CRÍTICO' ? 2.0 : 0.8;
                                });
                            }
                        }
                    } catch (webmErr) {
                        console.log('Advertencia analizando WebM:', webmErr.message);
                    }
                } else if (isMatroska) {
                    // Análisis básico de Matroska
                    try {
                        const mkvBuffer = await file.arrayBuffer();
                        const view = new DataView(mkvBuffer);
                        if (view.byteLength >= 4 && view.getUint8(0) === 0x1A && view.getUint8(1) === 0x45 && view.getUint8(2) === 0xDF && view.getUint8(3) === 0xA3) {
                            addInfoRow(structureGrid, 'Formato contenedor', 'Matroska/EBML ✓ válido');
                            hasContainerMetadata = true;
                            
                            // ANÁLISIS DE AMENAZAS PARA MATROSKA
                            const securityAnalysis = analyzeVideoSecurityThreats(mkvBuffer, file.size);
                            if (securityAnalysis.threatCount > 0 || securityAnalysis.warningCount > 0) {
                                hasExtended = true;
                                extendedSection.style.display = 'block';
                                
                                const threatSummary = createThreatSummary('Alerta de seguridad MKV:', `${securityAnalysis.threatCount} amenaza(s) detectada(s)`);
                                extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                                
                                securityAnalysis.threats.forEach(threat => {
                                    addInfoRow(extendedGrid, `[${threat.category}]`, threat.description, threat.level === 'CRÍTICO' ? 'sensitive' : 'warning');
                                    score -= threat.level === 'CRÍTICO' ? 2.0 : 0.8;
                                });
                            }
                        }
                    } catch (mkvErr) {
                        console.log('Advertencia analizando Matroska:', mkvErr.message);
                    }
                } else {
                    // Otros formatos de audio/video
                    addInfoRow(structureGrid, 'Tipo contenedor', 'Formato sin análisis de metadata extendida (AVI, FLV, ASF, etc.)');
                }
            } catch (e) {
                console.log('Error reading MP4/MOV metadata', e);
            }
        } else if (isPdf) {
            try {
                if (typeof pdfjsLib === 'undefined') {
                    console.warn('⚠️ pdfjsLib no cargó - omitiendo análisis PDF avanzado');
                } else {
                    const MAX_PDF_MEM = 50 * 1024 * 1024; // Limit PDF reading memory
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
                    let pdfData;
                    let pdfBuffer;
                    if (file.size > MAX_PDF_MEM) {
                         const fileUrl = URL.createObjectURL(file);
                         pdfData = { url: fileUrl };
                    } else {
                         pdfBuffer = await file.arrayBuffer();
                         pdfData = { data: pdfBuffer };
                    }

                    // ANÁLISIS DE AMENAZAS DE SEGURIDAD PARA PDF
                    if (pdfBuffer) {
                        const securityAnalysisPdf = analyzePdfSecurityThreats(pdfBuffer);
                        if (securityAnalysisPdf.threatCount > 0 || securityAnalysisPdf.warningCount > 0) {
                            hasExtended = true;
                            extendedSection.style.display = 'block';
                            
                            const threatSummary = createThreatSummary('Alerta de seguridad PDF:', `${securityAnalysisPdf.threatCount} amenaza(s)`);
                            
                            if (extendedGrid.parentElement) {
                                extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                            }
                            
                            securityAnalysisPdf.threats.forEach(threat => {
                                addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive');
                                score -= 1.5;
                                hasSensitive = true;
                            });
                            
                            securityAnalysisPdf.warnings.forEach(warning => {
                                addInfoRow(extendedGrid, warning.category, warning.description, 'warning');
                                score -= 0.5;
                            });
                        }
                    }

                    const pdf = await pdfjsLib.getDocument(pdfData).promise;
                    const metadata = await pdf.getMetadata();
                    
                    if (file.size > MAX_PDF_MEM && pdfData.url) URL.revokeObjectURL(pdfData.url);
                    
                    addInfoRow(structureGrid, 'Total de páginas', String(pdf.numPages));
                    
                    rawGrid.textContent = JSON.stringify(metadata, null, 2);
                    rawSection.style.display = 'block';
                    
                    if (metadata.info && Object.keys(metadata.info).length > 0) {
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        const sensitivePdfKeys = ['author', 'creator', 'producer', 'subject', 'keywords'];
                        for (const [key, val] of Object.entries(metadata.info)) {
                            if (val && typeof val === 'string' && val.trim() !== '') {
                                extractedTags[`PDF:${key}`] = val;
                                totalTags++;
                                analyzeSensitiveText(val, key);
                                
                                let valClass = '';
                                if (sensitivePdfKeys.includes(key.toLowerCase())) {
                                    hasSensitive = true;
                                    score -= sensitivePdfKeys.slice(0, 2).includes(key.toLowerCase()) ? 1.0 : 0.3;
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
                if (typeof JSZip === 'undefined') {
                    console.warn('⚠️ JSZip no cargó - omitiendo análisis DOCX');
                } else {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    
                    // ANÁLISIS DE AMENAZAS DE SEGURIDAD PARA DOCX
                    const securityAnalysisDocx = analyzeDocxSecurityThreats(contents);
                    if (securityAnalysisDocx.threatCount > 0 || securityAnalysisDocx.warningCount > 0) {
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        
                        const threatSummary = createThreatSummary('Alerta de seguridad DOCX:', `${securityAnalysisDocx.threatCount} amenaza(s)`);
                        
                        if (extendedGrid.parentElement) {
                            extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                        }
                        
                        securityAnalysisDocx.threats.forEach(threat => {
                            addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive');
                            score -= 2.0;
                            hasSensitive = true;
                        });
                        
                        securityAnalysisDocx.warnings.forEach(warning => {
                            addInfoRow(extendedGrid, warning.category, warning.description, 'warning');
                            score -= 0.5;
                        });
                    }
                    
                    const docxMeta = {};
                    hasExtended = true;
                    extendedSection.style.display = 'block';
                    const sensitiveDocxKeys = ['creator', 'lastmodifiedby', 'author'];
                    
                    // Leer core.xml (metadatos básicos)
                    if (contents.files['docProps/core.xml']) {
                        const coreXml = await contents.files['docProps/core.xml'].async('string');
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(coreXml, "text/xml");
                        const elements = xmlDoc.documentElement.children;
                        
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i];
                            const key = el.tagName.split(':').pop();
                            const val = el.textContent;
                            if (val && val.trim() !== '') {
                                docxMeta[key] = val;
                                extractedTags[`DOCX:${key}`] = val;
                                totalTags++;
                                analyzeSensitiveText(val, key);
                                let valClass = sensitiveDocxKeys.includes(key.toLowerCase()) ? 'sensitive' : '';
                                if (valClass) {
                                    hasSensitive = true;
                                    score -= 1.0;
                                }
                                addInfoRow(extendedGrid, `[DOCX] ${key}`, val, valClass);
                            }
                        }
                    }
                    
                    // Leer app.xml (aplicación, versión)
                    if (contents.files['docProps/app.xml']) {
                        try {
                            const appXml = await contents.files['docProps/app.xml'].async('string');
                            const appParser = new DOMParser();
                            const appDoc = appParser.parseFromString(appXml, "text/xml");
                            const appElements = appDoc.documentElement.children;
                            for (let i = 0; i < appElements.length; i++) {
                                const el = appElements[i];
                                const key = el.tagName.split(':').pop();
                                const val = el.textContent;
                                if (val && val.trim() !== '') {
                                    docxMeta[`App_${key}`] = val;
                                    extractedTags[`DOCX:App_${key}`] = val;
                                    totalTags++;
                                    addInfoRow(extendedGrid, `[DOCX-App] ${key}`, val, '');
                                }
                            }
                        } catch (appErr) {
                            console.log('Nota: app.xml no disponible o inválido');
                        }
                    }
                    
                    // Revisar custom.xml (metadatos personalizados)
                    if (contents.files['docProps/custom.xml']) {
                        try {
                            const customXml = await contents.files['docProps/custom.xml'].async('string');
                            const customParser = new DOMParser();
                            const customDoc = customParser.parseFromString(customXml, "text/xml");
                            const properties = customDoc.querySelectorAll('Property');
                            let hasCustom = false;
                            for (const prop of properties) {
                                const name = prop.getAttribute('name');
                                const val = prop.textContent;
                                if (name && val && val.trim() !== '') {
                                    docxMeta[`Custom_${name}`] = val;
                                    extractedTags[`DOCX:Custom_${name}`] = val;
                                    totalTags++;
                                    hasSensitive = true;
                                    hasCustom = true;
                                    score -= 0.5;
                                    addInfoRow(extendedGrid, `[DOCX-Custom] ${name}`, val, 'warning');
                                }
                            }
                            if (hasCustom) score -= 0.2;
                        } catch (customErr) {
                            console.log('Nota: custom.xml no disponible o vacío');
                        }
                    }
                    
                    rawGrid.textContent = JSON.stringify(docxMeta, null, 2);
                    rawSection.style.display = 'block';
                }
            } catch (e) {
                console.log("Error reading DOCX metadata", e);
            }
        } else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || extLower === 'zip') {
            // Análisis de archivos ZIP
            try {
                if (typeof JSZip === 'undefined') {
                    console.warn('⚠️ JSZip no disponible para análisis ZIP');
                } else {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    
                    // ANÁLISIS DE AMENAZAS DE SEGURIDAD PARA ZIP
                    const securityAnalysisZip = analyzeZipSecurityThreats(contents);
                    if (securityAnalysisZip.threatCount > 0 || securityAnalysisZip.warningCount > 0) {
                        hasExtended = true;
                        extendedSection.style.display = 'block';
                        
                        const threatSummary = createThreatSummary('Alerta de seguridad ZIP:', `${securityAnalysisZip.threatCount} amenaza(s)`);
                        
                        if (extendedGrid.parentElement) {
                            extendedGrid.parentElement.insertBefore(threatSummary, extendedGrid);
                        }
                        
                        securityAnalysisZip.threats.forEach(threat => {
                            addInfoRow(extendedGrid, threat.category, threat.description, 'sensitive');
                            score -= 2.0;
                            hasSensitive = true;
                        });
                        
                        securityAnalysisZip.warnings.forEach(warning => {
                            addInfoRow(extendedGrid, warning.category, warning.description, 'warning');
                            score -= 0.5;
                        });
                    }
                    
                    hasExtended = true;
                    extendedSection.style.display = 'block';
                    
                    const zipMeta = {};
                    const filePaths = [];
                    let maxFiles = 0;
                    
                    for (const [path, fileObj] of Object.entries(contents.files)) {
                        filePaths.push(path);
                        if (filePaths.length <= 20) {
                            extractedTags[`ZIP:${path}`] = fileObj.dir ? '[carpeta]' : '[archivo]';
                        }
                        maxFiles++;
                    }
                    
                    zipMeta['archivos internos'] = maxFiles;
                    zipMeta['archivos mostrados'] = Math.min(20, maxFiles);
                    
                    addInfoRow(structureGrid, 'Archivos en ZIP', String(maxFiles));
                    addInfoRow(extendedGrid, 'Contenido mostrado', `Primeros ${Math.min(20, maxFiles)} de ${maxFiles}`);
                    
                    filePaths.slice(0, 20).forEach(path => {
                        totalTags++;
                        const isSuspicious = path.includes('..') || path.includes('~') || /\\\\.\\./i.test(path);
                        if (isSuspicious) {
                            hasSensitive = true;
                            score -= 0.5;
                            addInfoRow(extendedGrid, `[ZIP] Ruta sospechosa`, path, 'warning');
                        } else {
                            addInfoRow(extendedGrid, `[ZIP] ${path}`, '[contenido]', '');
                        }
                    });
                    
                    rawGrid.textContent = JSON.stringify(zipMeta, null, 2);
                    rawSection.style.display = 'block';
                }
            } catch (e) {
                console.log("Error reading ZIP contents", e);
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
                const uniqueValues = [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
                addInfoRow(contentGrid, `${label} detectado`, formatFindingsSummary(uniqueValues), 'warning');
                uniqueValues.slice(0, 5).forEach((value, index) => {
                    addInfoRow(contentGrid, `${label} ${index + 1}`, value, 'sensitive');
                });
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
        
        if (!hasExif && !hasGeo && !hasExtended && !hasContainerMetadata && !hasSensitive) {
            noMetadataMsg.style.display = 'flex';
            setPrivacyStatus('success', 'check_circle', 'Archivo limpio (Sin datos sensibles)');
        } else {
            if (hasSensitive) {
                setPrivacyStatus('danger', 'warning', 'Datos sensibles detectados');
            } else {
                setPrivacyStatus('warning', 'info', 'Metadata detectada');
            }
        }

        applyCleaningProfileSelection(cleaningProfile?.value || 'complete');
        renderRiskPanel();

        lastAnalysisSummary = {
            name: file.name,
            category: fileCategory,
            score,
            findings: sensitiveFindings.length + Object.keys(extractedTags).length,
            riskLevel: getBatchRiskLevel(score),
            size: file.size,
            sizeLabel: formatBytes(file.size),
            timestamp: new Date().toISOString(),
            timeLabel: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };

        if (!preserveBatch) {
            addBatchEntry(lastAnalysisSummary);
        }
        
    } catch (error) {
        console.error(error);
        noMetadataMsg.style.display = 'flex';
        clearElement(noMetadataMsg);
        const icon = document.createElement('span');
        icon.className = 'material-symbols-rounded';
        icon.textContent = 'error';
        const text = document.createTextNode('Error al analizar archivo');
        noMetadataMsg.appendChild(icon);
        noMetadataMsg.appendChild(text);
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
    clearElement(diffGrid);

    const header = document.createElement('div');
    header.className = 'diff-row diff-header-row';
    ['Campo', 'Antes', 'Después'].forEach(text => {
        const span = document.createElement('span');
        span.textContent = text;
        header.appendChild(span);
    });
    diffGrid.appendChild(header);
    
    if (removedKeys.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'padding: 16px; text-align: center; color: var(--text-muted);';
        empty.textContent = 'No se eliminaron metadatos específicos.';
        diffGrid.appendChild(empty);
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

    const activeProfile = cleaningProfile?.value || 'complete';
    const currentExt = (currentFile.name.split('.').pop() || '').toLowerCase();
    const currentMime = currentFile.type || inferMimeType(currentExt);
    const profileWantsSelective = activeProfile !== 'complete';

    if (profileWantsSelective && (currentMime === 'image/jpeg' || currentMime === 'image/jpg' || ['jpg', 'jpeg'].includes(currentExt))) {
        if (activeProfile !== 'selective') {
            applyCleaningProfileSelection(activeProfile);
        }
        btnSelectiveClean.click();
        return;
    }
    
    btnClean.style.display = 'none';
    if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = 'none';
    cleaningProgress.style.display = 'flex';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.transform = `scaleX(${progress / 100})`;
    }, 100);
    
    try {
        const isJpeg = currentFile.type === 'image/jpeg' || currentFile.type === 'image/jpg';
        const isIsoBmff = isIsoBmffMedia(currentExt, currentMime);
        
        if (isJpeg) {
            if (currentFile.size > 100 * 1024 * 1024) {
                clearInterval(interval);
                cleaningProgress.style.display = 'none';
                btnClean.style.display = 'inline-flex';
                alert('El archivo de imagen es excepcionalmente grande para limpiar metadatos en móvil.');
                return;
            }
            const arrayBuffer = await currentFile.arrayBuffer();
            const cleanedData = stripAllJpegMetadata(arrayBuffer);
            if (!cleanedData) throw new Error('Error procesando JPEG');

            const verification = verifyCleanJpeg(cleanedData.buffer);
            let finalData = cleanedData;
            if (!verification.clean) {
                const secondPass = stripAllJpegMetadata(finalData.buffer);
                if (secondPass) finalData = secondPass;
            }

            const blob = new Blob([finalData], { type: 'image/jpeg' });

            clearInterval(interval);
            progressFill.style.transform = 'scaleX(1)';

            cleanHash = await calculateSHA512(blob);
            const cleanHash256 = await calculateSHA256(blob);
            const cleanHashMD5 = await calculateMD5(blob);
            const cleanHashCRC32 = await calculateCRC32(blob);

            const finalVerification = verifyCleanJpeg(finalData.buffer);

            setTimeout(async () => {
                cleanSize = blob.size;
                cleanBlobUrl = URL.createObjectURL(blob);

                cleaningProgress.style.display = 'none';
                await renderFilePreview(blob, {
                    name: currentFile.name,
                    extLower: (currentFile.name.split('.').pop() || '').toLowerCase(),
                    mimeType: blob.type || currentFile.type,
                    category: getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase()))
                });
                setFileHeader(getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase())), 'Vista del archivo limpio');

                if (finalVerification.clean) {
                    setPrivacyStatus('success', 'verified_user', 'Metadata eliminada y verificada ✔');
                } else {
                    setPrivacyStatus('warning', 'gpp_maybe', `Limpieza parcial: quedan ${finalVerification.remaining.join(', ')}`);
                }

                resultSection.style.display = 'block';
                resultStats.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Tamaño original</span>
                        <span class="stat-value strike">${formatBytes(originalSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tamaño limpio</span>
                        <span class="stat-value new">${formatBytes(cleanSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ahorrado</span>
                        <span class="stat-value">${formatBytes(originalSize - cleanSize)}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                        <span class="stat-label">Verificación</span>
                        <span class="stat-value ${finalVerification.clean ? 'new' : 'sensitive'}">${finalVerification.clean ? 'LIMPIO ✔' : 'Restos: ' + finalVerification.remaining.join(', ')}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                        <span class="stat-label">CRC32 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">MD5 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">SHA-256 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">SHA-512 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
                    </div>
                `;

                const removedKeys = Object.keys(extractedTags);
                showDiffs(removedKeys);
                saveState(blob, removedKeys, 'full');

                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
            
        } else if (currentMime.startsWith('image/')) {
            // Fallback para otras imágenes usando Canvas
            const img = new Image();
            img.src = URL.createObjectURL(currentFile);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("No se pudo cargar la imagen para limpiar"));
            });

            // Prevent mobile Canvas OOM (Out Of Memory)
            const MAX_DIM = window.innerWidth <= 768 ? 2048 : 4096;
            let targetWidth = img.width;
            let targetHeight = img.height;
            
            if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
                targetWidth = Math.floor(targetWidth * ratio);
                targetHeight = Math.floor(targetHeight * ratio);
                console.warn(`Imagen muy grande escalada a ${targetWidth}x${targetHeight} por restricciones de hardware`);
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            const type = currentFile.type || 'image/png';
            const quality = 1.0; // Máxima calidad para no perder datos
            
            canvas.toBlob(async (blob) => {
                clearInterval(interval);
                progressFill.style.transform = 'scaleX(1)';
                
                cleanHash = await calculateSHA512(blob);
                const cleanHash256 = await calculateSHA256(blob);
                const cleanHashMD5 = await calculateMD5(blob);
                const cleanHashCRC32 = await calculateCRC32(blob);
                
                setTimeout(async () => {
                    cleanSize = blob.size;
                    cleanBlobUrl = URL.createObjectURL(blob);
                    
                    cleaningProgress.style.display = 'none';
                    await renderFilePreview(blob, {
                        name: currentFile.name,
                        extLower: (currentFile.name.split('.').pop() || '').toLowerCase(),
                        mimeType: blob.type || currentFile.type,
                        category: getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase()))
                    });
                    setFileHeader(getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase())), 'Vista del archivo limpio');
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
        } else if (isIsoBmff) {
            const MAX_MEM_CLEAN = 300 * 1024 * 1024; // 300MB
            if (currentFile.size > MAX_MEM_CLEAN) {
                clearInterval(interval);
                cleaningProgress.style.display = 'none';
                btnClean.style.display = 'inline-flex';
                alert('El archivo de vídeo es demasiado grande (' + formatBytes(currentFile.size) + ') para limpiarlo en el navegador. (Límite ' + formatBytes(MAX_MEM_CLEAN) + ')');
                return;
            }
            try {
                const arrayBuffer = await currentFile.arrayBuffer();
                const cleanedData = stripMp4Metadata(arrayBuffer);
                const verification = parseMp4Metadata(cleanedData.buffer, cleanedData.byteLength);
                const blob = new Blob([cleanedData], { type: currentMime || 'video/mp4' });

                clearInterval(interval);
                progressFill.style.transform = 'scaleX(1)';

                cleanHash = await calculateSHA512(blob);
                const cleanHash256 = await calculateSHA256(blob);
                const cleanHashMD5 = await calculateMD5(blob);
                const cleanHashCRC32 = await calculateCRC32(blob);

                setTimeout(async () => {
                    cleanSize = blob.size;
                    if (cleanBlobUrl) URL.revokeObjectURL(cleanBlobUrl);
                    cleanBlobUrl = URL.createObjectURL(blob);

                    cleaningProgress.style.display = 'none';
                    await renderFilePreview(blob, {
                        name: currentFile.name,
                        extLower: currentExt,
                        mimeType: blob.type || currentMime,
                        category: getFileCategory(currentFile, currentExt, blob.type || currentMime)
                    });
                    setFileHeader(getFileCategory(currentFile, currentExt, blob.type || currentMime), 'Vista del archivo limpio');
                    setPrivacyStatus(verification.metadata.length === 0 ? 'success' : 'warning', verification.metadata.length === 0 ? 'verified_user' : 'gpp_maybe', verification.metadata.length === 0 ? 'Metadata MP4 eliminada ✔' : 'Limpieza parcial de metadata MP4');

                    resultSection.style.display = 'block';
                resultStats.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Tamaño original</span>
                        <span class="stat-value strike">${formatBytes(originalSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tamaño limpio</span>
                        <span class="stat-value new">${formatBytes(cleanSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ahorrado</span>
                        <span class="stat-value">${formatBytes(originalSize - cleanSize)}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                        <span class="stat-label">Verificación</span>
                        <span class="stat-value ${verification.metadata.length === 0 ? 'new' : 'warning'}">${verification.metadata.length === 0 ? 'Sin atoms descriptivos residuales ✔' : 'Quedan ' + verification.metadata.length + ' campos descriptivos'}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;">
                        <span class="stat-label">CRC32 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">MD5 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">SHA-256 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span>
                    </div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;">
                        <span class="stat-label">SHA-512 limpio</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
                    </div>
                `;

                const removedKeys = Object.keys(extractedTags);
                showDiffs(removedKeys);
                saveState(blob, removedKeys, 'full');

                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
            } catch (err) {
                console.error("Error procesando MP4 localmente", err);
                throw err;
            }
        } else {
            throw new Error('Formato no compatible con la limpieza local');
        }
        
    } catch (error) {
        clearInterval(interval);
        console.error(error);
        alert("Error al limpiar el archivo. Verifica que sea una imagen o un MP4/MOV/M4A compatible.");
        btnClean.style.display = 'inline-flex';
        if (typeof btnSelectiveClean !== 'undefined') btnSelectiveClean.style.display = canSelectiveCleanMetadata(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase())) ? 'inline-flex' : 'none';
        cleaningProgress.style.display = 'none';
    }
});

function readUint16BE(data, offset) {
    return (data[offset] << 8) | data[offset + 1];
}

function matchBytes(data, offset, str) {
    for (let i = 0; i < str.length; i++) {
        if (offset + i >= data.length) return false;
        if (data[offset + i] !== str.charCodeAt(i)) return false;
    }
    return true;
}

function parseJpegMarkers(data) {
    const markers = [];
    if (data.length < 2 || data[0] !== 0xFF || data[1] !== 0xD8) return null;
    markers.push({ marker: 0xD8, start: 0, end: 2 });
    let offset = 2;
    while (offset < data.length - 1) {
        if (data[offset] !== 0xFF) break;
        let startOffset = offset;
        while (offset < data.length - 1 && data[offset + 1] === 0xFF) offset++;
        const marker = data[offset + 1];
        if (marker === 0xDA) { // SOS
            markers.push({ marker, start: startOffset, end: data.length });
            break;
        }
        if (marker === 0xD9) { // EOI
            markers.push({ marker, start: startOffset, end: offset + 2 });
            break;
        }
        if (marker === 0x00 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
            // Markers without length
            markers.push({ marker, start: startOffset, end: offset + 2 });
            offset += 2;
            continue;
        }
        if (offset + 3 >= data.length) break;
        const segLen = readUint16BE(data, offset + 2);
        const segEnd = offset + 2 + segLen;
        if (segEnd > data.length) break;
        markers.push({ marker, start: startOffset, end: segEnd });
        offset = segEnd;
    }
    return markers;
}

function stripAllJpegMetadata(arrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    const markers = parseJpegMarkers(data);
    if (!markers) return null;
    const keep = markers.filter(seg => {
        if (seg.marker === 0xD8) return true;
        if (seg.marker === 0xE0) return false;
        if (seg.marker >= 0xE1 && seg.marker <= 0xEF) return false;
        if (seg.marker === 0xFE) return false;
        return true;
    });
    let total = 0;
    keep.forEach(s => total += (s.end - s.start));
    const result = new Uint8Array(total);
    let pos = 0;
    keep.forEach(s => {
        result.set(data.subarray(s.start, s.end), pos);
        pos += (s.end - s.start);
    });
    return result;
}

function stripJpegSegments(arrayBuffer, removeExif, removeXmp, removeIptc, removeIcc) {
    const data = new Uint8Array(arrayBuffer);
    const markers = parseJpegMarkers(data);
    if (!markers) return null;
    const keep = markers.filter(seg => {
        let markerStart = 0;
        const sd = data.subarray(seg.start, seg.end);
        while(markerStart < sd.length - 1 && sd[markerStart] === 0xFF && sd[markerStart+1] === 0xFF) {
            markerStart++;
        }
        
        if (seg.marker === 0xE1) {
            if (removeExif && sd.length >= markerStart + 10 && matchBytes(sd, markerStart + 4, "Exif\x00\x00")) return false;
            if (removeXmp && sd.length >= markerStart + 33 && matchBytes(sd, markerStart + 4, "http://ns.adobe.com/xap/1.0/\x00")) return false;
        }
        if (seg.marker === 0xED && removeIptc) {
            if (sd.length >= markerStart + 18 && matchBytes(sd, markerStart + 4, "Photoshop 3.0\x00")) return false;
        }
        if (seg.marker === 0xE2 && removeIcc) {
            if (sd.length >= markerStart + 16 && matchBytes(sd, markerStart + 4, "ICC_PROFILE\x00")) return false;
        }
        return true;
    });
    let total = 0;
    keep.forEach(s => total += (s.end - s.start));
    const result = new Uint8Array(total);
    let pos = 0;
    keep.forEach(s => {
        result.set(data.subarray(s.start, s.end), pos);
        pos += (s.end - s.start);
    });
    return result;
}

function verifyCleanJpeg(arrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    const markers = parseJpegMarkers(data);
    if (!markers) return { clean: false, remaining: ['Error parsing JPEG'] };
    const remaining = [];
    markers.forEach(seg => {
        let markerStart = 0;
        const sd = data.subarray(seg.start, seg.end);
        while(markerStart < sd.length - 1 && sd[markerStart] === 0xFF && sd[markerStart+1] === 0xFF) {
            markerStart++;
        }

        if (seg.marker === 0xE0) remaining.push('JFIF');
        if (seg.marker >= 0xE1 && seg.marker <= 0xEF) {
            if (seg.marker === 0xE1 && sd.length >= markerStart + 10 && matchBytes(sd, markerStart + 4, "Exif\x00\x00")) remaining.push('EXIF');
            else if (seg.marker === 0xE1 && sd.length >= markerStart + 33 && matchBytes(sd, markerStart + 4, "http://ns.adobe.com/xap/1.0/\x00")) remaining.push('XMP');
            else if (seg.marker === 0xED && sd.length >= markerStart + 18 && matchBytes(sd, markerStart + 4, "Photoshop 3.0\x00")) remaining.push('IPTC');
            else if (seg.marker === 0xE2 && sd.length >= markerStart + 16 && matchBytes(sd, markerStart + 4, "ICC_PROFILE\x00")) remaining.push('ICC');
            else remaining.push(`APP${seg.marker - 0xE0}`);
        }
        if (seg.marker === 0xFE) remaining.push('Comment');
    });
    return { clean: remaining.length === 0, remaining };
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
        progressFill.style.transform = `scaleX(${progress / 100})`;
    }, 100);
    
    try {
        if (currentFile.size > 100 * 1024 * 1024) {
            clearInterval(interval);
            cleaningProgress.style.display = 'none';
            btnSelectiveClean.style.display = 'inline-flex';
            btnClean.style.display = 'inline-flex';
            alert('El archivo es demasiado grande para limpiarse selectivamente en el navegador.');
            return;
        }

        const arrayBuffer = await currentFile.arrayBuffer();

        const nameToTag = {};
        const ifdMap = { 'Image': '0th', '0th': '0th', 'Exif': 'Exif', 'GPS': 'GPS', '1st': '1st', 'Interop': 'Interop' };
        for (const ifd in piexif.TAGS) {
            const targetIfd = ifdMap[ifd] || ifd;
            for (const tagId in piexif.TAGS[ifd]) {
                const tagName = piexif.TAGS[ifd][tagId].name;
                nameToTag[tagName] = { ifd: targetIfd, id: parseInt(tagId) };
            }
        }

        let removeExif = false;
        let removeXmp = false;
        let removeIptc = false;
        let removeIcc = false;
        let removeAllGps = false;
        const removedKeys = [];
        const selectedExifNames = [];
        const selectedGpsNames = [];

        checkboxes.forEach(cb => {
            const fullKey = cb.dataset.key;
            const colonIdx = fullKey.indexOf(':');
            const type = fullKey.substring(0, colonIdx);
            const name = fullKey.substring(colonIdx + 1);
            removedKeys.push(fullKey);

            if (type === 'GPS') {
                selectedGpsNames.push(name);
            } else if (type === 'EXIF') {
                selectedExifNames.push(name);
            } else if (type === 'XMP') {
                removeXmp = true;
            } else if (type === 'IPTC') {
                removeIptc = true;
            } else if (type === 'ICC') {
                removeIcc = true;
            }
        });

        const allGpsChecked = geoGrid.querySelectorAll('.remove-checkbox').length > 0 &&
            geoGrid.querySelectorAll('.remove-checkbox').length === geoGrid.querySelectorAll('.remove-checkbox:checked').length;
        const allExifChecked = exifGrid.querySelectorAll('.remove-checkbox').length > 0 &&
            exifGrid.querySelectorAll('.remove-checkbox').length === exifGrid.querySelectorAll('.remove-checkbox:checked').length;
        const allExtChecked = extendedGrid.querySelectorAll('.remove-checkbox').length > 0 &&
            extendedGrid.querySelectorAll('.remove-checkbox').length === extendedGrid.querySelectorAll('.remove-checkbox:checked').length;

        if (allGpsChecked && allExifChecked && allExtChecked) {
            const cleanedData = stripAllJpegMetadata(arrayBuffer);
            if (!cleanedData) throw new Error('Error procesando JPEG');
            const blob = new Blob([cleanedData], { type: 'image/jpeg' });

            clearInterval(interval);
            progressFill.style.transform = 'scaleX(1)';

            cleanHash = await calculateSHA512(blob);
            const cleanHash256 = await calculateSHA256(blob);
            const cleanHashMD5 = await calculateMD5(blob);
            const cleanHashCRC32 = await calculateCRC32(blob);
            const finalVerification = verifyCleanJpeg(cleanedData.buffer);

            setTimeout(async () => {
                cleanSize = blob.size;
                cleanBlobUrl = URL.createObjectURL(blob);
                cleaningProgress.style.display = 'none';
                await renderFilePreview(blob, {
                    name: currentFile.name,
                    extLower: (currentFile.name.split('.').pop() || '').toLowerCase(),
                    mimeType: blob.type || currentFile.type,
                    category: getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase()))
                });
                setFileHeader(getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase())), 'Vista del archivo limpio');
                if (finalVerification.clean) {
                    setPrivacyStatus('success', 'verified_user', 'Toda la metadata eliminada y verificada ✔');
                } else {
                    setPrivacyStatus('warning', 'gpp_maybe', `Quedan: ${finalVerification.remaining.join(', ')}`);
                }
                resultSection.style.display = 'block';
                resultStats.innerHTML = `
                    <div class="stat-item"><span class="stat-label">Original Size</span><span class="stat-value strike">${formatBytes(originalSize)}</span></div>
                    <div class="stat-item"><span class="stat-label">Clean Size</span><span class="stat-value new">${formatBytes(cleanSize)}</span></div>
                    <div class="stat-item"><span class="stat-label">Saved</span><span class="stat-value">${formatBytes(originalSize - cleanSize)}</span></div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;"><span class="stat-label">Verificación</span><span class="stat-value ${finalVerification.clean ? 'new' : 'sensitive'}">${finalVerification.clean ? 'LIMPIO ✔' : 'Restos: ' + finalVerification.remaining.join(', ')}</span></div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;"><span class="stat-label">Clean CRC32</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span></div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean MD5</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span></div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean SHA-256</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span></div>
                    <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean SHA-512</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span></div>
                `;
                showDiffs(removedKeys);
                saveState(blob, removedKeys, 'selective');
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);

            return;
        }

        let workingBuffer = arrayBuffer;

        if (allGpsChecked) {
            removeAllGps = true;
        }

        const needsPiexif = selectedExifNames.length > 0 || selectedGpsNames.length > 0;

        if (needsPiexif && !allGpsChecked && !allExifChecked) {
            const reader = new FileReader();
            reader.readAsDataURL(currentFile);
            await new Promise((resolve, reject) => {
                reader.onload = resolve;
                reader.onerror = reject;
            });
            let jpegData = reader.result;

            let exifObj;
            try {
                exifObj = piexif.load(jpegData);
            } catch (e) {
                exifObj = {"0th":{}, "Exif":{}, "GPS":{}, "Interop":{}, "1st":{}, "thumbnail":null};
            }

            selectedExifNames.forEach(name => {
                let tagInfo = nameToTag[name];
                if (tagInfo && exifObj[tagInfo.ifd] && exifObj[tagInfo.ifd][tagInfo.id] !== undefined) {
                    delete exifObj[tagInfo.ifd][tagInfo.id];
                } else {
                    for (const ifd of ['0th', 'Exif', '1st']) {
                        if (!exifObj[ifd]) continue;
                        for (const tid in exifObj[ifd]) {
                            const tInfo = piexif.TAGS[ifd === '0th' ? 'Image' : ifd];
                            if (tInfo && tInfo[tid] && tInfo[tid].name) {
                                const normTInfo = tInfo[tid].name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                const normName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                if (normTInfo === normName) {
                                    delete exifObj[ifd][tid];
                                }
                            }
                        }
                    }
                }
            });

            selectedGpsNames.forEach(name => {
                const normName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/^gps/, '');
                
                let foundMatch = false;
                if (exifObj.GPS) {
                    for (const tid in exifObj.GPS) {
                        const tInfo = piexif.TAGS.GPS;
                        if (tInfo && tInfo[tid] && tInfo[tid].name) {
                            const tn = tInfo[tid].name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/^gps/, '');
                            if (tn === normName) {
                                delete exifObj.GPS[tid];
                                foundMatch = true;
                            }
                        }
                    }
                }
                if (!foundMatch) {
                    let tagInfo = nameToTag[name] || nameToTag[`GPS${name}`] || nameToTag[`GPS${name}Ref`];
                    if (tagInfo && exifObj[tagInfo.ifd] && exifObj[tagInfo.ifd][tagInfo.id] !== undefined) {
                        delete exifObj[tagInfo.ifd][tagInfo.id];
                    }
                }
            });

            try {
                const exifBytes = piexif.dump(exifObj);
                jpegData = piexif.insert(exifBytes, jpegData);
            } catch (e) {
                jpegData = piexif.remove(jpegData);
            }

            const b64 = jpegData.split(',')[1];
            const raw = atob(b64);
            const buf = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
            workingBuffer = buf.buffer;
        }

        if (allGpsChecked || allExifChecked) {
            removeExif = true;
        }

        if (removeExif || removeXmp || removeIptc || removeIcc) {
            const stripped = stripJpegSegments(workingBuffer, removeExif, removeXmp, removeIptc, removeIcc);
            if (stripped) workingBuffer = stripped.buffer;
        }

        if (allExtChecked) {
            removeXmp = true;
            removeIptc = true;
            removeIcc = true;
            const stripped2 = stripJpegSegments(workingBuffer, false, true, true, true);
            if (stripped2) workingBuffer = stripped2.buffer;
        }

        const blob = new Blob([new Uint8Array(workingBuffer)], { type: 'image/jpeg' });

        clearInterval(interval);
        progressFill.style.transform = 'scaleX(1)';

        cleanHash = await calculateSHA512(blob);
        const cleanHash256 = await calculateSHA256(blob);
        const cleanHashMD5 = await calculateMD5(blob);
        const cleanHashCRC32 = await calculateCRC32(blob);
        const selectiveVerification = verifyCleanJpeg(workingBuffer);

        setTimeout(async () => {
            cleanSize = blob.size;
            cleanBlobUrl = URL.createObjectURL(blob);

            cleaningProgress.style.display = 'none';
            await renderFilePreview(blob, {
                name: currentFile.name,
                extLower: (currentFile.name.split('.').pop() || '').toLowerCase(),
                mimeType: blob.type || currentFile.type,
                category: getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase()))
            });
            setFileHeader(getFileCategory(currentFile, (currentFile.name.split('.').pop() || '').toLowerCase(), blob.type || currentFile.type || inferMimeType((currentFile.name.split('.').pop() || '').toLowerCase())), 'Vista del archivo limpio');

            if (selectiveVerification.remaining.length === 0 && (removeExif || allExifChecked)) {
                setPrivacyStatus('success', 'verified_user', 'Metadata seleccionada eliminada y verificada ✔');
            } else {
                setPrivacyStatus('success', 'verified_user', 'Metadata seleccionada eliminada');
            }

            resultSection.style.display = 'block';
            resultStats.innerHTML = `
                <div class="stat-item"><span class="stat-label">Original Size</span><span class="stat-value strike">${formatBytes(originalSize)}</span></div>
                <div class="stat-item"><span class="stat-label">Clean Size</span><span class="stat-value new">${formatBytes(cleanSize)}</span></div>
                <div class="stat-item"><span class="stat-label">Saved</span><span class="stat-value">${formatBytes(originalSize - cleanSize)}</span></div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;"><span class="stat-label">Verificación</span><span class="stat-value ${selectiveVerification.remaining.length === 0 ? 'new' : ''}">${selectiveVerification.remaining.length === 0 ? 'Sin EXIF/XMP/IPTC/ICC residual ✔' : 'Segmentos restantes: ' + selectiveVerification.remaining.join(', ')}</span></div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 8px;"><span class="stat-label">Clean CRC32</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashCRC32}</span></div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean MD5</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHashMD5}</span></div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean SHA-256</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash256}</span></div>
                <div class="stat-item" style="grid-column: 1 / -1; margin-top: 4px;"><span class="stat-label">Clean SHA-512</span><span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span></div>
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
