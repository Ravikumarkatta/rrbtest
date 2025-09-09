const testFileService = require('../testFileService');
const { validateMethod, sendJsonResponse, sendErrorResponse, parseRequestBody } = require('../utils');

/**
 * Test Files API endpoint for Vercel serverless function
 * GET /api/test-files - List test files with pagination
 * POST /api/test-files - Add new test file
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET', 'POST'])) {
    return;
  }

  try {
    if (req.method === 'GET') {
      // List test files
      const { limit = '50', offset = '0', subject_id, chapter_id, subject, chapter } = req.query || {};
      const filters = { subject_id, chapter_id, subject, chapter };
      const files = await testFileService.listTestFiles(
        parseInt(limit), 
        parseInt(offset),
        filters
      );
      const total = await testFileService.getTestFileCount();
      
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
      const body = await parseRequestBody(req);
      const { fileName, fileJson } = body;
      
      if (!fileName || !fileJson) {
        return sendErrorResponse(res, req, {
          message: 'fileName and fileJson are required'
        }, 400);
      }

      // Allow client to pass subject_id/chapter_id directly in metadata
      if (fileJson && fileJson.metadata) {
        if (fileJson.metadata.subject_id) fileJson.metadata.subject_id = fileJson.metadata.subject_id;
        if (fileJson.metadata.chapter_id) fileJson.metadata.chapter_id = fileJson.metadata.chapter_id;
      }

      const result = await testFileService.addTestFile(fileName, fileJson);
      sendJsonResponse(res, req, result, 201);
    }
  } catch (error) {
    console.error('Test files API error:', error);
    sendErrorResponse(res, req, error, 400);
  }
};