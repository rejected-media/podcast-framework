/**
 * About Page Config Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseAboutPageConfigSchema, extendAboutPageConfigSchema } from './aboutPageConfig';

describe('baseAboutPageConfigSchema', () => {
  it('should have correct name and type', () => {
    expect(baseAboutPageConfigSchema.name).toBe('aboutPageConfig');
    expect(baseAboutPageConfigSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = baseAboutPageConfigSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).toContain('aboutSection');
    expect(fieldNames).toContain('hostsSection');
    expect(fieldNames).toContain('missionSection');
    expect(fieldNames).toContain('subscribeCTA');
    expect(fieldNames).toContain('communitySection');
    expect(fieldNames).toContain('customSections');
  });

  it('should use isActive not active (Issue #13 fix)', () => {
    const fieldNames = baseAboutPageConfigSchema.fields.map(f => f.name);
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).not.toContain('active');
  });

  it('should have hostsSection with layout options', () => {
    const hostsField = baseAboutPageConfigSchema.fields.find(f => f.name === 'hostsSection');
    expect(hostsField).toBeDefined();
    expect(hostsField?.type).toBe('object');

    const hostsFieldNames = (hostsField as any).fields.map((f: any) => f.name);
    expect(hostsFieldNames).toContain('enabled');
    expect(hostsFieldNames).toContain('layout');
    expect(hostsFieldNames).toContain('hosts');
  });

  it('should have preview configuration', () => {
    expect(baseAboutPageConfigSchema.preview).toBeDefined();
    expect(baseAboutPageConfigSchema.preview?.select?.title).toBe('title');
    expect(baseAboutPageConfigSchema.preview?.select?.active).toBe('isActive');
  });
});

describe('extendAboutPageConfigSchema', () => {
  it('should add custom fields', () => {
    const extended = extendAboutPageConfigSchema([
      { name: 'testimonials', title: 'Testimonials', type: 'array' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('title'); // Base field
    expect(fieldNames).toContain('testimonials'); // Custom field
  });

  it('should preserve base field count', () => {
    const extended = extendAboutPageConfigSchema([
      { name: 'customField', title: 'Custom', type: 'string' }
    ]);

    expect(extended.fields.length).toBe(baseAboutPageConfigSchema.fields.length + 1);
  });
});
