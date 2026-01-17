# Recording Sync API Specification

## Overview

This document specifies the API endpoints required for complete recording synchronization, enabling tests to be executed on any computer after syncing with the server. Recording sync includes screenshots, action metadata, and all data necessary for test playback.

---

## Base URL

```
{base_url}/api/v1
```

---

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

---

## Data Components

A complete recording consists of:

1. **Recording Entry** - Top-level recording metadata (name, environment, start_url)
2. **Steps/Screenshots** - Individual screenshot images
3. **Step Metadata** - Action data for each step (selectors, locators, coordinates, etc.)

---

## Endpoints

### 1. Create Recording (Existing)

Creates a new recording entry for a test case.

**Endpoint:**
```
POST /test-cases/{test_case_id}/recordings
```

**Request Body:**
```json
{
  "recording_id": "recording_20260117_143052",
  "recording_name": "Recording 2026-01-17 14:30:52",
  "environment": {
    "browser": "chromium",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "user_agent": "Mozilla/5.0 ..."
  },
  "start_url": "https://example.com"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "recording_id": "recording_20260117_143052",
  "recording_name": "Recording 2026-01-17 14:30:52",
  "environment": { ... },
  "start_url": "https://example.com",
  "created_at": "2026-01-17T14:30:52Z"
}
```

---

### 2. Upload Step with Full Metadata (NEW/Enhanced)

Upload a recording step with complete action metadata for test execution.

**Endpoint:**
```
POST /test-recordings/{recording_id}/steps
```

**Content-Type:** `application/json`

**Request Body (Array of Steps):**
```json
[
  {
    "step_number": 1,
    "action_type": "navigation",
    "description": "Navigated to https://example.com",
    "timestamp": "2026-01-17T14:30:52.123Z",
    "url": "https://example.com",
    "page_title": "Example Domain",
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "actions": [
      {
        "type": "navigation",
        "description": "Navigated to https://example.com",
        "timestamp": "2026-01-17T14:30:52.123Z",
        "url": "https://example.com"
      }
    ]
  },
  {
    "step_number": 2,
    "action_type": "click",
    "description": "Clicked on 'Login' button",
    "timestamp": "2026-01-17T14:30:54.456Z",
    "url": "https://example.com",
    "page_title": "Example Domain",
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "actions": [
      {
        "type": "click",
        "description": "Clicked on 'Login' button",
        "timestamp": "2026-01-17T14:30:54.456Z",
        "coordinates": {
          "clientX": 500,
          "clientY": 300,
          "pageX": 500,
          "pageY": 300
        },
        "element": {
          "tag": "button",
          "text": "Login",
          "id": "login-btn",
          "className": "btn btn-primary",
          "rect": {
            "x": 480,
            "y": 290,
            "width": 100,
            "height": 40,
            "viewportX": 480,
            "viewportY": 290
          },
          "enabled": true,
          "visible": true
        },
        "locators": [
          {
            "strategy": "role",
            "value": "role=button[name=\"Login\"]",
            "playwright": "getByRole(\"button\", { name: \"Login\" })"
          },
          {
            "strategy": "id",
            "value": "#login-btn",
            "playwright": "locator('#login-btn')"
          },
          {
            "strategy": "text-exact",
            "value": "text=\"Login\"",
            "playwright": "getByText(\"Login\", { exact: true })"
          },
          {
            "strategy": "xpath",
            "value": "//button[@id='login-btn']",
            "playwright": "locator('//button[@id=\"login-btn\"]')"
          },
          {
            "strategy": "coordinates",
            "value": { "x": 500, "y": 300, "viewportX": 500, "viewportY": 300 },
            "playwright": "page.mouse.click(500, 300)"
          }
        ]
      }
    ]
  },
  {
    "step_number": 3,
    "action_type": "input",
    "description": "Typed 'user@example.com' into email field",
    "timestamp": "2026-01-17T14:30:56.789Z",
    "url": "https://example.com/login",
    "page_title": "Login - Example",
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "actions": [
      {
        "type": "input",
        "description": "Typed 'user@example.com' into email field",
        "timestamp": "2026-01-17T14:30:56.789Z",
        "input_value": "user@example.com",
        "input_type": "email",
        "element": {
          "tag": "input",
          "text": "",
          "id": "email",
          "className": "form-control",
          "placeholder": "Enter email",
          "rect": { ... },
          "enabled": true,
          "visible": true
        },
        "locators": [
          {
            "strategy": "id",
            "value": "#email",
            "playwright": "locator('#email')"
          },
          {
            "strategy": "placeholder",
            "value": "placeholder=\"Enter email\"",
            "playwright": "getByPlaceholder(\"Enter email\")"
          },
          {
            "strategy": "role",
            "value": "role=textbox[name=\"Email\"]",
            "playwright": "getByRole(\"textbox\", { name: \"Email\" })"
          }
        ]
      }
    ]
  }
]
```

**Response (201 Created):**
```json
{
  "message": "Steps uploaded successfully",
  "recording_id": "550e8400-e29b-41d4-a716-446655440000",
  "steps_count": 3
}
```

---

### 3. Upload Screenshot (Existing)

Upload a screenshot image for a step.

**Endpoint:**
```
POST /test-recordings/{recording_id}/screenshots/{step_number}
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | PNG screenshot image |

**Response (201 Created):**
```json
{
  "message": "Screenshot uploaded successfully",
  "recording_id": "550e8400-e29b-41d4-a716-446655440000",
  "step_number": 1,
  "url": "/test-recordings/550e8400.../screenshots/1"
}
```

---

### 4. Get Recording Steps with Full Metadata (NEW/Enhanced)

Retrieve all steps for a recording with complete action metadata.

**Endpoint:**
```
GET /test-recordings/{recording_id}/steps
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| include_metadata | boolean | No | true | Include full action metadata |

**Response (200 OK):**
```json
{
  "recording_id": "550e8400-e29b-41d4-a716-446655440000",
  "steps_count": 3,
  "steps": [
    {
      "id": "step-uuid-1",
      "step_number": 1,
      "action_type": "navigation",
      "description": "Navigated to https://example.com",
      "timestamp": "2026-01-17T14:30:52.123Z",
      "url": "https://example.com",
      "page_title": "Example Domain",
      "viewport": {
        "width": 1920,
        "height": 1080
      },
      "screenshot_url": "/test-recordings/.../screenshots/1",
      "actions": [
        {
          "type": "navigation",
          "description": "Navigated to https://example.com",
          "timestamp": "2026-01-17T14:30:52.123Z",
          "url": "https://example.com"
        }
      ]
    },
    {
      "id": "step-uuid-2",
      "step_number": 2,
      "action_type": "click",
      "description": "Clicked on 'Login' button",
      "timestamp": "2026-01-17T14:30:54.456Z",
      "url": "https://example.com",
      "page_title": "Example Domain",
      "viewport": { ... },
      "screenshot_url": "/test-recordings/.../screenshots/2",
      "actions": [
        {
          "type": "click",
          "description": "Clicked on 'Login' button",
          "timestamp": "2026-01-17T14:30:54.456Z",
          "coordinates": { ... },
          "element": { ... },
          "locators": [ ... ]
        }
      ]
    }
  ]
}
```

---

### 5. Download Screenshot (Existing)

Download a screenshot image.

**Endpoint:**
```
GET /test-recordings/{recording_id}/screenshots/{step_number}
```

**Response:**
- Returns the PNG image as binary stream
- Headers:
  - `Content-Type`: `image/png`
  - `Content-Disposition`: `attachment; filename="screenshot_0001.png"`

---

### 6. Get Recordings for Test Case (Existing)

Get all recordings for a test case.

**Endpoint:**
```
GET /test-cases/{test_case_id}/recordings
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recording_id": "recording_20260117_143052",
    "recording_name": "Recording 2026-01-17 14:30:52",
    "environment": { ... },
    "start_url": "https://example.com",
    "steps_count": 15,
    "created_at": "2026-01-17T14:30:52Z"
  }
]
```

---

### 7. Delete Recording (Existing)

Delete a recording and all its steps/screenshots.

**Endpoint:**
```
DELETE /test-recordings/{recording_id}
```

**Response (200 OK):**
```json
{
  "message": "Recording deleted successfully"
}
```

---

## Data Models

### Action Object

The `actions` array in each step contains the complete action data needed for test execution.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Action type: navigation, click, input, scroll, select, file_upload, etc. |
| description | string | Yes | Human-readable description |
| timestamp | string (ISO 8601) | Yes | When the action occurred |
| url | string | No | Current page URL (for navigation) |
| coordinates | object | No | Click coordinates (clientX, clientY, pageX, pageY) |
| input_value | string | No | Value entered (for input actions) |
| input_type | string | No | Input element type (text, email, password, file, etc.) |
| element | ElementInfo | No | Information about the target element |
| locators | array | No | Array of locator strategies |
| frameContext | object | No | Frame path info for iframe support |
| asset_filename | string | No | Asset filename (for file_upload actions) |

### ElementInfo Object

| Field | Type | Description |
|-------|------|-------------|
| tag | string | HTML tag name |
| text | string | Element text content |
| id | string | Element ID |
| className | string | CSS classes |
| name | string | Name attribute |
| placeholder | string | Placeholder text |
| value | string | Current value |
| type | string | Input type |
| href | string | Link href |
| role | string | ARIA role |
| ariaLabel | string | ARIA label |
| rect | object | Bounding rectangle {x, y, width, height, viewportX, viewportY} |
| enabled | boolean | Whether element is enabled |
| visible | boolean | Whether element is visible |

### Locator Object

| Field | Type | Description |
|-------|------|-------------|
| strategy | string | Locator strategy: role, id, text-exact, text-contains, placeholder, xpath, css, coordinates |
| value | string or object | The locator value |
| playwright | string | Playwright code snippet for this locator |

### Supported Locator Strategies

| Strategy | Description | Example Value |
|----------|-------------|---------------|
| role | Playwright role selector | `role=button[name="Login"]` |
| id | CSS ID selector | `#login-btn` |
| text-exact | Exact text match | `text="Login"` |
| text-contains | Partial text match | `text=Login` |
| placeholder | Placeholder attribute | `placeholder="Enter email"` |
| xpath | XPath expression | `//button[@id='login-btn']` |
| xpath-text | XPath with text | `//button[contains(text(),"Login")]` |
| css | CSS selector | `button.btn-primary` |
| class | Class-based selector | `button.btn-primary` |
| href | Href attribute | `a[href*="/login"]` |
| coordinates | Absolute coordinates | `{ "x": 500, "y": 300 }` |

---

## Client Sync Behavior

### On Recording Completion (Upload)

1. Create recording entry: `POST /test-cases/{id}/recordings`
2. For each step:
   - Read local `screenshot_*_metadata.json` file
   - Extract full `actions` array with all locator data
   - Collect step metadata (url, title, viewport)
3. Upload all steps in batch: `POST /test-recordings/{id}/steps`
4. Upload screenshots: `POST /test-recordings/{id}/screenshots/{step}`
5. Upload thumbnail (step_number=0)

### On Test Case Load (Download)

1. Get recordings: `GET /test-cases/{id}/recordings`
2. Get steps with metadata: `GET /test-recordings/{id}/steps?include_metadata=true`
3. For each step:
   - Download screenshot to cache folder
   - Reconstruct local `screenshot_*_metadata.json` file from step data
4. MetadataReader can now find and parse the reconstructed files
5. Test can be executed using PlaybackExecutor

### Metadata File Reconstruction

When downloading, the client reconstructs local metadata files in this format:

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "actions": [
    {
      "type": "click",
      "description": "Clicked on 'Login' button",
      "timestamp": "2026-01-17T14:30:54.456Z",
      "coordinates": { ... },
      "element": { ... },
      "locators": [ ... ]
    }
  ],
  "elements": []
}
```

Note: The `elements` array is left empty when reconstructing, as it's only used for the element selector UI and not needed for test execution.

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 200 | - | Success |
| 201 | - | Created successfully |
| 400 | BAD_REQUEST | Invalid request format |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | User doesn't have access |
| 404 | NOT_FOUND | Recording or step not found |
| 413 | PAYLOAD_TOO_LARGE | Screenshot exceeds size limit |
| 422 | VALIDATION_ERROR | Request validation failed |
| 500 | INTERNAL_ERROR | Server error |

---

## Implementation Notes

### Storage Recommendations

1. **Step Metadata**: Store as JSON/JSONB in database. The `actions` array is the critical data for test execution.

2. **Screenshots**: Store in object storage (S3, GCS, or local filesystem). Use step_number in the path for easy retrieval.

3. **Indexing**: Index by `recording_id` and `step_number` for fast retrieval.

### Size Considerations

- Individual action metadata is typically 1-5 KB per step
- Screenshots are typically 100-500 KB each
- A typical recording has 10-50 steps
- Total recording size: 1-25 MB per recording

### Backwards Compatibility

The enhanced step upload endpoint accepts the same payload as before, with additional fields. Existing clients can continue to send simplified step data, while new clients can send full metadata.

---

## Example Workflow

### 1. User Records Test on Computer A

```
1. User clicks "Record" and performs actions
2. Client captures screenshots and metadata locally
3. On recording completion:
   POST /test-cases/{id}/recordings → Creates recording entry
   POST /test-recordings/{id}/steps → Uploads full action metadata
   POST /test-recordings/{id}/screenshots/1 → Uploads screenshot 1
   POST /test-recordings/{id}/screenshots/2 → Uploads screenshot 2
   ... (for all steps)
```

### 2. User Logs In on Computer B

```
1. User logs in and selects test case
2. Client calls GET /test-cases/{id}/recordings
3. Client calls GET /test-recordings/{id}/steps?include_metadata=true
4. Client downloads each screenshot:
   GET /test-recordings/{id}/screenshots/1 → Save to cache
   GET /test-recordings/{id}/screenshots/2 → Save to cache
   ...
5. Client reconstructs local metadata files from step data
6. MetadataReader finds the reconstructed files
7. User can view screenshots in playback viewer
8. User can execute the test using PlaybackExecutor
```

---

## Questions for Backend Team

1. **Database Schema**: Should `actions` be stored as JSONB or in a separate actions table?
2. **Compression**: Should we compress the actions JSON for storage?
3. **Versioning**: Should we track metadata schema versions for future compatibility?
4. **Batch Download**: Should we add an endpoint to download all steps + screenshots as a ZIP file?
