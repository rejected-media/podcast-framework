/**
 * Generic RSS feed parser
 */

import Parser from 'rss-parser';
import type { ParsedRSSFeed, RSSAdapter } from './types';
import { ImportLogger } from './logger';

export class RSSFeedParser {
  private parser: Parser;
  private logger: ImportLogger;

  constructor(logger: ImportLogger) {
    this.parser = new Parser({
      customFields: {
        feed: ['itunes:author', 'itunes:image', 'itunes:category', 'itunes:keywords', 'itunes:explicit', 'podcast:guid'],
        item: ['itunes:episode', 'itunes:duration', 'itunes:image', 'itunes:explicit', 'itunes:keywords', 'enclosure'],
      },
    });
    this.logger = logger;
  }

  /**
   * Fetch and parse RSS feed using provided adapter
   */
  async parseFeed(feedUrl: string, adapter: RSSAdapter): Promise<ParsedRSSFeed> {
    this.logger.info(`Fetching RSS feed from: ${feedUrl}`);

    try {
      // Fetch and parse the feed
      const rawFeed = await this.parser.parseURL(feedUrl);

      this.logger.info(`Successfully fetched feed: ${rawFeed.title}`);
      this.logger.info(`Total episodes in feed: ${rawFeed.items?.length || 0}`);

      // Use adapter to parse show metadata and episodes
      const show = adapter.parseShowMetadata(rawFeed);
      const episodes = adapter.parseEpisodes(rawFeed);

      this.logger.info(`Parsed show metadata for: ${show.title}`);
      this.logger.info(`Parsed ${episodes.length} episodes`);

      return {
        show,
        episodes,
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse RSS feed: ${error.message}`, error);
      throw new Error(`Failed to parse RSS feed: ${error.message}`);
    }
  }
}
