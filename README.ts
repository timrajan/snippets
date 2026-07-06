function readParamsFromSheet(workbook: ExcelJS.Workbook, paramsSheetName: string): { paramNames: string[]; rows: Record<string, string>[] } {
    const sheet = workbook.getWorksheet(paramsSheetName);
    if (!sheet) {
        throw new Error(`Params sheet "${paramsSheetName}" not found.`);
    }

    const headerRow = sheet.getRow(1);
    const paramNames: string[] = [];
    const colIndexByName: Record<string, number> = {};
    headerRow.eachCell((cell: { value: any }, colNumber: number) => {
        const name = String(cell.value ?? "").trim();
        if (name !== "") {
            paramNames.push(name);
            colIndexByName[name] = colNumber;
        }
    });

    const rows: Record<string, string>[] = [];
    for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const record: Record<string, string> = {};
        let hasAny = false;
        for (const name of paramNames) {
            const v = String(row.getCell(colIndexByName[name]).value ?? "").trim();
            record[name] = v;
            if (v !== "") hasAny = true;
        }
        if (hasAny) rows.push(record);
    }

    return { paramNames, rows };
}
