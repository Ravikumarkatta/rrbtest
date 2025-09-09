const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse, parseRequestBody } = require('../utils');

/**
 * Test Results API endpoint for Vercel serverless function
 * POST /api/test-results - Save test result
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['POST'])) {
    return;
  }

  try {
    const body = await parseRequestBody(req);
    const { fileId, subject, chapter, score, total, resultJson } = body;
    
    if (!fileId || !subject || score === undefined || !total || !resultJson) {
      return sendErrorResponse(res, req, {
        message: 'fileId, subject, score, total, and resultJson are required'
      }, 400);
    }

    const result = await testResultService.saveTestResult({
      fileId, subject, chapter, score, total, resultJson
    });
    
    sendJsonResponse(res, req, result, 201);
  } catch (error) {
    console.error('Save test result error:', error);
    sendErrorResponse(res, req, error, 400);
  }
};