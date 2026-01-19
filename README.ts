async findNearestButton(
  currentElement: ElementHandle,
  buttonText: string
): Promise<ElementHandle<HTMLButtonElement> | null> {
  if (!currentElement) {
    throw new Error('Current element is required');
  }

  const result = await this.page.evaluateHandle(
    (element, text) => {
      // ✅ NEW LINE: Validate element first
      if (!(element instanceof Element)) {
        return null;
      }

      let currentNode: Element | null = element;
      let level = 0;
      const maxLevels = 15;

      while (currentNode && level < maxLevels) {
        // ✅ MODIFIED LINE: Added safety check
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
    currentElement,
    buttonText
  );

  // ✅ MODIFIED: Changed return handling
  return result.asElement() as ElementHandle<HTMLButtonElement> | null;
}
