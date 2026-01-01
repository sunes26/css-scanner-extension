import type { ElementData, CategorizedStyles } from '../types';
import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

type CopyType = 'selector' | 'all' | 'computed' | 'inline';

interface CopyTypeNames {
  selector: string;
  all: string;
  computed: string;
  inline: string;
}

/**
 * ClipboardManager class - Handles clipboard operations
 * Manages copying CSS data to clipboard with fallback methods
 */
class ClipboardManager {
  private safeWrapper: SafeWrapper;
  private copyTypeNames: CopyTypeNames;

  constructor(errorHandler: ErrorHandler) {
    this.safeWrapper = new SafeWrapper(errorHandler);

    this.copyTypeNames = {
      selector: 'Selector',
      all: 'All CSS',
      computed: 'Computed styles',
      inline: 'Inline styles'
    };
  }

  async copyToClipboard(elementData: ElementData, type: CopyType): Promise<string> {
    const result = await this.safeWrapper.executeAsync<string>(
      async () => {
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
      },
      'CLIPBOARD_WRITE_FAILED',
      { elementData, type }
    );

    if (!result.success || !result.data) {
      throw result.error || new Error('Copy operation failed');
    }

    return result.data;
  }

  private generateAllCSSText(elementData: ElementData, selector: string): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        const computedStyles = elementData.computed || {};

        if (Object.keys(computedStyles).length === 0) {
          const categorizedStyles = elementData.categorized || ({} as CategorizedStyles);
          const allStyles: Record<string, string> = {};

          Object.values(categorizedStyles).forEach((categoryStyles) => {
            if (categoryStyles && typeof categoryStyles === 'object') {
              Object.assign(allStyles, categoryStyles);
            }
          });

          return this.generateCSSText(allStyles, selector);
        } else {
          return this.generateCSSText(computedStyles, selector);
        }
      },
      'CSS_TEXT_GENERATION_ERROR',
      { elementData, selector }
    );

    return result.success && result.data ? result.data : '';
  }

  private generateInlineCSSText(elementData: ElementData, selector: string): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        const inlineStyles = elementData.inline || {};

        if (Object.keys(inlineStyles).length === 0) {
          throw new Error('No inline styles found.');
        }

        return this.generateCSSText(inlineStyles, selector);
      },
      'INLINE_CSS_GENERATION_ERROR',
      { elementData, selector }
    );

    if (!result.success || !result.data) {
      throw result.error || new Error('Failed to generate inline CSS');
    }

    return result.data;
  }

  private generateCSSText(styles: Record<string, string>, selector: string | null = null): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        if (!styles || typeof styles !== 'object' || Object.keys(styles).length === 0) {
          return '';
        }

        const cssLines = Object.entries(styles)
          .filter(([, value]) => {
            return (
              value &&
              value !== 'none' &&
              value !== 'auto' &&
              value !== 'normal' &&
              value !== 'initial' &&
              value !== '0px' &&
              value !== 'rgba(0, 0, 0, 0)'
            );
          })
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([prop, value]) => `  ${prop}: ${value};`);

        if (cssLines.length === 0) {
          return '';
        }

        return selector
          ? `${selector} {\n${cssLines.join('\n')}\n}`
          : `{\n${cssLines.join('\n')}\n}`;
      },
      'CSS_TEXT_FORMAT_ERROR',
      { styles, selector }
    );

    return result.success && result.data ? result.data : '';
  }

  private isValidCopyText(textToCopy: string, selector: string): boolean {
    const result = this.safeWrapper.execute<boolean>(
      () => {
        if (!textToCopy || textToCopy.trim() === '' || textToCopy === '{}') {
          return false;
        }
        if (textToCopy === `${selector} {\n\n}`) {
          return false;
        }
        return true;
      },
      'COPY_TEXT_VALIDATION_ERROR',
      { textToCopy, selector }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }

  private async performCopy(text: string): Promise<boolean> {
    const result = await this.safeWrapper.executeAsync<boolean>(
      async () => {
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
      },
      'CLIPBOARD_ACCESS_DENIED',
      { text }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.ClipboardManager = ClipboardManager;
}

export default ClipboardManager;
