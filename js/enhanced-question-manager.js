// Enhanced Question Manager for Test File Management
// Supports both legacy format and new enhanced format with metadata

class EnhancedQuestionManager {
  constructor() {
    this.questions = [];
    this.metadata = {};
    this.scoringRules = {};
    this.gradeScale = {};
    this.schema = this.getEnhancedQuestionSchema();
  }

  // Enhanced schema supporting both legacy and new format
  getEnhancedQuestionSchema() {
    return {
      type: 'object',
      properties: {
        // Enhanced metadata (optional for backward compatibility)
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            subject: { type: 'string', minLength: 1 },
            chapter: { type: 'string' },
            section: { type: 'string' },
            total_questions: { type: 'number', minimum: 1 },
            time_limit: { type: 'number', minimum: 1 },
            target_score: { type: 'number', minimum: 0 },
            created: { type: 'string' },
            version: { type: 'string' },
            author: { type: 'string' },
            difficulty_level: { 
              type: 'string', 
              enum: ['easy', 'medium', 'hard', 'mixed'] 
            },
            instructions: {
              type: 'object',
              properties: {
                time_management: { type: 'string' },
                distribution: { type: 'string' },
                tips: { 
                  type: 'array', 
                  items: { type: 'string' } 
                }
              }
            }
          }
        },
        // Scoring rules (optional)
        scoring_rules: {
          type: 'object',
          properties: {
            correct_points: { type: 'number' },
            wrong_points: { type: 'number' },
            unanswered_points: { type: 'number', default: 0 },
            negative_marking: { type: 'boolean', default: false },
            passing_percentage: { type: 'number', minimum: 0, maximum: 100 }
          }
        },
        // Grade scale (optional)
        grade_scale: {
          type: 'object',
          patternProperties: {
            "^[A-F][+]?$": {
              type: 'object',
              properties: {
                min: { type: 'number', minimum: 0, maximum: 100 },
                max: { type: 'number', minimum: 0, maximum: 100 }
              },
              required: ['min', 'max']
            }
          }
        },
        // Questions array (required)
        questions: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['id', 'text', 'type', 'correct_answer'],
            properties: {
              id: {
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
              },
              text: {
                type: 'string',
                minLength: 10
              },
              type: {
                type: 'string',
                enum: ['multiple_choice', 'true_false', 'fill_in_the_blank']
              },
              options: {
                type: 'array',
                minItems: 2,
                items: {
                  type: 'string',
                  minLength: 1
                }
              },
              correct_answer: {
                oneOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'array', items: { type: 'string' } }
                ]
              },
              points: {
                type: 'number',
                minimum: 1,
                default: 10
              },
              category: {
                type: 'string',
                default: 'General'
              },
              difficulty: {
                type: 'string',
                enum: ['easy', 'medium', 'hard'],
                default: 'medium'
              },
              time_limit: {
                type: 'number',
                minimum: 10,
                default: 60
              },
              solution: {
                type: 'string'
              },
              pyq_year: {
                type: 'string'
              }
            }
          }
        }
      },
      required: ['questions']
    };
  }

  // Validate enhanced question data
  validateQuestions(data) {
    const errors = [];
    
    try {
      // Basic structure validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON: Data must be an object');
      }
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid JSON: "questions" property must be an array');
      }
      
      if (data.questions.length === 0) {
        throw new Error('Invalid JSON: Questions array cannot be empty');
      }
      
      // Validate metadata if present
      if (data.metadata) {
        const metadataErrors = this.validateMetadata(data.metadata);
        errors.push(...metadataErrors);
      }
      
      // Validate each question
      data.questions.forEach((question, index) => {
        const questionErrors = this.validateQuestion(question, index);
        errors.push(...questionErrors);
      });
      
      // Check for duplicate IDs
      const ids = data.questions.map(q => q.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate question IDs found: ${duplicateIds.join(', ')}`);
      }
      
      // Validate consistency between metadata and questions
      if (data.metadata && data.metadata.total_questions) {
        if (data.metadata.total_questions !== data.questions.length) {
          errors.push(`Metadata total_questions (${data.metadata.total_questions}) doesn't match actual questions count (${data.questions.length})`);
        }
      }
      
    } catch (error) {
      errors.push(error.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Validate metadata structure
  validateMetadata(metadata) {
    const errors = [];
    
    if (!metadata.title) {
      errors.push('Metadata must include title');
    }
    
    if (!metadata.subject) {
      errors.push('Metadata must include subject');
    }
    
    if (metadata.total_questions && typeof metadata.total_questions !== 'number') {
      errors.push('Metadata total_questions must be a number');
    }
    
    if (metadata.time_limit && typeof metadata.time_limit !== 'number') {
      errors.push('Metadata time_limit must be a number');
    }
    
    if (metadata.target_score && typeof metadata.target_score !== 'number') {
      errors.push('Metadata target_score must be a number');
    }
    
    return errors;
  }

  // Validate individual question (enhanced from original)
  validateQuestion(question, index) {
    const errors = [];
    const questionLabel = `Question ${index + 1} (ID: ${question.id || 'unknown'})`;
    
    try {
      // Required fields
      if (!question.id) {
        errors.push(`${questionLabel}: Missing required field 'id'`);
      }
      
      if (!question.text) {
        errors.push(`${questionLabel}: Missing required field 'text'`);
      }
      
      if (!question.type) {
        errors.push(`${questionLabel}: Missing required field 'type'`);
      }
      
      if (question.correct_answer === undefined || question.correct_answer === null) {
        errors.push(`${questionLabel}: Missing required field 'correct_answer'`);
      }
      
      // Type-specific validations
      if (question.type === 'multiple_choice') {
        if (!question.options || !Array.isArray(question.options)) {
          errors.push(`${questionLabel}: Multiple choice questions must have 'options' array`);
        } else if (question.options.length < 2) {
          errors.push(`${questionLabel}: Multiple choice questions must have at least 2 options`);
        } else if (!question.options.includes(question.correct_answer)) {
          errors.push(`${questionLabel}: correct_answer must be one of the options`);
        }
      }
      
      if (question.type === 'true_false') {
        const validAnswers = ['true', 'false', true, false];
        if (!validAnswers.includes(question.correct_answer)) {
          errors.push(`${questionLabel}: True/false questions must have correct_answer as 'true' or 'false'`);
        }
      }
      
      // Optional field validations
      if (question.points && (typeof question.points !== 'number' || question.points < 1)) {
        errors.push(`${questionLabel}: points must be a positive number`);
      }
      
      if (question.time_limit && (typeof question.time_limit !== 'number' || question.time_limit < 10)) {
        errors.push(`${questionLabel}: time_limit must be a number >= 10 seconds`);
      }
      
      if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        errors.push(`${questionLabel}: difficulty must be 'easy', 'medium', or 'hard'`);
      }
      
    } catch (error) {
      errors.push(`${questionLabel}: ${error.message}`);
    }
    
    return errors;
  }

  // Parse questions from JSON data (enhanced)
  parseQuestions(data) {
    const validation = this.validateQuestions(data);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
    }
    
    // Store metadata if present
    this.metadata = data.metadata || {};
    this.scoringRules = data.scoring_rules || {};
    this.gradeScale = data.grade_scale || {};
    
    // Parse questions with enhanced properties
    const questions = data.questions.map((q, index) => ({
      id: index + 1,
      originalId: q.id,
      question: q.text,
      type: q.type || 'multiple_choice',
      options: this.getOptions(q),
      correctIndex: this.getCorrectIndex(q),
      correctAnswer: q.correct_answer,
      points: q.points || this.scoringRules.correct_points || 10,
      topic: q.category || 'General',
      difficulty: this.capitalizeFirst(q.difficulty || 'medium'),
      timeLimit: q.time_limit || this.metadata.time_limit || 60,
      solution: q.solution || '',
      pyqYear: q.pyq_year || ''
    }));
    
    return questions;
  }

  // Export to enhanced JSON format
  exportToEnhancedJSON(questions, metadata = {}, scoringRules = {}, gradeScale = {}) {
    const enhancedMetadata = {
      title: metadata.title || 'Exported Questions',
      description: metadata.description || 'Questions exported from Mock Test app',
      subject: metadata.subject || 'General',
      chapter: metadata.chapter || '',
      section: metadata.section || '',
      total_questions: questions.length,
      time_limit: metadata.time_limit || 60,
      target_score: metadata.target_score || Math.round(questions.length * 0.6 * (scoringRules.correct_points || 10)),
      created: new Date().toISOString(),
      version: '1.0',
      author: metadata.author || '',
      difficulty_level: metadata.difficulty_level || 'mixed',
      instructions: metadata.instructions || {
        time_management: 'Manage your time effectively',
        distribution: 'Questions may vary in difficulty',
        tips: ['Read carefully', 'Review your answers', 'Use elimination method']
      }
    };

    const defaultScoringRules = {
      correct_points: 4,
      wrong_points: -1,
      unanswered_points: 0,
      negative_marking: true,
      passing_percentage: 60,
      ...scoringRules
    };

    const defaultGradeScale = {
      'A+': { min: 90, max: 100 },
      'A': { min: 80, max: 89 },
      'B+': { min: 70, max: 79 },
      'B': { min: 60, max: 69 },
      'C': { min: 50, max: 59 },
      'F': { min: 0, max: 49 },
      ...gradeScale
    };

    return {
      metadata: enhancedMetadata,
      scoring_rules: defaultScoringRules,
      grade_scale: defaultGradeScale,
      questions: questions.map(q => {
        const questionObj = {
          id: q.originalId || `q${q.id}`,
          text: q.question,
          type: q.type || 'multiple_choice',
          options: q.options,
          correct_answer: q.options ? q.options[q.correctIndex] : q.correctAnswer,
          points: q.points || defaultScoringRules.correct_points,
          category: q.topic,
          difficulty: q.difficulty.toLowerCase(),
          time_limit: q.timeLimit || enhancedMetadata.time_limit,
          solution: q.solution,
          pyq_year: q.pyqYear || undefined
        };
        
        // Remove undefined fields
        Object.keys(questionObj).forEach(key => {
          if (questionObj[key] === undefined) delete questionObj[key];
        });
        
        return questionObj;
      })
    };
  }

  // Utility methods (from original QuestionManager)
  getCorrectIndex(question) {
    if (question.type === 'true_false') return question.correct_answer === true || question.correct_answer === 'true' ? 0 : 1;
    if (question.options && Array.isArray(question.options)) {
      return question.options.findIndex(option => option === question.correct_answer);
    }
    return 0;
  }

  getOptions(question) {
    if (question.type === 'true_false') return ['True', 'False'];
    return question.options || [];
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Load from file (enhanced)
  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          const questions = this.parseQuestions(jsonData);
          this.questions = questions;
          
          resolve({
            success: true,
            questions: questions,
            count: questions.length,
            fileType: fileExtension,
            metadata: this.metadata,
            scoringRules: this.scoringRules,
            gradeScale: this.gradeScale
          });
        } catch (error) {
          let errorMessage = error.message;
          
          if (error instanceof SyntaxError) {
            errorMessage = `Invalid JSON format in ${fileExtension.toUpperCase()} file.`;
          } else if (error.message.includes('Validation failed')) {
            errorMessage = `${fileExtension.toUpperCase()} file validation failed: ${error.message.replace('Validation failed:\\n', '')}`;
          }
          
          reject({
            success: false,
            error: errorMessage,
            fileType: fileExtension
          });
        }
      };
      
      reader.onerror = () => {
        reject({
          success: false,
          error: `Failed to read ${fileExtension.toUpperCase()} file`,
          fileType: fileExtension
        });
      };
      
      reader.readAsText(file);
    });
  }

  // Get example enhanced JSON
  getExampleEnhancedJSON() {
    return {
      metadata: {
        title: "Units & Measurements - Sample Test",
        description: "Sample test with enhanced format",
        subject: "Physics",
        chapter: "Units and Measurements",
        section: "Unit 1: Physical World and Measurement",
        total_questions: 3,
        time_limit: 45,
        target_score: 8,
        created: new Date().toISOString(),
        version: "1.0",
        author: "Test Author",
        difficulty_level: "mixed",
        instructions: {
          time_management: "Spend no more than 15 minutes per question",
          distribution: "Questions are ordered by difficulty",
          tips: ["Read carefully", "Use dimensional analysis", "Review marked questions"]
        }
      },
      scoring_rules: {
        correct_points: 4,
        wrong_points: -1,
        unanswered_points: 0,
        negative_marking: true,
        passing_percentage: 60
      },
      grade_scale: {
        "A+": { min: 90, max: 100 },
        "A": { min: 80, max: 89 },
        "B+": { min: 70, max: 79 },
        "B": { min: 60, max: 69 },
        "C": { min: 50, max: 59 },
        "F": { min: 0, max: 49 }
      },
      questions: [
        {
          id: "q1",
          text: "What is the SI unit for length?",
          type: "multiple_choice",
          options: ["Meter", "Kilogram", "Second", "Ampere"],
          correct_answer: "Meter",
          points: 4,
          category: "SI Units",
          difficulty: "easy",
          time_limit: 30,
          solution: "The meter (m) is the base unit of length in SI.",
          pyq_year: "RRB ALP 2019"
        },
        {
          id: "q2",
          text: "Force has the dimensional formula [MLT⁻²]",
          type: "true_false",
          correct_answer: "true",
          points: 4,
          category: "Dimensional Analysis",
          difficulty: "medium",
          time_limit: 45,
          solution: "Force = mass × acceleration, so [M][LT⁻²] = [MLT⁻²]"
        },
        {
          id: "q3",
          text: "The dimensional formula [ML²T⁻¹] represents:",
          type: "multiple_choice",
          options: ["Angular momentum", "Linear momentum", "Energy", "Power"],
          correct_answer: "Angular momentum",
          points: 4,
          category: "Derived Quantities",
          difficulty: "hard",
          time_limit: 60,
          solution: "Angular momentum L = mvr, so [M][LT⁻¹][L] = [ML²T⁻¹]"
        }
      ]
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedQuestionManager;
}

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.EnhancedQuestionManager = EnhancedQuestionManager;
}