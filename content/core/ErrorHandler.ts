import type { ErrorContext, ErrorStats } from '../types';

interface ErrorMessages {
  [key: string]: string;
}

interface ErrorRecord {
  timestamp: string;
  type: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  userAgent: string;
  url: string;
}

interface RecoveryResult {
  success: boolean;
  message: string;
  data?: unknown;
}

interface HandleErrorResult {
  success: boolean;
  suppressed?: boolean;
  recovered?: boolean;
  error?: string;
}

/**
 * ErrorHandler class - Centralized error handling and recovery system
 * Handles errors, attempts automatic recovery, and provides user-friendly feedback
 */
class ErrorHandler {
  private errorCounts: Map<string, number>;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private errorHistory: ErrorRecord[];
  private readonly maxHistorySize: number;
  private readonly errorMessages: ErrorMessages;

  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.errorHistory = [];
    this.maxHistorySize = 50;

    this.errorMessages = {
      CSS_ANALYSIS_FAILED: 'An error occurred while analyzing the element.',
      CLIPBOARD_ACCESS_DENIED: 'Clipboard access permission denied.',
      CLIPBOARD_WRITE_FAILED: 'Failed to copy to clipboard.',
      POPUP_RENDER_FAILED: 'An error occurred while displaying the popup.',
      ELEMENT_NOT_FOUND: 'Element not found.',
      PERMISSION_DENIED: 'Required permissions are missing.',
      NETWORK_ERROR: 'Please check your network connection.',
      DOM_ACCESS_ERROR: 'Cannot access DOM.',
      STYLE_CACHE_ERROR: 'Style cache error occurred.',
      EVENT_HANDLER_ERROR: 'Error occurred while processing event.',
      MESSAGE_HANDLER_ERROR: 'Error occurred while processing message.',
      UNKNOWN_ERROR: 'An unknown error occurred.'
    };

    this.initGlobalErrorHandlers();
  }

  private initGlobalErrorHandlers(): void {
    // Global JavaScript error catch
    window.addEventListener('error', (event: ErrorEvent) => {
      this.handleError(new Error(event.message), 'GLOBAL_JS_ERROR', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Global Promise rejection catch
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.handleError(event.reason, 'UNHANDLED_PROMISE_REJECTION');
      event.preventDefault(); // Prevent console error
    });

    // Chrome Extension API error monitoring
    if (chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener(() => {
        if (chrome.runtime.lastError) {
          this.handleError(new Error(chrome.runtime.lastError.message), 'CHROME_API_ERROR');
        }
      });
    }
  }

  async handleError(
    error: Error | unknown,
    errorType: string,
    context: ErrorContext = {}
  ): Promise<HandleErrorResult> {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    console.group(`🚨 [CSS Scanner Error] ${errorType}`);
    console.error('Error:', errorObj);
    console.error('Context:', context);
    console.error('Stack:', errorObj.stack);
    console.groupEnd();

    // Record error history
    this.recordError(errorObj, errorType, context);

    // Increase error count
    const errorKey = `${errorType}_${errorObj.message}`;
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
    this.showUserFriendlyError(errorType, recoveryResult);

    return { success: false, recovered: recoveryResult.success, error: errorObj.message };
  }

  private recordError(error: Error, errorType: string, context: ErrorContext): void {
    const errorRecord: ErrorRecord = {
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

  private async attemptRecovery(errorType: string, context: ErrorContext): Promise<RecoveryResult> {
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

  private async recoverCSSAnalysis(context: ErrorContext): Promise<RecoveryResult> {
    // Recover with default values when CSS analysis fails
    await this.delay(this.retryDelay);

    if (context.element && context.element instanceof HTMLElement) {
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
      } catch (_retryError) {
        return { success: false, message: 'Recovery failed' };
      }
    }

    return { success: false, message: 'No element to recover.' };
  }

  private async recoverClipboardAccess(context: ErrorContext): Promise<RecoveryResult> {
    // Try alternative method when clipboard access fails
    try {
      // Fallback method using textarea
      const textArea = document.createElement('textarea');
      textArea.value = (context.text as string) || 'No content to copy.';
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

  private async recoverPopupRender(_context: ErrorContext): Promise<RecoveryResult> {
    // Recover with simple form when popup rendering fails
    try {
      await this.delay(this.retryDelay);

      // Remove existing popups
      const existingPopups = document.querySelectorAll('.css-scanner-popup');
      existingPopups.forEach((popup) => popup.remove());

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
    } catch (_retryError) {
      return { success: false, message: 'Popup recovery failed' };
    }
  }

  private async recoverStyleCache(context: ErrorContext): Promise<RecoveryResult> {
    // Clear cache when style cache error occurs
    try {
      const styleCache = context.styleCache as { clear?: () => void } | undefined;
      if (styleCache && typeof styleCache.clear === 'function') {
        styleCache.clear();
        await this.delay(100); // Brief wait
        return { success: true, message: 'Style cache has been cleared.' };
      }
    } catch (_retryError) {
      console.error('Cache clear failed:', _retryError);
    }

    return { success: false, message: 'Style cache recovery failed' };
  }

  private async recoverDOMAccess(_context: ErrorContext): Promise<RecoveryResult> {
    // Retry when DOM access error occurs
    try {
      await this.delay(this.retryDelay);

      // Wait until DOM is ready
      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
          }
        });
      }

      return { success: true, message: 'DOM access has been recovered.' };
    } catch (_retryError) {
      return { success: false, message: 'DOM access recovery failed' };
    }
  }

  private showUserFriendlyError(errorType: string, recoveryResult: RecoveryResult): void {
    const userMessage = this.getUserFriendlyMessage(errorType, recoveryResult);
    const messageType = recoveryResult.success ? 'warning' : 'error';

    // Show through NotificationManager
    const NotificationManager = window.NotificationManager as
      | { showMessage: (message: string, type: string) => void }
      | undefined;
    if (NotificationManager) {
      NotificationManager.showMessage(userMessage, messageType);
    } else {
      // Fallback: output to console
      console.log(`[User Message] ${userMessage}`);
    }
  }

  private getUserFriendlyMessage(errorType: string, recoveryResult: RecoveryResult): string {
    const baseMessage = this.errorMessages[errorType] || this.errorMessages['UNKNOWN_ERROR'];

    if (recoveryResult.success) {
      return `⚠️ ${baseMessage} ${recoveryResult.message}`;
    } else {
      return `❌ ${baseMessage} Please refresh the page and try again.`;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Error statistics and debugging information
  getErrorStats(): ErrorStats {
    return {
      totalErrors: this.errorHistory.length,
      errorCounts: Object.fromEntries(this.errorCounts),
      lastErrors: this.errorHistory.slice(-10).map((err) => ({
        code: err.type,
        message: err.message,
        timestamp: new Date(err.timestamp).getTime(),
        context: err.context
      }))
    };
  }

  // Export error history (for debugging)
  exportErrorHistory(): string {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      errors: this.errorHistory,
      stats: this.getErrorStats()
    };

    return JSON.stringify(data, null, 2);
  }

  // Clear error counts
  clearErrorCounts(): void {
    this.errorCounts.clear();
    console.log('Error counts have been cleared.');
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}

export default ErrorHandler;
