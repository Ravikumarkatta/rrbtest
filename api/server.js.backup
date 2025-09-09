const express = require('express');
const cors = require('cors');
const testFileService = require('./testFileService');
const testResultService = require('./testResultService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./database');
    const isHealthy = await db.testConnection();
    res.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test Files endpoints
// Add a new test file
app.post('/api/test-files', async (req, res) => {
  try {
    const { fileName, fileJson } = req.body;
    
    if (!fileName || !fileJson) {
      return res.status(400).json({ 
        error: 'fileName and fileJson are required' 
      });
    }

    const result = await testFileService.addTestFile(fileName, fileJson);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add test file error:', error);
    res.status(400).json({ error: error.message });
  }
});

// List test files
app.get('/api/test-files', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const files = await testFileService.listTestFiles(limit, offset);
    const total = await testFileService.getTestFileCount();
    
    res.json({
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('List test files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch a specific test file
app.get('/api/test-files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await testFileService.fetchTestFile(id);
    res.json(file);
  } catch (error) {
    console.error('Fetch test file error:', error);
    const status = error.message === 'Test file not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

// Delete a test file
app.delete('/api/test-files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await testFileService.deleteTestFile(id);
    res.json({ message: 'Test file deleted successfully', file: result });
  } catch (error) {
    console.error('Delete test file error:', error);
    const status = error.message === 'Test file not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

// Rename a test file
app.patch('/api/test-files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const result = await testFileService.renameTestFile(id, fileName);
    res.json(result);
  } catch (error) {
    console.error('Rename test file error:', error);
    const status = error.message === 'Test file not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

// Test Results endpoints
// Save test result
app.post('/api/test-results', async (req, res) => {
  try {
    const { fileId, subject, chapter, score, total, resultJson } = req.body;
    
    if (!fileId || !subject || score === undefined || !total || !resultJson) {
      return res.status(400).json({ 
        error: 'fileId, subject, score, total, and resultJson are required' 
      });
    }

    const result = await testResultService.saveTestResult({
      fileId, subject, chapter, score, total, resultJson
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Save test result error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get test results for a file
app.get('/api/test-files/:fileId/results', async (req, res) => {
  try {
    const { fileId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const results = await testResultService.getResultsByFileId(fileId, limit, offset);
    res.json(results);
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard endpoints
// Get dashboard statistics
app.get('/api/dashboard/statistics', async (req, res) => {
  try {
    const stats = await testResultService.getDashboardStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get results grouped by subject
app.get('/api/dashboard/results-by-subject', async (req, res) => {
  try {
    const results = await testResultService.getResultsBySubjectGrouped();
    res.json(results);
  } catch (error) {
    console.error('Get results by subject error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get results grouped by chapter
app.get('/api/dashboard/results-by-chapter', async (req, res) => {
  try {
    const results = await testResultService.getResultsByChapterGrouped();
    res.json(results);
  } catch (error) {
    console.error('Get results by chapter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent test results
app.get('/api/dashboard/recent-results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const results = await testResultService.getRecentResults(limit);
    res.json(results);
  } catch (error) {
    console.error('Get recent results error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get filtered results
app.get('/api/dashboard/results', async (req, res) => {
  try {
    const { subject, chapter, startDate, endDate, limit = 50, offset = 0 } = req.query;
    const results = await testResultService.getResultsWithFilters({
      subject,
      chapter,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json(results);
  } catch (error) {
    console.error('Get filtered results error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get performance trends
app.get('/api/dashboard/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await testResultService.getPerformanceTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;