 // Read Excel workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Check if sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert first row to JSON to get headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
        console.error("Sheet is empty");
        return null;
    }

    // First row contains column names
    const columnNames = (jsonData[0] as any[]).filter((name) => name !== undefined && name !== null && name !== "").map((name) => String(name));
