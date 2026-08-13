using System.IO;
using Newtonsoft.Json.Linq;

namespace TestRecorder.Services;

// =============================================================================
// AxMapperService
// =============================================================================
//
// PURPOSE
// -------
// Converts a single captured user action (from CdpRecorderService) into one line of TypeScript test code that will be written into the generated
// page.ts file. This service is the bridge between "what the user did in the browser" and "what the generated Puppeteer code looks like in accordance with ATO's
// Automation components".
//
// INPUT  : 1. Role (e.g. "button", "text", "email" - Basically the type of web element/component)
//          2. Accessible name  (e.g. "First name *"), action type ("click" / "type" / "change" /
//          3. An optional value (e.g. ABN Number typed in ABN Text Field).
// OUTPUT : A single line of Typescript code for every user action in the web page , e.g.
//            await TextboxComponent(this.#page, "Amount").type("100");

public class AxMapperService
{
    private readonly Dictionary<string, JObject> _componentMap;
    private const int SmartWaitThresholdMs = 1000;
    private const int SmartWaitRoundMs = 100;

    public AxMapperService()
    {
        var mapPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Config", "ComponentMap.json");
        DebugLogger.Log($"AxMapper: loading ComponentMap from {mapPath}");
        var json = File.ReadAllText(mapPath);
        _componentMap = JObject.Parse(json).ToObject<Dictionary<string, JObject>>() ?? new();
        DebugLogger.Log($"AxMapper: loaded {_componentMap.Count} role mappings: [{string.Join(", ", _componentMap.Keys)}]");
    }

    public string? MapToComponentLine(string role, string accessibleName, string actionType, string value = "", string groupName = "", int tablistIndex = -1)
    {
        var normalizedRole = NormalizeRole(role);
        DebugLogger.Log($"AxMapper: role='{role}' -> normalized='{normalizedRole}', action={actionType}, name='{accessibleName}', group='{groupName}', tablistIndex={tablistIndex}");

        if (_componentMap.TryGetValue(normalizedRole, out var config))
        {
            var componentName = config["component"]?.ToString() ?? "";

            // Radio: component arg is the group name, selected option name goes to .select(...)
            if (normalizedRole == "radio" && actionType == "click")
            {
                var group = !string.IsNullOrWhiteSpace(groupName) ? groupName : accessibleName;
                return $"await {componentName}(this.#page, \"{group}\").select(\"{accessibleName}\");";
            }

            // Checkbox: emit .check() or .uncheck() based on the new state
            if (normalizedRole == "checkbox" && (actionType == "check" || actionType == "uncheck"))
                return $"await {componentName}(this.#page, \"{accessibleName}\").{actionType}();"; // ✅ Fixed

            // Tab: component args are (page, tablist index); tab label goes to .click(...)
            if (normalizedRole == "tab" && actionType == "click" && tablistIndex >= 0)
                return $"await {componentName}(this.#page, {tablistIndex}).click(\"{accessibleName}\");";

            // General click actions (non-radio)
            if (actionType == "click")
                return $"await {componentName}(this.#page, \"{accessibleName}\").click();";

            // Textbox typing
            if (normalizedRole == "textbox" && actionType == "type")
                return $"await {componentName}(this.#page, \"{accessibleName}\").type(\"{value}\");"; // ✅ Fixed

            // Combobox selection
            if (normalizedRole == "combobox" && (actionType == "change" || actionType == "select"))
                return $"await {componentName}(this.#page, \"{accessibleName}\").select(\"{value}\");"; // ✅ Fixed

            // Fallback for other mapped components
            return actionType switch
            {
                "type" => $"await {componentName}(this.#page, \"{accessibleName}\").type(\"{value}\");",
                "select" or "change" => $"await {componentName}(this.#page, \"{accessibleName}\").select(\"{value}\");",
                _ => null
            };
        }

        // Fallback for unmapped roles — still generate a line so clicks aren't silently lost
        DebugLogger.Log($"AxMapper: no ComponentMap entry for '{normalizedRole}' — using fallback");
        return actionType switch
        {
            "click" => $"await page.getByRole('{normalizedRole}', {{ name: '{accessibleName}' }}).click();",
            "type" => $"await page.getByRole('{normalizedRole}', {{ name: '{accessibleName}' }}).fill('{value}');",
            "check" or "uncheck" => $"await page.getByRole('{normalizedRole}', {{ name: '{accessibleName}' }}).{actionType}();",
            _ => null
        };
    }

    public string GenerateSmartWait(DateTime lastActionTime)
    {
        var elapsedMs = (DateTime.Now - lastActionTime).TotalMilliseconds;
        var rounded = (int)(Math.Round(elapsedMs / SmartWaitRoundMs) * SmartWaitRoundMs);
        return $"await waitForTimeout({rounded});";
    }

    public bool RequiresSmartWait(DateTime lastActionTime)
    {
        return (DateTime.Now - lastActionTime).TotalMilliseconds > SmartWaitThresholdMs;
    }

    public string NormalizeRole(string role)
    {
        return role.ToLower() switch
        {
            "button" or "submit" or "reset" => "button",
            "textbox" or "text" or "input" or "searchbox" or "textarea" or "email" or "password" or "number" or "tel" or "url" or "search" => "textbox",
            "radio" or "radiobutton" => "radio",
            "link" or "hyperlink" or "a" => "link",
            "combobox" or "listbox" or "select" or "select-one" or "select-multiple" => "combobox",
            "table" or "grid" => "table",
            "checkbox" => "checkbox",
            _ => role.ToLower()
        };
    }
}
