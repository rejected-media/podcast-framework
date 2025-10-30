# Changelog

All notable changes to the @rejected-media/podcast-framework-sanity-schema package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2025-10-29

### Added
- **Guest schema** - Added `title` field for professional titles (Issue #4)
  - Optional field for guest's job title/role (e.g., "CEO", "Author", "Professor")
  - Max 100 characters validation
  - Positioned after name field for better UX
  - Updated Guest TypeScript interface in core package

## [1.1.1] - 2025-10-29

### Added
- **Theme schema** - Complete theme configuration schema with colors, typography, and layout (Issue #12)
  - Includes all 11 required color fields (primary, secondary, accent, background, surface, text, textMuted, headerBg, headerText, footerBg, footerText)
  - Typography configuration with Google Fonts support
  - Layout configuration with borderRadius and spacing (Issue #14)
  - Uses `isActive` field for framework compatibility (Issue #13)
  - Includes comprehensive validation (hex color format, required fields)

- **Homepage Config schema** - CMS-driven homepage layout configuration (Issue #16)
  - Hero section with custom headline/description
  - Featured episodes carousel with auto-progress interval
  - Recent episodes section
  - About section with rich text
  - Newsletter section
  - Custom sections support
  - Uses `isActive` field for framework compatibility (Issue #13)

- **About Page Config schema** - CMS-driven about page layout configuration (Issue #16)
  - About section with rich text content
  - Hosts section with layout options (cards/list) and selective display
  - Mission/values section
  - Subscribe CTA section
  - Community/contact section
  - Custom sections support
  - Uses `isActive` field for framework compatibility (Issue #13)

- **Export aliases** - Added "Schema" suffix exports for backwards compatibility (Issue #2)
  - `episodeSchema`, `guestSchema`, `hostSchema`, `podcastSchema`, `contributionSchema`
  - `themeSchema`, `homepageConfigSchema`, `aboutPageConfigSchema`
  - Both naming conventions now supported: `episode` and `episodeSchema`

- **Test coverage** - Added 22 new tests for the three new schemas
  - theme.test.ts: 8 tests
  - homepageConfig.test.ts: 7 tests
  - aboutPageConfig.test.ts: 7 tests
  - All tests validate structure, required fields, and isActive field name

- **getAllBaseSchemas()** - Updated to include all 8 schemas (was 5, now 8)

### Fixed
- Fixed pre-existing test failure in podcast.test.ts (applePodcastsUrl → appleUrl)

### Changed
- Updated documentation with usage examples for both naming conventions
- Reordered schemas in getAllBaseSchemas() for logical grouping (podcast first)

## [1.1.0] - Previous release
- Episode, Guest, Host, Podcast, and Contribution schemas
- Extension functions for all base schemas
