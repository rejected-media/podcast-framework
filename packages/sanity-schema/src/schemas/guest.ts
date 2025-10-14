/**
 * Guest Schema
 *
 * Base schema for podcast guests
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const baseGuestSchema = defineType({
  name: 'guest',
  title: 'Guest',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'twitter',
      title: 'Twitter/X Handle',
      type: 'string',
      description: 'Without the @ symbol',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'photo',
    },
  },
});

/**
 * Extend guest schema with custom fields
 *
 * @param customFields - Additional fields for guests
 * @returns Extended guest schema
 */
export function extendGuestSchema(customFields: FieldDefinition[]) {
  return {
    ...baseGuestSchema,
    fields: [...baseGuestSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseGuestSchema;
