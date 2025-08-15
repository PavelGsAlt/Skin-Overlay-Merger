// GitHub API and overlay browser functionality

import { CONFIG, ELEMENT_IDS, MESSAGES } from './constants.js';
import { parseGitHubUrl, formatFileSize, setElementDisplay, setElementText } from './utils.js';

export class GitHubManager {
    constructor() {
        this.folders = [];
        this.loading = false;
        this.searchTerm = '';
        this.elements = {};
    }

    initialize(elements) {
        this.elements = elements;
    }

    /**
     * Fetches overlay folders and PNG files from the Netlify proxy function.
     * @returns {Promise<Array>} - Array of overlay file objects with name and url
     */
    async fetchOverlaysViaProxy() {
        const proxyUrl = "https://skinoverlay.netlify.app/.netlify/functions/github-proxy";
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Could not fetch overlays from proxy.');
        }
        const data = await response.json();
        return data;
    }

    /**
     * Fetches overlays and renders them using the Netlify proxy.
     */
    async fetchRepositoryContents(repoUrl) {
        this.setLoading(true);
        try {
            // Ignore repoUrl, always use proxy for overlays
            const overlays = await this.fetchOverlaysViaProxy();
            // overlays: [{ name: "Aurora Sorcerer/normal.png", url: "..." }, ...]
            // Group overlays by folder for rendering
            const foldersMap = {};
            overlays.forEach(file => {
                const [folder, fileName] = file.name.split('/');
                if (!foldersMap[folder]) foldersMap[folder] = [];
                foldersMap[folder].push(file);
            });
            this.folders = Object.entries(foldersMap).map(([name, files]) => ({ name, files }));
            this.renderOverlays();
            this.showSuccess(`Loaded ${this.folders.length} overlay folders.`);
        } catch (err) {
            this.showError(err.message || 'Failed to fetch overlays from proxy.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.loading = loading;
        
        const loadingState = this.elements.loadingState;
        const fetchIcon = this.elements.fetchIcon;
        const fetchText = this.elements.fetchText;
        const fetchBtn = this.elements.fetchBtn;
        
        if (fetchBtn) fetchBtn.disabled = loading;
        
        if (loading) {
            setElementDisplay(loadingState, 'flex');
            if (fetchIcon) {
                fetchIcon.innerHTML = '<path d="M21 12a9 9 0 11-6.219-8.56"/>';
                fetchIcon.style.animation = 'spin 1s linear infinite';
            }
            setElementText(fetchText, 'Loading...');
            this.hideAllStates();
            setElementDisplay(loadingState, 'flex');
        } else {
            setElementDisplay(loadingState, 'none');
            if (fetchIcon) {
                fetchIcon.innerHTML = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>';
                fetchIcon.style.animation = 'none';
            }
            setElementText(fetchText, 'Fetch');
        }
    }

    hideAllStates() {
        const states = [
            'errorState', 'loadingState', 'overlaysContent', 
            'emptyState', 'instructionsState', 'successMessage', 'searchSection'
        ];
        
        states.forEach(state => {
            const element = this.elements[state];
            if (element) {
                setElementDisplay(element, 'none');
            }
        });
    }

    showError(message) {
        this.hideAllStates();
        setElementText(this.elements.errorMessage, message);
        setElementDisplay(this.elements.errorState, 'flex');
    }

    showSuccess(message) {
        setElementText(this.elements.successText, message);
        setElementDisplay(this.elements.successMessage, 'block');
    }

    filterFolders() {
        if (!this.searchTerm) return this.folders;
        
        return this.folders.map(folder => ({
            ...folder,
            files: folder.files.filter(file => 
                file.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                folder.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
        })).filter(folder => folder.files.length > 0);
    }

    renderOverlays() {
        this.hideAllStates();
        
        if (this.folders.length === 0) {
            setElementDisplay(this.elements.instructionsState, 'flex');
            return;
        }
        
        setElementDisplay(this.elements.searchSection, 'block');
        setElementDisplay(this.elements.overlaysContent, 'block');
        
        const filteredFolders = this.filterFolders();
        
        if (filteredFolders.length === 0) {
            this.hideAllStates();
            setElementText(this.elements.emptySubtitle, `No overlays match your search "${this.searchTerm}"`);
            setElementDisplay(this.elements.emptyState, 'flex');
            return;
        }
        
        if (this.elements.overlaysList) {
            this.elements.overlaysList.innerHTML = filteredFolders.map(folder => `
                <div class="overlay-folder">
                    <div class="folder-header">
                        <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                        </svg>
                        <h3 class="folder-name">${folder.name}</h3>
                        <span class="folder-badge">${folder.files.length} file${folder.files.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="files-grid">
                        ${folder.files.map(file => `
                            <div class="file-item" onclick="window.selectOverlay('${file.download_url}')">
                                <div class="file-info">
                                    <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                        <polyline points="14,2 14,8 20,8"/>
                                    </svg>
                                    <div class="file-details">
                                        <p class="file-name">${file.name}</p>
                                        <p class="file-size">${formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <div class="file-actions">
                                    <button class="btn-select" onclick="event.stopPropagation(); window.selectOverlay('${file.download_url}')">
                                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7,10 12,15 17,10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Select
                                    </button>
                                    <button class="btn-preview" onclick="event.stopPropagation(); window.previewOverlayFile('${file.download_url}')" title="Preview in new tab">
                                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.renderOverlays();
    }

    clearSearch() {
        this.searchTerm = '';
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        this.renderOverlays();
    }
}