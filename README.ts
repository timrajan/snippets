 // Convert sheet to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
            console.error('Sheet is empty');
            return null;
        }

        // Get header row (first row)
        const headers = jsonData[0];


// Find the column index by column name
        const columnIndex = headers.findIndex(
            header => header !== undefined && 
                     header !== null && 
                     String(header).trim() === COLUMN_NAME.trim()
        );

        if (columnIndex === -1) {
            console.error(`Column "${COLUMN_NAME}" not found`);
            return null;
        }

        // Extract all values from that column (excluding header row)
        const columnValues: string[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
            const value = jsonData[i][columnIndex];
            
            // Convert to string and add to array (handle undefined/null)
            if (value !== undefined && value !== null) {
                columnValues.push(String(value));
            } else {
                columnValues.push(''); // Or skip empty cells
            }
        }

        return columnValues;
