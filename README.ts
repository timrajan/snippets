// Convert first row to JSON to get headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
            console.error('Sheet is empty');
            return null;
        }

        // First row contains column names
        const columnNames = (jsonData[0] as any[])
            .filter(name => name !== undefined && name !== null && name !== '')
            .map(name => String(name));

        return columnNames.length > 0 ? columnNames : null;
