import { createClient } from "@sanity/client";
import type { SanityClient } from "@sanity/client";
import { Resend } from "resend";
import { MAX_FIELD_LENGTHS } from "../../lib/constants";

/**
 * Contribution Service
 *
 * Pure business logic for community contribution functionality.
 * Provider-agnostic - works with any serverless platform.
 *
 * Responsibilities:
 * - Input validation (required fields, length limits, email format)
 * - Contribution data persistence (Sanity)
 * - Email notifications (Resend)
 * - Spam protection (honeypot check)
 */

export interface ContributionRequest {
  contributionType: "episode-idea" | "guest-recommendation" | "question" | "feedback";
  submitterName?: string;
  submitterEmail?: string;
  website?: string; // Honeypot field

  // Episode idea fields
  episodeTopic?: string;
  episodeDescription?: string;
  episodeRationale?: string;

  // Guest recommendation fields
  guestName?: string;
  guestBackground?: string;
  guestRationale?: string;
  guestContact?: string;

  // Question fields
  question?: string;
  questionContext?: string;

  // Feedback fields
  feedbackType?: "feedback" | "suggestion" | "bug";
  feedbackContent?: string;
}

export interface ContributionResult {
  success: boolean;
  message: string;
  contributionId?: string;
  error?: string;
}

export interface ContributionServiceConfig {
  sanityProjectId: string;
  sanityDataset: string;
  sanityApiToken: string;
  sanityApiVersion?: string;
  resendApiKey: string;
  resendFromEmail: string;
  notificationEmail: string;
  studioUrl?: string;
}

/**
 * Simple HTML entity encoding for serverless environment
 * Prevents XSS in email content without requiring DOM libraries
 */
function escapeHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');
}

/**
 * Contribution service for managing community contributions
 */
export class ContributionService {
  private sanityClient: SanityClient;
  private resend: Resend;
  private config: ContributionServiceConfig;

  constructor(config: ContributionServiceConfig) {
    this.config = config;

    this.sanityClient = createClient({
      projectId: config.sanityProjectId,
      dataset: config.sanityDataset,
      token: config.sanityApiToken,
      apiVersion: config.sanityApiVersion || "2024-01-01",
      useCdn: false,
    });

    this.resend = new Resend(config.resendApiKey);
  }

  /**
   * Check honeypot field (spam detection)
   * Returns true if request is from a bot
   */
  isSpamBot(website?: string): boolean {
    return !!website;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string | undefined): boolean {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate field length
   */
  validateFieldLength(
    value: string | undefined,
    fieldName: string,
    maxLength: number
  ): string | null {
    if (!value) return null;

    if (value.length > maxLength) {
      return `${fieldName} must be under ${maxLength} characters (currently ${value.length})`;
    }

    return null;
  }

  /**
   * Validate all field lengths
   */
  validateAllFieldLengths(request: ContributionRequest): string | null {
    const validations = [
      this.validateFieldLength(request.episodeTopic, "Episode topic", MAX_FIELD_LENGTHS.episodeTopic),
      this.validateFieldLength(request.episodeDescription, "Episode description", MAX_FIELD_LENGTHS.episodeDescription),
      this.validateFieldLength(request.episodeRationale, "Episode rationale", MAX_FIELD_LENGTHS.episodeRationale),
      this.validateFieldLength(request.guestName, "Guest name", MAX_FIELD_LENGTHS.guestName),
      this.validateFieldLength(request.guestBackground, "Guest background", MAX_FIELD_LENGTHS.guestBackground),
      this.validateFieldLength(request.guestRationale, "Guest rationale", MAX_FIELD_LENGTHS.guestRationale),
      this.validateFieldLength(request.guestContact, "Guest contact", MAX_FIELD_LENGTHS.guestContact),
      this.validateFieldLength(request.question, "Question", MAX_FIELD_LENGTHS.question),
      this.validateFieldLength(request.questionContext, "Question context", MAX_FIELD_LENGTHS.questionContext),
      this.validateFieldLength(request.feedbackContent, "Feedback content", MAX_FIELD_LENGTHS.feedbackContent),
      this.validateFieldLength(request.submitterName, "Name", MAX_FIELD_LENGTHS.submitterName),
      this.validateFieldLength(request.submitterEmail, "Email", MAX_FIELD_LENGTHS.submitterEmail),
    ];

    return validations.find(error => error !== null) || null;
  }

  /**
   * Validate required fields based on contribution type
   */
  validateRequiredFields(request: ContributionRequest): string | null {
    if (!request.contributionType) {
      return "Please select a contribution type to continue.";
    }

    if (request.contributionType === "episode-idea") {
      if (!request.episodeTopic) {
        return "Please provide an episode topic for your idea.";
      }
    } else if (request.contributionType === "guest-recommendation") {
      if (!request.guestName) {
        return "Please provide the guest's name.";
      }
    } else if (request.contributionType === "question") {
      if (!request.question) {
        return "Please enter your question.";
      }
    } else if (request.contributionType === "feedback") {
      if (!request.feedbackType || !request.feedbackContent) {
        return "Please select a feedback type and share your thoughts.";
      }
    }

    return null;
  }

  /**
   * Save contribution to Sanity
   */
  async saveContribution(request: ContributionRequest): Promise<{ _id: string }> {
    const contribution = {
      _type: "contribution",
      contributionType: request.contributionType,
      submitterName: request.submitterName || null,
      submitterEmail: request.submitterEmail || null,
      status: "new",
      submittedAt: new Date().toISOString(),

      // Episode idea fields
      ...(request.contributionType === "episode-idea" && {
        episodeTopic: request.episodeTopic,
        episodeDescription: request.episodeDescription,
        episodeRationale: request.episodeRationale || null,
      }),

      // Guest recommendation fields
      ...(request.contributionType === "guest-recommendation" && {
        guestName: request.guestName,
        guestBackground: request.guestBackground,
        guestRationale: request.guestRationale,
        guestContact: request.guestContact || null,
      }),

      // Question fields
      ...(request.contributionType === "question" && {
        question: request.question,
        questionContext: request.questionContext || null,
      }),

      // Feedback fields
      ...(request.contributionType === "feedback" && {
        feedbackType: request.feedbackType,
        feedbackContent: request.feedbackContent,
      }),
    };

    return await this.sanityClient.create(contribution);
  }

  /**
   * Generate email content HTML
   */
  generateEmailContent(request: ContributionRequest): string {
    const fromName = escapeHTML(request.submitterName || "Anonymous");
    const fromEmail = escapeHTML(request.submitterEmail || "No email provided");
    const typeLabel = this.getTypeLabel(request.contributionType);

    let content = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00a3b5;">New Contribution: ${typeLabel}</h2>
      <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
  `;

    if (request.contributionType === "episode-idea") {
      content += `
      <h3 style="color: #374151;">Episode Idea</h3>
      <p><strong>Topic:</strong> ${escapeHTML(request.episodeTopic!)}</p>
      <p><strong>Description:</strong><br/>${escapeHTML(request.episodeDescription || "")}</p>
      ${request.episodeRationale ? `<p><strong>Why This Would Resonate:</strong><br/>${escapeHTML(request.episodeRationale)}</p>` : ""}
    `;
    } else if (request.contributionType === "guest-recommendation") {
      content += `
      <h3 style="color: #374151;">Guest Recommendation</h3>
      <p><strong>Name:</strong> ${escapeHTML(request.guestName!)}</p>
      <p><strong>Background:</strong><br/>${escapeHTML(request.guestBackground || "")}</p>
      <p><strong>Why This Guest:</strong><br/>${escapeHTML(request.guestRationale || "")}</p>
      ${request.guestContact ? `<p><strong>Contact Info:</strong> ${escapeHTML(request.guestContact)}</p>` : ""}
    `;
    } else if (request.contributionType === "question") {
      content += `
      <h3 style="color: #374151;">Question</h3>
      <p><strong>Question:</strong><br/>${escapeHTML(request.question!)}</p>
      ${request.questionContext ? `<p><strong>Context:</strong><br/>${escapeHTML(request.questionContext)}</p>` : ""}
    `;
    } else if (request.contributionType === "feedback") {
      content += `
      <h3 style="color: #374151;">Feedback</h3>
      <p><strong>Type:</strong> ${this.getFeedbackTypeLabel(request.feedbackType!)}</p>
      <p><strong>Content:</strong><br/>${escapeHTML(request.feedbackContent!)}</p>
    `;
    }

    const studioUrl = this.config.studioUrl || "https://strangewater.xyz";
    content += `
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 14px;">
        <a href="${studioUrl}/studio/structure/contribution" style="color: #00a3b5; text-decoration: none;">
          View in Sanity Studio →
        </a>
      </p>
    </div>
  `;

    return content;
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(request: ContributionRequest): Promise<void> {
    const emailContent = this.generateEmailContent(request);

    await this.resend.emails.send({
      from: this.config.resendFromEmail,
      to: this.config.notificationEmail,
      subject: `[${this.getTypeLabel(request.contributionType)}] New Contribution`,
      html: emailContent,
    });
  }

  /**
   * Get type label
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      "episode-idea": "Episode Idea",
      "guest-recommendation": "Guest Recommendation",
      "question": "Question",
      "feedback": "Feedback",
    };
    return labels[type] || type;
  }

  /**
   * Get feedback type label
   */
  private getFeedbackTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      feedback: "Feedback",
      suggestion: "Suggestion",
      bug: "Issue/Bug Report",
    };
    return labels[type] || type;
  }

  /**
   * Main contribution handler
   * Pure business logic - no HTTP concerns
   */
  async submitContribution(
    request: ContributionRequest
  ): Promise<ContributionResult> {
    // 1. Check honeypot (spam detection)
    if (this.isSpamBot(request.website)) {
      // Return success to avoid revealing honeypot
      return {
        success: true,
        message: "Success",
      };
    }

    // 2. Validate required fields
    const requiredFieldError = this.validateRequiredFields(request);
    if (requiredFieldError) {
      return {
        success: false,
        message: requiredFieldError,
      };
    }

    // 3. Validate email format
    if (!this.validateEmail(request.submitterEmail)) {
      return {
        success: false,
        message: "Please provide a valid email address.",
      };
    }

    // 4. Validate field lengths
    const lengthError = this.validateAllFieldLengths(request);
    if (lengthError) {
      return {
        success: false,
        message: lengthError,
      };
    }

    // 5. Save contribution to Sanity
    let savedContribution;
    try {
      savedContribution = await this.saveContribution(request);
    } catch (error) {
      console.error("Failed to save contribution to Sanity:", error);
      return {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 6. Send email notification (non-blocking - don't fail request if email fails)
    try {
      await this.sendEmailNotification(request);
      console.log("Email notification sent successfully");
    } catch (emailError) {
      // Log error but don't fail the request
      console.error("Email sending failed:", emailError);
      // Email failure will be logged/captured by the calling function
    }

    // 7. Success
    return {
      success: true,
      message: "Contribution submitted successfully",
      contributionId: savedContribution._id,
    };
  }
}
