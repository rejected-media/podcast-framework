# Podcast Framework

**Status:** 🚧 In Development (Phase 1)

A production-ready, NPM-based framework for creating beautiful podcast websites with Astro and Sanity CMS.

---

## 🎯 Project Status

**Current Phase:** Phase 1 - Foundation (Weeks 1-2)
**Week 0:** ✅ Complete (NPM org, GitHub org, tokens configured)
**Week 1:** ✅ Complete (8 components, resolver, theme, utilities)
**Week 2:** 🔄 In Progress (Sanity utilities, hosting adapter, comprehensive tests)

---

## 📦 Packages

This monorepo contains:

- **[@podcast-framework/core](./packages/core)** - Core components, layouts, and utilities ✅ **Ready**
  - 8 production-tested components
  - Component resolver (bundler-safe)
  - Theme system with validation
  - Sanity CMS utilities
  - Hosting platform adapter
  - 73 tests passing

- **[@podcast-framework/cli](./packages/cli)** - CLI tool for scaffolding and management ⏳ **Coming Week 4**

- **[@podcast-framework/sanity-schema](./packages/sanity-schema)** - Base CMS schemas ⏳ **Coming Week 3**

---

## ✨ Current Features (@podcast-framework/core@0.1.0)

### Components (8)
- ✅ Header - Navigation with mobile menu
- ✅ Footer - Social links and newsletter
- ✅ NewsletterSignup - Email form with spam protection
- ✅ EpisodeSearch - Client-side fuzzy search
- ✅ TranscriptViewer - Collapsible, searchable transcripts
- ✅ FeaturedEpisodesCarousel - Auto-progressing carousel
- ✅ SkeletonLoader - Loading states (4 variants)
- ✅ BlockContent - Sanity portable text renderer

### Infrastructure
- ✅ Component resolver (bundler-safe with import.meta.glob)
- ✅ Theme system (CSS variables with injection prevention)
- ✅ Sanity CMS utilities (client, queries, caching)
- ✅ Hosting adapter (Cloudflare/Netlify/Vercel support)
- ✅ Utility functions (formatDate, stripHTML, slugify, etc.)
- ✅ TypeScript types (Episode, Guest, Theme, etc.)
- ✅ Build pipeline (tsup + declarations)

### Quality
- ✅ 73 tests passing
- ✅ TypeScript strict mode
- ✅ Input validation
- ✅ Security hardened (XSS, CSS injection prevention)
- ✅ ESLint configured
- ✅ CI/CD ready (GitHub Actions)

---

## 🏗️ Architecture

**Pattern:** NPM Package
- Framework published to npm
- Podcasts consume as dependencies
- Updates via `npm update` or CLI

**Component Overrides:** Hybrid approach
- Auto-resolution (simple global overrides)
- Slot-based (per-page customization)

**Schema Strategy:** Extensible base schemas
- Versioned schema packages
- Podcasts extend with custom fields
- Manual migrations for breaking changes

---

## 🚀 Quick Start (After v1.0 Launch)

```bash
# Create new podcast
npx @podcast-framework/cli create my-podcast

# Deploy
cd my-podcast
npm run deploy
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/podcast-framework/podcast-framework.git
cd podcast-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

### Workspace Commands

```bash
# Run command in specific package
npm run dev --workspace=packages/core

# Build all packages
npm run build:packages

# Test all packages
npm run test
```

---

## 📖 Documentation

- **Plan:** [templatization-plan-v2.1-FINAL.md](https://github.com/rexkirshner/podcast-website/blob/main/context/tasks/active/templatization-plan-v2.1-FINAL.md)
- **Docs Site:** Coming in Phase 5 (Weeks 9-10)

---

## 🗺️ Roadmap

- [x] **Week 0:** Prerequisites (NPM org, GitHub org, tokens) ✅
- [x] **Week 1:** Core components extraction ✅ (8 components, resolver, theme)
- [x] **Week 2:** Complete utilities extraction ✅ (Sanity, hosting adapter)
- [x] **Week 3:** Schema system ✅ (5 schemas with extensions)
- [x] **Week 4-7:** CLI tool ✅ (10 commands, 18 tests)
- [ ] **Week 8:** Template repository 🔄
- [ ] **Week 9-10:** Documentation site
- [ ] **Week 11:** Testing & validation
- [ ] **Week 12:** Launch preparation
- [ ] **Week 13-14:** Beta launch

**Current Week:** Week 7 Complete (CLI tool done!)
**Progress:** 50% complete (7 of 14 weeks)
**Timeline:** On track for 12-14 week beta launch

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 Credits

Built by [Rex Kirshner](https://github.com/rexkirshner) with [Claude](https://claude.ai)

Based on the [Strange Water](https://strangewater.xyz) podcast framework.
