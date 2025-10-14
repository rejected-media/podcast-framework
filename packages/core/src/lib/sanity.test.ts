/**
 * Sanity Utilities Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { createSanityClient, cachedFetch } from './sanity';

// Mock @sanity/client
vi.mock('@sanity/client', () => ({
  createClient: vi.fn((config) => ({
    fetch: vi.fn(),
    config
  }))
}));

describe('createSanityClient', () => {
  it('should throw error for missing projectId', () => {
    expect(() => createSanityClient({
      projectId: '',
      dataset: 'production'
    })).toThrow('Missing Sanity project ID');
  });

  it('should throw error for missing dataset', () => {
    expect(() => createSanityClient({
      projectId: 'test123',
      dataset: ''
    })).toThrow('Missing Sanity dataset');
  });

  it('should create client with valid config', () => {
    const client = createSanityClient({
      projectId: 'test123',
      dataset: 'production'
    });

    expect(client).toBeDefined();
    expect(client.config).toMatchObject({
      projectId: 'test123',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2024-01-01'
    });
  });

  it('should use custom apiVersion if provided', () => {
    const client = createSanityClient({
      projectId: 'test123',
      dataset: 'production',
      apiVersion: '2023-01-01'
    });

    expect(client.config.apiVersion).toBe('2023-01-01');
  });

  it('should include token if provided', () => {
    const client = createSanityClient({
      projectId: 'test123',
      dataset: 'production',
      token: 'secret-token'
    });

    expect(client.config.token).toBe('secret-token');
  });

  it('should disable CDN if specified', () => {
    const client = createSanityClient({
      projectId: 'test123',
      dataset: 'production',
      useCdn: false
    });

    expect(client.config.useCdn).toBe(false);
  });
});

describe('cachedFetch', () => {
  it('should call fetch function', async () => {
    const fetchFn = vi.fn().mockResolvedValue('test-data');

    const result = await cachedFetch('test-key', fetchFn);

    expect(result).toBe('test-data');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should handle async fetch function', async () => {
    const fetchFn = vi.fn(async () => {
      return new Promise(resolve => setTimeout(() => resolve('async-data'), 10));
    });

    const result = await cachedFetch('test-key-2', fetchFn);

    expect(result).toBe('async-data');
  });

  it('should handle fetch errors gracefully', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));

    await expect(cachedFetch('test-key-3', fetchFn)).rejects.toThrow('Fetch failed');
  });
});
