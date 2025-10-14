/**
 * validate command
 *
 * Validates podcast configuration and checks for common issues
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const validateCommand = new Command('validate')
  .description('Validate podcast configuration and project structure')
  .option('-v, --verbose', 'Show detailed validation results')
  .action(async (options) => {
    console.log(chalk.bold('\n🔍 Validating Podcast Project...\n'));

    const errors: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    // Check package.json exists
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      errors.push('package.json not found - are you in a podcast project directory?');
    } else {
      successes.push('package.json found');

      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        // Check for framework dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps['@podcast-framework/core']) {
          successes.push(`Using @podcast-framework/core@${deps['@podcast-framework/core']}`);
        } else {
          warnings.push('@podcast-framework/core not found in dependencies');
        }

        if (deps['astro']) {
          successes.push(`Astro ${deps['astro']} installed`);
        } else {
          errors.push('Astro not found in dependencies (required)');
        }

        if (deps['sanity']) {
          successes.push(`Sanity ${deps['sanity']} installed`);
        } else {
          warnings.push('Sanity not installed (optional but recommended)');
        }
      } catch (error) {
        errors.push('Failed to parse package.json');
      }
    }

    // Check for podcast.config.js
    const configPaths = [
      join(process.cwd(), 'podcast.config.js'),
      join(process.cwd(), 'podcast.config.mjs'),
      join(process.cwd(), 'podcast.config.ts')
    ];

    const configExists = configPaths.some(existsSync);
    if (configExists) {
      successes.push('Podcast configuration file found');
    } else {
      warnings.push('podcast.config.js not found (will use defaults)');
    }

    // Check for required directories
    const requiredDirs = ['src', 'public'];
    requiredDirs.forEach(dir => {
      if (existsSync(join(process.cwd(), dir))) {
        if (options.verbose) {
          successes.push(`${dir}/ directory exists`);
        }
      } else {
        warnings.push(`${dir}/ directory not found`);
      }
    });

    // Check for Astro config
    if (existsSync(join(process.cwd(), 'astro.config.mjs'))) {
      successes.push('Astro configuration found');
    } else {
      warnings.push('astro.config.mjs not found');
    }

    // Check for Sanity config
    const sanityConfigPaths = [
      join(process.cwd(), 'sanity.config.ts'),
      join(process.cwd(), 'sanity.config.js')
    ];
    if (sanityConfigPaths.some(existsSync)) {
      successes.push('Sanity configuration found');
    } else {
      if (options.verbose) {
        warnings.push('Sanity configuration not found (optional)');
      }
    }

    // Check for .env file
    const envPaths = [
      join(process.cwd(), '.env'),
      join(process.cwd(), '.env.local')
    ];
    if (envPaths.some(existsSync)) {
      successes.push('Environment variables file found');
    } else {
      warnings.push('No .env file found - make sure environment variables are configured');
    }

    // Display results
    console.log(chalk.bold('Results:\n'));

    if (successes.length > 0 && (options.verbose || successes.length <= 5)) {
      successes.forEach(msg => {
        console.log(chalk.green('✓'), msg);
      });
      if (!options.verbose && successes.length > 5) {
        console.log(chalk.green(`  ...and ${successes.length - 5} more checks passed`));
      }
      console.log('');
    }

    if (warnings.length > 0) {
      warnings.forEach(msg => {
        console.log(chalk.yellow('⚠'), msg);
      });
      console.log('');
    }

    if (errors.length > 0) {
      errors.forEach(msg => {
        console.log(chalk.red('✗'), msg);
      });
      console.log('');
    }

    // Summary
    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.bold.green('✅ Project validation passed!\n'));
      process.exit(0);
    } else if (errors.length === 0) {
      console.log(chalk.bold.yellow(`⚠️  Validation passed with ${warnings.length} warning(s)\n`));
      process.exit(0);
    } else {
      console.log(chalk.bold.red(`❌ Validation failed with ${errors.length} error(s)\n`));
      process.exit(1);
    }
  });
