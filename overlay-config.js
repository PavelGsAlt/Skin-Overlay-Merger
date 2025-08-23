// Overlay ZIP Configuration
// This file contains configuration for fetching and extracting overlay ZIP files

const OVERLAY_CONFIG = {
  // ZIP File Configuration
  zipFile: {
    url: './Overlays.zip', // Path to the Overlays.zip file (relative to site root)
    // Alternative URLs for different environments:
    // url: 'https://your-domain.com/Overlays.zip', // For external hosting
    // url: 'https://github.com/your-repo/releases/download/v1.0.0/Overlays.zip', // GitHub releases
    filename: 'Overlays.zip',
    maxSize: 100 * 1024 * 1024 // 100MB max file size
  },

  // Extraction Configuration
  extraction: {
    allowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'], // Allowed image formats
    ignoreFolders: ['.DS_Store', 'Thumbs.db', '__MACOSX'], // Folders/files to ignore
    requiredFiles: ['slim.png', 'normal.png'], // Files that should exist in each overlay folder
    maxFileSize: 10 * 1024 * 1024, // 10MB max per image file
    cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours cache expiry
  },

  // Structure Configuration
  structure: {
    overlayFolders: true, // Expect overlay name folders
    skinTypes: ['slim.png', 'normal.png'], // Expected skin type files
    fallbackToFirst: true, // If specific skin type not found, use first available
    showEmptyFolders: false // Don't show folders without valid overlay files
  },

  // Cache Configuration
  cache: {
    enabled: true, // Enable local caching
    prefix: 'minecraft_overlays_', // Cache key prefix
    version: '1.0', // Cache version (increment to invalidate cache)
    storeInMemory: true, // Keep extracted overlays in memory
    storeInLocalStorage: false // Don't store large files in localStorage
  },

  // Network Configuration
  network: {
    timeout: 30000, // 30 second timeout
    retries: 3, // Number of retry attempts
    retryDelay: 1000 // Delay between retries (ms)
  }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OVERLAY_CONFIG;
} else if (typeof window !== 'undefined') {
  window.OVERLAY_CONFIG = OVERLAY_CONFIG;
}