#!/usr/bin/env node

/**
 * @podcast-framework/cli
 *
 * Command-line tool for creating and managing podcast framework projects
 *
 * @version 0.1.0
 * @license MIT
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('podcast-framework')
  .description('CLI tool for creating and managing podcast websites')
  .version('0.1.0');

// Import commands
import { createCommand } from './commands/create';
import { infoCommand } from './commands/info';
import { validateCommand } from './commands/validate';
import { listComponentsCommand } from './commands/list-components';
import { listSchemasCommand } from './commands/list-schemas';
import { overrideCommand } from './commands/override';
import { updateCommand } from './commands/update';
import { rollbackCommand } from './commands/rollback';
import { migrateSchemaCommand } from './commands/migrate-schema';
import { checkUpdatesCommand } from './commands/check-updates';

// Register commands (in logical order)
program.addCommand(createCommand);
program.addCommand(infoCommand);
program.addCommand(validateCommand);
program.addCommand(listComponentsCommand);
program.addCommand(listSchemasCommand);
program.addCommand(overrideCommand);
program.addCommand(updateCommand);
program.addCommand(rollbackCommand);
program.addCommand(migrateSchemaCommand);
program.addCommand(checkUpdatesCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
