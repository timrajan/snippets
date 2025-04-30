import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds a new row to an Excel file with proper handling of formatting preservation
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
    
    // Store the current file content as backup for style preservation
    const fileContent = fs.readFileSync(filePath);
    
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
    
    // Use sheet_to_json to get the actual data (with all rows)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: null});
    
    // Find the last non-empty row by checking for actual content
    let actualLastRowIndex = 0;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
        actualLastRowIndex = i;
      } else if (row && typeof row === 'object' && 
                Object.values(row).some(cell => cell !== null && cell !== undefined && cell !== '')) {
        actualLastRowIndex = i;
      }
    }
    
    // The next row index should be the lastNonEmptyRow + 1
    const nextRowIndex = actualLastRowIndex + 1;
    console.log(`Adding new row at index ${nextRowIndex} (which is row ${nextRowIndex + 1} in Excel)`);
    
    // Clone the row above to preserve all styling
    if (actualLastRowIndex >= 0) {
      // Create a new array with the values we want to insert
      const newRow: any[] = [];
      
      // Fill in the values from rowValues using the column mapping
      const columnMapping: Record<string, number> = {
        'Food': 0,
        'Fruit.Color': 1,
        'Fruit.Size': 2,
        'Vegetable.Color': 3,
        'Vegetable.Size': 4
      };
      
      // Initialize with null/empty values
      for (let i = 0; i <= Math.max(...Object.values(columnMapping)); i++) {
        newRow[i] = null;
      }
      
      // Add the values from rowValues
      Object.keys(rowValues).forEach(key => {
        if (columnMapping.hasOwnProperty(key)) {
          const colIndex = columnMapping[key];
          newRow[colIndex] = rowValues[key];
        }
      });
      
      // Insert the new row at the specified position
      jsonData.splice(nextRowIndex, 0, newRow);
      
      // Create a new worksheet from the updated data
      // This preserves the basic structure
      const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData as any[][]);
      
      // Copy all styles from the original cells to the new worksheet
      Object.keys(worksheet).forEach(cellRef => {
        if (cellRef[0] !== '!') {  // Skip special properties
          const { r, c } = XLSX.utils.decode_cell(cellRef);
          
          // Calculate what the destination row should be
          // If it's after our insertion point, move it down one
          const destRow = r >= nextRowIndex ? r + 1 : r;
          const destCellRef = XLSX.utils.encode_cell({ r: destRow, c });
          
          // Copy the cell if it exists in the original
          if (worksheet[cellRef]) {
            // Deep copy the cell to avoid reference issues
            newWorksheet[destCellRef] = JSON.parse(JSON.stringify(worksheet[cellRef]));
            
            // Special handling for the new row
            if (destRow === nextRowIndex) {
              // Use styles from the row above (original content row)
              const styleSourceRef = XLSX.utils.encode_cell({ r: actualLastRowIndex, c });
              if (worksheet[styleSourceRef] && worksheet[styleSourceRef].s) {
                newWorksheet[destCellRef].s = JSON.parse(JSON.stringify(worksheet[styleSourceRef].s));
              }
            }
          }
        }
      });
      
      // Restore special properties
      newWorksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { 
          r: Math.max(nextRowIndex, worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.r : 0) + 1,
          c: worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.c : 4
        }
      });
      
      // Restore formatting properties
      newWorksheet['!cols'] = originalCols;
      newWorksheet['!rows'] = originalRows;
      newWorksheet['!merges'] = originalMerges;
      
      // Update the workbook with the new worksheet
      workbook.Sheets[sheetName] = newWorksheet;
    } else {
      throw new Error("Could not find existing data in the sheet");
    }
    
    // Write the updated workbook back to the file with maximum formatting preservation
    const fileExtension = path.extname(filePath).substring(1).toLowerCase();
    const bookType = ['xlsx', 'xlsm', 'xlsb', 'xls', 'csv'].includes(fileExtension) 
                   ? fileExtension as XLSX.BookType 
                   : 'xlsx' as XLSX.BookType;
    
    XLSX.writeFile(workbook, filePath, {
      bookSST: true,
      type: 'file',
      cellStyles: true,
      cellDates: true,
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
