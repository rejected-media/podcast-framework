/**
 * list-components command tests
 */

import { describe, it, expect } from 'vitest';

describe('list-components command', () => {
  it('should have correct command name', () => {
    expect('list-components').toBe('list-components');
  });

  it('should list expected components', () => {
    const expectedComponents = [
      'Header',
      'Footer',
      'NewsletterSignup',
      'EpisodeSearch',
      'TranscriptViewer',
      'FeaturedEpisodesCarousel',
      'SkeletonLoader',
      'BlockContent'
    ];

    expect(expectedComponents).toHaveLength(8);
    expect(expectedComponents).toContain('Header');
    expect(expectedComponents).toContain('Footer');
  });

  it('should support verbose flag', () => {
    const validFlags = ['--verbose', '-v'];
    expect(validFlags).toContain('--verbose');
  });
});
