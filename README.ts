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
