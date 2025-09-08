

generateErrorReport(filePath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = `error_report_${timestamp}.json`;
        
        const report = {
            timestamp: new Date().toISOString(),
            inputFile: filePath,
            complexityScore: this.complexityScore,
            maxComplexity: this.maxComplexity,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                criticalIssues: this.errors.filter(e => e.category === 'STRUCTURE' || e.category === 'FORMULA').length,
                performanceIssues: this.warnings.filter(w => w.category === 'PERFORMANCE').length,
                complexityIssues: this.warnings.filter(w => w.category === 'COMPLEXITY').length
            },
            recommendations: this.getRecommendationsList(),
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                xlsxVersion: require('xlsx').version || 'unknown'
            }
        };
        
        const fs = require('fs');
        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
            console.log(`\n📄 Detailed error report saved to: ${reportPath}`);
        } catch (writeError) {
            console.error(`❌ Failed to save error report: ${writeError.message}`);
        }
        
        return report;
    }
    
    getRecommendationsList() {
        const recommendations = [];
        
        if (this.complexityScore > this.maxComplexity * 0.8) {
            recommendations.push({
                type: 'COMPLEXITY',
                priority: 'HIGH',
                message: 'Consider breaking complex formulas into simpler parts',
                details: 'Use intermediate columns or database views to simplify calculations'
            });
        }
        
        const formulaErrors = this.errors.filter(e => e.category === 'FORMULA').length;
        if (formulaErrors > 0) {
            recommendations.push({
                type: 'FORMULA_ERRORS',
                priority: 'CRITICAL',
                message: `${formulaErrors} formula(s) have conversion errors`,
                details: 'Review formulas with errors and consider manual conversion'
            });
        }
        
        const unsupportedFunctions = new Set();
        this.warnings.forEach(w => {
            if (w.details && w.details.unsupportedFunctions) {
                w.details.unsupportedFunctions.forEach(func => unsupportedFunctions.add(func));
            }
        });
        
        if (unsupportedFunctions.size > 0) {
            recommendations.push({
                type: 'UNSUPPORTED_FUNCTIONS',
                priority: 'MEDIUM',
                message: `Unsupported Excel functions found: ${Array.from(unsupportedFunctions).join(', ')}`,
                details: 'These functions need custom PostgreSQL implementations'
            });
        }
        
        return recommendations;
    }
    
    // Enhanced error handling for specific scenarios
    handleComplexityOverload() {
        const suggestions = [
            '🔧 COMPLEXITY REDUCTION STRATEGIES:',
            '',
            '1. Split Complex Formulas:',
            '   • Break nested formulas into multiple columns',
            '   • Use intermediate calculations',
            '   • Consider database views instead of triggers',
            '',
            '2. Reduce Function Diversity:',
            '   • Consolidate similar calculations',
            '   • Use PostgreSQL native functions where possible',
            '   • Implement custom functions for repeated patterns',
            '',
            '3. Optimize Data Structure:',
            '   • Reduce number of calculated columns',
            '   • Move complex logic to application layer',
            '   • Use materialized views for heavy calculations',
            '',
            '4. File Organization:',
            '   • Split large sheets into smaller ones',
            '   • Separate templates from data',
            '   • Use consistent naming conventions',
            '',
            '5. Performance Considerations:',
            '   • Limit trigger complexity',
            '   • Consider batch processing for large datasets',
            '   • Index frequently accessed columns'
        ];
        
        suggestions.forEach(suggestion => console.log(suggestion));
    }
    
    // Memory and performance monitoring
    checkSystemResources() {
        const used = process.memoryUsage();
        const memoryWarningThreshold = 500 * 1024 * 1024; // 500MB
        
        if (used.heapUsed > memoryWarningThreshold) {
            this.logError('WARNING', 'PERFORMANCE', 
                `High memory usage detected: ${Math.round(used.heapUsed / 1024 / 1024)}MB`,
                { 
                    heapUsed: used.heapUsed,
                    heapTotal: used.heapTotal,
                    threshold: memoryWarningThreshold
                }
            );
        }
        
        return {
            memoryUsage: Math.round(used.heapUsed / 1024 / 1024),
            recommendation: used.heapUsed > memoryWarningThreshold ? 
                'Consider processing file in smaller chunks' : 'Memory usage normal'
        };
    }const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelToPostgreSQLConverter {
    constructor() {
        this.excelFunctionMap = {
            'DEC2HEX': 'DEC2HEX',
            'CODE': 'CODE',
            'CONCAT': 'CONCAT',
            'CONCATENATE': 'CONCAT',
            'LEFT': 'LEFT',
            'RIGHT': 'RIGHT',
            'MID': 'SUBSTRING',
            'LEN': 'LENGTH',
            'UPPER': 'UPPER',
            'LOWER': 'LOWER'
        };
    }

    analyzeExcelFile(filePath) {
        try {
            console.log(`📊 Analyzing Excel file: ${filePath}`);
            
            const workbook = XLSX.readFile(filePath, {
                cellStyles: true,
                cellFormulas: true,
                cellDates: true,
                cellNF: true,
                sheetStubs: true
            });

            const analysis = {};
            
            workbook.SheetNames.forEach(sheetName => {
                console.log(`📋 Processing sheet: ${sheetName}`);
                analysis[sheetName] = this.analyzeSheet(workbook.Sheets[sheetName], sheetName);
            });

            return analysis;
        } catch (error) {
            console.error('❌ Error analyzing Excel file:', error.message);
            throw error;
        }
    }

    analyzeSheet(worksheet, sheetName) {
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
        const columns = {};
        const formulas = [];
        const sampleData = [];
        const headers = [];

        // Extract headers from first row
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({r: 0, c: col});
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
                headers.push({
                    index: col,
                    letter: String.fromCharCode(65 + col),
                    name: this.sanitizeColumnName(cell.v.toString()),
                    originalName: cell.v.toString()
                });
            }
        }

        // Analyze data rows (skip header row)
        for (let row = 1; row <= Math.min(range.e.r, 50); row++) {
            const rowData = {};
            
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                const cell = worksheet[cellAddress];
                const header = headers.find(h => h.index === col);
                
                if (cell && header) {
                    // Check if it's a formula
                    if (cell.f) {
                        formulas.push({
                            address: cellAddress,
                            column: header.name,
                            columnLetter: header.letter,
                            formula: cell.f,
                            value: cell.v,
                            row: row + 1
                        });
                    }
                    
                    // Determine data type
                    const dataType = this.inferDataType(cell.v);
                    
                    if (!columns[header.name]) {
                        columns[header.name] = {
                            name: header.name,
                            originalName: header.originalName,
                            type: dataType,
                            hasFormula: false,
                            samples: [],
                            letter: header.letter
                        };
                    }
                    
                    if (cell.f) {
                        columns[header.name].hasFormula = true;
                    }
                    
                    columns[header.name].samples.push(cell.v);
                    rowData[header.name] = cell.v;
                }
            }
            
            if (Object.keys(rowData).length > 0) {
                sampleData.push(rowData);
            }
        }

        return {
            columns,
            formulas,
            sampleData: sampleData.slice(0, 10),
            headers,
            range: worksheet['!ref']
        };
    }

    sanitizeColumnName(name) {
        return name.toString()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .replace(/^[0-9]/, '_$&') // prefix with _ if starts with number
            .substring(0, 63); // PostgreSQL column name limit
    }

    inferDataType(value) {
        if (value === null || value === undefined) return 'TEXT';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
        }
        if (value instanceof Date) return 'TIMESTAMP';
        if (typeof value === 'boolean') return 'BOOLEAN';
        
        // Check for long text
        if (typeof value === 'string' && value.length > 255) {
            return 'TEXT';
        }
        
        return 'TEXT';
    }

    convertExcelFormula(formula, headers) {
        let pgFormula = formula;
        
        // Replace Excel functions with PostgreSQL equivalents
        Object.entries(this.excelFunctionMap).forEach(([excel, pg]) => {
            const regex = new RegExp(`\\b${excel}\\(`, 'gi');
            pgFormula = pgFormula.replace(regex, `${pg}(`);
        });
        
        // Replace cell references with column names
        headers.forEach(header => {
            // Match patterns like A1, B2, etc. (more comprehensive)
            const cellPattern = new RegExp(`\\b${header.letter}\\$?\\d+\\b`, 'g');
            pgFormula = pgFormula.replace(cellPattern, `NEW.${header.name}`);
            
            // Also handle range references like A1:A10
            const rangePattern = new RegExp(`\\b${header.letter}\\$?\\d+:${header.letter}\\$?\\d+\\b`, 'g');
            pgFormula = pgFormula.replace(rangePattern, `ARRAY[NEW.${header.name}]`);
        });
        
        // Replace Excel operators and syntax
        pgFormula = pgFormula.replace(/&/g, ' || '); // Concatenation
        pgFormula = pgFormula.replace(/"/g, "'"); // Double quotes to single quotes
        pgFormula = pgFormula.replace(/TRUE/gi, 'TRUE'); // Boolean values
        pgFormula = pgFormula.replace(/FALSE/gi, 'FALSE');
        
        // Handle Excel's IF function
        pgFormula = pgFormula.replace(/\bIF\(/gi, 'CASE WHEN ');
        
        // Handle common Excel patterns
        pgFormula = pgFormula.replace(/,(\s*TRUE\s*),(\s*FALSE\s*)\)/g, ' THEN $1 ELSE $2 END');
        
        return pgFormula;
    }

    generateSQL(analysis) {
        let sql = '';
        
        // Add header comment
        sql += `-- Generated PostgreSQL schema from Excel analysis\n`;
        sql += `-- Created at: ${new Date().toISOString()}\n\n`;
        
        // Add Excel function equivalents
        sql += this.generateExcelFunctions();
        
        Object.entries(analysis).forEach(([sheetName, data]) => {
            const tableName = this.sanitizeColumnName(sheetName);
            
            sql += `-- ==========================================\n`;
            sql += `-- Table for sheet: ${sheetName}\n`;
            sql += `-- ==========================================\n\n`;
            
            // Create table
            sql += this.generateCreateTable(tableName, data.columns);
            
            // Create trigger function for formulas
            if (data.formulas.length > 0) {
                sql += this.generateTriggerFunction(tableName, data.formulas, data.headers);
                sql += this.generateTrigger(tableName);
            }
            
            // Generate sample inserts
            sql += this.generateSampleInserts(tableName, data.columns, data.sampleData);
            
            sql += `-- View results\n`;
            sql += `SELECT * FROM ${tableName};\n\n`;
        });
        
        return sql;
    }

    generateExcelFunctions() {
        return `-- Excel function equivalents for PostgreSQL
CREATE OR REPLACE FUNCTION DEC2HEX(decimal_value INTEGER, digits INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF digits IS NULL THEN
        RETURN UPPER(TO_HEX(decimal_value));
    ELSE
        RETURN UPPER(LPAD(TO_HEX(decimal_value), digits, '0'));
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION CODE(input_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF input_text IS NULL OR LENGTH(input_text) = 0 THEN
        RETURN NULL;
    END IF;
    RETURN ASCII(LEFT(input_text, 1));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION HEX2DEC(hex_value TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN ('x' || hex_value)::bit(32)::INTEGER;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

`;
    }

    generateCreateTable(tableName, columns) {
        let sql = `CREATE TABLE ${tableName} (\n`;
        sql += `    id SERIAL PRIMARY KEY,\n`;
        
        // Add regular columns (non-formula)
        Object.values(columns).forEach(col => {
            if (!col.hasFormula) {
                sql += `    ${col.name} ${col.type},\n`;
            }
        });
        
        // Add formula columns
        Object.values(columns).forEach(col => {
            if (col.hasFormula) {
                sql += `    ${col.name} TEXT, -- Calculated field\n`;
            }
        });
        
        sql += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
        sql += `);\n\n`;
        
        return sql;
    }

    generateTriggerFunction(tableName, formulas, headers) {
        let sql = `-- Trigger function to calculate Excel formulas\n`;
        sql += `CREATE OR REPLACE FUNCTION calculate_${tableName}_formulas()\n`;
        sql += `RETURNS TRIGGER AS $$\n`;
        sql += `BEGIN\n`;
        
        formulas.forEach(formula => {
            const pgFormula = this.convertExcelFormula(formula.formula, headers);
            sql += `    -- Excel formula: ${formula.formula}\n`;
            sql += `    -- Result example: ${formula.value}\n`;
            sql += `    NEW.${formula.column} = ${pgFormula};\n\n`;
        });
        
        sql += `    RETURN NEW;\n`;
        sql += `EXCEPTION WHEN OTHERS THEN\n`;
        sql += `    -- Log error and return original record\n`;
        sql += `    RAISE WARNING 'Formula calculation error: %', SQLERRM;\n`;
        sql += `    RETURN NEW;\n`;
        sql += `END;\n`;
        sql += `$$ LANGUAGE plpgsql;\n\n`;
        
        return sql;
    }

    generateTrigger(tableName) {
        return `CREATE TRIGGER ${tableName}_formula_trigger
    BEFORE INSERT OR UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION calculate_${tableName}_formulas();

`;
    }

    generateSampleInserts(tableName, columns, sampleData) {
        let sql = `-- Sample data inserts\n`;
        
        const nonFormulaColumns = Object.values(columns)
            .filter(col => !col.hasFormula)
            .map(col => col.name);
        
        if (nonFormulaColumns.length === 0) {
            return sql + `-- No non-formula columns to insert\n\n`;
        }
        
        sampleData.slice(0, 5).forEach((row, index) => {
            const values = nonFormulaColumns.map(colName => {
                const value = row[colName];
                if (value === null || value === undefined) {
                    return 'NULL';
                }
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`;
                }
                if (value instanceof Date) {
                    return `'${value.toISOString()}'`;
                }
                return value.toString();
            });
            
            sql += `INSERT INTO ${tableName} (${nonFormulaColumns.join(', ')}) VALUES (${values.join(', ')});\n`;
        });
        
        return sql + '\n';
    }

    saveSQL(sql, outputPath) {
        fs.writeFileSync(outputPath, sql, 'utf8');
        console.log(`✅ SQL saved to: ${outputPath}`);
    }

    // Main conversion method
    convert(excelFilePath, outputSQLPath = null) {
        try {
            console.log('🚀 Starting Excel to PostgreSQL conversion...\n');
            
            // Analyze Excel file
            const analysis = this.analyzeExcelFile(excelFilePath);
            
            // Generate SQL
            console.log('🔄 Generating PostgreSQL code...');
            const sql = this.generateSQL(analysis);
            
            // Save or return SQL
            if (outputSQLPath) {
                this.saveSQL(sql, outputSQLPath);
            }
            
            // Print summary
            this.printSummary(analysis);
            
            return {
                analysis,
                sql
            };
            
        } catch (error) {
            console.error('❌ Conversion failed:', error.message);
            throw error;
        }
    }

    printSummary(analysis) {
        console.log('\n📊 CONVERSION SUMMARY');
        console.log('='.repeat(50));
        
        Object.entries(analysis).forEach(([sheetName, data]) => {
            console.log(`\n📋 Sheet: ${sheetName}`);
            console.log(`   Columns: ${Object.keys(data.columns).length}`);
            console.log(`   Formulas: ${data.formulas.length}`);
            console.log(`   Sample rows: ${data.sampleData.length}`);
            console.log(`   Template rows: ${data.templateRows.length}`);
            
            // Show template data
            if (data.templateRows.length > 0) {
                console.log('   Template data (rows 1-3):');
                data.templateRows.forEach((row, index) => {
                    const rowData = Object.entries(row).map(([col, data]) => `${col}=${data.value}`).join(', ');
                    console.log(`     Row ${index + 1}: ${rowData}`);
                });
            }
            
            // Show headers
            console.log('   Headers (rows 4-5):');
            data.headers.forEach(header => {
                const headerInfo = header.row5 ? `${header.row4} + ${header.row5}` : header.row4;
                console.log(`     ${header.letter}: ${headerInfo} → ${header.name}`);
            });
            
            if (data.formulas.length > 0) {
                console.log('   Formula columns:');
                data.formulas.forEach(f => {
                    console.log(`     - ${f.column} (Row ${f.row}): ${f.formula}`);
                });
            }
        });
        console.log('\n✅ Conversion completed successfully!');
    }
}

// Example usage
function main() {
    const converter = new ExcelToPostgreSQLConverter();
    
    // Configuration
    const excelFile = 'SQL.xlsx'; // Your Excel file
    const outputFile = 'generated_schema.sql'; // Output SQL file
    
    try {
        const result = converter.convert(excelFile, outputFile);
        
        // Optionally print the SQL to console
        console.log('\n📄 Generated SQL:');
        console.log('-'.repeat(50));
        console.log(result.sql);
        
    } catch (error) {
        console.error('Failed to convert Excel file:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = ExcelToPostgreSQLConverter;

// Run if called directly
if (require.main === module) {
    main();
}
