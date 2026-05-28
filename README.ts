async function findNearestButton(
    elements: ElementHandle[],
    buttonText: string,
    maxSiblings: number = 50 //New parameter for sibling search
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

                // Helper: querySelectorAll that pierces shadow roots
                function queryAllDeep(root: Element | ShadowRoot | Document, selector: string): Element[] {
                    const results: Element[] = [];
                    const direct = Array.from(root.querySelectorAll(selector));
                    results.push(...direct);
                    // Recurse into any shadow roots found under this root
                    const all = Array.from(root.querySelectorAll("*"));
                    for (const el of all) {
                        if ((el as Element).shadowRoot) {
                            results.push(...queryAllDeep((el as Element).shadowRoot!, selector));
                        }
                    }
                    return results;
                }

                // Helper: find a matching button inside a root (covers shadow DOM)
                function findButtonInRoot(root: Element | ShadowRoot): Element | null {
                    const buttons = queryAllDeep(root, "button");
                    for (const btn of buttons) {
                        const btnText = btn.textContent?.trim() || "";
                        if (btnText === buttonText || btnText.includes(buttonText)) {
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
                    // 1. Search within current node (now pierces shadow DOM)
                    if (currentNode instanceof Element && typeof currentNode.querySelectorAll === "function") {
                        const buttons = queryAllDeep(currentNode, "button");
                        console.log(`  Found ${buttons.length} buttons in current node (incl. shadow DOM)`);
                        const match = findButtonInRoot(currentNode);
                        if (match) {
                            console.log(`Found button in current node at level ${level}`);
                            return match;
                        }
                    }
                    // 2. Search in next siblings (now pierces shadow DOM)
                    let sibling: Element | null = currentNode.nextElementSibling;
                    let siblingCount = 0;
                    while (sibling && siblingCount < maxSiblings) {
                        console.log(`Checking sibling ${siblingCount + 1}: ${sibling.tagName}`);
                        const siblingButtons = queryAllDeep(sibling, "button");
                        console.log(`Found ${siblingButtons.length} buttons in sibling (incl. shadow DOM)`);
                        const match = findButtonInRoot(sibling);
                        if (match) {
                            console.log(`Found button in sibling ${siblingCount + 1} at level ${level}`);
                            return match;
                        }
                        sibling = sibling.nextElementSibling;
                        siblingCount++;
                    }
                    // 3. If we hit a shadow root host, hop into the shadow root and continue up
                    //    Otherwise move to parent normally
                    const parent: Element | null = currentNode.parentElement;
                    if (!parent) {
                        // Could be at the top of a shadow root — cross the boundary
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
        // If not found in the main frame for this element, sweep all frames.
        // (Iframes are separate execution contexts — page.evaluateHandle above
        //  can't see into them, so we check them here.)
        for (const frame of page.frames()) {
            if (frame === page.mainFrame()) continue;
            try {
                const frameResult = await frame.evaluateHandle((buttonText) => {
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
                // Cross-origin iframes will throw — silently skip those
                console.log(`Skipping frame ${frame.url()}: ${(err as Error).message}`);
            }
        }

        console.log(`Element ${i + 1}: No button found, continuing...`);
    }
    console.log(`Button "${buttonText}" not found in any of the ${elements.length} elements`);
    return null;
}
