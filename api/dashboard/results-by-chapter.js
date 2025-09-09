const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Results by Chapter API endpoint for Vercel serverless function
 * GET /api/dashboard/results-by-chapter - Get results grouped by chapter
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const results = await testResultService.getResultsByChapterGrouped();
    sendJsonResponse(res, req, results);
  } catch (error) {
    console.error('Get results by chapter error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};