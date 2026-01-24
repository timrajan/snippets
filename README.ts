# Settings API V2 - UI Integration Guide

## Overview

The Settings API provides endpoints for synchronizing user preferences between the Testr desktop application and the server. This document details all endpoints, request/response formats, and integration guidelines for the UI team.

**Base URL:** `/api/v1/settings`

**Authentication:** All endpoints require Bearer token authentication.

```
Authorization: Bearer <access_token>
```

---

## Workflow

### 1. User Login Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Logs In  │────▶│  GET /settings  │────▶│  Apply Settings │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  data == null?  │
                        └─────────────────┘
                          │           │
                         Yes          No
                          │           │
                          ▼           ▼
                   ┌────────────┐  ┌────────────┐
                   │ Use local  │  │ Apply from │
                   │ defaults & │  │  server    │
                   │ PUT to     │  └────────────┘
                   │ server     │
                   └────────────┘
```

### 2. Settings Change Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Changes   │────▶│  Save Locally   │────▶│  PUT /settings  │
│    Setting      │     │  (backup)       │     │  (if logged in) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3. User Logout Flow

- Stop syncing with server
- Retain local settings.json
- Option to "Reset to Defaults" available

---

## API Endpoints

### 1. GET /api/v1/settings

Retrieves all settings for the authenticated user.

#### Request

```http
GET /api/v1/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Response - Settings Exist (200 OK)

```json
{
    "success": true,
    "data": {
        "captures_per_minute": 60,
        "replay_speed_fps": 1,
        "autoplay": false,
        "loop": true,
        "show_actions_panel": false,
        "run_mode": "visible",
        "browser_window_mode": "maximised",
        "default_url": "https://www.google.com",
        "record_browser": "qtwebengine",
        "checkpoint_line_thickness": "1",
        "checkpoint_line_color": "#ff0000",
        "use_ai": false,
        "ai_api_endpoint": "",
        "ai_model": "llama-3.1-8b-instant",
        "has_ai_api_key": false,
        "console_capture_enabled": true,
        "network_capture_enabled": true,
        "environment_capture_enabled": true,
        "timing_capture_enabled": true,
        "auto_generate_defect": true,
        "auto_generate_detailed_defects": true,
        "parallel_enabled": true,
        "parallel_count": 2,
        "wcag_level": "A",
        "accessibility_enabled": true,
        "responsive_panel_devices": [
            "iPad Pro 12.9\"",
            "iPad Air",
            "Samsung S23 Ultra",
            "iPad Mini",
            "Galaxy Tab S9"
        ],
        "responsive_panel_resolutions": [
            "1920×1080 (FHD)",
            "1366×768 (HD)",
            "1536×864",
            "1440×900",
            "2560×1440 (QHD)"
        ],
        "integration_type": "none",
        "integration_auto_create_on_failure": true,
        "integration_attach_screenshots": true,
        "integration_max_screenshots": 5,
        "jira_url": "",
        "jira_username": "",
        "jira_project_key": "",
        "jira_issue_type": "Bug",
        "jira_severity_field": "",
        "has_jira_api_token": false,
        "azure_organization": "",
        "azure_project": "",
        "azure_work_item_type": "Bug",
        "has_azure_pat": false
    },
    "metadata": {
        "last_updated": "2026-01-24T10:30:00Z",
        "version": 1
    }
}
```

#### Response - First-Time User (200 OK)

When a user has never saved settings before:

```json
{
    "success": true,
    "data": null,
    "message": "No settings found for user",
    "metadata": null
}
```

**UI Action:** When `data` is `null`, use local default settings and call `PUT /settings` to sync them to the server.

#### Response - Unauthorized (401)

```json
{
    "detail": "Not authenticated"
}
```

---

### 2. PUT /api/v1/settings

Creates or updates all settings for the authenticated user. This is a **full replacement** - the entire settings object is stored.

#### Request

```http
PUT /api/v1/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
    "captures_per_minute": 60,
    "replay_speed_fps": 1,
    "autoplay": false,
    "loop": true,
    "show_actions_panel": false,
    "run_mode": "visible",
    "browser_window_mode": "maximised",
    "default_url": "https://www.google.com",
    "record_browser": "qtwebengine",
    "checkpoint_line_thickness": "1",
    "checkpoint_line_color": "#ff0000",
    "use_ai": false,
    "ai_api_endpoint": "",
    "ai_api_key": "sk-xxxxx",
    "ai_model": "llama-3.1-8b-instant",
    "console_capture_enabled": true,
    "network_capture_enabled": true,
    "environment_capture_enabled": true,
    "timing_capture_enabled": true,
    "auto_generate_defect": true,
    "auto_generate_detailed_defects": true,
    "parallel_enabled": true,
    "parallel_count": 2,
    "wcag_level": "A",
    "accessibility_enabled": true,
    "responsive_panel_devices": [
        "iPad Pro 12.9\"",
        "iPad Air",
        "Samsung S23 Ultra",
        "iPad Mini",
        "Galaxy Tab S9"
    ],
    "responsive_panel_resolutions": [
        "1920×1080 (FHD)",
        "1366×768 (HD)",
        "1536×864",
        "1440×900",
        "2560×1440 (QHD)"
    ],
    "integration_type": "jira",
    "integration_auto_create_on_failure": true,
    "integration_attach_screenshots": true,
    "integration_max_screenshots": 5,
    "jira_url": "https://company.atlassian.net",
    "jira_username": "user@company.com",
    "jira_api_token": "ATATT3xFfGF0xxxxx",
    "jira_project_key": "PROJ",
    "jira_issue_type": "Bug",
    "jira_severity_field": "customfield_10001",
    "azure_organization": "",
    "azure_project": "",
    "azure_pat": "",
    "azure_work_item_type": "Bug"
}
```

#### Response - Success (200 OK)

```json
{
    "success": true,
    "message": "Settings saved successfully",
    "data": {
        "updated_at": "2026-01-24T10:35:00Z",
        "version": 2
    }
}
```

#### Response - Validation Error (422)

```json
{
    "detail": "Invalid request format. Please check your input fields.",
    "errors": [
        {
            "field": "body.parallel_count",
            "message": "Input should be less than or equal to 10",
            "type": "less_than_equal"
        },
        {
            "field": "body.checkpoint_line_color",
            "message": "String should match pattern '^#[0-9a-fA-F]{6}$'",
            "type": "string_pattern_mismatch"
        }
    ]
}
```

---

### 3. POST /api/v1/settings/reset

Resets all settings to default values. **This also clears all stored credentials.**

#### Request

```http
POST /api/v1/settings/reset
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
    "confirm": true
}
```

**Note:** The `confirm` field must be `true` for the reset to proceed.

#### Response - Success (200 OK)

```json
{
    "success": true,
    "message": "Settings reset to defaults",
    "data": {
        "captures_per_minute": 60,
        "replay_speed_fps": 1,
        "autoplay": false,
        "loop": true,
        "show_actions_panel": false,
        "run_mode": "visible",
        "browser_window_mode": "maximised",
        "default_url": "https://www.google.com",
        "record_browser": "qtwebengine",
        "checkpoint_line_thickness": "1",
        "checkpoint_line_color": "#ff0000",
        "use_ai": false,
        "ai_api_endpoint": "",
        "ai_model": "llama-3.1-8b-instant",
        "console_capture_enabled": true,
        "network_capture_enabled": true,
        "environment_capture_enabled": true,
        "timing_capture_enabled": true,
        "auto_generate_defect": true,
        "auto_generate_detailed_defects": true,
        "parallel_enabled": true,
        "parallel_count": 2,
        "wcag_level": "A",
        "accessibility_enabled": true,
        "responsive_panel_devices": [
            "iPad Pro 12.9\"",
            "iPad Air",
            "Samsung S23 Ultra",
            "iPad Mini",
            "Galaxy Tab S9"
        ],
        "responsive_panel_resolutions": [
            "1920×1080 (FHD)",
            "1366×768 (HD)",
            "1536×864",
            "1440×900",
            "2560×1440 (QHD)"
        ],
        "integration_type": "none",
        "integration_auto_create_on_failure": true,
        "integration_attach_screenshots": true,
        "integration_max_screenshots": 5,
        "jira_url": "",
        "jira_username": "",
        "jira_project_key": "",
        "jira_issue_type": "Bug",
        "jira_severity_field": "",
        "azure_organization": "",
        "azure_project": "",
        "azure_work_item_type": "Bug"
    }
}
```

#### Response - Bad Request (400)

```json
{
    "detail": "Reset requires confirm=true"
}
```

---

### 4. POST /api/v1/settings/integrations/test

Tests the connection to an external integration (Jira or Azure DevOps) using provided credentials.

#### Request - Jira

```http
POST /api/v1/settings/integrations/test
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
    "integration_type": "jira",
    "jira_url": "https://company.atlassian.net",
    "jira_username": "user@company.com",
    "jira_api_token": "ATATT3xFfGF0xxxxx"
}
```

#### Request - Azure DevOps

```json
{
    "integration_type": "azure_devops",
    "azure_organization": "myorg",
    "azure_project": "MyProject",
    "azure_pat": "ghp_xxxx..."
}
```

#### Response - Connection Successful (200 OK)

```json
{
    "success": true,
    "data": {
        "connected": true,
        "message": "Connected as: John Doe",
        "error_code": null,
        "details": {
            "server_info": "Jira Cloud",
            "user_display_name": "John Doe",
            "permissions": ["CREATE_ISSUES", "ATTACH_FILES"]
        }
    }
}
```

#### Response - Connection Failed (200 OK)

```json
{
    "success": true,
    "data": {
        "connected": false,
        "message": "Missing required fields: jira_url, jira_username, jira_api_token",
        "error_code": "MISSING_CONFIG",
        "details": null
    }
}
```

**Note:** Connection test always returns 200 OK. Check `data.connected` to determine success.

---

## Settings Field Reference

### Recording Settings

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `captures_per_minute` | integer | 60 | 1-120 | Screenshot capture frequency |
| `replay_speed_fps` | integer | 1 | 1-60 | Playback frames per second |
| `autoplay` | boolean | false | - | Auto-play recordings |
| `loop` | boolean | true | - | Loop playback |
| `show_actions_panel` | boolean | false | - | Show actions panel during recording |
| `run_mode` | string | "visible" | "visible", "headless" | Test run mode |
| `browser_window_mode` | string | "maximised" | "maximised", "windowed", "fullscreen" | Browser window state |
| `default_url` | string | "https://www.google.com" | Valid URL | Default start URL |
| `record_browser` | string | "qtwebengine" | "qtwebengine", "playwright_chromium", "playwright_firefox", "playwright_webkit" | Recording browser engine |

### Checkpoint Settings

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `checkpoint_line_thickness` | string | "1" | "1"-"5" | Visual checkpoint line thickness |
| `checkpoint_line_color` | string | "#ff0000" | Valid hex color (e.g., #ff0000) | Checkpoint highlight color |

### AI/LLM Settings

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `use_ai` | boolean | false | - | Enable AI features |
| `ai_api_endpoint` | string | "" | Valid URL or empty | AI API endpoint URL |
| `ai_api_key` | string | null | **INPUT ONLY** | AI API key (never returned in GET) |
| `ai_model` | string | "llama-3.1-8b-instant" | - | AI model identifier |

**Response-only field:**
| `has_ai_api_key` | boolean | false | **OUTPUT ONLY** | Indicates if API key is stored |

### Capture Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `console_capture_enabled` | boolean | true | Capture browser console logs |
| `network_capture_enabled` | boolean | true | Capture network requests |
| `environment_capture_enabled` | boolean | true | Capture environment info |
| `timing_capture_enabled` | boolean | true | Capture timing metrics |

### Test Execution Settings

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `auto_generate_defect` | boolean | true | - | Auto-generate defects on failure |
| `auto_generate_detailed_defects` | boolean | true | - | Include detailed info in defects |
| `parallel_enabled` | boolean | true | - | Enable parallel test execution |
| `parallel_count` | integer | 2 | 1-10 | Number of parallel workers |
| `wcag_level` | string | "A" | "A", "AA", "AAA" | WCAG accessibility level |
| `accessibility_enabled` | boolean | true | - | Enable accessibility checks |

### Responsive Panel Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `responsive_panel_devices` | array[string] | ["iPad Pro 12.9\"", ...] | Device presets for responsive testing |
| `responsive_panel_resolutions` | array[string] | ["1920×1080 (FHD)", ...] | Resolution presets |

### Integration Settings

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `integration_type` | string | "none" | "none", "jira", "azure_devops" | Active integration |
| `integration_auto_create_on_failure` | boolean | true | - | Auto-create defects on test failure |
| `integration_attach_screenshots` | boolean | true | - | Attach screenshots to defects |
| `integration_max_screenshots` | integer | 5 | 1-20 | Max screenshots per defect |

### Jira Integration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `jira_url` | string | "" | Jira instance URL (e.g., https://company.atlassian.net) |
| `jira_username` | string | "" | Jira username/email |
| `jira_api_token` | string | null | **INPUT ONLY** - Jira API token |
| `jira_project_key` | string | "" | Default project key |
| `jira_issue_type` | string | "Bug" | Default issue type |
| `jira_severity_field` | string | "" | Custom field ID for severity |

**Response-only field:**
| `has_jira_api_token` | boolean | false | **OUTPUT ONLY** | Indicates if API token is stored |

### Azure DevOps Integration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `azure_organization` | string | "" | Azure DevOps organization |
| `azure_project` | string | "" | Project name |
| `azure_pat` | string | null | **INPUT ONLY** - Personal Access Token |
| `azure_work_item_type` | string | "Bug" | Default work item type |

**Response-only field:**
| `has_azure_pat` | boolean | false | **OUTPUT ONLY** | Indicates if PAT is stored |

---

## Important Notes for UI Team

### 1. Credential Handling

**IMPORTANT:** Sensitive credentials are handled specially:

| Input Field (PUT) | Output Field (GET) | Description |
|-------------------|-------------------|-------------|
| `ai_api_key` | `has_ai_api_key` | Send key in PUT, receive boolean in GET |
| `jira_api_token` | `has_jira_api_token` | Send token in PUT, receive boolean in GET |
| `azure_pat` | `has_azure_pat` | Send PAT in PUT, receive boolean in GET |

**Example UI Pattern:**

```javascript
// When displaying settings form
if (settings.has_jira_api_token) {
    showMaskedToken("••••••••••••");  // Show placeholder
} else {
    showEmptyField();
}

// When saving settings
const payload = {
    ...otherSettings,
    jira_api_token: hasUserEnteredNewToken ? newTokenValue : null
};
// Only send token if user explicitly entered a new one
```

### 2. Full Replacement Model

The PUT endpoint performs a **full replacement** of settings. This means:

- **Always send the complete settings object**
- If you only send partial data, missing fields will be set to their default values
- Use the current settings from GET as the base, modify what changed, then PUT the entire object

**Example:**

```javascript
// CORRECT: Full replacement
const currentSettings = await getSettings();
currentSettings.parallel_count = 4;  // Change one value
await putSettings(currentSettings);  // Send everything

// INCORRECT: Partial update (will reset other fields!)
await putSettings({ parallel_count: 4 });  // DON'T DO THIS
```

### 3. First-Time User Handling

```javascript
async function initializeSettings() {
    const response = await fetch('/api/v1/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (result.data === null) {
        // First-time user - sync local defaults to server
        const localDefaults = loadLocalSettings();
        await fetch('/api/v1/settings', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(localDefaults)
        });
        return localDefaults;
    }

    return result.data;
}
```

### 4. Error Handling

| HTTP Status | Meaning | UI Action |
|-------------|---------|-----------|
| 200 | Success | Update UI with response data |
| 400 | Bad Request | Show error message to user |
| 401 | Unauthorized | Redirect to login |
| 422 | Validation Error | Show field-specific errors |
| 500 | Server Error | Show generic error, retry later |

### 5. Version Tracking

The `metadata.version` field increments with each update. This can be used for:
- Optimistic concurrency control
- Detecting if settings changed on another device
- Debugging sync issues

---

## TypeScript Interfaces

```typescript
// Request Types
interface UserSettingsRequest {
    // Recording
    captures_per_minute: number;
    replay_speed_fps: number;
    autoplay: boolean;
    loop: boolean;
    show_actions_panel: boolean;
    run_mode: 'visible' | 'headless';
    browser_window_mode: 'maximised' | 'windowed' | 'fullscreen';
    default_url: string;
    record_browser: 'qtwebengine' | 'playwright_chromium' | 'playwright_firefox' | 'playwright_webkit';

    // Checkpoints
    checkpoint_line_thickness: '1' | '2' | '3' | '4' | '5';
    checkpoint_line_color: string;  // Hex color e.g., "#ff0000"

    // AI
    use_ai: boolean;
    ai_api_endpoint: string;
    ai_api_key?: string | null;  // Only for input
    ai_model: string;

    // Capture
    console_capture_enabled: boolean;
    network_capture_enabled: boolean;
    environment_capture_enabled: boolean;
    timing_capture_enabled: boolean;

    // Test Execution
    auto_generate_defect: boolean;
    auto_generate_detailed_defects: boolean;
    parallel_enabled: boolean;
    parallel_count: number;
    wcag_level: 'A' | 'AA' | 'AAA';
    accessibility_enabled: boolean;

    // Responsive Panel
    responsive_panel_devices: string[];
    responsive_panel_resolutions: string[];

    // Integration
    integration_type: 'none' | 'jira' | 'azure_devops';
    integration_auto_create_on_failure: boolean;
    integration_attach_screenshots: boolean;
    integration_max_screenshots: number;

    // Jira
    jira_url: string;
    jira_username: string;
    jira_api_token?: string | null;  // Only for input
    jira_project_key: string;
    jira_issue_type: string;
    jira_severity_field: string;

    // Azure DevOps
    azure_organization: string;
    azure_project: string;
    azure_pat?: string | null;  // Only for input
    azure_work_item_type: string;
}

// Response Types
interface UserSettingsResponse {
    success: boolean;
    data: UserSettingsData | null;
    message?: string;
    metadata?: {
        last_updated: string;  // ISO datetime
        version: number;
    };
}

interface UserSettingsData extends Omit<UserSettingsRequest, 'ai_api_key' | 'jira_api_token' | 'azure_pat'> {
    // Credential flags instead of actual values
    has_ai_api_key: boolean;
    has_jira_api_token: boolean;
    has_azure_pat: boolean;
}

interface SettingsUpdateResponse {
    success: boolean;
    message: string;
    data?: {
        updated_at: string;
        version: number;
    };
}

interface IntegrationTestRequest {
    integration_type: 'jira' | 'azure_devops';
    // Jira fields
    jira_url?: string;
    jira_username?: string;
    jira_api_token?: string;
    // Azure fields
    azure_organization?: string;
    azure_project?: string;
    azure_pat?: string;
}

interface IntegrationTestResponse {
    success: boolean;
    data: {
        connected: boolean;
        message: string;
        error_code?: string;
        details?: Record<string, any>;
    };
}
```

---

## Example API Calls

### JavaScript/Fetch

```javascript
// GET Settings
async function getSettings() {
    const response = await fetch('/api/v1/settings', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// PUT Settings
async function saveSettings(settings) {
    const response = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    });
    return response.json();
}

// Reset Settings
async function resetSettings() {
    const response = await fetch('/api/v1/settings/reset', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
    });
    return response.json();
}

// Test Jira Connection
async function testJiraConnection(url, username, apiToken) {
    const response = await fetch('/api/v1/settings/integrations/test', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            integration_type: 'jira',
            jira_url: url,
            jira_username: username,
            jira_api_token: apiToken
        })
    });
    return response.json();
}
```

### Python/Requests

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# GET Settings
response = requests.get(f"{BASE_URL}/settings", headers=headers)
settings = response.json()

# PUT Settings
response = requests.put(
    f"{BASE_URL}/settings",
    headers=headers,
    json=settings_payload
)

# Reset Settings
response = requests.post(
    f"{BASE_URL}/settings/reset",
    headers=headers,
    json={"confirm": True}
)

# Test Integration
response = requests.post(
    f"{BASE_URL}/settings/integrations/test",
    headers=headers,
    json={
        "integration_type": "jira",
        "jira_url": "https://company.atlassian.net",
        "jira_username": "user@company.com",
        "jira_api_token": "ATATT3xFfGF0xxxxx"
    }
)
```

---

## Validation Rules Summary

| Field | Rule |
|-------|------|
| `captures_per_minute` | Integer, 1-120 |
| `replay_speed_fps` | Integer, 1-60 |
| `parallel_count` | Integer, 1-10 |
| `integration_max_screenshots` | Integer, 1-20 |
| `checkpoint_line_thickness` | String, "1"-"5" |
| `checkpoint_line_color` | Hex color, e.g., "#ff0000" |
| `run_mode` | Enum: "visible", "headless" |
| `browser_window_mode` | Enum: "maximised", "windowed", "fullscreen" |
| `record_browser` | Enum: "qtwebengine", "playwright_chromium", "playwright_firefox", "playwright_webkit" |
| `wcag_level` | Enum: "A", "AA", "AAA" |
| `integration_type` | Enum: "none", "jira", "azure_devops" |

---

## Contact

For API issues or questions, contact the backend team.

**Document Version:** 2.0.0
**Last Updated:** 2026-01-24
