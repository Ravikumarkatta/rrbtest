// Simple debug endpoint to confirm serverless functions are active
module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    message: 'Serverless functions responding',
    url: req.url,
    time: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'unset'
  });
};
