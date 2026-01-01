import type { MousePosition } from '../types';
import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

interface EventCallbacks {
  onMouseOver: ((event: MouseEvent) => void) | null;
  onMouseOut: ((event: MouseEvent) => void) | null;
  onMouseMove: ((event: MouseEvent, mousePosition: MousePosition) => void) | null;
  onClick: ((event: MouseEvent) => void) | null;
  onKeyDown: ((event: KeyboardEvent) => void) | null;
}

interface BoundHandlers {
  mouseOver: (event: MouseEvent) => void;
  mouseOut: (event: MouseEvent) => void;
  mouseMove: (event: MouseEvent) => void;
  keyDown: (event: KeyboardEvent) => void;
  click: (event: MouseEvent) => void;
}

/**
 * EventHandler class - Manages DOM event listeners
 * Handles mouse and keyboard events for element inspection
 */
class EventHandler {
  private errorHandler: ErrorHandler;
  private safeWrapper: SafeWrapper;
  private boundHandlers: BoundHandlers;
  private mousePosition: MousePosition;
  private hoverTimeout: number | null;
  private readonly hoverDebounceTime: number;
  private callbacks: EventCallbacks;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
    this.boundHandlers = {} as BoundHandlers;
    this.mousePosition = { x: 0, y: 0 };
    this.hoverTimeout = null;
    this.hoverDebounceTime = 100;

    this.callbacks = {
      onMouseOver: null,
      onMouseOut: null,
      onMouseMove: null,
      onClick: null,
      onKeyDown: null
    };

    this.initBoundHandlers();
  }

  private initBoundHandlers(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.boundHandlers = {
        mouseOver: this.handleMouseOver.bind(this),
        mouseOut: this.handleMouseOut.bind(this),
        mouseMove: this.throttle(this.handleMouseMove.bind(this), 16),
        keyDown: this.handleKeyDown.bind(this),
        click: this.handleClick.bind(this)
      };
    }, 'EVENT_HANDLER_INIT_ERROR');

    return result.success;
  }

  private throttle(func: (event: MouseEvent) => void, limit: number): (event: MouseEvent) => void {
    let inThrottle: boolean;
    return (event: MouseEvent) => {
      if (!inThrottle) {
        try {
          func(event);
        } catch (error) {
          console.error('Throttled function error:', error);
        }
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  setCallbacks(callbacks: Partial<EventCallbacks>): boolean {
    const result = this.safeWrapper.execute(
      () => {
        this.callbacks = { ...this.callbacks, ...callbacks };
      },
      'CALLBACK_SET_ERROR',
      { callbacks }
    );

    return result.success;
  }

  addEventListeners(): boolean {
    const result = this.safeWrapper.execute(() => {
      document.addEventListener('mouseover', this.boundHandlers.mouseOver, {
        passive: true,
        capture: true
      });
      document.addEventListener('mouseout', this.boundHandlers.mouseOut, {
        passive: true,
        capture: true
      });
      document.addEventListener('mousemove', this.boundHandlers.mouseMove, {
        passive: true,
        capture: true
      });
      document.addEventListener('keydown', this.boundHandlers.keyDown, { capture: true });
      document.addEventListener('click', this.boundHandlers.click, { capture: true });
    }, 'EVENT_LISTENER_ADD_ERROR');

    return result.success;
  }

  removeEventListeners(): boolean {
    const result = this.safeWrapper.execute(() => {
      document.removeEventListener('mouseover', this.boundHandlers.mouseOver, {
        capture: true
      });
      document.removeEventListener('mouseout', this.boundHandlers.mouseOut, {
        capture: true
      });
      document.removeEventListener('mousemove', this.boundHandlers.mouseMove, {
        capture: true
      });
      document.removeEventListener('keydown', this.boundHandlers.keyDown, { capture: true });
      document.removeEventListener('click', this.boundHandlers.click, { capture: true });
    }, 'EVENT_LISTENER_REMOVE_ERROR');

    return result.success;
  }

  private handleMouseMove(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;

        if (this.callbacks.onMouseMove) {
          this.callbacks.onMouseMove(event, this.mousePosition);
        }
      },
      'EVENT_HANDLER_ERROR',
      { eventType: 'mousemove' }
    );
  }

  private handleMouseOver(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (this.callbacks.onMouseOver) {
          this.clearHoverTimeout();

          this.hoverTimeout = window.setTimeout(() => {
            try {
              if (this.callbacks.onMouseOver) {
                this.callbacks.onMouseOver(event);
              }
            } catch (error) {
              this.errorHandler.handleError(error, 'MOUSE_OVER_CALLBACK_ERROR', { event });
            }
          }, this.hoverDebounceTime);
        }
      },
      'EVENT_HANDLER_ERROR',
      { eventType: 'mouseover' }
    );
  }

  private handleMouseOut(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (this.callbacks.onMouseOut) {
          this.clearHoverTimeout();
          this.callbacks.onMouseOut(event);
        }
      },
      'EVENT_HANDLER_ERROR',
      { eventType: 'mouseout' }
    );
  }

  private handleClick(event: MouseEvent): void {
    this.safeWrapper.execute(
      () => {
        if (this.callbacks.onClick) {
          this.callbacks.onClick(event);
        }
      },
      'EVENT_HANDLER_ERROR',
      { eventType: 'click' }
    );
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.safeWrapper.execute(
      () => {
        if (this.callbacks.onKeyDown) {
          this.callbacks.onKeyDown(event);
        }
      },
      'EVENT_HANDLER_ERROR',
      { eventType: 'keydown' }
    );
  }

  clearHoverTimeout(): boolean {
    const result = this.safeWrapper.execute(() => {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }, 'TIMEOUT_CLEAR_ERROR');

    return result.success;
  }

  getMousePosition(): MousePosition {
    return this.mousePosition;
  }

  destroy(): boolean {
    const result = this.safeWrapper.execute(() => {
      this.removeEventListeners();
      this.clearHoverTimeout();
      this.callbacks = {
        onMouseOver: null,
        onMouseOut: null,
        onMouseMove: null,
        onClick: null,
        onKeyDown: null
      };
    }, 'EVENT_HANDLER_DESTROY_ERROR');

    return result.success;
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.EventHandler = EventHandler;
}

export default EventHandler;
