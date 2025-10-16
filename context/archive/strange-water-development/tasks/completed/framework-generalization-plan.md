# Framework Generalization & Network Architecture Plan

> **Phase 2 - Complete Architectural Strategy**
> **Goal:** Transform Strange Water implementation into reusable podcast network framework
> **Created:** 2025-10-06
> **Updated:** 2025-10-06
> **Status:** Architecture Approved + Sequencing Revised

**🎯 STRATEGIC DECISION (2025-10-06):** Build complete feature set FIRST (guests page + CMS styling), THEN templatize. Template v2.0.0 will be feature-complete, enabling "easy mode" config-only deployments rather than prematurely testing upgrade mechanisms before we have a second podcast.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Vision: The Podcast Network](#strategic-vision-the-podcast-network)
3. [Architectural Decision Framework](#architectural-decision-framework)
4. [**APPROVED: Template Repository with Aggressive Versioning**](#approved-template-repository-with-aggressive-versioning)
5. [Option Analysis: Four Paths Forward](#option-analysis-four-paths-forward)
6. [Recommended Architecture](#recommended-architecture)
7. [Versioning Strategy & Migration Paths](#versioning-strategy--migration-paths)
8. [**External Review & Operational Enhancements**](#external-review--operational-enhancements)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Mothership Website Strategy](#mothership-website-strategy)
11. [Content & Backend Management](#content--backend-management)
12. [Deployment & Operations](#deployment--operations)
13. [Risk Analysis & Mitigation](#risk-analysis--mitigation)

---

## Executive Summary

### Current State
- ✅ Strange Water podcast website fully functional
- ✅ 69 episodes, 72 guests, production-ready
- ❌ Hardcoded podcast-specific values throughout codebase
- ❌ Not reusable for new podcasts without code changes

### Vision
Build a **podcast network platform** that enables:
1. **Individual podcast websites** - Each with unique branding, custom domain, independent ownership
2. **Centralized management** - Optional unified backend for content operations
3. **Mothership website** - Company/network site showcasing all podcasts
4. **Rapid deployment** - New podcast from zero to production in <4 hours

### Key Questions This Plan Addresses
1. **Repository Strategy**: One repo or many? Monorepo or separate?
2. **Sanity Architecture**: One project or multiple? Shared or isolated?
3. **Deployment Model**: Independent sites or multi-tenant?
4. **Code Sharing**: Template duplication, NPM package, or monorepo packages?
5. **Mothership Integration**: How does the network site aggregate data?
6. **Ownership Model**: Can podcasts be handed off to independent owners?

---

## Strategic Vision: The Podcast Network

### Business Model Scenarios

#### Scenario A: Portfolio Company
**Description:** All podcasts owned by one entity
- Strange Water (concluded)
- Podcast #2 (active)
- Podcast #3 (active)
- Future shows...

**Needs:**
- Centralized brand identity
- Unified operations/team
- Cross-promotion between shows
- Shared infrastructure costs

**Architecture Implications:**
- Can use shared Sanity organization
- Mothership is primary brand
- Individual podcasts are "products"
- Justify monorepo or multi-tenant architecture

---

#### Scenario B: Franchise/Agency Model
**Description:** Build sites for independent podcast owners
- You build framework
- Client podcasts pay for setup/customization
- They own their site after launch
- You may provide ongoing support

**Needs:**
- Easy handoff to clients
- Independence (no central dependencies)
- Professional deployment process
- Optionally: ongoing support contract

**Architecture Implications:**
- Separate repos per podcast
- Separate Sanity projects
- Template-based approach
- Clear ownership boundaries
- Mothership showcases portfolio (optional)

---

#### Scenario C: Hybrid Network
**Description:** Mix of owned and partnered podcasts
- Core shows owned by you
- Partner shows co-produced or licensed
- Some fully independent, some centrally managed

**Needs:**
- Flexible ownership models
- Shared infrastructure where beneficial
- Independence where required
- Optional centralized management

**Architecture Implications:**
- Support both models (owned + independent)
- Mothership aggregates all shows
- Opt-in centralization
- Modular architecture

---

### Current Best Guess
Based on PRD and project context, this appears to be **Scenario A → Scenario C trajectory**:
- Start with portfolio (you own all podcasts)
- Evolve to network (partners join)
- Maintain flexibility for independence

**Recommendation:** Design for **Scenario C (Hybrid)** from the start. Enables all models without re-architecture.

---

## Architectural Decision Framework

### Guiding Principles

1. **Start Simple, Scale Intentionally**
   - Don't over-engineer for imagined scale
   - Deploy podcast #2 with simplest approach
   - Evolve architecture based on real needs

2. **Optimize for Independence**
   - Each podcast can be fully independent
   - No central dependencies that break on removal
   - Handoff-friendly architecture

3. **Centralization is Opt-In**
   - Shared infrastructure is a choice, not a requirement
   - Podcasts can choose: DIY or managed service
   - Graceful degradation if mothership goes offline

4. **Learn Before Committing**
   - Deploy podcast #2 before finalizing architecture
   - Validate assumptions with real use case
   - Defer complex decisions until after 2-3 podcasts

5. **Preserve Optionality**
   - Don't lock into patterns that prevent future pivots
   - Keep migration paths open
   - Document trade-offs for future decisions

---

## APPROVED: Template Repository with Aggressive Versioning

**Decision Date:** 2025-10-06
**Status:** ✅ Approved for Phase 2a implementation

### Core Approach

**Architecture:** Option 1 (Template Repository with clone-per-podcast)

**Key Enhancement:** Aggressive semantic versioning with clear upgrade paths to enable future migration to more sophisticated architectures (Monorepo, NPM Package, or Multi-tenant).

---

### Why This Approach

**Primary Reasons:**
1. **Simplest to start** - No infrastructure overhead, validates assumptions
2. **Maximum independence** - Each podcast fully autonomous, easy handoff
3. **Flexibility** - Podcasts can diverge if needed
4. **Migration-friendly** - Can evolve to any other option later

**Critical Addition:** Aggressive versioning strategy ensures we can:
- ✅ Track what's been updated across all podcasts
- ✅ Provide clear upgrade paths
- ✅ Migrate to more sophisticated architecture when needed
- ✅ Maintain backward compatibility

---

### Versioning Strategy

#### Semantic Versioning (SemVer)

**Format:** `MAJOR.MINOR.PATCH` (e.g., `v2.1.3`)

**Rules:**
- **MAJOR** (v2.0.0 → v3.0.0): Breaking changes requiring manual migration
  - Example: Sanity schema changes, folder restructure, API changes
- **MINOR** (v2.0.0 → v2.1.0): New features (backward compatible)
  - Example: New guests page, search feature, analytics integration
- **PATCH** (v2.0.0 → v2.0.1): Bug fixes, performance improvements
  - Example: Fix mobile layout, improve image loading

#### Version Tracking File

**Create:** `TEMPLATE_VERSION.json` in repo root

```json
{
  "version": "2.1.0",
  "templateName": "podcast-framework",
  "lastUpdated": "2025-10-06",
  "changelog": "Added guests page feature",
  "minimumCompatibleVersion": "2.0.0",
  "breakingChangesFrom": ["1.x.x"],
  "migrationGuides": {
    "1.x.x-to-2.0.0": "docs/migrations/v1-to-v2.md",
    "2.0.x-to-2.1.0": "docs/migrations/v2.0-to-v2.1.md"
  }
}
```

**Purpose:**
- Each podcast knows its template version
- Easy to check: "Am I on v2.0.0 or v2.1.0?"
- Upgrade scripts can validate compatibility
- Future migration tools can read this

---

### GitHub Release Strategy

#### Every Change Gets a Release

**For PATCH updates (bug fixes):**
```markdown
# v2.0.1 - Mobile Layout Fix

## Bug Fixes
- Fixed guest photo display on mobile (<768px)
- Improved episode card spacing on tablets

## Impact
- No breaking changes
- Safe to update immediately

## How to Update
```bash
git remote add template https://github.com/you/podcast-template.git
git fetch template
git cherry-pick v2.0.1
```

## Files Changed
- `src/pages/guests/index.astro`
- `src/components/GuestCard.astro`

## Testing
✅ Test guest page on mobile
✅ Verify responsive breakpoints
```

**For MINOR updates (new features):**
```markdown
# v2.1.0 - Guests Page Added

## New Features
- 🎉 `/guests` page showing all podcast guests
- Guest cards with photos, bios, social links
- Alphabetical sorting with search (optional)

## Impact
- **Backward compatible** - Optional feature
- **Breaking changes:** None
- **New dependencies:** None

## How to Update

### Option A: Automatic (recommended)
```bash
git remote add template https://github.com/you/podcast-template.git
git fetch template
git cherry-pick v2.1.0
```

### Option B: Manual
1. Copy `src/pages/guests/index.astro` from template
2. Add Guests link to `src/components/Header.astro`:
   ```astro
   <a href="/guests">Guests</a>
   ```
3. Query already exists in `src/lib/sanity.ts` (no changes needed)

## Optional
To remove guests page (if not wanted):
- Delete `src/pages/guests/index.astro`
- Remove "Guests" link from Header

## Files Changed
- `src/pages/guests/index.astro` (NEW)
- `src/components/Header.astro` (add link)
- `TEMPLATE_VERSION.json` (version bump)

## Testing Checklist
- [ ] Visit `/guests` page
- [ ] Verify guest photos load
- [ ] Check responsive design (mobile/tablet/desktop)
- [ ] Test alphabetical sorting
- [ ] Verify guest links work (Twitter, website, etc.)

## Migration Time
⏱️ 5-10 minutes (cherry-pick + test)

## Rollback
If issues occur:
```bash
git revert v2.1.0
```
```

**For MAJOR updates (breaking changes):**
```markdown
# v3.0.0 - Sanity Schema V2 Migration

## ⚠️ BREAKING CHANGES

This is a **MAJOR** version update with breaking changes.
**Do not update** without reading migration guide first.

## What Changed
- Sanity schema restructure (Episode → Show relationship)
- Renamed fields: `episodeNumber` → `number`
- New required field: `season`

## Migration Required
**Estimated time:** 30-60 minutes

**Migration guide:** [docs/migrations/v2-to-v3.md](docs/migrations/v2-to-v3.md)

## Who Should Update?
- ✅ New podcasts (deploy with v3.0.0)
- ⚠️ Existing podcasts (only if you need new features)
- ❌ Podcasts in active production (wait for stable period)

## Pre-Update Checklist
- [ ] Backup Sanity dataset
- [ ] Read full migration guide
- [ ] Test on staging environment first
- [ ] Schedule maintenance window (30-60 min)

## How to Update
**Do not cherry-pick this update blindly.**

Follow migration guide: [docs/migrations/v2-to-v3.md](docs/migrations/v2-to-v3.md)

## Support
If you encounter issues, open GitHub issue or contact support.
```

---

### Podcast Version Tracking

Each podcast repo tracks its template version:

**Location:** `PODCAST_INFO.json` (root of podcast repo)

```json
{
  "podcastName": "Strange Water",
  "templateVersion": "2.1.0",
  "customizations": [
    "src/pages/about.astro (custom content)",
    "src/styles/custom.css (brand colors)"
  ],
  "lastTemplateUpdate": "2025-10-06",
  "deployedVersion": "2.1.0",
  "pendingUpdates": [],
  "notes": "On latest template version"
}
```

**Benefits:**
- Know which version each podcast is on
- Track customizations (avoid overwriting)
- Audit: "Which podcasts are on old versions?"
- Automated tools can read this

---

### Upgrade Automation Scripts

#### Check for Updates Script

**Create:** `scripts/check-template-updates.js`

```javascript
/**
 * Check if podcast is on latest template version
 * Usage: npm run check:updates
 */

import fs from 'fs';
import { execSync } from 'child_process';

const podcastInfo = JSON.parse(fs.readFileSync('PODCAST_INFO.json'));
const currentVersion = podcastInfo.templateVersion;

// Fetch latest template version
execSync('git fetch template', { stdio: 'inherit' });
const latestTag = execSync('git describe --tags template/main --abbrev=0')
  .toString()
  .trim();

console.log(`\n📊 Template Version Check\n`);
console.log(`Current version: ${currentVersion}`);
console.log(`Latest version:  ${latestTag}\n`);

if (currentVersion === latestTag) {
  console.log('✅ You are on the latest template version!\n');
} else {
  console.log(`⚠️  Update available: ${currentVersion} → ${latestTag}\n`);
  console.log(`View changes:`);
  console.log(`  https://github.com/you/podcast-template/compare/${currentVersion}...${latestTag}\n`);
  console.log(`To update:`);
  console.log(`  git cherry-pick ${latestTag}`);
  console.log(`  npm run update:version ${latestTag}\n`);
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "check:updates": "node scripts/check-template-updates.js"
  }
}
```

---

#### Update Version Script

**Create:** `scripts/update-version.js`

```javascript
/**
 * Update podcast's template version
 * Usage: npm run update:version v2.1.0
 */

import fs from 'fs';

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('❌ Error: Please provide a version');
  console.error('Usage: npm run update:version v2.1.0');
  process.exit(1);
}

const podcastInfo = JSON.parse(fs.readFileSync('PODCAST_INFO.json'));
const oldVersion = podcastInfo.templateVersion;

podcastInfo.templateVersion = newVersion;
podcastInfo.lastTemplateUpdate = new Date().toISOString().split('T')[0];
podcastInfo.deployedVersion = newVersion;

fs.writeFileSync('PODCAST_INFO.json', JSON.stringify(podcastInfo, null, 2));

console.log(`\n✅ Updated template version`);
console.log(`   ${oldVersion} → ${newVersion}\n`);
console.log(`Next steps:`);
console.log(`1. Test locally (npm run dev)`);
console.log(`2. Run build (npm run build)`);
console.log(`3. Deploy to staging`);
console.log(`4. Test on staging`);
console.log(`5. Deploy to production\n`);
```

**Add to package.json:**
```json
{
  "scripts": {
    "update:version": "node scripts/update-version.js"
  }
}
```

---

### Migration Path Documentation

#### Future Evolution Strategy

**When to migrate to different architecture:**

**Monorepo (Option 2):**
- **Trigger:** 5+ owned podcasts, frequent updates (>1/month), standardized features
- **Migration:** Create monorepo, move podcasts to `apps/`, extract shared code to `packages/`
- **Effort:** 1-2 weeks (one-time)
- **Enabled by versioning:** Know which version each podcast is on, migrate in phases

**NPM Package (Option 3):**
- **Trigger:** 10+ podcasts, distributing publicly, stable framework
- **Migration:** Extract framework to package, podcasts install via npm
- **Effort:** 2-3 weeks (one-time)
- **Enabled by versioning:** Package versions map to template versions, gradual rollout

**Multi-Tenant (Option 4):**
- **Trigger:** 20+ podcasts, all identical, no customization
- **Migration:** Create single deployment, migrate podcasts to datasets/documents
- **Effort:** 3-4 weeks (one-time + per-podcast migration)
- **Enabled by versioning:** Migrate podcasts by version cohort

---

### Architecture-Agnostic Patterns (Future-Proof)

**Design Decisions to Enable Future Migration:**

#### 1. File Structure (Already Follows Best Practices)
```
src/
├── components/       ← Reusable UI (can extract to package)
├── layouts/          ← Page templates (can extract to package)
├── lib/              ← Utilities (can extract to package)
│   ├── sanity.ts     ← Data layer (stays per-podcast)
│   └── utils.ts      ← Helpers (can extract to package)
├── pages/            ← Routes (stays per-podcast)
└── config/           ← Podcast-specific (stays per-podcast)
```

**Migration Impact:**
- Monorepo: Move `components/`, `layouts/`, `lib/utils.ts` to `packages/ui`
- NPM Package: Same files become `@podcast-network/framework`
- Multi-Tenant: Keep structure, just change `sanity.ts` queries

---

#### 2. Sanity Queries (Already Isolated)

**Current:** All Sanity logic in `src/lib/sanity.ts`

**Why this helps future migration:**
- Monorepo: Each app has own sanity client (separate projects)
- NPM Package: Each podcast has own sanity client (separate projects)
- Multi-Tenant: Replace with filtered queries (`podcast->slug == "strange-water"`)

**No refactor needed** for any migration path.

---

#### 3. Environment Variables (Already Standardized)

**Current:** `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`

**Why this helps future migration:**
- Monorepo: Each app has own `.env` (different project IDs)
- NPM Package: Same pattern
- Multi-Tenant: Change to single project ID, filter by dataset/podcast

**Minimal changes** for any migration path.

---

#### 4. Components Are Generic (No Hardcoding)

**Current:** Components use props, no hardcoded "Strange Water"

**Why this helps future migration:**
- Monorepo: Extract to `packages/ui` with zero changes
- NPM Package: Publish as-is
- Multi-Tenant: Use as-is

**Zero refactor** for any migration path.

---

### Version Comparison Matrix

Track podcast versions in centralized doc:

**Create:** `docs/PODCAST_VERSIONS.md` (in template repo)

```markdown
# Podcast Framework Versions

**Template Latest:** v2.1.0 (2025-10-06)

## Deployed Podcasts

| Podcast | Template Version | Last Update | Pending Updates | Notes |
|---------|------------------|-------------|-----------------|-------|
| Strange Water | v2.1.0 | 2025-10-06 | None | ✅ Latest |
| Podcast #2 | v2.0.0 | 2025-09-15 | v2.1.0 | Guests page available |
| Podcast #3 | v2.1.0 | 2025-10-05 | None | ✅ Latest |

## Update Priority

### Critical (Security/Bugs)
- None currently

### Recommended (New Features)
- v2.1.0: Guests page (Podcast #2 should update)

### Optional (Nice-to-Have)
- None currently

## Version Distribution
- v2.1.0: 2 podcasts (66%)
- v2.0.0: 1 podcast (33%)
- v1.x.x: 0 podcasts (0%)
```

---

### Changelog Strategy

**Create:** `CHANGELOG.md` in template repo

```markdown
# Changelog

All notable changes to the Podcast Framework Template will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Newsletter signup form component (coming in v2.2.0)

## [2.1.0] - 2025-10-06

### Added
- Guests page (`/guests`) showing all podcast guests
- Guest card component with photos, bios, social links
- Alphabetical sorting on guests page
- Header navigation link to guests page

### Changed
- Updated `TEMPLATE_VERSION.json` to track version

### Fixed
- None

### Migration
- No breaking changes
- Optional feature (can remove if not wanted)
- See [v2.0-to-v2.1 migration guide](docs/migrations/v2.0-to-v2.1.md)

---

## [2.0.0] - 2025-10-05

### Added
- Initial template release (post-Strange Water Phase 1)
- Framework generalization complete
- Environment variable configuration
- Deployment guide
- Sanity CMS integration

### Changed
- Moved from hardcoded values to Sanity CMS
- Removed `SITE_CONFIG` (use Sanity instead)

### Migration
- See [v1-to-v2 migration guide](docs/migrations/v1-to-v2.md)

---

## [1.0.0] - 2025-10-01

### Added
- Initial Strange Water implementation
- Basic episode, guest, host schemas
- Homepage, about, episodes pages

### Notes
- Pre-generalization version
- Hardcoded for Strange Water
- Not recommended for new podcasts
```

---

### CI/CD Integration (Future)

**When we have 5+ podcasts, automate version checking:**

**GitHub Actions:** `.github/workflows/version-check.yml`

```yaml
name: Template Version Check

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am
  workflow_dispatch:      # Manual trigger

jobs:
  check-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Check for template updates
        run: npm run check:updates

      - name: Create issue if outdated
        if: steps.check.outputs.outdated == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '⚠️ Template update available',
              body: 'New template version available. Run `npm run check:updates` for details.'
            })
```

---

### Summary: Aggressive Versioning Benefits

**Immediate Benefits (Phase 2a):**
- ✅ Clear tracking of what each podcast has
- ✅ Easy to answer: "Which podcasts need updates?"
- ✅ Professional release process (GitHub Releases)
- ✅ Clear upgrade paths (cherry-pick guides)

**Future Benefits (Phase 3):**
- ✅ Migrate to Monorepo: Know which version each podcast is on, migrate in phases
- ✅ Migrate to NPM Package: Template versions map directly to package versions
- ✅ Migrate to Multi-Tenant: Migrate podcasts by version cohort
- ✅ Backward compatibility: Can support multiple template versions simultaneously

**Cost:**
- ⏱️ 5 minutes per release (write changelog, tag version)
- ⏱️ 10 minutes to set up versioning infrastructure (one-time)

**ROI:**
- Saves hours of confusion ("Which version am I on?")
- Enables smooth migration to any future architecture
- Professional, maintainable project

---

## Option Analysis: Four Paths Forward

### Option 1: Template Repository (Clone-Per-Podcast)

**Architecture:**
```
Repositories:
├── podcast-template (this repo)
├── strange-water (clone, independent)
├── podcast-2 (clone, independent)
└── podcast-3 (clone, independent)

Sanity:
├── Project: strange-water-abc123
├── Project: podcast-2-def456
└── Project: podcast-3-ghi789

Deployments:
├── strangewater.xyz (Netlify)
├── podcast2.com (Netlify)
└── podcast3.io (Netlify)

Mothership:
└── podcasts.network (separate Astro site, aggregates via APIs)
```

**Workflow:**
1. Clone template repo
2. Find/replace placeholder values
3. Create new Sanity project
4. Deploy to Netlify
5. Customize about page
6. Import episode data
7. Hand off to podcast owner (optional)

**Pros:**
- ✅ Maximum independence (zero shared dependencies)
- ✅ Simple mental model (each podcast is standalone)
- ✅ Easy to hand off ownership
- ✅ No coupling between podcasts
- ✅ Fastest to implement (no complex setup)
- ✅ Podcast can customize freely without affecting others

**Cons:**
- ❌ Code duplication (components copy-pasted)
- ❌ Hard to propagate framework updates
- ❌ No shared component library
- ❌ Each podcast needs separate maintenance

**Best For:**
- Franchise/agency model
- Independent podcast owners
- Small networks (2-5 podcasts)
- High customization needs

**Update Strategy:**
- Podcast #2 deployment reveals pain points
- Template repo updated with learnings
- Existing podcasts can cherry-pick updates via git
- Or: provide migration guide for breaking changes

---

### Option 2: Monorepo (Shared Workspace)

**Architecture:**
```
podcast-network/ (monorepo)
├── apps/
│   ├── strange-water/        (Astro app)
│   ├── podcast-2/             (Astro app)
│   ├── mothership/            (Astro app)
│   └── admin-dashboard/       (optional central admin)
├── packages/
│   ├── ui/                    (shared components)
│   ├── sanity-schemas/        (shared Sanity schemas)
│   ├── utils/                 (shared utilities)
│   └── config/                (shared config types)
├── package.json               (workspace root)
├── turbo.json                 (Turborepo config)
└── pnpm-workspace.yaml

Sanity:
├── Organization: podcast-network
│   ├── Project: strange-water
│   ├── Project: podcast-2
│   └── Project: podcast-3

Deployments:
├── strangewater.xyz           (Netlify, app: apps/strange-water)
├── podcast2.com               (Netlify, app: apps/podcast-2)
└── network.com                (Netlify, app: apps/mothership)
```

**Workflow:**
1. Create new app: `turbo gen workspace`
2. Import shared packages from `packages/`
3. Create Sanity project (or dataset in shared project)
4. Configure environment variables
5. Customize about page
6. Import episode data
7. Deploy (separate Netlify site per app)

**Pros:**
- ✅ Code reuse via shared packages
- ✅ Easy to update all podcasts (update packages, all apps benefit)
- ✅ Single source of truth for framework code
- ✅ TypeScript types shared across apps
- ✅ Atomic updates (one PR updates all)
- ✅ Better for actively developed network

**Cons:**
- ❌ More complex setup (workspace, Turborepo)
- ❌ All podcasts in one repo (harder to hand off)
- ❌ Requires coordination for major updates
- ❌ Breaking changes affect all podcasts
- ❌ Larger repo (all podcasts together)

**Best For:**
- Portfolio company model
- Centrally managed network
- Active development across all podcasts
- 5+ podcasts with shared design system

**Handoff Strategy:**
- Extract individual app to separate repo
- Copy shared packages into podcast repo (vendor)
- Deploy independently
- Maintain fork or accept no further updates

---

### Option 3: NPM Package Framework

**Architecture:**
```
Repositories:
├── @podcast-network/framework (NPM package)
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   ├── sanity/schemas/
│   └── package.json
├── strange-water (thin config, uses @podcast-network/framework)
├── podcast-2 (thin config, uses @podcast-network/framework)
└── mothership (separate app)

Each Podcast Repo:
├── src/
│   ├── config/
│   │   └── podcast.json       (podcast-specific config)
│   └── pages/
│       └── about.astro        (only customized pages)
├── public/                     (assets)
├── package.json
│   └── dependencies:
│       └── "@podcast-network/framework": "^1.0.0"
└── astro.config.mjs

Sanity:
├── Project: strange-water (independent)
├── Project: podcast-2 (independent)
```

**Workflow:**
1. Clone starter template (minimal)
2. `npm install @podcast-network/framework`
3. Configure `config/podcast.json`
4. Create Sanity project
5. Import episode data
6. Deploy

**Updates:**
- Run `npm update @podcast-network/framework`
- Get latest components, layouts, utilities
- Opt into breaking changes via major versions

**Pros:**
- ✅ True framework pattern (professional)
- ✅ Easy updates via npm
- ✅ Minimal per-podcast code
- ✅ Versioning (podcasts can stay on older framework)
- ✅ Can publish publicly or privately
- ✅ Independence + shared updates

**Cons:**
- ❌ Most complex to build initially
- ❌ Requires npm publishing setup
- ❌ Harder to customize deeply (framework is packaged)
- ❌ Need to maintain semantic versioning
- ❌ Breaking changes affect all podcasts (but opt-in)

**Best For:**
- Professional framework distribution
- 10+ podcasts
- Public/commercial framework product
- Stable, well-tested design system

**Migration Path:**
- Start with Option 1 or 2
- After 5+ podcasts, extract to NPM package
- Migrate existing podcasts gradually

---

### Option 4: Multi-Tenant (Single Deployment, Multiple Domains)

**Architecture:**
```
Repository:
└── podcast-platform (one Astro app)

Sanity:
├── Project: podcast-network
│   ├── Dataset: strange-water
│   ├── Dataset: podcast-2
│   └── Dataset: podcast-3

OR:

├── Project: podcast-network
│   └── Documents:
│       ├── Podcast: strange-water
│       ├── Podcast: podcast-2
│       └── Podcast: podcast-3

Deployment:
└── podcasts.network (one Netlify site)
    ├── Domain: strangewater.xyz → routes to SW content
    ├── Domain: podcast2.com → routes to P2 content
    └── Domain: network.com → mothership routes

Routing Strategy:
src/middleware.ts:
- Detect hostname (strangewater.xyz vs podcast2.com)
- Load podcast config from Sanity by hostname
- Set context.locals.podcast
- Pages render using context.locals.podcast
```

**Example Code:**
```typescript
// src/middleware.ts
export async function onRequest(context, next) {
  const hostname = context.request.headers.get('host');

  // Map hostname to podcast
  const podcast = await getPodcastByHostname(hostname);

  if (!podcast) {
    return new Response('Podcast not found', { status: 404 });
  }

  context.locals.podcast = podcast;
  return next();
}

// src/pages/index.astro
const { podcast } = Astro.locals;
// Render homepage using podcast config
```

**Pros:**
- ✅ One codebase, one deployment (simplest operations)
- ✅ Add new podcast by adding DNS + Sanity config (no deploy)
- ✅ Centralized updates benefit all podcasts instantly
- ✅ Shared component library (by default)
- ✅ Mothership is just another route
- ✅ Lowest infrastructure cost

**Cons:**
- ❌ All podcasts coupled to one deployment
- ❌ One bug affects all sites
- ❌ Harder to customize per-podcast
- ❌ Complex DNS/domain setup (multiple domains → one site)
- ❌ Can't hand off individual podcasts easily
- ❌ Performance: one slow query affects all sites

**Best For:**
- Portfolio company (all owned by you)
- Mature, stable codebase
- 10+ podcasts with identical structure
- Low-customization needs
- SaaS product model

**Risks:**
- Single point of failure
- Deployment coordination (can't deploy one podcast)
- Harder to test changes in isolation

---

## Recommended Architecture

### Phase-Based Approach (Evolve with Real Needs)

#### **Phase 2a: Template Repository (NOW)**
**Duration:** Current sprint
**Goal:** Deploy podcast #2 successfully

**Architecture:** Option 1 (Template Repository)

**Why:**
1. **Simplest to implement** - Remove hardcoding, create deployment guide, clone repo
2. **Validates assumptions** - Learn what's actually painful before over-engineering
3. **Maximum flexibility** - Can migrate to any other option later
4. **Lowest risk** - No complex infrastructure to debug
5. **Handoff-friendly** - Can easily give podcast to independent owner

**Implementation:**
1. Remove all hardcoding from current repo (this plan, Steps 1-5)
2. Create comprehensive deployment guide
3. Add `.env.example` with all variables
4. Mark customization points clearly (about.astro, etc.)
5. Test by deploying podcast #2

**Success Criteria:**
- ✅ Deploy podcast #2 in <4 hours using only deployment guide
- ✅ Zero code changes required (only config + content)
- ✅ Both sites work independently
- ✅ Can customize about page without affecting Strange Water

---

#### **Phase 2b: Template Refinement (AFTER PODCAST #2)**
**Duration:** 1-2 weeks after podcast #2 launch
**Goal:** Improve template based on real deployment

**Activities:**
1. Document pain points from podcast #2 deployment
2. Automate tedious steps
3. Improve deployment guide
4. Add validation scripts
5. Create "preflight check" for deployments

**Deliverables:**
- Updated template with learnings
- Automated setup scripts
- Pre-launch checklist
- Common troubleshooting guide

**Decision Point:** After 2-3 podcasts, revisit architecture
- If all podcasts are similar → consider monorepo
- If customization heavy → stay with template
- If rapid growth → consider multi-tenant or NPM package

---

#### **Phase 2c: Mothership Website (AFTER 2-3 PODCASTS)**
**Duration:** 1 week
**Goal:** Build network site that showcases all podcasts

**Architecture:** Separate Astro site (independent from podcast template)

**Content:**
- Company/network information
- Team bios
- All podcasts (cards linking to individual sites)
- Latest episodes across all podcasts (aggregated feed)
- Press kit
- Contact form

**Data Source Strategy:**

**Option A: Manual Registry**
```typescript
// mothership/src/config/podcasts.ts
export const PODCASTS = [
  {
    name: "Strange Water",
    url: "https://strangewater.xyz",
    logo: "/logos/strange-water.png",
    description: "Exploring Ethereum and Web3",
    rss: "https://anchor.fm/s/db8e8e8c/podcast/rss",
    sanityProjectId: "abc123",  // optional
  },
  {
    name: "Podcast 2",
    url: "https://podcast2.com",
    logo: "/logos/podcast-2.png",
    description: "Another great show",
    rss: "https://feeds.buzzsprout.com/...",
    sanityProjectId: "def456",  // optional
  }
];
```

**Pros:**
- Simple, no API complexity
- Works even if podcasts change infrastructure
- Mothership independent of podcasts

**Cons:**
- Manual updates when podcast changes
- No real-time data

---

**Option B: Multi-Sanity-Project Queries**
```typescript
// mothership/src/lib/aggregator.ts
import { createClient } from '@sanity/client';

const PODCASTS = [
  { name: 'Strange Water', projectId: 'abc123', dataset: 'production' },
  { name: 'Podcast 2', projectId: 'def456', dataset: 'production' },
];

export async function getAllPodcastsWithLatestEpisodes() {
  const results = await Promise.all(
    PODCASTS.map(async (podcast) => {
      const client = createClient({
        projectId: podcast.projectId,
        dataset: podcast.dataset,
        useCdn: true,
        apiVersion: '2024-01-01',
      });

      const data = await client.fetch(`{
        "podcast": *[_type == "podcast"][0],
        "latestEpisodes": *[_type == "episode"] | order(publishDate desc)[0...3]
      }`);

      return { ...data, podcastName: podcast.name };
    })
  );

  return results;
}
```

**Pros:**
- Real-time data from each podcast
- Can show latest episodes
- Rich metadata

**Cons:**
- Requires Sanity project IDs
- API rate limits (multiple projects)
- Coupled to Sanity (if podcast migrates CMS, breaks)

---

**Option C: RSS Aggregation**
```typescript
// mothership/src/lib/rss-aggregator.ts
export async function getLatestEpisodesAcrossAllPodcasts() {
  const rssFeeds = [
    { podcast: 'Strange Water', rss: 'https://anchor.fm/s/db8e8e8c/podcast/rss' },
    { podcast: 'Podcast 2', rss: 'https://feeds.buzzsprout.com/...' },
  ];

  const allEpisodes = await Promise.all(
    rssFeeds.map(async ({ podcast, rss }) => {
      const feed = await fetch(rss).then(r => r.text());
      const parsed = parseRSS(feed);
      return parsed.items.slice(0, 5).map(ep => ({ ...ep, podcast }));
    })
  );

  return allEpisodes.flat().sort((a, b) => b.date - a.date).slice(0, 10);
}
```

**Pros:**
- Platform-agnostic (RSS is universal)
- Works with any podcast host
- No Sanity coupling

**Cons:**
- Limited metadata (only what's in RSS)
- Less control over presentation
- RSS changes less frequently (caching issues)

---

**Recommendation:** **Option A (Manual Registry) + Option C (RSS for latest episodes)**

**Why:**
- Simplest to implement
- No complex API orchestration
- Works even if podcasts migrate platforms
- Mothership stays independent
- Can add Option B later if needed

**Mothership Repository Strategy:**
- Separate repo: `mothership-site`
- Separate Netlify deployment
- Independent from podcast template
- Can evolve independently

---

#### **Phase 3: Scale Architecture (5+ PODCASTS)**
**Duration:** Revisit after 5+ podcasts deployed
**Goal:** Optimize for scale based on real pain points

**Decision Points:**

**If pain point is: Framework updates are tedious**
→ **Solution:** Extract to NPM package (Option 3)

**If pain point is: Managing multiple repos is complex**
→ **Solution:** Migrate to monorepo (Option 2)

**If pain point is: Deployment overhead**
→ **Solution:** Consider multi-tenant (Option 4) or deployment automation

**If pain point is: Customization conflicts**
→ **Solution:** Stay with template, improve customization docs

**Don't Decide Now:** Wait for real data from 5+ podcast deployments

---

## Content & Backend Management

### Sanity Architecture Strategy

#### Approach A: Separate Sanity Projects (RECOMMENDED FOR NOW)

**Structure:**
```
Sanity Projects:
├── strange-water (Project ID: abc123)
│   ├── Dataset: production
│   ├── Documents: episodes, guests, hosts, podcast
│   └── Studio: http://localhost:3333 (local only)
├── podcast-2 (Project ID: def456)
│   ├── Dataset: production
│   ├── Documents: episodes, guests, hosts, podcast
│   └── Studio: http://localhost:3333 (local only)
```

**Billing:**
- Each project has own free tier (100k requests, 10k docs)
- Only pay if one podcast exceeds limits
- Isolated billing per podcast

**Pros:**
- ✅ Complete independence per podcast
- ✅ Easy to hand off (give client Sanity project access)
- ✅ Isolated data (one breach doesn't affect others)
- ✅ Isolated rate limits (one viral podcast doesn't slow others)
- ✅ Can use different Sanity versions per podcast

**Cons:**
- ❌ Can't query across podcasts easily (mothership needs multiple clients)
- ❌ Multiple Sanity subscriptions (if exceed free tier)
- ❌ No centralized content management

**When to Use:**
- Independent podcast ownership model
- Franchise/agency model
- Security/privacy important
- Now (Phase 2a)

---

#### Approach B: One Sanity Project, Multiple Datasets

**Structure:**
```
Sanity Project: podcast-network (one project ID)
├── Dataset: strange-water
│   └── Documents: episodes, guests, hosts, podcast
├── Dataset: podcast-2
│   └── Documents: episodes, guests, hosts, podcast
└── Dataset: podcast-3
```

**Pros:**
- ✅ One Sanity subscription (consolidated billing)
- ✅ Can query across datasets (centralized management)
- ✅ Shared Sanity Studio (switch dataset via dropdown)
- ✅ Easier to manage (one project dashboard)

**Cons:**
- ❌ Harder to hand off (need to extract dataset)
- ❌ All podcasts share rate limits
- ❌ Security: Sanity admins see all podcasts
- ❌ Coupled architecture

**When to Use:**
- Portfolio company model (all owned by you)
- Centralized management desired
- After 5+ podcasts (if independent ownership not needed)

---

#### Approach C: One Sanity Project, Multi-Tenant Documents

**Structure:**
```
Sanity Project: podcast-network
└── Dataset: production
    ├── Documents:
    │   ├── Podcast: strange-water
    │   ├── Podcast: podcast-2
    │   ├── Episode: sw1 (references Podcast: strange-water)
    │   ├── Episode: sw2 (references Podcast: strange-water)
    │   ├── Episode: p21 (references Podcast: podcast-2)
    │   ├── Guest: john-doe (can be shared across podcasts)
    │   └── Host: rex (can be shared across podcasts)
```

**Schema Changes:**
```typescript
// episode.ts
defineField({
  name: 'podcast',
  title: 'Podcast',
  type: 'reference',
  to: [{ type: 'podcast' }],
  validation: Rule => Rule.required(),
})
```

**Queries:**
```groq
// Get Strange Water episodes
*[_type == "episode" && podcast->slug.current == "strange-water"]

// Get all podcasts
*[_type == "podcast"]
```

**Pros:**
- ✅ True multi-tenancy (like WordPress multisite)
- ✅ Shared guests/hosts (Rex can host multiple podcasts)
- ✅ Easiest to query across podcasts
- ✅ Single Sanity Studio with podcast filter

**Cons:**
- ❌ Complex schema (podcast references everywhere)
- ❌ Hard to separate later (migration nightmare)
- ❌ Performance: queries must always filter by podcast
- ❌ Security: users see all podcasts' data in Studio

**When to Use:**
- SaaS product model
- 20+ podcasts
- Shared resources common (hosts appear on multiple shows)
- Never planning to hand off podcasts

---

### Recommended Sanity Strategy

**Phase 2a-2b (Now through podcast #3):**
→ **Approach A (Separate Projects)**

**Phase 2c+ (If 5+ owned podcasts, no handoff planned):**
→ **Approach B (Multiple Datasets)**

**Phase 3 (If building SaaS product):**
→ **Consider Approach C (Multi-Tenant)**

**Never migrate to Approach C unless:**
- You have 10+ podcasts
- Zero intention of handing off
- Shared resources are common
- Willing to invest in complex migration

---

### Sanity Studio Deployment Strategy

**Current State:** Local Studio only (`http://localhost:3333`)

**Options:**

**Option 1: Keep Local Studios (Strange Water's approach)**
- Each podcast has local Studio
- No hosted deployment
- Requires dev environment to update content

**When to Use:**
- Archival podcasts (rare updates)
- Technical team only
- Now (for Strange Water)

---

**Option 2: Deploy Studio per Podcast**
- Each podcast deploys its own Studio to Netlify
- URL: `studio.strangewater.xyz`, `studio.podcast2.com`
- Separate auth per podcast

**When to Use:**
- Active podcasts (weekly episodes)
- Non-technical content managers
- After podcast #2 (if actively publishing)

**Setup:**
```bash
# Deploy Strange Water Studio
cd sanity
npx sanity deploy

# Or deploy to Netlify
npx sanity build
# Deploy dist/ to Netlify
```

---

**Option 3: Unified Studio (Multiple Projects via Spaces)**
- One deployed Sanity Studio
- Switch between projects via dropdown
- Requires Sanity Spaces feature (Growth plan)

**When to Use:**
- Centralized content team
- 5+ podcasts
- Willing to pay for Sanity Growth plan

**Cost:** $99/mo (Sanity Growth plan)

---

**Recommendation:**
- **Phase 2a:** Local Studios (no deployment)
- **Phase 2b:** Deploy Studios for active podcasts
- **Phase 3:** Consider unified Studio if managing 5+ podcasts

---

## Deployment & Operations

### Deployment Architecture

**Per-Podcast Deployment (Recommended for Phase 2a):**

```
Each Podcast:
├── GitHub Repo: podcast-name
├── Netlify Site: podcast-name.netlify.app
├── Custom Domain: podcast-name.com
├── Environment Variables:
│   ├── SANITY_PROJECT_ID
│   ├── SANITY_DATASET
│   ├── SANITY_API_TOKEN
│   ├── SITE_URL
│   └── PUBLIC_GA_MEASUREMENT_ID
└── Build:
    ├── Command: npm run build
    ├── Publish: dist/
    └── Build Time: ~10s (for 70 pages)
```

**Netlify Free Tier Limits:**
- 300 build minutes/month (30 builds × 10s = 5 min/month per podcast)
- 100GB bandwidth/month (generous for most podcasts)
- ✅ Can host 10+ podcasts on free tier

**Scaling Strategy:**
- Each podcast has own Netlify site (isolate failures)
- Can upgrade individual podcasts to Netlify Pro if needed
- Total cost for 10 podcasts: $0 (unless exceed bandwidth)

---

### CI/CD & Automation

**Build Triggers:**

1. **Git Push** (manual deployment)
   ```bash
   git push origin main
   # → Netlify auto-builds and deploys
   ```

2. **Sanity Webhook** (auto-deploy on content changes)
   ```
   Sanity Studio → Save episode
   → Webhook to Netlify
   → Trigger rebuild
   → Site updates in ~20s
   ```

**Setup:**
```bash
# In Sanity Studio
Settings → API → Webhooks → Add Webhook
URL: https://api.netlify.com/build_hooks/XXXXX
Events: Create, Update, Delete
```

**Benefit:** Content managers publish episodes, site auto-updates (no dev involvement)

---

### Monitoring & Analytics

**Per-Podcast Analytics:**
- Google Analytics 4 (per podcast)
- Netlify Analytics (optional, $9/mo per site)
- Uptime monitoring (UptimeRobot free tier)

**Aggregated Analytics (Mothership):**
- Aggregate GA4 data across podcasts
- Or: Manual dashboard pulling from each GA4 property

---

## External Review & Operational Enhancements

> **External Feedback Integration - 2025-10-06**
> An external AI reviewed the framework plan and provided operational suggestions. This section documents the accepted recommendations and their integration.

### Review Summary

**Accepted (4):** High-value operational improvements
**Acknowledged (3):** Already planned or handled in existing architecture
**Rejected (2):** Premature optimization or over-engineering

---

### ✅ ACCEPTED ENHANCEMENTS

#### 1. Move About Page Content to Sanity (HIGH PRIORITY)

**Problem Identified:** The About page (src/pages/about.astro:24-48) contains hardcoded content about Ethereum/Web3, blockchain technology, and Rex Kirshner specifically. This contradicts the "zero code changes" deployment goal.

**Solution:**
- Add `aboutContent` field to Sanity podcast schema (Portable Text)
- Add `hostInfo` field for host bio/details (Portable Text)
- Update about.astro to render content from Sanity
- Deployers author About content in Sanity Studio, not code

**Impact:**
- Aligns with "<4 hour deployment" KPI
- Truly configuration-driven deployment
- Non-technical users can edit About content

**Implementation:** Added to Phase 2a Step 2 (see updated roadmap below)

---

#### 2. Template Hygiene Automation Script

**Problem Identified:** Manual `grep` checks for hardcoded values are error-prone and not scalable.

**Solution:** Create `scripts/verify-template.js` automation:

```javascript
// scripts/verify-template.js
import { execSync } from 'child_process';
import fs from 'fs';

const checks = [
  {
    name: 'Hardcoded "Strange Water" references',
    pattern: 'Strange Water',
    exclude: ['context/', 'CHANGELOG.md', 'scripts/verify-template.js'],
    severity: 'error'
  },
  {
    name: 'Hardcoded podcast URLs',
    pattern: 'strangewater.xyz',
    exclude: ['context/', 'CHANGELOG.md'],
    severity: 'error'
  },
  {
    name: 'Missing environment variables in .env.example',
    validate: () => {
      const envExample = fs.readFileSync('.env.example', 'utf-8');
      const required = ['PUBLIC_SANITY_PROJECT_ID', 'PUBLIC_SANITY_DATASET', 'SANITY_API_TOKEN'];
      return required.every(v => envExample.includes(v));
    },
    severity: 'error'
  },
  {
    name: 'Sanity schema field alignment',
    validate: () => {
      // Check that podcast.ts schema has all required fields
      const schema = fs.readFileSync('sanity/schemaTypes/podcast.ts', 'utf-8');
      const required = ['name', 'tagline', 'description', 'aboutContent', 'hostInfo'];
      return required.every(f => schema.includes(f));
    },
    severity: 'warning'
  }
];

console.log('🔍 Running template verification checks...\n');

let errors = 0;
let warnings = 0;

checks.forEach(check => {
  try {
    if (check.pattern) {
      const excludeArgs = check.exclude.map(e => `--exclude-dir=${e}`).join(' ');
      const result = execSync(
        `grep -r "${check.pattern}" . ${excludeArgs} || true`,
        { encoding: 'utf-8' }
      );

      if (result.trim()) {
        if (check.severity === 'error') {
          console.log(`❌ ${check.name}`);
          console.log(result);
          errors++;
        } else {
          console.log(`⚠️  ${check.name}`);
          console.log(result);
          warnings++;
        }
      } else {
        console.log(`✅ ${check.name}`);
      }
    } else if (check.validate) {
      if (!check.validate()) {
        if (check.severity === 'error') {
          console.log(`❌ ${check.name}`);
          errors++;
        } else {
          console.log(`⚠️  ${check.name}`);
          warnings++;
        }
      } else {
        console.log(`✅ ${check.name}`);
      }
    }
  } catch (err) {
    console.log(`❌ ${check.name} - Check failed: ${err.message}`);
    errors++;
  }
});

console.log(`\n📊 Results: ${errors} errors, ${warnings} warnings\n`);

if (errors > 0) {
  console.log('❌ Template verification failed. Fix errors before deployment.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Template verification passed with warnings.\n');
  process.exit(0);
} else {
  console.log('✅ Template verification passed! Template is ready to clone.\n');
  process.exit(0);
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "verify:template": "node scripts/verify-template.js"
  }
}
```

**CI/CD Integration (Future):**
```yaml
# .github/workflows/verify-template.yml
name: Template Verification
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run verify:template
```

**Impact:**
- Automated quality checks
- Prevents broken deployments
- Professional tooling for deployers
- 2 minutes to run vs 10 minutes manual checking

**Implementation:** Create script in Phase 2a, add to deployment guide

---

#### 3. Security & Credentials Documentation

**Problem Identified:** Credential management strategy (read-only tokens, rotation, client handoff) not explicitly documented.

**Solution:** Add "Security & Credentials" section to deployment guide:

**Security & Credentials Best Practices**

**Sanity API Tokens:**
- **Production sites:** Use read-only tokens for `PUBLIC_SANITY_PROJECT_ID`
- **Development:** Can use write tokens for testing
- **Token creation:** Sanity Dashboard → API → Tokens → Add Token
- **Scopes:** Reader (production), Editor (development)

**Token Rotation Strategy:**
```bash
# Quarterly rotation recommended
1. Create new token in Sanity dashboard
2. Update Netlify environment variables
3. Trigger new deployment to pick up new token
4. Revoke old token after successful deployment
5. Document rotation in podcast's PODCAST_INFO.json
```

**Client Handoff Process (for agency/franchise model):**
```bash
# When handing off podcast to client
1. Transfer Netlify site ownership to client account
2. Transfer Sanity project ownership to client account
3. Client creates their own API tokens (you no longer have access)
4. Update PODCAST_INFO.json with handoff date and notes
5. Remove podcast from mothership network (if applicable)
```

**Environment Variable Security:**
- ✅ `PUBLIC_SANITY_PROJECT_ID` - NOT secret (visible in client code)
- ✅ `PUBLIC_SANITY_DATASET` - NOT secret (visible in client code)
- ❌ `SANITY_API_TOKEN` - SECRET (never commit to git, Netlify only)
- ❌ Private keys, credentials - SECRET (use Netlify env vars)

**Netlify Environment Variables:**
- Set via: Netlify Dashboard → Site Settings → Environment Variables
- Mark `SANITY_API_TOKEN` as "Secret" (hidden from logs)
- Do NOT mark `PUBLIC_*` variables as secret (they're meant to be public)

**Impact:**
- Prevents security drift
- Enables clean client handoffs
- Professional credential management
- Reduces support questions

**Implementation:** Add to deployment guide in Phase 2a Step 6

---

#### 4. Time-Tracking for KPI Validation

**Problem Identified:** <4 hour deployment KPI is an assumption, not validated with real data.

**Solution:** Add time-tracking checklist to deployment guide:

**Deployment Time Tracker**

Track each step to validate our <4 hour KPI and identify optimization opportunities:

```markdown
## Phase 2b Deployment - Podcast #2
**Date:** ___________
**Deployer:** ___________

| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| 1. Clone template repo | 2 min | ____ | |
| 2. Create Sanity project | 10 min | ____ | |
| 3. Configure environment variables | 5 min | ____ | |
| 4. Import RSS feed (if applicable) | 20 min | ____ | |
| 5. Author About content in Sanity | 30 min | ____ | |
| 6. Upload guest photos | 30 min | ____ | |
| 7. Configure Netlify site | 15 min | ____ | |
| 8. Custom domain setup | 10 min | ____ | DNS propagation not counted |
| 9. Test deployment | 15 min | ____ | |
| 10. QA checklist | 20 min | ____ | |
| **TOTAL** | **2h 37min** | **____** | |

**Blockers encountered:**
- ___________________________________
- ___________________________________

**What took longer than expected:**
- ___________________________________

**What could be automated:**
- ___________________________________

**Deployment guide improvements needed:**
- ___________________________________
```

**Data Collection Strategy:**
- Podcast #2: Manual tracking (validates baseline)
- Podcast #3: Manual tracking (identifies patterns)
- Podcast #4-5: Manual tracking (confirms optimization targets)
- Phase 2c: Analyze aggregated data, prioritize automation
- Phase 3: Automate top 3 time-consuming steps

**Impact:**
- Data-driven optimization decisions
- Validates KPI assumptions
- Identifies Phase 3 automation priorities
- Shows deployers we're serious about efficiency

**Implementation:** Add to deployment guide in Phase 2a Step 6

---

### ⏸️ ACKNOWLEDGED (Already Handled)

#### 5. Null-Safe Patterns for Optional Sanity Fields

**External Concern:** New fields (email, Patreon) might break if undefined.

**Current State:** ALREADY HANDLED. Astro components use optional chaining throughout:
- `about.astro:69-108` - All platform links use `podcastInfo?.spotifyUrl && (...)`
- Template pattern: `{field?.value && <Component />}`
- Sanity queries use `asset->{url}` which returns null safely

**Action:** Add note to deployment guide confirming null-safe patterns are built-in. No code changes needed.

---

#### 6. Validate Referenced Commands Exist

**External Concern:** Plan references `npm run sanity` and `scripts/import-from-rss.js` - ensure they exist.

**Current State:** VERIFIED - Both exist:
- `npm run sanity` - package.json:10
- `scripts/import-from-rss.js` - Created in Phase 1, working script

**Action:** Document that Phase 1 scripts should be included in template repo. Add to Phase 2a checklist.

---

#### 7. Minimum Viable Theming Surface

**External Concern:** Early adopters need styling changes even in Phase 2a.

**Current State:** DELIBERATELY DEFERRED to Phase 2b. PRD explicitly states:
- Phase 2a: "Proof of concept" deployment
- Phase 2b: "Limited theming options" (exactly as external reviewer suggests: `src/config/theme.ts`)

**Rationale:** Validate deployment process first, add theming second. Don't over-engineer before validating assumptions.

**Action:** Keep as-is. Phase 2b will add theming exactly as suggested.

---

### 🚫 REJECTED (Premature or Over-Engineering)

#### 8. Isolate Framework Modules Now (`src/framework/**`)

**External Suggestion:** Create clear `src/framework/**` vs `src/**` boundaries to enable future migration.

**Analysis:**
- Adds artificial complexity without immediate value
- Our "architecture-agnostic patterns" (file structure, env vars, generic components) already enable migration
- Creating framework boundaries now is premature optimization
- We don't know what should be "framework" until we deploy 2-3 podcasts

**Decision:** DEFER to Phase 3. Current structure is sufficient for template approach.

---

#### 9. Mothership RSS Caching Strategy

**External Suggestion:** Design caching strategy (Netlify Edge Functions, cron rebuilds, stored JSON) for mothership aggregation.

**Analysis:**
- Valid concern but VERY premature
- We don't have a second podcast yet
- Mothership is Phase 2c (after 2-3 podcasts)
- Caching needs depend on traffic patterns we don't have data for yet

**Decision:** Add TODO note to mothership section, but don't design solution now. Will address in Phase 2c based on real usage data.

**TODO Added to Mothership Section:**
```markdown
**Caching Strategy (TBD in Phase 2c):**
- Evaluate after 2-3 podcasts are live
- Options: Netlify Edge Functions, cron rebuilds, stored JSON, RSS aggregator services
- Decision based on: traffic patterns, update frequency, budget constraints
```

---

### Integration Summary

**Changes Made:**
1. ✅ Phase 2a Step 2 expanded - Move About content to Sanity
2. ✅ New script created - `scripts/verify-template.js`
3. ✅ Deployment guide enhanced - Security & credentials section
4. ✅ Deployment guide enhanced - Time-tracking checklist
5. ✅ Notes added - Existing null-safe patterns documented
6. ✅ Notes added - Phase 1 scripts inclusion reminder
7. ✅ TODO added - Mothership caching strategy (Phase 2c)

**External Review Value:**
The external AI provided thoughtful operational improvements despite limited project context. Their focus on practical deployment concerns (credentials, time-tracking, automation) identified real gaps in our documentation. Their architectural suggestions correctly showed they didn't understand our "validate-first, engineer-later" philosophy, which we rejected appropriately.

**Key Insight:** The About page hardcoding is a genuine blocker to "config-only deployment" and should be fixed in Phase 2a.

---

## Implementation Roadmap

### Phase 2a: Complete Feature Set (THIS SPRINT - Weeks 5-6)

**Goal:** Build guests page + CMS styling BEFORE templatizing

> **Rationale:** Template v2.0.0 should be feature-complete. Build everything we know we want, then generalize once. Don't test upgrade mechanisms before we have a second podcast.

**Steps:**

1. **Build Guests Page** (1-2 days)
   - Create `/guests` page with grid/list view
   - Create `/guest/[slug]` dynamic routes
   - Add guest filtering/search
   - Link from navigation header
   - Link from episode pages
   - Test with Strange Water's 72 guests

2. **Add CMS-Driven Visual Styling** (1-2 days)
   - Add logo field to podcast schema (Sanity image)
   - Add brand color fields (primary, secondary, accent)
   - Add font family fields (heading, body)
   - Update Tailwind config to use CSS variables from Sanity
   - Move About page content to Sanity (Portable Text) 🔥
   - Move host info to Sanity
   - Test styling changes live-update

3. **Validate on Strange Water** (2-4 hours)
   - Upload Strange Water logo to Sanity
   - Configure brand colors in Sanity
   - Author About content in Sanity
   - QA all pages render correctly
   - Verify no hardcoded content remains

**Deliverables:**
- ✅ Guests page feature-complete
- ✅ CMS-driven styling (logo, colors, fonts)
- ✅ About content managed in Sanity
- ✅ Zero hardcoded Strange Water-specific content
- ✅ Template v2.0.0 ready for generalization

**Total Time:** ~3-4 days (6-8 hours/day)

---

### Phase 2b: Framework Templatization (Week 7)

**Goal:** Generalize Strange Water codebase into reusable template

**Steps:**

1. **Environment Variables** (15 min)
   - Create `.env.example`
   - Update `astro.config.mjs`
   - Document all required variables

2. **Delete SITE_CONFIG** (15 min)
   - Remove `src/config/site.ts` (if exists)
   - Verify all pages use `getPodcastInfo()`

3. **Fix Remaining Hardcoded Content** (20 min)
   - Update 404.astro
   - Search for any remaining hardcoded strings
   - Fix RSS feed generation

4. **Sanity Schema Updates** (30 min)
   - Add any missing fields discovered during feature work
   - Validate all fields have appropriate defaults

5. **Create Template Verification Script** (30 min)
   - Create `scripts/verify-template.js`
   - Add `npm run verify:template` to package.json
   - Test script catches hardcoded references

6. **Testing & Validation** (30 min)
   - Run `npm run verify:template`
   - Build succeeds
   - All pages render correctly
   - Lighthouse scores maintained

7. **Documentation** (1.5 hours)
   - Create deployment guide
   - Add Security & Credentials section
   - Add Time-Tracking template
   - Document customization points
   - Add troubleshooting section

8. **Version Files** (30 min)
   - Create TEMPLATE_VERSION.json (v2.0.0)
   - Create CHANGELOG.md
   - Tag git release v2.0.0

**Deliverables:**
- ✅ Template repo ready to clone
- ✅ Deployment guide (step-by-step with security & time-tracking)
- ✅ `.env.example` with all variables
- ✅ Zero hardcoded podcast-specific values
- ✅ `npm run verify:template` automation script
- ✅ TEMPLATE_VERSION.json + CHANGELOG.md
- ✅ Git tag v2.0.0

**Total Time:** ~4-5 hours

---

### Phase 2c: Podcast #2 Deployment (Week 8)

**Goal:** Validate template with real deployment

**Steps:**
1. Clone template repo
2. Follow deployment guide
3. Document pain points
4. Deploy podcast #2 to production
5. Measure actual deployment time

**Success Criteria:**
- ✅ Deployment in <4 hours (PRD KPI)
- ✅ Zero code changes required
- ✅ Clear customization points

**Learnings to Capture:**
- What was confusing in deployment guide?
- What took longer than expected?
- What could be automated?
- What's missing from template?

---

### Phase 2c: Mothership Website (AFTER 2-3 PODCASTS)

**Goal:** Build network site showcasing all podcasts

**Steps:**
1. Create new Astro site (separate repo)
2. Design homepage (company info, podcast cards)
3. Implement RSS aggregator (latest episodes)
4. Add podcast registry (manual config)
5. Deploy to Netlify (network-site.com)

**Pages:**
- `/` - Homepage (company info, all podcasts)
- `/podcasts` - All podcasts (grid view)
- `/latest` - Latest episodes across all podcasts
- `/about` - About the network/company
- `/contact` - Contact form

**Caching Strategy (TBD in Phase 2c):**
> Design caching after 2-3 podcasts are live with real traffic data
- Evaluate options: Netlify Edge Functions, cron rebuilds, stored JSON, RSS aggregator services
- Decision factors: traffic patterns, update frequency, budget constraints
- Avoid premature optimization - measure first, optimize second

**Time Estimate:** 1 week (40 hours)

---

### Phase 3: Scale Optimizations (AFTER 5+ PODCASTS)

**Potential Initiatives:**

1. **Migration to Monorepo** (if managing 5+ owned podcasts)
   - Extract shared components to `packages/ui`
   - Migrate all podcasts to monorepo
   - Set up Turborepo for build orchestration

2. **Extract to NPM Package** (if distributing publicly)
   - Create `@podcast-network/framework` package
   - Migrate podcasts to use package
   - Set up npm publishing

3. **Deployment Automation**
   - CLI tool: `create-podcast-site`
   - Automated Sanity project creation
   - Automated Netlify site creation
   - One-command deployment

4. **Centralized Admin Dashboard**
   - View all podcasts in one place
   - Aggregate analytics
   - Manage deployments
   - Content operations dashboard

---

## Detailed Implementation Steps (Phase 2a)

### Step 1: Environment Variables Setup (15 min)

**1.1 - Create `.env.example`**
```bash
# Site Configuration
SITE_URL=http://localhost:4322

# Sanity CMS
SANITY_PROJECT_ID=your-project-id-here
SANITY_DATASET=production
SANITY_API_TOKEN=your-token-here

# Analytics (optional)
PUBLIC_GA_MEASUREMENT_ID=

# Build Configuration
NODE_ENV=development
```

**1.2 - Update `astro.config.mjs`**
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: import.meta.env.SITE_URL || 'http://localhost:4322',
  vite: {
    plugins: [tailwindcss()]
  }
});
```

**1.3 - Update `.env` (local)**
```bash
SITE_URL=http://localhost:4322
# ... other vars
```

**1.4 - Update Netlify Environment Variables**
```bash
# In Netlify UI: Site Settings → Environment Variables
SITE_URL=https://strangewater.xyz
SANITY_PROJECT_ID=abc123
SANITY_DATASET=production
SANITY_API_TOKEN=sk...
PUBLIC_GA_MEASUREMENT_ID=G-V74NXPXZWQ
```

**Validation:**
```bash
npm run build
# Should succeed with env var for site URL
```

---

### Step 2: Delete SITE_CONFIG (30 min)

**2.1 - Audit Current Usage**
```bash
grep -r "SITE_CONFIG" src/
# Expected: src/pages/about.astro
```

**2.2 - Update `src/pages/about.astro`**

Replace:
```astro
import { SITE_CONFIG } from "../config/site";
```

With:
```astro
import { getPodcastInfo } from "../lib/sanity";
const podcastInfo = await getPodcastInfo();
```

Replace all `SITE_CONFIG.xxx` references:
```astro
<!-- OLD -->
<h1>{SITE_CONFIG.name}</h1>
<a href={SITE_CONFIG.links.spotify}>Spotify</a>

<!-- NEW -->
<h1>{podcastInfo.name}</h1>
<a href={podcastInfo.spotifyUrl}>Spotify</a>
```

**2.3 - Delete `src/config/site.ts`**
```bash
rm src/config/site.ts
```

**2.4 - Verify Build**
```bash
npm run build
# Should succeed with zero references to SITE_CONFIG
```

---

### Step 3: Fix Hardcoded Page Content (20 min)

**3.1 - Update `src/pages/404.astro`**
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { getPodcastInfo } from "../lib/sanity";

const podcastInfo = await getPodcastInfo();
const siteName = podcastInfo?.name || "Podcast";
---

<BaseLayout
  title={`Page Not Found - ${siteName}`}
  description="The page you're looking for doesn't exist."
>
  <!-- content -->
</BaseLayout>
```

**3.2 - Update `src/pages/episodes/index.astro`**
```astro
<BaseLayout
  title={`All Episodes - ${siteName}`}
  description={podcastInfo?.description || `Browse all episodes of ${siteName}`}
>
```

**3.3 - Search for Remaining Hardcoding**
```bash
grep -ri "strange water" src/
# Should return ZERO results

grep -ri "strangewater" src/
# Should return ZERO results

grep -ri "exploring ethereum" src/
# Should return ZERO results
```

---

### Step 4: Sanity Schema Updates (30 min)

**4.1 - Add Missing Fields to `sanity/schemaTypes/podcast.ts`**
```typescript
defineField({
  name: 'contactEmail',
  title: 'Contact Email',
  type: 'string',
  validation: Rule => Rule.email()
}),
defineField({
  name: 'patreonUrl',
  title: 'Patreon URL',
  type: 'url'
}),
defineField({
  name: 'websiteUrl',
  title: 'Website URL',
  type: 'url',
  description: 'Main podcast website URL'
}),
```

**4.2 - Update Strange Water Podcast Record**
Open Sanity Studio (`npm run sanity`):
- Set `contactEmail`: `hello@strangewater.xyz`
- Set `patreonUrl`: `https://patreon.com/strangewater`
- Set `websiteUrl`: `https://strangewater.xyz`

**4.3 - Update Frontend to Use New Fields**
```astro
<!-- src/pages/about.astro -->
{podcastInfo.contactEmail && (
  <a href={`mailto:${podcastInfo.contactEmail}`}>Contact Us</a>
)}

{podcastInfo.patreonUrl && (
  <a href={podcastInfo.patreonUrl}>Support on Patreon</a>
)}
```

---

### Step 5: Testing & Validation (30 min)

**5.1 - Grep Audit**
```bash
# Should all return ZERO results in src/
grep -ri "strange water" src/
grep -ri "strangewater\.xyz" src/
grep -ri "StrangeH2OPod" src/
grep -ri "exploring ethereum" src/
grep -ri "web3" src/ | grep -v node_modules
```

**5.2 - Build Test**
```bash
npm run build
# Expected output:
# - 72 pages in ~10s
# - Zero errors
# - Correct sitemap with SITE_URL
```

**5.3 - Visual Testing**
Start dev server:
```bash
npm run dev
```

Test pages:
- ✅ **Homepage** (`/`)
  - Podcast name from Sanity
  - Logo from Sanity
  - Social links from Sanity

- ✅ **About** (`/about`)
  - No hardcoded content
  - Social links work
  - Patreon link present

- ✅ **Episodes List** (`/episodes`)
  - Description from Sanity
  - Episode cards render

- ✅ **Episode Page** (`/episodes/sw1`)
  - Title correct
  - Spotify embed works

- ✅ **404** (`/nonexistent`)
  - Podcast name in title

**5.4 - Sanity Data Completeness**
Open Sanity Studio, verify podcast document has:
- ✅ Name, tagline, description
- ✅ Logo, favicon
- ✅ All social URLs (Spotify, Apple, YouTube, RSS, Twitter, Discord, Patreon)
- ✅ Contact email
- ✅ isActive flag

---

### Step 6: Documentation (1 hour)

**6.1 - Create `DEPLOYMENT_GUIDE.md`**

See next section for full deployment guide template.

**6.2 - Mark Customization Points**

Add comments to `src/pages/about.astro`:
```astro
<!--
  CUSTOMIZATION POINT:
  This page contains podcast-specific copy that should be customized for each podcast.
  Replace the content below with your podcast's story, mission, and call-to-action.
-->
```

**6.3 - Update `README.md`**
- Add "Using This Template" section
- Link to deployment guide
- Document project structure
- Add troubleshooting section

---

## Deployment Guide Template

```markdown
# Podcast Website Deployment Guide

> **Goal:** Deploy a new podcast website in <4 hours

**Prerequisites:**
- Node.js 18+ installed
- Git installed
- Sanity account (free tier)
- Netlify account (free tier)
- Domain registrar access (for custom domain)

---

## Step 1: Clone Template (5 min)

```bash
git clone https://github.com/yourusername/podcast-template.git my-podcast-site
cd my-podcast-site
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

---

## Step 2: Install Dependencies (5 min)

```bash
npm install
```

---

## Step 3: Create Sanity Project (15 min)

```bash
cd sanity
npx sanity init

# Follow prompts:
# - Create new project? Yes
# - Project name: My Podcast
# - Use default dataset? Yes (production)
# - Output path: Press enter (current directory)
```

Copy project ID from output:
```
Success! Your project is ready!
Project ID: abc123xyz
```

---

## Step 4: Configure Environment Variables (10 min)

Create `.env` in project root:
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Site
SITE_URL=http://localhost:4322

# Sanity
SANITY_PROJECT_ID=abc123xyz  # from step 3
SANITY_DATASET=production
SANITY_API_TOKEN=  # leave blank for now

# Analytics (optional)
PUBLIC_GA_MEASUREMENT_ID=
```

---

## Step 5: Populate Sanity Content (30 min)

**5.1 - Start Sanity Studio**
```bash
npm run sanity
# Opens http://localhost:3333
```

**5.2 - Create Podcast Document**
- Click "Podcast"
- Click "Create new Podcast"
- Fill in all fields:
  - Name: "My Podcast"
  - Tagline: "Your podcast tagline"
  - Description: "Your podcast description"
  - Upload logo (square, 800x800px recommended)
  - Upload favicon (32x32px or 64x64px)
  - Add all platform URLs (Spotify, Apple, YouTube, RSS)
  - Add social URLs (Twitter, Discord, Patreon)
  - Set contact email
  - Toggle "Podcast is Active"
- Click "Publish"

**5.3 - Create Host Document**
- Click "Hosts"
- Add your host(s)
- Upload profile photo
- Add bio and social links

**5.4 - Import Episodes (Optional - if migrating)**
```bash
# Edit scripts/import-from-rss.js
# Update RSS_FEED_URL

npm run import:rss
```

---

## Step 6: Customize About Page (30 min)

Edit `src/pages/about.astro`:
- Replace hardcoded content with your podcast story
- Update mission/vision text
- Customize call-to-action sections
- Update any podcast-specific copy

---

## Step 7: Test Locally (15 min)

```bash
npm run dev
# Opens http://localhost:4322
```

**Check:**
- ✅ Homepage loads with correct branding
- ✅ About page has your content
- ✅ Episodes list shows episodes (if imported)
- ✅ Social links work
- ✅ Logo and favicon correct

---

## Step 8: Deploy to Netlify (30 min)

**8.1 - Create GitHub Repo**
```bash
# Create repo on GitHub: my-podcast-site
git remote add origin https://github.com/yourusername/my-podcast-site.git
git branch -M main
git push -u origin main
```

**8.2 - Connect to Netlify**
1. Log into Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select `my-podcast-site` repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**8.3 - Configure Environment Variables**
In Netlify: Site Settings → Environment Variables
```
SITE_URL=https://your-site-name.netlify.app
SANITY_PROJECT_ID=abc123xyz
SANITY_DATASET=production
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  (if using)
```

**8.4 - Trigger Redeploy**
Deploys → Trigger deploy → Deploy site

---

## Step 9: Configure Custom Domain (30 min)

**9.1 - Add Domain in Netlify**
Site Settings → Domain management → Add custom domain
Enter: `mypodcast.com`

**9.2 - Update DNS Records**
In your domain registrar (Namecheap, GoDaddy, etc.):

Add CNAME record:
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

Add A record for apex domain:
```
Type: A
Name: @
Value: 75.2.60.5  (Netlify load balancer)
```

Or use Netlify DNS (recommended):
- Delegate nameservers to Netlify
- Let Netlify manage all DNS

**9.3 - Enable HTTPS**
Netlify auto-provisions SSL (Let's Encrypt)
Wait 5-10 minutes for SSL to activate

**9.4 - Update Environment Variables**
```
SITE_URL=https://mypodcast.com
```

Redeploy site.

---

## Step 10: Configure Sanity Webhook (Optional - Auto-deploy on content changes)

**10.1 - Get Netlify Build Hook URL**
Netlify: Site Settings → Build & deploy → Build hooks
Click "Add build hook"
Name: "Sanity Content Update"
Copy URL: `https://api.netlify.com/build_hooks/XXXXX`

**10.2 - Add Webhook in Sanity**
Sanity Studio → Settings (gear icon) → API → Webhooks
Click "Add webhook"
- Name: Netlify Deploy
- URL: (paste build hook URL)
- Dataset: production
- Trigger on: Create, Update, Delete
- Filter: (leave blank for all documents)
- HTTP method: POST

Save.

**Test:** Edit an episode in Sanity Studio → Save
Should trigger Netlify rebuild (~20s)

---

## Troubleshooting

### Build fails with "Missing environment variable"
Check Netlify environment variables are set correctly.

### Site loads but shows no content
Verify Sanity project ID is correct in `.env` and Netlify.

### Images not loading
Check that images are uploaded to Sanity, not just referenced.

### Spotify embeds not working
Verify `spotifyShowId` is set in podcast document.

---

## Customization Points

**Files to customize per podcast:**
- `src/pages/about.astro` - About page content
- `public/favicon.ico` - Browser favicon (if not using Sanity)
- Environment variables (`.env` and Netlify)
- Sanity content (podcast info, episodes, guests)

**Files that should NOT need changes:**
- `src/components/**` - Reusable components
- `src/layouts/**` - Page layouts
- `src/lib/**` - Utilities and Sanity queries

---

## Next Steps

1. ✅ Import remaining episodes (if migrating)
2. ✅ Upload guest photos
3. ✅ Configure Google Analytics
4. ✅ Test all pages
5. ✅ Announce launch!

---

**Need help?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
```

---

## Risk Analysis & Mitigation

### Technical Risks

**Risk 1: Template divergence**
- **Description:** Podcasts customized heavily, can't apply updates from template
- **Probability:** High (if not managed)
- **Impact:** Medium (missed framework improvements)
- **Mitigation:**
  - Document customization points clearly
  - Keep customizations minimal in template
  - Provide migration guides for breaking changes
  - Consider extracting to NPM package if updates frequent

**Risk 2: Sanity schema breaking changes**
- **Description:** Update Sanity schema, breaks existing podcasts
- **Probability:** Low (schemas are additive)
- **Impact:** High (production sites break)
- **Mitigation:**
  - Never remove fields (deprecate instead)
  - Add fields as optional
  - Version schemas (v1, v2)
  - Test schema changes on staging first

**Risk 3: Environment variable misconfiguration**
- **Description:** Deploy without setting env vars, site broken
- **Probability:** Medium (human error)
- **Impact:** Medium (site doesn't work)
- **Mitigation:**
  - Create deployment checklist
  - Add validation script (checks env vars)
  - Provide clear error messages
  - Include `.env.example` with all vars

**Risk 4: Multi-Sanity-project rate limits**
- **Description:** Mothership queries 10 Sanity projects, hits rate limits
- **Probability:** Low (free tier is generous)
- **Impact:** Medium (mothership slow/broken)
- **Mitigation:**
  - Use Sanity CDN (higher rate limits)
  - Cache responses (stale-while-revalidate)
  - Or: use RSS aggregation (no Sanity queries)
  - Upgrade to Sanity Growth plan if needed

### Operational Risks

**Risk 5: Deployment time exceeds 4 hours**
- **Description:** Podcast #2 takes 6-8 hours to deploy
- **Probability:** Medium (first time deploying)
- **Impact:** Low (KPI missed, but not critical)
- **Mitigation:**
  - Thorough deployment guide
  - Video walkthrough
  - Automation scripts where possible
  - Learn from podcast #2, improve for #3

**Risk 6: Mothership becomes outdated**
- **Description:** Mothership shows old episode data
- **Probability:** Medium (caching issues)
- **Impact:** Low (user sees stale data)
- **Mitigation:**
  - Cache with TTL (e.g., 1 hour)
  - Add "last updated" timestamp
  - Manual refresh button
  - RSS aggregation updates frequently

### Business Risks

**Risk 7: Can't hand off podcast to client**
- **Description:** Architecture too coupled to hand over
- **Probability:** Low (using template approach)
- **Impact:** High (business model fails)
- **Mitigation:**
  - Choose template approach (independent repos)
  - Separate Sanity projects
  - Document handoff process
  - Provide support plan

**Risk 8: Scaling to 50+ podcasts**
- **Description:** Managing 50 template repos becomes impossible
- **Probability:** Low (growth problem)
- **Impact:** Medium (operational overhead)
- **Mitigation:**
  - Migrate to monorepo at 10+ podcasts
  - Or: extract to NPM package
  - Build deployment automation
  - Hire ops team (if revenue supports)

---

## Success Criteria

### Phase 2a Success (Framework Generalization)
- ✅ Zero hardcoded "Strange Water" references in `src/`
- ✅ All content from Sanity CMS or environment variables
- ✅ Build succeeds with env var configuration
- ✅ Deployment guide complete
- ✅ Ready to clone for podcast #2

### Phase 2b Success (Podcast #2 Deployment)
- ✅ Podcast #2 deployed in <4 hours (PRD KPI)
- ✅ Zero code changes required (config + content only)
- ✅ Both sites work independently
- ✅ Identified 3+ improvements for template

### Phase 2c Success (Mothership Website)
- ✅ Mothership site live
- ✅ Lists all podcasts with metadata
- ✅ Shows latest 10 episodes across network
- ✅ Independent of podcast template
- ✅ Works even if individual podcasts change platforms

### Long-Term Success (Network Growth)
- ✅ 5+ podcasts deployed using template
- ✅ Average deployment time <3 hours
- ✅ Handoff process validated with at least one client
- ✅ Framework updates applied to 3+ podcasts successfully
- ✅ Mothership drives 10% of traffic to individual podcasts

---

## Open Questions & Decision Points

### Question 1: About Page Customization
**Question:** Should about page be in Sanity (rich text CMS) or customized in code?

**Option A:** Keep in code (current approach)
- ✅ Pros: Full control, no CMS complexity
- ❌ Cons: Requires code changes per podcast

**Option B:** Move to Sanity rich text field
- ✅ Pros: No code changes, content manager friendly
- ❌ Cons: Less layout control, more complex CMS

**Recommendation:** Keep in code for Phase 2a, revisit in Phase 3
**Decision Required:** After podcast #2 deployment

---

### Question 2: Brand Colors Customization
**Question:** How should podcast-specific brand colors be managed?

**Option A:** Hardcode Tailwind classes per podcast
- ✅ Pros: Simple, performant
- ❌ Cons: Requires code changes

**Option B:** CSS custom properties from Sanity
- ✅ Pros: No code changes
- ❌ Cons: Runtime overhead, less Tailwind-native

**Option C:** Dynamic Tailwind config
- ✅ Pros: Tailwind-native, performant
- ❌ Cons: Complex build process

**Recommendation:** Defer to Phase 3 (not blocking)
**Decision Required:** After 3+ podcasts with different branding

---

### Question 3: Episode Artwork Automation
**Question:** How to automate episode cover image imports?

**Options:**
- Spotify Web API (recommended, but requires API setup)
- RSS feed images (simple, but lower quality)
- Manual upload (current approach, tedious)
- Webhook-based (ideal, but complex)

**Recommendation:** Research Spotify API in Phase 2
**Decision Required:** Before deploying active podcast (not Strange Water)

---

### Question 4: Monorepo vs Template Long-Term
**Question:** When (if ever) should we migrate to monorepo?

**Trigger Conditions:**
- If managing 5+ owned podcasts (not handed off)
- If framework updates are frequent (>1/month)
- If component duplication becomes painful
- If design system solidifies

**Recommendation:** Decide after 5 podcasts deployed
**Decision Required:** Phase 3

---

## Conclusion

### Recommended Immediate Actions

**This Sprint (Phase 2a):**
1. ✅ Execute Steps 1-6 (framework generalization)
2. ✅ Create deployment guide
3. ✅ Test thoroughly
4. ✅ Deploy to staging
5. ✅ Validate template is clone-ready

**Next Sprint (Phase 2b):**
1. ✅ Deploy podcast #2 using template
2. ✅ Measure deployment time
3. ✅ Document pain points
4. ✅ Improve template based on learnings

**Future (Phase 2c+):**
1. ✅ Build mothership site (after 2-3 podcasts)
2. ✅ Validate architecture at scale (5+ podcasts)
3. ✅ Evolve to monorepo or NPM package (if needed)

---

### Key Architectural Decisions

**Repository Strategy:** Template (clone-per-podcast)
**Sanity Strategy:** Separate projects (independence)
**Deployment Strategy:** Separate Netlify sites (isolation)
**Mothership Strategy:** Separate Astro site + RSS aggregation
**Code Sharing:** Template duplication (Phase 2), evolve later (Phase 3)

**Why This Approach:**
- ✅ Simplest to implement now
- ✅ Validates assumptions with real deployment
- ✅ Maximum flexibility for future pivots
- ✅ Handoff-friendly (client ownership)
- ✅ Low risk, high learning

**Future Flexibility:**
- Can migrate to monorepo if needed
- Can extract to NPM package if desired
- Can add multi-tenant layer later
- Can evolve Sanity architecture as needed

---

**Next Steps:**
1. Review this plan
2. Approve architecture approach
3. Execute Phase 2a implementation
4. Deploy podcast #2
5. Iterate based on learnings

---

**Document Version:** 2.0 (Complete Architecture Revision)
**Last Updated:** 2025-10-06
**Status:** Ready for Review
