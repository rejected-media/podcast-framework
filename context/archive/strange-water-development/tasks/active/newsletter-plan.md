# Newsletter Feature Implementation Plan

> **✅ IMPLEMENTED (2025-10-08):** Minimal Custom version completed (4 hours)
>
> **What was built:**
> - Netlify function `/api/newsletter/subscribe` with ConvertKit API integration
> - Reusable `NewsletterSignup.astro` component (inline + footer variants)
> - Podcast schema fields: `newsletterEnabled`, `convertKitApiKey`, `convertKitFormId`
> - Conditional display: Only shows when `isActive && newsletterEnabled`
> - Zero external dependencies - direct ConvertKit REST API calls
> - Placements: Homepage (inline) + Footer (compact)
>
> **Upgrade path:** To Full Custom (add Sanity storage + webhooks) = 5-6 hours

## Overview
Build a lightweight, flexible newsletter system to collect subscriber emails for episode notifications, with the ability to expand to full newsletter content in the future.

---

## 1. Concept & Requirements

### Primary Use Case (Phase 1)
- Collect subscriber emails
- Send notifications when new episodes are published
- Simple, automated workflow

### Future Use Case (Phase 2)
- Send newsletters with custom content (show notes, guest highlights, etc.)
- Rich HTML email templates
- Scheduled sends (weekly/monthly digest)

### Key Constraints
- Only visible when podcast is active (`podcastInfo.isActive === true`)
- Lightweight implementation (minimal ongoing costs)
- GDPR/CAN-SPAM compliant
- Easy to manage without technical knowledge

---

## 2. Technical Architecture

### Recommended Approach: Hybrid Solution

**Data Flow:**
```
User Form → API Route → Sanity CMS (backup) → Email Service Provider (ESP)
                                              ↓
                                        Confirmation Email
                                              ↓
                                        Double Opt-in Confirmed
```

**Why Hybrid?**
- ✅ Keep full control of subscriber data (stored in Sanity)
- ✅ Leverage ESP's deliverability, templates, and automation
- ✅ Easy migration between providers
- ✅ Free tier sufficient for most podcasts
- ✅ Can switch to self-hosted later without losing data

### Alternative Approaches Considered

| Approach | Pros | Cons | Cost |
|----------|------|------|------|
| **Pure ESP** (Mailchimp/ConvertKit) | Simple, no code | Locked into provider | Free-$13/mo |
| **Self-hosted** (Sanity + SendGrid) | Full control | More maintenance | ~$1-5/mo |
| **Substack** | Free, built-in audience | 10% fee, less control | Free |
| **Hybrid** (Recommended) | Best of both worlds | Slightly more complex | Free-$9/mo |

---

## 3. Email Service Provider Comparison

### ConvertKit (Recommended)
- **Free Tier:** Up to 1,000 subscribers
- **Paid:** $9/month for 1,000+ subscribers
- **Pros:**
  - Best free tier for podcasters
  - Excellent automation (tag subscribers, send on trigger)
  - Simple API
  - Creator-focused (designed for content creators)
  - Visual automation builder
- **Cons:**
  - Limited templates on free tier
- **Rating:** ⭐⭐⭐⭐⭐

### Mailchimp
- **Free Tier:** Up to 500 subscribers
- **Paid:** $13/month for 500+ subscribers
- **Pros:**
  - Well-known, trusted
  - Great templates
  - Advanced analytics
- **Cons:**
  - More expensive
  - Smaller free tier
  - Complex UI
- **Rating:** ⭐⭐⭐⭐

### Buttondown
- **Free Tier:** Up to 100 subscribers
- **Paid:** $9/month for 1,000 subscribers
- **Pros:**
  - Markdown-based (perfect for tech-savvy)
  - Simple, clean interface
  - Great for plain-text newsletters
- **Cons:**
  - Smallest free tier
  - Less automation
- **Rating:** ⭐⭐⭐⭐

### Self-Hosted (SendGrid/Mailgun)
- **Cost:** ~$0.80-1.00 per 1,000 emails
- **Pros:**
  - Cheapest at scale
  - Full control
- **Cons:**
  - Must build templates
  - Must handle unsubscribes
  - Must manage deliverability
- **Rating:** ⭐⭐⭐ (for Phase 1)

**Recommendation: ConvertKit**
- Start with free tier (1,000 subscribers)
- Upgrade to $9/month when needed
- Total estimated cost: **$0-9/month**

---

## 4. Implementation Plan

### Phase 1: Basic Email Collection (Episode Notifications)

#### 4.1 Sanity Schema
Create `subscriber.ts` schema:
```typescript
{
  _type: 'subscriber',
  email: string (required, unique),
  subscribedAt: datetime,
  confirmed: boolean,
  source: string ('homepage', 'newsletter-page', 'footer'),
  tags: array<string> (['episode-notifications']),
  espSubscriberId: string (ConvertKit ID),
  unsubscribedAt: datetime?,
  active: boolean
}
```

#### 4.2 API Routes
**`/api/subscribe.ts`** - Handle form submissions
- **Validate with Zod schema**: Use structured validation (email format, required fields)
- **Security checks**:
  - Enforce strict origin checks to prevent third-party abuse
  - Honeypot field to catch bots
  - Rate limiting per IP (e.g., max 3 requests per 15 minutes)
  - Short IP-based throttling for spam bursts
- Check for duplicates in Sanity
- Add to Sanity database with `confirmed: false` initially
- Call ConvertKit API to add subscriber
- ConvertKit sends confirmation email
- Return success/error

**`/api/webhook/convertkit.ts`** - Handle ConvertKit webhooks
- Verify webhook signature for security
- Listen for subscriber confirmation events
- Update Sanity: set `confirmed: true` only after double opt-in
- Listen for unsubscribe events
- Update Sanity: set `active: false` when user unsubscribes
- Keep Sanity and ConvertKit in sync bidirectionally

**`/api/unsubscribe.ts`** - Handle unsubscribe requests
- Mark as inactive in Sanity
- Remove from ConvertKit
- Show confirmation message

#### 4.3 UI Components
Create `NewsletterSignup.astro` **with props for reusability**:
```astro
---
interface Props {
  variant?: 'inline' | 'full' | 'footer';
  placeholder?: string;
  buttonText?: string;
}

const { variant = 'inline', placeholder = 'Your email', buttonText = 'Subscribe' } = Astro.props;
---

<form id="newsletter-form" class={`newsletter-${variant}`}>
  <label for="email" class="sr-only">Email address</label>
  <input
    type="email"
    id="email"
    name="email"
    placeholder={placeholder}
    required
    aria-required="true"
  />
  <input type="text" name="website" style="display:none" aria-hidden="true" /> <!-- Honeypot -->
  <button type="submit">{buttonText}</button>
  <div role="status" aria-live="polite" class="sr-only"></div> <!-- For screen reader feedback -->
</form>
```

**Key Features**:
- Single component with `variant` prop instead of duplicating markup
- Accessible: proper labels (visually hidden), ARIA attributes, semantic HTML
- Works without JavaScript (native form submit + server response)
- Progressive enhancement for inline validation and success states

Usage:
- Homepage: `<NewsletterSignup variant="inline" />`
- Newsletter page: `<NewsletterSignup variant="full" />`
- Footer: `<NewsletterSignup variant="footer" />`

#### 4.4 Placement on Website

**Homepage** (if podcast active)
- Update existing "Subscribe" section
- Add email input field below platform buttons
- Alternative: Add as separate section after "About"

**Dedicated /newsletter Page** (new)
- Hero: Why subscribe
- Email signup form
- FAQ section
- Past episodes showcase
- Only accessible if `podcastInfo.isActive`

**Footer** (all pages)
- Small signup form
- "Get episode updates" CTA
- Only show if active

**About Page** (optional)
- Below subscribe section
- Alternative to platform links

**Episode Pages** (end of transcript)
- "Enjoyed this episode? Get notified..."
- Small inline form

#### 4.5 ConvertKit Setup

**Initial Setup**
1. Create ConvertKit account
2. Create "Episode Notifications" form
3. Set up automation:
   - Tag: `episode-notifications`
   - Trigger: New episode published
   - Action: Send notification email
4. Create confirmation email template
5. Create episode notification template
6. Get API key and Form ID

**Domain Authentication & Deliverability**
7. **Configure SPF, DKIM, and DMARC records** for sending domain:
   - Required by ConvertKit before enabling automations
   - Critical for deliverability (emails won't reach inbox without these)
   - Follow ConvertKit's DNS setup wizard in account settings
   - Verify all records are properly configured before going live
8. **Plan quarterly deliverability reviews**:
   - Check ConvertKit inbox placement reports
   - Monitor bounce rates, spam complaints, open rates
   - Catch deliverability regressions early

**Webhook Configuration**
9. Set up ConvertKit webhook to sync with Sanity:
   - Webhook URL: `https://yoursite.com/api/webhook/convertkit`
   - Subscribe to events: `subscriber.subscriber_activate`, `subscriber.subscriber_unsubscribe`
   - Verify webhook signature in API route for security
   - **Critical**: Only set `confirmed: true` in Sanity after receiving confirmation event
   - Update `active: false` when receiving unsubscribe event
   - Prevents compliance issues (e.g., Sanity showing active while ConvertKit removed them)

#### 4.6 Email Templates

**Confirmation Email** (sent by ConvertKit)
```
Subject: Confirm your subscription to [Podcast Name]

Hi there!

Thanks for subscribing to [Podcast Name]!

Click below to confirm your subscription and start getting notified about new episodes:

[Confirm Subscription Button]

If you didn't sign up, you can ignore this email.

Cheers,
[Podcast Name] Team
```

**Episode Notification Email** (Phase 1)
```
Subject: New Episode: [Episode Title]

Hi [First Name or "there"],

We just released a new episode of [Podcast Name]!

Episode [#]: [Title]
[Episode Description - 2-3 sentences]

[Listen Now Button → Episode Page]

Listen on: [Spotify] [Apple] [YouTube] [RSS]

---
Don't want these emails? [Unsubscribe]
```

---

### Phase 2: Custom Newsletter Content (Future)

#### 2.1 Sanity Schema Extension
Create `newsletter.ts` schema:
```typescript
{
  _type: 'newsletter',
  subject: string,
  content: portableText,
  scheduledFor: datetime,
  sent: boolean,
  sentAt: datetime?,
  recipients: number,
  openRate: number?,
  clickRate: number?
}
```

#### 2.2 Newsletter Composer
- Use Sanity Studio for composing
- Rich text editor with block content
- Preview before sending
- Schedule for future

#### 2.3 Enhanced Templates
- Header with podcast branding
- Featured episode section
- Guest spotlight
- Community highlights
- Call-to-action buttons

---

## 5. Privacy & Compliance

### Data Protection in Sanity
- **Private Dataset Configuration**:
  - Store subscribers in a private Sanity dataset (disable public read tokens)
  - Configure least-privilege service token for API routes only
  - Never expose email addresses through public content API
  - Prevent PII leaks via CDN or static queries
- **GDPR Data Management**:
  - Document retention policy (e.g., delete unconfirmed subscribers after 30 days)
  - Create deletion script: `/scripts/delete-subscriber.ts` for data erasure requests
  - Maintain audit log of all data access and deletion requests
  - Enable data export via Sanity Studio for user requests

### GDPR Compliance
- ✅ Double opt-in (confirmation email required)
- ✅ Clear privacy policy link on signup
- ✅ Easy unsubscribe (one-click)
- ✅ Data export available (from Sanity)
- ✅ Data deletion on request (documented procedure)
- ✅ PII protected in private dataset

### CAN-SPAM Act Compliance
- ✅ Unsubscribe link in every email
- ✅ Physical mailing address in footer
- ✅ Accurate "From" name and subject line
- ✅ Honor unsubscribe within 10 days

### API Security
- **Rate limiting**: Max 3 requests per IP per 15 minutes (use `rate-limit-flex` or similar)
- **Origin validation**: Strict origin checks to prevent third-party form abuse
- **Schema validation**: Centralized Zod/Valibot schema for email normalization
- **Honeypot field**: Catch automated bot submissions
- **Input sanitization**: Client and server-side email validation
- **Transport security**: HTTPS only
- **Credential management**: Environment variables for API keys (never commit)

---

## 6. Cost Breakdown

### Startup Costs
- **ConvertKit:** $0 (free tier)
- **Development Time:** ~8-12 hours (Phase 1)
- **Total:** $0

### Ongoing Costs
| Subscribers | ConvertKit Cost | SendGrid Cost | Recommended |
|-------------|----------------|---------------|-------------|
| 0-100       | $0             | ~$0           | ConvertKit  |
| 100-500     | $0             | ~$0           | ConvertKit  |
| 500-1,000   | $0             | ~$1/mo        | ConvertKit  |
| 1,000-3,000 | $9/mo          | ~$3/mo        | ConvertKit  |
| 3,000-5,000 | $29/mo         | ~$5/mo        | Consider SendGrid |
| 5,000+      | $49/mo         | ~$10/mo       | SendGrid    |

**Expected Cost for Average Podcast:** $0-9/month

---

## 7. Implementation Checklist

### Setup (1-2 hours)
- [ ] Create ConvertKit account
- [ ] Set up confirmation email
- [ ] Set up episode notification template
- [ ] Get API credentials
- [ ] Add to environment variables

### Backend (4-6 hours)
- [ ] Create Sanity `subscriber` schema
- [ ] Configure private Sanity dataset for subscribers
- [ ] Set up least-privilege service token
- [ ] Deploy schema changes
- [ ] Install dependencies: `zod`, `rate-limit-flex` (or similar)
- [ ] Create `/api/subscribe.ts` endpoint with:
  - [ ] Zod schema validation
  - [ ] Origin checks and CSRF protection
  - [ ] Rate limiting per IP
  - [ ] Honeypot validation
  - [ ] ConvertKit API integration
- [ ] Create `/api/webhook/convertkit.ts` endpoint with:
  - [ ] Webhook signature verification
  - [ ] Handle confirmation events
  - [ ] Handle unsubscribe events
  - [ ] Sync state to Sanity
- [ ] Create `/api/unsubscribe.ts` endpoint
- [ ] Create `/scripts/delete-subscriber.ts` for GDPR requests
- [ ] Test API endpoints
- [ ] Configure ConvertKit webhook in dashboard

### Frontend (4-5 hours)
- [ ] Create `NewsletterSignup.astro` component
- [ ] Add to homepage subscribe section
- [ ] Create `/newsletter` page
- [ ] Add small footer signup
- [ ] Add to episode pages (optional)
- [ ] Test form validation
- [ ] Test submission flow

### Content (1 hour)
- [ ] Write newsletter page copy
- [ ] Create privacy policy section
- [ ] Write FAQ
- [ ] Customize email templates

### Testing & Observability (2-3 hours)

**Integration Tests** (mock ConvertKit API)
- [ ] Success path: Valid email → Sanity record created → ConvertKit called → Success response
- [ ] Duplicate email: Reject with friendly error message
- [ ] Provider failure: ConvertKit API down → Graceful error, retry logic
- [ ] Rate limit rejection: Too many requests from same IP → 429 response
- [ ] Invalid input: Malformed email, missing fields → Validation errors
- [ ] Honeypot triggered: Bot fills hidden field → Silent rejection

**End-to-End Testing**
- [ ] Test signup flow end-to-end with real ConvertKit sandbox
- [ ] Test confirmation emails delivered and links work
- [ ] Test unsubscribe flow (email link and web form)
- [ ] Test with different email providers (Gmail, Outlook, ProtonMail)
- [ ] Test accessibility with screen reader
- [ ] Test form without JavaScript enabled

**Monitoring & Alerts** (Netlify Functions + Sentry)
- [ ] Set up serverless function logs for all API endpoints
- [ ] Configure alerts for repeated ConvertKit API failures
- [ ] Monitor spike in invalid/rejected requests (potential attack)
- [ ] Track successful subscription rate vs. attempts
- [ ] Set up weekly metrics report (new subscribers, unsubscribes, errors)

### Launch
- [ ] Deploy to production
- [ ] Monitor first 10 signups
- [ ] Announce newsletter on social media
- [ ] Add to podcast description

---

## 8. Migration Path (Future)

If you outgrow ConvertKit or want more control:

### Option A: Self-Hosted
1. Export subscribers from ConvertKit
2. Import to Sanity (already have backup)
3. Set up SendGrid/Mailgun
4. Build custom email templates
5. Create send automation

### Option B: Switch ESP
1. Export from ConvertKit (CSV)
2. Import to new provider
3. Update API endpoints
4. Test thoroughly

**Data Safety:** Since we store emails in Sanity, migration is always possible.

---

## 9. Success Metrics

### Phase 1 Goals (First 3 Months)
- 100+ subscribers
- <2% unsubscribe rate
- >20% open rate
- 0 spam complaints

### Phase 2 Goals (6+ Months)
- 500+ subscribers
- Custom newsletter content monthly
- >25% open rate
- >5% click-through rate

---

## 10. Alternatives Considered

### Why Not Substack?
- ❌ Can't customize branding fully
- ❌ 10% fee if monetize
- ❌ Subscriber data locked in platform
- ✅ Would work for content-heavy newsletter

### Why Not Mailchimp?
- ❌ More expensive ($13/mo vs $9/mo)
- ❌ Smaller free tier (500 vs 1,000)
- ✅ Better templates and analytics

### Why Not Pure Self-Hosted?
- ❌ More maintenance
- ❌ Must handle deliverability
- ❌ Must build all features
- ✅ Cheapest at scale (5,000+ subscribers)

---

## 11. Next Steps

1. **Decision Point:** Approve this plan or discuss changes
2. **Service Setup:** Create ConvertKit account
3. **Implementation:** Follow checklist above
4. **Launch:** Soft launch to existing audience
5. **Monitor:** Track metrics for first month
6. **Iterate:** Improve based on feedback

---

## Appendix: Technical Details

### ConvertKit API Integration
```typescript
// Add subscriber
const response = await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: process.env.CONVERTKIT_API_KEY,
    email: email,
    tags: ['episode-notifications']
  })
});
```

### Sanity Subscriber Query
```groq
*[_type == "subscriber" && active == true] | order(subscribedAt desc)
```

### Environment Variables Needed
```bash
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_FORM_ID=your_form_id_here
CONVERTKIT_WEBHOOK_SECRET=your_webhook_secret_here
SANITY_WRITE_TOKEN=your_sanity_write_token_here
```

### Webhook Signature Verification Example
```typescript
// /api/webhook/convertkit.ts
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', process.env.CONVERTKIT_WEBHOOK_SECRET!);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Zod Validation Schema Example
```typescript
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  source: z.enum(['homepage', 'newsletter-page', 'footer', 'episode-page']),
  website: z.string().max(0), // Honeypot - should be empty
});

// In API route:
const result = subscribeSchema.safeParse(requestBody);
if (!result.success) {
  return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
}
```

---

**Estimated Total Implementation Time:** 12-18 hours
- Setup & ConvertKit configuration: 2-3 hours
- Backend (API routes, webhooks, security): 4-6 hours
- Frontend (components, forms, accessibility): 4-5 hours
- Testing & monitoring: 2-3 hours
- Documentation & launch: 1 hour

**Estimated Monthly Cost:** $0-9
**Complexity:** Medium (added security, compliance, and monitoring)
**Maintenance:** Low-Medium (2-3 hours/month)
- Quarterly deliverability reviews
- Monitor metrics and alerts
- Handle subscriber data requests
- Update email templates as needed
