const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Recent Results API endpoint for Vercel serverless function
 * GET /api/dashboard/recent-results - Get recent test results
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const { limit = '20' } = req.query || {};
    const results = await testResultService.getRecentResults(parseInt(limit));
    sendJsonResponse(res, req, results);
  } catch (error) {
    console.error('Get recent results error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};