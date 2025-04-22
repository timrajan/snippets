import * as azdev from 'azure-devops-node-api';
import * as witApi from 'azure-devops-node-api/WorkItemTrackingApi';
import { JsonPatchDocument, Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

async function updateTestCaseLocalDataSource(): Promise<void> {
  try {
    // Connection parameters
    const orgUrl: string = 'https://dev.azure.com/yourOrganization';
    const token: string = 'your-personal-access-token';
    const project: string = 'YourProjectName';
    const testCaseId: number = 12345; // Replace with your test case ID
    
    // Create authentication handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    const workItemTrackingApi = await connection.getWorkItemTrackingApi();
    
    // First, retrieve the current work item to see its existing data source
    console.log(`Retrieving test case #${testCaseId}...`);
    const workItem = await workItemTrackingApi.getWorkItem(
      testCaseId,
      undefined,
      undefined,
      undefined,
      undefined
    );
    
    // Check if it has LocalDataSource field already
    const currentDataSource = workItem?.fields?.['Microsoft.VSTS.TCM.LocalDataSource'];
    console.log('Current LocalDataSource:', currentDataSource);
    
    // IMPORTANT: If the field exists, we need to get its current value
    // and modify it instead of completely replacing it, or we'll lose data
    
    // Parse the current data source (if it exists) or initialize a new one
    let dataSourceTable: { [key: string]: string[] } = {};
    
    if (currentDataSource && typeof currentDataSource === 'string') {
      try {
        // Try to parse existing data source
        dataSourceTable = parseLocalDataSource(currentDataSource);
        console.log('Parsed current data source:', dataSourceTable);
      } catch (e) {
        console.warn('Could not parse existing data source, creating new one.');
      }
    }
    
    // Add or update parameters in the data source
    dataSourceTable['Parameter1'] = ['Value1', 'Value2', 'Value3'];
    dataSourceTable['Parameter2'] = ['ValueA', 'ValueB', 'ValueC'];
    
    // Create the formatted LocalDataSource string
    const formattedDataSource = formatLocalDataSource(dataSourceTable);
    console.log('New LocalDataSource to be set:');
    console.log(formattedDataSource);
    
    // Important: Use REPLACE operation if the field already exists, otherwise use ADD
    const operation = currentDataSource ? Operation.Replace : Operation.Add;
    
    // Create a JSON patch document to update the LocalDataSource field
    const patchDocument: JsonPatchDocument = [
      {
        op: operation,
        path: '/fields/Microsoft.VSTS.TCM.LocalDataSource',
        value: formattedDataSource
      }
    ];
    
    console.log(`Sending ${operation} operation to update LocalDataSource...`);
    
    // Update the work item with the new LocalDataSource
    const updatedWorkItem = await workItemTrackingApi.updateWorkItem(
      {},  // customHeaders
      patchDocument,
      testCaseId,
      project
    );
    
    console.log('Test case update successful.');
    
    // Verify the update was successful by getting the work item again
    console.log('Verifying update...');
    const verifiedWorkItem = await workItemTrackingApi.getWorkItem(
      testCaseId,
      undefined,
      undefined,
      undefined,
      undefined
    );
    
    const updatedDataSourceField = verifiedWorkItem?.fields?.['Microsoft.VSTS.TCM.LocalDataSource'];
    console.log('Updated LocalDataSource field:');
    console.log(updatedDataSourceField);
    
  } catch (error) {
    console.error('Error updating test case LocalDataSource:', error);
    throw error;
  }
}

/**
 * Parse the LocalDataSource string into a structured object
 */
function parseLocalDataSource(dataSourceString: string): { [key: string]: string[] } {
  const result: { [key: string]: string[] } = {};
  
  // Split the data source string into lines
  const lines = dataSourceString.split('\n');
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Each line should have the format: |ParameterName|Value1,Value2,Value3|
    const matches = line.match(/\|(.*?)\|(.*?)\|/);
    if (matches && matches.length >= 3) {
      const paramName = matches[1].trim();
      const valuesStr = matches[2].trim();
      
      // Split the values by comma
      const values = valuesStr.split(',').map(v => v.trim()).filter(v => v);
      
      if (paramName && values.length > 0) {
        result[paramName] = values;
      }
    }
  }
  
  return result;
}

/**
 * Format the data source object into the string format expected by Azure DevOps
 */
function formatLocalDataSource(dataSourceTable: { [key: string]: string[] }): string {
  let result = '';
  
  for (const [paramName, values] of Object.entries(dataSourceTable)) {
    if (values && values.length > 0) {
      result += `|${paramName}|${values.join(',')}|\n`;
    }
  }
  
  return result;
}

// Run the function
updateTestCaseLocalDataSource().catch((err: Error) => {
  console.error('Error:', err);
  process.exit(1);
});
