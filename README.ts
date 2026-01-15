export function filterRowsByColumnValue(sheetData: ExcelRow[], columnName: string, filterValue: string): ExcelRow[] {
    const results: ExcelRow[] = [];
    
    for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        const cellValue = row[columnName];
        
        if (cellValue?.toString().toLowerCase() === filterValue.toLowerCase()) {
            results.push(row);
        }
    }
    
    return results;
}
