findFolderPath = async(folderName: string): Promise<string> =>{
        
        const projectRoot =this.getProjectRoot()
        function searchRecursively(currentPath: string) {
            try {
                const items = fs.readdirSync(currentPath, { withFileTypes: true });
                items
                .filter(item => item.isDirectory())
                .forEach(dir => {
                    const fullPath = path.join(currentPath, dir.name);
                    try {
                        const stats = fs.statSync(fullPath);
                        if (stats.isDirectory()) {
                            if (dir.name === folderName) {
                                return fullPath;
                            }
                            searchRecursively(fullPath);
                        }
                    } catch (error) {
                        // Skip files/folders we can't access
                        
                    }
                });
            } catch (error) {
                // Skip directories we can't read
            }
            return ""
        }
        const foundPath= searchRecursively(projectRoot);
        return foundPath;
    }
