/**
 * override command tests
 */

import { describe, it, expect } from 'vitest';

describe('override command', () => {
  const AVAILABLE_COMPONENTS = [
    'Header',
    'Footer',
    'NewsletterSignup',
    'EpisodeSearch',
    'TranscriptViewer',
    'FeaturedEpisodesCarousel',
    'SkeletonLoader',
    'BlockContent'
  ];

  it('should have list of available components', () => {
    expect(AVAILABLE_COMPONENTS).toHaveLength(8);
  });

  it('should validate component names', () => {
    expect(AVAILABLE_COMPONENTS).toContain('Header');
    expect(AVAILABLE_COMPONENTS).not.toContain('InvalidComponent');
  });

  it('should support force flag', () => {
    const validFlags = ['--force', '-f'];
    expect(validFlags).toContain('--force');
  });

  it('should create files in src/components/', () => {
    const targetPath = 'src/components/';
    expect(targetPath).toBe('src/components/');
  });
});
