import * as fs from 'fs';

interface CSVProcessor {
  inputFilePath: string;
  outputFilePath: string;
}

class CSVTCRemover implements CSVProcessor {
  inputFilePath: string;
  outputFilePath: string;

  constructor(inputPath: string, outputPath: string) {
    this.inputFilePath = inputPath;
    this.outputFilePath = outputPath;
  }

  processCSVFile(): void {
    try {
      // Read the CSV file
      const csvContent = fs.readFileSync(this.inputFilePath, 'utf-8');
      
      // Split into lines
      const lines = csvContent.split('\n');
      const processedLines: string[] = [];

      // Process each line
      lines.forEach((line, index) => {
        if (line.trim() === '') {
          processedLines.push(line); // Keep empty lines
          return;
        }

        // Split the line by comma (basic CSV parsing)
        const columns = line.split(',');
        
        // Get value from first column
        const firstColumnValue = columns[0] || '';
        
        // Remove 'TC' from the string
        const processedValue = firstColumnValue.replace(/TC/g, '');
        
        // Ensure we have at least 3 columns
        while (columns.length < 3) {
          columns.push('');
        }
        
        // Set the third column to the processed value
        columns[2] = processedValue;
        
        // Join back into CSV format
        const processedLine = columns.join(',');
        processedLines.push(processedLine);
        
        console.log(`Row ${index + 1}: "${firstColumnValue}" -> "${processedValue}"`);
      });

      // Write the processed CSV
      fs.writeFileSync(this.outputFilePath, processedLines.join('\n'));
      
      console.log(`✅ Processing complete! Output saved to: ${this.outputFilePath}`);
      
    } catch (error) {
      console.error('❌ Error processing CSV file:', error);
      throw error;
    }
  }
}

// Even simpler function-based approach
function processCSVRemoveTC(inputPath: string, outputPath: string): void {
  try {
    const csvContent = fs.readFileSync(inputPath, 'utf-8');
    
    const processedLines = csvContent
      .split('\n')
      .map((line, index) => {
        if (line.trim() === '') return line;
        
        const columns = line.split(',');
        const firstColumnValue = columns[0] || '';
        const processedValue = firstColumnValue.replace(/TC/g, '');
        
        // Ensure 3 columns exist
        while (columns.length < 3) columns.push('');
        columns[2] = processedValue;
        
        console.log(`Row ${index + 1}: "${firstColumnValue}" -> "${processedValue}"`);
        return columns.join(',');
      });
    
    fs.writeFileSync(outputPath, processedLines.join('\n'));
    console.log(`✅ Processing complete! Output saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error processing CSV file:', error);
    throw error;
  }
}

// Ultra-simple one-liner approach (for basic CSVs without quotes/commas in values)
const quickProcessCSV = (input: string, output: string) => {
  fs.writeFileSync(output, 
    fs.readFileSync(input, 'utf-8')
      .split('\n')
      .map(line => {
        if (!line.trim()) return line;
        const cols = line.split(',');
        while (cols.length < 3) cols.push('');
        cols[2] = (cols[0] || '').replace(/TC/g, '');
        return cols.join(',');
      })
      .join('\n')
  );
};

// Usage example
function main() {
  const inputFile = 'input.csv';
  const outputFile = 'output.csv';
  
  // Choose one of these approaches:
  
  // Approach 1: Class-based
  const processor = new CSVTCRemover(inputFile, outputFile);
  processor.processCSVFile();
  
  // Approach 2: Function-based
  // processCSVRemoveTC(inputFile, outputFile);
  
  // Approach 3: Ultra-simple
  // quickProcessCSV(inputFile, outputFile);
}

// Export for use in other modules
export { CSVTCRemover, processCSVRemoveTC, quickProcessCSV };

// Uncomment to run
// main();
