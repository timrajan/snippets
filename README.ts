import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Adds a new row to an Excel file
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
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Check if the specified sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet '${sheetName}' not found in the workbook`);
    }
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert the worksheet to JSON for easier manipulation
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Add the new row
    jsonData.push(rowValues);
    
    // Convert the JSON data back to a worksheet
    const updatedWorksheet = XLSX.utils.json_to_sheet(jsonData);
    
    // Update the workbook
    workbook.Sheets[sheetName] = updatedWorksheet;
    
    // Write the updated workbook back to the file
    XLSX.writeFile(workbook, filePath);
    
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




// Add a new employee
addRowToExcelFile(
  'employees.xlsx',
  'EmployeeData',
  { 
    employeeId: 'EMP456',
    name: 'Jane Smith',
    department: 'Sales',
    position: 'Account Executive',
    salary: 72000,
    hireDate: '2025-04-28'
  }
);
