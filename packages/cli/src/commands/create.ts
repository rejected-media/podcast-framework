/**
 * create command
 *
 * Creates a new podcast project from template
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CreateOptions {
  template?: string;
  skipInstall?: boolean;
}

export const createCommand = new Command('create')
  .description('Create a new podcast project')
  .argument('[name]', 'Project name (will prompt if not provided)')
  .option('-t, --template <template>', 'Template to use (default: basic)')
  .option('--skip-install', 'Skip npm install')
  .action(async (projectName: string | undefined, options: CreateOptions) => {
    console.log(chalk.bold('\n🎙️  Create New Podcast Project\n'));

    // Prompt for project name if not provided
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your podcast name?',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-]+$/i.test(input)) {
              return 'Project name can only contain letters, numbers, and hyphens';
            }
            return true;
          }
        }
      ]);
      projectName = answers.projectName;
    }

    // Convert to slug
    const projectSlug = projectName!.toLowerCase().replace(/\s+/g, '-');
    const projectDir = join(process.cwd(), projectSlug);

    // Check if directory exists
    if (existsSync(projectDir)) {
      console.log(chalk.red(`\n❌ Directory already exists: ${projectSlug}\n`));
      process.exit(1);
    }

    // Gather project info
    console.log('');
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'tagline',
        message: 'Podcast tagline (optional):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description:',
      },
      {
        type: 'confirm',
        name: 'includeNewsletter',
        message: 'Include newsletter signup?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeContributions',
        message: 'Include community contributions feature?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeSearch',
        message: 'Include episode search?',
        default: true,
      }
    ]);

    // Create project
    const spinner = ora('Creating project structure...').start();

    try {
      // Create directories
      mkdirSync(projectDir);
      mkdirSync(join(projectDir, 'src'));
      mkdirSync(join(projectDir, 'src', 'pages'));
      mkdirSync(join(projectDir, 'src', 'components'));
      mkdirSync(join(projectDir, 'public'));
      mkdirSync(join(projectDir, 'sanity'));
      mkdirSync(join(projectDir, 'sanity', 'schemas'));

      spinner.text = 'Generating configuration files...';

      // Generate package.json
      const packageJson = {
        name: projectSlug,
        type: 'module',
        version: '0.0.1',
        scripts: {
          dev: 'astro dev',
          build: 'astro check && astro build',
          preview: 'astro preview',
        },
        dependencies: {
          '@podcast-framework/core': '^0.1.0',
          '@podcast-framework/sanity-schema': '^1.0.0',
          'astro': '^5.1.0',
          'react': '^19.2.0',
          'react-dom': '^19.2.0',
          'sanity': '^3.0.0',
          '@sanity/client': '^6.0.0'
        },
        devDependencies: {
          '@astrojs/check': '^0.9.0',
          'typescript': '^5.3.0'
        }
      };

      writeFileSync(
        join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Generate podcast.config.js
      const podcastConfig = `export default {
  name: "${projectName}",
  tagline: "${answers.tagline || ''}",
  description: "${answers.description || ''}",
  domain: "${projectSlug}.com",
  url: "https://${projectSlug}.com",

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
  },

  features: {
    transcripts: true,
    newsletter: ${answers.includeNewsletter},
    contributions: ${answers.includeContributions},
    search: ${answers.includeSearch},
    comments: false,
    platformLinks: {
      spotify: true,
      apple: true,
      youtube: true,
    }
  },

  integrations: {
    analytics: {
      provider: 'google',
      measurementId: process.env.GA_MEASUREMENT_ID,
    }
  },

  theme: '@podcast-framework/theme-default',
};
`;

      writeFileSync(join(projectDir, 'podcast.config.js'), podcastConfig);

      // Generate astro.config.mjs
      const astroConfig = `import { defineConfig } from 'astro';

export default defineConfig({
  site: 'https://${projectSlug}.com',
});
`;

      writeFileSync(join(projectDir, 'astro.config.mjs'), astroConfig);

      // Generate .env.template
      const envTemplate = `# Sanity CMS
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_token

# Analytics
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Newsletter (optional)
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=

# Deployment
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
`;

      writeFileSync(join(projectDir, '.env.template'), envTemplate);

      // Generate homepage
      const homepage = `---
import BaseLayout from '@podcast-framework/core/layouts/BaseLayout.astro';

const podcastInfo = {
  _id: 'temp',
  _type: 'podcast' as const,
  name: '${projectName}',
  tagline: '${answers.tagline || ''}',
  description: '${answers.description || ''}',
  isActive: true
};
---

<BaseLayout
  title="${projectName} - Home"
  description="${answers.description || 'A great podcast'}"
  podcastInfo={podcastInfo}
>
  <main class="max-w-4xl mx-auto px-4 py-12 flex-grow">
    <h1 class="text-4xl font-bold mb-4">Welcome to ${projectName}</h1>
    <p class="text-lg text-gray-600 mb-8">
      ${answers.description || 'Your podcast description goes here'}
    </p>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 class="font-semibold mb-2">🎉 Your podcast is ready!</h2>
      <p class="text-sm text-gray-700 mb-4">
        This project was created with @podcast-framework/cli
      </p>
      <p class="text-sm text-gray-700">
        Next steps:
      </p>
      <ol class="text-sm text-gray-700 list-decimal list-inside space-y-1 mt-2">
        <li>Set up Sanity CMS project</li>
        <li>Configure environment variables</li>
        <li>Import your podcast feed</li>
        <li>Customize theme and components</li>
        <li>Deploy to Cloudflare Pages</li>
      </ol>
    </div>
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'index.astro'), homepage);

      // Generate README
      const readme = `# ${projectName}

${answers.description || 'A podcast website built with @podcast-framework'}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Setup

1. Create Sanity project at https://sanity.io/manage
2. Copy \`.env.template\` to \`.env.local\`
3. Add your Sanity project ID and other credentials
4. Run \`npm run dev\`

## Documentation

- Framework Docs: https://github.com/rejected-media/podcast-framework
- Component Reference: @podcast-framework/core/COMPONENTS.md

## License

MIT
`;

      writeFileSync(join(projectDir, 'README.md'), readme);

      // Generate sanity.cli.ts
      const sanityCliConfig = `/**
 * Sanity CLI Configuration
 *
 * SETUP REQUIRED:
 * Replace 'your-project-id' with your actual Sanity project ID
 * This is required for deploying your Studio to sanity.studio
 */

import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "your-project-id", // TODO: Replace with your Sanity project ID
    dataset: "production",
  },
});
`;

      writeFileSync(join(projectDir, 'sanity.cli.ts'), sanityCliConfig);

      spinner.succeed(chalk.green('Project created successfully!'));

      // Success message
      console.log('');
      console.log(chalk.bold('📁 Project created at:'), chalk.cyan(projectSlug));
      console.log('');
      console.log(chalk.bold('Next steps:'));
      console.log(chalk.gray(`  cd ${projectSlug}`));

      if (!options.skipInstall) {
        console.log(chalk.gray(`  npm install`));
      }

      console.log(chalk.gray(`  npm run dev`));
      console.log('');
      console.log(chalk.bold('Setup guide:'));
      console.log(chalk.gray('  1. Create Sanity project at https://sanity.io/manage'));
      console.log(chalk.gray('  2. Copy .env.template to .env.local'));
      console.log(chalk.gray('  3. Add your Sanity project ID'));
      console.log(chalk.gray('  4. Start dev server: npm run dev'));
      console.log('');

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
      process.exit(1);
    }
  });
