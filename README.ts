import * as fs from 'fs';

function deleteXmlFileSync(filePath: string): void {
  if (!filePath.endsWith('.xml')) {
    throw new Error('File does not have .xml extension');
  }
  
  fs.unlinkSync(filePath);
}

// Example usage
try {
  deleteXmlFileSync('./path/to/your/file.xml');
  console.log('XML file deleted successfully');
} catch (error) {
  console.error('Failed to delete XML file:', error);
}
