/**
 * @podcast-framework/core
 *
 * Core components, layouts, and utilities for podcast websites
 *
 * @version 0.1.0
 * @license MIT
 */

// Component resolver (critical for override system)
export { getComponent } from './lib/component-resolver';

// Utilities
export { formatDate, stripHTML } from './lib/utils';
export type { Episode, Guest, Host, Theme, PodcastInfo } from './lib/types';

// Re-export components (for direct imports)
// Components are also importable via: @podcast-framework/core/components/Header.astro

/**
 * Usage Examples:
 *
 * 1. Import component directly:
 *    import Header from '@podcast-framework/core/components/Header.astro';
 *
 * 2. Use component resolver (recommended for layouts):
 *    import { getComponent } from '@podcast-framework/core';
 *    const Header = getComponent('Header');
 *
 * 3. Override component:
 *    Create src/components/Header.astro in your podcast
 *    Framework will automatically use your version
 */
