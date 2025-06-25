/**
 * Remove ALL HTML elements completely (everything between < and >)
 */
function removeAllHtmlElements(htmlContent: string | null | undefined): string {
  if (!htmlContent) return '';
  
  let cleaned = htmlContent;
  
  // Remove all HTML elements (opening tags, content, closing tags)
  // This regex matches any HTML tag and everything until its closing tag
  cleaned = cleaned.replace(/<[^>]+>.*?<\/[^>]+>/gis, '');
  
  // Remove any remaining standalone tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}
