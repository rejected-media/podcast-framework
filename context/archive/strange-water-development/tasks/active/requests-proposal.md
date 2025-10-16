# Community Engagement Feature Proposal

**Feature:** Audience contribution and feedback system for active podcasts

**Created:** 2025-10-07
**Status:** Proposal - Awaiting Approval
**Priority:** Phase 2a (Pre-Templatization)

---

## Problem Statement

Active podcasts need a way to engage with their audience and collect:
1. Episode topic ideas
2. Guest recommendations
3. Questions for upcoming episodes
4. General feedback

This feature should:
- Only appear for active podcasts (not concluded shows like Strange Water)
- Be easy to use (low friction)
- Collect contact info for follow-up
- Notify the host of new submissions
- Be manageable via Sanity CMS

---

## Naming Options

**Recommendation: "Contribute"**

### Considered Options:
1. **"Contribute"** ⭐ (Recommended)
   - Positive, inclusive, suggests giving back to the community
   - Clear call-to-action
   - Works across all submission types

2. "Share"
   - Friendly and approachable
   - Slightly less formal
   - Good alternative

3. "Pitch"
   - Too informal, suggests sales
   - Not appropriate for questions/feedback

4. "Suggest"
   - Good for ideas/guests, but awkward for questions
   - Too narrow

5. "Community"
   - Too broad, unclear action
   - Might imply forum/discussion

**Final Recommendation:** Use **"Contribute"** as the primary label, with subtext "Share your ideas, guests, and questions"

---

## User Experience Design

### Navigation Placement

**Header (Desktop):**
```
[Logo] Strange Water Podcast        Home  Episodes  Guests  About  Contribute
```

**Header (Mobile Menu):**
```
Home
Episodes
Guests
About
Contribute  ← Only visible when isActive=true
```

**Footer:**
```
Navigation          Subscribe
- Home              - Spotify
- Episodes          - Apple Podcasts
- Guests            - YouTube
- About             - RSS Feed
- Contribute        ← Only visible when isActive=true
```

### Page Layout

**URL:** `/contribute`

**Page Structure:**
```
┌─────────────────────────────────────────┐
│  Contribute to [Podcast Name]          │
│  Share your ideas and help shape       │
│  the future of the show                │
├─────────────────────────────────────────┤
│  What would you like to share?         │
│  [Dropdown Selector]                    │
│   - Episode Idea                        │
│   - Guest Recommendation                │
│   - Question for the Show               │
│   - Feedback                            │
├─────────────────────────────────────────┤
│  [Dynamic Form Fields]                  │
│  (Changes based on dropdown selection)  │
├─────────────────────────────────────────┤
│  Your Contact Information              │
│  Name: [_________]                      │
│  Email: [_________]                     │
│                                         │
│  [Submit] button                        │
└─────────────────────────────────────────┘
```

---

## Form Fields by Type

### 1. Episode Idea
**Required:**
- **Topic Title** (text, 100 chars max)
- **Description** (textarea, 500 chars max)
- **Name** (text)
- **Email** (email)

**Optional:**
- **Why this would resonate** (textarea, 300 chars)

**Placeholder Examples:**
- Topic: "The Economics of MEV"
- Description: "Deep dive into Maximum Extractable Value and its impact on Ethereum..."

---

### 2. Guest Recommendation
**Required:**
- **Guest Name** (text, 100 chars)
- **Guest Background** (textarea, 300 chars - "What do they do?")
- **Why this guest** (textarea, 300 chars - "What makes them interesting?")
- **Name** (text)
- **Email** (email)

**Optional:**
- **Guest Contact Info** (text - Twitter, LinkedIn, email if known)

**Placeholder Examples:**
- Guest Name: "Vitalik Buterin"
- Background: "Co-founder of Ethereum, researcher in cryptography and mechanism design"
- Why: "Could discuss the Merge, future of Ethereum scaling, and PBS"

---

### 3. Question for the Show
**Required:**
- **Your Question** (textarea, 500 chars)
- **Name** (text)
- **Email** (email)

**Optional:**
- **Context** (textarea, 200 chars - "Why are you asking this?")

**Placeholder Examples:**
- Question: "How do you see L2s competing versus collaborating in the long term?"
- Context: "I'm building a cross-chain protocol and trying to understand the landscape"

---

### 4. Feedback
**Required:**
- **Feedback Type** (radio buttons)
  - 👍 Praise
  - 💡 Suggestion
  - 🐛 Issue/Bug Report
- **Your Feedback** (textarea, 500 chars)

**Optional:**
- **Name** (text)
- **Email** (email)

**Note:** Name/email optional for feedback to encourage honest criticism

---

## Technical Implementation

### Architecture Decision: Sanity CMS + Serverless Function

**Why Sanity CMS Storage:**
1. ✅ All data in one place (easy to manage)
2. ✅ Host can review/respond in Sanity Studio
3. ✅ Can track status (new → reviewed → archived)
4. ✅ Reusable across all podcast deployments
5. ✅ No third-party service dependencies
6. ✅ GDPR-friendly (data ownership)

**Why Serverless Function:**
1. ✅ Email notifications without exposing API tokens
2. ✅ Can add spam protection (rate limiting, honeypot)
3. ✅ Works with Netlify or Vercel
4. ✅ No additional hosting costs

---

### Sanity Schema Design

**Document Type:** `contribution`

```typescript
{
  name: 'contribution',
  title: 'Community Contributions',
  type: 'document',
  fields: [
    {
      name: 'contributionType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Episode Idea', value: 'episode-idea' },
          { title: 'Guest Recommendation', value: 'guest-recommendation' },
          { title: 'Question', value: 'question' },
          { title: 'Feedback', value: 'feedback' }
        ]
      },
      validation: Rule => Rule.required()
    },

    // Common fields
    {
      name: 'submitterName',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'submitterEmail',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '🆕 New', value: 'new' },
          { title: '👀 Reviewed', value: 'reviewed' },
          { title: '✅ Actioned', value: 'actioned' },
          { title: '📦 Archived', value: 'archived' }
        ]
      },
      initialValue: 'new'
    },
    {
      name: 'submittedAt',
      title: 'Submitted',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },

    // Episode Idea fields (conditional)
    {
      name: 'episodeTopic',
      title: 'Episode Topic',
      type: 'string',
      hidden: ({document}) => document?.contributionType !== 'episode-idea'
    },
    {
      name: 'episodeDescription',
      title: 'Description',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'episode-idea'
    },
    {
      name: 'episodeRationale',
      title: 'Why This Would Resonate',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'episode-idea'
    },

    // Guest Recommendation fields (conditional)
    {
      name: 'guestName',
      title: 'Guest Name',
      type: 'string',
      hidden: ({document}) => document?.contributionType !== 'guest-recommendation'
    },
    {
      name: 'guestBackground',
      title: 'Guest Background',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'guest-recommendation'
    },
    {
      name: 'guestRationale',
      title: 'Why This Guest',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'guest-recommendation'
    },
    {
      name: 'guestContact',
      title: 'Guest Contact Info (Optional)',
      type: 'string',
      hidden: ({document}) => document?.contributionType !== 'guest-recommendation'
    },

    // Question fields (conditional)
    {
      name: 'question',
      title: 'Question',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'question'
    },
    {
      name: 'questionContext',
      title: 'Context',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'question'
    },

    // Feedback fields (conditional)
    {
      name: 'feedbackType',
      title: 'Feedback Type',
      type: 'string',
      options: {
        list: [
          { title: '👍 Praise', value: 'praise' },
          { title: '💡 Suggestion', value: 'suggestion' },
          { title: '🐛 Issue/Bug', value: 'bug' }
        ]
      },
      hidden: ({document}) => document?.contributionType !== 'feedback'
    },
    {
      name: 'feedbackContent',
      title: 'Feedback',
      type: 'text',
      hidden: ({document}) => document?.contributionType !== 'feedback'
    },

    // Host notes (internal)
    {
      name: 'hostNotes',
      title: 'Host Notes (Internal)',
      type: 'text',
      description: 'Private notes - not visible to submitter'
    }
  ],

  preview: {
    select: {
      type: 'contributionType',
      name: 'submitterName',
      status: 'status',
      date: 'submittedAt'
    },
    prepare({type, name, status, date}) {
      const typeLabel = {
        'episode-idea': '💡 Episode Idea',
        'guest-recommendation': '🎙️ Guest',
        'question': '❓ Question',
        'feedback': '💬 Feedback'
      }[type] || type;

      return {
        title: `${typeLabel} from ${name}`,
        subtitle: `${status} - ${new Date(date).toLocaleDateString()}`
      }
    }
  }
}
```

---

### Frontend Implementation

**Tech Stack:**
- Astro page (`/src/pages/contribute.astro`)
- Client-side JS for dynamic form switching
- Serverless function (`/netlify/functions/submit-contribution.ts`)
- Theme-aware styling

**Form Submission Flow:**
```
1. User fills out form
2. Client-side validation
3. POST to /api/contribute
4. Serverless function:
   a. Validates data
   b. Checks honeypot (spam protection)
   c. Creates document in Sanity
   d. Sends email notification to host
5. Return success/error to user
6. Show confirmation message
```

**Spam Protection:**
- Honeypot field (hidden field that bots fill out)
- Rate limiting (max 5 submissions per IP per hour)
- Email validation
- Optional: Turnstile (Cloudflare's reCAPTCHA alternative, privacy-friendly)

---

### Email Notification

**Notification Service Options:**

**Option A: Netlify Functions + SendGrid** (Recommended)
- ✅ Free tier: 100 emails/day
- ✅ Simple API
- ✅ Reliable delivery
- ✅ Email templates

**Option B: Netlify Functions + Resend**
- ✅ Modern, developer-friendly
- ✅ 3,000 emails/month free
- ✅ Great DX

**Option C: Sanity Webhook → Zapier → Email**
- ✅ No code required
- ❌ Third-party dependency
- ❌ Less control

**Recommendation:** Use SendGrid or Resend via Netlify Function

**Email Template:**
```
Subject: [Podcast Name] New Contribution: [Type]

Hi [Host Name],

You have a new contribution on [Podcast Name]:

Type: [Episode Idea / Guest Recommendation / Question / Feedback]
From: [Name] ([Email])
Submitted: [Date/Time]

[Content here - formatted based on type]

---
View in Sanity Studio: [Link to Sanity document]
Mark as reviewed: [Link]
```

---

### Conditional Visibility Implementation

**Header Component Update:**
```astro
---
import { getPodcastInfo } from "../lib/sanity";
const podcastInfo = await getPodcastInfo();
const showContribute = podcastInfo?.isActive === true;
---

<nav>
  <a href="/">Home</a>
  <a href="/episodes">Episodes</a>
  <a href="/guests">Guests</a>
  <a href="/about">About</a>
  {showContribute && (
    <a href="/contribute">Contribute</a>
  )}
</nav>
```

**Footer Component Update:**
```astro
{showContribute && (
  <li>
    <a href="/contribute">Contribute</a>
  </li>
)}
```

---

## Privacy & Legal Considerations

### Privacy Policy
- Add section explaining how submissions are stored
- Data retention policy (e.g., "We keep submissions for 2 years")
- Right to request deletion (GDPR compliance)

### Consent
- Add checkbox: "I consent to [Podcast Name] storing my contact information"
- Link to privacy policy

### Security
- HTTPS only (already enforced by Netlify)
- No sensitive data stored (just name, email, submission content)
- Environment variables for API keys (never in client code)

---

## Success Metrics

**Host Dashboard (Sanity Studio):**
- Total contributions by type
- Contributions by status (new, reviewed, actioned)
- Response rate (% of submissions responded to)
- Top submission types

**Future Enhancement Ideas:**
- Email confirmation to submitter
- Status updates (e.g., "Your guest recommendation was featured!")
- Public "Ideas Board" (opt-in for submitters)

---

## Implementation Timeline

### Phase 1: Core Feature (4-6 hours)
1. ✅ Create Sanity schema (`contribution` document type)
2. ✅ Build `/contribute` page with form
3. ✅ Add client-side form switching
4. ✅ Create serverless function
5. ✅ Integrate with Sanity API
6. ✅ Add to header/footer (conditional)

### Phase 2: Notifications (2-3 hours)
1. ✅ Set up SendGrid/Resend account
2. ✅ Create email template
3. ✅ Add email sending to serverless function
4. ✅ Test notifications

### Phase 3: Polish (1-2 hours)
1. ✅ Add spam protection
2. ✅ Theme integration
3. ✅ Success/error messages
4. ✅ Privacy policy update
5. ✅ Mobile responsive testing

**Total Estimated Time:** 8-12 hours

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Spam submissions | High | Honeypot + rate limiting + Turnstile |
| Email delivery issues | Medium | Use reputable service (SendGrid/Resend), monitor delivery |
| Data privacy violations | High | GDPR compliance, privacy policy, consent checkbox |
| Serverless cold starts | Low | Acceptable for async submissions |
| Form abandonment | Medium | Keep form short, clear value prop |

---

## Alternatives Considered

### Alternative 1: Google Forms
**Pros:**
- ✅ Zero development time
- ✅ Free
- ✅ Familiar UI

**Cons:**
- ❌ Not integrated with CMS
- ❌ Not branded
- ❌ No theme support
- ❌ External dependency

### Alternative 2: Typeform
**Pros:**
- ✅ Beautiful UX
- ✅ Conditional logic built-in

**Cons:**
- ❌ Paid ($25/month)
- ❌ External dependency
- ❌ Not integrated with CMS

### Alternative 3: Discord/Slack Integration
**Pros:**
- ✅ Real-time notifications
- ✅ Community building

**Cons:**
- ❌ Requires Discord/Slack account
- ❌ Higher barrier to entry
- ❌ Not integrated with CMS

**Decision:** Build custom solution for best integration and control

---

## Open Questions

1. **Should feedback submissions be anonymous?**
   - Recommendation: Make name/email optional for feedback only

2. **Should we show a "Thank you for your contribution" page or modal?**
   - Recommendation: Success message with email confirmation note

3. **Should submitters receive a confirmation email?**
   - Phase 1: No (keep it simple)
   - Phase 2: Yes (better UX)

4. **Should we have a character limit on fields?**
   - Recommendation: Yes, to prevent abuse and keep submissions concise
   - Title/Name: 100 chars
   - Short text: 300 chars
   - Long text: 500 chars

5. **Should we allow file uploads (e.g., for guest photos)?**
   - Phase 1: No
   - Future: Maybe, but adds complexity

---

## Next Steps

1. **Review & Approve** this proposal
2. **Decide on email service** (SendGrid vs. Resend)
3. **Create Sanity schema** for contributions
4. **Build `/contribute` page**
5. **Implement serverless function**
6. **Test with real submissions**
7. **Document for template deployment**

---

## Questions for Rex

1. Do you prefer "Contribute" as the navigation label, or something else?
2. Which email notification service do you prefer (SendGrid or Resend)?
3. Should feedback submissions require name/email, or can they be anonymous?
4. Do you want to be notified immediately (email), or daily digest?
5. Any additional fields you'd like to collect?

---

**Ready to implement?** Let me know if you'd like to proceed, or if you have feedback on the proposal!
