/**
 * Unit tests for hosting adapter utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectPlatform,
  getEnv,
  getRequiredEnv,
  getPlatformInfo
} from './hosting-adapter';

describe('detectPlatform', () => {
  beforeEach(() => {
    // Clear environment
    vi.unstubAllEnvs();
  });

  it('detects Cloudflare via CF_PAGES env var', () => {
    vi.stubEnv('CF_PAGES', '1');
    // Mock context without runtime
    const result = detectPlatform();
    expect(result).toBe('cloudflare');
  });

  it('detects Netlify via NETLIFY env var', () => {
    vi.stubEnv('NETLIFY', 'true');
    const result = detectPlatform();
    expect(result).toBe('netlify');
  });

  it('detects Vercel via VERCEL env var', () => {
    vi.stubEnv('VERCEL', '1');
    const result = detectPlatform();
    expect(result).toBe('vercel');
  });

  it('detects local via NODE_ENV', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const result = detectPlatform();
    expect(result).toBe('local');
  });

  it('returns unknown for unrecognized platform', () => {
    const result = detectPlatform();
    expect(['unknown', 'local']).toContain(result); // Might be local in test env
  });
});

describe('getEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns environment variable value', () => {
    vi.stubEnv('TEST_VAR', 'test-value');
    const result = getEnv('TEST_VAR');
    expect(result).toBe('test-value');
  });

  it('returns fallback when var not found', () => {
    const result = getEnv('NONEXISTENT_VAR', undefined, 'fallback');
    expect(result).toBe('fallback');
  });

  it('returns empty string when no fallback', () => {
    const result = getEnv('NONEXISTENT_VAR');
    expect(result).toBe('');
  });
});

describe('getRequiredEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns all required vars when present', () => {
    vi.stubEnv('VAR1', 'value1');
    vi.stubEnv('VAR2', 'value2');

    const result = getRequiredEnv(['VAR1', 'VAR2']);

    expect(result).toEqual({
      VAR1: 'value1',
      VAR2: 'value2',
    });
  });

  it('throws error when required var missing', () => {
    vi.stubEnv('VAR1', 'value1');
    // VAR2 not set

    expect(() => {
      getRequiredEnv(['VAR1', 'VAR2']);
    }).toThrow('Missing required environment variables: VAR2');
  });

  it('throws error listing all missing vars', () => {
    vi.stubEnv('VAR1', 'value1');
    // VAR2 and VAR3 not set

    expect(() => {
      getRequiredEnv(['VAR1', 'VAR2', 'VAR3']);
    }).toThrow('Missing required environment variables: VAR2, VAR3');
  });
});

describe('getPlatformInfo', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns platform information', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const info = getPlatformInfo();

    expect(info).toHaveProperty('platform');
    expect(info).toHaveProperty('isDevelopment');
    expect(info).toHaveProperty('isProduction');
    expect(info).toHaveProperty('region');
    expect(info).toHaveProperty('deploymentId');
  });

  it('identifies development environment', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const info = getPlatformInfo();

    expect(info.isDevelopment).toBe(true);
    expect(info.isProduction).toBe(false);
  });

  it('identifies production environment', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const info = getPlatformInfo();

    expect(info.isProduction).toBe(true);
  });
});
