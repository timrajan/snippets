// Advanced Azure DevOps Test Case Handler (TypeScript)
// This script provides extended functionality for working with test cases in Azure DevOps

import * as azdev from 'azure-devops-node-api';
import * as testApi from 'azure-devops-node-api/TestApi';
import * as testPlanApi from 'azure-devops-node-api/TestPlanApi';
import * as witApi from 'azure-devops-node-api/WorkItemTrackingApi';
import * as testInterfaces from 'azure-devops-node-api/interfaces/TestInterfaces';
import * as testPlanInterfaces from 'azure-devops-node-api/interfaces/TestPlanInterfaces';
import * as witInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as fs from 'fs';
import * as path from 'path';

// Configuration - Set your own values or use environment variables
interface Config {
  orgUrl: string;
  project: string;
  token: string;
  outputDir: string;
}

const config: Config = {
  orgUrl: process.env.AZURE_DEVOPS_ORG_URL || 'https://dev.azure.com/your-organization',
  project: process.env.AZURE_DEVOPS_PROJECT || 'YourProject',
  token: process.env.AZURE_PERSONAL_ACCESS_TOKEN || 'your-personal-access-token',
  outputDir: process.env.OUTPUT_DIR || './test-case-exports',
};

// API Connection
async function getConnection(): Promise<azdev.WebApi> {
  const authHandler = azdev.getPersonalAccessTokenHandler(config.token);
  return new azdev.WebApi(config.orgUrl, authHandler);
}

// API Clients
async function getTestPlanApiClient(): Promise<testPlanApi.ITestPlanApi> {
  const connection = await getConnection();
  return connection.getTestPlanApi();
}

async function getTestApiClient(): Promise<testApi.ITestApi> {
  const connection = await getConnection();
  return connection.getTestApi();
}

async function getWorkItemApiClient(): Promise<witApi.IWorkItemTrackingApi> {
  const connection = await getConnection();
  return connection.getWorkItemTrackingApi();
}

// Core Functions

/**
 * Get all test plans in a project
 * @returns {Promise<testPlanInterfaces.TestPlan[]>} - List of test plans
 */
async function getTestPlans(): Promise<testPlanInterfaces.TestPlan[]> {
  try {
    const testPlanApiClient = await getTestPlanApiClient();
    return await testPlanApiClient.getPlans(config.project);
  } catch (error) {
    console.error('Error fetching test plans:', (error as Error).message);
    throw error;
  }
}

/**
 * Get all test suites for a plan
 * @param {number} planId - Test plan ID
 * @returns {Promise<testPlanInterfaces.TestSuite[]>} - List of test suites
 */
async function getTestSuites(planId: number): Promise<testPlanInterfaces.TestSuite[]> {
  try {
    const testPlanApiClient = await getTestPlanApiClient();
    return await testPlanApiClient.getTestSuitesByPlanId(config.project, planId);
  } catch (error) {
    console.error(`Error fetching test suites for plan ${planId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get all test cases from a test suite
 * @param {number} planId - Test plan ID
 * @param {number} suiteId - Test suite ID
 * @param {boolean} recursive - Whether to include test cases from child suites
 * @returns {Promise<testPlanInterfaces.TestCase[]>} - List of test cases
 */
async function getTestCases(
  planId: number, 
  suiteId: number, 
  recursive: boolean = false
): Promise<testPlanInterfaces.TestCase[]> {
  try {
    const testPlanApiClient = await getTestPlanApiClient();
    
    return await testPlanApiClient.getTestCaseList(
      config.project,
      planId,
      suiteId,
      /* testIds */ undefined,
      /* configurationIds */ undefined,
      /* witFields */ 'System.Title,System.Description,Microsoft.VSTS.TCM.Steps,System.State,System.Tags',
      /* continuationToken */ undefined,
      /* returnIdentityRef */ true,
      /* expand */ true,
      /* excludeFlags */ 0,
      recursive
    );
  } catch (error) {
    console.error(`Error fetching test cases for suite ${suiteId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get test case by ID (work item)
 * @param {number} testCaseId - Test case ID
 * @returns {Promise<witInterfaces.WorkItem>} - Test case work item
 */
async function getTestCaseById(testCaseId: number): Promise<witInterfaces.WorkItem> {
  try {
    const witApiClient = await getWorkItemApiClient();
    return await witApiClient.getWorkItem(
      testCaseId, 
      undefined, 
      undefined, 
      witInterfaces.WorkItemExpand.All
    );
  } catch (error) {
    console.error(`Error fetching test case ${testCaseId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get test results for a specific test case
 * @param {number} testCaseId - Test case ID
 * @returns {Promise<testInterfaces.TestCaseResult[]>} - List of test results
 */
async function getTestResults(testCaseId: number): Promise<testInterfaces.TestCaseResult[]> {
  try {
    const testApiClient = await getTestApiClient();
    
    // First get recent test runs - limit to last 50 for performance
    const testRuns = await testApiClient.getTestRuns(config.project, undefined, undefined, undefined, 50);
    
    const allResults: testInterfaces.TestCaseResult[] = [];
    
    for (const run of testRuns) {
      try {
        if (run.id === undefined) continue;
        
        const results = await testApiClient.getTestResults(
          config.project,
          run.id,
          /* detailsToInclude */ undefined,
          /* skip */ undefined,
          /* top */ 100,
          /* outcomes */ undefined,
          testCaseId
        );
        
        if (results && results.length > 0) {
          allResults.push(...results);
        }
      } catch (error) {
        console.warn(`Error fetching results for test case ${testCaseId} in run ${run.id}:`, (error as Error).message);
      }
    }
    
    return allResults;
  } catch (error) {
    console.error(`Error fetching test results for test case ${testCaseId}:`, (error as Error).message);
    throw error;
  }
}

// Advanced Functions

/**
 * Export all test cases to JSON files
 * @param {number} planId - Test plan ID
 * @param {boolean} includeResults - Whether to include test results
 * @returns {Promise<ExportSummary>} - Export summary
 */
interface ExportSummary {
  planId: number;
  totalSuites: number;
  totalTestCases: number;
  exportedTestCases: number;
  outputDir: string;
}

async function exportTestCases(planId: number, includeResults: boolean = false): Promise<ExportSummary> {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Get all suites for the plan
    const suites = await getTestSuites(planId);
    
    let totalTestCases = 0;
    let exportedTestCases = 0;
    
    // Create a map of suite ID to name for easier reference
    const suiteMap = suites.reduce<Record<number, string>>((map, suite) => {
      if (suite.id !== undefined && suite.name !== undefined) {
        map[suite.id] = suite.name;
      }
      return map;
    }, {});
    
    // Process each suite
    for (const suite of suites) {
      if (suite.id === undefined || suite.name === undefined) continue;
      
      console.log(`Processing suite: ${suite.name} (ID: ${suite.id})`);
      
      // Get test cases for this suite
      const testCases = await getTestCases(planId, suite.id, false);
      totalTestCases += testCases.length;
      
      // Create a folder for each suite
      const suiteDir = path.join(config.outputDir, `Suite_${suite.id}_${sanitizeFileName(suite.name)}`);
      if (!fs.existsSync(suiteDir)) {
        fs.mkdirSync(suiteDir, { recursive: true });
      }
      
      // Export each test case
      for (const testCase of testCases) {
        try {
          if (testCase.workItem?.id === undefined || testCase.workItem?.name === undefined) continue;
          
          // Get full test case details
          const detailedTestCase = await getTestCaseById(testCase.workItem.id);
          
          // Add suite info to the test case
          const testCaseWithSuiteInfo = {
            ...detailedTestCase,
            suite: {
              id: suite.id,
              name: suite.name
            }
          };
          
          // Add test results if requested
          if (includeResults) {
            const testResults = await getTestResults(testCase.workItem.id);
            const testCaseWithResults = {
              ...testCaseWithSuiteInfo,
              testResults
            };
            
            // Write test case to file
            const fileName = `TestCase_${testCase.workItem.id}_${sanitizeFileName(testCase.workItem.name)}.json`;
            const filePath = path.join(suiteDir, fileName);
            
            fs.writeFileSync(
              filePath,
              JSON.stringify(testCaseWithResults, null, 2)
            );
          } else {
            // Write test case to file without results
            const fileName = `TestCase_${testCase.workItem.id}_${sanitizeFileName(testCase.workItem.name)}.json`;
            const filePath = path.join(suiteDir, fileName);
            
            fs.writeFileSync(
              filePath,
              JSON.stringify(testCaseWithSuiteInfo, null, 2)
            );
          }
          
          exportedTestCases++;
          console.log(`  - Exported test case: ${testCase.workItem.name} (ID: ${testCase.workItem.id})`);
        } catch (error) {
          console.error(`  - Error exporting test case ${testCase.workItem?.id}:`, (error as Error).message);
        }
      }
    }
    
    return {
      planId,
      totalSuites: suites.length,
      totalTestCases,
      exportedTestCases,
      outputDir: config.outputDir
    };
  } catch (error) {
    console.error(`Error exporting test cases for plan ${planId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get test coverage for a specific build or release
 * @param {number} buildId - Build ID
 * @returns {Promise<TestCoverageSummary>} - Test coverage summary
 */
interface RunSummary {
  id: number;
  name: string;
  startedDate?: Date;
  completedDate?: Date;
  state: string;
  totalTests: number;
  passed: number;
  failed: number;
  notExecuted: number;
  other: number;
}

interface TestCoverageSummary {
  buildId: number;
  totalRuns: number;
  totalTests: number;
  passed: number;
  failed: number;
  notExecuted: number;
  other: number;
  runs: RunSummary[];
}

async function getTestCoverageForBuild(buildId: number): Promise<TestCoverageSummary> {
  try {
    const testApiClient = await getTestApiClient();
    
    // Get test runs for this build
    const testRuns = await testApiClient.getTestRuns(
      config.project,
      undefined,
      undefined,
      buildId
    );
    
    const coverage: TestCoverageSummary = {
      buildId,
      totalRuns: testRuns.length,
      totalTests: 0,
      passed: 0,
      failed: 0,
      notExecuted: 0,
      other: 0,
      runs: []
    };
    
    // Process each test run
    for (const run of testRuns) {
      if (run.id === undefined) continue;
      
      const runSummary: RunSummary = {
        id: run.id,
        name: run.name || `Run ${run.id}`,
        startedDate: run.startedDate,
        completedDate: run.completedDate,
        state: run.state || 'Unknown',
        totalTests: 0,
        passed: 0,
        failed: 0,
        notExecuted: 0,
        other: 0
      };
      
      // Get test results for this run
      const results = await testApiClient.getTestResults(
        config.project,
        run.id
      );
      
      runSummary.totalTests = results.length;
      coverage.totalTests += results.length;
      
      // Count results by outcome
      for (const result of results) {
        if (result.outcome === 'Passed') {
          runSummary.passed++;
          coverage.passed++;
        } else if (result.outcome === 'Failed') {
          runSummary.failed++;
          coverage.failed++;
        } else if (result.outcome === 'NotExecuted') {
          runSummary.notExecuted++;
          coverage.notExecuted++;
        } else {
          runSummary.other++;
          coverage.other++;
        }
      }
      
      coverage.runs.push(runSummary);
    }
    
    return coverage;
  } catch (error) {
    console.error(`Error getting test coverage for build ${buildId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Generate an HTML report of test cases
 * @param {number} planId - Test plan ID
 * @returns {Promise<string>} - Path to the HTML report
 */
async function generateTestCaseReport(planId: number): Promise<string> {
  try {
    // Get plan details
    const testPlanApiClient = await getTestPlanApiClient();
    const plan = (await testPlanApiClient.getPlanById(config.project, planId));
    
    // Get all suites for the plan
    const suites = await getTestSuites(planId);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Case Report - ${plan.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #0078d4; }
          h2 { color: #666; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .passed { color: green; }
          .failed { color: red; }
          .not-executed { color: orange; }
        </style>
      </head>
      <body>
        <h1>Test Case Report</h1>
        <p><strong>Plan:</strong> ${plan.name} (ID: ${plan.id})</p>
        <p><strong>Project:</strong> ${config.project}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    // Process each suite
    for (const suite of suites) {
      if (suite.id === undefined || suite.name === undefined) continue;
      
      html += `<h2>Suite: ${suite.name} (ID: ${suite.id})</h2>`;
      
      // Get test cases for this suite
      const testCases = await getTestCases(planId, suite.id, false);
      
      if (testCases.length === 0) {
        html += '<p>No test cases in this suite.</p>';
        continue;
      }
      
      html += `
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>State</th>
            <th>Priority</th>
            <th>Last Result</th>
          </tr>
      `;
      
      // Add each test case to the table
      for (const testCase of testCases) {
        if (testCase.workItem?.id === undefined || testCase.workItem?.name === undefined) continue;
        
        // Get full test case details
        const details = await getTestCaseById(testCase.workItem.id);
        
        // Get the last test result
        const results = await getTestResults(testCase.workItem.id);
        let lastResult = 'Not Executed';
        let resultClass = 'not-executed';
        
        if (results.length > 0) {
          results.sort((a, b) => {
            const dateA = new Date(a.completedDate || a.startedDate || 0);
            const dateB = new Date(b.completedDate || b.startedDate || 0);
            return dateB.getTime() - dateA.getTime(); // Sort descending (most recent first)
          });
          
          lastResult = results[0].outcome || 'Unknown';
          if (lastResult === 'Passed') {
            resultClass = 'passed';
          } else if (lastResult === 'Failed') {
            resultClass = 'failed';
          }
        }
        
        // Extract fields
        const state = details.fields ? details.fields['System.State'] || 'Unknown' : 'Unknown';
        const priority = details.fields ? details.fields['Microsoft.VSTS.Common.Priority'] || 'Unknown' : 'Unknown';
        
        html += `
          <tr>
            <td>${testCase.workItem.id}</td>
            <td>${testCase.workItem.name}</td>
            <td>${state}</td>
            <td>${priority}</td>
            <td class="${resultClass}">${lastResult}</td>
          </tr>
        `;
      }
      
      html += '</table>';
    }
    
    html += `
      </body>
      </html>
    `;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Write the report to a file
    const reportPath = path.join(config.outputDir, `TestCaseReport_${planId}_${Date.now()}.html`);
    fs.writeFileSync(reportPath, html);
    
    console.log(`Report generated at: ${reportPath}`);
    return reportPath;
  } catch (error) {
    console.error(`Error generating test case report for plan ${planId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Find test cases that match specific criteria
 * @param {SearchCriteria} criteria - Search criteria
 * @returns {Promise<witInterfaces.WorkItem[]>} - Matching test cases
 */
interface SearchCriteria {
  title?: string;
  state?: string;
  tags?: string;
  assignedTo?: string;
  priority?: number;
}

async function findTestCases(criteria: SearchCriteria): Promise<witInterfaces.WorkItem[]> {
  try {
    const witApiClient = await getWorkItemApiClient();
    
    // Build the WIQL query
    let query = "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.WorkItemType] = 'Test Case'";
    
    // Add criteria
    if (criteria.title) {
      query += ` AND [System.Title] CONTAINS '${criteria.title}'`;
    }
    
    if (criteria.state) {
      query += ` AND [System.State] = '${criteria.state}'`;
    }
    
    if (criteria.tags) {
      query += ` AND [System.Tags] CONTAINS '${criteria.tags}'`;
    }
    
    if (criteria.assignedTo) {
      query += ` AND [System.AssignedTo] = '${criteria.assignedTo}'`;
    }
    
    if (criteria.priority) {
      query += ` AND [Microsoft.VSTS.Common.Priority] = ${criteria.priority}`;
    }
    
    // Execute the query
    const wiql: witInterfaces.Wiql = { query };
    const queryResult = await witApiClient.queryByWiql(wiql, config.project);
    
    if (!queryResult.workItems || queryResult.workItems.length === 0) {
      return [];
    }
    
    // Get the full work items
    const ids = queryResult.workItems.map(wi => wi.id as number);
    const testCases = await witApiClient.getWorkItems(ids, undefined, undefined, witInterfaces.WorkItemExpand.All);
    
    return testCases;
  } catch (error) {
    console.error('Error finding test cases:', (error as Error).message);
    throw error;
  }
}

// Utility Functions

/**
 * Sanitize a string for use in a file name
 * @param {string} name - Original string
 * @returns {string} - Sanitized string
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
    .substring(0, 100); // Limit length
}

/**
 * Convert test steps from HTML to plain text
 * @param {string} html - HTML test steps
 * @returns {string} - Plain text test steps
 */
function convertTestStepsToText(html: string): string {
  if (!html) return '';
  
  // Simple HTML to text conversion for test steps
  return html
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with max two
    .trim();
}

/**
 * Create a new test case
 * @param {TestCaseCreationInput} input - Test case creation input
 * @returns {Promise<number>} - New test case ID
 */
interface TestStep {
  action: string;
  expectedResult?: string;
}

interface TestCaseCreationInput {
  title: string;
  description?: string;
  steps: TestStep[];
  priority?: number;
  tags?: string[];
  areaPath?: string;
  iterationPath?: string;
  assignedTo?: string;
}

async function createTestCase(input: TestCaseCreationInput): Promise<number> {
  try {
    const witApiClient = await getWorkItemApiClient();
    
    // Prepare the fields
    const patchDocument: witInterfaces.JsonPatchOperation[] = [];
    
    // Add required fields
    patchDocument.push({
      op: "add",
      path: "/fields/System.Title",
      value: input.title
    });
    
    // Add optional fields
    if (input.description) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.Description",
        value: input.description
      });
    }
    
    if (input.priority) {
      patchDocument.push({
        op: "add",
        path: "/fields/Microsoft.VSTS.Common.Priority",
        value: input.priority
      });
    }
    
    if (input.tags && input.tags.length > 0) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.Tags",
        value: input.tags.join('; ')
      });
    }
    
    if (input.areaPath) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.AreaPath",
        value: input.areaPath
      });
    }
    
    if (input.iterationPath) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.IterationPath",
        value: input.iterationPath
      });
    }
    
    if (input.assignedTo) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.AssignedTo",
        value: input.assignedTo
      });
    }
    
    // Format test steps
    if (input.steps && input.steps.length > 0) {
      let stepsHtml = '<steps id="0" last="' + (input.steps.length - 1) + '">';
      
      input.steps.forEach((step, index) => {
        stepsHtml += `<step id="${index}" type="ActionStep">`;
        stepsHtml += `<parameterizedString isformatted="true">${step.action}</parameterizedString>`;
        stepsHtml += '<description/>';
        
        if (step.expectedResult) {
          stepsHtml += `<parameterizedString isformatted="true">${step.expectedResult}</parameterizedString>`;
        } else {
          stepsHtml += '<parameterizedString isformatted="true"/>';
        }
        
        stepsHtml += '</step>';
      });
      
      stepsHtml += '</steps>';
      
      patchDocument.push({
        op: "add",
        path: "/fields/Microsoft.VSTS.TCM.Steps",
        value: stepsHtml
      });
    }
    
    // Create the test case
    const newTestCase = await witApiClient.createWorkItem(
      undefined,
      patchDocument,
      config.project,
      'Test Case'
    );
    
    return newTestCase.id as number;
  } catch (error) {
    console.error('Error creating test case:', (error as Error).message);
    throw error;
  }
}

/**
 * Add a test case to a test suite
 * @param {number} testCaseId - Test case ID
 * @param {number} planId - Test plan ID
 * @param {number} suiteId - Test suite ID
 * @returns {Promise<testPlanInterfaces.TestCase>} - Added test case
 */
async function addTestCaseToSuite(
  testCaseId: number, 
  planId: number, 
  suiteId: number
): Promise<testPlanInterfaces.TestCase> {
  try {
    const testPlanApiClient = await getTestPlanApiClient();
    
    // Create the test case creation request
    const testCaseCreateParams: testPlanInterfaces.SuiteTestCaseCreateUpdateParameters = {
      workItem: {
        id: testCaseId
      }
    };
    
    // Add the test case to the suite
    return await testPlanApiClient.addTestCasesToSuite(
      testCaseCreateParams,
      config.project,
      planId,
      suiteId
    );
  } catch (error) {
    console.error(`Error adding test case ${testCaseId} to suite ${suiteId}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Run a test case manually
 * @param {TestRunInput} input - Test run input
 * @returns {Promise<testInterfaces.TestRun>} - Created test run
 */
interface TestRunInput {
  testCaseIds: number[];
  planId?: number;
  suiteId?: number;
  configurationId?: number;
  title?: string;
  comment?: string;
}

async function runTestCases(input: TestRunInput): Promise<testInterfaces.TestRun> {
  try {
    const testApiClient = await getTestApiClient();
    
    // Create the test run creation request
    const testRunCreateParams: testInterfaces.RunCreateModel = {
      automated: false,
      name: input.title || `Manual Test Run - ${new Date().toLocaleString()}`,
      planId: input.planId,
      testCaseIds: input.testCaseIds
    };
    
    if (input.comment) {
      testRunCreateParams.comment = input.comment;
    }
    
    if (input.suiteId) {
      testRunCreateParams.configurationIds = input.configurationId ? [input.configurationId] : undefined;
      testRunCreateParams.pointIds = [] // Would need to get point IDs associated with the test cases
    }
    
    // Create the test run
    return await testApiClient.createTestRun(testRunCreateParams, config.project);
  } catch (error) {
    console.error('Error creating test run:', (error as Error).message);
    throw error;
  }
}

/**
 * Update test case results
 * @param {TestResultUpdateInput} input - Test result update input
 * @returns {Promise<testInterfaces.TestCaseResult[]>} - Updated test results
 */
interface TestResultUpdateInput {
  runId: number;
  testCaseResults: {
    testCaseId: number;
    outcome: 'Passed' | 'Failed' | 'NotExecuted' | 'Blocked' | 'NotApplicable';
    errorMessage?: string;
    comment?: string;
    state?: 'Completed' | 'InProgress' | 'NotStarted';
    durationInMs?: number;
  }[];
}

async function updateTestResults(input: TestResultUpdateInput): Promise<testInterfaces.TestCaseResult[]> {
  try {
    const testApiClient = await getTestApiClient();
    
    // Create the test results update request
    const testResultsUpdateParams: testInterfaces.TestCaseResultUpdateModel[] = input.testCaseResults.map(result => {
      return {
        id: undefined, // Will be determined by the server
        testCaseId: result.testCaseId,
        outcome: result.outcome,
        errorMessage: result.errorMessage,
        comment: result.comment,
        state: result.state || 'Completed',
        durationInMs: result.durationInMs
      };
    });
    
    // Update the test results
    return await testApiClient.updateTestResults(
      testResultsUpdateParams,
      config.project,
      input.runId
    );
  } catch (error) {
    console.error(`Error updating test results for run ${input.runId}:`, (error as Error).message);
    throw error;
  }
}

// Command line interface
interface CommandLineOptions {
  includeResults?: boolean;
  recursive?: boolean;
  title?: string;
  state?: string;
  tags?: string;
  assignedTo?: string;
  priority?: number;
  [key: string]: any;
}

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
      printUsage();
      return;
    }
    
    // Parse options
    const options: CommandLineOptions = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const optionName = args[i].substring(2);
        const optionValue = args[i + 1]?.startsWith('--') ? true : args[i + 1];
        if (optionValue !== undefined && !optionValue.startsWith('--')) {
          i++; // Skip the value in the next iteration
        }
        options[optionName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = optionValue;
      } else if (!isNaN(Number(args[i]))) {
        // It's a number parameter
        options[`param${Object.keys(options).length}`] = Number(args[i]);
      }
    }
    
    switch (command) {
      case 'list-plans':
        const plans = await getTestPlans();
        console.log('\nTest Plans:');
        plans.forEach(p => console.log(`${p.id}: ${p.name}`));
        break;
        
      case 'list-suites':
        if (!options.param0) {
          console.error('Error: Plan ID is required');
          printUsage();
          return;
        }
        const suites = await getTestSuites(options.param0);
        console.log(`\nTest Suites for Plan ${options.param0}:`);
        suites.forEach(s => console.log(`${s.id}: ${s.name}`));
        break;
        
      case 'list-cases':
        if (!options.param0 || !options.param1) {
          console.error('Error: Plan ID and Suite ID are required');
          printUsage();
          return;
        }
        const testCases = await getTestCases(
          options.param0, 
          options.param1, 
          options.recursive
        );
        console.log(`\nTest Cases for Suite ${options.param1} in Plan ${options.param0}:`);
        testCases.forEach(tc => console.log(`${tc.workItem?.id}: ${tc.workItem?.name}`));
        break;
        
      case 'get-case':
        if (!options.param0) {
          console.error('Error: Test Case ID is required');
          printUsage();
          return;
        }
        const testCase = await getTestCaseById(options.param0);
        console.log(JSON.stringify(testCase, null, 2));
        break;
        
      case 'get-results':
        if (!options.param0) {
          console.error('Error: Test Case ID is required');
          printUsage();
          return;
        }
        const results = await getTestResults(options.param0);
        console.log(`\nTest Results for Test Case ${options.param0}:`);
        results.forEach(r => console.log(`${r.id}: ${r.outcome} (${r.completedDate || r.startedDate})`));
        break;
        
      case 'export':
        if (!options.param0) {
          console.error('Error: Plan ID is required');
          printUsage();
          return;
        }
        const exportResult = await exportTestCases(options.param0, options.includeResults);
        console.log('\nExport Summary:');
        console.log(JSON.stringify(exportResult, null, 2));
        break;
        
      case 'coverage':
        if (!options.param0) {
          console.error('Error: Build ID is required');
          printUsage();
          return;
        }
        const coverage = await getTestCoverageForBuild(options.param0);
        console.log('\nTest Coverage Summary:');
        console.log(JSON.stringify(coverage, null, 2));
        break;
        
      case 'report':
        if (!options.param0) {
          console.error('Error: Plan ID is required');
          printUsage();
          return;
        }
        const reportPath = await generateTestCaseReport(options.param0);
        console.log(`\nReport generated: ${reportPath}`);
        break;
        
      case 'find':
        const criteria: SearchCriteria = {
          title: options.title,
          state: options.state,
          tags: options.tags,
          assignedTo: options.assignedTo,
          priority: options.priority
        };
        const foundTestCases = await findTestCases(criteria);
        console.log('\nFound Test Cases:');
        foundTestCases.forEach(tc => console.log(`${tc.id}: ${tc.fields?.['System.Title']} (${tc.fields?.['System.State']})`));
        break;
        
      case 'create':
        if (!options.title) {
          console.error('Error: Test case title is required');
          printUsage();
          return;
        }
        
        // Example steps
        const steps: TestStep[] = [
          { action: 'Open the application', expectedResult: 'Application opens successfully' },
          { action: 'Navigate to login page', expectedResult: 'Login page is displayed' },
          { action: 'Enter valid credentials and click login', expectedResult: 'User is logged in and dashboard is displayed' }
        ];
        
        const newTestCaseId = await createTestCase({
          title: options.title,
          description: options.description,
          steps: steps,
          priority: options.priority,
          tags: options.tags ? options.tags.split(',') : undefined,
          assignedTo: options.assignedTo
        });
        
        console.log(`\nTest case created with ID: ${newTestCaseId}`);
        
        // Add to suite if plan and suite are specified
        if (options.planId && options.suiteId) {
          const addedTestCase = await addTestCaseToSuite(
            newTestCaseId,
            options.planId,
            options.suiteId
          );
          console.log(`Test case added to suite ${options.suiteId} in plan ${options.planId}`);
        }
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

function printUsage(): void {
  console.log(`
Azure DevOps Test Case Handler (TypeScript)

Usage:
  ts-node script.ts <command> [options]

Commands:
  list-plans                       List all test plans
  list-suites <planId>             List all test suites for a plan
  list-cases <planId> <suiteId>    List all test cases in a suite
  get-case <testCaseId>            Get a specific test case
  get-results <testCaseId>         Get results for a test case
  export <planId>                  Export all test cases in a plan
  coverage <buildId>               Get test coverage for a build
  report <planId>                  Generate HTML report for a plan
  find                             Find test cases matching criteria
  create                           Create a new test case

Options:
  --include-results                Include test results in export (slower)
  --recursive                      Include child suites
  --title <title>                  Filter by title contains
  --state <state>                  Filter by state (e.g., Active, Ready)
  --tags <tags>                    Filter by tags
  --assigned-to <email>            Filter by assigned to
  --priority <priority>            Filter by priority (1-4)
  --plan-id <planId>               Test plan ID for adding test case to suite
  --suite-id <suiteId>             Test suite ID for adding test case to suite
  --description <description>      Description for new test case
  
Examples:
  ts-node script.ts list-plans
  ts-node script.ts list-suites 12345
  ts-node script.ts list-cases 12345 6789
  ts-node script.ts export 12345 --include-results
  ts-node script.ts find --title "Login" --state "Active"
  ts-node script.ts create --title "New Login Test" --priority 2
`);
}

// Run the script if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export functions for use as a module
export {
  getTestPlans,
  getTestSuites,
  getTestCases,
  getTestCaseById,
  getTestResults,
  exportTestCases,
  getTestCoverageForBuild,
  generateTestCaseReport,
  findTestCases,
  createTestCase,
  addTestCaseToSuite,
  runTestCases,
  updateTestResults
};
