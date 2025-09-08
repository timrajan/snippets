const XLSX = require('xlsx');
const fs = require('fs');

class ExcelToPostgreSQLConverter {
    constructor() {
        this.excelFunctionMap = {
            'DEC2HEX': 'DEC2HEX',
            'CODE': 'CODE',
            'CONCAT': 'CONCAT',
            'CONCATENATE': 'CONCATENATE',
            'SUBSTITUTE': 'SUBSTITUTE',
            'TRIM': 'TRIM_FUNC',
            'ISBLANK': 'ISBLANK',
            'ISNUMBER': 'ISNUMBER',
            'INDEX': 'INDEX_FUNC',
            'MID': 'MID',
            'MATCH': 'MATCH_FUNC',
            'LEFT': 'LEFT',
            'RIGHT': 'RIGHT',
            'LEN': 'LENGTH',
            'UPPER': 'UPPER',
            'LOWER': 'LOWER',
            'IF': 'IF_FUNC',
            'TEXT': 'TEXT_FUNC'
        };
    }

    // Helper method to escape regex special characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    analyzeExcelFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const workbook = XLSX.readFile(filePath, {
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });

        const analysis = {};
        workbook.SheetNames.forEach(sheetName => {
            analysis[sheetName] = this.analyzeSheet(workbook.Sheets[sheetName], sheetName);
        });

        return analysis;
    }

    analyzeSheet(worksheet, sheetName) {
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
        const columns = {};
        const formulas = [];
        const sampleData = [];
        const headers = [];
        const templateRows = [];

        // Extract template data from rows 1-3
        for (let row = 0; row < 3; row++) {
            const templateRow = {};
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                const cell = worksheet[cellAddress];
                if (cell && cell.v) {
                    templateRow[String.fromCharCode(65 + col)] = {
                        value: cell.v,
                        address: cellAddress
                    };
                }
            }
            templateRows.push(templateRow);
        }

        // Extract headers from rows 4-5
        for (let col = range.s.c; col <= range.e.c; col++) {
            const headerRow4Address = XLSX.utils.encode_cell({r: 3, c: col});
            const headerRow5Address = XLSX.utils.encode_cell({r: 4, c: col});

            const cellRow4 = worksheet[headerRow4Address];
            const cellRow5 = worksheet[headerRow5Address];

            if (cellRow4 && cellRow4.v) {
                const headerName = cellRow5 && cellRow5.v
                    ? `${cellRow4.v}_${cellRow5.v}`
                    : cellRow4.v.toString();

                headers.push({
                    index: col,
                    letter: String.fromCharCode(65 + col),
                    name: this.sanitizeColumnName(headerName),
                    originalName: headerName,
                    row4: cellRow4.v,
                    row5: cellRow5 ? cellRow5.v : null
                });
            }
        }

        // Analyze data rows starting from row 6
        for (let row = 5; row <= Math.min(range.e.r, 50); row++) {
            const rowData = {};

            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                const cell = worksheet[cellAddress];
                const header = headers.find(h => h.index === col);

                if (cell && header) {
                    if (cell.f) {
                        formulas.push({
                            address: cellAddress,
                            column: header.name,
                            columnLetter: header.letter,
                            formula: cell.f,
                            value: cell.v,
                            row: row + 1,
                            dataRow: row - 4
                        });
                    }

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
            templateRows,
            range: worksheet['!ref']
        };
    }

    sanitizeColumnName(name) {
        return name.toString()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .replace(/^[0-9]/, '_$&')
            .substring(0, 63);
    }

    inferDataType(value) {
        if (value === null || value === undefined) return 'TEXT';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
        }
        if (value instanceof Date) return 'TIMESTAMP';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'string' && value.length > 255) {
            return 'TEXT';
        }
        return 'TEXT';
    }

    convertExcelFormula(formula, headers, templateRows = []) {
        let pgFormula = formula;

        try {
            pgFormula = this.convertExcelIFFunction(pgFormula);

            Object.entries(this.excelFunctionMap).forEach(([excel, pg]) => {
                if (excel !== 'IF') {
                    const regex = new RegExp(`\\b${excel}\\(`, 'gi');
                    pgFormula = pgFormula.replace(regex, `${pg}(`);
                }
            });

            // Replace template cell references
            templateRows.forEach((templateRow, rowIndex) => {
                Object.entries(templateRow).forEach(([colLetter, cellData]) => {
                    const templateCellRef = `${colLetter}${rowIndex + 1}`;
                    const regex = new RegExp(`\\b${this.escapeRegex(templateCellRef)}\\b`, 'g');

                    if (typeof cellData.value === 'string') {
                        pgFormula = pgFormula.replace(regex, `'${cellData.value.replace(/'/g, "''")}'`);
                    } else {
                        pgFormula = pgFormula.replace(regex, cellData.value.toString());
                    }
                });
            });

            headers.forEach(header => {
                // Replace data row references
                const dataRowPattern = new RegExp(`\\b${this.escapeRegex(header.letter)}([6-9]|[1-9]\\d+)\\b`, 'g');
                pgFormula = pgFormula.replace(dataRowPattern, `NEW.${header.name}`);

                // Replace header references
                const headerRow4Ref = `${header.letter}4`;
                const headerRow5Ref = `${header.letter}5`;

                if (header.row4) {
                    const regex4 = new RegExp(`\\b${this.escapeRegex(headerRow4Ref)}\\b`, 'g');
                    const value4 = typeof header.row4 === 'string' ? `'${header.row4.replace(/'/g, "''")}'` : header.row4.toString();
                    pgFormula = pgFormula.replace(regex4, value4);
                }

                if (header.row5) {
                    const regex5 = new RegExp(`\\b${this.escapeRegex(headerRow5Ref)}\\b`, 'g');
                    const value5 = typeof header.row5 === 'string' ? `'${header.row5.replace(/'/g, "''")}'` : header.row5.toString();
                    pgFormula = pgFormula.replace(regex5, value5);
                }

                // Replace range references
                const rangePattern = new RegExp(`\\b${this.escapeRegex(header.letter)}([6-9]|[1-9]\\d+):${this.escapeRegex(header.letter)}([6-9]|[1-9]\\d+)\\b`, 'g');
                pgFormula = pgFormula.replace(rangePattern, `ARRAY[NEW.${header.name}]`);
            });

            // Convert Excel operators to PostgreSQL
            pgFormula = pgFormula.replace(/&/g, ' || ');
            pgFormula = pgFormula.replace(/"/g, "'");
            pgFormula = pgFormula.replace(/TRUE/gi, 'TRUE');
            pgFormula = pgFormula.replace(/FALSE/gi, 'FALSE');

            return pgFormula;

        } catch (error) {
            return `'ERROR: ${error.message}'`;
        }
    }

    convertExcelIFFunction(formula) {
        const ifPattern = /\bIF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/gi;
        return formula.replace(ifPattern, (match, condition, trueValue, falseValue) => {
            return `IF_FUNC(${condition.trim()}, ${trueValue.trim()}, ${falseValue.trim()})`;
        });
    }

    generateExcelFunctions() {
        return `-- Excel function equivalents for PostgreSQL

-- DEC2HEX: Convert decimal to hexadecimal
CREATE OR REPLACE FUNCTION DEC2HEX(decimal_value INTEGER, digits INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF decimal_value IS NULL THEN RETURN NULL; END IF;
    IF digits IS NULL THEN
        RETURN UPPER(TO_HEX(decimal_value));
    ELSE
        RETURN UPPER(LPAD(TO_HEX(decimal_value), digits, '0'));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- CODE: Get ASCII value of first character
CREATE OR REPLACE FUNCTION CODE(input_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF input_text IS NULL OR LENGTH(input_text) = 0 THEN RETURN NULL; END IF;
    RETURN ASCII(LEFT(input_text, 1));
END;
$$ LANGUAGE plpgsql;

-- CONCATENATE: Join multiple strings
CREATE OR REPLACE FUNCTION CONCATENATE(VARIADIC args TEXT[])
RETURNS TEXT AS $$
BEGIN
    RETURN ARRAY_TO_STRING(args, '');
END;
$$ LANGUAGE plpgsql;

-- SUBSTITUTE: Replace occurrences of text
CREATE OR REPLACE FUNCTION SUBSTITUTE(input_text TEXT, old_text TEXT, new_text TEXT, instance_num INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR old_text IS NULL THEN RETURN input_text; END IF;
    IF new_text IS NULL THEN new_text := ''; END IF;
    IF instance_num IS NULL THEN
        RETURN REPLACE(input_text, old_text, new_text);
    ELSE
        -- Simple implementation for specific instance replacement
        RETURN REPLACE(input_text, old_text, new_text);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TRIM_FUNC: Remove leading and trailing spaces
CREATE OR REPLACE FUNCTION TRIM_FUNC(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN RETURN NULL; END IF;
    RETURN TRIM(input_text);
END;
$$ LANGUAGE plpgsql;

-- ISBLANK: Check if cell is blank/null
CREATE OR REPLACE FUNCTION ISBLANK(input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN input_value IS NULL OR TRIM(COALESCE(input_value, '')) = '';
END;
$$ LANGUAGE plpgsql;

-- ISNUMBER: Check if value is numeric
CREATE OR REPLACE FUNCTION ISNUMBER(input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF input_value IS NULL OR TRIM(input_value) = '' THEN RETURN FALSE; END IF;
    BEGIN
        PERFORM TRIM(input_value)::NUMERIC;
        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql;

-- INDEX_FUNC: Return value from array at specified position
CREATE OR REPLACE FUNCTION INDEX_FUNC(input_array TEXT[], position INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF input_array IS NULL OR position IS NULL OR position < 1 THEN RETURN NULL; END IF;
    IF position > array_length(input_array, 1) THEN RETURN NULL; END IF;
    RETURN input_array[position];
END;
$$ LANGUAGE plpgsql;

-- MID: Extract substring from middle of text
CREATE OR REPLACE FUNCTION MID(input_text TEXT, start_pos INTEGER, num_chars INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR start_pos IS NULL OR num_chars IS NULL THEN RETURN NULL; END IF;
    IF start_pos < 1 OR num_chars < 0 THEN RETURN ''; END IF;
    RETURN SUBSTRING(input_text FROM start_pos FOR num_chars);
END;
$$ LANGUAGE plpgsql;

-- MATCH_FUNC: Find position of value in array
CREATE OR REPLACE FUNCTION MATCH_FUNC(lookup_value TEXT, lookup_array TEXT[], match_type INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
BEGIN
    IF lookup_value IS NULL OR lookup_array IS NULL THEN RETURN NULL; END IF;
    FOR i IN 1..array_length(lookup_array, 1) LOOP
        IF lookup_array[i] = lookup_value THEN RETURN i; END IF;
    END LOOP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- IF_FUNC: Excel-style IF function
CREATE OR REPLACE FUNCTION IF_FUNC(condition BOOLEAN, value_if_true TEXT, value_if_false TEXT)
RETURNS TEXT AS $$
BEGIN
    IF condition IS NULL THEN RETURN value_if_false; END IF;
    IF condition THEN RETURN value_if_true; ELSE RETURN value_if_false; END IF;
END;
$$ LANGUAGE plpgsql;

-- TEXT_FUNC: Format number/date as text with specified format
CREATE OR REPLACE FUNCTION TEXT_FUNC(input_value TEXT, format_string TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_value IS NULL THEN RETURN ''; END IF;
    -- Simplified implementation
    RETURN input_value::TEXT;
END;
$$ LANGUAGE plpgsql;

`;
    }

    generateSQL(analysis) {
        let sql = '';

        sql += `-- Generated PostgreSQL schema from Excel analysis\n`;
        sql += `-- Created at: ${new Date().toISOString()}\n\n`;

        sql += this.generateExcelFunctions();

        Object.entries(analysis).forEach(([sheetName, data]) => {
            const tableName = this.sanitizeColumnName(sheetName);

            sql += `-- Table for sheet: ${sheetName}\n`;
            sql += this.generateCreateTable(tableName, data.columns);

            if (data.formulas && data.formulas.length > 0) {
                sql += this.generateTriggerFunction(tableName, data.formulas, data.headers, data.templateRows);
                sql += this.generateTrigger(tableName);
            }

            sql += this.generateSampleInserts(tableName, data.columns, data.sampleData);
            sql += `SELECT * FROM ${tableName};\n\n`;
        });

        return sql;
    }

    generateCreateTable(tableName, columns) {
        let sql = `CREATE TABLE ${tableName} (\n`;
        sql += `    id SERIAL PRIMARY KEY,\n`;

        Object.values(columns || {}).forEach(col => {
            if (!col.hasFormula) {
                sql += `    ${col.name} ${col.type},\n`;
            }
        });

        Object.values(columns || {}).forEach(col => {
            if (col.hasFormula) {
                sql += `    ${col.name} TEXT, -- Calculated field\n`;
            }
        });

        sql += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
        sql += `);\n\n`;

        return sql;
    }

    generateTriggerFunction(tableName, formulas, headers, templateRows = []) {
        let sql = `CREATE OR REPLACE FUNCTION calculate_${tableName}_formulas()\n`;
        sql += `RETURNS TRIGGER AS $$\n`;
        sql += `BEGIN\n`;

        formulas.forEach(formula => {
            const pgFormula = this.convertExcelFormula(formula.formula, headers, templateRows);
            sql += `    -- Excel: ${formula.formula}\n`;
            sql += `    NEW.${formula.column} = ${pgFormula};\n\n`;
        });

        sql += `    RETURN NEW;\n`;
        sql += `EXCEPTION WHEN OTHERS THEN\n`;
        sql += `    RAISE WARNING 'Formula error in ${tableName}: %', SQLERRM;\n`;
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

        const nonFormulaColumns = Object.values(columns || {})
            .filter(col => !col.hasFormula)
            .map(col => col.name);

        if (nonFormulaColumns.length === 0) {
            return sql + `-- No non-formula columns to insert\n\n`;
        }

        (sampleData || []).slice(0, 5).forEach((row, index) => {
            const values = nonFormulaColumns.map(colName => {
                const value = row[colName];
                if (value === null || value === undefined) return 'NULL';
                if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                if (value instanceof Date) return `'${value.toISOString()}'`;
                return value.toString();
            });

            sql += `INSERT INTO ${tableName} (${nonFormulaColumns.join(', ')}) VALUES (${values.join(', ')});\n`;
        });

        return sql + '\n';
    }

    saveSQL(sql, outputPath) {
        fs.writeFileSync(outputPath, sql, 'utf8');
        console.log(`SQL saved to: ${outputPath}`);
    }

    convert(excelFilePath, outputSQLPath = null) {
        try {
            console.log('Starting Excel to PostgreSQL conversion...');
            
            const analysis = this.analyzeExcelFile(excelFilePath);
            const sql = this.generateSQL(analysis);

            if (outputSQLPath) {
                this.saveSQL(sql, outputSQLPath);
            }

            console.log('Conversion completed successfully!');

            return {
                analysis,
                sql,
                success: true
            };

        } catch (error) {
            console.error('Conversion failed:', error.message);
            throw error;
        }
    }
}

// Example usage
function main() {
    const converter = new ExcelToPostgreSQLConverter();

    const excelFile = 'SQL.xlsx';
    const outputFile = 'generated_schema.sql';

    try {
        const result = converter.convert(excelFile, outputFile);
        console.log('\nGenerated SQL:');
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
