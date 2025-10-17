/**
 * import-rss command
 *
 * Import podcast episodes from RSS feed into Sanity CMS
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { RSSFeedParser } from '../lib/rss-import/parser';
import { TransistorAdapter } from '../lib/rss-import/adapters/transistor';
import { SanityImporter } from '../lib/rss-import/sanity-importer';
import { ImportLogger } from '../lib/rss-import/logger';
import type { ImportOptions, RSSAdapter } from '../lib/rss-import/types';

interface ImportCommandOptions {
  feed?: string;
  dryRun?: boolean;
  skipImages?: boolean;
  update?: boolean;
  verbose?: boolean;
  projectId?: string;
  dataset?: string;
  token?: string;
}

export const importRssCommand = new Command('import-rss')
  .description('Import podcast episodes from RSS feed')
  .option('-f, --feed <url>', 'RSS feed URL')
  .option('--dry-run', 'Preview import without making changes')
  .option('--skip-images', 'Skip downloading and uploading images')
  .option('--update', 'Update existing episodes (default: skip existing)')
  .option('-v, --verbose', 'Verbose logging')
  .option('--project-id <id>', 'Sanity project ID (defaults to .env)')
  .option('--dataset <name>', 'Sanity dataset (defaults to .env)')
  .option('--token <token>', 'Sanity write token (defaults to .env)')
  .action(async (options: ImportCommandOptions) => {
    console.log(chalk.bold('\n🎙️  RSS Feed Import\n'));

    try {
      // Get options
      const { feedUrl, importOptions } = await gatherOptions(options);

      // Initialize logger
      const logFile = join(process.cwd(), 'rss-import.log');
      const logger = new ImportLogger(options.verbose || false, logFile);

      logger.info('Starting RSS import process');
      logger.info(`Feed URL: ${feedUrl}`);
      logger.info(`Dry run: ${importOptions.dryRun || false}`);
      logger.info(`Skip images: ${importOptions.skipImages || false}`);
      logger.info(`Update existing: ${importOptions.updateExisting || false}`);

      // Initialize Sanity client
      const client = createClient({
        projectId: importOptions.sanityProjectId,
        dataset: importOptions.sanityDataset,
        token: importOptions.sanityToken,
        apiVersion: '2024-01-01',
        useCdn: false,
      });

      // Select appropriate adapter
      const adapter = selectAdapter(feedUrl);
      logger.info(`Using adapter: ${adapter.name}`);

      // Parse RSS feed
      const spinner = ora('Fetching and parsing RSS feed...').start();
      const parser = new RSSFeedParser(logger);
      const parsed = await parser.parseFeed(feedUrl, adapter);
      spinner.succeed(`Parsed feed: ${parsed.show.title} (${parsed.episodes.length} episodes)`);

      // Initialize importer
      const importer = new SanityImporter(client, logger, importOptions);

      // Import show metadata
      spinner.start('Importing show metadata...');
      const showResult = await importer.importShow(parsed.show);
      if (showResult.success) {
        spinner.succeed(`Show metadata ${showResult.created ? 'created' : showResult.updated ? 'updated' : 'ready'}`);
      } else {
        spinner.fail(`Failed to import show: ${showResult.error}`);
      }

      // Import episodes
      spinner.start('Importing episodes...');
      const startTime = new Date();
      const episodeResults = await importer.importEpisodes(parsed.episodes);
      const endTime = new Date();

      // Calculate summary
      const imported = episodeResults.filter(r => r.success && !r.skipped).length;
      const skipped = episodeResults.filter(r => r.skipped).length;
      const failed = episodeResults.filter(r => !r.success).length;

      spinner.stop();

      // Display results
      console.log('');
      console.log(chalk.bold('Import Complete!\n'));
      console.log(chalk.green(`✓ Imported: ${imported} episodes`));
      if (skipped > 0) {
        console.log(chalk.yellow(`⊘ Skipped: ${skipped} episodes (already exist)`));
      }
      if (failed > 0) {
        console.log(chalk.red(`✗ Failed: ${failed} episodes`));
      }
      console.log('');
      console.log(chalk.gray(`Duration: ${((endTime.getTime() - startTime.getTime()) / 1000).toFixed(1)}s`));
      console.log(chalk.gray(`Log file: ${logFile}`));
      console.log('');

      // Show failed episodes if any
      if (failed > 0) {
        console.log(chalk.bold('Failed Episodes:'));
        episodeResults
          .filter(r => !r.success)
          .forEach(r => {
            console.log(chalk.red(`  ✗ ${r.episodeTitle}: ${r.error}`));
          });
        console.log('');
      }

      logger.writeSummary();

      if (importOptions.dryRun) {
        console.log(chalk.yellow('⚠️  This was a dry run. No changes were made to Sanity.'));
        console.log(chalk.yellow('   Run without --dry-run to perform the import.'));
        console.log('');
      } else {
        console.log(chalk.bold('Next Steps:'));
        console.log(chalk.gray('  1. Review imported episodes in Sanity Studio'));
        console.log(chalk.gray('  2. Add guests and hosts manually'));
        console.log(chalk.gray('  3. Add platform links (Spotify, Apple, YouTube)'));
        console.log(chalk.gray('  4. Update show metadata (tagline, social links, etc.)'));
        console.log('');
      }

    } catch (error: any) {
      console.error(chalk.red(`\n❌ Import failed: ${error.message}\n`));
      process.exit(1);
    }
  });

/**
 * Gather all options from CLI flags, prompts, and .env file
 */
async function gatherOptions(options: ImportCommandOptions): Promise<{
  feedUrl: string;
  importOptions: ImportOptions;
}> {
  // Get feed URL
  let feedUrl = options.feed;

  // Try to get from .env if not provided
  if (!feedUrl) {
    feedUrl = getEnvVar('RSS_FEED_URL');
  }

  // Prompt if still not provided
  if (!feedUrl) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'feedUrl',
        message: 'RSS feed URL:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Feed URL is required';
          }
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
    ]);
    feedUrl = answers.feedUrl;
  }

  // At this point feedUrl must be defined
  if (!feedUrl) {
    throw new Error('Feed URL is required');
  }

  // Get Sanity credentials
  const projectId = options.projectId || getEnvVar('SANITY_PROJECT_ID') || getEnvVar('PUBLIC_SANITY_PROJECT_ID');
  const dataset = options.dataset || getEnvVar('SANITY_DATASET') || getEnvVar('PUBLIC_SANITY_DATASET') || 'production';
  const token = options.token || getEnvVar('SANITY_TOKEN') || getEnvVar('SANITY_WRITE_TOKEN');

  if (!projectId) {
    throw new Error('SANITY_PROJECT_ID not found. Set it in .env or pass --project-id');
  }

  if (!token) {
    throw new Error('SANITY_TOKEN not found. Set it in .env or pass --token. Get a token at https://sanity.io/manage');
  }

  const importOptions: ImportOptions = {
    feedUrl,
    sanityProjectId: projectId!,
    sanityDataset: dataset,
    sanityToken: token!,
    dryRun: options.dryRun,
    skipImages: options.skipImages,
    updateExisting: options.update,
  };

  return { feedUrl, importOptions };
}

/**
 * Select appropriate adapter based on feed URL
 */
function selectAdapter(feedUrl: string): RSSAdapter {
  const adapters: RSSAdapter[] = [
    new TransistorAdapter(),
    // Add more adapters here in the future
  ];

  for (const adapter of adapters) {
    if (adapter.canHandle(feedUrl)) {
      return adapter;
    }
  }

  // Default to Transistor adapter (works as generic RSS parser)
  return new TransistorAdapter();
}

/**
 * Get environment variable from .env file
 */
function getEnvVar(key: string): string | undefined {
  const envPath = join(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return undefined;
  }

  try {
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].replace(/^["']|["']$/g, '') : undefined;
  } catch {
    return undefined;
  }
}
