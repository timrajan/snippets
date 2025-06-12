findFolderPath = async (folderName: string): Promise<string> => {
    const projectRoot = this.getProjectRoot();
    
    function searchRecursively(currentPath: string): string {
        try {
            const items = fs.readdirSync(currentPath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory()) {
                    const fullPath = path.join(currentPath, item.name);
                    
                    // Check if this is the folder we're looking for
                    if (item.name === folderName) {
                        return fullPath;
                    }
                    
                    // Recursively search in subdirectories
                    try {
                        const result = searchRecursively(fullPath);
                        if (result) {
                            return result;
                        }
                    } catch (error) {
                        // Skip folders we can't access
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
        return "";
    }
    
    return searchRecursively(projectRoot);
};
