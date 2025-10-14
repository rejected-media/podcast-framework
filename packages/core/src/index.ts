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

// Sanity CMS utilities
export {
  createSanityClient,
  cachedFetch,
  getAllEpisodes,
  getEpisodeBySlug,
  getFeaturedEpisodes,
  getPodcastInfo,
  getAllGuests,
  getGuestBySlug
} from './lib/sanity';

// Hosting platform adapter
export {
  detectPlatform,
  getEnvironmentVariables,
  getEnv,
  getRequiredEnv,
  getClientIP,
  getPlatformInfo,
  logError
} from './lib/hosting-adapter';
export type { HostingPlatform } from './lib/hosting-adapter';

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
 * Available Components (8):
 * - Header.astro - Main navigation header with mobile menu
 * - Footer.astro - Site footer with social links and newsletter slot
 * - NewsletterSignup.astro - Email subscription form with spam protection
 * - EpisodeSearch.astro - Client-side episode search with fuzzy matching
 * - TranscriptViewer.astro - Collapsible transcript viewer with search
 * - FeaturedEpisodesCarousel.astro - Auto-progressing episode carousel
 * - SkeletonLoader.astro - Loading placeholder UI (4 variants)
 * - BlockContent.astro - Sanity portable text renderer
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
