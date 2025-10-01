function getTextRecursively(node: Node): string {
      let text = '';

      // If it's a text node, return its text content
      if (node.nodeType === 3) { // Node.TEXT_NODE = 3
        return node.textContent?.trim() || '';
      }

      // If it's an element node
      if (node.nodeType === 1) { // Node.ELEMENT_NODE = 1
        const el = node as Element;

        // Skip style and script tags
        const tagName = el.tagName?.toLowerCase();
        if (tagName === 'style' || tagName === 'script') {
          return '';
        }

        // If the element has a shadow root, traverse it
        if (el.shadowRoot) {
          for (const childNode of Array.from(el.shadowRoot.childNodes)) {
            const childText = getTextRecursively(childNode);
            if (childText) {
              text += (text ? ' ' : '') + childText;
            }
          }
        }

        // Traverse regular child nodes
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
