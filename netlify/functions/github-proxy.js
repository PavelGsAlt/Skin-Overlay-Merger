exports.handler = async (event, context) => {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
  });
  const data = await response.json();
  return { statusCode: 200, body: JSON.stringify(data) };
};
