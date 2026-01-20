async function findNearestButton(
  elements: ElementHandle[],  // ✅ Changed to array
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!elements || elements.length === 0) {
    throw new Error('At least one element is required');
  }

  console.log(`🔍 Searching for "${buttonText}" button from ${elements.length} elements`);

  // ✅ Loop through each element
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    
    console.log(`Checking element ${i + 1}/${elements.length}...`);

    const result = await page.evaluateHandle(
      (element, buttonText) => {
        if (!(element instanceof Element)) {
          console.log('Not an Element, skipping');
          return null;
        }

        let currentNode: Element | null = element;
        let level = 0;
        const maxLevels = 15;

        while (currentNode && level < maxLevels) {
          if (currentNode instanceof Element && typeof currentNode.querySelectorAll === 'function') {
            const buttons = Array.from(currentNode.querySelectorAll('button'));
            
            for (const btn of buttons) {
              const btnText = btn.textContent?.trim() || '';
              if (btnText === buttonText || btnText.includes(buttonText)) {
                console.log(`✅ Found button at level ${level}`);
                return btn;
              }
            }
          }

          currentNode = currentNode.parentElement;
          level++;
        }

        return null;
      },
      currentElement,
      buttonText
    );

    const button = result as unknown as ElementHandle<HTMLButtonElement> | null;
    
    // ✅ If button found, return immediately (don't check remaining elements)
    if (button) {
      console.log(`✅ Button "${buttonText}" found from element ${i + 1}`);
      return button;
    }
  }

  // ✅ No button found in any of the elements
  console.log(`❌ Button "${buttonText}" not found in any of the ${elements.length} elements`);
  return null;
}
