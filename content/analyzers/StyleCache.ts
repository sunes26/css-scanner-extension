import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

interface CachedStyle {
  style: Record<string, string>;
  timestamp: number;
}

/**
 * StyleCache class - Caches computed styles and CSS selectors
 * Improves performance by caching frequently accessed style information
 */
class StyleCache {
  private cache: WeakMap<Element, CachedStyle>;
  private selectorCache: WeakMap<Element, string>;
  private lastClearTime: number;
  private readonly maxCacheAge: number;
  private safeWrapper: SafeWrapper;

  constructor(errorHandler: ErrorHandler) {
    this.cache = new WeakMap();
    this.selectorCache = new WeakMap();
    this.lastClearTime = Date.now();
    this.maxCacheAge = 30000;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }

  getComputedStyle(element: Element): Record<string, string> {
    const result = this.safeWrapper.execute<Record<string, string>>(
      () => {
        if (!this.cache.has(element)) {
          const computedStyle = window.getComputedStyle(element);
          const cachedStyle = this.cacheImportantProperties(computedStyle);
          this.cache.set(element, {
            style: cachedStyle,
            timestamp: Date.now()
          });
        }

        const cached = this.cache.get(element);
        if (cached && Date.now() - cached.timestamp > this.maxCacheAge) {
          this.cache.delete(element);
          return this.getComputedStyle(element);
        }

        return cached?.style || {};
      },
      'STYLE_CACHE_ERROR',
      { element }
    );

    return result.success && result.data ? result.data : {};
  }

  private cacheImportantProperties(computedStyle: CSSStyleDeclaration): Record<string, string> {
    const importantProps = [
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'float',
      'clear',
      'z-index',
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
      'padding-left',
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-radius',
      'background',
      'background-color',
      'background-image',
      'background-size',
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'color',
      'text-align',
      'flex',
      'flex-direction',
      'justify-content',
      'align-items',
      'grid',
      'opacity',
      'transform',
      'transition',
      'box-shadow'
    ];

    const cached: Record<string, string> = {};
    importantProps.forEach((prop) => {
      const result = this.safeWrapper.execute<string>(
        () => {
          return computedStyle.getPropertyValue(prop);
        },
        'STYLE_PROPERTY_ACCESS_ERROR',
        { property: prop }
      );

      if (result.success && result.data) {
        cached[prop] = result.data;
      }
    });

    return cached;
  }

  getSelector(element: Element): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        if (!this.selectorCache.has(element)) {
          const selector = this.generateOptimizedSelector(element);
          this.selectorCache.set(element, selector);
        }
        return this.selectorCache.get(element) || 'unknown';
      },
      'SELECTOR_GENERATION_ERROR',
      { element }
    );

    return result.success && result.data ? result.data : 'unknown';
  }

  private generateOptimizedSelector(element: Element): string {
    if (!element || element === document.body) {
      return 'body';
    }

    const result = this.safeWrapper.execute<string>(
      () => {
        const htmlElement = element as HTMLElement;

        if (htmlElement.id) {
          return `#${htmlElement.id}`;
        }

        if (htmlElement.className) {
          const classes = htmlElement.className
            .split(' ')
            .filter((cls) => cls && !cls.includes('css-scanner'))
            .slice(0, 3);

          if (classes.length > 0) {
            const classSelector = '.' + classes.join('.');
            try {
              const matches = document.querySelectorAll(classSelector);
              if (matches.length <= 5) {
                return classSelector;
              }
            } catch (_e) {
              // Ignore invalid selector
            }
          }
        }

        const path: string[] = [];
        let current: Element | null = element;
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
      },
      'SELECTOR_GENERATION_ERROR',
      { element }
    );

    return result.success && result.data ? result.data : 'unknown';
  }

  clear(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.cache = new WeakMap();
      this.selectorCache = new WeakMap();
      this.lastClearTime = Date.now();
    }, 'CACHE_CLEAR_ERROR');

    return result.success;
  }

  periodicCleanup(): void {
    this.safeWrapper.execute(() => {
      if (Date.now() - this.lastClearTime > 60000) {
        this.clear();
      }
    }, 'CACHE_CLEANUP_ERROR');
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.StyleCache = StyleCache;
}

export default StyleCache;
