/**
 * override command
 *
 * Scaffolds a component override file
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const AVAILABLE_COMPONENTS = [
  'Header',
  'Footer',
  'NewsletterSignup',
  'EpisodeSearch',
  'TranscriptViewer',
  'FeaturedEpisodesCarousel',
  'SkeletonLoader',
  'BlockContent'
];

export const overrideCommand = new Command('override')
  .description('Create a component override in src/components/')
  .argument('<component>', 'Component name to override (e.g., Header)')
  .option('-f, --force', 'Overwrite existing override')
  .action((componentName: string, options) => {
    console.log(chalk.bold(`\n🎨 Creating override for ${componentName}...\n`));

    // Validate component name
    if (!AVAILABLE_COMPONENTS.includes(componentName)) {
      console.log(chalk.red(`❌ Unknown component: ${componentName}\n`));
      console.log(chalk.bold('Available components:'));
      AVAILABLE_COMPONENTS.forEach(name => {
        console.log(chalk.gray(`  - ${name}`));
      });
      console.log('');
      process.exit(1);
    }

    // Check if already exists
    const componentDir = join(process.cwd(), 'src', 'components');
    const componentPath = join(componentDir, `${componentName}.astro`);

    if (existsSync(componentPath) && !options.force) {
      console.log(chalk.yellow(`⚠️  Override already exists: src/components/${componentName}.astro\n`));
      console.log(chalk.gray('Use --force to overwrite\n'));
      process.exit(1);
    }

    // Create src/components/ if it doesn't exist
    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
      console.log(chalk.gray(`Created directory: src/components/\n`));
    }

    // Generate component template
    const template = `---
/**
 * Custom ${componentName} Component
 *
 * This overrides the framework's ${componentName} component.
 * The framework will automatically use this version instead.
 *
 * You can:
 * 1. Completely replace the framework version (implement from scratch)
 * 2. Wrap the framework version (import and enhance)
 * 3. Use framework version as starting point (copy and modify)
 */

// Option 1: Import framework version to wrap it
// import Framework${componentName} from '@podcast-framework/core/components/${componentName}.astro';

// Option 2: Implement your own version
// Add your props interface here

interface Props {
  // Define your props
}

const props = Astro.props;
---

<!-- Your custom ${componentName} implementation -->
<div>
  <h1>Custom ${componentName}</h1>
  <p>Replace this with your custom component code</p>
</div>

<!-- Option 1 Example: Wrap framework component -->
<!-- <div class="custom-wrapper">
  <Framework${componentName} {...props} />
</div> -->
`;

    // Write file
    try {
      writeFileSync(componentPath, template);
      console.log(chalk.green(`✅ Created: src/components/${componentName}.astro\n`));
      console.log(chalk.bold('Next steps:'));
      console.log(chalk.gray('1. Edit the file to implement your custom version'));
      console.log(chalk.gray('2. The framework will automatically use your override'));
      console.log(chalk.gray('3. Test with: npm run dev\n'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to create override file\n'));
      console.error(error);
      process.exit(1);
    }
  });
