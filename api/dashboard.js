const testResultService = require('./testResultService');
const { validateMethod, sendJsonResponse, sendErrorResponse } = require('./utils');

/**
 * Unified Dashboard API endpoint for Vercel serverless function
 * Consolidates all dashboard endpoints to stay within Vercel's 12-function limit
 * 
 * Supported operations via query parameter ?action=:
 * - statistics: Get dashboard statistics
 * - trends: Get performance trends over time
 * - results: Get filtered results with date range support
 * - results-by-subject: Get results grouped by subject
 * - results-by-chapter: Get results grouped by chapter
 * - recent-results: Get recent test results
 */
module.exports = async function handler(req, res) {
  // Validate HTTP method
  if (!validateMethod(req, res, ['GET'])) {
    return;
  }

  try {
    const { action, ...params } = req.query || {};

    if (!action) {
      return sendErrorResponse(res, req, new Error('Missing required parameter: action'), 400);
    }

    let result;

    switch (action) {
      case 'statistics':
        result = await testResultService.getDashboardStatistics();
        break;

      case 'trends':
        const days = parseInt(params.days) || 30;
        result = await testResultService.getPerformanceTrends(days);
        break;

      case 'results':
        const { subject, chapter, startDate, endDate, limit, offset } = params;
        result = await testResultService.getFilteredResults({
          subject,
          chapter,
          startDate,
          endDate,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined
        });
        break;

      case 'results-by-subject':
        const subjectFilters = {
          subject: params.subject,
          chapter: params.chapter,
          startDate: params.startDate,
          endDate: params.endDate
        };
        result = await testResultService.getResultsBySubject(subjectFilters);
        break;

      case 'results-by-chapter':
        const chapterFilters = {
          subject: params.subject,
          chapter: params.chapter,
          startDate: params.startDate,
          endDate: params.endDate
        };
        result = await testResultService.getResultsByChapter(chapterFilters);
        break;

      case 'recent-results':
        const resultLimit = parseInt(params.limit) || 20;
        result = await testResultService.getRecentResults(resultLimit);
        break;

      default:
        return sendErrorResponse(res, req, new Error(`Unknown action: ${action}`), 400);
    }

    sendJsonResponse(res, req, result);
  } catch (error) {
    console.error(`Dashboard ${req.query?.action || 'unknown'} error:`, error);
    sendErrorResponse(res, req, error, 500);
  }
};