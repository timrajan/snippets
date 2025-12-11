Test Data Management Workflow

Test data resides in Excel – All test cases, associated actions, and verification data are maintained in an Excel worksheet called the "Test Cases Sheet," where each row represents a complete test case.
Azure Data Table limitation – The Azure Data Table structure is not designed to accommodate the complex, multi-column test case data format we use in our Excel sheets.
Attachment-based solution – To overcome this limitation, the Test Cases Sheet is attached directly to each Azure Test Case in the Azure Test Plan portal.
Automated script processing – A custom script reads the Test Cases Sheet and iterates through each row to identify and extract individual test cases.
Test Case ID matching – The script matches the Azure Test Case ID with the corresponding Test Case ID column in the Excel sheet to locate the exact test case row.
Complete row extraction – Once matched, the entire row—containing all test data, actions, and expected results—is extracted for processing.
Middleware transformation – The extracted test case row is sent to a Middleware component, which deciphers the data and constructs a structured Automation Test Case.
Automation Framework execution – The constructed Automation Test Case is passed to the Puppeteer-based Automation Framework, which executes the test steps automatically.
Result publishing – Upon completion, test results are published back to the Azure Test Plan portal, linking execution outcomes to the corresponding test cases.
End-to-end automation – This workflow enables seamless, automated test execution where every Azure Test Case with an attached spreadsheet can be automatically matched, generated, and executed without manual intervention.

 Simple integration – Just attach the Test Cases Sheet to an Azure Test Case, and the entire automation workflow is ready to execute—no complex setup required.
Minimal maintenance, maximum efficiency – Test cases are entirely Excel-driven, eliminating the need to manually create or update automation scripts; the Middleware handles all transformation, resulting in significantly reduced maintenance effort.
Dramatic turnaround time reduction – What traditionally takes 4 hours or a full day can now be accomplished in just 15 minutes; maintain the spreadsheet, and you maintain the test case—a complete transformation in automation test case creation, maintenance, and execution.

 



 Minimal precondition setup – The Azure Data Table only requires basic metadata to initiate the test: the environment, the starting URL, credentials (username/password if applicable), and any other test prerequisites—this is all the user needs to configure.

 
