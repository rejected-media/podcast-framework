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
 * Generate CSS custom properties from theme
 * Used in <style> tag to inject theme variables
 */
export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      /* Colors (RGB format allows rgba() usage) */
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-text: ${theme.colors.text};
      --color-header-bg: ${theme.colors.headerBg};
      --color-header-text: ${theme.colors.headerText};
      --color-footer-bg: ${theme.colors.footerBg};
      --color-footer-text: ${theme.colors.footerText};

      /* Typography */
      --font-family: ${theme.typography.fontFamily};
      --font-heading: ${theme.typography.headingFont || theme.typography.fontFamily};
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
