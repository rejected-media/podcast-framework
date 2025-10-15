#!/usr/bin/env node

/**
 * CLI executable entry point
 *
 * When published to npm, this will load the compiled dist/index.js
 * When running locally in development, falls back to tsx
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load compiled version first (for npm installs)
const distPath = join(__dirname, '../dist/index.js');

if (existsSync(distPath)) {
  // Production: Use compiled version
  import(distPath).catch((error) => {
    console.error('Failed to load CLI:', error);
    process.exit(1);
  });
} else {
  // Development: Use tsx to run TypeScript
  import('tsx/cjs/api').then((tsx) => {
    // Register tsx loader
    tsx.register();

    // Load TypeScript entry point
    const entryPoint = join(__dirname, '../src/index.ts');
    import(entryPoint).catch((error) => {
      console.error('Failed to load CLI (dev mode):', error);
      console.error('Make sure dependencies are installed: npm install');
      process.exit(1);
    });
  }).catch((error) => {
    console.error('Failed to initialize TypeScript loader');
    console.error('Install tsx: npm install tsx');
    console.error(error);
    process.exit(1);
  });
}
