const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins for better compatibility
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const repoOwner = "PavelGsAlt";
    const repoName = "pavelgsalt.github.io";
    const overlaysUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/Overlays`;

    console.log('Fetching overlays from:', overlaysUrl);

    // Prepare headers for GitHub API
    const githubHeaders = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "MinecraftSkinOverlayMerger/1.0"
    };

    // Add GitHub token if available (optional)
    if (process.env.GITHUB_TOKEN) {
      githubHeaders["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch the Overlays folder
    const overlaysResp = await fetch(overlaysUrl, {
      headers: githubHeaders,
      timeout: 10000 // 10 second timeout
    });

    if (!overlaysResp.ok) {
      const errorText = await overlaysResp.text();
      console.error('GitHub API error:', overlaysResp.status, errorText);
      
      if (overlaysResp.status === 404) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Overlays folder not found',
            message: 'The repository does not contain an "Overlays" folder in the root directory.'
          })
        };
      }
      
      if (overlaysResp.status === 403) {
        const rateLimitReset = overlaysResp.headers.get('x-ratelimit-reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `GitHub API rate limit exceeded. ${resetTime ? `Try again after ${resetTime.toLocaleTimeString()}.` : 'Please try again later.'}`
          })
        };
      }
      
      return {
        statusCode: overlaysResp.status,
        headers,
        body: JSON.stringify({ 
          error: overlaysResp.statusText, 
          details: errorText,
          message: 'Failed to fetch data from GitHub API'
        })
      };
    }

    const overlaysFolders = await overlaysResp.json();
    console.log('Found overlay folders:', overlaysFolders.length);

    if (!Array.isArray(overlaysFolders)) {
      console.error('Unexpected response format:', overlaysFolders);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Unexpected response format',
          message: 'GitHub API returned an unexpected response format'
        })
      };
    }

    // Collect PNG files from subfolders
    const overlayFiles = [];
    const folderPromises = [];

    for (const folder of overlaysFolders) {
      if (folder.type === "dir" && folder.url) {
        folderPromises.push(
          fetch(folder.url, {
            headers: githubHeaders,
            timeout: 10000
          })
          .then(async (subResp) => {
            if (!subResp.ok) {
              console.warn(`Failed to fetch folder ${folder.name}:`, subResp.status);
              return [];
            }
            
            const files = await subResp.json();
            if (!Array.isArray(files)) {
              console.warn(`Invalid folder content for ${folder.name}`);
              return [];
            }
            
            return files
              .filter(file => 
                file.type === "file" && 
                file.name.toLowerCase().endsWith(".png") &&
                file.download_url &&
                file.size > 0
              )
              .map(file => ({
                name: `${folder.name}/${file.name}`,
                url: file.download_url,
                size: file.size,
                folder: folder.name,
                filename: file.name
              }));
          })
          .catch(err => {
            console.warn(`Error fetching folder ${folder.name}:`, err.message);
            return [];
          })
        );
      }
    }

    // Wait for all folder requests to complete
    const folderResults = await Promise.all(folderPromises);
    
    // Flatten the results
    folderResults.forEach(files => {
      overlayFiles.push(...files);
    });

    console.log('Total overlay files found:', overlayFiles.length);

    if (overlayFiles.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'No overlay files found',
          message: 'No PNG files were found in the overlay folders. Make sure your overlay folders contain PNG files.'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        overlays: overlayFiles,
        total: overlayFiles.length,
        folders: [...new Set(overlayFiles.map(f => f.folder))],
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (err) {
    console.error('github-proxy error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing the request',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      })
    };
  }
};
