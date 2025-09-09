const testFileService = require('../testFileService');
const { validateMethod, sendJsonResponse, sendErrorResponse, parseRequestBody } = require('../utils');

/**
 * Individual Test File API endpoint for Vercel serverless function
 * GET /api/test-files/[id] - Fetch specific test file
 * PATCH /api/test-files/[id] - Rename test file
 * DELETE /api/test-files/[id] - Delete test file
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET', 'PATCH', 'DELETE'])) {
    return;
  }

  // Extract file ID from query parameters (Vercel provides this)
  const { id } = req.query;
  
  if (!id) {
    return sendErrorResponse(res, req, {
      message: 'File ID is required'
    }, 400);
  }

  try {
    if (req.method === 'GET') {
      // Fetch specific test file
      const file = await testFileService.fetchTestFile(id);
      sendJsonResponse(res, req, file);
    }
    else if (req.method === 'PATCH') {
      // Rename test file
      const body = await parseRequestBody(req);
      const { fileName } = body;
      
      if (!fileName) {
        return sendErrorResponse(res, req, {
          message: 'fileName is required'
        }, 400);
      }

      const result = await testFileService.renameTestFile(id, fileName);
      sendJsonResponse(res, req, result);
    }
    else if (req.method === 'DELETE') {
      // Delete test file
      const result = await testFileService.deleteTestFile(id);
      sendJsonResponse(res, req, {
        message: 'Test file deleted successfully',
        file: result
      });
    }
  } catch (error) {
    console.error('Test file API error:', error);
    const status = error.message === 'Test file not found' ? 404 : 500;
    sendErrorResponse(res, req, error, status);
  }
};