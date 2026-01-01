/**
 * Type definitions for CSS Scanner Extension
 */

// ============================================================================
// Core Types
// ============================================================================

export interface SafeWrapperResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface ErrorContext {
  [key: string]: unknown;
}

export interface ErrorStats {
  totalErrors: number;
  errorCounts: Record<string, number>;
  lastErrors: Array<{
    code: string;
    message: string;
    timestamp: number;
    context?: ErrorContext;
  }>;
}

// ============================================================================
// CSS Types
// ============================================================================

export interface CategorizedStyles {
  layout: Record<string, string>;
  boxModel: Record<string, string>;
  border: Record<string, string>;
  background: Record<string, string>;
  typography: Record<string, string>;
  flexGrid: Record<string, string>;
  effects: Record<string, string>;
}

export interface ElementData {
  element: {
    tagName: string;
    id: string;
    className: string;
    selector: string;
  };
  computed: Record<string, string>;
  inline: Record<string, string>;
  categorized: CategorizedStyles;
  isPinned: boolean;
}

export interface CacheEntry {
  computed: Record<string, string>;
  categorized: CategorizedStyles;
  timestamp: number;
}

// ============================================================================
// Position & UI Types
// ============================================================================

export interface MousePosition {
  x: number;
  y: number;
}

export interface PinnedPosition {
  left: string;
  top: string;
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalAnalyses: number;
}

export interface PerformanceTimer {
  startTime: number;
  operation: string;
}

// ============================================================================
// Message Types
// ============================================================================

export interface ChromeMessage {
  action: string;
  tabId?: number;
  [key: string]: unknown;
}

export interface ChromeMessageResponse {
  success: boolean;
  pong?: boolean;
  error?: string;
  [key: string]: unknown;
}

// ============================================================================
// Manager Configuration Types
// ============================================================================

export interface CategoryIcons {
  layout: string;
  boxModel: string;
  border: string;
  background: string;
  typography: string;
  flexGrid: string;
  effects: string;
}

export interface CategoryNames {
  layout: string;
  boxModel: string;
  border: string;
  background: string;
  typography: string;
  flexGrid: string;
  effects: string;
}

// ============================================================================
// Class Instances (for window object)
// ============================================================================

declare global {
  interface Window {
    ErrorHandler: typeof import('./core/ErrorHandler').default;
    SafeWrapper: typeof import('./core/SafeWrapper').default;
    PerformanceMonitor: typeof import('./utils/PerformanceMonitor').default;
    StyleCache: typeof import('./analyzers/StyleCache').default;
    CSSAnalyzer: typeof import('./analyzers/CSSAnalyzer').default;
    ElementSelector: typeof import('./ui/ElementSelector').default;
    NotificationManager: typeof import('./managers/NotificationManager').default;
    ClipboardManager: typeof import('./managers/ClipboardManager').default;
    PopupManager: typeof import('./managers/PopupManager').default;
    EventHandler: typeof import('./handlers/EventHandler').default;
    MessageHandler: typeof import('./handlers/MessageHandler').default;
    CSSScanner: typeof import('./core/CSSScanner').default;
    cssScanner?: unknown;
  }
}

export {};
