import { createClient } from "@sanity/client";
import type { SanityClient } from "@sanity/client";

/**
 * Newsletter Service
 *
 * Pure business logic for newsletter subscription functionality.
 * Provider-agnostic - works with any serverless platform.
 *
 * Responsibilities:
 * - Email validation
 * - Podcast config validation
 * - ConvertKit API integration
 * - Business rules (active podcast, newsletter enabled)
 */

export interface NewsletterSubscribeRequest {
  email: string;
  website?: string; // Honeypot field
}

export interface NewsletterSubscribeResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface PodcastConfig {
  isActive: boolean;
  newsletterEnabled: boolean;
  convertKitApiKey: string;
  convertKitFormId: string;
}

export interface NewsletterServiceConfig {
  sanityProjectId: string;
  sanityDataset: string;
  sanityApiVersion?: string;
}

/**
 * Newsletter service for managing email subscriptions
 */
export class NewsletterService {
  private sanityClient: SanityClient;
  private podcastConfigCache: {
    data: PodcastConfig | null;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: NewsletterServiceConfig) {
    this.sanityClient = createClient({
      projectId: config.sanityProjectId,
      dataset: config.sanityDataset,
      apiVersion: config.sanityApiVersion || "2024-01-01",
      useCdn: true, // Read-only, can use CDN
    });
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check honeypot field (spam detection)
   * Returns true if request is from a bot
   */
  isSpamBot(website?: string): boolean {
    return !!website;
  }

  /**
   * Fetch podcast configuration from Sanity (with caching)
   */
  async getPodcastConfig(): Promise<PodcastConfig | null> {
    const now = Date.now();

    // Return cached config if still valid
    if (
      this.podcastConfigCache &&
      (now - this.podcastConfigCache.timestamp) < this.CACHE_TTL
    ) {
      return this.podcastConfigCache.data;
    }

    try {
      const podcast = await this.sanityClient.fetch<PodcastConfig>(
        `*[_type == "podcast"][0]{
          isActive,
          newsletterEnabled,
          convertKitApiKey,
          convertKitFormId
        }`
      );

      this.podcastConfigCache = {
        data: podcast,
        timestamp: now,
      };

      return podcast;
    } catch (error) {
      console.error("Failed to fetch podcast config from Sanity:", error);
      return null;
    }
  }

  /**
   * Validate podcast configuration
   */
  validatePodcastConfig(config: PodcastConfig | null): {
    valid: boolean;
    reason?: string;
  } {
    if (!config) {
      return { valid: false, reason: "Newsletter configuration error." };
    }

    if (!config.isActive) {
      return { valid: false, reason: "Newsletter signup is not currently available." };
    }

    if (!config.newsletterEnabled) {
      return { valid: false, reason: "Newsletter signup is not currently available." };
    }

    if (!config.convertKitApiKey || !config.convertKitFormId) {
      return { valid: false, reason: "Newsletter configuration error." };
    }

    return { valid: true };
  }

  /**
   * Subscribe email to ConvertKit
   */
  async subscribeToConvertKit(
    email: string,
    config: PodcastConfig
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      const response = await fetch(
        `https://api.convertkit.com/v3/forms/${config.convertKitFormId}/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_secret: config.convertKitApiKey,
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ConvertKit API error:", response.status, errorText);

        return {
          success: false,
          error: errorText,
          status: response.status,
        };
      }

      const result = await response.json();
      console.log("ConvertKit subscription successful:", result);

      return { success: true };
    } catch (error) {
      console.error("ConvertKit request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Main subscription handler
   * Pure business logic - no HTTP concerns
   */
  async subscribe(
    request: NewsletterSubscribeRequest
  ): Promise<NewsletterSubscribeResult> {
    // 1. Check honeypot (spam detection)
    if (this.isSpamBot(request.website)) {
      // Return success to avoid revealing honeypot
      return {
        success: true,
        message: "Success",
      };
    }

    // 2. Validate email format
    if (!this.validateEmail(request.email)) {
      return {
        success: false,
        message: "Please provide a valid email address.",
      };
    }

    // 3. Fetch podcast configuration
    const podcastConfig = await this.getPodcastConfig();

    // 4. Validate podcast configuration
    const configValidation = this.validatePodcastConfig(podcastConfig);
    if (!configValidation.valid) {
      return {
        success: false,
        message: configValidation.reason!,
      };
    }

    // 5. Subscribe to ConvertKit
    const subscribeResult = await this.subscribeToConvertKit(
      request.email,
      podcastConfig!
    );

    if (!subscribeResult.success) {
      // Handle specific ConvertKit errors
      if (subscribeResult.status === 400) {
        return {
          success: false,
          message: "Invalid email address or already subscribed.",
        };
      }

      return {
        success: false,
        message: "Unable to process subscription. Please try again later.",
        error: subscribeResult.error,
      };
    }

    // 6. Success
    return {
      success: true,
      message: "Success! Check your email to confirm your subscription.",
    };
  }
}
