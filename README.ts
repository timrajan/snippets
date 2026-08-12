function __recFindInteractive(el) {
    try {
        var cur = el;
        while (cur && cur !== document.body) {
            var role = cur.getAttribute ? cur.getAttribute('role') : null;

            if (role === 'combobox' || role === 'option' || role === 'menuitem' ||
                role === 'menuitemradio' || role === 'menuitemcheckbox' ||
                role === 'treeitem' || role === 'switch') return cur;

            var tag = cur.tagName.toLowerCase();
            if (tag === 'button' || tag === 'a' || tag === 'input' ||
                tag === 'select' || tag === 'textarea') return cur;

            if (role === 'button' || role === 'link' || role === 'checkbox' ||
                role === 'radio' || role === 'tab') return cur;

            cur = cur.parentElement;
        }
    } catch (e) {}
    return el;
}
