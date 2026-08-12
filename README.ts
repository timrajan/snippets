// --- Combobox support --------------------------------------------------
// The combobox whose list is currently open. Needed because most libraries
// portal the listbox to <body>, so the option element has no DOM relationship
// to the field it belongs to.
window.__recCombo = null;
// Suppresses the 'input' event a combobox fires when the library writes the
// chosen option back into its own text field after selection.
window.__recComboSuppress = null;

// Accessible name for a *control*. Same as __recGetName but WITHOUT the
// innerText fallback: for a combobox trigger, innerText is the currently
// selected value, not the field label. Using __recGetName here gives you
// fields called 'Please select...'.
function __recGetControlName(el) {
    try {
        if (!el) return '';

        var a = el.getAttribute('aria-label');
        if (a) return a.trim();

        var lb = el.getAttribute('aria-labelledby');
        if (lb) {
            var ids = lb.split(/\s+/);
            var t = [];
            for (var i = 0; i < ids.length; i++) {
                var r = document.getElementById(ids[i]);
                if (r && r.innerText) t.push(r.innerText.trim());
            }
            if (t.length > 0) return t.join(' ');
        }

        if (el.id) {
            var lbl = document.querySelector('label[for=""' + CSS.escape(el.id) + '""]');
            if (lbl && lbl.innerText) return lbl.innerText.trim();
        }

        // Wrapping <label>: strip the control itself so we get the label text only.
        var wrapping = el.closest && el.closest('label');
        if (wrapping) {
            var clone = wrapping.cloneNode(true);
            var ctrls = clone.querySelectorAll('input,select,textarea,[role=""combobox""]');
            for (var k = 0; k < ctrls.length; k++) ctrls[k].remove();
            var wt = (clone.innerText || '').trim();
            if (wt) return wt;
        }

        var ti = el.getAttribute('title');
        if (ti) return ti.trim();

        var ph = el.getAttribute('placeholder');
        if (ph) return ph.trim();

        // Material / PrimeNG / Bootstrap: label lives in the field wrapper.
        var host = el.closest('mat-form-field, .form-group, .form-field, .field, .p-field');
        if (host) {
            var hl = host.querySelector('mat-label, label');
            if (hl && hl.innerText) return hl.innerText.trim();
        }

        return '';
    } catch (e) {
        return '';
    }
}

function __recIsComboTrigger(el) {
    try {
        if (!el || !el.getAttribute) return false;
        if (el.getAttribute('role') === 'combobox') return true;
        var hp = el.getAttribute('aria-haspopup');
        return hp === 'listbox' || hp === 'menu';
    } catch (e) {
        return false;
    }
}

// Given a clicked option, work out which combobox owns it.
function __recFindComboForOption(optEl) {
    try {
        var box = optEl.closest('[role=""listbox""],[role=""menu""],[role=""tree""]');

        // 1. Something points at the listbox via aria-controls / aria-owns.
        if (box && box.id) {
            var owner = document.querySelector(
                '[aria-controls=""' + CSS.escape(box.id) + '""],[aria-owns=""' + CSS.escape(box.id) + '""]');
            if (owner) {
                return owner.getAttribute('role') === 'combobox'
                    ? owner
                    : (owner.closest('[role=""combobox""]') || owner);
            }
        }

        // 2. Inline (non-portalled) listbox — combobox is a nearby sibling.
        if (box) {
            var wrap = box.parentElement;
            while (wrap && wrap !== document.body) {
                var c = wrap.querySelector('[role=""combobox""]');
                if (c) return c;
                wrap = wrap.parentElement;
            }
        }

        // 3. Portalled with no aria wiring — fall back to whatever was opened last.
        if (window.__recCombo && window.__recCombo.el && document.contains(window.__recCombo.el)) {
            return window.__recCombo.el;
        }
    } catch (e) {}
    return null;
}

function __recEmitComboSelect(comboEl, optEl) {
    try {
        var comboName = comboEl ? __recGetControlName(comboEl) : '';
        if (!comboName && window.__recCombo) comboName = window.__recCombo.name;

        var optName = __recGetName(optEl);
        if (!optName && optEl) {
            optName = (optEl.getAttribute('data-value') || optEl.value || '').trim();
        }

        window.__recorderLog.push({
            type: 'comboselect',
            tag: optEl ? optEl.tagName : '',
            role: 'combobox',
            name: comboName,
            value: optName,
            timestamp: Date.now()
        });

        if (comboEl) {
            window.__recComboSuppress = { el: comboEl, until: Date.now() + 1000 };
        }
        window.__recCombo = null;
    } catch (e) {}
}
