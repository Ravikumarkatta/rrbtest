# Vercel Serverless Functions Deployment Guide

This guide covers the complete setup and deployment process for the Mock Test application using Vercel serverless functions with Neon PostgreSQL database.

## 🏗️ Architecture Overview

The application has been converted from Express.js to Vercel serverless functions for improved scalability and performance:

```
/api/
├── health.js                         (GET /api/health)
├── utils.js                          (Shared utilities)
├── database.js                       (Neon connection)
├── testFileService.js                (Business logic)
├── testResultService.js              (Business logic)
├── test-files/
│   ├── index.js                      (GET/POST /api/test-files)
│   ├── [id].js                       (GET/PATCH/DELETE /api/test-files/[id])
│   └── [id]/
│       └── results.js                (GET /api/test-files/[id]/results)
├── test-results/
│   └── index.js                      (POST /api/test-results)
└── dashboard/
    ├── statistics.js                 (GET /api/dashboard/statistics)
    ├── results-by-subject.js         (GET /api/dashboard/results-by-subject)
    ├── results-by-chapter.js         (GET /api/dashboard/results-by-chapter)
    ├── recent-results.js             (GET /api/dashboard/recent-results)
    ├── results.js                    (GET /api/dashboard/results)
    └── trends.js                     (GET /api/dashboard/trends)
```

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm install -g vercel`
- Neon PostgreSQL database account
- Git repository access

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd mocktest
npm install
```

### 2. Environment Variables

Create a `.env.local` file for local development:

```env
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,https://your-domain.vercel.app
```

### 3. Local Development

Start the development server:

```bash
npm run dev
# or
vercel dev
```

This starts Vercel's local development server that simulates the serverless environment.

### 4. Test API Endpoints

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "development"
}
```

## 🌐 Vercel Deployment

### 1. Connect to Vercel

```bash
vercel login
vercel link
```

### 2. Configure Environment Variables

In the Vercel dashboard or using CLI:

```bash
vercel env add NEON_DATABASE_URL
vercel env add ALLOWED_ORIGINS
vercel env add NODE_ENV
```

Set these values:
- `NEON_DATABASE_URL`: Your complete Neon PostgreSQL connection string
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (include your Vercel domain)
- `NODE_ENV`: `production`

### 3. Deploy

```bash
npm run deploy
# or
vercel --prod
```

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEON_DATABASE_URL` | Complete Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `https://app.vercel.app,http://localhost:3000` |
| `NODE_ENV` | Environment mode | `production` or `development` |

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Database health status

### Test Files Management
- **GET** `/api/test-files` - List test files (with pagination)
- **POST** `/api/test-files` - Upload new test file
- **GET** `/api/test-files/[id]` - Fetch specific test file
- **PATCH** `/api/test-files/[id]` - Rename test file
- **DELETE** `/api/test-files/[id]` - Delete test file
- **GET** `/api/test-files/[id]/results` - Get results for specific file

### Test Results
- **POST** `/api/test-results` - Save test results

### Dashboard Analytics
- **GET** `/api/dashboard/statistics` - Overall statistics
- **GET** `/api/dashboard/results-by-subject` - Subject-grouped results
- **GET** `/api/dashboard/results-by-chapter` - Chapter-grouped results
- **GET** `/api/dashboard/recent-results` - Recent test attempts
- **GET** `/api/dashboard/results` - Filtered results
- **GET** `/api/dashboard/trends` - Performance trends

## 🧪 Testing

### Local Testing with Vercel Dev

1. Start the development server:
```bash
vercel dev
```

2. Test endpoints with curl or Postman:
```bash
# Health check
curl http://localhost:3000/api/health

# List test files
curl http://localhost:3000/api/test-files

# Upload test file
curl -X POST http://localhost:3000/api/test-files \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.json","fileJson":{"section":"Math","total_questions":10,...}}'
```

### Testing with Frontend

The frontend automatically detects and connects to the serverless API. No changes needed on the frontend side.

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your domain is in `ALLOWED_ORIGINS`
   - Check that environment variables are set correctly

2. **Database Connection Errors**
   - Verify `NEON_DATABASE_URL` is correctly formatted
   - Check Neon database is running and accessible

3. **Function Timeout**
   - Vercel functions have a 10-second execution limit on free tier
   - Consider optimizing database queries for large datasets

4. **Environment Variables Not Working**
   - Environment variables must be set in Vercel dashboard
   - Redeploy after changing environment variables

### Debug Mode

Enable verbose logging by setting `DEBUG=1` in environment variables.

## 📝 File Structure Details

### Core Files

- `api/utils.js` - Shared utilities for CORS, error handling, and request parsing
- `api/database.js` - Optimized Neon connection with lazy initialization
- `vercel.json` - Vercel configuration for serverless deployment

### Function Files

Each API endpoint is a separate serverless function that:
- Handles HTTP methods validation
- Includes proper CORS headers
- Provides comprehensive error handling
- Uses shared business logic from service files

## 🔐 Security

- Environment variables stored securely in Vercel
- SQL injection protection through parameterized queries
- CORS protection with origin validation
- Input validation and sanitization

## 📊 Performance

- **Cold Start**: ~100-300ms for Neon connection
- **Warm Execution**: ~10-50ms for simple queries
- **Database Pool**: Neon handles connection pooling automatically
- **Caching**: Static files cached at CDN level

## 🔄 Migration from Express.js

Key changes made during conversion:

1. **Removed Express.js dependency** - Direct Node.js req/res handling
2. **File-based routing** - Each endpoint is a separate function
3. **Lazy database initialization** - Optimized for serverless cold starts
4. **Shared utilities** - Common CORS and error handling logic
5. **Environment variable security** - Moved secrets to Vercel dashboard

## 📞 Support

For issues or questions:
1. Check Vercel function logs in dashboard
2. Verify environment variables are set
3. Test database connection independently
4. Review CORS configuration for frontend integration

This serverless architecture provides better scalability, reduced costs, and improved performance compared to traditional server deployments.

## ♻️ Local Development Scripts (Updated)

To avoid the recursive invocation error (`vercel dev` calling itself), the `package.json` scripts were adjusted:

```
"scripts": {
   "dev": "node scripts/local-preview.js",       # Static front-end preview only
   "api:dev": "vercel dev",                     # Run serverless functions locally
   "start": "node scripts/local-preview.js",    # Same as dev
   "deploy": "vercel --prod"
}
```

Usage:

1. Frontend static preview (no API emulation):
    ```bash
    npm run dev
    # Opens index.html via a lightweight static server (default port 5173)
    ```
2. Full stack (frontend + API functions): run two terminals:
    ```bash
    npm run api:dev   # Terminal 1 - launches Vercel serverless environment on port 3000
    npm run dev       # Terminal 2 - static preview (if you need separate static hosting)
    ```
    Frontend JS should call `/api/...` which is handled by the Vercel dev server (port 3000). If opening index.html directly from Vercel dev, you can also skip the static preview server.

Notes:
* Do NOT create an npm script that calls `vercel dev` and then have Vercel itself configured to run that script; that causes recursion.
* If you prefer, you can remove the static preview and just run `vercel dev` directly (it will also serve static assets).
* The error `Function Runtimes must have a valid version` is resolved by ensuring `vercel.json` has:
   ```json
   {
      "version": 2,
      "functions": { "api/**/*.js": { "runtime": "nodejs18.x" } }
   }
   ```

Troubleshooting checklist for local dev:
1. Delete local link data if things act oddly: `rm -rf .vercel` then `vercel link`.
2. Confirm only one place invokes `vercel dev` (direct terminal or a single npm script).
3. Verify Node version >= 18 (`node -v`).
4. Ensure environment variables exist in `.env.local` (Vercel CLI loads them if configured) or set them manually when testing APIs.

### Static Asset Strategy (Option A Chosen)
The project now uses a dedicated `public/` directory for all static assets (HTML, CSS, JS, component partials). We removed the legacy root `index.html` placeholder and root `index.js` so Vercel will always serve `public/index.html` via the route rule:

```
"routes": [
   { "src": "/api/(.*)", "dest": "/api/$1" },
   { "src": "/(.*)", "dest": "/public/$1" }
]
```

API functions live under `api/` and are built with `@vercel/node`. Static files are handled by `@vercel/static`.

If you ever migrate to a framework (Next.js, SvelteKit, etc.), remove the `builds` + `routes` block and adopt that framework's defaults.
