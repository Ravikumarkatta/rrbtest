const testFileService = require('../testFileService');
const { validateMethod, sendJsonResponse, sendErrorResponse, parseRequestBody } = require('../utils');

/**
 * Individual Test File API endpoint for Vercel serverless function
 * GET /api/test-files/[id] - Fetch specific test file
 * PATCH /api/test-files/[id] - Rename test file
 * DELETE /api/test-files/[id] - Delete test file
 */
module.exports = async function handler(req, res) {
  // Add logging for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? 'Set' : 'Not set'
  });

  // Validate HTTP method
  if (!validateMethod(req, res, ['GET', 'PATCH', 'DELETE'])) {
    return;
  }

  // Extract file ID from query parameters (Vercel provides this)
  const { id } = req.query;
  
  if (!id) {
    console.error('Missing file ID in request');
    return sendErrorResponse(res, req, {
      message: 'File ID is required'
    }, 400);
  }

  console.log(`Processing ${req.method} request for file ID: ${id}`);

  try {
    if (req.method === 'GET') {
      // Fetch specific test file
      console.log('Fetching test file...');
      const file = await testFileService.fetchTestFile(id);
      console.log('File fetched successfully:', file ? 'Found' : 'Not found');
      sendJsonResponse(res, req, file);
    }
    else if (req.method === 'PATCH') {
      // Rename test file
      console.log('Parsing request body for rename...');
      const body = await parseRequestBody(req);
      console.log('Request body parsed:', body);
      const { fileName } = body;
      
      if (!fileName) {
        console.error('Missing fileName in request body');
        return sendErrorResponse(res, req, {
          message: 'fileName is required'
        }, 400);
      }

      console.log(`Renaming file to: ${fileName}`);
      const result = await testFileService.renameTestFile(id, fileName);
      console.log('File renamed successfully');
      sendJsonResponse(res, req, result);
    }
    else if (req.method === 'DELETE') {
      // Delete test file
      console.log('Deleting test file...');
      const result = await testFileService.deleteTestFile(id);
      console.log('File deleted successfully');
      sendJsonResponse(res, req, {
        message: 'Test file deleted successfully',
        file: result
      });
    }
  } catch (error) {
    console.error('Test file API error:', error);
    console.error('Error stack:', error.stack);
    
    // Determine appropriate status code
    let status = 500;
    if (error.message === 'Test file not found') {
      status = 404;
    } else if (error.message.includes('NEON_DATABASE_URL')) {
      status = 503;
    } else if (error.message.includes('Validation failed')) {
      status = 400;
    }
    
    sendErrorResponse(res, req, error, status);
  }
};