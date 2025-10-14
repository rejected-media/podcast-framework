/**
 * info command
 *
 * Displays information about the current podcast project
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const infoCommand = new Command('info')
  .description('Display information about the current podcast project')
  .action(() => {
    console.log(chalk.bold('\n📊 Podcast Project Information\n'));

    try {
      // Read package.json
      const packageJsonPath = join(process.cwd(), 'package.json');
      if (!existsSync(packageJsonPath)) {
        console.log(chalk.red('Not in a podcast project directory\n'));
        process.exit(1);
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      console.log(chalk.bold('Project:'));
      console.log(chalk.gray(`  Name: ${packageJson.name || 'Unknown'}`));
      console.log(chalk.gray(`  Version: ${packageJson.version || 'Unknown'}`));
      console.log('');

      // Framework dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      console.log(chalk.bold('Framework Versions:'));
      if (deps['@podcast-framework/core']) {
        console.log(chalk.gray(`  @podcast-framework/core: ${deps['@podcast-framework/core']}`));
      }
      if (deps['@podcast-framework/sanity-schema']) {
        console.log(chalk.gray(`  @podcast-framework/sanity-schema: ${deps['@podcast-framework/sanity-schema']}`));
      }
      if (deps['@podcast-framework/cli']) {
        console.log(chalk.gray(`  @podcast-framework/cli: ${deps['@podcast-framework/cli']}`));
      }
      console.log('');

      // Other dependencies
      console.log(chalk.bold('Dependencies:'));
      if (deps['astro']) {
        console.log(chalk.gray(`  Astro: ${deps['astro']}`));
      }
      if (deps['sanity']) {
        console.log(chalk.gray(`  Sanity: ${deps['sanity']}`));
      }
      console.log('');

      // Try to load podcast config
      const configPath = join(process.cwd(), 'podcast.config.js');
      if (existsSync(configPath)) {
        console.log(chalk.bold('Configuration:'));
        console.log(chalk.gray(`  Config file: podcast.config.js`));
        console.log(chalk.gray('  Use: import config from "./podcast.config.js" to inspect'));
        console.log('');
      }

      // Show helpful commands
      console.log(chalk.bold('Helpful Commands:'));
      console.log(chalk.gray('  podcast-framework validate      # Validate project'));
      console.log(chalk.gray('  podcast-framework list-components  # List available components'));
      console.log(chalk.gray('  podcast-framework check-updates    # Check for updates'));
      console.log('');

    } catch (error) {
      console.log(chalk.red('Failed to read project information\n'));
      console.error(error);
      process.exit(1);
    }
  });
