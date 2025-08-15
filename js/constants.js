// Application constants and configuration

export const CONFIG = {
    // Script URLs
    THREE_JS_URL: 'https://unpkg.com/three@0.150.1/build/three.min.js',
    SKINVIEW3D_URL: 'https://unpkg.com/skinview3d@2.2.0/bundles/skinview3d.bundle.js',
    
    // Default values
    DEFAULT_REPO_URL: 'https://github.com/PavelGsAlt/pavelgsalt.github.io',
    DEFAULT_BASE_NAME: 'base',
    
    // GitHub API
    GITHUB_API_BASE: 'https://api.github.com/repos',
    GITHUB_USER_AGENT: 'MinecraftSkinOverlayMerger/1.0',
    
    // 3D Viewer settings
    VIEWER_DEFAULTS: {
        zoom: 0.95,
        fov: 50,
        cameraPosition: [0, 1.4, 4.6],
        targetPosition: [0, 1, 0],
        finalZoom: 0.9
    },
    
    // Canvas settings
    CANVAS_DEFAULTS: {
        width: 1280,
        height: 720,
        compositeWidth: 64,
        compositeHeight: 64
    },
    
    // File validation
    ACCEPTED_FILE_TYPES: ['png', 'image'],
    MAX_SCRIPT_LOAD_TIMEOUT: 10000,
    
    // Preview settings
    PREVIEW_DEFAULTS: {
        filter: 'linear',
        fit: 'cover',
        scale: 1,
        minScale: 0.5,
        maxScale: 2,
        scaleStep: 0.1
    }
};

export const ELEMENT_IDS = {
    // File inputs
    baseFileInput: 'base-file-input',
    overlayFileInput: 'overlay-file-input',
    bgFileInput: 'bg-file-input',
    
    // Upload zones
    baseUploadZone: 'base-upload-zone',
    overlayUploadZone: 'overlay-upload-zone',
    
    // Canvas elements
    previewCanvas: 'preview-canvas',
    compositeCanvas: 'composite-canvas',
    
    // Status elements
    baseError: 'base-error',
    baseSuccess: 'base-success',
    overlayError: 'overlay-error',
    overlaySuccess: 'overlay-success',
    baseErrorText: 'base-error-text',
    baseSuccessText: 'base-success-text',
    overlayErrorText: 'overlay-error-text',
    overlaySuccessText: 'overlay-success-text',
    
    // Upload content
    baseUploadContent: 'base-upload-content',
    overlayUploadContent: 'overlay-upload-content',
    
    // Action buttons
    basePreviewBtn: 'base-preview-btn',
    overlayPreviewBtn: 'overlay-preview-btn',
    baseClearBtn: 'base-clear-btn',
    overlayClearBtn: 'overlay-clear-btn',
    baseActions: 'base-actions',
    
    // Control elements
    previewBtn: 'preview-btn',
    mergeBtn: 'merge-download-btn',
    previewBtnText: 'preview-btn-text',
    mergeBtnText: 'merge-btn-text',
    autoResizeCheckbox: 'auto-resize-checkbox',
    preserveFilenameCheckbox: 'preserve-filename-checkbox',
    
    // Preview elements
    previewStatus: 'preview-status',
    filterSelect: 'filter-select',
    bgFitSelect: 'bg-fit-select',
    zoomSlider: 'zoom-slider',
    zoomValue: 'zoom-value',
    bgUploadBtn: 'bg-upload-btn',
    removeBgBtn: 'remove-bg-btn',
    bgInfo: 'bg-info',
    bgName: 'bg-name',
    
    // GitHub modal elements
    githubModal: 'github-modal',
    repoUrlInput: 'repo-url-input',
    fetchBtn: 'fetch-btn',
    fetchIcon: 'fetch-icon',
    fetchText: 'fetch-text',
    searchInput: 'search-input',
    searchSection: 'search-section',
    overlaysList: 'overlays-list',
    closeModalBtn: 'close-modal-btn',
    retryBtn: 'retry-btn',
    clearSearchBtn: 'clear-search-btn',
    
    // Modal states
    errorState: 'error-state',
    loadingState: 'loading-state',
    overlaysContent: 'overlays-content',
    emptyState: 'empty-state',
    instructionsState: 'instructions-state',
    successMessage: 'success-message',
    successText: 'success-text',
    errorMessage: 'error-message',
    emptySubtitle: 'empty-subtitle',
    
    // Badges and indicators
    scriptsReady: 'scripts-ready',
    githubBadge: 'github-badge',
    overlayGithubIcon: 'overlay-github-icon',
    githubBrowseBtn: 'github-browse-btn'
};

export const CSS_CLASSES = {
    // State classes
    dragover: 'dragover',
    hasImage: 'has-image',
    fromGithub: 'from-github',
    hidden: 'hidden',
    pixelated: 'pixelated',
    
    // Display states
    flex: 'flex',
    none: 'none',
    block: 'block',
    inlineBlock: 'inline-block',
    
    // Animation classes
    spin: 'animate-spin'
};

export const MESSAGES = {
    // Success messages
    baseLoaded: (width, height) => `Base skin loaded • ${width}×${height}`,
    overlayLoaded: (width, height) => `Overlay loaded • ${width}×${height}`,
    overlayFromGithub: (width, height) => `Overlay loaded • ${width}×${height} • from GitHub`,
    githubSuccess: (folderCount, fileCount) => 
        `✅ Successfully loaded ${folderCount} overlay categor${folderCount === 1 ? 'y' : 'ies'} with ${fileCount} overlay file${fileCount === 1 ? '' : 's'}`,
    
    // Error messages
    invalidFile: 'Please select a PNG or image file.',
    sizeMismatch: (ow, oh, bw, bh) => 
        `Size mismatch: overlay is ${ow}×${oh}, base is ${bw}×${bh}. Enable "Auto-resize overlay" or provide matching sizes.`,
    
    // Processing messages
    processing: 'Processing...',
    previewMerged: 'Preview Merged',
    mergeDownload: 'Merge & Download',
    
    // Preview messages
    loadingPreview: 'Loading preview...',
    readyToPreview: 'Ready to preview',
    baseSkinPreview: 'Base skin preview',
    overlayPreview: 'Overlay preview (2nd layer only)',
    mergedSkinPreview: 'Merged skin preview (base + overlay)'
};

export const HTML_TEMPLATES = {
    uploadContent: `
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <p class="upload-text">Click to upload or drag & drop</p>
    `
};