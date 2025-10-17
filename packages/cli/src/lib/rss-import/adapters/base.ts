/**
 * Base adapter implementation with helper methods
 */

import type { RSSAdapter, ParsedShowMetadata, ParsedEpisode } from '../types';

export abstract class BaseRSSAdapter implements RSSAdapter {
  abstract readonly name: string;

  abstract parseShowMetadata(rawFeed: any): ParsedShowMetadata;

  abstract parseEpisodes(rawFeed: any): ParsedEpisode[];

  abstract canHandle(feedUrl: string): boolean;

  /**
   * Helper: Parse duration string to seconds
   * Handles formats like "1:23:45", "45:30", "90"
   */
  protected parseDuration(duration: string | number | undefined): number | undefined {
    if (!duration) return undefined;

    // If already a number, assume it's seconds
    if (typeof duration === 'number') {
      return duration;
    }

    const parts = duration.split(':').map(p => parseInt(p, 10));

    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // SS
      return parts[0];
    }

    return undefined;
  }

  /**
   * Helper: Parse date string to Date object
   */
  protected parseDate(dateString: string | undefined): Date {
    if (!dateString) {
      return new Date();
    }
    return new Date(dateString);
  }

  /**
   * Helper: Extract episode number from title or explicit field
   * Handles patterns like "Episode 42", "#42", "Ep. 42", etc.
   */
  protected extractEpisodeNumber(title: string, explicitNumber?: number): number | undefined {
    if (explicitNumber !== undefined) {
      return explicitNumber;
    }

    // Try to extract from title
    const patterns = [
      /Episode\s+(\d+)/i,
      /Ep\.?\s*(\d+)/i,
      /#(\d+)/,
      /^(\d+)\s*[-:]/,
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return undefined;
  }

  /**
   * Helper: Clean HTML from text
   */
  protected stripHtml(html: string | undefined): string | undefined {
    if (!html) return undefined;
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
