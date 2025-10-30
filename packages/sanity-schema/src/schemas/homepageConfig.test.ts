/**
 * Homepage Config Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseHomepageConfigSchema, extendHomepageConfigSchema } from './homepageConfig';

describe('baseHomepageConfigSchema', () => {
  it('should have correct name and type', () => {
    expect(baseHomepageConfigSchema.name).toBe('homepageConfig');
    expect(baseHomepageConfigSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = baseHomepageConfigSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).toContain('hero');
    expect(fieldNames).toContain('featuredEpisodes');
    expect(fieldNames).toContain('recentEpisodes');
    expect(fieldNames).toContain('about');
    expect(fieldNames).toContain('newsletter');
    expect(fieldNames).toContain('customSections');
  });

  it('should use isActive not active (Issue #13 fix)', () => {
    const fieldNames = baseHomepageConfigSchema.fields.map(f => f.name);
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).not.toContain('active');
  });

  it('should have hero section with enabled flag', () => {
    const heroField = baseHomepageConfigSchema.fields.find(f => f.name === 'hero');
    expect(heroField).toBeDefined();
    expect(heroField?.type).toBe('object');

    const heroFieldNames = (heroField as any).fields.map((f: any) => f.name);
    expect(heroFieldNames).toContain('enabled');
  });

  it('should have preview configuration', () => {
    expect(baseHomepageConfigSchema.preview).toBeDefined();
    expect(baseHomepageConfigSchema.preview?.select?.title).toBe('title');
    expect(baseHomepageConfigSchema.preview?.select?.active).toBe('isActive');
  });
});

describe('extendHomepageConfigSchema', () => {
  it('should add custom fields', () => {
    const extended = extendHomepageConfigSchema([
      { name: 'seo', title: 'SEO Settings', type: 'object' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('title'); // Base field
    expect(fieldNames).toContain('seo'); // Custom field
  });

  it('should preserve base field count', () => {
    const extended = extendHomepageConfigSchema([
      { name: 'customField', title: 'Custom', type: 'string' }
    ]);

    expect(extended.fields.length).toBe(baseHomepageConfigSchema.fields.length + 1);
  });
});
