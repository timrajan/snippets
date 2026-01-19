async function findNearestButton(
  currentElement: ElementHandle,
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  // ✅ FIX: Use currentElement.evaluateHandle instead of page.evaluateHandle
  const result = await currentElement.evaluateHandle(
    (element, buttonText) => {
      console.log('Inside evaluateHandle');
      console.log('Element:', element);
      console.log('Element type:', element?.constructor?.name);
      console.log('Is Element?', element instanceof Element);

      if (!(element instanceof Element)) {
        console.log('❌ Not an Element, returning null');
        return null;
      }

      console.log('✅ Valid element, starting traversal');

      let currentNode: Element | null = element;
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
    buttonText  // ✅ Only pass buttonText, element is automatic
  );

  return result as unknown as ElementHandle<HTMLButtonElement> | null;
}
