import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ContributionService } from './contribution-service';
import type { ContributionRequest, ContributionServiceConfig } from './contribution-service';

// Mock Sanity client
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    create: vi.fn().mockResolvedValue({ _id: 'test-contribution-id' }),
  })),
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

describe('ContributionService', () => {
  let service: ContributionService;
  let mockConfig: ContributionServiceConfig;

  beforeEach(() => {
    mockConfig = {
      sanityProjectId: 'test-project',
      sanityDataset: 'test',
      sanityApiToken: 'test-token',
      sanityApiVersion: '2024-01-01',
      resendApiKey: 'test-resend-key',
      resendFromEmail: 'test@example.com',
      notificationEmail: 'notifications@example.com',
      studioUrl: 'https://test.sanity.studio',
    };

    service = new ContributionService(mockConfig);
  });

  describe('Spam Detection', () => {
    test('detects spam when honeypot field is filled', () => {
      expect(service.isSpamBot('https://spam.com')).toBe(true);
    });

    test('allows legitimate submissions with empty honeypot', () => {
      expect(service.isSpamBot(undefined)).toBe(false);
      expect(service.isSpamBot('')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    test('accepts valid email formats', () => {
      expect(service.validateEmail('user@example.com')).toBe(true);
      expect(service.validateEmail('test.user+tag@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(service.validateEmail('invalid-email')).toBe(false);
      expect(service.validateEmail('user@')).toBe(false);
      expect(service.validateEmail('@domain.com')).toBe(false);
      expect(service.validateEmail('user @example.com')).toBe(false);
    });

    test('allows missing email (optional field)', () => {
      expect(service.validateEmail(undefined)).toBe(true);
      expect(service.validateEmail('')).toBe(true);
    });
  });

  describe('Field Length Validation', () => {
    test('accepts values within length limits', () => {
      expect(service.validateFieldLength('Short text', 'Field', 100)).toBeNull();
    });

    test('rejects values exceeding length limits', () => {
      const longText = 'x'.repeat(101);
      const error = service.validateFieldLength(longText, 'Field', 100);
      expect(error).toContain('Field must be under 100 characters');
      expect(error).toContain('currently 101');
    });

    test('allows missing values (optional fields)', () => {
      expect(service.validateFieldLength(undefined, 'Field', 100)).toBeNull();
    });
  });

  describe('Required Field Validation', () => {
    test('rejects missing contribution type', () => {
      const request = {} as ContributionRequest;
      const error = service.validateRequiredFields(request);
      expect(error).toBe('Please select a contribution type to continue.');
    });

    test('validates episode idea required fields', () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBe('Please provide an episode topic for your idea.');
    });

    test('validates guest recommendation required fields', () => {
      const request: ContributionRequest = {
        contributionType: 'guest-recommendation',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBe("Please provide the guest's name.");
    });

    test('validates question required fields', () => {
      const request: ContributionRequest = {
        contributionType: 'question',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBe('Please enter your question.');
    });

    test('validates feedback required fields', () => {
      const request: ContributionRequest = {
        contributionType: 'feedback',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBe('Please select a feedback type and share your thoughts.');
    });

    test('accepts valid episode idea', () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'Test Topic',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBeNull();
    });

    test('accepts valid guest recommendation', () => {
      const request: ContributionRequest = {
        contributionType: 'guest-recommendation',
        guestName: 'John Doe',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBeNull();
    });

    test('accepts valid question', () => {
      const request: ContributionRequest = {
        contributionType: 'question',
        question: 'How does this work?',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBeNull();
    });

    test('accepts valid feedback', () => {
      const request: ContributionRequest = {
        contributionType: 'feedback',
        feedbackType: 'suggestion',
        feedbackContent: 'Great podcast!',
      };
      const error = service.validateRequiredFields(request);
      expect(error).toBeNull();
    });
  });

  describe('Email Content Generation', () => {
    test('generates episode idea email correctly', () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        submitterName: 'John Doe',
        submitterEmail: 'john@example.com',
        episodeTopic: 'Test Topic',
        episodeDescription: 'Test Description',
        episodeRationale: 'Test Rationale',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Episode Idea');
      expect(content).toContain('John Doe');
      expect(content).toContain('john@example.com');
      expect(content).toContain('Test Topic');
      expect(content).toContain('Test Description');
      expect(content).toContain('Test Rationale');
    });

    test('generates guest recommendation email correctly', () => {
      const request: ContributionRequest = {
        contributionType: 'guest-recommendation',
        submitterName: 'Jane Smith',
        submitterEmail: 'jane@example.com',
        guestName: 'Expert Name',
        guestBackground: 'Expert Background',
        guestRationale: 'Why Expert',
        guestContact: 'expert@example.com',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Guest Recommendation');
      expect(content).toContain('Jane Smith');
      expect(content).toContain('Expert Name');
      expect(content).toContain('Expert Background');
      expect(content).toContain('Why Expert');
      expect(content).toContain('expert@example.com');
    });

    test('generates question email correctly', () => {
      const request: ContributionRequest = {
        contributionType: 'question',
        submitterName: 'Curious User',
        submitterEmail: 'curious@example.com',
        question: 'How does this work?',
        questionContext: 'I was wondering...',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Question');
      expect(content).toContain('Curious User');
      expect(content).toContain('How does this work?');
      expect(content).toContain('I was wondering...');
    });

    test('generates feedback email correctly', () => {
      const request: ContributionRequest = {
        contributionType: 'feedback',
        submitterName: 'Feedback User',
        submitterEmail: 'feedback@example.com',
        feedbackType: 'suggestion',
        feedbackContent: 'Great work!',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Feedback');
      expect(content).toContain('Feedback User');
      expect(content).toContain('Suggestion');
      expect(content).toContain('Great work!');
    });

    test('escapes HTML in email content to prevent XSS', () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        submitterName: '<script>alert("xss")</script>',
        submitterEmail: 'test@example.com',
        episodeTopic: '<img src=x onerror=alert(1)>',
        episodeDescription: 'Normal & "quoted" text',
      };

      const content = service.generateEmailContent(request);

      expect(content).not.toContain('<script>');
      expect(content).not.toContain('<img');
      expect(content).toContain('&lt;script&gt;');
      expect(content).toContain('&lt;img');
      expect(content).toContain('&amp;');
      expect(content).toContain('&quot;');
    });

    test('handles anonymous submissions', () => {
      const request: ContributionRequest = {
        contributionType: 'question',
        question: 'Anonymous question',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Anonymous');
      expect(content).toContain('No email provided');
    });

    test('converts newlines to HTML breaks', () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'Topic',
        episodeDescription: 'Line 1\nLine 2\nLine 3',
      };

      const content = service.generateEmailContent(request);

      expect(content).toContain('Line 1<br/>Line 2<br/>Line 3');
    });
  });

  describe('Full Submission Flow', () => {
    test('successfully submits valid contribution', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        submitterName: 'John Doe',
        submitterEmail: 'john@example.com',
        episodeTopic: 'Great Topic',
        episodeDescription: 'This would be amazing',
      };

      const result = await service.submitContribution(request);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Contribution submitted successfully');
      expect(result.contributionId).toBe('test-contribution-id');
    });

    test('silently accepts spam submissions (honeypot)', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'Spam Topic',
        website: 'https://spam.com', // Honeypot filled
      };

      const result = await service.submitContribution(request);

      // Returns success to avoid revealing honeypot
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
      expect(result.contributionId).toBeUndefined();
    });

    test('rejects submission with missing required fields', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        // Missing episodeTopic
      };

      const result = await service.submitContribution(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('episode topic');
    });

    test('rejects submission with invalid email', async () => {
      const request: ContributionRequest = {
        contributionType: 'question',
        question: 'Test question',
        submitterEmail: 'invalid-email',
      };

      const result = await service.submitContribution(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('valid email');
    });

    test('rejects submission with field exceeding length limit', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'x'.repeat(300), // Exceeds MAX_FIELD_LENGTHS.episodeTopic (200)
      };

      const result = await service.submitContribution(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('must be under');
      expect(result.message).toContain('characters');
    });

    test('continues successfully even if email sending fails', async () => {
      // Mock email sending to fail
      const failingService = new ContributionService(mockConfig);
      vi.spyOn(failingService as any, 'sendEmailNotification').mockRejectedValue(
        new Error('Email service unavailable')
      );

      const request: ContributionRequest = {
        contributionType: 'question',
        question: 'Test question',
        submitterEmail: 'test@example.com',
      };

      const result = await failingService.submitContribution(request);

      // Should still succeed even if email fails
      expect(result.success).toBe(true);
      expect(result.message).toBe('Contribution submitted successfully');
      expect(result.contributionId).toBe('test-contribution-id');
    });

    test('handles Sanity save errors correctly', async () => {
      const failingService = new ContributionService(mockConfig);
      vi.spyOn(failingService as any, 'saveContribution').mockRejectedValue(
        new Error('Sanity connection failed')
      );

      const request: ContributionRequest = {
        contributionType: 'question',
        question: 'Test question',
      };

      const result = await failingService.submitContribution(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.error).toBe('Sanity connection failed');
    });
  });

  describe('All Contribution Types', () => {
    test('handles all contribution types correctly', async () => {
      const types: Array<ContributionRequest['contributionType']> = [
        'episode-idea',
        'guest-recommendation',
        'question',
        'feedback',
      ];

      for (const type of types) {
        const request: ContributionRequest = {
          contributionType: type,
          ...(type === 'episode-idea' && { episodeTopic: 'Topic' }),
          ...(type === 'guest-recommendation' && { guestName: 'Guest' }),
          ...(type === 'question' && { question: 'Question?' }),
          ...(type === 'feedback' && {
            feedbackType: 'feedback' as const,
            feedbackContent: 'Content',
          }),
        };

        const result = await service.submitContribution(request);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string fields correctly', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'Topic',
        submitterName: '',
        submitterEmail: '',
        episodeDescription: '',
      };

      const result = await service.submitContribution(request);
      expect(result.success).toBe(true);
    });

    test('handles whitespace-only fields', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        episodeTopic: 'Topic',
        episodeDescription: '   ',
      };

      const result = await service.submitContribution(request);
      expect(result.success).toBe(true);
    });

    test('handles special characters in all fields', async () => {
      const request: ContributionRequest = {
        contributionType: 'episode-idea',
        submitterName: "O'Brien & Sons <test@example.com>",
        episodeTopic: 'Topic with "quotes" & special chars',
        episodeDescription: 'Line 1\nLine 2\r\nLine 3',
      };

      const result = await service.submitContribution(request);
      expect(result.success).toBe(true);

      const emailContent = service.generateEmailContent(request);
      expect(emailContent).toContain('&amp;');
      expect(emailContent).toContain('&quot;');
      expect(emailContent).toContain('&lt;');
      expect(emailContent).toContain('&gt;');
    });
  });
});
