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

  // Escape text for safe insertion into HTML
  static escapeHtml(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (!/[&<>"'`=]/.test(str)) return str;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };
    return str.replace(/[&<>"'`=]/g, ch => map[ch]);
  }

  // Show user-friendly error message
  static showError(message, title = 'Error') {
    if (typeof message === 'object' && message.message) {
      message = message.message;
    }
    
    console.error(`${title}: ${message}`);
    Toast.error(message, title);
  }

  // Show success message
  static showSuccess(message, title = 'Success') {
    console.log(`${title}: ${message}`);
    Toast.success(message, title);
  }

  // Show warning message
  static showWarning(message, title = 'Warning') {
    console.warn(`${title}: ${message}`);
    Toast.warning(message, title);
  }

  // Show info message
  static showInfo(message, title = 'Info') {
    console.info(`${title}: ${message}`);
    Toast.info(message, title);
  }
}

/**
 * Toast Notification System
 * Provides elegant toast notifications for user feedback
 */
class Toast {
  static container = null;
  static toasts = new Map();
  static idCounter = 0;

  // Initialize toast container
  static init() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = 'toast-container';
      document.body.appendChild(Toast.container);
    }
  }

  // Create and show a toast
  static show(message, title = '', type = 'info', duration = 5000) {
    Toast.init();
    
    const id = ++Toast.idCounter;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('data-toast-id', id);
    
    // Get appropriate icon for toast type
    const icon = Toast.getIcon(type);
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${Utils.escapeHtml(title)}</div>` : ''}
        <div class="toast-message">${Utils.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;

    // Add event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => Toast.hide(id));

    // Add to container
    Toast.container.appendChild(toast);
    
    // Store toast reference
    Toast.toasts.set(id, {
      element: toast,
      timeout: null
    });

    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-hide after duration
    if (duration > 0) {
      const progressBar = toast.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = `${duration}ms`;
        requestAnimationFrame(() => {
          progressBar.style.width = '0%';
        });
      }

      const timeout = setTimeout(() => {
        Toast.hide(id);
      }, duration);

      Toast.toasts.get(id).timeout = timeout;
    }

    return id;
  }

  // Hide a specific toast
  static hide(id) {
    const toastData = Toast.toasts.get(id);
    if (!toastData) return;

    const { element, timeout } = toastData;
    
    // Clear timeout if it exists
    if (timeout) {
      clearTimeout(timeout);
    }

    // Hide animation
    element.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      Toast.toasts.delete(id);
    }, 300);
  }

  // Clear all toasts
  static clear() {
    Toast.toasts.forEach((_, id) => Toast.hide(id));
  }

  // Convenience methods for different toast types
  static success(message, title = 'Success', duration = 4000) {
    return Toast.show(message, title, 'success', duration);
  }

  static error(message, title = 'Error', duration = 6000) {
    return Toast.show(message, title, 'error', duration);
  }

  static warning(message, title = 'Warning', duration = 5000) {
    return Toast.show(message, title, 'warning', duration);
  }

  static info(message, title = 'Info', duration = 4000) {
    return Toast.show(message, title, 'info', duration);
  }

  // Get icon for toast type
  static getIcon(type) {
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`
    };
    return icons[type] || icons.info;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils, Toast };
}

// Also expose as globals for backward compatibility
if (typeof window !== 'undefined') {
  window.Utils = Utils;
  window.Toast = Toast;
}
