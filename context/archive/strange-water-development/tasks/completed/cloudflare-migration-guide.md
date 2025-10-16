# Cloudflare Pages Migration Guide

**Last Updated:** 2025-10-08
**Estimated Time:** 4-6 hours (including testing)
**Risk Level:** Medium (production deployment with rollback plan)

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Post-Migration Verification](#post-migration-verification)
5. [Rollback Procedure](#rollback-procedure)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Migrate to Cloudflare Pages?

**Benefits:**
- **Unlimited bandwidth** (vs. Netlify's 100GB free tier)
- **Faster cold starts** (~5ms vs. ~200ms on AWS Lambda)
- **500 builds/month free** (vs. Netlify's 300)
- **Global edge network** (330+ cities vs. AWS Lambda regions)
- **Same cost:** $0/month for this use case

**What Changes:**
- Hosting platform: Netlify → Cloudflare Pages
- Serverless runtime: AWS Lambda (Node.js) → Cloudflare Workers (V8 Isolates)
- Rate limiting: In-memory Map → Upstash Redis (distributed)
- Build command: Same (`npm run build`)
- Deployment: Git push (auto-deploy on both platforms)

**What Stays the Same:**
- Astro SSG (static site generation)
- Business logic (services remain unchanged)
- Sanity CMS integration
- Resend email integration
- DNS management (still via Cloudflare)

---

## Pre-Migration Checklist

### 1. Verify Current State

```bash
# 1. Ensure you're on latest code
git status  # Should be clean
git pull origin main

# 2. Run tests locally
npm test  # Should pass (39/40 tests)

# 3. Verify Netlify is working
# Visit https://strangewater.xyz/contribute
# Submit a test contribution
```

### 2. Set Up Upstash Redis (Required for Rate Limiting)

Cloudflare Workers don't support in-memory state between requests. We need distributed rate limiting.

**Create Free Upstash Redis Account:**

1. Go to https://upstash.com
2. Sign up (free tier: 10,000 commands/day)
3. Create new Redis database:
   - **Name:** `strangewater-rate-limit`
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Type:** Regional (free tier)
4. After creation, copy these values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Cost:** $0/month (free tier sufficient for <10K requests/day)

### 3. Install Required Dependencies

```bash
# Install Cloudflare adapter for Astro
npm install --save-dev @astrojs/cloudflare

# Install Upstash Redis client
npm install @upstash/redis

# Verify installation
npm list @astrojs/cloudflare @upstash/redis
```

---

## Step-by-Step Migration

### Phase 1: Create Cloudflare Pages Project (30 min)

#### 1.1 Connect GitHub Repository

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** > **Pages**
3. Click **Create application** > **Pages** > **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select repository: `rexkirshner/podcast-framework`
6. Click **Begin setup**

#### 1.2 Configure Build Settings

**Framework preset:** Astro

**Build configuration:**
- **Production branch:** `main`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)

**Environment variables** (click **Add variable** for each):

```env
# Sanity (CMS)
PUBLIC_SANITY_PROJECT_ID=ej6443ov
PUBLIC_SANITY_DATASET=production
SANITY_PROJECT_ID=ej6443ov
SANITY_DATASET=production
SANITY_API_TOKEN=<your-sanity-write-token>

# Resend (Email)
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=contribution@noreply.strangewater.xyz
NOTIFICATION_EMAIL=swrequests@rexkirshner.com

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=<from-upstash-dashboard>
UPSTASH_REDIS_REST_TOKEN=<from-upstash-dashboard>

# Optional
ALLOWED_ORIGIN=https://strangewater.xyz
STUDIO_URL=https://strangewater.xyz

# Google Analytics
PUBLIC_GA_MEASUREMENT_ID=<your-ga-id>

# Sentry (if using)
PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-token>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project>
```

**Important:** Copy these from your Netlify dashboard (`Site settings` > `Environment variables`)

#### 1.3 Initial Deploy (Preview)

1. Click **Save and Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Cloudflare will assign a preview URL: `https://podcast-framework-xyz.pages.dev`
4. **DO NOT** change DNS yet - we'll test the preview first

---

### Phase 2: Test Preview Deployment (1 hour)

#### 2.1 Verify Static Pages

Visit the preview URL and check:

- [ ] Homepage loads correctly
- [ ] Episode pages render (pick 3-5 random episodes)
- [ ] Guest pages render
- [ ] About page renders
- [ ] Navigation works
- [ ] Images load
- [ ] Tailwind styles applied

**Expected:** All static content should work immediately

#### 2.2 Test Newsletter Form

1. Go to preview URL homepage
2. Scroll to newsletter signup
3. Enter test email: `test@example.com`
4. Submit form

**Expected Results:**
- ✅ Form submits successfully
- ✅ Sees success message
- ✅ Check Upstash dashboard: Should see 1 command executed
- ✅ Check ConvertKit: Email should be added to list

**If Failed:** Check Cloudflare Pages Functions logs (see Troubleshooting)

#### 2.3 Test Contribution Form

1. Go to `<preview-url>/contribute`
2. Fill out contribution form (any type)
3. Submit

**Expected Results:**
- ✅ Form submits successfully
- ✅ Sees success message
- ✅ Check Sanity Studio: Contribution should appear
- ✅ Check email: Should receive notification at `NOTIFICATION_EMAIL`
- ✅ Check Upstash: Rate limit counter incremented

**If Failed:** Check Cloudflare Pages Functions logs

#### 2.4 Test Rate Limiting

1. Submit newsletter form 6 times rapidly (within 1 minute)
2. On 6th submission, should see: "Too many requests. Please try again later."

**Expected:** Rate limiting works via Upstash Redis

#### 2.5 Performance Testing

Run Lighthouse on preview URL:

```bash
# Install Lighthouse CLI if needed
npm install -g lighthouse

# Run audit
lighthouse <preview-url> --view
```

**Expected Metrics (should match or exceed Netlify):**
- Performance: ≥95
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <200ms

---

### Phase 3: DNS Cutover (30 min)

**⚠️ CRITICAL:** Only proceed if Phase 2 testing passed 100%

#### 3.1 Add Custom Domain in Cloudflare Pages

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `strangewater.xyz`
4. Cloudflare will detect it's already in your account
5. Click **Activate domain**

**Cloudflare will automatically:**
- Create CNAME record pointing to `<project>.pages.dev`
- Issue SSL certificate (Let's Encrypt)
- Enable HTTPS redirect

#### 3.2 Verify DNS Propagation

```bash
# Check DNS resolution
dig strangewater.xyz

# Should show:
# strangewater.xyz.  300  IN  CNAME  podcast-framework-xyz.pages.dev.
```

Wait 2-5 minutes for DNS to propagate globally.

#### 3.3 Test Production Domain

1. Visit `https://strangewater.xyz`
2. Verify it loads the Cloudflare Pages site (check preview URL content matches)
3. **Repeat all Phase 2 tests on production domain**

---

### Phase 4: Monitor & Validate (1-2 hours)

#### 4.1 Check Cloudflare Analytics

**Go to:** Cloudflare Pages project > **Analytics**

Monitor for 1 hour:
- **Requests:** Should see traffic
- **Errors:** Should be 0% or <1%
- **Bandwidth:** Should match expected traffic
- **Unique visitors:** Should match Google Analytics

#### 4.2 Check Upstash Redis Usage

**Go to:** Upstash dashboard > Database > **Details**

Monitor:
- **Commands/day:** Should see rate limit checks
- **Storage:** Should stay under 25MB (free tier)
- **Errors:** Should be 0%

#### 4.3 Check Sentry Errors (if configured)

**Go to:** Sentry dashboard > Project

Monitor for:
- Function errors
- JavaScript errors
- Performance issues

**Expected:** Zero new errors related to Cloudflare migration

#### 4.4 Verify Email Notifications

1. Submit 2-3 test contributions
2. Check that notification emails arrive
3. Verify email formatting is correct

---

## Post-Migration Verification

### Checklist (All Must Pass)

- [ ] **Homepage loads in <2s**
- [ ] **All episode pages accessible** (spot check 10 random episodes)
- [ ] **Newsletter signup works** (test 3x)
- [ ] **Contribution form works** (test all 4 types)
- [ ] **Rate limiting active** (test by submitting 6x rapidly)
- [ ] **Email notifications received** (for contributions)
- [ ] **Google Analytics tracking** (verify pageviews in GA dashboard)
- [ ] **Zero Sentry errors** (for 24 hours)
- [ ] **Upstash Redis usage under limit** (<10K commands/day)
- [ ] **Lighthouse score ≥95** (performance)

### Success Criteria

**Migration is successful if:**
1. All checklist items pass ✅
2. Zero critical errors in Cloudflare/Sentry logs for 48 hours
3. Site performance equal to or better than Netlify
4. All forms (newsletter, contribute) working 100%

### Failure Criteria (Rollback Immediately)

**Rollback if ANY of these occur:**
- ❌ >5% error rate on any function
- ❌ Newsletter or contribution forms non-functional
- ❌ Site performance degrades >20%
- ❌ Build failures (>2 consecutive failures)
- ❌ Email notifications fail >10% of the time

---

## Rollback Procedure

**If migration fails, follow these steps to restore Netlify hosting:**

### Quick Rollback (5-10 minutes)

#### 1. Restore Netlify DNS

**In Cloudflare dashboard:**
1. Go to **DNS** > **Records**
2. Find CNAME for `strangewater.xyz`
3. Edit CNAME:
   - **Name:** `strangewater` (or `@` for root domain)
   - **Target:** `strangewater.netlify.app` (your Netlify subdomain)
   - **Proxy status:** DNS only (gray cloud)
4. Save

**Verify:**
```bash
dig strangewater.xyz
# Should show: strangewater.netlify.app
```

#### 2. Disable Cloudflare Pages Custom Domain

1. Go to Cloudflare Pages project > **Custom domains**
2. Find `strangewater.xyz`
3. Click **...** > **Remove**

#### 3. Verify Netlify is Live

1. Visit `https://strangewater.xyz`
2. Should load Netlify-hosted site
3. Test forms (newsletter, contribution)
4. Verify everything works

**Expected Time to Restore:** 5-10 minutes (DNS propagation)

### Full Rollback (if needed)

If quick rollback doesn't work:

1. **Pause Cloudflare Pages deployments:**
   - Project settings > **Deployments** > **Pause deployments**

2. **Re-enable Netlify auto-deploy:**
   - Netlify dashboard > **Site settings** > **Build & deploy**
   - Ensure **Auto publishing** is enabled

3. **Trigger Netlify rebuild:**
   ```bash
   git commit --allow-empty -m "Force Netlify rebuild"
   git push origin main
   ```

4. **Monitor Netlify build:**
   - Should complete in 2-3 minutes
   - Visit `strangewater.netlify.app` to verify

5. **Update DNS to Netlify:**
   - Follow step #1 from Quick Rollback above

---

## Troubleshooting

### Common Issues

#### Issue 1: Function Invocation Errors

**Symptoms:**
- Forms submit but return 500 error
- Cloudflare logs show: `Error: Module not found`

**Solution:**
```bash
# 1. Check that functions directory exists
ls -la functions/

# 2. Verify TypeScript compilation
npx tsc --noEmit functions/*.ts

# 3. Rebuild and redeploy
git push origin main
```

#### Issue 2: Rate Limiting Not Working

**Symptoms:**
- Can submit forms >5 times per minute
- Upstash dashboard shows 0 commands

**Solution:**
1. Verify Upstash credentials in Cloudflare env vars
2. Check Upstash dashboard > **Database** > **Details** > **REST API**
3. Test Redis connection:
   ```bash
   curl https://<your-redis-url>/get/test \
     -H "Authorization: Bearer <your-token>"
   ```
4. If connection fails, regenerate Upstash token

#### Issue 3: Email Notifications Not Sending

**Symptoms:**
- Contribution submissions succeed
- No email received

**Solution:**
1. Check Cloudflare env vars for `RESEND_API_KEY`
2. Check Resend dashboard > **Logs** for delivery status
3. Verify `RESEND_FROM_EMAIL` is verified in Resend
4. Check Sentry for `resend` errors

#### Issue 4: Build Failures

**Symptoms:**
- Cloudflare Pages build fails with module errors

**Solution:**
```bash
# 1. Ensure all dependencies installed
npm install

# 2. Test build locally
npm run build

# 3. Check astro.config.cloudflare.mjs
cat astro.config.cloudflare.mjs

# 4. Verify Node version matches
# Cloudflare uses Node 18+ - ensure package.json has:
# "engines": { "node": ">=18.0.0" }
```

#### Issue 5: Function Logs Not Showing

**Where to Find Logs:**

1. **Cloudflare Dashboard:**
   - Go to **Workers & Pages** > Your project
   - Click **Functions** tab
   - Click on function name (e.g., `/newsletter-subscribe`)
   - View **Logs** section

2. **Real-time Logs:**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Tail logs
   wrangler pages deployment tail <project-name>
   ```

---

## Cost Comparison

### Before Migration (Netlify)

| Item | Cost | Limit |
|------|------|-------|
| **Hosting** | $0/month | - |
| **Bandwidth** | $0/month | 100 GB |
| **Builds** | $0/month | 300/month |
| **Function Invocations** | $0/month | 125K/month |
| **Build Minutes** | $0/month | 300 minutes/month |
| **TOTAL** | **$0/month** | - |

### After Migration (Cloudflare + Upstash)

| Item | Cost | Limit |
|------|------|-------|
| **Hosting (Cloudflare Pages)** | $0/month | - |
| **Bandwidth** | $0/month | ∞ Unlimited |
| **Builds** | $0/month | 500/month |
| **Function Invocations** | $0/month | 100K/day |
| **Rate Limiting (Upstash Redis)** | $0/month | 10K commands/day |
| **TOTAL** | **$0/month** | - |

**Savings:** $0/month (but better limits and performance)

---

## Next Steps After Migration

### Recommended Actions

1. **Update README.md:**
   - Change "Hosted on Netlify" → "Hosted on Cloudflare Pages"
   - Update deployment instructions

2. **Delete Netlify Site (After 30 Days):**
   - Keep Netlify active for 30 days as backup
   - After 30 days of stable Cloudflare: Delete Netlify site

3. **Monitor Performance for 1 Month:**
   - Track Cloudflare Analytics weekly
   - Compare bandwidth usage
   - Monitor Upstash Redis usage (should stay under free tier)

4. **Optimize Further (Optional):**
   - Enable Cloudflare Caching rules
   - Add Cloudflare Image Optimization
   - Consider Cloudflare R2 for episode covers (if needed)

---

## Support & Resources

### Documentation
- **Cloudflare Pages:** https://developers.cloudflare.com/pages
- **Astro + Cloudflare:** https://docs.astro.build/en/guides/deploy/cloudflare
- **Upstash Redis:** https://upstash.com/docs/redis/overall/getstarted

### Getting Help
- **Cloudflare Community:** https://community.cloudflare.com
- **Upstash Discord:** https://upstash.com/discord
- **Project Issues:** https://github.com/rexkirshner/podcast-framework/issues

---

## Summary

**Total Time:** 4-6 hours
- Setup: 30 min
- Testing: 1-2 hours
- DNS cutover: 30 min
- Monitoring: 1-2 hours
- Buffer for issues: 1 hour

**Risk Level:** Medium
- Rollback available in <10 minutes
- No data migration required
- Same codebase, different platform

**Benefits:**
- ∞ Unlimited bandwidth
- Faster cold starts (~5ms)
- Better global performance
- Same $0 cost

**When to Execute:**
- Low-traffic time (e.g., late evening/early morning)
- When you can monitor for 2-3 hours post-migration
- After thorough testing of preview deployment

**Checklist Before Starting:**
- [ ] Backup current DNS records
- [ ] Have Netlify credentials ready (for rollback)
- [ ] Upstash Redis account created
- [ ] All environment variables documented
- [ ] Tested locally with `npm run build`
- [ ] Blocked 4-6 hours for migration + monitoring

Good luck! 🚀
