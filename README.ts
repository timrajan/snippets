const textContent = await jsHandle.evaluate((el) => el.textContent);
console.log('Text:', textContent);


async function findNearestButton(
  currentElement: JSHandle | ElementHandle,  // ✅ Accept both
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  // ✅ Convert JSHandle to ElementHandle
  const element = currentElement.asElement();
  
  if (!element) {
    throw new Error('Could not convert to ElementHandle');
  }

  const result = await page.evaluateHandle(
    (el, text) => {
      if (!(el instanceof Element)) {
        console.log('❌ Not an Element');
        return null;
      }

      let currentNode: Element | null = el;
      let level = 0;
      const maxLevels = 15;

      while (currentNode && level < maxLevels) {
        if (currentNode instanceof Element && typeof currentNode.querySelectorAll === 'function') {
          const buttons = Array.from(currentNode.querySelectorAll('button'));
          
          for (const btn of buttons) {
            const btnText = btn.textContent?.trim() || '';
            if (btnText === text || btnText.includes(text)) {
              return btn;
            }
          }
        }

        currentNode = currentNode.parentElement;
        level++;
      }

      return null;
    },
    element,  // ✅ Use the converted element
    buttonText
  );

  return result as unknown as ElementHandle<HTMLButtonElement> | null;
}
