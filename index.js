// Placeholder root entrypoint so `vercel dev` stops complaining about missing entrypoint.
// We rely on /api/* serverless functions. This file can later be removed if Vercel updates behavior.
module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Root placeholder. Try /api/health');
};
