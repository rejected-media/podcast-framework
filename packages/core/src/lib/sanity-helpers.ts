/**
 * Sanity Helpers with Auto-Configuration
 *
 * Convenience functions that automatically create Sanity client from podcast.config.js
 * Reduces boilerplate in pages.
 *
 * Usage:
 * ```astro
 * // Instead of:
 * const sanityClient = createSanityClient(config.sanity);
 * const episodes = await getAllEpisodes(sanityClient);
 *
 * // Just use:
 * import { getEpisodes, getPodcast } from '@podcast-framework/core/sanity-helpers';
 * const episodes = await getEpisodes();
 * ```
 */

import { createSanityClient, getAllEpisodes, getEpisodeBySlug, getAllGuests, getGuestBySlug, getPodcastInfo, getFeaturedEpisodes as getFeaturedEpisodesCore, getHomepageConfig as getHomepageConfigCore, getAboutPageConfig as getAboutPageConfigCore, getTheme as getThemeCore } from './sanity';
import type { SanityClient } from '@sanity/client';

// Global client cache (created once per build)
let globalClient: SanityClient | null = null;

/**
 * Get or create Sanity client from environment variables
 * Uses PUBLIC_SANITY_PROJECT_ID from import.meta.env
 */
function getClient(): SanityClient {
  if (globalClient) {
    return globalClient;
  }

  // Read from environment (Astro exposes import.meta.env)
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || import.meta.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || import.meta.env.SANITY_DATASET || 'production';

  if (!projectId) {
    throw new Error(
      'Missing Sanity project ID. Add PUBLIC_SANITY_PROJECT_ID to your .env file'
    );
  }

  globalClient = createSanityClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: true
  });

  return globalClient;
}

/**
 * Get all episodes (auto-configured)
 */
export async function getEpisodes(options?: { orderBy?: 'desc' | 'asc' }) {
  return getAllEpisodes(getClient(), options);
}

/**
 * Get episode by slug (auto-configured)
 */
export async function getEpisode(slug: string) {
  return getEpisodeBySlug(getClient(), slug);
}

/**
 * Get all guests (auto-configured)
 */
export async function getGuests() {
  return getAllGuests(getClient());
}

/**
 * Get guest by slug (auto-configured)
 */
export async function getGuest(slug: string) {
  return getGuestBySlug(getClient(), slug);
}

/**
 * Get podcast info (auto-configured)
 */
export async function getPodcast() {
  return getPodcastInfo(getClient());
}

/**
 * Get featured episodes (auto-configured)
 */
export async function getFeaturedEpisodes(limit?: number) {
  return getFeaturedEpisodesCore(getClient(), limit);
}

/**
 * Get homepage configuration (auto-configured)
 */
export async function getHomepageConfig() {
  return getHomepageConfigCore(getClient());
}

/**
 * Get about page configuration (auto-configured)
 */
export async function getAboutPageConfig() {
  return getAboutPageConfigCore(getClient());
}

/**
 * Get theme configuration (auto-configured)
 */
export async function getTheme() {
  return getThemeCore(getClient());
}
