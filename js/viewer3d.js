// 3D viewer and canvas operations

import { CONFIG, MESSAGES } from './constants.js';
import { nextFrame } from './utils.js';

export class SkinViewer3D {
    constructor() {
        this.viewer = null;
        this.controls = null;
        this.bgTexture = null;
        this.canvas = null;
        this.compositeCanvas = null;
    }

    initialize(previewCanvas, compositeCanvas) {
        this.canvas = previewCanvas;
        this.compositeCanvas = compositeCanvas;
    }

    resizeViewerCanvasToDisplaySize(viewer) {
        if (!this.canvas) return;
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
        const ch = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
        
        this.canvas.width = cw;
        this.canvas.height = ch;
        
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

    ensureViewer(scriptsLoaded) {
        if (this.viewer) return this.viewer;
        if (!window.skinview3d || !this.canvas || !scriptsLoaded) {
            console.log('Cannot create viewer');
            return null;
        }

        try {
            const { SkinViewer, createOrbitControls } = window.skinview3d;
            
            console.log('Creating SkinViewer...');
            const viewer = new SkinViewer({
                canvas: this.canvas,
                width: this.canvas.width,
                height: this.canvas.height,
                skin: null
            });
            
            viewer.zoom = CONFIG.VIEWER_DEFAULTS.zoom;
            viewer.fov = CONFIG.VIEWER_DEFAULTS.fov;
            
            try {
                this.controls = createOrbitControls(viewer);
                console.log('Orbit controls created');
            } catch (e) {
                console.warn('Failed to create orbit controls:', e);
                this.controls = null;
            }
            
            this.viewer = viewer;
            console.log('SkinViewer created successfully');
            return viewer;
        } catch (error) {
            console.error('Error creating viewer:', error);
            return null;
        }
    }

    updateAndApplyBgOptions(tex, preview) {
        if (!tex?.image || !this.canvas || !window.THREE) return;
        
        const filter = preview.filter;
        const fit = preview.fit;
        const scale = preview.scale;
        
        tex.magFilter = filter === 'nearest' ? window.THREE.NearestFilter : window.THREE.LinearFilter;
        tex.minFilter = filter === 'nearest' ? window.THREE.NearestMipmapNearestFilter : window.THREE.LinearMipmapLinearFilter;
        tex.wrapS = tex.wrapT = window.THREE.ClampToEdgeWrapping;
        
        const canvasW = this.canvas.clientWidth;
        const canvasH = this.canvas.clientHeight;
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

    applyBackgroundToViewer(viewer, preview) {
        if (!viewer?.scene || !window.THREE) return;
        
        if (!preview.bgDataUrl) {
            viewer.scene.background = null;
            this.bgTexture = null;
            return;
        }
        
        console.log('Loading background texture...');
        const loader = new window.THREE.TextureLoader();
        loader.load(
            preview.bgDataUrl,
            (tex) => {
                try {
                    console.log('Background texture loaded successfully');
                    tex.encoding = window.THREE.sRGBEncoding;
                    tex.needsUpdate = true;
                    this.bgTexture = tex;
                    this.updateAndApplyBgOptions(tex, preview);
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

    updateBackgroundTexture(preview) {
        if (this.bgTexture && this.viewer) {
            this.updateAndApplyBgOptions(this.bgTexture, preview);
            this.viewer.scene.background = this.bgTexture;
        }
    }

    async showSkinIn3D(dataUrl, descText, scriptsLoaded, preview, statusCallback) {
        if (!dataUrl || !scriptsLoaded) {
            statusCallback(MESSAGES.viewer3dNotReady);
            return;
        }
        
        console.log('Showing skin in 3D:', descText);
        statusCallback(MESSAGES.loadingPreview);
        await nextFrame();
        
        const viewer = this.ensureViewer(scriptsLoaded);
        if (!viewer) {
            console.error('Failed to create viewer');
            statusCallback(MESSAGES.failedToInitialize);
            return;
        }
        
        this.resizeViewerCanvasToDisplaySize(viewer);
        this.applyBackgroundToViewer(viewer, preview);
        
        try {
            console.log('Loading skin into viewer...');
            await viewer.loadSkin(dataUrl);
            console.log('Skin loaded successfully');
            
            // Position camera
            try {
                if (viewer.camera?.position?.set) {
                    viewer.camera.position.set(...CONFIG.VIEWER_DEFAULTS.cameraPosition);
                }
                if (typeof viewer.zoom !== 'undefined') {
                    viewer.zoom = CONFIG.VIEWER_DEFAULTS.finalZoom;
                }
                
                if (this.controls?.target && this.controls?.update) {
                    this.controls.target.set(...CONFIG.VIEWER_DEFAULTS.targetPosition);
                    this.controls.update();
                } else if (viewer.camera?.lookAt) {
                    viewer.camera.lookAt(...CONFIG.VIEWER_DEFAULTS.targetPosition);
                }
            } catch (e) {
                console.warn('Camera positioning failed:', e);
            }
            
            // Scroll into view
            try {
                this.canvas?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            } catch (e) {
                console.warn('Scroll into view failed:', e);
            }
            
            statusCallback(descText);
        } catch (err) {
            console.error('Skin loading failed:', err);
            statusCallback(MESSAGES.failedToLoadSkin);
        }
    }

    compositeToCanvas(baseImg, overlayImg, options) {
        if (!baseImg || !overlayImg || !this.compositeCanvas) return null;

        const canvas = this.compositeCanvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return null;

        const bw = baseImg.width;
        const bh = baseImg.height;
        const ow = overlayImg.width;
        const oh = overlayImg.height;

        canvas.width = bw;
        canvas.height = bh;
        ctx.clearRect(0, 0, bw, bh);
        ctx.imageSmoothingEnabled = false;

        try {
            ctx.drawImage(baseImg, 0, 0, bw, bh);
            console.log('Base image drawn to canvas');
        } catch (e) {
            console.error('Error drawing base image:', e);
            return null;
        }

        if (bw === ow && bh === oh) {
            try {
                ctx.drawImage(overlayImg, 0, 0);
                console.log('Overlay image drawn to canvas (same size)');
            } catch (e) {
                console.error('Error drawing overlay image:', e);
                return null;
            }
        } else if (options.autoResize) {
            try {
                ctx.drawImage(overlayImg, 0, 0, ow, oh, 0, 0, bw, bh);
                console.log('Overlay image drawn to canvas (resized)');
            } catch (e) {
                console.error('Error drawing resized overlay image:', e);
                return null;
            }
        } else {
            throw new Error(MESSAGES.sizeMismatch(ow, oh, bw, bh));
        }

        return canvas;
    }

    overlayOnlyDataUrl(overlayImg) {
        if (!overlayImg) return null;
        
        const tmp = document.createElement('canvas');
        tmp.width = overlayImg.width;
        tmp.height = overlayImg.height;
        const ctx = tmp.getContext('2d');
        if (!ctx) return null;
        
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(overlayImg, 0, 0);
        return tmp.toDataURL('image/png');
    }

    onResize() {
        if (this.viewer) {
            this.resizeViewerCanvasToDisplaySize(this.viewer);
        }
        if (this.bgTexture) {
            this.updateAndApplyBgOptions(this.bgTexture);
        }
    }

    removeBackground() {
        if (this.viewer?.scene) {
            this.viewer.scene.background = null;
        }
        this.bgTexture = null;
    }
}