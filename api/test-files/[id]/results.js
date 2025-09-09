const testResultService = require('../../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../../utils');

/**
 * Test File Results API endpoint for Vercel serverless function
 * GET /api/test-files/[id]/results - Get test results for a specific file
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  // Extract file ID from query parameters
  const { id: fileId } = req.query;
  
  if (!fileId) {
    return sendErrorResponse(res, req, {
      message: 'File ID is required'
    }, 400);
  }

  try {
    const { limit = '50', offset = '0' } = req.query || {};
    
    const results = await testResultService.getResultsByFileId(
      fileId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    sendJsonResponse(res, req, results);
  } catch (error) {
    console.error('Get test results error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};