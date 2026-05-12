/**
 * Checks whether a given string is currently visible within the browser viewport.
 *
 * Iterates over every element in the DOM, determines which ones are at least
 * partially within the visible viewport (using `getBoundingClientRect`), and
 * checks whether any of those elements directly contain the search text as a
 * text node child. Only the element's own text is considered — text from deeper
 * descendants is ignored — to avoid false positives where a wrapping element
 * (like `<body>` or a form container) technically "contains" the string but
 * isn't itself displaying it.
 *
 * Useful for verifying that a validation message, warning, or any expected
 * label has been scrolled into view, for example after an error-summary link
 * traverses the page to a specific section.
 *
 * @param page - The Puppeteer Page instance to query.
 * @param searchText - The exact text to look for. Matched as a case-sensitive
 *                     substring (uses `String.prototype.includes`). Whitespace
 *                     around the rendered text is trimmed before comparison.
 * @returns A Promise resolving to `true` if the text is found inside any
 *          element currently within the viewport, otherwise `false`.
 *
 * @example
 * // After clicking an error-summary link that scrolls to the Age field
 * const visible = await isTextInViewport(page, 'this Field is required.');
 * expect(visible).toBe(true);
 *
 * @remarks
 * - Viewport detection uses "any part of the element is on screen", not
 *   "fully inside", so tall sections extending past the fold still count.
 * - Elements with zero width or height are excluded, which filters out most
 *   hidden or collapsed nodes.
 * - This does NOT check `display: none`, `visibility: hidden`, or `opacity: 0`.
 *   Add a `getComputedStyle` check if you need to handle those cases.
 * - Matching is case-sensitive. Normalize both sides with `.toLowerCase()`
 *   if you need case-insensitive matching.
 */
async function isTextInViewport(
  page: Page,
  searchText: string
): Promise<boolean> {
  // ...
}

vimport { Page } from 'puppeteer';

async function isTextInViewport(
  page: Page,
  searchText: string
): Promise<boolean> {
  return await page.evaluate((text) => {
    const elements = document.querySelectorAll('*');

    for (const el of elements) {
      const rect = el.getBoundingClientRect();

      // Is this element currently on screen?
      const inViewport =
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.width > 0 &&
        rect.height > 0;

      if (!inViewport) continue;

      // Does this element directly contain the text? (not via deep descendants)
      const ownText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent ?? '')
        .join('')
        .trim();

      if (ownText.includes(text)) return true;
    }

    return false;
  }, searchText);
}

// Usage
const visible = await isTextInViewport(page, 'Age is required');
expect(visible).toBe(true);

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
