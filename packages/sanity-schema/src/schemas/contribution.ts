/**
 * Contribution Schema
 *
 * For community contributions (episode ideas, guest suggestions, feedback)
 */

import { defineField, defineType } from 'sanity';
import type { FieldDefinition } from 'sanity';

export const baseContributionSchema = defineType({
  name: 'contribution',
  title: 'Contribution',
  type: 'document',
  fields: [
    defineField({
      name: 'contributionType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Episode Idea', value: 'episode-idea' },
          { title: 'Guest Recommendation', value: 'guest-recommendation' },
          { title: 'Question', value: 'question' },
          { title: 'Feedback', value: 'feedback' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Implemented', value: 'implemented' },
          { title: 'Declined', value: 'declined' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'submitterName',
      title: 'Submitter Name',
      type: 'string',
    }),
    defineField({
      name: 'submitterEmail',
      title: 'Submitter Email',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'contributionType',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      return {
        title: title || 'Untitled',
        subtitle: `${subtitle} - ${status}`,
      };
    },
  },
});

/**
 * Extend contribution schema with custom fields
 */
export function extendContributionSchema(customFields: FieldDefinition[]) {
  return {
    ...baseContributionSchema,
    fields: [...baseContributionSchema.fields, ...customFields.map(field => defineField(field))],
  };
}

export default baseContributionSchema;
