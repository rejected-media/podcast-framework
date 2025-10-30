/**
 * Guest Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseGuestSchema, extendGuestSchema } from './guest';

describe('baseGuestSchema', () => {
  it('should have correct name and type', () => {
    expect(baseGuestSchema.name).toBe('guest');
    expect(baseGuestSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = baseGuestSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('bio');
    expect(fieldNames).toContain('photo');
    expect(fieldNames).toContain('twitter');
    expect(fieldNames).toContain('website');
    expect(fieldNames).toContain('linkedin');
  });

  it('should have preview configuration', () => {
    expect(baseGuestSchema.preview).toBeDefined();
    expect(baseGuestSchema.preview?.select?.title).toBe('name');
    expect(baseGuestSchema.preview?.select?.media).toBe('photo');
  });
});

describe('extendGuestSchema', () => {
  it('should add custom fields', () => {
    const extended = extendGuestSchema([
      { name: 'company', title: 'Company', type: 'string' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('name'); // Base field
    expect(fieldNames).toContain('company'); // Custom field
  });

  it('should preserve base field count', () => {
    const extended = extendGuestSchema([
      { name: 'customField', title: 'Custom', type: 'string' }
    ]);

    expect(extended.fields.length).toBe(baseGuestSchema.fields.length + 1);
  });
});
