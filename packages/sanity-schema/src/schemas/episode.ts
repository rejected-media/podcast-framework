/**
 * Episode Schema
 *
 * Base schema for podcast episodes with comprehensive fields for
 * episode metadata, transcripts, platform links, and more.
 *
 * Podcasts can extend this schema with custom fields using extendEpisodeSchema()
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

/**
 * Base episode schema
 * Contains all standard fields that framework components expect
 */
export const baseEpisodeSchema = defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  fields: [
    // Core metadata
    defineField({
      name: 'title',
      title: 'Episode Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'episodeNumber',
      title: 'Episode Number',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Format: HH:MM:SS or MM:SS',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showNotes',
      title: 'Show Notes',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // People
    defineField({
      name: 'hosts',
      title: 'Hosts',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'host' } }],
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'guest' } }],
    }),

    // Platform links
    defineField({
      name: 'spotifyLink',
      title: 'Spotify Episode Link',
      type: 'url',
      description: 'Full Spotify episode URL',
    }),
    defineField({
      name: 'applePodcastLink',
      title: 'Apple Podcast Link',
      type: 'url',
      description: 'Apple Podcasts episode URL',
    }),
    defineField({
      name: 'youtubeLink',
      title: 'YouTube Link',
      type: 'url',
      description: 'YouTube episode URL',
    }),

    // Media
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio File URL',
      type: 'url',
      description: 'Direct MP3 URL for transcription (from RSS feed or podcast host)',
    }),
    defineField({
      name: 'rssGuid',
      title: 'RSS GUID',
      type: 'string',
      description: 'Unique identifier from RSS feed (used for duplicate detection during imports)',
      hidden: true,
      readOnly: true,
    }),

    // Features
    defineField({
      name: 'featured',
      title: 'Featured Episode',
      type: 'boolean',
      initialValue: false,
    }),

    // Transcripts
    defineField({
      name: 'transcript',
      title: 'Episode Transcript',
      type: 'text',
      rows: 20,
      description: 'Full episode transcript with speaker labels (auto-generated or manually entered)',
    }),
    defineField({
      name: 'transcriptRaw',
      title: 'Raw Transcript (No Speakers)',
      type: 'text',
      rows: 20,
      description: 'Raw transcript text without speaker labels (for search/copy)',
      hidden: true,
    }),
    defineField({
      name: 'transcriptSegments',
      title: 'Transcript Segments',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'speaker', type: 'string', title: 'Speaker' },
          { name: 'start', type: 'number', title: 'Start Time (seconds)' },
          { name: 'end', type: 'number', title: 'End Time (seconds)' },
          { name: 'text', type: 'text', title: 'Text' },
        ]
      }],
      description: 'Timestamped transcript segments with speaker labels',
      hidden: true,
    }),
    defineField({
      name: 'transcriptSpeakers',
      title: 'Number of Speakers',
      type: 'number',
      description: 'Number of speakers detected in the transcript',
      hidden: true,
    }),
    defineField({
      name: 'transcriptDuration',
      title: 'Transcript Duration',
      type: 'number',
      description: 'Audio duration in seconds (from transcription service)',
      hidden: true,
    }),
    defineField({
      name: 'transcriptGeneratedAt',
      title: 'Transcript Generated At',
      type: 'datetime',
      description: 'When the transcript was auto-generated',
      hidden: true,
    }),
  ],
  orderings: [
    {
      title: 'Episode Number, New',
      name: 'episodeNumberDesc',
      by: [{ field: 'episodeNumber', direction: 'desc' }],
    },
    {
      title: 'Episode Number, Old',
      name: 'episodeNumberAsc',
      by: [{ field: 'episodeNumber', direction: 'asc' }],
    },
    {
      title: 'Publish Date, New',
      name: 'publishDateDesc',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      episodeNumber: 'episodeNumber',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, episodeNumber, media } = selection;
      return {
        title: `Episode ${episodeNumber}: ${title}`,
        media,
      };
    },
  },
});

/**
 * Extend episode schema with custom fields
 *
 * @param customFields - Additional fields to add to episode schema
 * @returns Extended episode schema
 *
 * @example
 * ```typescript
 * import { extendEpisodeSchema } from '@podcast-framework/sanity-schema';
 *
 * const episode = extendEpisodeSchema([
 *   {
 *     name: 'sponsor',
 *     title: 'Episode Sponsor',
 *     type: 'reference',
 *     to: [{ type: 'sponsor' }]
 *   },
 *   {
 *     name: 'videoUrl',
 *     title: 'Video URL',
 *     type: 'url'
 *   }
 * ]);
 * ```
 */
export function extendEpisodeSchema(customFields: FieldDefinition[]) {
  return {
    ...baseEpisodeSchema,
    fields: [...baseEpisodeSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseEpisodeSchema;
