// Main Application Module
// Handles application initialization, event binding, and core functionality

class MockTestApp {
  constructor() {
    this.stateManager = null;
    this.viewManager = null;
    this.testManager = null;
    this.questionManager = null;
  }

  // Initialize the application
  async init() {
    try {
      // Initialize managers
      this.stateManager = new StateManager();
      this.viewManager = new ViewManager();
      this.questionManager = new QuestionManager();
      this.testManager = new TestManager(this.stateManager, this.viewManager, this.questionManager);

      // Initialize managers
      await this.viewManager.init();
      await this.stateManager.init();

      // Setup event listeners
      this.setupEventListeners();

      // Update UI with current state
      this.updateUI();

      // Handle dark mode initial state
      this.applyInitialDarkMode();

      console.log('MockTestApp initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
      this.showError('Failed to initialize application');
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    try {
      // Landing view event listeners
      this.setupLandingEventListeners();
      
      // Test view event listeners
      this.setupTestEventListeners();
      
      // Result view event listeners
      this.setupResultEventListeners();
      
      // Review answers view event listeners
      this.setupReviewAnswersEventListeners();
      
      // Global event listeners
      this.setupGlobalEventListeners();
    } catch (error) {
      console.error('Setup event listeners error:', error);
    }
  }

  // Setup landing view event listeners
  setupLandingEventListeners() {
    // Start test button
    const startBtn = document.getElementById('start-test-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startTest());
    }

    // Resume test button
    const resumeBtn = document.getElementById('resume-test-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.resumeTest());
    }

    // Reset test button
    const resetBtn = document.getElementById('reset-test-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTest());
    }

    // Test duration change
    const durationSelect = document.getElementById('test-duration');
    if (durationSelect) {
      durationSelect.addEventListener('change', (e) => this.updateTestDuration(e));
    }

    // Custom duration inputs
    const customMinutes = document.getElementById('custom-minutes');
    const customSeconds = document.getElementById('custom-seconds');
    if (customMinutes) {
      customMinutes.addEventListener('input', () => this.validateCustomDuration());
    }
    if (customSeconds) {
      customSeconds.addEventListener('input', () => this.validateCustomDuration());
    }

    // Mode toggles
    const rrbMode = document.getElementById('rrb-mode');
    if (rrbMode) {
      rrbMode.addEventListener('change', (e) => this.toggleRRBMode(e));
    }

    const darkMode = document.getElementById('dark-mode');
    if (darkMode) {
      darkMode.addEventListener('change', (e) => this.toggleDarkMode(e));
    }

    const enhancedTimer = document.getElementById('enhanced-timer');
    if (enhancedTimer) {
      enhancedTimer.addEventListener('change', (e) => this.toggleEnhancedTimer(e));
    }

    const negativeMarking = document.getElementById('negative-marking');
    if (negativeMarking) {
      negativeMarking.addEventListener('change', (e) => this.toggleNegativeMarking(e));
    }

    // Question source and JSON upload
    const questionSource = document.getElementById('question-source');
    if (questionSource) {
      questionSource.addEventListener('change', (e) => this.toggleQuestionSource(e));
    }

    // JSON file upload - THIS WAS MISSING!
    const jsonFileInput = document.getElementById('json-file');
    if (jsonFileInput) {
      jsonFileInput.addEventListener('change', (e) => this.handleJSONUpload(e));
    } else {
      console.warn('JSON file input element not found');
    }

    // Download example JSON button
    const downloadExampleBtn = document.getElementById('download-example-btn');
    if (downloadExampleBtn) {
      downloadExampleBtn.addEventListener('click', () => this.downloadExampleJSON());
    }
  }

  // Handles initial dark mode state (from localStorage or system preference)
  applyInitialDarkMode() {
    const darkModeCheckbox = document.getElementById('dark-mode');
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedTheme = localStorage.getItem("theme");

    let isDark = false;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      isDark = true;
    }

    if (darkModeCheckbox) {
      darkModeCheckbox.checked = isDark;
    }
    document.body.setAttribute('data-theme', isDark ? "dark" : "light");
  }

  // Setup test view event listeners
  setupTestEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.testManager.previousQuestion());
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.testManager.nextQuestion());
    }

    // Bookmark button
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        this.testManager.toggleBookmark();
        // Add visual feedback
        const isBookmarked = this.stateManager.getBookmarked()[this.stateManager.getCurrentQuestion()];
        bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
      });
    }

    // Clear answer button
    const clearBtn = document.getElementById('clear-answer-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.testManager.clearAnswer());
    }

    // Review panel buttons
    const reviewBtn = document.getElementById('review-panel-btn');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        this.testManager.updateReviewGrid();
        this.viewManager.showModal('review-panel');
      });
    }

    // Submit test button
    const submitBtn = document.getElementById('submit-test-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.testManager.submitTest());
    }

    // Exit exam button
    const exitBtn = document.getElementById('exit-exam-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.exitExam());
    }

    // PYQ toggle button
    const pyqToggleBtn = document.getElementById('pyq-toggle-btn');
    if (pyqToggleBtn) {
      pyqToggleBtn.addEventListener('click', () => {
        const isActive = pyqToggleBtn.classList.contains('active');
        pyqToggleBtn.classList.toggle('active', !isActive);
        
        if (!isActive) {
          pyqToggleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Show All Questions
          `;
        } else {
          pyqToggleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Show PYQ Only
          `;
        }
        
        this.testManager.filterPYQQuestions(!isActive);
      });
    }

    // Sidebar filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        if (filter === 'pyq') {
          // Show only PYQ questions
          this.testManager.filterPYQQuestions(true);
          
          // Also update the main PYQ toggle button
          const pyqToggleBtn = document.getElementById('pyq-toggle-btn');
          if (pyqToggleBtn) {
            pyqToggleBtn.classList.add('active');
            pyqToggleBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Show All Questions
            `;
          }
        } else if (filter === 'all') {
          // Show all questions
          this.testManager.filterPYQQuestions(false);
          
          // Also update the main PYQ toggle button
          const pyqToggleBtn = document.getElementById('pyq-toggle-btn');
          if (pyqToggleBtn) {
            pyqToggleBtn.classList.remove('active');
            pyqToggleBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Show PYQ Only
            `;
          }
        }
        // Note: Other filters (answered, unanswered, bookmarked) would need separate implementation
      });
    });

    // Review panel specific event listeners
    this.setupReviewPanelEventListeners();
  }

  // Setup review panel event listeners
  setupReviewPanelEventListeners() {
    const closeReviewBtn = document.getElementById('close-review-btn');
    if (closeReviewBtn) {
      closeReviewBtn.addEventListener('click', () => this.viewManager.hideModal('review-panel'));
    }

    const submitFromReviewBtn = document.getElementById('submit-from-review-btn');
    if (submitFromReviewBtn) {
      submitFromReviewBtn.addEventListener('click', () => {
        this.viewManager.hideModal('review-panel');
        this.testManager.submitTest();
      });
    }
  }

  // Setup result view event listeners
  setupResultEventListeners() {
    // Review answers button
    const reviewAnswersBtn = document.getElementById('review-answers-btn');
    if (reviewAnswersBtn) {
      reviewAnswersBtn.addEventListener('click', () => {
        this.testManager.initializeReview();
        this.viewManager.showView('review-answers');
      });
    }

    // Start new test button (was restart-test-btn, corrected to match HTML)
    const newTestBtn = document.getElementById('new-test-btn');
    if (newTestBtn) {
      newTestBtn.addEventListener('click', () => this.restartTest());
    }

    // Export results button
    const exportBtn = document.getElementById('export-results-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportResults());
    }

    // Back to home button
    const backHomeBtn = document.getElementById('back-home-btn');
    if (backHomeBtn) {
      backHomeBtn.addEventListener('click', () => this.backToHome());
    }

    // Filter buttons for results table
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        this.applyResultsFilter(filter);
      });
    });
  }

  // Setup review answers view event listeners
  setupReviewAnswersEventListeners() {
    // Back to results button
    const backToResultsBtn = document.getElementById('back-to-results-btn');
    if (backToResultsBtn) {
      backToResultsBtn.addEventListener('click', () => this.viewManager.showView('result'));
    }

    // Review navigation buttons
    const reviewPrevBtn = document.getElementById('review-prev-btn');
    if (reviewPrevBtn) {
      reviewPrevBtn.addEventListener('click', () => this.navigateReview(-1));
    }

    const reviewNextBtn = document.getElementById('review-next-btn');
    if (reviewNextBtn) {
      reviewNextBtn.addEventListener('click', () => this.navigateReview(1));
    }
  }

  // Setup global event listeners
  setupGlobalEventListeners() {
    // Window beforeunload for auto-save
    window.addEventListener('beforeunload', (e) => {
      const state = this.stateManager.getState();
      if (state.testStart && !state.testEnd) {
        e.preventDefault();
        e.returnValue = 'You have a test in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  // Handle keyboard shortcuts
  handleKeyboardShortcuts(event) {
    const currentView = this.viewManager.getCurrentView();
    
    if (currentView === 'test') {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.testManager.previousQuestion();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.testManager.nextQuestion();
          break;
        case 'b':
        case 'B':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.testManager.toggleBookmark();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            const optionIndex = parseInt(event.key) - 1;
            this.testManager.selectOption(optionIndex);
          }
          break;
      }
    }
  }

  // Start new test
  startTest() {
    try {
      const state = this.stateManager.getState();
      
      // Validate custom duration if selected
      if (state.testDuration === 'custom') {
        if (!this.validateCustomDuration()) {
          return;
        }
      }

      // Initialize test state
      this.stateManager.startTest();
      
      // Start timers and auto-save
      this.testManager.startMainTimer();
      this.testManager.startAutoSave();
      
      // Show test view and display first question
      this.viewManager.showView('test');
      this.testManager.displayQuestion();
      
    } catch (error) {
      console.error('Start test error:', error);
      this.showError('Failed to start test');
    }
  }

  // Resume existing test
  resumeTest() {
    try {
      // Resume timers
      this.testManager.startMainTimer();
      this.testManager.startAutoSave();
      
      // Show test view and current question
      this.viewManager.showView('test');
      this.testManager.displayQuestion();
      
    } catch (error) {
      console.error('Resume test error:', error);
      this.showError('Failed to resume test');
    }
  }

  // Reset test data
  resetTest() {
    if (!confirm('Are you sure you want to reset all test data? This action cannot be undone.')) {
      return;
    }
    
    try {
      this.stateManager.resetState();
      this.viewManager.showView('landing');
      this.updateUI();
    } catch (error) {
      console.error('Reset test error:', error);
      this.showError('Failed to reset test');
    }
  }

  // Restart test (from results)
  restartTest() {
    if (!confirm('Are you sure you want to start a new test? This will reset all data.')) {
      return;
    }
    
    try {
      this.stateManager.resetState();
      this.viewManager.showView('landing');
      this.updateUI();
    } catch (error) {
      console.error('Restart test error:', error);
      this.showError('Failed to restart test');
    }
  }

  // Back to home
  backToHome() {
    try {
      this.viewManager.showView('landing');
      this.updateUI();
    } catch (error) {
      console.error('Back to home error:', error);
    }
  }

  // Exit exam (with confirmation)
  exitExam() {
    if (!confirm('Are you sure you want to exit the exam? Your progress will be saved.')) {
      return;
    }
    
    try {
      // Stop timers
      if (this.testManager) {
        this.testManager.stopAllTimers();
        this.testManager.clearAutoSave();
      }
      
      // Save current state
      this.stateManager.saveState();
      
      // Go back to landing page
      this.viewManager.showView('landing');
      this.updateUI();
    } catch (error) {
      console.error('Exit exam error:', error);
      this.showError('Failed to exit exam');
    }
  }

  // Navigate review answers
  navigateReview(direction) {
    try {
      const currentQuestions = this.getCurrentQuestions();
      const state = this.stateManager.getState();
      const currentReviewQ = state.reviewCurrentQ || 0;
      const newReviewQ = currentReviewQ + direction;
      
      if (newReviewQ >= 0 && newReviewQ < currentQuestions.length) {
        this.stateManager.updateState({ reviewCurrentQ: newReviewQ });
        this.updateReviewDisplay(newReviewQ);
      }
    } catch (error) {
      console.error('Navigate review error:', error);
    }
  }

  // Jump directly to a specific question in review view
  jumpToQuestion(questionNumber) {
    try {
      const currentQuestions = this.getCurrentQuestions();
      // Convert 1-indexed question number to 0-indexed array position
      const questionIndex = questionNumber - 1;
      
      if (questionIndex >= 0 && questionIndex < currentQuestions.length) {
        // Initialize review if not already done
        this.testManager.initializeReview();
        
        // Switch to review answers view
        this.viewManager.showView('review-answers');
        
        // Set the current review question and update display
        this.stateManager.updateState({ reviewCurrentQ: questionIndex });
        this.updateReviewDisplay(questionIndex);
      } else {
        console.error('Invalid question number:', questionNumber);
      }
    } catch (error) {
      console.error('Jump to question error:', error);
    }
  }

  // Update review display for current question
  updateReviewDisplay(questionIndex) {
    try {
      const currentQuestions = this.getCurrentQuestions();
      const state = this.stateManager.getState();
      const results = this.stateManager.getResults();
      
      if (!results || !currentQuestions[questionIndex]) return;
      
      const question = currentQuestions[questionIndex];
      const userAnswer = state.answers[questionIndex];
      const isCorrect = userAnswer !== null && userAnswer === question.correctIndex;
      const timeSpent = state.timeSpent[questionIndex] || 0;
      
      // Update question number
      const reviewQNum = document.getElementById('review-q-num');
      if (reviewQNum) {
        reviewQNum.textContent = questionIndex + 1;
      }
      
      // Update question text
      const reviewQuestionText = document.getElementById('review-question-text');
      if (reviewQuestionText) {
        reviewQuestionText.textContent = question.question;
      }
      
      // Update user answer display
      const userAnswerDisplay = document.getElementById('user-answer-display');
      if (userAnswerDisplay) {
        if (userAnswer !== null) {
          userAnswerDisplay.textContent = question.options[userAnswer];
          userAnswerDisplay.className = `answer-display ${isCorrect ? 'correct' : 'incorrect'}`;
        } else {
          userAnswerDisplay.textContent = 'Not Answered';
          userAnswerDisplay.className = 'answer-display not-answered';
        }
      }
      
      // Update correct answer display
      const correctAnswerDisplay = document.getElementById('correct-answer-display');
      if (correctAnswerDisplay) {
        correctAnswerDisplay.textContent = question.options[question.correctIndex];
        correctAnswerDisplay.className = 'answer-display';
      }
      
      // Update solution
      const solutionText = document.getElementById('solution-text');
      if (solutionText) {
        solutionText.textContent = question.solution || 'Solution not available for this question.';
      }
      
      // Update time spent
      const questionTimeSpent = document.getElementById('question-time-spent');
      if (questionTimeSpent) {
        questionTimeSpent.textContent = this.testManager.formatTime(timeSpent * 1000);
      }
      
      // Update status
      const questionStatusDisplay = document.getElementById('question-status-display');
      if (questionStatusDisplay) {
        const status = userAnswer === null ? 'Not Answered' : (isCorrect ? 'Correct' : 'Incorrect');
        questionStatusDisplay.textContent = status;
        questionStatusDisplay.className = `stat-value ${status.toLowerCase().replace(' ', '')}`;
      }
      
      // Update navigation buttons
      const reviewPrevBtn = document.getElementById('review-prev-btn');
      const reviewNextBtn = document.getElementById('review-next-btn');
      
      if (reviewPrevBtn) {
        reviewPrevBtn.disabled = questionIndex === 0;
      }
      
      if (reviewNextBtn) {
        reviewNextBtn.disabled = questionIndex === currentQuestions.length - 1;
        reviewNextBtn.textContent = questionIndex === currentQuestions.length - 1 ? 'Last Question' : 'Next →';
      }
      
    } catch (error) {
      console.error('Update review display error:', error);
    }
  }

  // Update test duration
  updateTestDuration(event) {
    try {
      const value = event.target.value;
      const customSection = document.getElementById('custom-duration-section');
      
      if (value === 'custom') {
        customSection.classList.remove('hidden');
        this.validateCustomDuration();
      } else {
        customSection.classList.add('hidden');
        this.stateManager.updateState({ testDuration: parseInt(value) });
      }
    } catch (error) {
      console.error('Update test duration error:', error);
    }
  }

  // Validate custom duration inputs
  validateCustomDuration() {
    try {
      const minutesInput = document.getElementById('custom-minutes');
      const secondsInput = document.getElementById('custom-seconds');
      const startBtn = document.getElementById('start-test-btn');
      
      const minutes = minutesInput ? parseInt(minutesInput.value) || 0 : 0;
      const seconds = secondsInput ? parseInt(secondsInput.value) || 0 : 0;
      
      const validation = Utils.validateCustomDuration(minutes, seconds);
      
      // Update input validation states
      if (minutesInput) minutesInput.classList.toggle('invalid', !validation.minutes);
      if (secondsInput) secondsInput.classList.toggle('invalid', !validation.seconds);
      
      if (validation.isValid) {
        const totalMinutes = Utils.convertToTotalMinutes(minutes, seconds);
        this.stateManager.updateState({ testDuration: totalMinutes });
        
        if (startBtn) startBtn.disabled = false;
        return true;
      } else {
        if (startBtn) startBtn.disabled = true;
        return false;
      }
    } catch (error) {
      console.error('Validate custom duration error:', error);
      return false;
    }
  }

  // Toggle RRB mode
  toggleRRBMode(event) {
    try {
      const isRRBMode = event.target.checked;
      this.stateManager.updateState({ isRRBMode });
      
      // Apply RRB theme
      if (isRRBMode) {
        document.body.setAttribute('data-rrb-mode', 'true');
      } else {
        document.body.removeAttribute('data-rrb-mode');
      }
    } catch (error) {
      console.error('Toggle RRB mode error:', error);
    }
  }

  // Toggle dark mode
  toggleDarkMode(event) {
    try {
      const isDarkMode = event.target.checked;
      this.stateManager.updateState({ isDarkMode });

      document.body.setAttribute('data-theme', isDarkMode ? "dark" : "light");
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch (error) {
      console.error('Toggle dark mode error:', error);
    }
  }

  // Toggle enhanced timer
  toggleEnhancedTimer(event) {
    try {
      const enhancedTimer = event.target.checked;
      this.stateManager.updateState({ enhancedTimer });
    } catch (error) {
      console.error('Toggle enhanced timer error:', error);
    }
  }

  // Toggle negative marking
  toggleNegativeMarking(event) {
    try {
      const negativeMarking = event.target.checked;
      this.stateManager.setNegativeMarking(negativeMarking);
    } catch (error) {
      console.error('Toggle negative marking error:', error);
    }
  }

  // Toggle question source
  toggleQuestionSource(event) {
    try {
      const questionSource = event.target.value;
      this.stateManager.updateState({ questionSource });
      
      // Show/hide JSON upload section
      this.viewManager.toggleQuestionSourceSection(questionSource);
      
      // Reset custom questions if switching away from JSON
      if (questionSource !== 'json') {
        this.stateManager.updateState({ customQuestions: null });
        
        // Clear file input
        const jsonFileInput = document.getElementById('json-file');
        if (jsonFileInput) {
          jsonFileInput.value = '';
        }
        
        // Hide status
        const statusElement = document.getElementById('json-status');
        if (statusElement) {
          statusElement.classList.add('hidden');
        }
      }
      
      // Update question count display
      this.viewManager.updateQuestionCount(this.stateManager.getState());
    } catch (error) {
      console.error('Toggle question source error:', error);
    }
  }

  // Handle JSON file upload
  async handleJSONUpload(event) {
    const file = event.target.files[0];
    const statusElement = document.getElementById('json-status');
    
    if (!file) {
      if (statusElement) {
        statusElement.classList.add('hidden');
      }
      return;
    }

    // File type validation
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    const allowedExtensions = ['json', 'txt'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      if (statusElement) {
        statusElement.classList.remove('hidden', 'success', 'loading');
        statusElement.classList.add('error');
        statusElement.innerHTML = `
          <div>❌ Invalid file type:</div>
          <ul><li>Only .json and .txt files are supported</li></ul>
        `;
      }
      return;
    }

    try {
      if (statusElement) {
        statusElement.classList.remove('hidden', 'success', 'error');
        statusElement.innerHTML = `<div class="loading">Processing ${fileExtension.toUpperCase()} file...</div>`;
      }

      const result = await this.questionManager.loadFromFile(file);

      if (result.success) {
        this.stateManager.setCustomQuestions(result.questions);

        if (statusElement) {
          statusElement.classList.add('success');
          statusElement.innerHTML = `<div>✅ Successfully loaded ${result.count} questions from ${fileExtension.toUpperCase()} file</div>`;
        }

        this.viewManager.updateQuestionCount(this.stateManager.getState());
      }
    } catch (error) {
      console.error('File upload error:', error);
      
      if (statusElement) {
        statusElement.classList.add('error');
        statusElement.innerHTML = `
          <div>❌ Failed to load ${fileExtension.toUpperCase()} file:</div>
          <ul><li>${error.error || error.message}</li></ul>
        `;
      }

      // Reset to default questions
      this.stateManager.updateState({ questionSource: 'default', customQuestions: null });
      const questionSourceSelect = document.getElementById('question-source');
      if (questionSourceSelect) {
        questionSourceSelect.value = 'default';
      }
      this.viewManager.updateQuestionCount(this.stateManager.getState());
    }
  }

  // Download example JSON
  downloadExampleJSON() {
    try {
      const exampleData = this.questionManager.getExampleJSON();
      Utils.exportJSON(exampleData, 'example-questions.json');
    } catch (error) {
      console.error('Download example JSON error:', error);
      this.showError('Failed to download example JSON');
    }
  }

  // Export test results
  exportResults() {
    try {
      const state = this.stateManager.getState();
      const results = this.stateManager.getResults();
      
      const exportData = {
        testInfo: {
          date: new Date(state.testStart).toISOString(),
          duration: state.testDuration,
          mode: state.isRRBMode ? 'RRB' : 'Standard',
          questionSource: state.questionSource
        },
        results: results,
        answers: state.answers,
        timeSpent: state.timeSpent,
        bookmarked: state.bookmarked
      };
      
      const filename = `Units_Measurements_Test_Results_${new Date().toISOString().split('T')[0]}.json`;
      Utils.exportJSON(exportData, filename);
    } catch (error) {
      console.error('Export results error:', error);
      this.showError('Failed to export results');
    }
  }

  // Apply filter to results table
  applyResultsFilter(filter) {
    try {
      // Update active filter button
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('filter-btn--active');
      });
      
      const activeButton = document.querySelector(`[data-filter="${filter}"]`);
      if (activeButton) {
        activeButton.classList.add('filter-btn--active');
      }
      
      // Get current results and re-populate table with filter
      const results = this.stateManager.getResults();
      if (results && results.questionResults) {
        this.testManager.populateResultsTable(results.questionResults, filter);
      }
    } catch (error) {
      console.error('Apply results filter error:', error);
    }
  }

  // Update UI based on current state
  updateUI() {
    try {
      const state = this.stateManager.getState();
      this.viewManager.updateLandingView(state);
    } catch (error) {
      console.error('Update UI error:', error);
    }
  }

  // Show error message
  showError(message) {
    // Simple error display - you can enhance this
    alert(message);
    console.error(message);
  }

  // Get current questions
  getCurrentQuestions() {
    const state = this.stateManager.getState();
    return state.customQuestions || window.DEFAULT_QUESTIONS || [];
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MockTestApp();
  window.app.init().catch(error => {
    console.error('Failed to initialize app:', error);
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockTestApp;
}
