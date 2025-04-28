const bookType = ['xlsx', 'xlsm', 'xlsb', 'xls', 'csv'].includes(fileExtension) 
                   ? fileExtension as XLSX.BookType 
                   : 'xlsx' as XLSX.BookType;



import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds a new row to an Excel file with proper handling of large numbers
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
    
    // Read the Excel file with full options to preserve number formats
    const workbook = XLSX.readFile(filePath, {
      cellText: false,
      cellDates: true,
      cellNF: true
    });
    
    // Check if the specified sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet '${sheetName}' not found in the workbook`);
    }
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert the worksheet to JSON for easier manipulation
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Process large numbers in rowValues to ensure they're stored as strings if needed
    Object.keys(rowValues).forEach(key => {
      const value = rowValues[key];
      
      // Check if this is a large number that might be converted to scientific notation
      if (typeof value === 'number' && 
          (value > 999999999999 || value < -999999999999 || 
           (value < 0.0001 && value > 0) || (value > -0.0001 && value < 0))) {
        // Convert to string and flag for special handling
        rowValues[key] = { v: value.toString(), t: 's' };
      }
      // Handle numbers that look like strings but should be preserved exactly as entered
      else if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 12) {
        // Store as string type to preserve exact representation
        rowValues[key] = { v: value, t: 's' };
      }
    });
    
    // Add the new row
    jsonData.push(rowValues);
    
    // Convert the JSON data back to a worksheet with options to preserve number formatting
    const updatedWorksheet = XLSX.utils.json_to_sheet(jsonData, { 
      cellDates: true,
      dateNF: 'yyyy-mm-dd'
    });
    
    // Apply number formatting to preserve large numbers
    Object.keys(updatedWorksheet).forEach(cell => {
      if (typeof cell === 'string' && cell[0] !== '!') {
        const cellValue = updatedWorksheet[cell];
        if (cellValue && cellValue.t === 's' && /^\d+$/.test(cellValue.v) && cellValue.v.length > 12) {
          // Force text format for cells with large numbers
          if (!updatedWorksheet['!cols']) updatedWorksheet['!cols'] = [];
          const colIndex = XLSX.utils.decode_cell(cell).c;
          if (!updatedWorksheet['!cols'][colIndex]) updatedWorksheet['!cols'][colIndex] = {};
          updatedWorksheet['!cols'][colIndex].numFmt = '@';
        }
      }
    });
    
    // Update the workbook
    workbook.Sheets[sheetName] = updatedWorksheet;
    
    // Write the updated workbook back to the file with options to preserve formats
    XLSX.writeFile(workbook, filePath, {
      bookSST: true,  // Generate Shared String Table for better string handling
      type: 'file',
      cellStyles: true,
      bookType: path.extname(filePath).substring(1) || 'xlsx'
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
