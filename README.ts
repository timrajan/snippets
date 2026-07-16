function readParamsFromSheet(
    workbook: any, // xlsx-populate Workbook
    paramsSheetName: string
): { paramNames: string[]; rows: Record<string, string>[] } {
    const sheet = workbook.sheet(paramsSheetName);
    if (!sheet) {
        throw new Error(`Params sheet "${paramsSheetName}" not found.`);
    }

    const usedRange = sheet.usedRange();
    if (!usedRange) {
        // sheet is completely empty
        return { paramNames: [], rows: [] };
    }
    const endCell = usedRange.endCell();
    const lastCol = endCell.columnNumber();
    const lastRow = endCell.rowNumber();

    // --- header row ---
    const paramNames: string[] = [];
    const colIndexByName: Record<string, number> = {};
    for (let c = 1; c <= lastCol; c++) {
        const name = String(sheet.cell(1, c).value() ?? "").trim();
        if (name !== "") {
            paramNames.push(name);
            colIndexByName[name] = c;
        }
    }

    // --- data rows ---
    const rows: Record<string, string>[] = [];
    for (let i = 2; i <= lastRow; i++) {
        const record: Record<string, string> = {};
        let hasAny = false;
        for (const name of paramNames) {
            const v = String(sheet.cell(i, colIndexByName[name]).value() ?? "").trim();
            record[name] = v;
            if (v !== "") hasAny = true;
        }
        if (hasAny) rows.push(record);
    }

    return { paramNames, rows };
}
