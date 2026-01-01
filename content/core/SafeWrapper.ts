import type { SafeWrapperResult, ErrorContext } from '../types';
import type ErrorHandler from './ErrorHandler';

/**
 * SafeWrapper class - Provides safe execution of synchronous and asynchronous functions
 * Wraps function execution with error handling to prevent crashes
 */
class SafeWrapper {
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Execute synchronous function safely
   */
  execute<T = unknown>(
    fn: () => T,
    errorType: string,
    context: ErrorContext = {}
  ): SafeWrapperResult<T> {
    try {
      return { success: true, data: fn() };
    } catch (error) {
      this.errorHandler.handleError(error, errorType, context);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Execute asynchronous function safely
   */
  async executeAsync<T = unknown>(
    fn: () => Promise<T>,
    errorType: string,
    context: ErrorContext = {}
  ): Promise<SafeWrapperResult<T>> {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      await this.errorHandler.handleError(error, errorType, context);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Execute DOM manipulation safely
   */
  executeDOMOperation<T = unknown>(
    fn: () => T,
    errorType: string = 'DOM_ACCESS_ERROR',
    context: ErrorContext = {}
  ): SafeWrapperResult<T> {
    if (!document || !document.body) {
      this.errorHandler.handleError(new Error('Document not ready'), 'DOM_NOT_READY', context);
      return { success: false, error: new Error('DOM not ready') };
    }

    return this.execute(fn, errorType, context);
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.SafeWrapper = SafeWrapper;
}

export default SafeWrapper;
