 /**
   * Find and click button immediately
   */
  async findAndClickButton(
    currentElement: ElementHandle,
    buttonText: 'Add' | 'Save' | 'Cancel'
  ): Promise<void> {
    const found = await this.findNearestButton(currentElement, buttonText);
    if (!found) {
      throw new Error(`Button "${buttonText}" not found in DOM tree`);
    }
    await this.clickStoredButton();
  }


 /**
   * Find nearest button by walking up the DOM tree from a specific element
   * Pure DOM traversal - no side effects
   * @param currentElement - The element to start searching from
   * @param buttonText - The button text to find
   * @returns ElementHandle of the button or null if not found
   */
  async findNearestButton(
    currentElement: ElementHandle,
    buttonText: string
  ): Promise<ElementHandle<HTMLButtonElement> | null> {
    if (!currentElement) {
      throw new Error('Current element is required');
    }

    const button = await this.page.evaluateHandle(
      (element, text) => {
        let currentNode: Element | null = element;
        let level = 0;
        const maxLevels = 15; // Safety limit

        while (currentNode && level < maxLevels) {
          // Look for button in current level
          const buttons = currentNode.querySelectorAll('button');
          
          for (const btn of buttons) {
            const btnText = btn.textContent?.trim() || '';
            if (btnText === text || btnText.includes(text)) {
              return btn as HTMLButtonElement;
            }
          }

          // No button found, go up one level
          currentNode = currentNode.parentElement;
          level++;
        }

        return null;
      },
      currentElement,
      buttonText
    ) as ElementHandle<HTMLButtonElement>;

    // Check if button was actually found
    const isNull = await this.page.evaluate((btn) => btn === null, button);
    
    return isNull ? null : button;
  }
