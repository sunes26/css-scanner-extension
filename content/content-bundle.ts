/**
 * Content Script Bundle Entry Point
 * This file imports all modules in the correct dependency order
 * Webpack will bundle all these into a single content.js file
 */

// Core modules (no dependencies)
import './core/ErrorHandler';
import './core/SafeWrapper';

// Utilities
import './utils/PerformanceMonitor';

// Analyzers (depend on core)
import './analyzers/StyleCache';
import './analyzers/CSSAnalyzer';

// UI components
import './ui/ElementSelector';

// Managers (depend on core and analyzers)
import './managers/NotificationManager';
import './managers/ClipboardManager';
import './managers/PopupManager';

// Handlers (depend on managers)
import './handlers/EventHandler';
import './handlers/MessageHandler';

// Main scanner (depends on everything)
import './core/CSSScanner';

// Initialize the scanner
(() => {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          try {
            new (window as any).CSSScanner();
          } catch (error) {
            console.error('CSS Scanner initialization failed:', error);
          }
        },
        { once: true }
      );
    } else {
      new (window as any).CSSScanner();
    }
  } catch (error) {
    console.error('CSS Scanner loading failed:', error);
  }
})();
