const db = require('./database');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('./utils');

/**
 * Health check endpoint for Vercel serverless function
 * GET /api/health
 */
module.exports = async function handler(req, res) {
  console.log('Health check requested');
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? 'Set' : 'Not set',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'Not set'
  });

  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const isHealthy = await db.testConnection();
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        neonDbUrl: process.env.NEON_DATABASE_URL ? 'configured' : 'missing',
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 'configured' : 'missing'
      },
      database: {
        connected: isHealthy,
        driver: '@neondatabase/serverless'
      }
    };

    console.log('Health check result:', healthData);
    sendJsonResponse(res, req, healthData);
  } catch (error) {
    console.error('Health check error:', error);
    sendErrorResponse(res, req, {
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
};