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
   * Get test results by subject
   */
  async getResultsBySubject(subject, limit = 50, offset = 0) {
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
}

module.exports = new TestResultService();