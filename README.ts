async function findNearestButton(
  currentElement: ElementHandle,
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  const result = await page.evaluateHandle(
    (currentElement, buttonText) => {
      // ✅ FIX: Check for Element, not ElementHandle
      // ElementHandle is Puppeteer's wrapper - doesn't exist in browser context
      if (!(currentElement instanceof Element)) {
        return null;
      }

      let currentNode: Element | null = currentElement;
      let level = 0;
      const maxLevels = 15;

      while (currentNode && level < maxLevels) {
        if (currentNode instanceof Element && typeof currentNode.querySelectorAll === 'function') {
          const buttons = Array.from(currentNode.querySelectorAll('button'));
          
          for (const btn of buttons) {
            const btnText = btn.textContent?.trim() || '';
            if (btnText === buttonText || btnText.includes(buttonText)) {
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

  return result as unknown as ElementHandle<HTMLButtonElement> | null;
}
