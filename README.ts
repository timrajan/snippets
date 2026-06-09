async function findNearestButton(
    elements: ElementHandle[],
    buttonText: string,
    maxSiblings: number = 50
): Promise<ElementHandle<HTMLButtonElement> | null> {
    if (!elements || elements.length === 0) {
        throw new Error("At least one element is required");
    }
    for (let i = 0; i < elements.length; i++) {
        const currentElement = elements[i];
        const result = await page.evaluateHandle(
            (element, buttonText, maxSiblings) => {
                if (!(element instanceof Element)) {
                    console.log("Not an Element, skipping");
                    return null;
                }

                // Helper: is this element actually clickable (non-zero box, not hidden)?
                function isVisible(el: Element): boolean {
                    const r = el.getBoundingClientRect();
                    if (r.width <= 0 || r.height <= 0) return false;
                    const cs = getComputedStyle(el);
                    if (cs.visibility === "hidden" || cs.display === "none") return false;
                    return true;
                }

                // Helper: querySelectorAll that pierces shadow roots
                function queryAllDeep(root: Element | ShadowRoot | Document, selector: string): Element[] {
                    const results: Element[] = [];
                    const direct = Array.from(root.querySelectorAll(selector));
                    results.push(...direct);
                    const all = Array.from(root.querySelectorAll("*"));
                    for (const el of all) {
                        if ((el as Element).shadowRoot) {
                            results.push(...queryAllDeep((el as Element).shadowRoot!, selector));
                        }
                    }
                    return results;
                }

                // Helper: find a matching, VISIBLE button inside a root (covers shadow DOM)
                function findButtonInRoot(root: Element | ShadowRoot): Element | null {
                    const buttons = queryAllDeep(root, "button");
                    for (const btn of buttons) {
                        const btnText = btn.textContent?.trim() || "";
                        if (btnText === buttonText || btnText.includes(buttonText)) {
                            if (!isVisible(btn)) {
                                console.log(`  Skipping zero-size/hidden match: "${btnText}"`);
                                continue; // ignore stale/closing instance, keep looking
                            }
                            return btn;
                        }
                    }
                    return null;
                }

                let currentNode: Element | null = element;
                let level = 0;
                const maxLevels = 50;
                while (currentNode && level < maxLevels) {
                    console.log(`Level ${level}: ${currentNode.tagName}`);
                    if (currentNode instanceof Element && typeof currentNode.querySelectorAll === "function") {
                        const buttons = queryAllDeep(currentNode, "button");
                        console.log(`  Found ${buttons.length} buttons in current node (incl. shadow DOM)`);
                        const match = findButtonInRoot(currentNode);
                        if (match) {
                            console.log(`Found visible button in current node at level ${level}`);
                            return match;
                        }
                    }
                    let sibling: Element | null = currentNode.nextElementSibling;
                    let siblingCount = 0;
                    while (sibling && siblingCount < maxSiblings) {
                        console.log(`Checking sibling ${siblingCount + 1}: ${sibling.tagName}`);
                        const siblingButtons = queryAllDeep(sibling, "button");
                        console.log(`Found ${siblingButtons.length} buttons in sibling (incl. shadow DOM)`);
                        const match = findButtonInRoot(sibling);
                        if (match) {
                            console.log(`Found visible button in sibling ${siblingCount + 1} at level ${level}`);
                            return match;
                        }
                        sibling = sibling.nextElementSibling;
                        siblingCount++;
                    }
                    const parent: Element | null = currentNode.parentElement;
                    if (!parent) {
                        const rootNode = currentNode.getRootNode();
                        if (rootNode instanceof ShadowRoot) {
                            currentNode = rootNode.host;
                            console.log(`Crossing shadow boundary up to host: ${currentNode?.tagName}`);
                            level++;
                            continue;
                        }
                    }
                    currentNode = parent;
                    level++;
                }
                return null;
            },
            currentElement,
            buttonText,
            maxSiblings
        );
        const button = result.asElement() as ElementHandle<HTMLButtonElement> | null;
        if (button !== null) {
            console.log(` Button "${buttonText}" found from element ${i + 1}`);
            return button;
        }

        // ---- IFRAME FALLBACK ----
        for (const frame of page.frames()) {
            if (frame === page.mainFrame()) continue;
            try {
                const frameResult = await frame.evaluateHandle((buttonText) => {
                    function isVisible(el: Element): boolean {
                        const r = el.getBoundingClientRect();
                        if (r.width <= 0 || r.height <= 0) return false;
                        const cs = getComputedStyle(el);
                        if (cs.visibility === "hidden" || cs.display === "none") return false;
                        return true;
                    }
                    function queryAllDeep(root: Element | ShadowRoot | Document, selector: string): Element[] {
                        const results: Element[] = [];
                        results.push(...Array.from(root.querySelectorAll(selector)));
                        const all = Array.from(root.querySelectorAll("*"));
                        for (const el of all) {
                            if ((el as Element).shadowRoot) {
                                results.push(...queryAllDeep((el as Element).shadowRoot!, selector));
                            }
                        }
                        return results;
                    }
                    const buttons = queryAllDeep(document, "button");
                    for (const btn of buttons) {
                        const btnText = btn.textContent?.trim() || "";
                        if (btnText === buttonText || btnText.includes(buttonText)) {
                            if (!isVisible(btn)) continue; // skip zero-size/hidden
                            return btn;
                        }
                    }
                    return null;
                }, buttonText);

                const frameButton = frameResult.asElement() as ElementHandle<HTMLButtonElement> | null;
                if (frameButton !== null) {
                    console.log(` Button "${buttonText}" found in iframe (${frame.url()}) from element ${i + 1}`);
                    return frameButton;
                }
            } catch (err) {
                console.log(`Skipping frame ${frame.url()}: ${(err as Error).message}`);
            }
        }

        console.log(`Element ${i + 1}: No button found, continuing...`);
    }
    console.log(`Button "${buttonText}" not found in any of the ${elements.length} elements`);
    return null;
}
