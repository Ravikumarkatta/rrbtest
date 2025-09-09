const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Statistics API endpoint for Vercel serverless function
 * GET /api/dashboard/statistics - Get dashboard statistics
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const stats = await testResultService.getDashboardStatistics();
    sendJsonResponse(res, req, stats);
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};