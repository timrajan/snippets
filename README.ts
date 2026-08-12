Block C — mousedown handler

In the existing mousedown listener, replace everything from var el = __recFindInteractive(e.target); down to var role = __recGetRole(el); with this. Note the tag guard has moved below the combobox checks.

js
        var el = __recFindInteractive(e.target);
        var role = __recGetRole(el);

        // --- Combobox: an option was chosen -----------------------------
        if (role === 'option' || role === 'menuitem' ||
            role === 'menuitemradio' || role === 'treeitem') {
            __recEmitComboSelect(__recFindComboForOption(el), el);
            return;
        }

        // --- Combobox: the list was opened ------------------------------
        // Opening a dropdown is not a test step on its own. Remember it and
        // wait for the option. (We never preventDefault, so the UI still opens.)
        if (__recIsComboTrigger(el)) {
            window.__recCombo = { el: el, name: __recGetControlName(el), at: Date.now() };
            return;
        }

        var tag = el.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

Then the existing if (role === 'radio' || role === 'checkbox') return; and the __recorderLog.push({...}) continue unchanged.
