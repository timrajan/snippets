async function findHiddenTextboxByValue(
  page: Page, 
  expectedValue: string
): Promise<ElementHandle<Element> | null> {
  const textboxes = await page.$$('input[aria-hidden="true"], textarea[aria-hidden="true"]');
  
  for (const textbox of textboxes) {
    const value = await textbox.evaluate((el: HTMLInputElement) => el.value);
    
    if (value === expectedValue) {
      // Dispose other textboxes to free memory
      textboxes.forEach(tb => {
        if (tb !== textbox) tb.dispose();
      });
      return textbox;
    }
  }
  
  // Dispose all if no match found
  await Promise.all(textboxes.map(tb => tb.dispose()));
  
  return null;
}



import { Page, ElementHandle } from 'puppeteer';

/**
 * Finds a textbox with aria-hidden="true" that matches the expected value
 * @param page - Puppeteer Page object
 * @param expectedValue - The value to search for
 * @returns ElementHandle of the matching textbox, or null if not found
 */
async function findHiddenTextboxByValue(
  page: Page, 
  expectedValue: string
): Promise<ElementHandle<Element> | null> {
  const matchingElement = await page.evaluateHandle((expected) => {
    // Get all input and textarea elements with aria-hidden="true"
    const textboxes = Array.from(
      document.querySelectorAll('input[aria-hidden="true"], textarea[aria-hidden="true"]')
    ) as HTMLInputElement[];
    
    // Find the one matching the expected value
    const match = textboxes.find(
      (textbox) => textbox.value === expected
    );
    
    return match || null;
  }, expectedValue);
  
  return matchingElement.asElement();
}

/**
 * Gets all textboxes with aria-hidden="true" and their values
 * @param page - Puppeteer Page object
 * @returns Array of objects with element handles and their values
 */
async function getAllHiddenTextboxes(page: Page): Promise<Array<{
  element: ElementHandle<Element>;
  value: string;
}>> {
  const textboxes = await page.$$('input[aria-hidden="true"], textarea[aria-hidden="true"]');
  
  const results = [];
  for (const textbox of textboxes) {
    const value = await page.evaluate(el => (el as HTMLInputElement).value, textbox);
    results.push({ element: textbox, value });
  }
  
  return results;
}

// Usage example:
async function example(page: Page) {
  const expectedValue = "John Doe";
  
  // Method 1: Direct find
  const matchingTextbox = await findHiddenTextboxByValue(page, expectedValue);
  
  if (matchingTextbox) {
    console.log("Found matching textbox!");
    // You can now interact with it
    await matchingTextbox.click();
  } else {
    console.log("No matching textbox found");
  }
  
  // Method 2: Get all and loop
  const allTextboxes = await getAllHiddenTextboxes(page);
  
  for (const { element, value } of allTextboxes) {
    console.log(`Textbox value: ${value}`);
    
    if (value === expectedValue) {
      console.log("Match found!");
      await element.click();
      break;
    }
  }
}
