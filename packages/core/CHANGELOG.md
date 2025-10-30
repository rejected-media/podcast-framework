# Changelog

All notable changes to the @rejected-media/podcast-framework-core package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.5] - 2025-10-30

### Added
- **Error Formatting System** (Issue #15) - Created comprehensive error message formatter
  - New `error-formatter.ts` module with `formatError()` and `formatWarning()` functions
  - Boxed, user-friendly error messages with troubleshooting steps
  - Documentation links and configuration examples included in errors
  - Consistent error formatting across all framework errors

### Improved
- **Sanity Configuration Errors** (Issue #15) - Enhanced error messages
  - Missing project ID error now includes step-by-step troubleshooting
  - Missing dataset error provides common dataset name examples
  - All errors link to configuration documentation
  - Example .env snippets included in error output
- **Theme Configuration Warnings** (Issue #15) - Better guidance
  - Missing active theme warning explains how to create theme in Studio
  - Invalid theme configuration provides field-by-field checklist
  - Clear suggestions for resolving theme issues
- **Environment Variable Errors** (Issue #15) - More helpful messages
  - Missing env vars error lists all missing variables
  - Provides platform-specific guidance (Cloudflare, Netlify, Vercel)
  - Links to .env.template for examples
  - Includes deployment platform configuration instructions

### Changed
- **Test Assertions** - Updated to work with formatted error messages
  - Tests now check for key content within formatted errors
  - Maintains test coverage while supporting enhanced error messages

## [0.1.4] - 2025-10-29

### Fixed
- **Contribution Service** - Removed hardcoded Studio URL (Issue #11)
  - Replaced hardcoded "strangewater.xyz" fallback with intelligent resolution
  - Implements fallback chain: config.studioUrl → STUDIO_URL env → PUBLIC_SITE_URL/sanity/studio
  - Gracefully omits Studio link from emails if URL cannot be determined
  - Fixed URL path from `/studio/structure/contribution` to `/structure/contribution`

### Changed
- **ContributionServiceConfig** - Enhanced studioUrl documentation
  - Added JSDoc with examples for self-hosted and Sanity Cloud studios
  - Documented fallback behavior
  - Clarified purpose: "URL to your Sanity Studio for email links"

## [0.1.3] - 2025-10-29

### Changed
- **Guest TypeScript interface** - Added `title` field for professional titles (Issue #4)
  - Optional string field for guest's job title or role
  - Aligns with updated sanity-schema Guest schema
  - Example values: "CEO", "Author", "Professor", "Podcaster"

## [0.1.2] - Previous release
- Core components, layouts, and utilities
- Sanity integration and query functions
- Theme system
- Hosting adapter for multi-cloud support
