/**
 * Extracts all text content from an ElementHandle, including text within shadow roots (nested or not)
 * @param elementHandle - The ElementHandle to extract text from
 * @returns Promise<string> - All text content concatenated
 */
export async function extractTextFromElement(elementHandle: ElementHandle): Promise<string> {
  return await elementHandle.evaluate((element) => {
    // @ts-ignore
    function getTextRecursively(node): string {
      let text = '';

      // If it's a text node, return its text content
      // @ts-ignore
      if (node.nodeType === 3) { // Node.TEXT_NODE = 3
        // @ts-ignore
        return node.textContent?.trim() || '';
      }

      // If it's an element node
      // @ts-ignore
      if (node.nodeType === 1) { // Node.ELEMENT_NODE = 1
        // @ts-ignore
        const el = node;

        // Skip style and script tags
        // @ts-ignore
        const tagName = el.tagName?.toLowerCase();
        if (tagName === 'style' || tagName === 'script') {
          return '';
        }

        // If the element has a shadow root, traverse it
        // @ts-ignore
        if (el.shadowRoot) {
          // @ts-ignore
          for (const childNode of Array.from(el.shadowRoot.childNodes)) {
            const childText = getTextRecursively(childNode);
            if (childText) {
              text += (text ? ' ' : '') + childText;
            }
          }
        }

        // Traverse regular child nodes
        // @ts-ignore
        for (const childNode of Array.from(el.childNodes)) {
          const childText = getTextRecursively(childNode);
          if (childText) {
            text += (text ? ' ' : '') + childText;
          }
        }
      }

      return text;
    }

    return getTextRecursively(element);
  });
}
