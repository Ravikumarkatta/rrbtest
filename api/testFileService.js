const { v4: uuidv4 } = require('uuid');
const db = require('./database');

class TestFileService {
  /**
   * Validate test file JSON structure according to specification:
   * {
   *   "section": "Section name",
   *   "total_questions": 35,
   *   "time_limit": 60,
   *   "target_score": "80%",
   *   "questions": [...],
   *   "scoring": {...},
   *   "instructions": {...}
   * }
   */
  validateTestFile(fileJson) {
    const errors = [];

    // Check required top-level properties
    if (!fileJson.section || typeof fileJson.section !== 'string') {
      errors.push('Missing or invalid required "section" property (must be string)');
    }

    if (!fileJson.total_questions || typeof fileJson.total_questions !== 'number' || fileJson.total_questions <= 0) {
      errors.push('Missing or invalid "total_questions" property (must be positive number)');
    }

    if (!fileJson.time_limit || typeof fileJson.time_limit !== 'number' || fileJson.time_limit <= 0) {
      errors.push('Missing or invalid "time_limit" property (must be positive number)');
    }

    if (!fileJson.target_score) {
      errors.push('Missing required "target_score" property');
    }

    if (!fileJson.questions || !Array.isArray(fileJson.questions)) {
      errors.push('Missing or invalid "questions" array');
    } else if (fileJson.questions.length === 0) {
      errors.push('Questions array cannot be empty');
    } else {
      // Validate questions structure
      fileJson.questions.forEach((question, index) => {
        if (!question.id) errors.push(`Question ${index + 1}: missing "id" property`);
        if (!question.text) errors.push(`Question ${index + 1}: missing "text" property`);
        if (!question.options || !Array.isArray(question.options)) {
          errors.push(`Question ${index + 1}: missing or invalid "options" array`);
        }
        if (!question.correct_answer) errors.push(`Question ${index + 1}: missing "correct_answer" property`);
        if (question.points === undefined || typeof question.points !== 'number') {
          errors.push(`Question ${index + 1}: missing or invalid "points" property (must be number)`);
        }
      });
    }

    // Validate scoring structure if present
    if (fileJson.scoring) {
      const { scoring } = fileJson;
      if (typeof scoring.total_points !== 'number') {
        errors.push('scoring.total_points must be a number');
      }
      if (typeof scoring.passing_score !== 'number') {
        errors.push('scoring.passing_score must be a number');
      }
      if (scoring.grade_scale && typeof scoring.grade_scale !== 'object') {
        errors.push('scoring.grade_scale must be an object');
      }
    }

    // Validate instructions structure if present
    if (fileJson.instructions) {
      const { instructions } = fileJson;
      if (instructions.difficulty_distribution && typeof instructions.difficulty_distribution !== 'object') {
        errors.push('instructions.difficulty_distribution must be an object');
      }
      if (instructions.category_distribution && typeof instructions.category_distribution !== 'object') {
        errors.push('instructions.category_distribution must be an object');
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
             file_json->>'section' as section,
             file_json->>'total_questions' as total_questions,
             file_json->>'time_limit' as time_limit,
             file_json->>'target_score' as target_score,
             jsonb_array_length(file_json->'questions') as question_count
      FROM test_files 
      ORDER BY uploaded_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [limit, offset]);
    return result.map(row => ({
      ...row,
      total_questions: parseInt(row.total_questions) || 0,
      time_limit: parseInt(row.time_limit) || 0
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