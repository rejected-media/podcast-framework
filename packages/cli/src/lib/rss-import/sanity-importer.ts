/**
 * Sanity importer - handles creating/updating Sanity documents from parsed RSS data
 */

import type { SanityClient } from '@sanity/client';
import type {
  ParsedShowMetadata,
  ParsedEpisode,
  ShowImportResult,
  EpisodeImportResult,
  ImportOptions,
} from './types';
import { ImportLogger } from './logger';
import { ImageHandler } from './image-handler';

export class SanityImporter {
  private client: SanityClient;
  private logger: ImportLogger;
  private imageHandler: ImageHandler;
  private options: ImportOptions;

  constructor(client: SanityClient, logger: ImportLogger, options: ImportOptions) {
    this.client = client;
    this.logger = logger;
    this.imageHandler = new ImageHandler(client, logger);
    this.options = options;
  }

  /**
   * Import or update show metadata
   */
  async importShow(show: ParsedShowMetadata): Promise<ShowImportResult> {
    try {
      this.logger.info(`Importing show metadata: ${show.title}`);

      // Check if podcast document already exists
      const existing = await this.client.fetch(`*[_type == "podcast"][0]`);

      if (existing && !this.options.updateExisting) {
        this.logger.warn(`Podcast document already exists. Skipping show import.`);
        return {
          success: true,
          sanityId: existing._id,
          updated: false,
        };
      }

      // Upload logo if provided
      let logoImage;
      if (show.imageUrl && !this.options.skipImages) {
        try {
          logoImage = await this.imageHandler.uploadImageFromUrl(show.imageUrl, `${show.title}-logo.jpg`);
        } catch (error: any) {
          this.logger.warn(`Failed to upload show logo, continuing without it: ${error.message}`);
        }
      }

      // Prepare podcast document
      const podcastDoc = {
        _type: 'podcast',
        name: show.title,
        tagline: '', // Can be set manually later
        description: show.description,
        logo: logoImage,
        isActive: true,
        // Note: Platform links, social links, etc. should be set manually
      };

      if (this.options.dryRun) {
        this.logger.info('Dry run: Would create/update podcast document');
        return {
          success: true,
          created: !existing,
          updated: !!existing,
        };
      }

      // Create or update
      let result;
      if (existing) {
        result = await this.client.patch(existing._id).set(podcastDoc).commit();
        this.logger.info(`Updated podcast document: ${result._id}`);
        return {
          success: true,
          sanityId: result._id,
          updated: true,
        };
      } else {
        result = await this.client.create(podcastDoc);
        this.logger.info(`Created podcast document: ${result._id}`);
        return {
          success: true,
          sanityId: result._id,
          created: true,
        };
      }
    } catch (error: any) {
      this.logger.error(`Failed to import show: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Import a single episode
   */
  async importEpisode(episode: ParsedEpisode): Promise<EpisodeImportResult> {
    try {
      this.logger.info(`Importing episode: ${episode.title}`);

      // Check for existing episode by GUID
      const existing = await this.client.fetch(
        `*[_type == "episode" && rssGuid == $guid][0]`,
        { guid: episode.guid }
      );

      if (existing && !this.options.updateExisting) {
        this.logger.info(`Episode already exists (GUID: ${episode.guid}). Skipping.`);
        return {
          success: true,
          episodeTitle: episode.title,
          episodeGuid: episode.guid,
          sanityId: existing._id,
          skipped: true,
          skipReason: 'Already exists',
        };
      }

      // Upload cover image if provided
      let coverImage;
      if (episode.imageUrl && !this.options.skipImages) {
        try {
          coverImage = await this.imageHandler.uploadImageFromUrl(
            episode.imageUrl,
            `episode-${episode.episodeNumber || 'unknown'}-cover.jpg`
          );
        } catch (error: any) {
          this.logger.warn(`Failed to upload episode cover, continuing without it: ${error.message}`);
        }
      }

      // Generate slug from title
      const slug = this.generateSlug(episode.title);

      // Convert duration from seconds to HH:MM:SS format
      const durationFormatted = episode.duration ? this.formatDuration(episode.duration) : undefined;

      // Prepare episode document
      const episodeDoc: any = {
        _type: 'episode',
        title: episode.title,
        slug: {
          _type: 'slug',
          current: slug,
        },
        episodeNumber: episode.episodeNumber,
        publishDate: episode.publishDate.toISOString().split('T')[0], // YYYY-MM-DD
        duration: durationFormatted,
        description: episode.description || episode.summary || '',
        audioUrl: episode.audioUrl,
        rssGuid: episode.guid,
        coverImage,
        featured: false,
      };

      if (this.options.dryRun) {
        this.logger.info('Dry run: Would create/update episode document');
        return {
          success: true,
          episodeTitle: episode.title,
          episodeGuid: episode.guid,
        };
      }

      // Create or update
      let result;
      if (existing) {
        result = await this.client.patch(existing._id).set(episodeDoc).commit();
        this.logger.info(`Updated episode: ${result._id}`);
        return {
          success: true,
          episodeTitle: episode.title,
          episodeGuid: episode.guid,
          sanityId: result._id,
        };
      } else {
        result = await this.client.create(episodeDoc);
        this.logger.info(`Created episode: ${result._id}`);
        return {
          success: true,
          episodeTitle: episode.title,
          episodeGuid: episode.guid,
          sanityId: result._id,
        };
      }
    } catch (error: any) {
      this.logger.error(`Failed to import episode "${episode.title}": ${error.message}`, error);
      return {
        success: false,
        episodeTitle: episode.title,
        episodeGuid: episode.guid,
        error: error.message,
      };
    }
  }

  /**
   * Import multiple episodes with progress tracking
   */
  async importEpisodes(episodes: ParsedEpisode[]): Promise<EpisodeImportResult[]> {
    this.logger.info(`Importing ${episodes.length} episodes...`);

    const results: EpisodeImportResult[] = [];

    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i];
      this.logger.info(`Processing episode ${i + 1}/${episodes.length}`);

      const result = await this.importEpisode(episode);
      results.push(result);

      // Brief delay to avoid rate limiting
      await this.delay(100);
    }

    return results;
  }

  /**
   * Generate URL-safe slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Format duration from seconds to HH:MM:SS or MM:SS
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
