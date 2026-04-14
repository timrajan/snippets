Test Recorder — Project Description
What It Is
Test Recorder is a lightweight Windows desktop application built on WPF .NET 8 that automates the creation of Puppeteer-based test scripts for our QA automation framework.

The Problem It Solves
Currently every automation test script is written by hand. A tester must open the browser, inspect each element, find its accessible name, and manually write each line of code — one element at a time. This process is slow, repetitive, and prone to human error.

How It Works
The tester enters an Azure DevOps Test Case ID and their PAT token. The app fetches the test case details from Azure, generates a ready-to-use TypeScript test scaffold, and opens Chrome in recording mode. The tester then simply interacts with the application under test — clicking buttons, typing into fields, selecting options — exactly as an end user would. Every interaction is automatically captured and converted into the correct component-based TypeScript code in real time. When recording stops, three production-ready files are waiting in the output folder.

What Gets Generated Automatically
test.ts — a describe/it test skeleton populated with the actual Azure test steps

page.ts — a page object class with all recorded actions inside a method

shared-steps.ts — a shared async function template ready for reuse

Benefits to the Team
Benefit	Detail
Benefit	Detail
Faster test creation	What takes 30-60 minutes of manual scripting takes minutes to record
Fewer human errors	Accessible names are captured directly from the browser — no manual lookup
Consistent code style	Every recorded script follows the same page object pattern automatically
Azure integration	Test steps and IDs come directly from Azure DevOps — no copy pasting
Smart waits	Page load delays are handled automatically — no hard-coded wait times
IT friendly	Pure Microsoft stack — WPF .NET 8, NuGet packages, MSI installer
Technology
Built entirely on the Microsoft stack — WPF .NET 8, C#, Microsoft Playwright NuGet package, and Azure DevOps REST API — making it straightforward to approve, deploy, and maintain within a corporate Windows environment.
