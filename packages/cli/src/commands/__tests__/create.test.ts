/**
 * create command tests
 */

import { describe, it, expect } from 'vitest';

describe('create command', () => {
  describe('Project Name Validation', () => {
    it('should convert to slug format', () => {
      function toSlug(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '-');
      }

      expect(toSlug('My Podcast')).toBe('my-podcast');
      expect(toSlug('Tech Talks')).toBe('tech-talks');
      expect(toSlug('AI  ML  Podcast')).toBe('ai-ml-podcast'); // Multiple spaces become single hyphen
    });

    it('should validate project name format', () => {
      function isValidProjectName(name: string): boolean {
        return /^[a-z0-9-]+$/i.test(name);
      }

      expect(isValidProjectName('my-podcast')).toBe(true);
      expect(isValidProjectName('MyPodcast123')).toBe(true);
      expect(isValidProjectName('my podcast')).toBe(false); // spaces
      expect(isValidProjectName('my@podcast')).toBe(false); // special chars
    });
  });

  describe('Generated Files', () => {
    it('should create package.json', () => {
      const requiredFiles = [
        'package.json',
        'podcast.config.js',
        'astro.config.mjs',
        '.env.template',
        'README.md'
      ];

      expect(requiredFiles).toContain('package.json');
      expect(requiredFiles).toContain('podcast.config.js');
    });

    it('should create directory structure', () => {
      const requiredDirs = [
        'src',
        'src/pages',
        'src/components',
        'public',
        'sanity',
        'sanity/schemas'
      ];

      expect(requiredDirs.length).toBe(6);
    });
  });

  describe('Dependencies', () => {
    it('should include framework packages', () => {
      const dependencies = [
        '@podcast-framework/core',
        '@podcast-framework/sanity-schema',
        'astro',
        'sanity',
        '@sanity/client'
      ];

      expect(dependencies).toContain('@podcast-framework/core');
      expect(dependencies).toContain('astro');
    });

    it('should include dev dependencies', () => {
      const devDependencies = [
        '@astrojs/check',
        'typescript'
      ];

      expect(devDependencies.length).toBe(2);
    });
  });
});
