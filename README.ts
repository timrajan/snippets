export function getProjectRoot(): string {
  let currentDir = __dirname;
  
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    try {
      require.resolve(packageJsonPath);
      return currentDir; // Found package.json, this is the project root
    } catch {
      currentDir = path.dirname(currentDir); // Go up one level
    }
  }
