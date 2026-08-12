using Newtonsoft.Json.Linq;
using System.IO;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using TestRecorder.Services;

public class CdpRecorderService
{
    private ClientWebSocket? _webSocket;
    private int _messageId = 1;
    private bool _isRecording = false;
    private string? _sessionId;
    private readonly AxMapperService _axMapper;
    private DateTime _lastActionTime = DateTime.Now;
    private CancellationTokenSource? _cts;
    private readonly Dictionary<string, JToken> _pendingTypes = new();

    public event Action<string>? LineRecorded;
    
    public event Action<int>? LineCountUpdated;
    public event Action<string>? ValidationCaptured; 

    private int _lineCount = 0;
    private bool _highlightMode = false; 
    private readonly CsvExportService _csvExporter = new(); 
    private string _lastEmittedSignature = string.Empty;
    private DateTime _lastEmittedAt = DateTime.MinValue;
    private const int DuplicateActionWindowMs = 500;
    public event Action<string, string>? ValidationTargetCaptured;


    public CdpRecorderService(AxMapperService axMapper)
    {
        _axMapper = axMapper;
    }

    /// Connects to Chrome via CDP. Discovers the first open page tab from localhost:9222,
    /// opens a WebSocket connection, injects JS listeners, and starts the polling loop.
    public async Task<bool> ConnectAsync()
    {
        try
        {
            DebugLogger.Init();
            DebugLogger.Log("ConnectAsync: starting connection to Chrome...");

            using var http = new HttpClient();
            var jsonStr = await http.GetStringAsync("http://localhost:9222/json");
            DebugLogger.Log($"ConnectAsync: /json response length={jsonStr.Length}");

            var tabs = JArray.Parse(jsonStr);
            DebugLogger.Log($"ConnectAsync: found {tabs.Count} target(s) total");

            var pageTabs = tabs.Where(t => t["type"]?.ToString() == "page").ToList();
            DebugLogger.Log($"ConnectAsync: {pageTabs.Count} page tab(s):");
            foreach (var t in pageTabs)
                DebugLogger.Log($"  - url='{t["url"]}' title='{t["title"]}'");

            // Prefer real web pages over chrome://, devtools://, chrome-extension://, new tab, etc.
            static bool IsRealPage(JToken t)
            {
                var url = t["url"]?.ToString() ?? "";
                return url.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                    || url.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                    || url.StartsWith("file://", StringComparison.OrdinalIgnoreCase);
            }

            var tab = pageTabs.FirstOrDefault(IsRealPage) ?? pageTabs.FirstOrDefault();
            if (tab == null)
            {
                DebugLogger.Log("ConnectAsync: FAILED — no 'page' tab found");
                return false;
            }
            DebugLogger.Log($"ConnectAsync: SELECTED tab url='{tab["url"]}' title='{tab["title"]}'");

            var wsUrl = tab["webSocketDebuggerUrl"]?.ToString();
            DebugLogger.Log($"ConnectAsync: webSocketDebuggerUrl = {wsUrl}");
            if (string.IsNullOrEmpty(wsUrl))
            {
                DebugLogger.Log("ConnectAsync: FAILED — webSocketDebuggerUrl is empty");
                return false;
            }

            _webSocket = new ClientWebSocket();
            _cts = new CancellationTokenSource();
            await _webSocket.ConnectAsync(new Uri(wsUrl), _cts.Token);
            DebugLogger.Log($"ConnectAsync: WebSocket connected (state={_webSocket.State})");

            // Inject click/input listeners via Runtime.evaluate
            var injected = await InjectListenersAsync();
            if (!injected)
            {
                DebugLogger.Log("ConnectAsync: FAILED — JS listener injection returned false");
                return false;
            }
            DebugLogger.Log("ConnectAsync: JS listeners injected successfully");

            _isRecording = true;

            // Start listening for events
            _ = Task.Run(ListenForEventsAsync);
            DebugLogger.Log("ConnectAsync: polling loop started — recording is ACTIVE");
            return true;
        }
        catch (Exception ex)
        {
            DebugLogger.Log($"ConnectAsync: EXCEPTION — {ex.GetType().Name}: {ex.Message}");
            return false;
        }
    }


    private bool IsDuplicateAction(string type, string role, string name, string value, string groupName)
    {
        var normalizedRole = _axMapper.NormalizeRole(role);
        var signature = $"{type}|{normalizedRole}|{name}|{value}|{groupName}";

        var isDuplicate = signature == _lastEmittedSignature
            && (DateTime.Now - _lastEmittedAt).TotalMilliseconds <= DuplicateActionWindowMs;

        if (!isDuplicate)
        {
            _lastEmittedSignature = signature;
            _lastEmittedAt = DateTime.Now;
        }

        return isDuplicate;
    }

    

    /// Injects JavaScript event listeners into the browser page via CDP Runtime.evaluate.
    /// These listeners capture user interactions (clicks, typing, selections) and store them
    /// in window.__recorderLog for the C# polling loop to consume.
    private async Task<bool> InjectListenersAsync()
    {
        var script = @"
window.__recorderActive = true;
window.__recorderLog = [];

// Resolves the accessible name of an element following the accessible name spec:
// 1. aria-label  2. aria-labelledby  3. <label for>  4. title  5. placeholder
function __recGetName(el) {
    try {
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
        // Check associated <label for=""id""> element
        if (el.id) {
            var lbl = document.querySelector('label[for=""' + el.id + '""]');
            if (lbl && lbl.innerText) return lbl.innerText.trim();
        }
        // Fall back to the element's own text content — for buttons/links/etc.
        // this is what the ARIA accessible-name algorithm uses when no aria-* is set.
        var tc = (el.innerText || el.textContent || '').trim();
        if (tc) return tc;
        // Check title attribute
        var ti = el.getAttribute('title');
        if (ti) return ti.trim();
        // Check placeholder attribute
        var ph = el.getAttribute('placeholder');
        if (ph) return ph.trim();
        return '';
    } catch(e) {
        return '';
    }
}

// Resolves the accessible name of the radio group containing `el`.
// Walks up to the nearest role='radiogroup' or <fieldset>, then resolves its name
// from aria-label / aria-labelledby / <legend>. Returns '' if no group is found.
// In InjectListenersAsync(), replace the existing __recGetGroupName(el) JS function with this:

// In InjectListenersAsync() script, replace the entire __recGetGroupName(el) function with this:

function __recGetGroupName(el) {
    try {
        // Walk up to nearest radiogroup/fieldset
        var cur = el.parentElement;
        while (cur && cur !== document.body) {
            var role = cur.getAttribute('role');
            var tag = cur.tagName.toLowerCase();

            if (role === 'radiogroup' || tag === 'fieldset') {
                var al = cur.getAttribute('aria-label');
                if (al) return al.trim();

                var lb = cur.getAttribute('aria-labelledby');
                if (lb) {
                    var ids = lb.split(/\s+/);
                    var t = [];
                    for (var i = 0; i < ids.length; i++) {
                        var r = document.getElementById(ids[i]);
                        if (r && r.innerText) t.push(r.innerText.trim());
                    }
                    if (t.length > 0) return t.join(' ');
                }

                if (tag === 'fieldset') {
                    var legend = cur.querySelector('legend');
                    if (legend && legend.innerText) return legend.innerText.trim();
                }

                break;
            }

            cur = cur.parentElement;
        }

        // Fallback: group by radio name attribute
        if (el && (el.type || '').toLowerCase() === 'radio' && el.name) {
            var n = el.name;
            var esc = n.replace(/\\/g, '\\\\').replace(/""/g, '\\""');
            var first = document.querySelector('input[type=""""radio""""][name=""""' + esc + '""""]');

            if (first) {
                var fs = first.closest('fieldset');
                if (fs) {
                    var lg = fs.querySelector('legend');
                    if (lg && lg.innerText) return lg.innerText.trim();
                }

                var rg = first.closest('[role=""""radiogroup""""]');
                if (rg) {
                    var rgLabel = rg.getAttribute('aria-label');
                    if (rgLabel) return rgLabel.trim();

                    var rgLabelledBy = rg.getAttribute('aria-labelledby');
                    if (rgLabelledBy) {
                        var ids2 = rgLabelledBy.split(/\s+/);
                        var t2 = [];
                        for (var j = 0; j < ids2.length; j++) {
                            var r2 = document.getElementById(ids2[j]);
                            if (r2 && r2.innerText) t2.push(r2.innerText.trim());
                        }
                        if (t2.length > 0) return t2.join(' ');
                    }
                }
            }

            return n.trim();
        }
    } catch (e) {}

    return '';
}

// Given a tab element, finds its enclosing role='tablist' and returns that
// tablist's 0-based index among all tablists on the page (document order).
// Returns -1 if no enclosing tablist is found.
function __recGetTablistIndex(el) {
    try {
        var cur = el;
        while (cur && cur !== document.body) {
            if (cur.getAttribute && cur.getAttribute('role') === 'tablist') {
                var all = document.querySelectorAll('[role=""tablist""]');
                for (var i = 0; i < all.length; i++) {
                    if (all[i] === cur) return i;
                }
                return -1;
            }
            cur = cur.parentElement;
        }
    } catch(e) {}
    return -1;
}

// Determines the ARIA role of an element. Uses the explicit role attribute if present,
// otherwise infers from the HTML tag (e.g. input -> el.type, select -> 'select', a -> 'link').
function __recGetRole(el) {
    try {
        var role = el.getAttribute('role');
        if (role) return role;
        var tag = el.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return el.type || 'textbox';
        if (tag === 'select') return 'select';
        if (tag === 'a') return 'link';
        if (tag === 'button') return 'button';
        return tag;
    } catch(e) {
        return 'unknown';
    }
}

// Walks up the DOM from the clicked element to find the nearest interactive ancestor
// (button, a, input, select, textarea, or elements with interactive ARIA roles).
// Ensures we capture the meaningful element, not an inner span or icon.
function __recFindInteractive(el) {
    try {
        var cur = el;
        while (cur && cur !== document.body) {
            var tag = cur.tagName.toLowerCase();
            if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return cur;
            var role = cur.getAttribute('role');
            if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'radio' || role === 'tab') return cur;
            cur = cur.parentElement;
        }
    } catch(e) {}
    return el;
}

// Captures clicks on non-input elements (buttons, links, etc.).
// Input/textarea/select are excluded here — they are handled by the change/input listeners.
document.addEventListener('mousedown', function(e) {
    try {
        if (!window.__recorderActive) return;
        // Skip clicks inside a <label> tied to a radio/checkbox — the change handler captures those.
        // Without this, clicking the label text produces a spurious 'click' on the enclosing span/label.
        var lbl = e.target.closest && e.target.closest('label');
        if (lbl) {
            var inner = lbl.querySelector('input[type=radio], input[type=checkbox]');
            var forId = lbl.getAttribute('for');
            var forEl = forId ? document.getElementById(forId) : null;
            if (inner || (forEl && (forEl.type === 'radio' || forEl.type === 'checkbox'))) return;
        }
       
        var el = __recFindInteractive(e.target);
        var tag = el.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        var role = __recGetRole(el);

        // Radios/checkboxes are captured by change handler; skip click capture here to avoid duplicates.
        if (role === 'radio' || role === 'checkbox') return;

        window.__recorderLog.push({
            type: 'click',
            tag: el.tagName,
            role: role,
            name: __recGetName(el),
            tablistIndex: role === 'tab' ? __recGetTablistIndex(el) : -1,
            value: '',
            timestamp: Date.now()
        });

    } catch(ex) {}
}, true);

// Captures value changes on form elements. Fires on blur for text inputs and
// immediately for radio/checkbox. Radios are logged as 'click', checkboxes as
// 'check' or 'uncheck' based on the new state, others as 'change'.
// In InjectListenersAsync(), inside the 'change' event listener, replace the current block with this:

document.addEventListener('change', function(e) {
    try {
        if (!window.__recorderActive) return;

        var el = e.target;
        var isRadio = el.type === 'radio';
        var isCheck = el.type === 'checkbox';

        var t = 'change';
        if (isRadio) t = 'click';
        else if (isCheck) t = el.checked ? 'check' : 'uncheck';

        var optionName = __recGetName(el);
        if (isRadio) {
            var lbl = el.closest && el.closest('label');
            if ((!optionName || !optionName.trim()) && lbl && lbl.innerText) {
                optionName = lbl.innerText.trim();
            }
            if ((!optionName || !optionName.trim()) && el.value) {
                optionName = el.value;
            }
        }

        var groupName = isRadio ? __recGetGroupName(el) : '';

        window.__recorderLog.push({
            type: t,
            tag: el.tagName,
            role: __recGetRole(el),
            name: isRadio ? optionName : optionName,
            groupName: groupName,
            value: el.value || '',
            timestamp: Date.now()
        });
    } catch(ex) {}
}, true);

// Captures keystroke input on text fields. On each keystroke, replaces the previous
// 'type' entry for the same field in the log so only the latest value is kept per poll cycle.
document.addEventListener('input', function(e) {
    try {
        if (!window.__recorderActive) return;
        var el = e.target;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // The 'input' event fires on radios/checkboxes/buttons/file/etc. too, but those
            // aren't 'typing' — they're captured by the change/mousedown handlers instead.
            var t = (el.type || '').toLowerCase();
            if (t === 'radio' || t === 'checkbox' || t === 'button' || t === 'submit' ||
                t === 'reset' || t === 'file' || t === 'range' || t === 'color') return;
            var name = __recGetName(el);
            for (var i = window.__recorderLog.length - 1; i >= 0; i--) {
                if (window.__recorderLog[i].type === 'type' && window.__recorderLog[i].name === name) {
                    window.__recorderLog.splice(i, 1);
                    break;
                }
            }
            window.__recorderLog.push({
                type: 'type',
                tag: el.tagName,
                role: __recGetRole(el),
                name: name,
                value: el.value || '',
                timestamp: Date.now()
            });
        }
    } catch(ex) {}
}, true);
        ";

        var result = await SendCommandWithResultAsync("Runtime.evaluate", new JObject
        {
            ["expression"] = script,
            ["returnByValue"] = true
        });
        return result != null;
    }

    /// Polling loop that runs every 500ms while recording is active.
    /// Drains the JS action log and processes each captured user interaction.
    private async Task PollForActionsAsync()
    {
        while (_isRecording)
        {
            await Task.Delay(500);
            await ProcessLoggedActionsAsync();
        }
    }

    /// Drains the JS action log via Runtime.evaluate. Debounces type events by holding them
    /// in _pendingTypes until the next poll confirms no further typing on the same field.
    /// Skips duplicate change events for fields that already have a pending/flushed type.
    private async Task ProcessLoggedActionsAsync()
    {
        // Expression guards against navigation — if the page has been replaced since
        // injection, window.__recorderLog is gone; we return a sentinel so C# can re-inject.
        const string pollExpr = @"(function(){try{if(typeof window.__recorderLog==='undefined')return '__REINJECT__';return JSON.stringify(window.__recorderLog.splice(0,window.__recorderLog.length));}catch(e){return '__REINJECT__';}})()";

        var result = await SendCommandWithResultAsync("Runtime.evaluate", new JObject
        {
            ["expression"] = pollExpr,
            ["returnByValue"] = true
        });

        if (result == null)
        {
            DebugLogger.Log("Poll: CDP Runtime.evaluate returned NULL (WebSocket issue or timeout)");
            return;
        }

        var value = result?["result"]?["result"]?["value"]?.ToString();

        if (value == "__REINJECT__")
        {
            DebugLogger.Log("Poll: __recorderLog missing — page likely navigated. Re-injecting listeners...");
            _pendingTypes.Clear();
            var ok = await InjectListenersAsync();
            DebugLogger.Log($"Poll: re-inject {(ok ? "succeeded" : "FAILED")}");
            return;
        }

        if (string.IsNullOrEmpty(value))
            DebugLogger.Log($"Poll: empty response — full CDP result: {result}");
        else if (value == "[]")
            DebugLogger.Log("Poll: no actions this cycle (empty array)");
        else
            DebugLogger.Log($"Poll: raw JS log = {value}");

        // Flush pending types that had no new input this poll cycle (user stopped typing)
        var flushedFields = new HashSet<string>();
        if (_pendingTypes.Count > 0)
        {
            // Collect field names that have new type events this cycle
            var activeFields = new HashSet<string>();
            if (!string.IsNullOrEmpty(value) && value != "[]")
            {
                foreach (var a in JArray.Parse(value))
                {
                    if (a["type"]?.ToString() == "type")
                        activeFields.Add(a["name"]?.ToString() ?? "");
                }
            }

            // Emit pending types for fields with no new input
            foreach (var kvp in _pendingTypes)
            {
                if (!activeFields.Contains(kvp.Key))
                {
                    flushedFields.Add(kvp.Key);
                    EmitAction(kvp.Value);
                }
            }
            foreach (var key in flushedFields)
                _pendingTypes.Remove(key);
        }

        if (string.IsNullOrEmpty(value) || value == "[]") return;

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

            EmitAction(action);
        }
    }


    private void EmitAction(JToken action)
    {
        var type = action["type"]?.ToString() ?? "";
        var role = action["role"]?.ToString() ?? "";
        var rawName = action["name"]?.ToString() ?? "";
        var rawVal = action["value"]?.ToString() ?? "";
        var rawGroup = action["groupName"]?.ToString() ?? "";
        var tablistIndex = action["tablistIndex"]?.Value<int?>() ?? -1;

        if (rawName.Any(c => c == '\n' || c == '\r' || c == '\u2028' || c == '\u2029'))
            DebugLogger.Log($"  *** HIDDEN LINE BREAK in name: [{string.Join(",", rawName.Select(c => $"U+{(int)c:X4}"))}]");

        static string Clean(string s) =>
            s.Replace("\r", "").Replace("\n", " ").Replace("\u2028", " ").Replace("\u2029", " ").Trim();

        var name = Clean(rawName);
        var val = Clean(rawVal);
        var groupName = Clean(rawGroup);

        

        if (type == "click" && _axMapper.NormalizeRole(role) == "radio")
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                name = val;
            }
        }

        var friendly = DescribeAction(type, role, name, val);
        DebugLogger.Log($"ACTION DETECTED: {friendly}");

        if (string.IsNullOrWhiteSpace(name))
        {
            DebugLogger.Log($"  -> DROPPED: element has no accessible name (aria-label / aria-labelledby missing)");
            DebugLogger.Log($"     Tag was '{action["tag"]}', role was '{role}' — add an aria-label to this element to record it");
            return;
        }

        if (type == "change" && _axMapper.NormalizeRole(role) == "textbox")
        {
            DebugLogger.Log($"  -> DROPPED: duplicate change event on textbox (already captured via type event)");
            return;
        }

        if (IsDuplicateAction(type, role, name, val, groupName))
        {
            DebugLogger.Log($"  -> DROPPED: duplicate action within {DuplicateActionWindowMs}ms");
            return;
        }

        if (_axMapper.RequiresSmartWait(_lastActionTime) && _lineCount > 0)
        {
            var waitLine = _axMapper.GenerateSmartWait(_lastActionTime);
            DebugLogger.Log($"  -> Added wait: {waitLine}");
            LineRecorded?.Invoke(waitLine);
        }

        RecordToCsv(type, role, name, val, groupName);

        var line = _axMapper.MapToComponentLine(role, name, type, val, groupName, tablistIndex);
        if (!string.IsNullOrEmpty(line))
        {
            _lastActionTime = DateTime.Now;
            _lineCount++;
            DebugLogger.Log($"  -> RECORDED line #{_lineCount}: {line}");
            LineRecorded?.Invoke(line);
            LineCountUpdated?.Invoke(_lineCount);
        }
        else
        {
            DebugLogger.Log($"  -> DROPPED: no mapping found for role='{role}' (normalized='{_axMapper.NormalizeRole(role)}') with action='{type}'");
        }
    }


    /// <summary>
    /// Records action to CSV export
    /// </summary>
    private void RecordToCsv(string actionType, string role, string fieldName, string fieldValue, string groupName)
    {
        var normalizedRole = _axMapper.NormalizeRole(role);

        // Determine the actual field name and value for CSV
        string csvFieldName;
        string csvFieldValue;

        switch (actionType)
        {
            case "type":
                // Textbox: Use accessible name as field, value as entered text
                csvFieldName = fieldName;
                csvFieldValue = fieldValue;
                break;

            case "click" when normalizedRole == "radio":
                // Radio: Use group name as field, selected option as value
                csvFieldName = !string.IsNullOrWhiteSpace(groupName) ? groupName : fieldName;
                csvFieldValue = fieldName; // The selected radio option
                break;

            case "check":
            case "uncheck":
                // Checkbox: Use field name, value is checked/unchecked
                csvFieldName = fieldName;
                csvFieldValue = actionType == "check" ? "Yes" : "No";
                break;

            case "change":
                // Dropdown/Combobox: Use field name, value is selected option
                csvFieldName = fieldName;
                csvFieldValue = fieldValue;
                break;

            case "click":
                // Buttons/Links: Don't record to CSV (they're actions, not data)
                return;

            default:
                csvFieldName = fieldName;
                csvFieldValue = fieldValue;
                break;
        }

        _csvExporter.RecordAction(csvFieldName, csvFieldValue, actionType);
        DebugLogger.Log($"  -> CSV: '{csvFieldName}' = '{csvFieldValue}'");
    }

    private static string DescribeAction(string type, string role, string name, string value)
    {
        var displayName = string.IsNullOrWhiteSpace(name) ? "(no name)" : name;
        return type switch
        {
            "click" => $"Clicked on the {role} '{displayName}'",
            "type" => $"Entered '{value}' in the {role} '{displayName}'",
            "check" => $"Checked the checkbox '{displayName}'",
            "uncheck" => $"Unchecked the checkbox '{displayName}'",
            "change" when role.Contains("select") || role.Contains("combo") || role.Contains("listbox")
                      => $"Selected '{value}' from the dropdown '{displayName}'",
            "change" when role.Contains("radio")
                      => $"Selected radio option '{displayName}'",
            "change" => $"Changed '{displayName}' to '{value}'",
            _ => $"{type} on {role} '{displayName}' with value '{value}'"
        };
    }

    private async Task ListenForEventsAsync()
    {
        // Start polling for logged actions
        await PollForActionsAsync();
    }

    /// Sends a CDP command over the WebSocket without waiting for a response.
    private async Task SendCommandAsync(string method, JObject? parameters = null)
    {
        if (_webSocket == null) return;
        var message = new JObject
        {
            ["id"] = _messageId++,
            ["method"] = method
        };
        if (parameters != null) message["params"] = parameters;

        var bytes = Encoding.UTF8.GetBytes(message.ToString());
        await _webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
    }

    /// Sends a CDP command and waits for the matching response by request ID.
    /// Skips over async CDP event notifications. Times out after 5 seconds.
    private async Task<JObject?> SendCommandWithResultAsync(string method, JObject? parameters = null)
    {
        if (_webSocket == null)
        {
            DebugLogger.Log($"CDP: {method} — FAILED, WebSocket is null");
            return null;
        }
        var id = _messageId++;
        var message = new JObject
        {
            ["id"] = id,
            ["method"] = method
        };
        if (parameters != null) message["params"] = parameters;

        var bytes = Encoding.UTF8.GetBytes(message.ToString());
        await _webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);

        // Read responses until we find the one matching our request ID.
        // CDP sends async event notifications that we need to skip over.
        var buffer = new byte[65536];
        var timeout = TimeSpan.FromSeconds(5);
        var start = DateTime.UtcNow;
        while (DateTime.UtcNow - start < timeout)
        {
            var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), _cts?.Token ?? CancellationToken.None);
            var response = Encoding.UTF8.GetString(buffer, 0, result.Count);

            try
            {
                var json = JObject.Parse(response);

                // Match by request ID — skip CDP event notifications (which have no "id")
                if (json["id"]?.Value<int>() == id)
                    return json;
            }
            catch (Exception ex)
            {
                DebugLogger.Log($"CDP: {method} — failed to parse response: {ex.Message}, raw={response.Substring(0, Math.Min(200, response.Length))}");
            }
        }
        DebugLogger.Log($"CDP: {method} — TIMED OUT after 5s (id={id})");
        return null;
    }

    /// <summary>
    /// Enables highlight mode - injects a visual rectangle drawer in the browser
    /// </summary>
    public async Task EnableHighlightModeAsync()
    {
        _highlightMode = true;

        var highlightScript = @"
(function() {
    if (window.__highlightOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = '__highlightOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;cursor:crosshair;background:rgba(0,0,0,0.02);';
    document.body.appendChild(overlay);

    let startX, startY, rect;

    function getAccessibleName(el) {
        try {
            if (!el) return '';

            var a = el.getAttribute && el.getAttribute('aria-label');
            if (a) return a.trim();

            var lb = el.getAttribute && el.getAttribute('aria-labelledby');
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
                var lbl = document.querySelector('label[for=""' + el.id + '""]');
                if (lbl && lbl.innerText) return lbl.innerText.trim();
            }

            // radio/checkbox inside <label> ... </label>
            var parentLabel = el.closest && el.closest('label');
            if (parentLabel && parentLabel.innerText) return parentLabel.innerText.trim();

            var tc = (el.innerText || el.textContent || '').trim();
            if (tc) return tc;

            var ti = el.getAttribute && el.getAttribute('title');
            if (ti) return ti.trim();

            var ph = el.getAttribute && el.getAttribute('placeholder');
            if (ph) return ph.trim();

            return '';
        } catch (e) {
            return '';
        }
    }

    function getGroupNameForRadio(el) {
        try {
            var byName = el.name;
            if (byName) {
                var same = document.querySelectorAll('input[type=""radio""][name=""' + CSS.escape(byName) + '""]');
                if (same.length > 0) {
                    var first = same[0];
                    var fs = first.closest('fieldset');
                    if (fs) {
                        var lg = fs.querySelector('legend');
                        if (lg && lg.innerText) return lg.innerText.trim();
                    }
                    var rg = first.closest('[role=""radiogroup""]');
                    if (rg) {
                        var al = rg.getAttribute('aria-label');
                        if (al) return al.trim();
                    }
                }
            }
        } catch (e) { }
        return '';
    }

    function resolveTargetElement(el) {
        if (!el) return null;

        // direct radio input
        if (el.tagName && el.tagName.toLowerCase() === 'input' && (el.type || '').toLowerCase() === 'radio') {
            return el;
        }

        // clicked on label text / span inside label
        var label = el.closest && el.closest('label');
        if (label) {
            var innerRadio = label.querySelector('input[type=radio]');
            if (innerRadio) return innerRadio;

            var forId = label.getAttribute('for');
            if (forId) {
                var forEl = document.getElementById(forId);
                if (forEl && forEl.tagName.toLowerCase() === 'input' && (forEl.type || '').toLowerCase() === 'radio') {
                    return forEl;
                }
            }
        }

        // nearest interactive ancestor
        var cur = el;
        while (cur && cur !== document.body) {
            var tag = (cur.tagName || '').toLowerCase();
            if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return cur;

            var role = cur.getAttribute && cur.getAttribute('role');
            if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'radio' || role === 'tab') return cur;

            cur = cur.parentElement;
        }

        return el;
    }

    function getRole(el) {
        var role = el.getAttribute && el.getAttribute('role');
        if (role) return role;

        var tag = (el.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return (el.type || 'textbox').toLowerCase();
        if (tag === 'select') return 'select';
        if (tag === 'a') return 'link';
        if (tag === 'button') return 'button';
        return tag;
    }

    overlay.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;

        rect = document.createElement('div');
        rect.style.cssText = `
            position:fixed;
            border:3px dashed #FF6B6B;
            background:rgba(255,107,107,0.1);
            pointer-events:none;
            z-index:1000000;
        `;
        document.body.appendChild(rect);
    });

    overlay.addEventListener('mousemove', (e) => {
        if (!rect) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        rect.style.left = left + 'px';
        rect.style.top = top + 'px';
        rect.style.width = width + 'px';
        rect.style.height = height + 'px';
    });

    overlay.addEventListener('mouseup', (e) => {
        if (!rect) return;

        const bounds = rect.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        overlay.style.display = 'none';
        rect.style.display = 'none';

        const rawElement = document.elementFromPoint(centerX, centerY);
        const targetElement = resolveTargetElement(rawElement);

        overlay.style.display = 'block';
        rect.style.display = 'block';

        if (targetElement && targetElement !== document.body) {
            var role = getRole(targetElement);
            var name = getAccessibleName(targetElement);

            // Radio fallback name if label/name not resolved
            if ((role === 'radio' || ((targetElement.type || '').toLowerCase() === 'radio')) && !name) {
                name = (targetElement.value || '').trim();
            }

            window.__validationData = {
                role: role,
                name: name,
                groupName: ((targetElement.type || '').toLowerCase() === 'radio') ? getGroupNameForRadio(targetElement) : '',
                tag: targetElement.tagName,
                type: 'visible'
            };

            const originalOutline = targetElement.style.outline;
            const originalBg = targetElement.style.backgroundColor;
            targetElement.style.outline = '3px solid #4CAF50';
            targetElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
            setTimeout(() => {
                targetElement.style.outline = originalOutline;
                targetElement.style.backgroundColor = originalBg;
            }, 800);
        }

        document.body.removeChild(rect);
        document.body.removeChild(overlay);
        window.__highlightOverlay = null;
        rect = null;
    });

    window.__highlightOverlay = overlay;
})();
";

        await SendCommandAsync("Runtime.evaluate", new JObject
        {
            ["expression"] = highlightScript,
            ["returnByValue"] = false
        });

        DebugLogger.Log("Highlight mode ENABLED - user can now draw rectangles in browser");

        // Start polling for validation data
        _ = Task.Run(PollForValidationAsync);
    }

    /// <summary>
    /// Disables highlight mode
    /// </summary>
    public async Task DisableHighlightModeAsync()
    {
        _highlightMode = false;

        await SendCommandAsync("Runtime.evaluate", new JObject
        {
            ["expression"] = @"
                if (window.__highlightOverlay) {
                    document.body.removeChild(window.__highlightOverlay);
                    window.__highlightOverlay = null;
                }
                window.__validationData = null;
            ",
            ["returnByValue"] = false
        });

        DebugLogger.Log("Highlight mode DISABLED");
    }

    private async Task PollForValidationAsync()
    {
        while (_highlightMode)
        {
            await Task.Delay(300);

            var result = await SendCommandWithResultAsync("Runtime.evaluate", new JObject
            {
                ["expression"] = @"
                (function() {
                    if (!window.__validationData) return null;
                    const data = JSON.stringify(window.__validationData);
                    window.__validationData = null;
                    return data;
                })();
            ",
                ["returnByValue"] = true
            });

            var value = result?["result"]?["result"]?["value"]?.ToString();

            if (!string.IsNullOrEmpty(value) && value != "null")
            {
                DebugLogger.Log($"Validation data captured: {value}");

                var data = JObject.Parse(value);
                var role = data["role"]?.ToString() ?? "";
                var name = data["name"]?.ToString() ?? "";

                var normalizedRole = _axMapper.NormalizeRole(role);
                if (!string.IsNullOrWhiteSpace(name))
                {
                    ValidationTargetCaptured?.Invoke(normalizedRole, name);
                }

                _highlightMode = false;
                await DisableHighlightModeAsync();
            }
        }
    }

    /// <summary>
    /// Generates a validation/assertion line for the captured element
    /// </summary>
    private string GenerateValidationLine(string role, string name, string validationType)
    {
        var normalizedRole = _axMapper.NormalizeRole(role);

        if (string.IsNullOrWhiteSpace(name))
        {
            DebugLogger.Log("Validation DROPPED - no accessible name");
            return string.Empty;
        }

        // Map to component validation methods - using Playwright-style assertions
        return validationType switch
        {
            "visible" => normalizedRole switch
            {
                "button" => $"// Validate: Button '{name}' is visible\nawait expect(page.getByRole('button', {{ name: '{name}' }})).toBeVisible();",
                "textbox" => $"// Validate: Textbox '{name}' is visible\nawait expect(page.getByRole('textbox', {{ name: '{name}' }})).toBeVisible();",
                "checkbox" => $"// Validate: Checkbox '{name}' is visible\nawait expect(page.getByRole('checkbox', {{ name: '{name}' }})).toBeVisible();",
                "link" => $"// Validate: Link '{name}' is visible\nawait expect(page.getByRole('link', {{ name: '{name}' }})).toBeVisible();",
                "combobox" => $"// Validate: Combobox '{name}' is visible\nawait expect(page.getByRole('combobox', {{ name: '{name}' }})).toBeVisible();",
                _ => $"// Validate: {normalizedRole} '{name}' is visible\nawait expect(page.getByRole('{normalizedRole}', {{ name: '{name}' }})).toBeVisible();"
            },
            _ => string.Empty
        };
    }

    /// <summary>
    /// Exports CSV file with full details
    /// </summary>
    public void ExportCsv(string outputFolder, string fileName = "test-data.csv")
    {
        var csvPath = Path.Combine(outputFolder, fileName);
        _csvExporter.ExportToCsv(csvPath);
    }

    /// <summary>
    /// Exports simplified CSV (FieldName, FieldValue only)
    /// </summary>
    public void ExportSimplifiedCsv(string outputFolder, string fileName = "test-data-simple.csv")
    {
        var csvPath = Path.Combine(outputFolder, fileName);
        _csvExporter.ExportSimplifiedCsv(csvPath);
    }    

    /// Stops recording. Flushes any pending type events, disables the JS listeners,
    /// and closes the WebSocket connection.
    public async Task StopAsync()
    {
        // Flush any pending type events before stopping
        foreach (var kvp in _pendingTypes)
            EmitAction(kvp.Value);
        _pendingTypes.Clear();

        _isRecording = false;
        _cts?.Cancel();
        if (_webSocket?.State == WebSocketState.Open)
        {
            await SendCommandAsync("Runtime.evaluate", new JObject
            {
                ["expression"] = "window.__recorderActive = false;"
            });
            await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Recording stopped", CancellationToken.None);
        }
    }
}
