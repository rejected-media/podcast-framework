/**
 * list-components command
 *
 * Lists all available components in @podcast-framework/core
 */

import { Command } from 'commander';
import chalk from 'chalk';

export const listComponentsCommand = new Command('list-components')
  .description('List all available framework components')
  .option('-v, --verbose', 'Show component descriptions')
  .action((options) => {
    console.log(chalk.bold('\n📦 Available Components in @podcast-framework/core\n'));

    const components = [
      {
        name: 'Header.astro',
        description: 'Main navigation header with mobile menu',
        props: 'siteName, siteTagline?, logoUrl?, navigation?, theme?'
      },
      {
        name: 'Footer.astro',
        description: 'Site footer with social links and newsletter slot',
        props: 'siteName, siteDescription?, navigation?, socialLinks?, theme?'
      },
      {
        name: 'NewsletterSignup.astro',
        description: 'Email subscription form with spam protection',
        props: 'variant?, placeholder?, buttonText?'
      },
      {
        name: 'EpisodeSearch.astro',
        description: 'Client-side episode search with fuzzy matching',
        props: 'placeholder?'
      },
      {
        name: 'TranscriptViewer.astro',
        description: 'Collapsible transcript viewer with search',
        props: 'transcript?, segments?, episodeNumber'
      },
      {
        name: 'FeaturedEpisodesCarousel.astro',
        description: 'Auto-progressing episode carousel',
        props: 'episodes, title?, fallbackImage?, theme?, autoProgressInterval?'
      },
      {
        name: 'SkeletonLoader.astro',
        description: 'Loading placeholder UI (4 variants)',
        props: 'variant?, count?'
      },
      {
        name: 'BlockContent.astro',
        description: 'Sanity portable text renderer',
        props: 'blocks?, class?'
      }
    ];

    components.forEach((component, index) => {
      console.log(chalk.cyan(`${index + 1}. ${component.name}`));

      if (options.verbose) {
        console.log(chalk.gray(`   ${component.description}`));
        console.log(chalk.gray(`   Props: ${component.props}`));
        console.log('');
      }
    });

    if (!options.verbose) {
      console.log(chalk.gray('\nUse --verbose for component descriptions and props\n'));
    }

    console.log(chalk.bold('Usage:'));
    console.log(chalk.gray(`  import ComponentName from '@podcast-framework/core/components/ComponentName.astro';`));
    console.log('');
    console.log(chalk.bold('Override:'));
    console.log(chalk.gray(`  Create src/components/ComponentName.astro in your podcast`));
    console.log(chalk.gray(`  Framework will automatically use your version`));
    console.log('');
  });
