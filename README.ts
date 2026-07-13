import { ElementHandle, JSHandle, Frame } from 'puppeteer';

interface FindNearestChevronOptions {
  maxLevels?: number;
  selector?: string; // defaults to span.chevron-panel
}

async function findNearestChevron(
  currentElement: JSHandle | ElementHandle,
  options: FindNearestChevronOptions = {}
): Promise<ElementHandle<HTMLSpanElement> | null> {
  const {
    maxLevels = 15,
    selector = 'span.chevron-panel',
  } = options;

  if (!currentElement) {
    throw new Error('Current element is required');
  }

  const element = currentElement.asElement();
  if (!element) {
    throw new Error('Could not convert to ElementHandle');
  }

  const ownerFrame: Frame = (element as ElementHandle).frame;

  const resultHandle = await ownerFrame.evaluateHandle(
    (el, sel, maxLvls) => {
      const isVisible = (node: Element): boolean => {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = window.getComputedStyle(node);
        return style.visibility !== 'hidden' && style.display !== 'none';
      };

      // Collect ALL visible matches under a root, incl. nested open shadow roots
      const collect = (root: Element | ShadowRoot, out: HTMLSpanElement[]) => {
        if (root instanceof Element && root.matches(sel) && isVisible(root)) {
          out.push(root as HTMLSpanElement);
        }
        for (const c of Array.from(root.querySelectorAll<HTMLSpanElement>(sel))) {
          if (isVisible(c)) out.push(c);
        }
        for (const child of Array.from(root.querySelectorAll('*'))) {
          if (child.shadowRoot) collect(child.shadowRoot, out);
        }
      };

      if (!(el instanceof Element)) return null;

      const refRect = el.getBoundingClientRect();
      const refX = refRect.left + refRect.width / 2;
      const refY = refRect.top + refRect.height / 2;

      const distanceTo = (node: Element): number => {
        const r = node.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - refX;
        const dy = cy - refY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      // Walk up until we find a level that contains at least one chevron,
      // then pick the geometrically closest one at that level
      let currentNode: Element | null = el;
      let level = 0;

      while (currentNode && level < maxLvls) {
        const candidates: HTMLSpanElement[] = [];
        collect(currentNode, candidates);

        if (candidates.length > 0) {
          // Dedupe (matches() + querySelectorAll can double-add the root)
          const unique = Array.from(new Set(candidates));
          unique.sort((a, b) => distanceTo(a) - distanceTo(b));
          return unique[0];
        }

        // Hop out of a shadow root to its host if we hit the top of one
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
    maxLevels
  );

  const chevron = resultHandle.asElement();
  if (chevron) {
    return chevron as ElementHandle<HTMLSpanElement>;
  }

  await resultHandle.dispose();
  return null;
}
