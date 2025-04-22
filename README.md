


import * as azdev from 'azure-devops-node-api';

import * as TestApi from 'azure-devops-node-api/TestApi';

import * as TestInterfaces from 'azure-devops-node-api/interfaces/TestInterfaces';

import * as WorkItemInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';


interface TestCaseParameter {
  name: string;
  defaultValue: string;
  values: string[];
}

async function updateTestCaseParameters(): Promise<TestInterfaces.TestCase | undefined> {

  try {
    // Connection parameters
    const orgUrl: string = 'https://dev.azure.com/yourOrganization';
    const token: string = 'your-personal-access-token'; // Use a PAT with appropriate permissions
    
    // Create authentication handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    
    // Initialize the connection to Azure DevOps
    const connection: azdev.WebApi = new azdev.WebApi(orgUrl, authHandler);
    
    // Get the Test API client
    const testApi: TestApi.ITestApi = await connection.getTestApi();
    
    // Variables for the test case
    const project: string = 'YourProjectName';
    const testCaseId: number = 12345; // Replace with your test case ID
    
    // Get current test case
    const testCase: TestInterfaces.TestCase = await testApi.getTestCaseById(project, testCaseId);
    
    if (!testCase || !testCase.workItem) {
      throw new Error(`Test case with ID ${testCaseId} not found`);
    }
    
    // Define new parameters or update existing ones
    const updatedParameters: TestCaseParameter[] = [
      {
        name: 'Parameter1',
        defaultValue: 'DefaultValue1',
        values: ['Value1', 'Value2', 'Value3']
      },
      {
        name: 'Parameter2',
        defaultValue: 'DefaultValue2',
        values: ['ValueA', 'ValueB', 'ValueC']
      }
      // Add more parameters as needed
    ];
    
    // Create parameter table in the format expected by the API
    const parameterizedString: string = createParameterizedString(updatedParameters);
    
    // Update the test case with new parameters
    // The parameter table is part of the workItemFields
    if (testCase.workItem.fields) {
      testCase.workItem.fields['Microsoft.VSTS.TCM.Parameters'] = parameterizedString;
    } else {
      testCase.workItem.fields = {
        'Microsoft.VSTS.TCM.Parameters': parameterizedString
      };
    }
    
    // Save the updated test case
    const updatedTestCase: TestInterfaces.TestCase = await testApi.updateTestCase(testCase, project);
    
    console.log('Test case parameters updated successfully!');
    console.log(updatedTestCase);
    
    return updatedTestCase;
  } catch (error) {
    console.error('Error updating test case parameters:', error);
    throw error;
  }
}

/**
 * Creates a parameterized string in the format required by Azure DevOps
 * @param parameters - Array of parameter objects with name, defaultValue, and values
 * @returns Formatted parameter string
 */
function createParameterizedString(parameters: TestCaseParameter[]): string {
  // Azure DevOps expects parameters in this format:
  // |Parameter1|DefaultValue1|Value1,Value2,Value3|
  // |Parameter2|DefaultValue2|ValueA,ValueB,ValueC|
  
  let paramString: string = '';
  
  for (const param of parameters) {
    paramString += `|${param.name}|${param.defaultValue}|${param.values.join(',')}|\n`;
  }
  
  return paramString;
}

// If running as a standalone script
updateTestCaseParameters().catch((err: Error) => {
  console.error('Error:', err);
  process.exit(1);
});







##########################################################################################################################

import * as azdev from 'azure-devops-node-api';
import * as TestAPI from 'azure-devops-node-api/TestApi';
import * as TestInterfaces from 'azure-devops-node-api/interfaces/TestInterfaces';
import * as WorkItemInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

interface TestCaseParameter {
  name: string;
  defaultValue: string;
  values: string[];
}

async function updateTestCaseParameters(): Promise<void> {
  try {
    // Connection parameters
    const orgUrl: string = 'https://dev.azure.com/yourOrganization';
    const token: string = 'your-personal-access-token'; // Use a PAT with appropriate permissions
    
    // Create authentication handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    
    // Initialize the connection to Azure DevOps
    const connection: azdev.WebApi = new azdev.WebApi(orgUrl, authHandler);
    
    // Get the Test API client
    const testApi: TestAPI.ITestApi = await connection.getTestApi();
    
    // Get the Work Item Tracking API client (needed for updating work items)
    const witApi = await connection.getWorkItemTrackingApi();
    
    // Variables for the test case
    const project: string = 'YourProjectName';
    const testCaseId: number = 12345; // Replace with your test case ID
    
    // First, get the work item associated with the test case
    const workItem = await witApi.getWorkItem(testCaseId, undefined, undefined, WorkItemInterfaces.WorkItemExpand.All);
    
    if (!workItem) {
      throw new Error(`Test case with ID ${testCaseId} not found`);
    }
    
    // Define new parameters or update existing ones
    const updatedParameters: TestCaseParameter[] = [
      {
        name: 'Parameter1',
        defaultValue: 'DefaultValue1',
        values: ['Value1', 'Value2', 'Value3']
      },
      {
        name: 'Parameter2',
        defaultValue: 'DefaultValue2',
        values: ['ValueA', 'ValueB', 'ValueC']
      }
      // Add more parameters as needed
    ];
    
    // Create parameter table in the format expected by the API
    const parameterizedString: string = createParameterizedString(updatedParameters);
    
    // Create a JSON patch document to update the parameters field
    const patchDocument: WorkItemInterfaces.JsonPatchOperation[] = [
      {
        op: WorkItemInterfaces.Operation.Add,
        path: '/fields/Microsoft.VSTS.TCM.Parameters',
        value: parameterizedString
      }
    ];
    
    // Update the work item with the new parameters
    const updatedWorkItem = await witApi.updateWorkItem(
      undefined,   // customHeaders
      patchDocument,
      testCaseId,
      project
    );
    
    console.log('Test case parameters updated successfully!');
    console.log(updatedWorkItem);
  } catch (error) {
    console.error('Error updating test case parameters:', error);
    throw error;
  }
}

/**
 * Creates a parameterized string in the format required by Azure DevOps
 * @param parameters - Array of parameter objects with name, defaultValue, and values
 * @returns Formatted parameter string
 */
function createParameterizedString(parameters: TestCaseParameter[]): string {
  // Azure DevOps expects parameters in this format:
  // |Parameter1|DefaultValue1|Value1,Value2,Value3|
  // |Parameter2|DefaultValue2|ValueA,ValueB,ValueC|
  
  let paramString: string = '';
  
  for (const param of parameters) {
    paramString += `|${param.name}|${param.defaultValue}|${param.values.join(',')}|\n`;
  }
  
  return paramString;
}

// If running as a standalone script
updateTestCaseParameters().catch((err: Error) => {
  console.error('Error:', err);
  process.exit(1);
});




// Create a JSON patch document to update the parameters field
    const patchDocument: JsonPatchDocument = [
      {
        op: Operation.Add,
        path: '/fields/Microsoft.VSTS.TCM.Parameters',
        value: parameterizedString
      }
    ];
    
    // Update the work item with the new parameters
    const updatedWorkItem = await workItemTrackingApi.updateWorkItem(
      {},  // customHeaders
      patchDocument,
      testCaseId,
      project
    );
    
    console.log('Test case parameters updated successfully!');
    console.log(updatedWorkItem);
  } catch (error) {
    console.error('Error updating test case parameters:', error);
    throw error;
