import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Folder, File, Download, Search, Github, AlertCircle, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { jsx } from 'react/jsx-runtime';

interface GitHubFile {
  name: string;
  path: string;
  download_url: string | null;
  type: 'file' | 'dir';
  size: number;
}

interface GitHubFolder {
  name: string;
  files: GitHubFile[];
}

interface GitHubOverlayBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOverlay: (overlayUrl: string) => void;
}

/**
 * A component that displays a dialog containing a browser for GitHub overlays.
 * 
 * @param {GitHubOverlayBrowserProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the dialog is open or not.
 * @param {() => void} props.onClose - A function to close the dialog.
 * @param {(overlayUrl: string) => void} props.onSelectOverlay - A function to be called when an overlay is selected.
 */
const GitHubOverlayBrowser: React.FC<GitHubOverlayBrowserProps> = ({
  isOpen,
  onClose,
  onSelectOverlay: propOnSelectOverlay,
}) => {

   return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      {/* Your dialog content here */}
    </Dialog>
  );
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/PavelGsAlt/pavelgsalt.github.io');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [folders, setFolders] = useState<GitHubFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSelectOverlay = (file: GitHubFile) => {
    if (!file.download_url) {
      console.error('No download URL for file:', file);
      return;
    }
    
    console.log('Selecting overlay:', file.name, file.download_url);
    propOnSelectOverlay(file.download_url); // Call the onSelectOverlay prop
  };

  // ...
};

const GitHubOverlayBrowserComp = ({
  isOpen,
  onClose,
  onSelectOverlay,
}) => {

  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/PavelGsAlt/pavelgsalt.github.io');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [folders, setFolders] = useState<GitHubFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Parse GitHub URL to get API endpoint
  const parseGitHubUrl = (url: string) => {
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
  };

  // Fetch repository contents with better error handling
  const fetchRepositoryContents = async () => {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError('Invalid GitHub repository URL. Please use format: https://github.com/owner/repo');
      return;
    }

    setLoading(true);
    setError('');
    setFolders([]);
    console.log('Fetching repository contents for:', parsed);

    try {
      // First, check if Overlays folder exists
      const overlaysUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/Overlays`;
      console.log('Fetching from:', overlaysUrl);
      
      const overlaysResponse = await fetch(overlaysUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MinecraftSkinOverlayMerger/1.0'
        },
        // Add cache control
        cache: 'no-cache'
      });
      
      console.log('Response status:', overlaysResponse.status);
      console.log('Response headers:', Object.fromEntries(overlaysResponse.headers.entries()));
      
      if (!overlaysResponse.ok) {
        if (overlaysResponse.status === 404) {
          throw new Error('Overlays folder not found in repository. Make sure the repository has an "Overlays" folder in the root.');
        } else if (overlaysResponse.status === 403) {
          const rateLimitReset = overlaysResponse.headers.get('x-ratelimit-reset');
          const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
          throw new Error(`GitHub API rate limit exceeded. ${resetTime ? `Try again after ${resetTime.toLocaleTimeString()}.` : 'Please try again later.'}`);
        } else {
          throw new Error(`GitHub API error: ${overlaysResponse.status} ${overlaysResponse.statusText}`);
        }
      }

      const overlaysData = await overlaysResponse.json();
      console.log('Overlays data received:', overlaysData);
      
      if (!Array.isArray(overlaysData)) {
        console.error('Unexpected response format:', overlaysData);
        throw new Error('Unexpected response format from GitHub API');
      }

      // Filter for directories only
      const overlayFolders = overlaysData.filter((item: GitHubFile) => item.type === 'dir');
      console.log('Found overlay folders:', overlayFolders.length);
      
      if (overlayFolders.length === 0) {
        throw new Error('No overlay folders found in /Overlays directory. Create subfolders in /Overlays with PNG files.');
      }

      // Fetch contents of each overlay folder with better error handling
      const folderPromises = overlayFolders.map(async (folder: GitHubFile) => {
        try {
          const folderUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/Overlays/${encodeURIComponent(folder.name)}`;
          console.log('Fetching folder:', folder.name, folderUrl);
          
          const folderResponse = await fetch(folderUrl, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'MinecraftSkinOverlayMerger/1.0'
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
          const pngFiles = folderData.filter((file: GitHubFile) => 
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
      const validFolders = folderResults.filter((folder): folder is GitHubFolder => 
        folder !== null && folder.files.length > 0
      );

      console.log('Valid folders with files:', validFolders.length);

      if (validFolders.length === 0) {
        throw new Error('No PNG files found in overlay folders. Make sure your overlay folders contain PNG files.');
      }

      setFolders(validFolders);
      console.log('Successfully loaded', validFolders.length, 'folders with overlays');
      
    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository contents';
      setError(errorMessage);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter folders and files based on search term
  const filteredFolders = folders.map(folder => ({
    ...folder,
    files: folder.files.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(folder => folder.files.length > 0);

  // Handle overlay selection with better error handling
  const handleSelectOverlay = (file: GitHubFile) => {
    if (!file.download_url) {
      console.error('No download URL for file:', file);
      return;
    }
    
    console.log('Selecting overlay:', file.name, file.download_url);
    onSelectOverlay(file.download_url);
  };

  // Preview overlay in new tab
  const previewOverlay = (file: GitHubFile) => {
    if (file.download_url) {
      window.open(file.download_url, '_blank');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Auto-fetch when dialog opens with default repo
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setError('');
      // Auto-fetch the default repository
      if (repoUrl === 'https://github.com/PavelGsAlt/pavelgsalt.github.io') {
        console.log('Auto-fetching default repository');
        fetchRepositoryContents();
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white text-xl">
            <Github className="w-6 h-6 text-cyan-400" />
            Browse GitHub Overlays
          </DialogTitle>
          <p className="text-slate-400 text-sm">
            Browse and select overlay files from GitHub repositories
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Repository URL Input */}
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchRepositoryContents();
                  }
                }}
              />
              <Button 
                onClick={fetchRepositoryContents}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-24"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Fetch
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Repository must have an "Overlays" folder with subfolders containing PNG files
            </p>
          </Card>

          {/* Search */}
          {folders.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search overlays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-red-900/20 border-red-700/50 p-4">
              <div className="flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error fetching repository</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchRepositoryContents}
                    className="mt-3 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-white">Fetching overlays from repository...</p>
                <p className="text-slate-400 text-sm">This may take a moment</p>
              </div>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32 bg-slate-700" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-20 bg-slate-700" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Overlay Folders */}
          {!loading && filteredFolders.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {filteredFolders.map((folder) => (
                <Card key={folder.name} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Folder className="w-6 h-6 text-cyan-400" />
                      <h3 className="font-semibold text-white text-lg">{folder.name}</h3>
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {folder.files.map((file) => (
                        <Card 
                          key={file.path}
                          className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 p-3 hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-200 cursor-pointer group hover:scale-105"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate group-hover:text-emerald-300 transition-colors">
                                  {file.name}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {formatFileSize(file.size)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSelectOverlay(file)}
                                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 text-xs h-7"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Select
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewOverlay(file)}
                                className="text-slate-400 hover:text-white hover:bg-white/10 text-xs h-7 px-2"
                                title="Preview in new tab"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredFolders.length === 0 && folders.length > 0 && (
            <Card className="bg-white/5 border-white/10 p-8 text-center">
              <div className="text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-lg">No overlays found</p>
                <p className="text-sm">No overlays match your search "{searchTerm}"</p>
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-cyan-300 hover:text-cyan-200"
                >
                  Clear search
                </Button>
              </div>
            </Card>
          )}

          {/* Instructions */}
          {!loading && folders.length === 0 && !error && (
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 p-6">
              <div className="text-center space-y-4">
                <Github className="w-16 h-16 mx-auto text-cyan-400" />
                <h3 className="font-semibold text-white text-xl">How to use GitHub Overlay Browser</h3>
                <div className="text-slate-300 space-y-3 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                    <p>Enter a GitHub repository URL that contains Minecraft skin overlays</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                    <p>Repository must have an "Overlays" folder in the root directory</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                    <p>Each subfolder in "Overlays" represents a category (e.g., "Hats", "Accessories")</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                    <p>PNG files in subfolders will be available for selection</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mt-6">
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Example structure:</strong><br />
                    repository/Overlays/Hats/cool_hat.png<br />
                    repository/Overlays/Accessories/glasses.png
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Success message */}
          {!loading && !error && folders.length > 0 && (
            <div className="text-center text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              ✅ Successfully loaded {folders.length} overlay categor{folders.length === 1 ? 'y' : 'ies'} with {folders.reduce((sum, f) => sum + f.files.length, 0)} overlay file{folders.reduce((sum, f) => sum + f.files.length, 0) === 1 ? '' : 's'}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <p className="text-xs text-slate-500">
            Default repository loaded • Browse community overlays or add your own repository
          </p>
          <Button variant="outline" onClick={onClose} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}