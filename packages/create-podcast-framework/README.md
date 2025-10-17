# @rejected-media/create-podcast-framework

Scaffolding tool for creating new podcast framework projects via `npm create`.

## Usage

### Create a new project

```bash
# Using npm
npm create @rejected-media/podcast-framework my-podcast

# Using npx
npx @rejected-media/create-podcast-framework my-podcast

# Interactive (will prompt for project name)
npm create @rejected-media/podcast-framework
```

### Options

All options from `@rejected-media/podcast-framework-cli create` are supported:

```bash
# Skip npm install
npm create @rejected-media/podcast-framework my-podcast --skip-install

# Use specific template
npm create @rejected-media/podcast-framework my-podcast --template advanced
```

## What It Does

This package is a thin wrapper around `@rejected-media/podcast-framework-cli` that enables the standard `npm create` pattern.

When you run `npm create @rejected-media/podcast-framework`, it:

1. Installs this package temporarily
2. Executes the wrapper script
3. Calls `podcast-framework create` with your arguments
4. Creates a complete podcast project with:
   - Astro project structure
   - Sanity CMS configuration
   - Framework components and utilities
   - Configuration files
   - Sample content

## What Gets Created

```
my-podcast/
├── src/
│   ├── pages/
│   │   └── index.astro
│   └── components/
├── public/
├── sanity/
│   └── schemas/
├── package.json
├── podcast.config.js
├── astro.config.mjs
├── .env.template
└── README.md
```

## Next Steps After Creation

1. Navigate to your project: `cd my-podcast`
2. Install dependencies: `npm install`
3. Set up Sanity CMS at https://sanity.io/manage
4. Copy `.env.template` to `.env.local`
5. Add your Sanity project ID and credentials
6. Start development: `npm run dev`

## Documentation

- [Framework Documentation](https://github.com/rejected-media/podcast-framework)
- [CLI Documentation](../cli/README.md)
- [Getting Started Guide](../../docs/getting-started.md)

## How It Works

This package implements npm's `npm create` pattern:

- `npm create foo` → Runs `npx create-foo`
- `npm create @scope/foo` → Runs `npx @scope/create-foo`

So `npm create @rejected-media/podcast-framework` runs `npx @rejected-media/create-podcast-framework`, which invokes the CLI's `create` command.

## For Developers

### Local Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Test locally
npm link
cd /tmp
npm create @rejected-media/podcast-framework test-project
```

### Publishing

```bash
# Build first
npm run build

# Publish to npm
npm publish
```

The `prepublishOnly` script automatically runs `npm run build` before publishing.

## License

MIT - see [LICENSE](../../LICENSE)

## Related Packages

- [@rejected-media/podcast-framework-cli](../cli) - Full CLI tool with all commands
- [@rejected-media/podcast-framework-core](../core) - Core components and utilities
- [@rejected-media/podcast-framework-sanity-schema](../sanity-schema) - Sanity CMS schemas
