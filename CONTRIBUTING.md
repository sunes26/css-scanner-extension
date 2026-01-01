# Contributing to CSS Scanner

First off, thank you for considering contributing to CSS Scanner! 🎉

It's people like you that make CSS Scanner such a great tool for the web development community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [support email].

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the [existing issues](../../issues) to avoid duplicates.

When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (websites where it fails, screenshots, etc.)
- **Describe the behavior you observed and what you expected**
- **Include Chrome version** and extension version
- **List any other extensions** that might conflict

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) when creating issues.

### Suggesting Features ✨

Feature suggestions are tracked as GitHub issues. When creating a feature request:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this would be useful** to most CSS Scanner users
- **List any alternative solutions** you've considered
- **Include mockups or examples** if applicable

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

### Pull Requests 🔧

Good pull requests (patches, improvements, new features) are fantastic help. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g., implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge.

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Google Chrome browser
- Git
- Code editor (VS Code recommended)

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/css-scanner-extension.git
   cd css-scanner-extension
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   # Development build (with source maps)
   npm run build:dev

   # Production build (minified)
   npm run build
   ```

4. **Load extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

5. **Make your changes**

   Edit files in:
   - `content/` - Content scripts
   - `background/` - Background service worker
   - `popup/` - Extension popup
   - `options/` - Settings page (if adding)

6. **Test your changes**

   ```bash
   # Run linter
   npm run lint

   # Fix lint issues automatically
   npm run lint:fix

   # Run type checker
   npm run type-check

   # Run all validation
   npm run validate
   ```

7. **Rebuild and test in Chrome**
   ```bash
   npm run build:dev
   ```
   Then reload the extension in Chrome

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if using GitFlow)
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files

**Examples:**

```bash
feat(popup): add dark mode toggle
fix(cache): prevent memory leak in StyleCache
docs(readme): update installation instructions
perf(analyzer): optimize CSS property categorization
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing code patterns
- Use proper type annotations (no `any` without good reason)
- Document complex functions with JSDoc comments

```typescript
/**
 * Analyzes CSS properties and categorizes them
 * @param element - The DOM element to analyze
 * @param options - Analysis options
 * @returns Categorized CSS properties
 */
function analyzeCSS(element: HTMLElement, options: AnalysisOptions): CategorizedStyles {
  // Implementation
}
```

### Code Formatting

We use Prettier and ESLint:

```bash
# Auto-format code
npm run format

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix
```

**Important**: All code must pass `npm run validate` before submission.

### Naming Conventions

- **Files**: `PascalCase.ts` for classes, `camelCase.ts` for utilities
- **Classes**: `PascalCase`
- **Functions/Methods**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private members**: Prefix with `private`

### Project Structure

```
css-scanner-extension/
├── content/           # Content scripts
│   ├── core/         # Core classes
│   ├── analyzers/    # CSS analysis
│   ├── managers/     # UI managers
│   ├── handlers/     # Event/message handlers
│   ├── utils/        # Utilities
│   └── ui/           # UI components
├── background/       # Service worker
├── popup/            # Extension popup
├── options/          # Settings page (future)
├── icons/            # Extension icons
└── dist/             # Built extension (gitignored)
```

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Different websites**:
   - Simple pages (Wikipedia, GitHub)
   - Complex SPAs (Gmail, Twitter)
   - Heavy CSS (design portfolios)

2. **Edge cases**:
   - Iframes
   - Shadow DOM
   - Dynamic content
   - Very large stylesheets

3. **Browser states**:
   - Fresh install
   - After reload
   - With other extensions enabled

### Automated Testing (Coming Soon)

We're setting up Jest for unit tests. If you're interested in helping, please comment on Issue #[number].

## Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG)
2. **Follow the PR template** (will be provided)
3. **Ensure all checks pass**:
   - Linting: `npm run lint`
   - Type checking: `npm run type-check`
   - Build: `npm run build`
4. **Keep PRs focused** - One feature/fix per PR
5. **Write a clear description**:
   - What changes were made
   - Why they were made
   - How to test them
6. **Link related issues** using "Fixes #123" or "Relates to #456"
7. **Add screenshots** for UI changes
8. **Request review** from maintainers
9. **Be responsive** to feedback and questions

### PR Title Format

Use conventional commit format:

```
feat: add keyboard shortcuts for copy actions
fix: resolve memory leak in popup manager
docs: improve build instructions
```

## Documentation

- **Code comments**: Explain "why", not "what"
- **JSDoc**: Document public APIs
- **README**: Update if adding features
- **CHANGELOG**: Add entry for user-facing changes
- **Type definitions**: Keep `types.ts` up to date

## Performance Guidelines

CSS Scanner must be **fast and lightweight**:

- ✅ Use WeakMap for caching (not Map or plain objects)
- ✅ Debounce/throttle event handlers
- ✅ Use `requestAnimationFrame` for animations
- ✅ Minimize DOM queries
- ✅ Avoid memory leaks
- ✅ Keep bundle size small

**Before/After**: If your change affects performance, include benchmarks.

## Accessibility Guidelines

Make CSS Scanner accessible to all users:

- ✅ Use semantic HTML
- ✅ Add ARIA labels to interactive elements
- ✅ Ensure keyboard navigation works
- ✅ Test with screen readers
- ✅ Maintain color contrast ratios
- ✅ Don't rely solely on color to convey information

## Security Guidelines

- ❌ Never use `eval()` or `new Function()`
- ❌ Never include external scripts
- ❌ Never send data to external servers
- ❌ Never request unnecessary permissions
- ✅ Sanitize user input
- ✅ Follow principle of least privilege
- ✅ Keep dependencies updated

## Release Process

Maintainers will handle releases:

1. Update version in `package.json` and `manifest.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.2.0`
4. Build production version: `npm run build`
5. Submit to Chrome Web Store
6. Create GitHub release with notes

## Getting Help

- **Documentation**: Check [README](README.md), [BUILD](BUILD.md), [DEVELOPMENT](DEVELOPMENT.md)
- **Questions**: Open a [Discussion](../../discussions) (preferred) or [Issue](../../issues)
- **Chat**: [Discord/Slack link if available]
- **Email**: [support email] for private matters

## Recognition

Contributors will be:

- Added to [Contributors section](README.md#contributors)
- Mentioned in release notes
- Given credit in commit messages

Thank you for helping make CSS Scanner better! 🙏

## Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Happy Coding!** 🚀
