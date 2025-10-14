/**
 * Host Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseHostSchema, extendHostSchema } from './host';

describe('baseHostSchema', () => {
  it('should have correct name and type', () => {
    expect(baseHostSchema.name).toBe('host');
    expect(baseHostSchema.type).toBe('document');
  });

  it('should have all required fields', () => {
    const fieldNames = baseHostSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('bio');
    expect(fieldNames).toContain('photo');
    expect(fieldNames).toContain('twitter');
    expect(fieldNames).toContain('website');
    expect(fieldNames).toContain('linkedin');
  });

  it('should have same structure as guest schema', () => {
    // Host and Guest have identical fields (intentional design)
    expect(baseHostSchema.fields.length).toBe(7);
  });
});

describe('extendHostSchema', () => {
  it('should add custom fields', () => {
    const extended = extendHostSchema([
      { name: 'role', title: 'Role', type: 'string' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('role');
    expect(fieldNames).toContain('name'); // Base field preserved
  });
});
