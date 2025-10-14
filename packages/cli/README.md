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

### `create [name]`

Create a new podcast project from template.

```bash
podcast-framework create my-podcast

# Skip npm install
podcast-framework create my-podcast --skip-install
```

**Interactive prompts:**
- Podcast name (if not provided)
- Tagline
- Description
- Feature selection (newsletter, contributions, search)

**What it creates:**
- Complete project structure (src/, public/, sanity/)
- package.json with framework dependencies
- podcast.config.js with your settings
- astro.config.mjs
- .env.template
- Homepage
- README

---

### `info`

Display information about the current podcast project.

```bash
podcast-framework info
```

**Shows:**
- Project name and version
- Framework package versions
- Astro and Sanity versions
- Configuration file location
- Helpful next commands

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

### `update`

Update framework packages to latest versions.

```bash
# Update to latest compatible versions (patch/minor)
podcast-framework update

# Update to latest versions (may include breaking changes)
podcast-framework update --major

# Preview updates without applying
podcast-framework update --dry-run
```

**Features:**
- Automatic backup creation (for --major)
- Shows version changes (old → new)
- Provides migration guidance
- Safe rollback available

---

### `rollback`

Rollback to a previous framework version from backup.

```bash
# List available backups
podcast-framework rollback --list

# Rollback to most recent backup
podcast-framework rollback --last

# Rollback to specific version
podcast-framework rollback --to v2.1.0

# Interactive selection
podcast-framework rollback
```

**What it restores:**
- package.json
- package-lock.json
- podcast.config.js

**Note:** Run `npm install` after rollback to reinstall dependencies

---

### `migrate-schema`

Generate Sanity schema migration template.

```bash
# Generate migration from v1 to v2
podcast-framework migrate-schema --from v1 --to v2
```

**What it creates:**
- Migration file in sanity/migrations/
- Template with TODOs for manual review
- Example migration logic
- Testing instructions
- Safety warnings

**Important:** Always review and test migrations before running on production!

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
