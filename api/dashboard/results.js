const testResultService = require('../testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('../utils');

/**
 * Dashboard Filtered Results API endpoint for Vercel serverless function
 * GET /api/dashboard/results - Get filtered results with date range support
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const { 
      subject, 
      chapter, 
      startDate, 
      endDate, 
      limit = '50', 
      offset = '0' 
    } = req.query || {};
    
    const results = await testResultService.getResultsWithFilters({
      subject,
      chapter,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    sendJsonResponse(res, req, results);
  } catch (error) {
    console.error('Get filtered results error:', error);
    sendErrorResponse(res, req, error, 500);
  }
};