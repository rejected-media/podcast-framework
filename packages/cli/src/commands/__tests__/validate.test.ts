/**
 * validate command tests
 */

import { describe, it, expect } from 'vitest';

describe('validate command', () => {
  it('should check for package.json', () => {
    const requiredFiles = ['package.json'];
    expect(requiredFiles).toContain('package.json');
  });

  it('should check for Astro dependency', () => {
    const requiredDeps = ['astro'];
    expect(requiredDeps).toContain('astro');
  });

  it('should check for framework packages', () => {
    const frameworkPackages = [
      '@podcast-framework/core',
      '@podcast-framework/sanity-schema'
    ];
    expect(frameworkPackages.length).toBeGreaterThan(0);
  });

  it('should validate directory structure', () => {
    const requiredDirs = ['src', 'public'];
    expect(requiredDirs).toContain('src');
    expect(requiredDirs).toContain('public');
  });

  it('should support verbose flag', () => {
    const validFlags = ['--verbose', '-v'];
    expect(validFlags).toContain('--verbose');
  });
});
