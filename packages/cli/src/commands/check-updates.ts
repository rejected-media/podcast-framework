/**
 * check-updates command
 *
 * Checks for available framework updates
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';

export const checkUpdatesCommand = new Command('check-updates')
  .description('Check for available framework updates')
  .action(async () => {
    console.log(chalk.bold('\n🔍 Checking for updates...\n'));

    try {
      // Read current package.json
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      const currentVersions = {
        core: packageJson.dependencies?.['@podcast-framework/core'] || 'not installed',
        cli: packageJson.dependencies?.['@podcast-framework/cli'] || 'not installed',
        schema: packageJson.dependencies?.['@podcast-framework/sanity-schema'] || 'not installed'
      };

      console.log(chalk.bold('Current versions:'));
      console.log(chalk.gray(`  @podcast-framework/core: ${currentVersions.core}`));
      console.log(chalk.gray(`  @podcast-framework/cli: ${currentVersions.cli}`));
      console.log(chalk.gray(`  @podcast-framework/sanity-schema: ${currentVersions.schema}`));
      console.log('');

      // TODO: Fetch latest versions from npm registry
      console.log(chalk.yellow('⚠️  Update checking not yet implemented'));
      console.log(chalk.gray('This feature will be completed in Week 5-6 of development'));
      console.log('');
      console.log(chalk.bold('Manual check:'));
      console.log(chalk.gray('  Run: npm outdated'));
      console.log('');

    } catch (error) {
      console.error(chalk.red('Error reading package.json'));
      console.error(chalk.gray('Make sure you are in a podcast project directory'));
      process.exit(1);
    }
  });
