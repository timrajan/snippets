Block D — new keydown listener

Append after the input listener. Handles arrow-down-then-Enter, which fires no click at all.

js
// Keyboard selection from a combobox: no click fires, so read the highlighted
// option off aria-activedescendant instead.
document.addEventListener('keydown', function(e) {
    try {
        if (!window.__recorderActive) return;
        if (e.key !== 'Enter' && e.key !== 'Tab') return;

        var el = e.target;
        if (!el || !el.closest) return;

        var combo = (el.getAttribute && el.getAttribute('role') === 'combobox')
            ? el
            : el.closest('[role=""combobox""]');
        if (!combo) return;
        if (combo.getAttribute('aria-expanded') !== 'true') return;

        var adId = combo.getAttribute('aria-activedescendant');
        var opt = adId ? document.getElementById(adId) : null;
        if (!opt) return;

        __recEmitComboSelect(combo, opt);
    } catch (ex) {}
}, true);
