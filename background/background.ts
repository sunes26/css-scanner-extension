interface CacheData {
  result: EnsureContentScriptResult;
  timestamp: number;
}

interface MessageRequest {
  action: string;
  tabId?: number;
  [key: string]: unknown;
}

interface EnsureContentScriptResult {
  success: boolean;
  error?: string;
}

/**
 * BackgroundService class - Service Worker for Manifest V3
 * Handles content script injection and message routing with performance optimization
 */
class BackgroundService {
  private tabCache: Map<number, CacheData>;
  private lastCleanup: number;
  private readonly cleanupInterval: number;

  constructor() {
    this.tabCache = new Map();
    this.lastCleanup = Date.now();
    this.cleanupInterval = 300000; // 5 minutes
    this.init();
  }

  private init(): void {
    // Extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('CSS Scanner Extension installed');
      this.setupPerformanceMonitoring();
    });

    // Message listener
    chrome.runtime.onMessage.addListener(
      (
        request: MessageRequest,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: EnsureContentScriptResult) => void
      ) => {
        this.handleMessage(request, sender, sendResponse);
        return true; // Keep async response channel open
      }
    );

    // Tab removal detection (for cache cleanup)
    chrome.tabs.onRemoved.addListener((tabId: number) => {
      this.tabCache.delete(tabId);
    });

    // Periodic cache cleanup
    setInterval(() => {
      this.performPeriodicCleanup();
    }, this.cleanupInterval);
  }

  private setupPerformanceMonitoring(): void {
    // Performance monitoring setup
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('css-scanner-extension-start');
    }
  }

  private performPeriodicCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      // Remove old cache entries
      for (const [tabId, data] of this.tabCache.entries()) {
        if (now - data.timestamp > this.cleanupInterval) {
          this.tabCache.delete(tabId);
        }
      }
      this.lastCleanup = now;
      console.log('Background service cache cleaned up');
    }
  }

  // Build environment detection (bundled file vs individual modules)
  private async checkIfBundled(): Promise<boolean> {
    try {
      // Check if content/core/ErrorHandler.js exists
      // In bundled environment, this file doesn't exist and only content.js exists
      const response = await fetch(chrome.runtime.getURL('content/core/ErrorHandler.js'));
      return !response.ok; // If file doesn't exist (404), it's bundled environment
    } catch (_error) {
      // If fetch fails, assume bundled environment
      return true;
    }
  }

  private async handleMessage(
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: EnsureContentScriptResult) => void
  ): Promise<void> {
    try {
      console.log('Background received message:', request);

      if (request.action === 'ensureContentScript') {
        const result = await this.ensureContentScript(request.tabId!);
        sendResponse(result);
      } else {
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background message handling error:', error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  }

  // Content script injection function (performance optimized)
  private async ensureContentScript(tabId: number): Promise<EnsureContentScriptResult> {
    try {
      // Check cache
      const cached = this.tabCache.get(tabId);
      if (cached && Date.now() - cached.timestamp < 30000) {
        // 30 second cache
        console.log('Using cached content script status');
        return cached.result;
      }

      // First check content script with ping
      try {
        const response = await this.sendMessageWithTimeout(tabId, { action: 'ping' }, 1000);
        if (response && response.pong) {
          console.log('Content script already loaded');
          const result = { success: true };
          this.tabCache.set(tabId, { result, timestamp: Date.now() });
          return result;
        }
      } catch (_pingError) {
        console.log('Content script not found, will inject');
      }

      // Content script injection
      try {
        console.log('Injecting content script...');

        // Build environment detection: use bundled file if available, otherwise inject individual modules
        const isBundled = await this.checkIfBundled();

        if (isBundled) {
          // Production: inject bundled single file
          console.log('Injecting bundled content script');
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content/content.js']
          });
        } else {
          // Development: inject individual modules in order
          console.log('Injecting content script modules...');
          const scriptFiles = [
            'content/core/ErrorHandler.js',
            'content/core/SafeWrapper.js',
            'content/utils/PerformanceMonitor.js',
            'content/analyzers/StyleCache.js',
            'content/analyzers/CSSAnalyzer.js',
            'content/ui/ElementSelector.js',
            'content/managers/NotificationManager.js',
            'content/managers/ClipboardManager.js',
            'content/managers/PopupManager.js',
            'content/handlers/EventHandler.js',
            'content/handlers/MessageHandler.js',
            'content/core/CSSScanner.js',
            'content/content.js'
          ];

          // Inject scripts (order guaranteed)
          for (const file of scriptFiles) {
            await chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: [file]
            });
          }
        }

        // CSS injection
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['content/content.css']
        });

        console.log('Content script injected successfully');

        // Wait briefly after injection
        await this.delay(500);

        // Verify injection (with timeout)
        try {
          const testResponse = await this.sendMessageWithTimeout(tabId, { action: 'ping' }, 2000);
          if (testResponse && testResponse.pong) {
            const result = { success: true };
            this.tabCache.set(tabId, { result, timestamp: Date.now() });
            return result;
          } else {
            const result = {
              success: false,
              error: 'Content script injection verification failed'
            };
            this.tabCache.set(tabId, { result, timestamp: Date.now() });
            return result;
          }
        } catch (_verifyError) {
          const result = { success: false, error: 'Content script not responding after injection' };
          this.tabCache.set(tabId, { result, timestamp: Date.now() });
          return result;
        }
      } catch (injectError) {
        console.error('Injection failed:', injectError);
        const result = {
          success: false,
          error: `Injection failed: ${(injectError as Error).message}`
        };
        this.tabCache.set(tabId, { result, timestamp: Date.now() });
        return result;
      }
    } catch (error) {
      console.error('ensureContentScript error:', error);
      const result = { success: false, error: (error as Error).message };
      this.tabCache.set(tabId, { result, timestamp: Date.now() });
      return result;
    }
  }

  // Message sending with timeout (performance optimized)
  private sendMessageWithTimeout(
    tabId: number,
    message: MessageRequest,
    timeout: number = 5000
  ): Promise<{ pong?: boolean }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);

      chrome.tabs.sendMessage(tabId, message, (response: { pong?: boolean }) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Background service initialization
new BackgroundService();
