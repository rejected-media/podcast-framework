# Week 9: Strange Water Migration - IN PROGRESS

**Started:** 2025-10-14 (Session 20)
**Status:** Framework integration complete, needs Sanity credentials for testing
**Repository:** https://github.com/rexkirshner/strange-water

---

## Progress: ~50%

### ✅ Completed

**Repository Setup:**
- ✅ Created strange-water repo using podcast-template
- ✅ Configured for Strange Water (name, tagline, domain)
- ✅ Updated podcast.config.js
- ✅ Updated astro.config.mjs

**Pages Created:**
- ✅ Homepage (from template)
- ✅ Episodes listing page (episodes/index.astro)
- ✅ Episode detail page (episodes/[slug].astro)
- ✅ Guests page (guests.astro)
- ✅ About page (about.astro)

**Framework Integration:**
- ✅ Uses @podcast-framework/core components
- ✅ Uses framework Sanity utilities
- ✅ Uses BaseLayout (SEO, analytics, header/footer)
- ✅ TranscriptViewer integrated
- ✅ EpisodeSearch integrated
- ✅ All framework utilities imported correctly

---

### ⏳ Remaining

**Configuration:**
- [ ] Create .env.local with Sanity credentials
- [ ] Test build with real Sanity data (69 episodes)
- [ ] Verify all components render correctly

**Deployment:**
- [ ] Deploy to Cloudflare Pages
- [ ] Configure environment variables in Cloudflare
- [ ] Point strangewater.xyz DNS (or test subdomain)
- [ ] Verify production deployment works

**Validation:**
- [ ] Test all 69 episodes load
- [ ] Test transcripts display
- [ ] Test search functionality
- [ ] Test Spotify embeds
- [ ] Monitor for errors

**Estimated Remaining:** 2-3 hours

---

## Framework Validation Checklist

**When testing, verify:**
- [ ] All episodes query works (getAllEpisodes)
- [ ] Episode detail query works (getEpisodeBySlug)
- [ ] Guests query works (getAllGuests)
- [ ] Podcast info query works (getPodcastInfo)
- [ ] TranscriptViewer works with real transcripts
- [ ] EpisodeSearch filters 69 episodes correctly
- [ ] BaseLayout renders header/footer
- [ ] Theme CSS variables applied
- [ ] Spotify embeds load
- [ ] Platform links work
- [ ] Build time acceptable (<5 min for 69 episodes)
- [ ] All pages prerender correctly

---

## Next Steps

**Immediate:**
1. Set up .env.local with existing Strange Water Sanity credentials
2. Run `npm install` in strange-water repo
3. Run `npm run build` to test with real data
4. Fix any issues discovered
5. Deploy to Cloudflare Pages

**After Deployment:**
- Monitor analytics
- Check for errors
- Validate performance
- Document any framework issues
- Update framework if bugs found

---

## Success Criteria

**Migration Successful If:**
- ✅ All 69 episodes migrate correctly
- ✅ All features work (transcripts, search, navigation)
- ✅ Build time acceptable
- ✅ No runtime errors
- ✅ Performance maintained
- ✅ SEO working

---

**Status:** Framework integration done, needs real Sanity test
**Next:** Set up credentials and build with real data
