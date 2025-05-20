const rawData = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON data
    const jsonData = JSON.parse(rawData);
    
    // Loop through each key-value pair
    for (const [key, value] of Object.entries(jsonData)) {
      console.log(`Key: ${key}, Value:`, value);
      
      // If you need to process nested objects recursively
      if (value !== null && typeof value === 'object') {
        console.log('Object value - contains nested properties:');
        processNestedObject(value, `  ${key}.`);
      }
    }
