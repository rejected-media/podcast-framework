/**
 * Error Formatting Utilities
 *
 * Creates user-friendly, well-formatted error messages with troubleshooting steps,
 * documentation links, and examples.
 */

/**
 * Format a helpful error message with box styling
 *
 * @param title - Error title
 * @param description - Error description
 * @param troubleshooting - Array of troubleshooting steps
 * @param docsUrl - Optional documentation URL
 * @returns Formatted error message
 */
export function formatError(config: {
  title: string;
  description: string;
  troubleshooting: string[];
  docsUrl?: string;
  example?: string;
}): string {
  const { title, description, troubleshooting, docsUrl, example } = config;

  const separator = '═'.repeat(70);
  const lines: string[] = [];

  lines.push('');
  lines.push(`╔${separator}╗`);
  lines.push(`║ ❌ ${title.toUpperCase().padEnd(67)}║`);
  lines.push(`╠${separator}╣`);
  lines.push(`║${' '.repeat(70)}║`);

  // Description (wrap at 66 chars)
  const descLines = wrapText(description, 66);
  descLines.forEach(line => {
    lines.push(`║  ${line.padEnd(68)}║`);
  });

  lines.push(`║${' '.repeat(70)}║`);
  lines.push(`╠${separator}╣`);
  lines.push(`║ 🔧 TROUBLESHOOTING STEPS:${' '.repeat(43)}║`);
  lines.push(`║${' '.repeat(70)}║`);

  // Troubleshooting steps
  troubleshooting.forEach((step, index) => {
    const stepLines = wrapText(`${index + 1}. ${step}`, 66);
    stepLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        lines.push(`║  ${line.padEnd(68)}║`);
      } else {
        lines.push(`║     ${line.padEnd(65)}║`);
      }
    });
  });

  // Example
  if (example) {
    lines.push(`║${' '.repeat(70)}║`);
    lines.push(`║ 📝 EXAMPLE:${' '.repeat(58)}║`);
    lines.push(`║${' '.repeat(70)}║`);
    const exampleLines = example.split('\n');
    exampleLines.forEach(line => {
      // Trim lines but keep indentation relative to first char
      const trimmed = line.substring(0, 66);
      lines.push(`║  ${trimmed.padEnd(68)}║`);
    });
  }

  // Documentation
  if (docsUrl) {
    lines.push(`║${' '.repeat(70)}║`);
    lines.push(`║ 📚 DOCUMENTATION:${' '.repeat(52)}║`);
    lines.push(`║  ${docsUrl.padEnd(68)}║`);
  }

  lines.push(`║${' '.repeat(70)}║`);
  lines.push(`╚${separator}╝`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Wrap text to specified width
 */
function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= width) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Format a warning message (less severe than error)
 */
export function formatWarning(config: {
  title: string;
  description: string;
  suggestions?: string[];
  docsUrl?: string;
}): string {
  const { title, description, suggestions, docsUrl } = config;

  const separator = '─'.repeat(70);
  const lines: string[] = [];

  lines.push('');
  lines.push(`┌${separator}┐`);
  lines.push(`│ ⚠️  ${title.padEnd(67)}│`);
  lines.push(`├${separator}┤`);
  lines.push(`│${' '.repeat(70)}│`);

  // Description
  const descLines = wrapText(description, 66);
  descLines.forEach(line => {
    lines.push(`│  ${line.padEnd(68)}│`);
  });

  // Suggestions
  if (suggestions && suggestions.length > 0) {
    lines.push(`│${' '.repeat(70)}│`);
    lines.push(`│ 💡 SUGGESTIONS:${' '.repeat(54)}│`);
    lines.push(`│${' '.repeat(70)}│`);

    suggestions.forEach((suggestion) => {
      const suggLines = wrapText(`• ${suggestion}`, 66);
      suggLines.forEach((line, lineIndex) => {
        if (lineIndex === 0) {
          lines.push(`│  ${line.padEnd(68)}│`);
        } else {
          lines.push(`│     ${line.padEnd(65)}│`);
        }
      });
    });
  }

  // Documentation
  if (docsUrl) {
    lines.push(`│${' '.repeat(70)}│`);
    lines.push(`│ 📚 DOCUMENTATION:${' '.repeat(52)}│`);
    lines.push(`│  ${docsUrl.padEnd(68)}│`);
  }

  lines.push(`│${' '.repeat(70)}│`);
  lines.push(`└${separator}┘`);
  lines.push('');

  return lines.join('\n');
}
