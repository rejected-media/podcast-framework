# Community Contribution Feature - Setup Guide

## Overview

The community contribution feature allows active podcasts to collect:
- 💡 Episode ideas
- 🎙️ Guest recommendations
- ❓ Questions for the show
- 💬 Feedback

**Key Features:**
- ✅ Anonymous submissions supported
- ✅ Spam protection (honeypot + rate limiting: 5 submissions/hour per IP)
- ✅ Immediate email notifications via Resend
- ✅ All submissions stored in Sanity CMS with status tracking
- ✅ Conditional navigation (only visible for active podcasts)

---

## Setup Steps

### 1. Enable Feature for Podcast

In Sanity Studio, set the podcast as active:
1. Navigate to **Content** → **Podcast Settings**
2. Toggle **"Is Active"** to `true`
3. Save changes

This will make the "Contribute" link appear in the header and footer.

---

### 2. Create Resend Account

1. Go to https://resend.com/
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

---

### 3. Get Resend API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Podcast Contributions"
4. Copy the API key (starts with `re_`)

---

### 4. Configure Environment Variables

Add these to your `.env` file (and Netlify environment variables):

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_EMAIL=rkirshner@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev  # Use this for testing, or verify your own domain
```

**For production (Netlify):**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Add the same three variables above
3. Redeploy your site

---

### 5. Test Locally

1. Ensure Sanity Studio is running (`npm run sanity`)
2. Ensure dev server is running (`npm run dev`)
3. Visit http://localhost:4322/contribute
4. Test submission with each contribution type
5. Check Sanity Studio for new contributions: **Content** → **Community Contributions**
6. Check your email for notification

---

### 6. Verify Sanity Schema

The contribution schema should already be visible in Sanity Studio:

1. Open http://localhost:3333/ (Sanity Studio)
2. Look for **"Community Contributions"** in the sidebar
3. You can manually create test contributions here

**Schema Features:**
- 4 contribution types (episode-idea, guest-recommendation, question, feedback)
- Conditional fields (only relevant fields show based on type)
- Status tracking (🆕 New, 👀 Reviewed, ✅ Actioned, 📦 Archived)
- Optional submitter name/email (anonymous supported)
- Host notes field (private, not visible to submitter)

---

## Usage

### Accessing the Page

**For Active Podcasts:**
- URL: `/contribute`
- Navigation: Appears in header and footer between "Guests" and "About"

**For Concluded Podcasts:**
- Page returns 404 (feature hidden)
- Navigation links don't appear

### Managing Contributions in Sanity

1. Go to **Content** → **Community Contributions**
2. View all submissions with previews
3. Click to open and review details
4. Update status:
   - 🆕 **New** - Just received
   - 👀 **Reviewed** - You've seen it
   - ✅ **Actioned** - You've taken action (invited guest, recorded episode, etc.)
   - 📦 **Archived** - No longer relevant
5. Add private notes in "Host Notes" field

### Email Notifications

You'll receive an immediate email for each submission with:
- Contribution type and emoji
- Submitter name (or "Anonymous")
- Submitter email (or "No email provided")
- All submission details
- Link to view in Sanity Studio

**Email formatting:**
- HTML formatted for readability
- Color-coded by contribution type
- Includes all relevant fields
- Direct link to Sanity Studio document

---

## Spam Protection

The feature includes two layers of spam protection:

### 1. Honeypot Field
- Hidden form field named "website"
- Bots fill it out, humans don't
- Submissions with honeypot filled are silently accepted (no error shown to bot)

### 2. Rate Limiting
- Maximum 5 submissions per hour per IP address
- After limit, returns 429 error: "Too many submissions. Please try again later."
- Resets after 1 hour
- In-memory store (resets on Netlify cold start, which is fine for MVP)

---

## Testing Checklist

### Local Testing
- [ ] Set podcast to active in Sanity
- [ ] Visit `/contribute` page loads
- [ ] "Contribute" link appears in header
- [ ] "Contribute" link appears in footer
- [ ] Submit episode idea (with all required fields)
- [ ] Submit guest recommendation
- [ ] Submit question
- [ ] Submit feedback (all 3 types: praise, suggestion, bug)
- [ ] Submit anonymously (no name/email)
- [ ] Submit with name/email
- [ ] Verify contribution appears in Sanity Studio
- [ ] Verify email notification received
- [ ] Test honeypot (fill hidden "website" field manually via dev tools)
- [ ] Test rate limiting (submit 6 times rapidly)

### Theme Integration
- [ ] Page uses BaseLayout (themed header/footer)
- [ ] Form styling matches site colors
- [ ] Mobile responsive
- [ ] Success/error messages styled correctly

### Production Testing
- [ ] Deploy to Netlify
- [ ] Verify environment variables set in Netlify
- [ ] Test submission on production URL
- [ ] Verify email delivery
- [ ] Check Sanity production dataset for submission

---

## Troubleshooting

### "Page not found" when visiting `/contribute`
**Issue:** Podcast not marked as active
**Fix:** Set `isActive = true` in Sanity Studio → Podcast Settings

### Email not sending
**Possible causes:**
1. Missing `RESEND_API_KEY` environment variable
2. Invalid API key
3. `RESEND_FROM_EMAIL` not verified (use `onboarding@resend.dev` for testing)
4. Missing `NOTIFICATION_EMAIL` variable

**Check:**
- Netlify function logs for errors
- Resend dashboard for failed sends

### Contribution not appearing in Sanity
**Possible causes:**
1. Missing `SANITY_API_TOKEN` with write permissions
2. Network error
3. Invalid data format

**Fix:**
1. Verify `SANITY_API_TOKEN` is set in Netlify environment variables
2. Check Netlify function logs
3. Test locally first

### Rate limiting too aggressive
**Current limit:** 5 submissions per hour per IP

**To adjust:**
Edit `netlify/functions/contribute.ts`:
```typescript
const RATE_LIMIT = 10; // Change to 10
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
```

---

## File Reference

**Created Files:**
- `sanity/schemas/contribution.ts` - Sanity schema for contributions
- `src/pages/contribute.astro` - Contribution form page
- `netlify/functions/contribute.ts` - Serverless function for form submission
- `.env.example` - Updated with Resend configuration

**Modified Files:**
- `sanity/schemaTypes/index.ts` - Added contribution schema
- `src/components/Header.astro` - Added conditional "Contribute" link
- `src/components/Footer.astro` - Added conditional "Contribute" link
- `package.json` - Added `resend` dependency

---

## Next Steps

1. **Set up Resend account** (if not already done)
2. **Configure environment variables** in `.env` and Netlify
3. **Enable podcast as active** in Sanity Studio
4. **Test locally** using the checklist above
5. **Deploy to Netlify** and test in production
6. **Monitor submissions** in Sanity Studio

---

## Future Enhancements

**Possible additions:**
- Confirmation email to submitter (opt-in)
- Daily digest instead of immediate emails
- Public "Ideas Board" (opt-in for submitters)
- Turnstile (Cloudflare's privacy-friendly CAPTCHA)
- Privacy policy page
- GDPR compliance features (data export, deletion requests)

**See also:** `context/tasks/requests-proposal.md` for comprehensive feature proposal

---

**Questions?** Check the proposal document or ask for help!
