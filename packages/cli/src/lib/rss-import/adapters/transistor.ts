/**
 * Transistor RSS feed adapter
 * https://transistor.fm
 */

import { BaseRSSAdapter } from './base';
import type { ParsedShowMetadata, ParsedEpisode } from '../types';

export class TransistorAdapter extends BaseRSSAdapter {
  readonly name = 'Transistor';

  canHandle(feedUrl: string): boolean {
    return feedUrl.includes('feeds.transistor.fm');
  }

  parseShowMetadata(rawFeed: any): ParsedShowMetadata {
    // Extract iTunes/podcast specific fields
    const itunesAuthor = rawFeed['itunes:author'];
    const itunesImage = rawFeed['itunes:image']?.href || rawFeed.image?.url;
    const podcastGuid = rawFeed['podcast:guid'];

    // Extract categories
    const categories: string[] = [];
    if (rawFeed['itunes:category']) {
      const cats = Array.isArray(rawFeed['itunes:category'])
        ? rawFeed['itunes:category']
        : [rawFeed['itunes:category']];

      cats.forEach((cat: any) => {
        if (typeof cat === 'string') {
          categories.push(cat);
        } else if (cat.$.text) {
          categories.push(cat.$.text);
        }
      });
    }

    // Extract keywords
    const keywords = rawFeed['itunes:keywords']?.split(',').map((k: string) => k.trim()) || [];

    return {
      title: rawFeed.title || '',
      description: this.stripHtml(rawFeed.description) || '',
      author: itunesAuthor?.['#text'] || itunesAuthor || rawFeed.author,
      copyright: rawFeed.copyright,
      language: rawFeed.language,
      imageUrl: itunesImage,
      websiteUrl: rawFeed.link,
      categories,
      keywords,
      explicit: rawFeed['itunes:explicit'] === 'yes',
      guid: podcastGuid,
    };
  }

  parseEpisodes(rawFeed: any): ParsedEpisode[] {
    if (!rawFeed.items || !Array.isArray(rawFeed.items)) {
      return [];
    }

    return rawFeed.items
      .filter((item: any) => item.guid) // Must have GUID
      .map((item: any) => this.parseEpisode(item))
      .filter((episode: ParsedEpisode | null): episode is ParsedEpisode => episode !== null);
  }

  private parseEpisode(item: any): ParsedEpisode | null {
    // Extract enclosure (audio file)
    const enclosure = item.enclosure;
    if (!enclosure || !enclosure.url) {
      // Skip items without audio
      return null;
    }

    // Extract iTunes episode number
    const itunesEpisode = item['itunes:episode'] ? parseInt(item['itunes:episode'], 10) : undefined;
    const episodeNumber = this.extractEpisodeNumber(item.title || '', itunesEpisode);

    // Extract duration
    const itunesDuration = item['itunes:duration'];
    const duration = this.parseDuration(itunesDuration);

    // Extract image
    const itunesImage = item['itunes:image']?.href;

    // Extract keywords
    const keywords = item['itunes:keywords']?.split(',').map((k: string) => k.trim()) || [];

    return {
      title: item.title || '',
      guid: item.guid || item.id,
      episodeNumber,
      publishDate: this.parseDate(item.pubDate || item.isoDate),
      audioUrl: enclosure.url,
      audioFileSize: enclosure.length ? parseInt(enclosure.length, 10) : undefined,
      duration,
      description: this.stripHtml(item.content || item['content:encoded'] || item.description),
      summary: this.stripHtml(item.contentSnippet || item.summary),
      imageUrl: itunesImage,
      explicit: item['itunes:explicit'] === 'yes',
      keywords,
      author: item['itunes:author'] || item.creator,
    };
  }
}
