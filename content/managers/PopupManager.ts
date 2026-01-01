import type {
  ElementData,
  MousePosition,
  PinnedPosition,
  CategoryIcons,
  CategoryNames
} from '../types';
import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';
import type PerformanceMonitor from '../utils/PerformanceMonitor';

/**
 * PopupManager class - Manages the CSS information popup
 * Handles popup rendering, positioning, and interactions
 */
class PopupManager {
  private popup: HTMLElement | null;
  private isPinned: boolean;
  private pinnedPosition: PinnedPosition | null;
  private performanceMonitor: PerformanceMonitor;
  private safeWrapper: SafeWrapper;
  private renderAnimationFrame: number | null;
  private categoryIcons: CategoryIcons;
  private categoryNames: CategoryNames;
  private isDragging: boolean;
  private dragOffsetX: number;
  private dragOffsetY: number;

  constructor(performanceMonitor: PerformanceMonitor, errorHandler: ErrorHandler) {
    this.popup = null;
    this.isPinned = false;
    this.pinnedPosition = null;
    this.performanceMonitor = performanceMonitor;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.renderAnimationFrame = null;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.categoryIcons = {
      layout: '📐',
      boxModel: '📦',
      border: '🔲',
      background: '🎨',
      typography: '📝',
      flexGrid: '📊',
      effects: '✨'
    };

    this.categoryNames = {
      layout: 'Layout',
      boxModel: 'Box Model',
      border: 'Border',
      background: 'Background',
      typography: 'Typography',
      flexGrid: 'Flex & Grid',
      effects: 'Effects'
    };
  }

  showPopup(elementData: ElementData, mousePosition: MousePosition): HTMLElement | null {
    const result = this.safeWrapper.executeDOMOperation<HTMLElement>(
      () => {
        if (!elementData) {
          throw new Error('No element data to show');
        }

        const renderTimer = this.performanceMonitor.startTiming('renderTime');

        this.closePopup();

        const fragment = document.createDocumentFragment();

        this.popup = document.createElement('div');
        this.popup.className = 'css-scanner-popup';
        this.popup.innerHTML = this.generatePopupHTML(elementData);

        fragment.appendChild(this.popup);
        document.body.appendChild(fragment);

        // Set position
        if (this.isPinned && this.pinnedPosition) {
          this.popup.style.left = this.pinnedPosition.left;
          this.popup.style.top = this.pinnedPosition.top;
        } else {
          this.updatePopupPosition(mousePosition);
        }

        // Animation
        this.scheduleRender(() => {
          if (this.popup) {
            this.popup.classList.add('show');
          }
        });

        this.updatePinnedState();

        const renderTime = this.performanceMonitor.endTiming(renderTimer);
        console.log(`Popup render: ${renderTime.toFixed(2)}ms`);

        return this.popup;
      },
      'POPUP_RENDER_FAILED',
      { elementData, mousePosition }
    );

    return result.success && result.data ? result.data : null;
  }

  private generatePopupHTML(data: ElementData): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        const { element, categorized, inline, isPinned } = data;

        const hasComputedStyles = Object.keys(data.computed || {}).length > 0;
        const hasInlineStyles = Object.keys(inline || {}).length > 0;
        const hasCategorizedStyles = Object.values(categorized || {}).some(
          (cat) => Object.keys(cat).length > 0
        );
        const hasAnyStyles = hasComputedStyles || hasCategorizedStyles;

        return `
        <div class="css-scanner-header ${isPinned ? 'pinned' : ''}">
          <div class="css-scanner-title">
            <span class="css-scanner-icon">🔍</span>
            CSS Scanner
          </div>
          <button class="css-scanner-close">×</button>
        </div>

        <div class="css-scanner-content">
          <div class="css-scanner-element-header">
            <div class="css-scanner-element-info">
              <div class="css-scanner-element-tag">${element.tagName}</div>
              ${element.id ? `<div class="css-scanner-element-id">#${element.id}</div>` : ''}
              ${
                element.className
                  ? `<div class="css-scanner-element-class">.${element.className
                      .split(' ')
                      .filter((c) => c && !c.includes('css-scanner'))
                      .slice(0, 2)
                      .join('.')}</div>`
                  : ''
              }
            </div>
            <div class="css-scanner-pin-indicator" style="display: ${isPinned ? 'block' : 'none'}">📌 Pinned - Click elsewhere to unpin</div>
            <div class="css-scanner-hover-indicator" style="display: ${isPinned ? 'none' : 'block'}">🖱️ Hovering - Click to pin</div>
          </div>

          <div class="css-scanner-selector-section">
            <div class="css-scanner-section-title">🎯 CSS Selector</div>
            <div class="css-scanner-selector-value">${element.selector}</div>
            <button class="css-scanner-copy-btn" data-copy="selector">Copy Selector</button>
          </div>

          <div class="css-scanner-copy-actions">
            <button class="css-scanner-copy-btn primary" data-copy="all" ${!hasAnyStyles ? 'disabled title="No styles to copy"' : ''}>
              Copy All CSS ${hasAnyStyles ? '' : '(None)'}
            </button>
            ${hasInlineStyles ? '<button class="css-scanner-copy-btn" data-copy="inline">Inline Styles Only</button>' : ''}
          </div>

          ${this.generateCategorizedStylesHTML(categorized)}

          ${hasInlineStyles ? this.generateInlineStylesHTML(inline) : ''}
        </div>
      `;
      },
      'POPUP_HTML_GENERATION_ERROR',
      { data }
    );

    return result.success && result.data
      ? result.data
      : '<div>An error occurred while creating the popup.</div>';
  }

  private generateCategorizedStylesHTML(
    categorized: Partial<Record<keyof CategoryIcons, Record<string, string>>>
  ): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        return Object.entries(categorized)
          .filter(([, styles]) => Object.keys(styles as Record<string, string>).length > 0)
          .map(
            ([category, styles]) => `
          <div class="css-scanner-category">
            <div class="css-scanner-category-header" data-category="${category}">
              <span class="css-scanner-category-icon">${this.categoryIcons[category as keyof CategoryIcons]}</span>
              <span class="css-scanner-category-name">${this.categoryNames[category as keyof CategoryNames]}</span>
              <span class="css-scanner-category-count">(${Object.keys(styles as Record<string, string>).length})</span>
              <span class="css-scanner-category-toggle">▼</span>
            </div>
            <div class="css-scanner-category-content">
              ${Object.entries(styles as Record<string, string>)
                .map(
                  ([prop, value]) => `
                <div class="css-scanner-property">
                  <span class="css-scanner-prop-name">${prop}</span>
                  <span class="css-scanner-prop-value" title="${value}">${value}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('');
      },
      'CATEGORIZED_STYLES_HTML_ERROR',
      { categorized }
    );

    return result.success && result.data
      ? result.data
      : '<div>An error occurred while displaying styles.</div>';
  }

  private generateInlineStylesHTML(inline: Record<string, string>): string {
    const result = this.safeWrapper.execute<string>(
      () => {
        return `
        <div class="css-scanner-category">
          <div class="css-scanner-category-header" data-category="inline">
            <span class="css-scanner-category-icon">🎭</span>
            <span class="css-scanner-category-name">Inline Styles</span>
            <span class="css-scanner-category-count">(${Object.keys(inline).length})</span>
            <span class="css-scanner-category-toggle">▼</span>
          </div>
          <div class="css-scanner-category-content">
            ${Object.entries(inline)
              .map(
                ([prop, value]) => `
              <div class="css-scanner-property">
                <span class="css-scanner-prop-name">${prop}</span>
                <span class="css-scanner-prop-value" title="${value}">${value}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
      },
      'INLINE_STYLES_HTML_ERROR',
      { inline }
    );

    return result.success && result.data
      ? result.data
      : '<div>An error occurred while displaying inline styles.</div>';
  }

  updatePopupPosition(mousePosition: MousePosition): boolean {
    const result = this.safeWrapper.executeDOMOperation(
      () => {
        if (!this.popup || this.isPinned) {
          return;
        }

        const popupRect = this.popup.getBoundingClientRect();
        const popupWidth = popupRect.width || 380;
        const popupHeight = popupRect.height || Math.min(500, window.innerHeight * 0.7);
        const offset = 20;

        const positions = [
          { x: mousePosition.x + offset, y: mousePosition.y + offset },
          { x: mousePosition.x - popupWidth - offset, y: mousePosition.y + offset },
          { x: mousePosition.x + offset, y: mousePosition.y - popupHeight - offset },
          { x: mousePosition.x - popupWidth - offset, y: mousePosition.y - popupHeight - offset }
        ];

        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const bestPosition = positions.find(
          (pos) =>
            pos.x >= 10 &&
            pos.y >= 10 &&
            pos.x + popupWidth <= viewport.width - 10 &&
            pos.y + popupHeight <= viewport.height - 10
        );

        const selectedPosition = bestPosition ?? positions[0];
        const finalX = Math.max(
          10,
          Math.min(selectedPosition!.x, viewport.width - popupWidth - 10)
        );
        const finalY = Math.max(
          10,
          Math.min(selectedPosition!.y, viewport.height - popupHeight - 10)
        );

        this.popup.style.left = finalX + 'px';
        this.popup.style.top = finalY + 'px';
      },
      'POPUP_POSITION_UPDATE_ERROR',
      { mousePosition }
    );

    return result.success;
  }

  pinPopup(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.isPinned = true;
      if (this.popup) {
        this.pinnedPosition = {
          left: this.popup.style.left,
          top: this.popup.style.top
        };
        this.updatePinnedState();
      }
    }, 'POPUP_PIN_ERROR');

    return result.success;
  }

  unpinPopup(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.isPinned = false;
      this.pinnedPosition = null;
      if (this.popup) {
        this.updatePinnedState();
      }
    }, 'POPUP_UNPIN_ERROR');

    return result.success;
  }

  private enableDragging(): boolean {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!this.popup || !this.isPinned) {
        return;
      }

      const header = this.popup.querySelector('.css-scanner-header') as HTMLElement;
      if (!header) {
        return;
      }

      // Add draggable cursor style
      header.style.cursor = 'move';

      // Bind event handlers
      header.addEventListener('mousedown', this.handleDragStart.bind(this));
    }, 'DRAG_ENABLE_ERROR');

    return result.success;
  }

  private disableDragging(): boolean {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!this.popup) {
        return;
      }

      const header = this.popup.querySelector('.css-scanner-header') as HTMLElement;
      if (!header) {
        return;
      }

      // Remove draggable cursor style
      header.style.cursor = '';

      // Remove event listeners
      header.removeEventListener('mousedown', this.handleDragStart.bind(this));
    }, 'DRAG_DISABLE_ERROR');

    return result.success;
  }

  private handleDragStart(e: MouseEvent): void {
    this.safeWrapper.execute(() => {
      if (!this.popup || !this.isPinned) {
        return;
      }

      e.preventDefault();
      this.isDragging = true;

      // Get current popup position
      const rect = this.popup.getBoundingClientRect();

      // Calculate offset between mouse position and popup position
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;

      // Add document-level event listeners
      document.addEventListener('mousemove', this.handleDragMove.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));

      // Add dragging class for visual feedback
      this.popup.classList.add('dragging');
    }, 'DRAG_START_ERROR');
  }

  private handleDragMove(e: MouseEvent): void {
    this.safeWrapper.execute(() => {
      if (!this.isDragging || !this.popup) {
        return;
      }

      e.preventDefault();

      // Calculate new position
      const newLeft = e.clientX - this.dragOffsetX;
      const newTop = e.clientY - this.dragOffsetY;

      // Apply position constraints to keep popup within viewport
      const popupRect = this.popup.getBoundingClientRect();
      const maxLeft = window.innerWidth - popupRect.width - 10;
      const maxTop = window.innerHeight - popupRect.height - 10;

      const constrainedLeft = Math.max(10, Math.min(newLeft, maxLeft));
      const constrainedTop = Math.max(10, Math.min(newTop, maxTop));

      // Update popup position
      this.popup.style.left = `${constrainedLeft}px`;
      this.popup.style.top = `${constrainedTop}px`;

      // Update pinned position
      this.pinnedPosition = {
        left: `${constrainedLeft}px`,
        top: `${constrainedTop}px`
      };
    }, 'DRAG_MOVE_ERROR');
  }

  private handleDragEnd(e: MouseEvent): void {
    this.safeWrapper.execute(() => {
      if (!this.isDragging) {
        return;
      }

      e.preventDefault();
      this.isDragging = false;

      // Remove document-level event listeners
      document.removeEventListener('mousemove', this.handleDragMove.bind(this));
      document.removeEventListener('mouseup', this.handleDragEnd.bind(this));

      // Remove dragging class
      if (this.popup) {
        this.popup.classList.remove('dragging');
      }
    }, 'DRAG_END_ERROR');
  }

  private updatePinnedState(): boolean {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (!this.popup) {
        return;
      }

      const header = this.popup.querySelector('.css-scanner-header');
      const pinIndicator = this.popup.querySelector('.css-scanner-pin-indicator') as HTMLElement;
      const hoverIndicator = this.popup.querySelector(
        '.css-scanner-hover-indicator'
      ) as HTMLElement;

      if (this.isPinned) {
        if (header) {
          header.classList.add('pinned');
        }
        if (pinIndicator) {
          pinIndicator.style.display = 'block';
        }
        if (hoverIndicator) {
          hoverIndicator.style.display = 'none';
        }
        // Enable dragging when pinned
        this.enableDragging();
      } else {
        if (header) {
          header.classList.remove('pinned');
        }
        if (pinIndicator) {
          pinIndicator.style.display = 'none';
        }
        if (hoverIndicator) {
          hoverIndicator.style.display = 'block';
        }
        // Disable dragging when unpinned
        this.disableDragging();
      }
    }, 'POPUP_STATE_UPDATE_ERROR');

    return result.success;
  }

  closePopup(): boolean {
    const result = this.safeWrapper.executeDOMOperation(() => {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup);
        this.popup = null;
      }
    }, 'POPUP_CLOSE_ERROR');

    return result.success;
  }

  private scheduleRender(callback: () => void): boolean {
    const result = this.safeWrapper.execute(() => {
      if (this.renderAnimationFrame) {
        cancelAnimationFrame(this.renderAnimationFrame);
      }
      this.renderAnimationFrame = requestAnimationFrame(() => {
        callback();
        this.renderAnimationFrame = null;
      });
    }, 'RENDER_SCHEDULE_ERROR');

    return result.success;
  }

  cancelRenderFrame(): boolean {
    const result = this.safeWrapper.execute(() => {
      if (this.renderAnimationFrame) {
        cancelAnimationFrame(this.renderAnimationFrame);
        this.renderAnimationFrame = null;
      }
    }, 'RENDER_CANCEL_ERROR');

    return result.success;
  }

  getPopup(): HTMLElement | null {
    return this.popup;
  }

  isPinnedState(): boolean {
    return this.isPinned;
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.PopupManager = PopupManager;
}

export default PopupManager;
