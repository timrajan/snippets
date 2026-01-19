async function findNearestButton(
  currentElement: ElementHandle,
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  // Verify currentElement is valid
  console.log('ElementHandle type:', typeof currentElement);
  console.log('Has evaluate?', typeof currentElement.evaluate === 'function');

  const result = await page.evaluateHandle(
    (el, text) => {
      console.log('Type of el:', typeof el);
      console.log('el constructor:', el?.constructor?.name);
      console.log('Is HTMLElement?', el instanceof HTMLElement);
      console.log('Is Element?', el instanceof Element);
      console.log('Is Node?', el instanceof Node);
      
      // Try to access it as an element anyway
      let currentNode = el;
      let level = 0;
      const maxLevels = 15;

      while (currentNode && level < maxLevels) {
        console.log(`Level ${level}:`, currentNode.tagName);

        const buttons = Array.from(currentNode.querySelectorAll('button'));
        console.log(`Found ${buttons.length} buttons`);
        
        for (const btn of buttons) {
          const btnText = btn.textContent?.trim() || '';
          console.log(`  Button: "${btnText}"`);
          if (btnText === text || btnText.includes(text)) {
            console.log('  ✅ FOUND');
            return btn;
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

  return result as unknown as ElementHandle<HTMLButtonElement> | null;
}
