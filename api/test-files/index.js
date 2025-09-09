const testFileService = require('../testFileService');
const { validateMethod, sendJsonResponse, sendErrorResponse, parseRequestBody } = require('../utils');

/**
 * Test Files API endpoint for Vercel serverless function
 * GET /api/test-files - List test files with pagination
 * POST /api/test-files - Add new test file
 */
module.exports = async function handler(req, res) {
  // Add logging for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? 'Set' : 'Not set'
  });

  // Validate HTTP method
  if (!validateMethod(req, res, ['GET', 'POST'])) {
    return;
  }

  try {
    if (req.method === 'GET') {
      // List test files
      console.log('Listing test files...');
      const { limit = '50', offset = '0', subject_id, chapter_id, subject, chapter } = req.query || {};
      const filters = { subject_id, chapter_id, subject, chapter };
      
      console.log('Query parameters:', { limit, offset, filters });
      
      const files = await testFileService.listTestFiles(
        parseInt(limit), 
        parseInt(offset),
        filters
      );
      
      const total = await testFileService.getTestFileCount();
      
      console.log(`Found ${files.length} files, total: ${total}`);
      
      sendJsonResponse(res, req, {
        files,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      });
    } 
    else if (req.method === 'POST') {
      // Add new test file
      console.log('Adding new test file...');
      const body = await parseRequestBody(req);
      console.log('Request body parsed:', body ? 'Success' : 'Failed');
      
      const { fileName, fileJson } = body;
      
      if (!fileName || !fileJson) {
        console.error('Missing required fields:', { fileName: !!fileName, fileJson: !!fileJson });
        return sendErrorResponse(res, req, {
          message: 'fileName and fileJson are required'
        }, 400);
      }

      console.log(`Creating file: ${fileName}`);

      // Allow client to pass subject_id/chapter_id directly in metadata
      if (fileJson && fileJson.metadata) {
        if (fileJson.metadata.subject_id) fileJson.metadata.subject_id = fileJson.metadata.subject_id;
        if (fileJson.metadata.chapter_id) fileJson.metadata.chapter_id = fileJson.metadata.chapter_id;
      }

      const result = await testFileService.addTestFile(fileName, fileJson);
      console.log('File created successfully');
      sendJsonResponse(res, req, result, 201);
    }
  } catch (error) {
    console.error('Test files API error:', error);
    console.error('Error stack:', error.stack);
    
    // Determine appropriate status code
    let status = 500;
    if (error.message.includes('NEON_DATABASE_URL')) {
      status = 503;
    } else if (error.message.includes('Validation failed')) {
      status = 400;
    }
    
    sendErrorResponse(res, req, error, status);
  }
};