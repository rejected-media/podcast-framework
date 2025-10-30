/**
 * Podcast Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { basePodcastSchema, extendPodcastSchema } from './podcast';

describe('basePodcastSchema', () => {
  it('should have correct name and type', () => {
    expect(basePodcastSchema.name).toBe('podcast');
    expect(basePodcastSchema.type).toBe('document');
  });

  it('should have core metadata fields', () => {
    const fieldNames = basePodcastSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('tagline');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).toContain('logo');
    expect(fieldNames).toContain('favicon');
  });

  it('should have platform distribution fields', () => {
    const fieldNames = basePodcastSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('spotifyShowId');
    expect(fieldNames).toContain('spotifyUrl');
    expect(fieldNames).toContain('appleUrl');
    expect(fieldNames).toContain('youtubeUrl');
    expect(fieldNames).toContain('rssUrl');
  });

  it('should have social fields', () => {
    const fieldNames = basePodcastSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('twitterUrl');
    expect(fieldNames).toContain('discordUrl');
  });

  it('should have newsletter configuration', () => {
    const fieldNames = basePodcastSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('newsletterEnabled');
  });
});

describe('extendPodcastSchema', () => {
  it('should add custom fields', () => {
    const extended = extendPodcastSchema([
      { name: 'customDomain', title: 'Custom Domain', type: 'url' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('customDomain');
    expect(fieldNames).toContain('name'); // Base field
  });
});
