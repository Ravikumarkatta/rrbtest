# Neon Database Integration Setup Guide

This guide explains how to set up and deploy the Mock Test application with Neon PostgreSQL database integration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [API Documentation](#api-documentation)
- [Deployment Options](#deployment-options)
- [Enhanced Test File Format](#enhanced-test-file-format)

## Prerequisites

1. **Neon Account**: Sign up at [https://neon.tech](https://neon.tech)
2. **Node.js**: Version 14+ installed
3. **Git**: For version control
4. **Text Editor**: VS Code or similar

## Database Setup

### 1. Create Neon Database

1. Log into your Neon dashboard
2. Create a new project
3. Note down your connection string (it looks like):
   ```
   postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require
   ```

### 2. Run Database Migration

1. Copy the connection string from your Neon dashboard
2. Run the schema script in your Neon SQL Editor:
   ```sql
   -- Copy and paste the contents of database/schema.sql
   ```
   
   Or using psql:
   ```bash
   psql "postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require" -f database/schema.sql
   ```

### 3. Verify Tables

Check that tables were created successfully:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('test_files', 'test_results');
```

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Configure Variables

Edit `.env` with your actual values:
```env
# Neon Database Configuration
NEON_DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require

# API Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,https://your-domain.com

# Optional: Database pool configuration
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000
```

### 3. Security Notes

- **Never commit `.env` to version control**
- Use strong, unique passwords
- Restrict database access to specific IPs when possible
- Enable SSL mode (required by Neon)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

### 3. Test Database Connection

Visit `http://localhost:3000/api/health` to verify the database connection.

### 4. Test with Frontend

1. Open `index.html` in a web browser
2. The frontend will connect to your local API server
3. Test file upload/download functionality

## API Documentation

### Test Files Endpoints

#### Add Test File
```http
POST /api/test-files
Content-Type: application/json

{
  "fileName": "physics-unit-1.json",
  "fileJson": {
    "metadata": { ... },
    "questions": [ ... ]
  }
}
```

#### List Test Files
```http
GET /api/test-files?limit=10&offset=0
```

#### Fetch Test File
```http
GET /api/test-files/:id
```

#### Delete Test File
```http
DELETE /api/test-files/:id
```

#### Rename Test File
```http
PATCH /api/test-files/:id
Content-Type: application/json

{
  "fileName": "new-name.json"
}
```

### Test Results Endpoints

#### Save Test Result
```http
POST /api/test-results
Content-Type: application/json

{
  "fileId": "uuid",
  "subject": "Physics",
  "chapter": "Units and Measurements",
  "score": 85,
  "total": 100,
  "resultJson": {
    "answers": [...],
    "timeSpent": [...],
    "performance": {...}
  }
}
```

#### Get Results for File
```http
GET /api/test-files/:fileId/results?limit=10&offset=0
```

### Health Check
```http
GET /api/health
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel dashboard

### Option 2: Netlify

1. **Create `netlify.toml`**:
   ```toml
   [build]
     functions = "api"
     
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Create function files** in `netlify/functions/`

3. **Deploy** via Netlify dashboard or CLI

### Option 3: Railway

1. **Create `railway.json`**:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start"
     }
   }
   ```

2. **Connect** your GitHub repository to Railway

3. **Set environment variables** in Railway dashboard

### Option 4: Heroku

1. **Create `Procfile`**:
   ```
   web: npm start
   ```

2. **Deploy**:
   ```bash
   git push heroku main
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NEON_DATABASE_URL="your-connection-string"
   ```

## Enhanced Test File Format

The new enhanced format supports additional metadata and configuration:

### Complete Format Structure

```json
{
  "metadata": {
    "title": "Test Title",
    "description": "Test Description",
    "subject": "Physics",
    "chapter": "Units and Measurements",
    "section": "Unit 1: Physical World and Measurement",
    "total_questions": 30,
    "time_limit": 45,
    "target_score": 75,
    "created": "2024-01-15T10:30:00.000Z",
    "version": "1.0",
    "author": "Author Name",
    "difficulty_level": "medium",
    "instructions": {
      "time_management": "Spend no more than 1.5 minutes per question",
      "distribution": "Questions are ordered from easy to hard",
      "tips": ["Read carefully", "Use elimination", "Review marked"]
    }
  },
  "scoring_rules": {
    "correct_points": 4,
    "wrong_points": -1,
    "unanswered_points": 0,
    "negative_marking": true,
    "passing_percentage": 60
  },
  "grade_scale": {
    "A+": {"min": 90, "max": 100},
    "A": {"min": 80, "max": 89},
    "B+": {"min": 70, "max": 79},
    "B": {"min": 60, "max": 69},
    "C": {"min": 50, "max": 59},
    "F": {"min": 0, "max": 49}
  },
  "questions": [
    {
      "id": "units_001",
      "text": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "points": 4,
      "category": "Category Name",
      "difficulty": "easy",
      "time_limit": 30,
      "solution": "Detailed explanation here.",
      "pyq_year": "RRB ALP 2018"
    }
  ]
}
```

### Backward Compatibility

The system supports both:
- **Legacy format**: Just `{"questions": [...]}`
- **Enhanced format**: Full structure with metadata

### Migration from Legacy Format

To convert existing test files:
1. Use the `EnhancedQuestionManager.exportToEnhancedJSON()` method
2. Or manually add metadata wrapper around existing questions array

## Troubleshooting

### Common Issues

1. **Database connection fails**:
   - Check your `NEON_DATABASE_URL` format
   - Ensure SSL mode is enabled
   - Verify network connectivity

2. **CORS errors in browser**:
   - Add your domain to `ALLOWED_ORIGINS`
   - Ensure API server is running

3. **File validation errors**:
   - Check JSON format using a validator
   - Ensure required fields are present
   - Use example files as reference

4. **Deployment issues**:
   - Set all environment variables
   - Check build logs for errors
   - Verify function paths and configurations

### Getting Help

1. Check the API health endpoint: `/api/health`
2. Review server logs for error messages
3. Test with example files first
4. Validate JSON format before upload

## Performance Considerations

- **Database indexing**: Indexes are created for common query patterns
- **Connection pooling**: Configured for optimal performance
- **JSON storage**: JSONB provides efficient querying of JSON data
- **Pagination**: Implemented for large result sets

## Security Best Practices

1. **Environment variables**: Never hardcode sensitive data
2. **Input validation**: All inputs are validated server-side
3. **SQL injection**: Parameterized queries prevent injection
4. **CORS**: Configure allowed origins appropriately
5. **HTTPS**: Always use HTTPS in production
6. **Database access**: Restrict to necessary permissions only