/**
 * Homepage Configuration Schema
 *
 * Base schema for CMS-driven homepage layout and content
 * Allows dynamic control over which sections appear and their content
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const baseHomepageConfigSchema = defineType({
  name: 'homepageConfig',
  title: 'Homepage Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Config Title',
      type: 'string',
      description: 'Internal name (e.g., "Main Homepage Layout")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active Configuration',
      type: 'boolean',
      description: 'Only one homepage config should be active. Note: Field must be named "isActive" for framework compatibility.',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Hero Section',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'customHeadline',
          title: 'Custom Headline',
          type: 'string',
          description: 'Override default headline (optional)',
        }),
        defineField({
          name: 'customDescription',
          title: 'Custom Description',
          type: 'text',
          rows: 3,
          description: 'Override default description (optional)',
        }),
        defineField({
          name: 'ctaText',
          title: 'Call-to-Action Text',
          type: 'string',
          description: 'Button text (default: "Latest Episode")',
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          description: 'Optional background image for hero',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'featuredEpisodes',
      title: 'Featured Episodes Carousel',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Featured Episodes',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Featured Episodes',
        }),
        defineField({
          name: 'interval',
          title: 'Auto-Progress Interval (ms)',
          type: 'number',
          description: 'Time between auto-transitions (0 = manual only)',
          initialValue: 5000,
          validation: (Rule) => Rule.min(0).max(30000),
        }),
      ],
    }),
    defineField({
      name: 'recentEpisodes',
      title: 'Recent Episodes Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Recent Episodes',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Recent Episodes',
        }),
        defineField({
          name: 'limit',
          title: 'Number to Show',
          type: 'number',
          initialValue: 6,
          validation: (Rule) => Rule.min(1).max(20),
        }),
      ],
    }),
    defineField({
      name: 'about',
      title: 'About Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show About Section',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'About the Show',
        }),
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: [{ type: 'block' }],
        }),
      ],
    }),
    defineField({
      name: 'newsletter',
      title: 'Newsletter Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Newsletter Signup',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Stay Updated',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 2,
        }),
      ],
    }),
    defineField({
      name: 'customSections',
      title: 'Custom Sections',
      type: 'array',
      description: 'Add custom content sections',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [
                  { title: 'White', value: 'white' },
                  { title: 'Gray', value: 'gray' },
                  { title: 'Primary', value: 'primary' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      active: 'isActive',
    },
    prepare({ title, active }) {
      return {
        title: title || 'Homepage Config',
        subtitle: active ? '✓ Active' : 'Inactive',
      };
    },
  },
});

/**
 * Extend homepage config schema with custom fields
 *
 * @param customFields - Additional fields for homepage configuration
 * @returns Extended homepage config schema
 */
export function extendHomepageConfigSchema(customFields: FieldDefinition[]) {
  return {
    ...baseHomepageConfigSchema,
    fields: [...baseHomepageConfigSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseHomepageConfigSchema;
