/**
 * Theme utilities for @podcast-framework/core
 *
 * Provides default theme and helper functions for theme management
 */

import type { Theme } from './types';

/**
 * Default theme fallback
 * Used when no theme is provided or CMS theme fails to load
 */
export const defaultTheme: Theme = {
  colors: {
    primary: '59, 130, 246',     // Blue (RGB format for opacity support)
    secondary: '139, 92, 246',   // Purple
    accent: '14, 165, 233',      // Sky blue
    background: '249, 250, 251', // Light gray
    text: '17, 24, 39',          // Dark gray
    headerBg: '0, 0, 0',         // Black
    headerText: '255, 255, 255', // White
    footerBg: '0, 0, 0',         // Black
    footerText: '255, 255, 255', // White
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    headingFont: 'Inter, system-ui, -apple-system, sans-serif',
  },
  layout: {
    borderRadius: 'rounded-lg',
    spacing: 'normal',
  },
};

/**
 * Validate RGB color value
 * Ensures value is in correct format: "123, 456, 789"
 * Prevents CSS injection attacks
 */
function validateRGBValue(value: string, fallback: string = '0, 0, 0'): string {
  // Only allow RGB format: "123, 456, 789"
  // Each number must be 0-255
  const rgbPattern = /^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/;
  const match = value.match(rgbPattern);

  if (!match) {
    console.warn(`Invalid RGB value: "${value}", using fallback: ${fallback}`);
    return fallback;
  }

  // Validate each component is 0-255
  const [, r, g, b] = match;
  const values = [parseInt(r), parseInt(g), parseInt(b)];

  if (values.some(v => v > 255)) {
    console.warn(`RGB value out of range: "${value}", using fallback: ${fallback}`);
    return fallback;
  }

  return value;
}

/**
 * Sanitize font family to prevent CSS injection
 */
function sanitizeFontFamily(fontFamily: string): string {
  // Allow alphanumeric, spaces, commas, hyphens, quotes
  // Block semicolons, braces, and other CSS syntax
  const sanitized = fontFamily.replace(/[{};]/g, '');
  return sanitized.trim();
}

/**
 * Generate CSS custom properties from theme
 * Used in <style> tag to inject theme variables
 * Validates all values to prevent CSS injection
 */
export function generateThemeCSS(theme: Theme): string {
  // Validate all color values
  const colors = {
    primary: validateRGBValue(theme.colors.primary, defaultTheme.colors.primary),
    secondary: validateRGBValue(theme.colors.secondary, defaultTheme.colors.secondary),
    accent: validateRGBValue(theme.colors.accent, defaultTheme.colors.accent),
    background: validateRGBValue(theme.colors.background, defaultTheme.colors.background),
    text: validateRGBValue(theme.colors.text, defaultTheme.colors.text),
    headerBg: validateRGBValue(theme.colors.headerBg, defaultTheme.colors.headerBg),
    headerText: validateRGBValue(theme.colors.headerText, defaultTheme.colors.headerText),
    footerBg: validateRGBValue(theme.colors.footerBg, defaultTheme.colors.footerBg),
    footerText: validateRGBValue(theme.colors.footerText, defaultTheme.colors.footerText),
  };

  // Sanitize font families
  const fontFamily = sanitizeFontFamily(theme.typography.fontFamily);
  const headingFont = sanitizeFontFamily(theme.typography.headingFont || theme.typography.fontFamily);

  return `
    :root {
      /* Colors (RGB format allows rgba() usage) */
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-text: ${colors.text};
      --color-header-bg: ${colors.headerBg};
      --color-header-text: ${colors.headerText};
      --color-footer-bg: ${colors.footerBg};
      --color-footer-text: ${colors.footerText};

      /* Typography */
      --font-family: ${fontFamily};
      --font-heading: ${headingFont};
    }

    body {
      background: rgb(var(--color-background));
      color: rgb(var(--color-text));
      font-family: var(--font-family);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
    }
  `.trim();
}

/**
 * Generate Google Fonts import URL
 * Converts font family names to Google Fonts API URL
 */
export function getGoogleFontsURL(fonts: string[]): string {
  if (!fonts || fonts.length === 0) return '';
  const fontsParam = fonts.join('&family=');
  return `https://fonts.googleapis.com/css2?family=${fontsParam}&display=swap`;
}

/**
 * Merge theme with overrides
 * Useful for podcasts that want to customize only certain theme properties
 */
export function mergeTheme(base: Theme, overrides: Partial<Theme>): Theme {
  return {
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    layout: { ...base.layout, ...overrides.layout },
  };
}
