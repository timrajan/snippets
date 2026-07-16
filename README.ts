// Minimal structural types for xlsx-populate (no official typings)
interface XlsxCell {
    value(): unknown;
    columnNumber(): number;
    rowNumber(): number;
}

interface XlsxRange {
    endCell(): XlsxCell;
}

interface XlsxSheet {
    usedRange(): XlsxRange | undefined;
    cell(row: number, col: number): XlsxCell;
}

interface XlsxWorkbook {
    sheet(name: string): XlsxSheet | undefined;
}
