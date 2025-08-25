// Main Application Module
// Coordinates all other modules and handles application lifecycle

class MockTestApp {
  constructor() {
    // Module instances
    this.stateManager = null;
    this.viewManager = null;
    this.questionManager = null;
    this.testManager = null;
    
    // Questions data
    this.QUESTIONS = [
      {"id":1,"question":"The dimensional formula [ML²T⁻¹] represents:","options":["Angular momentum","Linear momentum","Energy","Power"],"correctIndex":0,"topic":"Basic Dimensions","difficulty":"Easy","solution":"Angular momentum L = mvr so [M][LT⁻¹][L] = [ML²T⁻¹]."},
      {"id":2,"question":"In F = kmᵃvᵇ (F is force), what are values of a and b?","options":["a = 2, b = 1","a = 1, b = 2","a = 1, b = 1","a = 2, b = 2"],"correctIndex":1,"topic":"Dimensional Equations","difficulty":"Medium","solution":"Comparing M, L, T powers gives a = 1, b = 2."},
      {"id":3,"question":"What is the dimensional formula for pressure gradient?","options":["[ML⁻²T⁻²]","[ML⁻¹T⁻²]","[ML⁻⁴T⁻²]","[ML⁻³T⁻²]"],"correctIndex":0,"topic":"Derived Quantities","difficulty":"Medium","solution":"Pressure/length so [ML⁻¹T⁻²]/[L] = [ML⁻²T⁻²]."},
      {"id":4,"question":"The dimensions of gravitational constant G are:","options":["[M⁻¹L⁻³T⁻²]","[M⁻¹L³T⁻²]","[ML³T⁻²]","[M⁻²L³T⁻²]"],"correctIndex":1,"topic":"Gravitation","difficulty":"Medium","solution":"From F = GMm/r², solve for [G]."},
      {"id":5,"question":"In the equation E = mc², c² has dimensions:","options":["[L²T⁻²]","[LT⁻¹]","[L²T⁻¹]","[LT⁻²]"],"correctIndex":0,"topic":"Relativity","difficulty":"Easy","solution":"E/m gives [L²T⁻²]."},
      {"id":6,"question":"The dimensional formula for electric field is:","options":["[MLT⁻²I⁻¹]","[MLT⁻³I⁻¹]","[ML²T⁻³I⁻¹]","[ML²T⁻²I⁻¹]"],"correctIndex":1,"topic":"Electricity","difficulty":"Medium","solution":"Force/charge = [MLT⁻²]/[IT]."},
      {"id":7,"question":"Surface tension has the dimensional formula:","options":["[ML⁻¹T⁻²]","[MT⁻²]","[MLT⁻²]","[ML²T⁻²]"],"correctIndex":1,"topic":"Fluid Mechanics","difficulty":"Medium","solution":"Force/length = [MT⁻²]."},
      {"id":8,"question":"In wave equation v = λ/T, v has dimensions:","options":["[LT⁻¹]","[L²T⁻¹]","[LT⁻²]","[L²T⁻²]"],"correctIndex":0,"topic":"Waves","difficulty":"Easy","solution":"[L]/[T]."},
      {"id":9,"question":"Planck's constant has dimensions:","options":["[ML²T⁻¹]","[MLT⁻¹]","[ML²T⁻²]","[ML²T⁻³]"],"correctIndex":0,"topic":"Quantum","difficulty":"Medium","solution":"Energy·time = [ML²T⁻²][T]."},
      {"id":10,"question":"The dimensional formula [M⁻¹L⁻²T⁴I²] represents:","options":["Inductance","Capacitance","Resistance","Conductance"],"correctIndex":1,"topic":"Electricity","difficulty":"Medium","solution":"C = Q/V gives [IT]/[ML²T⁻³I⁻¹]."},
      {"id":11,"question":"Which quantity has dimensions [ML⁻¹T⁻¹]?","options":["Viscosity","Surface tension","Pressure","Density"],"correctIndex":0,"topic":"Fluid Mechanics","difficulty":"Medium","solution":"Dynamic viscosity η has dimensions [ML⁻¹T⁻¹]."},
      {"id":12,"question":"The dimensional formula for magnetic field B is:","options":["[MT⁻²I⁻¹]","[MLT⁻²I⁻¹]","[M⁰LT⁻²I⁻¹]","[ML⁰T⁻²I⁻¹]"],"correctIndex":0,"topic":"Magnetism","difficulty":"Medium","solution":"From F = BIl, [B] = [MLT⁻²]/[I][L] = [MT⁻²I⁻¹]."},
      {"id":13,"question":"Young's modulus has the same dimensions as:","options":["Force","Pressure","Energy","Power"],"correctIndex":1,"topic":"Elasticity","difficulty":"Easy","solution":"Stress/strain = [ML⁻¹T⁻²]/[dimensionless] = [ML⁻¹T⁻²]."},
      {"id":14,"question":"The dimensional formula for impulse is:","options":["[MLT⁻¹]","[ML²T⁻¹]","[MLT⁻²]","[ML²T⁻²]"],"correctIndex":0,"topic":"Mechanics","difficulty":"Easy","solution":"Impulse = Force × time = [MLT⁻²][T] = [MLT⁻¹]."},
      {"id":15,"question":"Coefficient of friction is:","options":["[ML⁻¹T⁻²]","[MLT⁻²]","[M⁰L⁰T⁰]","[ML⁻²T⁻²]"],"correctIndex":2,"topic":"Friction","difficulty":"Easy","solution":"Friction force/Normal force is dimensionless."},
      {"id":16,"question":"The dimensions of electric potential are:","options":["[ML²T⁻³I⁻¹]","[MLT⁻³I⁻¹]","[ML²T⁻²I⁻¹]","[ML³T⁻³I⁻¹]"],"correctIndex":0,"topic":"Electricity","difficulty":"Medium","solution":"Work/charge = [ML²T⁻²]/[IT] = [ML²T⁻³I⁻¹]."},
      {"id":17,"question":"Power has dimensional formula:","options":["[ML²T⁻²]","[ML²T⁻³]","[MLT⁻³]","[ML³T⁻³]"],"correctIndex":1,"topic":"Power","difficulty":"Easy","solution":"Energy/time = [ML²T⁻²]/[T] = [ML²T⁻³]."},
      {"id":18,"question":"The dimensional formula for torque is:","options":["[ML²T⁻²]","[MLT⁻²]","[ML²T⁻¹]","[ML²T⁻³]"],"correctIndex":0,"topic":"Rotational Mechanics","difficulty":"Medium","solution":"Force × distance = [MLT⁻²][L] = [ML²T⁻²]."},
      {"id":19,"question":"Specific heat capacity has dimensions:","options":["[L²T⁻²K⁻¹]","[ML²T⁻²K⁻¹]","[LT⁻²K⁻¹]","[M⁻¹L²T⁻²K⁻¹]"],"correctIndex":0,"topic":"Thermodynamics","difficulty":"Medium","solution":"Energy/(mass × temperature) = [ML²T⁻²]/[M][K] = [L²T⁻²K⁻¹]."},
      {"id":20,"question":"The dimensional formula for frequency is:","options":["[T]","[T⁻¹]","[LT⁻¹]","[M⁰L⁰T⁻¹]"],"correctIndex":3,"topic":"Oscillations","difficulty":"Easy","solution":"1/time period = 1/[T] = [T⁻¹]."},
      {"id":21,"question":"Bulk modulus has the same dimensions as:","options":["Density","Pressure","Volume","Area"],"correctIndex":1,"topic":"Elasticity","difficulty":"Medium","solution":"Stress = [ML⁻¹T⁻²], same as pressure."},
      {"id":22,"question":"The dimensions of magnetic flux are:","options":["[ML²T⁻²I⁻¹]","[ML²T⁻¹I⁻¹]","[MLT⁻²I⁻¹]","[ML³T⁻²I⁻¹]"],"correctIndex":0,"topic":"Magnetism","difficulty":"Hard","solution":"Φ = BA, so [MT⁻²I⁻¹][L²] = [ML²T⁻²I⁻¹]."},
      {"id":23,"question":"In P = F/A, if F has dimensions [MLT⁻²], then P has:","options":["[ML⁻¹T⁻²]","[MLT⁻²]","[ML²T⁻²]","[MT⁻²]"],"correctIndex":0,"topic":"Pressure","difficulty":"Easy","solution":"Force/area = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]."},
      {"id":24,"question":"The dimensional formula for permittivity of free space ε₀ is:","options":["[M⁻¹L⁻³T⁴I²]","[ML⁻³T⁴I²]","[M⁻¹L⁻²T⁴I²]","[ML⁻²T⁴I²]"],"correctIndex":0,"topic":"Electricity","difficulty":"Hard","solution":"From Coulomb's law, solve for [ε₀]."},
      {"id":25,"question":"Moment of inertia has dimensions:","options":["[ML²]","[ML²T⁻²]","[MLT⁻²]","[M²L²]"],"correctIndex":0,"topic":"Rotational Mechanics","difficulty":"Medium","solution":"I = mr², so [M][L²] = [ML²]."},
      {"id":26,"question":"The dimensional formula for electric current density is:","options":["[IL⁻²]","[I]","[IL⁻¹]","[IL⁻³]"],"correctIndex":0,"topic":"Current Electricity","difficulty":"Medium","solution":"Current/area = [I]/[L²] = [IL⁻²]."},
      {"id":27,"question":"Thermal conductivity has dimensions:","options":["[MLT⁻³K⁻¹]","[ML²T⁻³K⁻¹]","[MLT⁻²K⁻¹]","[ML³T⁻³K⁻¹]"],"correctIndex":0,"topic":"Heat Transfer","difficulty":"Hard","solution":"Heat flow rate/(area × temperature gradient)."},
      {"id":28,"question":"The dimensions of acceleration are:","options":["[LT⁻¹]","[LT⁻²]","[MLT⁻²]","[L²T⁻²]"],"correctIndex":1,"topic":"Kinematics","difficulty":"Easy","solution":"Velocity/time = [LT⁻¹]/[T] = [LT⁻²]."},
      {"id":29,"question":"Universal gas constant R has dimensions:","options":["[ML²T⁻²K⁻¹mol⁻¹]","[MLT⁻²K⁻¹mol⁻¹]","[ML²T⁻³K⁻¹mol⁻¹]","[M²L²T⁻²K⁻¹mol⁻¹]"],"correctIndex":0,"topic":"Thermodynamics","difficulty":"Hard","solution":"PV = nRT, solve for [R]."},
      {"id":30,"question":"The dimensional formula for angular velocity is:","options":["[T⁻¹]","[LT⁻¹]","[ML²T⁻¹]","[M⁰L⁰T⁻¹]"],"correctIndex":3,"topic":"Rotational Motion","difficulty":"Easy","solution":"Angle/time = [dimensionless]/[T] = [T⁻¹]."},
      {"id":31,"question":"Electric resistance has dimensions:","options":["[ML²T⁻³I⁻²]","[MLT⁻³I⁻²]","[ML²T⁻²I⁻²]","[M²L²T⁻³I⁻²]"],"correctIndex":0,"topic":"Electricity","difficulty":"Medium","solution":"V/I = [ML²T⁻³I⁻¹]/[I] = [ML²T⁻³I⁻²]."},
      {"id":32,"question":"The dimensions of gravitational field are:","options":["[LT⁻²]","[MLT⁻²]","[ML²T⁻²]","[M⁻¹LT⁻²]"],"correctIndex":0,"topic":"Gravitation","difficulty":"Medium","solution":"Force/mass = [MLT⁻²]/[M] = [LT⁻²]."},
      {"id":33,"question":"Poisson's ratio is:","options":["[ML⁻¹T⁻²]","[M⁰L⁰T⁰]","[LT⁻²]","[MLT⁻²]"],"correctIndex":1,"topic":"Elasticity","difficulty":"Easy","solution":"Lateral strain/longitudinal strain is dimensionless."},
      {"id":34,"question":"The dimensional formula for energy density is:","options":["[ML⁻¹T⁻²]","[ML²T⁻²]","[MLT⁻²]","[M²LT⁻²]"],"correctIndex":0,"topic":"Energy","difficulty":"Medium","solution":"Energy/volume = [ML²T⁻²]/[L³] = [ML⁻¹T⁻²]."},
      {"id":35,"question":"Magnetic permeability μ₀ has dimensions:","options":["[MLT⁻²I⁻²]","[M²LT⁻²I⁻²]","[ML²T⁻²I⁻²]","[MLT⁻³I⁻²]"],"correctIndex":0,"topic":"Magnetism","difficulty":"Hard","solution":"From magnetic force law, derive [μ₀]."},
      {"id":36,"question":"The dimensions of stress are:","options":["[ML⁻¹T⁻²]","[MLT⁻²]","[ML²T⁻²]","[MT⁻²]"],"correctIndex":0,"topic":"Mechanics","difficulty":"Medium","solution":"Force/area = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]."},
      {"id":37,"question":"Kinetic energy has dimensional formula:","options":["[ML²T⁻²]","[MLT⁻²]","[ML²T⁻¹]","[M²L²T⁻²]"],"correctIndex":0,"topic":"Energy","difficulty":"Easy","solution":"½mv² = [M][LT⁻¹]² = [ML²T⁻²]."},
      {"id":38,"question":"The dimensions of electric flux are:","options":["[ML³T⁻³I⁻¹]","[ML²T⁻³I⁻¹]","[MLT⁻³I⁻¹]","[ML⁴T⁻³I⁻¹]"],"correctIndex":0,"topic":"Electricity","difficulty":"Hard","solution":"Electric field × area = [MLT⁻³I⁻¹][L²]."},
      {"id":39,"question":"Wavelength has dimensions:","options":["[L]","[LT⁻¹]","[T]","[M⁰L¹T⁰]"],"correctIndex":3,"topic":"Waves","difficulty":"Easy","solution":"Wavelength is a length = [L]."},
      {"id":40,"question":"The dimensional formula for force constant is:","options":["[MT⁻²]","[MLT⁻²]","[ML²T⁻²]","[M²T⁻²]"],"correctIndex":0,"topic":"Oscillations","difficulty":"Medium","solution":"Force/displacement = [MLT⁻²]/[L] = [MT⁻²]."},
      {"id":41,"question":"Coefficient of linear expansion has dimensions:","options":["[K⁻¹]","[LK⁻¹]","[M⁰L⁰T⁰K⁻¹]","[MLK⁻¹]"],"correctIndex":2,"topic":"Thermal Expansion","difficulty":"Medium","solution":"Fractional change in length per unit temperature change."},
      {"id":42,"question":"The dimensions of electric charge are:","options":["[I]","[IT]","[MLT⁻¹]","[ML²T⁻²]"],"correctIndex":1,"topic":"Electricity","difficulty":"Easy","solution":"Current × time = [I][T] = [IT]."},
      {"id":43,"question":"Entropy has dimensional formula:","options":["[ML²T⁻²K⁻¹]","[MLT⁻²K⁻¹]","[ML³T⁻²K⁻¹]","[M²L²T⁻²K⁻¹]"],"correctIndex":0,"topic":"Thermodynamics","difficulty":"Hard","solution":"Energy/temperature = [ML²T⁻²]/[K]."},
      {"id":44,"question":"The dimensions of momentum are:","options":["[MLT⁻¹]","[ML²T⁻¹]","[MLT⁻²]","[M²LT⁻¹]"],"correctIndex":0,"topic":"Mechanics","difficulty":"Easy","solution":"Mass × velocity = [M][LT⁻¹] = [MLT⁻¹]."},
      {"id":45,"question":"Electric field intensity has dimensions:","options":["[MLT⁻³I⁻¹]","[ML²T⁻³I⁻¹]","[MLT⁻²I⁻¹]","[M²LT⁻³I⁻¹]"],"correctIndex":0,"topic":"Electricity","difficulty":"Medium","solution":"Force per unit charge = [MLT⁻²]/[IT]."},
      {"id":46,"question":"The dimensional formula for angular acceleration is:","options":["[T⁻²]","[LT⁻²]","[M⁰L⁰T⁻²]","[MLT⁻²]"],"correctIndex":2,"topic":"Rotational Motion","difficulty":"Medium","solution":"Angular velocity/time = [T⁻¹]/[T] = [T⁻²]."},
      {"id":47,"question":"Latent heat has dimensions:","options":["[L²T⁻²]","[ML²T⁻²]","[MLT⁻²]","[M⁻¹L²T⁻²]"],"correctIndex":0,"topic":"Heat","difficulty":"Medium","solution":"Energy per unit mass = [ML²T⁻²]/[M] = [L²T⁻²]."},
      {"id":48,"question":"The dimensions of pressure are:","options":["[ML⁻¹T⁻²]","[MLT⁻²]","[ML²T⁻²]","[M²LT⁻²]"],"correctIndex":0,"topic":"Fluid Mechanics","difficulty":"Easy","solution":"Force per unit area = [MLT⁻²]/[L²]."},
      {"id":49,"question":"Velocity gradient has dimensions:","options":["[T⁻¹]","[LT⁻²]","[M⁰L⁰T⁻¹]","[LT⁻¹]"],"correctIndex":2,"topic":"Fluid Flow","difficulty":"Medium","solution":"Velocity/distance = [LT⁻¹]/[L] = [T⁻¹]."},
      {"id":50,"question":"The dimensional formula for capacitance is:","options":["[M⁻¹L⁻²T⁴I²]","[ML⁻²T⁴I²]","[M⁻¹LT⁴I²]","[ML⁻³T⁴I²]"],"correctIndex":0,"topic":"Electricity","difficulty":"Hard","solution":"Charge/potential = [IT]/[ML²T⁻³I⁻¹] = [M⁻¹L⁻²T⁴I²]."}
    ];
  }

  // Initialize the application
  async init() {
    try {
      // Initialize modules
      this.stateManager = new StateManager();
      this.viewManager = new ViewManager();
      this.questionManager = new QuestionManager();
      
      // Load state and initialize view manager
      this.stateManager.loadState();
      await this.viewManager.init();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update landing view with current state
      this.viewManager.updateLandingView(this.stateManager.getState());
      
      console.log('MockTestApp initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
      Utils.showError('Failed to initialize application');
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    try {
      // Landing view events
      this.bindLandingEvents();
      
      // Test view events
      this.bindTestEvents();
      
      // Review panel events
      this.bindReviewEvents();
      
      // Result view events
      this.bindResultEvents();
      
      // Review answers events
      this.bindReviewAnswersEvents();
      
      // Keyboard navigation
      this.bindKeyboardEvents();
      
      console.log('Event listeners setup complete');
    } catch (error) {
      console.error('Event listener setup error:', error);
    }
  }

  // Bind landing view events
  bindLandingEvents() {
    const elements = {
      'start-test-btn': () => this.startTest(),
      'resume-test-btn': () => this.resumeTest(),
      'reset-test-btn': () => this.resetTest(),
      'test-duration': () => this.updateTestDuration(),
      'custom-minutes': () => this.validateCustomDuration(),
      'custom-seconds': () => this.validateCustomDuration(),
      'rrb-mode': () => this.toggleRRBMode(),
      'dark-mode': () => this.toggleDarkMode(),
      'enhanced-timer': () => this.toggleEnhancedTimer(),
      'question-source': () => this.toggleQuestionSource(),
      'json-file': (e) => this.handleJSONUpload(e),
      'download-example-btn': () => this.downloadExampleJSON()
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        const eventType = element.type === 'file' ? 'change' :
                         element.tagName === 'SELECT' ? 'change' :
                         element.type === 'checkbox' ? 'change' : 
                         'click';
        Utils.addEventListener(element, eventType, handler);
      }
    });
  }

  // Bind test view events
  bindTestEvents() {
    const elements = {
      'bookmark-btn': () => this.toggleBookmark(),
      'clear-answer-btn': () => this.clearAnswer(),
      'prev-btn': () => this.navigateQuestion(-1),
      'next-btn': () => this.navigateQuestion(1),
      'review-panel-btn': () => this.showReviewPanel(),
      'submit-test-btn': () => this.submitTest()
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        Utils.addEventListener(element, 'click', handler);
      }
    });
  }

  // Bind review panel events
  bindReviewEvents() {
    const elements = {
      'close-review-btn': () => this.hideReviewPanel(),
      'submit-from-review-btn': () => this.submitTest()
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        Utils.addEventListener(element, 'click', handler);
      }
    });

    // Modal backdrop and close button
    const modalClose = document.querySelector('.modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    
    if (modalClose) {
      Utils.addEventListener(modalClose, 'click', () => this.hideReviewPanel());
    }
    if (modalBackdrop) {
      Utils.addEventListener(modalBackdrop, 'click', () => this.hideReviewPanel());
    }
  }

  // Bind result view events
  bindResultEvents() {
    const elements = {
      'review-answers-btn': () => this.showReviewAnswers(),
      'view-solutions-btn': () => this.showReviewAnswers(),
      'export-results-btn': () => this.exportResults(),
      'new-test-btn': () => this.startNewTest()
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        Utils.addEventListener(element, 'click', handler);
      }
    });
  }

  // Bind review answers events
  bindReviewAnswersEvents() {
    const elements = {
      'back-to-results-btn': () => this.showResults(),
      'review-prev-btn': () => this.navigateReview(-1),
      'review-next-btn': () => this.navigateReview(1)
    };

    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        Utils.addEventListener(element, 'click', handler);
      }
    });
  }

  // Bind keyboard events
  bindKeyboardEvents() {
    Utils.addEventListener(document, 'keydown', (e) => this.handleKeyboard(e));
  }

  // Get current questions (either custom or default)
  getCurrentQuestions() {
    const state = this.stateManager.getState();
    return state.customQuestions || this.QUESTIONS;
  }

  // Landing view methods
  startTest() {
    try {
      this.stateManager.setTestStart();
      this.stateManager.setCurrentQuestion(0);
      
      this.viewManager.showView('test');
      this.startMainTimer();
      this.startAutoSave();
      this.displayQuestion();
    } catch (error) {
      console.error('Start test error:', error);
      Utils.showError('Failed to start test');
    }
  }

  resumeTest() {
    try {
      this.viewManager.showView('test');
      this.startMainTimer();
      this.startAutoSave();
      this.displayQuestion();
    } catch (error) {
      console.error('Resume test error:', error);
      Utils.showError('Failed to resume test');
    }
  }

  resetTest() {
    if (confirm('Are you sure you want to reset your test progress? This cannot be undone.')) {
      try {
        this.stateManager.resetState();
        location.reload();
      } catch (error) {
        console.error('Reset test error:', error);
        Utils.showError('Failed to reset test');
      }
    }
  }

  updateTestDuration() {
    try {
      const durationSelect = document.getElementById('test-duration');
      const customSection = document.getElementById('custom-duration-section');
      
      if (durationSelect.value === 'custom') {
        customSection.classList.remove('hidden');
        const customDuration = this.getCustomDuration();
        if (customDuration > 0) {
          this.stateManager.updateState({ testDuration: customDuration });
        }
      } else {
        customSection.classList.add('hidden');
        this.stateManager.updateState({ testDuration: parseInt(durationSelect.value) });
      }
    } catch (error) {
      console.error('Update test duration error:', error);
    }
  }

  getCustomDuration() {
    try {
      const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
      const seconds = parseInt(document.getElementById('custom-seconds').value) || 0;
      return Utils.convertToTotalMinutes(minutes, seconds);
    } catch (error) {
      console.error('Get custom duration error:', error);
      return 0;
    }
  }

  validateCustomDuration() {
    try {
      const minutesInput = document.getElementById('custom-minutes');
      const secondsInput = document.getElementById('custom-seconds');
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      
      const validation = Utils.validateCustomDuration(minutes, seconds);
      
      minutesInput.classList.toggle('invalid', !validation.minutes);
      secondsInput.classList.toggle('invalid', !validation.seconds);
      
      if (validation.isValid) {
        const customDuration = Utils.convertToTotalMinutes(minutes, seconds);
        if (document.getElementById('test-duration').value === 'custom') {
          this.stateManager.updateState({ testDuration: customDuration });
        }
      }
    } catch (error) {
      console.error('Validate custom duration error:', error);
    }
  }

  toggleRRBMode() {
    try {
      const isRRBMode = document.getElementById('rrb-mode').checked;
      if (isRRBMode) {
        document.getElementById('test-duration').value = 90;
        this.stateManager.updateState({ testDuration: 90, isRRBMode: true });
        document.body.setAttribute('data-rrb-mode', 'true');
      } else {
        document.body.removeAttribute('data-rrb-mode');
        this.stateManager.updateState({ isRRBMode: false });
      }
    } catch (error) {
      console.error('Toggle RRB mode error:', error);
    }
  }

  toggleDarkMode() {
    try {
      const isDarkMode = document.getElementById('dark-mode').checked;
      this.stateManager.updateState({ isDarkMode });
      document.body.setAttribute('data-color-scheme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Toggle dark mode error:', error);
    }
  }

  toggleEnhancedTimer() {
    try {
      const enhancedTimer = document.getElementById('enhanced-timer').checked;
      this.stateManager.updateState({ enhancedTimer });
    } catch (error) {
      console.error('Toggle enhanced timer error:', error);
    }
  }

  toggleQuestionSource() {
    try {
      const questionSource = document.getElementById('question-source').value;
      this.stateManager.updateState({ questionSource });
      this.viewManager.toggleQuestionSourceSection(questionSource);
    } catch (error) {
      console.error('Toggle question source error:', error);
    }
  }

  async handleJSONUpload(event) {
    const file = event.target.files[0];
    const statusElement = document.getElementById('json-status');
    
    if (!file) {
      statusElement.classList.add('hidden');
      return;
    }
    
    try {
      statusElement.classList.remove('hidden', 'success', 'error');
      statusElement.innerHTML = '<div>Processing JSON file...</div>';
      
      const result = await this.questionManager.loadFromFile(file);
      
      if (result.success) {
        this.stateManager.setCustomQuestions(result.questions);
        
        statusElement.classList.add('success');
        statusElement.innerHTML = `<div>✅ Successfully loaded ${result.count} questions from JSON file</div>`;
        
        this.viewManager.updateQuestionCount(this.stateManager.getState());
      }
    } catch (error) {
      statusElement.classList.add('error');
      statusElement.innerHTML = `
        <div>❌ Failed to load JSON file:</div>
        <ul><li>${error.error || error.message}</li></ul>
      `;
      
      // Reset to default questions
      this.stateManager.updateState({ questionSource: 'default', customQuestions: null });
      document.getElementById('question-source').value = 'default';
      this.viewManager.updateQuestionCount(this.stateManager.getState());
    }
  }

  downloadExampleJSON() {
    try {
      const exampleData = this.questionManager.getExampleJSON();
      Utils.exportJSON(exampleData, 'example-questions.json');
    } catch (error) {
      console.error('Download example JSON error:', error);
      Utils.showError('Failed to download example JSON');
    }
  }

  // Test flow methods will be continued in the next file...
  // This is part 1 of the main app.js module
}