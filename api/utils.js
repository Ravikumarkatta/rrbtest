/**
 * Utility functions for Vercel serverless functions
 */

/**
 * Add CORS headers to response
 */
function addCorsHeaders(res, req) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://127.0.0.1:5500',
    'https://rrbtest.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Handle preflight OPTIONS requests
 */
function handleOptions(req, res) {
  addCorsHeaders(res, req);
  res.status(200).end();
}

/**
 * Send JSON response with proper headers
 */
function sendJsonResponse(res, req, data, status = 200) {
  addCorsHeaders(res, req);
  res.status(status).json(data);
}

/**
 * Send error response with proper headers
 */
function sendErrorResponse(res, req, error, status = 500) {
  addCorsHeaders(res, req);
  console.error('API Error:', error);
  
  const errorMessage = error.message || 'Internal server error';
  res.status(status).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
}

/**
 * Validate HTTP method
 */
function validateMethod(req, res, allowedMethods) {
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return false;
  }
  
  if (!allowedMethods.includes(req.method)) {
    sendErrorResponse(res, req, new Error(`Method ${req.method} not allowed`), 405);
    return false;
  }
  
  return true;
}

/**
 * Parse request body for POST/PATCH requests
 */
async function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      resolve({});
      return;
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        resolve({});
      }
    });
  });
}

module.exports = {
  addCorsHeaders,
  handleOptions,
  sendJsonResponse,
  sendErrorResponse,
  validateMethod,
  parseRequestBody
};