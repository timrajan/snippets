/**
 * Comprehensive HTML cleaner with options
 */
function cleanHtmlComprehensive(
  htmlContent: string | null | undefined,
  options: {
    preserveLineBreaks?: boolean;
    preserveLists?: boolean;
    maxLength?: number;
    removeExtraWhitespace?: boolean;
    convertToSingleLine?: boolean;
  } = {}
): string {
  if (!htmlContent) return '';
  
  const {
    preserveLineBreaks = true,
    preserveLists = true,
    maxLength,
    removeExtraWhitespace = true,
    convertToSingleLine = false
  } = options;
  
  let cleaned = htmlContent;
  
  // Handle line breaks
  if (preserveLineBreaks) {
    cleaned = cleaned.replace(/<\/?(p|div|br)[^>]*>/gi, '\n');
    cleaned = cleaned.replace(/<\/?(h[1-6])[^>]*>/gi, '\n\n');
  }
  
  // Handle lists
  if (preserveLists) {
    cleaned = cleaned.replace(/<ul[^>]*>/gi, '\n');
    cleaned = cleaned.replace(/<\/ul>/gi, '\n');
    cleaned = cleaned.replace(/<ol[^>]*>/gi, '\n');
    cleaned = cleaned.replace(/<\/ol>/gi, '\n');
    cleaned = cleaned.replace(/<li[^>]*>/gi, '\n• ');
    cleaned = cleaned.replace(/<\/li>/gi, '');
  }
  
  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities (comprehensive list)
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': ''',
    '&rsquo;': ''',
    '&ldquo;': '"',
    '&rdquo;': '"'
  };
  
  Object.entries(entityMap).forEach(([entity, replacement]) => {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Handle numeric HTML entities
  cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });
  
  // Handle hex HTML entities
  cleaned = cleaned.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Clean up whitespace
  if (removeExtraWhitespace) {
    cleaned = cleaned
      .replace(/[ \t]+/g, ' ')        // Multiple spaces/tabs to single space
      .replace(/\n\s*\n/g, '\n')      // Remove empty lines
      .replace(/^\s+/gm, '')          // Remove leading whitespace per line
      .replace(/\s+$/gm, '');         // Remove trailing whitespace per line
  }
  
  // Convert to single line if requested
  if (convertToSingleLine) {
    cleaned = cleaned.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  }
  
  // Trim and apply max length
  cleaned = cleaned.trim();
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength - 3) + '...';
  }
  
  return cleaned;
}
