import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

/**
 * ElementSelector class - Manages element highlighting and selection
 * Handles visual feedback for element inspection
 */
class ElementSelector {
  private highlightedElement: Element | null;
  private lastHoverElement: Element | null;
  private safeWrapper: SafeWrapper;

  constructor(errorHandler: ErrorHandler) {
    this.highlightedElement = null;
    this.lastHoverElement = null;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }

  highlightElement(element: Element): boolean {
    const result = this.safeWrapper.executeDOMOperation<boolean>(
      () => {
        if (!element || !element.classList) {
          return false;
        }

        this.removeHighlight();
        element.classList.add('css-scanner-highlight');
        this.highlightedElement = element;
        this.lastHoverElement = element;
        return true;
      },
      'ELEMENT_HIGHLIGHT_ERROR',
      { element }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }

  removeHighlight(): boolean {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (this.highlightedElement && this.highlightedElement.classList) {
        this.highlightedElement.classList.remove('css-scanner-highlight');
        this.highlightedElement = null;
      }
    }, 'HIGHLIGHT_REMOVAL_ERROR');

    return result.success;
  }

  isPopupElement(element: Element | EventTarget | null): boolean {
    const result = this.safeWrapper.execute<boolean>(
      () => {
        if (!element) return false;
        const elem = element as Element;
        if (!elem.closest) return false;
        return elem.closest('.css-scanner-popup') !== null;
      },
      'POPUP_ELEMENT_CHECK_ERROR',
      { element }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }

  isSameElement(element: Element): boolean {
    const result = this.safeWrapper.execute<boolean>(
      () => {
        return this.lastHoverElement === element;
      },
      'ELEMENT_COMPARISON_ERROR',
      { element }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }

  reset(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.removeHighlight();
      this.lastHoverElement = null;
    }, 'ELEMENT_SELECTOR_RESET_ERROR');

    return result.success;
  }

  getHighlightedElement(): Element | null {
    return this.highlightedElement;
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.ElementSelector = ElementSelector;
}

export default ElementSelector;
