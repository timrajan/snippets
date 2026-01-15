
export function filterRowsByColumnValue(sheetData: ExcelRow[], columnName: string, filterValue: string): ExcelRow[] {
    return sheetData.filter((row: ExcelRow) => {
        const cellValue = row[columnName];
        return cellValue?.toString().toLowerCase() === filterValue.toLowerCase();
    });
}
