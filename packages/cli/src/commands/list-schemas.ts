/**
 * list-schemas command
 *
 * Lists all available Sanity schemas
 */

import { Command } from 'commander';
import chalk from 'chalk';

export const listSchemasCommand = new Command('list-schemas')
  .description('List all available Sanity schemas')
  .option('-v, --verbose', 'Show schema descriptions')
  .action((options) => {
    console.log(chalk.bold('\n📋 Available Schemas in @podcast-framework/sanity-schema\n'));

    const schemas = [
      {
        name: 'episode',
        description: 'Episode schema with transcripts, platform links, and metadata',
        fields: 'title, episodeNumber, publishDate, duration, description, guests, hosts, transcript, platform links'
      },
      {
        name: 'guest',
        description: 'Guest profile schema',
        fields: 'name, slug, bio, photo, social links (Twitter, LinkedIn, website)'
      },
      {
        name: 'host',
        description: 'Host profile schema (similar to guest)',
        fields: 'name, slug, bio, photo, social links'
      },
      {
        name: 'podcast',
        description: 'Podcast metadata schema (show-level information)',
        fields: 'name, tagline, description, logo, platform URLs, social links, newsletter settings'
      },
      {
        name: 'contribution',
        description: 'Community contribution schema',
        fields: 'contributionType, status, title, description, submitter info'
      }
    ];

    schemas.forEach((schema, index) => {
      console.log(chalk.cyan(`${index + 1}. ${schema.name}`));

      if (options.verbose) {
        console.log(chalk.gray(`   ${schema.description}`));
        console.log(chalk.gray(`   Fields: ${schema.fields}`));
        console.log('');
      }
    });

    if (!options.verbose) {
      console.log(chalk.gray('\nUse --verbose for schema descriptions and fields\n'));
    }

    console.log(chalk.bold('Usage:'));
    console.log(chalk.gray(`  import { episode, guest } from '@podcast-framework/sanity-schema';`));
    console.log('');
    console.log(chalk.bold('Extend:'));
    console.log(chalk.gray(`  import { extendEpisodeSchema } from '@podcast-framework/sanity-schema';`));
    console.log(chalk.gray(`  const episode = extendEpisodeSchema([`));
    console.log(chalk.gray(`    { name: 'sponsor', type: 'reference', to: [{ type: 'sponsor' }] }`));
    console.log(chalk.gray(`  ]);`));
    console.log('');
  });
