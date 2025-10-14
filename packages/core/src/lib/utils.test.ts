/**
 * Unit tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  stripHTML,
  escapeHTML,
  decodeHTMLEntities,
  truncate,
  slugify,
  parseDuration,
  formatDuration
} from './utils';

describe('formatDate', () => {
  it('formats ISO date correctly', () => {
    // Use T00:00:00Z to ensure UTC interpretation
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('January');
  });

  it('handles different locales', () => {
    const result = formatDate('2024-01-15T00:00:00Z', 'es-ES');
    expect(result).toContain('2024');
    expect(result).toContain('enero');
  });

  it('formats dates with time correctly', () => {
    expect(formatDate('2024-01-15T12:00:00Z')).toBe('January 15, 2024');
  });

  it('throws error for invalid dates', () => {
    expect(() => formatDate('not-a-date')).toThrow('Invalid date format');
  });

  it('throws error for empty string', () => {
    expect(() => formatDate('')).toThrow('Invalid date format');
  });
});

describe('stripHTML', () => {
  it('removes HTML tags', () => {
    expect(stripHTML('<p>Hello World</p>')).toBe('Hello World');
  });

  it('handles multiple tags', () => {
    expect(stripHTML('<div><p>Hello</p><span>World</span></div>')).toBe('HelloWorld');
  });

  it('decodes HTML entities', () => {
    expect(stripHTML('<p>Hello &amp; welcome</p>')).toBe('Hello & welcome');
  });

  it('handles empty input', () => {
    expect(stripHTML('')).toBe('');
  });

  it('handles plain text', () => {
    expect(stripHTML('Plain text')).toBe('Plain text');
  });
});

describe('escapeHTML', () => {
  it('escapes script tags', () => {
    expect(escapeHTML('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });

  it('escapes special characters', () => {
    expect(escapeHTML('< > & " \'')).toBe('&lt; &gt; &amp; &quot; &#39;');
  });

  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('');
  });

  it('handles plain text', () => {
    expect(escapeHTML('Plain text')).toBe('Plain text');
  });
});

describe('decodeHTMLEntities', () => {
  it('decodes common named entities', () => {
    expect(decodeHTMLEntities('&amp;')).toBe('&');
    expect(decodeHTMLEntities('&lt;')).toBe('<');
    expect(decodeHTMLEntities('&gt;')).toBe('>');
    expect(decodeHTMLEntities('&quot;')).toBe('"');
  });

  it('decodes numeric entities (decimal)', () => {
    expect(decodeHTMLEntities('&#39;')).toBe("'");
    expect(decodeHTMLEntities('&#34;')).toBe('"');
  });

  it('decodes hexadecimal entities', () => {
    expect(decodeHTMLEntities('&#x27;')).toBe("'");
    expect(decodeHTMLEntities('&#x22;')).toBe('"');
  });

  it('handles mixed entities', () => {
    expect(decodeHTMLEntities('Hello &amp; &#39;world&#39;'))
      .toBe("Hello & 'world'");
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('This is a long text', 10)).toBe('This is...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('uses custom suffix', () => {
    expect(truncate('Long text here', 10, '…')).toBe('Long text…');
  });

  it('handles exact length', () => {
    expect(truncate('1234567890', 10)).toBe('1234567890');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('removes special characters', () => {
    expect(slugify('Episode #42: AI & ML')).toBe('episode-42-ai-ml');
  });

  it('removes leading/trailing hyphens', () => {
    expect(slugify('  -trimmed-  ')).toBe('trimmed');
  });

  it('handles underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles unicode characters', () => {
    expect(slugify('café résumé')).toBe('caf-rsum');
  });
});

describe('parseDuration', () => {
  it('parses HH:MM:SS format', () => {
    expect(parseDuration('1:23:45')).toBe(5025);
  });

  it('parses MM:SS format', () => {
    expect(parseDuration('23:45')).toBe(1425);
  });

  it('parses SS format', () => {
    expect(parseDuration('45')).toBe(45);
  });

  it('handles zero values', () => {
    expect(parseDuration('0:00:00')).toBe(0);
    expect(parseDuration('0:00')).toBe(0);
  });

  it('handles empty string', () => {
    expect(parseDuration('')).toBe(0);
  });

  it('throws error for invalid format', () => {
    expect(() => parseDuration('invalid')).toThrow('Invalid duration format');
  });

  it('throws error for too many colons', () => {
    expect(() => parseDuration('1:2:3:4')).toThrow('Invalid duration format');
  });

  it('throws error for non-numeric values', () => {
    expect(() => parseDuration('1:abc:3')).toThrow('Invalid duration format');
  });
});

describe('formatDuration', () => {
  it('formats hours:minutes:seconds', () => {
    expect(formatDuration(5025)).toBe('1:23:45');
  });

  it('formats minutes:seconds', () => {
    expect(formatDuration(1425)).toBe('23:45');
  });

  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('pads single digit values', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3605)).toBe('1:00:05');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('handles large durations', () => {
    expect(formatDuration(10000)).toBe('2:46:40');
  });
});
