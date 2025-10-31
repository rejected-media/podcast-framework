/**
 * Hosting Platform Adapter
 *
 * Abstracts platform-specific differences between Cloudflare, Netlify, Vercel, etc.
 * Use these utilities instead of directly accessing environment variables or
 * platform-specific APIs.
 *
 * This abstraction layer enables:
 * - Easy migration between hosting providers
 * - Platform-agnostic code
 * - Reduced vendor lock-in
 *
 * @see templatization-plan-v2.1-FINAL.md - Hosting abstraction validated
 *
 * Note: Uses 'any' for context parameters to avoid type conflicts with different
 * Astro versions (astro is a peerDependency). Functions accept Astro's APIContext.
 */

import { formatError } from './error-formatter';

export type HostingPlatform = 'cloudflare' | 'netlify' | 'vercel' | 'local' | 'unknown';

/**
 * Detect which hosting platform we're running on
 *
 * @param context - Astro API context (optional)
 * @returns Platform identifier
 */
export function detectPlatform(context?: any): HostingPlatform {
  // Check Cloudflare-specific indicators
  if (typeof (globalThis as any).caches !== 'undefined') {
    return 'cloudflare';
  }

  // Check environment variables
  const env = getEnvironmentVariables(context);

  if (env.CF_PAGES === '1' || env.CF_PAGES_BRANCH) {
    return 'cloudflare';
  }

  if (env.NETLIFY === 'true' || env.NETLIFY_DEV === 'true') {
    return 'netlify';
  }

  if (env.VERCEL === '1' || env.VERCEL_ENV) {
    return 'vercel';
  }

  if (env.NODE_ENV === 'development') {
    return 'local';
  }

  return 'unknown';
}

/**
 * Get environment variables in a platform-agnostic way
 *
 * Different platforms expose env vars differently:
 * - Cloudflare: context.locals.runtime.env
 * - Netlify: process.env or import.meta.env
 * - Vercel: process.env or import.meta.env
 *
 * @param context - Astro API context (required for Cloudflare)
 * @returns Environment variables object
 */
export function getEnvironmentVariables(context?: any): Record<string, string> {
  // Cloudflare Pages Functions: env vars are in locals.runtime.env
  if (context?.locals && (context.locals as any).runtime?.env) {
    return (context.locals as any).runtime.env;
  }

  // Netlify, Vercel, Local: env vars are in import.meta.env or process.env
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env as any;
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env as any;
  }

  console.warn('[hosting-adapter] Unable to access environment variables');
  return {};
}

/**
 * Get a specific environment variable with fallback
 *
 * @param key - Environment variable name
 * @param context - Astro API context (optional, but required for Cloudflare)
 * @param fallback - Default value if not found
 * @returns Environment variable value or fallback
 *
 * @example
 * ```typescript
 * const apiKey = getEnv('API_KEY', context, 'default-key');
 * ```
 */
export function getEnv(key: string, context?: any, fallback?: string): string {
  const env = getEnvironmentVariables(context);
  return env[key] || fallback || '';
}

/**
 * Get all required environment variables with validation
 *
 * @param keys - Array of required environment variable names
 * @param context - Astro API context (optional, but required for Cloudflare)
 * @throws Error if any required variables are missing
 * @returns Object with all environment variables
 *
 * @example
 * ```typescript
 * const { API_KEY, API_SECRET } = getRequiredEnv(
 *   ['API_KEY', 'API_SECRET'],
 *   context
 * );
 * ```
 */
export function getRequiredEnv(
  keys: string[],
  context?: any
): Record<string, string> {
  const env = getEnvironmentVariables(context);
  const missing: string[] = [];
  const result: Record<string, string> = {};

  for (const key of keys) {
    if (!env[key]) {
      missing.push(key);
    } else {
      result[key] = env[key];
    }
  }

  if (missing.length > 0) {
    const errorMessage = formatError({
      title: 'Missing Required Environment Variables',
      description: `The following environment variables are required but not configured: ${missing.join(', ')}`,
      troubleshooting: [
        'Create a .env file in your project root if it doesn\'t exist',
        `Add the missing variables: ${missing.join(', ')}`,
        'Check .env.template for examples of all required variables',
        'Ensure environment variables are properly set in your hosting platform (Cloudflare Pages, Netlify, Vercel, etc.)',
        'Restart your dev server after adding environment variables',
      ],
      docsUrl: 'https://docs.rejected.media/podcast-framework/configuration',
      example: `# .env\n${missing.map(key => `${key}=your-value-here`).join('\n')}`,
    });
    throw new Error(errorMessage);
  }

  return result;
}

/**
 * Get client IP address (platform-agnostic)
 *
 * @param context - Astro API context
 * @returns Client IP address
 */
export function getClientIP(context: any): string {
  const { request, clientAddress } = context;

  // Cloudflare-specific headers
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Netlify, Vercel, general proxies
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  // Astro's built-in clientAddress
  return clientAddress || 'unknown';
}

/**
 * Get platform context information
 *
 * @param context - Astro API context
 * @returns Platform metadata
 */
export function getPlatformInfo(context?: any) {
  const platform = detectPlatform(context);
  const env = getEnvironmentVariables(context);

  return {
    platform,
    isDevelopment: platform === 'local' || env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    region: env.CF_PAGES_BRANCH || env.VERCEL_REGION || env.AWS_REGION || 'unknown',
    deploymentId:
      env.CF_PAGES_COMMIT_SHA ||
      env.VERCEL_GIT_COMMIT_SHA ||
      env.COMMIT_REF ||
      'unknown',
  };
}

/**
 * Platform-agnostic error logging
 *
 * Logs to console and optionally sends to Sentry if initialized.
 *
 * @param error - Error to log
 * @param context - Additional context data (tags, extra)
 * @param apiContext - Astro API context
 *
 * @example
 * ```typescript
 * import { logError } from '@podcast-framework/core';
 *
 * try {
 *   // ... some operation
 * } catch (error) {
 *   logError(error, {
 *     tags: { function: 'newsletter-subscribe', operation: 'submit' },
 *     extra: { email: userEmail }
 *   }, context);
 * }
 * ```
 */
export function logError(
  error: unknown,
  context?: Record<string, any>,
  apiContext?: any
) {
  const platform = detectPlatform(apiContext);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    platform,
    error: errorMessage,
    stack: errorStack,
    ...context,
  };

  // Console logging (always)
  if (platform === 'cloudflare' || platform === 'netlify') {
    // Cloudflare/Netlify: JSON structured logging
    console.error('[Error]', JSON.stringify(logData, null, 2));
  } else {
    // Default: object logging
    console.error('[Error]', logData);
  }

  // Sentry integration (optional, if initialized)
  // Import dynamically to avoid errors if @sentry/node not installed
  try {
    // Try to import Sentry utilities
    // This will only work if user has installed @sentry/node
    import('../server/sentry').then(({ isSentryInitialized, captureException: sentryCaptureException }) => {
      if (isSentryInitialized()) {
        sentryCaptureException(error, {
          tags: context?.tags,
          extra: context?.extra,
          level: context?.level || 'error',
        });
      }
    }).catch(() => {
      // Sentry not installed or initialized - that's fine, we already logged to console
    });
  } catch {
    // Sentry not available - that's fine
  }
}

/**
 * CORS Headers Configuration
 */
export interface CorsOptions {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Validate if origin is in allowed list
 *
 * @param origin - Request origin from headers
 * @param allowedOrigins - Array of allowed origins
 * @returns True if origin is allowed
 *
 * @example
 * ```typescript
 * const isAllowed = validateOrigin(
 *   request.headers.get('origin'),
 *   ['https://yourpodcast.com', 'http://localhost:4321']
 * );
 * ```
 */
export function validateOrigin(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers with origin validation
 *
 * Implements secure CORS by validating the request origin against an allowlist.
 * Falls back to the first allowed origin if the request origin is not allowed.
 *
 * @param requestOrigin - Origin from request headers
 * @param options - CORS configuration options
 * @returns CORS headers object
 *
 * @example
 * ```typescript
 * import { getCorsHeaders } from '@podcast-framework/core';
 *
 * export const POST: APIRoute = async ({ request }) => {
 *   const origin = request.headers.get('origin');
 *   const corsHeaders = getCorsHeaders(origin, {
 *     allowedOrigins: [
 *       'https://yourpodcast.com',
 *       'http://localhost:4321'
 *     ],
 *     allowedMethods: ['POST', 'OPTIONS'],
 *     credentials: true
 *   });
 *
 *   return new Response(JSON.stringify({ success: true }), {
 *     headers: corsHeaders
 *   });
 * };
 * ```
 *
 * @security
 * - Never use "*" for Access-Control-Allow-Origin in production
 * - Always validate against an explicit allowlist
 * - Be careful with credentials: true (requires specific origin)
 */
export function getCorsHeaders(
  requestOrigin: string | null,
  options: CorsOptions
): Record<string, string> {
  const {
    allowedOrigins,
    allowedMethods = ['GET', 'POST', 'OPTIONS'],
    allowedHeaders = ['Content-Type'],
    credentials = false,
    maxAge = 86400, // 24 hours
  } = options;

  // Validate origin against allowlist
  const isAllowed = validateOrigin(requestOrigin, allowedOrigins);
  const origin = isAllowed && requestOrigin ? requestOrigin : allowedOrigins[0];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Max-Age': maxAge.toString(),
  };

  // Only set credentials if explicitly enabled
  if (credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Rate Limiting Store
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit store
 *
 * LIMITATION: Resets on serverless cold starts. For production scale,
 * consider using Redis (Upstash), Cloudflare KV, or other persistent storage.
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Rate Limiting Options
 */
export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

/**
 * Check if request is rate limited
 *
 * Implements sliding window rate limiting using in-memory storage.
 * For production scale, replace with Redis or other distributed storage.
 *
 * @param identifier - Unique identifier (IP address, user ID, API key, etc.)
 * @param options - Rate limit configuration
 * @returns True if request is allowed, false if rate limited
 *
 * @example
 * ```typescript
 * import { checkRateLimit, getClientIP } from '@podcast-framework/core';
 *
 * export const POST: APIRoute = async (context) => {
 *   const clientIP = getClientIP(context);
 *
 *   const isAllowed = checkRateLimit(clientIP, {
 *     maxRequests: 10,
 *     windowMs: 60000 // 10 requests per minute
 *   });
 *
 *   if (!isAllowed) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 *
 *   // Process request...
 * };
 * ```
 *
 * @limitations
 * - In-memory storage resets on serverless cold starts
 * - Not shared across multiple function instances
 * - For production, use Redis (Upstash), Cloudflare Durable Objects, or similar
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): boolean {
  const { maxRequests, windowMs, keyPrefix = 'ratelimit' } = options;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  // Get or create record
  const record = rateLimitStore.get(key);

  // No record or window expired - allow and create new record
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  // Within window - check count
  if (record.count >= maxRequests) {
    return false; // Rate limited
  }

  // Increment count and allow
  record.count++;
  return true;
}

/**
 * Get rate limit info for identifier
 *
 * @param identifier - Unique identifier
 * @param options - Rate limit configuration (for key generation)
 * @returns Rate limit status information
 *
 * @example
 * ```typescript
 * const info = getRateLimitInfo(clientIP, {
 *   maxRequests: 10,
 *   windowMs: 60000
 * });
 *
 * return new Response(null, {
 *   headers: {
 *     'X-RateLimit-Limit': info.limit.toString(),
 *     'X-RateLimit-Remaining': info.remaining.toString(),
 *     'X-RateLimit-Reset': info.reset.toString()
 *   }
 * });
 * ```
 */
export function getRateLimitInfo(
  identifier: string,
  options: RateLimitOptions
): {
  limit: number;
  remaining: number;
  reset: number;
  resetDate: Date;
} {
  const { maxRequests, windowMs, keyPrefix = 'ratelimit' } = options;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    return {
      limit: maxRequests,
      remaining: maxRequests,
      reset: now + windowMs,
      resetDate: new Date(now + windowMs),
    };
  }

  return {
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    reset: record.resetAt,
    resetDate: new Date(record.resetAt),
  };
}

/**
 * Clear rate limit for identifier (useful for testing or admin override)
 *
 * @param identifier - Unique identifier
 * @param options - Rate limit configuration (for key generation)
 *
 * @example
 * ```typescript
 * // Admin endpoint to reset rate limit
 * clearRateLimit(userId, { maxRequests: 10, windowMs: 60000 });
 * ```
 */
export function clearRateLimit(
  identifier: string,
  options: Pick<RateLimitOptions, 'keyPrefix'>
): void {
  const { keyPrefix = 'ratelimit' } = options;
  const key = `${keyPrefix}:${identifier}`;
  rateLimitStore.delete(key);
}
