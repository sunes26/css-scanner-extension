import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

interface MessageCallbacks {
  onToggleScan: (() => boolean) | null;
  onGetScanStatus: (() => boolean) | null;
}

/**
 * MessageHandler class - Handles Chrome extension messages
 * Manages communication between background script and content script
 */
class MessageHandler {
  private errorHandler: ErrorHandler;
  private safeWrapper: SafeWrapper;
  private callbacks: MessageCallbacks;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);

    this.callbacks = {
      onToggleScan: null,
      onGetScanStatus: null
    };

    this.init();
  }

  private init(): boolean {
    const result = this.safeWrapper.execute(() => {
      chrome.runtime.onMessage.addListener(
        (
          request: chrome.runtime.MessageSender['url'] extends string
            ? { action: string; [key: string]: unknown }
            : unknown,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: {
            success?: boolean;
            pong?: boolean;
            isScanning?: boolean;
            error?: string;
          }) => void
        ) => {
          this.handleMessage(request, sender, sendResponse);
          return true;
        }
      );
    }, 'MESSAGE_HANDLER_INIT_ERROR');

    return result.success;
  }

  setCallbacks(callbacks: Partial<MessageCallbacks>): boolean {
    const result = this.safeWrapper.execute(
      () => {
        this.callbacks = { ...this.callbacks, ...callbacks };
      },
      'MESSAGE_CALLBACK_SET_ERROR',
      { callbacks }
    );

    return result.success;
  }

  private handleMessage(
    request: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: {
      success?: boolean;
      pong?: boolean;
      isScanning?: boolean;
      error?: string;
    }) => void
  ): void {
    this.safeWrapper.execute(
      () => {
        console.log('Content script received message:', request);

        try {
          const msg = request as { action?: string };
          switch (msg.action) {
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
          sendResponse({ success: false, error: (callbackError as Error).message });
        }
      },
      'MESSAGE_HANDLER_ERROR',
      { request }
    );
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.MessageHandler = MessageHandler;
}

export default MessageHandler;
