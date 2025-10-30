# Changelog

All notable changes to the @rejected-media/podcast-framework-core package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
