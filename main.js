// Enhanced Minecraft Skin Overlay Merger - FIXED VERSION
const { useState, useRef, useEffect } = React;
const { createRoot } = ReactDOM;

// Improved UI Components with better styling
const Button = ({ children, onClick, disabled, className = "", variant = "default", size = "default" }) => {
  const variants = {
    default: "btn-default",
    outline: "btn-outline",
    ghost: "btn-ghost",
    cyan: "btn-cyan",
    secondary: "btn-secondary"
  };
  const sizes = { 
    default: "btn-default-size", 
    sm: "btn-sm",
    lg: "btn-lg"
  };
  return React.createElement('button', {
    className: `${sizes[size]} ${variants[variant]} ${className}`,
    onClick, disabled
  }, children);
};

const Card = ({ children, className = "" }) => 
  React.createElement('div', { className: `card ${className}` }, children);

const Badge = ({ children, className = "" }) => 
  React.createElement('span', { className: `badge ${className}` }, children);

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return React.createElement('div', {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
    onClick: (e) => e.target === e.currentTarget && onClose()
  },
    React.createElement('div', { className: "bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-90vh overflow-hidden" },
      React.createElement('div', { className: "p-6 border-b border-slate-700 flex justify-between items-center" },
        React.createElement('h2', { className: "text-xl font-bold text-white" }, title),
        React.createElement(Button, { variant: "ghost", size: "sm", onClick: onClose }, "✕")
      ),
      React.createElement('div', { className: "p-6 overflow-auto max-h-96" }, children)
    )
  );
};

// Icons
const Upload = ({ className = "" }) => React.createElement('svg', {
  className: `w-6 h-6 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, 
  React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  React.createElement('polyline', { points: "17,6 12,1 7,6" }),
  React.createElement('line', { x1: "12", y1: "1", x2: "12", y2: "15" })
);

const Download = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, 
  React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  React.createElement('polyline', { points: "7,10 12,15 17,10" }),
  React.createElement('line', { x1: "12", y1: "15", x2: "12", y2: "3" })
);

const Github = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('path', { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5" }));

const Eye = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('path', { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
   React.createElement('circle', { cx: "12", cy: "12", r: "3" }));

const Play = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('polygon', { points: "6,3 20,12 6,21 6,3" }));

const Search = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, 
  React.createElement('circle', { cx: "11", cy: "11", r: "8" }),
  React.createElement('path', { d: "m21 21-4.35-4.35" })
);

// Skin Name Browser
const SkinNameBrowser = ({ isOpen, onClose, onSelectSkin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Notch', 'Herobrine', 'jeb_', 'Dinnerbone']);

  const fetchSkinByUsername = async (playerName) => {
    if (!playerName.trim()) {
      setError('Please enter a valid username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const skinUrl = `https://mc-heads.net/skin/${encodeURIComponent(playerName.trim())}`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const newSearches = [playerName.trim(), ...recentSearches.filter(s => s !== playerName.trim())].slice(0, 8);
          setRecentSearches(newSearches);
          
          onSelectSkin(skinUrl, playerName.trim());
          onClose();
          resolve();
        };
        img.onerror = () => reject(new Error('Skin not found or player does not exist'));
        img.src = skinUrl;
      });
      
    } catch (err) {
      setError(err.message || 'Failed to fetch skin. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSkinByUsername(username);
  };

  return React.createElement(Modal, { isOpen, onClose, title: "Browse Skin by Username" },
    React.createElement('div', { className: "space-y-4" },
      React.createElement('form', { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-white mb-2" }, "Minecraft Username:"),
          // Animated search input by Tiago Augusto (tiagoadag1203) - MIT License
          React.createElement('input', {
            type: "text",
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "Enter Minecraft username...",
            className: "animated-search-input",
            disabled: loading
          })
        ),
        React.createElement('div', { className: "flex gap-2" },
          React.createElement(Button, {
            type: "submit",
            disabled: loading || !username.trim(),
            className: "flex-1"
          }, loading ? "Searching..." : "Get Skin"),
          React.createElement(Button, {
            type: "button",
            variant: "outline",
            onClick: () => setUsername(''),
            disabled: loading
          }, "Clear")
        )
      ),
      
      error && React.createElement('div', { className: "text-red-400 bg-red-500/10 p-3 rounded-lg text-sm" }, error),
      
      React.createElement('div', null,
        React.createElement('h4', { className: "text-sm font-medium text-white mb-2" }, "Recent & Popular:"),
        React.createElement('div', { className: "flex flex-wrap gap-2" },
          recentSearches.map(name => 
            React.createElement('button', {
              key: name,
              onClick: () => setUsername(name),
              className: "px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors",
              disabled: loading
            }, name)
          )
        )
      )
    )
  );
};

// ZIP Overlay Browser
const ZipOverlayBrowser = ({ isOpen, onClose, onSelectOverlay }) => {
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('slim');
  const overlayServiceRef = useRef(null);

  const fetchOverlays = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!overlayServiceRef.current) {
        overlayServiceRef.current = new OverlayService();
      }
      
      const extractedOverlays = await overlayServiceRef.current.fetchOverlays();
      setOverlays(extractedOverlays);
      
      if (extractedOverlays.length === 0) {
        setError('📦 No overlays found in ZIP file. Make sure your Overlays.zip contains folders with PNG files.');
      }
      
    } catch (err) {
      console.error('Failed to fetch overlays:', err);
      setError(`❌ Failed to load overlays: ${err.message}. Make sure Overlays.zip is available and properly formatted.`);
      
      // Show demo overlays as fallback
      const demoOverlays = [
        {
          name: "wizard_hat",
          folder: "Overlays",
          hasSlim: true,
          hasNormal: true,
          fileCount: 2,
          defaultUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          urls: new Map([['slim.png', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='], ['normal.png', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==']])
        },
        {
          name: "cool_glasses",
          folder: "Overlays",
          hasSlim: true,
          hasNormal: false,
          fileCount: 1,
          defaultUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          urls: new Map([['slim.png', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==']])
        }
      ];
      setOverlays(demoOverlays);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOverlays();
    }
    
    // Cleanup on unmount
    return () => {
      if (overlayServiceRef.current) {
        overlayServiceRef.current.cleanup();
      }
    };
  }, [isOpen]);

  const filteredOverlays = overlays.filter(overlay => {
    if (!searchTerm) return true;
    return overlay.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOverlaySelect = (overlay) => {
    let selectedUrl = overlay.defaultUrl;
    
    // Try to get the preferred skin type
    if (selectedSkinType === 'slim' && overlay.hasSlim) {
      selectedUrl = overlay.urls.get('slim.png');
    } else if (selectedSkinType === 'normal' && overlay.hasNormal) {
      selectedUrl = overlay.urls.get('normal.png');
    }
    
    onSelectOverlay(selectedUrl, overlay.name);
    onClose();
  };

  return React.createElement(Modal, { isOpen, onClose, title: "Browse OR Feed Overlays" },
    React.createElement('div', { className: "space-y-4" },
      // Search and skin type selector
      React.createElement('div', { className: "flex gap-6 items-center" },
        React.createElement('div', { className: "relative flex-1" },
          // Animated search input by Tiago Augusto (tiagoadag1203) - MIT License
          React.createElement('input', {
            type: "text",
            placeholder: "Search OR Feed overlays...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "animated-search-input"
          })
        ),
        // Enhanced switch-style skin type selector
        React.createElement('div', { className: "flex items-center bg-slate-800/40 p-1 rounded-xl border border-slate-600/30 shadow-lg" },
          React.createElement('button', {
            onClick: () => setSelectedSkinType('slim'),
            className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out ${
              selectedSkinType === 'slim' 
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`
          }, "Slim"),
          React.createElement('button', {
            onClick: () => setSelectedSkinType('normal'),
            className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out ${
              selectedSkinType === 'normal' 
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`
          }, "Normal")
        )
      ),
      
      loading && React.createElement('div', { className: "text-center py-8 text-emerald-400" }, "📦 Extracting overlays from ZIP file..."),
      error && React.createElement('div', { className: "text-yellow-400 bg-yellow-500/10 p-4 rounded-lg text-sm" }, error),
      
      !loading && filteredOverlays.length > 0 && React.createElement('div', { className: "space-y-4" },
        React.createElement('div', { className: "text-sm text-slate-400" }, 
          `Found ${filteredOverlays.length} overlay${filteredOverlays.length !== 1 ? 's' : ''}`
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2" },
          filteredOverlays.map(overlay =>
            React.createElement('div', {
              key: overlay.name,
              className: "bg-slate-800/80 p-4 rounded-lg border border-slate-600 hover:border-cyan-400 hover:bg-slate-700/80 transition-all duration-200 cursor-pointer group",
              onClick: () => handleOverlaySelect(overlay)
            },
              React.createElement('div', { className: "flex justify-between items-start mb-3" },
                React.createElement('h4', { className: "text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors" }, overlay.name),
                React.createElement('div', { className: "flex gap-1.5" },
                  overlay.hasSlim && React.createElement('span', { 
                    className: `text-xs px-2 py-0.5 rounded border ${
                      selectedSkinType === 'slim' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                    }` 
                  }, "Slim"),
                  overlay.hasNormal && React.createElement('span', { 
                    className: `text-xs px-2 py-0.5 rounded border ${
                      selectedSkinType === 'normal' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                    }` 
                  }, "Normal")
                )
              ),
              React.createElement('div', { className: "text-xs text-slate-400 mb-3" },
                `${overlay.fileCount} file${overlay.fileCount !== 1 ? 's' : ''} • ${Math.round(overlay.totalSize / 1024)} KB`
              ),
              React.createElement(Button, { 
                variant: "cyan", 
                size: "sm", 
                className: "w-full text-sm py-2 font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-none" 
              }, 
                (() => {
                  if (selectedSkinType === 'slim') {
                    return overlay.hasSlim ? 'Select Slim' : 'Select Default';
                  } else if (selectedSkinType === 'normal') {
                    return overlay.hasNormal ? 'Select Normal' : 'Select Default';
                  }
                  return 'Select Default';
                })()
              )
            )
          )
        )
      ),
      
      !loading && filteredOverlays.length === 0 && !error && React.createElement('div', { className: "text-center py-8 text-slate-400" },
        "No overlays found matching your search."
      )
    )
  );
};

// Enhanced 3D Viewer Component with bigger size and better controls
const SkinViewer3D = ({ skinUrl, isVisible, onStatusChange, viewMode = 'merged', backgroundOptions }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  
  useEffect(() => {
    if (!isVisible || !skinUrl || !canvasRef.current) return;
    
    if (!window.THREE) {
      onStatusChange?.('Three.js library not loaded. Please refresh the page.');
      return;
    }
    
    if (!window.skinview3d) {
      onStatusChange?.('SkinView3D library not loaded. Please refresh the page.');
      return;
    }
    
    try {
      onStatusChange?.('Initializing 3D viewer...');
      const { SkinViewer, createOrbitControls } = window.skinview3d;
      
      if (viewerRef.current) {
        viewerRef.current.viewer?.dispose?.();
        viewerRef.current = null;
      }
      
      // Enhanced canvas size for better viewing
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 700, // Increased from 600
        height: 525, // Increased from 450
        skin: skinUrl
      });
      
      // Apply background based on options
      if (backgroundOptions && viewer.scene) {
        if (backgroundOptions.type === 'panorama' && backgroundOptions.panorama) {
          // Load panorama texture
          const loader = new window.THREE.TextureLoader();
          loader.load(backgroundOptions.panorama, (texture) => {
            texture.mapping = window.THREE.EquirectangularReflectionMapping;
            viewer.scene.background = texture;
          }, undefined, (error) => {
            console.error('Failed to load panorama:', error);
            // Fallback to default background
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, '#1a1f36');
            gradient.addColorStop(1, '#0d1421');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
            const fallbackTexture = new window.THREE.CanvasTexture(canvas);
            viewer.scene.background = fallbackTexture;
          });
        } else {
          // Default gradient background
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          const gradient = ctx.createLinearGradient(0, 0, 0, 256);
          gradient.addColorStop(0, backgroundOptions.gradient?.from || '#1a1f36');
          gradient.addColorStop(1, backgroundOptions.gradient?.to || '#0d1421');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 256, 256);
          const texture = new window.THREE.CanvasTexture(canvas);
          viewer.scene.background = texture;
        }
      }
      
      // Enhanced camera settings for better zoom and positioning
      viewer.zoom = 0.25; // Lower zoom for even better overview
      viewer.fov = 85; // Wider field of view
      viewer.camera.position.set(0, 1.5, 18); // Further back for better view
      
      const controls = createOrbitControls(viewer);
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.target.set(0, 1.5, 0);
      controls.minDistance = 2; // Closer minimum zoom
      controls.maxDistance = 60; // Even more zoom out range
      controls.zoomSpeed = 2.0; // Faster zoom for better UX
      controls.rotateSpeed = 1.5; // Smoother rotation
      controls.update();
      
      viewerRef.current = { viewer, controls };
      const modeText = viewMode === 'overlay' ? 'overlay preview' : viewMode === 'base' ? 'base skin preview' : 'merged preview';
      onStatusChange?.(`3D ${modeText} ready! Scroll to zoom, drag to rotate.`);
      
    } catch (error) {
      console.error('3D viewer initialization error:', error);
      onStatusChange?.(`Failed to initialize 3D viewer: ${error.message}. Try refreshing the page.`);
    }
    
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.viewer?.dispose?.();
        } catch (e) {
          console.warn('Error disposing 3D viewer:', e);
        }
        viewerRef.current = null;
      }
    };
  }, [skinUrl, isVisible, viewMode, backgroundOptions]);
  
  if (!isVisible) return null;
  
  return React.createElement('div', { className: "w-full preview-3d-container" },
    React.createElement('canvas', {
      ref: canvasRef,
      className: "w-full rounded-lg bg-slate-800/50 border border-slate-600 preview-3d-canvas",
      style: { aspectRatio: '4/3', minHeight: '450px', maxHeight: '600px' } // Updated for larger size
    })
  );
};

// Background Options Component - Panorama Only
const BackgroundOptions = ({ backgroundOptions, onBackgroundChange }) => {
  const handlePanoramaUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      alert('Please select an image file for the panorama.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        onBackgroundChange({ 
          ...backgroundOptions, 
          type: 'panorama', 
          panorama: reader.result,
          panoramaFileName: file.name
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Failed to load panorama image.');
    }
  };

  return React.createElement('div', { className: "space-y-3" },
    React.createElement('h4', { className: "text-sm font-medium text-white" }, "Background:"),
    
    // Panorama upload only
    React.createElement('div', { className: "space-y-2" },
      React.createElement('label', { className: "text-xs text-slate-400" }, "Custom Panorama:"),
      React.createElement('div', { className: "flex gap-2" },
        React.createElement('input', {
          type: "file",
          accept: "image/*",
          onChange: (e) => handlePanoramaUpload(e.target.files),
          className: "hidden",
          id: "panorama-upload"
        }),
        React.createElement('label', {
          htmlFor: "panorama-upload",
          className: "flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-xs text-slate-300 hover:bg-slate-600/50 hover:border-slate-500 cursor-pointer transition-all text-center"
        }, backgroundOptions.type === 'panorama' ? `Panorama Loaded • ${backgroundOptions.panoramaFileName || 'Unknown file'}` : "Upload Panorama"),
        backgroundOptions.panorama && React.createElement('button', {
          onClick: () => onBackgroundChange({ ...backgroundOptions, type: 'gradient', gradient: { from: '#1a1f36', to: '#0d1421' }, panorama: null, panoramaFileName: null }),
          className: "px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-xs text-slate-300 hover:bg-red-600/20 hover:border-red-500 transition-all",
          title: "Remove panorama"
        }, "✕")
      )
    )
  );
};

// Main App continues in main.js...

// Main App
function App() {
  const [skin, setSkin] = useState({ baseImg: null, overlayImg: null, baseName: 'base', overlayFromZip: false });
  const [errors, setErrors] = useState({ base: '', overlay: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [showZipBrowser, setShowZipBrowser] = useState(false);
  const [showSkinNameBrowser, setShowSkinNameBrowser] = useState(false);
  const [preview3D, setPreview3D] = useState({ show: false, url: '', status: 'Ready to preview', mode: 'merged' });
  const [backgroundOptions, setBackgroundOptions] = useState({ 
    type: 'gradient', 
    gradient: { from: '#1a1f36', to: '#0d1421' },
    panorama: null,
    panoramaFileName: null
  });
  const [options, setOptions] = useState({ autoResize: false, preserveFilename: true });
  
  const canvasRef = useRef(null);
  const baseFileInputRef = useRef(null);
  const overlayFileInputRef = useRef(null);
  
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkScripts = () => {
      attempts++;
      
      if (window.THREE && window.skinview3d) {
        setScriptsLoaded(true);
        setPreview3D(prev => ({ ...prev, status: '🎮 3D libraries loaded - ready for preview!' }));
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkScripts, 500);
      } else {
        setPreview3D(prev => ({ ...prev, status: '⚠️ 3D libraries failed to load. Try refreshing the page.' }));
      }
    };
    
    checkScripts();
  }, []);

  const fileToImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (type, files) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('image')) {
      setErrors(prev => ({ ...prev, [type]: 'Please select a PNG or image file.' }));
      return;
    }

    setErrors(prev => ({ ...prev, [type]: '' }));
    setIsProcessing(true);
    
    try {
      const img = await fileToImage(file);
      setSkin(prev => ({ 
        ...prev, 
        [type + 'Img']: img,
        baseName: type === 'base' ? file.name.replace(/\.png$/i, '') : prev.baseName,
        overlayFromZip: type === 'overlay' ? false : prev.overlayFromZip
      }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkinNameSelect = async (skinUrl, username) => {
    setIsProcessing(true);
    setErrors(prev => ({ ...prev, base: '' }));
    
    try {
      const response = await fetch(skinUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch skin from Minecraft servers');
      
      const blob = await response.blob();
      const file = new File([blob], `${username}-skin.png`, { type: 'image/png' });
      const img = await fileToImage(file);
      
      setSkin(prev => ({ 
        ...prev, 
        baseImg: img, 
        baseName: `${username}-skin`,
        overlayFromZip: false 
      }));
      
    } catch (err) {
      setErrors(prev => ({ ...prev, base: `Failed to load skin for ${username}: ${err.message}` }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZipOverlaySelect = async (overlayUrl, overlayName) => {
    setIsProcessing(true);
    setErrors(prev => ({ ...prev, overlay: '' }));
    
    try {
      // Create a response-like object from the blob URL
      const response = await fetch(overlayUrl);
      if (!response.ok) throw new Error('Failed to fetch overlay from ZIP');
      
      const blob = await response.blob();
      const file = new File([blob], `${overlayName}.png`, { type: 'image/png' });
      const img = await fileToImage(file);
      
      setSkin(prev => ({ ...prev, overlayImg: img, overlayFromZip: true }));
      
    } catch (err) {
      setErrors(prev => ({ ...prev, overlay: `Failed to load ZIP overlay: ${err.message}` }));
    } finally {
      setIsProcessing(false);
    }
  };

  const compositeToCanvas = () => {
    if (!skin.baseImg || !skin.overlayImg || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const bw = skin.baseImg.width;
    const bh = skin.baseImg.height;
    const ow = skin.overlayImg.width;
    const oh = skin.overlayImg.height;

    canvas.width = bw;
    canvas.height = bh;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(skin.baseImg, 0, 0);
    
    if (bw === ow && bh === oh) {
      ctx.drawImage(skin.overlayImg, 0, 0);
    } else if (options.autoResize) {
      ctx.drawImage(skin.overlayImg, 0, 0, ow, oh, 0, 0, bw, bh);
    } else {
      setErrors(prev => ({ ...prev, overlay: `Size mismatch: overlay is ${ow}×${oh}, base is ${bw}×${bh}. Enable "Auto-resize overlay".` }));
      return null;
    }
    
    return canvas;
  };

  // Helper function for auto-scroll to preview
  const scrollToPreview = () => {
    setTimeout(() => {
      const previewElement = document.querySelector('.preview-3d-container');
      if (previewElement) {
        previewElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100); // Small delay to ensure the preview is rendered
  };

  const handlePreview3D = () => {
    if (!skin.baseImg || !skin.overlayImg) {
      setErrors({ base: 'Please load both base skin and overlay.', overlay: '' });
      return;
    }
    
    const canvas = compositeToCanvas();
    if (!canvas) return;
    
    const mergedDataUrl = canvas.toDataURL('image/png');
    setPreview3D({ show: true, url: mergedDataUrl, status: 'Loading merged 3D preview...', mode: 'merged' });
    scrollToPreview();
  };

  const handleMergeDownload = () => {
    if (!skin.baseImg || !skin.overlayImg) {
      setErrors({ base: 'Please load both base skin and overlay.', overlay: '' });
      return;
    }
    
    const canvas = compositeToCanvas();
    if (!canvas) return;
    
    const outName = (options.preserveFilename ? skin.baseName : 'merged_skin') + '.png';
    
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = outName;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  const clearSkin = (type) => {
    if (type === 'base') {
      setSkin(prev => ({ ...prev, baseImg: null }));
      setErrors(prev => ({ ...prev, base: '' }));
      if (baseFileInputRef.current) baseFileInputRef.current.value = '';
    } else {
      setSkin(prev => ({ ...prev, overlayImg: null, overlayFromZip: false }));
      setErrors(prev => ({ ...prev, overlay: '' }));
      if (overlayFileInputRef.current) overlayFileInputRef.current.value = '';
    }
    setPreview3D({ show: false, url: '', status: 'Ready to preview', mode: 'merged' });
  };

  return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 app-container" },
    // Header
    React.createElement('header', { className: "bg-black/20 backdrop-blur-sm p-6" },
      React.createElement('div', { className: "max-w-7xl mx-auto" },
        React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-4" },
          React.createElement('div', null,
            React.createElement('h1', { className: "text-3xl font-bold text-white" }, "Minecraft Skin Overlay Merger"),
            React.createElement('p', { className: "text-emerald-400 mt-2" }, "Merge skins with overlays • 3D Preview • OR Feed Overlays • Browse by Name • Client-side processing")
          ),
          React.createElement('div', { className: "flex gap-2 flex-wrap" },
            React.createElement(Badge, { className: "bg-emerald-500/20 text-emerald-300" }, "✨ Enhanced"),
            React.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300" }, "🎨 OR Feed"),
            React.createElement(Badge, { className: "bg-purple-500/20 text-purple-300" }, "🔍 Browse by Name"),
            scriptsLoaded && React.createElement(Badge, { className: "bg-green-500/20 text-green-300" }, "🎮 3D Ready")
          )
        )
      )
    ),

    // Main content
    React.createElement('div', { className: "max-w-7xl mx-auto p-6" },
      React.createElement('div', { className: "grid grid-cols-1 xl:grid-cols-4 gap-6" },
        // Left column - Upload areas and controls (spans 2 columns)
        React.createElement('div', { className: "xl:col-span-2 space-y-6" },
          React.createElement('div', { className: "grid grid-cols-1 lg-grid-cols-2 gap-6" },
            // Base skin upload
            React.createElement(Card, { className: "bg-white/5" },
              React.createElement('h3', { className: "text-xl font-semibold text-white mb-4" }, "Base Skin"),
              React.createElement('div', {
                className: "upload-zone",
                onClick: () => baseFileInputRef.current?.click()
              },
                skin.baseImg ? 
                  React.createElement('img', { 
                    src: skin.baseImg.src, 
                    alt: "Base skin", 
                    className: "max-w-full max-h-full object-contain pixelated"
                  }) :
                  React.createElement('div', { className: "text-center text-slate-400" },
                    React.createElement(Upload, { className: "mx-auto mb-2" }),
                    React.createElement('p', null, "Click to upload base skin")
                  )
              ),
              
              React.createElement('div', { className: "flex gap-2 mb-4" },
                React.createElement(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setShowSkinNameBrowser(true),
                  className: "flex-1"
                }, "Browse by Name"),
                skin.baseImg && React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => clearSkin('base') }, "Clear"),
                skin.baseImg && React.createElement(Button, { 
                  variant: "outline", 
                  size: "sm", 
                  onClick: () => {
                    setPreview3D({ show: true, url: skin.baseImg.src, status: 'Loading base skin...', mode: 'base' });
                    scrollToPreview();
                  }
                }, React.createElement(Eye, { className: "mr-1" }), "Preview")
              ),
              
              errors.base && React.createElement('div', { className: "text-red-400 text-sm mb-2" }, errors.base),
              skin.baseImg && React.createElement('div', { className: "text-emerald-400 text-sm" }, 
                `Base skin loaded • ${skin.baseImg.width}×${skin.baseImg.height}`
              ),
              React.createElement('input', { 
                ref: baseFileInputRef, 
                type: "file", 
                accept: "image/png,image/*", 
                className: "hidden", 
                onChange: (e) => handleFileUpload('base', e.target.files) 
              })
            ),

            // Overlay upload
            React.createElement(Card, { className: "bg-white/5" },
              React.createElement('div', { className: "flex items-center justify-between mb-4" },
                React.createElement('h3', { className: "text-xl font-semibold text-white" }, "Overlay"),
                skin.overlayFromZip && React.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300" }, "ZIP")
              ),
              React.createElement('div', {
                className: "upload-zone",
                onClick: () => overlayFileInputRef.current?.click()
              },
                skin.overlayImg ? 
                  React.createElement('img', { 
                    src: skin.overlayImg.src, 
                    alt: "Overlay", 
                    className: "max-w-full max-h-full object-contain pixelated"
                  }) :
                  React.createElement('div', { className: "text-center text-slate-400" },
                    React.createElement(Upload, { className: "mx-auto mb-2" }),
                    React.createElement('p', null, "Click to upload overlay")
                  )
              ),
              
              React.createElement('div', { className: "flex gap-2 mb-4" },
                React.createElement(Button, {
                  variant: "cyan",
                  size: "sm",
                  onClick: () => setShowZipBrowser(true),
                  className: "flex-1"
                }, React.createElement('img', { 
                  src: './orf-logo.png', 
                  alt: 'OR Feed Logo', 
                  className: 'mr-2 w-4 h-4 object-contain'
                }), "Browse OR Feed"),
                skin.overlayImg && React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => clearSkin('overlay') }, "Clear"),
                skin.overlayImg && React.createElement(Button, { 
                  variant: "cyan", 
                  size: "sm", 
                  onClick: () => {
                    setPreview3D({ show: true, url: skin.overlayImg.src, status: 'Loading overlay preview...', mode: 'overlay' });
                    scrollToPreview();
                  }
                }, React.createElement(Eye, { className: "mr-1" }), "Preview")
              ),
              
              errors.overlay && React.createElement('div', { className: "text-red-400 text-sm mb-2" }, errors.overlay),
              skin.overlayImg && React.createElement('div', { className: "text-cyan-400 text-sm" }, 
                `Overlay loaded • ${skin.overlayImg.width}×${skin.overlayImg.height}${skin.overlayFromZip ? ' • from ZIP' : ''}`
              ),
              React.createElement('input', { 
                ref: overlayFileInputRef, 
                type: "file", 
                accept: "image/png,image/*", 
                className: "hidden", 
                onChange: (e) => handleFileUpload('overlay', e.target.files) 
              })
            )
          ),

          // Settings and Actions
          React.createElement(Card, { className: "bg-white/5" },
            React.createElement('h3', { className: "text-xl font-semibold text-white mb-4" }, "Settings & Actions"),
            React.createElement('div', { className: "space-y-4" },
              React.createElement('div', { className: "flex gap-6 flex-wrap" },
                React.createElement('label', { className: "flex items-center gap-2 text-white cursor-pointer" },
                  React.createElement('input', {
                    type: "checkbox",
                    checked: options.autoResize,
                    onChange: (e) => setOptions(prev => ({ ...prev, autoResize: e.target.checked })),
                    className: "rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  }),
                  React.createElement('span', { className: "text-sm" }, "Auto-resize overlay")
                ),
                React.createElement('label', { className: "flex items-center gap-2 text-white cursor-pointer" },
                  React.createElement('input', {
                    type: "checkbox",
                    checked: options.preserveFilename,
                    onChange: (e) => setOptions(prev => ({ ...prev, preserveFilename: e.target.checked })),
                    className: "rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  }),
                  React.createElement('span', { className: "text-sm" }, "Use base filename")
                )
              ),
              React.createElement('div', { className: "flex gap-3 flex-wrap" },
                React.createElement(Button, {
                  onClick: handlePreview3D,
                  disabled: !skin.baseImg || !skin.overlayImg || isProcessing || !scriptsLoaded,
                  variant: "outline"
                }, React.createElement(Play, { className: "mr-2" }), "Preview 3D"),
                React.createElement(Button, {
                  onClick: handleMergeDownload,
                  disabled: !skin.baseImg || !skin.overlayImg || isProcessing,
                  className: "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                }, React.createElement(Download, { className: "mr-2" }), isProcessing ? 'Processing...' : 'Merge & Download')
              )
            )
          )
        ),

        // Right columns - 3D Preview (spans 2 columns)
        React.createElement('div', { className: "xl:col-span-2 space-y-6" },
          // 3D Preview with background options in the right area
          React.createElement(Card, { className: "bg-white/5" },
            React.createElement('h3', { className: "text-xl font-semibold text-white mb-4" }, "3D Preview"),
            React.createElement('div', { className: "grid grid-cols-4 gap-6" },
              // Left side - 3D Viewer (takes 3 columns)
              React.createElement('div', { className: "col-span-3 space-y-4" },
                React.createElement(SkinViewer3D, {
                  skinUrl: preview3D.url,
                  isVisible: preview3D.show,
                  viewMode: preview3D.mode || 'merged',
                  backgroundOptions: backgroundOptions,
                  onStatusChange: (status) => setPreview3D(prev => ({ ...prev, status }))
                }),
                React.createElement('div', { 
                  className: `text-sm p-3 rounded-lg ${preview3D.show ? 'text-emerald-300 bg-emerald-500/10' : 'text-slate-300 bg-slate-700/30'}` 
                }, preview3D.status),
                !preview3D.show && React.createElement('div', { className: "text-center py-8 text-slate-400 border-2 border-dashed border-slate-600 rounded-lg" },
                  React.createElement('div', { className: "space-y-2" },
                    React.createElement('p', null, "🎮 Upload both skins and click"),
                    React.createElement('p', { className: "font-semibold" }, "'Preview 3D' to see the result!")
                  )
                )
              ),
              
              // Right side - Background options in the green zone (takes 1 column)
              React.createElement('div', { className: "col-span-1" },
                preview3D.show && React.createElement(BackgroundOptions, {
                  backgroundOptions: backgroundOptions,
                  onBackgroundChange: setBackgroundOptions
                })
              )
            )
          )
        )
      )
    ),

    // Hidden canvas for compositing
    React.createElement('canvas', { ref: canvasRef, className: "hidden" }),

    // Skin Name Browser Modal
    React.createElement(SkinNameBrowser, {
      isOpen: showSkinNameBrowser,
      onClose: () => setShowSkinNameBrowser(false),
      onSelectSkin: handleSkinNameSelect
    }),

    // ZIP Overlay Browser Modal
    React.createElement(ZipOverlayBrowser, {
      isOpen: showZipBrowser,
      onClose: () => setShowZipBrowser(false),
      onSelectOverlay: handleZipOverlaySelect
    }),

    // Development notice banner - positioned to move with content for glassmorphism effect
    React.createElement('div', { 
      style: {
        position: 'sticky',
        bottom: '0',
        left: '0',
        right: '0',
        marginTop: '2rem',
        zIndex: '99999',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.22), rgba(16, 185, 129, 0.25))',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        color: 'white',
        padding: '16px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        borderTop: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(16, 185, 129, 0.12)',
        textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
        animation: 'pulseGlow 4s ease-in-out infinite'
      }
    },
      "🚧 This site is still in development! Please message ",
      React.createElement('span', { 
        style: { 
          fontWeight: 'bold', 
          color: '#34d399',
          textShadow: '0 0 15px rgba(52, 211, 153, 0.6)',
          transition: 'all 0.3s ease'
        },
        onMouseEnter: (e) => {
          e.target.style.color = '#10feca';
          e.target.style.textShadow = '0 0 20px rgba(16, 254, 202, 0.8)';
        },
        onMouseLeave: (e) => {
          e.target.style.color = '#34d399';
          e.target.style.textShadow = '0 0 15px rgba(52, 211, 153, 0.6)';
        }
      }, "ph4_0"),
      " on Discord for any issues or feedback."
    )
  );
}

// Bootstrap the app with dependency checking
if (typeof window !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    let attempts = 0;
    const maxAttempts = 150; // 15 seconds at 100ms intervals
    
    // Wait for all required dependencies before starting
    const waitForDependencies = () => {
      attempts++;
      
      // Check if all required libraries are loaded
      const hasReact = window.React && window.ReactDOM && window.React.createElement;
      const hasJSZip = window.JSZip;
      const hasBabel = window.Babel; // Babel should be loaded for JSX transform
      
      if (hasReact && hasJSZip && hasBabel) {
        try {
          // Ensure createRoot is available
          if (!createRoot) {
            throw new Error('createRoot not available from ReactDOM');
          }
          
          const reactRoot = createRoot(root);
          reactRoot.render(React.createElement(App));
          
          // Mark app as successfully started
          if (window.markAppStarted) {
            // Small delay to ensure render is complete
            setTimeout(() => {
              window.markAppStarted();
              console.log('✅ Minecraft Skin Overlay Merger loaded successfully!');
            }, 100);
          }
        } catch (error) {
          console.error('Failed to render React app:', error);
          // Update loading message to show the error
          const loadingDetails = document.getElementById('loading-details');
          if (loadingDetails) {
            loadingDetails.innerHTML = `
              <div style="color: #ef4444; margin-top: 0.5rem;">
                ❌ Render failed: ${error.message}<br>
                <button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">Reload</button>
              </div>
            `;
          }
          throw error;
        }
      } else if (attempts < maxAttempts) {
        // Try again in 100ms if dependencies aren't ready
        setTimeout(waitForDependencies, 100);
      } else {
        // Timeout - show what's missing
        const missing = [];
        if (!hasReact) missing.push('React/ReactDOM');
        if (!hasJSZip) missing.push('JSZip');
        if (!hasBabel) missing.push('Babel');
        
        console.error('Dependencies failed to load:', missing);
        const loadingDetails = document.getElementById('loading-details');
        if (loadingDetails) {
          loadingDetails.innerHTML = `
            <div style="color: #ef4444; margin-top: 0.5rem;">
              ❌ Failed to load: ${missing.join(', ')}<br>
              <button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">Retry</button>
            </div>
          `;
        }
      }
    };
    
    // Start dependency check after a brief delay to let scripts load
    setTimeout(waitForDependencies, 200);
  }
}