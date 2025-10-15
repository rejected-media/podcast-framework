/**
 * Static Path Helpers
 *
 * Reusable getStaticPaths functions for common patterns
 * Eliminates boilerplate in dynamic routes
 */

import { getEpisodes, getGuests } from './sanity-helpers';

/**
 * Generate static paths for all episodes
 *
 * @returns Static paths array for Astro
 *
 * @example
 * ```astro
 * ---
 * // src/pages/episodes/[slug].astro
 * import { getStaticPathsForEpisodes } from '@podcast-framework/core/static-paths';
 * export const getStaticPaths = getStaticPathsForEpisodes;
 *
 * const { episode } = Astro.props;
 * ---
 * <h1>{episode.title}</h1>
 * ```
 */
export async function getStaticPathsForEpisodes() {
  const episodes = await getEpisodes();

  return episodes.map((episode) => ({
    params: { slug: episode.slug.current },
    props: { episode },
  }));
}

/**
 * Generate static paths for all guests
 *
 * @example
 * ```astro
 * // src/pages/guests/[slug].astro
 * import { getStaticPathsForGuests } from '@podcast-framework/core/static-paths';
 * export const getStaticPaths = getStaticPathsForGuests;
 * ```
 */
export async function getStaticPathsForGuests() {
  const guests = await getGuests();

  return guests.map((guest) => ({
    params: { slug: guest.slug.current },
    props: { guest },
  }));
}
