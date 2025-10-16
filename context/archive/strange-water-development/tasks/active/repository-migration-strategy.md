# Repository Migration Strategy

**Created:** 2025-10-14 (Session 20)
**Status:** Approved Plan
**Purpose:** Define how podcast-website repo transitions to framework-based architecture

---

## Overview

**Current State:**
- `podcast-website` repo: Strange Water production + planning docs
- `podcast-framework` repo: Framework packages (core, schemas, CLI)

**End State:**
- `podcast-framework` repo: Framework development + planning archive
- `strange-water` repo: Production site using framework (validation)
- `podcast-website` repo: Archived/deprecated

---

## Strategic Goals

1. **Strange Water = Framework Validation**
   - Use Strange Water to test framework before public launch
   - Proves framework works at scale (69 episodes)
   - Catches issues in real-world production environment
   - Becomes reference implementation for documentation

2. **Clean Separation**
   - Framework development in framework repo
   - Production sites in their own repos
   - Planning docs archived with framework

3. **No Loss of History**
   - All git history preserved
   - Planning docs maintained for future reference
   - Context valuable for contributors

---

## Timeline & Phases

### **Current (Weeks 5-8): Keep Status Quo**

**podcast-website:**
- Strange Water production site (strangewater.xyz)
- Active planning docs in context/
- No changes to Strange Water code

**podcast-framework:**
- Active framework development
- Complete CLI tool (Weeks 5-7)
- Create template repository (Week 8)

**Action:** Continue development in framework repo, don't touch Strange Water

---

### **Week 8: Move Planning Docs**

**After template repository is created:**

1. **Create planning archive in framework repo:**
   ```
   podcast-framework/
   └── docs/
       └── planning/
           ├── README.md (story of how framework was planned)
           ├── templatization-plan-v2.1-FINAL.md
           ├── actual-feature-status.md
           ├── templatization-services-addendum.md
           └── archive/
               ├── v1.0/ (original plans)
               ├── v2.0/ (architecture fixes)
               └── reviews/ (code review feedback)
   ```

2. **Update podcast-website README:**
   ```markdown
   # Podcast Website (Deprecated)

   **This repository is deprecated.**

   Framework development has moved to: https://github.com/podcast-framework/podcast-framework

   Strange Water production site will migrate to framework-based deployment in Week 9.

   For planning documentation, see: podcast-framework/docs/planning/
   ```

3. **Copy context/ to framework repo:**
   ```bash
   # In podcast-framework/
   mkdir -p docs/planning
   cp -r ../podcast-website/context/tasks/active/* docs/planning/
   cp -r ../podcast-website/context/archive/templatization-planning-v1-v2 docs/planning/archive/
   ```

**Deliverable:** Planning docs preserved in framework repo, podcast-website marked as deprecated

---

### **Week 9: Deploy Strange Water with Framework** 🎯 **KEY MILESTONE**

**Goal:** Validate framework works for real production site

**Steps:**

1. **Create strange-water repository:**
   ```bash
   # Use template from Week 8
   # Click "Use this template" on podcast-template
   # Or: npx @podcast-framework/cli create strange-water
   ```

2. **Configure for Strange Water:**
   ```javascript
   // podcast.config.js
   export default {
     name: "Strange Water",
     tagline: "Explorations of technology, culture, and ideas",
     domain: "strangewater.xyz",
     sanity: {
       projectId: process.env.SANITY_PROJECT_ID, // Same Sanity project
       dataset: 'production'
     },
     theme: '@podcast-framework/theme-default',
     // ... Strange Water specific config
   }
   ```

3. **Import RSS feed:**
   ```bash
   # Use framework import scripts
   npx @podcast-framework/cli import-from-rss https://anchor.fm/s/.../podcast/rss
   ```

4. **Deploy to Cloudflare Pages:**
   ```bash
   # Connect to Cloudflare
   # Point to strange-water repo
   # Deploy
   ```

5. **Test thoroughly:**
   - All 69 episodes load correctly
   - Transcripts display
   - Search works
   - Newsletter signup functional
   - All features from current site work

6. **Update DNS:**
   ```
   strangewater.xyz → new Cloudflare deployment
   ```

7. **Monitor for issues:**
   - Check analytics
   - Monitor error logs
   - Verify all pages load
   - Test all interactive features

**Success Criteria:**
- ✅ All 69 episodes migrated
- ✅ All features working
- ✅ No production errors
- ✅ Performance same or better
- ✅ SEO maintained

**If Issues Found:**
- Fix in framework
- Update framework packages
- Redeploy Strange Water
- This validates update mechanism!

---

### **Week 10-11: Validate & Polish**

**Monitor Strange Water for 1-2 weeks:**
- Collect user feedback (if any)
- Monitor error logs
- Check analytics
- Fix any framework bugs discovered

**Update Framework:**
- Fix issues found in real-world usage
- Add features if gaps discovered
- Update documentation based on migration experience

**Document Migration:**
- Write migration guide based on Strange Water experience
- Document any gotchas
- Create "From Strange Water to Framework" case study

---

### **Week 11: Archive podcast-website Repo**

**After Strange Water successfully migrated:**

1. **Final README in podcast-website:**
   ```markdown
   # Podcast Website (ARCHIVED)

   This repository is archived. Development has moved:

   **Framework:** https://github.com/podcast-framework/podcast-framework
   **Strange Water:** https://github.com/podcast-framework/strange-water (or your-org)

   This repo preserves the original Strange Water implementation that became
   the foundation for the Podcast Framework.

   **Historical Value:**
   - Shows evolution from single site to framework
   - Planning docs: See podcast-framework/docs/planning/
   - Git history: All 20+ sessions preserved

   Last updated: 2025-XX-XX
   Status: Read-only archive
   ```

2. **Archive on GitHub:**
   - Settings → Archive this repository
   - Or: Mark as read-only in description
   - Keep public (shows your work process)

3. **Update external links:**
   - Portfolio
   - Resume
   - Social media
   - Point to podcast-framework and strange-water

---

## 📁 Final Repository Structure

**After Week 11:**

```
podcast-framework/        (Active development)
├── packages/
│   ├── core/
│   ├── cli/
│   └── sanity-schema/
├── examples/
│   └── basic/
├── docs/
│   └── planning/        (Archived planning docs from podcast-website)
└── context/             (Active framework context)

strange-water/           (Production site using framework)
├── src/
│   └── components/      (Custom overrides if any)
├── public/
├── sanity.config.ts     (Extends base schemas)
├── podcast.config.js    (Strange Water config)
└── astro.config.mjs

podcast-website/         (ARCHIVED - Read-only)
├── [All original code preserved]
└── README.md            (Points to new repos)
```

---

## 🎯 Decision Log

**D28: Repository Migration Strategy**
- **Date:** 2025-10-14 (Session 20)
- **Decision:** Strange Water will migrate to use framework packages in Week 9
- **Rationale:**
  - Validates framework in production before public launch
  - Tests migration process with real data (69 episodes)
  - Strange Water becomes reference implementation
  - Catches framework bugs in real-world usage
- **Timeline:**
  - Weeks 5-8: Complete framework
  - Week 9: Migrate Strange Water
  - Week 10-11: Validate and polish
  - Week 11: Archive podcast-website
- **Planning Docs:** Move to podcast-framework/docs/planning/ in Week 8-9
- **Impact:** De-risks framework launch, proves concept works

---

## ✅ Validation Checklist

**Before Migrating Strange Water (Week 9):**
- [ ] Framework CLI `create` command working
- [ ] Template repository functional
- [ ] RSS import script working
- [ ] All 8 components tested in example podcast
- [ ] Build and deployment documented
- [ ] Migration guide drafted

**After Migration (Week 10):**
- [ ] All 69 episodes migrated successfully
- [ ] All features working (transcripts, search, newsletter)
- [ ] Performance acceptable (build time, page load)
- [ ] SEO maintained (Google rankings)
- [ ] No production errors
- [ ] Analytics working

**Success Criteria:**
- Strange Water on strangewater.xyz using framework
- All features functional
- Can update framework packages without breaking
- Migration took <8 hours (validates abstraction)

---

## 📝 Benefits of This Approach

1. **De-risks Launch** - Find bugs with your own site, not users' sites
2. **Validates Architecture** - Real 69-episode test, not toy example
3. **Provides Case Study** - "We built Strange Water with it" is compelling
4. **Tests Update Mechanism** - Can update framework, redeploy Strange Water
5. **Creates Reference** - Other podcasts can see Strange Water as example

---

## 🤔 Contingency Plans

**If Strange Water Migration Uncovers Major Issues:**
- Fix framework
- Keep Strange Water on old codebase temporarily
- Delay public launch until issues resolved
- Better to find now than after public launch!

**If Migration Takes Longer Than Expected:**
- Extend timeline (Week 9 → Week 10-11)
- Document additional complexity
- Update framework to simplify migration

---

## Next Steps

**Immediate:**
- Continue framework development (Weeks 5-8)
- Keep this strategy doc updated

**Week 8:**
- Move planning docs to framework repo
- Update podcast-website README

**Week 9:**
- Execute Strange Water migration
- Validate thoroughly

**Week 11:**
- Archive podcast-website
- Public framework launch!

---

**Strategy Confirmed:** ✅
**Documented:** repository-migration-strategy.md
**Next Review:** Week 8 (before migration)
