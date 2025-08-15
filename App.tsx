import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Checkbox } from './components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Upload, Github, Image, Download, Play, Settings, AlertCircle, CheckCircle2, Eye, X } from 'lucide-react';
import { GitHubOverlayBrowser } from './components/GitHubOverlayBrowser';

// Three.js and skinview3d types
declare global {
  interface Window {
    THREE: any;
    skinview3d: any;
  }
}

interface SkinState {
  baseImg: HTMLImageElement | null;
  overlayImg: HTMLImageElement | null;
  baseName: string;
  overlayFromGitHub: boolean;
}

interface PreviewState {
  bgDataUrl: string | null;
  bgName: string;
  filter: 'linear' | 'nearest';
  fit: 'cover' | 'contain' | 'stretch';
  scale: number;
}

export default function App() {
  const [skin, setSkin] = useState<SkinState>({
    baseImg: null,
    overlayImg: null,
    baseName: 'base',
    overlayFromGitHub: false
  });
  
  const [preview, setPreview] = useState<PreviewState>({
    bgDataUrl: null,
    bgName: '',
    filter: 'linear',
    fit: 'cover',
    scale: 1
  });
  
  const [options, setOptions] = useState({
    autoResize: false,
    preserveFilename: true
  });
  
  const [errors, setErrors] = useState({
    base: '',
    overlay: ''
  });
  
  const [previewDesc, setPreviewDesc] = useState('Ready to preview');
  const [showGitHubBrowser, setShowGitHubBrowser] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const bgTextureRef = useRef<any>(null);
  const baseFileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  // Load Three.js and skinview3d
  useEffect(() => {
    const loadScripts = async () => {
      try {
        console.log('Loading Three.js and skinview3d...');
        
        if (!window.THREE) {
          const threeScript = document.createElement('script');
          threeScript.src = 'https://unpkg.com/three@0.150.1/build/three.min.js';
          document.head.appendChild(threeScript);
          await new Promise((resolve, reject) => { 
            threeScript.onload = resolve;
            threeScript.onerror = reject;
          });
          console.log('Three.js loaded');
        }
        
        if (!window.skinview3d) {
          const skinviewScript = document.createElement('script');
          skinviewScript.src = 'https://unpkg.com/skinview3d@2.2.0/bundles/skinview3d.bundle.js';
          document.head.appendChild(skinviewScript);
          await new Promise((resolve, reject) => { 
            skinviewScript.onload = resolve;
            skinviewScript.onerror = reject;
          });
          console.log('skinview3d loaded');
        }
        
        setScriptsLoaded(true);
        console.log('All scripts loaded successfully');
      } catch (error) {
        console.error('Failed to load scripts:', error);
        setPreviewDesc('Failed to load 3D viewer scripts');
      }
    };
    
    loadScripts();
  }, []);

  // Utility functions from original code
  const fileToImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      console.log('Processing file:', file.name, file.type, file.size);
      
      const reader = new FileReader();
      reader.onerror = () => {
        console.error('FileReader error');
        reject(new Error('Failed to read file'));
      };
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
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
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const setError = (type: 'base' | 'overlay', message: string) => {
    console.error(`${type} error:`, message);
    setErrors(prev => ({ ...prev, [type]: message }));
  };

  const clearError = (type: 'base' | 'overlay') => {
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  // File upload handling - simplified like the original code
  const handleFileUpload = async (type: 'base' | 'overlay', files: FileList | null) => {
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
    setIsProcessing(true);
    
    try {
      const img = await fileToImage(file);
      
      console.log('Image processed successfully:', {
        type,
        width: img.width,
        height: img.height
      });
      
      if (type === 'base') {
        setSkin(prev => ({ 
          ...prev, 
          baseImg: img,
          baseName: file.name.replace(/\.png$/i, '') 
        }));
        console.log('Base skin set');
      } else {
        setSkin(prev => ({ 
          ...prev, 
          overlayImg: img,
          overlayFromGitHub: false // Reset GitHub flag when uploading local file
        }));
        console.log('Overlay set');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError(type, (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // GitHub overlay selection
  const handleGitHubOverlaySelect = async (overlayUrl: string) => {
    console.log('GitHub overlay selected:', overlayUrl);
    setIsProcessing(true);
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
      
      setSkin(prev => ({ 
        ...prev, 
        overlayImg: img,
        overlayFromGitHub: true // Set GitHub flag
      }));
      
      setShowGitHubBrowser(false);
      console.log('GitHub overlay loaded successfully');
    } catch (err) {
      console.error('GitHub overlay error:', err);
      setError('overlay', `Failed to load overlay from GitHub: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers (from original code)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent, type: 'base' | 'overlay') => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(type, files);
    }
  };

  // Rest of the functions remain the same but simplified
  const ensureImageReady = (img: HTMLImageElement | null): Promise<boolean> => {
    return new Promise(resolve => {
      if (!img) return resolve(false);
      if (img.complete && img.naturalWidth && img.naturalHeight) return resolve(true);
      img.addEventListener('load', () => resolve(true), { once: true });
      img.addEventListener('error', () => resolve(false), { once: true });
    });
  };

  const compositeToCanvas = (): HTMLCanvasElement | null => {
    if (!skin.baseImg || !skin.overlayImg || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return null;

    const bw = skin.baseImg.width;
    const bh = skin.baseImg.height;
    const ow = skin.overlayImg.width;
    const oh = skin.overlayImg.height;

    canvas.width = bw;
    canvas.height = bh;
    ctx.clearRect(0, 0, bw, bh);
    ctx.imageSmoothingEnabled = false;

    try {
      ctx.drawImage(skin.baseImg, 0, 0, bw, bh);
      console.log('Base image drawn to canvas');
    } catch (e) {
      console.error('Error drawing base image:', e);
      return null;
    }

    if (bw === ow && bh === oh) {
      try {
        ctx.drawImage(skin.overlayImg, 0, 0);
        console.log('Overlay image drawn to canvas (same size)');
      } catch (e) {
        console.error('Error drawing overlay image:', e);
        return null;
      }
    } else if (options.autoResize) {
      try {
        ctx.drawImage(skin.overlayImg, 0, 0, ow, oh, 0, 0, bw, bh);
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
  };

  const overlayOnlyDataUrl = (): string | null => {
    if (!skin.overlayImg) return null;
    
    const tmp = document.createElement('canvas');
    tmp.width = skin.overlayImg.width;
    tmp.height = skin.overlayImg.height;
    const ctx = tmp.getContext('2d');
    if (!ctx) return null;
    
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(skin.overlayImg, 0, 0);
    return tmp.toDataURL('image/png');
  };

  // 3D viewer functions (simplified)
  const ensureViewer = () => {
    if (viewerRef.current) return viewerRef.current;
    if (!window.skinview3d || !previewCanvasRef.current || !scriptsLoaded) {
      console.log('Cannot create viewer');
      return null;
    }

    try {
      const { SkinViewer, createOrbitControls } = window.skinview3d;
      const canvas = previewCanvasRef.current;
      
      const viewer = new SkinViewer({
        canvas,
        width: canvas.width,
        height: canvas.height,
        skin: null
      });
      
      viewer.zoom = 0.95;
      viewer.fov = 50;
      
      try {
        controlsRef.current = createOrbitControls(viewer);
      } catch (e) {
        controlsRef.current = null;
      }
      
      viewerRef.current = viewer;
      return viewer;
    } catch (error) {
      console.error('Error creating viewer:', error);
      return null;
    }
  };

  const showSkinIn3D = async (dataUrl: string, descText: string) => {
    if (!dataUrl || !scriptsLoaded) {
      setPreviewDesc('3D viewer not ready');
      return;
    }
    
    setPreviewDesc('Loading preview...');
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const viewer = ensureViewer();
    if (!viewer) {
      setPreviewDesc('Failed to initialize 3D viewer');
      return;
    }
    
    try {
      await viewer.loadSkin(dataUrl);
      
      if (viewer.camera?.position?.set) {
        viewer.camera.position.set(0, 1.4, 4.6);
      }
      if (typeof viewer.zoom !== 'undefined') {
        viewer.zoom = 0.9;
      }
      
      if (controlsRef.current?.target && controlsRef.current?.update) {
        controlsRef.current.target.set(0, 1, 0);
        controlsRef.current.update();
      } else if (viewer.camera?.lookAt) {
        viewer.camera.lookAt(0, 1, 0);
      }
      
      previewCanvasRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      setPreviewDesc(descText);
    } catch (err) {
      console.error('Skin loading failed:', err);
      setPreviewDesc('Failed to load skin in 3D viewer');
    }
  };

  // Individual preview functions
  const previewBaseSkin = async () => {
    if (!skin.baseImg) {
      setError('base', 'No base skin loaded');
      return;
    }
    await showSkinIn3D(skin.baseImg.src, 'Base skin preview');
  };

  const previewOverlay = async () => {
    if (!skin.overlayImg) {
      setError('overlay', 'No overlay loaded');
      return;
    }
    const dataUrl = overlayOnlyDataUrl();
    if (dataUrl) {
      await showSkinIn3D(dataUrl, 'Overlay preview (2nd layer only)');
    }
  };

  const handlePreview = async () => {
    if (!skin.baseImg) {
      setError('base', 'Please load a base skin PNG.');
      return;
    }
    if (!skin.overlayImg) {
      setError('overlay', 'Please load an overlay PNG.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const ok1 = await ensureImageReady(skin.baseImg);
      const ok2 = await ensureImageReady(skin.overlayImg);
      
      if (!ok1 || !ok2) {
        setError('base', 'Images are not ready yet.');
        return;
      }
      
      const canvas = compositeToCanvas();
      if (!canvas) return;
      
      const mergedDataUrl = canvas.toDataURL('image/png');
      await showSkinIn3D(mergedDataUrl, 'Merged skin preview (base + overlay)');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergeDownload = () => {
    clearError('base');
    clearError('overlay');
    
    if (!skin.baseImg) {
      setError('base', 'Please load a base skin PNG.');
      return;
    }
    if (!skin.overlayImg) {
      setError('overlay', 'Please load an overlay PNG.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const canvas = compositeToCanvas();
      if (!canvas) return;
      
      const outName = (options.preserveFilename ? skin.baseName : 'merged_skin') + '.png';
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 'image/png');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackgroundUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(prev => ({ 
        ...prev, 
        bgDataUrl: dataUrl, 
        bgName: file.name 
      }));
    } catch (err) {
      console.error('Background upload error:', err);
      alert('Failed to load background image');
    }
  };

  const removeBackground = () => {
    setPreview(prev => ({ ...prev, bgDataUrl: null, bgName: '' }));
    if (viewerRef.current?.scene) {
      viewerRef.current.scene.background = null;
    }
  };

  // Clear functions
  const clearBaseSkin = () => {
    setSkin(prev => ({ ...prev, baseImg: null }));
    clearError('base');
    if (baseFileInputRef.current) {
      baseFileInputRef.current.value = '';
    }
  };

  const clearOverlay = () => {
    setSkin(prev => ({ ...prev, overlayImg: null, overlayFromGitHub: false }));
    clearError('overlay');
    if (overlayFileInputRef.current) {
      overlayFileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
              <span className="text-slate-900 font-black text-lg">MS</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Minecraft Skin Overlay Merger</h1>
              <p className="text-emerald-400/80 text-sm">
                Merge your Minecraft skins with overlays • Client-side processing • No uploads
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Beta
              </Badge>
              {scriptsLoaded && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  3D Ready
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-8 space-y-6">
            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Base Skin Upload */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Image className="w-5 h-5 text-emerald-400" />
                    Base Skin
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Your main Minecraft skin (64×64 recommended)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="w-full h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all duration-200 group relative"
                    onClick={() => baseFileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'base')}
                  >
                    {skin.baseImg ? (
                      <>
                        <img 
                          src={skin.baseImg.src} 
                          alt="Base skin" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewBaseSkin();
                            }}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 mx-auto transition-colors" />
                        <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Only show clear button when file is uploaded */}
                  {skin.baseImg && (
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearBaseSkin}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}

                  {errors.base && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-4 h-4" />
                      {errors.base}
                    </div>
                  )}

                  {skin.baseImg && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Base skin loaded • {skin.baseImg.width}×{skin.baseImg.height}
                    </div>
                  )}
                </CardContent>
                <input
                  ref={baseFileInputRef}
                  type="file"
                  accept="image/png,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('base', e.target.files)}
                />
              </Card>

              {/* Overlay Upload */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Github className={`w-5 h-5 ${skin.overlayFromGitHub ? 'text-cyan-300' : 'text-cyan-400'}`} />
                    Overlay (2nd Layer)
                    {skin.overlayFromGitHub && (
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                        GitHub
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Transparent overlay with accessories</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="w-full h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all duration-200 group relative"
                    onClick={() => overlayFileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'overlay')}
                  >
                    {skin.overlayImg ? (
                      <>
                        <img 
                          src={skin.overlayImg.src} 
                          alt="Overlay" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              previewOverlay();
                            }}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto transition-colors" />
                        <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowGitHubBrowser(true)}
                      className={`flex-1 ${
                        skin.overlayFromGitHub 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30' 
                          : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Browse GitHub
                    </Button>
                    
                    {/* Only show clear button when file is uploaded */}
                    {skin.overlayImg && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearOverlay}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {errors.overlay && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-4 h-4" />
                      {errors.overlay}
                    </div>
                  )}

                  {skin.overlayImg && (
                    <div className="flex items-center gap-2 text-cyan-400 text-sm bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Overlay loaded • {skin.overlayImg.width}×{skin.overlayImg.height}
                      {skin.overlayFromGitHub && (
                        <span className="ml-auto text-xs">from GitHub</span>
                      )}
                    </div>
                  )}
                </CardContent>
                <input
                  ref={overlayFileInputRef}
                  type="file"
                  accept="image/png,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('overlay', e.target.files)}
                />
              </Card>
            </div>

            {/* Settings */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex gap-6 flex-wrap">
                    <label className="flex items-center gap-3 text-white cursor-pointer">
                      <Checkbox
                        checked={options.autoResize}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, autoResize: checked as boolean }))
                        }
                        className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span className="text-sm">Auto-resize overlay</span>
                    </label>
                    <label className="flex items-center gap-3 text-white cursor-pointer">
                      <Checkbox
                        checked={options.preserveFilename}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, preserveFilename: checked as boolean }))
                        }
                        className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span className="text-sm">Use base filename</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handlePreview}
                      disabled={!skin.baseImg || !skin.overlayImg || isProcessing || !scriptsLoaded}
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Preview Merged'}
                    </Button>
                    <Button 
                      onClick={handleMergeDownload}
                      disabled={!skin.baseImg || !skin.overlayImg || isProcessing}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Merge & Download'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Preview */}
          <div className="xl:col-span-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">3D Preview</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">Interactive skin viewer</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => bgFileInputRef.current?.click()}
                      disabled={!scriptsLoaded}
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white text-xs disabled:opacity-50"
                    >
                      <Image className="w-3 h-3 mr-1" />
                      BG
                    </Button>
                    <Select 
                      value={preview.fit} 
                      onValueChange={(value) => setPreview(prev => ({ ...prev, fit: value as any }))}
                      disabled={!scriptsLoaded}
                    >
                      <SelectTrigger className="w-20 h-8 bg-white/5 border-white/20 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-white/10">
                  <canvas
                    ref={previewCanvasRef}
                    width={1280}
                    height={720}
                    className="w-full aspect-video rounded-lg bg-slate-700/30"
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="text-slate-300">{previewDesc}</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs">Filter</label>
                      <Select 
                        value={preview.filter} 
                        onValueChange={(value) => setPreview(prev => ({ ...prev, filter: value as any }))}
                        disabled={!scriptsLoaded}
                      >
                        <SelectTrigger className="h-8 bg-white/5 border-white/20 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="nearest">Pixel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs">Zoom: {preview.scale.toFixed(1)}x</label>
                      <Input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={preview.scale}
                        onChange={(e) => setPreview(prev => ({ ...prev, scale: Number(e.target.value) }))}
                        disabled={!scriptsLoaded}
                        className="h-8 bg-white/5 border-white/20"
                      />
                    </div>
                  </div>
                  
                  {preview.bgName && (
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                      <span className="text-xs text-slate-400 truncate">{preview.bgName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={removeBackground}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 px-2 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  💡 <strong>Tips:</strong><br />
                  • Drag & drop files directly onto upload areas<br />
                  • Hover over uploaded skins and click "Preview"<br />
                  • Click and drag to rotate the 3D model<br />
                  • Upload background images to customize the scene
                </div>
              </CardContent>
              
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBackgroundUpload(e.target.files)}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden canvas for compositing */}
      <canvas ref={canvasRef} className="hidden" width={64} height={64} />

      {/* GitHub Browser Modal */}
      {showGitHubBrowser && (
        <GitHubOverlayBrowser
          isOpen={showGitHubBrowser}
          onClose={() => setShowGitHubBrowser(false)}
          onSelectOverlay={handleGitHubOverlaySelect}
        />
      )}
    </div>
  );
}
