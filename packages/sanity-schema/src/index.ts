/**
 * @podcast-framework/sanity-schema
 *
 * Base Sanity schemas for podcast framework with extension support
 *
 * @version 1.0.0
 * @license MIT
 */

// Base schemas
export {
  baseEpisodeSchema,
  extendEpisodeSchema,
  default as episode
} from './schemas/episode';

export {
  baseGuestSchema,
  extendGuestSchema,
  default as guest
} from './schemas/guest';

export {
  baseHostSchema,
  extendHostSchema,
  default as host
} from './schemas/host';

export {
  basePodcastSchema,
  extendPodcastSchema,
  default as podcast
} from './schemas/podcast';

export {
  baseContributionSchema,
  extendContributionSchema,
  default as contribution
} from './schemas/contribution';

export {
  baseThemeSchema,
  extendThemeSchema,
  default as theme
} from './schemas/theme';

export {
  baseHomepageConfigSchema,
  extendHomepageConfigSchema,
  default as homepageConfig
} from './schemas/homepageConfig';

export {
  baseAboutPageConfigSchema,
  extendAboutPageConfigSchema,
  default as aboutPageConfig
} from './schemas/aboutPageConfig';

// Import for getAllBaseSchemas
import { baseEpisodeSchema } from './schemas/episode';
import { baseGuestSchema } from './schemas/guest';
import { baseHostSchema } from './schemas/host';
import { basePodcastSchema } from './schemas/podcast';
import { baseContributionSchema } from './schemas/contribution';
import { baseThemeSchema } from './schemas/theme';
import { baseHomepageConfigSchema } from './schemas/homepageConfig';
import { baseAboutPageConfigSchema } from './schemas/aboutPageConfig';

/**
 * Get all base schemas as array
 * Useful for Sanity config
 *
 * @returns Array of base schema definitions
 *
 * @example
 * ```typescript
 * import { getAllBaseSchemas } from '@podcast-framework/sanity-schema';
 * import { defineConfig } from 'sanity';
 *
 * export default defineConfig({
 *   schema: {
 *     types: getAllBaseSchemas()
 *   }
 * });
 * ```
 */
export function getAllBaseSchemas() {
  return [
    basePodcastSchema,
    baseEpisodeSchema,
    baseGuestSchema,
    baseHostSchema,
    baseContributionSchema,
    baseThemeSchema,
    baseHomepageConfigSchema,
    baseAboutPageConfigSchema,
  ];
}

// Alias exports with "Schema" suffix for backwards compatibility and clarity
// Supports both naming conventions: episode (default) and episodeSchema (explicit)
// Import defaults to re-export with alias
import episode from './schemas/episode';
import guest from './schemas/guest';
import host from './schemas/host';
import podcast from './schemas/podcast';
import contribution from './schemas/contribution';
import theme from './schemas/theme';
import homepageConfig from './schemas/homepageConfig';
import aboutPageConfig from './schemas/aboutPageConfig';

export const episodeSchema = episode;
export const guestSchema = guest;
export const hostSchema = host;
export const podcastSchema = podcast;
export const contributionSchema = contribution;
export const themeSchema = theme;
export const homepageConfigSchema = homepageConfig;
export const aboutPageConfigSchema = aboutPageConfig;

/**
 * Usage Examples:
 *
 * 1. Use base schemas as-is (both naming styles supported):
 *    import { episode, guest, host } from '@podcast-framework/sanity-schema';
 *    // OR
 *    import { episodeSchema, guestSchema, hostSchema } from '@podcast-framework/sanity-schema';
 *
 * 2. Extend with custom fields:
 *    import { extendEpisodeSchema } from '@podcast-framework/sanity-schema';
 *    const episode = extendEpisodeSchema([
 *      { name: 'sponsor', type: 'reference', to: [{ type: 'sponsor' }] }
 *    ]);
 *
 * 3. Get all schemas at once:
 *    import { getAllBaseSchemas } from '@podcast-framework/sanity-schema';
 *    const schemas = getAllBaseSchemas();
 */
