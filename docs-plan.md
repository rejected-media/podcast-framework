# Documentation Site Plan

**Framework:** Podcast Framework
**Documentation Tool:** Astro Starlight
**Repository:** podcast-framework-docs
**Target:** Week 10-11 deliverable

---

## 1. Framework Choice: Astro Starlight

**Why Astro Starlight:**
- Built on Astro (same tech stack as framework)
- Purpose-built for documentation
- Built-in features: search, navigation, dark mode, mobile responsive
- Excellent DX with MDX support
- Fast builds and performance
- Easy deployment to Cloudflare Pages

**Alternatives Considered:**
- VitePress: Great, but Vue-based (different tech stack)
- Docusaurus: Excellent, but React-based (different tech stack)
- MkDocs: Python-based (different tech stack)

**Decision:** Astro Starlight - Same tech stack, purpose-built, excellent DX

---

## 2. Documentation Structure

### 2.1 Getting Started
- **Overview** - What is Podcast Framework?
- **Quick Start** - 5-minute tutorial to create first podcast site
- **Installation** - Detailed setup instructions
- **Project Structure** - Understanding the framework
- **Configuration** - Environment variables and settings

### 2.2 Components
- **Overview** - Component system explanation
- **Header** - Navigation header with mobile menu
- **Footer** - Site footer with social links
- **NewsletterSignup** - Email subscription form
- **EpisodeSearch** - Client-side episode search
- **TranscriptViewer** - Collapsible transcript viewer
- **FeaturedEpisodesCarousel** - Auto-progressing carousel
- **SkeletonLoader** - Loading placeholders
- **BlockContent** - Sanity portable text renderer

### 2.3 API Reference
- **Utilities** - formatDate, slugify, truncate, etc.
- **Theme System** - Theme utilities and configuration
- **Sanity Helpers** - getEpisodes, getPodcast, etc.
- **Static Paths** - getStaticPathsForEpisodes, etc.
- **Hosting Adapter** - Platform abstraction layer
- **Server Services** - ContributionService, NewsletterService

### 2.4 Customization
- **Component Overrides** - How to customize framework components
- **Theming** - CMS-driven theme system
- **Schema Extensions** - Extending Sanity schemas
- **Adding Custom Sections** - Homepage and about page customization
- **Creating Custom Components** - Build your own components

### 2.5 Sanity CMS
- **Setup** - Creating Sanity project
- **Schemas** - Episode, Guest, Host, Podcast, Contribution
- **Content Management** - Adding episodes, guests, etc.
- **Theme Configuration** - Configuring colors and fonts
- **Homepage Configuration** - Configuring homepage sections
- **About Page Configuration** - Configuring about page sections

### 2.6 Deployment
- **Cloudflare Pages** - Recommended deployment
- **Netlify** - Alternative deployment
- **Vercel** - Alternative deployment
- **Environment Variables** - Production configuration
- **Domain Setup** - Custom domains
- **CI/CD** - Automated deployments

### 2.7 Advanced
- **CLI Tool** - Using @podcast-framework/cli
- **Migration Guide** - Migrating existing podcast sites
- **TypeScript** - Type safety and custom types
- **Testing** - Testing your podcast site
- **Performance** - Optimization techniques

### 2.8 Examples
- **Basic Podcast** - Minimal setup
- **Custom Theme** - Branded podcast site
- **Extended Schema** - Adding custom fields
- **Custom Components** - Building custom components
- **Multi-host Podcast** - Handling multiple hosts

### 2.9 Contributing
- **Development Setup** - Working on the framework
- **Contributing Guidelines** - How to contribute
- **Roadmap** - Future plans
- **Changelog** - Version history

---

## 3. Content Priority

**Phase 1 (Week 10 - Core Documentation):**
1. ✅ Getting Started (Overview, Quick Start, Installation)
2. ✅ Components (Overview + all 8 components)
3. ✅ API Reference (Utilities, Theme, Sanity Helpers)
4. ✅ Sanity CMS (Setup, Schemas, Content Management)
5. ✅ Deployment (Cloudflare Pages, Environment Variables)

**Phase 2 (Week 11 - Advanced Documentation):**
6. ✅ Customization (Overrides, Theming, Schema Extensions)
7. ✅ Advanced (CLI Tool, Migration Guide, TypeScript)
8. ✅ Examples (Basic, Custom Theme, Extended Schema)
9. ✅ Contributing (Development Setup, Guidelines)

---

## 4. Repository Setup

**Repository Name:** podcast-framework-docs
**GitHub:** https://github.com/podcast-framework/podcast-framework-docs
**Deployment:** Cloudflare Pages
**URL:** https://docs.podcastframework.dev (or similar)

**Structure:**
```
podcast-framework-docs/
├── src/
│   ├── content/
│   │   ├── docs/
│   │   │   ├── getting-started/
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── customization/
│   │   │   ├── sanity/
│   │   │   ├── deployment/
│   │   │   ├── advanced/
│   │   │   ├── examples/
│   │   │   └── contributing/
│   │   └── config.ts
│   └── pages/
│       └── index.astro
├── public/
│   └── assets/
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Deployment Strategy

**Primary:** Cloudflare Pages
- Fast global CDN
- Free tier is generous
- Same platform as podcast sites
- Automatic deployments from GitHub

**Setup:**
1. Create Cloudflare Pages project
2. Connect to GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Node version: 18+
4. Add custom domain (docs.podcastframework.dev)

---

## 6. Documentation Standards

**Tone:**
- Clear and concise
- Friendly but professional
- Actionable (lots of examples)
- Beginner-friendly with advanced sections

**Format:**
- MDX files for content
- Code examples for every concept
- Screenshots/diagrams where helpful
- Links to related sections
- Callouts for important notes

**Code Examples:**
- Use TypeScript
- Show both framework and user code
- Include file paths as comments
- Show expected output
- Test all examples before publishing

---

## 7. Implementation Steps

**Step 1: Setup (1-2 hours)**
- [ ] Create podcast-framework-docs repository
- [ ] Initialize Astro Starlight project
- [ ] Configure navigation structure
- [ ] Set up deployment to Cloudflare Pages
- [ ] Create placeholder pages

**Step 2: Core Documentation (4-6 hours)**
- [ ] Write Getting Started section
- [ ] Write Component Reference
- [ ] Write API Reference
- [ ] Write Sanity CMS section
- [ ] Write Deployment guides

**Step 3: Advanced Documentation (3-4 hours)**
- [ ] Write Customization guides
- [ ] Write Advanced topics
- [ ] Create Examples
- [ ] Write Contributing guide

**Step 4: Polish (1-2 hours)**
- [ ] Review all content for accuracy
- [ ] Test all code examples
- [ ] Add screenshots and diagrams
- [ ] SEO optimization (meta tags, descriptions)
- [ ] Launch announcement

**Total Time Estimate:** 10-15 hours (Week 10-11 scope)

---

## 8. Success Criteria

- [ ] All core features documented
- [ ] Working code examples for every major concept
- [ ] Quick Start guide gets user to working site in <10 minutes
- [ ] Component documentation includes all 8 components
- [ ] API reference covers all exported functions
- [ ] Deployment guide for all 3 platforms (Cloudflare, Netlify, Vercel)
- [ ] Site is deployed and accessible
- [ ] Search functionality works
- [ ] Mobile responsive
- [ ] Dark mode available

---

## 9. Next Actions

1. **Now:** Create podcast-framework-docs repository
2. **Then:** Initialize Astro Starlight
3. **Then:** Start writing Getting Started guide
