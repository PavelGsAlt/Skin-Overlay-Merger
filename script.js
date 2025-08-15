// Minecraft Skin Overlay Merger - Complete JavaScript

// Global state
let appState = {
    baseImg: null,
    overlayImg: null,
    baseName: 'base',
    overlayFromGitHub: false,
    scriptsLoaded: false,
    isProcessing: false,
    preview: {
        bgDataUrl: null,
        bgName: '',
        filter: 'linear',
        fit: 'cover',
        scale: 1
    },
    options: {
        autoResize: false,
        preserveFilename: true
    },
    viewer: null,
    controls: null,
    bgTexture: null
};

// GitHub state
let githubState = {
    folders: [],
    loading: false,
    searchTerm: ''
};

// DOM elements
const elements = {
    // File inputs
    baseFileInput: null,
    overlayFileInput: null,
    bgFileInput: null,
    
    // Upload zones
    baseUploadZone: null,
    overlayUploadZone: null,
    
    // Canvas elements
    previewCanvas: null,
    compositeCanvas: null,
    
    // Status elements
    baseError: null,
    baseSuccess: null,
    overlayError: null,
    overlaySuccess: null,
    
    // Control elements
    previewBtn: null,
    mergeBtn: null,
    autoResizeCheckbox: null,
    preserveFilenameCheckbox: null,
    
    // Preview elements
    previewStatus: null,
    filterSelect: null,
    bgFitSelect: null,
    zoomSlider: null,
    zoomValue: null,
    
    // GitHub modal elements
    githubModal: null,
    repoUrlInput: null,
    fetchBtn: null,
    searchInput: null,
    overlaysList: null,
    
    // Badges and indicators
    scriptsReady: null,
    githubBadge: null,
    overlayGithubIcon: null,
    githubBrowseBtn: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadScripts();
});

// Initialize DOM element references
function initializeElements() {
    // File inputs
    elements.baseFileInput = document.getElementById('base-file-input');
    elements.overlayFileInput = document.getElementById('overlay-file-input');
    elements.bgFileInput = document.getElementById('bg-file-input');
    
    // Upload zones
    elements.baseUploadZone = document.getElementById('base-upload-zone');
    elements.overlayUploadZone = document.getElementById('overlay-upload-zone');
    
    // Canvas elements
    elements.previewCanvas = document.getElementById('preview-canvas');
    elements.compositeCanvas = document.getElementById('composite-canvas');
    
    // Status elements
    elements.baseError = document.getElementById('base-error');
    elements.baseSuccess = document.getElementById('base-success');
    elements.overlayError = document.getElementById('overlay-error');
    elements.overlaySuccess = document.getElementById('overlay-success');
    
    // Control elements
    elements.previewBtn = document.getElementById('preview-btn');
    elements.mergeBtn = document.getElementById('merge-download-btn');
    elements.autoResizeCheckbox = document.getElementById('auto-resize-checkbox');
    elements.preserveFilenameCheckbox = document.getElementById('preserve-filename-checkbox');
    
    // Preview elements
    elements.previewStatus = document.getElementById('preview-status');
    elements.filterSelect = document.getElementById('filter-select');
    elements.bgFitSelect = document.getElementById('bg-fit-select');
    elements.zoomSlider = document.getElementById('zoom-slider');
    elements.zoomValue = document.getElementById('zoom-value');
    
    // GitHub modal elements
    elements.githubModal = document.getElementById('github-modal');
    elements.repoUrlInput = document.getElementById('repo-url-input');
    elements.fetchBtn = document.getElementById('fetch-btn');
    elements.searchInput = document.getElementById('search-input');
    elements.overlaysList = document.getElementById('overlays-list');
    
    // Badges and indicators
    elements.scriptsReady = document.getElementById('scripts-ready');
    elements.githubBadge = document.getElementById('github-badge');
    elements.overlayGithubIcon = document.getElementById('overlay-github-icon');
    elements.githubBrowseBtn = document.getElementById('github-browse-btn');
}

// Setup all event listeners
function setupEventListeners() {
    // File input change events
    elements.baseFileInput.addEventListener('change', (e) => handleFileUpload('base', e.target.files));
    elements.overlayFileInput.addEventListener('change', (e) => handleFileUpload('overlay', e.target.files));
    elements.bgFileInput.addEventListener('change', (e) => handleBackgroundUpload(e.target.files));
    
    // Upload zone click events
    elements.baseUploadZone.addEventListener('click', () => elements.baseFileInput.click());
    elements.overlayUploadZone.addEventListener('click', () => elements.overlayFileInput.click());
    
    // Drag and drop events
    setupDragAndDrop(elements.baseUploadZone, 'base');
    setupDragAndDrop(elements.overlayUploadZone, 'overlay');
    
    // Preview buttons
    document.getElementById('base-preview-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        previewBaseSkin();
    });
    document.getElementById('overlay-preview-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        previewOverlay();
    });
    
    // Clear buttons
    document.getElementById('base-clear-btn')?.addEventListener('click', () => clearSkin('base'));
    document.getElementById('overlay-clear-btn')?.addEventListener('click', () => clearSkin('overlay'));
    
    // Main action buttons
    elements.previewBtn.addEventListener('click', handlePreview);
    elements.mergeBtn.addEventListener('click', handleMergeDownload);
    
    // Settings checkboxes
    elements.autoResizeCheckbox.addEventListener('change', (e) => {
        appState.options.autoResize = e.target.checked;
    });
    elements.preserveFilenameCheckbox.addEventListener('change', (e) => {
        appState.options.preserveFilename = e.target.checked;
    });
    
    // Preview controls
    elements.filterSelect.addEventListener('change', (e) => {
        appState.preview.filter = e.target.value;
        updateBackgroundTexture();
    });
    elements.bgFitSelect.addEventListener('change', (e) => {
        appState.preview.fit = e.target.value;
        updateBackgroundTexture();
    });
    elements.zoomSlider.addEventListener('input', (e) => {
        appState.preview.scale = parseFloat(e.target.value);
        elements.zoomValue.textContent = appState.preview.scale.toFixed(1);
        updateBackgroundTexture();
    });
    
    // Background controls
    document.getElementById('bg-upload-btn').addEventListener('click', () => elements.bgFileInput.click());
    document.getElementById('remove-bg-btn')?.addEventListener('click', removeBackground);
    
    // GitHub modal controls
    elements.githubBrowseBtn.addEventListener('click', () => showGitHubModal());
    document.getElementById('close-modal-btn').addEventListener('click', () => hideGitHubModal());
    elements.fetchBtn.addEventListener('click', () => fetchRepositoryContents());
    document.getElementById('retry-btn')?.addEventListener('click', () => fetchRepositoryContents());
    
    // GitHub modal input events
    elements.repoUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            fetchRepositoryContents();
        }
    });
    elements.searchInput.addEventListener('input', (e) => {
        githubState.searchTerm = e.target.value;
        filterOverlays();
    });
    document.getElementById('clear-search-btn')?.addEventListener('click', () => {
        elements.searchInput.value = '';
        githubState.searchTerm = '';
        filterOverlays();
    });
    
    // Modal overlay click to close
    elements.githubModal.addEventListener('click', (e) => {
        if (e.target === elements.githubModal) {
            hideGitHubModal();
        }
    });
    
    // Window resize event
    window.addEventListener('resize', () => {
        if (appState.viewer) {
            resizeViewerCanvasToDisplaySize(appState.viewer);
        }
        if (appState.bgTexture) {
            updateAndApplyBgOptions(appState.bgTexture);
        }
    });
}

// Setup drag and drop functionality
function setupDragAndDrop(element, type) {
    ['dragenter', 'dragover'].forEach(eventName => {
        element.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        element.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('dragover');
        });
    });

    element.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(type, files);
        }
    });
}

// Load Three.js and skinview3d scripts
async function loadScripts() {
    try {
        console.log('Loading Three.js and skinview3d...');
        
        // Wait for scripts to be available
        await waitForGlobal('THREE', 5000);
        console.log('Three.js loaded');
        
        await waitForGlobal('skinview3d', 5000);
        console.log('skinview3d loaded');
        
        appState.scriptsLoaded = true;
        elements.scriptsReady.style.display = 'inline-block';
        updateButtonStates();
        
        console.log('All scripts loaded successfully');
    } catch (error) {
        console.error('Failed to load scripts:', error);
        elements.previewStatus.textContent = 'Failed to load 3D viewer scripts';
    }
}

// Wait for a global variable to be available
function waitForGlobal(globalName, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (window[globalName]) {
            resolve(window[globalName]);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window[globalName]) {
                clearInterval(checkInterval);
                resolve(window[globalName]);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(`Timeout waiting for ${globalName}`));
            }
        }, 100);
    });
}

// Utility functions
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        console.log('Processing file:', file.name, file.type, file.size);
        
        const reader = new FileReader();
        reader.onerror = () => {
            console.error('FileReader error');
            reject(new Error('Failed to read file'));
        };
        
        reader.onload = () => {
            const dataUrl = reader.result;
            console.log('File read successfully, data URL length:', dataUrl.length);
            
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded successfully:', img.width, 'x', img.height);
                resolve(img);
            };
            img.onerror = () => {
                console.error('Image decode error');
                reject(new Error('Failed to decode image'));
            };
            img.src = dataUrl;
        };
        
        reader.readAsDataURL(file);
    });
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function setError(type, message) {
    console.error(`${type} error:`, message);
    const errorElement = type === 'base' ? elements.baseError : elements.overlayError;
    const errorText = type === 'base' ? document.getElementById('base-error-text') : document.getElementById('overlay-error-text');
    
    if (message) {
        errorText.textContent = message;
        errorElement.style.display = 'flex';
    } else {
        errorElement.style.display = 'none';
    }
}

function setSuccess(type, message) {
    console.log(`${type} success:`, message);
    const successElement = type === 'base' ? elements.baseSuccess : elements.overlaySuccess;
    const successText = type === 'base' ? document.getElementById('base-success-text') : document.getElementById('overlay-success-text');
    
    if (message) {
        successText.textContent = message;
        successElement.style.display = 'flex';
    } else {
        successElement.style.display = 'none';
    }
}

function clearError(type) {
    setError(type, '');
}

function clearSuccess(type) {
    setSuccess(type, '');
}

// Handle file upload
async function handleFileUpload(type, files) {
    console.log('handleFileUpload called:', type, files?.length);
    
    const file = files?.[0];
    if (!file) {
        console.log('No file selected');
        return;
    }

    console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
    });

    if (!file.type || (!file.type.includes('png') && !file.type.includes('image'))) {
        setError(type, 'Please select a PNG or image file.');
        return;
    }

    clearError(type);
    clearSuccess(type);
    setProcessing(true);
    
    try {
        const img = await fileToImage(file);
        
        console.log('Image processed successfully:', {
            type,
            width: img.width,
            height: img.height
        });
        
        if (type === 'base') {
            appState.baseImg = img;
            appState.baseName = file.name.replace(/\.png$/i, '');
            updateBaseUploadZone();
            setSuccess('base', `Base skin loaded • ${img.width}×${img.height}`);
            console.log('Base skin set');
        } else {
            appState.overlayImg = img;
            appState.overlayFromGitHub = false; // Reset GitHub flag when uploading local file
            updateOverlayUploadZone();
            setSuccess('overlay', `Overlay loaded • ${img.width}×${img.height}`);
            console.log('Overlay set');
        }
        
        updateButtonStates();
    } catch (err) {
        console.error('File upload error:', err);
        setError(type, err.message);
    } finally {
        setProcessing(false);
    }
}

// Update upload zone display
function updateBaseUploadZone() {
    const uploadContent = document.getElementById('base-upload-content');
    const previewOverlay = elements.baseUploadZone.querySelector('.preview-overlay');
    const actions = document.getElementById('base-actions');
    
    if (appState.baseImg) {
        elements.baseUploadZone.classList.add('has-image');
        uploadContent.innerHTML = `<img src="${appState.baseImg.src}" alt="Base skin" class="pixelated">`;
        previewOverlay.style.display = 'block';
        actions.style.display = 'flex';
    } else {
        elements.baseUploadZone.classList.remove('has-image');
        uploadContent.innerHTML = `
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <p class="upload-text">Click to upload or drag & drop</p>
        `;
        previewOverlay.style.display = 'none';
        actions.style.display = 'none';
    }
}

function updateOverlayUploadZone() {
    const uploadContent = document.getElementById('overlay-upload-content');
    const previewOverlay = elements.overlayUploadZone.querySelector('.preview-overlay');
    const clearBtn = document.getElementById('overlay-clear-btn');
    
    if (appState.overlayImg) {
        elements.overlayUploadZone.classList.add('has-image');
        uploadContent.innerHTML = `<img src="${appState.overlayImg.src}" alt="Overlay" class="pixelated">`;
        previewOverlay.style.display = 'block';
        clearBtn.style.display = 'flex';
    } else {
        elements.overlayUploadZone.classList.remove('has-image');
        uploadContent.innerHTML = `
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <p class="upload-text">Click to upload or drag & drop</p>
        `;
        previewOverlay.style.display = 'none';
        clearBtn.style.display = 'none';
    }
    
    // Update GitHub indicators
    updateGitHubIndicators();
}

function updateGitHubIndicators() {
    if (appState.overlayFromGitHub) {
        elements.overlayGithubIcon.classList.add('from-github');
        elements.githubBadge.style.display = 'inline-block';
        elements.githubBrowseBtn.classList.add('from-github');
        
        // Update success message to include GitHub indicator
        if (appState.overlayImg) {
            const successText = document.getElementById('overlay-success-text');
            const currentText = successText.textContent;
            if (!currentText.includes('from GitHub')) {
                successText.textContent = currentText + ' • from GitHub';
            }
        }
    } else {
        elements.overlayGithubIcon.classList.remove('from-github');
        elements.githubBadge.style.display = 'none';
        elements.githubBrowseBtn.classList.remove('from-github');
    }
}

// Set processing state
function setProcessing(processing) {
    appState.isProcessing = processing;
    updateButtonStates();
    
    const previewBtnText = document.getElementById('preview-btn-text');
    const mergeBtnText = document.getElementById('merge-btn-text');
    
    if (processing) {
        previewBtnText.textContent = 'Processing...';
        mergeBtnText.textContent = 'Processing...';
    } else {
        previewBtnText.textContent = 'Preview Merged';
        mergeBtnText.textContent = 'Merge & Download';
    }
}

// Update button states
function updateButtonStates() {
    const hasImages = appState.baseImg && appState.overlayImg;
    const canUse3D = appState.scriptsLoaded && !appState.isProcessing;
    
    elements.previewBtn.disabled = !hasImages || !canUse3D;
    elements.mergeBtn.disabled = !hasImages || appState.isProcessing;
    
    // Update preview controls
    elements.filterSelect.disabled = !canUse3D;
    elements.bgFitSelect.disabled = !canUse3D;
    elements.zoomSlider.disabled = !canUse3D;
    document.getElementById('bg-upload-btn').disabled = !canUse3D;
}

// Clear skin data
function clearSkin(type) {
    console.log('Clearing', type, 'skin');
    
    if (type === 'base') {
        appState.baseImg = null;
        elements.baseFileInput.value = '';
        clearError('base');
        clearSuccess('base');
        updateBaseUploadZone();
    } else {
        appState.overlayImg = null;
        appState.overlayFromGitHub = false;
        elements.overlayFileInput.value = '';
        clearError('overlay');
        clearSuccess('overlay');
        updateOverlayUploadZone();
    }
    
    updateButtonStates();
}

// Ensure image is ready
function ensureImageReady(img) {
    return new Promise(resolve => {
        if (!img) return resolve(false);
        if (img.complete && img.naturalWidth && img.naturalHeight) return resolve(true);
        img.addEventListener('load', () => resolve(true), { once: true });
        img.addEventListener('error', () => resolve(false), { once: true });
    });
}

// Composite images to canvas
function compositeToCanvas() {
    if (!appState.baseImg || !appState.overlayImg || !elements.compositeCanvas) return null;

    const canvas = elements.compositeCanvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return null;

    const bw = appState.baseImg.width;
    const bh = appState.baseImg.height;
    const ow = appState.overlayImg.width;
    const oh = appState.overlayImg.height;

    canvas.width = bw;
    canvas.height = bh;
    ctx.clearRect(0, 0, bw, bh);
    ctx.imageSmoothingEnabled = false;

    try {
        ctx.drawImage(appState.baseImg, 0, 0, bw, bh);
        console.log('Base image drawn to canvas');
    } catch (e) {
        console.error('Error drawing base image:', e);
        return null;
    }

    if (bw === ow && bh === oh) {
        try {
            ctx.drawImage(appState.overlayImg, 0, 0);
            console.log('Overlay image drawn to canvas (same size)');
        } catch (e) {
            console.error('Error drawing overlay image:', e);
            return null;
        }
    } else if (appState.options.autoResize) {
        try {
            ctx.drawImage(appState.overlayImg, 0, 0, ow, oh, 0, 0, bw, bh);
            console.log('Overlay image drawn to canvas (resized)');
        } catch (e) {
            console.error('Error drawing resized overlay image:', e);
            return null;
        }
    } else {
        setError('overlay', `Size mismatch: overlay is ${ow}×${oh}, base is ${bw}×${bh}. Enable "Auto-resize overlay" or provide matching sizes.`);
        return null;
    }

    return canvas;
}

// Get overlay-only data URL
function overlayOnlyDataUrl() {
    if (!appState.overlayImg) return null;
    
    const tmp = document.createElement('canvas');
    tmp.width = appState.overlayImg.width;
    tmp.height = appState.overlayImg.height;
    const ctx = tmp.getContext('2d');
    if (!ctx) return null;
    
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(appState.overlayImg, 0, 0);
    return tmp.toDataURL('image/png');
}

// 3D Viewer functions
function resizeViewerCanvasToDisplaySize(viewer) {
    if (!elements.previewCanvas) return;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = elements.previewCanvas;
    const cw = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const ch = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    
    canvas.width = cw;
    canvas.height = ch;
    
    if (viewer?.renderer) {
        try {
            viewer.renderer.setSize(cw, ch, false);
        } catch (e) {
            console.warn('Error resizing renderer:', e);
        }
    }
    
    if (viewer?.camera) {
        try {
            viewer.camera.aspect = cw / ch;
            viewer.camera.updateProjectionMatrix();
        } catch (e) {
            console.warn('Error updating camera:', e);
        }
    }
}

function ensureViewer() {
    if (appState.viewer) return appState.viewer;
    if (!window.skinview3d || !elements.previewCanvas || !appState.scriptsLoaded) {
        console.log('Cannot create viewer');
        return null;
    }

    try {
        const { SkinViewer, createOrbitControls } = window.skinview3d;
        const canvas = elements.previewCanvas;
        
        console.log('Creating SkinViewer...');
        const viewer = new SkinViewer({
            canvas,
            width: canvas.width,
            height: canvas.height,
            skin: null
        });
        
        viewer.zoom = 0.95;
        viewer.fov = 50;
        
        try {
            appState.controls = createOrbitControls(viewer);
            console.log('Orbit controls created');
        } catch (e) {
            console.warn('Failed to create orbit controls:', e);
            appState.controls = null;
        }
        
        appState.viewer = viewer;
        console.log('SkinViewer created successfully');
        return viewer;
    } catch (error) {
        console.error('Error creating viewer:', error);
        return null;
    }
}

function updateAndApplyBgOptions(tex) {
    if (!tex?.image || !elements.previewCanvas || !window.THREE) return;
    
    const filter = appState.preview.filter;
    const fit = appState.preview.fit;
    const scale = appState.preview.scale;
    
    tex.magFilter = filter === 'nearest' ? window.THREE.NearestFilter : window.THREE.LinearFilter;
    tex.minFilter = filter === 'nearest' ? window.THREE.NearestMipmapNearestFilter : window.THREE.LinearMipmapLinearFilter;
    tex.wrapS = tex.wrapT = window.THREE.ClampToEdgeWrapping;
    
    const canvas = elements.previewCanvas;
    const canvasW = canvas.clientWidth;
    const canvasH = canvas.clientHeight;
    const cA = canvasW / canvasH;
    const iW = tex.image.width;
    const iH = tex.image.height;
    const iA = iW / iH;
    
    let repeatX = 1, repeatY = 1;
    
    if (fit === 'stretch') {
        repeatX = scale;
        repeatY = scale;
        tex.repeat.set(repeatX, repeatY);
        tex.center.set(0.5, 0.5);
        tex.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
        return;
    }
    
    if (fit === 'cover') {
        if (iA > cA) {
            repeatY = 1 / scale;
            repeatX = iA / cA * repeatY;
        } else {
            repeatX = 1 / scale;
            repeatY = cA / iA * repeatX;
        }
    } else {
        if (iA > cA) {
            repeatX = 1 / scale;
            repeatY = cA / iA * repeatX;
        } else {
            repeatY = 1 / scale;
            repeatX = iA / cA * repeatY;
        }
    }
    
    repeatX = Math.max(0.0001, repeatX);
    repeatY = Math.max(0.0001, repeatY);
    tex.repeat.set(repeatX, repeatY);
    tex.center.set(0.5, 0.5);
    tex.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
}

function applyBackgroundToViewer(viewer) {
    if (!viewer?.scene || !window.THREE) return;
    
    if (!appState.preview.bgDataUrl) {
        viewer.scene.background = null;
        appState.bgTexture = null;
        return;
    }
    
    console.log('Loading background texture...');
    const loader = new window.THREE.TextureLoader();
    loader.load(
        appState.preview.bgDataUrl,
        (tex) => {
            try {
                console.log('Background texture loaded successfully');
                tex.encoding = window.THREE.sRGBEncoding;
                tex.needsUpdate = true;
                appState.bgTexture = tex;
                updateAndApplyBgOptions(tex);
                viewer.scene.background = tex;
            } catch (e) {
                console.error('Error applying background texture:', e);
            }
        },
        (progress) => {
            console.log('Background loading progress:', progress);
        },
        (err) => {
            console.error('Background texture load failed:', err);
        }
    );
}

function updateBackgroundTexture() {
    if (appState.bgTexture && appState.viewer) {
        updateAndApplyBgOptions(appState.bgTexture);
        appState.viewer.scene.background = appState.bgTexture;
    }
}

async function showSkinIn3D(dataUrl, descText) {
    if (!dataUrl || !appState.scriptsLoaded) {
        elements.previewStatus.textContent = '3D viewer not ready';
        return;
    }
    
    console.log('Showing skin in 3D:', descText);
    elements.previewStatus.textContent = 'Loading preview...';
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const viewer = ensureViewer();
    if (!viewer) {
        console.error('Failed to create viewer');
        elements.previewStatus.textContent = 'Failed to initialize 3D viewer';
        return;
    }
    
    resizeViewerCanvasToDisplaySize(viewer);
    applyBackgroundToViewer(viewer);
    
    try {
        console.log('Loading skin into viewer...');
        await viewer.loadSkin(dataUrl);
        console.log('Skin loaded successfully');
        
        // Position camera
        try {
            if (viewer.camera?.position?.set) {
                viewer.camera.position.set(0, 1.4, 4.6);
            }
            if (typeof viewer.zoom !== 'undefined') {
                viewer.zoom = 0.9;
            }
            
            if (appState.controls?.target && appState.controls?.update) {
                appState.controls.target.set(0, 1, 0);
                appState.controls.update();
            } else if (viewer.camera?.lookAt) {
                viewer.camera.lookAt(0, 1, 0);
            }
        } catch (e) {
            console.warn('Camera positioning failed:', e);
        }
        
        // Scroll into view
        try {
            elements.previewCanvas?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        } catch (e) {
            console.warn('Scroll into view failed:', e);
        }
        
        elements.previewStatus.textContent = descText;
    } catch (err) {
        console.error('Skin loading failed:', err);
        elements.previewStatus.textContent = 'Failed to load skin in 3D viewer';
    }
}

// Individual preview functions
async function previewBaseSkin() {
    if (!appState.baseImg) {
        setError('base', 'No base skin loaded');
        return;
    }
    console.log('Previewing base skin individually');
    await showSkinIn3D(appState.baseImg.src, 'Base skin preview');
}

async function previewOverlay() {
    if (!appState.overlayImg) {
        setError('overlay', 'No overlay loaded');
        return;
    }
    console.log('Previewing overlay individually');
    const dataUrl = overlayOnlyDataUrl();
    if (dataUrl) {
        await showSkinIn3D(dataUrl, 'Overlay preview (2nd layer only)');
    }
}

async function handlePreview() {
    if (!appState.baseImg) {
        setError('base', 'Please load a base skin PNG.');
        return;
    }
    if (!appState.overlayImg) {
        setError('overlay', 'Please load an overlay PNG.');
        return;
    }
    
    console.log('Generating merged preview');
    setProcessing(true);
    
    try {
        const ok1 = await ensureImageReady(appState.baseImg);
        const ok2 = await ensureImageReady(appState.overlayImg);
        
        if (!ok1 || !ok2) {
            setError('base', 'Images are not ready yet.');
            return;
        }
        
        const canvas = compositeToCanvas();
        if (!canvas) {
            return;
        }
        
        const mergedDataUrl = canvas.toDataURL('image/png');
        await showSkinIn3D(mergedDataUrl, 'Merged skin preview (base + overlay)');
    } finally {
        setProcessing(false);
    }
}

function handleMergeDownload() {
    clearError('base');
    clearError('overlay');
    
    if (!appState.baseImg) {
        setError('base', 'Please load a base skin PNG.');
        return;
    }
    if (!appState.overlayImg) {
        setError('overlay', 'Please load an overlay PNG.');
        return;
    }
    
    console.log('Merging and downloading skin');
    setProcessing(true);
    
    try {
        const canvas = compositeToCanvas();
        if (!canvas) {
            return;
        }
        
        const outName = (appState.options.preserveFilename ? appState.baseName : 'merged_skin') + '.png';
        
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Failed to create blob');
                return;
            }
            
            console.log('Downloading:', outName);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = outName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(a.href);
            a.remove();
        }, 'image/png');
    } finally {
        setProcessing(false);
    }
}

// Background handling
async function handleBackgroundUpload(files) {
    const file = files?.[0];
    if (!file) {
        console.log('No background file selected');
        return;
    }
    
    console.log('Background file selected:', file.name, file.type);
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    
    try {
        const dataUrl = await fileToDataUrl(file);
        console.log('Background data URL created, length:', dataUrl.length);
        
        appState.preview.bgDataUrl = dataUrl;
        appState.preview.bgName = file.name;
        
        // Update UI
        document.getElementById('bg-name').textContent = file.name;
        document.getElementById('bg-info').style.display = 'flex';
        
        if (appState.viewer) {
            console.log('Applying background to existing viewer');
            applyBackgroundToViewer(appState.viewer);
        }
    } catch (err) {
        console.error('Background upload error:', err);
        appState.preview.bgDataUrl = null;
        appState.preview.bgName = '';
        alert('Failed to load background image');
    }
}

function removeBackground() {
    console.log('Removing background');
    appState.preview.bgDataUrl = null;
    appState.preview.bgName = '';
    
    document.getElementById('bg-info').style.display = 'none';
    elements.bgFileInput.value = '';
    
    if (appState.viewer?.scene) {
        appState.viewer.scene.background = null;
    }
    appState.bgTexture = null;
}

// GitHub functionality
function showGitHubModal() {
    elements.githubModal.style.display = 'flex';
    
    // Auto-fetch default repository
    if (elements.repoUrlInput.value === 'https://github.com/PavelGsAlt/pavelgsalt.github.io') {
        console.log('Auto-fetching default repository');
        fetchRepositoryContents();
    }
}

function hideGitHubModal() {
    elements.githubModal.style.display = 'none';
    githubState.searchTerm = '';
    elements.searchInput.value = '';
}

function parseGitHubUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length >= 2) {
            const owner = pathParts[0];
            const repo = pathParts[1];
            return { owner, repo };
        }
    } catch (e) {
        console.error('Invalid URL:', e);
    }
    return null;
}

async function fetchRepositoryContents() {
    const parsed = parseGitHubUrl(elements.repoUrlInput.value);
    if (!parsed) {
        showError('Invalid GitHub repository URL. Please use format: https://github.com/owner/repo');
        return;
    }

    setGitHubLoading(true);
    console.log('Fetching repository contents for:', parsed);

    try {
        // First, check if Overlays folder exists
        const overlaysUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/Overlays`;
        console.log('Fetching from:', overlaysUrl);
        
        const overlaysResponse = await fetch(overlaysUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'MinecraftSkinOverlayMerger/1.0'
            },
            cache: 'no-cache'
        });
        
        console.log('Response status:', overlaysResponse.status);
        
        if (!overlaysResponse.ok) {
            if (overlaysResponse.status === 404) {
                throw new Error('Overlays folder not found in repository. Make sure the repository has an "Overlays" folder in the root.');
            } else if (overlaysResponse.status === 403) {
                const rateLimitReset = overlaysResponse.headers.get('x-ratelimit-reset');
                const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
                throw new Error(`GitHub API rate limit exceeded. ${resetTime ? `Try again after ${resetTime.toLocaleTimeString()}.` : 'Please try again later.'}`);
            } else {
                throw new Error(`GitHub API error: ${overlaysResponse.status} ${overlaysResponse.statusText}`);
            }
        }

        const overlaysData = await overlaysResponse.json();
        console.log('Overlays data received:', overlaysData);
        
        if (!Array.isArray(overlaysData)) {
            console.error('Unexpected response format:', overlaysData);
            throw new Error('Unexpected response format from GitHub API');
        }

        // Filter for directories only
        const overlayFolders = overlaysData.filter(item => item.type === 'dir');
        console.log('Found overlay folders:', overlayFolders.length);
        
        if (overlayFolders.length === 0) {
            throw new Error('No overlay folders found in /Overlays directory. Create subfolders in /Overlays with PNG files.');
        }

        // Fetch contents of each overlay folder
        const folderPromises = overlayFolders.map(async (folder) => {
            try {
                const folderUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/Overlays/${encodeURIComponent(folder.name)}`;
                console.log('Fetching folder:', folder.name, folderUrl);
                
                const folderResponse = await fetch(folderUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'MinecraftSkinOverlayMerger/1.0'
                    },
                    cache: 'no-cache'
                });
                
                if (!folderResponse.ok) {
                    console.warn(`Failed to fetch contents of folder: ${folder.name} (${folderResponse.status})`);
                    return null;
                }
                
                const folderData = await folderResponse.json();
                console.log(`Folder ${folder.name} contains ${folderData.length} items`);
                
                if (!Array.isArray(folderData)) {
                    console.warn(`Unexpected data format for folder: ${folder.name}`, folderData);
                    return null;
                }
                
                // Filter for PNG files only and ensure they have download URLs
                const pngFiles = folderData.filter(file => 
                    file.type === 'file' && 
                    file.name.toLowerCase().endsWith('.png') &&
                    file.download_url &&
                    file.size > 0 // Ensure file is not empty
                );
                
                console.log(`Found ${pngFiles.length} PNG files in ${folder.name}:`, pngFiles.map(f => f.name));
                
                return {
                    name: folder.name,
                    files: pngFiles
                };
            } catch (err) {
                console.error(`Error fetching folder ${folder.name}:`, err);
                return null;
            }
        });

        console.log('Fetching all folder contents...');
        const folderResults = await Promise.all(folderPromises);
        const validFolders = folderResults.filter(folder => 
            folder !== null && folder.files.length > 0
        );

        console.log('Valid folders with files:', validFolders.length);

        if (validFolders.length === 0) {
            throw new Error('No PNG files found in overlay folders. Make sure your overlay folders contain PNG files.');
        }

        githubState.folders = validFolders;
        renderOverlays();
        showSuccess(`Successfully loaded ${validFolders.length} overlay categor${validFolders.length === 1 ? 'y' : 'ies'} with ${validFolders.reduce((sum, f) => sum + f.files.length, 0)} overlay file${validFolders.reduce((sum, f) => sum + f.files.length, 0) === 1 ? '' : 's'}`);
        
        console.log('Successfully loaded', validFolders.length, 'folders with overlays');
        
    } catch (err) {
        console.error('Fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository contents';
        showError(errorMessage);
    } finally {
        setGitHubLoading(false);
    }
}

function setGitHubLoading(loading) {
    githubState.loading = loading;
    
    const loadingState = document.getElementById('loading-state');
    const fetchIcon = document.getElementById('fetch-icon');
    const fetchText = document.getElementById('fetch-text');
    
    elements.fetchBtn.disabled = loading;
    
    if (loading) {
        loadingState.style.display = 'flex';
        fetchIcon.innerHTML = '<path d="M21 12a9 9 0 11-6.219-8.56"/>';
        fetchIcon.style.animation = 'spin 1s linear infinite';
        fetchText.textContent = 'Loading...';
        hideAllStates();
        loadingState.style.display = 'flex';
    } else {
        loadingState.style.display = 'none';
        fetchIcon.innerHTML = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>';
        fetchIcon.style.animation = 'none';
        fetchText.textContent = 'Fetch';
    }
}

function hideAllStates() {
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('overlays-content').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('instructions-state').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('search-section').style.display = 'none';
}

function showError(message) {
    hideAllStates();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-state').style.display = 'flex';
}

function showSuccess(message) {
    document.getElementById('success-text').textContent = message;
    document.getElementById('success-message').style.display = 'block';
}

function renderOverlays() {
    hideAllStates();
    
    if (githubState.folders.length === 0) {
        document.getElementById('instructions-state').style.display = 'flex';
        return;
    }
    
    document.getElementById('search-section').style.display = 'block';
    document.getElementById('overlays-content').style.display = 'block';
    
    const filteredFolders = filterFolders();
    
    if (filteredFolders.length === 0) {
        hideAllStates();
        document.getElementById('empty-subtitle').textContent = `No overlays match your search "${githubState.searchTerm}"`;
        document.getElementById('empty-state').style.display = 'flex';
        return;
    }
    
    elements.overlaysList.innerHTML = filteredFolders.map(folder => `
        <div class="overlay-folder">
            <div class="folder-header">
                <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                </svg>
                <h3 class="folder-name">${folder.name}</h3>
                <span class="folder-badge">${folder.files.length} file${folder.files.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="files-grid">
                ${folder.files.map(file => `
                    <div class="file-item" onclick="selectOverlay('${file.download_url}')">
                        <div class="file-info">
                            <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            <div class="file-details">
                                <p class="file-name">${file.name}</p>
                                <p class="file-size">${formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn-select" onclick="event.stopPropagation(); selectOverlay('${file.download_url}')">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7,10 12,15 17,10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Select
                            </button>
                            <button class="btn-preview" onclick="event.stopPropagation(); previewOverlayFile('${file.download_url}')" title="Preview in new tab">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function filterFolders() {
    if (!githubState.searchTerm) return githubState.folders;
    
    return githubState.folders.map(folder => ({
        ...folder,
        files: folder.files.filter(file => 
            file.name.toLowerCase().includes(githubState.searchTerm.toLowerCase()) ||
            folder.name.toLowerCase().includes(githubState.searchTerm.toLowerCase())
        )
    })).filter(folder => folder.files.length > 0);
}

function filterOverlays() {
    renderOverlays();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// GitHub overlay selection (called from rendered HTML)
async function selectOverlay(overlayUrl) {
    console.log('GitHub overlay selected:', overlayUrl);
    setProcessing(true);
    clearError('overlay');
    
    try {
        const response = await fetch(overlayUrl, {
            mode: 'cors',
            headers: {
                'Accept': 'image/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch overlay: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('Overlay blob received:', blob.size, blob.type);
        
        const file = new File([blob], 'github-overlay.png', { type: 'image/png' });
        const img = await fileToImage(file);
        
        appState.overlayImg = img;
        appState.overlayFromGitHub = true; // Set GitHub flag
        
        updateOverlayUploadZone();
        setSuccess('overlay', `Overlay loaded • ${img.width}×${img.height}`);
        updateButtonStates();
        
        hideGitHubModal();
        console.log('GitHub overlay loaded successfully');
    } catch (err) {
        console.error('GitHub overlay error:', err);
        setError('overlay', `Failed to load overlay from GitHub: ${err.message}`);
    } finally {
        setProcessing(false);
    }
}

// Preview overlay in new tab (called from rendered HTML)
function previewOverlayFile(overlayUrl) {
    if (overlayUrl) {
        window.open(overlayUrl, '_blank');
    }
}

// Expose functions to global scope for HTML onclick handlers
window.selectOverlay = selectOverlay;
window.preview
