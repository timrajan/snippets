# Defects API Documentation

**Base URL:** `http://localhost:8000/api/v1/defects`
**Authentication:** Bearer Token (JWT) required for all endpoints

---

## Table of Contents
1. [Defect CRUD Operations](#1-defect-crud-operations)
2. [Screenshots & Attachments](#2-screenshots--attachments)
3. [Folders](#3-folders)
4. [Filters](#4-filters)
5. [Filter Templates](#5-filter-templates)
6. [External Sync](#6-external-sync)
7. [Export](#7-export)
8. [Enums Reference](#8-enums-reference)

---

## 1. Defect CRUD Operations

### 1.1 List Defects

**Endpoint:** `GET /api/v1/defects`

**Description:** List all defects with optional filtering, sorting, and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| filter_id | UUID | - | Apply saved filter |
| status | string | - | Filter by status |
| severity | string | - | Filter by severity |
| priority | string | - | Filter by priority |
| type | string | - | Filter by type |
| tags | string | - | Comma-separated tags |
| folder_id | UUID | - | Filter by folder |
| search | string | - | Search in title/description |
| date_from | date | - | Created after (YYYY-MM-DD) |
| date_to | date | - | Created before (YYYY-MM-DD) |
| page | int | 1 | Page number |
| per_page | int | 50 | Items per page (max 200) |
| sort_by | string | "date_created" | Sort field |
| sort_order | string | "desc" | "asc" or "desc" |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects?page=1&per_page=20&status=Open&severity=Critical" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**cURL (with multiple filters):**
```bash
curl -X GET "http://localhost:8000/api/v1/defects?status=Open&priority=P1&tags=regression,blocker&date_from=2026-01-01&sort_by=priority&sort_order=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "defects": [
      {
        "id": "uuid",
        "defect_number": "DEF-001",
        "title": "Login button not responding",
        "type": "Functional",
        "severity": "Critical",
        "priority": "P1",
        "status": "Open",
        "tags": ["regression", "blocker"],
        "owner": "john@example.com",
        "created_by": "jane@example.com",
        "date_created": "2026-01-18",
        "date_opened": "2026-01-18T10:30:00Z",
        "is_auto_generated": false,
        "folder_id": null,
        "group_name": null,
        "screenshot_count": 2,
        "has_external_reference": true,
        "external_reference": {
          "system": "jira",
          "external_key": "PROJ-123",
          "external_url": "https://company.atlassian.net/browse/PROJ-123",
          "synced_at": "2026-01-18T10:30:00Z",
          "sync_status": "synced"
        },
        "created_at": "2026-01-18T10:30:00Z",
        "updated_at": "2026-01-18T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    },
    "statistics": {
      "total": 150,
      "open": 45,
      "in_progress": 30,
      "closed": 75
    }
  }
}
```

---

### 1.2 Get Defect Statistics

**Endpoint:** `GET /api/v1/defects/statistics`

**Description:** Get defect statistics with optional date range and folder filtering.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**cURL (with filters):**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/statistics?date_from=2026-01-01&date_to=2026-01-31&folder_id=uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "by_status": {
      "Open": 45,
      "In Progress": 30,
      "Fixed": 20,
      "Closed": 55
    },
    "by_severity": {
      "Critical": 10,
      "High": 35,
      "Medium": 70,
      "Low": 35
    },
    "by_priority": {
      "P1": 15,
      "P2": 50,
      "P3": 60,
      "P4": 25
    },
    "by_type": {
      "Functional": 80,
      "UI/Visual": 30,
      "Performance": 20,
      "Security": 10,
      "Other": 10
    },
    "trends": {
      "created_last_7_days": 12,
      "closed_last_7_days": 8,
      "created_last_30_days": 45,
      "closed_last_30_days": 40
    }
  }
}
```

---

### 1.3 Get Single Defect

**Endpoint:** `GET /api/v1/defects/{defect_id}`

**Description:** Get a defect with all related data (steps, screenshots, attachments, errors).

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "defect_number": "DEF-001",
    "title": "Login button not responding",
    "summary": "User cannot click login button after entering credentials",
    "description": "Detailed description of the defect...",
    "type": "Functional",
    "severity": "Critical",
    "priority": "P1",
    "status": "Open",
    "tags": ["regression", "blocker"],
    "owner": "john@example.com",
    "created_by": "jane@example.com",
    "date_created": "2026-01-18",
    "date_opened": "2026-01-18T10:30:00Z",
    "is_auto_generated": true,
    "folder_id": null,
    "group_name": "Sprint 5",
    "notes": "Additional notes here",
    "test_context": {
      "browser": "Chrome",
      "browser_version": "120.0.0",
      "os": "Windows",
      "os_version": "11",
      "viewport": "1920x1080",
      "screen_resolution": "1920x1080",
      "user_agent": "Mozilla/5.0...",
      "initial_url": "https://app.example.com/login",
      "test_case": "Login Test",
      "test_case_path": ["Authentication", "Login"],
      "test_run_name": "Nightly Regression",
      "execution_timestamp": "2026-01-18T02:00:00Z",
      "failed_step_number": 3,
      "total_steps": 5,
      "failed_action": "click",
      "failed_step_description": "Click login button",
      "element_selector": "#login-btn",
      "element_html": "<button id=\"login-btn\">Login</button>",
      "expected_result": "Navigate to dashboard",
      "actual_result": "Button not clickable",
      "step_error_message": "Element not interactable"
    },
    "steps": [
      {
        "id": "uuid",
        "step_number": 1,
        "action": "navigation",
        "description": "Navigate to login page",
        "status": "passed",
        "duration_ms": 1500.5,
        "error_message": null,
        "playwright_code": "await page.goto('https://app.example.com/login')",
        "screenshot_url": "defects/uuid/screenshots/step1.png"
      },
      {
        "id": "uuid",
        "step_number": 2,
        "action": "input",
        "description": "Enter username",
        "status": "passed",
        "duration_ms": 200.0
      },
      {
        "id": "uuid",
        "step_number": 3,
        "action": "click",
        "description": "Click login button",
        "status": "failed",
        "duration_ms": 5000.0,
        "error_message": "Element not interactable"
      }
    ],
    "screenshots": [
      {
        "id": "uuid",
        "filename": "step1.png",
        "url": "defects/uuid/screenshots/step1.png",
        "screenshot_type": "step",
        "step_number": 1,
        "is_failed_step": false
      },
      {
        "id": "uuid",
        "filename": "failure.png",
        "url": "defects/uuid/screenshots/failure.png",
        "screenshot_type": "failure",
        "step_number": 3,
        "is_failed_step": true
      }
    ],
    "attachments": [
      {
        "id": "uuid",
        "filename": "trace.zip",
        "url": "defects/uuid/attachments/trace.zip",
        "attachment_type": "trace",
        "file_size_bytes": 1024000,
        "mime_type": "application/zip"
      }
    ],
    "console_errors": [
      {
        "id": "uuid",
        "level": "error",
        "message": "Uncaught TypeError: Cannot read property 'click' of null",
        "source": "app.js",
        "line_number": 234,
        "stack_trace": "at onClick (app.js:234:5)...",
        "timestamp": "2026-01-18T02:00:15Z",
        "step_index": 3
      }
    ],
    "network_errors": [
      {
        "id": "uuid",
        "url": "https://api.example.com/auth",
        "method": "POST",
        "status_code": 500,
        "status_message": "Internal Server Error",
        "request_timestamp": "2026-01-18T02:00:14Z"
      }
    ],
    "external_reference": {
      "system": "jira",
      "external_key": "PROJ-123",
      "external_id": "10001",
      "external_url": "https://company.atlassian.net/browse/PROJ-123",
      "synced_at": "2026-01-18T10:30:00Z",
      "sync_status": "synced"
    },
    "created_at": "2026-01-18T10:30:00Z",
    "updated_at": "2026-01-18T10:30:00Z"
  }
}
```

---

### 1.4 Create Defect

**Endpoint:** `POST /api/v1/defects`

**Description:** Create a new defect with optional related data.

**cURL (Simple):**
```bash
curl -X POST "http://localhost:8000/api/v1/defects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not responding",
    "summary": "User cannot click login button",
    "description": "After entering credentials, the login button does not respond to clicks",
    "type": "Functional",
    "severity": "Critical",
    "priority": "P1",
    "status": "Open",
    "tags": ["regression", "blocker"],
    "owner": "john@example.com"
  }'
```

**cURL (With Test Context - Auto-Generated Defect):**
```bash
curl -X POST "http://localhost:8000/api/v1/defects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not responding",
    "type": "Functional",
    "severity": "Critical",
    "priority": "P1",
    "is_auto_generated": true,
    "test_context": {
      "browser": "Chrome",
      "browser_version": "120.0.0",
      "os": "Windows",
      "os_version": "11",
      "viewport": "1920x1080",
      "initial_url": "https://app.example.com/login",
      "test_case": "Login Test",
      "test_case_path": ["Authentication", "Login"],
      "test_run_name": "Nightly Regression",
      "failed_step_number": 3,
      "total_steps": 5,
      "failed_action": "click",
      "failed_step_description": "Click login button",
      "element_selector": "#login-btn",
      "expected_result": "Navigate to dashboard",
      "actual_result": "Button not clickable",
      "step_error_message": "Element not interactable"
    },
    "steps": [
      {
        "step_number": 1,
        "action": "navigation",
        "description": "Navigate to login page",
        "status": "passed",
        "duration_ms": 1500.5
      },
      {
        "step_number": 2,
        "action": "input",
        "description": "Enter username",
        "status": "passed",
        "duration_ms": 200.0
      },
      {
        "step_number": 3,
        "action": "click",
        "description": "Click login button",
        "status": "failed",
        "duration_ms": 5000.0,
        "error_message": "Element not interactable"
      }
    ],
    "console_errors": [
      {
        "level": "error",
        "message": "Uncaught TypeError: Cannot read property click of null",
        "source": "app.js",
        "line_number": 234
      }
    ],
    "network_errors": [
      {
        "url": "https://api.example.com/auth",
        "method": "POST",
        "status_code": 500,
        "status_message": "Internal Server Error"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Defect created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "defect_number": "DEF-001",
    "upload_urls": {
      "screenshots": [],
      "attachments": []
    }
  }
}
```

---

### 1.5 Update Defect

**Endpoint:** `PUT /api/v1/defects/{defect_id}`

**Description:** Update a defect (partial updates supported).

**cURL:**
```bash
curl -X PUT "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "owner": "developer@example.com",
    "priority": "P1",
    "tags": ["regression", "blocker", "sprint-5"]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Defect updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "defect_number": "DEF-001",
    "updated_at": "2026-01-18T11:00:00Z"
  }
}
```

---

### 1.6 Delete Defect

**Endpoint:** `DELETE /api/v1/defects/{defect_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Defect deleted successfully"
}
```

---

### 1.7 Batch Update Defects

**Endpoint:** `PATCH /api/v1/defects/batch`

**Description:** Update multiple defects at once. Allowed fields: `status`, `severity`, `priority`, `owner`, `tags_add`, `tags_remove`, `folder_id`.

**cURL:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/defects/batch" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defect_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "updates": {
      "status": "Closed",
      "tags_add": ["sprint-5-resolved"]
    }
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 defects updated successfully",
  "data": {
    "updated_count": 3,
    "updated_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }
}
```

---

### 1.8 Batch Delete Defects

**Endpoint:** `DELETE /api/v1/defects/batch`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/batch" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defect_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 defects deleted successfully",
  "data": {
    "deleted_count": 2
  }
}
```

---

## 2. Screenshots & Attachments

### 2.1 Upload Screenshot

**Endpoint:** `POST /api/v1/defects/{defect_id}/screenshots`

**Content-Type:** `multipart/form-data`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/screenshots" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@screenshot.png" \
  -F "step_number=3" \
  -F "screenshot_type=failure" \
  -F "is_failed_step=true" \
  -F "caption=Login button state at failure"
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Screenshot image file |
| step_number | int | No | Associated step number |
| screenshot_type | string | No | "step", "failure", "full_page", "attachment" |
| is_failed_step | bool | No | Whether this is the failed step screenshot |
| caption | string | No | Screenshot caption |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "screenshot.png",
    "url": "defects/uuid/screenshots/screenshot.png",
    "step_number": 3,
    "screenshot_type": "failure"
  }
}
```

---

### 2.2 Delete Screenshot

**Endpoint:** `DELETE /api/v1/defects/{defect_id}/screenshots/{screenshot_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/screenshots/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Screenshot deleted successfully"
}
```

---

### 2.3 Upload Attachment

**Endpoint:** `POST /api/v1/defects/{defect_id}/attachments`

**Content-Type:** `multipart/form-data`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/attachments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@trace.zip" \
  -F "attachment_type=trace" \
  -F "description=Playwright trace file"
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Attachment file |
| attachment_type | string | No | "video", "har", "log", "trace", "other" |
| description | string | No | Attachment description |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "trace.zip",
    "url": "defects/uuid/attachments/trace.zip",
    "attachment_type": "trace",
    "file_size_bytes": 1024000
  }
}
```

---

### 2.4 Delete Attachment

**Endpoint:** `DELETE /api/v1/defects/{defect_id}/attachments/{attachment_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/attachments/770e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

---

## 3. Folders

### 3.1 List Folders

**Endpoint:** `GET /api/v1/defects/folders`

**Description:** Get hierarchical folder structure with defect counts.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/folders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "uuid",
        "name": "Sprint 5",
        "parent_id": null,
        "defect_count": 15,
        "children": [
          {
            "id": "uuid",
            "name": "Authentication",
            "parent_id": "parent-uuid",
            "defect_count": 5,
            "children": []
          },
          {
            "id": "uuid",
            "name": "Dashboard",
            "parent_id": "parent-uuid",
            "defect_count": 10,
            "children": []
          }
        ]
      },
      {
        "id": "uuid",
        "name": "Backlog",
        "parent_id": null,
        "defect_count": 30,
        "children": []
      }
    ]
  }
}
```

---

### 3.2 Create Folder

**Endpoint:** `POST /api/v1/defects/folders`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/folders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 6",
    "parent_id": null
  }'
```

**cURL (Create Nested Folder):**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/folders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Issues",
    "parent_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": "uuid",
    "name": "Sprint 6",
    "parent_id": null
  }
}
```

---

### 3.3 Update Folder

**Endpoint:** `PUT /api/v1/defects/folders/{folder_id}`

**cURL:**
```bash
curl -X PUT "http://localhost:8000/api/v1/defects/folders/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 6 - Completed"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder updated successfully",
  "data": {
    "id": "uuid",
    "name": "Sprint 6 - Completed",
    "parent_id": null
  }
}
```

---

### 3.4 Delete Folder

**Endpoint:** `DELETE /api/v1/defects/folders/{folder_id}`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cascade | bool | false | Delete all defects in folder |

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/folders/550e8400-e29b-41d4-a716-446655440000?cascade=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

---

## 4. Filters

### 4.1 List Filters

**Endpoint:** `GET /api/v1/defects/filters`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| include_system | bool | true | Include system filters |
| favorites_only | bool | false | Only favorite filters |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/filters" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filters": [
      {
        "id": "uuid",
        "name": "Critical Open Issues",
        "description": "All critical severity open defects",
        "icon": "🔴",
        "conditions": [
          {"field": "severity", "operator": "equals", "value": "Critical"},
          {"field": "status", "operator": "equals", "value": "Open"}
        ],
        "is_default": true,
        "is_system": false,
        "is_favorite": true,
        "use_count": 25,
        "last_used": "2026-01-18T10:00:00Z",
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "default_filter_id": "uuid"
  }
}
```

---

### 4.2 Create Filter

**Endpoint:** `POST /api/v1/defects/filters`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Sprint Issues",
    "description": "P1 and P2 issues from this sprint",
    "icon": "⚡",
    "conditions": [
      {"field": "priority", "operator": "is_one_of", "value": ["P1", "P2"]},
      {"field": "status", "operator": "not_equals", "value": "Closed"},
      {"field": "tags", "operator": "has_any_of", "value": ["sprint-6"]}
    ],
    "is_favorite": true
  }'
```

**Filter Operators:**
| Operator | Description | Example Value |
|----------|-------------|---------------|
| equals | Exact match | "Critical" |
| not_equals | Not equal | "Closed" |
| is_one_of | In list | ["P1", "P2"] |
| has_any_of | Has any tag | ["regression"] |
| has_all_of | Has all tags | ["critical", "blocker"] |
| has_none_of | Has none of tags | ["wontfix"] |
| is_empty | Field is empty | null |
| is_not_empty | Field is not empty | null |
| before | Date before | "2026-01-01" |
| after | Date after | "2026-01-01" |
| between | Date between | ["2026-01-01", "2026-01-31"] |
| in_last_days | In last N days | 7 |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Filter created successfully",
  "data": {
    "id": "uuid",
    "name": "My Sprint Issues"
  }
}
```

---

### 4.3 Update Filter

**Endpoint:** `PUT /api/v1/defects/filters/{filter_id}`

**cURL:**
```bash
curl -X PUT "http://localhost:8000/api/v1/defects/filters/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Sprint 6 Issues",
    "conditions": [
      {"field": "priority", "operator": "is_one_of", "value": ["P1", "P2"]},
      {"field": "tags", "operator": "has_any_of", "value": ["sprint-6"]}
    ]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Filter updated successfully",
  "data": {
    "id": "uuid",
    "name": "My Sprint 6 Issues"
  }
}
```

---

### 4.4 Delete Filter

**Endpoint:** `DELETE /api/v1/defects/filters/{filter_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/defects/filters/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Filter deleted successfully"
}
```

---

### 4.5 Set Default Filter

**Endpoint:** `POST /api/v1/defects/filters/{filter_id}/set-default`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters/550e8400-e29b-41d4-a716-446655440000/set-default" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Default filter set successfully"
}
```

---

### 4.6 Toggle Favorite Filter

**Endpoint:** `POST /api/v1/defects/filters/{filter_id}/toggle-favorite`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters/550e8400-e29b-41d4-a716-446655440000/toggle-favorite" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Favorite toggled successfully",
  "data": {
    "is_favorite": true
  }
}
```

---

### 4.7 Track Filter Usage

**Endpoint:** `POST /api/v1/defects/filters/{filter_id}/track-usage`

**Description:** Increment filter usage count (call when filter is applied).

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters/550e8400-e29b-41d4-a716-446655440000/track-usage" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usage tracked successfully"
}
```

---

### 4.8 Import Filters

**Endpoint:** `POST /api/v1/defects/filters/import`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters/import" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [
      {
        "name": "Imported Filter 1",
        "conditions": [{"field": "status", "operator": "equals", "value": "Open"}]
      },
      {
        "name": "Imported Filter 2",
        "conditions": [{"field": "severity", "operator": "equals", "value": "Critical"}]
      }
    ],
    "overwrite_existing": false
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 filters imported successfully",
  "data": {
    "imported_count": 2
  }
}
```

---

### 4.9 Export Filters

**Endpoint:** `GET /api/v1/defects/filters/export`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/filters/export" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filters": [
      {
        "name": "Critical Open Issues",
        "description": "All critical severity open defects",
        "icon": "🔴",
        "conditions": [
          {"field": "severity", "operator": "equals", "value": "Critical"},
          {"field": "status", "operator": "equals", "value": "Open"}
        ]
      }
    ]
  }
}
```

---

## 5. Filter Templates

### 5.1 List Filter Templates

**Endpoint:** `GET /api/v1/defects/filter-templates`

**Description:** Get predefined filter templates available to all users.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/filter-templates" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Critical Open Defects",
        "description": "Filter for critical severity open issues",
        "icon": "🔴",
        "category": "severity",
        "conditions": [
          {"field": "severity", "operator": "equals", "value": "Critical"},
          {"field": "status", "operator": "equals", "value": "Open"}
        ]
      },
      {
        "id": "uuid",
        "name": "High Priority Issues",
        "description": "P1 and P2 priority defects",
        "icon": "⚡",
        "category": "priority",
        "conditions": [
          {"field": "priority", "operator": "is_one_of", "value": ["P1", "P2"]}
        ]
      },
      {
        "id": "uuid",
        "name": "Recent Defects",
        "description": "Defects created in the last 7 days",
        "icon": "📅",
        "category": "date",
        "conditions": [
          {"field": "date_created", "operator": "in_last_days", "value": 7}
        ]
      }
    ]
  }
}
```

---

### 5.2 Create Filter from Template

**Endpoint:** `POST /api/v1/defects/filters/from-template/{template_id}`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/filters/from-template/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Critical Issues",
    "is_favorite": true
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Filter created from template",
  "data": {
    "id": "uuid",
    "name": "My Critical Issues"
  }
}
```

---

## 6. External Sync

### 6.1 Sync Defect to External System

**Endpoint:** `POST /api/v1/defects/{defect_id}/sync`

**Description:** Sync defect to external issue tracking system (Jira, Azure DevOps).

**cURL (Jira):**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/sync" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "system": "jira",
    "include_screenshots": true,
    "max_screenshots": 5
  }'
```

**cURL (Azure DevOps):**
```bash
curl -X POST "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/sync" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "system": "azure_devops",
    "include_screenshots": true,
    "max_screenshots": 3
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Defect synced to jira successfully",
  "data": {
    "external_reference": {
      "system": "jira",
      "external_key": "PROJ-123",
      "external_id": "10001",
      "external_url": "https://company.atlassian.net/browse/PROJ-123",
      "synced_at": "2026-01-18T10:30:00Z"
    }
  }
}
```

---

### 6.2 Get Sync Status

**Endpoint:** `GET /api/v1/defects/{defect_id}/sync-status`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/550e8400-e29b-41d4-a716-446655440000/sync-status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK - Synced):**
```json
{
  "success": true,
  "data": {
    "is_synced": true,
    "external_reference": {
      "system": "jira",
      "external_key": "PROJ-123",
      "external_id": "10001",
      "external_url": "https://company.atlassian.net/browse/PROJ-123",
      "synced_at": "2026-01-18T10:30:00Z",
      "sync_status": "synced",
      "last_sync_error": null
    }
  }
}
```

**Response (200 OK - Not Synced):**
```json
{
  "success": true,
  "data": {
    "is_synced": false,
    "external_reference": null
  }
}
```

---

## 7. Export

### 7.1 Export to CSV

**Endpoint:** `GET /api/v1/defects/export/csv`

**Description:** Export defects to CSV file (same filter parameters as list endpoint).

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/export/csv?status=Open&severity=Critical" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o defects.csv
```

**Response:** CSV file download

---

### 7.2 Export to JSON

**Endpoint:** `GET /api/v1/defects/export/json`

**Description:** Export defects to JSON format (same filter parameters as list endpoint).

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/defects/export/json?status=Open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "defect_number": "DEF-001",
      "title": "Login button not responding",
      "type": "Functional",
      "severity": "Critical",
      "priority": "P1",
      "status": "Open"
    }
  ]
}
```

---

## 8. Enums Reference

### Defect Type
| Value | Description |
|-------|-------------|
| Functional | Functional issues |
| UI/Visual | UI and visual issues |
| Performance | Performance issues |
| Security | Security vulnerabilities |
| Usability | Usability issues |
| Compatibility | Compatibility issues |
| Other | Other issues |

### Defect Severity
| Value | Description |
|-------|-------------|
| Low | Low impact |
| Medium | Medium impact |
| High | High impact |
| Critical | Critical/Blocker |

### Defect Priority
| Value | Description |
|-------|-------------|
| P1 | Highest priority |
| P2 | High priority |
| P3 | Medium priority |
| P4 | Low priority |

### Defect Status
| Value | Description |
|-------|-------------|
| Open | Newly created |
| In Progress | Being worked on |
| Fixed | Fix implemented |
| Closed | Verified and closed |
| Retest | Needs retesting |
| Rejected | Not a valid defect |
| Resolved | Resolved |
| Reopened | Reopened after closure |

### Screenshot Type
| Value | Description |
|-------|-------------|
| step | Step screenshot |
| failure | Failure screenshot |
| full_page | Full page screenshot |
| attachment | General attachment |

### Attachment Type
| Value | Description |
|-------|-------------|
| video | Video recording |
| har | HAR file |
| log | Log file |
| trace | Trace file |
| other | Other attachment |

### External System
| Value | Description |
|-------|-------------|
| jira | Jira |
| azure_devops | Azure DevOps |
| custom | Custom integration |

### Filter Fields
| Value | Description |
|-------|-------------|
| priority | Filter by priority |
| severity | Filter by severity |
| status | Filter by status |
| type | Filter by type |
| tags | Filter by tags |
| date_created | Filter by creation date |
| date_opened | Filter by opened date |

---

## Error Responses

All endpoints may return:

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found:**
```json
{
  "detail": "Defect not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
