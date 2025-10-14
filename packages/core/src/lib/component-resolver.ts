/**
 * Component Resolver
 *
 * Enables podcasts to override framework components by creating files in src/components/
 *
 * Implementation uses import.meta.glob for bundler safety (Vite/Astro can statically analyze)
 * This is CRITICAL - dynamic imports like import(`/src/${name}`) fail in production builds
 *
 * How it works:
 * 1. Framework provides components in @podcast-framework/core/components/
 * 2. Podcast can override by creating src/components/ComponentName.astro
 * 3. getComponent('ComponentName') checks local first, fallback to framework
 *
 * @see https://vitejs.dev/guide/features.html#glob-import
 */

// Create manifest of all framework components at build time
// Vite statically analyzes this and bundles the components
const frameworkComponents = import.meta.glob<any>(
  '../components/**/*.astro',
  { eager: true }
);

// Create manifest of all podcast overrides
// Will be empty object if podcast hasn't overridden anything
// This path is relative to where getComponent is called from (in podcast project)
const localComponents = import.meta.glob<any>(
  '/src/components/**/*.astro',
  { eager: true }
);

/**
 * Get component - checks local override first, fallback to framework
 *
 * @param name - Component name (e.g., 'Header', 'Footer')
 * @returns Component module
 * @throws Error if component not found in framework or local overrides
 *
 * @example
 * ```astro
 * ---
 * import { getComponent } from '@podcast-framework/core';
 * const Header = getComponent('Header');
 * ---
 * <Header siteName="My Podcast" />
 * ```
 */
export function getComponent(name: string) {
  // Normalize component name to path
  const localPath = `/src/components/${name}.astro`;
  const frameworkPath = `../components/${name}.astro`;

  // Check local override first (podcast-specific component)
  if (localComponents[localPath]) {
    return localComponents[localPath].default || localComponents[localPath];
  }

  // Fallback to framework component
  if (frameworkComponents[frameworkPath]) {
    return frameworkComponents[frameworkPath].default || frameworkComponents[frameworkPath];
  }

  // Component not found in either location
  throw new Error(
    `Component "${name}" not found in framework or local overrides. ` +
    `Available framework components: ${Object.keys(frameworkComponents).join(', ')}`
  );
}

/**
 * Check if a component has a local override
 *
 * @param name - Component name
 * @returns true if podcast has overridden this component
 *
 * @example
 * ```astro
 * ---
 * import { hasOverride } from '@podcast-framework/core';
 * const isCustomHeader = hasOverride('Header');
 * ---
 * {isCustomHeader && <p>Using custom header</p>}
 * ```
 */
export function hasOverride(name: string): boolean {
  const localPath = `/src/components/${name}.astro`;
  return localPath in localComponents;
}

/**
 * List all available framework components
 *
 * @returns Array of component names
 *
 * @example
 * ```typescript
 * import { listComponents } from '@podcast-framework/core';
 * const components = listComponents();
 * // ['Header', 'Footer', 'EpisodeCard', ...]
 * ```
 */
export function listComponents(): string[] {
  return Object.keys(frameworkComponents)
    .map(path => {
      // Extract component name from path: ../components/Header.astro → Header
      const match = path.match(/([^/]+)\.astro$/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];
}
