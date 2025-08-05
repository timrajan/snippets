async function extractTextFromShadowCell(cellHandle: ElementHandle<Element>): Promise<string> {
  const text = await cellHandle.evaluate((cell) => {
    const shadowRoot = (cell as any).shadowRoot;
    if (!shadowRoot) return '';
    
    // Direct path to the text content
    const textDiv = shadowRoot.querySelector('span[role="cell"] div.cell-content slot div');
    if (textDiv) {
      return textDiv.textContent?.trim() || '';
    }
    
    // Fallback: get any text from shadow DOM
    return shadowRoot.textContent?.trim() || '';
  });
  
  return text;
}
