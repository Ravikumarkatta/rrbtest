// Test Management Module - FIXED VERSION
// Handles test execution, question display, navigation, and timing
// Key fixes: 40-second question timer, proper progress bars, memory leak prevention

class TestManager {
  constructor(stateManager, viewManager, questionManager) {
    // Validate required dependencies
    if (!stateManager || !viewManager) {
      throw new Error('StateManager and ViewManager are required dependencies');
    }
    
    this.stateManager = stateManager;
    this.viewManager = viewManager;
    this.questionManager = questionManager;
    
    // Timer instances
    this.mainTimer = null;
    this.questionTimer = null;
    this.questionStartTime = null;
    this.autoSaveInterval = null;
    this.customMainTimer = null;
    this.customQuestionTimer = null;
    
    // FIXED: Add question timer configuration
    this.QUESTION_TIME_LIMIT = 40; // 40 seconds per question
    this.questionRemainingTime = this.QUESTION_TIME_LIMIT * 1000; // milliseconds
    
    // Timer DOM elements cache
    this.timerElements = {};
    
    // Add cleanup flag to prevent operations after destruction
    this.isDestroyed = false;

    // Add new properties for solution analysis
    this.filteredSolutionQuestions = [];
    this.currentSolutionIndex = 0;
    
    // Bind methods to preserve context
    this.submitTest = this.submitTest.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.previousQuestion = this.previousQuestion.bind(this);
    this.toggleBookmark = this.toggleBookmark.bind(this);
    this.clearAnswer = this.clearAnswer.bind(this);
  }

  // Cleanup method to prevent memory leaks
  destroy() {
    this.isDestroyed = true;
    this.stopAllTimers();
    this.clearAutoSave();
    this.timerElements = {};
  }

  // Check if manager is still valid
  isValid() {
    return !this.isDestroyed && this.stateManager && this.viewManager;
  }

  // Stop all timers safely
  stopAllTimers() {
    try {
      // Clear standard timers
      if (this.mainTimer) {
        clearInterval(this.mainTimer);
        this.mainTimer = null;
      }
      
      if (this.questionTimer) {
        clearInterval(this.questionTimer);
        this.questionTimer = null;
      }
      
      // Clear custom timers
      if (this.customMainTimer && typeof this.customMainTimer.stop === 'function') {
        this.customMainTimer.stop();
        this.customMainTimer = null;
      }
      
      if (this.customQuestionTimer && typeof this.customQuestionTimer.stop === 'function') {
        this.customQuestionTimer.stop();
        this.customQuestionTimer = null;
      }
      
      // Hide progress bars safely
      this.hideProgressBars();
    } catch (error) {
      console.error('Error stopping timers:', error);
    }
  }

  // Safely hide progress bars
  hideProgressBars() {
    try {
      if (this.timerElements.mainTimerProgress) {
        this.timerElements.mainTimerProgress.classList.add('hidden');
      }
      if (this.timerElements.questionTimerProgress) {
        this.timerElements.questionTimerProgress.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error hiding progress bars:', error);
    }
  }

  // Clear auto-save interval safely
  clearAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Initialize timer elements and cache them
  initializeTimerElements() {
    if (!this.isValid()) return;
    
    try {
      this.timerElements = {
        mainTimer: document.getElementById('main-timer'),
        mainTimerProgress: document.getElementById('main-timer-progress'),
        questionTimer: document.getElementById('question-timer'),
        questionTimerProgress: document.getElementById('question-timer-progress')
      };
      
      // Create timer elements if they don't exist
      this.ensureTimerElementsExist();
    } catch (error) {
      console.error('Initialize timer elements error:', error);
    }
  }

  // Ensure timer elements exist in DOM
  ensureTimerElementsExist() {
    const testView = document.getElementById('test-view');
    if (!testView) {
      console.warn('Test view not found, cannot create timer elements');
      return;
    }

    try {
      // Create main timer if it doesn't exist
      if (!this.timerElements.mainTimer) {
        this.createMainTimerElement(testView);
      }

      // Create question timer if it doesn't exist
      if (!this.timerElements.questionTimer) {
        this.createQuestionTimerElement(testView);
      }
    } catch (error) {
      console.error('Error creating timer elements:', error);
    }
  }

  // Create main timer element
  createMainTimerElement(testView) {
    const timerContainer = testView.querySelector('.timer-section') || 
                          testView.querySelector('.test-header') ||
                          testView.querySelector('.header');
    
    if (timerContainer) {
      const mainTimerDiv = document.createElement('div');
      mainTimerDiv.className = 'main-timer-container';
      mainTimerDiv.innerHTML = `
        <div class="timer-display">
          <span class="timer-label">Time Remaining:</span>
          <span id="main-timer" class="timer-value">00:00</span>
        </div>
        <div id="main-timer-progress" class="timer-progress hidden">
          <div class="progress-bar"></div>
        </div>
      `;
      timerContainer.appendChild(mainTimerDiv);
      this.timerElements.mainTimer = document.getElementById('main-timer');
      this.timerElements.mainTimerProgress = document.getElementById('main-timer-progress');
    }
  }

  // Create question timer element
  createQuestionTimerElement(testView) {
    const questionContainer = testView.querySelector('.question-container') || 
                             testView.querySelector('.question-section') ||
                             testView.querySelector('.content');
    
    if (questionContainer) {
      const questionTimerDiv = document.createElement('div');
      questionTimerDiv.className = 'question-timer-container';
      questionTimerDiv.innerHTML = `
        <div class="timer-display">
          <span class="timer-label">Question Time:</span>
          <span id="question-timer" class="timer-value">00:40</span>
        </div>
        <div id="question-timer-progress" class="timer-progress hidden">
          <div class="progress-bar"></div>
        </div>
      `;
      questionContainer.insertBefore(questionTimerDiv, questionContainer.firstChild);
      this.timerElements.questionTimer = document.getElementById('question-timer');
      this.timerElements.questionTimerProgress = document.getElementById('question-timer-progress');
    }
  }

  // Start test timer (unchanged main timer logic)
  startMainTimer() {
    if (!this.isValid()) return;
    
    try {
      // Stop any existing timer first
      this.stopMainTimer();
      
      this.initializeTimerElements();
      const state = this.stateManager.getState();
      
      if (state && state.enhancedTimer) {
        this.startEnhancedMainTimer();
      } else {
        this.startBasicMainTimer();
      }
    } catch (error) {
      console.error('Start main timer error:', error);
    }
  }

  // Stop main timer safely
  stopMainTimer() {
    try {
      if (this.mainTimer) {
        clearInterval(this.mainTimer);
        this.mainTimer = null;
      }
      
      if (this.customMainTimer && typeof this.customMainTimer.stop === 'function') {
        this.customMainTimer.stop();
        this.customMainTimer = null;
      }
      
      if (this.timerElements.mainTimerProgress) {
        this.timerElements.mainTimerProgress.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error stopping main timer:', error);
    }
  }

  // Start enhanced main timer with progress and alerts
  startEnhancedMainTimer() {
    this.stopMainTimer();
    
    const state = this.stateManager.getState();
    if (!state || !state.testDuration) {
      console.error('Invalid state or missing test duration');
      return;
    }
    
    const timerElement = this.timerElements.mainTimer;
    const progressElement = this.timerElements.mainTimerProgress;
    
    if (!timerElement) {
      console.warn('Main timer element not found, falling back to basic timer');
      this.startBasicMainTimer();
      return;
    }
    
    if (progressElement) {
      progressElement.classList.remove('hidden');
    }
    
    // Use a simple enhanced timer if CustomTimer is not available
    if (typeof CustomTimer !== 'undefined') {
      try {
        this.customMainTimer = new CustomTimer({
          duration: state.testDuration,
          element: timerElement,
          progressElement: progressElement,
          audioAlert: true,
          visualAlert: true,
          warningThresholds: [10, 5, 2],
          onComplete: () => {
            if (this.isValid()) {
              this.submitTest();
            }
          },
          onWarning: (threshold) => {
            console.log(`Timer warning: ${threshold} minutes remaining`);
          }
        });
        
        this.customMainTimer.start();
      } catch (error) {
        console.error('Error creating CustomTimer, falling back:', error);
        this.startEnhancedBasicMainTimer();
      }
    } else {
      // Fallback to basic timer with enhanced features
      this.startEnhancedBasicMainTimer();
    }
  }

  // Enhanced basic main timer (fallback)
  startEnhancedBasicMainTimer() {
    this.stopMainTimer();
    
    const state = this.stateManager.getState();
    if (!state || !state.testDuration || !state.testStart) {
      console.error('Invalid state for timer');
      return;
    }
    
    const timerElement = this.timerElements.mainTimer;
    const progressElement = this.timerElements.mainTimerProgress;
    const totalDuration = state.testDuration * 60 * 1000;
    
    if (progressElement) {
      progressElement.classList.remove('hidden');
    }
    
    this.mainTimer = setInterval(() => {
      if (!this.isValid()) {
        this.stopMainTimer();
        return;
      }
      
      const elapsed = Date.now() - state.testStart;
      const remaining = totalDuration - elapsed;
      
      if (remaining <= 0) {
        this.submitTest();
        return;
      }
      
      const timeString = this.formatTime(remaining);
      if (timerElement) {
        timerElement.textContent = timeString;
        
        // Add warning classes
        timerElement.classList.remove('warning', 'danger');
        if (remaining < 5 * 60 * 1000) {
          timerElement.classList.add('danger');
        } else if (remaining < 10 * 60 * 1000) {
          timerElement.classList.add('warning');
        }
      }
      
      // Update progress bar
      if (progressElement) {
        const progressBar = progressElement.querySelector('.progress-bar');
        if (progressBar) {
          const percentage = Math.max(0, Math.min(100, ((totalDuration - remaining) / totalDuration) * 100));
          progressBar.style.width = `${percentage}%`;
        }
      }
    }, 1000);
  }

  // Start basic main timer
  startBasicMainTimer() {
    this.stopMainTimer();
    
    const state = this.stateManager.getState();
    if (!state || !state.testDuration || !state.testStart) {
      console.error('Invalid state for basic timer');
      return;
    }
    
    const timerElement = this.timerElements.mainTimer;
    
    if (!timerElement) {
      console.warn('Main timer element not found');
      return;
    }
    
    this.mainTimer = setInterval(() => {
      if (!this.isValid()) {
        this.stopMainTimer();
        return;
      }
      
      const elapsed = Date.now() - state.testStart;
      const remaining = (state.testDuration * 60 * 1000) - elapsed;
      
      if (remaining <= 0) {
        this.submitTest();
        return;
      }
      
      const timeString = this.formatTime(remaining);
      timerElement.textContent = timeString;
      
      // Add warning classes
      timerElement.classList.remove('warning', 'danger');
      if (remaining < 5 * 60 * 1000) {
        timerElement.classList.add('danger');
      } else if (remaining < 10 * 60 * 1000) {
        timerElement.classList.add('warning');
      }
    }, 1000);
  }

  // FIXED: Start question timer with 40-second countdown
  startQuestionTimer() {
    if (!this.isValid()) return;
    
    try {
      // CRITICAL: Stop any existing question timer first
      this.stopQuestionTimer();
      
      this.initializeTimerElements();
      const state = this.stateManager.getState();
      
      if (state && state.enhancedTimer) {
        this.startEnhancedQuestionTimer();
      } else {
        this.startBasicQuestionTimer();
      }
    } catch (error) {
      console.error('Start question timer error:', error);
    }
  }

  // FIXED: Enhanced question timer with proper 40-second countdown
  startEnhancedQuestionTimer() {
    // Ensure complete cleanup
    this.stopQuestionTimer();
    
    const timerElement = this.timerElements.questionTimer;
    const progressElement = this.timerElements.questionTimerProgress;
    
    if (!timerElement) {
      console.warn('Question timer element not found, falling back to basic timer');
      this.startBasicQuestionTimer();
      return;
    }
    
    if (progressElement) {
      progressElement.classList.remove('hidden');
    }
    
    // FIXED: Use consistent 40-second limit
    this.questionStartTime = Date.now();
    this.questionRemainingTime = this.QUESTION_TIME_LIMIT * 1000;
    const currentQuestionIndex = this.stateManager.getCurrentQuestion();
    
    // Use CustomTimer if available, otherwise fallback
    if (typeof CustomTimer !== 'undefined') {
      try {
        // FIXED: Convert 40 seconds to minutes correctly for CustomTimer
        this.customQuestionTimer = new CustomTimer({
          duration: this.QUESTION_TIME_LIMIT / 60, // Convert to minutes: 40/60 = 0.667 minutes
          element: timerElement,
          progressElement: progressElement,
          audioAlert: false, // No audio for question timer
          visualAlert: true,
          warningThresholds: [0.33, 0.17], // 20 seconds (0.33 min) and 10 seconds (0.17 min)
          onTick: (remaining) => {
            if (this.isValid() && this.questionStartTime) {
              // Update remaining time for other methods
              this.questionRemainingTime = remaining;
              
              // Update time spent tracking
              const elapsed = Math.floor((Date.now() - this.questionStartTime) / 1000);
              this.stateManager.updateTimeSpent(currentQuestionIndex, elapsed);
            }
          },
          onComplete: () => {
            // FIXED: Show "Time Up!" instead of auto-advancing
            if (timerElement && !this.isDestroyed) {
              timerElement.textContent = 'Time Up!';
              timerElement.classList.add('danger');
            }
            this.questionRemainingTime = 0;
            console.log('Question timer expired - Time Up!');
          }
        });
        
        this.customQuestionTimer.start();
      } catch (error) {
        console.error('Error creating custom question timer:', error);
        this.startBasicQuestionTimer();
      }
    } else {
      // Use basic fallback implementation
      this.startBasicQuestionTimer();
    }
  }

  // FIXED: Basic question timer with proper 40-second countdown
  startBasicQuestionTimer() {
    // Ensure complete cleanup first
    this.stopQuestionTimer();
    
    const timerElement = this.timerElements.questionTimer;
    const progressElement = this.timerElements.questionTimerProgress;
    
    if (!timerElement) {
      console.warn('Question timer element not found');
      return;
    }
    
    // FIXED: Initialize timer state correctly
    this.questionStartTime = Date.now();
    this.questionRemainingTime = this.QUESTION_TIME_LIMIT * 1000; // 40 seconds in ms
    const totalDuration = this.QUESTION_TIME_LIMIT * 1000;
    const currentQuestionIndex = this.stateManager.getCurrentQuestion();
    
    // Show progress bar
    if (progressElement) {
      progressElement.classList.remove('hidden');
    }
    
    // Start countdown timer with higher frequency for smooth updates
    this.questionTimer = setInterval(() => {
      if (!this.isValid() || !this.questionStartTime) {
        this.stopQuestionTimer();
        return;
      }
      
      const elapsed = Date.now() - this.questionStartTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      
      // Update internal state
      this.questionRemainingTime = remaining;
      
      // Update timer display
      if (timerElement) {
        if (remaining > 0) {
          // FIXED: Show proper countdown format
          const timeString = this.formatQuestionCountdown(remaining);
          timerElement.textContent = timeString;
          
          // FIXED: Add warning classes at correct intervals
          timerElement.classList.remove('warning', 'danger');
          if (remaining <= 10000) { // Last 10 seconds
            timerElement.classList.add('danger');
          } else if (remaining <= 20000) { // Last 20 seconds
            timerElement.classList.add('warning');
          }
        } else {
          // FIXED: Show "Time Up!" when expired
          timerElement.textContent = 'Time Up!';
          timerElement.classList.add('danger');
          console.log('Question timer expired - Time Up!');
        }
      }
      
      // FIXED: Update progress bar to fill as time passes
      if (progressElement && remaining >= 0) {
        const progressBar = progressElement.querySelector('.progress-bar');
        if (progressBar) {
          // Progress goes from 0% to 100% as time passes
          const percentage = Math.min(100, ((totalDuration - remaining) / totalDuration) * 100);
          progressBar.style.width = `${percentage}%`;
          
          // Update progress bar color based on remaining time
          progressBar.classList.remove('progress-warning', 'progress-danger');
          if (remaining <= 10000) {
            progressBar.classList.add('progress-danger');
          } else if (remaining <= 20000) {
            progressBar.classList.add('progress-warning');
          }
        }
      }
      
      // Update time spent tracking
      const elapsedSeconds = Math.floor(elapsed / 1000);
      this.stateManager.updateTimeSpent(currentQuestionIndex, elapsedSeconds);
      
    }, 100); // Update every 100ms for smooth progress bar
  }

  // FIXED: Stop question timer with proper cleanup
  stopQuestionTimer() {
    try {
      // Clean up CustomTimer instance
      if (this.customQuestionTimer) {
        if (typeof this.customQuestionTimer.stop === 'function') {
          this.customQuestionTimer.stop();
        }
        this.customQuestionTimer = null;
      }
      
      // Clean up basic interval timer
      if (this.questionTimer) {
        clearInterval(this.questionTimer);
        this.questionTimer = null;
      }
      
      // Hide progress bar
      if (this.timerElements.questionTimerProgress) {
        this.timerElements.questionTimerProgress.classList.add('hidden');
      }
      
      // FIXED: Save final time spent before clearing timer state
      if (this.questionStartTime && this.isValid()) {
        const elapsed = Math.floor((Date.now() - this.questionStartTime) / 1000);
        const currentQuestionIndex = this.stateManager.getCurrentQuestion();
        
        // FIXED: Don't double-count time - just set the final value
        this.stateManager.updateTimeSpent(currentQuestionIndex, elapsed);
        
        // Clear timer state
        this.questionStartTime = null;
        this.questionRemainingTime = this.QUESTION_TIME_LIMIT * 1000;
      }
    } catch (error) {
      console.error('Stop question timer error:', error);
    }
  }

  // FIXED: Format time for question countdown display
  formatQuestionCountdown(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      return '00:40'; // Default when timer not started
    }
    
    // FIXED: Use Math.floor to avoid showing extra second
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Format time helper function (unchanged for main timer)
  formatTime(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      return '00:00';
    }
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Start auto-save
  startAutoSave() {
    if (!this.isValid()) return;
    
    try {
      this.clearAutoSave();
      
      this.autoSaveInterval = setInterval(() => {
        if (this.isValid()) {
          this.stateManager.saveState();
        } else {
          this.clearAutoSave();
        }
      }, 5000); // Save every 5 seconds
    } catch (error) {
      console.error('Start auto save error:', error);
    }
  }

  // Update question display (called when view is activated)
  updateQuestionDisplay() {
    if (!this.isValid()) return;
    
    try {
      this.initializeTimerElements();
      this.displayQuestion();
    } catch (error) {
      console.error('Update question display error:', error);
    }
  }

  // Initialize review functionality
  initializeReview() {
    if (!this.isValid()) return;
    
    try {
      // Set initial review question to 0
      this.stateManager.updateState({ reviewCurrentQ: 0 });
      
      // Initialize review display if we're using the single-question review view
      if (window.app && typeof window.app.updateReviewDisplay === 'function') {
        window.app.updateReviewDisplay(0);
      } else {
        // Fallback: populate full review answers
        this.populateReviewAnswers();
      }
    } catch (error) {
      console.error('Initialize review error:', error);
    }
  }

  // FIXED: Display current question with proper timer reset
  displayQuestion() {
    if (!this.isValid()) return;
    
    try {
      const currentQuestions = this.getCurrentQuestions();
      if (!currentQuestions || currentQuestions.length === 0) {
        console.error('No questions available to display');
        return;
      }
      
      const currentQ = this.stateManager.getCurrentQuestion();
      const question = currentQuestions[currentQ];
      
      if (!question) {
        console.error('Question not found:', currentQ);
        return;
      }
      
      // CRITICAL: Stop previous question timer BEFORE doing anything else
      this.stopQuestionTimer();
      
      // Update question info
      this.viewManager.updateElement('current-q-num', currentQ + 1);
      this.viewManager.updateElement('question-text', question.question);
      this.viewManager.updateElement('difficulty-badge', question.difficulty);
      this.viewManager.updateElement('topic-badge', question.topic);
      
      // Handle PYQ display
      this.updatePYQDisplay(question);
      
      // Update difficulty badge styling
      const difficultyBadge = document.getElementById('difficulty-badge');
      if (difficultyBadge) {
        difficultyBadge.className = `status status--${
          question.difficulty.toLowerCase() === 'easy' ? 'success' : 
          question.difficulty.toLowerCase() === 'medium' ? 'warning' : 'error'
        }`;
      }
      
      // Update bookmark button
      const isBookmarked = this.stateManager.getBookmarked()[currentQ];
      this.viewManager.toggleElementClass('bookmark-btn', 'bookmarked', isBookmarked);
      
      // Display options
      this.displayOptions(question);
      
      // Update navigation buttons
      this.updateNavigationButtons(currentQuestions.length);
      
      // Update question number display
      const questionNumberSpan = document.querySelector('.question-number');
      if (questionNumberSpan) {
        questionNumberSpan.innerHTML = `Question <span id="current-q-num">${currentQ + 1}</span> of ${currentQuestions.length}`;
      }
      
      // FIXED: Reset timer display before starting new timer
      if (this.timerElements.questionTimer) {
        this.timerElements.questionTimer.textContent = '00:40';
        this.timerElements.questionTimer.classList.remove('warning', 'danger');
      }
      
      // FIXED: Start fresh 40-second timer with slight delay for DOM updates
      setTimeout(() => {
        if (this.isValid()) {
          this.startQuestionTimer();
          this.updateSidebarStats(); // Update PYQ stats in sidebar
        }
      }, 100);
      
    } catch (error) {
      console.error('Display question error:', error);
    }
  }

  // FIXED: Helper methods for question timer
  getQuestionTimeLimit() {
    return this.QUESTION_TIME_LIMIT; // Always 40 seconds
  }

  isQuestionTimeExpired() {
    return this.questionRemainingTime <= 0;
  }

  getQuestionRemainingTime() {
    return this.questionRemainingTime;
  }

  getQuestionRemainingSeconds() {
    return Math.ceil(this.questionRemainingTime / 1000);
  }

  // Display question options (unchanged)
  displayOptions(question) {
    if (!question || !question.options) {
      console.error('Invalid question or missing options');
      return;
    }
    
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) {
      console.warn('Options container not found');
      return;
    }
    
    const currentAnswer = this.stateManager.getAnswers()[this.stateManager.getCurrentQuestion()];
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option-item';
      if (currentAnswer === index) {
        optionElement.classList.add('selected');
      }
      
      optionElement.innerHTML = `
        <input type="radio" class="option-radio" name="answer" value="${index}" ${currentAnswer === index ? 'checked' : ''}>
        <span class="option-text">${option}</span>
      `;
      
      optionElement.addEventListener('click', () => this.selectOption(index));
      optionsContainer.appendChild(optionElement);
    });
  }

  // Update navigation buttons (unchanged)
  updateNavigationButtons(totalQuestions) {
    if (!totalQuestions || totalQuestions <= 0) return;
    
    const currentQ = this.stateManager.getCurrentQuestion();
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) prevBtn.disabled = currentQ === 0;
    if (nextBtn) nextBtn.textContent = currentQ === totalQuestions - 1 ? 'Finish →' : 'Next →';
  }

  // Select option (unchanged)
  selectOption(optionIndex) {
    if (!this.isValid()) return;
    
    try {
      const currentQ = this.stateManager.getCurrentQuestion();
      this.stateManager.setAnswer(currentQ, optionIndex);
      
      // Update visual selection
      document.querySelectorAll('.option-item').forEach((item, index) => {
        item.classList.toggle('selected', index === optionIndex);
        const radio = item.querySelector('input[type="radio"]');
        if (radio) radio.checked = index === optionIndex;
      });
    } catch (error) {
      console.error('Select option error:', error);
    }
  }

  // Navigate between questions (unchanged)
  navigateQuestion(direction) {
    if (!this.isValid()) return;
    
    try {
      const currentQuestions = this.getCurrentQuestions();
      if (!currentQuestions || currentQuestions.length === 0) {
        console.error('No questions available for navigation');
        return;
      }
      
      const currentQ = this.stateManager.getCurrentQuestion();
      const newQ = currentQ + direction;
      
      if (newQ >= 0 && newQ < currentQuestions.length) {
        this.stateManager.setCurrentQuestion(newQ);
        this.displayQuestion();
      } else if (newQ >= currentQuestions.length) {
        this.submitTest();
      }
    } catch (error) {
      console.error('Navigate question error:', error);
    }
  }

  // Next question method (for event listeners)
  nextQuestion() {
    this.navigateQuestion(1);
  }

  // Previous question method (for event listeners)
  previousQuestion() {
    this.navigateQuestion(-1);
  }

  // Toggle bookmark (unchanged)
  toggleBookmark() {
    if (!this.isValid()) return;
    
    try {
      const currentQ = this.stateManager.getCurrentQuestion();
      this.stateManager.toggleBookmark(currentQ);
      
      const isBookmarked = this.stateManager.getBookmarked()[currentQ];
      const bookmarkBtn = document.getElementById('bookmark-btn');
      
      // Update bookmark button visual state
      if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
        
        // Add temporary visual feedback
        bookmarkBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
          if (bookmarkBtn) {
            bookmarkBtn.style.transform = '';
          }
        }, 150);
      }
      
      // Also update via viewManager for consistency
      this.viewManager.toggleElementClass('bookmark-btn', 'bookmarked', isBookmarked);
    } catch (error) {
      console.error('Toggle bookmark error:', error);
    }
  }

  // Clear answer (unchanged)
  clearAnswer() {
    if (!this.isValid()) return;
    
    try {
      const currentQ = this.stateManager.getCurrentQuestion();
      this.stateManager.clearAnswer(currentQ);
      
      // Update visual selection
      document.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
        const radio = item.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });
    } catch (error) {
      console.error('Clear answer error:', error);
    }
  }

  // Show review panel (unchanged)
  showReviewPanel() {
    if (!this.isValid()) return;
    
    try {
      this.updateReviewGrid();
      this.viewManager.showModal('review-panel');
    } catch (error) {
      console.error('Show review panel error:', error);
    }
  }

  // Hide review panel (unchanged)
  hideReviewPanel() {
    if (!this.isValid()) return;
    
    try {
      this.viewManager.hideModal('review-panel');
    } catch (error) {
      console.error('Hide review panel error:', error);
    }
  }

  // Update review grid (unchanged)
  updateReviewGrid() {
    if (!this.isValid()) return;
    
    try {
      const reviewGrid = document.getElementById('review-grid');
      if (!reviewGrid) {
        console.warn('Review grid not found');
        return;
      }
      
      const currentQuestions = this.getCurrentQuestions();
      if (!currentQuestions || currentQuestions.length === 0) {
        console.error('No questions available for review grid');
        return;
      }
      
      const state = this.stateManager.getState();
      
      reviewGrid.innerHTML = '';
      
      for (let i = 0; i < currentQuestions.length; i++) {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.textContent = i + 1;
        
        // Add status classes
        if (i === state.currentQ) {
          item.classList.add('current');
        }
        
        if (state.answers[i] !== null && state.answers[i] !== undefined) {
          item.classList.add('answered');
        } else {
          item.classList.add('unanswered');
        }
        
        if (state.bookmarked[i]) {
          item.classList.add('bookmarked');
          // Add bookmark icon or indicator
          const bookmarkIcon = document.createElement('span');
          bookmarkIcon.className = 'bookmark-indicator';
          bookmarkIcon.innerHTML = '★';
          item.appendChild(bookmarkIcon);
        }
        
        // Add PYQ indicator if question has pyqYear
        if (currentQuestions[i].pyqYear) {
          item.classList.add('pyq-question');
        }
        
        // Add tooltip showing status
        const status = [];
        if (state.answers[i] !== null && state.answers[i] !== undefined) {
          status.push('Answered');
        }
        if (state.bookmarked[i]) {
          status.push('Bookmarked');
        }
        if (status.length === 0) {
          status.push('Not answered');
        }
        item.title = `Question ${i + 1}: ${status.join(', ')}`;
        
        item.addEventListener('click', () => {
          if (this.isValid()) {
            this.stateManager.setCurrentQuestion(i);
            this.hideReviewPanel();
            this.displayQuestion();
          }
        });
        
        reviewGrid.appendChild(item);
      }
    } catch (error) {
      console.error('Update review grid error:', error);
    }
  }

  // Submit test and save results to database
  async submitTest() {
    if (!this.isValid()) return;
    
    if (!confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
      return;
    }
    
    try {
      this.stateManager.setTestEnd();
      this.stopAllTimers();
      this.clearAutoSave();
      
      this.calculateResults();
      
      // Save results to database if file ID is available
      await this.saveTestResults();
      
      this.displayResults();
      this.viewManager.showView('result');
    } catch (error) {
      console.error('Submit test error:', error);
      Utils.showError('Failed to submit test. Please try again.');
    }
  }

  // Save test results to database
  async saveTestResults() {
    if (!this.isValid()) return;
    
    try {
      const state = this.stateManager.getState();
      const results = this.stateManager.getResults();
      
      // Only save if we have a file ID (test from database)
      if (!state.currentFileId || !results) {
        console.log('No file ID or results found, skipping database save');
        return;
      }

      // Check if API is available
      if (!window.MockTestAPI) {
        console.warn('MockTestAPI not available, skipping result save');
        return;
      }

      // Prepare result data for database
      const api = new window.MockTestAPI();
      const fileData = state.currentFileData || {};
      
      const subject = fileData.section || 'Unknown Subject';
      const chapter = fileData.instructions?.category_distribution 
        ? Object.keys(fileData.instructions.category_distribution).join(', ')
        : '';
      
      const score = Math.max(0, Math.round(results.score * 100) / 100); // Round to 2 decimal places
      const total = results.totalQuestions;
      
      const resultJson = {
        testInfo: {
          fileName: state.currentFileName,
          section: subject,
          testDate: new Date().toISOString(),
          duration: state.testDuration,
          totalTime: results.totalTime,
          negativeMarking: state.negativeMarking,
          questionSource: state.questionSource
        },
        performance: {
          score: results.score,
          totalQuestions: results.totalQuestions,
          scorePercentage: Math.round((results.score / results.totalQuestions) * 100),
          questionCounts: results.questionCounts
        },
        answers: state.answers,
        timeSpent: state.timeSpent,
        bookmarked: state.bookmarked,
        topicStats: results.topicStats,
        difficultyStats: results.difficultyStats,
        questionResults: results.questionResults
      };

      console.log('Saving test results to database...', {
        fileId: state.currentFileId,
        subject,
        score,
        total
      });

      const savedResult = await api.saveTestResult(
        state.currentFileId,
        subject,
        chapter,
        score,
        total,
        resultJson
      );
      
      console.log('Test results saved successfully:', savedResult.id);
      
      // Store the result ID for potential future reference
      this.stateManager.updateState({ savedResultId: savedResult.id });
      
    } catch (error) {
      console.error('Failed to save test results to database:', error);
      // Don't throw error to avoid breaking the test submission flow
      // Just log the warning - the test results will still be shown locally
    }
  }

  // Calculate test results with enhanced question tracking
  calculateResults() {
    if (!this.isValid()) return;
    
    try {
      const currentQuestions = this.getCurrentQuestions();
      if (!currentQuestions || currentQuestions.length === 0) {
        console.error('No questions available for result calculation');
        return;
      }
      
      const state = this.stateManager.getState();
      const totalQuestions = currentQuestions.length;
      
      // Initialize result tracking counters
      let answeredQuestions = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unansweredQuestions = 0;
      
      const results = {
        score: 0,
        totalQuestions: totalQuestions,
        totalTime: state.testEnd - state.testStart,
        questionResults: [],
        topicStats: {},
        difficultyStats: {},
        // Store the exact questions used during the test to maintain consistency in solution analysis
        testedQuestions: currentQuestions,
        // Enhanced question tracking counters
        questionCounts: {
          total: totalQuestions,
          answered: 0,        // Will be updated below
          correct: 0,         // Will be updated below
          incorrect: 0,       // Will be updated below
          unanswered: 0       // Will be updated below
        }
      };
      
      // Calculate score and detailed results with comprehensive tracking
      for (let i = 0; i < totalQuestions; i++) {
        const question = currentQuestions[i];
        const userAnswer = state.answers[i];
        const isAnswered = userAnswer !== null && userAnswer !== undefined;
        const isCorrect = isAnswered && userAnswer === question.correctIndex;
        const isIncorrect = isAnswered && !isCorrect;
        const timeSpent = state.timeSpent[i] || 0;
        
        // Update question tracking counters
        if (isAnswered) {
          answeredQuestions++;
          if (isCorrect) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        } else {
          unansweredQuestions++;
        }
        
        // Calculate score with negative marking
        // Scoring rules:
        // - Correct answer: +1 point
        // - Incorrect answer: -0.33 points (if negative marking enabled)
        // - Unanswered: 0 points (no penalty)
        if (isCorrect) {
          results.score += 1;
        } else if (isIncorrect && state.negativeMarking) {
          // Apply negative marking: subtract 1/3 point for incorrect answers
          results.score -= 0.33;
        }
        // No score change for unanswered questions (neutral)
        
        // Store detailed question result with clear status tracking
        results.questionResults.push({
          questionId: i + 1,
          question: question.question,
          topic: question.topic,
          difficulty: question.difficulty,
          userAnswer: userAnswer,
          correctAnswer: question.correctIndex,
          isCorrect: isCorrect,
          isAnswered: isAnswered,
          timeSpent: timeSpent,
          status: !isAnswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect'),
          // Score contribution for this question
          scoreContribution: isCorrect ? 1 : (isIncorrect && state.negativeMarking ? -0.33 : 0)
        });
        
        // Topic-wise statistics tracking
        if (!results.topicStats[question.topic]) {
          results.topicStats[question.topic] = { 
            total: 0, 
            attempted: 0, 
            correct: 0, 
            incorrect: 0,
            unanswered: 0,
            timeTotal: 0 
          };
        }
        results.topicStats[question.topic].total++;
        if (isAnswered) {
          results.topicStats[question.topic].attempted++;
          if (isCorrect) {
            results.topicStats[question.topic].correct++;
          } else {
            results.topicStats[question.topic].incorrect++;
          }
        } else {
          results.topicStats[question.topic].unanswered++;
        }
        results.topicStats[question.topic].timeTotal += timeSpent;
        
        // Difficulty-wise statistics tracking
        if (!results.difficultyStats[question.difficulty]) {
          results.difficultyStats[question.difficulty] = { 
            total: 0,
            attempted: 0, 
            correct: 0, 
            incorrect: 0,
            unanswered: 0,
            timeTotal: 0 
          };
        }
        results.difficultyStats[question.difficulty].total++;
        if (isAnswered) {
          results.difficultyStats[question.difficulty].attempted++;
          if (isCorrect) {
            results.difficultyStats[question.difficulty].correct++;
          } else {
            results.difficultyStats[question.difficulty].incorrect++;
          }
        } else {
          results.difficultyStats[question.difficulty].unanswered++;
        }
        results.difficultyStats[question.difficulty].timeTotal += timeSpent;
      }
      
      // Update final question tracking counters in results
      results.questionCounts.answered = answeredQuestions;
      results.questionCounts.correct = correctAnswers;
      results.questionCounts.incorrect = incorrectAnswers;
      results.questionCounts.unanswered = unansweredQuestions;
      
      // Validation: Ensure counts add up correctly
      const totalCheck = results.questionCounts.correct + results.questionCounts.incorrect + results.questionCounts.unanswered;
      if (totalCheck !== results.questionCounts.total) {
        console.warn('Question count validation failed:', {
          calculated: totalCheck,
          expected: results.questionCounts.total,
          breakdown: results.questionCounts
        });
      }
      
      this.stateManager.setResults(results);
      
      // Log comprehensive result summary for debugging and validation
      console.log('Test Results Calculated:', {
        score: results.score,
        totalQuestions: results.questionCounts.total,
        answered: results.questionCounts.answered,
        correct: results.questionCounts.correct,
        incorrect: results.questionCounts.incorrect,
        unanswered: results.questionCounts.unanswered,
        negativeMarkingEnabled: state.negativeMarking
      });
    } catch (error) {
      console.error('Calculate results error:', error);
    }
  }

  // Helper method to get question tracking statistics
  getQuestionTrackingStats() {
    if (!this.isValid()) return null;
    
    try {
      const results = this.stateManager.getResults();
      if (!results || !results.questionCounts) {
        return null;
      }
      
      const stats = results.questionCounts;
      const percentage = (count, total) => total > 0 ? Math.round((count / total) * 100) : 0;
      
      return {
        // Raw counts
        total: stats.total,
        answered: stats.answered,
        correct: stats.correct,
        incorrect: stats.incorrect,
        unanswered: stats.unanswered,
        
        // Percentages for easier display
        answeredPercentage: percentage(stats.answered, stats.total),
        correctPercentage: percentage(stats.correct, stats.total),
        incorrectPercentage: percentage(stats.incorrect, stats.total),
        unansweredPercentage: percentage(stats.unanswered, stats.total),
        
        // Accuracy among answered questions
        accuracyPercentage: stats.answered > 0 ? percentage(stats.correct, stats.answered) : 0,
        
        // Score information
        totalScore: results.score,
        maxPossibleScore: stats.total,
        scorePercentage: percentage(Math.max(0, results.score), stats.total)
      };
    } catch (error) {
      console.error('Error getting question tracking stats:', error);
      return null;
    }
  }

  // Display comprehensive question tracking statistics
  displayQuestionTrackingStats() {
    try {
      const stats = this.getQuestionTrackingStats();
      if (!stats) {
        console.warn('No question tracking stats available');
        return;
      }

      // Show the stats section
      const statsSection = document.getElementById('question-tracking-stats');
      if (statsSection) {
        statsSection.style.display = 'block';
      }

      // Update stat cards with counts and percentages
      this.viewManager.updateElement('total-questions-stat', stats.total);
      this.viewManager.updateElement('answered-questions-stat', stats.answered);
      this.viewManager.updateElement('correct-questions-stat', stats.correct);
      this.viewManager.updateElement('incorrect-questions-stat', stats.incorrect);
      this.viewManager.updateElement('unanswered-questions-stat', stats.unanswered);

      // Update percentages
      this.viewManager.updateElement('answered-percentage', `${stats.answeredPercentage}%`);
      this.viewManager.updateElement('correct-percentage', `${stats.correctPercentage}%`);
      this.viewManager.updateElement('incorrect-percentage', `${stats.incorrectPercentage}%`);
      this.viewManager.updateElement('unanswered-percentage', `${stats.unansweredPercentage}%`);

      // Update progress bars
      this.updateProgressBar('answered-progress-bar', stats.answeredPercentage);
      this.updateProgressBar('correct-progress-bar', stats.correctPercentage);
      this.updateProgressBar('incorrect-progress-bar', stats.incorrectPercentage);
      this.updateProgressBar('unanswered-progress-bar', stats.unansweredPercentage);

      // Update performance metrics
      this.viewManager.updateElement('overall-accuracy', `${stats.accuracyPercentage}%`);
      this.viewManager.updateElement('completion-rate', `${stats.answeredPercentage}%`);

      // Calculate and display score breakdown
      const positiveScore = stats.correct * 1; // +1 for each correct
      const negativeScore = stats.incorrect * -0.33; // -0.33 for each incorrect (if negative marking)
      const state = this.stateManager.getState();
      
      this.viewManager.updateElement('positive-score', `+${positiveScore}`);
      if (state.negativeMarking) {
        this.viewManager.updateElement('negative-score', negativeScore.toFixed(2));
      } else {
        this.viewManager.updateElement('negative-score', '0');
      }
      this.viewManager.updateElement('final-score', stats.totalScore.toFixed(2));

      // Calculate and display time efficiency
      const results = this.stateManager.getResults();
      if (results && results.totalTime && stats.answered > 0) {
        const avgTimePerAnswered = Math.round(results.totalTime / stats.answered);
        this.viewManager.updateElement('time-efficiency', this.formatTime(avgTimePerAnswered));
      } else {
        this.viewManager.updateElement('time-efficiency', 'N/A');
      }
      
    } catch (error) {
      console.error('Error displaying question tracking stats:', error);
    }
  }

  // Helper method to update progress bars
  updateProgressBar(elementId, percentage) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }

  // Display test results (unchanged)
  displayResults() {
    if (!this.isValid()) return;
    
    try {
      const results = this.stateManager.getResults();
      if (!results) {
        console.error('No results available to display');
        return;
      }
      
      const scorePercentage = Math.round((results.score / results.totalQuestions) * 100);
      
      // Format score display - show decimal places if negative marking is enabled
      const state = this.stateManager.getState();
      const scoreDisplay = state.negativeMarking ? 
        `${results.score.toFixed(2)}/${results.totalQuestions}` : 
        `${Math.round(results.score)}/${results.totalQuestions}`;
      
      // Update score display
      this.viewManager.updateElement('score-percentage', `${scorePercentage}%`);
      this.viewManager.updateElement('correct-answers', scoreDisplay);
      this.viewManager.updateElement('total-time', this.formatTime(results.totalTime));
      
      // Show/hide negative marking indicator
      const negativeMarkingIndicator = document.getElementById('negative-marking-indicator');
      if (negativeMarkingIndicator) {
        negativeMarkingIndicator.style.display = state.negativeMarking ? 'block' : 'none';
      }
      
      const avgTime = Math.round(results.totalTime / results.totalQuestions);
      this.viewManager.updateElement('avg-time', this.formatTime(avgTime));
      
      // Setup and draw charts
      this.setupCharts();
      this.drawTopicChart(results.topicStats);
      this.drawDifficultyChart(results.difficultyStats);
      
      // Display analysis
      this.displayAnalysis(results);
      
      // Display comprehensive question tracking statistics
      this.displayQuestionTrackingStats();
      
      // Populate results table
      this.populateResultsTable(results.questionResults);
    } catch (error) {
      console.error('Display results error:', error);
    }
  }

  // Setup chart canvases (unchanged)
  setupCharts() {
    try {
      ['topic-chart', 'difficulty-chart'].forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
          const container = canvas.parentElement;
          if (container) {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width || 300;
            canvas.height = rect.height || 300;
          }
        }
      });
    } catch (error) {
      console.error('Setup charts error:', error);
    }
  }

  // Draw topic-wise accuracy chart (unchanged)
  drawTopicChart(topicStats) {
    if (!topicStats) return;
    
    try {
      const canvas = document.getElementById('topic-chart');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const topics = Object.keys(topicStats);
      const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];
      
      let total = 0;
      topics.forEach(topic => {
        if (topicStats[topic].attempted > 0) {
          total += topicStats[topic].attempted;
        }
      });
      
      if (total === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', centerX, centerY);
        return;
      }
      
      let currentAngle = -Math.PI / 2;
      
      topics.forEach((topic, index) => {
        if (topicStats[topic].attempted > 0) {
          const percentage = topicStats[topic].attempted / total;
          const sliceAngle = percentage * 2 * Math.PI;
          const accuracy = topicStats[topic].correct / topicStats[topic].attempted * 100;
          
          // Draw slice
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = colors[index % colors.length];
          ctx.fill();
          
          // Draw label
          const labelAngle = currentAngle + sliceAngle / 2;
          const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
          const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
          
          ctx.fillStyle = '#000';
          ctx.font = '12px Roboto';
          ctx.textAlign = 'center';
          ctx.fillText(`${topic}`, labelX, labelY - 5);
          ctx.fillText(`${accuracy.toFixed(0)}%`, labelX, labelY + 10);
          
          currentAngle += sliceAngle;
        }
      });
    } catch (error) {
      console.error('Draw topic chart error:', error);
    }
  }

  // Draw difficulty-wise performance chart (unchanged)
  drawDifficultyChart(difficultyStats) {
    if (!difficultyStats) return;
    
    try {
      const canvas = document.getElementById('difficulty-chart');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const colors = ['#1FB8CD', '#FFC185', '#B4413C'];
      const barWidth = (canvas.width / difficulties.length) - 40;
      const maxHeight = canvas.height - 60;
      
      let maxValue = 0;
      difficulties.forEach(diff => {
        if (difficultyStats[diff] && difficultyStats[diff].attempted > 0) {
          const accuracy = difficultyStats[diff].correct / difficultyStats[diff].attempted;
          maxValue = Math.max(maxValue, accuracy);
        }
      });
      
      if (maxValue === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
      }
      
      difficulties.forEach((diff, index) => {
        const stats = difficultyStats[diff];
        if (stats && stats.attempted > 0) {
          const accuracy = stats.correct / stats.attempted;
          const barHeight = (accuracy / maxValue) * maxHeight;
          const x = 20 + index * (barWidth + 20);
          const y = canvas.height - 40 - barHeight;
          
          // Draw bar
          ctx.fillStyle = colors[index];
          ctx.fillRect(x, y, barWidth, barHeight);
          
          // Draw label
          ctx.fillStyle = '#000';
          ctx.font = '14px Roboto';
          ctx.textAlign = 'center';
          ctx.fillText(diff, x + barWidth / 2, canvas.height - 20);
          ctx.fillText(`${(accuracy * 100).toFixed(0)}%`, x + barWidth / 2, y - 5);
        }
      });
    } catch (error) {
      console.error('Draw difficulty chart error:', error);
    }
  }

  // Display performance analysis (unchanged)
  displayAnalysis(results) {
    if (!results) return;
    
    try {
      // Strengths and weaknesses
      const topics = Object.entries(results.topicStats)
        .filter(([topic, stats]) => stats.attempted > 0)
        .map(([topic, stats]) => ({
          topic,
          accuracy: stats.correct / stats.attempted,
          avgTime: stats.timeTotal / stats.attempted
        }))
        .sort((a, b) => b.accuracy - a.accuracy);
      
      // Strengths (accuracy > 80%)
      const strengths = topics.filter(t => t.accuracy > 0.8);
      const strengthsList = document.getElementById('strengths-list');
      if (strengthsList) {
        strengthsList.innerHTML = strengths.length === 0 
          ? '<li>Work on improving accuracy to identify strengths</li>'
          : strengths.map(t => `<li>${t.topic}: ${(t.accuracy * 100).toFixed(0)}% accuracy</li>`).join('');
      }
      
      // Weaknesses (accuracy < 60%)
      const weaknesses = topics.filter(t => t.accuracy < 0.6);
      const weaknessesList = document.getElementById('weaknesses-list');
      if (weaknessesList) {
        weaknessesList.innerHTML = weaknesses.length === 0
          ? '<li>Great job! No major weak areas identified</li>'
          : weaknesses.map(t => `<li>${t.topic}: ${(t.accuracy * 100).toFixed(0)}% accuracy</li>`).join('');
      }
      
      // Study recommendations
      const studyActions = [];
      
      // Top 3 weakest topics
      const topWeaknesses = topics.slice(-3).reverse();
      topWeaknesses.forEach((topic, index) => {
        if (topic.accuracy < 0.7) {
          studyActions.push(`Focus on ${topic.topic} - Review NCERT Physics Chapter on Units & Measurements`);
        }
      });
      
      // Topics with high time consumption
      const slowTopics = topics.filter(t => t.avgTime > 90).slice(0, 2);
      slowTopics.forEach(topic => {
        studyActions.push(`Practice more ${topic.topic} problems to improve speed`);
      });
      
      // Generic recommendations
      if (studyActions.length < 5) {
        const generic = [
          'Practice dimensional analysis shortcuts and tricks',
          'Memorize common dimensional formulas',
          'Solve 20 additional practice problems daily',
          'Take more timed mock tests',
          'Review solutions for all incorrect answers'
        ];
        
        generic.forEach(action => {
          if (studyActions.length < 5) {
            studyActions.push(action);
          }
        });
      }
      
      const studyActionsList = document.getElementById('study-actions');
      if (studyActionsList) {
        studyActionsList.innerHTML = studyActions
          .slice(0, 5)
          .map(action => `<li>${action}</li>`)
          .join('');
      }
    } catch (error) {
      console.error('Display analysis error:', error);
    }
  }

  // Populate results table (with filtering support)
  populateResultsTable(questionResults, filter = 'all') {
    if (!questionResults) return;
    
    try {
      const tbody = document.querySelector('#results-table tbody');
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      // Filter the results based on the selected filter
      const filteredResults = this.filterQuestionResults(questionResults, filter);
      
      filteredResults.forEach(result => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td class="question-number-cell">
            <span class="question-number-link" data-question="${result.questionId}">${result.questionId}</span>
          </td>
          <td>${result.topic}</td>
          <td>${result.difficulty}</td>
          <td class="${result.status}-status">${result.status.charAt(0).toUpperCase() + result.status.slice(1)}</td>
          <td>${this.formatTime(result.timeSpent * 1000)}</td>
        `;
      });

      // Add click event listeners to question numbers
      const questionLinks = tbody.querySelectorAll('.question-number-link');
      questionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const questionNumber = parseInt(link.getAttribute('data-question'));
          // Access the app instance to call jumpToQuestion
          if (window.app && typeof window.app.jumpToQuestion === 'function') {
            window.app.jumpToQuestion(questionNumber);
          }
        });
      });
    } catch (error) {
      console.error('Populate results table error:', error);
    }
  }

  // Filter question results based on the selected filter
  filterQuestionResults(questionResults, filter) {
    if (!questionResults || filter === 'all') {
      return questionResults;
    }
    
    return questionResults.filter(result => {
      switch (filter) {
        case 'correct':
          return result.status === 'correct';
        case 'incorrect':
          return result.status === 'incorrect';
        case 'answered':
          return result.status === 'correct' || result.status === 'incorrect';
        case 'unanswered':
          return result.status === 'unanswered';
        default:
          return true;
      }
    });
  }

  // Populate review answers for review view (unchanged)
  populateReviewAnswers() {
    if (!this.isValid()) return;
    
    try {
      const currentQuestions = this.getCurrentQuestions();
      if (!currentQuestions || currentQuestions.length === 0) {
        console.error('No questions available for review');
        return;
      }
      
      const state = this.stateManager.getState();
      const results = this.stateManager.getResults();
      
      if (!results) {
        console.warn('No results available for review');
        return;
      }
      
      const reviewContainer = document.getElementById('review-answers-container');
      if (!reviewContainer) return;
      
      reviewContainer.innerHTML = '';
      
      currentQuestions.forEach((question, index) => {
        const userAnswer = state.answers[index];
        const isCorrect = userAnswer !== null && userAnswer !== undefined && userAnswer === question.correctIndex;
        const timeSpent = state.timeSpent[index] || 0;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-answer-item ${isCorrect ? 'correct' : userAnswer !== null && userAnswer !== undefined ? 'incorrect' : 'unanswered'}`;
        
        reviewItem.innerHTML = `
          <div class="review-question-header">
            <h3>Question ${index + 1}</h3>
            <div class="review-badges">
              <span class="topic-badge">${question.topic}</span>
              <span class="difficulty-badge ${question.difficulty.toLowerCase()}">${question.difficulty}</span>
              <span class="status-badge ${isCorrect ? 'correct' : userAnswer !== null && userAnswer !== undefined ? 'incorrect' : 'unanswered'}">
                ${userAnswer === null || userAnswer === undefined ? 'Not Answered' : isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          </div>
          <div class="review-question-text">${question.question}</div>
          <div class="review-options">
            ${question.options.map((option, optIndex) => `
              <div class="review-option ${userAnswer === optIndex ? 'user-selected' : ''} ${optIndex === question.correctIndex ? 'correct-answer' : ''}">
                <span class="option-label">${String.fromCharCode(65 + optIndex)}.</span>
                <span class="option-text">${option}</span>
                ${userAnswer === optIndex ? '<span class="user-mark">Your Answer</span>' : ''}
                ${optIndex === question.correctIndex ? '<span class="correct-mark">Correct Answer</span>' : ''}
              </div>
            `).join('')}
          </div>
          <div class="review-stats">
            <span class="time-spent">Time: ${this.formatTime(timeSpent * 1000)}</span>
          </div>
        `;
        
        reviewContainer.appendChild(reviewItem);
      });
    } catch (error) {
      console.error('Populate review answers error:', error);
    }
  }

  // Get current questions with validation (unchanged)
  getCurrentQuestions() {
    try {
      const state = this.stateManager?.getState();
      return state?.customQuestions || window.DEFAULT_QUESTIONS || [];
    } catch (error) {
      console.error('Error getting current questions:', error);
      return [];
    }
  }

  // PYQ-related methods
  updatePYQDisplay(question) {
    try {
      const pyqBadge = document.getElementById('pyq-badge');
      const pyqInfoPanel = document.getElementById('pyq-info-panel');
      const pyqYearDisplay = document.getElementById('pyq-year-display');

      if (question.pyqYear) {
        // Show PYQ badge
        if (pyqBadge) {
          pyqBadge.classList.remove('hidden');
        }
        
        // Show PYQ information panel
        if (pyqInfoPanel) {
          pyqInfoPanel.classList.remove('hidden');
        }
        
        // Update PYQ year display
        if (pyqYearDisplay) {
          pyqYearDisplay.textContent = question.pyqYear;
        }
      } else {
        // Hide PYQ elements for non-PYQ questions
        if (pyqBadge) {
          pyqBadge.classList.add('hidden');
        }
        
        if (pyqInfoPanel) {
          pyqInfoPanel.classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Error updating PYQ display:', error);
    }
  }

  // Get PYQ statistics
  getPYQStats() {
    try {
      const questions = this.getCurrentQuestions();
      const pyqQuestions = questions.filter(q => q.pyqYear);
      const totalQuestions = questions.length;
      
      return {
        total: pyqQuestions.length,
        percentage: totalQuestions > 0 ? Math.round((pyqQuestions.length / totalQuestions) * 100) : 0,
        years: [...new Set(pyqQuestions.map(q => q.pyqYear))].sort()
      };
    } catch (error) {
      console.error('Error getting PYQ stats:', error);
      return { total: 0, percentage: 0, years: [] };
    }
  }

  // Filter questions to show only PYQ
  filterPYQQuestions(showPYQOnly = false) {
    try {
      if (!this.isValid()) return;

      const allQuestions = window.DEFAULT_QUESTIONS || [];
      
      if (showPYQOnly) {
        // Filter to show only PYQ questions
        const pyqQuestions = allQuestions.filter(q => q.pyqYear);
        
        // Update state to use filtered questions
        this.stateManager.updateState({ 
          customQuestions: pyqQuestions,
          currentQuestion: 0
        });
        
        // Update display
        this.displayQuestion();
        this.updateQuestionCount(pyqQuestions.length);
      } else {
        // Show all questions
        this.stateManager.updateState({ 
          customQuestions: null,
          currentQuestion: 0
        });
        
        // Update display
        this.displayQuestion();
        this.updateQuestionCount(allQuestions.length);
      }
    } catch (error) {
      console.error('Error filtering PYQ questions:', error);
    }
  }

  // Update question count display
  updateQuestionCount(totalQuestions) {
    try {
      const questionNumberSpan = document.querySelector('.question-number');
      if (questionNumberSpan) {
        const currentQ = this.stateManager.getCurrentQuestion();
        questionNumberSpan.innerHTML = `Question <span id="current-q-num">${currentQ + 1}</span> of ${totalQuestions}`;
      }
    } catch (error) {
      console.error('Error updating question count:', error);
    }
  }

  // Update sidebar PYQ statistics
  updateSidebarStats() {
    try {
      const sidebarStats = document.getElementById('sidebar-stats');
      if (!sidebarStats) return;

      const pyqStats = this.getPYQStats();
      
      sidebarStats.innerHTML = `
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
          </svg>
          PYQ Statistics
        </h4>
        <div class="stat-item">
          <span class="stat-label">Total PYQ Questions:</span>
          <span class="stat-value">${pyqStats.total}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">PYQ Percentage:</span>
          <span class="stat-value">${pyqStats.percentage}%</span>
        </div>
        ${pyqStats.years.length > 0 ? `
        <div class="stat-item">
          <span class="stat-label">Latest Year:</span>
          <span class="stat-value">${pyqStats.years[pyqStats.years.length - 1]}</span>
        </div>
        ` : ''}
      `;
    } catch (error) {
      console.error('Error updating sidebar stats:', error);
    }
  }

  // --- Solution Analysis Methods ---

  initializeSolutionAnalysis() {
      if (!this.isValid()) return;
      try {
          this.populateTopicFilter();
          this.applySolutionFilters();
      } catch (error) {
          console.error('Error initializing solution analysis:', error);
      }
  }

  populateTopicFilter() {
      const topicSelect = document.getElementById('topic-filter-select');
      if (!topicSelect) return;

      const results = this.stateManager.getResults();
      if (!results || !results.topicStats) return;

      // Clear existing options except "All Topics"
      topicSelect.innerHTML = '<option value="all">All Topics</option>';

      const topics = Object.keys(results.topicStats);
      topics.forEach(topic => {
          const option = document.createElement('option');
          option.value = topic;
          option.textContent = topic;
          topicSelect.appendChild(option);
      });
  }

  applySolutionFilters() {
      if (!this.isValid()) return;
      try {
          const results = this.stateManager.getResults();
          if (!results || !results.questionResults) return;

          // Get filter values from DOM
          const statusFilter = document.querySelector('#solution-analysis-view .filter-btn.active')?.dataset.filter || 'all';
          const topicFilter = document.getElementById('topic-filter-select')?.value || 'all';
          const difficultyFilter = document.getElementById('difficulty-filter-select')?.value || 'all';

          // Filter the question results
          this.filteredSolutionQuestions = results.questionResults.filter(q => {
              const statusMatch = statusFilter === 'all' || q.status === statusFilter || (statusFilter === 'answered' && q.status !== 'unanswered');
              const topicMatch = topicFilter === 'all' || q.topic === topicFilter;
              const difficultyMatch = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
              return statusMatch && topicMatch && difficultyMatch;
          });

          this.currentSolutionIndex = 0;
          this.populateFilteredQuestionList();
          this.displaySolutionForQuestion();

      } catch (error) {
          console.error('Error applying solution filters:', error);
      }
  }

  populateFilteredQuestionList() {
      const listContainer = document.getElementById('filtered-question-list');
      if (!listContainer) return;

      listContainer.innerHTML = ''; // Clear previous list

      if (this.filteredSolutionQuestions.length === 0) {
          listContainer.innerHTML = '<div class="no-results">No questions match the current filters.</div>';
          return;
      }

      this.filteredSolutionQuestions.forEach((questionResult, index) => {
          const item = document.createElement('div');
          item.className = 'question-list-item';
          item.dataset.index = index;
          item.textContent = `Q${questionResult.questionId}`;

          if (index === this.currentSolutionIndex) {
              item.classList.add('active');
          }

          // Add status indicator
          const statusIndicator = document.createElement('span');
          statusIndicator.className = `status-dot ${questionResult.status}`;
          item.prepend(statusIndicator);

          item.addEventListener('click', () => {
              this.currentSolutionIndex = index;
              this.displaySolutionForQuestion();
              // Update active class on list items
              listContainer.querySelectorAll('.question-list-item').forEach(el => el.classList.remove('active'));
              item.classList.add('active');
          });

          listContainer.appendChild(item);
      });
  }

  displaySolutionForQuestion() {
      if (!this.isValid()) return;
      try {
          const questionResult = this.filteredSolutionQuestions[this.currentSolutionIndex];
          
          // Use tested questions from results to maintain consistency and prevent reset to default questions
          const results = this.stateManager.getResults();
          const allQuestions = results?.testedQuestions || this.getCurrentQuestions();

          // Update counter
          this.viewManager.updateElement('solution-q-num', `${this.currentSolutionIndex + 1} of ${this.filteredSolutionQuestions.length}`);

          if (!questionResult) {
              // Handle case with no matching questions
              document.getElementById('solution-details').innerHTML = '<div class="no-results-card">No question to display.</div>';
              return;
          }

          const questionData = allQuestions[questionResult.questionId - 1];
          if (!questionData) return;

          // Populate meta info
          this.viewManager.updateElement('current-difficulty', questionData.difficulty);
          this.viewManager.updateElement('current-topic', questionData.topic);
          this.viewManager.updateElement('current-status', questionResult.status);
          this.viewManager.updateElement('current-time', this.formatTime(questionResult.timeSpent * 1000));

          // Populate question text
          this.viewManager.updateElement('current-question-text', questionData.question);

          // Populate options
          const optionsContainer = document.getElementById('current-answer-options');
          if (optionsContainer) {
              optionsContainer.innerHTML = questionData.options.map((option, index) => {
                  let classes = 'option-display';
                  if (index === questionResult.correctAnswer) classes += ' correct';
                  if (index === questionResult.userAnswer) classes += ' user-selected';
                  if (index === questionResult.userAnswer && index !== questionResult.correctAnswer) classes += ' incorrect';

                  return `<div class="${classes}">${option}</div>`;
              }).join('');
          }

          // Populate solution
          this.viewManager.updateElement('current-solution', questionData.solution, 'innerHTML');

          // Update navigation buttons
          document.getElementById('prev-solution-btn').disabled = this.currentSolutionIndex === 0;
          document.getElementById('next-solution-btn').disabled = this.currentSolutionIndex >= this.filteredSolutionQuestions.length - 1;

      } catch (error) {
          console.error('Error displaying solution:', error);
      }
  }

  navigateSolution(direction) {
      const newIndex = this.currentSolutionIndex + direction;
      if (newIndex >= 0 && newIndex < this.filteredSolutionQuestions.length) {
          this.currentSolutionIndex = newIndex;
          this.displaySolutionForQuestion();
          // Update active class in list
          const listContainer = document.getElementById('filtered-question-list');
          if (listContainer) {
              listContainer.querySelectorAll('.question-list-item').forEach(el => el.classList.remove('active'));
              const activeItem = listContainer.querySelector(`[data-index="${newIndex}"]`);
              if (activeItem) {
                  activeItem.classList.add('active');
                  activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
          }
      }
  }

  // Navigate to a specific question in solution analysis view
  // Used when clicking question number links from question-wise analysis table
  navigateToSolutionQuestion(questionNumber) {
    try {
      // First apply filters to populate the filtered question list
      this.applySolutionFilters();
      
      // Find the question in the filtered results
      const questionIndex = this.filteredSolutionQuestions.findIndex(
        q => q.questionId === questionNumber
      );
      
      if (questionIndex !== -1) {
        // Set the current index to the found question
        this.currentSolutionIndex = questionIndex;
        
        // Display the question and update the UI
        this.displaySolutionForQuestion();
        
        // Update the active highlight in the question list
        const listContainer = document.getElementById('filtered-question-list');
        if (listContainer) {
          // Remove active class from all items
          listContainer.querySelectorAll('.question-list-item').forEach(el => 
            el.classList.remove('active')
          );
          
          // Add active class to the target question and scroll it into view
          const activeItem = listContainer.querySelector(`[data-index="${questionIndex}"]`);
          if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        console.log(`Successfully navigated to question ${questionNumber} in solution analysis`);
      } else {
        console.warn(`Question ${questionNumber} not found in current filter. Showing first question.`);
        // If question not found in current filter, reset to show all questions
        this.resetSolutionFilters();
        // Try again after resetting filters
        const retryIndex = this.filteredSolutionQuestions.findIndex(
          q => q.questionId === questionNumber
        );
        if (retryIndex !== -1) {
          this.currentSolutionIndex = retryIndex;
          this.displaySolutionForQuestion();
        }
      }
    } catch (error) {
      console.error('Error navigating to solution question:', error);
      // Fallback: just apply filters and show first question
      this.applySolutionFilters();
    }
  }
  
  // Helper method to reset solution analysis filters to show all questions
  resetSolutionFilters() {
    try {
      // Reset filter buttons to "All Questions"
      const filterButtons = document.querySelectorAll('#solution-analysis-view .filter-btn');
      filterButtons.forEach(btn => {
        if (btn.dataset.filter === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Reset topic and difficulty selects
      const topicSelect = document.getElementById('topic-filter-select');
      const difficultySelect = document.getElementById('difficulty-filter-select');
      if (topicSelect) topicSelect.value = 'all';
      if (difficultySelect) difficultySelect.value = 'all';
      
      // Reapply filters with reset values
      this.applySolutionFilters();
    } catch (error) {
      console.error('Error resetting solution filters:', error);
    }
  }
  
  showJumpToQuestionModal() {
      console.log("Jump to question modal not implemented yet.");
      Utils.showInfo("Jump to question functionality will be added in a future update!");
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestManager;
}