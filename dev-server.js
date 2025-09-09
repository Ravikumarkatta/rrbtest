// Load .env into process.env for local development
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (e) {
  // dotenv may not be installed in some environments; ignore if missing
}

const path = require('path');
const http = require('http');
const fs = require('fs');

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  if (req.url.startsWith('/api/')) {
    // Parse URL to extract pathname and query parameters
    const host = req.headers.host || 'localhost';
    const urlObj = new URL(req.url, `http://${host}`);
    const pathname = urlObj.pathname; // e.g. /api/test-files or /api/test-files/123
    const apiPath = pathname.replace(/^\/api\//, ''); // remove leading /api/

    // Build candidate handler paths in order of preference:
    // 1) api/<path>.js
    // 2) api/<path>/index.js
    // 3) api/<firstSegment>/[id].js when path is like <first>/<param>
    const candidates = [];
    candidates.push(path.join(__dirname, 'api', apiPath + '.js'));
    candidates.push(path.join(__dirname, 'api', apiPath, 'index.js'));

    const parts = apiPath.split('/').filter(Boolean);
    if (parts.length === 2) {
      // map /api/foo/123 -> api/foo/[id].js
      candidates.push(path.join(__dirname, 'api', parts[0], '[id].js'));
    }

    // Attach parsed query object to req (simple string values)
    req.query = {};
    for (const [k, v] of urlObj.searchParams.entries()) {
      req.query[k] = v;
    }

    try {
      let handlerPath = null;
      // Debug: list candidates and whether they exist
      // (helps when running inside Codespaces / different working directories)
      for (const cand of candidates) {
        const exists = fs.existsSync(cand);
        console.log('API candidate:', cand, 'exists=', exists);
        if (exists) {
          handlerPath = cand;
          break;
        }
      }

      if (!handlerPath) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `API endpoint not found: ${apiPath}` }));
        return;
      }

      // If mapping to a dynamic [id].js handler, populate req.query.id
      if (handlerPath.endsWith(path.join('api', parts[0], '[id].js')) && parts.length === 2) {
        req.query.id = parts[1];
      }

      delete require.cache[require.resolve(handlerPath)];
      const handler = require(handlerPath);

      // Add Vercel-compatible methods to response object
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };

      // Invoke handler
      if (typeof handler === 'function') {
        await handler(req, res);
      } else if (handler.default && typeof handler.default === 'function') {
        await handler.default(req, res);
      } else {
        throw new Error('Handler is not a function');
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    // Serve static files from public/
    const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      };
      
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📡 API endpoints available at /api/*');
  console.log('📁 Static files served from /public/*');
});
