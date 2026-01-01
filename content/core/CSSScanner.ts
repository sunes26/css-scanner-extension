import type { ElementData, MousePosition, ErrorStats } from '../types';
import SafeWrapper from './SafeWrapper';
import ErrorHandler from './ErrorHandler';
import PerformanceMonitor from '../utils/PerformanceMonitor';
import StyleCache from '../analyzers/StyleCache';
import CSSAnalyzer from '../analyzers/CSSAnalyzer';
import ClipboardManager from '../managers/ClipboardManager';
import ElementSelector from '../ui/ElementSelector';
import PopupManager from '../managers/PopupManager';
import EventHandler from '../handlers/EventHandler';
import MessageHandler from '../handlers/MessageHandler';
import NotificationManager from '../managers/NotificationManager';

/**
 * CSSScanner class - Main orchestrator for the CSS Scanner extension
 * Coordinates all components and manages the scanning lifecycle
 */
class CSSScanner {
  private isScanning: boolean;
  private currentElementData: ElementData | null;
  private errorHandler: ErrorHandler;
  private safeWrapper: SafeWrapper;
  private styleCache: StyleCache;
  private performanceMonitor: PerformanceMonitor;
  private cssAnalyzer: CSSAnalyzer;
  private clipboardManager: ClipboardManager;
  private elementSelector: ElementSelector;
  private popupManager: PopupManager;
  private eventHandler: EventHandler;
  private messageHandler: MessageHandler;

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

  private init(): void {
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

  private toggleScan(): boolean {
    const result = this.safeWrapper.execute<boolean>(() => {
      if (this.isScanning) {
        this.stopScan();
      } else {
        this.startScan();
      }
      return this.isScanning;
    }, 'SCAN_TOGGLE_ERROR');

    return result.success && result.data !== undefined ? result.data : false;
  }

  private startScan(): boolean {
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

  private stopScan(): boolean {
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

  private handleMouseMove(event: MouseEvent, mousePosition: MousePosition): void {
    this.safeWrapper.execute(
      () => {
        if (!this.isScanning) {
          return;
        }

        if (
          this.popupManager.getPopup() &&
          !this.popupManager.isPinnedState() &&
          !this.elementSelector.isPopupElement(event.target)
        ) {
          this.popupManager.updatePopupPosition(mousePosition);
        }
      },
      'MOUSE_MOVE_HANDLER_ERROR',
      { event, mousePosition }
    );
  }

  private handleMouseOver(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (!this.isScanning || this.elementSelector.isPopupElement(event.target)) {
          return;
        }

        if (this.popupManager.isPinnedState()) {
          return;
        }

        if (this.elementSelector.isSameElement(event.target as Element)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.elementSelector.highlightElement(event.target as Element);

        if (
          this.isScanning &&
          this.elementSelector.getHighlightedElement() === event.target &&
          !this.popupManager.isPinnedState()
        ) {
          this.analyzeElement(event.target as Element, false);
        }
      },
      'MOUSE_OVER_HANDLER_ERROR',
      { event }
    );
  }

  private handleMouseOut(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (!this.isScanning || this.elementSelector.isPopupElement(event.target)) {
          return;
        }

        if (this.popupManager.isPinnedState()) {
          return;
        }

        const relatedTarget = event.relatedTarget as Element | null;
        if (
          relatedTarget &&
          ((event.target as Element).contains(relatedTarget) ||
            relatedTarget.contains(event.target as Element))
        ) {
          return;
        }

        this.elementSelector.removeHighlight();

        setTimeout(() => {
          if (!this.popupManager.isPinnedState() && !this.isMouseOverPopup()) {
            this.popupManager.closePopup();
          }
        }, 100);
      },
      'MOUSE_OUT_HANDLER_ERROR',
      { event }
    );
  }

  private handleClick(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (!this.isScanning) {
          return;
        }

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

        this.analyzeElement(event.target as Element, true);
        this.popupManager.pinPopup();
        NotificationManager.showMessage('📌 CSS popup pinned. Click elsewhere to unpin.');
      },
      'CLICK_HANDLER_ERROR',
      { event }
    );
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.safeWrapper.execute(
      () => {
        if (!this.isScanning) {
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          if (this.popupManager.isPinnedState()) {
            this.popupManager.unpinPopup();
            NotificationManager.showMessage('📌 CSS popup unpinned.');
          } else {
            this.stopScan();
          }
        }
      },
      'KEY_DOWN_HANDLER_ERROR',
      { event }
    );
  }

  private analyzeElement(element: Element, willPin: boolean = false): void {
    this.safeWrapper.execute(
      () => {
        if (!element) {
          throw new Error('No element to analyze');
        }

        console.log('=== Element analysis starting (with error handling) ===');
        const timer = this.performanceMonitor.startTiming('analysisTime');

        const cssInfo = this.cssAnalyzer.extractCSSInfo(element);

        this.currentElementData = {
          ...cssInfo,
          isPinned: willPin
        } as ElementData;

        const popup = this.popupManager.showPopup(
          this.currentElementData,
          this.eventHandler.getMousePosition()
        );
        if (popup) {
          this.setupPopupEvents(popup);
        }

        const analysisTime = this.performanceMonitor.endTiming(timer);
        console.log(`Analysis complete: ${analysisTime.toFixed(2)}ms`);
      },
      'CSS_ANALYSIS_FAILED',
      { element, willPin }
    );
  }

  private setupPopupEvents(popup: HTMLElement): boolean {
    const result = this.safeWrapper.executeDOMOperation(
      () => {
        if (!popup) {
          return;
        }

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
          if (
            (e.target as HTMLElement).classList.contains('css-scanner-copy-btn') &&
            !(e.target as HTMLButtonElement).disabled
          ) {
            e.stopPropagation();

            const btn = e.target as HTMLButtonElement;
            const originalText = btn.textContent || '';
            btn.disabled = true;
            btn.textContent = 'Copying...';
            btn.style.opacity = '0.6';

            const result = await this.safeWrapper.executeAsync(
              async () => {
                const copyType = btn.dataset.copy as 'selector' | 'all' | 'computed' | 'inline';
                const typeName = await this.clipboardManager.copyToClipboard(
                  this.currentElementData!,
                  copyType
                );
                NotificationManager.showCopySuccess(typeName);
              },
              'COPY_BUTTON_ERROR',
              { copyType: btn.dataset.copy }
            );

            if (!result.success) {
              NotificationManager.showCopyError(result.error?.message);
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
          const header = (e.target as HTMLElement).closest('.css-scanner-category-header');
          if (header) {
            this.safeWrapper.execute(() => {
              e.stopPropagation();
              const content = header.nextElementSibling as HTMLElement;
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
        popup.addEventListener(
          'mouseenter',
          () => {
            this.eventHandler.clearHoverTimeout();
          },
          { passive: true }
        );

        popup.addEventListener(
          'mouseleave',
          () => {
            if (!this.popupManager.isPinnedState()) {
              this.popupManager.closePopup();
            }
          },
          { passive: true }
        );

        // Prevent event propagation when clicking inside popup
        popup.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      },
      'POPUP_EVENT_SETUP_ERROR',
      { popup }
    );

    return result.success;
  }

  private isMouseOverPopup(): boolean {
    const result = this.safeWrapper.execute<boolean>(() => {
      const mousePos = this.eventHandler.getMousePosition();
      const elementsAtPoint = document.elementsFromPoint(mousePos.x, mousePos.y);
      return elementsAtPoint.some((el) => this.elementSelector.isPopupElement(el));
    }, 'MOUSE_OVER_POPUP_CHECK_ERROR');

    return result.success && result.data !== undefined ? result.data : false;
  }

  // Error statistics methods for debugging
  getErrorStats(): ErrorStats {
    return this.errorHandler.getErrorStats();
  }

  exportErrorHistory(): string {
    return this.errorHandler.exportErrorHistory();
  }

  clearErrorCounts(): void {
    this.errorHandler.clearErrorCounts();
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.CSSScanner = CSSScanner;
}

export default CSSScanner;
