const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

class SqlExtractor {
    constructor(projectPath) {
        this.projectPath = projectPath;
    }

    /**
     * Recursively finds all .sql files in the project directory
     */
    findSqlFiles(dir) {
        const sqlFiles = [];
        
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip common directories that typically don't contain SQL files
                    const skipDirs = ['node_modules', 'bin', 'obj', '.git', '.vs', 'packages'];
                    if (!skipDirs.includes(item)) {
                        sqlFiles.push(...this.findSqlFiles(fullPath));
                    }
                } else if (stat.isFile() && path.extname(item).toLowerCase() === '.sql') {
                    sqlFiles.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error.message);
        }
        
        return sqlFiles;
    }

    /**
     * Reads the content of a SQL file
     */
    readSqlFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
            return `Error reading file: ${error.message}`;
        }
    }

    /**
     * Extracts SQL file information
     */
    extractSqlFiles() {
        console.log(`Scanning project at: ${this.projectPath}`);
        
        if (!fs.existsSync(this.projectPath)) {
            throw new Error(`Project path does not exist: ${this.projectPath}`);
        }

        const sqlFilePaths = this.findSqlFiles(this.projectPath);
        console.log(`Found ${sqlFilePaths.length} SQL files`);

        const sqlFileInfos = [];

        for (const filePath of sqlFilePaths) {
            const fileName = path.basename(filePath);
            const sqlContent = this.readSqlFile(filePath);
            
            sqlFileInfos.push({
                fileName: fileName,
                sqlContent: sqlContent
            });
            
            console.log(`Processed: ${fileName}`);
        }

        return sqlFileInfos;
    }

    /**
     * Exports SQL file information to Excel
     */
    exportToExcel(sqlFileInfos, outputPath) {
        // Prepare data for Excel
        const worksheetData = [
            ['File Name', 'SQL Query'], // Header row
            ...sqlFileInfos.map(info => [info.fileName, info.sqlContent])
        ];

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Auto-size columns
        const colWidths = [
            { wpx: 200 }, // File Name column width
            { wpx: 400 }  // SQL Query column width
        ];
        worksheet['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SQL Files');

        // Write to file
        XLSX.writeFile(workbook, outputPath);
        console.log(`Excel file created: ${outputPath}`);
    }

    /**
     * Main execution method
     */
    async execute(outputExcelPath) {
        try {
            // Extract SQL file information
            const sqlFileInfos = this.extractSqlFiles();

            if (sqlFileInfos.length === 0) {
                console.log('No SQL files found in the project.');
                return;
            }

            // Set default output path if not provided
            const excelPath = outputExcelPath || path.join(process.cwd(), 'sql_files_export.xlsx');

            // Export to Excel
            this.exportToExcel(sqlFileInfos, excelPath);

            console.log(`\nSummary:`);
            console.log(`- Total SQL files processed: ${sqlFileInfos.length}`);
            console.log(`- Excel file location: ${excelPath}`);

        } catch (error) {
            console.error('Error during execution:', error.message);
            throw error;
        }
    }
}

// Main execution function
async function main() {
    // Get project path from command line arguments or use default
    const projectPath = process.argv[2];
    const outputPath = process.argv[3];

    if (!projectPath) {
        console.log('Usage: node sql-extractor.js <project-path> [output-excel-path]');
        console.log('Example: node sql-extractor.js "C:\\path\\to\\your\\csharp\\project"');
        console.log('Example: node sql-extractor.js "C:\\path\\to\\your\\csharp\\project" "C:\\output\\my_sql_files.xlsx"');
        process.exit(1);
    }

    console.log('SQL Files Extractor Started...\n');

    try {
        const extractor = new SqlExtractor(projectPath);
        await extractor.execute(outputPath);
        console.log('\nExtraction completed successfully!');
    } catch (error) {
        console.error('\nExtraction failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = { SqlExtractor };

// Run main function if this file is executed directly
if (require.main === module) {
    main();
}




mkdir sql-extractor
cd sql-extractor
npm init -y

npm install xlsx

# Basic usage
node sql-extractor.js "C:\path\to\your\csharp\project"

# With custom output file
node sql-extractor.js "C:\path\to\your\csharp\project" "C:\output\my_sql_files.xlsx"

# Example for Windows
node sql-extractor.js "C:\Users\YourName\Documents\MyCSharpProject"

# Example for Mac/Linux
node sql-extractor.js "/Users/YourName/Documents/MyCSharpProject"
