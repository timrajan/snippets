/**
 * Creates a text file with the provided strings
 * @param filename - Name of the file to create (with or without .txt extension)
 * @param strings - Array of strings to write to the file
 * @param outputDir - Optional directory path (defaults to current directory)
 * @param separator - Optional separator between strings (defaults to newline)
 */
function createTextFile(
  filename: string,
  strings: string[],
  outputDir?: string,
  separator: string = '\n'
): void {
  try {
    // Ensure filename has .txt extension
    const fileName = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    
    // Determine the full file path
    const filePath = outputDir ? path.join(outputDir, fileName) : fileName;
    
    // Create directory if it doesn't exist
    if (outputDir && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Join strings with separator and write to file
    const content = strings.join(separator);
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Text file created successfully: ${filePath}`);
    console.log(`📄 Content preview: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    
  } catch (error) {
    console.error('❌ Error creating text file:', error);
    throw error;
  }
}
