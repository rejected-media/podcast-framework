/**
 * Contribution Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { baseContributionSchema, extendContributionSchema } from './contribution';

describe('baseContributionSchema', () => {
  it('should have correct name and type', () => {
    expect(baseContributionSchema.name).toBe('contribution');
    expect(baseContributionSchema.type).toBe('document');
  });

  it('should have contributionType field with options', () => {
    const typeField = baseContributionSchema.fields.find(f => f.name === 'contributionType');

    expect(typeField).toBeDefined();
    expect(typeField?.type).toBe('string');
  });

  it('should have status field with workflow states', () => {
    const statusField = baseContributionSchema.fields.find(f => f.name === 'status');

    expect(statusField).toBeDefined();
    expect(statusField?.type).toBe('string');
  });

  it('should have all required fields', () => {
    const fieldNames = baseContributionSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('contributionType');
    expect(fieldNames).toContain('submittedAt');
    expect(fieldNames).toContain('status');
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('description');
  });

  it('should have optional submitter info', () => {
    const fieldNames = baseContributionSchema.fields.map(f => f.name);

    expect(fieldNames).toContain('submitterName');
    expect(fieldNames).toContain('submitterEmail');
  });

  it('should have preview configuration', () => {
    expect(baseContributionSchema.preview).toBeDefined();
  });
});

describe('extendContributionSchema', () => {
  it('should add custom fields', () => {
    const extended = extendContributionSchema([
      { name: 'priority', title: 'Priority', type: 'number' }
    ]);

    const fieldNames = extended.fields.map((f: any) => f.name);

    expect(fieldNames).toContain('priority');
    expect(fieldNames).toContain('contributionType'); // Base field
  });
});
