#!/usr/bin/env node

/**
 * CLI executable entry point
 * Uses tsx to run TypeScript directly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsxPath = join(__dirname, '../node_modules/.bin/tsx');
const entryPoint = join(__dirname, '../src/index.ts');

const child = spawn(tsxPath, [entryPoint, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
