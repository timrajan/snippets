 error TS2739: Type 'HTMLSpanElement' is missing the following properties from type 'Promise<void>': then, catch, finally, [Symbol.toStringTag]
 // Collect ALL visible matches under a root, incl. nested open shadow roots
            const collect = (root: Element | ShadowRoot, out: HTMLSpanElement[])=> {
                if (root instanceof Element && root.matches(sel) && isVisible(root)) {
                    out.push(root as HTMLSpanElement);
                }
                for (const c of Array.from(root.querySelectorAll<HTMLSpanElement>(sel))) {
                    if (isVisible(c)) out.push(c);
                }
                for (const child of Array.from(root.querySelectorAll("*"))) {
                    if (child.shadowRoot) collect(child.shadowRoot, out);
                }
            };
