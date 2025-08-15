const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  const repoOwner = "PavelGsAlt";
  const repoName = "pavelgsalt.github.io";
  const overlaysUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/Overlays`;

  // Fetch the Overlays folder
  const overlaysResp = await fetch(overlaysUrl, {
    headers: { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
  });
  if (!overlaysResp.ok) {
    return { statusCode: overlaysResp.status, headers, body: overlaysResp.statusText };
  }
  const overlaysFolders = await overlaysResp.json();

  // Fetch PNG files from each subfolder
  let overlayFiles = [];
  for (const folder of overlaysFolders) {
    if (folder.type === "dir") {
      const subResp = await fetch(folder.url, {
        headers: { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
      });
      if (!subResp.ok) continue;
      const files = await subResp.json();
      for (const file of files) {
        if (file.type === "file" && file.name.endsWith(".png")) {
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
};
