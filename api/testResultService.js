const { v4: uuidv4 } = require('uuid');
const db = require('./database');

class TestResultService {
  /**
   * Save a test result
   */
  async saveTestResult({ fileId, subject, chapter, score, total, resultJson }) {
    // Validate input
    if (score < 0 || total <= 0 || score > total) {
      throw new Error('Invalid score or total values');
    }

    const id = uuidv4();
    const query = `
      INSERT INTO test_results (id, file_id, subject, chapter, score, total, result_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      id, fileId, subject, chapter || null, score, total, JSON.stringify(resultJson)
    ]);
    
    return result[0];
  }

  /**
   * Get test results by file ID
   */
  async getResultsByFileId(fileId, limit = 50, offset = 0) {
    const query = `
      SELECT tr.*, tf.file_name
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      WHERE tr.file_id = $1
      ORDER BY tr.date_taken DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [fileId, limit, offset]);
    return result;
  }

  /**
   * Get test results by subject (flexible)
   * - If subject is a string: returns raw attempts for that subject (original behavior)
   * - If subject is an object (filters): returns grouped-by-subject metrics with optional filters (what /api/dashboard expects)
   */
  async getResultsBySubject(subject, limit = 50, offset = 0) {
    // Case 1: Backward-compatible raw results for a subject string
    if (typeof subject === 'string') {
      const query = `
        SELECT tr.*, tf.file_name
        FROM test_results tr
        JOIN test_files tf ON tr.file_id = tf.id
        WHERE tr.subject = $1
        ORDER BY tr.date_taken DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await db.query(query, [subject, limit, offset]);
      return result;
    }

    // Case 2: Filters object for aggregated, grouped-by-subject data
    const filters = subject || {};
    const { whereSQL, params } = this._buildWhereClause(filters, 'tr');

    const query = `
      SELECT 
        tr.subject,
        COUNT(*) as attempts,
        AVG(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as average_percentage,
        MAX(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as best_percentage,
        MIN(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as lowest_percentage,
        tf.file_json->>'section' as section_name
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      ${whereSQL}
      GROUP BY tr.subject, tf.file_json->>'section'
      ORDER BY tr.subject
    `;

    return db.query(query, params);
  }

  /**
   * Get result statistics for a file
   */
  async getFileStatistics(fileId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        AVG(CAST(score AS FLOAT) / CAST(total AS FLOAT) * 100) as average_percentage
      FROM test_results
      WHERE file_id = $1
    `;
    
    const result = await db.query(query, [fileId]);
    return result[0];
  }

  /**
   * Delete a test result
   */
  async deleteTestResult(id) {
    const query = `
      DELETE FROM test_results WHERE id = $1 RETURNING *
    `;
    
    const result = await db.query(query, [id]);
    if (result.length === 0) {
      throw new Error('Test result not found');
    }

    return result[0];
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        AVG(CAST(score AS FLOAT) / CAST(total AS FLOAT) * 100) as average_percentage,
        MAX(CAST(score AS FLOAT) / CAST(total AS FLOAT) * 100) as best_percentage,
        MIN(CAST(score AS FLOAT) / CAST(total AS FLOAT) * 100) as lowest_percentage,
        COUNT(DISTINCT file_id) as unique_tests_taken,
        COUNT(DISTINCT subject) as unique_subjects
      FROM test_results
    `;
    
    const result = await db.query(query);
    return result[0];
  }

  /**
   * Get results grouped by subject (no filters)
   */
  async getResultsBySubjectGrouped() {
    const query = `
      SELECT 
        tr.subject,
        COUNT(*) as attempts,
        AVG(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as average_percentage,
        MAX(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as best_percentage,
        MIN(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as lowest_percentage,
        tf.file_json->>'section' as section_name
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      GROUP BY tr.subject, tf.file_json->>'section'
      ORDER BY tr.subject
    `;
    
    const result = await db.query(query);
    return result;
  }

  /**
   * Get results grouped by chapter (no filters)
   */
  async getResultsByChapterGrouped() {
    const query = `
      SELECT 
        tr.subject,
        tr.chapter,
        COUNT(*) as attempts,
        AVG(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as average_percentage,
        MAX(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as best_percentage,
        MIN(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as lowest_percentage,
        tf.file_json->>'section' as section_name
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      WHERE tr.chapter IS NOT NULL
      GROUP BY tr.subject, tr.chapter, tf.file_json->>'section'
      ORDER BY tr.subject, tr.chapter
    `;
    
    const result = await db.query(query);
    return result;
  }

  /**
   * NEW: Get results grouped by chapter WITH optional filters
   * Matches /api/dashboard?action=results-by-chapter
   * Accepts filters: { subject?, chapter?, startDate?, endDate? }
   */
  async getResultsByChapter(filters = {}) {
    const { whereSQL, params } = this._buildWhereClause(filters, 'tr', { requireChapter: true });

    const query = `
      SELECT 
        tr.subject,
        tr.chapter,
        COUNT(*) as attempts,
        AVG(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as average_percentage,
        MAX(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as best_percentage,
        MIN(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as lowest_percentage,
        tf.file_json->>'section' as section_name
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      ${whereSQL}
      GROUP BY tr.subject, tr.chapter, tf.file_json->>'section'
      ORDER BY tr.subject, tr.chapter
    `;

    return db.query(query, params);
  }

  /**
   * Get recent test results with file information
   */
  async getRecentResults(limit = 20) {
    const query = `
      SELECT 
        tr.*,
        tf.file_name,
        tf.file_json->>'section' as section_name,
        CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100 as percentage
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      ORDER BY tr.date_taken DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result;
  }

  /**
   * Get results with date range filtering (raw rows)
   */
  async getResultsWithFilters({ subject, chapter, startDate, endDate, limit = 50, offset = 0 }) {
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (subject) {
      whereConditions.push(`tr.subject = $${paramIndex}`);
      params.push(subject);
      paramIndex++;
    }

    if (chapter) {
      whereConditions.push(`tr.chapter = $${paramIndex}`);
      params.push(chapter);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`tr.date_taken >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`tr.date_taken <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        tr.*,
        tf.file_name,
        tf.file_json->>'section' as section_name,
        CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100 as percentage
      FROM test_results tr
      JOIN test_files tf ON tr.file_id = tf.id
      ${whereClause}
      ORDER BY tr.date_taken DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const result = await db.query(query, params);
    return result;
  }

  /**
   * NEW: Alias to match /api/dashboard?action=results
   * Delegates to getResultsWithFilters
   */
  async getFilteredResults(filters) {
    return this.getResultsWithFilters(filters || {});
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(days = 30) {
    const query = `
      SELECT 
        DATE(tr.date_taken) as test_date,
        COUNT(*) as attempts,
        AVG(CAST(tr.score AS FLOAT) / CAST(tr.total AS FLOAT) * 100) as average_percentage
      FROM test_results tr
      WHERE tr.date_taken >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(tr.date_taken)
      ORDER BY test_date
    `;
    
    const result = await db.query(query);
    return result;
  }

  /**
   * Internal helper: build WHERE clause and params for filters
   * filters: { subject?, chapter?, startDate?, endDate? }
   * opts: { requireChapter?: boolean }
   */
  _buildWhereClause(filters = {}, alias = 'tr', opts = {}) {
    const where = [];
    const params = [];
    let i = 1;

    if (opts.requireChapter) {
      where.push(`${alias}.chapter IS NOT NULL`);
    }

    if (filters.subject) {
      where.push(`${alias}.subject = $${i++}`);
      params.push(filters.subject);
    }
    if (filters.chapter) {
      where.push(`${alias}.chapter = $${i++}`);
      params.push(filters.chapter);
    }
    if (filters.startDate) {
      where.push(`${alias}.date_taken >= $${i++}`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      where.push(`${alias}.date_taken <= $${i++}`);
      params.push(filters.endDate);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    return { whereSQL, params };
  }
}

module.exports = new TestResultService();
