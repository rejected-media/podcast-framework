# Changelog

All notable changes to the Podcast Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo structure with npm workspaces
- @podcast-framework/core package with 5 components
- Component resolver with bundler-safe `import.meta.glob`
- Theme system with CSS variables
- Utility functions (formatDate, stripHTML, escapeHTML, etc.)
- TypeScript types for Episode, Guest, Host, Theme
- BaseLayout with SEO meta tags and Google Analytics
- Example podcast for testing
- Unit tests for utilities and theme (59 tests passing)
- Input validation for parseDuration and formatDate
- CSS injection prevention in theme system
- ESLint configuration

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)

## [0.1.0] - 2025-10-14 (Week 1)

Initial development version - not yet published to npm

### Components
- Header.astro - Navigation with mobile menu
- Footer.astro - Social links and newsletter slot
- NewsletterSignup.astro - Email subscription form
- EpisodeSearch.astro - Client-side search
- TranscriptViewer.astro - Collapsible transcript viewer

### Features
- Component override system (hybrid auto-resolution + slots)
- Theme system with validation
- Full TypeScript support with strict mode
- Production-tested components from Strange Water
- Accessibility features (WCAG 2.1 AA)
- Security features (XSS prevention, input validation)

---

## Version History Notes

**Pre-1.0 versions** are development releases and may have breaking changes.

**After 1.0:** We will follow semantic versioning strictly:
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

---

**Next Release:** v0.2.0 (Week 2 - Complete core package extraction)
