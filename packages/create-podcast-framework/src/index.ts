/**
 * @rejected-media/create-podcast-framework
 *
 * Wrapper for creating new podcast framework projects via `npm create`
 *
 * This package enables the `npm create podcast-framework` command
 * by invoking the main CLI's create command.
 *
 * @version 0.1.0
 * @license MIT
 */

import { spawn } from 'child_process';

/**
 * Main entry point
 * Spawns the CLI's create command with all arguments passed through
 */
async function main() {
  // Get all arguments passed to this command (excluding node and script path)
  const args = process.argv.slice(2);

  // Prepend 'create' command to the arguments
  const fullArgs = ['--yes', '@rejected-media/podcast-framework-cli', 'create', ...args];

  // Spawn the CLI process via npx
  // This ensures the dependency is resolved correctly regardless of installation location
  const child = spawn('npx', fullArgs, {
    stdio: 'inherit', // Pass through stdin/stdout/stderr
    shell: false,
  });

  // Handle process exit
  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  // Handle errors
  child.on('error', (error) => {
    console.error('Failed to start CLI:', error);
    process.exit(1);
  });
}

// Run main function
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
