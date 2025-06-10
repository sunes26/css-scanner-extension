// =============================================
// Error Handling System
// =============================================

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.errorHistory = [];
    this.maxHistorySize = 50;
    
    this.errorMessages = {
      'CSS_ANALYSIS_FAILED': 'An error occurred while analyzing the element.',
      'CLIPBOARD_ACCESS_DENIED': 'Clipboard access permission denied.',
      'CLIPBOARD_WRITE_FAILED': 'Failed to copy to clipboard.',
      'POPUP_RENDER_FAILED': 'An error occurred while displaying the popup.',
      'ELEMENT_NOT_FOUND': 'Element not found.',
      'PERMISSION_DENIED': 'Required permissions are missing.',
      'NETWORK_ERROR': 'Please check your network connection.',
      'DOM_ACCESS_ERROR': 'Cannot access DOM.',
      'STYLE_CACHE_ERROR': 'Style cache error occurred.',
      'EVENT_HANDLER_ERROR': 'Error occurred while processing event.',
      'MESSAGE_HANDLER_ERROR': 'Error occurred while processing message.',
      'UNKNOWN_ERROR': 'An unknown error occurred.'
    };
    
    this.initGlobalErrorHandlers();
  }
  
  initGlobalErrorHandlers() {
    // Global JavaScript error catch
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), 'GLOBAL_JS_ERROR', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Global Promise rejection catch
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'UNHANDLED_PROMISE_REJECTION');
      event.preventDefault(); // Prevent console error
    });
    
    // Chrome Extension API error monitoring
    if (chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (chrome.runtime.lastError) {
          this.handleError(new Error(chrome.runtime.lastError.message), 'CHROME_API_ERROR');
        }
      });
    }
  }
  
  async handleError(error, errorType, context = {}) {
    console.group(`🚨 [CSS Scanner Error] ${errorType}`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Stack:', error.stack);
    console.groupEnd();
    
    // Record error history
    this.recordError(error, errorType, context);
    
    // Increase error count
    const errorKey = `${errorType}_${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);
    
    // Suppress if too many identical errors
    if (currentCount >= this.maxRetries) {
      console.warn(`Error suppressed: ${errorType} (occurred ${currentCount} times)`);
      return { success: false, suppressed: true };
    }
    
    // Attempt automatic recovery
    const recoveryResult = await this.attemptRecovery(errorType, context);
    
    // Show user-friendly message
    this.showUserFriendlyError(error, errorType, recoveryResult);
    
    return { success: false, recovered: recoveryResult.success, error: error.message };
  }
  
  recordError(error, errorType, context) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message,
      stack: error.stack,
      context: context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.errorHistory.push(errorRecord);
    
    // Limit history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }
  
  async attemptRecovery(errorType, context) {
    try {
      switch (errorType) {
        case 'CSS_ANALYSIS_FAILED':
          return await this.recoverCSSAnalysis(context);
          
        case 'CLIPBOARD_WRITE_FAILED':
          return await this.recoverClipboardAccess(context);
          
        case 'POPUP_RENDER_FAILED':
          return await this.recoverPopupRender(context);
          
        case 'STYLE_CACHE_ERROR':
          return await this.recoverStyleCache(context);
          
        case 'DOM_ACCESS_ERROR':
          return await this.recoverDOMAccess(context);
          
        default:
          return { success: false, message: 'Cannot automatically recover from this error.' };
      }
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError);
      return { success: false, message: 'Additional error occurred during recovery attempt.' };
    }
  }
  
  async recoverCSSAnalysis(context) {
    // Recover with default values when CSS analysis fails
    await this.delay(this.retryDelay);
    
    if (context.element) {
      try {
        // Try to extract only basic styles
        const basicStyle = window.getComputedStyle(context.element);
        const basicInfo = {
          display: basicStyle.display,
          position: basicStyle.position,
          width: basicStyle.width,
          height: basicStyle.height
        };
        
        return { 
          success: true, 
          message: 'Recovered with basic style information.',
          data: basicInfo 
        };
      } catch (retryError) {
        return { success: false, message: 'Recovery failed' };
      }
    }
    
    return { success: false, message: 'No element to recover.' };
  }
  
  async recoverClipboardAccess(context) {
    // Try alternative method when clipboard access fails
    try {
      // Fallback method using textarea
      const textArea = document.createElement('textarea');
      textArea.value = context.text || 'No content to copy.';
      textArea.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      
      document.body.appendChild(textArea);
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        return { success: true, message: 'Copied using alternative method.' };
      }
    } catch (fallbackError) {
      console.error('Fallback copy also failed:', fallbackError);
    }
    
    return { success: false, message: 'Clipboard copy is not available.' };
  }
  
  async recoverPopupRender(context) {
    // Recover with simple form when popup rendering fails
    try {
      await this.delay(this.retryDelay);
      
      // Remove existing popups
      const existingPopups = document.querySelectorAll('.css-scanner-popup');
      existingPopups.forEach(popup => popup.remove());
      
      // Create simple popup
      const simplePopup = document.createElement('div');
      simplePopup.className = 'css-scanner-popup';
      simplePopup.innerHTML = `
        <div style="padding: 16px; background: white; border: 1px solid #ccc; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">CSS Scanner</div>
          <div style="font-size: 12px; color: #666;">
            Popup rendering failed.<br>
            Please refresh the page and try again.
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="margin-top: 8px; padding: 4px 8px; border: 1px solid #ccc; background: white; cursor: pointer;">
            Close
          </button>
        </div>
      `;
      
      document.body.appendChild(simplePopup);
      
      return { success: true, message: 'Recovered with simple popup.' };
    } catch (retryError) {
      return { success: false, message: 'Popup recovery failed' };
    }
  }
  
  async recoverStyleCache(context) {
    // Clear cache when style cache error occurs
    try {
      if (context.styleCache && typeof context.styleCache.clear === 'function') {
        context.styleCache.clear();
        await this.delay(100); // Brief wait
        return { success: true, message: 'Style cache has been cleared.' };
      }
    } catch (retryError) {
      console.error('Cache clear failed:', retryError);
    }
    
    return { success: false, message: 'Style cache recovery failed' };
  }
  
  async recoverDOMAccess(context) {
    // Retry when DOM access error occurs
    try {
      await this.delay(this.retryDelay);
      
      // Wait until DOM is ready
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
          }
        });
      }
      
      return { success: true, message: 'DOM access has been recovered.' };
    } catch (retryError) {
      return { success: false, message: 'DOM access recovery failed' };
    }
  }
  
  showUserFriendlyError(error, errorType, recoveryResult) {
    const userMessage = this.getUserFriendlyMessage(errorType, recoveryResult);
    const messageType = recoveryResult.success ? 'warning' : 'error';
    
    // Show through NotificationManager
    if (window.NotificationManager) {
      NotificationManager.showMessage(userMessage, messageType);
    } else {
      // Fallback: output to console
      console.log(`[User Message] ${userMessage}`);
    }
  }
  
  getUserFriendlyMessage(errorType, recoveryResult) {
    const baseMessage = this.errorMessages[errorType] || this.errorMessages['UNKNOWN_ERROR'];
    
    if (recoveryResult.success) {
      return `⚠️ ${baseMessage} ${recoveryResult.message}`;
    } else {
      return `❌ ${baseMessage} Please refresh the page and try again.`;
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Error statistics and debugging information
  getErrorStats() {
    return {
      totalErrors: this.errorHistory.length,
      errorCounts: Object.fromEntries(this.errorCounts),
      recentErrors: this.errorHistory.slice(-10),
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Export error history (for debugging)
  exportErrorHistory() {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      errors: this.errorHistory,
      stats: this.getErrorStats()
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  // Clear error counts
  clearErrorCounts() {
    this.errorCounts.clear();
    console.log('Error counts have been cleared.');
  }
}

// =============================================
// SafeWrapper Class - Safe Function Execution
// =============================================

class SafeWrapper {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
  }
  
  // Execute synchronous function safely
  execute(fn, errorType, context = {}) {
    try {
      return { success: true, data: fn() };
    } catch (error) {
      this.errorHandler.handleError(error, errorType, context);
      return { success: false, error: error.message };
    }
  }
  
  // Execute asynchronous function safely
  async executeAsync(fn, errorType, context = {}) {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      await this.errorHandler.handleError(error, errorType, context);
      return { success: false, error: error.message };
    }
  }
  
  // Execute DOM manipulation safely
  executeDOMOperation(fn, errorType = 'DOM_ACCESS_ERROR', context = {}) {
    if (!document || !document.body) {
      this.errorHandler.handleError(
        new Error('Document not ready'), 
        'DOM_NOT_READY', 
        context
      );
      return { success: false, error: 'DOM not ready' };
    }
    
    return this.execute(fn, errorType, context);
  }
}

// =============================================
// Existing Classes with Enhanced Error Handling
// =============================================

class StyleCache {
  constructor(errorHandler) {
    this.cache = new WeakMap();
    this.selectorCache = new WeakMap();
    this.lastClearTime = Date.now();
    this.maxCacheAge = 30000;
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }
  
  getComputedStyle(element) {
    const result = this.safeWrapper.execute(() => {
      if (!this.cache.has(element)) {
        const computedStyle = window.getComputedStyle(element);
        const cachedStyle = this.cacheImportantProperties(computedStyle);
        this.cache.set(element, {
          style: cachedStyle,
          timestamp: Date.now()
        });
      }
      
      const cached = this.cache.get(element);
      if (Date.now() - cached.timestamp > this.maxCacheAge) {
        this.cache.delete(element);
        return this.getComputedStyle(element);
      }
      
      return cached.style;
    }, 'STYLE_CACHE_ERROR', { element });
    
    return result.success ? result.data : {};
  }
  
  cacheImportantProperties(computedStyle) {
    const importantProps = [
      'display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear', 'z-index',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border', 'border-width', 'border-style', 'border-color', 'border-radius',
      'background', 'background-color', 'background-image', 'background-size',
      'font-family', 'font-size', 'font-weight', 'line-height', 'color', 'text-align',
      'flex', 'flex-direction', 'justify-content', 'align-items', 'grid',
      'opacity', 'transform', 'transition', 'box-shadow'
    ];
    
    const cached = {};
    importantProps.forEach(prop => {
      const result = this.safeWrapper.execute(() => {
        return computedStyle.getPropertyValue(prop);
      }, 'STYLE_PROPERTY_ACCESS_ERROR', { property: prop });
      
      if (result.success && result.data) {
        cached[prop] = result.data;
      }
    });
    
    return cached;
  }
  
  getSelector(element) {
    const result = this.safeWrapper.execute(() => {
      if (!this.selectorCache.has(element)) {
        const selector = this.generateOptimizedSelector(element);
        this.selectorCache.set(element, selector);
      }
      return this.selectorCache.get(element);
    }, 'SELECTOR_GENERATION_ERROR', { element });
    
    return result.success ? result.data : 'unknown';
  }
  
  generateOptimizedSelector(element) {
    if (!element || element === document.body) return 'body';
    
    const result = this.safeWrapper.execute(() => {
      if (element.id) {
        return `#${element.id}`;
      }
      
      if (element.className) {
        const classes = element.className.split(' ')
          .filter(cls => cls && !cls.includes('css-scanner'))
          .slice(0, 3);
        
        if (classes.length > 0) {
          const classSelector = '.' + classes.join('.');
          try {
            const matches = document.querySelectorAll(classSelector);
            if (matches.length <= 5) {
              return classSelector;
            }
          } catch (e) {
            // Ignore invalid selector
          }
        }
      }
      
      const path = [];
      let current = element;
      let depth = 0;
      
      while (current && current !== document.body && depth < 3) {
        let selector = current.tagName.toLowerCase();
        
        if (current.parentNode) {
          const siblings = Array.from(current.parentNode.children || []);
          if (siblings.length > 1 && siblings.length <= 10) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-child(${index})`;
          }
        }
        
        path.unshift(selector);
        current = current.parentElement;
        depth++;
      }
      
      return path.join(' > ') || element.tagName?.toLowerCase() || 'unknown';
    }, 'SELECTOR_GENERATION_ERROR', { element });
    
    return result.success ? result.data : 'unknown';
  }
  
  clear() {
    const result = this.safeWrapper.execute(() => {
      this.cache = new WeakMap();
      this.selectorCache = new WeakMap();
      this.lastClearTime = Date.now();
    }, 'CACHE_CLEAR_ERROR');
    
    return result.success;
  }
  
  periodicCleanup() {
    this.safeWrapper.execute(() => {
      if (Date.now() - this.lastClearTime > 60000) {
        this.clear();
      }
    }, 'CACHE_CLEANUP_ERROR');
  }
}

class PerformanceMonitor {
  constructor(errorHandler) {
    this.metrics = {
      analysisTime: [],
      renderTime: [],
      memoryUsage: []
    };
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }
  
  startTiming(operation) {
    const result = this.safeWrapper.execute(() => {
      return {
        operation,
        startTime: performance.now()
      };
    }, 'PERFORMANCE_TIMING_ERROR', { operation });
    
    return result.success ? result.data : { operation, startTime: Date.now() };
  }
  
  endTiming(timer) {
    const result = this.safeWrapper.execute(() => {
      const duration = performance.now() - timer.startTime;
      if (this.metrics[timer.operation]) {
        this.metrics[timer.operation].push(duration);
        if (this.metrics[timer.operation].length > 10) {
          this.metrics[timer.operation].shift();
        }
      }
      return duration;
    }, 'PERFORMANCE_TIMING_ERROR', { timer });
    
    return result.success ? result.data : 0;
  }
  
  getAverageTime(operation) {
    const result = this.safeWrapper.execute(() => {
      const times = this.metrics[operation] || [];
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }, 'PERFORMANCE_CALCULATION_ERROR', { operation });
    
    return result.success ? result.data : 0;
  }
  
  logPerformance() {
    this.safeWrapper.execute(() => {
      console.log('CSS Scanner Performance Metrics:', {
        avgAnalysisTime: `${this.getAverageTime('analysisTime').toFixed(2)}ms`,
        avgRenderTime: `${this.getAverageTime('renderTime').toFixed(2)}ms`
      });
    }, 'PERFORMANCE_LOGGING_ERROR');
  }
}

class CSSAnalyzer {
  constructor(styleCache, errorHandler) {
    this.styleCache = styleCache;
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.cssCategories = this.initializeCSSCategories();
  }
  
  initializeCSSCategories() {
    return {
      layout: ['display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear', 'z-index'],
      boxModel: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
      border: ['border', 'border-width', 'border-style', 'border-color', 'border-radius', 'border-top', 'border-right', 'border-bottom', 'border-left'],
      background: ['background', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat'],
      typography: ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'text-align', 'text-decoration', 'letter-spacing'],
      flexGrid: ['flex', 'flex-direction', 'justify-content', 'align-items', 'grid', 'grid-template-columns', 'grid-template-rows', 'gap'],
      effects: ['opacity', 'transform', 'transition', 'animation', 'box-shadow', 'filter']
    };
  }
  
  extractCSSInfo(element) {
    const result = this.safeWrapper.execute(() => {
      if (!element) {
        throw new Error('Element is null or undefined');
      }
      
      const computedStyle = this.styleCache.getComputedStyle(element);
      const selector = this.styleCache.getSelector(element);
      const inlineStyle = this.extractInlineStyles(element);
      
      const cssInfo = {
        element: {
          tagName: element.tagName.toLowerCase(),
          className: element.className || '',
          id: element.id || '',
          selector: selector
        },
        computed: computedStyle,
        inline: inlineStyle,
        categorized: this.categorizeStyles(computedStyle)
      };
      
      return cssInfo;
    }, 'CSS_ANALYSIS_FAILED', { element });
    
    if (!result.success) {
      // Provide basic info at least
      return {
        element: {
          tagName: element?.tagName?.toLowerCase() || 'unknown',
          className: element?.className || '',
          id: element?.id || '',
          selector: 'unknown'
        },
        computed: {},
        inline: {},
        categorized: {}
      };
    }
    
    return result.data;
  }
  
  extractInlineStyles(element) {
    const result = this.safeWrapper.execute(() => {
      const inline = {};
      const style = element.style;
      
      if (!style || style.length === 0) {
        return inline;
      }
      
      if (style.cssText) {
        const declarations = style.cssText.split(';').filter(decl => decl.trim());
        for (const declaration of declarations) {
          const colonIndex = declaration.indexOf(':');
          if (colonIndex > 0) {
            const prop = declaration.slice(0, colonIndex).trim();
            const value = declaration.slice(colonIndex + 1).trim();
            if (prop && value) {
              inline[prop] = value;
            }
          }
        }
      } else {
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          const value = style.getPropertyValue(prop);
          if (value) {
            inline[prop] = value;
          }
        }
      }
      
      return inline;
    }, 'INLINE_STYLE_EXTRACTION_ERROR', { element });
    
    return result.success ? result.data : {};
  }
  
  categorizeStyles(computedStyle) {
    const result = this.safeWrapper.execute(() => {
      const categorized = {};
      
      for (const [category, properties] of Object.entries(this.cssCategories)) {
        const categoryData = {};
        
        for (const prop of properties) {
          const value = computedStyle[prop];
          if (value && this.isValidCSSValue(value)) {
            categoryData[prop] = value;
          }
        }
        
        if (Object.keys(categoryData).length > 0) {
          categorized[category] = categoryData;
        }
      }
      
      return categorized;
    }, 'STYLE_CATEGORIZATION_ERROR', { computedStyle });
    
    return result.success ? result.data : {};
  }
  
  isValidCSSValue(value) {
    const result = this.safeWrapper.execute(() => {
      if (!value || typeof value !== 'string') return false;
      
      const invalidValues = [
        'auto', 'normal', 'none', 'initial', 'inherit', 'unset',
        '0px', '0', 'rgba(0, 0, 0, 0)', 'transparent'
      ];
      
      return !invalidValues.includes(value.trim());
    }, 'CSS_VALUE_VALIDATION_ERROR', { value });
    
    return result.success ? result.data : false;
  }
}

class ClipboardManager {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    
    this.copyTypeNames = {
      selector: 'Selector',
      all: 'All CSS',
      computed: 'Computed styles',
      inline: 'Inline styles'
    };
  }
  
  async copyToClipboard(elementData, type) {
    const result = await this.safeWrapper.executeAsync(async () => {
      if (!elementData) {
        throw new Error('No data available.');
      }

      let textToCopy = '';
      const selector = elementData.element?.selector || '';
      
      switch (type) {
        case 'selector':
          textToCopy = selector;
          break;
          
        case 'all':
        case 'computed':
          textToCopy = this.generateAllCSSText(elementData, selector);
          break;
          
        case 'inline':
          textToCopy = this.generateInlineCSSText(elementData, selector);
          break;
          
        default:
          throw new Error('Unknown copy type.');
      }

      if (!this.isValidCopyText(textToCopy, selector)) {
        throw new Error('No CSS content to copy.');
      }

      const success = await this.performCopy(textToCopy);
      if (!success) {
        throw new Error('Copy failed.');
      }
      
      return this.copyTypeNames[type] || 'Content';
    }, 'CLIPBOARD_WRITE_FAILED', { elementData, type });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  }
  
  generateAllCSSText(elementData, selector) {
    const result = this.safeWrapper.execute(() => {
      const computedStyles = elementData.computed || {};
      
      if (Object.keys(computedStyles).length === 0) {
        const categorizedStyles = elementData.categorized || {};
        const allStyles = {};
        
        Object.values(categorizedStyles).forEach(categoryStyles => {
          if (categoryStyles && typeof categoryStyles === 'object') {
            Object.assign(allStyles, categoryStyles);
          }
        });
        
        return this.generateCSSText(allStyles, selector);
      } else {
        return this.generateCSSText(computedStyles, selector);
      }
    }, 'CSS_TEXT_GENERATION_ERROR', { elementData, selector });
    
    return result.success ? result.data : '';
  }
  
  generateInlineCSSText(elementData, selector) {
    const result = this.safeWrapper.execute(() => {
      const inlineStyles = elementData.inline || {};
      
      if (Object.keys(inlineStyles).length === 0) {
        throw new Error('No inline styles found.');
      }
      
      return this.generateCSSText(inlineStyles, selector);
    }, 'INLINE_CSS_GENERATION_ERROR', { elementData, selector });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  }
  
  generateCSSText(styles, selector = null) {
    const result = this.safeWrapper.execute(() => {
      if (!styles || typeof styles !== 'object' || Object.keys(styles).length === 0) {
        return '';
      }

      const cssLines = Object.entries(styles)
        .filter(([prop, value]) => {
          return value && 
                 value !== 'none' && 
                 value !== 'auto' && 
                 value !== 'normal' && 
                 value !== 'initial' &&
                 value !== '0px' &&
                 value !== 'rgba(0, 0, 0, 0)';
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([prop, value]) => `  ${prop}: ${value};`);

      if (cssLines.length === 0) {
        return '';
      }

      return selector ? 
        `${selector} {\n${cssLines.join('\n')}\n}` : 
        `{\n${cssLines.join('\n')}\n}`;
    }, 'CSS_TEXT_FORMAT_ERROR', { styles, selector });
    
    return result.success ? result.data : '';
  }
  
  isValidCopyText(textToCopy, selector) {
    const result = this.safeWrapper.execute(() => {
      return textToCopy && 
             textToCopy.trim() !== '' && 
             textToCopy !== '{}' && 
             textToCopy !== `${selector} {\n\n}`;
    }, 'COPY_TEXT_VALIDATION_ERROR', { textToCopy, selector });
    
    return result.success ? result.data : false;
  }
  
  async performCopy(text) {
    const result = await this.safeWrapper.executeAsync(async () => {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          console.log('Clipboard API failed, trying fallback:', err);
        }
      }
      
      // Fallback: execCommand method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      Object.assign(textArea.style, {
        position: 'fixed',
        left: '-999999px',
        top: '-999999px',
        opacity: '0',
        pointerEvents: 'none',
        width: '1px',
        height: '1px'
      });
      
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return success;
    }, 'CLIPBOARD_ACCESS_DENIED', { text });
    
    return result.success ? result.data : false;
  }
}

class ElementSelector {
  constructor(errorHandler) {
    this.highlightedElement = null;
    this.lastHoverElement = null;
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }
  
  highlightElement(element) {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!element || !element.classList) return false;
      
      this.removeHighlight();
      element.classList.add('css-scanner-highlight');
      this.highlightedElement = element;
      this.lastHoverElement = element;
      return true;
    }, 'ELEMENT_HIGHLIGHT_ERROR', { element });
    
    return result.success ? result.data : false;
  }
  
  removeHighlight() {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (this.highlightedElement && this.highlightedElement.classList) {
        this.highlightedElement.classList.remove('css-scanner-highlight');
        this.highlightedElement = null;
      }
    }, 'HIGHLIGHT_REMOVAL_ERROR');
    
    return result.success;
  }
  
  isPopupElement(element) {
    const result = this.safeWrapper.execute(() => {
      return element && element.closest && element.closest('.css-scanner-popup') !== null;
    }, 'POPUP_ELEMENT_CHECK_ERROR', { element });
    
    return result.success ? result.data : false;
  }
  
  isSameElement(element) {
    const result = this.safeWrapper.execute(() => {
      return this.lastHoverElement === element;
    }, 'ELEMENT_COMPARISON_ERROR', { element });
    
    return result.success ? result.data : false;
  }
  
  reset() {
    const result = this.safeWrapper.execute(() => {
      this.removeHighlight();
      this.lastHoverElement = null;
    }, 'ELEMENT_SELECTOR_RESET_ERROR');
    
    return result.success;
  }
  
  getHighlightedElement() {
    return this.highlightedElement;
  }
}

class PopupManager {
  constructor(performanceMonitor, errorHandler) {
    this.popup = null;
    this.isPinned = false;
    this.pinnedPosition = null;
    this.performanceMonitor = performanceMonitor;
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.renderAnimationFrame = null;
    
    this.categoryIcons = {
      layout: '📐',
      boxModel: '📦',
      border: '🔲',
      background: '🎨',
      typography: '📝',
      flexGrid: '📊',
      effects: '✨'
    };
    
    this.categoryNames = {
      layout: 'Layout',
      boxModel: 'Box Model',
      border: 'Border',
      background: 'Background',
      typography: 'Typography',
      flexGrid: 'Flex & Grid',
      effects: 'Effects'
    };
  }
  
  showPopup(elementData, mousePosition) {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!elementData) {
        throw new Error('No element data to show');
      }
      
      const renderTimer = this.performanceMonitor.startTiming('renderTime');
      
      this.closePopup();
      
      const fragment = document.createDocumentFragment();
      
      this.popup = document.createElement('div');
      this.popup.className = 'css-scanner-popup';
      this.popup.innerHTML = this.generatePopupHTML(elementData);
      
      fragment.appendChild(this.popup);
      document.body.appendChild(fragment);
      
      // Set position
      if (this.isPinned && this.pinnedPosition) {
        this.popup.style.left = this.pinnedPosition.left;
        this.popup.style.top = this.pinnedPosition.top;
      } else {
        this.updatePopupPosition(mousePosition);
      }
      
      // Animation
      this.scheduleRender(() => {
        if (this.popup) {
          this.popup.classList.add('show');
        }
      });
      
      this.updatePinnedState();
      
      const renderTime = this.performanceMonitor.endTiming(renderTimer);
      console.log(`Popup render: ${renderTime.toFixed(2)}ms`);
      
      return this.popup;
    }, 'POPUP_RENDER_FAILED', { elementData, mousePosition });
    
    return result.success ? result.data : null;
  }
  
  generatePopupHTML(data) {
    const result = this.safeWrapper.execute(() => {
      const { element, categorized, inline, isPinned } = data;
      
      const hasComputedStyles = Object.keys(data.computed || {}).length > 0;
      const hasInlineStyles = Object.keys(inline || {}).length > 0;
      const hasCategorizedStyles = Object.values(categorized || {}).some(cat => Object.keys(cat).length > 0);
      const hasAnyStyles = hasComputedStyles || hasCategorizedStyles;
      
      return `
        <div class="css-scanner-header ${isPinned ? 'pinned' : ''}">
          <div class="css-scanner-title">
            <span class="css-scanner-icon">🔍</span>
            CSS Scanner
          </div>
          <button class="css-scanner-close">×</button>
        </div>
        
        <div class="css-scanner-content">
          <div class="css-scanner-element-header">
            <div class="css-scanner-element-info">
              <div class="css-scanner-element-tag">${element.tagName}</div>
              ${element.id ? `<div class="css-scanner-element-id">#${element.id}</div>` : ''}
              ${element.className ? `<div class="css-scanner-element-class">.${element.className.split(' ').filter(c => c && !c.includes('css-scanner')).slice(0, 2).join('.')}</div>` : ''}
            </div>
            <div class="css-scanner-pin-indicator" style="display: ${isPinned ? 'block' : 'none'}">📌 Pinned - Click elsewhere to unpin</div>
            <div class="css-scanner-hover-indicator" style="display: ${isPinned ? 'none' : 'block'}">🖱️ Hovering - Click to pin</div>
          </div>
          
          <div class="css-scanner-selector-section">
            <div class="css-scanner-section-title">🎯 CSS Selector</div>
            <div class="css-scanner-selector-value">${element.selector}</div>
            <button class="css-scanner-copy-btn" data-copy="selector">Copy Selector</button>
          </div>
          
          <div class="css-scanner-copy-actions">
            <button class="css-scanner-copy-btn primary" data-copy="all" ${!hasAnyStyles ? 'disabled title="No styles to copy"' : ''}>
              Copy All CSS ${hasAnyStyles ? '' : '(None)'}
            </button>
            ${hasInlineStyles ? '<button class="css-scanner-copy-btn" data-copy="inline">Inline Styles Only</button>' : ''}
          </div>
          
          ${this.generateCategorizedStylesHTML(categorized)}
          
          ${hasInlineStyles ? this.generateInlineStylesHTML(inline) : ''}
        </div>
      `;
    }, 'POPUP_HTML_GENERATION_ERROR', { data });
    
    return result.success ? result.data : '<div>An error occurred while creating the popup.</div>';
  }
  
  generateCategorizedStylesHTML(categorized) {
    const result = this.safeWrapper.execute(() => {
      return Object.entries(categorized)
        .filter(([category, styles]) => Object.keys(styles).length > 0)
        .map(([category, styles]) => `
          <div class="css-scanner-category">
            <div class="css-scanner-category-header" data-category="${category}">
              <span class="css-scanner-category-icon">${this.categoryIcons[category]}</span>
              <span class="css-scanner-category-name">${this.categoryNames[category]}</span>
              <span class="css-scanner-category-count">(${Object.keys(styles).length})</span>
              <span class="css-scanner-category-toggle">▼</span>
            </div>
            <div class="css-scanner-category-content">
              ${Object.entries(styles).map(([prop, value]) => `
                <div class="css-scanner-property">
                  <span class="css-scanner-prop-name">${prop}</span>
                  <span class="css-scanner-prop-value" title="${value}">${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('');
    }, 'CATEGORIZED_STYLES_HTML_ERROR', { categorized });
    
    return result.success ? result.data : '<div>An error occurred while displaying styles.</div>';
  }
  
  generateInlineStylesHTML(inline) {
    const result = this.safeWrapper.execute(() => {
      return `
        <div class="css-scanner-category">
          <div class="css-scanner-category-header" data-category="inline">
            <span class="css-scanner-category-icon">🎭</span>
            <span class="css-scanner-category-name">Inline Styles</span>
            <span class="css-scanner-category-count">(${Object.keys(inline).length})</span>
            <span class="css-scanner-category-toggle">▼</span>
          </div>
          <div class="css-scanner-category-content">
            ${Object.entries(inline).map(([prop, value]) => `
              <div class="css-scanner-property">
                <span class="css-scanner-prop-name">${prop}</span>
                <span class="css-scanner-prop-value" title="${value}">${value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }, 'INLINE_STYLES_HTML_ERROR', { inline });
    
    return result.success ? result.data : '<div>An error occurred while displaying inline styles.</div>';
  }
  
  updatePopupPosition(mousePosition) {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!this.popup || this.isPinned) return;
      
      const popupRect = this.popup.getBoundingClientRect();
      const popupWidth = popupRect.width || 380;
      const popupHeight = popupRect.height || Math.min(500, window.innerHeight * 0.7);
      const offset = 20;
      
      const positions = [
        { x: mousePosition.x + offset, y: mousePosition.y + offset },
        { x: mousePosition.x - popupWidth - offset, y: mousePosition.y + offset },
        { x: mousePosition.x + offset, y: mousePosition.y - popupHeight - offset },
        { x: mousePosition.x - popupWidth - offset, y: mousePosition.y - popupHeight - offset }
      ];
      
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const bestPosition = positions.find(pos => 
        pos.x >= 10 && pos.y >= 10 && 
        pos.x + popupWidth <= viewport.width - 10 && 
        pos.y + popupHeight <= viewport.height - 10
      ) || positions[0];
      
      bestPosition.x = Math.max(10, Math.min(bestPosition.x, viewport.width - popupWidth - 10));
      bestPosition.y = Math.max(10, Math.min(bestPosition.y, viewport.height - popupHeight - 10));
      
      this.popup.style.left = bestPosition.x + 'px';
      this.popup.style.top = bestPosition.y + 'px';
    }, 'POPUP_POSITION_UPDATE_ERROR', { mousePosition });
    
    return result.success;
  }
  
  pinPopup() {
    const result = this.safeWrapper.execute(() => {
      this.isPinned = true;
      if (this.popup) {
        this.pinnedPosition = {
          left: this.popup.style.left,
          top: this.popup.style.top
        };
        this.updatePinnedState();
      }
    }, 'POPUP_PIN_ERROR');
    
    return result.success;
  }
  
  unpinPopup() {
    const result = this.safeWrapper.execute(() => {
      this.isPinned = false;
      this.pinnedPosition = null;
      if (this.popup) {
        this.updatePinnedState();
      }
    }, 'POPUP_UNPIN_ERROR');
    
    return result.success;
  }
  
  updatePinnedState() {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!this.popup) return;
      
      const header = this.popup.querySelector('.css-scanner-header');
      const pinIndicator = this.popup.querySelector('.css-scanner-pin-indicator');
      const hoverIndicator = this.popup.querySelector('.css-scanner-hover-indicator');
      
      if (this.isPinned) {
        if (header) header.classList.add('pinned');
        if (pinIndicator) pinIndicator.style.display = 'block';
        if (hoverIndicator) hoverIndicator.style.display = 'none';
      } else {
        if (header) header.classList.remove('pinned');
        if (pinIndicator) pinIndicator.style.display = 'none';
        if (hoverIndicator) hoverIndicator.style.display = 'block';
      }
    }, 'POPUP_STATE_UPDATE_ERROR');
    
    return result.success;
  }
  
  closePopup() {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
        this.popup = null;
      }
    }, 'POPUP_CLOSE_ERROR');
    
    return result.success;
  }
  
  scheduleRender(callback) {
    const result = this.safeWrapper.execute(() => {
      if (this.renderAnimationFrame) {
        cancelAnimationFrame(this.renderAnimationFrame);
      }
      this.renderAnimationFrame = requestAnimationFrame(() => {
        callback();
        this.renderAnimationFrame = null;
      });
    }, 'RENDER_SCHEDULE_ERROR');
    
    return result.success;
  }
  
  cancelRenderFrame() {
    const result = this.safeWrapper.execute(() => {
      if (this.renderAnimationFrame) {
        cancelAnimationFrame(this.renderAnimationFrame);
        this.renderAnimationFrame = null;
      }
    }, 'RENDER_CANCEL_ERROR');
    
    return result.success;
  }
  
  getPopup() {
    return this.popup;
  }
  
  isPinnedState() {
    return this.isPinned;
  }
}

class EventHandler {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.boundHandlers = {};
    this.mousePosition = { x: 0, y: 0 };
    this.hoverTimeout = null;
    this.hoverDebounceTime = 100;
    
    this.callbacks = {
      onMouseOver: null,
      onMouseOut: null,
      onMouseMove: null,
      onClick: null,
      onKeyDown: null
    };
    
    this.initBoundHandlers();
  }
  
  initBoundHandlers() {
    const result = this.safeWrapper.execute(() => {
      this.boundHandlers = {
        mouseOver: this.handleMouseOver.bind(this),
        mouseOut: this.handleMouseOut.bind(this),
        mouseMove: this.throttle(this.handleMouseMove.bind(this), 16),
        keyDown: this.handleKeyDown.bind(this),
        click: this.handleClick.bind(this)
      };
    }, 'EVENT_HANDLER_INIT_ERROR');
    
    return result.success;
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        try {
          func.apply(context, args);
        } catch (error) {
          console.error('Throttled function error:', error);
        }
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
  
  setCallbacks(callbacks) {
    const result = this.safeWrapper.execute(() => {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }, 'CALLBACK_SET_ERROR', { callbacks });
    
    return result.success;
  }
  
  addEventListeners() {
    const result = this.safeWrapper.execute(() => {
      document.addEventListener('mouseover', this.boundHandlers.mouseOver, { passive: true, capture: true });
      document.addEventListener('mouseout', this.boundHandlers.mouseOut, { passive: true, capture: true });
      document.addEventListener('mousemove', this.boundHandlers.mouseMove, { passive: true, capture: true });
      document.addEventListener('keydown', this.boundHandlers.keyDown, { capture: true });
      document.addEventListener('click', this.boundHandlers.click, { capture: true });
    }, 'EVENT_LISTENER_ADD_ERROR');
    
    return result.success;
  }
  
  removeEventListeners() {
    const result = this.safeWrapper.execute(() => {
      document.removeEventListener('mouseover', this.boundHandlers.mouseOver, { passive: true, capture: true });
      document.removeEventListener('mouseout', this.boundHandlers.mouseOut, { passive: true, capture: true });
      document.removeEventListener('mousemove', this.boundHandlers.mouseMove, { passive: true, capture: true });
      document.removeEventListener('keydown', this.boundHandlers.keyDown, { capture: true });
      document.removeEventListener('click', this.boundHandlers.click, { capture: true });
    }, 'EVENT_LISTENER_REMOVE_ERROR');
    
    return result.success;
  }
  
  handleMouseMove(event) {
    this.safeWrapper.execute(() => {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
      
      if (this.callbacks.onMouseMove) {
        this.callbacks.onMouseMove(event, this.mousePosition);
      }
    }, 'EVENT_HANDLER_ERROR', { eventType: 'mousemove' });
  }
  
  handleMouseOver(event) {
    this.safeWrapper.execute(() => {
      if (this.callbacks.onMouseOver) {
        this.clearHoverTimeout();
        
        this.hoverTimeout = setTimeout(() => {
          try {
            if (this.callbacks.onMouseOver) {
              this.callbacks.onMouseOver(event);
            }
          } catch (error) {
            this.errorHandler.handleError(error, 'MOUSE_OVER_CALLBACK_ERROR', { event });
          }
        }, this.hoverDebounceTime);
      }
    }, 'EVENT_HANDLER_ERROR', { eventType: 'mouseover' });
  }
  
  handleMouseOut(event) {
    this.safeWrapper.execute(() => {
      if (this.callbacks.onMouseOut) {
        this.clearHoverTimeout();
        this.callbacks.onMouseOut(event);
      }
    }, 'EVENT_HANDLER_ERROR', { eventType: 'mouseout' });
  }
  
  handleClick(event) {
    this.safeWrapper.execute(() => {
      if (this.callbacks.onClick) {
        this.callbacks.onClick(event);
      }
    }, 'EVENT_HANDLER_ERROR', { eventType: 'click' });
  }
  
  handleKeyDown(event) {
    this.safeWrapper.execute(() => {
      if (this.callbacks.onKeyDown) {
        this.callbacks.onKeyDown(event);
      }
    }, 'EVENT_HANDLER_ERROR', { eventType: 'keydown' });
  }
  
  clearHoverTimeout() {
    const result = this.safeWrapper.execute(() => {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }, 'TIMEOUT_CLEAR_ERROR');
    
    return result.success;
  }
  
  getMousePosition() {
    return this.mousePosition;
  }
  
  destroy() {
    const result = this.safeWrapper.execute(() => {
      this.removeEventListeners();
      this.clearHoverTimeout();
      this.callbacks = {};
    }, 'EVENT_HANDLER_DESTROY_ERROR');
    
    return result.success;
  }
}

class MessageHandler {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    
    this.callbacks = {
      onToggleScan: null,
      onGetScanStatus: null
    };
    
    this.init();
  }
  
  init() {
    const result = this.safeWrapper.execute(() => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        this.handleMessage(request, sender, sendResponse);
        return true;
      });
    }, 'MESSAGE_HANDLER_INIT_ERROR');
    
    return result.success;
  }
  
  setCallbacks(callbacks) {
    const result = this.safeWrapper.execute(() => {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }, 'MESSAGE_CALLBACK_SET_ERROR', { callbacks });
    
    return result.success;
  }
  
  handleMessage(request, sender, sendResponse) {
    this.safeWrapper.execute(() => {
      console.log('Content script received message:', request);
      
      try {
        switch (request.action) {
          case 'ping':
            sendResponse({ pong: true });
            break;
            
          case 'toggleScan':
            if (this.callbacks.onToggleScan) {
              const result = this.callbacks.onToggleScan();
              sendResponse({ success: true, isScanning: result });
            } else {
              sendResponse({ success: false, error: 'No toggle callback' });
            }
            break;
            
          case 'getScanStatus':
            if (this.callbacks.onGetScanStatus) {
              const status = this.callbacks.onGetScanStatus();
              sendResponse({ isScanning: status });
            } else {
              sendResponse({ success: false, error: 'No status callback' });
            }
            break;
            
          default:
            sendResponse({ success: false, error: 'Unknown action' });
        }
      } catch (callbackError) {
        this.errorHandler.handleError(callbackError, 'MESSAGE_CALLBACK_ERROR', { request });
        sendResponse({ success: false, error: callbackError.message });
      }
    }, 'MESSAGE_HANDLER_ERROR', { request });
  }
}

class NotificationManager {
  static errorHandler = null;
  
  static setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
  }
  
  static showMessage(message, type = 'info') {
    const safeWrapper = this.errorHandler ? new SafeWrapper(this.errorHandler) : null;
    
    const executeWithSafety = (fn) => {
      if (safeWrapper) {
        return safeWrapper.executeDOMOperation(fn, 'NOTIFICATION_DISPLAY_ERROR', { message, type });
      } else {
        try {
          return { success: true, data: fn() };
        } catch (error) {
          console.error('Notification error:', error);
          return { success: false, error: error.message };
        }
      }
    };
    
    executeWithSafety(() => {
      const messageEl = document.createElement('div');
      
      const colors = {
        info: '#007bff',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
      };
      
      Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: colors[type] || colors.info,
        color: type === 'warning' ? '#212529' : 'white',
        padding: '12px 20px',
        borderRadius: '6px',
        zIndex: '999998',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        pointerEvents: 'none'
      });
      
      messageEl.textContent = message;
      
      document.body.appendChild(messageEl);
      
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 3000);
    });
  }
  
  static showCopySuccess(typeName) {
    this.showMessage(`✅ ${typeName} copied to clipboard!`, 'success');
  }
  
  static showCopyError(message = 'An error occurred while copying.') {
    this.showMessage(`❌ ${message}`, 'error');
  }
}

// =============================================
// Main Orchestrator Class (Enhanced Error Handling)
// =============================================

class CSSScanner {
  constructor() {
    this.isScanning = false;
    this.currentElementData = null;
    
    // Initialize error handling system
    this.errorHandler = new ErrorHandler();
    this.safeWrapper = new SafeWrapper(this.errorHandler);
    
    // Register error handler with notification system
    NotificationManager.setErrorHandler(this.errorHandler);
    
    // Dependency injection (including error handler)
    this.styleCache = new StyleCache(this.errorHandler);
    this.performanceMonitor = new PerformanceMonitor(this.errorHandler);
    this.cssAnalyzer = new CSSAnalyzer(this.styleCache, this.errorHandler);
    this.clipboardManager = new ClipboardManager(this.errorHandler);
    this.elementSelector = new ElementSelector(this.errorHandler);
    this.popupManager = new PopupManager(this.performanceMonitor, this.errorHandler);
    this.eventHandler = new EventHandler(this.errorHandler);
    this.messageHandler = new MessageHandler(this.errorHandler);
    
    this.init();
  }
  
  init() {
    const result = this.safeWrapper.execute(() => {
      // Set event handler callbacks
      this.eventHandler.setCallbacks({
        onMouseOver: this.handleMouseOver.bind(this),
        onMouseOut: this.handleMouseOut.bind(this),
        onMouseMove: this.handleMouseMove.bind(this),
        onClick: this.handleClick.bind(this),
        onKeyDown: this.handleKeyDown.bind(this)
      });
      
      // Set message handler callbacks
      this.messageHandler.setCallbacks({
        onToggleScan: this.toggleScan.bind(this),
        onGetScanStatus: () => this.isScanning
      });
      
      // Periodic performance monitoring and cache cleanup
      setInterval(() => {
        this.safeWrapper.execute(() => {
          this.styleCache.periodicCleanup();
          if (Math.random() < 0.1) {
            this.performanceMonitor.logPerformance();
          }
        }, 'PERIODIC_CLEANUP_ERROR');
      }, 30000);
      
      console.log('CSS Scanner content script loaded and optimized (with error handling)');
    }, 'CSS_SCANNER_INIT_ERROR');
    
    if (!result.success) {
      console.error('CSS Scanner initialization failed:', result.error);
      NotificationManager.showMessage('CSS Scanner initialization error occurred.', 'error');
    }
  }
  
  toggleScan() {
    const result = this.safeWrapper.execute(() => {
      if (this.isScanning) {
        this.stopScan();
      } else {
        this.startScan();
      }
      return this.isScanning;
    }, 'SCAN_TOGGLE_ERROR');
    
    return result.success ? result.data : false;
  }
  
  startScan() {
    const result = this.safeWrapper.execute(() => {
      console.log('Starting CSS scan mode');
      this.isScanning = true;
      
      this.elementSelector.reset();
      this.popupManager.unpinPopup();
      this.styleCache.clear();
      
      this.eventHandler.addEventListeners();
      document.body.style.cursor = 'crosshair';
      
      NotificationManager.showMessage('🎯 CSS scan mode activated. Hover over elements!');
    }, 'SCAN_START_ERROR');
    
    return result.success;
  }
  
  stopScan() {
    const result = this.safeWrapper.execute(() => {
      console.log('Stopping CSS scan mode');
      this.isScanning = false;
      
      this.eventHandler.removeEventListeners();
      this.elementSelector.reset();
      this.popupManager.closePopup();
      this.popupManager.cancelRenderFrame();
      
      this.currentElementData = null;
      
      document.body.style.cursor = '';
      
      NotificationManager.showMessage('CSS scan mode deactivated.');
    }, 'SCAN_STOP_ERROR');
    
    return result.success;
  }
  
  handleMouseMove(event, mousePosition) {
    this.safeWrapper.execute(() => {
      if (!this.isScanning) return;
      
      if (this.popupManager.getPopup() && !this.popupManager.isPinnedState() && !this.elementSelector.isPopupElement(event.target)) {
        this.popupManager.updatePopupPosition(mousePosition);
      }
    }, 'MOUSE_MOVE_HANDLER_ERROR', { event, mousePosition });
  }
  
  handleMouseOver(event) {
    this.safeWrapper.execute(() => {
      if (!this.isScanning || this.elementSelector.isPopupElement(event.target)) return;
      
      if (this.popupManager.isPinnedState()) return;
      
      if (this.elementSelector.isSameElement(event.target)) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      this.elementSelector.highlightElement(event.target);
      
      if (this.isScanning && this.elementSelector.getHighlightedElement() === event.target && !this.popupManager.isPinnedState()) {
        this.analyzeElement(event.target, false);
      }
    }, 'MOUSE_OVER_HANDLER_ERROR', { event });
  }
  
  handleMouseOut(event) {
    this.safeWrapper.execute(() => {
      if (!this.isScanning || this.elementSelector.isPopupElement(event.target)) return;
      
      if (this.popupManager.isPinnedState()) return;
      
      const relatedTarget = event.relatedTarget;
      if (relatedTarget && (event.target.contains(relatedTarget) || relatedTarget.contains(event.target))) {
        return;
      }
      
      this.elementSelector.removeHighlight();
      
      setTimeout(() => {
        if (!this.popupManager.isPinnedState() && !this.isMouseOverPopup()) {
          this.popupManager.closePopup();
        }
      }, 100);
    }, 'MOUSE_OUT_HANDLER_ERROR', { event });
  }
  
  handleClick(event) {
    this.safeWrapper.execute(() => {
      if (!this.isScanning) return;
      
      if (this.elementSelector.isPopupElement(event.target)) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      if (this.popupManager.isPinnedState()) {
        this.popupManager.unpinPopup();
        NotificationManager.showMessage('📌 CSS popup unpinned.');
        return;
      }
      
      this.analyzeElement(event.target, true);
      this.popupManager.pinPopup();
      NotificationManager.showMessage('📌 CSS popup pinned. Click elsewhere to unpin.');
    }, 'CLICK_HANDLER_ERROR', { event });
  }
  
  handleKeyDown(event) {
    this.safeWrapper.execute(() => {
      if (!this.isScanning) return;
      
      if (event.key === 'Escape') {
        event.preventDefault();
        if (this.popupManager.isPinnedState()) {
          this.popupManager.unpinPopup();
          NotificationManager.showMessage('📌 CSS popup unpinned.');
        } else {
          this.stopScan();
        }
      }
    }, 'KEY_DOWN_HANDLER_ERROR', { event });
  }
  
  analyzeElement(element, willPin = false) {
    this.safeWrapper.execute(() => {
      if (!element) {
        throw new Error('No element to analyze');
      }
      
      console.log('=== Element analysis starting (with error handling) ===');
      const timer = this.performanceMonitor.startTiming('analysisTime');
      
      const cssInfo = this.cssAnalyzer.extractCSSInfo(element);
      
      this.currentElementData = { 
        ...cssInfo, 
        isPinned: willPin, 
        element: element
      };
      
      const popup = this.popupManager.showPopup(this.currentElementData, this.eventHandler.getMousePosition());
      if (popup) {
        this.setupPopupEvents(popup);
      }
      
      const analysisTime = this.performanceMonitor.endTiming(timer);
      console.log(`Analysis complete: ${analysisTime.toFixed(2)}ms`);
    }, 'CSS_ANALYSIS_FAILED', { element, willPin });
  }
  
  setupPopupEvents(popup) {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!popup) return;
      
      // Close button event
      const closeBtn = popup.querySelector('.css-scanner-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          this.safeWrapper.execute(() => {
            e.stopPropagation();
            this.popupManager.unpinPopup();
            this.popupManager.closePopup();
          }, 'CLOSE_BUTTON_ERROR');
        });
      }
      
      // Copy button events
      popup.addEventListener('click', async (e) => {
        if (e.target.classList.contains('css-scanner-copy-btn') && !e.target.disabled) {
          e.stopPropagation();
          
          const btn = e.target;
          const originalText = btn.textContent;
          btn.disabled = true;
          btn.textContent = 'Copying...';
          btn.style.opacity = '0.6';
          
          const result = await this.safeWrapper.executeAsync(async () => {
            const copyType = btn.dataset.copy;
            const typeName = await this.clipboardManager.copyToClipboard(this.currentElementData, copyType);
            NotificationManager.showCopySuccess(typeName);
          }, 'COPY_BUTTON_ERROR', { copyType: btn.dataset.copy });
          
          if (!result.success) {
            NotificationManager.showCopyError(result.error);
          }
          
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
            btn.style.opacity = '1';
          }, 500);
        }
      });
      
      // Category toggle events
      popup.addEventListener('click', (e) => {
        const header = e.target.closest('.css-scanner-category-header');
        if (header) {
          this.safeWrapper.execute(() => {
            e.stopPropagation();
            const content = header.nextElementSibling;
            const toggle = header.querySelector('.css-scanner-category-toggle');
            
            if (content && toggle) {
              if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '▼';
              } else {
                content.style.display = 'none';
                toggle.textContent = '▶';
              }
            }
          }, 'CATEGORY_TOGGLE_ERROR');
        }
      });
      
      // Add mouse events to popup
      popup.addEventListener('mouseenter', () => {
        this.eventHandler.clearHoverTimeout();
      }, { passive: true });
      
      popup.addEventListener('mouseleave', () => {
        if (!this.popupManager.isPinnedState()) {
          this.popupManager.closePopup();
        }
      }, { passive: true });
      
      // Prevent event propagation when clicking inside popup
      popup.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }, 'POPUP_EVENT_SETUP_ERROR', { popup });
    
    return result.success;
  }
  
  isMouseOverPopup() {
    const result = this.safeWrapper.execute(() => {
      const mousePos = this.eventHandler.getMousePosition();
      const elementsAtPoint = document.elementsFromPoint(mousePos.x, mousePos.y);
      return elementsAtPoint.some(el => this.elementSelector.isPopupElement(el));
    }, 'MOUSE_OVER_POPUP_CHECK_ERROR');
    
    return result.success ? result.data : false;
  }
  
  // Error statistics methods for debugging
  getErrorStats() {
    return this.errorHandler.getErrorStats();
  }
  
  exportErrorHistory() {
    return this.errorHandler.exportErrorHistory();
  }
  
  clearErrorCounts() {
    this.errorHandler.clearErrorCounts();
  }
}

// =============================================
// Initialization (with error handling)
// =============================================

(() => {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try {
          new CSSScanner();
        } catch (error) {
          console.error('CSS Scanner initialization failed:', error);
        }
      }, { once: true });
    } else {
      new CSSScanner();
    }
  } catch (error) {
    console.error('CSS Scanner loading failed:', error);
  }
})();