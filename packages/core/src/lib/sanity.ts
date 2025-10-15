/**
 * Sanity CMS Utilities
 *
 * Helpers for working with Sanity CMS including client setup,
 * build-time caching, and common query functions
 *
 * @requires @sanity/client (peer dependency)
 */

import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';
import type { Episode, Guest, PodcastInfo } from './types';

/**
 * Create Sanity client with validation
 *
 * @param config - Sanity configuration
 * @returns Configured Sanity client
 * @throws Error if required config missing
 */
export function createSanityClient(config: {
  projectId: string;
  dataset: string;
  useCdn?: boolean;
  apiVersion?: string;
  token?: string;
}): SanityClient {
  // Validate required config
  if (!config.projectId) {
    throw new Error(
      'Missing Sanity project ID. ' +
      'Add PUBLIC_SANITY_PROJECT_ID to your environment variables.'
    );
  }

  if (!config.dataset) {
    throw new Error(
      'Missing Sanity dataset. ' +
      'Add PUBLIC_SANITY_DATASET to your environment variables (usually "production").'
    );
  }

  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    useCdn: config.useCdn ?? true, // Use CDN for faster response
    apiVersion: config.apiVersion || '2024-01-01',
    token: config.token, // Optional - only needed for writes
  });
}

// ============================================================================
// Build-Time Cache
// ============================================================================
// During SSG builds, the same data is fetched hundreds of times across pages.
// This in-memory cache prevents redundant API calls during a single build.
// Cache is cleared between builds (serverless function instances).
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const buildCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 60 * 1000; // 1 minute (enough for a build, not too stale)

/**
 * Cached fetch wrapper for build-time optimization
 * Only caches during SSG builds, not in dev or production runtime
 *
 * @param cacheKey - Unique key for this data
 * @param fetchFn - Function that fetches the data
 * @returns Cached or fresh data
 */
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Only use cache during builds (not dev server or client-side)
  const isBuild = import.meta.env.MODE === 'production';

  if (!isBuild) {
    return fetchFn();
  }

  const cached = buildCache.get(cacheKey);
  const now = Date.now();

  // Return cached data if fresh
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  // Fetch fresh data and cache it
  const data = await fetchFn();
  buildCache.set(cacheKey, { data, timestamp: now });

  return data;
}

/**
 * Fetch all episodes
 *
 * @param client - Sanity client
 * @param options - Query options
 * @returns Array of episodes
 */
export async function getAllEpisodes(
  client: SanityClient,
  options: { orderBy?: 'desc' | 'asc' } = {}
): Promise<Episode[]> {
  const order = options.orderBy === 'asc' ? 'asc' : 'desc';

  return cachedFetch('all-episodes', async () => {
    const query = `*[_type == "episode"] | order(episodeNumber ${order}) {
      _id,
      title,
      slug,
      episodeNumber,
      publishDate,
      duration,
      description,
      spotifyLink,
      applePodcastLink,
      youtubeLink,
      audioUrl,
      "coverImage": coverImage.asset->{url},
      featured,
      transcript,
      transcriptSegments,
      transcriptDuration,
      transcriptGeneratedAt,
      showNotes,
      "hosts": hosts[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      },
      "guests": guests[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      }
    }`;

    try {
      const episodes = await client.fetch(query);
      return episodes || [];
    } catch (error) {
      console.error('Failed to fetch episodes from Sanity:', error);
      return [];
    }
  });
}

/**
 * Fetch single episode by slug
 *
 * @param client - Sanity client
 * @param slug - Episode slug
 * @returns Episode or null if not found
 */
export async function getEpisodeBySlug(
  client: SanityClient,
  slug: string
): Promise<Episode | null> {
  return cachedFetch(`episode-${slug}`, async () => {
    const query = `*[_type == "episode" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      episodeNumber,
      publishDate,
      duration,
      description,
      showNotes,
      spotifyLink,
      applePodcastLink,
      youtubeLink,
      audioUrl,
      "coverImage": coverImage.asset->{url},
      featured,
      transcript,
      transcriptSegments,
      transcriptDuration,
      transcriptGeneratedAt,
      "hosts": hosts[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      },
      "guests": guests[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      }
    }`;

    try {
      const episode = await client.fetch(query, { slug });

      if (!episode) {
        console.warn(`Episode with slug "${slug}" not found in Sanity CMS.`);
        return null;
      }

      return episode;
    } catch (error) {
      console.error(`Failed to fetch episode with slug "${slug}" from Sanity:`, error);
      return null;
    }
  });
}

/**
 * Fetch featured episodes
 *
 * @param client - Sanity client
 * @param limit - Maximum number of episodes to return
 * @returns Array of featured episodes
 */
export async function getFeaturedEpisodes(
  client: SanityClient,
  limit?: number
): Promise<Episode[]> {
  return cachedFetch('featured-episodes', async () => {
    const limitClause = limit ? `[0...${limit}]` : '';
    const query = `*[_type == "episode" && featured == true] | order(publishDate desc)${limitClause} {
      _id,
      title,
      slug,
      episodeNumber,
      publishDate,
      duration,
      description,
      spotifyLink,
      applePodcastLink,
      youtubeLink,
      "coverImage": coverImage.asset->{url},
      featured,
      "hosts": hosts[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      },
      "guests": guests[]->{
        _id,
        name,
        slug,
        bio,
        "photo": photo.asset->{url},
        twitter,
        website,
        linkedin
      }
    }`;

    try {
      const episodes = await client.fetch(query);
      return episodes || [];
    } catch (error) {
      console.error('Failed to fetch featured episodes from Sanity:', error);
      return [];
    }
  });
}

/**
 * Fetch podcast metadata
 *
 * @param client - Sanity client
 * @returns Podcast info or undefined if not found
 */
export async function getPodcastInfo(
  client: SanityClient
): Promise<PodcastInfo | undefined> {
  return cachedFetch('podcast-info', async () => {
    const query = `*[_type == "podcast"][0] {
      _id,
      name,
      tagline,
      description,
      isActive,
      "logo": logo.asset->{url},
      spotifyShowId,
      applePodcastsUrl,
      spotifyUrl,
      rssUrl,
      twitterUrl,
      discordUrl
    }`;

    try {
      const podcast = await client.fetch(query);

      if (!podcast) {
        console.warn('No podcast document found in Sanity CMS.');
        return undefined;
      }

      return podcast;
    } catch (error) {
      console.error('Failed to fetch podcast info from Sanity:', error);
      return undefined;
    }
  });
}

/**
 * Fetch all guests
 *
 * @param client - Sanity client
 * @returns Array of guests
 */
export async function getAllGuests(
  client: SanityClient
): Promise<Guest[]> {
  return cachedFetch('all-guests', async () => {
    const query = `*[_type == "guest"] | order(name asc) {
      _id,
      name,
      slug,
      bio,
      "photo": photo.asset->{url},
      twitter,
      website,
      linkedin
    }`;

    try {
      const guests = await client.fetch(query);
      return guests || [];
    } catch (error) {
      console.error('Failed to fetch guests from Sanity:', error);
      return [];
    }
  });
}

/**
 * Fetch guest by slug
 *
 * @param client - Sanity client
 * @param slug - Guest slug
 * @returns Guest or null if not found
 */
export async function getGuestBySlug(
  client: SanityClient,
  slug: string
): Promise<Guest | null> {
  return cachedFetch(`guest-${slug}`, async () => {
    const query = `*[_type == "guest" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      bio,
      "photo": photo.asset->{url},
      twitter,
      website,
      linkedin,
      "episodes": *[_type == "episode" && references(^._id)] | order(episodeNumber desc) {
        _id,
        title,
        slug,
        episodeNumber,
        publishDate,
        duration,
        description,
        "coverImage": coverImage.asset->{url}
      }
    }`;

    try {
      const guest = await client.fetch(query, { slug });

      if (!guest) {
        console.warn(`Guest with slug "${slug}" not found in Sanity CMS.`);
        return null;
      }

      return guest;
    } catch (error) {
      console.error(`Failed to fetch guest with slug "${slug}" from Sanity:`, error);
      return null;
    }
  });
}

/**
 * Fetch homepage configuration from Sanity
 *
 * @param client - Sanity client
 * @returns Homepage config or undefined if not found
 */
export async function getHomepageConfig(
  client: SanityClient
): Promise<any | undefined> {
  return cachedFetch('homepage-config', async () => {
    const query = `*[_type == "homepageConfig" && isActive == true][0] {
      _id,
      title,
      isActive,
      hero,
      featuredEpisodes,
      recentEpisodes,
      featuredGuests,
      subscribe,
      about,
      newsletter,
      customSections
    }`;

    try {
      const config = await client.fetch(query);

      if (!config) {
        console.warn('No active homepage config found in Sanity CMS.');
        return undefined;
      }

      return config;
    } catch (error) {
      console.error('Failed to fetch homepage config from Sanity:', error);
      return undefined;
    }
  });
}

/**
 * Fetch about page configuration from Sanity
 *
 * @param client - Sanity client
 * @returns About page config or undefined if not found
 */
export async function getAboutPageConfig(
  client: SanityClient
): Promise<any | undefined> {
  return cachedFetch('about-page-config', async () => {
    const query = `*[_type == "aboutPageConfig" && isActive == true][0] {
      _id,
      title,
      isActive,
      aboutSection,
      hostsSection {
        enabled,
        title,
        layout,
        "hosts": hosts[]-> {
          _id,
          name,
          slug,
          bio,
          "photo": photo.asset->{url},
          twitter,
          website,
          linkedin
        }
      },
      missionSection,
      subscribeCTA,
      communitySection,
      customSections
    }`;

    try {
      const config = await client.fetch(query);

      if (!config) {
        console.warn('No active about page config found in Sanity CMS.');
        return undefined;
      }

      return config;
    } catch (error) {
      console.error('Failed to fetch about page config from Sanity:', error);
      return undefined;
    }
  });
}
