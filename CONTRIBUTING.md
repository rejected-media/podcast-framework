# Contributing to Podcast Framework

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building this together!

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/podcast-framework/podcast-framework.git
cd podcast-framework

# Install dependencies
npm install

# Run tests
npm test

# Run example podcast
cd examples/basic
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow existing code style
- Write TypeScript with strict mode
- Add JSDoc documentation
- Include unit tests for new code
- Update CHANGELOG.md

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Test in example podcast
cd examples/basic && npm run dev
```

### 4. Commit

Use conventional commit format:

```bash
git commit -m "feat: add new component"
git commit -m "fix: resolve component resolver bug"
git commit -m "docs: update README"
git commit -m "test: add utils tests"
```

**Commit types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `chore:` Maintenance

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` type
- Add JSDoc with examples
- Export types for public APIs

### Astro Components

- Document props with TypeScript interfaces
- Provide usage examples in JSDoc
- Include accessibility features (ARIA labels)
- Make components theme-aware

### Testing

- Write tests for all utilities
- Test edge cases
- Aim for >80% coverage
- Use descriptive test names

### Example

```typescript
/**
 * Format a date string
 *
 * @param dateString - ISO date string
 * @returns Formatted date
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15') // "January 15, 2024"
 * ```
 */
export function formatDate(dateString: string): string {
  // Implementation with validation
}
```

## What to Contribute

### High Priority

- Unit tests for components
- Documentation improvements
- Bug fixes
- Performance optimizations

### Welcome Contributions

- New components
- Theme improvements
- Utility functions
- Example podcasts
- Documentation
- Bug reports

### Not Accepted

- Breaking changes without discussion
- Untested code
- Code without documentation
- Dependencies without justification

## Review Process

1. **Automated checks** - Tests must pass, linting must pass
2. **Code review** - Maintainer will review code quality
3. **Testing** - Changes tested in example podcast
4. **Documentation** - README/CHANGELOG updated as needed
5. **Merge** - Approved PRs merged to main

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Tag @rexkirshner for urgent items

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Podcast Framework! 🎉
