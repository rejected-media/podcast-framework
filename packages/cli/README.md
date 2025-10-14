# @podcast-framework/cli

Command-line tool for creating and managing podcast framework projects.

## Installation

```bash
# Install globally
npm install -g @podcast-framework/cli

# Or use with npx (no installation)
npx @podcast-framework/cli <command>
```

## Commands

### `list-components`

List all available framework components.

```bash
podcast-framework list-components

# Show detailed info
podcast-framework list-components --verbose
```

**Output:**
- Component names
- Descriptions (with --verbose)
- Props (with --verbose)
- Usage examples

---

### `list-schemas`

List all available Sanity schemas.

```bash
podcast-framework list-schemas

# Show detailed info
podcast-framework list-schemas --verbose
```

**Output:**
- Schema names (episode, guest, host, podcast, contribution)
- Descriptions (with --verbose)
- Field lists (with --verbose)
- Usage and extension examples

---

### `validate`

Validate podcast project structure and configuration.

```bash
podcast-framework validate

# Show detailed validation
podcast-framework validate --verbose
```

**Checks:**
- package.json exists and is valid
- Required dependencies installed
- Configuration files present
- Directory structure correct
- Environment variables configured

**Exit Codes:**
- 0: Validation passed
- 1: Validation failed

---

### `override <component>`

Create a component override in your podcast.

```bash
podcast-framework override Header

# Overwrite existing override
podcast-framework override Header --force
```

**What it does:**
- Creates `src/components/<ComponentName>.astro`
- Generates template with 3 options:
  1. Replace framework component
  2. Wrap framework component
  3. Use framework as starting point
- Provides usage instructions

**Available components:**
- Header, Footer, NewsletterSignup, EpisodeSearch
- TranscriptViewer, FeaturedEpisodesCarousel
- SkeletonLoader, BlockContent

---

### `check-updates`

Check for available framework updates.

```bash
podcast-framework check-updates
```

**Status:** Scaffold only (full implementation in Week 6)

**Currently shows:**
- Current package versions
- Manual check instructions

**Future:**
- Fetch latest versions from npm
- Show changelog
- Recommend updates

---

## Coming Soon

**Week 6-7 Commands:**
- `create <name>` - Create new podcast project
- `update` - Update framework packages
- `migrate-schema` - Generate schema migration
- `backup-sanity` - Backup Sanity dataset
- `workspace` - Multi-podcast management

---

## Usage Examples

### Validate Project

```bash
cd my-podcast
podcast-framework validate
```

### Override Component

```bash
podcast-framework override Header
# Edit src/components/Header.astro
npm run dev
```

### List Available Components

```bash
podcast-framework list-components --verbose
```

---

## Development

```bash
# Clone repository
git clone https://github.com/podcast-framework/podcast-framework.git
cd podcast-framework/packages/cli

# Install dependencies
npm install

# Run in development
npm run dev <command>

# Build
npm run build

# Test
npm test
```

---

## Version

Current version: 0.1.0 (Week 4-5)

**Status:** Foundation complete, 5 commands working

**Roadmap:**
- Week 5: ✅ Helper commands (validate, override, list-schemas)
- Week 6-7: Create, update, migrate commands
- Week 7: CLI tests and polish

---

## License

MIT - see [LICENSE](../../LICENSE)
