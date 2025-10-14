/**
 * Episode Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseEpisodeSchema, extendEpisodeSchema } from './episode';

describe('baseEpisodeSchema', () => {
  it('should have correct name and type', () => {
    expect(baseEpisodeSchema.name).toBe('episode');
    expect(baseEpisodeSchema.type).toBe('document');
  });

  it('should have title field as first field', () => {
    expect(baseEpisodeSchema.fields[0].name).toBe('title');
    expect(baseEpisodeSchema.fields[0].type).toBe('string');
  });

  it('should have all required core fields', () => {
    const fieldNames = baseEpisodeSchema.fields.map(f => f.name);

    // Core metadata
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('episodeNumber');
    expect(fieldNames).toContain('publishDate');
    expect(fieldNames).toContain('duration');
    expect(fieldNames).toContain('description');

    // People
    expect(fieldNames).toContain('hosts');
    expect(fieldNames).toContain('guests');

    // Platform links
    expect(fieldNames).toContain('spotifyLink');
    expect(fieldNames).toContain('applePodcastLink');
    expect(fieldNames).toContain('youtubeLink');

    // Transcripts
    expect(fieldNames).toContain('transcript');
    expect(fieldNames).toContain('transcriptSegments');

    // Media
    expect(fieldNames).toContain('coverImage');
    expect(fieldNames).toContain('featured');
  });

  it('should have orderings configured', () => {
    expect(baseEpisodeSchema.orderings).toBeDefined();
    expect(baseEpisodeSchema.orderings?.length).toBeGreaterThan(0);
  });

  it('should have preview configuration', () => {
    expect(baseEpisodeSchema.preview).toBeDefined();
    expect(baseEpisodeSchema.preview?.select).toBeDefined();
  });
});

describe('extendEpisodeSchema', () => {
  it('should add custom fields to base schema', () => {
    const extended = extendEpisodeSchema([
      {
        name: 'sponsor',
        title: 'Sponsor',
        type: 'string'
      }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    // Should have base field
    expect(fieldNames).toContain('title');

    // Should have custom field
    expect(fieldNames).toContain('sponsor');
  });

  it('should preserve all base fields', () => {
    const extended = extendEpisodeSchema([
      {
        name: 'customField',
        title: 'Custom',
        type: 'string'
      }
    ]);

    const baseFieldCount = baseEpisodeSchema.fields.length;
    const extendedFieldCount = extended.fields.length;

    expect(extendedFieldCount).toBe(baseFieldCount + 1);
  });

  it('should handle multiple custom fields', () => {
    const extended = extendEpisodeSchema([
      { name: 'sponsor', title: 'Sponsor', type: 'string' },
      { name: 'videoUrl', title: 'Video', type: 'url' },
      { name: 'rating', title: 'Rating', type: 'number' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('sponsor');
    expect(fieldNames).toContain('videoUrl');
    expect(fieldNames).toContain('rating');
  });

  it('should handle empty custom fields array', () => {
    const extended = extendEpisodeSchema([]);

    expect(extended.fields.length).toBe(baseEpisodeSchema.fields.length);
  });
});
