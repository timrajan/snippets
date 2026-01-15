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


export function filterRowsByColumnValue(sheetData: ExcelRow[], columnName: string, filterValue: string): ExcelRow[] {
    const results: ExcelRow[] = [];
    
    for (const row of sheetData) {
        // Find the matching key (handles \r\n and whitespace)
        const actualKey = Object.keys(row).find(key => 
            key.replace(/[\r\n\t]/g, '').trim() === columnName.trim()
        );
        
        const cellValue = actualKey ? row[actualKey] : undefined;
        
        if (cellValue?.toString().toLowerCase() === filterValue.toLowerCase()) {
            results.push(row);
        }
    }
    
    return results;
}
