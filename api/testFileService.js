const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const fs = require('fs');
const path = require('path');

const LOCAL_TEST_FILES = path.join(__dirname, '..', 'data', 'local_test_files.json');

function readLocalFiles() {
  try {
    if (!fs.existsSync(LOCAL_TEST_FILES)) return [];
    const raw = fs.readFileSync(LOCAL_TEST_FILES, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.warn('Failed to read local test files:', err.message);
    return [];
  }
}

function writeLocalFiles(list) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_TEST_FILES), { recursive: true });
    fs.writeFileSync(LOCAL_TEST_FILES, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('Failed to write local test files:', err.message);
    return false;
  }
}

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
    // Allow either legacy 'section' or new metadata.subject
    if (!fileJson.section) {
      if (fileJson.metadata?.subject) {
        fileJson.section = fileJson.metadata.subject; // backfill for uniformity
      }
    }
    if (!fileJson.section || typeof fileJson.section !== 'string') {
      errors.push('Missing or invalid required "section" (or metadata.subject) property (must be string)');
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
    // Normalize subject/chapter if provided at root metadata from frontend selectors
    let subjectId = null;
    let chapterId = null;
    if (fileJson && fileJson.metadata) {
      if (fileJson.metadata.subject && !fileJson.section) {
        fileJson.section = fileJson.metadata.subject; // ensure section set for existing queries
      }
      if (fileJson.metadata.chapter) {
        fileJson.chapter = fileJson.metadata.chapter; // optional convenience
      }
    }

    const validation = this.validateTestFile(fileJson);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const id = uuidv4();

    // If no real DB configured, persist to local JSON file for dev
    if (!process.env.NEON_DATABASE_URL) {
      const list = readLocalFiles();
      const entry = {
        id,
        file_name: fileName,
        uploaded_at: new Date().toISOString(),
        file_json: fileJson,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      list.unshift(entry);
      writeLocalFiles(list);
      return entry;
    }

    // When NEON is configured, try to find or create subject/chapter rows and store their UUIDs
    try {
      // Check if subjects table exists first
      let tablesExist = false;
      try {
        await db.query(`SELECT 1 FROM subjects LIMIT 1`);
        tablesExist = true;
      } catch (tableErr) {
        console.warn('Subjects/chapters tables do not exist yet. Storing without normalized references.');
        tablesExist = false;
      }

      if (tablesExist) {
        // Subject upsert (find or create by name, case-insensitive)
        if (fileJson?.metadata?.subject) {
          const subjName = String(fileJson.metadata.subject).trim();
          if (subjName) {
            try {
              const found = await db.query(`SELECT id FROM subjects WHERE lower(name) = lower($1) LIMIT 1`, [subjName]);
              if (found && found.length > 0) {
                subjectId = found[0].id;
              } else {
                const slug = subjName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const ins = await db.query(`INSERT INTO subjects (id, name, slug, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id`, [subjName, slug]);
                subjectId = ins[0].id;
              }
            } catch (subjErr) {
              console.warn('Subject upsert failed:', subjErr.message);
            }
          }
        }

        // Chapter upsert under subject
        if (fileJson?.metadata?.chapter && subjectId) {
          const chapName = String(fileJson.metadata.chapter).trim();
          if (chapName) {
            try {
              const foundC = await db.query(`SELECT id FROM chapters WHERE subject_id = $1 AND lower(name) = lower($2) LIMIT 1`, [subjectId, chapName]);
              if (foundC && foundC.length > 0) {
                chapterId = foundC[0].id;
              } else {
                const slug = chapName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const insC = await db.query(`INSERT INTO chapters (id, subject_id, name, slug, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING id`, [subjectId, chapName, slug]);
                chapterId = insC[0].id;
              }
            } catch (chapErr) {
              console.warn('Chapter upsert failed:', chapErr.message);
            }
          }
        }
      }

      const query = `
        INSERT INTO test_files (id, file_name, subject_id, chapter_id, file_json)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [id, fileName, subjectId, chapterId, JSON.stringify(fileJson)]);
      return result[0];
    } catch (err) {
      // If anything goes wrong with DB upsert, surface the error
      throw err;
    }
  }

  /**
   * List all test files
   */
  async listTestFiles(limit = 50, offset = 0, filters = {}) {
    // Filters may include: subject_id, chapter_id, subject (name), chapter (name)
    const where = [];
    const params = [];

    if (filters.subject_id) {
      params.push(filters.subject_id);
      where.push(`subject_id = $${params.length}`);
    } else if (filters.subject) {
      params.push(String(filters.subject).toLowerCase());
      // Use safer query that doesn't fail if subjects table doesn't exist
      where.push(`lower(file_json->>'section') = $${params.length}`);
    }

    if (filters.chapter_id) {
      params.push(filters.chapter_id);
      where.push(`chapter_id = $${params.length}`);
    } else if (filters.chapter) {
      params.push(String(filters.chapter).toLowerCase());
      // Use safer query that doesn't fail if chapters table doesn't exist
      where.push(`lower(file_json->>'chapter') = $${params.length}`);
    }

    // Build base query
    let query = `
      SELECT id, file_name, uploaded_at, subject_id, chapter_id,
             file_json->>'section' as section,
             file_json->>'chapter' as chapter,
             file_json->>'total_questions' as total_questions,
             file_json->>'time_limit' as time_limit,
             file_json->>'target_score' as target_score,
             jsonb_array_length(file_json->'questions') as question_count
      FROM test_files`
    ;

    if (where.length) {
      query += '\n WHERE ' + where.join(' AND ');
    }

    query += `\n ORDER BY uploaded_at DESC`;

    // Append limit/offset params
    params.push(limit, offset);
    query += `\n LIMIT $${params.length - 1} OFFSET $${params.length}`;

    // Local fallback
    if (!process.env.NEON_DATABASE_URL) {
      const list = readLocalFiles();
      const slice = list.slice(offset, offset + limit).map(row => ({
        id: row.id,
        file_name: row.file_name,
        uploaded_at: row.uploaded_at,
        section: (row.file_json && (row.file_json.section || row.file_json.metadata?.subject)) || '',
        chapter: row.file_json?.chapter || '',
        subject_id: row.subject_id || null,
        chapter_id: row.chapter_id || null,
        total_questions: (row.file_json && row.file_json.total_questions) || (row.file_json && (row.file_json.questions && row.file_json.questions.length)) || 0,
        time_limit: (row.file_json && row.file_json.time_limit) || 0,
        question_count: (row.file_json && row.file_json.questions && row.file_json.questions.length) || 0,
        file_json: row.file_json
      }));
      return slice;
    }

    const result = await db.query(query, params);
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
    // Local fallback
    if (!process.env.NEON_DATABASE_URL) {
      const list = readLocalFiles();
      const found = list.find(f => f.id === id);
      if (!found) throw new Error('Test file not found');
      return found;
    }

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
    // Local fallback
    if (!process.env.NEON_DATABASE_URL) {
      const list = readLocalFiles();
      const idx = list.findIndex(f => f.id === id);
      if (idx === -1) throw new Error('Test file not found');
      const removed = list.splice(idx, 1)[0];
      writeLocalFiles(list);
      return removed;
    }

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