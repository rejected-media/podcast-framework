/**
 * Theme Schema
 *
 * Base schema for podcast theme configuration
 * Allows CMS-based customization of colors, typography, and layout
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const baseThemeSchema = defineType({
  name: 'theme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Theme Name',
      type: 'string',
      description: 'Internal name for this theme (e.g., "Dark Mode", "Brand Colors 2024")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active Theme',
      type: 'boolean',
      description: 'Only one theme should be active at a time. Note: Field must be named "isActive" for framework compatibility.',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'colors',
      title: 'Colors',
      type: 'object',
      description: 'Brand colors for your podcast',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'primary',
          title: 'Primary Color',
          type: 'string',
          description: 'Main brand color (hex format: #3B82F6)',
          validation: (Rule) =>
            Rule.required()
              .regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' })
              .error('Must be a 6-digit hex color (e.g., #3B82F6)'),
          initialValue: '#3B82F6',
        }),
        defineField({
          name: 'secondary',
          title: 'Secondary Color',
          type: 'string',
          description: 'Secondary brand color',
          validation: (Rule) =>
            Rule.required()
              .regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' })
              .error('Must be a 6-digit hex color (e.g., #8B5CF6)'),
          initialValue: '#8B5CF6',
        }),
        defineField({
          name: 'accent',
          title: 'Accent Color',
          type: 'string',
          description: 'Accent color for highlights and CTAs',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' })
              .error('Must be a 6-digit hex color'),
          initialValue: '#0EA5E9',
        }),
        defineField({
          name: 'background',
          title: 'Background Color',
          type: 'string',
          description: 'Main background color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#F9FAFB',
        }),
        defineField({
          name: 'surface',
          title: 'Surface Color',
          type: 'string',
          description: 'Color for cards and elevated surfaces',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#FFFFFF',
        }),
        defineField({
          name: 'text',
          title: 'Text Color',
          type: 'string',
          description: 'Primary text color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#111827',
        }),
        defineField({
          name: 'textMuted',
          title: 'Muted Text Color',
          type: 'string',
          description: 'Secondary/muted text color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#6B7280',
        }),
        defineField({
          name: 'headerBg',
          title: 'Header Background',
          type: 'string',
          description: 'Header/navigation background color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#000000',
        }),
        defineField({
          name: 'headerText',
          title: 'Header Text',
          type: 'string',
          description: 'Header/navigation text color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#FFFFFF',
        }),
        defineField({
          name: 'footerBg',
          title: 'Footer Background',
          type: 'string',
          description: 'Footer background color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#000000',
        }),
        defineField({
          name: 'footerText',
          title: 'Footer Text',
          type: 'string',
          description: 'Footer text color',
          validation: (Rule) =>
            Rule.regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex color' }),
          initialValue: '#FFFFFF',
        }),
      ],
    }),
    defineField({
      name: 'typography',
      title: 'Typography',
      type: 'object',
      description: 'Font settings',
      fields: [
        defineField({
          name: 'fontFamily',
          title: 'Font Family',
          type: 'string',
          description: 'Main font family (e.g., "Inter, sans-serif")',
          initialValue: 'Inter, system-ui, -apple-system, sans-serif',
        }),
        defineField({
          name: 'headingFont',
          title: 'Heading Font',
          type: 'string',
          description: 'Optional separate font for headings',
        }),
        defineField({
          name: 'googleFonts',
          title: 'Google Fonts',
          type: 'array',
          description: 'Google Fonts to load (e.g., ["Inter", "Playfair Display"])',
          of: [{ type: 'string' }],
        }),
      ],
    }),
    defineField({
      name: 'layout',
      title: 'Layout Settings',
      type: 'object',
      description: 'Layout configuration (Required: framework expects borderRadius and spacing)',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'borderRadius',
          title: 'Border Radius',
          type: 'string',
          description: 'Tailwind border radius class',
          options: {
            list: [
              { title: 'None (sharp corners)', value: 'rounded-none' },
              { title: 'Small', value: 'rounded-sm' },
              { title: 'Medium (default)', value: 'rounded-md' },
              { title: 'Large', value: 'rounded-lg' },
              { title: 'Extra Large', value: 'rounded-xl' },
              { title: 'Full (pills)', value: 'rounded-full' },
            ],
          },
          validation: (Rule) => Rule.required(),
          initialValue: 'rounded-lg',
        }),
        defineField({
          name: 'spacing',
          title: 'Spacing Style',
          type: 'string',
          description: 'Overall spacing density',
          options: {
            list: [
              { title: 'Compact', value: 'compact' },
              { title: 'Normal (default)', value: 'normal' },
              { title: 'Spacious', value: 'spacious' },
            ],
          },
          validation: (Rule) => Rule.required(),
          initialValue: 'normal',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      active: 'isActive',
      primary: 'colors.primary',
      secondary: 'colors.secondary',
    },
    prepare({ title, active, primary, secondary }) {
      return {
        title: title || 'Unnamed Theme',
        subtitle: `${active ? '✓ Active' : 'Inactive'} • ${primary || 'No colors'}${secondary ? ` / ${secondary}` : ''}`,
      };
    },
  },
});

/**
 * Extend theme schema with custom fields
 *
 * @param customFields - Additional fields for theme customization
 * @returns Extended theme schema
 */
export function extendThemeSchema(customFields: FieldDefinition[]) {
  return {
    ...baseThemeSchema,
    fields: [...baseThemeSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseThemeSchema;
