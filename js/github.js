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

    async fetchRepositoryContents(repoUrl) {
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            this.showError(MESSAGES.invalidRepoUrl);
            return;
        }

        this.setLoading(true);
        console.log('Fetching repository contents for:', parsed);

        try {
            // First, check if Overlays folder exists
            const overlaysUrl = `${CONFIG.GITHUB_API_BASE}/${parsed.owner}/${parsed.repo}/contents/Overlays`;
            console.log('Fetching from:', overlaysUrl);
            
            const overlaysResponse = await fetch(overlaysUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': CONFIG.GITHUB_USER_AGENT
                },
                cache: 'no-cache'
            });
            
            console.log('Response status:', overlaysResponse.status);
            
            if (!overlaysResponse.ok) {
                if (overlaysResponse.status === 404) {
                    throw new Error(MESSAGES.overlaysFolderNotFound);
                } else if (overlaysResponse.status === 403) {
                    const rateLimitReset = overlaysResponse.headers.get('x-ratelimit-reset');
                    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
                    throw new Error(MESSAGES.rateLimitExceeded(resetTime));
                } else {
                    throw new Error(MESSAGES.githubApiError(overlaysResponse.status, overlaysResponse.statusText));
                }
            }

            const overlaysData = await overlaysResponse.json();
            console.log('Overlays data received:', overlaysData);
            
            if (!Array.isArray(overlaysData)) {
                console.error('Unexpected response format:', overlaysData);
                throw new Error(MESSAGES.unexpectedResponse);
            }

            // Filter for directories only
            const overlayFolders = overlaysData.filter(item => item.type === 'dir');
            console.log('Found overlay folders:', overlayFolders.length);
            
            if (overlayFolders.length === 0) {
                throw new Error(MESSAGES.noOverlayFolders);
            }

            // Fetch contents of each overlay folder
            const folderPromises = overlayFolders.map(async (folder) => {
                try {
                    const folderUrl = `${CONFIG.GITHUB_API_BASE}/${parsed.owner}/${parsed.repo}/contents/Overlays/${encodeURIComponent(folder.name)}`;
                    console.log('Fetching folder:', folder.name, folderUrl);
                    
                    const folderResponse = await fetch(folderUrl, {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': CONFIG.GITHUB_USER_AGENT
                        },
                        cache: 'no-cache'
                    });
                    
                    if (!folderResponse.ok) {
                        console.warn(`Failed to fetch contents of folder: ${folder.name} (${folderResponse.status})`);
                        return null;
                    }
                    
                    const folderData = await folderResponse.json();
                    console.log(`Folder ${folder.name} contains ${folderData.length} items`);
                    
                    if (!Array.isArray(folderData)) {
                        console.warn(`Unexpected data format for folder: ${folder.name}`, folderData);
                        return null;
                    }
                    
                    // Filter for PNG files only and ensure they have download URLs
                    const pngFiles = folderData.filter(file => 
                        file.type === 'file' && 
                        file.name.toLowerCase().endsWith('.png') &&
                        file.download_url &&
                        file.size > 0 // Ensure file is not empty
                    );
                    
                    console.log(`Found ${pngFiles.length} PNG files in ${folder.name}:`, pngFiles.map(f => f.name));
                    
                    return {
                        name: folder.name,
                        files: pngFiles
                    };
                } catch (err) {
                    console.error(`Error fetching folder ${folder.name}:`, err);
                    return null;
                }
            });

            console.log('Fetching all folder contents...');
            const folderResults = await Promise.all(folderPromises);
            const validFolders = folderResults.filter(folder => 
                folder !== null && folder.files.length > 0
            );

            console.log('Valid folders with files:', validFolders.length);

            if (validFolders.length === 0) {
                throw new Error(MESSAGES.noPngFiles);
            }

            this.folders = validFolders;
            this.renderOverlays();
            this.showSuccess(MESSAGES.githubSuccess(
                validFolders.length, 
                validFolders.reduce((sum, f) => sum + f.files.length, 0)
            ));
            
            console.log('Successfully loaded', validFolders.length, 'folders with overlays');
            
        } catch (err) {
            console.error('Fetch error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository contents';
            this.showError(errorMessage);
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