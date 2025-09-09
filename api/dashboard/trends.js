const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Performance Trends API endpoint for Vercel serverless function
 * GET /api/dashboard/trends - Get performance trends over time
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const { days = '30' } = req.query || {};
    const trends = await testResultService.getPerformanceTrends(parseInt(days));
    sendJsonResponse(res, req, trends);
  } catch (error) {
    console.error('Get performance trends error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};