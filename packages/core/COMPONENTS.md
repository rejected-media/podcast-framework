# Component Documentation

Complete reference for all components in `@podcast-framework/core`

## Table of Contents

1. [Header](#header) - Navigation header
2. [Footer](#footer) - Site footer
3. [NewsletterSignup](#newslettersignup) - Email subscription
4. [EpisodeSearch](#episodesearch) - Search functionality
5. [TranscriptViewer](#transcriptviewer) - Transcript display
6. [FeaturedEpisodesCarousel](#featuredepisodescarousel) - Episode carousel
7. [SkeletonLoader](#skeletonloader) - Loading states
8. [BlockContent](#blockcontent) - Sanity content renderer

---

## Header

Main navigation header with logo, site name, and responsive mobile menu.

### Props

```typescript
interface Props {
  siteName: string;           // Required - site/podcast name
  siteTagline?: string;       // Optional tagline below name
  logoUrl?: string;           // Optional logo image URL
  navigation?: NavigationItem[]; // Navigation items
  theme?: Theme;              // Theme configuration
}

interface NavigationItem {
  href: string;
  label: string;
  show?: boolean;  // Conditional rendering
}
```

### Usage

```astro
---
import Header from '@podcast-framework/core/components/Header.astro';
---

<Header
  siteName="My Podcast"
  siteTagline="Great conversations"
  logoUrl="/logo.png"
  navigation={[
    { href: '/', label: 'Home' },
    { href: '/episodes', label: 'Episodes' },
    { href: '/contribute', label: 'Contribute', show: isActive }
  ]}
/>
```

### Features

- Mobile responsive with toggle menu
- Accessibility (ARIA labels, keyboard navigation)
- Theme-aware (CSS variables)
- Fallback logo (initials if no image)
- Auto-close mobile menu on navigation

---

## Footer

Site footer with brand info, navigation links, social links, and newsletter slot.

### Props

```typescript
interface Props {
  siteName: string;
  siteDescription?: string;
  navigation?: NavigationItem[];
  socialLinks?: SocialLink[];
  theme?: Theme;
  showNewsletter?: boolean;
}

interface SocialLink {
  href: string;
  label: string;
}
```

### Usage

```astro
---
import Footer from '@podcast-framework/core/components/Footer.astro';
import NewsletterSignup from '@podcast-framework/core/components/NewsletterSignup.astro';
---

<Footer
  siteName="My Podcast"
  siteDescription="Weekly tech conversations"
  socialLinks={[
    { href: 'https://spotify.com/...', label: 'Spotify' },
    { href: 'https://apple.com/...', label: 'Apple Podcasts' }
  ]}
  showNewsletter={true}
>
  <!-- Provide newsletter via slot -->
  <NewsletterSignup slot="newsletter" variant="footer" />
</Footer>
```

### Features

- Grid layout (brand, navigation, social links)
- Newsletter slot for custom signup component
- Theme-aware styling
- Current year auto-updates

---

## NewsletterSignup

Email subscription form with honeypot spam protection.

### Props

```typescript
interface Props {
  variant?: 'inline' | 'footer';  // Display style
  placeholder?: string;            // Input placeholder
  buttonText?: string;             // Button label
}
```

### Usage

```astro
---
import NewsletterSignup from '@podcast-framework/core/components/NewsletterSignup.astro';
---

<!-- Inline variant (standalone) -->
<NewsletterSignup
  variant="inline"
  placeholder="your@email.com"
  buttonText="Subscribe"
/>

<!-- Footer variant (compact) -->
<NewsletterSignup variant="footer" />
```

### Features

- Honeypot spam protection
- Form validation
- Loading states
- Success/error messaging
- Posts to `/api/newsletter-subscribe` endpoint
- Mobile responsive
- Accessibility (ARIA labels, live regions)

### Required API Endpoint

Component expects `/api/newsletter-subscribe` endpoint:

```typescript
// src/pages/api/newsletter-subscribe.ts
export async function POST({ request }) {
  const { email } = await request.json();

  // Add to newsletter provider (ConvertKit, Mailchimp, etc.)

  return new Response(JSON.stringify({
    message: 'Thanks for subscribing!'
  }), { status: 200 });
}
```

---

## EpisodeSearch

Client-side search for filtering episodes by title, description, and guest names.

### Props

```typescript
interface Props {
  placeholder?: string;  // Search input placeholder
}
```

### Usage

```astro
---
import EpisodeSearch from '@podcast-framework/core/components/EpisodeSearch.astro';
---

<EpisodeSearch placeholder="Search episodes..." />

<!-- Episode cards need data attributes -->
{episodes.map(episode => (
  <article
    data-episode-card
    data-episode-title={episode.title}
    data-episode-description={stripHTML(episode.description)}
    data-episode-guests={episode.guests.map(g => g.name).join(', ')}
  >
    <!-- Episode content -->
  </article>
))}
```

### Features

- Real-time search (no server requests)
- Fuzzy matching (case-insensitive, partial matches)
- Result count display
- Escape key to clear search
- Preserves original order when cleared
- Zero dependencies (vanilla JS)

### Required Data Attributes

Episode cards must have:
- `data-episode-card` - Identifies searchable elements
- `data-episode-title` - Episode title
- `data-episode-description` - Episode description
- `data-episode-guests` - Guest names (comma-separated)

---

## TranscriptViewer

Collapsible transcript viewer with search and copy functionality.

### Props

```typescript
interface Props {
  transcript?: string;              // Transcript text
  segments?: TranscriptSegment[];   // Timestamped segments (future)
  episodeNumber: number;            // Episode identifier
}
```

### Usage

```astro
---
import TranscriptViewer from '@podcast-framework/core/components/TranscriptViewer.astro';
---

<TranscriptViewer
  transcript={episode.transcript}
  episodeNumber={episode.episodeNumber}
/>
```

### Features

- Collapsible (hidden by default)
- Search within transcript
- Highlight matches
- Copy to clipboard
- Speaker label formatting (`**Speaker A:**` → formatted)
- Escape key to clear search
- Max height with scroll
- XSS-safe rendering (DOM manipulation, not innerHTML)

---

## FeaturedEpisodesCarousel

Auto-progressing carousel for showcasing featured episodes.

### Props

```typescript
interface Props {
  episodes: Episode[];
  title?: string;
  fallbackImage?: string;
  theme?: Theme;
  autoProgressInterval?: number;  // milliseconds, default 6000
}
```

### Usage

```astro
---
import FeaturedEpisodesCarousel from '@podcast-framework/core/components/FeaturedEpisodesCarousel.astro';
---

<FeaturedEpisodesCarousel
  episodes={featuredEpisodes}
  title="Featured Episodes"
  fallbackImage="/logo.png"
  autoProgressInterval={8000}
/>
```

### Features

- Auto-progression (loops through episodes)
- Previous/Next navigation buttons
- Dot indicators (click to jump)
- Auto-progress resets on manual interaction
- Mobile responsive (stacks vertically)
- Lazy-loaded images
- Accessibility (ARIA regions, list semantics)

---

## SkeletonLoader

Loading placeholder UI with multiple variants.

### Props

```typescript
interface Props {
  variant?: 'episode-card' | 'episode-list' | 'carousel' | 'guest-card';
  count?: number;  // How many skeletons to show
}
```

### Usage

```astro
---
import SkeletonLoader from '@podcast-framework/core/components/SkeletonLoader.astro';
---

<!-- While loading episodes -->
<SkeletonLoader variant="episode-card" count={3} />

<!-- While loading carousel -->
<SkeletonLoader variant="carousel" count={1} />

<!-- While loading guest list -->
<SkeletonLoader variant="guest-card" count={6} />
```

### Variants

- **episode-card**: Full episode card with image, title, description
- **carousel**: Horizontal card layout for carousel
- **episode-list**: Compact list item with small image
- **guest-card**: Guest profile with circular photo

### Features

- Smooth pulse animation
- Multiple variants for different layouts
- Configurable count
- Matches actual content dimensions

---

## BlockContent

Renders Sanity's portable text/block content.

### Props

```typescript
interface Props {
  blocks?: any[];    // Sanity block content array
  class?: string;    // Additional CSS classes
}
```

### Usage

```astro
---
import BlockContent from '@podcast-framework/core/components/BlockContent.astro';
---

<BlockContent
  blocks={episode.showNotes}
  class="prose max-w-none"
/>
```

### Supported Features

**Block styles:**
- Paragraph (normal)
- Headings (h1-h6)
- Blockquotes

**Text marks:**
- Bold (strong)
- Italic (em)
- Code
- Underline

**Future enhancements:**
- Lists (ul, ol)
- Links
- Images
- Custom blocks

---

## Common Patterns

### Using with Component Resolver

```astro
---
import { getComponent } from '@podcast-framework/core';

// Auto-resolves to local override or framework version
const Header = getComponent('Header');
const Footer = getComponent('Footer');
---

<Header siteName="My Podcast" />
<Footer siteName="My Podcast" />
```

### Overriding Components

Create `src/components/Header.astro` in your podcast:

```astro
---
// Your custom header
---
<header class="custom-design">
  <!-- Custom implementation -->
</header>
```

Framework automatically uses your version!

### Theme Integration

All components use CSS variables from theme:

```astro
---
import { defaultTheme } from '@podcast-framework/core';

const theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '255, 0, 0'  // Red
  }
};
---

<Header siteName="My Podcast" theme={theme} />
```

---

## Accessibility Features

All components follow WCAG 2.1 AA guidelines:

- ✅ Semantic HTML
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Sufficient color contrast

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Dependencies

**Required:**
- Astro 5.0+
- Tailwind CSS (for utility classes)

**Peer Dependencies:**
- TypeScript 5.0+ (for type safety)

---

**Last Updated:** 2025-10-14 (Week 1)
**Component Count:** 8
**Test Coverage:** High (59 tests passing)
