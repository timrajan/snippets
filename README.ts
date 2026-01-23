async function getTextboxValueByLabel(
  page: Page,
  labelText: string
): Promise<string | null> {
  const value = await page.evaluate((text) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const matchingLabel = labels.find(label => 
      label.textContent?.trim() === text
    );
    
    if (!matchingLabel) return null;
    
    let input: HTMLInputElement | null = null;
    
    if (matchingLabel.htmlFor) {
      input = document.getElementById(matchingLabel.htmlFor) as HTMLInputElement;
    } else {
      input = matchingLabel.querySelector('input, textarea') as HTMLInputElement;
    }
    
    return input ? input.value : null;
  }, labelText);
  
  return value;
}

// Usage with your label:
const value = await getTextboxValueByLabel(page, "Label X");
console.log(value); // This will output the value from the readonly input
