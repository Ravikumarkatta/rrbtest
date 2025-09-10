# Vercel Deployment Fix Guide

This guide addresses the common deployment issues and provides a step-by-step solution to fix the load and delete function errors.

## 🚨 Critical Issue: Environment Variable Secret Reference Error

**Error Message**: `Environment Variable "NEON_DATABASE_URL" references Secret "NEON_DATABASE_URL", which does not exist.`

**Root Cause**: The `vercel.json` file was incorrectly configured to use Vercel Secrets (with `@` prefix) instead of regular environment variables.

## ✅ Issues Fixed

1. **Removed Secret References from vercel.json** - Environment variables now work with standard dashboard configuration
2. **Database Query Syntax Issues** - Fixed parameterized query handling
3. **Request Body Parsing Errors** - Enhanced error handling
4. **Insufficient Memory/Timeout for Serverless Functions** - Increased limits

## Step-by-Step Fix

### 1. Configure Environment Variables in Vercel Dashboard

**IMPORTANT**: The `.env` file is **NOT used in production**. You must set environment variables in the Vercel dashboard:

#### Method 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard: `https://vercel.com/your-username/your-project-name`
2. Navigate to **Settings → Environment Variables**
3. Click **"Add New"** for each variable below:

| Variable Name | Value | Environments |
|--------------|--------|--------------|
| `NEON_DATABASE_URL` | `postgresql://neondb_owner:npg_RA6CK9XmoTfE@ep-rapid-voice-a1gewv3h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | ✅ Production, ✅ Preview, ✅ Development |
| `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app,http://localhost:3000` | ✅ Production, ✅ Preview, ✅ Development |
| `NODE_ENV` | `production` | ✅ Production only |

**Important**: 
- Replace `your-vercel-app` with your actual Vercel app name
- Make sure to check all three environments (Production, Preview, Development) for the first two variables
- Only set `NODE_ENV` for Production environment

#### Method 2: Using Vercel CLI (Alternative)

```bash
# Set environment variables using CLI
vercel env add NEON_DATABASE_URL
# When prompted, paste: postgresql://neondb_owner:npg_RA6CK9XmoTfE@ep-rapid-voice-a1gewv3h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
# Select: Production, Preview, Development

vercel env add ALLOWED_ORIGINS  
# When prompted, paste: https://your-vercel-app.vercel.app,http://localhost:3000
# Select: Production, Preview, Development

vercel env add NODE_ENV
# When prompted, paste: production
# Select: Production only
```

### 2. 🔄 Mandatory Redeploy After Environment Configuration

**CRITICAL**: Environment variables only take effect on new deployments. After setting the environment variables:

1. **Option A: Trigger Auto-Deployment (Recommended)**
   ```bash
   # Make a small change and push to trigger deployment
   git add .
   git commit -m "Update environment configuration"
   git push
   ```

2. **Option B: Manual Redeploy from Dashboard**
   - Go to your Vercel project dashboard
   - Navigate to **Deployments** tab  
   - Click **"Redeploy"** on the latest deployment
   - Select **"Use existing Build Cache"** and click **"Redeploy"**

3. **Option C: Force Redeploy via CLI**
   ```bash
   vercel --prod
   ```

### 3. Test Environment Configuration

After redeployment, test the environment variables using the health endpoint:

```bash
# Test health endpoint
curl https://your-vercel-app.vercel.app/api/health
```

**OR use the automated verification script:**

```bash
# Run the verification script
node scripts/verify-deployment.js
# Enter your Vercel app URL when prompted
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

### 4. Redeploy After Environment Configuration

⚠️ **This section is now covered above in step 2**

### 5. Test File Operations

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

### ❌ Error: "Environment Variable 'NEON_DATABASE_URL' references Secret 'NEON_DATABASE_URL', which does not exist"
- **Cause**: The `vercel.json` was incorrectly configured to use Vercel Secrets (with `@` prefix)
- **Solution**: ✅ **FIXED** - Updated `vercel.json` to remove secret references. Environment variables now work with standard dashboard configuration.

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