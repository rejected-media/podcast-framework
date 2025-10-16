# Product Requirements Document (PRD)
## Podcast Website Framework

**Document Version:** 1.1
**Last Updated:** 2025-10-06
**Status:** Approved for Development (Phase 2 Updated)

---

## 1. Executive Summary

This PRD outlines the development of a **reusable podcast website framework** to replace the current Strange Water podcast site (strangewater.xyz) hosted on PodcastPage.io. The framework will be deployed first for Strange Water (69 episodes, completed/archival series), then reused for future podcasts with customized branding and features.

### 1.1 Dual Goals

1. **Immediate:** Launch performant, SEO-optimized Strange Water site (archival/marketing property)
2. **Strategic:** Build reusable framework/template enabling rapid deployment of future podcast websites

**Learning Feedback Loop:** Strange Water rollout serves as production validation for the framework. All architecture decisions, content workflows, and deployment processes will be documented and abstracted into the template for future shows.

### 1.2 Development Methodology

**Iterative, Small-Step Approach:**
- ✅ Vertical slices (episode page working end-to-end) over horizontal layers (all pages scaffolded)
- ✅ Deploy continuously from Day 1 (staging), not waiting for "done"
- ✅ Smallest possible increments (half-day tasks, not week-long tasks)
- ✅ Each increment is testable, demonstrable, shippable
- ✅ Refactor as we learn, don't over-engineer upfront

**Anti-Patterns to Avoid:**
- ❌ Building all components before wiring them together
- ❌ Waiting weeks before first deploy
- ❌ Large PRs that change 50 files
- ❌ "It'll all come together in Week 4"

### 1.3 Primary Audience Segments & Business Goals

| Segment | Needs | Business Goals |
|---------|-------|----------------|
| **Listeners** | Discover episodes, consume content, subscribe | ↑ Organic traffic, ↑ session duration, ↑ platform subscriptions |
| **Prospective Guests** | Learn about show, assess fit, submit pitch | ↑ High-quality guest applications, ↓ outreach effort |
| **Partners/Sponsors** | Validate audience, assess brand alignment | ↑ Sponsorship inquiries, ↑ Patreon conversions |
| **Content Operators** | Publish episodes efficiently, update content | ↓ Time to publish, ↓ technical friction, ↑ content quality |

### 1.4 Out of Scope (Phase 1)

- ❌ Paid membership/premium content tiers
- ❌ Community forums or user-generated content (beyond forms)
- ❌ Advanced analytics dashboard (custom reporting)
- ❌ Mobile apps (native iOS/Android)
- ❌ Live streaming or real-time episode publishing
- ❌ Podcast hosting (RSS generation, audio distribution)

### 1.5 Framework Reusability KPIs

- ⏱ **Time to Deploy New Podcast:** <4 hours from zero to production-ready
- 🎨 **Branding Customization Effort:** <2 hours (colors, fonts, logos, copy)
- ✅ **Launch Checklist Completion:** 100% automated checks (SEO, performance, accessibility)
- 📊 **Content Migration Speed:** <1 hour per 50 episodes (scripted import)

---

## 2. Background & Current State

### 2.1 Current Site Analysis (strangewater.xyz)

**Strengths:**
- Clean, modern design
- Comprehensive guest profiles with images
- Multiple platform subscription options
- Responsive mobile layout
- Good episode metadata display

**Limitations:**
- Paid service ($) with limited flexibility
- Performance constraints
- Cannot customize features
- No control over hosting/infrastructure
- Limited monetization options
- No analytics access or customization

**Current URL Structure (to preserve via redirects):**
- Homepage: `/`
- Episodes: `/episodes`
- Individual Episode: `/episode/[slug]`
- Guests: `/guests`
- Individual Guest: `/person/[slug]`
- About: `/about`

### 2.2 User Context

- **Site Owner:** High technical proficiency (can manage complex systems)
- **Future Operators:** Entry-level/junior staff (non-technical content coordinators)
- **Strange Water Status:** 69 episodes, ceased production (archival site)
- **Future Podcasts:** Active production, require growth/engagement features

---

## 3. Personas & Content Operations

### 3.1 Core Personas

#### **Persona 1: Host/Producer (Rex)**
- **Technical Level:** High
- **Responsibilities:** Content strategy, guest coordination, final approval
- **Needs:** Quick publishing, performance metrics, brand control
- **Pain Points:** Time-consuming manual processes, limited monetization options
- **Success Metrics:** <10 min episode publishing time, real-time analytics access

#### **Persona 2: Content Coordinator (Future Hire)**
- **Technical Level:** Low (familiar with web forms, basic CMS)
- **Responsibilities:** Episode uploads, show notes formatting, social media prep
- **Needs:** Intuitive CMS, clear workflows, error prevention
- **Pain Points:** Complex interfaces, unclear publishing steps, missing asset specs
- **Success Metrics:** Zero publishing errors, <30 min training time

#### **Persona 3: Guest Contributor**
- **Technical Level:** Variable
- **Responsibilities:** Provide bio, headshot, social links
- **Needs:** Simple submission form, clear asset requirements
- **Pain Points:** Unclear expectations, multiple back-and-forth communications
- **Success Metrics:** One-touch guest info collection

### 3.2 Editorial Workflow (Sanity CMS)

```
[Draft] → [Ready for Review] → [Scheduled] → [Published] → [Archived]
```

**Roles & Permissions:**
- **Administrator** (Host/Producer): Full access, publish/unpublish, delete, configure
- **Editor** (Content Coordinator): Create, edit, schedule, cannot delete or configure
- **Contributor** (Guest): Submit guest info only, cannot publish

**Publishing Workflow:**
1. Content Coordinator creates episode draft in Sanity
2. Uploads audio URL from podcast host (Spotify/RSS.com)
3. Formats show notes using rich text editor
4. Adds guest references, metadata (date, duration, episode #)
5. Marks as "Ready for Review"
6. Host/Producer reviews, approves, publishes
7. Sanity webhook triggers Netlify rebuild (~3-5 min)
8. Site updates with new episode

**Scheduled Publishing:**
- **Phase 1 (MVP):** Manual publish only - editors mark as "Scheduled" but must manually publish at scheduled time
- **Phase 2:** Implement Sanity Scheduled Publishing plugin - automates timed releases via scheduled webhook triggers

### 3.3 Content Governance

**Naming Conventions:**
- Episodes: `[Episode ###] - [Guest Name] - [Topic]` (e.g., "Episode 042 - Vitalik Buterin - Ethereum's Future")
- Guest slugs: `firstname-lastname` (lowercase, hyphens)
- Image files: `ep###-[descriptor].jpg` (e.g., `ep042-vitalik-headshot.jpg`)

**Metadata Completeness Requirements:**
- ✅ Title, episode number, publish date (required)
- ✅ Audio URL, duration (required)
- ✅ Show notes (minimum 100 words)
- ✅ At least 1 guest or host attribution
- ✅ Featured image (1200x630px minimum)
- ⚠️ Transcript (optional for MVP, recommended for SEO)

**Asset Specifications:**
- **Episode Artwork:** 3000x3000px JPG/PNG, <500KB
- **Guest Photos:** 800x800px JPG/PNG, <200KB
- **Social Sharing Images:** 1200x630px JPG/PNG, <300KB
- **Logo Files:** SVG preferred, PNG fallback (transparent background)

**Ongoing Maintenance:**
- **Monthly:** Link rot checks, Search Console review, analytics review
- **Quarterly:** SEO audit, accessibility check, dependency updates, performance benchmarking
- **Annually:** Content refresh, design refresh, competitive analysis

---

## 4. Project Structure & Organization Strategy

### 4.1 Repository Strategy

**Approach: Single Template Repository**

We will use a **single template repository** model where:
- The repo starts as Strange Water-specific (Phase 1)
- Gets progressively abstracted into a template (Phase 2)
- Serves as the source for new podcast instances (Phase 3)

**Why this approach:**
- ✅ Simple to start (no premature abstraction)
- ✅ Learn from real production use case (Strange Water)
- ✅ Natural evolution from specific → generic
- ✅ Standard pattern (like create-react-app, Next.js starters)

### 4.2 Evolution Strategy: Instance → Template → Instances

```
Phase 1 (Weeks 1-4):
┌─────────────────────────────────┐
│   podcast-framework (repo)      │
│   ├── Strange Water specific    │
│   ├── Configurable branding*    │
│   └── Single Sanity project     │
└─────────────────────────────────┘
   *Config layer added Day 6

Phase 2 (Weeks 5-8):
┌─────────────────────────────────┐
│   podcast-framework (repo)      │
│   ├── Fully abstracted config   │
│   ├── Generic components        │
│   ├── Documentation added       │
│   └── Still running SW          │
└─────────────────────────────────┘

Phase 3 (Weeks 9-12):
┌─────────────────────────────────┐
│   podcast-framework (template)  │ ← Source of truth
│   ├── Generic codebase          │
│   ├── Example configs           │
│   └── CLI scaffold tool         │
└─────────────────────────────────┘
        │
        ├─── Clone/Fork ───┐
        │                  │
        ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Strange Water│   │ New Podcast  │
│ (instance)   │   │ (instance)   │
└──────────────┘   └──────────────┘
```

**Instance Management:**
- Each podcast is a **separate repository** (forked/cloned from template)
- **Each podcast gets its own Sanity project** (separate project IDs, datasets, permissions, billing)
  - Cleaner permission management (no cross-contamination)
  - Isolated content (no risk of cross-site data leakage)
  - Independent scaling (each project has own API limits)
  - Simpler webhook routing (one project → one Netlify site)
- Instances are **independent** after creation (no git connection to template)
- Updates propagated via **manual merge** or **CLI tool** (Phase 3+)

### 4.3 File Structure (Annotated)

```
podcast-framework/
│
├── src/                                    # [FRAMEWORK] Astro application
│   ├── components/                         # [FRAMEWORK] Shared UI components
│   │   ├── EpisodeCard.astro              # Episode list item
│   │   ├── GuestProfile.astro             # Guest card/profile display
│   │   ├── AudioPlayer.astro              # Audio embed wrapper
│   │   ├── Header.astro                   # Site header (uses config)
│   │   ├── Footer.astro                   # Site footer (uses config)
│   │   ├── SEO.astro                      # Meta tags, Schema.org markup
│   │   ├── SubscribeCTA.astro             # Subscribe button component
│   │   └── PatreonWidget.astro            # Patreon support widget
│   │
│   ├── layouts/                            # [FRAMEWORK] Page layouts
│   │   ├── BaseLayout.astro               # Global layout (header, footer)
│   │   ├── EpisodeLayout.astro            # Episode page template
│   │   ├── GuestLayout.astro              # Guest page template
│   │   └── PageLayout.astro               # Generic page template
│   │
│   ├── pages/                              # [FRAMEWORK] Routes (Astro file-based routing)
│   │   ├── index.astro                    # Homepage
│   │   ├── about.astro                    # About page (content from Sanity)
│   │   ├── episodes/
│   │   │   ├── index.astro                # Episodes archive
│   │   │   └── [slug].astro               # Individual episode page
│   │   ├── guests/
│   │   │   ├── index.astro                # Guest directory
│   │   │   └── [slug].astro               # Individual guest page
│   │   └── 404.astro                      # Custom 404 page
│   │
│   ├── lib/                                # [FRAMEWORK] Utilities & helpers
│   │   ├── sanity.ts                      # Sanity client, queries (uses env vars)
│   │   ├── config.ts                      # Load & validate config/theme.json
│   │   ├── seo.ts                         # SEO helpers (meta tags, schema)
│   │   ├── analytics.ts                   # Analytics abstraction (GA4, Plausible)
│   │   └── utils.ts                       # Date formatting, string utils
│   │
│   ├── styles/                             # [FRAMEWORK] Global styles
│   │   ├── global.css                     # Base styles, CSS reset
│   │   └── theme.css                      # CSS variables (from config/theme.json)
│   │
│   └── env.d.ts                            # TypeScript environment types
│
├── config/                                 # [INSTANCE] Podcast-specific configuration
│   ├── theme.json                         # Colors, fonts, branding
│   ├── site.json                          # Site metadata (name, URL, description)
│   └── features.json                      # Feature flags (newsletter, comments, etc.)
│
├── public/                                 # [INSTANCE] Static assets (podcast-specific)
│   ├── assets/
│   │   ├── logo.svg                       # Podcast logo
│   │   ├── logo.png                       # Logo fallback
│   │   ├── favicon.ico                    # Favicon
│   │   └── og-image.jpg                   # Default social sharing image
│   ├── robots.txt                         # [INSTANCE] Sitemap URL
│   └── _redirects                         # [INSTANCE] Netlify redirects (optional)
│
├── sanity/                                 # Sanity Studio
│   ├── schemas/                            # [FRAMEWORK] Content models
│   │   ├── podcast.ts                     # Podcast info schema
│   │   ├── episode.ts                     # Episode schema
│   │   ├── guest.ts                       # Guest schema
│   │   ├── page.ts                        # Generic page schema
│   │   └── index.ts                       # Schema registry
│   │
│   ├── config/                             # [INSTANCE] Sanity project config
│   │   └── sanity.config.ts               # Project ID, dataset, API version
│   │
│   ├── plugins/                            # [FRAMEWORK] Custom Sanity plugins (optional)
│   └── static/                             # Sanity Studio assets
│
├── scripts/                                # [INSTANCE/FRAMEWORK] Migration & utility scripts
│   ├── migrate-strangewater.js            # [INSTANCE] Strange Water migration
│   ├── import-from-rss.js                 # [FRAMEWORK] Generic RSS import
│   ├── validate-content.js                # [FRAMEWORK] Content validation
│   └── backup-sanity.js                   # [FRAMEWORK] Automated backup script
│
├── docs/                                   # [FRAMEWORK] Documentation
│   ├── SETUP.md                           # New instance setup guide
│   ├── CUSTOMIZATION.md                   # Branding & theming guide
│   ├── CONTENT_MIGRATION.md               # Import episode data
│   ├── DEPLOYMENT.md                      # Hosting & domain setup
│   └── ARCHITECTURE.md                    # Technical architecture overview
│
├── .env.example                            # [FRAMEWORK] Environment variable template
├── .gitignore                              # [FRAMEWORK] Git ignore rules
├── netlify.toml                            # [INSTANCE] Netlify configuration
├── package.json                            # [FRAMEWORK] Dependencies & scripts
├── tsconfig.json                           # [FRAMEWORK] TypeScript configuration
├── astro.config.mjs                        # [FRAMEWORK] Astro configuration
├── tailwind.config.cjs                     # [FRAMEWORK] Tailwind CSS config
├── CHANGELOG.md                            # [FRAMEWORK] Version history
├── LICENSE                                 # [FRAMEWORK] MIT License
└── README.md                               # [FRAMEWORK] Project overview
```

### 4.4 Configuration-Driven Customization

**Core Principle:** All podcast-specific data lives in **config files** or **Sanity CMS**, never hardcoded in components.

**Example: Header Component**

❌ **Bad (Hardcoded):**
```astro
<!-- src/components/Header.astro -->
<header>
  <img src="/assets/logo.svg" alt="Strange Water" />
  <h1 style="color: #1a73e8">Strange Water Podcast</h1>
</header>
```

✅ **Good (Config-Driven):**
```astro
<!-- src/components/Header.astro -->
---
import { getConfig } from '@/lib/config';
const { podcast, branding } = getConfig();
---
<header>
  <img src={branding.logo.svg} alt={podcast.name} />
  <h1 style={`color: ${branding.colors.primary}`}>{podcast.name}</h1>
</header>
```

**Config File (`config/theme.json`):**
```json
{
  "podcast": {
    "name": "Strange Water",
    "tagline": "Exploring Ethereum and Web3"
  },
  "branding": {
    "colors": {
      "primary": "#1a73e8"
    },
    "logo": {
      "svg": "/assets/logo.svg"
    }
  }
}
```

**For New Podcast:** Just update `config/theme.json`, zero code changes needed.

### 4.5 Creating a New Podcast Instance (Phase 3)

**Manual Process (Phase 1-2):**

1. **Clone Repository:** `git clone https://github.com/yourname/podcast-framework.git my-new-podcast`
2. **Update Configuration Files:** Edit `config/theme.json`, `config/site.json`, `config/features.json`
3. **Replace Assets:** Replace logo, favicon, OG image in `public/assets/`
4. **Configure Sanity:** Run `sanity init` to create **new Sanity project**, update project ID in config
5. **Configure Environment:** Copy `.env.example` to `.env`, fill in new Sanity project API keys
6. **Deploy:** Push to GitHub, connect to Netlify

**Time Estimate:** ~4 hours (matches KPI)

**Automated Setup Wizard (Phase 3):**

The setup wizard eliminates manual configuration through interactive CLI and web-based tools:

```bash
npm run create-podcast
```

**Wizard Steps:**

1. **Basic Information**
   - Podcast name, tagline, description
   - Host name(s) and bio(s)
   - Podcast launch date and status (active/completed)

2. **Branding & Design**
   - Logo upload (auto-optimizes for web)
   - Primary brand color (hex code)
   - Accent color (hex code)
   - Font preferences (optional)
   - Generates: favicon, OG images, all size variants

3. **Technical Setup**
   - Creates new Sanity project via API
   - Generates and configures environment variables
   - Sets up Resend email domain and API keys
   - Configures analytics (Google Analytics 4, optional privacy-focused)
   - Error monitoring (Sentry) initialization

4. **Content Platform Integration**
   - Spotify podcast URL
   - Apple Podcasts URL
   - YouTube channel URL
   - RSS feed URL
   - Other platforms (Twitter/X, Patreon, etc.)

5. **Newsletter Setup** (Optional)
   - ConvertKit account connection
   - Form ID configuration
   - Auto-generates branded email template HTML
   - Copy-paste instructions for ConvertKit customization
   - Test email functionality

6. **Feature Configuration**
   - Enable/disable guest profiles
   - Enable/disable newsletter
   - Enable/disable community contributions
   - Enable/disable transcripts
   - Select audio player style

7. **Deployment**
   - Creates GitHub repository
   - Connects to Netlify
   - Configures build settings and environment variables
   - Sets up custom domain (DNS instructions)
   - Triggers first build

8. **Verification & Launch Checklist**
   - Runs automated checks (SEO, accessibility, performance)
   - Verifies all external integrations
   - Confirms email delivery
   - Tests forms and functions
   - Generates launch report

**Output:**
- Fully configured repository
- Live staging site
- Pre-configured CMS
- Setup documentation PDF
- **Time Estimate:** <1 hour (vs 4 hours manual)

---

## 5. Recommended Technical Architecture

### 5.1 Core Stack: **Astro + Sanity CMS + Netlify**

#### **Frontend Framework: Astro**
**Why Astro:**
- **SEO Excellence:** Pre-rendered HTML, perfect for content-heavy sites
- **Performance:** Minimal JavaScript shipped to client (faster Time to Interactive)
- **Content-First:** Built specifically for blogs, marketing, and content sites
- **Flexibility:** Supports React/Vue/Svelte components when needed
- **Developer Experience:** Simple, modern, great documentation

#### **CMS: Sanity.io**
**Why Sanity:**
- **Real-time Collaboration:** Built-in collaborative editing
- **Customizable Studio:** Tailor admin UI for podcast episodes
- **Developer-Friendly:** Portable content, GROQ query language
- **Free Tier:** Generous limits (100k API requests, 3 users)
- **Content Portability:** Export-friendly (mitigation against vendor lock-in)

#### **Hosting: Netlify**
**Why Netlify:**
- **Free Tier for Commercial Use:** Unlike Vercel, allows commercial sites on free tier
- **Generous Limits:** 300 build minutes/month, 100GB bandwidth/month
- **Framework Agnostic:** Not tied to specific framework (unlike Vercel/Next.js)
- **Features:** Forms, redirects, edge functions, instant rollbacks

#### **Additional Services:**
- **Transcription:** OpenAI Whisper API or Together AI ($0.0015/min audio)
- **Analytics:** Google Analytics 4 (required) + Plausible/Fathom (privacy-focused, optional)
- **Email Capture:** ConvertKit, Mailchimp, or Resend API
- **Audio Player:** Embed from podcast host (Spotify, RSS.com) or custom player (Plyr, Howler.js)
- **Error Monitoring:** Sentry (free tier: 5k events/month)

### 5.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Netlify CDN                               │
│  (Static HTML/CSS/JS, Images, Edge Functions, Redirects)    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro Site (SSG)                          │
│  - Pre-rendered pages (episodes, guests, homepage)           │
│  - Schema.org JSON-LD                                        │
│  - Optimized images (WebP, responsive)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────┐
             │             │
             ▼             ▼
┌──────────────────┐  ┌──────────────────────┐
│   Sanity CMS     │  │  External APIs       │
│  - Episode data  │  │  - Google Analytics  │
│  - Guest info    │  │  - Patreon           │
│  - Site config   │  │  - ConvertKit        │
│  - Rich text     │  │  - Podcast hosts     │
└────────┬─────────┘  └──────────────────────┘
         │
         │ Webhook on publish
         ▼
┌──────────────────────────────────────────────────────────────┐
│             Netlify Build Hook                               │
│  (Triggers rebuild when content published in Sanity)         │
└──────────────────────────────────────────────────────────────┘
```

**Build Flow:**
1. Content published in Sanity Studio
2. Sanity webhook triggers Netlify build hook
3. Netlify pulls latest content from Sanity API
4. Astro generates static HTML pages
5. Assets optimized, sitemap generated, robots.txt added
6. Deploy to Netlify CDN (~3-5 min total)

### 5.3 Environments & Deployment

| Environment | Purpose | Hosting | Domain | Branch |
|-------------|---------|---------|--------|--------|
| **Local** | Development | localhost:4321 | N/A | feature/* |
| **Staging** | Content preview, QA | Netlify branch deploy | `staging.strangewater.xyz` | `develop` |
| **Production** | Live site | Netlify | `strangewater.xyz` | `main` |

**Deployment Promotion:**
1. Feature branch → develop (staging auto-deploys)
2. QA approval on staging
3. develop → main (production auto-deploys)
4. Instant rollback available via Netlify UI (previous deploys cached)

**Git Push Permission Protocol** 🚨 **CRITICAL COST CONTROL**

**Rule:** Git push requires explicit user approval - NO EXCEPTIONS

**Why:**
- Every git push triggers Netlify build (~1-2 minutes)
- Netlify free tier: 300 build minutes/month (50% consumed in first week)
- Build quota exhaustion = downtime or unexpected costs
- User must control deployment timing

**Workflow:**
1. Complete work locally
2. Run build verification (`npm run build`)
3. Run tests (`npm test`)
4. Commit changes locally (`git commit`)
5. **STOP** - Do not push yet
6. Ask user: "Ready to push to GitHub? This will trigger a Netlify build. Do you approve?"
7. Wait for explicit confirmation ("yes", "push", "do it")
8. Only then: `git push`

**Important:**
- User instructions mentioning "push" are workflow descriptions, NOT permission
- "Save everything and push to github" = describing workflow, must still ask
- No shortcuts, no implied consent
- Git commit ≠ git push (commit is free, push costs build minutes)

---

## 6. Template & Theming Strategy

### 6.1 Configuration Layer

**Theme Configuration File** (`config/theme.json`):

```json
{
  "podcast": {
    "name": "Strange Water",
    "tagline": "Exploring Ethereum and Web3",
    "url": "https://strangewater.xyz"
  },
  "branding": {
    "colors": {
      "primary": "#1a73e8",
      "secondary": "#f57c00",
      "accent": "#00bfa5",
      "background": "#ffffff",
      "text": "#212121"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Lato",
      "fontWeights": {
        "normal": 400,
        "bold": 700
      }
    },
    "logo": {
      "svg": "/assets/logo.svg",
      "png": "/assets/logo.png",
      "favicon": "/assets/favicon.ico"
    },
    "socialSharing": {
      "defaultImage": "/assets/og-image.jpg"
    }
  },
  "layout": {
    "sidebar": false,
    "episodesPerPage": 12,
    "featuredEpisodesCount": 3
  },
  "features": {
    "newsletter": true,
    "comments": false,
    "transcripts": true,
    "darkMode": false
  },
  "monetization": {
    "patreonUrl": "https://patreon.com/strangewater",
    "subscribeLinks": [
      {
        "platform": "Spotify",
        "url": "https://open.spotify.com/show/xxx"
      },
      {
        "platform": "Apple Podcasts",
        "url": "https://podcasts.apple.com/us/podcast/xxx"
      },
      {
        "platform": "YouTube",
        "url": "https://youtube.com/@strangewater"
      }
    ]
  }
}
```

**Required Tokens:**
- Primary color (CTA buttons, links)
- Secondary color (headings, accents)
- Background/text colors (accessibility contrast validated)
- Logo files (SVG + PNG fallback)
- Podcast name, tagline, description

**Optional Overrides:**
- Custom fonts (Google Fonts or self-hosted)
- Sidebar vs. full-width layout
- Featured episodes count
- Feature flags (newsletter, comments, dark mode)
- Monetization URLs (Patreon, subscribe links)

---

## 7. Content & Data Migration

### 7.1 URL Mapping & Redirects

**Strange Water URL Structure (Old → New):**

```
https://strangewater.xyz/                          → https://strangewater.xyz/
https://strangewater.xyz/episodes                  → https://strangewater.xyz/episodes
https://strangewater.xyz/episode/[title-slug]      → https://strangewater.xyz/episodes/[title-slug]
https://strangewater.xyz/guests                    → https://strangewater.xyz/guests
https://strangewater.xyz/person/[name-slug]        → https://strangewater.xyz/guests/[name-slug]
https://strangewater.xyz/about                     → https://strangewater.xyz/about
```

**301 Redirect Rules** (`netlify.toml`):

```toml
[[redirects]]
  from = "/episode/*"
  to = "/episodes/:splat"
  status = 301

[[redirects]]
  from = "/person/*"
  to = "/guests/:splat"
  status = 301
```

### 7.2 Data Migration Strategy

**Data Sources:**
1. **Spotify for Podcasters:** Export episode metadata (CSV or API)
2. **strangewater.xyz Scrape:** Show notes, guest info (Puppeteer/Playwright script)
3. **Local Assets:** Episode artwork, guest photos (manual collection)

**Migration Script** (`scripts/migrate-strangewater.js`):

```javascript
// Pseudocode
1. Fetch Spotify episode list (RSS feed or API)
2. For each episode:
   a. Scrape show notes from old site
   b. Extract guest names, photos
   c. Download episode artwork
   d. Transform to Sanity schema
   e. Upload to Sanity via API
3. Generate validation report
```

**Data Validation Plan:**

**Acceptance Criteria:**
- ✅ All episode titles match source
- ✅ Audio URLs playable (automated HTTP check)
- ✅ Show notes minimum 50 words (warn if shorter)
- ✅ At least 1 guest or host attribution per episode
- ✅ Episode numbers sequential (1-69, no gaps)
- ✅ Images <500KB, dimensions ≥800x800px
- ✅ Publish dates match original site

**Fallback Behavior for Missing Data:**
- **Missing Guest Photos:** Use generic avatar with initials (dynamically generated)
- **Incomplete Show Notes:** Display episode title + audio player only, show "Show notes coming soon"
- **Broken Audio URLs:** Display error message, log to Sentry, send admin alert

---

## 8. Functional Requirements

### 8.1 MVP Features (Phase 1 - Strange Water Launch)

#### **Episode Management**
- Display episode list (reverse chronological, paginated 12 per page)
- Individual episode pages with: audio player, show notes, metadata, guest info, social share buttons
- Episode search/filter by title (client-side, fast)

#### **Guest Profiles**
- Guest directory page (grid layout with photos)
- Individual guest pages with: photo, bio, social links, episodes featuring guest

#### **Core Pages**
- Homepage: Latest episodes, featured content, subscribe CTAs
- About page: Podcast description, host info
- Episodes archive: Full episode list with pagination
- 404 error page (custom, branded, helpful links)

#### **Monetization & Growth (Phase 1 - Core Requirement)**

**Subscribe CTAs:**
- Homepage hero: Primary "Subscribe" button with dropdown (Spotify, Apple, YouTube, RSS)
- Episode pages: Floating subscribe bar (sticky, non-intrusive)
- Footer: Subscribe links with platform icons

**Patreon Integration:**
- Episode page sidebar: "Support on Patreon" widget with tier preview
- Homepage: Patreon CTA module (above-the-fold or hero section)

**Event Tracking (Google Analytics 4):**
- `subscribe_click` (platform, location on page)
- `patreon_click` (episode ID, location)
- `audio_play` (episode ID, timestamp)
- `social_share` (platform, episode ID)

#### **SEO Foundation**
- Schema.org markup (PodcastSeries, PodcastEpisode, Person)
- Meta tags (Open Graph, Twitter Cards)
- XML sitemap (auto-generated, submitted to Google)
- robots.txt (allow all, specify sitemap URL)
- Fast Core Web Vitals scores (LCP <2.5s, FID <100ms, CLS <0.1)

### 8.2 Phase 2: Complete Feature Set + Framework Templatization (Weeks 5-8)

> **Strategic Change (2025-10-06):** Build complete feature set FIRST, then templatize. This ensures Template v2.0.0 is feature-complete and tests "easy mode" deployment (config-only) rather than prematurely testing upgrade mechanisms.

#### **Phase 2a: Core Features (Weeks 5-6)**

**Guests Page:**
- `/guests` route with grid/list view of all guests
- Individual guest pages at `/guest/[slug]`
- Guest filtering/search functionality
- Linked from episode pages
- Linked from navigation header

**Featured Episodes Carousel:**
- Horizontal scrolling carousel on homepage
- Displays episodes marked as "featured" in Sanity
- Auto-scroll with manual navigation controls
- Responsive design (mobile swipe, desktop arrows)
- Episode cards with cover art, title, and guest info

**CMS-Driven Visual Styling:**
- Logo, brand colors, fonts managed in Sanity podcast schema
- About page content moved to Sanity (Portable Text)
- Host bio/info managed in Sanity
- Truly configuration-driven (no code changes for new podcasts)

**Enhanced About Page:**
- Dynamic content from Sanity (not hardcoded)
- Host information from CMS
- Show description from CMS
- Subscribe CTAs from podcast metadata

**Newsletter Capability Decision & Planning:**
- Review comprehensive newsletter implementation plan (context/tasks/newsletter-plan.md)
- Evaluate architecture: Hybrid approach (Sanity + ConvertKit)
- Assess security/compliance requirements (GDPR, CAN-SPAM, rate limiting, PII protection)
- Decide on Phase 2 implementation vs. Phase 3 deferral
- Decision factors: Active podcast requirement, deployment timeline, complexity (12-18 hours)

**Newsletter Implementation** (if approved for Phase 2):
- **Backend (4-6 hours):**
  - Create Sanity `subscriber` schema
  - Configure private Sanity dataset for PII protection
  - Build `/api/subscribe.ts` with Zod validation, rate limiting, CSRF protection
  - Build `/api/webhook/convertkit.ts` for bidirectional sync
  - Build `/api/unsubscribe.ts` for GDPR compliance
  - Create GDPR deletion script
- **Frontend (4-5 hours):**
  - Create reusable `NewsletterSignup.astro` component with accessibility (WCAG)
  - Add newsletter signup to homepage (conditional on `podcast.isActive`)
  - Create `/newsletter` page with FAQ and value proposition
  - Add footer signup form
- **ConvertKit Setup (2-3 hours):**
  - Configure account, forms, automation
  - Set up SPF/DKIM/DMARC for deliverability
  - Configure webhook for two-way sync
  - Create email templates (confirmation, episode notifications)
- **Testing & Monitoring (2-3 hours):**
  - Integration tests (success, errors, rate limits, validation)
  - End-to-end testing with screen reader
  - Configure Netlify/Sentry monitoring and alerts
- **Estimated Cost:** $0-9/month (ConvertKit free tier: 1,000 subscribers)
- **Success Criteria:** Email collection functional, double opt-in working, GDPR compliant, accessible

#### **Phase 2b: Framework Templatization (Week 7)**

**Template Preparation:**
- Environment variable extraction (`.env.example`)
- Hardcoded reference removal
- Template verification script (`npm run verify:template`)
- Deployment guide with security & time-tracking
- TEMPLATE_VERSION.json + CHANGELOG.md

**Success Criteria:**
- Zero hardcoded podcast-specific values
- <4 hour deployment time for new podcasts
- Config/content changes only (no code edits)

#### **Phase 2c: Podcast #2 Deployment (Week 8)**

**Real-World Validation:**
- Clone template repository
- Follow deployment guide
- Deploy second podcast to production
- Document pain points and improvements
- Validate <4h KPI

#### **Deferred to Phase 3: Advanced Features**

**Audience Interaction:**
- "Request an Episode" form (Netlify Forms → Airtable)
- "Ask a Question" submission
- Comments (Giscus via GitHub Discussions)

**Enhanced Discovery:**
- Topic/category tagging
- Related episodes algorithm
- Transcript search

**Content Enrichment:**
- Episode transcripts (Whisper API)
- Chapter markers in player
- Key takeaways/highlights

#### **Episode-Specific Player & Platform Links:**
- **Problem:** Currently using show-level Spotify embeds (shows latest episode, not current episode)
- **Solution:** Extract valid Spotify episode IDs via:
  - Spotify API integration (search by episode title + podcast name)
  - Expand shortened spoti.fi URLs from RSS descriptions
  - Manual entry for legacy episodes
- **Platform Links:** Direct episode links for:
  - Spotify (episode-specific, not show-level)
  - Apple Podcasts (episode-specific)
  - YouTube (if video episodes available)
  - RSS (direct MP3 link)
  - Other platforms (Overcast, Pocket Casts, etc.)
- **UX Improvement:** Replace generic "Subscribe" CTA with "Listen on:" dropdown showing episode-specific links
- **Framework Value:** Reusable across all future podcasts (better user experience, higher engagement)
- **Automation Requirement (Phase 2):** Automated platform link gathering script to replace manual CSV collection process
  - Parse RSS feed URLs for Spotify/Apple/YouTube episode links
  - Expand shortened URLs (spoti.fi, apple.co, youtu.be)
  - API integration with Spotify/Apple/YouTube to fetch episode-specific URLs
  - Auto-populate platform link fields in Sanity on import
  - **Impact:** Manual CSV collection took 1 hour for 69 episodes. Automation will save hours per new podcast deployment

### 8.3 Phase 3 Features (Weeks 9-12 - Future)

**🎯 Primary Deliverable: New Podcast Setup Wizard**

The automated setup wizard is the centerpiece of Phase 3, transforming podcast deployment from a 4-hour manual process to a <1-hour guided experience:

- **Interactive CLI tool** (`npm run create-podcast`)
- **8-step guided setup** covering all aspects of podcast configuration:
  1. Basic information (name, hosts, status)
  2. Branding & design (logo, colors, assets)
  3. Technical setup (Sanity, Resend, analytics, error monitoring)
  4. Content platform integration (Spotify, Apple, YouTube, RSS)
  5. Newsletter setup (ConvertKit connection, branded templates)
  6. Feature configuration (guests, contributions, transcripts)
  7. Deployment (GitHub, Netlify, domain, build)
  8. Verification & launch checklist (automated testing)
- **Auto-generates** all configuration files, environment variables, and assets
- **Creates infrastructure** (Sanity project, GitHub repo, Netlify site)
- **Validates setup** with automated checks (SEO, accessibility, performance)
- **Produces documentation** (setup PDF, launch report)

See **Section 4.5** for detailed wizard specifications.

**Additional Phase 3 Features:**

- Multi-language support (i18n via Astro's built-in `astro:i18n`)
- Premium content tiers (members-only episodes, locked via Patreon API)
- Advanced analytics dashboard (custom reporting, subscriber growth charts)
- Guest submission portal (guests upload own info, photos, bio)
- Automated social media clips/audiograms (Headliner or custom FFmpeg scripts)

---

## 9. SEO & Performance Strategy

### 9.1 SEO Requirements

**Technical SEO:**
- ✅ Schema.org markup (JSON-LD): PodcastSeries, PodcastEpisode, Person
- ✅ Unique meta titles/descriptions per page (template + dynamic data)
- ✅ Canonical URLs (prevent duplicate content)
- ✅ Open Graph + Twitter Cards (optimized social sharing)
- ✅ XML sitemap (auto-generated via Astro integration)
- ✅ robots.txt configuration (allow crawling, specify sitemap)

**Content SEO:**
- ✅ Keyword-optimized episode titles (front-load primary keywords)
- ✅ Descriptive URLs (e.g., `/episodes/vitalik-buterin-ethereum-future`)
- ✅ Alt text for all images (guest names, episode topics)
- ✅ Internal linking strategy (homepage → top episodes, episode → guest profiles, etc.)
- ✅ Transcripts (future: full-text search, keyword-rich content)

**SEO Monitoring Tools:**
- Google Search Console (weekly review)
- Ahrefs or SEMrush (keyword rankings, backlinks) - monthly check
- Screaming Frog (quarterly crawl audits)

### 9.2 Performance Targets

**Core Web Vitals:**
- **LCP** (Largest Contentful Paint): <2.5s (target: <1.5s)
- **FID** (First Input Delay): <100ms (target: <50ms)
- **CLS** (Cumulative Layout Shift): <0.1 (target: <0.05)

**Page Speed:**
- Lighthouse Performance score: >90 (target: >95)
- Time to Interactive: <3s (target: <2s)
- Total page size: <500KB excluding audio (target: <300KB)

**Optimization Tactics:**
- ✅ Image optimization (WebP + AVIF, responsive `srcset`, lazy loading)
- ✅ CDN for static assets (Netlify Edge or Cloudflare)
- ✅ Minimal third-party scripts (async/defer loading)
- ✅ Critical CSS inlining (above-the-fold styles)
- ✅ Font subsetting (only load needed characters)
- ✅ Audio player lazy-loaded (only when user scrolls to it)

---

## 10. Analytics, Instrumentation & Observability

### 10.1 Analytics Stack

**Primary: Google Analytics 4**

**Event Tracking Plan:**

| Event Name | Parameters | Purpose |
|------------|------------|---------|
| `page_view` | page_path, page_title | Default pageview tracking |
| `subscribe_click` | platform (spotify, apple), location | Measure subscription intent |
| `patreon_click` | episode_id, location | Measure monetization funnel |
| `audio_play` | episode_id, timestamp | Engagement metric |
| `audio_complete` | episode_id, duration | Listener retention |
| `social_share` | platform (twitter, linkedin), episode_id | Virality metric |
| `newsletter_signup` | source (homepage, episode_page) | Email list growth |
| `episode_search` | query | Content discovery patterns |

**Custom Dimensions:**
- Podcast name (for multi-site analytics consolidation)
- Episode category/tag (if implemented)
- User type (new vs. returning)

### 10.2 Error Monitoring & Uptime

**Error Monitoring: Sentry**
- Capture JavaScript errors (broken player, failed API calls)
- Capture build errors (Sanity fetch failures)
- Source map uploads (readable stack traces)
- Slack/email alerts for critical errors

**Uptime Monitoring: UptimeRobot (Free Tier)**
- Ping homepage every 5 minutes
- Alert if downtime >1 minute (email + SMS)

### 10.3 Data Retention & Compliance

**Retention Periods:**
- GA4 data: 14 months (default, configurable to 2 months for GDPR)
- Sentry errors: 90 days (free tier limit)
- Netlify logs: 30 days

**GDPR/CCPA Compliance:**
- Cookie consent banner (Cookiebot or Osano, free tier)
- Privacy policy + Terms of Service (templated, customizable per podcast)
- Data deletion requests: ConvertKit + Sanity manual deletion process (documented)

---

## 11. Accessibility, Localization & Compliance

### 11.1 Accessibility Requirements (WCAG 2.1 AA)

**Concrete Acceptance Tests:**

| Requirement | Test Method | Tool |
|-------------|-------------|------|
| Color contrast ≥4.5:1 (text) | Automated scan | axe DevTools, Lighthouse |
| Color contrast ≥3:1 (UI components) | Automated scan | axe DevTools |
| Keyboard navigation (all interactive elements) | Manual test | Tab/Shift+Tab, Enter, Space |
| Screen reader compatibility | Manual test | NVDA (Windows), VoiceOver (macOS) |
| Focus indicators visible | Manual test | Tab through page, verify outline |
| Alt text on all images | Automated scan | Lighthouse, axe |
| ARIA labels on complex widgets (audio player) | Manual review | Browser DevTools |
| Semantic HTML (headings hierarchy) | Automated scan | WAVE, Lighthouse |

### 11.2 Localization & Internationalization (i18n)

**Phase 1:** English only (US/UK)

**Phase 3 Strategy:**
- Static copy translation via JSON (en.json, es.json, etc.)
- Astro's built-in i18n routing (`/en/episodes`, `/es/episodios`)
- Content translation in Sanity (localized fields)
- RTL support for Arabic, Hebrew (CSS logical properties)

**Supported Languages (Priority Order):**
1. English (EN)
2. Spanish (ES) - large podcast market
3. Portuguese (PT) - Brazil podcast growth

### 11.3 Legal & Compliance

**Required Legal Pages:**
- Privacy Policy (template: Termly or iubenda, customized per podcast)
- Terms of Service (standard podcast TOS template)
- Cookie Policy (auto-generated by Cookiebot)
- DMCA Notice (for user-generated content in Phase 2+)

**Cookie Consent:**
- Banner on first visit (Cookiebot free tier: 100 subpages)
- Granular consent (Analytics, Marketing, Necessary)

---

## 12. Testing & Quality Assurance

### 12.1 Testing Activities

**Unit Testing:**
- Component tests (Vitest + Testing Library)
- Utility function tests (date formatting, URL parsing)
- Coverage target: >80% for critical paths

**Integration Testing:**
- Sanity API fetch tests (mock responses)
- Build process tests (Astro → HTML output validation)
- Form submission tests (Netlify Forms endpoints)

**Visual Regression Testing:**
- Percy or Chromatic (screenshot comparison)
- Test on: Homepage, episode page, guest page, 404
- Devices: Mobile (375px), tablet (768px), desktop (1440px)

**Performance Testing:**
- Lighthouse CI (runs on every PR)
- WebPageTest (monthly check, multiple locations)

**SEO Testing:**
- Structured data validation (Google Rich Results Test)
- Meta tag validation (Screaming Frog crawl)
- Mobile-friendliness test (Google Search Console)

### 12.2 Deployment Pipeline

**CI/CD Provider:** GitHub Actions (free for public repos, 2,000 min/month private repos)

**Pipeline Stages:**

```yaml
1. Lint & Type Check (ESLint, TypeScript compiler)
2. Unit Tests (Vitest, fail if coverage <80%)
3. Build (Astro build, fail if build errors)
4. Lighthouse CI (Performance >90, SEO >95, Accessibility >90)
5. Deploy to Staging (develop branch, Netlify preview)
6. Manual QA Approval (reviewer tests staging URL)
7. Deploy to Production (main branch, Netlify production)
```

**Branching Model:**
- `main` → Production (auto-deploys to strangewater.xyz)
- `develop` → Staging (auto-deploys to staging.strangewater.xyz)
- `feature/*` → Branch previews (Netlify generates unique URL)

### 12.3 Post-Launch Monitoring & Rollback

**Smoke Tests (Post-Deploy):**
- [ ] Homepage loads (HTTP 200)
- [ ] Latest episode page loads (audio player renders)
- [ ] Google Analytics event fires (pageview tracked)
- [ ] Sitemap accessible (/sitemap.xml)

**Rollback Procedure:**
1. Detect issue (error spike, traffic drop, Core Web Vitals degradation)
2. Identify last known good deploy (Netlify UI)
3. Click "Publish deploy" on previous version (instant rollback)
4. Investigate root cause, fix forward

---

## 13. Phased Implementation Plan

### 13.1 Implementation Summary

The detailed implementation plan with 120+ granular tasks is maintained in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

**Phase Overview:**

**Phase 1: Strange Water MVP (Weeks 1-4)**
- **Phase 1a (Days 1-3):** "Hello World" - Deployed site with hardcoded episode
- **Phase 1b (Days 4-7):** Sanity integration, config layer, hosted Studio
- **Phase 1c (Days 8-11):** Full content migration (69 episodes + guests)
- **Phase 1d (Days 12-15):** SEO, performance, monetization, production launch
- **Phase 1e (Days 16-20):** Post-launch refinement

**Phase 2: Enhancement (Weeks 5-8)**
- Newsletter, forms, privacy compliance
- Episode search, tagging, related episodes
- Transcript generation (Whisper API)

**Phase 3: Scale (Weeks 9-12)**
- Final config abstraction, zero hardcoded references
- Complete documentation (SETUP.md, CUSTOMIZATION.md, ARCHITECTURE.md)
- Second podcast deployment (<4 hours manual, <30 min for content publishing)

**Key Implementation Principles:**
- Daily deploys to staging (3-5 times/day)
- Vertical slices (working episode page Day 2, not scaffolded pages Week 2)
- Half-day task blocks (2-4 hours each)
- Continuous validation (every task deployed and verified)

---

## 14. Success Metrics

### 14.1 Launch Metrics (End of Phase 1, Day 15)

**Technical Excellence:**
- ✅ Lighthouse Performance: >90 (target: >95)
- ✅ Lighthouse SEO: >95 (target: 100)
- ✅ Lighthouse Accessibility: >90 (target: 95)
- ✅ Page load time: <3s (target: <2s)
- ✅ Core Web Vitals: All green (LCP <2.5s, FID <100ms, CLS <0.1)

**Content Completeness:**
- ✅ All 69 episodes migrated successfully
- ✅ Zero broken links/images (Screaming Frog validation)
- ✅ Mobile usability: 100% (Google Search Console)
- ✅ 100% episode metadata completeness (title, audio, date, show notes)

**SEO Readiness:**
- ✅ XML sitemap submitted to Google Search Console
- ✅ Structured data validation passed (zero errors)
- ✅ 301 redirects functional (all old URLs redirect correctly)
- ✅ robots.txt configured (allows crawling)

**Monetization Infrastructure:**
- ✅ Patreon widget live on all episode pages
- ✅ Subscribe CTAs on homepage + episode pages
- ✅ Event tracking functional (subscribe, Patreon, audio plays)

### 14.2 Growth Metrics (Ongoing - Months 1-6)

**Traffic:**
- Organic search traffic (Google Analytics): +20% MoM (months 2-6)
- Direct traffic: Establish baseline (month 1), grow +10% MoM

**Engagement:**
- Audio play rate: >40% of episode page visitors
- Avg. session duration: >2 minutes (engaged browsing)
- Bounce rate: <60% (industry benchmark: 70-80%)

**Conversions (Monetization):**
- Subscribe clicks: >5% of visitors (any platform)
- Patreon clicks: >2% of episode page visitors
- Email newsletter signups: >3% of homepage visitors (Phase 2)

### 14.3 Framework Reusability Metrics

**Deployment Efficiency:**
- Time to deploy new podcast: <4 hours (zero to production)
- Branding customization effort: <2 hours
- Launch checklist completion: 100% automated checks pass

**Developer Experience:**
- Documentation completeness: 100% of features documented
- Onboarding time (new developer): <2 hours to first local build
- Component reuse rate: >80% of components unchanged between podcasts

### 14.4 Iteration Velocity Metrics

**Phase 1 Target Velocity:**
- **Tasks completed per day:** 8-12 tasks (average ~10)
- **Staging deploys per day:** 3-5 deploys
- **Days to first deploy:** Day 1 (not Week 4!)
- **Days to content-complete site:** Day 11 (not Week 3!)
- **Days to production launch:** Day 15

**Comparison (Waterfall vs. Iterative):**

| Milestone | Waterfall | Iterative (This Plan) |
|-----------|-----------|----------------------|
| First deploy | Week 3 | Day 1 |
| Working episode page | Week 2 | Day 2 |
| Dynamic content | Week 3 | Day 5 |
| All content migrated | Week 4 | Day 11 |
| Production launch | Week 4 | Day 15 |

**Key Insight:** Iterative approach reaches "usable site" 10x faster (Day 3 vs. Week 3).

---

## 15. Risks, Dependencies & Mitigation

### 15.1 Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Content migration errors** | High | Medium | Automated validation script, manual QA sample (10 episodes), fallback data handling |
| **Tasks take longer than estimated** | Medium | High | Build in buffer days (Day 16-20), prioritize ruthlessly |
| **CMS too complex for non-technical users** | Medium | Low | Simplify Sanity Studio UI, create video tutorials, 1:1 training session |
| **Hosting costs spike with traffic** | Medium | Low | Monitor bandwidth (Netlify alerts), implement Cloudflare CDN, plan migration to self-hosted |
| **SEO ranking doesn't transfer** | High | Medium | 301 redirects, submit sitemap to Google, monitor Search Console (2 weeks), backlink outreach |
| **Performance degrades with more episodes** | Medium | Low | Pagination (12 per page), optimize Sanity queries (projection) |
| **Vendor lock-in (Sanity/Netlify)** | Medium | Low | Automated content export (JSON → S3 daily), standard static hosting (portable) |
| **Security breach (Sanity Studio)** | High | Low | Strong passwords, 2FA required, audit logs |
| **Data loss (accidental delete)** | High | Low | Sanity history (versioning built-in), automated daily backups (Sanity → S3) |
| **Scope creep during development** | Medium | Medium | Strict definition of done, new ideas → GitHub Issues for Phase 2 |

### 15.2 External Dependencies

| Dependency | SLA | Rate Limits | Fallback Strategy |
|------------|-----|-------------|-------------------|
| **Sanity API** | 99.9% uptime | 100k requests/month (free tier) | Cache content locally (build time), graceful degradation (stale content) |
| **Netlify Hosting** | 99.9% uptime | 300 build min, 100GB bandwidth/month | Self-hosted fallback (S3 + CloudFront), static export portable |
| **Spotify for Podcasters** | No SLA | Embed rate limits unclear | Direct MP3 URLs as backup, download + self-host audio files |
| **Google Analytics** | No SLA | No rate limits (standard) | Plausible Analytics as backup, event queue (retry on failure) |
| **Patreon API** | No SLA | 100 requests/min | Cache membership data, degrade gracefully (show static CTA) |

### 15.3 Open Questions & Decisions

**1. Audio Player: Custom vs. Embed?**
   - **MVP:** Embed from podcast host (simplicity, zero maintenance)
   - **Phase 2:** Evaluate custom player (Plyr.js) for chapters, playback speed, analytics
   - **Decision Needed:** Week 2

**2. Transcripts: Auto-generate vs. Manual?**
   - **MVP:** Manual for Strange Water (69 episodes = $70-100 Whisper API cost, one-time)
   - **New Podcasts:** Auto-generate on publish (Whisper API, $0.0015/min)
   - **Decision Needed:** Week 3 (budget approval)

**3. Comments: Enable for Strange Water?**
   - **Recommendation:** No (archival site, no new content)
   - **New Podcasts:** Yes (Giscus, GitHub Discussions)
   - **Decision Needed:** Week 2

**4. Content Archival Strategy:**
   - Automated daily Sanity export → S3 (JSON + images)
   - Retention: Indefinite (S3 Glacier for cost optimization)
   - **Decision Needed:** Week 3 (implement before launch)

---

## 16. Appendix: Research Findings

### 16.1 Competitive Analysis

**Best-in-Class Examples:**
- **Ahrefs Podcast:** Bold design, strong CTA placement, excellent SEO
- **Huberman Lab:** Clean, science-backed design, extensive show notes
- **99% Invisible:** Strong visual identity, excellent typography, engaging guest profiles
- **Crime Junkie:** Effective monetization integration (merch, Patreon)
- **The Joe Rogan Experience:** Minimalist, video-first, searchable content library

**Key Features (Industry Standards):**
- Embedded audio players (100% of sites)
- Episode transcripts (80% of top sites)
- Guest profiles with photos (70%)
- Search functionality (60%)
- Subscribe CTAs on every page (100%)

### 16.2 Technical Research

**Framework Comparison:**

| Framework | Performance | SEO | DX | Best For |
|-----------|-------------|-----|----| ---------|
| **Astro** | ⭐⭐⭐⭐⭐ (zero JS) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Content sites, blogs, podcasts |
| **Next.js** | ⭐⭐⭐⭐ (SSR/ISR) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Web apps, e-commerce, dashboards |
| **Gatsby** | ⭐⭐⭐⭐ (static) | ⭐⭐⭐⭐ | ⭐⭐⭐ | Blogs, marketing sites (declining) |

**Astro Chosen For:**
- Fastest Time to Interactive (ships zero JS by default)
- Excellent SEO (pre-rendered HTML, no client-side hydration delays)
- Content-first philosophy (built for blogs/marketing)

**CMS Comparison:**

| CMS | Cost (Free Tier) | Customization | Best For |
|-----|------------------|---------------|----------|
| **Sanity** | 100k API calls, 3 users | ⭐⭐⭐⭐⭐ | Content-rich apps, podcasts |
| **Contentful** | 25k records, 5 users | ⭐⭐⭐⭐ | Enterprise, large teams |
| **Strapi** | Self-hosted (free) | ⭐⭐⭐⭐⭐ | Developers, full control |

**Sanity Chosen For:**
- Real-time collaboration, customizable Studio
- Content portability (export to JSON, no lock-in)
- Developer-friendly (GROQ queries)

**Hosting Comparison:**

| Host | Cost (Free Tier) | Build Minutes | Bandwidth | Best For |
|------|------------------|---------------|-----------|----------|
| **Netlify** | $0 (commercial OK) | 300 min | 100GB | Static sites, Jamstack |
| **Vercel** | $0 (non-commercial) | 6,000 min | 100GB | Next.js apps, web apps |
| **Cloudflare Pages** | $0 (unlimited) | 500 builds | Unlimited | High-traffic sites |

**Netlify Chosen For:**
- Commercial use allowed on free tier (Vercel requires $20/mo Pro)
- Great DX (deploy previews, instant rollbacks)
- Framework-agnostic (not tied to Next.js)

### 16.3 SEO Best Practices

**Schema.org Markup (Critical):**
- `PodcastSeries` (homepage): Helps Google understand site is a podcast
- `PodcastEpisode` (episode pages): Rich results eligibility
- `Person` (guest/host pages): Knowledge Graph integration

**Individual Episode Pages (Essential):**
- Unique URLs (not tabs or modals)
- Keyword-optimized titles (front-load important keywords)
- Descriptive meta descriptions (140-160 characters)

**Transcripts (High Impact):**
- 10x more indexable content per episode
- Long-tail keyword opportunities
- Accessibility benefit (WCAG compliance)

**Core Web Vitals (Ranking Factor):**
- LCP <2.5s: Fast loading (prioritize above-fold content)
- FID <100ms: Responsive (minimize JavaScript)
- CLS <0.1: Stable layout (reserve space for images, embeds)

---

## 17. Next Steps

### 17.1 Immediate Actions (Day 0 - Pre-Development)

1. **Approve PRD** (stakeholder sign-off on iterative approach)
2. **Provision Accounts:**
   - GitHub organization/repo
   - Sanity.io (free tier)
   - Netlify (free tier)
   - Google Analytics 4 (create property)
   - Sentry (free tier)
3. **Gather Assets (for Phase 1d):**
   - Strange Water logo (SVG + PNG)
   - Favicon
   - OG image (1200x630px)
   - Host photo + bio
4. **Access Credentials:**
   - Spotify for Podcasters (episode export)
   - Domain registrar (DNS configuration for staging.strangewater.xyz)
5. **Set Up Development Environment:**
   - Install Node.js (LTS version)
   - Install Git
   - Configure code editor (VS Code recommended)

### 17.2 Day 1 Kickoff

**Morning:**
- [ ] Run `npm create astro@latest`
- [ ] Push to GitHub
- [ ] Connect Netlify
- [ ] Coffee break to celebrate first deploy!

**Afternoon:**
- [ ] Configure staging DNS
- [ ] Verify staging site loads
- [ ] Share staging URL with stakeholders

### 17.3 Success Criteria Recap

**Phase 1 Complete When:**
- ✅ All 69 Strange Water episodes live on new site
- ✅ Lighthouse scores: Performance >90, SEO >95, Accessibility >90
- ✅ Core Web Vitals: All green (RUM data)
- ✅ Zero 404 errors, all redirects functional
- ✅ Analytics tracking verified
- ✅ Monetization CTAs operational (Patreon, subscribe)
- ✅ strangewater.xyz DNS pointed to Netlify

**Estimated Timeline:** 4 weeks (20 days) to Strange Water launch, then iterate based on analytics and user feedback.

**Long-Term Vision:** Reusable podcast framework enabling rapid deployment of future shows, with proven performance, SEO, monetization, and user experience standards.

---

**End of PRD - Final Version**

**Reference:** For granular task-level implementation details, see [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
