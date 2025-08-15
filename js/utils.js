// Utility functions for file handling and DOM manipulation

import { CONFIG, MESSAGES } from './constants.js';

// File handling utilities
export function fileToImage(file) {
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

export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

export function ensureImageReady(img) {
    return new Promise(resolve => {
        if (!img) return resolve(false);
        if (img.complete && img.naturalWidth && img.naturalHeight) return resolve(true);
        img.addEventListener('load', () => resolve(true), { once: true });
        img.addEventListener('error', () => resolve(false), { once: true });
    });
}

export function validateFileType(file) {
    if (!file.type) return false;
    return CONFIG.ACCEPTED_FILE_TYPES.some(type => file.type.includes(type));
}

// DOM utilities
export function getElementById(id) {
    return document.getElementById(id);
}

export function setElementDisplay(element, display) {
    if (element) {
        element.style.display = display;
    }
}

export function setElementText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

export function addElementClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

export function removeElementClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

export function toggleElementClass(element, className, condition) {
    if (element) {
        element.classList.toggle(className, condition);
    }
}

// Status message utilities
export function setError(type, message, elements) {
    console.error(`${type} error:`, message);
    const errorElement = type === 'base' ? elements.baseError : elements.overlayError;
    const errorText = type === 'base' ? elements.baseErrorText : elements.overlayErrorText;
    
    if (message) {
        setElementText(errorText, message);
        setElementDisplay(errorElement, 'flex');
    } else {
        setElementDisplay(errorElement, 'none');
    }
}

export function setSuccess(type, message, elements) {
    console.log(`${type} success:`, message);
    const successElement = type === 'base' ? elements.baseSuccess : elements.overlaySuccess;
    const successText = type === 'base' ? elements.baseSuccessText : elements.overlaySuccessText;
    
    if (message) {
        setElementText(successText, message);
        setElementDisplay(successElement, 'flex');
    } else {
        setElementDisplay(successElement, 'none');
    }
}

export function clearError(type, elements) {
    setError(type, '', elements);
}

export function clearSuccess(type, elements) {
    setSuccess(type, '', elements);
}

// Drag and drop utilities
export function setupDragAndDrop(element, type, handler) {
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
            handler(type, files);
        }
    });
}

// Script loading utility
export function waitForGlobal(globalName, timeout = CONFIG.MAX_SCRIPT_LOAD_TIMEOUT) {
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

// File size formatting
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Download utility
export function downloadBlob(blob, filename) {
    if (!blob) {
        console.error('Failed to create blob');
        return false;
    }
    
    console.log('Downloading:', filename);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
    return true;
}

// Animation frame utility
export function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
}

// URL validation
export function parseGitHubUrl(url) {
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