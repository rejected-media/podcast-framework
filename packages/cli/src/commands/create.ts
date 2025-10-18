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
      mkdirSync(join(projectDir, 'src', 'pages'));
      mkdirSync(join(projectDir, 'src', 'pages', 'episodes'));
      mkdirSync(join(projectDir, 'src', 'pages', 'guests'));
      mkdirSync(join(projectDir, 'src', 'pages', 'guest'));
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
          '@rejected-media/podcast-framework-cli': '^0.1.13',
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

      // Generate homepage
      const homepage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getEpisodes, getTheme } from '@rejected-media/podcast-framework-core';
import { formatDate } from '@rejected-media/podcast-framework-core';

export const prerender = true;

// Fetch data from Sanity (or use defaults if not configured)
const podcastInfo = await getPodcast();
const episodes = await getEpisodes({ limit: 5, orderBy: 'desc' });
const theme = await getTheme();

// Fallback to project config if Sanity not configured yet
const displayName = podcastInfo?.name || '${projectName}';
const displayDescription = podcastInfo?.description || '${projectConfig.description}';

// Only pass theme if it exists (let BaseLayout use default if null)
const layoutProps = {
  title: \`\${displayName} - Home\`,
  description: displayDescription,
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-4xl mx-auto px-4 py-12 flex-grow">
    <h1 class="text-4xl font-bold mb-4">Welcome to {displayName}</h1>
    <p class="text-lg text-gray-600 mb-8">
      {displayDescription}
    </p>

    {!podcastInfo && (
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 class="font-semibold mb-2">🎉 Your podcast is ready!</h2>
        <p class="text-sm text-gray-700 mb-4">
          This project was created with @rejected-media/podcast-framework-cli
        </p>
        <p class="text-sm text-gray-700 mb-2">
          Next steps:
        </p>
        <ol class="text-sm text-gray-700 list-decimal list-inside space-y-1 mt-2">
          <li>Set up Sanity CMS project at <a href="https://sanity.io/manage" class="text-blue-600 underline" target="_blank">sanity.io/manage</a></li>
          <li>Update <code class="bg-gray-100 px-1 rounded">sanity.config.ts</code> with your project ID</li>
          <li>Copy <code class="bg-gray-100 px-1 rounded">.env.template</code> to <code class="bg-gray-100 px-1 rounded">.env</code> and add credentials</li>
          <li>Run <code class="bg-gray-100 px-1 rounded">npm run import:episodes</code> to import your podcast feed</li>
          <li>Refresh this page to see your podcast data!</li>
        </ol>
      </div>
    )}

    {episodes && episodes.length > 0 && (
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Recent Episodes</h2>
        <div class="space-y-4">
          {episodes.map((episode) => (
            <a
              href={\`/episodes/\${episode.slug.current}\`}
              class="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div class="flex items-start gap-4">
                {episode.coverImage?.url && (
                  <img
                    src={episode.coverImage.url}
                    alt={episode.title}
                    class="w-20 h-20 rounded object-cover flex-shrink-0"
                  />
                )}
                <div class="flex-grow min-w-0">
                  <p class="text-sm text-gray-500 mb-1">Episode {episode.episodeNumber}</p>
                  <h3 class="text-lg font-semibold mb-1">{episode.title}</h3>
                  <p class="text-sm text-gray-600 line-clamp-2">{episode.description}</p>
                  <p class="text-sm text-gray-500 mt-2">{formatDate(episode.publishDate)}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        <a
          href="/episodes"
          class="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium"
        >
          View all episodes →
        </a>
      </div>
    )}

    {podcastInfo && episodes && episodes.length === 0 && (
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 class="font-semibold mb-2">📥 Import Your Episodes</h2>
        <p class="text-sm text-gray-700 mb-4">
          Sanity is configured but no episodes found.
        </p>
        <p class="text-sm text-gray-700 mb-2">
          Import your podcast feed:
        </p>
        <ol class="text-sm text-gray-700 list-decimal list-inside space-y-1">
          <li>Add your RSS feed URL to <code class="bg-gray-100 px-1 rounded">.env</code></li>
          <li>Run <code class="bg-gray-100 px-1 rounded">npm run import:episodes</code></li>
          <li>Refresh this page to see your episodes!</li>
        </ol>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'index.astro'), homepage);

      // Generate episodes list page
      const episodesPage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getEpisodes, getTheme } from '@rejected-media/podcast-framework-core';
import { formatDate } from '@rejected-media/podcast-framework-core';

export const prerender = true;

const podcastInfo = await getPodcast();
const episodes = await getEpisodes({ orderBy: 'desc' });
const theme = await getTheme();

const layoutProps = {
  title: \`Episodes - \${podcastInfo?.name || '${projectName}'}\`,
  description: \`All episodes of \${podcastInfo?.name || '${projectName}'}\`,
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-6xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">All Episodes</h1>

    {episodes && episodes.length > 0 ? (
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((episode) => (
          <a
            href={\`/episodes/\${episode.slug.current}\`}
            class="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
          >
            {episode.coverImage?.url && (
              <img
                src={episode.coverImage.url}
                alt={episode.title}
                class="w-full aspect-square object-cover rounded-lg mb-4"
              />
            )}
            <p class="text-sm text-gray-500 mb-2">Episode {episode.episodeNumber}</p>
            <h2 class="text-xl font-semibold mb-2">{episode.title}</h2>
            <p class="text-sm text-gray-600 mb-3 line-clamp-3">{episode.description}</p>
            <p class="text-sm text-gray-500">{formatDate(episode.publishDate)}</p>
          </a>
        ))}
      </div>
    ) : (
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <p class="text-gray-700 mb-4">No episodes found. Import your RSS feed to get started!</p>
        <code class="text-sm bg-gray-100 px-3 py-1 rounded">npm run import:episodes</code>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'episodes', 'index.astro'), episodesPage);

      // Generate individual episode page
      const episodePage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getEpisode, getTheme, getStaticPathsForEpisodes } from '@rejected-media/podcast-framework-core';
import { formatDate, formatDuration } from '@rejected-media/podcast-framework-core';

export const prerender = true;

export async function getStaticPaths() {
  return getStaticPathsForEpisodes();
}

const { slug } = Astro.params;
const episode = await getEpisode(slug!);
const podcastInfo = await getPodcast();
const theme = await getTheme();

if (!episode) {
  return Astro.redirect('/404');
}

const layoutProps = {
  title: \`\${episode.title} - \${podcastInfo?.name || '${projectName}'}\`,
  description: episode.description || \`Listen to \${episode.title}\`,
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <a href="/episodes" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">
      ← Back to Episodes
    </a>

    <div class="mb-8">
      {episode.coverImage?.url && (
        <img
          src={episode.coverImage.url}
          alt={episode.title}
          class="w-full max-w-md mx-auto rounded-lg shadow-lg mb-6"
        />
      )}

      <p class="text-sm text-gray-500 mb-2">Episode {episode.episodeNumber}</p>
      <h1 class="text-4xl font-bold mb-4">{episode.title}</h1>

      <div class="flex gap-4 text-sm text-gray-600 mb-6">
        <span>{formatDate(episode.publishDate)}</span>
        {episode.duration && <span>{formatDuration(episode.duration)}</span>}
      </div>

      {episode.description && (
        <p class="text-lg text-gray-700 mb-8">{episode.description}</p>
      )}

      {/* Spotify Player */}
      {episode.spotifyUrl && (
        <div class="mb-8">
          <iframe
            src={\`https://open.spotify.com/embed/episode/\${episode.spotifyUrl.split('/').pop()}\`}
            width="100%"
            height="232"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
            class="rounded-lg"
          ></iframe>
        </div>
      )}

      {/* Show Notes */}
      {episode.showNotes && (
        <div class="prose max-w-none mb-8">
          <h2>Show Notes</h2>
          <div set:html={episode.showNotes} />
        </div>
      )}

      {/* Guests */}
      {episode.guests && episode.guests.length > 0 && (
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Guests</h2>
          <div class="grid gap-4 md:grid-cols-2">
            {episode.guests.map((guest: any) => (
              <a href={\`/guest/\${guest.slug.current}\`} class="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                {guest.photo?.url && (
                  <img src={guest.photo.url} alt={guest.name} class="w-16 h-16 rounded-full object-cover" />
                )}
                <div>
                  <h3 class="font-semibold">{guest.name}</h3>
                  {guest.title && <p class="text-sm text-gray-600">{guest.title}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div class="flex flex-wrap gap-4">
        {episode.spotifyUrl && (
          <a href={episode.spotifyUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Listen on Spotify
          </a>
        )}
        {episode.applePodcastsUrl && (
          <a href={episode.applePodcastsUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Listen on Apple Podcasts
          </a>
        )}
        {episode.youtubeUrl && (
          <a href={episode.youtubeUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Watch on YouTube
          </a>
        )}
      </div>
    </div>
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
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getGuest, getEpisodesByGuest, getTheme, getStaticPathsForGuests } from '@rejected-media/podcast-framework-core';
import { formatDate } from '@rejected-media/podcast-framework-core';

export const prerender = true;

export async function getStaticPaths() {
  return getStaticPathsForGuests();
}

const { slug } = Astro.params;
const guest = await getGuest(slug!);
const podcastInfo = await getPodcast();
const episodes = guest ? await getEpisodesByGuest(guest._id) : [];
const theme = await getTheme();

if (!guest) {
  return Astro.redirect('/404');
}

const layoutProps = {
  title: \`\${guest.name} - \${podcastInfo?.name || '${projectName}'}\`,
  description: guest.bio || \`Episodes featuring \${guest.name}\`,
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <a href="/guests" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to Guests</a>

    <div class="text-center mb-12">
      {guest.photo?.url && (
        <img src={guest.photo.url} alt={guest.name} class="w-48 h-48 rounded-full mx-auto mb-6 object-cover" />
      )}
      <h1 class="text-4xl font-bold mb-2">{guest.name}</h1>
      {guest.title && <p class="text-xl text-gray-600 mb-4">{guest.title}</p>}
      {guest.bio && <p class="text-lg text-gray-700 max-w-2xl mx-auto">{guest.bio}</p>}

      <div class="flex justify-center gap-4 mt-6">
        {guest.twitterHandle && (
          <a href={\`https://twitter.com/\${guest.twitterHandle}\`} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">Twitter</a>
        )}
        {guest.linkedinUrl && (
          <a href={guest.linkedinUrl} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">LinkedIn</a>
        )}
        {guest.websiteUrl && (
          <a href={guest.websiteUrl} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">Website</a>
        )}
      </div>
    </div>

    {episodes && episodes.length > 0 && (
      <div>
        <h2 class="text-2xl font-bold mb-6">Episodes featuring {guest.name}</h2>
        <div class="space-y-4">
          {episodes.map((episode) => (
            <a href={\`/episodes/\${episode.slug.current}\`} class="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex gap-4">
                {episode.coverImage?.url && (
                  <img src={episode.coverImage.url} alt={episode.title} class="w-20 h-20 rounded object-cover" />
                )}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Episode {episode.episodeNumber}</p>
                  <h3 class="text-lg font-semibold mb-1">{episode.title}</h3>
                  <p class="text-sm text-gray-600">{formatDate(episode.publishDate)}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'guest', '[slug].astro'), guestPage);

      // Generate about page
      const aboutPage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getTheme } from '@rejected-media/podcast-framework-core';

export const prerender = true;

const podcastInfo = await getPodcast();
const theme = await getTheme();

const layoutProps = {
  title: \`About - \${podcastInfo?.name || '${projectName}'}\`,
  description: podcastInfo?.description || 'Learn more about ${projectName}',
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">About</h1>

    {podcastInfo?.description && (
      <div class="prose max-w-none mb-8">
        <p class="text-lg">{podcastInfo.description}</p>
      </div>
    )}

    <div class="bg-gray-50 rounded-lg p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4">Listen</h2>
      <div class="flex flex-wrap gap-4">
        {podcastInfo?.spotifyUrl && (
          <a href={podcastInfo.spotifyUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Spotify</a>
        )}
        {podcastInfo?.applePodcastsUrl && (
          <a href={podcastInfo.applePodcastsUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Apple Podcasts</a>
        )}
        {podcastInfo?.youtubeUrl && (
          <a href={podcastInfo.youtubeUrl} target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">YouTube</a>
        )}
      </div>
    </div>

    {!podcastInfo && (
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <p class="text-gray-700">Configure your podcast information in Sanity Studio to customize this page!</p>
      </div>
    )}
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'about.astro'), aboutPage);

      // Generate contribute page
      const contributePage = `---
import BaseLayout from '@rejected-media/podcast-framework-core/layouts/BaseLayout.astro';
import { getPodcast, getTheme } from '@rejected-media/podcast-framework-core';

export const prerender = true;

const podcastInfo = await getPodcast();
const theme = await getTheme();

const layoutProps = {
  title: \`Contribute - \${podcastInfo?.name || '${projectName}'}\`,
  description: 'Support the podcast',
  podcastInfo,
  ...(theme && { theme })
};
---

<BaseLayout {...layoutProps}>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8">Contribute</h1>

    <div class="prose max-w-none mb-8">
      <p class="text-lg">Thank you for your interest in supporting ${projectName}!</p>
      <p>There are several ways you can contribute:</p>
      <ul>
        <li>Subscribe and listen on your favorite podcast platform</li>
        <li>Leave a rating and review</li>
        <li>Share episodes with friends and colleagues</li>
        <li>Follow us on social media</li>
      </ul>
    </div>

    <div class="bg-gray-50 rounded-lg p-8">
      <h2 class="text-2xl font-bold mb-4">Get in Touch</h2>
      <p class="text-gray-700 mb-4">Have feedback, suggestions, or want to be a guest? We'd love to hear from you!</p>
      <p class="text-gray-600">Configure contribution options in Sanity Studio to add sponsor links, donation buttons, or contact forms.</p>
    </div>
  </main>
</BaseLayout>
`;

      writeFileSync(join(projectDir, 'src', 'pages', 'contribute.astro'), contributePage);

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
