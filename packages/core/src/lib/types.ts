/**
 * TypeScript type definitions for @podcast-framework/core
 *
 * These types are used throughout the framework and can be imported by podcasts
 */

/**
 * Theme configuration
 */
export interface Theme {
  colors: {
    primary: string;      // RGB values e.g., "59, 130, 246"
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    headerText: string;
    footerBg: string;
    footerText: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
  };
  layout: {
    borderRadius: string;  // Tailwind class e.g., "rounded-lg"
    spacing: string;
  };
}

/**
 * Episode
 */
export interface Episode {
  _id: string;
  _type: 'episode';
  title: string;
  slug: {
    current: string;
  };
  episodeNumber: number;
  publishDate: string;
  duration?: string;
  description: string;
  showNotes?: any[]; // Sanity block content
  coverImage?: {
    asset?: {
      url: string;
    };
  };
  guests?: Guest[];
  hosts?: Host[];
  transcript?: string;
  transcriptSegments?: TranscriptSegment[];
  spotifyLink?: string;
  applePodcastLink?: string;
  youtubeLink?: string;
  audioUrl?: string;
}

/**
 * Guest
 */
export interface Guest {
  _id: string;
  _type: 'guest';
  name: string;
  slug: {
    current: string;
  };
  bio?: string;
  photo?: {
    url: string;
  };
  twitter?: string;
  website?: string;
  linkedin?: string;
}

/**
 * Host
 */
export interface Host {
  _id: string;
  _type: 'host';
  name: string;
  bio?: string;
  photo?: {
    url: string;
  };
  twitter?: string;
  website?: string;
  linkedin?: string;
}

/**
 * Podcast Info
 */
export interface PodcastInfo {
  _id: string;
  _type: 'podcast';
  name: string;
  tagline?: string;
  description?: string;
  logo?: {
    url: string;
  };
  isActive: boolean;
  rssUrl?: string;
  spotifyShowId?: string;
  applePodcastsUrl?: string;
}

/**
 * Transcript Segment
 */
export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

/**
 * Navigation Item
 */
export interface NavigationItem {
  href: string;
  label: string;
  show?: boolean;
}

/**
 * Podcast Configuration (from podcast.config.js)
 */
export interface PodcastConfig {
  name: string;
  tagline?: string;
  description?: string;
  domain: string;
  url: string;
  sanity: {
    projectId: string;
    dataset: string;
    apiVersion: string;
  };
  features: {
    transcripts?: boolean;
    newsletter?: boolean;
    contributions?: boolean;
    search?: boolean;
    comments?: boolean;
    platformLinks?: {
      spotify?: boolean;
      apple?: boolean;
      youtube?: boolean;
      rss?: boolean;
    };
  };
  integrations?: {
    analytics?: {
      provider: 'google' | 'plausible' | 'none';
      measurementId?: string;
    };
    newsletter?: {
      provider: 'convertkit' | 'mailchimp' | 'none';
      apiKey?: string;
      formId?: string;
    };
  };
  theme?: string | Theme;
  seo?: {
    defaultImage?: string;
    twitterHandle?: string;
  };
}
