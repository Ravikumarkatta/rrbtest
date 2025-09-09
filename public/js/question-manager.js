// JSON Question Schema and Validation for Units-measurements Application
// Handles importing, validating, and parsing questions from JSON files

class QuestionManager {
  constructor() {
    this.questions = [];
    this.schema = this.getQuestionSchema();
  }
  
  // Define the JSON schema for questions
  getQuestionSchema() {
    return {
      type: 'object',
      required: ['questions'],
      properties: {
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
      }
    };
  }
  
  // Validate JSON data against schema
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
      
    } catch (error) {
      errors.push(error.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  // Validate individual question
  validateQuestion(question, index) {
    const errors = [];
    const questionPrefix = `Question ${index + 1}`;
    
    // Required fields
    if (!question.id) {
      errors.push(`${questionPrefix}: Missing required field "id"`);
    } else if (typeof question.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(question.id)) {
      errors.push(`${questionPrefix}: Invalid "id" - must be alphanumeric with underscores/hyphens only`);
    }
    
    if (!question.text) {
      errors.push(`${questionPrefix}: Missing required field "text"`);
    } else if (typeof question.text !== 'string' || question.text.length < 10) {
      errors.push(`${questionPrefix}: "text" must be a string with at least 10 characters`);
    }
    
    if (!question.type) {
      errors.push(`${questionPrefix}: Missing required field "type"`);
    } else if (!['multiple_choice', 'true_false', 'fill_in_the_blank'].includes(question.type)) {
      errors.push(`${questionPrefix}: Invalid "type" - must be one of: multiple_choice, true_false, fill_in_the_blank`);
    }
    
    if (question.correct_answer === undefined || question.correct_answer === null) {
      errors.push(`${questionPrefix}: Missing required field "correct_answer"`);
    }
    
    // Type-specific validation
    if (question.type === 'multiple_choice') {
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`${questionPrefix}: Multiple choice questions must have an "options" array`);
      } else if (question.options.length < 2) {
        errors.push(`${questionPrefix}: Multiple choice questions must have at least 2 options`);
      } else {
        // Validate correct_answer for multiple choice
        if (typeof question.correct_answer === 'string') {
          if (!question.options.includes(question.correct_answer)) {
            errors.push(`${questionPrefix}: "correct_answer" must be one of the provided options`);
          }
        } else if (typeof question.correct_answer === 'number') {
          if (question.correct_answer < 0 || question.correct_answer >= question.options.length) {
            errors.push(`${questionPrefix}: "correct_answer" index out of range`);
          }
        }
      }
    }
    
    if (question.type === 'true_false') {
      if (question.options && question.options.length !== 2) {
        errors.push(`${questionPrefix}: True/false questions should have exactly 2 options or none (will use default)`);
      }
      if (typeof question.correct_answer === 'string') {
        const validAnswers = ['true', 'false', 'True', 'False'];
        if (!validAnswers.includes(question.correct_answer)) {
          errors.push(`${questionPrefix}: True/false "correct_answer" must be "true" or "false"`);
        }
      }
    }
    
    // Optional field validation
    if (question.points !== undefined && (typeof question.points !== 'number' || question.points < 1)) {
      errors.push(`${questionPrefix}: "points" must be a positive number`);
    }
    
    if (question.difficulty !== undefined && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push(`${questionPrefix}: "difficulty" must be one of: easy, medium, hard`);
    }
    
    if (question.time_limit !== undefined && (typeof question.time_limit !== 'number' || question.time_limit < 10)) {
      errors.push(`${questionPrefix}: "time_limit" must be a number >= 10 seconds`);
    }
    
    return errors;
  }
  
  // Convert JSON questions to internal format
  parseQuestions(data) {
    const validation = this.validateQuestions(data);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
    }
    
    return data.questions.map((question, index) => {
      // Convert to internal format (compatible with existing app structure)
      const parsed = {
        id: index + 1, // Use numeric ID for compatibility
        question: question.text,
        topic: question.category || 'Imported Questions',
        difficulty: this.capitalizeFirst(question.difficulty || 'medium'),
        solution: question.solution || 'No solution provided',
        correctIndex: this.getCorrectIndex(question),
        options: this.getOptions(question),
        // Additional metadata
        originalId: question.id,
        points: question.points || 10,
        timeLimit: question.time_limit || 60,
        type: question.type,
        pyqYear: question.pyq_year || null // Add PYQ support
      };
      
      return parsed;
    });
  }
  
  // Helper method to get correct answer index
  getCorrectIndex(question) {
    if (question.type === 'multiple_choice') {
      if (typeof question.correct_answer === 'number') {
        return question.correct_answer;
      } else if (typeof question.correct_answer === 'string') {
        return question.options.indexOf(question.correct_answer);
      }
    } else if (question.type === 'true_false') {
      const options = question.options || ['True', 'False'];
      const correctAnswer = question.correct_answer.toString().toLowerCase();
      return correctAnswer === 'true' ? 0 : 1;
    }
    return 0; // Default to first option
  }
  
  // Helper method to get options array
  getOptions(question) {
    if (question.type === 'multiple_choice') {
      return question.options || [];
    } else if (question.type === 'true_false') {
      return question.options || ['True', 'False'];
    } else if (question.type === 'fill_in_the_blank') {
      // For fill-in-the-blank, create options from correct answer
      const correct = question.correct_answer;
      if (Array.isArray(correct)) {
        return correct;
      } else {
        // Create some plausible wrong answers for display
        return [correct, 'Option B', 'Option C', 'Option D'];
      }
    }
    return [];
  }
  
  // Helper method to capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // Load questions from file
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
            fileType: fileExtension
          });
        } catch (error) {
          // Enhance error message with file type and context
          let errorMessage = error.message;
          
          if (error instanceof SyntaxError) {
            errorMessage = `Invalid JSON format in ${fileExtension.toUpperCase()} file. Please ensure the file contains valid JSON data.`;
          } else if (error.message.includes('Validation failed')) {
            errorMessage = `${fileExtension.toUpperCase()} file validation failed: ${error.message.replace('Validation failed:\n', '')}`;
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
  
  // Export questions to JSON format
  exportToJSON(questions, metadata = {}) {
    const exportData = {
      metadata: {
        title: metadata.title || 'Exported Questions',
        description: metadata.description || 'Questions exported from Units-measurements app',
        created: new Date().toISOString(),
        version: '1.0',
        ...metadata
      },
      questions: questions.map(q => ({
        id: q.originalId || `q${q.id}`,
        text: q.question,
        type: q.type || 'multiple_choice',
        options: q.options,
        correct_answer: q.options[q.correctIndex],
        points: q.points || 10,
        category: q.topic,
        difficulty: q.difficulty.toLowerCase(),
        time_limit: q.timeLimit || 60,
        solution: q.solution,
        pyq_year: q.pyqYear || undefined
      }).filter(q => {
        // Remove pyq_year if it's undefined to keep clean JSON
        if (q.pyq_year === undefined) {
          delete q.pyq_year;
        }
        return true;
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // Create example JSON structure
  getExampleJSON() {
    return {
      "questions": [
        {
          "id": "q1",
          "text": "What is the SI unit for length?",
          "type": "multiple_choice",
          "options": ["Meter", "Kilogram", "Second", "Ampere"],
          "correct_answer": "Meter",
          "points": 10,
          "category": "SI Units",
          "difficulty": "easy",
          "time_limit": 30,
          "solution": "The meter (m) is the base unit of length in the International System of Units (SI).",
          "pyq_year": "RRB ALP & Tech. 23.01.2019 Shift-I"
        },
        {
          "id": "q2",
          "text": "Force has the dimensional formula [MLT⁻²]",
          "type": "true_false",
          "correct_answer": "true",
          "points": 5,
          "category": "Dimensional Analysis",
          "difficulty": "medium",
          "time_limit": 45,
          "solution": "Force = mass × acceleration, so [M][LT⁻²] = [MLT⁻²]"
        },
        {
          "id": "q3",
          "text": "The dimensional formula [ML²T⁻¹] represents:",
          "type": "multiple_choice",
          "options": ["Angular momentum", "Linear momentum", "Energy", "Power"],
          "correct_answer": "Angular momentum",
          "points": 15,
          "category": "Derived Quantities",
          "difficulty": "hard",
          "time_limit": 60,
          "solution": "Angular momentum L = mvr, so [M][LT⁻¹][L] = [ML²T⁻¹]"
        }
      ]
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionManager;
}