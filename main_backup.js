// Enhanced Minecraft Skin Overlay Merger with GitHub Browser and 3D Preview
const { useState, useRef, useEffect } = React;
const { createRoot } = ReactDOM;

// Simple UI Components
const Button = ({ children, onClick, disabled, className = "", variant = "default", size = "default" }) => {
  const variants = {
    default: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-transparent",
    ghost: "text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent",
    cyan: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500"
  };
  const sizes = { 
    default: "px-4 py-2.5 text-sm", 
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base"
  };
  return React.createElement('button', {
    className: `${sizes[size]} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${variants[variant]} ${className}`,
    onClick, disabled
  }, children);
};

const Card = ({ children, className = "" }) => 
  React.createElement('div', { className: `rounded-xl border border-slate-700 bg-slate-800/50 p-6 ${className}` }, children);

const Badge = ({ children, className = "" }) => 
  React.createElement('span', { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ${className}` }, children);

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return React.createElement('div', {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
    onClick: (e) => e.target === e.currentTarget && onClose()
  },
    React.createElement('div', { className: "bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden" },
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
      // Use Minecraft API to get skin
      const skinUrl = `https://mc-heads.net/skin/${encodeURIComponent(playerName.trim())}`;
      
      // Test if the skin exists by creating an image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Add to recent searches
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
            className: "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none",
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
      ),
      
      React.createElement('div', { className: "text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg" },
        React.createElement('p', { className: "mb-1" }, "💡 Tips:"),
        React.createElement('ul', { className: "list-disc list-inside space-y-1" },
          React.createElement('li', null, "Enter any valid Minecraft username"),
          React.createElement('li', null, "Skins are fetched from mc-heads.net"),
          React.createElement('li', null, "Works with both Java and Bedrock players")
        )
      )
    )
  );
};

// GitHub Overlay Browser
const GitHubOverlayBrowser = ({ isOpen, onClose, onSelectOverlay }) => {
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverlays = async () => {
    setLoading(true);
    setError('');
    try {
      // First try Netlify function (when deployed)
      let response;
      try {
        response = await fetch('/.netlify/functions/github-proxy');
      } catch (err) {
        // Fallback to direct GitHub API for local development
        console.log('Netlify function not available, trying direct GitHub API...');
        response = await fetch('https://api.github.com/repos/PavelGsAlt/pavelgsalt.github.io/contents/Overlays');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch overlays: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle direct GitHub API response vs proxy response
      if (data.overlays) {
        // Proxy response
        setOverlays(data.overlays);
      } else if (Array.isArray(data)) {
        // Direct GitHub API response - provide demo overlays for local testing
        const demoOverlays = [
          { name: "Hats/wizard_hat.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 2048, folder: "Hats", filename: "wizard_hat.png" },
          { name: "Hats/crown.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 1536, folder: "Hats", filename: "crown.png" },
          { name: "Accessories/glasses.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 1280, folder: "Accessories", filename: "glasses.png" },
          { name: "Accessories/watch.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 896, folder: "Accessories", filename: "watch.png" },
          { name: "Capes/red_cape.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 4096, folder: "Capes", filename: "red_cape.png" },
          { name: "Capes/blue_cape.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 3584, folder: "Capes", filename: "blue_cape.png" }
        ];
        setOverlays(demoOverlays);
      } else {
        setOverlays([]);
      }
    } catch (err) {
      console.error('GitHub overlay fetch error:', err);
      // Provide demo overlays for local testing with informative message
      setError('🔧 Local Development Mode: Showing demo overlays. Deploy to access real GitHub overlays.');
      const demoOverlays = [
        { name: "Hats/wizard_hat.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 2048, folder: "Hats", filename: "wizard_hat.png" },
        { name: "Hats/crown.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 1536, folder: "Hats", filename: "crown.png" },
        { name: "Accessories/glasses.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 1280, folder: "Accessories", filename: "glasses.png" },
        { name: "Capes/red_cape.png", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVHic7ZtNaBNBFMefSRpbW2uxWquIIHjQg+BJD0L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJHjx4EUPehA8eNGDHvTgQQ+e9CBID3rQg+BJD4L05EFET3rwJA==", size: 4096, folder: "Capes", filename: "red_cape.png" }
      ];
      setOverlays(demoOverlays);
    } finally {
      setLoading(false);
    }
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
        React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" }),
        React.createElement('input', {
          type: "text",
          placeholder: "Search overlays...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        })
      ),
      
      loading && React.createElement('div', { className: "text-center py-8 text-emerald-400" }, "Loading overlays..."),
      error && React.createElement('div', { className: "text-red-400 bg-red-500/10 p-4 rounded-lg" }, "Error: ", error),
      
      !loading && !error && filteredGroups.length > 0 && React.createElement('div', { className: "space-y-6" },
        filteredGroups.map(([folder, items]) =>
          React.createElement('div', { key: folder, className: "space-y-3" },
            React.createElement('h3', { className: "text-lg font-semibold text-white" }, folder, " (", items.length, " files)"),
            React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-3 gap-3" },
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
      ),
      
      !loading && !error && filteredGroups.length === 0 && 
      React.createElement('div', { className: "text-center py-8 text-slate-400" },
        searchTerm ? `No overlays found matching "${searchTerm}"` : "No overlays available"
      )
    )
  );
};

// 3D Viewer Component
const SkinViewer3D = ({ skinUrl, isVisible, onStatusChange }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  
  useEffect(() => {
    if (!isVisible || !skinUrl || !canvasRef.current) return;
    
    // Check for required libraries
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
      
      // Clear any existing viewer
      if (viewerRef.current) {
        viewerRef.current.viewer?.dispose?.();
        viewerRef.current = null;
      }
      
      // Create new viewer
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 400,
        height: 300,
        skin: skinUrl
      });
      
      // Configure viewer with much better camera position for full body view
      viewer.zoom = 0.5; // Much lower zoom for full overview
      viewer.fov = 70; // Wide field of view
      viewer.camera.position.set(0, 1.5, 10); // Much further back
      
      // Add orbit controls with proper zoom
      const controls = createOrbitControls(viewer);
      controls.enablePan = false;
      controls.enableZoom = true; // Ensure zoom is enabled
      controls.target.set(0, 1.5, 0); // Center on character
      controls.minDistance = 5; // Minimum zoom distance
      controls.maxDistance = 20; // Maximum zoom distance
      controls.zoomSpeed = 1.0; // Normal zoom speed
      controls.update();
      
      // Store references
      viewerRef.current = { viewer, controls };
      
      // Set success status
      onStatusChange?.('3D preview ready! Click and drag to rotate the skin.');
      
    } catch (error) {
      console.error('3D viewer initialization error:', error);
      onStatusChange?.(`Failed to initialize 3D viewer: ${error.message}. Try refreshing the page.`);
    }
    
    // Cleanup function
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
  }, [skinUrl, isVisible]);
  
  if (!isVisible) return null;
  
  return React.createElement('div', { className: "w-full" },
    React.createElement('canvas', {
      ref: canvasRef,
      className: "w-full rounded-lg bg-slate-800/50 border border-slate-600",
      style: { aspectRatio: '4/3', maxHeight: '300px' }
    })
  );
};

// Main App
function App() {
  const [skin, setSkin] = useState({ baseImg: null, overlayImg: null, baseName: 'base', overlayFromGitHub: false });
  const [errors, setErrors] = useState({ base: '', overlay: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [showGitHubBrowser, setShowGitHubBrowser] = useState(false);
  const [showSkinNameBrowser, setShowSkinNameBrowser] = useState(false);
  const [preview3D, setPreview3D] = useState({ show: false, url: '', status: 'Ready to preview' });
  const [options, setOptions] = useState({ autoResize: false, preserveFilename: true });
  
  const canvasRef = useRef(null);
  const baseFileInputRef = useRef(null);
  const overlayFileInputRef = useRef(null);
  
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds maximum
    
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
        baseName: type === 'base' ? file.name.replace(/\\.png$/i, '') : prev.baseName,
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
    setPreview3D({ show: true, url: mergedDataUrl, status: 'Loading 3D preview...' });
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
    setPreview3D({ show: false, url: '', status: 'Ready to preview' });
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
      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
        // Left column - Upload areas and controls
        React.createElement('div', { className: "lg:col-span-2 space-y-6" },
          React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            // Base skin upload
            React.createElement(Card, { className: "bg-white/5" },
              React.createElement('h3', { className: "text-xl font-semibold text-white mb-4" }, "Base Skin"),
              React.createElement('div', {
                className: "w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors mb-4",
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
                  onClick: () => setPreview3D({ show: true, url: skin.baseImg.src, status: 'Loading base skin...' })
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
                className: "w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors mb-4",
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
                skin.overlayImg && React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => clearSkin('overlay') }, "Clear")
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