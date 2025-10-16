/**
 * Podcast Schema
 *
 * Base schema for podcast metadata (show-level information)
 * Usually only one document of this type exists per podcast
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const basePodcastSchema = defineType({
  name: 'podcast',
  title: 'Podcast',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Podcast Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'isActive',
      title: 'Podcast is Active',
      type: 'boolean',
      description: 'Toggle on if actively releasing episodes, off if concluded',
      initialValue: true,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Small icon for browser tabs (recommended: 32x32px or 64x64px)',
      options: {
        hotspot: true,
      },
    }),

    // Podcast distribution
    defineField({
      name: 'spotifyShowId',
      title: 'Spotify Show ID',
      type: 'string',
      description: 'The ID from the Spotify show URL',
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify URL',
      type: 'url',
    }),
    defineField({
      name: 'appleUrl',
      title: 'Apple Podcasts URL',
      type: 'url',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
    }),
    defineField({
      name: 'rssUrl',
      title: 'RSS Feed URL',
      type: 'url',
      description: 'RSS feed URL for podcast aggregators',
    }),

    // Social
    defineField({
      name: 'twitterHandle',
      title: 'Twitter/X Handle',
      type: 'string',
      description: 'Twitter handle (without @) for social meta tags - e.g., "yourpodcast"',
      placeholder: 'yourpodcast',
      validation: (Rule) => Rule.custom((handle: string | undefined) => {
        if (!handle) return true; // Optional field
        if (handle.startsWith('@')) {
          return 'Do not include the @ symbol';
        }
        if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
          return 'Must be 1-15 characters (letters, numbers, underscore only)';
        }
        return true;
      }),
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter/X URL',
      type: 'url',
      description: 'Link to podcast Twitter/X profile',
    }),
    defineField({
      name: 'discordUrl',
      title: 'Discord URL',
      type: 'url',
      description: 'Link to podcast Discord server',
    }),

    // Newsletter
    defineField({
      name: 'newsletterEnabled',
      title: 'Enable Newsletter Signup',
      type: 'boolean',
      description: 'Show newsletter signup forms (only visible when podcast is active)',
      initialValue: false,
    }),
  ],
});

/**
 * Extend podcast schema with custom fields
 */
export function extendPodcastSchema(customFields: FieldDefinition[]) {
  return {
    ...basePodcastSchema,
    fields: [...basePodcastSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default basePodcastSchema;
