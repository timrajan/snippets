page.frames is not a function or its return value is not iterable

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
