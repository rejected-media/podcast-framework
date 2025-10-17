/**
 * Type definitions for RSS import functionality
 */

/**
 * Parsed RSS feed show metadata
 */
export interface ParsedShowMetadata {
  title: string;
  description: string;
  author?: string;
  copyright?: string;
  language?: string;
  imageUrl?: string;
  websiteUrl?: string;
  categories?: string[];
  keywords?: string[];
  explicit?: boolean;
  guid?: string;
}

/**
 * Parsed RSS feed episode data
 */
export interface ParsedEpisode {
  title: string;
  guid: string;
  episodeNumber?: number;
  publishDate: Date;
  audioUrl: string;
  audioFileSize?: number;
  duration?: number; // in seconds
  description?: string;
  summary?: string;
  imageUrl?: string;
  explicit?: boolean;
  keywords?: string[];
  author?: string;
}

/**
 * Result of parsing an RSS feed
 */
export interface ParsedRSSFeed {
  show: ParsedShowMetadata;
  episodes: ParsedEpisode[];
}

/**
 * Options for RSS import
 */
export interface ImportOptions {
  feedUrl: string;
  sanityProjectId: string;
  sanityDataset: string;
  sanityToken: string;
  dryRun?: boolean;
  skipImages?: boolean;
  updateExisting?: boolean;
}

/**
 * Result of importing a single episode
 */
export interface EpisodeImportResult {
  success: boolean;
  episodeTitle: string;
  episodeGuid: string;
  sanityId?: string;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

/**
 * Result of importing show metadata
 */
export interface ShowImportResult {
  success: boolean;
  sanityId?: string;
  error?: string;
  created?: boolean;
  updated?: boolean;
}

/**
 * Overall import result with statistics
 */
export interface ImportResult {
  show: ShowImportResult;
  episodes: EpisodeImportResult[];
  summary: {
    total: number;
    imported: number;
    skipped: number;
    failed: number;
  };
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
}

/**
 * Log entry for import process
 */
export interface ImportLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

/**
 * Base adapter interface for podcast host integrations
 */
export interface RSSAdapter {
  /**
   * Name of the podcast host (e.g., "Transistor", "Libsyn")
   */
  readonly name: string;

  /**
   * Parse the RSS feed and extract show metadata
   */
  parseShowMetadata(rawFeed: any): ParsedShowMetadata;

  /**
   * Parse the RSS feed and extract episodes
   */
  parseEpisodes(rawFeed: any): ParsedEpisode[];

  /**
   * Check if this adapter can handle the given feed URL
   */
  canHandle(feedUrl: string): boolean;
}
