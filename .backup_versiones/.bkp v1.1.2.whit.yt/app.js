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

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const inspectionPanel = document.getElementById('inspectionPanel');
const filePreview = document.getElementById('filePreview');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const privacyStatus = document.getElementById('privacyStatus');
const btnClean = document.getElementById('btnClean');
const cleaningProgress = document.getElementById('cleaningProgress');
const progressFill = document.querySelector('.progress-fill');

const identityGrid = document.getElementById('identityGrid');
const structureGrid = document.getElementById('structureGrid');
const geoGrid = document.getElementById('geoGrid');
const exifGrid = document.getElementById('exifGrid');
const extendedGrid = document.getElementById('extendedGrid');
const rawGrid = document.getElementById('rawGrid');

const geoSection = document.getElementById('geoSection');
const exifSection = document.getElementById('exifSection');
const extendedSection = document.getElementById('extendedSection');
const rawSection = document.getElementById('rawSection');
const noMetadataMsg = document.getElementById('noMetadataMsg');

const resultSection = document.getElementById('resultSection');
const resultStats = document.getElementById('resultStats');
const btnDownload = document.getElementById('btnDownload');
const btnExport = document.getElementById('btnExport');

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

const SENSITIVE_KEYS = ['GPS', 'Latitude', 'Longitude', 'Altitude', 'Location'];
const WARNING_KEYS = ['Make', 'Model', 'Software', 'SerialNumber', 'LensSerialNumber', 'CameraSerialNumber'];

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

async function calculateSHA512(blob) {
    try {
        if (!window.crypto || !window.crypto.subtle) {
            return "No disponible (requiere HTTPS)";
        }
        const buffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
        console.error("Error hashing:", err);
        return "Error al calcular hash";
    }
}

function formatDate(date) {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
}

function addInfoRow(container, label, value, valueClass = '') {
    const row = document.createElement('div');
    row.className = 'data-row';
    
    const lbl = document.createElement('span');
    lbl.className = 'data-label';
    lbl.textContent = label;
    
    const val = document.createElement('span');
    val.className = `data-value ${valueClass}`;
    val.textContent = value;
    
    row.appendChild(lbl);
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

async function handleFile(file) {
    try {
        currentFile = file;
        originalSize = file.size;
        
        if (cleanBlobUrl) URL.revokeObjectURL(cleanBlobUrl);
        cleanBlobUrl = null;
        
        dropZone.classList.add('compact');
        inspectionPanel.style.display = 'flex';
        resultSection.style.display = 'none';
        btnClean.style.display = 'inline-flex';
        btnClean.disabled = false;
        cleaningProgress.style.display = 'none';
        progressFill.style.width = '0%';
        
        geoSection.style.display = 'none';
        exifSection.style.display = 'none';
        extendedSection.style.display = 'none';
        rawSection.style.display = 'none';
        noMetadataMsg.style.display = 'none';
        
        filePreview.src = URL.createObjectURL(file);
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
        addInfoRow(identityGrid, 'Hash SHA-512', originalHash, 'hash-value');
        
        structureGrid.innerHTML = '';
        addInfoRow(structureGrid, 'Formato', ext);
        
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
                addInfoRow(structureGrid, 'Resolución', 'No disponible (no es imagen válida)');
                resolve();
            };
        });

        exifGrid.innerHTML = '';
        geoGrid.innerHTML = '';
        extendedGrid.innerHTML = '';
        rawGrid.innerHTML = '';
        extractedTags = {};
        
        const buffer = await file.arrayBuffer();
        if (typeof ExifReader === 'undefined') throw new Error("EXIF library not loaded");
        
        const tags = ExifReader.load(buffer, {expanded: true});
        
        rawGrid.textContent = JSON.stringify(tags, null, 2);
        rawSection.style.display = 'block';
        
        let hasExif = false;
        let hasGeo = false;
        let hasExtended = false;
        let hasSensitive = false;
        
        let score = 100;
        let totalTags = 0;
        
        if (tags.exif && Object.keys(tags.exif).length > 0) {
            hasExif = true;
            exifSection.style.display = 'block';
            for (const [key, tag] of Object.entries(tags.exif)) {
                if (key === 'MakerNote' || key === 'UserComment') continue;
                const val = tag.description || tag.value;
                extractedTags[`EXIF:${key}`] = val;
                totalTags++;
                
                const isSens = SENSITIVE_KEYS.some(k => key.includes(k));
                const isWarn = WARNING_KEYS.some(k => key.includes(k));
                if (isSens) {
                    hasSensitive = true;
                    score -= 15;
                } else if (isWarn) {
                    score -= 5;
                }
                
                let valClass = isSens ? 'sensitive' : (isWarn ? 'warning' : '');
                addInfoRow(exifGrid, key, val, valClass);
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
                score -= 15;
                addInfoRow(geoGrid, key, val, 'sensitive');
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
                    addInfoRow(extendedGrid, `[${type.toUpperCase()}] ${key}`, val);
                }
            }
        });
        
        score -= Math.floor(totalTags / 10);
        score = Math.max(0, score);
        
        privacyScoreBadge.style.display = 'flex';
        scoreValue.textContent = score;
        
        let scoreColor = '#059669';
        if (score < 40) {
            scoreColor = '#dc2626';
        } else if (score < 60) {
            scoreColor = '#d97706';
        } else if (score < 80) {
            scoreColor = '#0ea5e9';
        }
        scoreValue.style.color = scoreColor;
        
        privacyScoreBadge.className = 'privacy-score-badge';
        if (score >= 90) {
            privacyScoreBadge.classList.add('score-excellent');
            scoreIcon.textContent = 'verified_user';
        } else if (score >= 70) {
            privacyScoreBadge.classList.add('score-good');
            scoreIcon.textContent = 'gpp_good';
        } else if (score >= 40) {
            privacyScoreBadge.classList.add('score-warning');
            scoreIcon.textContent = 'gpp_maybe';
        } else {
            privacyScoreBadge.classList.add('score-poor');
            scoreIcon.textContent = 'gpp_bad';
        }
        
        if (!hasExif && !hasGeo && !hasExtended) {
            noMetadataMsg.style.display = 'flex';
            btnClean.style.display = 'none';
            setPrivacyStatus('success', 'check_circle', 'Archivo limpio (Sin metadata)');
        } else {
            if (hasSensitive) {
                setPrivacyStatus('danger', 'warning', 'Metadata sensible detectada');
            } else {
                setPrivacyStatus('warning', 'info', 'Metadata detectada');
            }
        }
        
    } catch (error) {
        console.error(error);
        noMetadataMsg.style.display = 'flex';
        noMetadataMsg.innerHTML = `<span class="material-symbols-rounded">error</span> Error al leer metadata`;
        setPrivacyStatus('warning', 'error', 'Análisis fallido o sin datos');
    }
}

btnClean.addEventListener('click', async () => {
    if (!currentFile) return;
    
    btnClean.style.display = 'none';
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
                        <span class="stat-label">Clean SHA-512</span>
                        <span class="stat-value hash-value" style="font-size: 0.75rem;">${cleanHash}</span>
                    </div>
                `;
                
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
            
        }, type, quality);
        
    } catch (error) {
        clearInterval(interval);
        console.error(error);
        alert("Error al limpiar la imagen. Asegúrate de que sea un formato de imagen válido.");
        btnClean.style.display = 'inline-flex';
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
