import * as fs from 'fs';
import * as path from 'path';

function findFolderFromRoot(folderName: string): string[] {
    const foundPaths: string[] = [];
    
    // Get root directory
    const root = path.parse(process.cwd()).root; // 'C:\' on Windows, '/' on Unix
    
    function searchRecursively(currentPath: string) {
        try {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                
                try {
                    const stats = fs.statSync(fullPath);
                    
                    if (stats.isDirectory()) {
                        if (item === folderName) {
                            foundPaths.push(fullPath);
                        }
                        searchRecursively(fullPath);
                    }
                } catch (error) {
                    // Skip files/folders we can't access
                    continue;
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    searchRecursively(root);
    return foundPaths;
}

// Usage
const paths = findFolderFromRoot('node_modules');
console.log('Found paths:', paths);
