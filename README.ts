import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds a new row to an Excel file with proper handling of large numbers and style preservation
 * @param filePath - Path to the Excel file
 * @param sheetName - Name of the sheet to update
 * @param rowValues - Object containing column-value pairs for the new row (e.g., { name: 'John', age: 30 })
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
      sheetStubs: true     // Keep empty cells
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
    
    // Determine range of the current data
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const lastRow = range.e.r;
    
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
      // Handle string numbers that should be preserved exactly
      else if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 12) {
        // Keep as string
        rowValues[key] = value;
      }
    });
    
    // Add the new row directly to the worksheet
    // First, get the header row to determine column order
    const headers = [];
    const headerRow = 0; // Assuming headers are in the first row
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({r: headerRow, c: col});
      if (worksheet[cellAddress]) {
        headers[col] = worksheet[cellAddress].v;
      }
    }
    
    // Add the new row at the end
    for (let col = range.s.c; col <= range.e.c; col++) {
      const header = headers[col];
      if (header && rowValues.hasOwnProperty(header)) {
        const cellAddress = XLSX.utils.encode_cell({r: lastRow + 1, c: col});
        const value = rowValues[header];
        
        // Create cell with appropriate type and formatting
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
        } else if (typeof value === 'string') {
          cell.t = 's';
          // For strings that look like large numbers, enforce text format
          if (/^\d+$/.test(value) && value.length > 12) {
            cell.z = '@';
          }
        } else {
          cell.t = 's';
        }
        
        // Copy style from row above if available (for consistent styling)
        const styleCellAddress = XLSX.utils.encode_cell({r: lastRow, c: col});
        if (worksheet[styleCellAddress] && worksheet[styleCellAddress].s) {
          cell.s = JSON.parse(JSON.stringify(worksheet[styleCellAddress].s)); // Deep clone to avoid reference issues
        }
        
        worksheet[cellAddress] = cell;
      }
    }
    
    // Update worksheet range to include the new row
    worksheet['!ref'] = XLSX.utils.encode_range({
      s: range.s,
      e: { r: lastRow + 1, c: range.e.c }
    });
    
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
