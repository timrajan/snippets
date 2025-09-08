const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

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
        
        // Error tracking
        this.errors = [];
        this.warnings = [];
        this.complexityScore = 0;
        this.maxComplexity = 100;
    }
    
    // Error logging methods
    logError(level, category, message, details = {}) {
        const error = {
            timestamp: new Date().toISOString(),
            level: level,
            category: category,
            message: message,
            details: details
        };
        
        if (level === 'ERROR') {
            this.errors.push(error);
            console.error(`❌ ${category}: ${message}`);
            if (Object.keys(details).length > 0) {
                console.error(`   Details:`, details);
            }
        } else if (level === 'WARNING') {
            this.warnings.push(error);
            console.warn(`⚠️  ${category}: ${message}`);
            if (Object.keys(details).length > 0) {
                console.warn(`   Details:`, details);
            }
        } else {
            console.log(`ℹ️  ${category}: ${message}`);
        }
    }
    
    // Complexity assessment
    assessComplexity(analysis) {
        let score = 0;
        let reasons = [];
        
        Object.entries(analysis).forEach(([sheetName, data]) => {
            const formulaCount = data.formulas ? data.formulas.length : 0;
            if (formulaCount > 50) {
                score += 20;
                reasons.push(`${sheetName}: ${formulaCount} formulas (high volume)`);
            } else if (formulaCount > 20) {
                score += 10;
                reasons.push(`${sheetName}: ${formulaCount} formulas (moderate volume)`);
            }
            
            if (data.formulas) {
                data.formulas.forEach(formula => {
                    const nestingLevel = this.calculateNestingLevel(formula.formula);
                    if (nestingLevel > 5) {
                        score += 15;
                        reasons.push(`${sheetName}:${formula.address}: Deep nesting (${nestingLevel} levels)`);
                    }
                    
                    const unsupportedFunctions = this.findUnsupportedFunctions(formula.formula);
                    if (unsupportedFunctions.length > 0) {
                        score += 25;
                        reasons.push(`${sheetName}:${formula.address}: Unsupported functions (${unsupportedFunctions.join(', ')})`);
                    }
                });
            }
            
            const columnCount = Object.keys(data.columns || {}).length;
            if (columnCount > 50) {
                score += 15;
                reasons.push(`${sheetName}: Many columns (${columnCount})`);
            }
        });
        
        this.complexityScore = score;
        
        if (score > this.maxComplexity) {
            this.logError('ERROR', 'COMPLEXITY', 
                `Excel file is too complex (score: ${score}/${this.maxComplexity})`, 
                { reasons: reasons, score: score }
            );
        } else if (score > this.maxComplexity * 0.7) {
            this.logError('WARNING', 'COMPLEXITY', 
                `Excel file is moderately complex (score: ${score}/${this.maxComplexity})`, 
                { reasons: reasons, score: score }
            );
        }
        
        return { score, reasons };
    }
    
    calculateNestingLevel(formula) {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (let char of formula) {
            if (char === '(') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (char === ')') {
                currentDepth--;
            }
        }
        
        return maxDepth;
    }
    
    extractUniqueFunctions(formula) {
        const functionPattern = /\b([A-Z][A-Z0-9_]*)\s*\(/g;
        const functions = new Set();
        let match;
        
        while ((match = functionPattern.exec(formula)) !== null) {
            functions.add(match[1]);
        }
        
        return Array.from(functions);
    }
    
    findUnsupportedFunctions(formula) {
        const functions = this.extractUniqueFunctions(formula);
        const supportedFunctions = Object.keys(this.excelFunctionMap);
        
        return functions.filter(func => 
            !supportedFunctions.includes(func) && 
            !['AND', 'OR', 'NOT', 'TRUE', 'FALSE'].includes(func)
        );
    }
    
    validateExcelStructure(analysis) {
        let isValid = true;
        
        Object.entries(analysis).forEach(([sheetName, data]) => {
            if (Object.keys(data.columns || {}).length === 0) {
                this.logError('WARNING', 'STRUCTURE', 
                    `Sheet '${sheetName}' appears to be empty or has no recognizable structure`
                );
            }
            
            if (!data.headers || data.headers.length === 0) {
                this.logError('ERROR', 'STRUCTURE', 
                    `Sheet '${sheetName}' has no headers detected in rows 4-5`, 
                    { expectedRows: '4-5', actualHeaders: data.headers ? data.headers.length : 0 }
                );
                isValid = false;
            }
            
            if (data.formulas) {
                data.formulas.forEach(formula => {
                    try {
                        this.validateFormula(formula);
                    } catch (error) {
                        this.logError('ERROR', 'FORMULA', 
                            `Invalid formula in ${sheetName}:${formula.address}`, 
                            { 
                                formula: formula.formula, 
                                error: error.message,
                                cell: formula.address
                            }
                        );
                        isValid = false;
                    }
                });
                
                this.detectCircularReferences(data.formulas, sheetName);
            }
        });
        
        return isValid;
    }
    
    validateFormula(formula) {
        const openParens = (formula.formula.match(/\(/g) || []).length;
        const closeParens = (formula.formula.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
            throw new Error(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
        }
        
        const unsupported = this.findUnsupportedFunctions(formula.formula);
        if (unsupported.length > 0) {
            this.logError('WARNING', 'FORMULA', 
                `Unsupported functions in ${formula.address}: ${unsupported.join(', ')}`, 
                { formula: formula.formula, unsupportedFunctions: unsupported }
            );
        }
        
        if (formula.formula.length > 1000) {
            this.logError('WARNING', 'FORMULA', 
                `Very long formula in ${formula.address} (${formula.formula.length} characters)`, 
                { length: formula.formula.length, cell: formula.address }
            );
        }
    }
    
    detectCircularReferences(formulas, sheetName) {
        formulas.forEach(formula => {
            const cellRefs = this.extractCellReferences(formula.formula);
            if (cellRefs.includes(formula.address)) {
                this.logError('ERROR', 'FORMULA', 
                    `Circular reference detected in ${sheetName}:${formula.address}`, 
                    { formula: formula.formula, references: cellRefs }
                );
            }
        });
    }
    
    extractCellReferences(formula) {
        const cellRefPattern = /\b[A-Z]+\d+\b/g;
        return formula.match(cellRefPattern) || [];
    }

    analyzeExcelFile(filePath) {
        try {
            console.log(`📊 Analyzing Excel file: ${filePath}`);
            this.logError('INFO', 'ANALYSIS', `Starting analysis of ${filePath}`);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            
            const stats = fs.statSync(filePath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            if (fileSizeMB > 50) {
                this.logError('WARNING', 'PERFORMANCE', 
                    `Large file detected: ${fileSizeMB.toFixed(2)}MB`, 
                    { size: fileSizeMB, threshold: 50 }
                );
            }
            
            const workbook = XLSX.readFile(filePath, {
                cellStyles: true,
                cellFormulas: true,
                cellDates: true,
                cellNF: true,
                sheetStubs: true
            });

            if (workbook.SheetNames.length > 10) {
                this.logError('WARNING', 'COMPLEXITY', 
                    `Many sheets detected: ${workbook.SheetNames.length}`, 
                    { sheetCount: workbook.SheetNames.length, threshold: 10 }
                );
            }

            const analysis = {};
            
            workbook.SheetNames.forEach(sheetName => {
                try {
                    console.log(`📋 Processing sheet: ${sheetName}`);
                    analysis[sheetName] = this.analyzeSheet(workbook.Sheets[sheetName], sheetName);
                } catch (sheetError) {
                    this.logError('ERROR', 'ANALYSIS', 
                        `Failed to analyze sheet '${sheetName}'`, 
                        { error: sheetError.message, sheet: sheetName }
                    );
                    
                    analysis[sheetName] = {
                        error: sheetError.message,
                        columns: {},
                        formulas: [],
                        sampleData: [],
                        headers: [],
                        templateRows: []
                    };
                }
            });
            
            const complexity = this.assessComplexity(analysis);
            const isValid = this.validateExcelStructure(analysis);
            
            if (!isValid && this.complexityScore > this.maxComplexity) {
                throw new Error(
                    `Excel file is too complex and has structural issues. ` +
                    `Complexity score: ${this.complexityScore}/${this.maxComplexity}. ` +
                    `Please simplify the file or check the error log.`
                );
            }
            
            this.logError('INFO', 'ANALYSIS', `Analysis completed successfully`, {
                sheets: Object.keys(analysis).length,
                totalFormulas: Object.values(analysis).reduce((sum, sheet) => sum + (sheet.formulas ? sheet.formulas.length : 0), 0),
                complexityScore: this.complexityScore,
                errors: this.errors.length,
                warnings: this.warnings.length
            });

            return analysis;
            
        } catch (error) {
            this.logError('ERROR', 'ANALYSIS', `Excel analysis failed: ${error.message}`, {
                file: filePath,
                error: error.stack
            });
            throw error;
        }
    }

    analyzeSheet(worksheet, sheetName) {
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
        const columns = {};
        const formulas = [];
        const sampleData = [];
        const headers = [];
        const templateRows = [];

        console.log(`   📋 Extracting template data from rows 1-3`);
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

        console.log(`   📊 Extracting headers from rows 4-5`);
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

        console.log(`   🔍 Analyzing data rows starting from row 6`);
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
            console.log(`   🔄 Converting formula: ${formula}`);
            
            pgFormula = this.convertExcelIFFunction(pgFormula);
            
            Object.entries(this.excelFunctionMap).forEach(([excel, pg]) => {
                if (excel !== 'IF') {
                    const regex = new RegExp(`\\b${excel}\\(`, 'gi');
                    pgFormula = pgFormula.replace(regex, `${pg}(`);
                }
            });
            
            templateRows.forEach((templateRow, rowIndex) => {
                Object.entries(templateRow).forEach(([colLetter, cellData]) => {
                    const templateCellRef = `${colLetter}${rowIndex + 1}`;
                    const regex = new RegExp(`\\b${templateCellRef}\\b`, 'g');
                    
                    if (typeof cellData.value === 'string') {
                        pgFormula = pgFormula.replace(regex, `'${cellData.value.replace(/'/g, "''")}'`);
                    } else {
                        pgFormula = pgFormula.replace(regex, cellData.value.toString());
                    }
                });
            });
            
            headers.forEach(header => {
                const dataRowPattern = new RegExp(`\\b${header.letter}([6-9]|[1-9]\\d+)\\b`, 'g');
                pgFormula = pgFormula.replace(dataRowPattern, `NEW.${header.name}`);
                
                const headerRow4Ref = `${header.letter}4`;
                const headerRow5Ref = `${header.letter}5`;
                
                if (header.row4) {
                    const regex4 = new RegExp(`\\b${headerRow4Ref}\\b`, 'g');
                    const value4 = typeof header.row4 === 'string' ? `'${header.row4.replace(/'/g, "''")}'` : header.row4.toString();
                    pgFormula = pgFormula.replace(regex4, value4);
                }
                
                if (header.row5) {
                    const regex5 = new RegExp(`\\b${headerRow5Ref}\\b`, 'g');
                    const value5 = typeof header.row5 === 'string' ? `'${header.row5.replace(/'/g, "''")}'` : header.row5.toString();
                    pgFormula = pgFormula.replace(regex5, value5);
                }
                
                const rangePattern = new RegExp(`\\b${header.letter}([6-9]|[1-9]\\d+):${header.letter}([6-9]|[1-9]\\d+)\\b`, 'g');
                pgFormula = pgFormula.replace(rangePattern, `ARRAY[NEW.${header.name}]`);
            });
            
            pgFormula = pgFormula.replace(/&/g, ' || ');
            pgFormula = pgFormula.replace(/"/g, "'");
            pgFormula = pgFormula.replace(/TRUE/gi, 'TRUE');
            pgFormula = pgFormula.replace(/FALSE/gi, 'FALSE');
            
            console.log(`   ✅ Converted to: ${pgFormula}`);
            
            return pgFormula;
            
        } catch (error) {
            this.logError('ERROR', 'CONVERSION', 
                `Failed to convert formula: ${formula}`, 
                { error: error.message, originalFormula: formula }
            );
            
            return `'ERROR: ${error.message}'`;
        }
    }
    
    convertExcelIFFunction(formula) {
        let result = formula;
        
        const ifPattern = /\bIF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/gi;
        
        result = result.replace(ifPattern, (match, condition, trueValue, falseValue) => {
            condition = condition.trim();
            trueValue = trueValue.trim();
            falseValue = falseValue.trim();
            
            return `IF_FUNC(${condition}, ${trueValue}, ${falseValue})`;
        });
        
        return result;
    }

    generateExcelFunctions() {
        return `-- Excel function equivalents for PostgreSQL

-- DEC2HEX: Convert decimal to hexadecimal
CREATE OR REPLACE FUNCTION DEC2HEX(decimal_value INTEGER, digits INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF decimal_value IS NULL THEN
        RETURN NULL;
    END IF;
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
    IF input_text IS NULL OR LENGTH(input_text) = 0 THEN
        RETURN NULL;
    END IF;
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
DECLARE
    result TEXT;
    position INTEGER;
    counter INTEGER := 0;
    temp_pos INTEGER;
BEGIN
    IF input_text IS NULL OR old_text IS NULL THEN
        RETURN input_text;
    END IF;
    
    IF new_text IS NULL THEN
        new_text := '';
    END IF;
    
    IF instance_num IS NULL THEN
        RETURN REPLACE(input_text, old_text, new_text);
    ELSE
        result := input_text;
        position := 1;
        
        WHILE position <= LENGTH(result) AND counter < instance_num LOOP
            temp_pos := POSITION(old_text IN SUBSTRING(result FROM position));
            IF temp_pos > 0 THEN
                counter := counter + 1;
                temp_pos := temp_pos + position - 1;
                IF counter = instance_num THEN
                    result := OVERLAY(result PLACING new_text FROM temp_pos FOR LENGTH(old_text));
                    EXIT;
                END IF;
                position := temp_pos + LENGTH(old_text);
            ELSE
                EXIT;
            END IF;
        END LOOP;
        
        RETURN result;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TRIM_FUNC: Remove leading and trailing spaces
CREATE OR REPLACE FUNCTION TRIM_FUNC(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
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
    IF input_value IS NULL OR TRIM(input_value) = '' THEN
        RETURN FALSE;
    END IF;
    
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
    IF input_array IS NULL OR position IS NULL OR position < 1 THEN
        RETURN NULL;
    END IF;
    
    IF position > array_length(input_array, 1) THEN
        RETURN NULL;
    END IF;
    
    RETURN input_array[position];
END;
$$ LANGUAGE plpgsql;

-- MID: Extract substring from middle of text
CREATE OR REPLACE FUNCTION MID(input_text TEXT, start_pos INTEGER, num_chars INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR start_pos IS NULL OR num_chars IS NULL THEN
        RETURN NULL;
    END IF;
    IF start_pos < 1 OR num_chars < 0 THEN
        RETURN '';
    END IF;
    RETURN SUBSTRING(input_text FROM start_pos FOR num_chars);
END;
$$ LANGUAGE plpgsql;

-- MATCH: Find position of value in array
CREATE OR REPLACE FUNCTION MATCH_FUNC(lookup_value TEXT, lookup_array TEXT[], match_type INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
BEGIN
    IF lookup_value IS NULL OR lookup_array IS NULL THEN
        RETURN NULL;
    END IF;
    
    FOR i IN 1..array_length(lookup_array, 1) LOOP
        IF lookup_array[i] = lookup_value THEN
            RETURN i;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- IF_FUNC: Excel-style IF function
CREATE OR REPLACE FUNCTION IF_FUNC(condition BOOLEAN, value_if_true TEXT, value_if_false TEXT)
RETURNS TEXT AS $$
BEGIN
    IF condition IS NULL THEN
        RETURN value_if_false;
    END IF;
    
    IF condition THEN
        RETURN value_if_true;
    ELSE
        RETURN value_if_false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TEXT_FUNC: Format number/date as text with specified format
CREATE OR REPLACE FUNCTION TEXT_FUNC(input_value TEXT, format_string TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    numeric_value NUMERIC;
BEGIN
    IF input_value IS NULL THEN
        RETURN '';
    END IF;
    
    CASE 
        WHEN format_string ILIKE '%0%' OR format_string ILIKE '%#%' THEN
            BEGIN
                numeric_value := input_value::NUMERIC;
                
                CASE 
                    WHEN format_string = '0' THEN
                        result := ROUND(numeric_value)::TEXT;
                    WHEN format_string = '0.0' THEN
                        result := ROUND(numeric_value, 1)::TEXT;
                    WHEN format_string = '0.00' THEN
                        result := ROUND(numeric_value, 2)::TEXT;
                    WHEN format_string ILIKE '%0000%' THEN
                        result := LPAD(ROUND(numeric_value)::TEXT, LENGTH(REPLACE(format_string, '#', '')), '0');
                    ELSE
                        result := numeric_value::TEXT;
                END CASE;
            EXCEPTION WHEN OTHERS THEN
                result := input_value::TEXT;
            END;
            
        WHEN format_string ILIKE '%$%' OR format_string ILIKE '%currency%' THEN
            BEGIN
                numeric_value := input_value::NUMERIC;
                result := '$' || ROUND(numeric_value, 2)::TEXT;
            EXCEPTION WHEN OTHERS THEN
                result := input_value::TEXT;
            END;
            
        WHEN format_string ILIKE '%\%%' THEN
            BEGIN
                numeric_value := input_value::NUMERIC;
                result := ROUND(numeric_value * 100, 2)::TEXT || '%';
            EXCEPTION WHEN OTHERS THEN
                result := input_value::TEXT;
            END;
            
        ELSE
            result := input_value::TEXT;
    END CASE;
    
    RETURN result;
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
            
            sql += `-- ==========================================\n`;
            sql += `-- Table for sheet: ${sheetName}\n`;
            sql += `-- ==========================================\n\n`;
            
            sql += this.generateCreateTable(tableName, data.columns);
            
            if (data.formulas && data.formulas.length > 0) {
                sql += this.generateTriggerFunction(tableName, data.formulas, data.headers, data.templateRows);
                sql += this.generateTrigger(tableName);
            }
            
            sql += this.generateSampleInserts(tableName, data.columns, data.sampleData);
            
            sql += `-- View results\n`;
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
        let sql = `-- Trigger function to calculate Excel formulas\n`;
        sql += `-- Template rows (1-3) and headers (4-5) are referenced as constants\n`;
        sql += `CREATE OR REPLACE FUNCTION calculate_${tableName}_formulas()\n`;
        sql += `RETURNS TRIGGER AS $\n`;
        sql += `BEGIN\n`;
        
        if (templateRows && templateRows.length > 0) {
            sql += `    -- Template data from Excel rows 1-3\n`;
            templateRows.forEach((templateRow, rowIndex) => {
                Object.entries(templateRow).forEach(([colLetter, cellData]) => {
                    sql += `    -- ${colLetter}${rowIndex + 1} = ${cellData.value}\n`;
                });
            });
            sql += `\n`;
        }
        
        formulas.forEach(formula => {
            const pgFormula = this.convertExcelFormula(formula.formula, headers, templateRows);
            sql += `    -- Excel formula in ${formula.address}: ${formula.formula}\n`;
            sql += `    -- Result example: ${formula.value}\n`;
            sql += `    -- Data row: ${formula.dataRow}\n`;
            sql += `    NEW.${formula.column} = ${pgFormula};\n\n`;
        });
        
        sql += `    RETURN NEW;\n`;
        sql += `EXCEPTION WHEN OTHERS THEN\n`;
        sql += `    -- Log error and return original record\n`;
        sql += `    RAISE WARNING 'Formula calculation error in ${tableName}: %', SQLERRM;\n`;
        sql += `    RETURN NEW;\n`;
        sql += `END;\n`;
        sql += `$ LANGUAGE plpgsql;\n\n`;
        
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
            this.logError('INFO', 'CONVERSION', `Starting conversion of ${excelFilePath}`);
            
            // Reset error tracking
            this.errors = [];
            this.warnings = [];
            this.complexityScore = 0;
            
            // Analyze Excel file
            const analysis = this.analyzeExcelFile(excelFilePath);
            
            // Generate SQL
            console.log('🔄 Generating PostgreSQL code...');
            const sql = this.generateSQL(analysis);
            
            // Save or return SQL
            if (outputSQLPath) {
                this.saveSQL(sql, outputSQLPath);
            }
            
            // Print summary with error details
            this.printDetailedSummary(analysis);
            
            return {
                analysis,
                sql,
                errors: this.errors,
                warnings: this.warnings,
                complexityScore: this.complexityScore,
                success: this.errors.length === 0
            };
            
        } catch (error) {
            this.logError('ERROR', 'CONVERSION', `Conversion failed: ${error.message}`, {
                file: excelFilePath,
                error: error.stack
            });
            
            // Generate error report
            this.generateErrorReport(excelFilePath);
            
            throw error;
        }
    }
    
    printDetailedSummary(analysis) {
        console.log('\n📊 DETAILED CONVERSION SUMMARY');
        console.log('='.repeat(60));
        
        // Basic stats
        const totalSheets = Object.keys(analysis).length;
        const totalFormulas = Object.values(analysis).reduce((sum, sheet) => sum + (sheet.formulas?.length || 0), 0);
        const totalColumns = Object.values(analysis).reduce((sum, sheet) => sum + Object.keys(sheet.columns || {}).length, 0);
        
        console.log(`📈 Statistics:`);
        console.log(`   Sheets processed: ${totalSheets}`);
        console.log(`   Total columns: ${totalColumns}`);
        console.log(`   Total formulas: ${totalFormulas}`);
        console.log(`   Complexity score: ${this.complexityScore}/${this.maxComplexity}`);
        
        // Error summary
        console.log(`\n🚨 Issues Found:`);
        console.log(`   Errors: ${this.errors.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ERRORS (${this.errors.length}):`);
            this.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. [${error.category}] ${error.message}`);
                if (error.details && Object.keys(error.details).length > 0) {
                    console.log(`      Details: ${JSON.stringify(error.details, null, 6)}`);
                }
            });
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
            this.warnings.slice(0, 10).forEach((warning, index) => {
                console.log(`   ${index + 1}. [${warning.category}] ${warning.message}`);
            });
            if (this.warnings.length > 10) {
                console.log(`   ... and ${this.warnings.length - 10} more warnings`);
            }
        }
        
        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        this.generateRecommendations();
        
        // Overall status
        if (this.errors.length === 0) {
            if (this.complexityScore > this.maxComplexity * 0.7) {
                console.log('\n🟡 CONVERSION COMPLETED WITH CONCERNS');
                console.log('   The file is complex but was processed successfully.');
                console.log('   Review warnings and test thoroughly.');
            } else {
                console.log('\n✅ CONVERSION COMPLETED SUCCESSFULLY');
            }
        } else {
            console.log('\n🔴 CONVERSION COMPLETED WITH ERRORS');
            console.log('   Some issues require attention before deployment.');
        }
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (this.complexityScore > this.maxComplexity * 0.8) {
            recommendations.push('Consider breaking complex formulas into simpler parts');
            recommendations.push('Use database views for complex calculations instead of triggers');
        }
        
        if (this.errors.filter(e => e.category === 'FORMULA').length > 0) {
            recommendations.push('Review and simplify formulas with errors');
            recommendations.push('Consider using PostgreSQL built-in functions where possible');
        }
        
        if (this.warnings.filter(w => w.category === 'PERFORMANCE').length > 0) {
            recommendations.push('Test performance with production data volumes');
            recommendations.push('Consider indexing on frequently queried columns');
        }
        
        const unsupportedFunctions = new Set();
        this.warnings.forEach(w => {
            if (w.details && w.details.unsupportedFunctions) {
                w.details.unsupportedFunctions.forEach(func => unsupportedFunctions.add(func));
            }
        });
        
        if (unsupportedFunctions.size > 0) {
            recommendations.push(`Implement custom functions for: ${Array.from(unsupportedFunctions).join(', ')}`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push('No specific recommendations - file processed cleanly!');
        }
        
        recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }
    
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
                xlsxVersion: 'unknown'
            }
        };
        
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
    }

    printSummary(analysis) {
        console.log('\n📊 CONVERSION SUMMARY');
        console.log('='.repeat(50));
        
        Object.entries(analysis).forEach(([sheetName, data]) => {
            console.log(`\n📋 Sheet: ${sheetName}`);
            console.log(`   Columns: ${Object.keys(data.columns || {}).length}`);
            console.log(`   Formulas: ${(data.formulas || []).length}`);
            console.log(`   Sample rows: ${(data.sampleData || []).length}`);
            console.log(`   Template rows: ${(data.templateRows || []).length}`);
            
            if (data.templateRows && data.templateRows.length > 0) {
                console.log('   Template data (rows 1-3):');
                data.templateRows.forEach((row, index) => {
                    const rowData = Object.entries(row).map(([col, data]) => `${col}=${data.value}`).join(', ');
                    console.log(`     Row ${index + 1}: ${rowData}`);
                });
            }
            
            console.log('   Headers (rows 4-5):');
            (data.headers || []).forEach(header => {
                const headerInfo = header.row5 ? `${header.row4} + ${header.row5}` : header.row4;
                console.log(`     ${header.letter}: ${headerInfo} → ${header.name}`);
            });
            
            if (data.formulas && data.formulas.length > 0) {
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
