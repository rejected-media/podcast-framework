/**
 * Utility Functions
 *
 * Shared helper functions used across the framework
 */

/**
 * Format a date string to human-readable format
 *
 * @param dateString - ISO date string or any valid date format
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted date like "January 15, 2024"
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15') // "January 15, 2024"
 * formatDate('2024-01-15', 'es-ES') // "15 de enero de 2024"
 * ```
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);

  // Validate date
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: "${dateString}"`);
  }

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Decode HTML entities to their corresponding characters
 *
 * @param text - Text with HTML entities
 * @returns Text with decoded entities
 *
 * @example
 * ```typescript
 * decodeHTMLEntities('&amp;') // "&"
 * decodeHTMLEntities('&#39;') // "'"
 * ```
 */
export function decodeHTMLEntities(text: string): string {
  // Map of common named HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#34;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  return text
    // Replace named entities using lookup table
    .replace(/&[#\w]+;/g, (entity) => entities[entity] || entity)
    // Decode numeric HTML entities (decimal): &#39; → '
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec))
    // Decode hexadecimal HTML entities: &#x27; → '
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Remove HTML tags from a string and decode HTML entities
 *
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags and with decoded entities
 *
 * @example
 * ```typescript
 * stripHTML('<p>Hello &amp; welcome</p>') // "Hello & welcome"
 * ```
 */
export function stripHTML(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, '');
  return decodeHTMLEntities(withoutTags).trim();
}

/**
 * Escape HTML to prevent XSS attacks
 * Simple but effective escaping for user-generated content
 *
 * @param text - Text to escape
 * @returns HTML-safe text
 *
 * @example
 * ```typescript
 * escapeHTML('<script>alert("xss")</script>')
 * // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 * ```
 */
export function escapeHTML(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (defaults to '...')
 * @returns Truncated text
 *
 * @example
 * ```typescript
 * truncate('Long text here', 10) // "Long text..."
 * ```
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Slugify a string (convert to URL-safe format)
 *
 * @param text - Text to slugify
 * @returns URL-safe slug
 *
 * @example
 * ```typescript
 * slugify('Hello World!') // "hello-world"
 * slugify('Episode #42: AI & ML') // "episode-42-ai-ml"
 * ```
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse duration string to seconds
 *
 * @param duration - Duration string in various formats
 * @returns Duration in seconds
 *
 * @example
 * ```typescript
 * parseDuration('1:23:45') // 5025 (HH:MM:SS)
 * parseDuration('23:45') // 1425 (MM:SS)
 * parseDuration('45') // 45 (SS)
 * ```
 */
export function parseDuration(duration: string): number {
  if (!duration) return 0;

  const parts = duration.split(':').map(Number);

  // Validate all parts are numbers
  if (parts.some(isNaN)) {
    throw new Error(`Invalid duration format: "${duration}". Expected HH:MM:SS, MM:SS, or SS`);
  }

  // Validate part count
  if (parts.length > 3 || parts.length === 0) {
    throw new Error(`Invalid duration format: "${duration}". Too many or too few colons.`);
  }

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }

  return 0;
}

/**
 * Format duration in seconds to readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration
 *
 * @example
 * ```typescript
 * formatDuration(5025) // "1:23:45"
 * formatDuration(1425) // "23:45"
 * formatDuration(45) // "0:45"
 * ```
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
