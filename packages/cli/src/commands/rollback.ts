/**
 * rollback command
 *
 * Rollback to a previous framework version from backup
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readdirSync, existsSync, cpSync, readFileSync } from 'fs';
import { join } from 'path';

export const rollbackCommand = new Command('rollback')
  .description('Rollback to a previous framework version')
  .option('--list', 'List available backups')
  .option('--last', 'Rollback to the most recent backup')
  .option('--to <version>', 'Rollback to a specific backup version')
  .action(async (options) => {
    console.log(chalk.bold('\n⏮️  Rollback Framework Version\n'));

    const backupDir = join(process.cwd(), '.podcast-framework-backups');

    // Check if backup directory exists
    if (!existsSync(backupDir)) {
      console.log(chalk.yellow('⚠️  No backups found\n'));
      console.log(chalk.gray('Backups are created automatically when running:'));
      console.log(chalk.gray('  podcast-framework update --major\n'));
      process.exit(0);
    }

    // List backups
    const backups = readdirSync(backupDir)
      .filter(name => !name.startsWith('.'))
      .sort()
      .reverse(); // Most recent first

    if (backups.length === 0) {
      console.log(chalk.yellow('⚠️  No backups found\n'));
      process.exit(0);
    }

    // List mode
    if (options.list) {
      console.log(chalk.bold('Available backups:\n'));

      backups.forEach((backup, index) => {
        const backupPath = join(backupDir, backup);
        const packageJsonPath = join(backupPath, 'package.json');

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            const coreVersion = packageJson.dependencies?.['@podcast-framework/core'] || 'unknown';

            console.log(chalk.cyan(`  ${index + 1}. ${backup}`));
            console.log(chalk.gray(`     @podcast-framework/core: ${coreVersion}`));
            console.log('');
          } catch {
            console.log(chalk.gray(`  ${index + 1}. ${backup} (corrupted backup)`));
          }
        }
      });

      console.log(chalk.bold('Rollback to a backup:'));
      console.log(chalk.gray('  podcast-framework rollback --last'));
      console.log(chalk.gray('  podcast-framework rollback --to <version>'));
      console.log('');
      return;
    }

    // Determine which backup to use
    let targetBackup: string;

    if (options.last) {
      targetBackup = backups[0];
    } else if (options.to) {
      const found = backups.find(b => b.includes(options.to));
      if (!found) {
        console.log(chalk.red(`❌ Backup not found: ${options.to}\n`));
        console.log(chalk.gray('Available backups:'));
        backups.forEach(b => console.log(chalk.gray(`  - ${b}`)));
        console.log('');
        process.exit(1);
      }
      targetBackup = found;
    } else {
      // Interactive selection
      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: 'Select backup to rollback to:',
          choices: backups.map(backup => ({
            name: backup,
            value: backup
          }))
        }
      ]);
      targetBackup = selected;
    }

    // Confirm rollback
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Rollback to ${targetBackup}? This will restore package.json and config files.`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.gray('\nRollback cancelled\n'));
      process.exit(0);
    }

    // Perform rollback
    try {
      const backupPath = join(backupDir, targetBackup);

      console.log('');
      console.log(chalk.bold('Restoring files:'));

      // Restore package.json
      const packageJsonBackup = join(backupPath, 'package.json');
      if (existsSync(packageJsonBackup)) {
        cpSync(packageJsonBackup, join(process.cwd(), 'package.json'));
        console.log(chalk.green('  ✓ package.json restored'));
      }

      // Restore package-lock.json
      const lockBackup = join(backupPath, 'package-lock.json');
      if (existsSync(lockBackup)) {
        cpSync(lockBackup, join(process.cwd(), 'package-lock.json'));
        console.log(chalk.green('  ✓ package-lock.json restored'));
      }

      // Restore podcast.config.js
      const configBackup = join(backupPath, 'podcast.config.js');
      if (existsSync(configBackup)) {
        cpSync(configBackup, join(process.cwd(), 'podcast.config.js'));
        console.log(chalk.green('  ✓ podcast.config.js restored'));
      }

      console.log('');
      console.log(chalk.bold.green('✅ Rollback complete!\n'));

      console.log(chalk.bold('Next steps:'));
      console.log(chalk.gray('  npm install      # Reinstall dependencies'));
      console.log(chalk.gray('  npm run build    # Rebuild project'));
      console.log(chalk.gray('  npm run dev      # Test locally'));
      console.log('');

    } catch (error) {
      console.log(chalk.red('\n❌ Rollback failed\n'));
      console.error(error);
      process.exit(1);
    }
  });
