/**
 * Sentry Error Monitoring Configuration
 *
 * Centralized error tracking for production issues.
 * Only initializes in production to avoid noise during development.
 *
 * Usage in your Astro project:
 * 1. Install: npm install @sentry/astro @sentry/node
 * 2. Set SENTRY_DSN environment variable
 * 3. Call initSentry() in your entry point (e.g., middleware or API route)
 * 4. Use captureException() and captureMessage() to report errors
 */

import * as Sentry from '@sentry/node';

let sentryInitialized = false;

export interface SentryConfig {
  /** Sentry DSN (Data Source Name) from your Sentry project */
  dsn?: string;
  /** Environment name (production, staging, development) */
  environment?: string;
  /** Sample rate for performance monitoring (0.0 to 1.0) */
  tracesSampleRate?: number;
  /** Release version for tracking deploys */
  release?: string;
  /** Whether Sentry is enabled (defaults to production only) */
  enabled?: boolean;
}

export interface SentryContext {
  /** Tags for categorizing errors */
  tags?: Record<string, string>;
  /** Extra context data */
  extra?: Record<string, unknown>;
  /** Severity level */
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

/**
 * Initialize Sentry for server-side error tracking
 *
 * @param config - Sentry configuration options
 * @returns true if initialized successfully, false otherwise
 */
export function initSentry(config?: SentryConfig): boolean {
  // Only initialize once
  if (sentryInitialized) {
    return true;
  }

  // Determine if production
  const isProduction = config?.environment === 'production' ||
                      process.env.NODE_ENV === 'production';

  const sentryDsn = config?.dsn || process.env.SENTRY_DSN;
  const enabled = config?.enabled ?? isProduction;

  if (!enabled) {
    console.log('Sentry: Skipping initialization (not enabled)');
    return false;
  }

  if (!sentryDsn) {
    console.warn('Sentry: DSN not configured. Error monitoring disabled.');
    return false;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: config?.environment || process.env.NODE_ENV || 'production',
      tracesSampleRate: config?.tracesSampleRate ?? 0.1, // Sample 10% by default
      enabled,
      release: config?.release || process.env.COMMIT_REF || undefined,

      // Ignore common bot/spam errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],

      beforeSend(event, hint) {
        // Filter out low-value errors
        const error = hint.originalException;

        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);

          // Ignore rate limit errors (expected behavior)
          if (message.includes('rate limit') || message.includes('429')) {
            return null;
          }

          // Ignore validation errors (user error, not system error)
          if (message.includes('validation') || message.includes('invalid email')) {
            return null;
          }
        }

        return event;
      },
    });

    sentryInitialized = true;
    console.log('Sentry: Initialized successfully');
    return true;
  } catch (error) {
    console.error('Sentry: Failed to initialize:', error);
    return false;
  }
}

/**
 * Check if Sentry is initialized and ready to use
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}

/**
 * Capture an exception with Sentry
 *
 * @param error - The error to capture
 * @param context - Additional context (tags, extra data, level)
 */
export function captureException(error: unknown, context?: SentryContext): void {
  if (!sentryInitialized) {
    // Fallback to console if Sentry not initialized
    console.error('Error:', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message with Sentry
 *
 * @param message - The message to capture
 * @param level - Severity level (default: info)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  if (!sentryInitialized) {
    console.log(`[${level}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}
