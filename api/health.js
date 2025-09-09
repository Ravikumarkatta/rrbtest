const db = require('./database');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('./utils');

/**
 * Health check endpoint for Vercel serverless function
 * GET /api/health
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const isHealthy = await db.testConnection();
    
    sendJsonResponse(res, req, {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    sendErrorResponse(res, req, {
      message: 'Health check failed',
      error: error.message
    }, 500);
  }
};