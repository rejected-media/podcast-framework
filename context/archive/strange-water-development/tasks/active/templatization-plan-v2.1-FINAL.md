# Podcast Framework Templatization Plan v2.1 FINAL

**Document Version:** 2.1.0 (FINAL - Production Ready)
**Date Created:** 2025-10-14 (Session 20)
**Status:** READY FOR IMPLEMENTATION
**Previous Version:** v2.0 (approved, but had technical issues identified by code review)

---

## 🔄 Changes from v2.0 → v2.1

**Critical fixes based on Codex feedback:**

1. ✅ **Fixed component resolver** - Now bundler-safe using `import.meta.glob`
2. ✅ **Added Week 0 prerequisites** - NPM org setup, domain reservation
3. ✅ **Realistic schema migrations** - Template with TODOs, not auto-generated
4. ✅ **Added phase exit criteria** - Definition of Done for each phase
5. ✅ **Scoped workspace features** - Removed deploy-all (post-v1.0)
6. ✅ **Added sample data seeding** - Optional starter content for better DX
7. ✅ **Added framework rollback strategy** - What to do when bad release ships

---

## ✅ ARCHITECTURAL DECISIONS CONFIRMED

All critical decisions have been made and approved:

1. ✅ **Architecture Pattern:** NPM Package (not git fork)
2. ✅ **Component Overrides:** Hybrid (auto-resolution + slots)
3. ✅ **Sanity Schema Strategy:** Hybrid Extensible (versioned base + extensions)
4. ✅ **Repository Structure:** 3 separate repos (framework, template, docs)
5. ✅ **License:** MIT

---

## Executive Summary

### Vision
Transform the Strange Water podcast framework into a production-ready, maintainable NPM package system that enables rapid deployment of new podcast websites while preserving upgradeability and customization options.

### Core Architecture: NPM Package Pattern

**How it works:**
```
New Podcast Project/
├── package.json
│   ├── @podcast-framework/core: "^2.1.0"
│   ├── @podcast-framework/cli: "^2.1.0"
│   └── @podcast-framework/sanity-schema: "^2.0.0"
├── node_modules/
│   └── @podcast-framework/    # Framework code lives here
├── src/
│   ├── components/            # Custom/override components
│   └── pages/                 # Podcast-specific pages
├── sanity.config.ts           # Extended from base schemas
└── podcast.config.js          # Podcast configuration
```

### Key Outcomes
- Deploy new podcast in 4-6 hours (includes semi-manual service setup)
- Maintain upgrade path for all instances
- Support 100+ podcast instances
- Enable community contributions
- Preserve customization flexibility

---

## Table of Contents

0. [Week 0: Prerequisites](#week-0-prerequisites) ⭐ **NEW**
1. [Architecture](#1-architecture)
2. [Repository Structure](#2-repository-structure)
3. [Component Override System](#3-component-override-system) 🔧 **FIXED**
4. [Sanity Schema Strategy](#4-sanity-schema-strategy) 🔧 **UPDATED**
5. [Configuration Management](#5-configuration-management)
6. [Upgrade & Migration Strategy](#6-upgrade--migration-strategy) ⭐ **ADDED ROLLBACK**
7. [Implementation Roadmap](#7-implementation-roadmap) ⭐ **ADDED EXIT CRITERIA**
8. [Testing Strategy](#8-testing-strategy)
9. [Service Setup](#9-service-setup)
10. [Multi-Podcast Management](#10-multi-podcast-management) 🔧 **SCOPED**
11. [Documentation Strategy](#11-documentation-strategy)
12. [Success Metrics](#12-success-metrics)
13. [Risk Mitigation](#13-risk-mitigation)

---

## Week 0: Prerequisites

**⭐ NEW SECTION** - Must complete BEFORE starting Phase 1

### Critical Setup (Do Not Skip)

**1. NPM Organization Setup** 🔴 **BLOCKING**

```bash
# Check if @podcast-framework is available
npm info @podcast-framework

# If taken, choose alternative:
# - @podcast-fm
# - @podframework
# - @podcast-web
# - Other creative name

# Create npm organization
npm login
# Then create org at: https://www.npmjs.com/org/create

# Enable 2FA for all publishers (REQUIRED)
npm profile enable-2fa auth-and-writes
```

**Why this matters:**
- NPM scopes are first-come-first-served
- Discovering scope is taken in Week 3 forces painful package renaming
- All published packages must use consistent scope

**Deliverable:** Confirmed npm scope ownership

---

**2. GitHub Organization Setup**

```bash
# Create organization at: https://github.com/organizations/new
# Organization name: podcast-framework (or your chosen name)

# Configure:
- [ ] Base permissions: Read
- [ ] Allow forking: Yes
- [ ] Enable discussions: Yes
- [ ] Require 2FA: Yes

# Create teams:
- [ ] Maintainers (write access)
- [ ] Contributors (triage access)
```

**Deliverable:** GitHub org created with teams configured

---

**3. Domain Registration** (Optional for v1.0)

```bash
# Recommended domains:
- [ ] podcast-framework.com (landing page)
- [ ] docs.podcast-framework.com (documentation)

# Alternative: Use GitHub Pages initially
# - podcast-framework.github.io
# - Can add custom domain later
```

**Deliverable:** Domain purchased or decision to use GitHub Pages

---

**4. Service Accounts Setup**

```bash
# GitHub Actions secrets (for CI/CD)
- [ ] NPM_TOKEN (for publishing packages)
- [ ] TEMPLATE_REPO_PAT (for syncing template)

# npm publish token
npm token create --cidr=0.0.0.0/0

# GitHub PAT (Personal Access Token)
# Settings → Developer settings → Personal access tokens → Fine-grained tokens
# Permissions: Contents (read/write), Workflows (read/write)
```

**Deliverable:** All secrets configured in GitHub

---

**5. Development Environment**

```bash
# Required tools:
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Git configured
- [ ] Code editor (VS Code recommended)

# Verify:
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

**Deliverable:** Development environment ready

---

### Week 0 Checklist

- [ ] NPM scope secured (@podcast-framework or alternative)
- [ ] NPM organization created with 2FA enabled
- [ ] GitHub organization created
- [ ] Teams configured (Maintainers, Contributors)
- [ ] Domains registered (or GitHub Pages decided)
- [ ] GitHub Actions secrets configured
- [ ] NPM publish token created
- [ ] Development environment verified

**Estimated Time:** 2-3 hours

**Critical:** Do NOT start Phase 1 without completing NPM scope reservation.

---

## 3. Component Override System

### 3.1 Hybrid Approach

**Two mechanisms for maximum flexibility:**

1. **Auto-Resolution** (Simple case - global override)
2. **Slot-Based** (Advanced case - per-page customization)

### 3.2 Auto-Resolution (Primary Mechanism) 🔧 **FIXED**

**⚠️ v2.0 HAD CRITICAL BUG:** Used dynamic imports that don't work in production builds

**✅ v2.1 FIXED:** Uses `import.meta.glob` for bundler safety

**Framework provides component resolver:**

```typescript
// @podcast-framework/core/lib/component-resolver.ts

// Create manifest of all framework components at build time
const frameworkComponents = import.meta.glob<any>(
  '../components/**/*.astro',
  { eager: true }
);

// Create manifest of all podcast overrides (empty object if none exist)
const localComponents = import.meta.glob<any>(
  '/src/components/**/*.astro',
  { eager: true }
);

/**
 * Get component - checks local override first, fallback to framework
 * This is bundler-safe because import.meta.glob is statically analyzed
 */
export function getComponent(name: string) {
  // Normalize component name to path
  const localPath = `/src/components/${name}.astro`;
  const frameworkPath = `../components/${name}.astro`;

  // Check local override first
  if (localComponents[localPath]) {
    return localComponents[localPath].default || localComponents[localPath];
  }

  // Fallback to framework component
  if (frameworkComponents[frameworkPath]) {
    return frameworkComponents[frameworkPath].default || frameworkComponents[frameworkPath];
  }

  throw new Error(`Component "${name}" not found in framework or local overrides`);
}
```

**Framework layouts use resolver:**

```astro
---
// @podcast-framework/core/layouts/BaseLayout.astro
import { getComponent } from '@podcast-framework/core/lib/component-resolver';

const Header = getComponent('Header');
const Footer = getComponent('Footer');
---

<Header />
<slot />
<Footer />
```

**Podcast overrides by creating local file:**

```astro
<!-- Podcast's src/components/Header.astro -->
---
// Automatically used instead of framework Header!
// No configuration needed
---
<header class="my-custom-design">
  <!-- Custom implementation -->
</header>
```

**Why this fix matters:**
- ✅ Works in production builds (not just dev)
- ✅ Vite can statically analyze `import.meta.glob`
- ✅ No runtime module resolution failures
- ✅ TypeScript support maintained

### 3.3 Slot-Based Overrides (Advanced)

*[Same as v2.0 - no changes needed]*

---

## 4. Sanity Schema Strategy

### 4.3 Schema Migration Process 🔧 **UPDATED**

**⚠️ v2.0 HAD UNREALISTIC EXPECTATIONS:** Showed CLI auto-generating domain-specific code

**✅ v2.1 REALISTIC:** CLI generates TEMPLATE with TODOs requiring human review

**When framework releases breaking schema change (v2→v3):**

**Step 1-3:** *[Same as v2.0]*

**Step 4:** Review generated migration **TEMPLATE**

```typescript
// sanity/migrations/v2-to-v3.ts (auto-generated by CLI)
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function migrateEpisodes() {
  const episodes = await client.fetch('*[_type == "episode" && defined(description)]')

  console.log(`Found ${episodes.length} episodes to migrate`)

  for (const episode of episodes) {
    // ✅ Simple field rename - auto-generated
    const patch = client
      .patch(episode._id)
      .set({
        summary: episode.description,
      })
      .unset(['description'])

    // TODO: Convert duration to number
    // Your episodes have duration in format: "1:23:45"
    // Implement parseDuration() function below, then uncomment:
    //
    // patch.set({
    //   durationSeconds: parseDuration(episode.duration)
    // }).unset(['duration'])

    await patch.commit()
    console.log(`✓ Migrated: ${episode.title}`)
  }
}

// TODO: Implement this function based on YOUR duration format
// Examples:
// - "1:23:45" (HH:MM:SS) - most common
// - "83 minutes" (text format)
// - "1h 23m" (abbreviated)
//
// Sample implementation for HH:MM:SS format:
function parseDuration(duration: string): number {
  if (!duration) return 0;

  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }

  throw new Error(`Cannot parse duration format: ${duration}`);
}

migrateEpisodes()
  .then(() => console.log('Migration complete!'))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

**Why this change matters:**
- ✅ Realistic - CLI can't know podcast-specific data formats
- ✅ Safe - Forces human review before running migration
- ✅ Educational - Helps podcast owner understand what's changing
- ✅ Flexible - Easy to customize for edge cases

**Migration Process:**

1. CLI generates template with TODOs
2. Podcast owner reviews and implements TODOs
3. Test on development dataset
4. Review results in Sanity Studio
5. Run on production when confident

**Step 5-8:** *[Same as v2.0]*

---

## 6. Upgrade & Migration Strategy

### 6.5 Framework Rollback Strategy ⭐ **NEW SECTION**

**What happens when framework ships a bad release?**

**Scenario:** `@podcast-framework/core@2.1.0` published with critical bug

**Rollback Procedure:**

**1. Unpublish bad version** (only works within 72 hours)

```bash
# Requires npm owner privileges
npm unpublish @podcast-framework/core@2.1.0

# ⚠️ This only works if:
# - Less than 72 hours since publish
# - Package has <300 downloads per week
```

**2. Publish patch version with fix**

```bash
# Fix the bug
git checkout -b hotfix/critical-bug
# ... make fixes ...
git commit -m "Fix critical bug in component resolver"

# Publish patch immediately
npm version patch
npm publish

# Result: @podcast-framework/core@2.1.1
```

**3. Revert template repository**

```bash
cd podcast-template

# Undo auto-update commit from CI
git revert HEAD

# Push revert
git push origin main

# Template now references @podcast-framework/core@2.1.1
```

**4. Update documentation**

```markdown
<!-- docs.podcast-framework.com/versions/v2.1.0 -->
⚠️ **WARNING:** v2.1.0 contains a critical bug. Upgrade to v2.1.1 immediately.

Issue: Component resolver fails in production builds
Fix: Upgrade to @podcast-framework/core@2.1.1

Migration:
\`\`\`bash
npm install @podcast-framework/core@^2.1.1
npm run build
npm test
\`\`\`
```

**5. Notify users**

```markdown
# GitHub Discussions post
# Discord announcement (if exists)
# Twitter/X post

🚨 Security Notice: v2.1.0 Critical Bug

We discovered a critical bug in @podcast-framework/core@2.1.0 that causes
production builds to fail.

Action Required:
- If on v2.1.0: Upgrade to v2.1.1 immediately
- If on v2.0.x: No action needed (not affected)

\`\`\`bash
npm install @podcast-framework/core@^2.1.1
\`\`\`

Details: [link to issue]
Apologies for the inconvenience!
```

**6. Post-mortem**

```markdown
# Internal document: What went wrong?

1. Bug introduced: [describe]
2. Why CI didn't catch it: [analyze]
3. How to prevent: [action items]
   - [ ] Add E2E test for production builds
   - [ ] Require manual testing before publish
   - [ ] Beta channel for risky changes
```

**Why this matters:**
- ✅ Clear procedure when things go wrong
- ✅ Minimizes user impact
- ✅ Maintains trust through transparency
- ✅ Learn from mistakes via post-mortem

---

## 7. Implementation Roadmap

### Revised Timeline: 12-14 Weeks

*Includes Week 0 prerequisites*

---

### **Week 0: Prerequisites** ⭐ **NEW PHASE**

**Goal:** Secure NPM scope and set up organizational infrastructure

**Tasks:**
- [ ] Check @podcast-framework availability on npm
- [ ] Create npm organization
- [ ] Enable 2FA for all publishers
- [ ] Create GitHub organization
- [ ] Configure teams and permissions
- [ ] Register domains (or decide on GitHub Pages)
- [ ] Set up GitHub Actions secrets
- [ ] Create npm publish token
- [ ] Verify development environment

**Definition of Done:** ⭐ **NEW**
- ✅ NPM scope reserved and owned
- ✅ NPM organization configured with 2FA
- ✅ GitHub organization created with teams
- ✅ All CI/CD secrets configured
- ✅ Development environment verified
- ✅ No blockers to starting Phase 1

**Estimated Time:** 2-3 hours

---

### **Phase 1: Foundation (Weeks 1-2)**

**Goal:** Extract core framework and establish npm package structure

**Week 1: Core Extraction**
- [ ] Audit Strange Water codebase (identify framework vs custom)
- [ ] Create `podcast-framework` monorepo structure
- [ ] Extract components to `packages/core/src/components/`
- [ ] Extract layouts to `packages/core/src/layouts/`
- [ ] Extract utilities to `packages/core/src/lib/`
- [ ] Create TypeScript types/interfaces
- [ ] Configure package build (tsup/vite)

**Week 2: Component Resolver & Testing**
- [ ] Implement component resolver with `import.meta.glob` 🔧 **UPDATED**
- [ ] Update all layouts to use resolver
- [ ] Write unit tests for core components (>80% coverage)
- [ ] Create example podcast (test framework usage)
- [ ] Configure Changesets for versioning
- [ ] Add MIT license to all packages

**Definition of Done:** ⭐ **NEW**
- ✅ Test coverage >80%
- ✅ All components render in example podcast (dev AND production builds)
- ✅ TypeScript builds with zero errors
- ✅ Component resolver works in both dev and production
- ✅ Documentation drafted for 5+ core components
- ✅ Code review complete
- ✅ Packages build successfully (not yet published)

**Deliverables:**
- `@podcast-framework/core` package (not yet published)
- Component resolver working in example podcast
- Test suite passing

---

### **Phase 2: Schema System (Week 3)**

**Goal:** Create extensible Sanity schema package

- [ ] Create `packages/sanity-schema/` package
- [ ] Extract base schemas (episode, guest, host, theme, contribution)
- [ ] Implement extension helpers (`extendEpisodeSchema()`)
- [ ] Create schema version numbering system
- [ ] Write schema documentation
- [ ] Test schema extension in example podcast

**Definition of Done:** ⭐ **NEW**
- ✅ Schema extension system works
- ✅ Example podcast extends base schema successfully
- ✅ TypeScript types generated for schemas
- ✅ Documentation complete with examples
- ✅ Test coverage >85%
- ✅ Migration template generator scaffolded

**Deliverables:**
- `@podcast-framework/sanity-schema` package
- Extension system working
- Documentation for custom fields

---

### **Phase 3: CLI Tool (Weeks 4-7)** ⏱️

**Goal:** Production-quality CLI for scaffolding and management

**Week 4: CLI Foundation**
- [ ] Set up CLI package (`packages/cli/`)
- [ ] Choose framework (Commander.js recommended)
- [ ] Implement `create` command (scaffold new podcast)
- [ ] Implement template file system
- [ ] Add interactive prompts (Inquirer.js)
- [ ] Create progress indicators

**Week 5: Update & Migration Commands**
- [ ] Implement `check-updates` command
- [ ] Implement `update` command (with backup)
- [ ] Implement `rollback` command
- [ ] Implement `migrate-schema` command (generate migration TEMPLATES) 🔧 **UPDATED**
- [ ] Add dry-run mode for migrations

**Week 6: Helper Commands**
- [ ] Implement `list-components` command
- [ ] Implement `override <component>` command (scaffold override)
- [ ] Implement `backup-sanity` command
- [ ] Implement `validate` command (check config/schema)
- [ ] Add `--help` and `--version` flags

**Week 7: CLI Testing & Polish**
- [ ] Write CLI integration tests
- [ ] Test on Windows/Mac/Linux
- [ ] Add error handling and recovery
- [ ] Create CLI documentation
- [ ] Record video tutorials

**Definition of Done:** ⭐ **NEW**
- ✅ All commands work on Windows/Mac/Linux
- ✅ Test coverage >80%
- ✅ Error messages are helpful and actionable
- ✅ Help documentation complete
- ✅ Video tutorial recorded
- ✅ Beta tested with 2-3 users
- ✅ All edge cases handled gracefully

**Deliverables:**
- `@podcast-framework/cli` package
- Full command suite
- >80% test coverage

---

### **Phase 4: Template Repository (Week 8)**

**Goal:** Create GitHub template for new podcasts

- [ ] Create `podcast-template` repository
- [ ] Scaffold minimal structure (src/, public/, sanity/)
- [ ] Configure Astro with framework packages
- [ ] Set up example podcast.config.js
- [ ] Create .env.template
- [ ] Add GitHub Actions (deploy to Cloudflare)
- [ ] Add setup script (npx @podcast-framework/cli setup)
- [ ] Enable "Use this template" feature
- [ ] Write comprehensive README
- [ ] Add optional sample data import 🔧 **NEW**

**Sample Data Package:** ⭐ **NEW**

```bash
# During CLI setup:
? Import sample data? (Yes/No)
  ↳ Yes: Imports 3 sample episodes, 2 sample guests, theme config
  ↳ No: Start with empty dataset

# Sample data includes:
- 3 fictional episodes with descriptions
- 2 fictional guests with bios and photos
- Default theme configuration
- Example cover images
```

**Definition of Done:** ⭐ **NEW**
- ✅ "Use this template" button works
- ✅ Template deploys to Cloudflare Pages successfully
- ✅ Sample data import works
- ✅ README is clear and comprehensive
- ✅ All environment variables documented
- ✅ Tested on fresh account (no prior setup)

**Deliverables:**
- `podcast-template` repository (public)
- One-click template creation
- Automated deployment workflow
- Optional sample data package

---

### **Phase 5-8:** *[Same as v2.0, but with Definition of Done added to each phase]*

---

## 10. Multi-Podcast Management

### 10.1 CLI Workspace Mode 🔧 **SCOPED**

**⚠️ v2.0 WAS TOO AMBITIOUS:** Included deploy-all which requires credential management

**✅ v2.1 REALISTIC:** Status and update only for v1.0

**For managing 5+ podcasts:**

```bash
# Initialize workspace
npx @podcast-framework/cli workspace init

# Register podcasts
npx @podcast-framework/cli workspace add ./podcast-1
npx @podcast-framework/cli workspace add ./podcast-2
npx @podcast-framework/cli workspace add ./podcast-3

# View status ✅ v1.0
npx @podcast-framework/cli workspace status

# Output:
# Podcast Workspace Overview
#
# podcast-1      v2.1.0    ✅ Up to date    Last deploy: 2 days ago
# podcast-2      v2.0.3    ⚠️  Update: v2.1.0   Last deploy: 1 week ago
# podcast-3      v1.9.0    🔴 Update: v2.1.0   Last deploy: 3 weeks ago

# Update all podcasts ✅ v1.0
npx @podcast-framework/cli workspace update-all

# Deploy all ❌ POST-v1.0 (requires credential management)
# For v1.0, deploy manually:
cd podcast-1 && npm run deploy
cd podcast-2 && npm run deploy
```

**Why deploy-all is scoped to post-v1.0:**
- Requires storing/managing Cloudflare/Vercel/Netlify credentials
- Security complexity (credential rotation, encryption)
- Significant engineering effort (multi-provider abstraction)
- Not essential for MVP (manual deploy is acceptable)

**v1.0 Workspace Features:**
- ✅ Status overview (all podcasts at a glance)
- ✅ Update-all (update framework packages)
- ✅ Check outdated versions
- ✅ View deployment dates (from git history)

**Post-v1.0 Enhancements:**
- Deploy-all (with credential management)
- Cost monitoring dashboard
- Usage alerts
- Bulk schema migrations

---

## 15. Next Steps

### Immediate Actions (Week 0)

**🔴 CRITICAL - Do BEFORE starting:**

1. [ ] **Secure NPM scope**
   - Check @podcast-framework availability
   - Create npm organization
   - Enable 2FA

2. [ ] **Create GitHub organization**
   - Organization: podcast-framework
   - Configure teams

3. [ ] **Register domains** (optional)
   - podcast-framework.com
   - Or use GitHub Pages

4. [ ] **Set up CI/CD secrets**
   - NPM_TOKEN
   - TEMPLATE_REPO_PAT

5. [ ] **Verify environment**
   - Node 18+
   - npm 9+

**Then proceed to Week 1:**

6. [ ] **Initialize repositories:**
   - podcast-framework (main)
   - podcast-template
   - podcast-framework-docs

7. [ ] **Begin Phase 1** - Core extraction

8. [ ] **Set up project management** - GitHub Projects board

---

## 16. Conclusion

This v2.1 plan provides a **production-ready, technically sound roadmap** for transforming Strange Water into a reusable podcast framework.

**Key improvements over v2.0:**
- ✅ **Fixed component resolver** - Bundler-safe with import.meta.glob
- ✅ **Added Week 0 prerequisites** - NPM scope secured early
- ✅ **Realistic schema migrations** - Templates with TODOs, not auto-generated
- ✅ **Added phase exit criteria** - Clear Definition of Done
- ✅ **Scoped workspace features** - Removed deploy-all from v1.0
- ✅ **Added sample data seeding** - Better initial DX
- ✅ **Added framework rollback** - Clear procedure for bad releases

**Confidence level:** VERY HIGH - All known technical issues addressed.

**Next milestone:** Complete Week 0 prerequisites, then Phase 1 (Weeks 1-2)

---

**Document Status:** FINAL - PRODUCTION READY
**Version:** 2.1.0
**Owner:** Rex Kirshner
**Last Updated:** 2025-10-14
**Reviewed By:** Codex AI (technical review)

---

*End of Document*

## Appendix: Summary of All Codex Feedback

✅ **INCORPORATED:**
1. Component resolver bundler safety (Section 3.2)
2. Schema migration scope (Section 4.3)
3. Workspace deploy automation scope (Section 10.1)
4. Phase gates and exit criteria (All phases in Section 7)
5. NPM org setup prerequisite (Week 0)
6. Starter content seeding (Phase 4)
7. Framework rollback strategy (Section 6.5)

**TOTAL CHANGES:** 7 major improvements across all critical areas

**RESULT:** Plan is now technically sound and ready for implementation