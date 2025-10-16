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
    surface: '255, 255, 255',    // White
    text: '17, 24, 39',          // Dark gray
    textMuted: '107, 114, 128',  // Medium gray
    headerBg: '0, 0, 0',         // Black
    headerText: '255, 255, 255', // White
    footerBg: '0, 0, 0',         // Black
    footerText: '255, 255, 255', // White
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    headingFont: 'Inter, system-ui, -apple-system, sans-serif',
    googleFonts: [],
  },
  layout: {
    borderRadius: 'rounded-lg',
    spacing: 'normal',
  },
};

/**
 * Convert hex color to RGB format
 * Supports both #RGB and #RRGGBB formats
 */
function hexToRGB(hex: string): string | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Parse 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }

    return `${r}, ${g}, ${b}`;
  }

  return null;
}

/**
 * Validate and normalize color value
 * Accepts both RGB format ("123, 456, 789") and hex format ("#ABC123")
 * Returns RGB format for CSS custom properties
 */
function normalizeColorValue(value: string | undefined, fallback: string = '0, 0, 0'): string {
  if (!value) {
    return fallback;
  }

  // Check if it's hex format
  if (value.startsWith('#')) {
    const rgb = hexToRGB(value);
    if (rgb) {
      return rgb;
    }
    console.warn(`Invalid hex color: "${value}", using fallback: ${fallback}`);
    return fallback;
  }

  // Check if it's RGB format
  const rgbPattern = /^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/;
  const match = value.match(rgbPattern);

  if (!match) {
    console.warn(`Invalid color value: "${value}", using fallback: ${fallback}`);
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
function sanitizeFontFamily(fontFamily: string | undefined, fallback: string = 'system-ui, sans-serif'): string {
  if (!fontFamily) {
    return fallback;
  }
  // Allow alphanumeric, spaces, commas, hyphens, quotes
  // Block semicolons, braces, and other CSS syntax
  const sanitized = fontFamily.replace(/[{};]/g, '');
  return sanitized.trim() || fallback;
}

/**
 * Generate CSS custom properties from theme
 * Used in <style> tag to inject theme variables
 * Validates all values to prevent CSS injection
 */
export function generateThemeCSS(theme: Theme): string {
  // Normalize all color values (convert hex to RGB if needed)
  const colors = {
    primary: normalizeColorValue(theme.colors.primary, defaultTheme.colors.primary),
    secondary: normalizeColorValue(theme.colors.secondary, defaultTheme.colors.secondary),
    accent: normalizeColorValue(theme.colors.accent, defaultTheme.colors.accent),
    background: normalizeColorValue(theme.colors.background, defaultTheme.colors.background),
    surface: normalizeColorValue(theme.colors.surface, defaultTheme.colors.surface),
    text: normalizeColorValue(theme.colors.text, defaultTheme.colors.text),
    textMuted: normalizeColorValue(theme.colors.textMuted, defaultTheme.colors.textMuted),
    headerBg: normalizeColorValue(theme.colors.headerBg, defaultTheme.colors.headerBg),
    headerText: normalizeColorValue(theme.colors.headerText, defaultTheme.colors.headerText),
    footerBg: normalizeColorValue(theme.colors.footerBg, defaultTheme.colors.footerBg),
    footerText: normalizeColorValue(theme.colors.footerText, defaultTheme.colors.footerText),
  };

  // Sanitize font families
  const fontFamily = sanitizeFontFamily(theme.typography?.fontFamily, defaultTheme.typography.fontFamily);
  const headingFont = sanitizeFontFamily(theme.typography?.headingFont, theme.typography?.fontFamily || defaultTheme.typography.headingFont);

  return `
    :root {
      /* Colors (RGB format allows rgba() usage) */
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-text: ${colors.text};
      --color-text-muted: ${colors.textMuted};
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
