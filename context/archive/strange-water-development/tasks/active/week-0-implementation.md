# Week 0: Prerequisites - Implementation Tracker

**Started:** 2025-10-14 (Session 20)
**Completed:** 2025-10-14 (Session 20)
**Status:** ✅ COMPLETE
**Goal:** Complete all prerequisites before Phase 1
**Actual Time:** ~2 hours

---

## Overview

Week 0 is **CRITICAL** - these tasks must be completed before starting development. Do NOT skip.

**Reference:** See `templatization-plan-v2.1-FINAL.md` - Week 0 section

---

## Task Checklist

### 1. NPM Organization Setup 🔴 **BLOCKING**

**Status:** 🟡 In Progress

#### 1.1 Check Scope Availability

```bash
npm info @podcast-framework
```

**Result:** ✅ AVAILABLE (404 - not taken)

**Checked alternatives:**
- `@podframework` - Available
- `@podcast-fm` - Available
- `@podcast-web` - Available
- `@podcastframework` - Available
- `@podcast-site` - Available
- `@podcast-builder` - Available

**Decision:** ✅ **@podcast-framework** (chosen 2025-10-14)

**Rationale:**
- Professional, clear name
- Matches GitHub organization naturally
- Industry standard pattern (-framework suffix)
- Good for SEO and marketing

#### 1.2 Create NPM Organization

**Scope Chosen:** `@podcast-framework`

**Steps to create:**

1. **Log in to npm** (if not already logged in):
```bash
npm login
```

2. **Create organization:**
   - Open: https://www.npmjs.com/org/create
   - Organization name: `podcast-framework`
   - Choose plan: Free (can upgrade later)
   - Click "Create"

3. **Verify organization:**
   - URL: https://www.npmjs.com/org/podcast-framework
   - Settings → confirm name is correct

- [x] Logged in to npm
- [x] Organization created
- [x] Scope: `@podcast-framework`
- [x] URL: https://www.npmjs.com/org/podcast-framework

**Completed:** 2025-10-14

#### 1.3 Enable 2FA

**⚠️ CRITICAL FOR SECURITY** - Required before publishing packages

**First, ensure you're logged in:**

```bash
npm login
```

**Then enable 2FA:**

```bash
npm profile enable-2fa auth-and-writes
```

**What this does:**
- Requires 2FA for login AND publishing
- Prevents unauthorized package publishes
- Required by npm for organization packages

**Steps:**
1. Run `npm login` (if you got 401 error)
2. Run `npm profile enable-2fa auth-and-writes`
3. Scan QR code with authenticator app (Authy, Google Authenticator, 1Password)
4. Enter verification code
5. Save backup codes in secure location

**Note:** npm is changing token policies (90-day limit starting Oct 13, 2025). This doesn't affect 2FA setup.

- [x] Logged in to npm
- [x] 2FA enabled for account
- [x] Backup codes saved securely
- [x] Confirmed working

**Completed:** 2025-10-14

#### 1.4 Invite Team Members (if applicable)

- [x] Rex Kirshner (owner)
- [ ] Additional members: ________________ (add later as needed)

**Completion Criteria:** ✅ NPM scope owned and secured - **COMPLETE**

---

### 2. GitHub Organization Setup

**Status:** 🟡 In Progress

**Organization Name:** `podcast-framework` (matches npm scope)

#### 2.1 Create Organization

**Steps:**

1. **Create organization:**
   - Open: https://github.com/organizations/new
   - Organization account name: `podcast-framework`
   - Contact email: (your email)
   - This organization belongs to: My personal account
   - Click **"Next"**

2. **Choose plan:**
   - Select: **Free** (perfect for open source)
   - Click **"Create organization"**

3. **Skip team setup** (for now):
   - Click **"Skip this step"** or **"Complete setup"**

4. **Verify:**
   - URL should be: https://github.com/podcast-framework

- [x] Organization created
- [x] Name: `podcast-framework`
- [x] URL: https://github.com/podcast-framework

**Completed:** 2025-10-14

#### 2.2 Configure Settings

**Navigate to:** https://github.com/organizations/podcast-framework/settings/member_privileges

**Configure:**
- [ ] Base permissions: Read
- [ ] Repository creation: Private (repos created manually by you)
- [ ] Enable Discussions: Yes (Settings → Features)
- [ ] Allow forking: Yes
- [ ] Require 2FA: Yes (Settings → Authentication security)

#### 2.3 Create Teams

- [ ] **Maintainers** team (write access)
  - Members: ________________
- [ ] **Contributors** team (triage access)
  - Members: ________________

**Completion Criteria:** ✅ GitHub org configured with teams

---

### 3. Domain Registration (Optional for v1.0)

**Status:** ⏸️ Not Started

**Decision:** Use GitHub Pages initially or register domains?

**Option A: GitHub Pages (Free, quick)**
- URL: `podcast-framework.github.io`
- Can add custom domain later
- No cost

**Option B: Custom Domains**
- podcast-framework.com: $12/year
- Already registered? ☐ Yes ☐ No
- If yes, where? ________________

**Choice:** _[To be decided]_

**Completion Criteria:** ✅ Hosting decision made

---

### 4. Service Accounts Setup

**Status:** ⏸️ Not Started

#### 4.1 NPM Publish Token

```bash
# Create token for CI/CD
npm token create --cidr=0.0.0.0/0
```

**Creating via Web UI (Recommended):**

1. **Go to:** https://www.npmjs.com/settings/YOUR_USERNAME/tokens

2. **Click:** "Generate New Token" → **"Granular Access Token"**
   - (NOT Classic Token - those are deprecated in November)

3. **Configure token:**
   - Token name: `github-actions-publish`
   - Expiration: **90 days** (max allowed, will need renewal)
   - Packages and scopes → Select packages: **Select all packages**
   - Or: Organizations → Select: `@podcast-framework` → Permissions: **Read and write**

4. **Generate token**
   - Click "Generate Token"
   - **Copy the token immediately** (starts with `npm_`)
   - You won't see it again!

5. **Save token securely:**
   - Password manager
   - Or temporary note (we'll add to GitHub secrets next)

- [x] Granular access token created
- [x] Token name: `github-actions-publish`
- [x] Permissions: Read/write on @podcast-framework
- [x] Token copied and saved securely
- [x] Added to GitHub secrets as `NPM_TOKEN`

**Completed:** 2025-10-14

#### 4.2 GitHub Personal Access Token

**Purpose:** Allows main repo to trigger updates in template repo when packages are published

**Use Fine-Grained Token (recommended):**

**Steps:**

1. **Go to:** https://github.com/settings/tokens?type=beta

2. **Click:** "Generate new token"

3. **Configure:**
   - Token name: `framework-template-sync`
   - Expiration: **90 days** (can renew later)
   - Repository access: **All repositories** (easiest) OR select podcast-framework organization

4. **Repository permissions:**
   - Contents: **Read and write**
   - Metadata: **Read-only** (auto-selected)
   - Workflows: **Read and write**

5. **Click "Generate token"**
   - Copy token immediately (starts with `github_pat_`)
   - Save securely

- [x] Fine-grained PAT created
- [x] Token name: `framework-template-sync`
- [x] Permissions: Contents (RW), Workflows (RW)
- [x] Token copied and saved

**Completed:** 2025-10-14

#### 4.3 Configure GitHub Secrets

**In main framework repo:** https://github.com/podcast-framework/podcast-framework/settings/secrets/actions

- [x] `NPM_TOKEN` - Added (for publishing packages)
- [x] `TEMPLATE_REPO_PAT` - Added (for syncing template)

**Completed:** 2025-10-14

**Completion Criteria:** ✅ All tokens created and secrets configured - **COMPLETE**

---

### 5. Development Environment

**Status:** ✅ Verified

#### 5.1 Verify Tools

```bash
node --version   # Should be 18.0.0 or higher
npm --version    # Should be 9.0.0 or higher
git --version    # Any recent version
```

**Results:**
- Node version: v22.20.0 ✅ (exceeds requirement of 18+)
- npm version: 11.6.1 ✅ (exceeds requirement of 9+)
- Git version: 2.39.5 ✅

**Verified:** 2025-10-14

#### 5.2 Configure Git

```bash
git config --global user.name "Rex Kirshner"
git config --global user.email "your@email.com"
```

- [x] Git configured (already set up)
- [x] SSH keys set up for GitHub (working - pushed earlier)

#### 5.3 Editor Setup

- [x] VS Code installed and working
- [x] Environment functional (used throughout this session)

**Completion Criteria:** ✅ Environment verified and ready - **COMPLETE**

---

## Week 0 Exit Criteria

**✅ ALL COMPLETE - Ready for Phase 1**

- ✅ NPM scope secured and owned (`@podcast-framework`)
- ✅ NPM organization created with 2FA enabled
- ✅ GitHub organization created (`podcast-framework`)
- ✅ Main repository created (`podcast-framework/podcast-framework`)
- ✅ All CI/CD secrets configured (`NPM_TOKEN`, `TEMPLATE_REPO_PAT`)
- ✅ Development environment verified (Node 22.20.0, npm 11.6.1, Git 2.39.5)
- ✅ No blockers to starting Phase 1

**Completed:** 2025-10-14
**Actual time:** ~2 hours

---

## Next Steps (After Week 0 Complete)

**Week 1 - Phase 1: Foundation**

1. Create repositories:
   - `podcast-framework` (main monorepo)
   - `podcast-template` (GitHub template)
   - `podcast-framework-docs` (documentation)

2. Set up monorepo structure (npm workspaces)

3. Begin core extraction from Strange Water

---

## Notes

**Blockers:** _[Document any blockers here]_

**Decisions Made:** _[Document key decisions]_

**Questions:** _[Questions that arise during setup]_

---

**Last Updated:** 2025-10-14
**Status:** ✅ COMPLETE + Phase 1 Week 1 Started

**UPDATE:** Week 0 complete, began Phase 1 Week 1:
- ✅ Monorepo structure created
- ✅ TypeScript configured
- ✅ 5 components extracted (Header, Footer, NewsletterSignup, EpisodeSearch, TranscriptViewer)
- ✅ Component resolver implemented (bundler-safe with import.meta.glob)
- ✅ Utilities library created
- ✅ All code committed and pushed to GitHub