# Podcast Framework

**Status:** 🚧 In Development (Phase 1)

A production-ready, NPM-based framework for creating beautiful podcast websites with Astro and Sanity CMS.

---

## 🎯 Project Status

**Current Phase:** Phase 1 - Foundation (Weeks 1-2)
**Week 0:** ✅ Complete (NPM org, GitHub org, tokens configured)
**Week 1:** 🔄 In Progress (Monorepo setup)

---

## 📦 Packages

This monorepo contains:

- **[@podcast-framework/core](./packages/core)** - Core components, layouts, and utilities
- **[@podcast-framework/cli](./packages/cli)** - CLI tool for scaffolding and management
- **[@podcast-framework/sanity-schema](./packages/sanity-schema)** - Base CMS schemas with extension support

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

- [x] **Week 0:** Prerequisites (NPM org, GitHub org, tokens)
- [ ] **Week 1-2:** Core extraction and component resolver
- [ ] **Week 3:** Schema system
- [ ] **Week 4-7:** CLI tool
- [ ] **Week 8:** Template repository
- [ ] **Week 9-10:** Documentation site
- [ ] **Week 11:** Testing & validation
- [ ] **Week 12:** Launch preparation
- [ ] **Week 13-14:** Beta launch

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 Credits

Built by [Rex Kirshner](https://github.com/rexkirshner) with [Claude](https://claude.ai)

Based on the [Strange Water](https://strangewater.xyz) podcast framework.
