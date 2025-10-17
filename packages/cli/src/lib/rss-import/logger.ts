/**
 * Logger utility for RSS import process
 */

import { writeFileSync, appendFileSync } from 'fs';
import type { ImportLogEntry } from './types';

export class ImportLogger {
  private logs: ImportLogEntry[] = [];
  private logFilePath?: string;
  private verbose: boolean;

  constructor(verbose: boolean = false, logFilePath?: string) {
    this.verbose = verbose;
    this.logFilePath = logFilePath;

    if (this.logFilePath) {
      // Create/clear log file
      writeFileSync(this.logFilePath, `RSS Import Log - ${new Date().toISOString()}\n${'='.repeat(80)}\n\n`);
    }
  }

  info(message: string, details?: any): void {
    this.log('info', message, details);
  }

  warn(message: string, details?: any): void {
    this.log('warn', message, details);
  }

  error(message: string, details?: any): void {
    this.log('error', message, details);
  }

  private log(level: 'info' | 'warn' | 'error', message: string, details?: any): void {
    const entry: ImportLogEntry = {
      timestamp: new Date(),
      level,
      message,
      details,
    };

    this.logs.push(entry);

    // Console output
    if (this.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️ ' : '  ';
      console.log(`${prefix} ${message}`);
      if (details && this.verbose) {
        console.log('   ', details);
      }
    }

    // File output
    if (this.logFilePath) {
      const timestamp = entry.timestamp.toISOString();
      const levelStr = level.toUpperCase().padEnd(5);
      let logLine = `[${timestamp}] ${levelStr} ${message}\n`;

      if (details) {
        logLine += `   Details: ${JSON.stringify(details, null, 2)}\n`;
      }

      appendFileSync(this.logFilePath, logLine);
    }
  }

  getLogs(): ImportLogEntry[] {
    return [...this.logs];
  }

  getErrorCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }

  getWarningCount(): number {
    return this.logs.filter(log => log.level === 'warn').length;
  }

  writeSummary(): void {
    const errors = this.getErrorCount();
    const warnings = this.getWarningCount();

    const summary = `\n${'='.repeat(80)}\nImport Summary:\n  Errors: ${errors}\n  Warnings: ${warnings}\n  Total Log Entries: ${this.logs.length}\n${'='.repeat(80)}\n`;

    if (this.logFilePath) {
      appendFileSync(this.logFilePath, summary);
    }

    console.log(summary);
  }
}
