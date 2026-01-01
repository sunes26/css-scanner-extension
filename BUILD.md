# Build System Guide

This project uses **Webpack** as its build system to bundle, minify, and optimize the Chrome Extension for production.

## Table of Contents

- [Overview](#overview)
- [Build Scripts](#build-scripts)
- [Build Output](#build-output)
- [File Size Comparison](#file-size-comparison)
- [Development vs Production](#development-vs-production)
- [Installation for Production](#installation-for-production)
- [Troubleshooting](#troubleshooting)

## Overview

The build system performs the following tasks:

1. **Bundling**: Combines all 13 content script modules into a single file
2. **Minification**: Compresses JavaScript code (removes whitespace, shortens variable names)
3. **Source Maps**: Generates source maps for debugging (development mode only)
4. **Asset Copying**: Copies static assets (manifest, icons, CSS, HTML) to dist folder
5. **Code Transpilation**: Uses Babel to ensure compatibility with older Chrome versions (v88+)

## Build Scripts

### Production Build

```bash
npm run build
```

- Minifies code
- Removes console.log statements
- Removes debugger statements
- No source maps (smaller file size)
- **Output**: `dist/` folder ready for Chrome Web Store submission

### Development Build

```bash
npm run build:dev
```

- No minification (easier to debug)
- Keeps console.log statements
- Generates source maps for debugging
- **Output**: `dist/` folder for local testing

### Watch Mode

```bash
npm run watch
```

- Automatically rebuilds when files change
- Uses development mode (with source maps)
- Useful during active development

## Build Output

After running `npm run build`, the `dist/` folder structure:

```
dist/
├── background/
│   └── background.js         # Bundled & minified background script
├── content/
│   ├── content.js            # Bundled & minified content script (all 13 modules)
│   └── content.css           # Content styles
├── popup/
│   ├── popup.js              # Bundled & minified popup script
│   ├── popup.html            # Popup HTML
│   └── popup.css             # Popup styles
├── icons/
│   └── icon.png              # Extension icon
└── manifest.json             # Extension manifest
```

## File Size Comparison

### Development Build (with source maps)

- `content/content.js`: **73.9 KiB**
- `background/background.js`: **7.78 KiB**
- `popup/popup.js`: **7.42 KiB**

### Production Build (minified, no source maps)

- `content/content.js`: **36.8 KiB** (⬇️ 50% reduction)
- `background/background.js`: **3.03 KiB** (⬇️ 61% reduction)
- `popup/popup.js`: **3.97 KiB** (⬇️ 46% reduction)

**Total savings: ~45 KiB** (50% smaller)

## Development vs Production

### Development Mode

The source code in the root directory is used for development:

- Individual module files in `content/` folder
- Background script dynamically detects and injects modules
- Easier to debug (each file separate)
- No build step required for local development

### Production Mode

The `dist/` folder contains the optimized build:

- All modules bundled into single files
- Minified for faster loading
- Background script detects bundled environment automatically
- Upload `dist/` folder to Chrome Web Store

## Smart Module Injection

The `background/background.js` script is smart enough to detect the environment:

### Bundled Environment (Production)

```javascript
// Injects single bundled file
await chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content/content.js']
});
```

### Module Environment (Development)

```javascript
// Injects all 13 modules in order
const scriptFiles = [
  'content/core/ErrorHandler.js',
  'content/core/SafeWrapper.js'
  // ... all modules
];
```

The detection is automatic using `checkIfBundled()` method.

## Installation for Production

### Option 1: Chrome Web Store Submission

1. Build for production:

   ```bash
   npm run build
   ```

2. Zip the `dist/` folder:

   ```bash
   cd dist
   zip -r ../css-scanner-extension.zip *
   ```

3. Upload `css-scanner-extension.zip` to Chrome Web Store Developer Dashboard

### Option 2: Local Testing of Production Build

1. Build for production:

   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

## Troubleshooting

### Build Fails with "Module not found"

Make sure all dependencies are installed:

```bash
npm install
```

### ESLint Errors

Run auto-fix before building:

```bash
npm run lint:fix
```

### Prettier Formatting Issues

Format code before building:

```bash
npm run format
```

### Build Succeeds but Extension Doesn't Work

1. Check the Chrome DevTools Console for errors
2. Try development build to see detailed error messages:
   ```bash
   npm run build:dev
   ```
3. Check source maps in DevTools

### Clean Build

If builds are acting strange, clean and rebuild:

```bash
# Windows
rmdir /s dist
npm run build

# macOS/Linux
rm -rf dist
npm run build
```

## Pre-build Validation

The `npm run build` command automatically runs validation before building:

1. **Prettier Check**: Ensures code formatting is consistent
2. **ESLint**: Checks for code quality issues

If validation fails, the build will not proceed. Fix issues with:

```bash
npm run format  # Fix formatting
npm run lint:fix  # Fix linting issues
```

## Build Configuration

The build is configured in `webpack.config.js`:

- **Entry Points**: background, content, popup
- **Output**: `dist/` folder
- **Loaders**: Babel for transpilation
- **Plugins**: CopyPlugin for assets, TerserPlugin for minification
- **Optimization**: Different settings for dev vs production

For advanced configuration, see `webpack.config.js` comments.

---

**Next Steps**:

- For development workflow, see [DEVELOPMENT.md](./DEVELOPMENT.md)
- For project structure, see [README.md](./README.md)
- For security details, see [SECURITY.md](./SECURITY.md)
