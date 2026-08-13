// A combobox's inner text is its currently *selected value*, and a
            // <select>'s is every option concatenated — neither is the field name.
            var tag = (el.tagName || '').toLowerCase();
            var skipText = tag === 'select' ||
                           (el.getAttribute && el.getAttribute('role') === 'combobox');
            if (!skipText) {
                var tc = (el.innerText || el.textContent || '').trim();
                if (tc) return tc;
            }


That message comes from a different place than the patch — it's the default: case in OnApplyValidationClick, which is the highlight & validate path, not the recording path. The Block A–G patch never touches it. Two separate things are broken here.

1. The switch only knows five roles
csharp
switch (_pendingValidationRole)
{
    case "radio":
    case "button":
    case "header":
    case "heading":
    case "h1":
    default: // "'{role}' is not mapped yet."
}

combobox isn't there — nor are textbox, link, checkbox, or table, all of which you already have working ComponentMap entries for. Note h2 through h6 also fall through to default, even though IsHeaderRole returns true for them and shows the level panel. So a validated <h2> shows the dropdown and then tells you it isn't mapped.

2. Highlight mode can't see comboboxes either

Even with the switch fixed, resolveTargetElement in EnableHighlightModeAsync has the exact problem Block B fixed on the recording side — it stops at button, a, input, select, textarea or role in {button, link, checkbox, radio, tab}. role="combobox" isn't in that list, so it walks past your combobox to document.body, gives up, and returns the raw elementFromPoint result — usually an inner <span> or <div>. getRole then returns the tag name, and you get "'span' is not mapped yet."

If that's the message you're actually seeing, fix #2 first — #1 alone won't help.

Fix the JS ancestor walk — replace the "nearest interactive ancestor" block inside resolveTargetElement:

js
        var cur = el;
        while (cur && cur !== document.body) {
            var role = cur.getAttribute && cur.getAttribute('role');
            if (role === 'combobox' || role === 'option' || role === 'menuitem' ||
                role === 'treeitem' || role === 'switch') return cur;

            var tag = (cur.tagName || '').toLowerCase();
            if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return cur;
            if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'radio' || role === 'tab') return cur;

            cur = cur.parentElement;
        }

And in getAccessibleName, guard the innerText fallback — otherwise a combobox validates against its selected value rather than its label, which will pass on the recording machine and fail everywhere else:

js
            var isCombo = el.getAttribute && el.getAttribute('role') === 'combobox';
            if (!isCombo) {
                var tc = (el.innerText || el.textContent || '').trim();
                if (tc) return tc;
            }
3. Better: stop hand-maintaining the switch

The switch is duplicating what ComponentMap.json already knows. Add to AxMapperService:

csharp
public string? GetComponentName(string role)
{
    var normalized = NormalizeRole(role);
    return _componentMap.TryGetValue(normalized, out var config)
        ? config["component"]?.ToString()
        : null;
}

Store the mapper on the toolbar (private readonly AxMapperService _axMapper;, assigned in the constructor — you're already receiving it, just passing it straight through), then replace the entire switch with:

csharp
        string line;

        if (IsHeaderRole(_pendingValidationRole))
        {
            var selected = GetSelectedHeaderLevel();
            line = selected.Length == 2 && selected[0] == 'h' &&
                   int.TryParse(selected[1].ToString(), out var level) && level is >= 1 and <= 6
                ? $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\", {level});"
                : $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
        }
        else
        {
            var component = _axMapper.GetComponentName(_pendingValidationRole);
            if (string.IsNullOrEmpty(component))
            {
                MessageBox.Show($"'{_pendingValidationRole}' is not mapped yet.", "Validation",
                    MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            line = $"await {component}(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
        }

That collapses ~70 lines to ~20, picks up combobox/textbox/link/checkbox/table for free, fixes h2–h6, and means adding a role to ComponentMap.json in future works in both the recorder and the validator without a code change.

One thing to note about the emitted line either way: await ButtonComponent(this.#page, "X"); constructs the component but doesn't assert anything. If your components throw on not-found that's a valid implicit assertion — if they don't, these validation lines are no-ops. Worth checking, since a silently-passing validation is worse than none.
