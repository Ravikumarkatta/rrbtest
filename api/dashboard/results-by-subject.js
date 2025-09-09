const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Results by Subject API endpoint for Vercel serverless function
 * GET /api/dashboard/results-by-subject - Get results grouped by subject
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const results = await testResultService.getResultsBySubjectGrouped();
    sendJsonResponse(res, req, results);
  } catch (error) {
    console.error('Get results by subject error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};