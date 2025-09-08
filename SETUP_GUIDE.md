# Complete Setup and Deployment Guide

This comprehensive guide covers everything you need to set up the Mock Test application locally and deploy it to Vercel.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Test File Format Guide](#test-file-format-guide)
- [Running the Application Locally](#running-the-application-locally)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [API Usage Examples](#api-usage-examples)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 14.x or higher)
   ```bash
   node --version
   npm --version
   ```

2. **Git** for version control
   ```bash
   git --version
   ```

3. **Neon Database Account**
   - Sign up at [https://neon.tech](https://neon.tech)
   - Create a new project and database

4. **Text Editor** (VS Code recommended)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ravi-katta-dev/mocktest.git
cd mocktest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create Neon Database
1. Log into your [Neon dashboard](https://console.neon.tech)
2. Create a new project
3. Copy your connection string (it looks like):
   ```
   postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require
   ```

#### Initialize Database Schema
1. Navigate to your Neon SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Execute the script to create tables

### 4. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Neon Database Configuration
NEON_DATABASE_URL=postgresql://username:password@your-neon-hostname/dbname?sslmode=require

# API Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,https://your-domain.com

# Database pool configuration
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000
```

## Test File Format Guide

The application supports a structured JSON format for test files. This format ensures optimal database storage and feature support.

### Required Structure

```json
{
  "section": "Physics - Units & Measurements",
  "total_questions": 35,
  "time_limit": 60,
  "target_score": "80%",
  "questions": [
    {
      "id": "q1_units_basic",
      "text": "What is the SI unit of length?",
      "options": ["Meter", "Kilometer", "Centimeter", "Inch"],
      "correct_answer": "Meter",
      "points": 2,
      "category": "Basic Units",
      "difficulty": "easy",
      "time_limit": 30,
      "solution": "The meter is the fundamental SI unit of length."
    }
  ],
  "scoring": {
    "total_points": 70,
    "passing_score": 56,
    "grade_scale": {
      "A": "63-70",
      "B": "56-62",
      "C": "49-55",
      "D": "42-48",
      "F": "0-41"
    }
  },
  "instructions": {
    "time_management": "Allocate time wisely across questions",
    "difficulty_distribution": {
      "easy": "20",
      "medium": "12",
      "hard": "3"
    },
    "category_distribution": {
      "Basic Units": "14",
      "Derived Units": "12",
      "Measurements": "9"
    }
  }
}
```

### Field Descriptions

#### Root Level (Required)
- **section**: Test section/topic name (string)
- **total_questions**: Number of questions (number)
- **time_limit**: Time limit in minutes (number)
- **target_score**: Target score (string or number)
- **questions**: Array of question objects

#### Question Object (Required)
- **id**: Unique question identifier (string)
- **text**: Question text (string)
- **options**: Array of answer choices (array)
- **correct_answer**: Correct answer text (string)
- **points**: Points awarded for correct answer (number)

#### Question Object (Optional)
- **category**: Question category/topic (string)
- **difficulty**: Difficulty level: "easy", "medium", "hard" (string)
- **time_limit**: Question-specific time limit in seconds (number)
- **solution**: Detailed explanation (string)

#### Scoring Object (Optional)
Contains grading information and point distribution.

#### Instructions Object (Optional)
Provides test-taking guidance and distribution information.

### Creating Test Files

1. **Start with the template** above
2. **Modify the section name** to match your topic
3. **Update question count** to match your actual questions
4. **Set appropriate time limit** (recommended: 1-2 minutes per question)
5. **Create your questions** following the required structure
6. **Validate your JSON** using online JSON validators

## Running the Application Locally

### 1. Start the Backend Server

```bash
npm start
```

The API server will start on `http://localhost:3000`

### 2. Start the Frontend

Option A: **Live Server (Recommended)**
1. Install Live Server extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. Frontend will open at `http://127.0.0.1:5500`

Option B: **Simple HTTP Server**
```bash
# Python 3
python -m http.server 8080

# Node.js (if you have http-server)
npx http-server -p 8080
```

### 3. Test the Integration

1. Visit your frontend URL
2. Go to the "Browse Saved Files" tab
3. If you see the file browser interface, the integration is working
4. Test file upload with the cloud save option enabled

## Vercel Deployment

### 1. Prepare for Deployment

Ensure your repository is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select your GitHub repository
# - Choose project settings
```

#### Option B: Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Import Project"
4. Select your repository
5. Configure project settings

### 3. Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NEON_DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/dbname?sslmode=require
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### 4. Deploy

Click "Deploy" or run:
```bash
vercel --prod
```

Your app will be available at `https://your-project-name.vercel.app`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEON_DATABASE_URL` | Your Neon database connection string | `postgresql://user:pass@host/db?sslmode=require` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | API server port | `3000` | `3000` |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` | `https://yourdomain.com` |
| `DB_POOL_SIZE` | Database connection pool size | `10` | `20` |
| `DB_IDLE_TIMEOUT` | Connection idle timeout (ms) | `30000` | `60000` |

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error**: "Error connecting to database"

**Solutions**:
- Verify your `NEON_DATABASE_URL` is correct
- Check that your Neon database is running
- Ensure SSL mode is included: `?sslmode=require`
- Test connection in Neon dashboard

#### 2. CORS Issues
**Error**: "Access to fetch blocked by CORS policy"

**Solutions**:
- Add your frontend URL to `ALLOWED_ORIGINS`
- For local development: `http://localhost:3000,http://127.0.0.1:5500`
- For production: `https://your-domain.vercel.app`

#### 3. File Upload Validation Errors
**Error**: "File validation failed"

**Solutions**:
- Ensure your JSON follows the structured format
- Check that all required fields are present:
  - `section`, `total_questions`, `time_limit`, `questions`
- Validate your JSON syntax
- Ensure question objects have required fields:
  - `id`, `text`, `options`, `correct_answer`, `points`

#### 4. API Endpoint Not Found
**Error**: "404 Not Found for API endpoints"

**Solutions**:
- Verify your backend server is running
- Check the API base URL in your frontend
- Ensure Vercel functions are properly deployed
- Check Vercel function logs in dashboard

#### 5. Build/Deployment Failures
**Error**: "Build failed" or "Function timeout"

**Solutions**:
- Check Node.js version compatibility (use 14.x or higher)
- Verify all dependencies are listed in `package.json`
- Check environment variables are set correctly
- Review Vercel build logs for specific errors

### Getting Help

If you encounter issues:

1. **Check the browser console** for JavaScript errors
2. **Review server logs** for backend issues
3. **Verify environment variables** are set correctly
4. **Test API endpoints** directly using curl or Postman
5. **Check database connectivity** using Neon dashboard

## API Usage Examples

### Using curl

#### Add a test file:
```bash
curl -X POST http://localhost:3000/api/test-files \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "physics-test.json",
    "fileJson": {
      "section": "Physics",
      "total_questions": 10,
      "time_limit": 30,
      "questions": [...]
    }
  }'
```

#### List test files:
```bash
curl http://localhost:3000/api/test-files?limit=10&offset=0
```

#### Get specific test file:
```bash
curl http://localhost:3000/api/test-files/[file-id]
```

### Using JavaScript

```javascript
// Initialize API
const api = new MockTestAPI();

// Upload test file
const fileData = {
  section: "Physics - Units",
  total_questions: 20,
  time_limit: 45,
  questions: [/* your questions */]
};

try {
  const result = await api.addTestFile("physics-test.json", fileData);
  console.log("File uploaded:", result.id);
} catch (error) {
  console.error("Upload failed:", error.message);
}

// Load test file
try {
  const files = await api.listTestFiles();
  console.log("Available files:", files);
} catch (error) {
  console.error("Failed to load files:", error.message);
}
```

## Best Practices

### File Management
- Use descriptive filenames (e.g., "physics-units-chapter1.json")
- Include subject and topic in the section name
- Keep question IDs unique and descriptive
- Set realistic time limits (1-2 minutes per question)

### Database Management
- Regularly backup your Neon database
- Monitor database usage and performance
- Use connection pooling for high-traffic applications
- Keep your database schema up to date

### Security
- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Keep your Neon database credentials secure
- Regularly update dependencies

### Performance
- Use pagination for large file lists
- Optimize question loading for large tests
- Monitor API response times
- Use Vercel's edge functions for better performance

## Next Steps

After successful setup:

1. **Upload your first test file** using the structured format
2. **Take a test** to verify the exam flow works
3. **Check the dashboard** to see your results
4. **Customize the styling** to match your brand
5. **Add more question subjects** and expand your test library

For advanced features and customization, refer to the `IMPLEMENTATION_SUMMARY.md` file.