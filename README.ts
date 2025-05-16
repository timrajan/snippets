import * as fs from 'fs';
import * as path from 'path';

interface PuppeteerRecorderStep {
    type: string;
    url?: string;
    target?: string;
    selectors?: string[][];
    value?: string;
    offsetX?: number;
    offsetY?: number;
    key?: string;
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
    assertedEvents?: any[];
}

interface PuppeteerRecording {
    title: string;
    steps: PuppeteerRecorderStep[];
}

/**
 * Helper function template for typing text in textboxes
 */
const typeInTextboxTemplate = `/**
 * Helper function to type text in a textbox field
 * Clears the field first and then types the value
 */
async function typeInTextbox(page: Page, selector: string, value: string): Promise<void> {
  // Clear the field first
  await page.evaluate((sel) => {
    document.querySelector(sel).value = '';
  }, selector);

  // Type the value
  await page.type(selector, value);
}`;

/**
 * Converts a Puppeteer Recorder JSON file to TypeScript
 */
function convertPuppeteerRecordingToTypeScript(
    jsonFilePath: string,
    outputFilePath: string,
): void {
    try {
        // Read and parse the JSON file
        const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
        const recording: PuppeteerRecording = JSON.parse(fileContent);

        // Generate TypeScript code
        const tsCode = generateTypeScript(recording);

        // Write TypeScript to file
        fs.writeFileSync(outputFilePath, tsCode);

        console.log(
            `Successfully converted ${jsonFilePath} to ${outputFilePath}`,
        );
    } catch (error) {
        console.error('Error converting file:', error);
    }
}

/**
 * Generates TypeScript code from a Puppeteer recording
 */
function generateTypeScript(recording: PuppeteerRecording): string {
    let code = `import { Browser, Page, launch } from 'puppeteer';

/**
 * Helper function to type text in a textbox field
 * Clears the field first and then types the value
 */
async function typeInTextbox(page: Page, selector: string, value: string): Promise<void> {
  // Clear the field first
  await page.evaluate((sel) => {
    document.querySelector(sel).value = '';
  }, selector);

  // Type the value
  await page.type(selector, value);
}

/**
 * Automated test script for: ${recording.title}
 * Generated from Puppeteer recording
 */
async function runAutomation() {
  // Launch the browser
`;

    // Start with viewport settings if available
    const viewportStep = recording.steps.find(
        (step) => step.type === 'setViewport',
    );
    if (viewportStep) {
        code += `  const browser: Browser = await launch({
    headless: false, // Set to true for headless mode
    defaultViewport: {
      width: ${viewportStep.width},
      height: ${viewportStep.height},
      deviceScaleFactor: ${viewportStep.deviceScaleFactor},
      isMobile: ${viewportStep.isMobile},
      hasTouch: ${viewportStep.hasTouch},
      isLandscape: ${viewportStep.isLandscape}
    }
  });\n\n`;
    } else {
        code += `  const browser: Browser = await launch({
    headless: false // Set to true for headless mode
  });\n\n`;
    }

    code += `  // Create a new page
  const page: Page = await browser.newPage();

  try {
`;

    // Process each step
    for (const step of recording.steps) {
        switch (step.type) {
            case 'setViewport':
                // Already handled above
                break;

            case 'navigate':
                code += `    // Navigate to the website
    await page.goto('${step.url}');
    console.log('Navigated to ${step.url}');\n\n`;
                break;

            case 'click':
                if (step.selectors && step.selectors.length > 0) {
                    const selector = getOptimalSelector(step.selectors);
                    code += `    // Click on element
    await page.click('${selector}');\n\n`;
                }
                break;

            case 'change':
                if (step.selectors && step.selectors.length > 0) {
                    const selector = getOptimalSelector(step.selectors);
                    if (selector.includes('select')) {
                        code += `    // Select dropdown option
    await selectOptionInComboboxComponent('${selector}', '${step.value}');\n\n`;
                    } else {
                        // Use custom typeInTextbox function with this.#page as first parameter
                        code += `    // Type in textbox field
    await typeInTextbox(this.#page, '${selector}', '${step.value}');\n\n`;
                    }
                }
                break;

            case 'keyDown':
            case 'keyUp':
                if (step.key === 'Tab') {
                    code += `    // Press Tab key
    await page.keyboard.press('Tab');\n\n`;
                } else if (step.key) {
                    code += `    // Press ${step.key} key
    await page.keyboard.press('${step.key}');\n\n`;
                }
                break;
        }
    }

    code += `    console.log('Test automation completed successfully!');
  } catch (error) {
    console.error('An error occurred during automation:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the automation
runAutomation().catch(console.error);
`;

    return code;
}

/**
 * Gets the most reliable selector from the options
 * Extracts ARIA value if selector starts with aria/
 */
function getOptimalSelector(selectors: string[][]): string {
    // First check if any selector starts with aria/
    for (const selectorList of selectors) {
        for (const selector of selectorList) {
            if (selector.startsWith('aria/')) {
                // Return the value after aria/ for use with typeInTextbox
                return selector.substring(5); // Remove the 'aria/' prefix
            }
        }
    }

    // Prefer CSS ID selectors next
    for (const selectorList of selectors) {
        for (const selector of selectorList) {
            if (selector.startsWith('#') && !selector.includes(' ')) {
                return selector;
            }
        }
    }

    // Then try CSS selectors
    for (const selectorList of selectors) {
        for (const selector of selectorList) {
            if (
                !selector.startsWith('xpath/') &&
                !selector.startsWith('pierce/')
            ) {
                return selector;
            }
        }
    }

    // Fallback to the first selector
    return selectors[0][0];
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node converter.js <input.json> <output.ts>');
        process.exit(1);
    }

    const inputPath = args[0];
    const outputPath = args[1];

    convertPuppeteerRecordingToTypeScript(inputPath, outputPath);
}

// Export for use as a module
export {convertPuppeteerRecordingToTypeScript};
