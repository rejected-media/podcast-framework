/**
 * update command
 *
 * Updates framework packages to latest versions
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join } from 'path';

interface UpdateOptions {
  major?: boolean;
  dryRun?: boolean;
}

export const updateCommand = new Command('update')
  .description('Update framework packages')
  .option('--major', 'Allow major version updates (may have breaking changes)')
  .option('--dry-run', 'Show what would be updated without actually updating')
  .action(async (options: UpdateOptions) => {
    console.log(chalk.bold('\n🔄 Checking for Framework Updates...\n'));

    try {
      // Read package.json
      const packageJsonPath = join(process.cwd(), 'package.json');
      if (!existsSync(packageJsonPath)) {
        console.log(chalk.red('❌ Not in a podcast project directory\n'));
        process.exit(1);
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = packageJson.dependencies || {};

      // Framework packages
      const frameworkPackages = [
        '@podcast-framework/core',
        '@podcast-framework/sanity-schema',
        '@podcast-framework/cli'
      ];

      const installedPackages = frameworkPackages.filter(pkg => deps[pkg]);

      if (installedPackages.length === 0) {
        console.log(chalk.yellow('⚠️  No framework packages found in dependencies\n'));
        process.exit(0);
      }

      console.log(chalk.bold('Installed framework packages:'));
      installedPackages.forEach(pkg => {
        console.log(chalk.gray(`  ${pkg}: ${deps[pkg]}`));
      });
      console.log('');

      if (options.dryRun) {
        console.log(chalk.yellow('🔍 Dry run mode - no changes will be made\n'));

        // Show what would be updated
        console.log(chalk.bold('Would run:'));
        console.log(chalk.gray(`  npm outdated ${installedPackages.join(' ')}`));
        console.log('');
        console.log(chalk.bold('Then:'));
        if (options.major) {
          console.log(chalk.gray(`  npm install ${installedPackages.map(p => `${p}@latest`).join(' ')}`));
        } else {
          console.log(chalk.gray(`  npm update ${installedPackages.join(' ')}`));
        }
        console.log('');
        process.exit(0);
      }

      // Create backup before updating
      if (options.major) {
        const spinner = ora('Creating backup...').start();

        const backupDir = join(process.cwd(), '.podcast-framework-backups');
        if (!existsSync(backupDir)) {
          mkdirSync(backupDir);
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const version = deps['@podcast-framework/core'] || 'unknown';
        const backupPath = join(backupDir, `${timestamp}_${version.replace(/[^0-9.]/g, '')}`);

        if (!existsSync(backupPath)) {
          mkdirSync(backupPath);
        }

        // Backup package files
        cpSync(packageJsonPath, join(backupPath, 'package.json'));

        const lockFile = join(process.cwd(), 'package-lock.json');
        if (existsSync(lockFile)) {
          cpSync(lockFile, join(backupPath, 'package-lock.json'));
        }

        const configFile = join(process.cwd(), 'podcast.config.js');
        if (existsSync(configFile)) {
          cpSync(configFile, join(backupPath, 'podcast.config.js'));
        }

        spinner.succeed(chalk.green(`Backup created: ${backupPath}`));
        console.log('');
      }

      // Update packages
      const spinner = ora('Updating framework packages...').start();

      try {
        if (options.major) {
          // Major update - install latest
          const updateCmd = `npm install ${installedPackages.map(p => `${p}@latest`).join(' ')}`;
          execSync(updateCmd, { stdio: 'pipe' });
          spinner.succeed(chalk.green('Updated to latest versions (may include breaking changes)'));
        } else {
          // Minor/patch update - use npm update
          const updateCmd = `npm update ${installedPackages.join(' ')}`;
          execSync(updateCmd, { stdio: 'pipe' });
          spinner.succeed(chalk.green('Updated to latest compatible versions'));
        }

        console.log('');

        // Show new versions
        const updatedPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const updatedDeps = updatedPackageJson.dependencies || {};

        console.log(chalk.bold('Updated versions:'));
        installedPackages.forEach(pkg => {
          const oldVersion = deps[pkg];
          const newVersion = updatedDeps[pkg];
          if (oldVersion !== newVersion) {
            console.log(chalk.green(`  ${pkg}: ${oldVersion} → ${newVersion}`));
          } else {
            console.log(chalk.gray(`  ${pkg}: ${newVersion} (no update available)`));
          }
        });
        console.log('');

        if (options.major) {
          console.log(chalk.yellow('⚠️  Major version update - breaking changes possible'));
          console.log(chalk.bold('\nRecommended next steps:'));
          console.log(chalk.gray('  1. Review changelog for breaking changes'));
          console.log(chalk.gray('  2. Run: podcast-framework validate'));
          console.log(chalk.gray('  3. Run: npm test (if you have tests)'));
          console.log(chalk.gray('  4. Run: npm run build'));
          console.log(chalk.gray('  5. Test locally before deploying'));
          console.log('');
        } else {
          console.log(chalk.bold('Next steps:'));
          console.log(chalk.gray('  npm run build    # Build to verify'));
          console.log(chalk.gray('  npm run dev      # Test locally'));
          console.log('');
        }

      } catch (error) {
        spinner.fail(chalk.red('Update failed'));
        console.error(error);
        process.exit(1);
      }

    } catch (error) {
      console.log(chalk.red('❌ Failed to update packages\n'));
      console.error(error);
      process.exit(1);
    }
  });
