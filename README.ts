Efficiency Through Automation
The **Azure DevOps Test Case Creator** simplifies the process of migrating manual test definitions from legacy spreadsheets into structured ADO Work Items.

By leveraging a **TypeScript script** and the **REST API**, we automate the heavy lifting of work item creation while ensuring data consistency.

 Detailed Matching Logic

The Self-Selection Pattern

Instead of hardcoding data, each test instance identifies itself. It scans the shared spreadsheet to find the row that corresponds to its unique **Azure DevOps ID** (e.g., TC-1042).

This allows for a **single, shared spreadsheet** to act as the source of truth for all tests in the suite.

Benefits:

- Simplified data management

- Dynamic test configuration

- No redundant files



Inside the Test: 4 Key Steps

Read Spreadsheet:

Test script initializes and loads the master spreadsheet into memory for fast lookup.

Loop & Match:

Iterate through rows to find the specific entry where 'ADO ID' matches the current test execution context.

Execute Steps:

Run the Puppeteer-driven browser steps defined by the data in that specific row.

Exit & Report:

Conclude execution and update ADO with a success or failure status based on runtime assertions.
