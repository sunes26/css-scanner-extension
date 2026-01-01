import type { CategorizedStyles } from '../types';
import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';
import type StyleCache from './StyleCache';

interface CSSCategories {
  layout: string[];
  boxModel: string[];
  border: string[];
  background: string[];
  typography: string[];
  flexGrid: string[];
  effects: string[];
}

interface ElementInfo {
  tagName: string;
  className: string;
  id: string;
  selector: string;
}

interface CSSInfo {
  element: ElementInfo;
  computed: Record<string, string>;
  inline: Record<string, string>;
  categorized: CategorizedStyles;
}

/**
 * CSSAnalyzer class - Analyzes and categorizes CSS properties
 * Extracts and organizes computed and inline styles for elements
 */
class CSSAnalyzer {
  private styleCache: StyleCache;
  private safeWrapper: SafeWrapper;
  private cssCategories: CSSCategories;

  constructor(styleCache: StyleCache, errorHandler: ErrorHandler) {
    this.styleCache = styleCache;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.cssCategories = this.initializeCSSCategories();
  }

  private initializeCSSCategories(): CSSCategories {
    return {
      layout: [
        'display',
        'position',
        'top',
        'right',
        'bottom',
        'left',
        'float',
        'clear',
        'z-index'
      ],
      boxModel: [
        'width',
        'height',
        'min-width',
        'min-height',
        'max-width',
        'max-height',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left'
      ],
      border: [
        'border',
        'border-width',
        'border-style',
        'border-color',
        'border-radius',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left'
      ],
      background: [
        'background',
        'background-color',
        'background-image',
        'background-size',
        'background-position',
        'background-repeat'
      ],
      typography: [
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'color',
        'text-align',
        'text-decoration',
        'letter-spacing'
      ],
      flexGrid: [
        'flex',
        'flex-direction',
        'justify-content',
        'align-items',
        'grid',
        'grid-template-columns',
        'grid-template-rows',
        'gap'
      ],
      effects: ['opacity', 'transform', 'transition', 'animation', 'box-shadow', 'filter']
    };
  }

  extractCSSInfo(element: Element): CSSInfo {
    const result = this.safeWrapper.execute<CSSInfo>(
      () => {
        if (!element) {
          throw new Error('Element is null or undefined');
        }

        const computedStyle = this.styleCache.getComputedStyle(element);
        const selector = this.styleCache.getSelector(element);
        const inlineStyle = this.extractInlineStyles(element);

        const cssInfo: CSSInfo = {
          element: {
            tagName: element.tagName.toLowerCase(),
            className: (element as HTMLElement).className || '',
            id: (element as HTMLElement).id || '',
            selector: selector
          },
          computed: computedStyle,
          inline: inlineStyle,
          categorized: this.categorizeStyles(computedStyle)
        };

        return cssInfo;
      },
      'CSS_ANALYSIS_FAILED',
      { element }
    );

    if (!result.success) {
      // Provide basic info at least
      return {
        element: {
          tagName: element?.tagName?.toLowerCase() || 'unknown',
          className: (element as HTMLElement)?.className || '',
          id: (element as HTMLElement)?.id || '',
          selector: 'unknown'
        },
        computed: {},
        inline: {},
        categorized: {} as CategorizedStyles
      };
    }

    return result.data!;
  }

  private extractInlineStyles(element: Element): Record<string, string> {
    const result = this.safeWrapper.execute<Record<string, string>>(
      () => {
        const inline: Record<string, string> = {};
        const style = (element as HTMLElement).style;

        if (!style || style.length === 0) {
          return inline;
        }

        if (style.cssText) {
          const declarations = style.cssText.split(';').filter((decl) => decl.trim());
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
            if (prop) {
              const value = style.getPropertyValue(prop);
              if (value) {
                inline[prop] = value;
              }
            }
          }
        }

        return inline;
      },
      'INLINE_STYLE_EXTRACTION_ERROR',
      { element }
    );

    return result.success && result.data ? result.data : {};
  }

  private categorizeStyles(computedStyle: Record<string, string>): CategorizedStyles {
    const result = this.safeWrapper.execute<CategorizedStyles>(
      () => {
        const categorized: Partial<CategorizedStyles> = {};

        for (const [category, properties] of Object.entries(this.cssCategories)) {
          const categoryData: Record<string, string> = {};

          for (const prop of properties) {
            const value: string | undefined = computedStyle[prop];
            if (value && this.isValidCSSValue(value)) {
              categoryData[prop] = value;
            }
          }

          if (Object.keys(categoryData).length > 0) {
            categorized[category as keyof CategorizedStyles] = categoryData;
          }
        }

        return categorized as CategorizedStyles;
      },
      'STYLE_CATEGORIZATION_ERROR',
      { computedStyleCount: Object.keys(computedStyle).length }
    );

    return result.success && result.data ? result.data : ({} as CategorizedStyles);
  }

  private isValidCSSValue(value: string | undefined): boolean {
    const result = this.safeWrapper.execute<boolean>(
      () => {
        if (!value || typeof value !== 'string') {
          return false;
        }

        const invalidValues = [
          'auto',
          'normal',
          'none',
          'initial',
          'inherit',
          'unset',
          '0px',
          '0',
          'rgba(0, 0, 0, 0)',
          'transparent'
        ];

        return !invalidValues.includes(value.trim());
      },
      'CSS_VALUE_VALIDATION_ERROR',
      { value: value || '' }
    );

    return result.success && result.data !== undefined ? result.data : false;
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.CSSAnalyzer = CSSAnalyzer;
}

export default CSSAnalyzer;
