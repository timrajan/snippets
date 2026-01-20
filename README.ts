async function findNearestButton(
  elements: ElementHandle[],
  buttonText: string,
  maxSiblings: number = 5  // ✅ New parameter for sibling search
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!elements || elements.length === 0) {
    throw new Error('At least one element is required');
  }

  console.log(`🔍 Searching for "${buttonText}" button from ${elements.length} elements`);

  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    
    console.log(`Checking element ${i + 1}/${elements.length}...`);

    const result = await page.evaluateHandle(
      (element, buttonText, maxSiblings) => {
        if (!(element instanceof Element)) {
          console.log('Not an Element, skipping');
          return null;
        }
        
        let currentNode: Element | null = element;
        let level = 0;
        const maxLevels = 15;

        while (currentNode && level < maxLevels) {
          console.log(`Level ${level}: ${currentNode.tagName}`);
          
          // ✅ 1. Search within current node
          if (currentNode instanceof Element && typeof currentNode.querySelectorAll === 'function') {
            const buttons = Array.from(currentNode.querySelectorAll('button'));
            console.log(`  Found ${buttons.length} buttons in current node`);
            
            for (const btn of buttons) {
              const btnText = btn.textContent?.trim() || '';
              if (btnText === buttonText || btnText.includes(buttonText)) {
                console.log(`  ✅ Found button in current node at level ${level}`);
                return btn;
              }
            }
          }

          // ✅ 2. Search in next siblings
          let sibling: Element | null = currentNode.nextElementSibling;
          let siblingCount = 0;
          
          while (sibling && siblingCount < maxSiblings) {
            console.log(`  Checking sibling ${siblingCount + 1}: ${sibling.tagName}`);
            
            const siblingButtons = Array.from(sibling.querySelectorAll('button'));
            console.log(`    Found ${siblingButtons.length} buttons in sibling`);
            
            for (const btn of siblingButtons) {
              const btnText = btn.textContent?.trim() || '';
              if (btnText === buttonText || btnText.includes(buttonText)) {
                console.log(`    ✅ Found button in sibling ${siblingCount + 1} at level ${level}`);
                return btn;
              }
            }
            
            sibling = sibling.nextElementSibling;
            siblingCount++;
          }

          // ✅ 3. Move to parent and continue
          currentNode = currentNode.parentElement;
          level++;
        }
        
        return null;
      },
      currentElement,
      buttonText,
      maxSiblings
    );

    const button = result.asElement() as ElementHandle<HTMLButtonElement> | null;
    
    if (button !== null) {
      console.log(`✅ Button "${buttonText}" found from element ${i + 1}`);
      return button;
    }
    
    console.log(`Element ${i + 1}: No button found, continuing...`);
  }

  console.log(`❌ Button "${buttonText}" not found in any of the ${elements.length} elements`);
  return null;
}






























// ✅ FIX: Convert to ElementHandle and check if it's valid
    const button = result.asElement() as ElementHandle<HTMLButtonElement> | null;
    
    if (button !== null) {
      console.log(`✅ Button "${buttonText}" found from element ${i + 1}`);
      return button;
    }
    
    console.log(`Element ${i + 1}: No button found, continuing...`);


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
