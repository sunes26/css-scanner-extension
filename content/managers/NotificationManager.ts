import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

type MessageType = 'info' | 'success' | 'error' | 'warning';

/**
 * NotificationManager class - Displays user notifications
 * Static class for showing success, error, and info messages
 */
class NotificationManager {
  private static errorHandler: ErrorHandler | null = null;

  static setErrorHandler(errorHandler: ErrorHandler): void {
    this.errorHandler = errorHandler;
  }

  static showMessage(message: string, type: MessageType = 'info'): void {
    const safeWrapper = this.errorHandler ? new SafeWrapper(this.errorHandler) : null;

    const executeWithSafety = (fn: () => void) => {
      if (safeWrapper) {
        return safeWrapper.executeDOMOperation(fn, 'NOTIFICATION_DISPLAY_ERROR', { message, type });
      } else {
        try {
          fn();
          return { success: true };
        } catch (error) {
          console.error('Notification error:', error);
          return { success: false, error };
        }
      }
    };

    executeWithSafety(() => {
      const messageEl = document.createElement('div');

      const colors: Record<MessageType, string> = {
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

  static showCopySuccess(typeName: string): void {
    this.showMessage(`✅ ${typeName} copied to clipboard!`, 'success');
  }

  static showCopyError(message: string = 'An error occurred while copying.'): void {
    this.showMessage(`❌ ${message}`, 'error');
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
}

export default NotificationManager;
