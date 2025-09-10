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
      
      // Support both new backend format and legacy format
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid JSON: "questions" property must be an array');
      }
      
      if (data.questions.length === 0) {
        throw new Error('Invalid JSON: Questions array cannot be empty');
      }
      
      // Validate metadata if present (support both metadata and root-level fields)
      if (data.metadata) {
        const metadataErrors = this.validateMetadata(data.metadata);
        errors.push(...metadataErrors);
      } else if (data.section || data.total_questions) {
        // Validate root-level metadata (backend format)
        const metadataErrors = this.validateRootMetadata(data);
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
      const totalQuestions = data.total_questions || data.metadata?.total_questions;
      if (totalQuestions && totalQuestions !== data.questions.length) {
        errors.push(`Metadata total_questions (${totalQuestions}) doesn't match actual questions count (${data.questions.length})`);
      }
      
    } catch (error) {
      errors.push(error.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Validate root-level metadata (backend format) - now more tolerant
  validateRootMetadata(data) {
    const errors = [];
    
    // Section is no longer required - will be generated from fallbacks
    
    if (data.total_questions && typeof data.total_questions !== 'number') {
      errors.push('total_questions must be a number');
    }
    
    if (data.time_limit && typeof data.time_limit !== 'number') {
      errors.push('time_limit must be a number');
    }
    
    return errors;
  }

  // Validate metadata structure - now more tolerant
  validateMetadata(metadata) {
    const errors = [];
    
    // Title is no longer required - will be generated from fallbacks
    // Subject is no longer required - will be generated from fallbacks
    
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

  // Infer question type based on content
  inferQuestionType(question) {
    if (question.type) {
      return question.type; // Already has type
    }
    
    if (question.options && Array.isArray(question.options)) {
      if (question.options.length === 2 && 
          question.options.some(opt => opt.toLowerCase().includes('true')) && 
          question.options.some(opt => opt.toLowerCase().includes('false'))) {
        return 'true_false';
      }
      return 'multiple_choice';
    }
    return 'multiple_choice'; // default fallback
  }

  // Validate individual question (enhanced from original) - now more tolerant
  validateQuestion(question, index) {
    const errors = [];
    const questionLabel = `Question ${index + 1} (ID: ${question.id || 'unknown'})`;
    
    try {
      // Required fields with flexible support
      if (!question.id) {
        errors.push(`${questionLabel}: Missing required field 'id'`);
      }
      
      // Support both 'text' and 'question' fields
      const questionText = question.text || question.question;
      if (!questionText) {
        errors.push(`${questionLabel}: Missing required field 'text' or 'question'`);
      }
      
      // Type field is optional if we can infer it
      const inferredType = this.inferQuestionType(question);
      if (!question.type && !inferredType) {
        errors.push(`${questionLabel}: Missing required field 'type' and cannot infer type`);
      }
      
      // Support multiple correct answer formats
      const correctAnswer = this.getCorrectAnswer(question);
      if (correctAnswer === null || correctAnswer === undefined) {
        errors.push(`${questionLabel}: Missing required correct answer (correct_answer, correctIndex, or answerKey)`);
      }
      
      // Type-specific validations using inferred type if needed
      const questionType = question.type || inferredType;
      if (questionType === 'multiple_choice') {
        if (!question.options || !Array.isArray(question.options)) {
          errors.push(`${questionLabel}: Multiple choice questions must have 'options' array`);
        } else if (question.options.length < 2) {
          errors.push(`${questionLabel}: Multiple choice questions must have at least 2 options`);
        } else {
          // Validate correct answer against options
          const normalizedCorrect = this.normalizeCorrectAnswer(question, correctAnswer);
          if (normalizedCorrect === null) {
            errors.push(`${questionLabel}: correct_answer must be valid (matching option or valid index)`);
          }
        }
      }
      
      if (questionType === 'true_false') {
        const validAnswers = ['true', 'false', true, false, 'True', 'False'];
        if (!validAnswers.includes(correctAnswer)) {
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

  // Get correct answer from various formats
  getCorrectAnswer(question) {
    // Direct correct_answer field
    if (question.correct_answer !== undefined && question.correct_answer !== null) {
      return question.correct_answer;
    }
    
    // correctIndex as number
    if (typeof question.correctIndex === 'number' && question.options && question.options[question.correctIndex]) {
      return question.options[question.correctIndex];
    }
    
    // answerKey as letter (A, B, C, D)
    if (question.answerKey && typeof question.answerKey === 'string') {
      const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 };
      const index = letterToIndex[question.answerKey.toUpperCase()];
      if (index !== undefined && question.options && question.options[index]) {
        return question.options[index];
      }
    }
    
    return null;
  }

  // Normalize correct answer for validation
  normalizeCorrectAnswer(question, correctAnswer) {
    if (!question.options || !Array.isArray(question.options)) {
      return correctAnswer;
    }
    
    // If it's already in options, it's valid
    if (question.options.includes(correctAnswer)) {
      return correctAnswer;
    }
    
    // Try case-insensitive match
    const lowerCorrect = String(correctAnswer).toLowerCase();
    const matchingOption = question.options.find(opt => String(opt).toLowerCase() === lowerCorrect);
    if (matchingOption) {
      return matchingOption;
    }
    
    return null;
  }

  // Parse questions from JSON data (enhanced) - now with better fallbacks
  parseQuestions(data, fileName = '') {
    const validation = this.validateQuestions(data);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
    }
    
    // Generate metadata with fallbacks as specified in requirements
    const sanitizedFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9\s]/g, " ").trim();
    const firstCategoryKey = data.instructions?.category_distribution ? Object.keys(data.instructions.category_distribution)[0] : '';
    
    const generatedMetadata = {
      title: data.metadata?.title || data.section || data.metadata?.subject || sanitizedFileName || "Untitled Test",
      subject: data.metadata?.subject || data.section || "",
      chapter: data.metadata?.chapter || firstCategoryKey || "",
      total_questions: data.total_questions || data.questions?.length || 0,
      time_limit: data.time_limit || data.metadata?.time_limit || 60,
      target_score: data.target_score || data.metadata?.target_score || '75%'
    };
    
    // Store metadata - handle both formats with fallbacks
    if (data.metadata) {
      this.metadata = { ...generatedMetadata, ...data.metadata };
    } else {
      // Backend format with root-level metadata
      this.metadata = generatedMetadata;
    }
    
    this.scoringRules = data.scoring_rules || data.scoring || {};
    this.gradeScale = data.grade_scale || {};
    
    // Parse questions with enhanced properties and normalized format
    const questions = data.questions.map((q, index) => {
      const questionText = q.text || q.question || '';
      const correctAnswer = this.getCorrectAnswer(q);
      
      return {
        id: index + 1,
        originalId: q.id,
        question: questionText,
        type: q.type || this.inferQuestionType(q),
        options: this.getOptions(q),
        correctIndex: this.getCorrectIndex(q),
        correctAnswer: correctAnswer,
        points: q.points || this.scoringRules.correct_points || 10,
        topic: q.category || q.topic || 'General',
        difficulty: this.capitalizeFirst(q.difficulty || 'medium'),
        timeLimit: q.time_limit || q.timeLimit || this.metadata.time_limit || 60,
        solution: q.solution || '',
        pyqYear: q.pyq_year || '',
        // Include per-question metadata
        metadata: {
          section: q.section || q.category || q.topic || this.metadata.subject,
          subject: this.metadata.subject,
          chapter: this.metadata.chapter,
          title: this.metadata.title
        }
      };
    });
    
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
  // Get correct index with support for multiple formats
  getCorrectIndex(question) {
    const correctAnswer = this.getCorrectAnswer(question);
    
    // For true/false questions
    if (question.type === 'true_false' || this.inferQuestionType(question) === 'true_false') {
      return correctAnswer === true || correctAnswer === 'true' || correctAnswer === 'True' ? 0 : 1;
    }
    
    // For multiple choice, find the index of correct answer
    if (question.options && Array.isArray(question.options)) {
      let index = question.options.findIndex(option => option === correctAnswer);
      
      // Try case-insensitive match if exact match not found
      if (index === -1 && correctAnswer) {
        const lowerCorrect = String(correctAnswer).toLowerCase();
        index = question.options.findIndex(opt => String(opt).toLowerCase() === lowerCorrect);
      }
      
      // If correctIndex was provided directly, use it
      if (index === -1 && typeof question.correctIndex === 'number') {
        return question.correctIndex;
      }
      
      return Math.max(0, index);
    }
    
    return 0;
  }

  // Get options with flexible support
  getOptions(question) {
    const inferredType = this.inferQuestionType(question);
    
    if (question.type === 'true_false' || inferredType === 'true_false') {
      return ['True', 'False'];
    }
    
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
          const questions = this.parseQuestions(jsonData, fileName);
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