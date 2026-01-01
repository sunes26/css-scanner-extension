# CSS Scanner - Module Dependency Graph

## Dependency Hierarchy

```
Level 0 (No Dependencies)
├── ErrorHandler
└── NotificationManager (static)

Level 1 (Depends on Level 0)
└── SafeWrapper
    └── depends: ErrorHandler

Level 2 (Depends on Level 0-1)
├── PerformanceMonitor
│   └── depends: ErrorHandler, SafeWrapper
├── StyleCache
│   └── depends: ErrorHandler, SafeWrapper
├── ElementSelector
│   └── depends: ErrorHandler, SafeWrapper
└── ClipboardManager
    └── depends: ErrorHandler, SafeWrapper

Level 3 (Depends on Level 0-2)
├── CSSAnalyzer
│   └── depends: StyleCache, ErrorHandler, SafeWrapper
├── PopupManager
│   └── depends: PerformanceMonitor, ErrorHandler, SafeWrapper
├── EventHandler
│   └── depends: ErrorHandler, SafeWrapper
└── MessageHandler
    └── depends: ErrorHandler, SafeWrapper

Level 4 (Main Orchestrator)
└── CSSScanner
    └── depends: ALL above classes

Level 5 (Entry Point)
└── content.js
    └── depends: CSSScanner
```

## Detailed Dependencies

### ErrorHandler (core/ErrorHandler.js)

- **Dependencies**: None
- **Used by**: All other classes
- **Purpose**: Centralized error handling and recovery

### SafeWrapper (core/SafeWrapper.js)

- **Dependencies**: ErrorHandler
- **Used by**: All classes except ErrorHandler and NotificationManager
- **Purpose**: Safe execution wrapper for sync/async/DOM operations

### NotificationManager (managers/NotificationManager.js)

- **Dependencies**: None (optional ErrorHandler for enhanced error handling)
- **Used by**: ErrorHandler, CSSScanner, ClipboardManager
- **Purpose**: Display user-facing notifications

### PerformanceMonitor (utils/PerformanceMonitor.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: PopupManager, CSSScanner
- **Purpose**: Track and log performance metrics

### StyleCache (analyzers/StyleCache.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: CSSAnalyzer, CSSScanner
- **Purpose**: Cache computed styles and CSS selectors

### ElementSelector (ui/ElementSelector.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Highlight and track selected elements

### ClipboardManager (managers/ClipboardManager.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Copy CSS data to clipboard

### CSSAnalyzer (analyzers/CSSAnalyzer.js)

- **Dependencies**: StyleCache, ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Analyze and categorize CSS properties

### PopupManager (managers/PopupManager.js)

- **Dependencies**: PerformanceMonitor, ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Manage CSS info popup display

### EventHandler (handlers/EventHandler.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Handle DOM events (mouse, keyboard)

### MessageHandler (handlers/MessageHandler.js)

- **Dependencies**: ErrorHandler, SafeWrapper
- **Used by**: CSSScanner
- **Purpose**: Handle Chrome extension messages

### CSSScanner (core/CSSScanner.js)

- **Dependencies**: ALL above classes
- **Used by**: content.js
- **Purpose**: Main orchestrator coordinating all components

### content.js

- **Dependencies**: CSSScanner
- **Used by**: Chrome Extension (manifest.json)
- **Purpose**: Entry point and initialization

## Loading Order in manifest.json

The files MUST be loaded in this exact order to ensure all dependencies are available:

1. `content/core/ErrorHandler.js`
2. `content/core/SafeWrapper.js`
3. `content/utils/PerformanceMonitor.js`
4. `content/analyzers/StyleCache.js`
5. `content/analyzers/CSSAnalyzer.js`
6. `content/ui/ElementSelector.js`
7. `content/managers/NotificationManager.js`
8. `content/managers/ClipboardManager.js`
9. `content/managers/PopupManager.js`
10. `content/handlers/EventHandler.js`
11. `content/handlers/MessageHandler.js`
12. `content/core/CSSScanner.js`
13. `content/content.js`

## Key Patterns

### Dependency Injection

All classes receive their dependencies via constructor:

```javascript
class CSSAnalyzer {
  constructor(styleCache, errorHandler) {
    this.styleCache = styleCache;
    this.errorHandler = errorHandler;
    this.safeWrapper = new SafeWrapper(errorHandler);
  }
}
```

### Window Object Exports

All classes are exported to the global window object:

```javascript
window.CSSAnalyzer = CSSAnalyzer;
```

### Circular Dependency Prevention

- ErrorHandler is the foundation, used by all but depends on none
- SafeWrapper depends only on ErrorHandler
- Other classes build on these foundations
- No circular dependencies exist

## Communication Flow

```
User Interaction
    ↓
EventHandler (captures mouse/keyboard events)
    ↓
CSSScanner (coordinates response)
    ↓
├── ElementSelector (highlights element)
├── CSSAnalyzer (analyzes CSS)
│   └── StyleCache (retrieves cached styles)
├── PopupManager (displays info)
│   └── PerformanceMonitor (tracks timing)
└── ClipboardManager (copies on button click)
    └── NotificationManager (shows success/error)
```

## Error Handling Flow

```
Any Error Occurs
    ↓
SafeWrapper (catches exception)
    ↓
ErrorHandler (processes error)
    ↓
├── Records error history
├── Attempts recovery
└── NotificationManager (shows user message)
```
