// Overlay ZIP Service
// This service handles fetching, extracting, and managing overlay ZIP files

class OverlayService {
  constructor(config) {
    this.config = config || window.OVERLAY_CONFIG;
    this.cache = new Map();
    this.isLoading = false;
    this.overlays = [];
  }

  /**
   * Fetch and extract overlays from ZIP file
   * @returns {Promise<Array>} Array of overlay objects
   */
  async fetchOverlays() {
    if (this.isLoading) {
      throw new Error('Overlay fetching already in progress');
    }

    // Check cache first
    if (this.config.cache.enabled && this.overlays.length > 0) {
      console.log('OverlayService: Using cached overlays');
      return this.overlays;
    }

    this.isLoading = true;

    try {
      console.log('OverlayService: Fetching ZIP file from:', this.config.zipFile.url);
      
      // Fetch ZIP file
      const response = await this.fetchWithRetry(this.config.zipFile.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ZIP file: ${response.status} ${response.statusText}`);
      }

      // Check file size
      const contentLength = response.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength) > this.config.zipFile.maxSize) {
        throw new Error(`ZIP file too large: ${contentLength} bytes (max: ${this.config.zipFile.maxSize})`);
      }

      // Get ZIP file as array buffer
      const zipBuffer = await response.arrayBuffer();
      console.log('OverlayService: ZIP file downloaded, size:', zipBuffer.byteLength, 'bytes');

      // Extract ZIP file
      const overlays = await this.extractZipFile(zipBuffer);
      
      // Cache results
      if (this.config.cache.enabled) {
        this.overlays = overlays;
      }

      console.log('OverlayService: Extracted', overlays.length, 'overlays');
      return overlays;

    } catch (error) {
      console.error('OverlayService: Error fetching overlays:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Extract overlays from ZIP file buffer
   * @param {ArrayBuffer} zipBuffer - ZIP file buffer
   * @returns {Promise<Array>} Array of overlay objects
   */
  async extractZipFile(zipBuffer) {
    if (!window.JSZip) {
      throw new Error('JSZip library not loaded');
    }

    const zip = new JSZip();
    await zip.loadAsync(zipBuffer);

    const overlays = [];
    const overlayFolders = new Map();

    // First pass: identify overlay folders and files
    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir || this.shouldIgnoreFile(filePath)) {
        continue;
      }

      const pathParts = filePath.split('/');
      if (pathParts.length < 2) {
        continue; // Skip files in root
      }

      const overlayName = pathParts[pathParts.length - 2]; // Parent folder name
      const fileName = pathParts[pathParts.length - 1];

      // Check if it's a valid image file
      if (!this.isValidImageFile(fileName)) {
        continue;
      }

      if (!overlayFolders.has(overlayName)) {
        overlayFolders.set(overlayName, new Map());
      }

      overlayFolders.get(overlayName).set(fileName, zipEntry);
    }

    // Second pass: process each overlay folder
    for (const [overlayName, files] of overlayFolders) {
      try {
        const overlayData = await this.processOverlayFolder(overlayName, files);
        if (overlayData) {
          overlays.push(overlayData);
        }
      } catch (error) {
        console.warn(`OverlayService: Failed to process overlay ${overlayName}:`, error);
      }
    }

    return overlays;
  }

  /**
   * Process a single overlay folder
   * @param {string} overlayName - Name of the overlay
   * @param {Map} files - Map of filename to ZipEntry
   * @returns {Promise<Object|null>} Overlay object or null if invalid
   */
  async processOverlayFolder(overlayName, files) {
    const overlay = {
      name: overlayName,
      folder: 'Overlays',
      files: new Map(),
      urls: new Map(),
      totalSize: 0
    };

    // Process each file in the overlay folder
    for (const [fileName, zipEntry] of files) {
      try {
        // Check file size
        if (zipEntry._data && zipEntry._data.uncompressedSize > this.config.extraction.maxFileSize) {
          console.warn(`File ${fileName} in ${overlayName} is too large, skipping`);
          continue;
        }

        // Extract file as blob
        const fileBlob = await zipEntry.async('blob');
        
        // Create object URL for the blob
        const objectUrl = URL.createObjectURL(fileBlob);
        
        overlay.files.set(fileName, fileBlob);
        overlay.urls.set(fileName, objectUrl);
        overlay.totalSize += fileBlob.size;

      } catch (error) {
        console.warn(`Failed to extract ${fileName} from ${overlayName}:`, error);
      }
    }

    // Validate overlay has required files or at least some valid files
    if (overlay.files.size === 0) {
      return null;
    }

    // Check for preferred skin types
    const hasSlim = overlay.files.has('slim.png');
    const hasNormal = overlay.files.has('normal.png');
    
    // Set default URLs for skin types
    if (hasSlim) {
      overlay.defaultUrl = overlay.urls.get('slim.png');
      overlay.skinType = 'slim';
    } else if (hasNormal) {
      overlay.defaultUrl = overlay.urls.get('normal.png');
      overlay.skinType = 'normal';
    } else {
      // Use first available image
      const firstFile = overlay.files.keys().next().value;
      overlay.defaultUrl = overlay.urls.get(firstFile);
      overlay.skinType = 'unknown';
    }

    overlay.hasSlim = hasSlim;
    overlay.hasNormal = hasNormal;
    overlay.fileCount = overlay.files.size;

    return overlay;
  }

  /**
   * Get overlay URL by name and skin type
   * @param {string} overlayName - Name of the overlay
   * @param {string} skinType - 'slim' or 'normal'
   * @returns {string|null} Object URL or null if not found
   */
  getOverlayUrl(overlayName, skinType = 'slim') {
    const overlay = this.overlays.find(o => o.name === overlayName);
    if (!overlay) {
      return null;
    }

    const preferredFile = `${skinType}.png`;
    if (overlay.urls.has(preferredFile)) {
      return overlay.urls.get(preferredFile);
    }

    // Fallback to other skin type or first available
    if (this.config.structure.fallbackToFirst) {
      return overlay.defaultUrl;
    }

    return null;
  }

  /**
   * Clean up object URLs to prevent memory leaks
   */
  cleanup() {
    for (const overlay of this.overlays) {
      for (const url of overlay.urls.values()) {
        URL.revokeObjectURL(url);
      }
    }
    this.overlays = [];
    this.cache.clear();
  }

  /**
   * Fetch with retry logic
   * @param {string} url - URL to fetch
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithRetry(url) {
    let lastError;
    
    for (let i = 0; i < this.config.network.retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.network.timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          cache: 'no-cache' // Always get fresh ZIP file
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        lastError = error;
        console.warn(`OverlayService: Fetch attempt ${i + 1} failed:`, error.message);
        
        if (i < this.config.network.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.network.retryDelay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if file should be ignored
   * @param {string} filePath - File path in ZIP
   * @returns {boolean} True if should be ignored
   */
  shouldIgnoreFile(filePath) {
    const fileName = filePath.split('/').pop();
    return this.config.extraction.ignoreFolders.some(ignore => 
      fileName.includes(ignore) || filePath.includes(ignore)
    );
  }

  /**
   * Check if file is a valid image
   * @param {string} fileName - File name
   * @returns {boolean} True if valid image
   */
  isValidImageFile(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return this.config.extraction.allowedFormats.includes(extension);
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OverlayService;
} else if (typeof window !== 'undefined') {
  window.OverlayService = OverlayService;
}