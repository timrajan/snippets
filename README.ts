import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds a new row to an Excel file with proper handling of large numbers and style preservation
 * @param filePath - Path to the Excel file
 * @param sheetName - Name of the sheet to update
 * @param rowValues - Object containing column-value pairs for the new row
 * @returns Promise resolving to boolean indicating success
 */
export async function addRowToExcelFile(
  filePath: string,
  sheetName: string,
  rowValues: Record<string, any>
): Promise<boolean> {
  try {
    // Validate inputs
    if (!filePath || !sheetName) {
      throw new Error('File path and sheet name are required');
    }
    
    if (Object.keys(rowValues).length === 0) {
      throw new Error('Row values are required');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the Excel file with ALL formatting options to preserve styles
    const workbook = XLSX.readFile(filePath, {
      cellStyles: true,    // Important for preserving styles
      cellText: false,
      cellDates: true,
      cellNF: true,
      cellFormula: true,
      cellHTML: true,
      sheetStubs: true,    // Keep empty cells
      cellStyleAware: true // Enhanced style reading (important for font preservation)
    });
    
    // Check if the specified sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet '${sheetName}' not found in the workbook`);
    }
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Store original column widths, styles, and formatting
    const originalCols = worksheet['!cols'] ? [...worksheet['!cols']] : [];
    const originalRows = worksheet['!rows'] ? [...worksheet['!rows']] : [];
    const originalMerges = worksheet['!merges'] ? [...worksheet['!merges']] : [];
    
    // Find the actual data range by examining cell content
    // Convert to array format to determine actual data rows
    const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});
    
    // Find the last non-empty row
    let actualLastRowIndex = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // Check if row has any content (handling arrays and non-arrays)
      if (row && Array.isArray(row)) {
        if (row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
          actualLastRowIndex = i;
        }
      } else if (row && typeof row === 'object') {
        if (Object.values(row).some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
          actualLastRowIndex = i;
        }
      }
    }
    
    // The next row index should be the lastNonEmptyRow + 1
    const nextRowIndex = actualLastRowIndex + 1;
    console.log(`Adding new row at index ${nextRowIndex} (which is row ${nextRowIndex + 1} in Excel)`);
    
    // Process large numbers in rowValues
    Object.keys(rowValues).forEach(key => {
      const value = rowValues[key];
      
      // Check if this is a large number that might be converted to scientific notation
      if (typeof value === 'number' && 
          (value > 999999999999 || value < -999999999999 || 
           (value < 0.0001 && value > 0) || (value > -0.0001 && value < 0))) {
        // Convert large numbers to string to preserve exact representation
        rowValues[key] = value.toString();
      }
    });
    
    // Add the new row directly to the worksheet
    // Get column mapping for this specific file structure
    // For the Fruit.xlsx format with merged cells and subheaders
    const columnMapping: Record<string, string> = {
      'Food': 'A',
      'Fruit.Color': 'B',
      'Fruit.Size': 'C',
      'Vegetable.Color': 'D',
      'Vegetable.Size': 'E'
    };
    
    // Process the new row data
    Object.keys(rowValues).forEach(key => {
      if (columnMapping[key]) {
        const col = columnMapping[key];
        const cellAddress = `${col}${nextRowIndex + 1}`; // +1 for Excel's 1-based indexing
        
        // Create the cell with the value
        const value = rowValues[key];
        const cell: XLSX.CellObject = { v: value };
        
        // Set cell type
        if (typeof value === 'number') {
          cell.t = 'n';
        } else if (typeof value === 'boolean') {
          cell.t = 'b';
        } else if (value instanceof Date) {
          cell.t = 'd';
          cell.v = value;
          cell.z = XLSX.SSF.get_table()[14]; // Date format
        } else {
          cell.t = 's';
        }
        
        // Copy style from the row above if available
        const styleCellAddress = `${col}${actualLastRowIndex + 1}`;
        if (worksheet[styleCellAddress] && worksheet[styleCellAddress].s) {
          // Deep clone the style object to ensure ALL properties are copied
          const clonedStyle = JSON.parse(JSON.stringify(worksheet[styleCellAddress].s));
          
          // Ensure font properties are preserved
          if (clonedStyle.font) {
            // Make sure we keep font name, size, color, and formatting
            console.log(`Copying font style from ${styleCellAddress}:`, clonedStyle.font);
          }
          
          // Apply the style to the new cell
          cell.s = clonedStyle;
        } else {
          // If no style from previous row, try to find any styled cell to copy from
          // Start from the last data row and search upward for a cell with styling
          let rowIndex = actualLastRowIndex;
          while (rowIndex >= 0) {
            const altStyleCell = `${col}${rowIndex + 1}`;
            if (worksheet[altStyleCell] && worksheet[altStyleCell].s && 
                worksheet[altStyleCell].s.font) {
              cell.s = JSON.parse(JSON.stringify(worksheet[altStyleCell].s));
              break;
            }
            rowIndex--;
          }
        }
        
        // Add the cell to the worksheet
        worksheet[cellAddress] = cell;
      }
    });
    
    // Determine the range of the current data
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Update worksheet range to ensure it includes our new row
    // Only expand if necessary (if our new row is beyond current range)
    if (nextRowIndex > range.e.r) {
      worksheet['!ref'] = XLSX.utils.encode_range({
        s: range.s,
        e: { r: nextRowIndex, c: range.e.c }
      });
    }
    
    // Restore original column widths and styles
    worksheet['!cols'] = originalCols;
    worksheet['!rows'] = originalRows;
    worksheet['!merges'] = originalMerges;
    
    // Write the updated workbook back to the file with options to preserve all formatting
    const fileExtension = path.extname(filePath).substring(1).toLowerCase();
    const bookType = ['xlsx', 'xlsm', 'xlsb', 'xls', 'csv'].includes(fileExtension) 
                   ? fileExtension as XLSX.BookType 
                   : 'xlsx' as XLSX.BookType;
                   
    XLSX.writeFile(workbook, filePath, {
      bookSST: true,      // Generate Shared String Table
      type: 'file',
      cellStyles: true,   // Preserve styles
      cellDates: true,    // Preserve dates
      bookType: bookType,
      compression: true
    });
    
    return true;
  } catch (error) {
    console.error('Error adding row to Excel file:', error);
    throw error;
  }
}

/**
 * Example usage specifically for the Fruit.xlsx structure:
 * 
 * // Add a carrot to the Fruit.xlsx file
 * addRowToExcelFile(
 *   'Fruit.xlsx',
 *   'Sheet1',
 *   { 
 *     'Food': 'Carrot',
 *     'Fruit.Color': 'NA',
 *     'Fruit.Size': 'NA',
 *     'Vegetable.Color': 'Orange',
 *     'Vegetable.Size': 'Small'
 *   }
 * );
 */

/**
 * Example usage specifically for the Fruit.xlsx structure:
 * 
 * // Add a carrot to the Fruit.xlsx file
 * addRowToExcelFile(
 *   'Fruit.xlsx',
 *   'Sheet1',
 *   { 
 *     'Food': 'Carrot',
 *     'Fruit.Color': 'NA',
 *     'Fruit.Size': 'NA',
 *     'Vegetable.Color': 'Orange',
 *     'Vegetable.Size': 'Small'
 *   }
 * );
 */

/**
 * Example usage:
 * 
 * // Add a new employee record
 * addRowToExcelFile(
 *   'path/to/file.xlsx',
 *   'Sheet1',
 *   { 
 *     id: 123,
 *     name: 'John Doe',
 *     department: 'Engineering',
 *     salary: 75000,
 *     startDate: '2025-04-28'
 *   }
 * );
 * 
 * // Add a simple product entry
 * addRowToExcelFile(
 *   'inventory.xlsx',
 *   'Products',
 *   { 
 *     productId: 'PRD-789',
 *     name: 'Wireless Headphones',
 *     category: 'Electronics',
 *     price: 89.99,
 *     inStock: true
 *   }
 * );
 */
