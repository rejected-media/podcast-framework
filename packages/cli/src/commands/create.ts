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
  yes?: boolean;
}

export const createCommand = new Command('create')
  .description('Create a new podcast project')
  .argument('[name]', 'Project name (will prompt if not provided)')
  .option('-t, --template <template>', 'Template to use (default: basic)')
  .option('--skip-install', 'Skip npm install')
  .option('-y, --yes', 'Skip all prompts and use defaults')
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

    // Gather project info (minimal prompts)
    let description = `${projectName} - A podcast built with @podcast-framework`;

    // Only prompt if not using --yes flag
    if (!options.yes) {
      console.log('');
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'Short description (press Enter to use default):',
          default: description,
        }
      ]);
      description = answers.description || description;
    }

    // Use sensible defaults for all features
    const projectConfig = {
      description,
      tagline: '', // Can be added later in config
      includeNewsletter: true,
      includeContributions: true,
      includeSearch: true,
    };

    // Create project
    const spinner = ora('Creating project structure...').start();

    try {
      // Create directories
      mkdirSync(projectDir);
      mkdirSync(join(projectDir, 'src'));
      mkdirSync(join(projectDir, 'src', 'layouts'));
      mkdirSync(join(projectDir, 'src', 'pages'));
      mkdirSync(join(projectDir, 'src', 'pages', 'episodes'));
      mkdirSync(join(projectDir, 'src', 'pages', 'guests'));
      mkdirSync(join(projectDir, 'src', 'pages', 'guest'));
      mkdirSync(join(projectDir, 'src', 'pages', 'api'));
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
          'dev:sanity': 'cd sanity && npx sanity dev',
          'import:episodes': 'podcast-framework import-rss',
        },
        dependencies: {
          '@rejected-media/podcast-framework-core': '^0.1.2',
          '@rejected-media/podcast-framework-sanity-schema': '^1.1.0',
          '@rejected-media/podcast-framework-cli': '^0.1.17',
          '@astrojs/tailwind': '^5.1.0',
          'astro': '^5.1.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0',
          'resend': '^4.0.0',
          'sanity': '^4.0.0',
          '@sanity/client': '^6.0.0',
          '@sanity/vision': '^3.0.0',
          'styled-components': '^6.1.15',
          'tailwindcss': '^3.4.0'
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
  tagline: "${projectConfig.tagline}",
  description: "${projectConfig.description}",
  domain: "${projectSlug}.com",
  url: "https://${projectSlug}.com",

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
  },

  features: {
    transcripts: true,
    newsletter: ${projectConfig.includeNewsletter},
    contributions: ${projectConfig.includeContributions},
    search: ${projectConfig.includeSearch},
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
      const astroConfig = `import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://${projectSlug}.com',
  integrations: [tailwind()],
});
`;

      writeFileSync(join(projectDir, 'astro.config.mjs'), astroConfig);

      // Generate tailwind.config.mjs
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/@rejected-media/podcast-framework-core/**/*.astro',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

      writeFileSync(join(projectDir, 'tailwind.config.mjs'), tailwindConfig);

      // Generate .env.template
      const envTemplate = `# Sanity CMS (Required)
# Get your project ID from https://sanity.io/manage
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-01-01

# Sanity Write Token (Required for Sanity Studio and RSS import)
SANITY_TOKEN=your_write_token

# Site URL (Required for production)
PUBLIC_SITE_URL=https://your-podcast.com

# RSS Import (Optional)
# Add your podcast RSS feed URL to import episodes
RSS_FEED_URL=https://feeds.transistor.fm/your-show

# Analytics (Optional)
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Newsletter (Optional - ConvertKit)
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=

# Contributions (Optional - Resend)
RESEND_API_KEY=
NOTIFICATION_EMAIL=your@email.com

# Error Tracking (Optional - Sentry)
SENTRY_DSN=

# Deployment (Optional - Cloudflare)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
`;

      writeFileSync(join(projectDir, '.env.template'), envTemplate);

      // Generate BaseLayout wrapper
      const baseLayout = `---
/**
 * Base Layout for Podcast Site
 *
 * This layout imports global styles and uses the framework's BaseLayout
 */
import FrameworkBaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import type { Theme, PodcastInfo } from '@rejected-media/podcast-framework-core';

export interface Props {
  title: string;
  description: string;
  ogImage?: string;
  podcastInfo?: PodcastInfo;
  theme?: Theme;
  gaId?: string;
  structuredData?: Record<string, any>;
}

const props = Astro.props;
---

<FrameworkBaseLayout {...props}>
  <slot name="head" slot="head" />
  <slot />
</FrameworkBaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'layouts', 'BaseLayout.astro'), baseLayout);

      // Generate homepage
      const homepage = `---
/**
 * Homepage - CMS-Driven Configuration
 *
 * This homepage uses Sanity CMS to control which sections are displayed.
 * Configure your homepage from Sanity Studio under "Homepage Configuration".
 */
export const prerender = true;

import BaseLayout from '../layouts/BaseLayout.astro';
import {
  getPodcast,
  getFeatured,
  getEpisodes,
  getHomepageConfig,
  getTheme
} from '@rejected-media/podcast-framework-core';
import FeaturedEpisodesCarousel from '@rejected-media/podcast-framework-core/components/FeaturedEpisodesCarousel.astro';
import NewsletterSignup from '@rejected-media/podcast-framework-core/components/NewsletterSignup.astro';
import { formatDate, stripHTML } from '@rejected-media/podcast-framework-core';

// Fetch data
const podcastInfo = await getPodcast();
const featuredEpisodes = await getFeatured();
const episodes = await getEpisodes({ orderBy: 'desc' });
const homepageConfig = await getHomepageConfig();
const theme = await getTheme();

const latestEpisode = episodes?.[0];
const siteName = podcastInfo?.name || "${projectName}";
const siteDescription = podcastInfo?.description || "${projectConfig.description}";
const spotifyUrl = podcastInfo?.spotifyUrl || "#";
---

<BaseLayout
  title={\`\${siteName}\${podcastInfo?.tagline ? \` - \${podcastInfo.tagline}\` : ""}\`}
  description={siteDescription}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <main class="flex-grow">
    <!-- Hero Section -->
    {(!homepageConfig?.hero || homepageConfig?.hero?.enabled !== false) && (
      <section class="bg-gradient-to-b from-cyan-100 to-white py-20">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4 text-gray-900">
            {homepageConfig?.hero?.customHeadline || siteName}
          </h1>
          <p class="text-xl mb-8 text-gray-600">
            {homepageConfig?.hero?.customDescription || siteDescription}
          </p>
          <div class="flex gap-4 justify-center flex-wrap">
            {spotifyUrl && spotifyUrl !== "#" && (
              <a
                href={spotifyUrl}
                style="background: rgb(var(--color-primary)); color: white;"
                class="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen on Spotify
              </a>
            )}
            {latestEpisode && (
              <a
                href={\`/episodes/\${latestEpisode.slug.current}\`}
                style="border-color: rgb(var(--color-primary)); color: rgb(var(--color-primary));"
                class="px-6 py-3 bg-transparent border-2 rounded-lg font-semibold hover:opacity-75 transition"
              >
                Latest Episode
              </a>
            )}
          </div>
        </div>
      </section>
    )}

    <!-- Featured Episodes Carousel -->
    {(!homepageConfig?.featuredEpisodes || homepageConfig?.featuredEpisodes?.enabled !== false) && featuredEpisodes && featuredEpisodes.length > 0 && (
      <FeaturedEpisodesCarousel
        episodes={featuredEpisodes}
        autoProgressInterval={homepageConfig?.featuredEpisodes?.interval ? homepageConfig.featuredEpisodes.interval * 1000 : 6000}
      />
    )}

    <!-- Recent Episodes Section -->
    {(!homepageConfig?.recentEpisodes || homepageConfig?.recentEpisodes?.enabled !== false) && latestEpisode && (
      <section class="max-w-6xl mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold mb-8 text-gray-900">
          {homepageConfig?.recentEpisodes?.title || 'Latest Episode'}
        </h2>
        <a
          href={\`/episodes/\${latestEpisode.slug.current}\`}
          class="block bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200 hover:border-blue-300 transition p-6"
        >
          <div class="flex flex-col md:flex-row items-start gap-6">
            {latestEpisode.coverImage?.url ? (
              <img
                src={latestEpisode.coverImage.url}
                alt={latestEpisode.title}
                class="flex-shrink-0 w-32 h-32 rounded-lg object-cover"
              />
            ) : podcastInfo?.logo?.url ? (
              <img
                src={podcastInfo.logo.url}
                alt={siteName}
                class="flex-shrink-0 w-32 h-32 rounded-lg object-cover"
              />
            ) : (
              <div class="flex-shrink-0 w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center">
                <span class="text-3xl font-bold text-blue-600">{latestEpisode.episodeNumber}</span>
              </div>
            )}
            <div class="flex-grow min-w-0">
              <p class="text-sm uppercase tracking-wide mb-1 text-gray-500">
                Episode {latestEpisode.episodeNumber}
              </p>
              <h3 class="text-xl font-semibold mb-2 text-gray-900">
                {latestEpisode.title}
              </h3>
              <p class="mb-3 line-clamp-2 text-gray-600">
                {stripHTML(latestEpisode.description)}
              </p>
              <div class="flex gap-4 text-sm text-gray-500">
                <span>{formatDate(latestEpisode.publishDate)}</span>
                {latestEpisode.duration && (
                  <>
                    <span>•</span>
                    <span>{latestEpisode.duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </a>
      </section>
    )}

    <!-- About Section -->
    {(!homepageConfig?.about || homepageConfig?.about?.enabled !== false) && (
      <section class="bg-gray-50 py-16">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold mb-6 text-gray-900">
            {homepageConfig?.about?.title || 'About the Show'}
          </h2>
          {homepageConfig?.about?.content ? (
            <p class="text-lg leading-relaxed text-gray-700">
              {homepageConfig.about.content}
            </p>
          ) : (
            <>
              {siteDescription && (
                <p class="text-lg leading-relaxed mb-4 text-gray-700">
                  {siteDescription}
                </p>
              )}
              <p class="text-lg leading-relaxed text-gray-700">
                Each episode dives into the topics and conversations that matter most
                to our community, bringing you insights and perspectives from across
                the ecosystem.
              </p>
            </>
          )}
        </div>
      </section>
    )}

    <!-- Subscribe Section -->
    {(!homepageConfig?.subscribe || homepageConfig?.subscribe?.enabled !== false) && (
      <section class="py-16">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-3 text-gray-900">
              {homepageConfig?.subscribe?.title || \`Subscribe to \${siteName}\`}
            </h2>
            <p class="text-lg text-gray-600">
              {homepageConfig?.subscribe?.description || 'Get notified when new episodes are released'}
            </p>
          </div>

          <!-- Newsletter Signup (if enabled) -->
          {podcastInfo?.isActive && podcastInfo?.newsletterEnabled && (
            <div class="mb-8 flex justify-center">
              <NewsletterSignup variant="inline" />
            </div>
          )}

          <div class="flex flex-wrap gap-4 justify-center">
            {podcastInfo?.spotifyUrl && (
              <a
                href={podcastInfo.spotifyUrl}
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
            )}
            {podcastInfo?.appleUrl && (
              <a
                href={podcastInfo.appleUrl}
                class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zM12 5.455c-1.8 0-3.273 1.472-3.273 3.272 0 1.801 1.472 3.273 3.273 3.273s3.273-1.472 3.273-3.273c0-1.8-1.472-3.272-3.273-3.272zm0 1.636c.905 0 1.636.731 1.636 1.636 0 .905-.731 1.637-1.636 1.637-.905 0-1.636-.732-1.636-1.637 0-.905.731-1.636 1.636-1.636zm0 4.364c-2.168 0-3.927 1.759-3.927 3.927v2.182c0 .452.366.818.818.818h6.218c.452 0 .818-.366.818-.818v-2.182c0-2.168-1.759-3.927-3.927-3.927z"/>
                </svg>
                Apple Podcasts
              </a>
            )}
            {podcastInfo?.youtubeUrl && (
              <a
                href={podcastInfo.youtubeUrl}
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            )}
            {podcastInfo?.rssUrl && (
              <a
                href={podcastInfo.rssUrl}
                class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
                </svg>
                RSS Feed
              </a>
            )}
          </div>
        </div>
      </section>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'index.astro'), homepage);

      // Generate episodes list page
      const episodesPage = `---
export const prerender = true;

/**
 * Episodes Archive Page
 *
 * Displays all episodes with:
 * - Search functionality (via EpisodeSearch component)
 * - Sort toggle (newest/oldest first)
 * - Episode cards with covers, titles, descriptions
 * - Active/archived podcast status message
 */

import {
  getEpisodes,
  getPodcast,
  getTheme,
  formatDate,
  stripHTML
} from '@rejected-media/podcast-framework-core';
import BaseLayout from '../../layouts/BaseLayout.astro';
import EpisodeSearch from '@rejected-media/podcast-framework-core/components/EpisodeSearch.astro';

// Fetch all episodes and podcast info from Sanity
const episodes = await getEpisodes();
const podcastInfo = await getPodcast();
const theme = await getTheme();
const siteName = podcastInfo?.name || "${projectName}";
---

<BaseLayout
  title={\`All Episodes - \${siteName}\`}
  description={\`Browse all episodes of \${siteName}. Deep conversations with builders, researchers, and visionaries.\`}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <main class="max-w-6xl mx-auto px-4 py-12 flex-grow">
    <!-- Archive or Coming Soon Message -->
    {podcastInfo?.isActive ? (
      <div class="mb-8 text-center text-gray-500">
        <p class="text-lg">More episodes coming soon...</p>
        <p class="text-sm mt-2">Subscribe to get notified when new episodes are released</p>
      </div>
    ) : (
      <div class="mb-8 text-center text-gray-500 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p class="text-lg font-semibold">This podcast has concluded.</p>
        <p class="text-sm mt-2">Explore the complete archive of episodes below</p>
      </div>
    )}

    <!-- Page Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">All Episodes</h1>
      <p class="text-lg text-gray-600">
        {podcastInfo?.tagline || 'Explore all episodes and conversations'}
      </p>
    </div>

    <!-- Search Component -->
    <EpisodeSearch />

    <!-- Sort Toggle -->
    <div class="flex justify-end mb-6">
      <div class="inline-flex rounded-lg border border-gray-300 bg-white">
        <button
          id="sort-newest"
          style="background: rgb(var(--color-primary)); color: white;"
          class="px-4 py-2 text-sm font-medium rounded-l-lg transition-colors"
          data-sort="newest"
        >
          Newest First
        </button>
        <button
          id="sort-oldest"
          class="px-4 py-2 text-sm font-medium rounded-r-lg transition-colors text-gray-700 hover:bg-gray-50"
          data-sort="oldest"
        >
          Oldest First
        </button>
      </div>
    </div>

    <!-- Episodes Grid -->
    <div id="episodes-container" class="grid grid-cols-1 gap-6">
      {episodes.map((episode) => (
        <a
          href={\`/episodes/\${episode.slug.current}\`}
          class="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
          data-episode-card
          data-episode-title={episode.title}
          data-episode-description={stripHTML(episode.description)}
          data-episode-guests={episode.guests?.map(g => g.name).join(', ') || ''}
        >
          <div class="flex items-start gap-6">
            <!-- Episode Cover Image or Podcast Logo -->
            {episode.coverImage?.url ? (
              <img
                src={episode.coverImage.url}
                alt={episode.title}
                class="flex-shrink-0 w-20 h-20 rounded-lg object-cover"
              />
            ) : podcastInfo?.logo?.url ? (
              <img
                src={podcastInfo.logo.url}
                alt={podcastInfo.name}
                class="flex-shrink-0 w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div class="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center" style="background: rgba(var(--color-primary), 0.1);">
                <span class="text-2xl font-bold" style="color: rgb(var(--color-primary));">{episode.episodeNumber}</span>
              </div>
            )}

            <!-- Episode Content -->
            <div class="flex-grow">
              <p class="text-sm text-gray-500 uppercase tracking-wide mb-1">
                Episode {episode.episodeNumber}
              </p>
              <h2 class="text-2xl font-semibold text-gray-900 mb-2 transition" style="transition: color 0.2s;">
                {episode.title}
              </h2>
              <p class="text-gray-600 mb-3 line-clamp-2">
                {stripHTML(episode.description)}
              </p>
              <div class="flex gap-4 text-sm text-gray-500">
                <span>{formatDate(episode.publishDate)}</span>
                {episode.duration && (
                  <>
                    <span>•</span>
                    <span>{episode.duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </main>

  <script>
    // Sort toggle functionality
    const sortNewestBtn = document.getElementById('sort-newest');
    const sortOldestBtn = document.getElementById('sort-oldest');
    const episodesContainer = document.getElementById('episodes-container');

    function toggleSortButtons(activeSort: string) {
      if (activeSort === 'newest') {
        if (sortNewestBtn) {
          sortNewestBtn.style.background = 'rgb(var(--color-primary))';
          sortNewestBtn.style.color = 'white';
        }
        if (sortOldestBtn) {
          sortOldestBtn.style.background = '';
          sortOldestBtn.style.color = '';
          sortOldestBtn.classList.add('text-gray-700', 'hover:bg-gray-50');
        }
      } else {
        if (sortOldestBtn) {
          sortOldestBtn.style.background = 'rgb(var(--color-primary))';
          sortOldestBtn.style.color = 'white';
        }
        if (sortNewestBtn) {
          sortNewestBtn.style.background = '';
          sortNewestBtn.style.color = '';
          sortNewestBtn.classList.add('text-gray-700', 'hover:bg-gray-50');
        }
      }
    }

    function sortEpisodes(order: string) {
      const episodes = Array.from(episodesContainer?.children || []);

      episodes.sort((a, b) => {
        // Extract episode number from the "Episode X" text
        const aText = a.querySelector('.text-sm.uppercase')?.textContent || '';
        const bText = b.querySelector('.text-sm.uppercase')?.textContent || '';

        const aNum = parseInt(aText.replace(/[^0-9]/g, '') || '0');
        const bNum = parseInt(bText.replace(/[^0-9]/g, '') || '0');

        return order === 'newest' ? bNum - aNum : aNum - bNum;
      });

      // Clear container and re-append sorted episodes
      if (episodesContainer) {
        episodesContainer.innerHTML = '';
        episodes.forEach(episode => episodesContainer.appendChild(episode));
      }

      toggleSortButtons(order);
    }

    sortNewestBtn?.addEventListener('click', () => sortEpisodes('newest'));
    sortOldestBtn?.addEventListener('click', () => sortEpisodes('oldest'));
  </script>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'episodes', 'index.astro'), episodesPage);

      // Generate individual episode page
      const episodePage = `---
export const prerender = true;

/**
 * Episode Detail Page
 *
 * Displays individual episode with:
 * - Episode metadata (title, number, date, duration)
 * - Hosts and guests with photos
 * - Description
 * - Transcript viewer
 * - Audio player (Spotify embed)
 * - Platform links (Spotify, Apple, YouTube, RSS)
 * - Show notes
 */

import {
  getStaticPathsForEpisodes,
  getEpisode,
  getPodcast,
  getTheme,
  formatDate,
  stripHTML
} from '@rejected-media/podcast-framework-core';
import type { Episode } from '@rejected-media/podcast-framework-core';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TranscriptViewer from '@rejected-media/podcast-framework-core/components/TranscriptViewer.astro';

// Generate static paths for all episodes at build time
export async function getStaticPaths() {
  return await getStaticPathsForEpisodes();
}

// Get episode from props (passed from getStaticPaths)
const { episode } = Astro.props as { episode: Episode };

// Fetch podcast info and theme for branding
const podcastInfo = await getPodcast();
const theme = await getTheme();
const siteName = podcastInfo?.name || "${projectName}";

// Extract Spotify episode ID from spotifyLink and build embed URL
let spotifyEmbedUrl = podcastInfo?.spotifyShowId
  ? \`https://open.spotify.com/embed/show/\${podcastInfo.spotifyShowId}?utm_source=generator\`
  : '';

if (episode.spotifyLink) {
  // Extract episode ID from URL like: https://open.spotify.com/episode/5vQKPYz3yNPqVYZqWqWqWq
  const episodeIdMatch = episode.spotifyLink.match(/episode\\/([a-zA-Z0-9]+)/);
  if (episodeIdMatch && episodeIdMatch[1]) {
    spotifyEmbedUrl = \`https://open.spotify.com/embed/episode/\${episodeIdMatch[1]}?utm_source=generator\`;
  }
}

// Prepare meta tags for SEO
const metaDescription = stripHTML(episode.description).substring(0, 160);
const pageTitle = \`\${episode.title} - \${siteName}\`;
// OG Image: Prefer episode cover, fallback to podcast logo
// If both are undefined, BaseLayout will use its built-in fallback image
const ogImage = episode.coverImage?.url || podcastInfo?.logo?.url;
---

<BaseLayout
  title={pageTitle}
  description={metaDescription}
  ogImage={ogImage}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-4 py-12 flex-grow">
    <!-- Episode Header -->
    <div class="mb-8">
      <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">
        Episode {episode.episodeNumber}
      </p>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        {episode.title}
      </h1>
      <div class="flex gap-4 text-sm text-gray-600">
        <span>{formatDate(episode.publishDate)}</span>
        {episode.duration && (
          <>
            <span>•</span>
            <span>{episode.duration}</span>
          </>
        )}
      </div>
    </div>

    <!-- Hosts and Guests Section -->
    {((episode.hosts?.length ?? 0) > 0 || (episode.guests?.length ?? 0) > 0) && (
      <div class="mb-8 flex flex-col md:flex-row gap-6 md:items-start">
        <!-- Hosts Section -->
        {episode.hosts && episode.hosts.length > 0 && (
          <div>
            <h2 class="text-lg font-semibold mb-3">{episode.hosts.length === 1 ? 'Host' : 'Hosts'}</h2>
            <div class="flex flex-wrap gap-4">
              {episode.hosts.map((host) => (
                <div class="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                  {host.photo?.url && (
                    <img
                      src={host.photo.url}
                      alt={host.name}
                      class="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p class="font-semibold text-gray-900">{host.name}</p>
                    {(host.twitter || host.website || host.linkedin) && (
                      <div class="flex gap-2 mt-1">
                        {host.twitter && (
                          <a
                            href={\`https://twitter.com/\${host.twitter}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-xs text-blue-600 hover:text-blue-800"
                          >
                            @{host.twitter}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <!-- Guests Section -->
        {episode.guests && episode.guests.length > 0 && (
          <div>
            <h2 class="text-lg font-semibold mb-3">{episode.guests.length === 1 ? 'Guest' : 'Guests'}</h2>
            <div class="flex flex-wrap gap-4">
              {episode.guests.map((guest) => (
                <a
                  href={\`/guest/\${guest.slug.current}\`}
                  class="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {guest.photo?.url && (
                    <img
                      src={guest.photo.url}
                      alt={guest.name}
                      class="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{guest.name}</p>
                    {(guest.twitter || guest.website || guest.linkedin) && (
                      <div class="flex gap-2 mt-1">
                        {guest.twitter && (
                          <span class="text-xs text-gray-500">
                            @{guest.twitter}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    <!-- Episode Description -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">About This Episode</h2>
      <div class="text-gray-700 leading-relaxed prose prose-blue max-w-none [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800" set:html={episode.description} />
    </div>

    <!-- Transcript Viewer -->
    {(episode.transcript || episode.transcriptSegments) && (
      <TranscriptViewer
        transcript={episode.transcript}
        segments={episode.transcriptSegments}
        episodeNumber={episode.episodeNumber}
      />
    )}

    <!-- Audio Player Section -->
    {spotifyEmbedUrl && (
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <iframe
          style="border-radius:12px"
          src={spotifyEmbedUrl}
          width="100%"
          height="232"
          frameborder="0"
          allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    )}

    <!-- Platform Links -->
    {(episode.spotifyLink || episode.youtubeLink || episode.applePodcastLink || podcastInfo?.rssUrl) && (
      <div class="mb-12">
        <h3 class="text-lg font-semibold mb-3 text-center">Listen to this episode on:</h3>
        <div class="flex flex-wrap gap-3 justify-center">
          {episode.spotifyLink && (
            <a
              href={episode.spotifyLink}
              class="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </a>
          )}
          {episode.applePodcastLink && (
            <a
              href={episode.applePodcastLink}
              class="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zM12 5.455c-1.8 0-3.273 1.472-3.273 3.272 0 1.801 1.472 3.273 3.273 3.273s3.273-1.472 3.273-3.273c0-1.8-1.472-3.272-3.273-3.272zm0 1.636c.905 0 1.636.731 1.636 1.636 0 .905-.731 1.637-1.636 1.637-.905 0-1.636-.732-1.636-1.637 0-.905.731-1.636 1.636-1.636zm0 4.364c-2.168 0-3.927 1.759-3.927 3.927v2.182c0 .452.366.818.818.818h6.218c.452 0 .818-.366.818-.818v-2.182c0-2.168-1.759-3.927-3.927-3.927z"/>
              </svg>
              Apple Podcasts
            </a>
          )}
          {episode.youtubeLink && (
            <a
              href={episode.youtubeLink}
              class="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>
          )}
          {podcastInfo?.rssUrl && (
            <a
              href={podcastInfo.rssUrl}
              class="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
              </svg>
              RSS
            </a>
          )}
        </div>
      </div>
    )}

    <!-- Show Notes (if available) -->
    {episode.showNotes && episode.showNotes.length > 0 && (
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Show Notes</h2>
        <div class="prose prose-blue max-w-none">
          {episode.showNotes.map((block: any) => {
            if (block._type === 'block') {
              return (
                <p class="text-gray-700 mb-4">
                  {block.children?.map((child: any) => child.text).join('')}
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'episodes', '[slug].astro'), episodePage);

      // Generate guests directory page
      const guestsPage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getGuests, getTheme } from '@rejected-media/podcast-framework-core';

export const prerender = true;

const podcastInfo = await getPodcast();
const guests = await getGuests();
const theme = await getTheme();

const layoutProps = {
  title: \`Guests - \${podcastInfo?.name || '${projectName}'}\`,
  description: \`Meet the guests of \${podcastInfo?.name || '${projectName}'}\`,
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-6xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">Guests</h1>

    {guests && guests.length > 0 ? (
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guests.map((guest) => (
          <a href={\`/guest/\${guest.slug.current}\`} class="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            {guest.photo?.url && (
              <img src={guest.photo.url} alt={guest.name} class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
            )}
            <h2 class="text-xl font-semibold text-center mb-2">{guest.name}</h2>
            {guest.title && <p class="text-sm text-gray-600 text-center mb-3">{guest.title}</p>}
            {guest.bio && <p class="text-sm text-gray-600 line-clamp-3">{guest.bio}</p>}
          </a>
        ))}
      </div>
    ) : (
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <p class="text-gray-700">No guests found. Add guests in Sanity Studio!</p>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'guests', 'index.astro'), guestsPage);

      // Generate individual guest page
      const guestPage = `---
export const prerender = true;

/**
 * Guest Profile Page
 *
 * Displays individual guest with:
 * - Guest photo, name, bio
 * - Social media links (Twitter, LinkedIn, Website)
 * - List of episodes featuring this guest
 */

import {
  getStaticPathsForGuests,
  getGuest,
  getPodcast,
  getTheme,
  formatDate,
  stripHTML
} from '@rejected-media/podcast-framework-core';
import type { Guest } from '@rejected-media/podcast-framework-core';
import BaseLayout from '../../layouts/BaseLayout.astro';

// Generate static paths for all guests at build time
export async function getStaticPaths() {
  return await getStaticPathsForGuests();
}

// Get the slug from params
const { slug } = Astro.params;

// Fetch guest data with episodes
const guest = await getGuest(slug as string);

// Handle guest not found
if (!guest) {
  return new Response('Guest not found', { status: 404 });
}

// Fetch podcast info and theme for branding
const podcastInfo = await getPodcast();
const theme = await getTheme();
const siteName = podcastInfo?.name || "${projectName}";

// OG Image: Prefer guest photo, fallback to podcast logo
// If both are undefined, BaseLayout will use its built-in fallback image
const ogImage = guest.photo?.url || podcastInfo?.logo?.url;
---

<BaseLayout
  title={\`\${guest.name} - \${siteName}\`}
  description={guest.bio || \`\${guest.name} has appeared on \${siteName}. Explore their episodes and background.\`}
  ogImage={ogImage}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <main class="max-w-4xl mx-auto px-4 py-12 flex-grow">
    <!-- Guest Header -->
    <div class="flex flex-col md:flex-row gap-8 mb-12">
      <!-- Photo -->
      <div class="flex-shrink-0">
        {guest.photo?.url ? (
          <img
            src={guest.photo.url}
            alt={guest.name}
            class="w-48 h-48 rounded-lg object-cover shadow-md"
          />
        ) : (
          <div class="w-48 h-48 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
            <span class="text-6xl font-bold text-blue-600">
              {guest.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <!-- Guest Info -->
      <div class="flex-grow">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{guest.name}</h1>

        {guest.bio && (
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            {guest.bio}
          </p>
        )}

        <!-- Social Links -->
        <div class="flex flex-wrap gap-4">
          {guest.twitter && (
            <a
              href={guest.twitter.startsWith('http') ? guest.twitter : \`https://twitter.com/\${guest.twitter.replace('@', '')}\`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </a>
          )}

          {guest.linkedin && (
            <a
              href={guest.linkedin.startsWith('http') ? guest.linkedin : \`https://linkedin.com/in/\${guest.linkedin}\`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          )}

          {guest.website && (
            <a
              href={guest.website.startsWith('http') ? guest.website : \`https://\${guest.website}\`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              Website
            </a>
          )}
        </div>
      </div>
    </div>

    <!-- Episodes Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Episodes ({guest.episodes?.length || 0})
      </h2>

      {guest.episodes && guest.episodes.length > 0 ? (
        <div class="space-y-6">
          {guest.episodes.map((episode) => (
            <a
              href={\`/episodes/\${episode.slug.current}\`}
              class="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 group"
            >
              <div class="flex gap-6">
                {/* Episode Cover */}
                {episode.coverImage?.url && (
                  <div class="flex-shrink-0">
                    <img
                      src={episode.coverImage.url}
                      alt={episode.title}
                      class="w-24 h-24 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Episode Info */}
                <div class="flex-grow">
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <h3 class="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Episode {episode.episodeNumber}: {episode.title}
                    </h3>
                  </div>

                  {episode.description && (
                    <p class="text-gray-600 line-clamp-2 mb-3">
                      {stripHTML(episode.description)}
                    </p>
                  )}

                  <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                    {episode.publishDate && (
                      <span>{formatDate(episode.publishDate)}</span>
                    )}
                    {episode.duration && (
                      <>
                        <span>•</span>
                        <span>{episode.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p class="text-gray-500">No episodes found for this guest.</p>
      )}
    </div>

    <!-- Back Link -->
    <div class="mt-8">
      <a
        href="/guests"
        class="inline-flex items-center gap-2 font-medium hover:opacity-75 transition"
        style="color: rgb(var(--color-primary));"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to all guests
      </a>
    </div>
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'guest', '[slug].astro'), guestPage);

      // Generate about page
      const aboutPage = `---
export const prerender = true;

/**
 * About Page
 *
 * Dynamically configured via Sanity CMS with:
 * - About section (CMS-configurable content)
 * - Hosts section (cards or list layout)
 * - Mission section
 * - Subscribe CTA
 * - Community section
 * - Custom sections
 * - Fallback content if no CMS config exists
 */

import { getPodcast, getAboutPageConfig, getTheme } from '@rejected-media/podcast-framework-core';
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockContent from '@rejected-media/podcast-framework-core/components/BlockContent.astro';

// Fetch data from Sanity
const podcastInfo = await getPodcast();
const aboutConfig = await getAboutPageConfig();
const theme = await getTheme();
const siteName = podcastInfo?.name || "${projectName}";

// Fallback to default content if no config exists
const hasConfig = !!aboutConfig;
---
<BaseLayout
  title={\`About - \${siteName}\`}
  description={\`Learn about \${siteName}, exploring topics and conversations with builders, researchers, and visionaries.\`}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <main class="max-w-4xl mx-auto px-4 py-12 flex-grow">
    <!-- Page Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">About {siteName}</h1>
    </div>

    {hasConfig ? (
      <>
        <!-- CMS-Configured About Content -->

        <!-- About Section -->
        {aboutConfig.aboutSection?.enabled && (
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-semibold mb-4">{aboutConfig.aboutSection.title}</h2>
            {aboutConfig.aboutSection.content && (
              <BlockContent blocks={aboutConfig.aboutSection.content} />
            )}
          </div>
        )}

        <!-- Hosts Section -->
        {aboutConfig.hostsSection?.enabled && aboutConfig.hostsSection.hosts && aboutConfig.hostsSection.hosts.length > 0 && (
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-semibold mb-4">
              {aboutConfig.hostsSection.title ||
                (aboutConfig.hostsSection.hosts.length === 1 ? 'The Host' : 'The Hosts')}
            </h2>

            {aboutConfig.hostsSection.layout === 'cards' ? (
              <div class="space-y-6">
                {aboutConfig.hostsSection.hosts.map((host: any) => (
                  <div class="flex flex-col md:flex-row items-start gap-4">
                    {host.photo?.url && (
                      <img
                        src={host.photo.url}
                        alt={host.name}
                        class="w-20 h-20 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div class="flex-1">
                      <h3 class="text-xl font-semibold mb-2">{host.name}</h3>
                      {host.bio && (
                        <p class="text-gray-700 mb-3">{host.bio}</p>
                      )}
                      <div class="flex gap-3">
                        {host.twitter && (
                          <a
                            href={\`https://twitter.com/\${host.twitter}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Twitter
                          </a>
                        )}
                        {host.website && (
                          <a
                            href={host.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Website
                          </a>
                        )}
                        {host.linkedin && (
                          <a
                            href={host.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div class="space-y-4">
                {aboutConfig.hostsSection.hosts.map((host: any) => (
                  <div>
                    <h3 class="text-lg font-semibold mb-1">{host.name}</h3>
                    {host.bio && (
                      <p class="text-gray-700">{host.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <!-- Mission Section -->
        {aboutConfig.missionSection?.enabled && (
          <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-semibold mb-4">{aboutConfig.missionSection.title}</h2>
            {aboutConfig.missionSection.content && (
              <BlockContent blocks={aboutConfig.missionSection.content} />
            )}
          </div>
        )}

        <!-- Custom Sections -->
        {aboutConfig.customSections && aboutConfig.customSections.length > 0 && (
          <>
            {aboutConfig.customSections
              .sort((a: any, b: any) => (a.order || 100) - (b.order || 100))
              .map((section: any) => (
                <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <h2 class="text-2xl font-semibold mb-4">{section.title}</h2>
                  <BlockContent blocks={section.content} />
                </div>
              ))}
          </>
        )}

        <!-- Subscribe CTA Section -->
        {aboutConfig.subscribeCTA?.enabled !== false && (
          <div class="bg-blue-50 rounded-lg p-8 text-center">
            <h2 class="text-2xl font-semibold mb-3">
              {aboutConfig.subscribeCTA?.customTitle ||
                (podcastInfo?.isActive ? \`Subscribe to \${siteName}\` : \`Listen to \${siteName}\`)}
            </h2>
            <p class="text-gray-600 mb-6">
              {aboutConfig.subscribeCTA?.customDescription ||
                (podcastInfo?.isActive
                  ? 'Get notified when new episodes are released'
                  : \`\${siteName} has concluded, but episodes are still available wherever you get your podcasts\`)}
            </p>
            <div class="flex flex-wrap gap-4 justify-center">
              {podcastInfo?.spotifyUrl && (
                <a
                  href={podcastInfo.spotifyUrl}
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Spotify
                </a>
              )}
              {podcastInfo?.appleUrl && (
                <a
                  href={podcastInfo.appleUrl}
                  class="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apple Podcasts
                </a>
              )}
              {podcastInfo?.youtubeUrl && (
                <a
                  href={podcastInfo.youtubeUrl}
                  class="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              )}
              {podcastInfo?.rssUrl && (
                <a
                  href={podcastInfo.rssUrl}
                  class="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  RSS Feed
                </a>
              )}
            </div>
          </div>
        )}

        <!-- Community Section -->
        {aboutConfig.communitySection?.enabled !== false && podcastInfo?.isActive && (
          <div class="mt-8 text-center">
            <p class="text-gray-600">
              {aboutConfig.communitySection?.customText || 'Want to contribute to the show?'}
              <a href="/contribute" class="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Share your ideas, suggest guests, or submit content
              </a>
            </p>
          </div>
        )}
      </>
    ) : (
      <>
        <!-- Default/Fallback Content (when no CMS config exists) -->

        <!-- About Section -->
        <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-4">The Show</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            {siteName} brings you deep conversations with interesting people and explores topics that matter.
          </p>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Each episode dives into meaningful discussions, making complex topics accessible without losing depth.
          </p>
          <p class="text-lg text-gray-700 leading-relaxed">
            Configure this page content in Sanity Studio under "About Page Configuration" to customize your about page.
          </p>
        </div>

        <!-- Host Section -->
        <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-4">The Host</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-4">
            Add host information in Sanity Studio to display host details here.
          </p>
        </div>

        <!-- Subscribe CTA -->
        <div class="bg-blue-50 rounded-lg p-8 text-center">
          {podcastInfo?.isActive ? (
            <>
              <h2 class="text-2xl font-semibold mb-3">Subscribe to {siteName}</h2>
              <p class="text-gray-600 mb-6">
                Get notified when new episodes are released
              </p>
            </>
          ) : (
            <>
              <h2 class="text-2xl font-semibold mb-3">Listen to {siteName}</h2>
              <p class="text-gray-600 mb-6">
                {siteName} has concluded, but episodes are still available wherever you get your podcasts
              </p>
            </>
          )}
          <div class="flex flex-wrap gap-4 justify-center">
            {podcastInfo?.spotifyUrl && (
              <a
                href={podcastInfo.spotifyUrl}
                class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Spotify
              </a>
            )}
            {podcastInfo?.appleUrl && (
              <a
                href={podcastInfo.appleUrl}
                class="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Podcasts
              </a>
            )}
            {podcastInfo?.youtubeUrl && (
              <a
                href={podcastInfo.youtubeUrl}
                class="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            )}
            {podcastInfo?.rssUrl && (
              <a
                href={podcastInfo.rssUrl}
                class="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                RSS Feed
              </a>
            )}
          </div>
        </div>

        <!-- Community Section (only show if podcast is active) -->
        {podcastInfo?.isActive && (
          <div class="mt-8 text-center">
            <p class="text-gray-600">
              Want to contribute to the show?
              <a href="/contribute" class="text-blue-600 hover:text-blue-700 font-medium">
                Share your ideas, suggest guests, or submit content
              </a>
            </p>
          </div>
        )}
      </>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'about.astro'), aboutPage);

      // Generate contribute page
      const contributePage = `---
export const prerender = true;

/**
 * Contribute Page
 *
 * Community contribution form with:
 * - Dynamic form fields based on contribution type
 * - Episode ideas, guest recommendations, questions, feedback
 * - Character count validation
 * - Spam protection (honeypot)
 * - Integration with ContributionService API route
 */

import { getPodcast, getTheme } from '@rejected-media/podcast-framework-core';
import BaseLayout from '../layouts/BaseLayout.astro';

const podcastInfo = await getPodcast();
const theme = await getTheme();
const siteName = podcastInfo?.name || "${projectName}";

// If podcast is not active, redirect to 404
if (!podcastInfo?.isActive) {
  return Astro.redirect("/404");
}
---


<BaseLayout
  title={\`Contribute - \${siteName}\`}
  description={\`Share your ideas and help shape the future of \${siteName}. Suggest episode topics, recommend guests, ask questions, or provide feedback.\`}
  podcastInfo={podcastInfo}
  theme={theme}
>
  <main class="max-w-3xl mx-auto px-4 py-12 flex-grow">
    <!-- Page Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Contribute to {siteName}</h1>
      <p class="text-lg text-gray-600">
        Share your ideas and help shape the future of the show
      </p>
    </div>

    <!-- Form -->
    <form id="contribute-form" class="bg-white rounded-lg shadow-md p-8 space-y-6">
      <!-- Contribution Type Selector -->
      <div>
        <label for="contributionType" class="block text-sm font-semibold text-gray-900 mb-2">
          What would you like to share? *
        </label>
        <select
          id="contributionType"
          name="contributionType"
          required
          aria-label="Contribution type"
          aria-describedby="contribution-type-hint"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a type...</option>
          <option value="episode-idea">Episode Idea</option>
          <option value="guest-recommendation">Guest Recommendation</option>
          <option value="question">Question for the Show</option>
          <option value="feedback">Feedback</option>
        </select>
        <p id="contribution-type-hint" class="sr-only">
          Select what type of contribution you'd like to make
        </p>
      </div>

      <!-- Dynamic Form Fields Container -->
      <div id="dynamic-fields"></div>

      <!-- Contact Information (Optional) -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Contact Information (Optional)</h3>
        <p class="text-sm text-gray-600 mb-4">
          Submissions can be anonymous. Providing your contact info allows us to follow up with you.
        </p>

        <div class="space-y-4">
          <div>
            <label for="submitterName" class="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="submitterName"
              name="submitterName"
              maxlength="100"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label for="submitterEmail" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="submitterEmail"
              name="submitterEmail"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      <!-- Honeypot (spam protection) -->
      <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />

      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          id="submit-button"
          style="background-color: rgb(var(--color-primary));"
          class="w-full px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>

      <!-- Status Messages -->
      <div id="form-message" class="hidden"></div>
    </form>
  </main>
</BaseLayout>

<script>
  // Form field templates
  const fieldTemplates = {
    'episode-idea': \\\`
      <div class="space-y-4">
        <div>
          <label for="episodeTopic" class="block text-sm font-medium text-gray-700 mb-1">
            Episode Topic * <span class="text-gray-500 text-xs">(max 100 characters)</span>
          </label>
          <input
            type="text"
            id="episodeTopic"
            name="episodeTopic"
            required
            maxlength="100"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., The Economics of MEV"
          />
        </div>

        <div>
          <label for="episodeDescription" class="block text-sm font-medium text-gray-700 mb-1">
            Description <span class="text-gray-500 text-xs">(optional, max 500 characters)</span>
          </label>
          <textarea
            id="episodeDescription"
            name="episodeDescription"
            maxlength="500"
            rows="5"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What would this episode cover? What makes it interesting?"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="episodeDescription-count">0 / 500</div>
        </div>

        <div>
          <label for="episodeRationale" class="block text-sm font-medium text-gray-700 mb-1">
            Why This Would Resonate <span class="text-gray-500 text-xs">(optional, max 300 characters)</span>
          </label>
          <textarea
            id="episodeRationale"
            name="episodeRationale"
            maxlength="300"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Why would the audience find this compelling?"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="episodeRationale-count">0 / 300</div>
        </div>
      </div>
    \\\`,

    'guest-recommendation': \\\`
      <div class="space-y-4">
        <div>
          <label for="guestName" class="block text-sm font-medium text-gray-700 mb-1">
            Guest Name * <span class="text-gray-500 text-xs">(max 100 characters)</span>
          </label>
          <input
            type="text"
            id="guestName"
            name="guestName"
            required
            maxlength="100"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Vitalik Buterin"
          />
        </div>

        <div>
          <label for="guestBackground" class="block text-sm font-medium text-gray-700 mb-1">
            Guest Background <span class="text-gray-500 text-xs">(optional, max 300 characters)</span>
          </label>
          <textarea
            id="guestBackground"
            name="guestBackground"
            maxlength="300"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What do they do? What's their expertise?"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="guestBackground-count">0 / 300</div>
        </div>

        <div>
          <label for="guestRationale" class="block text-sm font-medium text-gray-700 mb-1">
            Why This Guest <span class="text-gray-500 text-xs">(optional, max 300 characters)</span>
          </label>
          <textarea
            id="guestRationale"
            name="guestRationale"
            maxlength="300"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What makes them interesting for the show?"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="guestRationale-count">0 / 300</div>
        </div>

        <div>
          <label for="guestContact" class="block text-sm font-medium text-gray-700 mb-1">
            Guest Contact Info <span class="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="guestContact"
            name="guestContact"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Twitter, LinkedIn, email, or website"
          />
        </div>
      </div>
    \\\`,

    'question': \\\`
      <div class="space-y-4">
        <div>
          <label for="question" class="block text-sm font-medium text-gray-700 mb-1">
            Your Question * <span class="text-gray-500 text-xs">(max 500 characters)</span>
          </label>
          <textarea
            id="question"
            name="question"
            required
            maxlength="500"
            rows="5"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What would you like to know?"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="question-count">0 / 500</div>
        </div>
      </div>
    \\\`,

    'feedback': \\\`
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Feedback Type *
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                name="feedbackType"
                value="feedback"
                required
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2">Feedback</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                name="feedbackType"
                value="suggestion"
                required
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2">Suggestion</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                name="feedbackType"
                value="bug"
                required
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2">Issue/Bug Report</span>
            </label>
          </div>
        </div>

        <div>
          <label for="feedbackContent" class="block text-sm font-medium text-gray-700 mb-1">
            Your Feedback * <span class="text-gray-500 text-xs">(max 500 characters)</span>
          </label>
          <textarea
            id="feedbackContent"
            name="feedbackContent"
            required
            maxlength="500"
            rows="5"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts..."
          ></textarea>
          <div class="text-xs text-gray-500 mt-1" id="feedbackContent-count">0 / 500</div>
        </div>
      </div>
    \\\`
  };

  // Update character counters
  function setupCharCounter(fieldId: string, maxLength: number) {
    const field = document.getElementById(fieldId) as HTMLTextAreaElement;
    const counter = document.getElementById(\\\`\\\${fieldId}-count\\\`);

    if (field && counter) {
      field.addEventListener('input', () => {
        counter.textContent = \\\`\\\${field.value.length} / \\\${maxLength}\\\`;
      });
    }
  }

  // Update form fields based on contribution type
  const contributionTypeSelect = document.getElementById('contributionType') as HTMLSelectElement;
  const dynamicFields = document.getElementById('dynamic-fields') as HTMLDivElement;

  contributionTypeSelect?.addEventListener('change', () => {
    const selectedType = contributionTypeSelect.value;

    if (selectedType && fieldTemplates[selectedType as keyof typeof fieldTemplates]) {
      // SECURITY NOTE: Using innerHTML here is safe because fieldTemplates
      // are static strings defined in this file with no user input.
      // If this code is ever modified to include dynamic content, use
      // DOMPurify or create elements programmatically with createElement().
      dynamicFields.innerHTML = fieldTemplates[selectedType as keyof typeof fieldTemplates];

      // Setup character counters for the new fields
      if (selectedType === 'episode-idea') {
        setupCharCounter('episodeDescription', 500);
        setupCharCounter('episodeRationale', 300);
      } else if (selectedType === 'guest-recommendation') {
        setupCharCounter('guestBackground', 300);
        setupCharCounter('guestRationale', 300);
      } else if (selectedType === 'question') {
        setupCharCounter('question', 500);
      } else if (selectedType === 'feedback') {
        setupCharCounter('feedbackContent', 500);
      }
    } else {
      dynamicFields.innerHTML = '';
    }
  });

  // Handle form submission
  const form = document.getElementById('contribute-form') as HTMLFormElement;
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
  const formMessage = document.getElementById('form-message') as HTMLDivElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Hide previous messages
    formMessage.classList.add('hidden');

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Check honeypot (spam protection)
    if (data.website) {
      // Bot detected - silently fail
      setTimeout(() => {
        showMessage('Thank you for your contribution!', 'success');
        form.reset();
        dynamicFields.innerHTML = '';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage('Thank you for your contribution! We\\'ve received your submission.', 'success');
        form.reset();
        dynamicFields.innerHTML = '';
      } else {
        const error = await response.json();
        showMessage(error.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      showMessage('Failed to submit. Please check your connection and try again.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  });

  function showMessage(message: string, type: 'success' | 'error') {
    formMessage.textContent = message;
    formMessage.className = \\\`p-4 rounded-lg \\\${
      type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }\\\`;
    formMessage.classList.remove('hidden');

    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
</script>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'contribute.astro'), contributePage);

      // Generate API routes
      // API: contribute
      const contributeApi = `export const prerender = false;

import type { APIRoute } from 'astro';
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  ContributionService,
  getEnv,
  getRequiredEnv,
  getClientIP,
  logError
} from '@rejected-media/podcast-framework-core';

/**
 * CORS Configuration: Allowed Origins
 *
 * Configure the domains allowed to make requests to this API.
 * Always include your production domain and localhost for development.
 *
 * SECURITY: Never use "*" wildcard in production - it allows any website
 * to make requests to your API, enabling CSRF attacks.
 */
const ALLOWED_ORIGINS = [
  'https://${projectSlug}.com',          // Production domain
  'https://www.${projectSlug}.com',      // www domain
  'http://localhost:4321',                // Development
  'http://localhost:3000',                // Alternative dev port
];

/**
 * Get CORS headers with origin validation
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Check if origin is in allowed list
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Fallback to primary domain

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

/**
 * Rate limiting: In-memory store
 *
 * KNOWN LIMITATION (Acceptable for MVP):
 * - Resets on cold start (each new function instance = fresh rate limit)
 * - Not shared across function instances
 * - Ineffective during high traffic (multiple concurrent instances)
 *
 * FUTURE ENHANCEMENT:
 * - For production scale, consider:
 *   - Upstash Redis (serverless-friendly, free tier)
 *   - Netlify Blobs (simple key-value store)
 *   - DynamoDB (AWS) or Firestore (Google)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// OPTIONS handler for CORS preflight
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// POST handler for contribution submissions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Get CORS headers with origin validation
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Rate limiting
    const clientIP = getClientIP(context);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ message: "Too many submissions. Please try again later." }),
        { status: 429, headers: corsHeaders }
      );
    }

    const data = await request.json();

    // Get required environment variables
    const env = getRequiredEnv([
      'SANITY_PROJECT_ID',
      'SANITY_API_TOKEN',
      'RESEND_API_KEY',
      'RESEND_FROM_EMAIL',
      'NOTIFICATION_EMAIL'
    ], context);

    // Initialize contribution service
    const contributionService = new ContributionService({
      sanityProjectId: env.SANITY_PROJECT_ID,
      sanityDataset: getEnv('SANITY_DATASET', context) || 'production',
      sanityApiToken: env.SANITY_API_TOKEN,
      sanityApiVersion: '2024-01-01',
      resendApiKey: env.RESEND_API_KEY,
      resendFromEmail: env.RESEND_FROM_EMAIL,
      notificationEmail: env.NOTIFICATION_EMAIL,
      studioUrl: getEnv('STUDIO_URL', context),
    });

    // Call contribution service
    const result = await contributionService.submitContribution(data);

    // Handle service result
    if (!result.success) {
      if (result.error) {
        logError(new Error(result.error), {
          function: 'contribute',
          operation: 'submit',
          contributionType: data.contributionType,
        }, context);
      }

      return new Response(
        JSON.stringify({ message: result.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        message: result.message,
        id: result.contributionId,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logError(error, {
      function: 'contribute',
      ip: getClientIP(context),
    }, context);

    console.error("Contribution submission error:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
};
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'api', 'contribute.ts'), contributeApi);

      // API: newsletter-subscribe
      const newsletterApi = `export const prerender = false;

import type { APIRoute } from 'astro';
import {
  NewsletterService,
  getRequiredEnv,
  getEnv,
  logError
} from '@rejected-media/podcast-framework-core';

/**
 * CORS Configuration: Allowed Origins
 *
 * Configure the domains allowed to make requests to this API.
 * Always include your production domain and localhost for development.
 *
 * SECURITY: Never use "*" wildcard in production - it allows any website
 * to make requests to your API, enabling CSRF attacks.
 */
const ALLOWED_ORIGINS = [
  'https://${projectSlug}.com',          // Production domain
  'https://www.${projectSlug}.com',      // www domain
  'http://localhost:4321',                // Development
  'http://localhost:3000',                // Alternative dev port
];

/**
 * Get CORS headers with origin validation
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Check if origin is in allowed list
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Fallback to primary domain

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

// OPTIONS handler for CORS preflight
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// POST handler for newsletter subscriptions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Get CORS headers with origin validation
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const data = await request.json();

    // Get required environment variables
    const env = getRequiredEnv(['SANITY_PROJECT_ID'], context);

    // Initialize newsletter service
    const newsletterService = new NewsletterService({
      sanityProjectId: env.SANITY_PROJECT_ID,
      sanityDataset: getEnv('SANITY_DATASET', context) || 'production',
      sanityApiVersion: '2024-01-01',
    });

    // Call newsletter service
    const result = await newsletterService.subscribe({
      email: data.email,
      website: data.website, // Honeypot
    });

    // Handle service result
    if (!result.success) {
      if (result.error) {
        logError(new Error(result.error), {
          function: 'newsletter-subscribe',
          operation: 'subscribe',
        }, context);
      }

      return new Response(
        JSON.stringify({ message: result.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({ message: result.message }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logError(error, {
      function: 'newsletter-subscribe',
    }, context);

    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ message: "Unable to process subscription. Please try again later." }),
      { status: 500, headers: corsHeaders }
    );
  }
};
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'api', 'newsletter-subscribe.ts'), newsletterApi);

      // Generate README
      const readme = `# ${projectName}

${projectConfig.description}

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
- Component Reference: @rejected-media/podcast-framework-core/COMPONENTS.md

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

      // Generate sanity.config.ts
      const sanityConfig = `/**
 * Sanity Studio Configuration
 *
 * This file configures your Sanity Studio.
 * See https://www.sanity.io/docs/configuration
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: '${projectName}',

  // TODO: Add your Sanity project ID here
  // Get it from https://sanity.io/manage
  projectId: process.env.SANITY_PROJECT_ID || 'your-project-id',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
`;

      writeFileSync(join(projectDir, 'sanity.config.ts'), sanityConfig);

      // Generate sanity/schemas/index.ts
      const schemasIndex = `/**
 * Sanity Schema Definitions
 *
 * Import schemas from @rejected-media/podcast-framework-sanity-schema
 * You can also add custom schemas here
 */

import {
  episodeSchema,
  guestSchema,
  hostSchema,
  podcastSchema,
  themeSchema,
  homepageConfigSchema,
  aboutPageConfigSchema,
  contributionSchema,
} from '@rejected-media/podcast-framework-sanity-schema';

export const schemaTypes = [
  podcastSchema,
  episodeSchema,
  guestSchema,
  hostSchema,
  themeSchema,
  homepageConfigSchema,
  aboutPageConfigSchema,
  contributionSchema,
];
`;

      writeFileSync(join(projectDir, 'sanity', 'schemas', 'index.ts'), schemasIndex);

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
      console.log(chalk.bold('Sanity CMS Setup:'));
      console.log(chalk.gray('  1. Create project at https://sanity.io/manage'));
      console.log(chalk.gray('  2. Update sanity.config.ts with your project ID'));
      console.log(chalk.gray('  3. Copy .env.template to .env'));
      console.log(chalk.gray('  4. Add SANITY_PROJECT_ID to .env'));
      console.log(chalk.gray('  5. Run: npm run dev:sanity'));
      console.log('');

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
      process.exit(1);
    }
  });
