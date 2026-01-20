Argument of type 'ElementHandle<Node>' is not assignable to parameter of type 'ElementHandle<Element>'.

async function getParentChain(
  element: ElementHandle,
  maxLevels: number = 15
): Promise<ElementHandle[]> {
  if (!element) {
    throw new Error('Element is required');
  }

  const parents: ElementHandle[] = [element]; // Start with the element itself
  let currentElement: ElementHandle | null = element;

  for (let i = 0; i < maxLevels; i++) {
    // Get parent of current element
    const parentHandle = await page.evaluateHandle(
      (el) => {
        if (el instanceof Element) {
          return el.parentElement;
        }
        return null;
      },
      currentElement
    );

    const parent = parentHandle as unknown as ElementHandle | null;

    // Check if parent exists
    const isNull = await page.evaluate((p) => p === null, parent);
    
    if (isNull || !parent) {
      break; // Reached the top (document/html)
    }

    parents.push(parent);
    currentElement = parent;
  }

  console.log(`✅ Found ${parents.length} elements in parent chain`);
  return parents;
}
