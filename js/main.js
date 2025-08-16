// Main application logic and DOM management

import { CONFIG, ELEMENT_IDS, MESSAGES, HTML_TEMPLATES } from './constants.js';
import { 
    fileToImage, fileToDataUrl, ensureImageReady, validateFileType,
    getElementById, setElementDisplay, setElementText, addElementClass, removeElementClass,
    setError, setSuccess, clearError, clearSuccess, setupDragAndDrop, waitForGlobal,
    downloadBlob, nextFrame
} from './utils.js';
import { SkinViewer3D } from './viewer3d.js';
import { GitHubManager } from './github.js';

// Global application state
const appState = {
    baseImg: null,
    overlayImg: null,
    baseName: CONFIG.DEFAULT_BASE_NAME,
    overlayFromGitHub: false,
    scriptsLoaded: false,
    isProcessing: false,
    preview: {
        bgDataUrl: null,
        bgName: '',
        filter: CONFIG.PREVIEW_DEFAULTS.filter,
        fit: CONFIG.PREVIEW_DEFAULTS.fit,
        scale: CONFIG.PREVIEW_DEFAULTS.scale
    },
    options: {
        autoResize: false,
        preserveFilename: true
    }
};

// Managers
const viewer3D = new SkinViewer3D();
const githubManager = new GitHubManager();
let elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadScripts();
});

// Initialize DOM element references
function initializeElements() {
    Object.keys(ELEMENT_IDS).forEach(key => {
        elements[key] = getElementById(ELEMENT_IDS[key]);
    });
    
    // Initialize managers
    viewer3D.initialize(elements.previewCanvas, elements.compositeCanvas);
    githubManager.initialize(elements);
}

// Setup all event listeners
function setupEventListeners() {
    // File input change events
    elements.baseFileInput?.addEventListener('change', (e) => handleFileUpload('base', e.target.files));
    elements.overlayFileInput?.addEventListener('change', (e) => handleFileUpload('overlay', e.target.files));
    elements.bgFileInput?.addEventListener('change', (e) => handleBackgroundUpload(e.target.files));
    
    // Upload zone click events
    elements.baseUploadZone?.addEventListener('click', () => elements.baseFileInput?.click());
    elements.overlayUploadZone?.addEventListener('click', () => elements.overlayFileInput?.click());
    
    // Drag and drop events
    if (elements.baseUploadZone) setupDragAndDrop(elements.baseUploadZone, 'base', handleFileUpload);
    if (elements.overlayUploadZone) setupDragAndDrop(elements.overlayUploadZone, 'overlay', handleFileUpload);
    
    // Preview buttons
    elements.basePreviewBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        previewBaseSkin();
    });
    elements.overlayPreviewBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        previewOverlay();
    });
    
    // Clear buttons
    elements.baseClearBtn?.addEventListener('click', () => clearSkin('base'));
    elements.overlayClearBtn?.addEventListener('click', () => clearSkin('overlay'));
    
    // Main action buttons
    elements.previewBtn?.addEventListener('click', handlePreview);
    elements.mergeBtn?.addEventListener('click', handleMergeDownload);
    
    // Settings checkboxes
    elements.autoResizeCheckbox?.addEventListener('change', (e) => {
        appState.options.autoResize = e.target.checked;
    });
    elements.preserveFilenameCheckbox?.addEventListener('change', (e) => {
        appState.options.preserveFilename = e.target.checked;
    });
    
    // Preview controls
    elements.filterSelect?.addEventListener('change', (e) => {
        appState.preview.filter = e.target.value;
        viewer3D.updateBackgroundTexture(appState.preview);
    });
    elements.bgFitSelect?.addEventListener('change', (e) => {
        appState.preview.fit = e.target.value;
        viewer3D.updateBackgroundTexture(appState.preview);
    });
    elements.zoomSlider?.addEventListener('input', (e) => {
        appState.preview.scale = parseFloat(e.target.value);
        setElementText(elements.zoomValue, appState.preview.scale.toFixed(1));
        viewer3D.updateBackgroundTexture(appState.preview);
    });
    
    // Background controls
    elements.bgUploadBtn?.addEventListener('click', () => elements.bgFileInput?.click());
    elements.removeBgBtn?.addEventListener('click', removeBackground);
    
    // GitHub modal controls
    elements.githubBrowseBtn?.addEventListener('click', showGitHubModal);
    elements.closeModalBtn?.addEventListener('click', hideGitHubModal);
    elements.fetchBtn?.addEventListener('click', () => githubManager.fetchRepositoryContents(elements.repoUrlInput?.value || CONFIG.DEFAULT_REPO_URL));
    elements.retryBtn?.addEventListener('click', () => githubManager.fetchRepositoryContents(elements.repoUrlInput?.value || CONFIG.DEFAULT_REPO_URL));
    
    // GitHub modal input events
    elements.repoUrlInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            githubManager.fetchRepositoryContents(elements.repoUrlInput?.value || CONFIG.DEFAULT_REPO_URL);
        }
    });
    elements.searchInput?.addEventListener('input', (e) => {
        githubManager.setSearchTerm(e.target.value);
    });
    elements.clearSearchBtn?.addEventListener('click', () => {
        githubManager.clearSearch();
    });
    
    // Modal overlay click to close
    elements.githubModal?.addEventListener('click', (e) => {
        if (e.target === elements.githubModal) {
            hideGitHubModal();
        }
    });
    
    // Window resize event
    window.addEventListener('resize', () => viewer3D.onResize());
}

// Load Three.js and skinview3d scripts
async function loadScripts() {
    try {
        console.log('Loading Three.js and skinview3d...');
        
        await waitForGlobal('THREE');
        console.log('Three.js loaded');
        
        await waitForGlobal('skinview3d');
        console.log('skinview3d loaded');
        
        appState.scriptsLoaded = true;
        setElementDisplay(elements.scriptsReady, 'inline-block');
        updateButtonStates();
        
        console.log('All scripts loaded successfully');
    } catch (error) {
        console.error('Failed to load scripts:', error);
        setElementText(elements.previewStatus, 'Failed to load 3D viewer scripts');
    }
}

// Handle file upload
async function handleFileUpload(type, files) {
    console.log('handleFileUpload called:', type, files?.length);
    
    const file = files?.[0];
    if (!file) {
        console.log('No file selected');
        return;
    }

    console.log('File details:', { name: file.name, type: file.type, size: file.size });

    if (!validateFileType(file)) {
        setError(type, MESSAGES.invalidFile, elements);
        return;
    }

    clearError(type, elements);
    clearSuccess(type, elements);
    setProcessing(true);
    
    try {
        const img = await fileToImage(file);
        
        console.log('Image processed successfully:', { type, width: img.width, height: img.height });
        
        if (type === 'base') {
            appState.baseImg = img;
            appState.baseName = file.name.replace(/\.png$/i, '');
            updateBaseUploadZone();
            setSuccess('base', MESSAGES.baseLoaded(img.width, img.height), elements);
            console.log('Base skin set');
        } else {
            appState.overlayImg = img;
            appState.overlayFromGitHub = false; // Reset GitHub flag when uploading local file
            updateOverlayUploadZone();
            setSuccess('overlay', MESSAGES.overlayLoaded(img.width, img.height), elements);
            console.log('Overlay set');
        }
        
        updateButtonStates();
    } catch (err) {
        console.error('File upload error:', err);
        setError(type, err.message, elements);
    } finally {
        setProcessing(false);
    }
}

// GitHub overlay selection (exposed to global scope)
window.selectOverlay = async function(overlayUrl) {
    console.log('GitHub overlay selected:', overlayUrl);
    setProcessing(true);
    clearError('overlay', elements);
    
    try {
        const response = await fetch(overlayUrl, {
            mode: 'cors',
            headers: { 'Accept': 'image/*' }
        });
        
        if (!response.ok) {
            throw new Error(MESSAGES.failedToFetchOverlay(response.status, response.statusText));
        }
        
        const blob = await response.blob();
        console.log('Overlay blob received:', blob.size, blob.type);
        
        const file = new File([blob], 'github-overlay.png', { type: 'image/png' });
        const img = await fileToImage(file);
        
        appState.overlayImg = img;
        appState.overlayFromGitHub = true; // Set GitHub flag
        
        updateOverlayUploadZone();
        setSuccess('overlay', MESSAGES.overlayFromGithub(img.width, img.height), elements);
        updateButtonStates();
        
        hideGitHubModal();
        console.log('GitHub overlay loaded successfully');
    } catch (err) {
        console.error('GitHub overlay error:', err);
        setError('overlay', MESSAGES.githubOverlayError(err.message), elements);
    } finally {
        setProcessing(false);
    }
};

// Preview overlay in new tab (exposed to global scope)
window.previewOverlayFile = function(overlayUrl) {
    if (overlayUrl) {
        window.open(overlayUrl, '_blank');
    }
};

// Update upload zone displays
function updateBaseUploadZone() {
    const uploadContent = elements.baseUploadContent;
    const previewOverlay = elements.baseUploadZone?.querySelector('.preview-overlay');
    const actions = elements.baseActions;
    
    if (appState.baseImg) {
        addElementClass(elements.baseUploadZone, 'has-image');
        if (uploadContent) {
            uploadContent.innerHTML = `<img src="${appState.baseImg.src}" alt="Base skin" class="pixelated">`;
        }
        setElementDisplay(previewOverlay, 'block');
        setElementDisplay(actions, 'flex');
    } else {
        removeElementClass(elements.baseUploadZone, 'has-image');
        if (uploadContent) {
            uploadContent.innerHTML = HTML_TEMPLATES.uploadContent;
        }
        setElementDisplay(previewOverlay, 'none');
        setElementDisplay(actions, 'none');
    }
}

function updateOverlayUploadZone() {
    const uploadContent = elements.overlayUploadContent;
    const previewOverlay = elements.overlayUploadZone?.querySelector('.preview-overlay');
    const clearBtn = elements.overlayClearBtn;
    
    if (appState.overlayImg) {
        addElementClass(elements.overlayUploadZone, 'has-image');
        if (uploadContent) {
            uploadContent.innerHTML = `<img src="${appState.overlayImg.src}" alt="Overlay" class="pixelated">`;
        }
        setElementDisplay(previewOverlay, 'block');
        setElementDisplay(clearBtn, 'flex');
    } else {
        removeElementClass(elements.overlayUploadZone, 'has-image');
        if (uploadContent) {
            uploadContent.innerHTML = HTML_TEMPLATES.uploadContent;
        }
        setElementDisplay(previewOverlay, 'none');
        setElementDisplay(clearBtn, 'none');
    }
    
    updateGitHubIndicators();
}

function updateGitHubIndicators() {
    if (appState.overlayFromGitHub) {
        addElementClass(elements.overlayGithubIcon, 'from-github');
        setElementDisplay(elements.githubBadge, 'inline-block');
        addElementClass(elements.githubBrowseBtn, 'from-github');
    } else {
        removeElementClass(elements.overlayGithubIcon, 'from-github');
        setElementDisplay(elements.githubBadge, 'none');
        removeElementClass(elements.githubBrowseBtn, 'from-github');
    }
}

// Set processing state
function setProcessing(processing) {
    appState.isProcessing = processing;
    updateButtonStates();
    
    if (processing) {
        setElementText(elements.previewBtnText, MESSAGES.processing);
        setElementText(elements.mergeBtnText, MESSAGES.processing);
    } else {
        setElementText(elements.previewBtnText, MESSAGES.previewMerged);
        setElementText(elements.mergeBtnText, MESSAGES.mergeDownload);
    }
}

// Update button states
function updateButtonStates() {
    const hasImages = appState.baseImg && appState.overlayImg;
    const canUse3D = appState.scriptsLoaded && !appState.isProcessing;
    
    if (elements.previewBtn) elements.previewBtn.disabled = !hasImages || !canUse3D;
    if (elements.mergeBtn) elements.mergeBtn.disabled = !hasImages || appState.isProcessing;
    
    // Update preview controls
    if (elements.filterSelect) elements.filterSelect.disabled = !canUse3D;
    if (elements.bgFitSelect) elements.bgFitSelect.disabled = !canUse3D;
    if (elements.zoomSlider) elements.zoomSlider.disabled = !canUse3D;
    if (elements.bgUploadBtn) elements.bgUploadBtn.disabled = !canUse3D;
}

// Clear skin data
function clearSkin(type) {
    console.log('Clearing', type, 'skin');
    
    if (type === 'base') {
        appState.baseImg = null;
        if (elements.baseFileInput) elements.baseFileInput.value = '';
        clearError('base', elements);
        clearSuccess('base', elements);
        updateBaseUploadZone();
    } else {
        appState.overlayImg = null;
        appState.overlayFromGitHub = false;
        if (elements.overlayFileInput) elements.overlayFileInput.value = '';
        clearError('overlay', elements);
        clearSuccess('overlay', elements);
        updateOverlayUploadZone();
    }
    
    updateButtonStates();
}

// Individual preview functions
async function previewBaseSkin() {
    if (!appState.baseImg) {
        setError('base', 'No base skin loaded', elements);
        return;
    }
    console.log('Previewing base skin individually');
    await viewer3D.showSkinIn3D(
        appState.baseImg.src, 
        MESSAGES.baseSkinPreview,
        appState.scriptsLoaded,
        appState.preview,
        (status) => setElementText(elements.previewStatus, status)
    );
}

async function previewOverlay() {
    if (!appState.overlayImg) {
        setError('overlay', 'No overlay loaded', elements);
        return;
    }
    console.log('Previewing overlay individually');
    const dataUrl = viewer3D.overlayOnlyDataUrl(appState.overlayImg);
    if (dataUrl) {
        await viewer3D.showSkinIn3D(
            dataUrl,
            MESSAGES.overlayPreview,
            appState.scriptsLoaded,
            appState.preview,
            (status) => setElementText(elements.previewStatus, status)
        );
    }
}

async function handlePreview() {
    if (!appState.baseImg) {
        setError('base', MESSAGES.noBaseImage, elements);
        return;
    }
    if (!appState.overlayImg) {
        setError('overlay', MESSAGES.noOverlayImage, elements);
        return;
    }
    
    console.log('Generating merged preview');
    setProcessing(true);
    
    try {
        const ok1 = await ensureImageReady(appState.baseImg);
        const ok2 = await ensureImageReady(appState.overlayImg);
        
        if (!ok1 || !ok2) {
            setError('base', MESSAGES.imagesNotReady, elements);
            return;
        }
        
        const canvas = viewer3D.compositeToCanvas(appState.baseImg, appState.overlayImg, appState.options);
        if (!canvas) {
            return;
        }
        
        const mergedDataUrl = canvas.toDataURL('image/png');
        await viewer3D.showSkinIn3D(
            mergedDataUrl,
            MESSAGES.mergedSkinPreview,
            appState.scriptsLoaded,
            appState.preview,
            (status) => setElementText(elements.previewStatus, status)
        );
    } catch (err) {
        setError('overlay', err.message, elements);
    } finally {
        setProcessing(false);
    }
}

function handleMergeDownload() {
    // Example implementation
    if (!appState.baseImg || !appState.overlayImg) {
        alert('Please upload both a base skin and an overlay.');
        return;
    }
    const canvas = document.getElementById('composite-canvas');
    // ...merge logic here...
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged_skin.png';
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
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
        alert(MESSAGES.uploadImageFile);
        return;
    }
    
    try {
        const dataUrl = await fileToDataUrl(file);
        console.log('Background data URL created, length:', dataUrl.length);
        
        appState.preview.bgDataUrl = dataUrl;
        appState.preview.bgName = file.name;
        
        // Update UI
        setElementText(elements.bgName, file.name);
        setElementDisplay(elements.bgInfo, 'flex');
        
        if (viewer3D.viewer) {
            console.log('Applying background to existing viewer');
            viewer3D.applyBackgroundToViewer(viewer3D.viewer, appState.preview);
        }
    } catch (err) {
        console.error('Background upload error:', err);
        appState.preview.bgDataUrl = null;
        appState.preview.bgName = '';
        alert(MESSAGES.failedToLoadBackground);
    }
}

function removeBackground() {
    console.log('Removing background');
    appState.preview.bgDataUrl = null;
    appState.preview.bgName = '';
    
    setElementDisplay(elements.bgInfo, 'none');
    if (elements.bgFileInput) elements.bgFileInput.value = '';
    
    viewer3D.removeBackground();
}

// GitHub modal functions
function showGitHubModal() {
    setElementDisplay(elements.githubModal, 'flex');
    
    if (repoUrl === undefined || repoUrl === '') {
    console.error('Invalid repository URL');
    return;
  }

    // Auto-fetch default repository
    if (elements.repoUrlInput?.value === CONFIG.DEFAULT_REPO_URL) {
        console.log('Auto-fetching default repository');
        githubManager.fetchRepositoryContents(CONFIG.DEFAULT_REPO_URL);
    }
}

function hideGitHubModal() {
    setElementDisplay(elements.githubModal, 'none');
    githubManager.setSearchTerm('');
}

function handleSelectOverlay(file) {
  if (!file) {
    console.error('No file selected');
    return;
  }
  propOnSelectOverlay(file.download_url);
}

function showGitHubModal() {
  elements.githubModal.style.display = 'flex';
  // Auto-fetch default repository
  if (elements.repoUrlInput.value === 'https://github.com/PavelGsAlt/pavelgsalt.github.io') {
    console.log('Auto-fetching default repository');
    fetchRepositoryContents();
  }
  // Pass the onSelectOverlay prop to the GitHubOverlayBrowserComp component
  const onSelectOverlay = (overlayUrl) => {
    console.log('Overlay selected:', overlayUrl);
    // Add logic here to handle the selected overlay
  };
  renderGitHubOverlayBrowser(onSelectOverlay);
}

function renderGitHubOverlayBrowser(onSelectOverlay) {
  const githubOverlayBrowser = (
    <GitHubOverlayBrowserComp
      isOpen={true}
      onClose={() => {}}
      onSelectOverlay={onSelectOverlay}
    />
  );
  // Render the githubOverlayBrowser component
  ReactDOM.render(githubOverlayBrowser, elements.githubOverlayBrowser);
}