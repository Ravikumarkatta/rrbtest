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

      // Solution analysis view event listeners
      this.setupSolutionAnalysisEventListeners();
      
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

    // Dashboard button
    const dashboardBtn = document.getElementById('view-dashboard-btn');
    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', () => this.viewDashboard());
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

    // File management tabs
    const uploadTab = document.getElementById('upload-tab');
    const browseTab = document.getElementById('browse-tab');
    if (uploadTab) {
      uploadTab.addEventListener('click', () => this.switchTab('upload'));
    }
    if (browseTab) {
      browseTab.addEventListener('click', () => this.switchTab('browse'));
    }

    // File browser controls
    const refreshFilesBtn = document.getElementById('refresh-files');
    if (refreshFilesBtn) {
      refreshFilesBtn.addEventListener('click', () => this.refreshFileList());
    }

    const fileSearch = document.getElementById('file-search');
    if (fileSearch) {
      fileSearch.addEventListener('input', (e) => this.handleFileSearch(e));
    }

    const subjectFilter = document.getElementById('subject-filter');
    if (subjectFilter) {
      subjectFilter.addEventListener('change', (e) => this.handleSubjectFilter(e));
    }

    // Pagination controls
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => this.handlePagination('prev'));
    }
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => this.handlePagination('next'));
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
        this.testManager.initializeSolutionAnalysis();
        this.viewManager.showView('solution-analysis');
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

  // Setup solution analysis view event listeners
  setupSolutionAnalysisEventListeners() {
    // Back to results button
    const backBtn = document.getElementById('analysis-back-to-results-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.viewManager.showView('result'));
    }

    // Filter buttons
    const filterContainer = document.querySelector('#solution-analysis-view .analysis-controls');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                // Update active class
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.testManager.applySolutionFilters();
            }
        });
    }

    // Topic and Difficulty dropdowns
    const topicSelect = document.getElementById('topic-filter-select');
    if (topicSelect) {
        topicSelect.addEventListener('change', () => this.testManager.applySolutionFilters());
    }

    const difficultySelect = document.getElementById('difficulty-filter-select');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => this.testManager.applySolutionFilters());
    }

    // Navigation buttons
    const prevBtn = document.getElementById('prev-solution-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => this.testManager.navigateSolution(-1));
    }

    const nextBtn = document.getElementById('next-solution-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => this.testManager.navigateSolution(1));
    }
    
    // Jump to question modal
    const jumpBtn = document.getElementById('jump-to-question-btn');
    if (jumpBtn) {
        jumpBtn.addEventListener('click', () => this.testManager.showJumpToQuestionModal());
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
      
      // Update test display with file information if available
      this.updateTestFileDisplay();
      
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

  // View dashboard
  viewDashboard() {
    try {
      this.viewManager.showView('dashboard');
    } catch (error) {
      console.error('View dashboard error:', error);
      this.showError('Failed to load dashboard');
    }
  }

  // Update test file display in header
  updateTestFileDisplay() {
    const state = this.stateManager.getState();
    const testFileInfo = document.getElementById('test-file-info');
    const testFileName = document.getElementById('test-file-name');
    const testSectionName = document.getElementById('test-section-name');

    if (!testFileInfo || !testFileName || !testSectionName) return;

    // Show file info if we have a loaded file from database
    if (state.currentFileId && state.currentFileName) {
      testFileName.textContent = state.currentFileName;
      
      // Get section name from the questions metadata or file data
      let sectionName = 'Test Section';
      if (state.customQuestions && state.customQuestions.length > 0) {
        // Try to get section from the first question's metadata
        const firstQuestion = state.customQuestions[0];
        if (firstQuestion.metadata && firstQuestion.metadata.section) {
          sectionName = firstQuestion.metadata.section;
        } else if (firstQuestion.subject) {
          sectionName = firstQuestion.subject;
        } else if (firstQuestion.topic) {
          sectionName = firstQuestion.topic;
        }
      }
      
      testSectionName.textContent = sectionName;
      testFileInfo.style.display = 'flex';
    } else if (state.questionSource === 'json' && state.customQuestions) {
      // For locally uploaded JSON files
      testFileName.textContent = 'Custom Test File';
      testSectionName.textContent = state.customQuestions[0]?.topic || 'Custom Section';
      testFileInfo.style.display = 'flex';
    } else {
      // Hide file info for default questions
      testFileInfo.style.display = 'none';
    }
  }

  // Resume existing test
  resumeTest() {
    try {
      // Update test display with file information if available
      this.updateTestFileDisplay();
      
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
      // Switch to detailed solution analysis view instead of review answers
      this.viewManager.showView('solution-analysis');
      
      // Navigate to the specific question in solution analysis
      // This will find the question in the filtered list and set it as active
      if (this.testManager && typeof this.testManager.navigateToSolutionQuestion === 'function') {
        this.testManager.navigateToSolutionQuestion(questionNumber);
      } else {
        console.warn('navigateToSolutionQuestion method not available, using fallback');
        // Fallback: initialize solution analysis and try to find the question
        this.testManager.applySolutionFilters();
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
    const saveToCloud = document.getElementById('save-to-cloud')?.checked || false;
    
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
        statusElement.classList.add('loading');
        statusElement.innerHTML = `<div class="loading-message">
          <div class="loading-spinner"></div>
          <span>Processing ${fileExtension.toUpperCase()} file...</span>
        </div>`;
      }

      const result = await this.questionManager.loadFromFile(file);

      if (result.success) {
        this.stateManager.setCustomQuestions(result.questions);

        if (statusElement) {
          statusElement.classList.remove('loading');
          statusElement.classList.add('success');
          statusElement.innerHTML = `<div class="status-message success">✅ Successfully loaded ${result.count} questions from ${fileExtension.toUpperCase()} file</div>`;
        }

        // Show toast notification
        Utils.showSuccess(`Successfully loaded ${result.count} questions from ${fileExtension.toUpperCase()} file`);

        // Save to cloud if enabled and API is available
        if (saveToCloud && window.MockTestAPI) {
          // Validate Subject and Chapter are provided for cloud save
          const subjectInput = document.getElementById('upload-subject');
          const chapterInput = document.getElementById('upload-chapter');
          const selectedSubject = subjectInput?.value?.trim() || '';
          const selectedChapter = chapterInput?.value?.trim() || '';
          
          if (!selectedSubject || !selectedChapter) {
            if (statusElement) {
              statusElement.innerHTML += `<div class="status-message error">❌ Please enter Subject and Chapter before saving to cloud.</div>`;
            }
            Utils.showError('Please enter Subject and Chapter before saving to cloud.');
            return; // Don't proceed with cloud save
          }
          
          try {
            const api = new window.MockTestAPI();
            const fileJson = await this.prepareFileForUpload(file, result);
            const savedFile = await api.addTestFile(file.name, fileJson);
            
            if (statusElement) {
              statusElement.innerHTML += `<div class="status-message success">💾 Saved to cloud database with ID: ${savedFile.id}</div>`;
            }
            
            // Show toast notification for cloud save
            Utils.showSuccess(`Saved to cloud database with ID: ${savedFile.id}`);
            
            // Refresh file list if browse tab is active
            if (document.getElementById('browse-content')?.classList.contains('active')) {
              this.refreshFileList();
            }
          } catch (cloudError) {
            console.warn('Failed to save to cloud:', cloudError);
            if (statusElement) {
              statusElement.innerHTML += `<div class="status-message warning">⚠️ Loaded locally but failed to save to cloud: ${cloudError.message}</div>`;
            }
          }
        }

        this.viewManager.updateQuestionCount(this.stateManager.getState());
      }
    } catch (error) {
      console.error('File upload error:', error);
      
      if (statusElement) {
        statusElement.classList.remove('loading');
        statusElement.classList.add('error');
        statusElement.innerHTML = `
          <div class="status-message error">❌ Failed to load ${fileExtension.toUpperCase()} file:</div>
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

  // Infer question type if not present
  inferQuestionType(question) {
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

  // Prepare file data for upload to backend
  async prepareFileForUpload(file, result) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        try {
          const rawData = JSON.parse(event.target.result);
          
          // Get subject and chapter from UI inputs
          const subjectInput = document.getElementById('upload-subject');
          const chapterInput = document.getElementById('upload-chapter');
          const selectedSubject = subjectInput?.value?.trim() || '';
          const selectedChapter = chapterInput?.value?.trim() || '';
          
          // Transform to the backend expected format
          const fileJson = {
            section: rawData.section || selectedSubject || rawData.metadata?.subject || 'Unknown Section',
            total_questions: rawData.total_questions || rawData.questions?.length || 0,
            time_limit: rawData.time_limit || rawData.metadata?.time_limit || 60,
            target_score: rawData.target_score || rawData.metadata?.target_score || '75%',
            metadata: {
              subject: selectedSubject || rawData.section || rawData.metadata?.subject || 'Unknown Section',
              chapter: selectedChapter || rawData.metadata?.chapter || '',
              // Preserve any existing metadata
              ...rawData.metadata
            },
            questions: rawData.questions?.map(q => ({
              id: q.id || `q${Math.random().toString(36).substr(2, 9)}`,
              text: q.text || q.question,
              type: q.type || this.inferQuestionType(q),
              options: q.options || [],
              correct_answer: q.correct_answer || q.correctAnswer,
              points: q.points || 10,
              category: q.category || q.topic || 'General',
              difficulty: q.difficulty || 'medium',
              time_limit: q.time_limit || q.timeLimit || 60,
              solution: q.solution || ''
            })) || [],
            scoring: rawData.scoring || rawData.scoring_rules || {
              total_points: (rawData.questions?.length || 0) * 10,
              passing_score: Math.round((rawData.questions?.length || 0) * 6),
              grade_scale: {
                "A": "80-100",
                "B": "60-79", 
                "C": "40-59",
                "F": "0-39"
              }
            },
            instructions: rawData.instructions || rawData.metadata?.instructions || {
              time_management: "Manage your time effectively",
              difficulty_distribution: { "easy": "20", "medium": "60", "hard": "20" },
              category_distribution: {}
            }
          };
          
          resolve(fileJson);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Switch between upload and browse tabs
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`)?.classList.add('active');

    // Load files if switching to browse tab
    if (tabName === 'browse') {
      this.refreshFileList();
    }
  }

  // Refresh file list from backend
  async refreshFileList() {
    const fileList = document.getElementById('file-list');
    const subjectFilter = document.getElementById('subject-filter');
    
    if (!fileList) return;

    try {
      fileList.innerHTML = `<div class="loading-message">
        <div class="loading-spinner"></div>
        <span>Loading saved files...</span>
      </div>`;

      const api = new window.MockTestAPI();
      const response = await api.listTestFiles(50, 0);
      
      if (!response.files || response.files.length === 0) {
        fileList.innerHTML = `<div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
          </svg>
          <p>No test files found.</p>
          <p>Upload your first test file using the "Upload New File" tab.</p>
        </div>`;
        return;
      }

      // Update subject filter
      this.updateSubjectFilter(response.files);

      // Store files for filtering
      this.allFiles = response.files;
      this.displayFiles(response.files);

    } catch (error) {
      console.error('Failed to load files:', error);
      fileList.innerHTML = `<div class="error-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>Failed to load files: ${error.message}</span>
      </div>`;
    }
  }

  // Display files in the list with improved metadata extraction
  displayFiles(files) {
    const fileList = document.getElementById('file-list');
    
    fileList.innerHTML = files.map(file => {
      const uploadDate = new Date(file.uploaded_at).toLocaleDateString();
      const fileJson = file.file_json || {};
      
      // Extract subject with fallbacks
      const subject = fileJson.metadata?.subject || fileJson.section || 'Unknown Subject';
      
      // Extract chapter with fallbacks
      const chapter = fileJson.metadata?.chapter || 
                     (fileJson.instructions?.category_distribution ? Object.keys(fileJson.instructions.category_distribution)[0] : '') ||
                     '';
      
      // Extract question count with fallbacks
      const questionCount = fileJson.questions?.length || fileJson.total_questions || 0;
      
      return `
        <div class="file-item" data-file-id="${file.id}">
          <div class="file-info">
            <h4 class="file-name">${file.file_name}</h4>
            <div class="file-details">
              <div class="file-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>${subject}</span>
              </div>
              ${chapter ? `<div class="file-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>${chapter}</span>
              </div>` : ''}
              <div class="file-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                <span>${questionCount} questions</span>
              </div>
              <div class="file-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${uploadDate}</span>
              </div>
            </div>
          </div>
          <div class="file-actions">
            <button class="file-action-btn load-btn" onclick="window.loadTestFile('${file.id}')" title="Load this test file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17,8 12,3 7,8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Load
            </button>
            <button class="file-action-btn rename-btn" onclick="window.renameTestFile('${file.id}', '${file.file_name}')" title="Rename this file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Rename
            </button>
            <button class="file-action-btn download-btn" onclick="window.downloadTestFile('${file.id}', '${file.file_name}')" title="Download this file as JSON backup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
            <button class="file-action-btn delete-btn" onclick="window.deleteTestFile('${file.id}')" title="Delete this file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update subject filter dropdown with improved metadata extraction
  updateSubjectFilter(files) {
    const subjectFilter = document.getElementById('subject-filter');
    if (!subjectFilter) return;

    const subjects = new Set();
    files.forEach(file => {
      const fileJson = file.file_json || {};
      // Use same extraction logic as display
      const subject = fileJson.metadata?.subject || fileJson.section || 'Unknown Subject';
      subjects.add(subject);
    });

    const currentValue = subjectFilter.value;
    subjectFilter.innerHTML = '<option value="">All Subjects</option>' +
      Array.from(subjects).sort().map(subject => 
        `<option value="${subject}">${subject}</option>`
      ).join('');
    
    // Restore previous selection if it still exists
    if (currentValue && subjects.has(currentValue)) {
      subjectFilter.value = currentValue;
    }
  }

  // Handle file search
  handleFileSearch(event) {
    const query = event.target.value.toLowerCase();
    this.filterAndDisplayFiles();
  }

  // Handle subject filter
  handleSubjectFilter(event) {
    this.filterAndDisplayFiles();
  }

  // Filter and display files based on search and filter
  filterAndDisplayFiles() {
    if (!this.allFiles) return;

    const searchQuery = document.getElementById('file-search')?.value.toLowerCase() || '';
    const subjectFilter = document.getElementById('subject-filter')?.value || '';

    const filteredFiles = this.allFiles.filter(file => {
      const fileName = file.file_name.toLowerCase();
      const subject = file.file_json?.section || 'Unknown Subject';
      const chapter = file.file_json?.instructions?.category_distribution 
        ? Object.keys(file.file_json.instructions.category_distribution).join(' ').toLowerCase()
        : '';

      const matchesSearch = !searchQuery || 
        fileName.includes(searchQuery) || 
        subject.toLowerCase().includes(searchQuery) ||
        chapter.includes(searchQuery);

      const matchesSubject = !subjectFilter || subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });

    this.displayFiles(filteredFiles);
  }

  // Handle pagination (placeholder for future implementation)
  handlePagination(direction) {
    console.log('Pagination:', direction);
    // TODO: Implement pagination logic
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
    Utils.showError(message);
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

// Global functions for file management
window.loadTestFile = async function(id) {
  try {
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('hidden', 'error');
      statusElement.classList.add('loading');
      statusElement.innerHTML = `<div class="loading-message">
        <div class="loading-spinner"></div>
        <span>Loading test file...</span>
      </div>`;
    }

    const api = new window.MockTestAPI();
    const fileData = await api.fetchTestFile(id);
    
    // Validate file data
    if (!fileData || !fileData.file_json) {
      throw new Error('Invalid file data received from server');
    }

    // Parse and load questions using enhanced question manager
    const manager = new EnhancedQuestionManager();
    let questions;
    
    try {
      questions = manager.parseQuestions(fileData.file_json, fileData.file_name);
    } catch (parseError) {
      throw new Error(`Failed to parse test file: ${parseError.message}`);
    }
    
    if (!questions || questions.length === 0) {
      throw new Error('No valid questions found in the test file');
    }
    
    // Load into app
    if (window.app && window.app.stateManager) {
      window.app.stateManager.setCustomQuestions(questions);
      window.app.stateManager.updateState({ 
        questionSource: 'database',
        currentFileId: id,
        currentFileName: fileData.file_name,
        currentFileData: fileData.file_json // Store full file data for result saving
      });
      
      if (window.app.viewManager) {
        window.app.viewManager.updateQuestionCount(window.app.stateManager.getState());
      }
      
      if (statusElement) {
        statusElement.classList.remove('loading');
        statusElement.classList.add('success');
        statusElement.innerHTML = `<div class="status-message success">✅ Successfully loaded "${fileData.file_name}" with ${questions.length} questions</div>`;
      }

      // Show toast notification
      Utils.showSuccess(`Successfully loaded "${fileData.file_name}" with ${questions.length} questions`);

      // Switch to upload tab to show status
      if (window.app.switchTab) {
        window.app.switchTab('upload');
      }
    } else {
      throw new Error('Application not properly initialized');
    }
    
  } catch (error) {
    console.error('Failed to load test file:', error);
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('error');
      let errorMessage = 'Failed to load test file';
      
      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Test file not found. It may have been deleted.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to access this file.';
      } else if (error.message.includes('parse') || error.message.includes('Invalid file data')) {
        errorMessage = 'Test file is corrupted or in an invalid format.';
      } else if (error.message.includes('No valid questions')) {
        errorMessage = 'This test file does not contain any valid questions.';
      } else {
        errorMessage = `Failed to load test file: ${error.message}`;
      }
      
      statusElement.innerHTML = `<div class="status-message error">❌ ${errorMessage}</div>`;
    }
  }
};

window.deleteTestFile = async function(id) {
  // Get file info for better confirmation dialog
  let fileName = 'this test file';
  try {
    const api = new window.MockTestAPI();
    const fileData = await api.fetchTestFile(id);
    fileName = `"${fileData.file_name}"`;
  } catch (error) {
    // Continue with generic name if we can't fetch file info
    console.warn('Could not fetch file details for confirmation:', error);
  }
  
  if (!confirm(`Are you sure you want to delete ${fileName}? This action cannot be undone.`)) {
    return;
  }
  
  try {
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('hidden', 'error');
      statusElement.classList.add('loading');
      statusElement.innerHTML = `<div class="loading-message">
        <div class="loading-spinner"></div>
        <span>Deleting ${fileName}...</span>
      </div>`;
    }

    const api = new window.MockTestAPI();
    await api.deleteTestFile(id);
    
    // Refresh the file list
    if (window.app && window.app.refreshFileList) {
      window.app.refreshFileList();
    }
    
    // Show success message
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('success');
      statusElement.innerHTML = `<div class="status-message success">✅ Test file deleted successfully</div>`;
      
      // Hide message after 3 seconds
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 3000);
    }
    
    // Show toast notification
    Utils.showSuccess('Test file deleted successfully');
    
  } catch (error) {
    console.error('Failed to delete test file:', error);
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('error');
      let errorMessage = 'Failed to delete test file';
      
      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Test file not found. It may have already been deleted.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to delete this file.';
      } else {
        errorMessage = `Failed to delete test file: ${error.message}`;
      }
      
      statusElement.innerHTML = `<div class="status-message error">❌ ${errorMessage}</div>`;
    }
  }
};

window.renameTestFile = async function(id, currentName) {
  const newName = prompt('Enter new name for the test file:', currentName);
  if (!newName || newName.trim() === '' || newName === currentName) {
    return;
  }
  
  // Basic validation
  const trimmedName = newName.trim();
  if (trimmedName.length < 1) {
    Utils.showError('File name cannot be empty.');
    return;
  }
  if (trimmedName.length > 255) {
    Utils.showError('File name is too long. Please use a shorter name.');
    return;
  }
  
  // Check for invalid characters (basic check)
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmedName)) {
    Utils.showError('File name contains invalid characters. Please avoid: < > : " / \\ | ? *');
    return;
  }
  
  try {
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('hidden', 'error');
      statusElement.classList.add('loading');
      statusElement.innerHTML = `<div class="loading-message">
        <div class="loading-spinner"></div>
        <span>Renaming "${currentName}" to "${trimmedName}"...</span>
      </div>`;
    }

    const api = new window.MockTestAPI();
    await api.renameTestFile(id, trimmedName);
    
    // Refresh the file list
    if (window.app && window.app.refreshFileList) {
      window.app.refreshFileList();
    }
    
    // Show success message
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('success');
      statusElement.innerHTML = `<div class="status-message success">✅ Test file renamed to "${trimmedName}"</div>`;
      
      // Hide message after 3 seconds
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 3000);
    }
    
    // Show toast notification
    Utils.showSuccess(`Test file renamed to "${trimmedName}"`);
    
  } catch (error) {
    console.error('Failed to rename test file:', error);
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('error');
      let errorMessage = 'Failed to rename test file';
      
      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Test file not found. It may have been deleted.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to rename this file.';
      } else if (error.message.includes('duplicate') || error.message.includes('exists')) {
        errorMessage = 'A file with this name already exists. Please choose a different name.';
      } else {
        errorMessage = `Failed to rename test file: ${error.message}`;
      }
      
      statusElement.innerHTML = `<div class="status-message error">❌ ${errorMessage}</div>`;
    }
  }
};

window.downloadTestFile = async function(id, fileName) {
  try {
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('hidden', 'error');
      statusElement.classList.add('loading');
      statusElement.innerHTML = `<div class="loading-message">
        <div class="loading-spinner"></div>
        <span>Downloading "${fileName}"...</span>
      </div>`;
    }

    const api = new window.MockTestAPI();
    const fileData = await api.fetchTestFile(id);
    
    // Validate file data
    if (!fileData || !fileData.file_json) {
      throw new Error('Invalid file data received from server');
    }
    
    // Create download with proper filename
    let downloadFileName = fileName;
    if (!downloadFileName.toLowerCase().endsWith('.json')) {
      downloadFileName = `${downloadFileName}.json`;
    }
    
    // Create well-formatted JSON content
    const jsonContent = JSON.stringify(fileData.file_json, null, 2);
    
    // Validate JSON before download
    try {
      JSON.parse(jsonContent);
    } catch (jsonError) {
      throw new Error('File contains invalid JSON data');
    }
    
    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = downloadFileName;
    downloadLink.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up blob URL
    URL.revokeObjectURL(url);
    
    // Show success message
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('success');
      statusElement.innerHTML = `<div class="status-message success">✅ Downloaded "${downloadFileName}" successfully</div>`;
      
      // Hide message after 3 seconds
      setTimeout(() => {
        statusElement.classList.add('hidden');
      }, 3000);
    }
    
    // Show toast notification
    Utils.showSuccess(`Downloaded "${downloadFileName}" successfully`);
    
  } catch (error) {
    console.error('Failed to download test file:', error);
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.classList.remove('loading');
      statusElement.classList.add('error');
      let errorMessage = 'Failed to download test file';
      
      // Provide more specific error messages
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Test file not found. It may have been deleted.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to access this file.';
      } else if (error.message.includes('Invalid file data') || error.message.includes('invalid JSON')) {
        errorMessage = 'Test file is corrupted or in an invalid format.';
      } else {
        errorMessage = `Failed to download test file: ${error.message}`;
      }
      
      statusElement.innerHTML = `<div class="status-message error">❌ ${errorMessage}</div>`;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockTestApp;
}