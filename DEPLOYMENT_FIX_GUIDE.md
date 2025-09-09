# Vercel Deployment Fix Guide

This guide addresses the common deployment issues and provides a step-by-step solution to fix the load and delete function errors.

## Issues Identified

1. **Environment Variables Not Set in Vercel Dashboard**
2. **Database Query Syntax Issues**
3. **Request Body Parsing Errors**
4. **Insufficient Memory/Timeout for Serverless Functions**

## Step-by-Step Fix

### 1. Configure Environment Variables in Vercel Dashboard

The `.env` file is **NOT used in production**. You must set environment variables in the Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environments |
|--------------|--------|--------------|
| `NEON_DATABASE_URL` | `postgresql://neondb_owner:npg_RA6CK9XmoTfE@ep-rapid-voice-a1gewv3h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app,http://localhost:3000` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

**Important**: Replace `your-vercel-app` with your actual Vercel app name.

### 2. Test Environment Variables

After setting the environment variables, test them using the health endpoint:

```bash
# Test health endpoint
curl https://your-vercel-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": {
    "nodeEnv": "production",
    "neonDbUrl": "configured",
    "allowedOrigins": "configured"
  },
  "database": {
    "connected": true,
    "driver": "@neondatabase/serverless"
  }
}
```

### 3. Redeploy After Environment Configuration

After setting environment variables:

1. **Trigger a new deployment** (environment variables only take effect on new deployments)
2. Either:
   - Push a new commit to trigger auto-deployment
   - Or manually redeploy from the Vercel dashboard

### 4. Test File Operations

Test the file operations that were failing:

```bash
# Test listing files
curl https://your-vercel-app.vercel.app/api/test-files

# Test loading a specific file (replace FILE_ID with actual ID)
curl https://your-vercel-app.vercel.app/api/test-files/FILE_ID

# Test deleting a file
curl -X DELETE https://your-vercel-app.vercel.app/api/test-files/FILE_ID
```

## Common Error Messages and Solutions

### Error: "NEON_DATABASE_URL is not set"
- **Cause**: Environment variables not configured in Vercel dashboard
- **Solution**: Follow step 1 above to set environment variables

### Error: "Request timeout" or "Function timeout"
- **Cause**: Insufficient timeout/memory allocation
- **Solution**: Fixed in `vercel.json` with increased memory (256MB) and timeout (30s)

### Error: "Database connection failed"
- **Cause**: Invalid database URL or network issues
- **Solution**: Verify the Neon database URL is correct and database is accessible

### Error: "JSON parsing error"
- **Cause**: Request body parsing issues
- **Solution**: Fixed in `utils.js` with improved request body parsing

## Debugging Tips

1. **Check Function Logs**: In Vercel dashboard → Functions → View logs
2. **Test Health Endpoint**: Always test `/api/health` first
3. **Environment Variables**: Ensure they're set for all environments (Production, Preview, Development)
4. **Database Connectivity**: Test database connection from Neon dashboard

## Updated Configuration

The following files have been updated to fix the issues:

- ✅ `api/database.js` - Improved database connection and error handling
- ✅ `api/utils.js` - Enhanced request body parsing
- ✅ `api/test-files/[id].js` - Added detailed logging and error handling
- ✅ `api/test-files/index.js` - Added detailed logging and error handling
- ✅ `api/health.js` - Enhanced health check with environment validation
- ✅ `vercel.json` - Increased memory and timeout limits

## Verification Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] New deployment triggered after environment setup
- [ ] Health endpoint returns "healthy" status
- [ ] Database connection shows as "connected: true"
- [ ] File listing works (`/api/test-files`)
- [ ] File loading works (`/api/test-files/[id]`)
- [ ] File deletion works (`DELETE /api/test-files/[id]`)

## If Issues Persist

1. Check Vercel function logs for detailed error messages
2. Verify Neon database is accessible and connection string is correct
3. Test locally with `vercel dev` to isolate environment issues
4. Contact support with specific error messages from the logs

## Local Development

For local testing with the same environment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project and pull environment variables
vercel link
vercel env pull .env.local

# Start local development server
vercel dev
```

This ensures local development uses the same environment variables as production.