// Utility Functions Module
// Common utility functions used throughout the application

class Utils {
  // Format time from milliseconds to readable format
  static formatTime(milliseconds) {
    try {
      const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('Format time error:', error);
      return '00:00';
    }
  }

  // Export data as JSON file
  static exportJSON(data, filename) {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = filename;
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      console.error('Export JSON error:', error);
    }
  }

  // Validate custom duration inputs
  static validateCustomDuration(minutes, seconds) {
    const minutesValid = minutes >= 1 && minutes <= 300;
    const secondsValid = seconds >= 0 && seconds <= 59;
    
    return {
      isValid: minutesValid && secondsValid,
      minutes: minutesValid,
      seconds: secondsValid
    };
  }

  // Convert minutes and seconds to total minutes (decimal)
  static convertToTotalMinutes(minutes, seconds) {
    return minutes + (seconds / 60);
  }

  // Create safe DOM element updates
  static updateElement(selector, content, property = 'textContent') {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element && content !== undefined && content !== null) {
      element[property] = content;
    }
  }

  // Add/remove classes safely
  static toggleClass(selector, className, force) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element) {
      element.classList.toggle(className, force);
    }
  }

  // Create option element for select
  static createOption(value, text, selected = false) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    option.selected = selected;
    return option;
  }

  // Debounce function for performance optimization
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for performance optimization
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Deep clone object
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = Utils.deepClone(obj[key]);
      });
      return clonedObj;
    }
  }

  // Generate unique ID
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if element is in viewport
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Scroll element into view smoothly
  static scrollIntoView(element, behavior = 'smooth') {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior, block: 'center' });
    }
  }

  // Add event listener with error handling
  static addEventListener(element, event, handler, options = {}) {
    if (element && typeof handler === 'function') {
      const wrappedHandler = (e) => {
        try {
          handler(e);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      };
      element.addEventListener(event, wrappedHandler, options);
      return wrappedHandler;
    }
  }

  // Remove event listener safely
  static removeEventListener(element, event, handler, options = {}) {
    if (element && handler) {
      element.removeEventListener(event, handler, options);
    }
  }

  // Parse JSON safely
  static parseJSON(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parse error:', error);
      return defaultValue;
    }
  }

  // Format number with commas
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Calculate percentage
  static calculatePercentage(value, total, decimals = 0) {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
  }

  // Get random color from predefined palette
  static getRandomColor(index = null) {
    const colors = [
      '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', 
      '#5D878F', '#DB4545', '#D2BA4C', '#964325'
    ];
    
    if (index !== null) {
      return colors[index % colors.length];
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Check if running in development mode
  static isDevelopment() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  // Log message only in development
  static devLog(message, ...args) {
    if (Utils.isDevelopment()) {
      console.log(message, ...args);
    }
  }

  // Show user-friendly error message
  static showError(message, title = 'Error') {
    if (typeof message === 'object' && message.message) {
      message = message.message;
    }
    
    // In a real app, this might show a toast or modal
    console.error(`${title}: ${message}`);
    
    // For now, use alert as fallback
    if (Utils.isDevelopment()) {
      alert(`${title}: ${message}`);
    }
  }

  // Show success message
  static showSuccess(message, title = 'Success') {
    console.log(`${title}: ${message}`);
    
    // In development, show alert
    if (Utils.isDevelopment()) {
      alert(`${title}: ${message}`);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

// Also expose as global for backward compatibility
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}