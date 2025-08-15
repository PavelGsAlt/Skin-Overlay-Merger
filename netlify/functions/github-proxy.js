const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://pavelgsalt.github.io', // restrict to your site (use '*' only for testing)
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    const repoOwner = "PavelGsAlt";
    const repoName = "pavelgsalt.github.io";
    const overlaysUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/Overlays`;

    // Fetch the Overlays folder
    const overlaysResp = await fetch(overlaysUrl, {
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!overlaysResp.ok) {
      const text = await overlaysResp.text();
      return {
        statusCode: overlaysResp.status,
        headers,
        body: JSON.stringify({ error: overlaysResp.statusText, details: text })
      };
    }

    const overlaysFolders = await overlaysResp.json();

    // Collect PNG files from subfolders
    const overlayFiles = [];
    for (const folder of overlaysFolders) {
      if (folder.type === "dir" && folder.url) {
        const subResp = await fetch(folder.url, {
          headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3+json"
          }
        });
        if (!subResp.ok) continue;
        const files = await subResp.json();
        for (const file of files) {
          if (file.type === "file" && file.name.toLowerCase().endsWith(".png")) {
            overlayFiles.push({
              name: `${folder.name}/${file.name}`,
              url: file.download_url,
              size: file.size
            });
          }
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(overlayFiles)
    };
  } catch (err) {
    console.error('github-proxy error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
