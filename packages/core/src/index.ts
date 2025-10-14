/**
 * @podcast-framework/core
 *
 * Core components, layouts, and utilities for podcast websites
 *
 * @version 0.1.0
 * @license MIT
 */

// Component resolver (critical for override system)
export { getComponent, hasOverride, listComponents } from './lib/component-resolver';

// Utilities
export {
  formatDate,
  stripHTML,
  escapeHTML,
  decodeHTMLEntities,
  truncate,
  slugify,
  parseDuration,
  formatDuration
} from './lib/utils';

// Theme utilities
export { defaultTheme, generateThemeCSS, getGoogleFontsURL, mergeTheme } from './lib/theme';

// TypeScript types
export type {
  Episode,
  Guest,
  Host,
  Theme,
  PodcastInfo,
  NavigationItem,
  PodcastConfig,
  TranscriptSegment
} from './lib/types';

/**
 * Available Components:
 * - Header.astro - Main navigation header
 * - Footer.astro - Site footer with social links
 * - NewsletterSignup.astro - Email subscription form
 * - EpisodeSearch.astro - Client-side episode search
 * - TranscriptViewer.astro - Collapsible transcript with search
 *
 * Usage Examples:
 *
 * 1. Import component directly:
 *    import Header from '@podcast-framework/core/components/Header.astro';
 *
 * 2. Use component resolver (recommended for layouts):
 *    import { getComponent } from '@podcast-framework/core';
 *    const Header = getComponent('Header');
 *
 * 3. Override component:
 *    Create src/components/Header.astro in your podcast
 *    Framework will automatically use your version
 */
