 const stream = //this is where the I want to use the gitURL

    const chunks: Buffer[] = [];
    const buffer = await new Promise<Buffer>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });

    // Read Excel workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Check if sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to array of row objects
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    // Loop through rows and find matching TestCaseID
    for (const row of rows) {
        const testCaseID = row["ID"];
        if (testCaseID?.toString() === id.toString()) {
            return row;
        }
    }

    return null;
