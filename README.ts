Block E — input handler guard

In the input listener, immediately after the existing type exclusion list (if (t === 'radio' || ... ) return;), add:

js
            // Ignore the echo when the library writes the chosen option back
            // into the combobox's own text field.
            if (window.__recComboSuppress &&
                Date.now() < window.__recComboSuppress.until &&
                (el === window.__recComboSuppress.el ||
                 (el.closest && el.closest('[role=""combobox""]') === window.__recComboSuppress.el))) return;
Block F — EmitAction, C#

Insert immediately after the var groupName = Clean(rawGroup); line, before the radio-name fallback.

csharp
        // A combobox selection is semantically identical to a <select> change:
        // field = combobox name, value = chosen option. Normalise it here so the
        // CSV writer and AxMapper need no new cases.
        if (type == "comboselect")
        {
            type = "change";
            role = "combobox";
        }
Block G — ProcessLoggedActionsAsync, C#

Replace the final foreach (var action in actions) loop with this. The added block fixes the ordering inversion — without it, typing a filter and picking an option emits the selection before the text.

csharp
        var actions = JArray.Parse(value);
        foreach (var action in actions)
        {
            var type = action["type"]?.ToString() ?? "";
            var name = action["name"]?.ToString() ?? "";

            // Buffer type events — only emit once typing stops
            if (type == "type")
            {
                DebugLogger.Log($"Poll: buffering type event for field '{name}' (waiting for typing to stop)");
                _pendingTypes[name] = action;
                continue;
            }

            // Skip change events for fields that already have a pending or just-flushed type
            if (type == "change" && (_pendingTypes.ContainsKey(name) || flushedFields.Contains(name)))
            {
                DebugLogger.Log($"Poll: SKIPPED change event for '{name}' (redundant with pending/flushed type)");
                continue;
            }

            // Any non-type action ends typing. Flush what is buffered FIRST so the
            // generated script preserves the order the user actually performed.
            if (_pendingTypes.Count > 0)
            {
                DebugLogger.Log($"Poll: flushing {_pendingTypes.Count} pending type(s) ahead of '{type}' on '{name}'");
                foreach (var pending in _pendingTypes.Values.ToList())
                    EmitAction(pending);
                foreach (var k in _pendingTypes.Keys.ToList())
                    flushedFields.Add(k);
                _pendingTypes.Clear();
            }

            EmitAction(action);
        }
One thing to verify on your side

Block F routes combobox selections into MapToComponentLine("combobox", name, "change", value, "", -1). That only produces output if AxMapperService has:

NormalizeRole("combobox") returning "combobox", and
a change + combobox mapping.

If your native <select> path normalises "select" to something else (e.g. "dropdown"), point the role = "combobox" assignment in Block F at that same value instead. If it's missing entirely you'll see DROPPED: no mapping found for role='combobox' in the debug log — that's the symptom to look for.
