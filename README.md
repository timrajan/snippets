const azdev = require('azure-devops-node-api');
const witApi = require('azure-devops-node-api/WebApi');

/**
 * Solution for updating LocalDataSource while preserving existing rows
 * This implementation takes special care to maintain the exact XML structure
 */
async function updateLocalDataSourceFullPreservation() {
  // Get configuration from environment variables or config file
  const orgUrl = 'https://dev.azure.com/yourOrganization';
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Use a PAT with appropriate permissions
  const projectName = 'YourProject';
  const testCaseId = 98765; // Your test case work item ID
  
  // Create connection to Azure DevOps
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  try {
    // Get the Work Item Tracking API
    const witClient = await connection.getWorkItemTrackingApi();
    
    // Get the current test case work item with the LocalDataSource field
    const testCase = await witClient.getWorkItem(
      testCaseId, 
      ["Microsoft.VSTS.TCM.LocalDataSource"]
    );
    
    // Extract the current LocalDataSource value
    const currentDataSource = testCase.fields["Microsoft.VSTS.TCM.LocalDataSource"];
    
    if (!currentDataSource) {
      console.log('No existing LocalDataSource found. Creating a new one.');
      return createNewLocalDataSource(witClient, testCaseId, projectName);
    }
    
    console.log('Found existing LocalDataSource. Using direct XML manipulation to preserve structure...');
    
    // =====================================================
    // IMPORTANT: Instead of using xml2js which may alter the structure,
    // we'll use direct XML string manipulation to add a new row
    // =====================================================
    
    // Find the position where we need to insert a new row
    // We'll look for the closing </Table> tag and insert before it
    const closeTablePos = currentDataSource.lastIndexOf('</Table>');
    
    if (closeTablePos === -1) {
      console.error('Could not find </Table> tag in the LocalDataSource XML. Creating a new one.');
      return createNewLocalDataSource(witClient, testCaseId, projectName);
    }
    
    // Create a new row with the values you want to add
    const newRowXml = `
      <Row>
        <Value>New Value 1</Value>
        <Value>New Value 2</Value>
        <Value>New Value 3</Value>
      </Row>
    `;
    
    // Insert the new row directly into the XML string
    const updatedXml = 
      currentDataSource.substring(0, closeTablePos) + 
      newRowXml + 
      currentDataSource.substring(closeTablePos);
    
    // Create document to update the work item
    const document = [
      {
        op: "replace", // Using replace to ensure the whole field is updated properly
        path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
        value: updatedXml
      }
    ];
    
    // Update the work item with the modified data source
    const updatedWorkItem = await witClient.updateWorkItem(
      document,
      testCaseId,
      projectName
    );
    
    console.log('Successfully updated LocalDataSource while preserving existing rows:', updatedWorkItem.id);
    return updatedWorkItem;
  } catch (error) {
    console.error('Error updating LocalDataSource:', error);
    throw error;
  }
}

// Helper function to create a new LocalDataSource
async function createNewLocalDataSource(witClient, testCaseId, projectName) {
  // Create a new LocalDataSource with initial structure
  const localDataSourceValue = `
<TCM>
  <DataItem type="Microsoft.VSTS.TCM.LocalDataSource" agile="">
    <Table>
      <Headers>
        <Header name="Parameter1" />
        <Header name="Parameter2" />
        <Header name="Parameter3" />
      </Headers>
      <Row>
        <Value>Initial Value 1</Value>
        <Value>Initial Value 2</Value>
        <Value>Initial Value 3</Value>
      </Row>
    </Table>
  </DataItem>
</TCM>`;
  
  // Create document to update the work item
  const document = [
    {
      op: "add",
      path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
      value: localDataSourceValue
    }
  ];
  
  // Update the work item with the new local data source
  const updatedWorkItem = await witClient.updateWorkItem(
    document,
    testCaseId,
    projectName
  );
  
  console.log('Created new LocalDataSource for test case:', updatedWorkItem.id);
  return updatedWorkItem;
}

// Example: Update specific values in an existing row
async function updateSpecificValueInExistingRow() {
  // Get configuration
  const orgUrl = 'https://dev.azure.com/yourOrganization';
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN';
  const projectName = 'YourProject';
  const testCaseId = 98765;
  
  // Create connection to Azure DevOps
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  try {
    // Get the Work Item Tracking API
    const witClient = await connection.getWorkItemTrackingApi();
    
    // Get the current LocalDataSource
    const testCase = await witClient.getWorkItem(
      testCaseId, 
      ["Microsoft.VSTS.TCM.LocalDataSource"]
    );
    
    const currentDataSource = testCase.fields["Microsoft.VSTS.TCM.LocalDataSource"];
    
    if (!currentDataSource) {
      console.log('No existing LocalDataSource found.');
      return null;
    }
    
    // For debugging - log the current XML
    console.log('Current LocalDataSource XML:');
    console.log(currentDataSource);
    
    // Create a temporary DOM to find and modify XML elements
    // Note: This would require jsdom in a real Node.js environment
    // For this example, we'll use direct string replacement
    
    // Example: Find the first row's first value and replace it
    // This approach uses regex to target specific values
    const firstValueRegex = /<Row>\s*<Value>([^<]*)<\/Value>/;
    const match = firstValueRegex.exec(currentDataSource);
    
    if (match) {
      // Found the first value in the first row
      const originalValue = match[1];
      console.log(`Found first value: "${originalValue}"`);
      
      // Replace it with a new value
      const updatedXml = currentDataSource.replace(
        `<Value>${originalValue}</Value>`,
        `<Value>Updated Value</Value>`
      );
      
      // Create document to update the work item
      const document = [
        {
          op: "replace",
          path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
          value: updatedXml
        }
      ];
      
      // Update the work item
      const updatedWorkItem = await witClient.updateWorkItem(
        document,
        testCaseId,
        projectName
      );
      
      console.log('Successfully updated value in existing row');
      return updatedWorkItem;
    } else {
      console.log('Could not find the target value to update');
      return null;
    }
  } catch (error) {
    console.error('Error updating value:', error);
    throw error;
  }
}

/**
 * Function to safely add new parameters to test case without affecting existing ones
 * This is particularly useful when you want to extend the parameters rather than replace them
 */
async function addNewParametersToTest() {
  // Get configuration
  const orgUrl = 'https://dev.azure.com/yourOrganization';
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN';
  const projectName = 'YourProject';
  const testCaseId = 98765;
  
  // Create connection to Azure DevOps
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  
  try {
    // Get the Work Item Tracking API
    const witClient = await connection.getWorkItemTrackingApi();
    
    // Get the current LocalDataSource
    const testCase = await witClient.getWorkItem(
      testCaseId, 
      ["Microsoft.VSTS.TCM.LocalDataSource"]
    );
    
    const currentDataSource = testCase.fields["Microsoft.VSTS.TCM.LocalDataSource"];
    
    if (!currentDataSource) {
      console.log('No existing LocalDataSource found. Creating a new one.');
      return createNewLocalDataSource(witClient, testCaseId, projectName);
    }
    
    // Check if the Headers section exists
    const headersStartTag = '<Headers>';
    const headersEndTag = '</Headers>';
    
    const headersStartPos = currentDataSource.indexOf(headersStartTag);
    const headersEndPos = currentDataSource.indexOf(headersEndTag);
    
    if (headersStartPos === -1 || headersEndPos === -1) {
      console.log('Could not find Headers section in XML.');
      return null;
    }
    
    // Extract the current headers section
    const currentHeadersSection = currentDataSource.substring(
      headersStartPos + headersStartTag.length,
      headersEndPos
    ).trim();
    
    console.log('Current headers:', currentHeadersSection);
    
    // Add a new parameter header
    const newHeaderName = "NewParameter";
    const newHeaderXml = `<Header name="${newHeaderName}" />`;
    
    // Create the updated headers section
    const updatedHeadersSection = currentHeadersSection + '\n        ' + newHeaderXml;
    
    // Replace the headers section in the XML
    let updatedXml = currentDataSource.substring(0, headersStartPos + headersStartTag.length) +
                     '\n        ' + updatedHeadersSection + '\n      ' +
                     currentDataSource.substring(headersEndPos);
    
    // Now we need to update all rows to include a value for the new parameter
    // Find all Row sections and add a new Value element to each
    
    let currentPos = 0;
    const rowStartTag = '<Row>';
    const rowEndTag = '</Row>';
    
    while (true) {
      const rowStartPos = updatedXml.indexOf(rowStartTag, currentPos);
      if (rowStartPos === -1) break; // No more rows found
      
      const rowEndPos = updatedXml.indexOf(rowEndTag, rowStartPos);
      if (rowEndPos === -1) break; // No closing tag found (shouldn't happen)
      
      // Add a new Value element before the row end tag
      const defaultValue = "Default Value"; // Default value for the new parameter
      const newValueXml = `\n        <Value>${defaultValue}</Value>`;
      
      updatedXml = updatedXml.substring(0, rowEndPos) +
                   newValueXml +
                   updatedXml.substring(rowEndPos);
      
      // Update the current position for the next iteration
      // Need to account for the inserted text length
      currentPos = rowEndPos + rowEndTag.length + newValueXml.length;
    }
    
    // Log the final XML for debugging
    console.log('Updated XML:');
    console.log(updatedXml);
    
    // Create document to update the work item
    const document = [
      {
        op: "replace",
        path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
        value: updatedXml
      }
    ];
    
    // Update the work item
    const updatedWorkItem = await witClient.updateWorkItem(
      document,
      testCaseId,
      projectName
    );
    
    console.log('Successfully added new parameter to LocalDataSource');
    return updatedWorkItem;
  } catch (error) {
    console.error('Error adding parameter:', error);
    throw error;
  }
}

/**
 * Function to completely replace a row with new values while keeping other rows intact
 * This is useful when you want to update specific test data rows
 */
async function replaceSpecificRow() {
  // Get configuration
  const orgUrl = 'https://dev.azure.com/yourOrganization';
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN';
  const projectName = 'YourProject';
  const testCaseId = 98765;
  const rowIndexToReplace = 0; // Replace first row (0-based index)
  
  // Create connection to Azure DevOps
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  
  try {
    // Get the Work Item Tracking API
    const witClient = await connection.getWorkItemTrackingApi();
    
    // Get the current LocalDataSource
    const testCase = await witClient.getWorkItem(
      testCaseId, 
      ["Microsoft.VSTS.TCM.LocalDataSource"]
    );
    
    const currentDataSource = testCase.fields["Microsoft.VSTS.TCM.LocalDataSource"];
    
    if (!currentDataSource) {
      console.log('No existing LocalDataSource found.');
      return null;
    }
    
    // Extract all rows
    const rows = [];
    let currentPos = 0;
    const rowStartTag = '<Row>';
    const rowEndTag = '</Row>';
    
    while (true) {
      const rowStartPos = currentDataSource.indexOf(rowStartTag, currentPos);
      if (rowStartPos === -1) break; // No more rows found
      
      const rowEndPos = currentDataSource.indexOf(rowEndTag, rowStartPos) + rowEndTag.length;
      if (rowEndPos === -1) break; // No closing tag found
      
      // Extract the complete row including tags
      const rowXml = currentDataSource.substring(rowStartPos, rowEndPos);
      rows.push(rowXml);
      
      // Update position for next iteration
      currentPos = rowEndPos;
    }
    
    console.log(`Found ${rows.length} rows in the LocalDataSource`);
    
    // Check if the row index is valid
    if (rowIndexToReplace >= rows.length) {
      console.log(`Row index ${rowIndexToReplace} is out of bounds (max: ${rows.length - 1}).`);
      return null;
    }
    
    // Create a replacement row with new values
    const newRowXml = `<Row>
        <Value>Replaced Value 1</Value>
        <Value>Replaced Value 2</Value>
        <Value>Replaced Value 3</Value>
      </Row>`;
    
    // Replace the specified row
    rows[rowIndexToReplace] = newRowXml;
    
    // Find the Table section in the XML
    const tableStartTag = '<Table>';
    const tableEndTag = '</Table>';
    
    const tableStartPos = currentDataSource.indexOf(tableStartTag);
    const tableEndPos = currentDataSource.indexOf(tableEndTag);
    
    if (tableStartPos === -1 || tableEndPos === -1) {
      console.log('Could not find Table section in XML.');
      return null;
    }
    
    // Extract everything up to the end of Headers section
    const headersEndTag = '</Headers>';
    const headersEndPos = currentDataSource.indexOf(headersEndTag, tableStartPos);
    
    if (headersEndPos === -1) {
      console.log('Could not find Headers end tag in XML.');
      return null;
    }
    
    // Construct the updated XML
    const updatedXml = 
      currentDataSource.substring(0, headersEndPos + headersEndTag.length) +
      '\n      ' + 
      rows.join('\n      ') +
      '\n    ' +
      currentDataSource.substring(tableEndPos);
    
    // Create document to update the work item
    const document = [
      {
        op: "replace",
        path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
        value: updatedXml
      }
    ];
    
    // Update the work item
    const updatedWorkItem = await witClient.updateWorkItem(
      document,
      testCaseId,
      projectName
    );
    
    console.log(`Successfully replaced row ${rowIndexToReplace} in LocalDataSource`);
    return updatedWorkItem;
  } catch (error) {
    console.error('Error replacing row:', error);
    throw error;
  }
}

// Example usage:
// For adding a new parameter to all test data:
// addNewParametersToTest();

// For replacing a specific row:
// replaceSpecificRow();

// Function to read the existing LocalDataSource
async function readLocalDataSource() {
  // Get configuration from environment variables or config file
  const orgUrl = 'https://dev.azure.com/yourOrganization';
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Use a PAT with appropriate permissions
  const testCaseId = 98765; // Your test case work item ID
  
  // Create connection to Azure DevOps
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  try {
    // Get the Work Item Tracking API
    const witClient = await connection.getWorkItemTrackingApi();
    
    // Get the test case work item with the LocalDataSource field
    const testCase = await witClient.getWorkItem(
      testCaseId, 
      ["Microsoft.VSTS.TCM.LocalDataSource"]
    );
    
    // Extract the LocalDataSource value
    const localDataSource = testCase.fields["Microsoft.VSTS.TCM.LocalDataSource"];
    
    if (localDataSource) {
      console.log('Current LocalDataSource value:');
      console.log(localDataSource);
      
      // Here you could parse the XML to extract specific values
      // This could be done using an XML parser like xml2js or fast-xml-parser
      // Example:
      // const xml2js = require('xml2js');
      // const parser = new xml2js.Parser({ explicitArray: false });
      // parser.parseString(localDataSource, (err, result) => {
      //   if (err) {
      //     console.error('Error parsing XML:', err);
      //     return;
      //   }
      //   console.log('Parsed data:', JSON.stringify(result, null, 2));
      // });
    } else {
      console.log('No LocalDataSource value found for this test case');
    }
    
    return localDataSource;
  } catch (error) {
    console.error('Error reading LocalDataSource:', error);
    return null;
  }
}

// Example of running both functions in sequence
async function main() {
  try {
    // First read the existing data source
    const currentDataSource = await readLocalDataSource();
    console.log('Current data source retrieved');
    
    // Then update it
    await updateLocalDataSource();
    console.log('Data source updated successfully');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

// Execute the main function
main();
