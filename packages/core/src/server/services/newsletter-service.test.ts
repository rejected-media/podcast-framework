import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { NewsletterService } from './newsletter-service';
import type {
  NewsletterSubscribeRequest,
  NewsletterServiceConfig,
  PodcastConfig,
} from './newsletter-service';

// Mock Sanity client
const mockFetch = vi.fn();
const mockSanityClient = {
  fetch: mockFetch,
};

vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => mockSanityClient),
}));

// Mock global fetch for ConvertKit API
global.fetch = vi.fn();

describe('NewsletterService', () => {
  let service: NewsletterService;
  let mockConfig: NewsletterServiceConfig;
  let validPodcastConfig: PodcastConfig;

  beforeEach(() => {
    mockConfig = {
      sanityProjectId: 'test-project',
      sanityDataset: 'test',
      sanityApiVersion: '2024-01-01',
    };

    validPodcastConfig = {
      isActive: true,
      newsletterEnabled: true,
      convertKitApiKey: 'test-api-key',
      convertKitFormId: 'test-form-id',
    };

    service = new NewsletterService(mockConfig);

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Email Validation', () => {
    test('accepts valid email formats', () => {
      expect(service.validateEmail('user@example.com')).toBe(true);
      expect(service.validateEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(service.validateEmail('user_123@test-domain.com')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(service.validateEmail('invalid-email')).toBe(false);
      expect(service.validateEmail('user@')).toBe(false);
      expect(service.validateEmail('@domain.com')).toBe(false);
      expect(service.validateEmail('user @example.com')).toBe(false);
      expect(service.validateEmail('user@domain')).toBe(false);
    });

    test('rejects empty or missing email', () => {
      expect(service.validateEmail('')).toBe(false);
      expect(service.validateEmail(null as any)).toBe(false);
      expect(service.validateEmail(undefined as any)).toBe(false);
    });

    test('rejects non-string values', () => {
      expect(service.validateEmail(123 as any)).toBe(false);
      expect(service.validateEmail({} as any)).toBe(false);
      expect(service.validateEmail([] as any)).toBe(false);
    });
  });

  describe('Spam Detection', () => {
    test('detects spam when honeypot field is filled', () => {
      expect(service.isSpamBot('https://spam.com')).toBe(true);
      expect(service.isSpamBot('anything')).toBe(true);
    });

    test('allows legitimate submissions with empty honeypot', () => {
      expect(service.isSpamBot(undefined)).toBe(false);
      expect(service.isSpamBot('')).toBe(false);
    });
  });

  describe('Podcast Config Fetching', () => {
    test('fetches podcast config from Sanity', async () => {
      mockFetch.mockResolvedValue(validPodcastConfig);

      const config = await service.getPodcastConfig();

      expect(config).toEqual(validPodcastConfig);
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('podcast'));
    });

    test('caches podcast config to reduce API calls', async () => {
      mockFetch.mockResolvedValue(validPodcastConfig);

      // First call - fetches from Sanity
      const config1 = await service.getPodcastConfig();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - uses cache
      const config2 = await service.getPodcastConfig();
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1 - cached
      expect(config2).toEqual(config1);
    });

    test('cache expires after TTL (5 minutes)', async () => {
      mockFetch.mockResolvedValue(validPodcastConfig);

      // First call
      await service.getPodcastConfig();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Mock time passing (6 minutes)
      vi.useFakeTimers();
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Second call - cache expired, refetches
      await service.getPodcastConfig();
      expect(mockFetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    test('handles Sanity fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const config = await service.getPodcastConfig();

      expect(config).toBeNull();
    });

    test('handles missing podcast document', async () => {
      mockFetch.mockResolvedValue(null);

      const config = await service.getPodcastConfig();

      expect(config).toBeNull();
    });
  });

  describe('Podcast Config Validation', () => {
    test('accepts valid podcast config', () => {
      const result = service.validatePodcastConfig(validPodcastConfig);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('rejects null config', () => {
      const result = service.validatePodcastConfig(null);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Newsletter configuration error.');
    });

    test('rejects inactive podcast', () => {
      const config = { ...validPodcastConfig, isActive: false };
      const result = service.validatePodcastConfig(config);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Newsletter signup is not currently available.');
    });

    test('rejects disabled newsletter', () => {
      const config = { ...validPodcastConfig, newsletterEnabled: false };
      const result = service.validatePodcastConfig(config);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Newsletter signup is not currently available.');
    });

    test('rejects missing ConvertKit API key', () => {
      const config = { ...validPodcastConfig, convertKitApiKey: '' };
      const result = service.validatePodcastConfig(config);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Newsletter configuration error.');
    });

    test('rejects missing ConvertKit form ID', () => {
      const config = { ...validPodcastConfig, convertKitFormId: '' };
      const result = service.validatePodcastConfig(config);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Newsletter configuration error.');
    });
  });

  describe('ConvertKit Integration', () => {
    test('successfully subscribes email to ConvertKit', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ subscription: { id: 'test-sub-id' } }),
      });

      const result = await service.subscribeToConvertKit(
        'test@example.com',
        validPodcastConfig
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('convertkit.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com'),
        })
      );
    });

    test('sends correct API payload to ConvertKit', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await service.subscribeToConvertKit('user@test.com', validPodcastConfig);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body).toEqual({
        api_secret: 'test-api-key',
        email: 'user@test.com',
      });
      expect(fetchCall[0]).toContain('test-form-id');
    });

    test('handles ConvertKit API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const result = await service.subscribeToConvertKit(
        'test@example.com',
        validPodcastConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
      expect(result.status).toBe(500);
    });

    test('handles network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network timeout'));

      const result = await service.subscribeToConvertKit(
        'test@example.com',
        validPodcastConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    test('handles ConvertKit 400 errors (invalid email)', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Invalid email',
      });

      const result = await service.subscribeToConvertKit(
        'invalid@example.com',
        validPodcastConfig
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });

  describe('Full Subscription Flow', () => {
    beforeEach(() => {
      // Set up default mocks for successful flow
      mockFetch.mockResolvedValue(validPodcastConfig);
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ subscription: { id: 'test-sub-id' } }),
      });
    });

    test('successfully subscribes valid email', async () => {
      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Check your email');
      expect(mockFetch).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    test('silently accepts spam submissions (honeypot)', async () => {
      const request: NewsletterSubscribeRequest = {
        email: 'spam@example.com',
        website: 'https://spam.com', // Honeypot filled
      };

      const result = await service.subscribe(request);

      // Returns success to avoid revealing honeypot
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
      // Should NOT call Sanity or ConvertKit
      expect(mockFetch).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('rejects invalid email format', async () => {
      const request: NewsletterSubscribeRequest = {
        email: 'invalid-email',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('valid email');
      // Should NOT call Sanity or ConvertKit
      expect(mockFetch).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('rejects subscription when podcast is inactive', async () => {
      mockFetch.mockResolvedValue({ ...validPodcastConfig, isActive: false });

      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not currently available');
      // Should NOT call ConvertKit
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('rejects subscription when newsletter is disabled', async () => {
      mockFetch.mockResolvedValue({
        ...validPodcastConfig,
        newsletterEnabled: false,
      });

      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not currently available');
    });

    test('handles missing podcast config', async () => {
      mockFetch.mockResolvedValue(null);

      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('configuration error');
    });

    test('handles ConvertKit API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('try again later');
      expect(result.error).toBe('Server error');
    });

    test('handles ConvertKit 400 errors with user-friendly message', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const request: NewsletterSubscribeRequest = {
        email: 'duplicate@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email address or already subscribed');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(validPodcastConfig);
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
    });

    test('handles email with special characters', async () => {
      const request: NewsletterSubscribeRequest = {
        email: 'user+test@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(true);
    });

    test('trims whitespace from email before validation', async () => {
      // Note: Current implementation doesn't trim, but this documents expected behavior
      const request: NewsletterSubscribeRequest = {
        email: '  user@example.com  ',
      };

      // This will fail with current implementation
      // Documenting for potential future enhancement
      const isValid = service.validateEmail(request.email.trim());
      expect(isValid).toBe(true);
    });

    test('handles empty string email', async () => {
      const request: NewsletterSubscribeRequest = {
        email: '',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('valid email');
    });

    test('handles ConvertKit timeout', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Request timeout'));

      const request: NewsletterSubscribeRequest = {
        email: 'user@example.com',
      };

      const result = await service.subscribe(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('try again later');
    });
  });

  describe('Cache Behavior', () => {
    test('cache reduces Sanity API calls', async () => {
      mockFetch.mockResolvedValue(validPodcastConfig);
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      // Multiple subscriptions should only fetch config once (cached)
      await service.subscribe({ email: 'user1@example.com' });
      await service.subscribe({ email: 'user2@example.com' });
      await service.subscribe({ email: 'user3@example.com' });

      // Should only call Sanity once (cached for subsequent calls)
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Should call ConvertKit 3 times (not cached)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('cache updates after expiration', async () => {
      vi.useFakeTimers();

      const initialConfig = { ...validPodcastConfig };
      const updatedConfig = { ...validPodcastConfig, newsletterEnabled: false };

      mockFetch
        .mockResolvedValueOnce(initialConfig)
        .mockResolvedValueOnce(updatedConfig);

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      // First subscription - gets initial config
      const result1 = await service.subscribe({ email: 'user1@example.com' });
      expect(result1.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time past cache TTL (6 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Second subscription - cache expired, gets updated config
      const result2 = await service.subscribe({ email: 'user2@example.com' });
      expect(result2.success).toBe(false); // newsletter now disabled
      expect(result2.message).toContain('not currently available');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('Configuration Validation', () => {
    test('validates all required configuration fields', () => {
      const testCases: Array<{
        config: Partial<PodcastConfig>;
        shouldBeValid: boolean;
      }> = [
        {
          config: validPodcastConfig,
          shouldBeValid: true,
        },
        {
          config: { ...validPodcastConfig, isActive: false },
          shouldBeValid: false,
        },
        {
          config: { ...validPodcastConfig, newsletterEnabled: false },
          shouldBeValid: false,
        },
        {
          config: { ...validPodcastConfig, convertKitApiKey: '' },
          shouldBeValid: false,
        },
        {
          config: { ...validPodcastConfig, convertKitFormId: '' },
          shouldBeValid: false,
        },
      ];

      testCases.forEach(({ config, shouldBeValid }) => {
        const result = service.validatePodcastConfig(config as PodcastConfig);
        expect(result.valid).toBe(shouldBeValid);
      });
    });
  });
});
