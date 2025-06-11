import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively finds all folder names that contain a sugar.json file
 * @param rootPath - The root directory to search from
 * @returns Array of folder names (string[]) that contain sugar.json
 */
export function findFoldersWithSugarJson(rootPath: string): string[] {
  const folderNames: string[] = [];

  function searchDirectory(currentPath: string): void {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      // Check if current directory contains sugar.json
      const hasSugarJson = items.some(item => 
        item.isFile() && item.name === 'sugar.json'
      );
      
      if (hasSugarJson) {
        const folderName = path.basename(currentPath);
        folderNames.push(folderName);
      }
      
      // Recursively search subdirectories
      items
        .filter(item => item.isDirectory())
        .forEach(dir => {
          const subDirPath = path.join(currentPath, dir.name);
          searchDirectory(subDirPath);
        });
        
    } catch (error) {
      // Skip directories we can't read (permissions, etc.)
      console.warn(`Cannot read directory: ${currentPath}`);
    }
  }

  searchDirectory(rootPath);
  return folderNames; // Returns string[] of folder names
}

// Example usage:
// const folderNames: string[] = findFoldersWithSugarJson('./src');
// console.log(folderNames); // ['project1', 'nested', 'components']

// Jest tests
describe('findFoldersWithSugarJson', () => {
  const testDir = path.join(__dirname, 'test-structure');
  
  beforeAll(() => {
    // Create test directory structure
    const dirs = [
      'test-structure/project1',
      'test-structure/project2/nested',
      'test-structure/project3',
      'test-structure/empty-folder'
    ];
    
    dirs.forEach(dir => {
      fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
    });
    
    // Create sugar.json files in specific folders
    fs.writeFileSync(path.join(__dirname, 'test-structure/project1/sugar.json'), '{}');
    fs.writeFileSync(path.join(__dirname, 'test-structure/project2/nested/sugar.json'), '{}');
    fs.writeFileSync(path.join(__dirname, 'test-structure/project3/other.json'), '{}'); // Not sugar.json
  });
  
  afterAll(() => {
    // Clean up test files
    fs.rmSync(testDir, { recursive: true, force: true });
  });
  
  test('should find folders containing sugar.json', () => {
    const result = findFoldersWithSugarJson(testDir);
    
    expect(result).toHaveLength(2);
    expect(result).toContain('project1');
    expect(result).toContain('nested');
    expect(result).not.toContain('project2'); // doesn't directly contain sugar.json
    expect(result).not.toContain('project3'); // contains other.json, not sugar.json
    expect(result).not.toContain('empty-folder');
  });
   
   
