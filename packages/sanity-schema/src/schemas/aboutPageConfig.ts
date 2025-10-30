/**
 * About Page Configuration Schema
 *
 * Base schema for CMS-driven about page layout and content
 * Allows dynamic control over which sections appear and their content
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const baseAboutPageConfigSchema = defineType({
  name: 'aboutPageConfig',
  title: 'About Page Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Config Title',
      type: 'string',
      description: 'Internal name (e.g., "Main About Page Layout")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active Configuration',
      type: 'boolean',
      description: 'Only one about page config should be active. Note: Field must be named "isActive" for framework compatibility.',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aboutSection',
      title: 'About the Podcast Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Section',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'About the Podcast',
        }),
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          of: [{ type: 'block' }],
          description: 'Rich text content for the about section',
        }),
      ],
    }),
    defineField({
      name: 'hostsSection',
      title: 'Hosts Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Hosts',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Meet Your Hosts',
        }),
        defineField({
          name: 'layout',
          title: 'Layout Style',
          type: 'string',
          options: {
            list: [
              { title: 'Cards (Grid)', value: 'cards' },
              { title: 'List (Vertical)', value: 'list' },
            ],
          },
          initialValue: 'cards',
        }),
        defineField({
          name: 'hosts',
          title: 'Hosts to Display',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'host' }] }],
          description: 'Select which hosts to show (leave empty for all)',
        }),
      ],
    }),
    defineField({
      name: 'missionSection',
      title: 'Mission/Values Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Mission',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Our Mission',
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
      name: 'subscribeCTA',
      title: 'Subscribe Call-to-Action',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Subscribe CTA',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'Subscribe & Listen',
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
      name: 'communitySection',
      title: 'Community/Contact Section',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Community Section',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Join the Community',
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
      name: 'customSections',
      title: 'Custom Sections',
      type: 'array',
      description: 'Add additional custom sections to the about page',
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
          ],
          preview: {
            select: { title: 'title' },
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
        title: title || 'About Page Config',
        subtitle: active ? '✓ Active' : 'Inactive',
      };
    },
  },
});

/**
 * Extend about page config schema with custom fields
 *
 * @param customFields - Additional fields for about page configuration
 * @returns Extended about page config schema
 */
export function extendAboutPageConfigSchema(customFields: FieldDefinition[]) {
  return {
    ...baseAboutPageConfigSchema,
    fields: [...baseAboutPageConfigSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseAboutPageConfigSchema;
