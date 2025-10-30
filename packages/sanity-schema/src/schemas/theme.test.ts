/**
 * Theme Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseThemeSchema, extendThemeSchema } from './theme';

describe('baseThemeSchema', () => {
  it('should have correct name and type', () => {
    expect(baseThemeSchema.name).toBe('theme');
    expect(baseThemeSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = baseThemeSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).toContain('colors');
    expect(fieldNames).toContain('typography');
    expect(fieldNames).toContain('layout');
  });

  it('should have colors object with all required color fields', () => {
    const colorsField = baseThemeSchema.fields.find(f => f.name === 'colors');
    expect(colorsField).toBeDefined();
    expect(colorsField?.type).toBe('object');

    const colorFieldNames = (colorsField as any).fields.map((f: any) => f.name);
    expect(colorFieldNames).toContain('primary');
    expect(colorFieldNames).toContain('secondary');
    expect(colorFieldNames).toContain('accent');
    expect(colorFieldNames).toContain('background');
    expect(colorFieldNames).toContain('surface');
    expect(colorFieldNames).toContain('text');
    expect(colorFieldNames).toContain('textMuted');
    expect(colorFieldNames).toContain('headerBg');
    expect(colorFieldNames).toContain('headerText');
    expect(colorFieldNames).toContain('footerBg');
    expect(colorFieldNames).toContain('footerText');
  });

  it('should have layout object with required fields', () => {
    const layoutField = baseThemeSchema.fields.find(f => f.name === 'layout');
    expect(layoutField).toBeDefined();
    expect(layoutField?.type).toBe('object');

    const layoutFieldNames = (layoutField as any).fields.map((f: any) => f.name);
    expect(layoutFieldNames).toContain('borderRadius');
    expect(layoutFieldNames).toContain('spacing');
  });

  it('should use isActive not active (Issue #13 fix)', () => {
    const fieldNames = baseThemeSchema.fields.map(f => f.name);
    expect(fieldNames).toContain('isActive');
    expect(fieldNames).not.toContain('active');
  });

  it('should have preview configuration', () => {
    expect(baseThemeSchema.preview).toBeDefined();
    expect(baseThemeSchema.preview?.select?.title).toBe('title');
    expect(baseThemeSchema.preview?.select?.active).toBe('isActive');
  });
});

describe('extendThemeSchema', () => {
  it('should add custom fields', () => {
    const extended = extendThemeSchema([
      { name: 'darkMode', title: 'Dark Mode', type: 'boolean' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('title'); // Base field
    expect(fieldNames).toContain('darkMode'); // Custom field
  });

  it('should preserve base field count', () => {
    const extended = extendThemeSchema([
      { name: 'customField', title: 'Custom', type: 'string' }
    ]);

    expect(extended.fields.length).toBe(baseThemeSchema.fields.length + 1);
  });
});
