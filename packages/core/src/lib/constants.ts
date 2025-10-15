/**
 * Application Constants
 *
 * Centralized configuration values used across the application.
 * Extracting these prevents magic numbers and makes configuration easier.
 */

// Localization
export const DEFAULT_LOCALE = "en-US";

// Rate Limiting (Netlify Functions)
export const RATE_LIMIT_MAX_REQUESTS = 5; // requests per window
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Input Validation Limits
export const MAX_FIELD_LENGTHS = {
  episodeTopic: 200,
  episodeDescription: 1000,
  episodeRationale: 500,
  guestName: 100,
  guestBackground: 1000,
  guestRationale: 500,
  guestContact: 200,
  question: 500,
  questionContext: 500,
  feedbackContent: 1000,
  submitterName: 100,
  submitterEmail: 100,
} as const;

// Pagination
export const DEFAULT_EPISODES_PER_PAGE = 12;

// Theme Defaults
export const DEFAULT_THEME = {
  colors: {
    primary: "#00a3b5",
    secondary: "#ff6b6b",
    accent: "#4ecdc4",
  },
  fonts: {
    heading: "Inter",
    body: "Lato",
  },
} as const;
