// State Management Module
// Handles application state, local storage, and state transitions

class StateManager {
  constructor() {
    this.state = this.getInitialState();
    this.storageKey = 'dimensionalMockState';
  }

  // Initialize state manager - load from localStorage
  async init() {
    try {
      this.loadState();
      console.log('StateManager initialized successfully');
    } catch (error) {
      console.error('StateManager initialization error:', error);
      throw error;
    }
  }

  getInitialState() {
    return {
      answers: Array(50).fill(null),
      bookmarked: Array(50).fill(false),
      timeSpent: Array(50).fill(0),
      currentQ: 0,
      testStart: null,
      testEnd: null,
      testDuration: 60, // minutes
      isRRBMode: false,
      isDarkMode: false,
      enhancedTimer: false,
      negativeMarking: false,
      reviewCurrentQ: 0,
      results: null,
      questionSource: 'default',
      customQuestions: null
    };
  }

  // Load state from localStorage
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const loadedState = JSON.parse(saved);
        
        // Validate loaded state structure
        if (this.validateState(loadedState)) {
          this.state = { ...this.state, ...loadedState };
          console.log('State loaded successfully from localStorage');
        } else {
          console.warn('Invalid state structure in localStorage, using defaults');
          this.resetInvalidState();
        }
      }
    } catch (error) {
      console.error('Load state error:', error);
      console.warn('Failed to load state, using defaults');
      this.resetInvalidState();
    }
  }

  // Save state to localStorage
  saveState() {
    try {
      // Validate state before saving
      if (this.validateState(this.state)) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } else {
        console.error('Invalid state, not saving to localStorage');
      }
    } catch (error) {
      console.error('Save state error:', error);
      
      // Try to recover storage space if quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  // Validate state structure
  validateState(state) {
    if (!state || typeof state !== 'object') {
      return false;
    }
    
    // Check required properties
    const requiredProps = ['answers', 'bookmarked', 'timeSpent', 'currentQ', 'testDuration'];
    for (const prop of requiredProps) {
      if (!(prop in state)) {
        return false;
      }
    }
    
    // Check array properties
    if (!Array.isArray(state.answers) || !Array.isArray(state.bookmarked) || !Array.isArray(state.timeSpent)) {
      return false;
    }
    
    // Check numeric properties
    if (typeof state.currentQ !== 'number' || typeof state.testDuration !== 'number') {
      return false;
    }
    
    return true;
  }

  // Reset invalid state
  resetInvalidState() {
    try {
      localStorage.removeItem(this.storageKey);
      this.state = this.getInitialState();
    } catch (error) {
      console.error('Reset invalid state error:', error);
    }
  }

  // Handle storage quota exceeded
  handleStorageQuotaExceeded() {
    try {
      console.warn('Storage quota exceeded, attempting cleanup');
      
      // Keep only essential state
      const essentialState = {
        answers: this.state.answers,
        bookmarked: this.state.bookmarked,
        timeSpent: this.state.timeSpent,
        currentQ: this.state.currentQ,
        testStart: this.state.testStart,
        testEnd: this.state.testEnd,
        testDuration: this.state.testDuration
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(essentialState));
      console.log('Essential state saved after cleanup');
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }

  // Reset state to initial values
  resetState() {
    this.state = this.getInitialState();
    this.saveState();
  }

  // Update specific state properties
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  // Getters for state properties
  getState() {
    return this.state;
  }

  getCurrentQuestion() {
    return this.state.currentQ;
  }

  getAnswers() {
    return this.state.answers;
  }

  getBookmarked() {
    return this.state.bookmarked;
  }

  getTimeSpent() {
    return this.state.timeSpent;
  }

  getTestDuration() {
    return this.state.testDuration;
  }

  getResults() {
    return this.state.results;
  }

  // Setters for common state changes
  setCurrentQuestion(questionIndex) {
    this.updateState({ currentQ: questionIndex });
  }

  setAnswer(questionIndex, answerIndex) {
    const answers = [...this.state.answers];
    answers[questionIndex] = answerIndex;
    this.updateState({ answers });
  }

  toggleBookmark(questionIndex) {
    const bookmarked = [...this.state.bookmarked];
    bookmarked[questionIndex] = !bookmarked[questionIndex];
    this.updateState({ bookmarked });
  }

  clearAnswer(questionIndex) {
    const answers = [...this.state.answers];
    answers[questionIndex] = null;
    this.updateState({ answers });
  }

  updateTimeSpent(questionIndex, timeSpent) {
    const timeSpentArray = [...this.state.timeSpent];
    timeSpentArray[questionIndex] = timeSpent;
    this.updateState({ timeSpent: timeSpentArray });
  }

  setTestStart(timestamp = Date.now()) {
    this.updateState({ testStart: timestamp, testEnd: null });
  }

  setTestEnd(timestamp = Date.now()) {
    this.updateState({ testEnd: timestamp });
  }

  setResults(results) {
    this.updateState({ results });
  }

  setCustomQuestions(questions) {
    // Update arrays to match new question count
    const questionCount = questions ? questions.length : 50;
    this.updateState({
      customQuestions: questions,
      answers: Array(questionCount).fill(null),
      bookmarked: Array(questionCount).fill(false),
      timeSpent: Array(questionCount).fill(0),
      currentQ: 0
    });
  }

  setNegativeMarking(enabled) {
    this.updateState({ negativeMarking: enabled });
  }

  // Start a new test
  startTest() {
    this.setTestStart();
    this.updateState({ currentQ: 0 });
  }

  // Utility methods
  isTestInProgress() {
    return this.state.testStart && !this.state.testEnd;
  }

  getTotalQuestions() {
    return this.state.customQuestions ? this.state.customQuestions.length : 50;
  }

  getAnsweredCount() {
    return this.state.answers.filter(answer => answer !== null).length;
  }

  getBookmarkedCount() {
    return this.state.bookmarked.filter(Boolean).length;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
}