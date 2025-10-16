# Episode Artwork Automation - Technical Notes

**Created:** 2025-10-06
**Status:** Research/Planning for Phase 2

---

## Problem Statement

**Current State:**
- Episode artwork is visible in Spotify embeds on episode pages
- Artwork is NOT imported into Sanity CMS during RSS import
- Strange Water: Manual upload acceptable (completed podcast, 69 episodes)
- **Future podcasts:** Automated artwork import is CRITICAL for active shows

**Why This Matters:**
- Active podcasts publish new episodes regularly (weekly/monthly)
- Manual artwork upload doesn't scale for ongoing production
- Episode artwork is key visual content for:
  - Social sharing (Open Graph images)
  - Episode cards on homepage/episodes list
  - SEO and discoverability

---

## Current Limitation

**RSS Feed Accessibility:**
- Anchor.fm RSS feed URL returns 404 error
- Feed was previously accessible at: `https://anchor.fm/s/11c540a8/podcast/rss`
- Likely cause: Anchor.fm migration to Spotify (platform consolidation)

**What We Can't Access:**
- Episode-specific artwork URLs from RSS `<itunes:image>` tags
- High-resolution cover images for each episode
- Standardized metadata format (RSS/iTunes podcast spec)

**What We CAN Access:**
- Spotify embed shows correct artwork (proves it exists)
- Platform links (Spotify, Apple, YouTube) are available per episode
- Episode IDs are extractable from Spotify URLs

---

## Proposed Solutions (Phase 2)

### Option 1: Spotify Web API (Recommended)

**Approach:**
1. Create Spotify Developer account (https://developer.spotify.com)
2. Register application to get client credentials
3. Use Spotify Web API to fetch episode metadata
4. Extract artwork URLs from API response
5. Download images and upload to Sanity

**API Endpoints:**
- Show Episodes: `GET /shows/{id}/episodes`
- Episode Details: `GET /episodes/{id}`
- Response includes: `images[]` array with multiple resolutions

**Implementation:**
```javascript
// Pseudocode
const spotifyClient = new SpotifyAPI(clientId, clientSecret);
const episode = await spotifyClient.getEpisode(episodeId);
const artworkUrl = episode.images[0].url; // Highest resolution
await downloadAndUploadToSanity(artworkUrl, episodeId);
```

**Pros:**
- Direct source of truth (Spotify is authoritative for Strange Water)
- High-quality images (multiple resolutions available)
- Well-documented API with TypeScript support
- Can also fetch show notes, descriptions, publish dates

**Cons:**
- Requires Spotify Developer account setup
- API rate limits (reasonable for podcast use case)
- Platform-specific (doesn't work for non-Spotify podcasts)

**Estimated Effort:** 4-6 hours (including account setup, script, testing)

---

### Option 2: Apple Podcasts RSS Feed (Fallback)

**Approach:**
1. Check if Apple Podcasts RSS feed is accessible
2. Parse `<itunes:image>` tags for episode artwork
3. Download and upload to Sanity

**Apple RSS URL Pattern:**
- Typically: `https://podcasts.apple.com/us/podcast/[name]/id[number]?uo=2`
- Redirects to actual RSS feed XML

**Pros:**
- Standard RSS format (reusable across podcasts)
- No API credentials needed
- Works for any podcast on Apple Podcasts

**Cons:**
- Apple feed availability unknown (may also be deprecated)
- Less reliable than API (feed structure can change)
- Single resolution artwork (vs. Spotify's multiple sizes)

**Estimated Effort:** 2-4 hours (if feed is accessible)

---

### Option 3: Multi-Platform Webhook System (Ideal Long-Term)

**Approach:**
1. Build webhook receiver endpoint (Netlify Functions or Vercel)
2. Configure webhooks on podcast hosting platforms
3. Receive notifications when new episodes publish
4. Automatically fetch metadata + artwork
5. Create/update Sanity records

**Platform Support:**
- Spotify for Podcasters (if webhooks available)
- Anchor.fm (legacy, may not support)
- Transistor.fm (has webhooks)
- Buzzsprout (has webhooks)

**Pros:**
- Zero manual work (fully automated)
- Real-time updates (episode live → site updated in minutes)
- Platform-agnostic (configure per hosting platform)
- Best user experience for podcasters

**Cons:**
- Complex setup (webhook endpoints, authentication)
- Platform-dependent (not all hosts support webhooks)
- Requires hosted serverless function
- Debugging/monitoring overhead

**Estimated Effort:** 8-12 hours (initial setup + testing)

---

## Recommended Approach for Phase 2

**Phase 2a: Spotify API Integration (First Active Podcast)**
1. Implement Spotify Web API artwork import
2. Create script: `scripts/import-artwork-from-spotify.js`
3. Add to npm scripts: `npm run import:artwork`
4. Document in framework README

**Phase 2b: Multi-Platform Support (Framework Maturity)**
1. Research Apple Podcasts RSS feed availability
2. Add fallback logic (Spotify API → Apple RSS → Manual)
3. Make platform selection configurable in `config/theme.json`

**Phase 3: Webhook Automation (Production-Ready Framework)**
1. Build webhook receiver for auto-import
2. Support Transistor, Buzzsprout, Spotify webhooks
3. Document setup per platform
4. Include monitoring/logging for failures

---

## Testing Strategy

**For Strange Water (Phase 1):**
- Manual upload only (one-time task, 69 episodes)
- Verify artwork displays correctly in Sanity Studio
- Test artwork rendering on episode pages

**For First Active Podcast (Phase 2):**
- Import 3-5 recent episodes via Spotify API
- Verify artwork quality and resolution
- Test automatic import on new episode publish
- Measure import time (target: <5 minutes)

**Framework Validation (Phase 3):**
- Test with 3 different podcast platforms
- Verify fallback logic works (Spotify → Apple → Manual)
- Stress test: Import 100+ episodes
- Monitor API rate limits and failures

---

## Dependencies

**Spotify Web API:**
- Package: `spotify-web-api-node` or `@spotify/web-api-ts-sdk`
- Auth: Client Credentials flow (server-to-server)
- Docs: https://developer.spotify.com/documentation/web-api

**Sanity Image Upload:**
- Package: `@sanity/client` (already installed)
- Method: `client.assets.upload('image', buffer)`
- Requires: Write token in `.env`

**Image Processing (Optional):**
- Package: `sharp` (resize, optimize)
- Use case: Generate multiple sizes for responsive images

---

## Open Questions for Phase 2

1. **Spotify API Rate Limits:**
   - What are the exact limits? (Need to check docs)
   - Is caching required? (Probably not for podcast use case)

2. **Apple Podcasts Feed:**
   - Is Strange Water RSS feed accessible via Apple?
   - Does it include episode-specific artwork?

3. **Hosting Platform:**
   - Where will future podcasts be hosted? (Spotify? Transistor? Buzzsprout?)
   - Do they support webhooks?

4. **Artwork Storage:**
   - Should we store multiple resolutions in Sanity?
   - Use Sanity's image pipeline or pre-generate sizes?

5. **Framework Configuration:**
   - How should users configure platform preference? (theme.json? .env?)
   - Should artwork import be required or optional?

---

## Success Metrics (Phase 2)

**Automation Efficiency:**
- Time to import artwork for 10 episodes: <2 minutes
- Time to import artwork for new episode: <5 minutes (webhook) or <1 minute (manual script)

**Reliability:**
- Success rate: >95% (handle API failures gracefully)
- Fallback logic: Works when primary source unavailable

**Developer Experience:**
- Setup time for new podcast: <30 minutes
- Documentation clarity: User can configure without code changes

---

**Last Updated:** 2025-10-06
**Next Review:** Phase 2 Planning (After Strange Water Launch)
