/**
 * Unit tests for theme utilities
 */

import { describe, it, expect } from 'vitest';
import { defaultTheme, generateThemeCSS, getGoogleFontsURL, mergeTheme } from './theme';

describe('defaultTheme', () => {
  it('has all required color properties', () => {
    expect(defaultTheme.colors).toHaveProperty('primary');
    expect(defaultTheme.colors).toHaveProperty('secondary');
    expect(defaultTheme.colors).toHaveProperty('headerBg');
    expect(defaultTheme.colors).toHaveProperty('footerBg');
  });

  it('has typography configuration', () => {
    expect(defaultTheme.typography).toHaveProperty('fontFamily');
    expect(defaultTheme.typography).toHaveProperty('headingFont');
  });

  it('uses valid RGB format for colors', () => {
    // RGB format: "123, 456, 789"
    const rgbPattern = /^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/;
    expect(defaultTheme.colors.primary).toMatch(rgbPattern);
    expect(defaultTheme.colors.secondary).toMatch(rgbPattern);
  });
});

describe('generateThemeCSS', () => {
  it('generates valid CSS with default theme', () => {
    const css = generateThemeCSS(defaultTheme);

    expect(css).toContain(':root');
    expect(css).toContain('--color-primary');
    expect(css).toContain('--font-family');
  });

  it('includes all color variables', () => {
    const css = generateThemeCSS(defaultTheme);

    expect(css).toContain('--color-primary');
    expect(css).toContain('--color-secondary');
    expect(css).toContain('--color-header-bg');
    expect(css).toContain('--color-footer-bg');
  });

  it('validates RGB values and uses fallback for invalid input', () => {
    const invalidTheme = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: 'invalid; } body { display: none; } /*'  // CSS injection attempt
      }
    };

    const css = generateThemeCSS(invalidTheme);

    // Should use fallback (defaultTheme primary) not the injection attempt
    expect(css).not.toContain('invalid');
    expect(css).not.toContain('display: none');
    expect(css).toContain(`--color-primary: ${defaultTheme.colors.primary}`);
  });

  it('validates RGB values are within 0-255 range', () => {
    const invalidTheme = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '300, 400, 500'  // Out of range
      }
    };

    const css = generateThemeCSS(invalidTheme);

    // Should use defaultTheme fallback
    expect(css).not.toContain('300');
    expect(css).toContain(`--color-primary: ${defaultTheme.colors.primary}`);
  });

  it('sanitizes font family to prevent CSS injection', () => {
    const maliciousTheme = {
      ...defaultTheme,
      typography: {
        fontFamily: 'Arial; } body { display: none; } /*',
        headingFont: 'Helvetica'
      }
    };

    const css = generateThemeCSS(maliciousTheme);

    // Should remove dangerous characters (semicolons, braces)
    expect(css).not.toContain('} body {');
    expect(css).toContain('--font-family: Arial');
  });
});

describe('getGoogleFontsURL', () => {
  it('generates valid Google Fonts URL', () => {
    const url = getGoogleFontsURL(['Inter:400,700', 'Roboto:300']);
    expect(url).toBe('https://fonts.googleapis.com/css2?family=Inter:400,700&family=Roboto:300&display=swap');
  });

  it('handles single font', () => {
    const url = getGoogleFontsURL(['Inter:400']);
    expect(url).toBe('https://fonts.googleapis.com/css2?family=Inter:400&display=swap');
  });

  it('returns empty string for empty array', () => {
    expect(getGoogleFontsURL([])).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(getGoogleFontsURL(null as any)).toBe('');
    expect(getGoogleFontsURL(undefined as any)).toBe('');
  });
});

describe('mergeTheme', () => {
  it('merges colors deeply', () => {
    const custom = {
      colors: {
        primary: '255, 0, 0',  // Red
        secondary: '0, 255, 0'  // Green
      }
    };

    const merged = mergeTheme(defaultTheme, custom);

    expect(merged.colors.primary).toBe('255, 0, 0');
    expect(merged.colors.secondary).toBe('0, 255, 0');
    // Should keep other default colors
    expect(merged.colors.background).toBe(defaultTheme.colors.background);
  });

  it('merges typography', () => {
    const custom = {
      typography: {
        fontFamily: 'Comic Sans'
      }
    };

    const merged = mergeTheme(defaultTheme, custom);

    expect(merged.typography.fontFamily).toBe('Comic Sans');
    // Should keep heading font from default
    expect(merged.typography.headingFont).toBe(defaultTheme.typography.headingFont);
  });

  it('preserves all default values when partial override', () => {
    const custom = {
      colors: {
        primary: '255, 0, 0'
      }
    };

    const merged = mergeTheme(defaultTheme, custom);

    // All color keys should exist
    expect(merged.colors).toHaveProperty('primary');
    expect(merged.colors).toHaveProperty('secondary');
    expect(merged.colors).toHaveProperty('accent');
    expect(merged.colors).toHaveProperty('background');
  });
});
