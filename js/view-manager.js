// View Manager Module
// Handles view switching, component loading, and UI state management

class ViewManager {
  constructor() {
    this.currentView = 'landing';
    this.views = ['landing', 'test', 'result', 'review-answers'];
    this.componentCache = {};
  }

  // Initialize view manager
  async init() {
    try {
      // Load initial components
      await this.loadAllComponents();
      this.showView('landing');
    } catch (error) {
      console.error('ViewManager initialization error:', error);
    }
  }

  // Load all view components
  async loadAllComponents() {
    const componentPromises = [
      this.loadComponent('landing-view'),
      this.loadComponent('test-view'),
      this.loadComponent('result-view'),
      this.loadComponent('review-answers-view'),
      this.loadComponent('review-panel')
    ];

    try {
      await Promise.all(componentPromises);
    } catch (error) {
      console.error('Error loading components:', error);
      throw error;
    }
  }

  // Load a single component
  async loadComponent(componentName) {
    if (this.componentCache[componentName]) {
      return this.componentCache[componentName];
    }

    try {
      const response = await fetch(`components/${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName} (${response.status})`);
      }
      
      const html = await response.text();
      this.componentCache[componentName] = html;
      
      // Insert component into DOM if it's a view or panel
      if (componentName.includes('view') || componentName === 'review-panel') {
        const container = document.getElementById('app-container');
        if (container) {
          // Create a temporary container to parse the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          // Extract the main component element
          const componentElement = tempDiv.firstElementChild;
          if (componentElement) {
            // Ensure the component has the correct ID for view management
            if (componentName.includes('view') && !componentElement.id) {
              componentElement.id = componentName;
            }
            
            // Check if component already exists in DOM
            const existingComponent = document.getElementById(componentElement.id);
            if (existingComponent) {
              // Replace existing component
              existingComponent.replaceWith(componentElement);
            } else {
              // Append new component
              container.appendChild(componentElement);
            }
            
            // Initialize component-specific functionality
            this.initializeComponent(componentName, componentElement);
          }
        }
      }
      
      return html;
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error);
      
      // Provide fallback for critical components
      if (componentName.includes('view')) {
        return this.createFallbackView(componentName);
      }
      
      throw error;
    }
  }

  // Initialize component-specific functionality
  initializeComponent(componentName, element) {
    try {
      // Add 'view' class to view components for CSS styling
      if (componentName.includes('view')) {
        element.classList.add('view');
        
        // Ensure view is hidden initially (except landing)
        if (componentName !== 'landing-view') {
          element.classList.remove('active');
        } else {
          // Landing view should be active by default
          element.classList.add('active');
        }
      }
      
      // Component-specific initialization
      switch (componentName) {
        case 'test-view':
          this.initializeTestView(element);
          break;
        case 'result-view':
          this.initializeResultView(element);
          break;
        case 'review-answers-view':
          this.initializeReviewAnswersView(element);
          break;
        case 'review-panel':
          this.initializeReviewPanel(element);
          break;
      }
    } catch (error) {
      console.error(`Error initializing component ${componentName}:`, error);
    }
  }

  // Component-specific initialization methods
  initializeTestView(element) {
    // Initialize test-specific event listeners and functionality
    const nextBtn = element.querySelector('#next-question');
    const prevBtn = element.querySelector('#prev-question');
    
    if (nextBtn) nextBtn.addEventListener('click', () => window.testManager?.nextQuestion());
    if (prevBtn) prevBtn.addEventListener('click', () => window.testManager?.previousQuestion());
  }

  initializeResultView(element) {
    // Initialize result-specific functionality
    const reviewBtn = element.querySelector('#review-answers-btn');
    if (reviewBtn) reviewBtn.addEventListener('click', () => this.showView('review-answers'));
  }

  initializeReviewAnswersView(element) {
    // Initialize review-specific functionality
    const backBtn = element.querySelector('#back-to-results-btn');
    if (backBtn) backBtn.addEventListener('click', () => this.showView('result'));
  }

  initializeReviewPanel(element) {
    // Initialize review panel functionality
    element.classList.add('review-panel');
  }

  // Create fallback view for component loading failures
  createFallbackView(componentName) {
    const viewId = componentName;
    const fallbackHTML = `
      <div id="${viewId}" class="view">
        <div class="container">
          <div class="error-message">
            <h2>Component Loading Error</h2>
            <p>Failed to load ${componentName}. Please refresh the page or contact support.</p>
            <button onclick="location.reload()" class="btn btn--primary">Refresh Page</button>
          </div>
        </div>
      </div>
    `;
    
    // Insert fallback into DOM
    const container = document.getElementById('app-container');
    if (container) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fallbackHTML;
      const fallbackElement = tempDiv.firstElementChild;
      
      if (fallbackElement) {
        container.appendChild(fallbackElement);
        this.initializeComponent(componentName, fallbackElement);
      }
    }
    
    this.componentCache[componentName] = fallbackHTML;
    return fallbackHTML;
  }

  // Show specific view
  showView(viewName) {
    try {
      // Hide all views
      this.views.forEach(view => {
        const element = document.getElementById(`${view}-view`);
        if (element) {
          element.classList.remove('active');
        }
      });
      
      // Show target view
      const targetView = document.getElementById(`${viewName}-view`);
      if (targetView) {
        targetView.classList.add('active');
        this.currentView = viewName;
        
        // Trigger view-specific actions
        this.onViewActivated(viewName, targetView);
      } else {
        console.error(`View ${viewName} not found in DOM`);
        // Attempt to reload the component
        this.loadComponent(`${viewName}-view`).then(() => {
          const retryView = document.getElementById(`${viewName}-view`);
          if (retryView) {
            retryView.classList.add('active');
            this.currentView = viewName;
            this.onViewActivated(viewName, retryView);
          }
        }).catch(error => {
          console.error(`Failed to reload component ${viewName}-view:`, error);
        });
      }
    } catch (error) {
      console.error('Show view error:', error);
    }
  }

  // Handle view activation events
  onViewActivated(viewName, element) {
    try {
      switch (viewName) {
        case 'test':
          // Refresh test display
          if (window.testManager) {
            window.testManager.updateQuestionDisplay();
          }
          break;
        case 'result':
          // Update result calculations
          if (window.testManager) {
            window.testManager.calculateResults();
          }
          break;
        case 'review-answers':
          // Initialize review functionality
          if (window.testManager) {
            window.testManager.initializeReview();
          }
          break;
      }
    } catch (error) {
      console.error(`Error in view activation for ${viewName}:`, error);
    }
  }

  // Get current active view
  getCurrentView() {
    return this.currentView;
  }

  // Update landing view with current state
  updateLandingView(state) {
    try {
      const durationSelect = document.getElementById('test-duration');
      const customSection = document.getElementById('custom-duration-section');
      
      if (!durationSelect || !customSection) return;

      // Check if current duration matches a preset value
      const isCustomDuration = ![60, 90, 120].includes(state.testDuration);
      
      if (isCustomDuration) {
        durationSelect.value = 'custom';
        customSection.classList.remove('hidden');
        
        // Set custom input values from state
        const totalMinutes = state.testDuration;
        const minutes = Math.floor(totalMinutes);
        const seconds = Math.round((totalMinutes - minutes) * 60);
        
        const minutesInput = document.getElementById('custom-minutes');
        const secondsInput = document.getElementById('custom-seconds');
        if (minutesInput) minutesInput.value = minutes;
        if (secondsInput) secondsInput.value = seconds;
      } else {
        durationSelect.value = state.testDuration;
        customSection.classList.add('hidden');
      }
      
      // Update checkboxes
      const checkboxes = {
        'rrb-mode': state.isRRBMode,
        'dark-mode': state.isDarkMode,
        'enhanced-timer': state.enhancedTimer
      };
      
      Object.entries(checkboxes).forEach(([id, checked]) => {
        const element = document.getElementById(id);
        if (element) element.checked = checked;
      });
      
      const questionSource = document.getElementById('question-source');
      if (questionSource) questionSource.value = state.questionSource;
      
      // Update question count display
      this.updateQuestionCount(state);
      
      // Show/hide JSON upload section
      this.toggleQuestionSourceSection(state.questionSource);
      
      // Apply theme modes
      if (state.isRRBMode) {
        document.body.setAttribute('data-rrb-mode', 'true');
      }
      
      if (state.isDarkMode) {
        document.body.setAttribute('data-color-scheme', 'dark');
      }

      // Show resume button if test is in progress
      const resumeBtn = document.getElementById('resume-test-btn');
      if (resumeBtn) {
        if (state.testStart && !state.testEnd) {
          resumeBtn.classList.remove('hidden');
        } else {
          resumeBtn.classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Update landing view error:', error);
    }
  }

  // Toggle question source section visibility
  toggleQuestionSourceSection(questionSource) {
    const jsonSection = document.getElementById('json-upload-section');
    if (jsonSection) {
      if (questionSource === 'json') {
        jsonSection.classList.remove('hidden');
      } else {
        jsonSection.classList.add('hidden');
        // Clear any previous JSON status
        const statusElement = document.getElementById('json-status');
        if (statusElement) statusElement.classList.add('hidden');
      }
    }
  }

  // Update question count display
  updateQuestionCount(state) {
    try {
      const totalQuestions = state.customQuestions ? state.customQuestions.length : 50;
      const testInfo = document.querySelector('.test-info p');
      if (testInfo) {
        const sourceText = state.questionSource === 'json' ? 'Custom JSON' : 'Default';
        testInfo.textContent = `${totalQuestions} Questions • Mixed Difficulty • ${sourceText} • Complete Analysis`;
      }
    } catch (error) {
      console.error('Update question count error:', error);
    }
  }

  // Show/hide modal
  showModal(modalId) {
    try {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        
        // Add modal event listeners if not already added
        this.bindModalEvents(modal);
        
        // Focus management for accessibility
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }
    } catch (error) {
      console.error('Show modal error:', error);
    }
  }

  hideModal(modalId) {
    try {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
        
        // Restore body scroll
        document.body.style.overflow = '';
      }
    } catch (error) {
      console.error('Hide modal error:', error);
    }
  }

  // Bind modal event listeners
  bindModalEvents(modal) {
    const modalId = modal.id;
    
    // Prevent duplicate event binding
    if (modal.dataset.eventsbound === 'true') {
      return;
    }
    
    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideModal(modalId));
    }
    
    // Backdrop click
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.hideModal(modalId));
    }
    
    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.hideModal(modalId);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    // Store reference for cleanup
    modal._escHandler = escHandler;
    modal.dataset.eventsbound = 'true';
  }

  // Update element content safely
  updateElement(id, content, property = 'textContent') {
    const element = document.getElementById(id);
    if (element) {
      element[property] = content;
    }
  }

  // Update element class safely
  updateElementClass(id, className, add = true) {
    const element = document.getElementById(id);
    if (element) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  }

  // Toggle element class safely
  toggleElementClass(id, className, force) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle(className, force);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewManager;
}
