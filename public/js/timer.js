// Custom Timer Component for Units-measurements Application
// Provides reusable timer functionality with audio/visual alerts and progress indicators
// Fixed version with comprehensive bug fixes and improvements

class CustomTimer {
  constructor(options = {}) {
    // Validate and sanitize input options
    this.validateOptions(options);
    
    this.duration = Math.max(0, options.duration || 60); // Duration in minutes (can be decimal)
    this.element = options.element || null; // DOM element to display timer
    this.progressElement = options.progressElement || null; // Progress indicator element
    this.onTick = typeof options.onTick === 'function' ? options.onTick : null; // Callback for each tick
    this.onComplete = typeof options.onComplete === 'function' ? options.onComplete : null; // Callback when timer completes
    this.onWarning = typeof options.onWarning === 'function' ? options.onWarning : null; // Callback for warning thresholds
    this.warningThresholds = this.validateWarningThresholds(options.warningThresholds || [10, 5]); // Warning thresholds in minutes
    this.audioAlert = options.audioAlert !== false; // Enable audio alerts (default: true)
    this.visualAlert = options.visualAlert !== false; // Enable visual alerts (default: true)
    
    // Timer state
    this.isRunning = false;
    this.isPaused = false;
    this.isDestroyed = false;
    this.remainingTime = this.duration * 60 * 1000; // Convert to milliseconds
    this.startTime = null;
    this.pausedTime = 0;
    this.interval = null;
    this.warningsTriggered = new Set();
    
    // Audio context management
    this.audioContext = null;
    this.audioSupported = false;
    
    // Bind methods to preserve context
    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    // Performance tracking
    this.lastTickTime = 0;
    this.tickCount = 0;
    
    this.init();
  }
  
  // Validate constructor options
  validateOptions(options) {
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('Options must be an object');
    }
    
    if (options.duration !== undefined && (typeof options.duration !== 'number' || options.duration < 0)) {
      throw new TypeError('Duration must be a non-negative number');
    }
    
    if (options.element !== undefined && options.element !== null && !this.isValidDOMElement(options.element)) {
      throw new TypeError('Element must be a valid DOM element or null');
    }
    
    if (options.progressElement !== undefined && options.progressElement !== null && !this.isValidDOMElement(options.progressElement)) {
      throw new TypeError('Progress element must be a valid DOM element or null');
    }
  }
  
  // Check if element is a valid DOM element
  isValidDOMElement(element) {
    return element && typeof element === 'object' && element.nodeType === 1;
  }
  
  // Validate warning thresholds
  validateWarningThresholds(thresholds) {
    if (!Array.isArray(thresholds)) {
      console.warn('Warning thresholds must be an array, using default');
      return [10, 5];
    }
    
    return thresholds
      .filter(threshold => typeof threshold === 'number' && threshold > 0)
      .sort((a, b) => b - a); // Sort descending
  }
  
  init() {
    if (this.isDestroyed) return;
    
    try {
      // Initialize audio context if supported and enabled
      this.initializeAudio();
      
      // Add visibility change listener for pause/resume functionality
      this.addVisibilityListener();
      
      // Initialize display
      this.updateDisplay();
      
      // Validate DOM elements if provided
      this.validateDOMElements();
      
    } catch (error) {
      console.error('Timer initialization failed:', error);
    }
  }
  
  // Initialize audio context safely
  initializeAudio() {
    if (!this.audioAlert) return;
    
    try {
      // Feature detection for AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.audioSupported = true;
        
        // Handle audio context state changes
        if (this.audioContext.state === 'suspended') {
          // Will be resumed on user interaction
          this.audioContext.resume().catch(err => {
            console.warn('Audio context resume failed:', err);
          });
        }
      } else {
        console.warn('AudioContext not supported in this browser');
        this.audioSupported = false;
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.audioSupported = false;
    }
  }
  
  // Add visibility change listener
  addVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
  
  // Remove visibility change listener
  removeVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
  
  // Handle visibility change for better timer accuracy
  handleVisibilityChange() {
    if (this.isDestroyed || !this.isRunning || this.isPaused) return;
    
    if (document.hidden) {
      // Page is hidden, record the time
      this.lastVisibleTime = Date.now();
    } else {
      // Page is visible again, adjust for time difference
      if (this.lastVisibleTime && this.startTime) {
        const hiddenTime = Date.now() - this.lastVisibleTime;
        // Only adjust if hidden time is significant (> 2 seconds)
        if (hiddenTime > 2000) {
          this.startTime += hiddenTime;
        }
      }
    }
  }
  
  // Validate DOM elements
  validateDOMElements() {
    if (this.element && !document.contains(this.element)) {
      console.warn('Timer display element is not in DOM');
    }
    
    if (this.progressElement && !document.contains(this.progressElement)) {
      console.warn('Progress element is not in DOM');
    }
  }
  
  start() {
    if (this.isDestroyed) {
      console.error('Cannot start destroyed timer');
      return false;
    }
    
    if (this.isRunning && !this.isPaused) {
      console.warn('Timer is already running');
      return false;
    }
    
    try {
      this.isRunning = true;
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;
      this.lastTickTime = Date.now();
      
      // Clear any existing interval
      this.clearInterval();
      
      // Use high-precision timer if available
      this.interval = setInterval(this.tick, 100); // Higher frequency for better accuracy
      
      this.updateDisplay();
      
      // Resume audio context if needed
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(err => {
          console.warn('Audio context resume failed:', err);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Timer start failed:', error);
      return false;
    }
  }
  
  pause() {
    if (this.isDestroyed || !this.isRunning || this.isPaused) {
      return false;
    }
    
    try {
      this.isPaused = true;
      this.pausedTime = Date.now() - this.startTime;
      
      this.clearInterval();
      this.updateDisplay();
      
      return true;
    } catch (error) {
      console.error('Timer pause failed:', error);
      return false;
    }
  }
  
  resume() {
    if (this.isDestroyed || !this.isRunning || !this.isPaused) {
      return false;
    }
    
    try {
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;
      this.lastTickTime = Date.now();
      
      this.interval = setInterval(this.tick, 100);
      this.updateDisplay();
      
      return true;
    } catch (error) {
      console.error('Timer resume failed:', error);
      return false;
    }
  }
  
  reset() {
    if (this.isDestroyed) return false;
    
    try {
      this.stop();
      this.remainingTime = this.duration * 60 * 1000;
      this.pausedTime = 0;
      this.warningsTriggered.clear();
      this.tickCount = 0;
      this.updateDisplay();
      
      return true;
    } catch (error) {
      console.error('Timer reset failed:', error);
      return false;
    }
  }
  
  stop() {
    if (this.isDestroyed) return false;
    
    try {
      this.isRunning = false;
      this.isPaused = false;
      this.clearInterval();
      
      return true;
    } catch (error) {
      console.error('Timer stop failed:', error);
      return false;
    }
  }
  
  // Safely clear interval
  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  tick() {
    if (this.isDestroyed || !this.isRunning || this.isPaused) {
      this.clearInterval();
      return;
    }
    
    try {
      const now = Date.now();
      
      // Throttle updates to once per second for display
      if (now - this.lastTickTime < 900) { // Allow some variance
        return;
      }
      
      this.lastTickTime = now;
      this.tickCount++;
      
      const elapsed = now - this.startTime;
      const totalDuration = this.duration * 60 * 1000;
      this.remainingTime = Math.max(0, totalDuration - elapsed);
      
      this.updateDisplay();
      this.checkWarnings();
      
      // Call user callback safely
      if (this.onTick) {
        try {
          this.onTick(this.remainingTime);
        } catch (error) {
          console.error('onTick callback error:', error);
        }
      }
      
      if (this.remainingTime <= 0) {
        this.complete();
      }
    } catch (error) {
      console.error('Timer tick error:', error);
      this.stop();
    }
  }
  
  complete() {
    if (this.isDestroyed) return;
    
    try {
      this.stop();
      this.remainingTime = 0;
      this.updateDisplay();
      
      this.triggerAlert('complete');
      
      // Call user callback safely
      if (this.onComplete) {
        try {
          this.onComplete();
        } catch (error) {
          console.error('onComplete callback error:', error);
        }
      }
    } catch (error) {
      console.error('Timer complete error:', error);
    }
  }
  
  checkWarnings() {
    if (this.isDestroyed || this.warningThresholds.length === 0) return;
    
    try {
      const remainingMinutes = Math.ceil(this.remainingTime / (60 * 1000));
      
      this.warningThresholds.forEach(threshold => {
        if (remainingMinutes <= threshold && !this.warningsTriggered.has(threshold)) {
          this.warningsTriggered.add(threshold);
          this.triggerAlert('warning', threshold);
          
          // Call user callback safely
          if (this.onWarning) {
            try {
              this.onWarning(threshold, this.remainingTime);
            } catch (error) {
              console.error('onWarning callback error:', error);
            }
          }
        }
      });
    } catch (error) {
      console.error('Warning check error:', error);
    }
  }
  
  triggerAlert(type, threshold = null) {
    if (this.isDestroyed) return;
    
    try {
      if (this.audioAlert && this.audioSupported) {
        this.playAudioAlert(type, threshold);
      }
      
      if (this.visualAlert) {
        this.showVisualAlert(type, threshold);
      }
    } catch (error) {
      console.error('Alert trigger error:', error);
    }
  }
  
  playAudioAlert(type, threshold) {
    if (!this.audioContext || this.audioContext.state !== 'running') {
      return;
    }
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const currentTime = this.audioContext.currentTime;
      
      // Different frequencies for different alert types
      if (type === 'complete') {
        // Play completion melody
        oscillator.frequency.setValueAtTime(800, currentTime);
        oscillator.frequency.setValueAtTime(600, currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
      } else if (type === 'warning') {
        // Higher frequency for more urgent warnings
        const frequency = threshold <= 5 ? 600 : 400;
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
      }
      
      // Clean up oscillator after use
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      };
      
    } catch (error) {
      console.warn('Audio alert failed:', error);
      this.audioSupported = false; // Disable audio on error
    }
  }
  
  showVisualAlert(type, threshold) {
    if (!this.element || !this.isValidDOMElement(this.element)) return;
    
    try {
      const alertClass = type === 'complete' ? 'timer-complete' : 
                       threshold <= 5 ? 'timer-danger' : 'timer-warning';
      
      this.element.classList.add(alertClass, 'timer-alert');
      
      // Remove alert class after animation
      setTimeout(() => {
        if (this.element && !this.isDestroyed) {
          this.element.classList.remove('timer-alert');
        }
      }, 1000);
    } catch (error) {
      console.error('Visual alert error:', error);
    }
  }
  
  updateDisplay() {
    if (this.isDestroyed) return;
    
    try {
      if (this.element && this.isValidDOMElement(this.element)) {
        this.element.textContent = this.formatTime(this.remainingTime);
        
        // Update CSS classes for visual feedback
        this.element.classList.remove('warning', 'danger', 'paused');
        
        if (this.isPaused) {
          this.element.classList.add('paused');
        } else {
          const remainingMinutes = this.remainingTime / (60 * 1000);
          if (remainingMinutes <= 5) {
            this.element.classList.add('danger');
          } else if (remainingMinutes <= 10) {
            this.element.classList.add('warning');
          }
        }
      }
      
      if (this.progressElement && this.isValidDOMElement(this.progressElement)) {
        this.updateProgress();
      }
    } catch (error) {
      console.error('Display update error:', error);
    }
  }
  
  updateProgress() {
    if (!this.progressElement || this.isDestroyed) return;
    
    try {
      const totalTime = this.duration * 60 * 1000;
      const progress = Math.max(0, Math.min(100, ((totalTime - this.remainingTime) / totalTime) * 100));
      
      if (this.progressElement.tagName === 'PROGRESS') {
        this.progressElement.value = progress;
        this.progressElement.max = 100;
      } else {
        // Assume it's a div with progress bar styling
        const progressBar = this.progressElement.querySelector('.progress-bar') || this.progressElement;
        
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
          
          // Update color based on remaining time
          const remainingMinutes = this.remainingTime / (60 * 1000);
          progressBar.classList.remove('progress-warning', 'progress-danger');
          
          if (remainingMinutes <= 5) {
            progressBar.classList.add('progress-danger');
          } else if (remainingMinutes <= 10) {
            progressBar.classList.add('progress-warning');
          }
        }
      }
    } catch (error) {
      console.error('Progress update error:', error);
    }
  }
  
  formatTime(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      return '00:00';
    }
    
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  // Getter methods for current state
  getRemainingTime() {
    return this.isDestroyed ? 0 : this.remainingTime;
  }
  
  getRemainingMinutes() {
    return this.isDestroyed ? 0 : Math.ceil(this.remainingTime / (60 * 1000));
  }
  
  getProgress() {
    if (this.isDestroyed) return 100;
    
    const totalTime = this.duration * 60 * 1000;
    return Math.max(0, Math.min(100, ((totalTime - this.remainingTime) / totalTime) * 100));
  }
  
  isActive() {
    return !this.isDestroyed && this.isRunning && !this.isPaused;
  }
  
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isDestroyed: this.isDestroyed,
      remainingTime: this.remainingTime,
      duration: this.duration,
      progress: this.getProgress(),
      tickCount: this.tickCount
    };
  }
  
  // Setter methods for dynamic configuration
  setDuration(minutes) {
    if (this.isDestroyed) {
      console.error('Cannot modify destroyed timer');
      return false;
    }
    
    if (typeof minutes !== 'number' || minutes < 0) {
      console.error('Duration must be a non-negative number');
      return false;
    }
    
    if (!this.isRunning) {
      this.duration = minutes;
      this.remainingTime = this.duration * 60 * 1000;
      this.updateDisplay();
      return true;
    } else {
      console.warn('Cannot change duration while timer is running');
      return false;
    }
  }
  
  setWarningThresholds(thresholds) {
    if (this.isDestroyed) {
      console.error('Cannot modify destroyed timer');
      return false;
    }
    
    this.warningThresholds = this.validateWarningThresholds(thresholds);
    this.warningsTriggered.clear();
    return true;
  }
  
  enableAudio(enabled = true) {
    if (this.isDestroyed) return false;
    
    this.audioAlert = Boolean(enabled);
    
    if (this.audioAlert && !this.audioSupported) {
      this.initializeAudio();
    }
    
    return true;
  }
  
  enableVisual(enabled = true) {
    if (this.isDestroyed) return false;
    
    this.visualAlert = Boolean(enabled);
    return true;
  }
  
  // Update DOM elements dynamically
  setElement(element) {
    if (this.isDestroyed) return false;
    
    if (element && !this.isValidDOMElement(element)) {
      console.error('Invalid DOM element provided');
      return false;
    }
    
    this.element = element;
    this.updateDisplay();
    return true;
  }
  
  setProgressElement(element) {
    if (this.isDestroyed) return false;
    
    if (element && !this.isValidDOMElement(element)) {
      console.error('Invalid progress DOM element provided');
      return false;
    }
    
    this.progressElement = element;
    this.updateDisplay();
    return true;
  }
  
  // Cleanup method to prevent memory leaks
  destroy() {
    if (this.isDestroyed) return;
    
    try {
      // Stop timer
      this.stop();
      
      // Mark as destroyed
      this.isDestroyed = true;
      
      // Clear interval
      this.clearInterval();
      
      // Close audio context
      if (this.audioContext) {
        if (typeof this.audioContext.close === 'function') {
          this.audioContext.close().catch(err => {
            console.warn('Audio context close failed:', err);
          });
        }
        this.audioContext = null;
      }
      
      // Remove event listeners
      this.removeVisibilityListener();
      
      // Clear callbacks
      this.onTick = null;
      this.onComplete = null;
      this.onWarning = null;
      
      // Clear DOM references
      this.element = null;
      this.progressElement = null;
      
      // Clear collections
      this.warningsTriggered.clear();
      
      console.log('Timer destroyed successfully');
    } catch (error) {
      console.error('Timer destruction error:', error);
    }
  }
  
  // Static utility methods
  static formatTime(milliseconds) {
    if (typeof milliseconds !== 'number' || milliseconds < 0) {
      return '00:00';
    }
    
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  static isAudioSupported() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      return Boolean(AudioContextClass);
    } catch (error) {
      return false;
    }
  }
  
  // Create timer with error handling
  static create(options = {}) {
    try {
      return new CustomTimer(options);
    } catch (error) {
      console.error('Timer creation failed:', error);
      return null;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomTimer;
} else if (typeof window !== 'undefined') {
  window.CustomTimer = CustomTimer;
}

// Add global error handler for unhandled timer errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Timer')) {
      console.error('Global timer error caught:', event.error);
      // You could send this to an error reporting service
    }
  });
}
