import { ElementHandle, JSHandle, Frame } from 'puppeteer';

interface FindNearestChevronOptions {
  maxLevels?: number;
  maxSiblings?: number;
  searchPreviousSiblings?: boolean;
  selector?: string; // defaults to span.chevron-panel
}

async function findNearestChevron(
  currentElement: JSHandle | ElementHandle,
  options: FindNearestChevronOptions = {}
): Promise<ElementHandle<HTMLSpanElement> | null> {
  const {
    maxLevels = 15,
    maxSiblings = 3,
    searchPreviousSiblings = true,
    selector = 'span.chevron-panel',
  } = options;

  if (!currentElement) {
    throw new Error('Current element is required');
  }

  const element = currentElement.asElement();
  if (!element) {
    throw new Error('Could not convert to ElementHandle');
  }

  // Runs in btnSave's own frame — works the same whether the app
  // is in the main frame or inside an iframe
  const ownerFrame: Frame = (element as ElementHandle).frame;

  const resultHandle = await ownerFrame.evaluateHandle(
    (el, sel, maxLvls, maxSibs, searchPrev) => {
      const isVisible = (node: Element): boolean => {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = window.getComputedStyle(node);
        return style.visibility !== 'hidden' && style.display !== 'none';
      };

      // Search a node and its descendants, including nested (open) shadow roots
      const deepSearch = (root: Element | ShadowRoot): HTMLSpanElement | null => {
        if (root instanceof Element && root.matches(sel) && isVisible(root)) {
          return root as HTMLSpanElement;
        }

        for (const c of Array.from(root.querySelectorAll<HTMLSpanElement>(sel))) {
          if (isVisible(c)) return c;
        }

        for (const child of Array.from(root.querySelectorAll('*'))) {
          if (child.shadowRoot) {
            const found = deepSearch(child.shadowRoot);
            if (found) return found;
          }
        }

        return null;
      };

      if (!(el instanceof Element)) return null;

      let currentNode: Element | null = el;
      let level = 0;

      while (currentNode && level < maxLvls) {
        // 1. Inside the current node
        let found = deepSearch(currentNode);
        if (found) return found;

        // 2. Next siblings
        let sibling: Element | null = currentNode.nextElementSibling;
        for (let i = 0; i < maxSibs && sibling; i++) {
          found = deepSearch(sibling);
          if (found) return found;
          sibling = sibling.nextElementSibling;
        }

        // 3. Previous siblings
        if (searchPrev) {
          sibling = currentNode.previousElementSibling;
          for (let i = 0; i < maxSibs && sibling; i++) {
            found = deepSearch(sibling);
            if (found) return found;
            sibling = sibling.previousElementSibling;
          }
        }

        // 4. Hop out of a shadow root to its host if we hit the top of one
        if (!currentNode.parentElement) {
          const rootNode = currentNode.getRootNode();
          if (rootNode instanceof ShadowRoot) {
            currentNode = rootNode.host;
            level++;
            continue;
          }
        }

        currentNode = currentNode.parentElement;
        level++;
      }

      return null;
    },
    element,
    selector,
    maxLevels,
    maxSiblings,
    searchPreviousSiblings
  );

  const chevron = resultHandle.asElement();
  if (chevron) {
    return chevron as ElementHandle<HTMLSpanElement>;
  }

  await resultHandle.dispose();
  return null;
}
