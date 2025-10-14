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

// Import for getAllBaseSchemas
import { baseEpisodeSchema } from './schemas/episode';
import { baseGuestSchema } from './schemas/guest';
import { baseHostSchema } from './schemas/host';
import { basePodcastSchema } from './schemas/podcast';
import { baseContributionSchema } from './schemas/contribution';

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
    baseEpisodeSchema,
    baseGuestSchema,
    baseHostSchema,
    basePodcastSchema,
    baseContributionSchema,
  ];
}

/**
 * Usage Examples:
 *
 * 1. Use base schemas as-is:
 *    import { episode, guest, host } from '@podcast-framework/sanity-schema';
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
