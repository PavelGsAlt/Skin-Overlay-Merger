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
}, React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }));

const Download = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }));

const Github = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('path', { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5" }));

const Eye = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('path', { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }));

const Play = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('polygon', { points: "6,3 20,12 6,21 6,3" }));

const Search = ({ className = "" }) => React.createElement('svg', {
  className: `w-4 h-4 ${className}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
}, React.createElement('circle', { cx: "11", cy: "11", r: "8" }));

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
          React.createElement('input', {
            type: "text",
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "Enter Minecraft username...",
            className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-all",
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

// Working GitHub Overlay Browser
const GitHubOverlayBrowser = ({ isOpen, onClose, onSelectOverlay }) => {
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverlays = async () => {
    setLoading(true);
    setError('');
    
    // Show demo overlays immediately for local development
    const demoOverlays = [
      { name: "Hats/wizard_hat.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 2048, folder: "Hats", filename: "wizard_hat.png" },
      { name: "Hats/crown.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 1536, folder: "Hats", filename: "crown.png" },
      { name: "Hats/cap.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 1280, folder: "Hats", filename: "cap.png" },
      { name: "Accessories/glasses.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 1280, folder: "Accessories", filename: "glasses.png" },
      { name: "Accessories/watch.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 896, folder: "Accessories", filename: "watch.png" },
      { name: "Capes/red_cape.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 4096, folder: "Capes", filename: "red_cape.png" },
      { name: "Capes/blue_cape.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", size: 3584, folder: "Capes", filename: "blue_cape.png" }
    ];
    
    setTimeout(() => {
      setOverlays(demoOverlays);
      setError('🔧 Demo Mode: Showing sample overlays. Deploy to GitHub/Netlify for real overlays.');
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) fetchOverlays();
  }, [isOpen]);

  const groupedOverlays = overlays.reduce((groups, overlay) => {
    const folder = overlay.folder || overlay.name.split('/')[0];
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(overlay);
    return groups;
  }, {});

  const filteredGroups = Object.entries(groupedOverlays).filter(([folder, items]) => {
    if (!searchTerm) return true;
    return folder.toLowerCase().includes(searchTerm.toLowerCase()) ||
           items.some(item => (item.filename || item.name).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return React.createElement(Modal, { isOpen, onClose, title: "Browse GitHub Overlays" },
    React.createElement('div', { className: "space-y-4" },
      React.createElement('div', { className: "relative" },
        React.createElement(Search, { className: "absolute left-3 top-half transform translate-y-neg-half text-slate-400" }),
        React.createElement('input', {
          type: "text",
          placeholder: "Search overlays...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        })
      ),
      
      loading && React.createElement('div', { className: "text-center py-8 text-emerald-400" }, "Loading overlays..."),
      error && React.createElement('div', { className: "text-yellow-400 bg-yellow-500/10 p-4 rounded-lg text-sm" }, error),
      
      !loading && filteredGroups.length > 0 && React.createElement('div', { className: "space-y-6" },
        filteredGroups.map(([folder, items]) =>
          React.createElement('div', { key: folder, className: "space-y-3" },
            React.createElement('h3', { className: "text-lg font-semibold text-white" }, folder, " (", items.length, " files)"),
            React.createElement('div', { className: "grid grid-cols-2 md-grid-cols-3 gap-3" },
              items.filter(item => !searchTerm || 
                (item.filename || item.name).toLowerCase().includes(searchTerm.toLowerCase())
              ).map(overlay =>
                React.createElement('div', {
                  key: overlay.url,
                  className: "bg-slate-700/50 p-3 rounded-lg border border-slate-600 hover:border-cyan-500 transition-colors cursor-pointer",
                  onClick: () => {
                    onSelectOverlay(overlay.url);
                    onClose();
                  }
                },
                  React.createElement('div', { className: "text-sm font-medium text-white truncate" },
                    (overlay.filename || overlay.name).split('/').pop()
                  ),
                  React.createElement('div', { className: "text-xs text-slate-400 mt-1" },
                    Math.round(overlay.size / 1024), " KB"
                  ),
                  React.createElement(Button, { variant: "cyan", size: "sm", className: "w-full mt-2" }, "Select")
                )
              )
            )
          )
        )
      )
    )
  );
};

// Enhanced 3D Viewer Component with bigger size and better controls
const SkinViewer3D = ({ skinUrl, isVisible, onStatusChange, viewMode = 'merged' }) => {
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
        width: 600, // Increased from 400
        height: 450, // Increased from 300
        skin: skinUrl
      });
      
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
  }, [skinUrl, isVisible, viewMode]);
  
  if (!isVisible) return null;
  
  return React.createElement('div', { className: "w-full preview-3d-container" },
    React.createElement('canvas', {
      ref: canvasRef,
      className: "w-full rounded-lg bg-slate-800/50 border border-slate-600 preview-3d-canvas",
      style: { aspectRatio: '4/3', minHeight: '400px', maxHeight: '500px' } // Increased size
    })
  );
};

// Main App continues in main.js...

// Main App
function App() {
  const [skin, setSkin] = useState({ baseImg: null, overlayImg: null, baseName: 'base', overlayFromGitHub: false });
  const [errors, setErrors] = useState({ base: '', overlay: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [showGitHubBrowser, setShowGitHubBrowser] = useState(false);
  const [showSkinNameBrowser, setShowSkinNameBrowser] = useState(false);
  const [preview3D, setPreview3D] = useState({ show: false, url: '', status: 'Ready to preview', mode: 'merged' });
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
        overlayFromGitHub: type === 'overlay' ? false : prev.overlayFromGitHub
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
        overlayFromGitHub: false 
      }));
      
    } catch (err) {
      setErrors(prev => ({ ...prev, base: `Failed to load skin for ${username}: ${err.message}` }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGitHubOverlaySelect = async (overlayUrl) => {
    setIsProcessing(true);
    setErrors(prev => ({ ...prev, overlay: '' }));
    
    try {
      const response = await fetch(overlayUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch overlay from GitHub');
      
      const blob = await response.blob();
      const file = new File([blob], 'github-overlay.png', { type: 'image/png' });
      const img = await fileToImage(file);
      
      setSkin(prev => ({ ...prev, overlayImg: img, overlayFromGitHub: true }));
      
    } catch (err) {
      setErrors(prev => ({ ...prev, overlay: `Failed to load GitHub overlay: ${err.message}` }));
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

  const handlePreview3D = () => {
    if (!skin.baseImg || !skin.overlayImg) {
      setErrors({ base: 'Please load both base skin and overlay.', overlay: '' });
      return;
    }
    
    const canvas = compositeToCanvas();
    if (!canvas) return;
    
    const mergedDataUrl = canvas.toDataURL('image/png');
    setPreview3D({ show: true, url: mergedDataUrl, status: 'Loading merged 3D preview...', mode: 'merged' });
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
      setSkin(prev => ({ ...prev, overlayImg: null, overlayFromGitHub: false }));
      setErrors(prev => ({ ...prev, overlay: '' }));
      if (overlayFileInputRef.current) overlayFileInputRef.current.value = '';
    }
    setPreview3D({ show: false, url: '', status: 'Ready to preview', mode: 'merged' });
  };

  return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950" },
    // Header
    React.createElement('header', { className: "border-b border-white/10 bg-black/20 backdrop-blur-sm p-6" },
      React.createElement('div', { className: "max-w-7xl mx-auto" },
        React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-4" },
          React.createElement('div', null,
            React.createElement('h1', { className: "text-3xl font-bold text-white" }, "Minecraft Skin Overlay Merger"),
            React.createElement('p', { className: "text-emerald-400 mt-2" }, "Merge skins with overlays • 3D Preview • GitHub Browser • Browse by Name • Client-side processing")
          ),
          React.createElement('div', { className: "flex gap-2 flex-wrap" },
            React.createElement(Badge, { className: "bg-emerald-500/20 text-emerald-300" }, "✨ Enhanced"),
            React.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300" }, "👀 GitHub Browser"),
            React.createElement(Badge, { className: "bg-purple-500/20 text-purple-300" }, "🔍 Browse by Name"),
            scriptsLoaded && React.createElement(Badge, { className: "bg-green-500/20 text-green-300" }, "🎮 3D Ready")
          )
        )
      )
    ),

    // Main content
    React.createElement('div', { className: "max-w-7xl mx-auto p-6" },
      React.createElement('div', { className: "grid grid-cols-1 lg-grid-cols-3 gap-6" },
        // Left column - Upload areas and controls
        React.createElement('div', { className: "lg-col-span-2 space-y-6" },
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
                  onClick: () => setPreview3D({ show: true, url: skin.baseImg.src, status: 'Loading base skin...', mode: 'base' })
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
                skin.overlayFromGitHub && React.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300" }, "GitHub")
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
                  onClick: () => setShowGitHubBrowser(true),
                  className: "flex-1"
                }, React.createElement(Github, { className: "mr-1" }), "Browse GitHub"),
                skin.overlayImg && React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => clearSkin('overlay') }, "Clear"),
                skin.overlayImg && React.createElement(Button, { 
                  variant: "cyan", 
                  size: "sm", 
                  onClick: () => setPreview3D({ show: true, url: skin.overlayImg.src, status: 'Loading overlay preview...', mode: 'overlay' })
                }, React.createElement(Eye, { className: "mr-1" }), "Preview")
              ),
              
              errors.overlay && React.createElement('div', { className: "text-red-400 text-sm mb-2" }, errors.overlay),
              skin.overlayImg && React.createElement('div', { className: "text-cyan-400 text-sm" }, 
                `Overlay loaded • ${skin.overlayImg.width}×${skin.overlayImg.height}${skin.overlayFromGitHub ? ' • from GitHub' : ''}`
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

        // Right column - 3D Preview
        React.createElement('div', { className: "space-y-6" },
          React.createElement(Card, { className: "bg-white/5" },
            React.createElement('h3', { className: "text-xl font-semibold text-white mb-4" }, "3D Preview"),
            React.createElement('div', { className: "space-y-4" },
              React.createElement(SkinViewer3D, {
                skinUrl: preview3D.url,
                isVisible: preview3D.show,
                viewMode: preview3D.mode || 'merged',
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

    // GitHub Browser Modal
    React.createElement(GitHubOverlayBrowser, {
      isOpen: showGitHubBrowser,
      onClose: () => setShowGitHubBrowser(false),
      onSelectOverlay: handleGitHubOverlaySelect
    })
  );
}

// Bootstrap the app
if (typeof window !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    const reactRoot = createRoot(root);
    reactRoot.render(React.createElement(App));
  }
}