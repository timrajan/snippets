
RUNNING appRuleEngine rule: totalRDZGreaterThanZero, Result:true
Inside evaluateHandle
Element: Objectelement: {isolatedHandle: {…}, handle: {…}}[[Prototype]]: Object
Element type: Object
Is Element? false
❌ Not an Element, returning null

async function findNearestButton(
  currentElement: ElementHandle,
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  console.log('Starting search for button:', buttonText);

  const result = await page.evaluateHandle(
    (currentElement, buttonText) => {
      console.log('Inside evaluateHandle');
      console.log('Element:', currentElement);
      console.log('Element type:', currentElement?.constructor?.name);
      console.log('Is Element?', currentElement instanceof Element);

      if (!(currentElement instanceof Element)) {
        console.log('❌ Not an Element, returning null');
        return null;
      }

      console.log('✅ Valid element, starting traversal');

      let currentNode: Element | null = currentElement;
      let level = 0;
      const maxLevels = 15;

      while (currentNode && level < maxLevels) {
        console.log(`Level ${level}: ${currentNode.tagName}`);

        if (currentNode instanceof Element && typeof currentNode.querySelectorAll === 'function') {
          const buttons = Array.from(currentNode.querySelectorAll('button'));
          console.log(`Found ${buttons.length} buttons at level ${level}`);
          
          for (const btn of buttons) {
            const btnText = btn.textContent?.trim() || '';
            console.log(`  Checking: "${btnText}" vs "${buttonText}"`);
            if (btnText === buttonText || btnText.includes(buttonText)) {
              console.log('  ✅ MATCH FOUND!');
              return btn;
            }
          }
        }

        currentNode = currentNode.parentElement;
        level++;
      }

      console.log('❌ No button found after', level, 'levels');
      return null;
    },
    currentElement,
    buttonText
  );

  console.log('evaluateHandle completed, result:', result);

  return result as unknown as ElementHandle<HTMLButtonElement> | null;
}
