// types/Person.ts
export interface Person {
  FirstName: string;
  LastName: string;
  Age: number;
  OfficeID: number;
  DOB: Date;
  hasChair: boolean;
}

// utils/excelReader.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { Person } from '../types/Person';

export class PersonExcelReader {
  /**
   * Reads Excel file and converts each row to Person objects
   * @param filePath Path to the Excel file
   * @param sheetName Name of the sheet to read from
   * @returns Array of Person objects
   */
  static readPersonsFromExcel(filePath: string, sheetName: string): Person[] {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath, {
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      // Check if the specified sheet exists
      if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      }

      // Get the specified sheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON array (raw format)
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as any[][];

      // Validate that we have enough rows
      if (rawData.length < 3) {
        throw new Error(`Sheet "${sheetName}" must have at least 3 rows (header + data)`);
      }

      // Skip the first row (appears to be a header row with "Home", null, null, "Office")
      // The actual headers are in row 2 (index 1): ["FirstName", "LastName", "Age", "OfficeID", "DOB", "hasChair"]
      // Data starts from row 3 (index 2)
      const headerRow = rawData[1];
      const dataRows = rawData.slice(2);

      // Validate headers
      const expectedHeaders = ['FirstName', 'LastName', 'Age', 'OfficeID', 'DOB', 'hasChair'];
      if (!this.validateHeaders(headerRow, expectedHeaders)) {
        console.warn('Headers may not match expected format:', headerRow);
      }

      // Convert each row to Person object
      const persons: Person[] = dataRows.map((row, index) => {
        try {
          return {
            FirstName: this.validateString(row[0], `Row ${index + 3}, FirstName`),
            LastName: this.validateString(row[1], `Row ${index + 3}, LastName`),
            Age: this.validateNumber(row[2], `Row ${index + 3}, Age`),
            OfficeID: this.validateNumber(row[3], `Row ${index + 3}, OfficeID`),
            DOB: this.validateDate(row[4], `Row ${index + 3}, DOB`),
            hasChair: this.validateBoolean(row[5], `Row ${index + 3}, hasChair`)
          };
        } catch (error) {
          throw new Error(`Error processing row ${index + 3}: ${error.message}`);
        }
      });

      return persons;
    } catch (error) {
      throw new Error(`Failed to read Excel file "${filePath}", sheet "${sheetName}": ${error.message}`);
    }
  }

  /**
   * Reads Excel file asynchronously
   * @param filePath Path to the Excel file
   * @param sheetName Name of the sheet to read from
   * @returns Promise<Array<Person>>
   */
  static async readPersonsFromExcelAsync(filePath: string, sheetName: string): Promise<Person[]> {
    return new Promise((resolve, reject) => {
      try {
        const persons = this.readPersonsFromExcel(filePath, sheetName);
        resolve(persons);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get available sheet names from an Excel file
   * @param filePath Path to the Excel file
   * @returns Array of sheet names
   */
  static getSheetNames(filePath: string): string[] {
    try {
      const workbook = XLSX.readFile(filePath);
      return workbook.SheetNames;
    } catch (error) {
      throw new Error(`Failed to read sheet names from "${filePath}": ${error.message}`);
    }
  }

  /**
   * Check if a specific sheet exists in the Excel file
   * @param filePath Path to the Excel file
   * @param sheetName Name of the sheet to check
   * @returns boolean
   */
  static sheetExists(filePath: string, sheetName: string): boolean {
    try {
      const sheetNames = this.getSheetNames(filePath);
      return sheetNames.includes(sheetName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Writes Person objects to an Excel file
   * @param persons Array of Person objects to write
   * @param filePath Path where the Excel file should be saved
   * @param sheetName Name of the sheet to write to (default: 'Sheet1')
   * @param overwrite Whether to overwrite existing file (default: true)
   */
  static writePersonsToExcel(
    persons: Person[], 
    filePath: string, 
    sheetName: string = 'Sheet1', 
    overwrite: boolean = true
  ): void {
    try {
      let workbook: XLSX.WorkBook;
      
      // If file exists and we don't want to overwrite, load existing workbook
      if (!overwrite && fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
      } else {
        // Create new workbook
        workbook = XLSX.utils.book_new();
      }

      // Create the data array with headers
      const data: any[][] = [];
      
      // Add category headers (row 1)
      data.push(['Home', null, null, 'Office', null, null]);
      
      // Add column headers (row 2)
      data.push(['FirstName', 'LastName', 'Age', 'OfficeID', 'DOB', 'hasChair']);
      
      // Add person data (row 3 onwards)
      persons.forEach(person => {
        data.push([
          person.FirstName,
          person.LastName,
          person.Age,
          person.OfficeID,
          this.formatDateForExcel(person.DOB),
          person.hasChair ? 'Yes' : 'No'
        ]);
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Set column widths for better readability
      worksheet['!cols'] = [
        { width: 15 }, // FirstName
        { width: 15 }, // LastName
        { width: 8 },  // Age
        { width: 12 }, // OfficeID
        { width: 12 }, // DOB
        { width: 10 }  // hasChair
      ];

      // Add or replace the sheet in the workbook
      if (workbook.Sheets[sheetName]) {
        // Replace existing sheet
        workbook.Sheets[sheetName] = worksheet;
      } else {
        // Add new sheet
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Write the file
      XLSX.writeFile(workbook, filePath);
      
      console.log(`Successfully wrote ${persons.length} persons to "${filePath}", sheet "${sheetName}"`);
      
    } catch (error) {
      throw new Error(`Failed to write Excel file "${filePath}", sheet "${sheetName}": ${error.message}`);
    }
  }

  /**
   * Appends Person objects to an existing Excel file
   * @param persons Array of Person objects to append
   * @param filePath Path to the existing Excel file
   * @param sheetName Name of the sheet to append to
   */
  static appendPersonsToExcel(persons: Person[], filePath: string, sheetName: string): void {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File "${filePath}" does not exist. Use writePersonsToExcel to create a new file.`);
      }

      // Read existing workbook
      const workbook = XLSX.readFile(filePath);
      
      if (!workbook.Sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" does not exist in "${filePath}"`);
      }

      // Convert existing sheet to array
      const existingData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }) as any[][];
      
      // Append new person data
      persons.forEach(person => {
        existingData.push([
          person.FirstName,
          person.LastName,
          person.Age,
          person.OfficeID,
          this.formatDateForExcel(person.DOB),
          person.hasChair ? 'Yes' : 'No'
        ]);
      });

      // Create new worksheet from updated data
      const worksheet = XLSX.utils.aoa_to_sheet(existingData);
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 15 }, // FirstName
        { width: 15 }, // LastName
        { width: 8 },  // Age
        { width: 12 }, // OfficeID
        { width: 12 }, // DOB
        { width: 10 }  // hasChair
      ];

      // Replace the sheet
      workbook.Sheets[sheetName] = worksheet;

      // Write the file
      XLSX.writeFile(workbook, filePath);
      
      console.log(`Successfully appended ${persons.length} persons to "${filePath}", sheet "${sheetName}"`);
      
    } catch (error) {
      throw new Error(`Failed to append to Excel file "${filePath}", sheet "${sheetName}": ${error.message}`);
    }
  }

  /**
   * Writes Person objects to Excel asynchronously
   * @param persons Array of Person objects to write
   * @param filePath Path where the Excel file should be saved
   * @param sheetName Name of the sheet to write to
   * @param overwrite Whether to overwrite existing file
   */
  static async writePersonsToExcelAsync(
    persons: Person[], 
    filePath: string, 
    sheetName: string = 'Sheet1', 
    overwrite: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.writePersonsToExcel(persons, filePath, sheetName, overwrite);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to validate headers
  private static validateHeaders(actualHeaders: any[], expectedHeaders: string[]): boolean {
    if (!actualHeaders || actualHeaders.length < expectedHeaders.length) {
      return false;
    }
    
    return expectedHeaders.every((expected, index) => {
      return actualHeaders[index] === expected;
    });
  }

  // Validation helpers
  private static validateString(value: any, context: string): string {
    if (typeof value !== 'string' && value !== null && value !== undefined) {
      return String(value);
    }
    if (!value || value.trim() === '') {
      throw new Error(`${context}: Invalid string value`);
    }
    return value.trim();
  }

  private static validateNumber(value: any, context: string): number {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`${context}: Invalid number value`);
    }
    return num;
  }

  private static validateDate(value: any, context: string): Date {
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      throw new Error(`${context}: Invalid date value`);
    }
    
    if (isNaN(date.getTime())) {
      throw new Error(`${context}: Invalid date value`);
    }
    
    return date;
  }

  private static validateBoolean(value: any, context: string): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1') {
        return true;
      }
      if (lowerValue === 'no' || lowerValue === 'false' || lowerValue === '0') {
        return false;
      }
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    throw new Error(`${context}: Invalid boolean value`);
  }

  /**
   * Formats a Date object for Excel output
   * @param date Date object to format
   * @returns Formatted date string
   */
  private static formatDateForExcel(date: Date): string {
    // Format as YYYY-MM-DD for Excel compatibility
    return date.toISOString().split('T')[0];
  }
}

// example/usage.ts
import { PersonExcelReader } from '../utils/excelReader';
import { Person } from '../types/Person';

async function main() {
  try {
    const filePath = './Data.xlsx';
    const sheetName = 'Sheet1'; // Specify the sheet name
    
    // First, let's see what sheets are available
    console.log('Available sheets:');
    const sheetNames = PersonExcelReader.getSheetNames(filePath);
    sheetNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    
    // Check if our target sheet exists
    if (!PersonExcelReader.sheetExists(filePath, sheetName)) {
      console.error(`Sheet "${sheetName}" does not exist!`);
      return;
    }
    
    console.log(`\nReading from sheet: "${sheetName}"`);
    
    // Synchronous reading with both parameters
    const persons: Person[] = PersonExcelReader.readPersonsFromExcel(filePath, sheetName);
    
    console.log('Persons loaded:', persons.length);
    console.log('First person:', persons[0]);
    
    // Process each person
    persons.forEach((person, index) => {
      console.log(`Person ${index + 1}:`);
      console.log(`  Name: ${person.FirstName} ${person.LastName}`);
      console.log(`  Age: ${person.Age}`);
      console.log(`  Office ID: ${person.OfficeID}`);
      console.log(`  Date of Birth: ${person.DOB.toISOString().split('T')[0]}`);
      console.log(`  Has Chair: ${person.hasChair ? 'Yes' : 'No'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
  }
}

// Example of writing persons to Excel
async function writeExample() {
  try {
    // Create some sample Person objects
    const samplePersons: Person[] = [
      {
        FirstName: 'John',
        LastName: 'Doe',
        Age: 30,
        OfficeID: 12345,
        DOB: new Date('1993-05-15'),
        hasChair: true
      },
      {
        FirstName: 'Jane',
        LastName: 'Smith',
        Age: 28,
        OfficeID: 12346,
        DOB: new Date('1995-08-20'),
        hasChair: false
      },
      {
        FirstName: 'Bob',
        LastName: 'Johnson',
        Age: 35,
        OfficeID: 12347,
        DOB: new Date('1988-12-10'),
        hasChair: true
      }
    ];

    // Write to a new Excel file
    const outputFilePath = './Output.xlsx';
    const outputSheetName = 'Employees';
    
    console.log('\n=== Writing Persons to Excel ===');
    PersonExcelReader.writePersonsToExcel(samplePersons, outputFilePath, outputSheetName);
    
    // Verify by reading it back
    console.log('\n=== Verifying Written Data ===');
    const readBackPersons = PersonExcelReader.readPersonsFromExcel(outputFilePath, outputSheetName);
    
    console.log(`Successfully wrote and read back ${readBackPersons.length} persons`);
    readBackPersons.forEach((person, index) => {
      console.log(`  ${index + 1}. ${person.FirstName} ${person.LastName} (Age: ${person.Age})`);
    });

    // Example of appending more data
    console.log('\n=== Appending More Data ===');
    const additionalPersons: Person[] = [
      {
        FirstName: 'Alice',
        LastName: 'Wilson',
        Age: 32,
        OfficeID: 12348,
        DOB: new Date('1991-03-25'),
        hasChair: true
      }
    ];
    
    PersonExcelReader.appendPersonsToExcel(additionalPersons, outputFilePath, outputSheetName);
    
    // Read again to verify append
    const finalPersons = PersonExcelReader.readPersonsFromExcel(outputFilePath, outputSheetName);
    console.log(`Total persons after append: ${finalPersons.length}`);
    
  } catch (error) {
    console.error('Error in write example:', error.message);
  }
}

// Example with async writing
async function asyncWriteExample() {
  try {
    const persons: Person[] = [
      {
        FirstName: 'Charlie',
        LastName: 'Brown',
        Age: 40,
        OfficeID: 99999,
        DOB: new Date('1983-07-04'),
        hasChair: false
      }
    ];

    console.log('\n=== Async Writing Example ===');
    await PersonExcelReader.writePersonsToExcelAsync(persons, './AsyncOutput.xlsx', 'AsyncSheet');
    console.log('Async write completed successfully!');
    
  } catch (error) {
    console.error('Error in async write example:', error.message);
  }
}

// Example of reading from one file and writing to another
async function processAndWriteExample() {
  try {
    console.log('\n=== Process and Write Example ===');
    
    // Read from original file
    const inputFilePath = './Data.xlsx';
    const inputSheetName = 'Sheet1';
    
    if (!PersonExcelReader.sheetExists(inputFilePath, inputSheetName)) {
      console.log('Input file not found, using sample data instead');
      return;
    }
    
    const originalPersons = PersonExcelReader.readPersonsFromExcel(inputFilePath, inputSheetName);
    
    // Process the data (example: filter people over 25)
    const filteredPersons = originalPersons.filter(person => person.Age > 25);
    
    // Write filtered data to new file
    const processedFilePath = './ProcessedData.xlsx';
    const processedSheetName = 'FilteredEmployees';
    
    PersonExcelReader.writePersonsToExcel(
      filteredPersons, 
      processedFilePath, 
      processedSheetName, 
      true // overwrite if exists
    );
    
    console.log(`Filtered ${originalPersons.length} persons down to ${filteredPersons.length} (Age > 25)`);
    console.log(`Results saved to: ${processedFilePath}`);
    
  } catch (error) {
    console.error('Error in process and write example:', error.message);
  }
}

// If running this file directly
if (require.main === module) {
  main()
    .then(() => writeExample())
    .then(() => asyncWriteExample())
    .then(() => processAndWriteExample());
}

export { main, writeExample, asyncWriteExample, processAndWriteExample };
