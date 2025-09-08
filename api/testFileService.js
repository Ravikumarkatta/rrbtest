const { v4: uuidv4 } = require('uuid');
const db = require('./database');

class TestFileService {
  /**
   * Validate test file JSON structure
   */
  validateTestFile(fileJson) {
    const errors = [];

    // Check required top-level properties
    if (!fileJson.metadata) {
      errors.push('Missing required "metadata" property');
    } else {
      const { metadata } = fileJson;
      if (!metadata.title) errors.push('Missing metadata.title');
      if (!metadata.subject) errors.push('Missing metadata.subject');
      if (!metadata.total_questions) errors.push('Missing metadata.total_questions');
      if (!metadata.time_limit) errors.push('Missing metadata.time_limit');
      if (!metadata.target_score) errors.push('Missing metadata.target_score');
    }

    if (!fileJson.questions || !Array.isArray(fileJson.questions)) {
      errors.push('Missing or invalid "questions" array');
    } else if (fileJson.questions.length === 0) {
      errors.push('Questions array cannot be empty');
    }

    // Validate scoring rules if present
    if (fileJson.scoring_rules) {
      const { scoring_rules } = fileJson;
      if (typeof scoring_rules.correct_points !== 'number') {
        errors.push('scoring_rules.correct_points must be a number');
      }
      if (typeof scoring_rules.wrong_points !== 'number') {
        errors.push('scoring_rules.wrong_points must be a number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Add a new test file
   */
  async addTestFile(fileName, fileJson) {
    const validation = this.validateTestFile(fileJson);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const id = uuidv4();
    const query = `
      INSERT INTO test_files (id, file_name, file_json)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [id, fileName, JSON.stringify(fileJson)]);
    return result[0];
  }

  /**
   * List all test files
   */
  async listTestFiles(limit = 50, offset = 0) {
    const query = `
      SELECT id, file_name, uploaded_at, 
             file_json->>'metadata' as metadata,
             jsonb_array_length(file_json->'questions') as question_count
      FROM test_files 
      ORDER BY uploaded_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [limit, offset]);
    return result.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata)
    }));
  }

  /**
   * Fetch a specific test file by ID
   */
  async fetchTestFile(id) {
    const query = `
      SELECT * FROM test_files WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    if (result.length === 0) {
      throw new Error('Test file not found');
    }

    return result[0];
  }

  /**
   * Delete a test file by ID
   */
  async deleteTestFile(id) {
    const query = `
      DELETE FROM test_files WHERE id = $1 RETURNING *
    `;
    
    const result = await db.query(query, [id]);
    if (result.length === 0) {
      throw new Error('Test file not found');
    }

    return result[0];
  }

  /**
   * Rename a test file
   */
  async renameTestFile(id, newFileName) {
    const query = `
      UPDATE test_files 
      SET file_name = $2, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [id, newFileName]);
    if (result.length === 0) {
      throw new Error('Test file not found');
    }

    return result[0];
  }

  /**
   * Get test file count
   */
  async getTestFileCount() {
    const query = 'SELECT COUNT(*) as count FROM test_files';
    const result = await db.query(query);
    return parseInt(result[0].count);
  }
}

module.exports = new TestFileService();