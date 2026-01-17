# Defects Module API Specification

## Overview

This document specifies the REST API endpoints for managing defects, filters, and templates in the Testr application. The defects module supports manual defect creation, auto-generated defects from test failures, external system integration (Jira, Azure DevOps), and a sophisticated filtering system.

---

## Design Philosophy

### Dual Storage Architecture
- **Guest Users**: Defects stored locally in `data/defects.json`, `data/defect_groups.json`
- **Logged-In Users**: All defect data synced with server via API

### Key Principles
1. **Complete Separation**: No mixing between local and server defects
2. **Rich Data Model**: Support for screenshots, steps, console/network errors
3. **Hierarchical Organization**: Defects organized in folders/groups
4. **External Integration**: Sync with Jira, Azure DevOps, custom systems
5. **Powerful Filtering**: Predefined templates, custom filters, favorites

---

## Database Schema

### Table: `defects`

Primary table storing all defect information.

```sql
CREATE TABLE defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Defect Identity
    defect_number VARCHAR(10) NOT NULL,           -- Sequential: "00001", "00002"
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    description TEXT,

    -- Classification
    type VARCHAR(50) DEFAULT 'Functional',        -- Functional, UI/Visual, Performance, Security, Usability, Compatibility, Other
    severity VARCHAR(20) DEFAULT 'Medium',        -- Low, Medium, High, Critical
    priority VARCHAR(10) DEFAULT 'P2',            -- P1, P2, P3, P4
    status VARCHAR(50) DEFAULT 'Open',            -- Open, In Progress, Fixed, Closed, Retest, Rejected, Resolved, Reopened
    tags TEXT[] DEFAULT '{}',                     -- Array of tags

    -- Ownership
    owner VARCHAR(255),
    created_by VARCHAR(255),

    -- Dates
    date_created DATE DEFAULT CURRENT_DATE,
    date_opened TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Auto-Generation Flag
    is_auto_generated BOOLEAN DEFAULT FALSE,

    -- Folder/Group Organization
    folder_id UUID REFERENCES defect_folders(id) ON DELETE SET NULL,
    group_name VARCHAR(255),                      -- Group within folder (e.g., "Auto-Generated")

    -- Metadata
    notes TEXT,
    recording_folder VARCHAR(1000),
    results_folder VARCHAR(1000),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, defect_number)
);

-- Indexes
CREATE INDEX idx_defects_user_id ON defects(user_id);
CREATE INDEX idx_defects_status ON defects(status);
CREATE INDEX idx_defects_severity ON defects(severity);
CREATE INDEX idx_defects_priority ON defects(priority);
CREATE INDEX idx_defects_type ON defects(type);
CREATE INDEX idx_defects_date_created ON defects(date_created);
CREATE INDEX idx_defects_folder_id ON defects(folder_id);
CREATE INDEX idx_defects_tags ON defects USING GIN(tags);
CREATE INDEX idx_defects_title_search ON defects USING GIN(to_tsvector('english', title));

-- Trigger for updated_at
CREATE TRIGGER update_defects_timestamp
    BEFORE UPDATE ON defects
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

### Table: `defect_folders`

Hierarchical folder structure for organizing defects.

```sql
CREATE TABLE defect_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Folder Info
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES defect_folders(id) ON DELETE CASCADE,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, parent_id, name)
);

CREATE INDEX idx_defect_folders_user ON defect_folders(user_id);
CREATE INDEX idx_defect_folders_parent ON defect_folders(parent_id);
```

### Table: `defect_test_context`

Stores test execution context for auto-generated defects.

```sql
CREATE TABLE defect_test_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- Browser/Environment
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    viewport VARCHAR(50),                          -- "1920x1080"
    screen_resolution VARCHAR(50),
    user_agent TEXT,

    -- Test References
    initial_url TEXT,
    test_case VARCHAR(500),
    test_case_path TEXT[],                         -- Array: ["ROOT", "Folder", "TestName"]
    test_run_name VARCHAR(255),
    execution_timestamp TIMESTAMP WITH TIME ZONE,

    -- Failure Details
    failed_step_number INTEGER,
    total_steps INTEGER,
    failed_action VARCHAR(100),
    failed_step_description TEXT,
    element_selector TEXT,
    element_html TEXT,

    -- Results
    expected_result TEXT,
    actual_result TEXT,
    expected_result_readable TEXT,
    actual_result_readable TEXT,
    step_error_message TEXT,
    playwright_code TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(defect_id)
);

CREATE INDEX idx_defect_test_context_defect ON defect_test_context(defect_id);
```

### Table: `defect_steps`

Stores steps to reproduce (structured format).

```sql
CREATE TABLE defect_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- Step Info
    step_number INTEGER NOT NULL,
    action VARCHAR(100),                           -- navigate, click, type, select_option, etc.
    description TEXT NOT NULL,
    status VARCHAR(20),                            -- passed, failed, skipped
    duration_ms DECIMAL(10, 2),

    -- Error Info (for failed steps)
    error_message TEXT,

    -- Code Reference
    playwright_code TEXT,
    window_id VARCHAR(50),

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(defect_id, step_number)
);

CREATE INDEX idx_defect_steps_defect ON defect_steps(defect_id);
CREATE INDEX idx_defect_steps_status ON defect_steps(status);
```

### Table: `defect_screenshots`

Stores screenshot references and metadata.

```sql
CREATE TABLE defect_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
    step_id UUID REFERENCES defect_steps(id) ON DELETE SET NULL,

    -- File Info
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000),                       -- S3 key or storage path
    file_size_bytes BIGINT,
    mime_type VARCHAR(100) DEFAULT 'image/png',

    -- Screenshot Type
    screenshot_type VARCHAR(50) DEFAULT 'step',    -- step, failure, attachment, full_page

    -- Metadata
    step_number INTEGER,
    is_failed_step BOOLEAN DEFAULT FALSE,
    caption TEXT,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_defect_screenshots_defect ON defect_screenshots(defect_id);
CREATE INDEX idx_defect_screenshots_step ON defect_screenshots(step_id);
CREATE INDEX idx_defect_screenshots_type ON defect_screenshots(screenshot_type);
```

### Table: `defect_attachments`

Stores non-screenshot attachments (videos, HAR files, logs).

```sql
CREATE TABLE defect_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- File Info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(1000),                       -- S3 key or storage path
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Attachment Type
    attachment_type VARCHAR(50),                   -- video, har, log, trace, other

    -- Metadata
    description TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_defect_attachments_defect ON defect_attachments(defect_id);
CREATE INDEX idx_defect_attachments_type ON defect_attachments(attachment_type);
```

### Table: `defect_console_errors`

Stores console errors captured during test execution.

```sql
CREATE TABLE defect_console_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- Error Info
    level VARCHAR(20) NOT NULL,                    -- error, warning, info, log
    message TEXT NOT NULL,
    source TEXT,
    line_number INTEGER,
    stack_trace TEXT,

    -- Context
    timestamp TIMESTAMP WITH TIME ZONE,
    step_index INTEGER,
    formatted_message TEXT,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_defect_console_errors_defect ON defect_console_errors(defect_id);
CREATE INDEX idx_defect_console_errors_level ON defect_console_errors(level);
```

### Table: `defect_network_errors`

Stores network errors captured during test execution.

```sql
CREATE TABLE defect_network_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- Request Info
    url TEXT NOT NULL,
    method VARCHAR(20),
    status_code INTEGER,
    status_message VARCHAR(255),

    -- Error Details
    error_message TEXT,

    -- Timestamps
    request_timestamp TIMESTAMP WITH TIME ZONE,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_defect_network_errors_defect ON defect_network_errors(defect_id);
CREATE INDEX idx_defect_network_errors_status ON defect_network_errors(status_code);
```

### Table: `defect_external_references`

Stores links to external issue tracking systems.

```sql
CREATE TABLE defect_external_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL REFERENCES defects(id) ON DELETE CASCADE,

    -- External System
    system VARCHAR(50) NOT NULL,                   -- jira, azure_devops, custom

    -- Reference Info
    external_key VARCHAR(100),                     -- "JIRA-123", "BUG-456"
    external_id VARCHAR(255),                      -- Internal ID in external system
    external_url TEXT,                             -- Direct link to issue

    -- Sync Status
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status VARCHAR(50) DEFAULT 'synced',      -- synced, pending, failed
    last_sync_error TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(defect_id, system)
);

CREATE INDEX idx_defect_external_refs_defect ON defect_external_references(defect_id);
CREATE INDEX idx_defect_external_refs_system ON defect_external_references(system);
CREATE INDEX idx_defect_external_refs_key ON defect_external_references(external_key);
```

### Table: `defect_filters`

Stores user-created filters.

```sql
CREATE TABLE defect_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Filter Identity
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),                              -- Emoji icon

    -- Filter Conditions (JSONB for flexibility)
    conditions JSONB NOT NULL DEFAULT '[]',

    -- Flags
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,

    -- Usage Tracking
    use_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, name)
);

CREATE INDEX idx_defect_filters_user ON defect_filters(user_id);
CREATE INDEX idx_defect_filters_favorite ON defect_filters(is_favorite);
CREATE INDEX idx_defect_filters_default ON defect_filters(is_default);
```

### Table: `defect_filter_templates`

Stores predefined filter templates available to all users.

```sql
CREATE TABLE defect_filter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),

    -- Template Conditions
    conditions JSONB NOT NULL DEFAULT '[]',

    -- Categorization
    category VARCHAR(100),                         -- "severity", "status", "date", "type"

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Active Flag
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(name)
);
```

### Table: `defect_counter`

Tracks sequential defect numbering per user.

```sql
CREATE TABLE defect_counter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Counter Value
    counter INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id)
);

CREATE INDEX idx_defect_counter_user ON defect_counter(user_id);
```

---

## API Endpoints

### Base URL
```
/api/v1/defects
```

---

## Defect CRUD Operations

### 1. List Defects

Retrieves all defects for the authenticated user with optional filtering.

#### Endpoint
```
GET /api/v1/defects
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| filter_id | UUID | Apply saved filter |
| status | string | Filter by status |
| severity | string | Filter by severity |
| priority | string | Filter by priority |
| type | string | Filter by type |
| tags | string[] | Filter by tags (comma-separated) |
| folder_id | UUID | Filter by folder |
| search | string | Full-text search |
| date_from | date | Created after date |
| date_to | date | Created before date |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 50, max: 200) |
| sort_by | string | Sort field (default: date_created) |
| sort_order | string | asc or desc (default: desc) |

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "defects": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "defect_number": "00001",
                "title": "Login button not responding on mobile",
                "summary": "The login button fails to respond to touch events on iOS Safari",
                "type": "UI/Visual",
                "severity": "High",
                "priority": "P1",
                "status": "Open",
                "tags": ["mobile", "iOS", "regression"],
                "owner": "john.doe",
                "created_by": "user@example.com",
                "date_created": "2026-01-15",
                "date_opened": "2026-01-15T10:30:00Z",
                "is_auto_generated": false,
                "folder_id": "550e8400-e29b-41d4-a716-446655440001",
                "group_name": null,
                "screenshot_count": 3,
                "has_external_reference": true,
                "external_reference": {
                    "system": "jira",
                    "key": "PROJ-123",
                    "url": "https://company.atlassian.net/browse/PROJ-123"
                },
                "created_at": "2026-01-15T10:30:00Z",
                "updated_at": "2026-01-15T14:20:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "per_page": 50,
            "total_items": 156,
            "total_pages": 4
        },
        "statistics": {
            "total": 156,
            "open": 45,
            "in_progress": 23,
            "closed": 88
        }
    }
}
```

---

### 2. Get Single Defect

Retrieves a single defect with all related data.

#### Endpoint
```
GET /api/v1/defects/{defect_id}
```

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "defect_number": "00001",
        "title": "Login button not responding on mobile",
        "summary": "The login button fails to respond to touch events on iOS Safari",
        "description": "## Problem\nWhen accessing the login page on iOS Safari...\n\n## Impact\nUsers cannot log in on mobile devices.",
        "type": "UI/Visual",
        "severity": "High",
        "priority": "P1",
        "status": "Open",
        "tags": ["mobile", "iOS", "regression"],
        "owner": "john.doe",
        "created_by": "user@example.com",
        "date_created": "2026-01-15",
        "date_opened": "2026-01-15T10:30:00Z",
        "is_auto_generated": true,
        "folder_id": "550e8400-e29b-41d4-a716-446655440001",
        "group_name": "Auto-Generated",
        "notes": "Needs investigation with dev team",

        "test_context": {
            "browser": "Safari",
            "browser_version": "17.2",
            "os": "iOS",
            "os_version": "17.2",
            "viewport": "390x844",
            "screen_resolution": "1170x2532",
            "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)...",
            "initial_url": "https://app.example.com/login",
            "test_case": "ROOT/Mobile/LoginTest",
            "test_case_path": ["ROOT", "Mobile", "LoginTest"],
            "test_run_name": "Mobile Regression",
            "execution_timestamp": "2026-01-15T10:25:00Z",
            "failed_step_number": 5,
            "total_steps": 12,
            "failed_action": "click",
            "failed_step_description": "Click login button",
            "element_selector": "#login-btn",
            "element_html": "<button id=\"login-btn\" class=\"btn-primary\">Login</button>",
            "expected_result": "User should be logged in",
            "actual_result": "Button did not respond to click",
            "step_error_message": "Element not clickable at point (195, 422)"
        },

        "steps": [
            {
                "id": "step-uuid-1",
                "step_number": 1,
                "action": "navigate",
                "description": "Navigate to https://app.example.com/login",
                "status": "passed",
                "duration_ms": 2150.5,
                "screenshot_url": "https://storage.example.com/screenshots/step_0001.png"
            },
            {
                "id": "step-uuid-5",
                "step_number": 5,
                "action": "click",
                "description": "Click login button",
                "status": "failed",
                "duration_ms": 30000.0,
                "error_message": "Element not clickable at point (195, 422)",
                "playwright_code": "page.click('#login-btn')",
                "screenshot_url": "https://storage.example.com/screenshots/step_0005.png"
            }
        ],

        "screenshots": [
            {
                "id": "screenshot-uuid-1",
                "filename": "step_0001.png",
                "url": "https://storage.example.com/screenshots/step_0001.png",
                "screenshot_type": "step",
                "step_number": 1,
                "is_failed_step": false
            },
            {
                "id": "screenshot-uuid-5",
                "filename": "step_0005.png",
                "url": "https://storage.example.com/screenshots/step_0005.png",
                "screenshot_type": "failure",
                "step_number": 5,
                "is_failed_step": true
            }
        ],

        "attachments": [
            {
                "id": "attachment-uuid-1",
                "filename": "test_video.mp4",
                "url": "https://storage.example.com/attachments/test_video.mp4",
                "attachment_type": "video",
                "file_size_bytes": 15234567,
                "mime_type": "video/mp4"
            }
        ],

        "console_errors": [
            {
                "id": "console-uuid-1",
                "level": "error",
                "message": "Uncaught TypeError: Cannot read property 'click' of null",
                "source": "https://app.example.com/js/app.js",
                "line_number": 156,
                "stack_trace": "at HTMLButtonElement.<anonymous>...",
                "timestamp": "2026-01-15T10:25:30Z",
                "step_index": 5
            }
        ],

        "network_errors": [
            {
                "id": "network-uuid-1",
                "url": "https://api.example.com/auth/token",
                "method": "POST",
                "status_code": 500,
                "status_message": "Internal Server Error",
                "request_timestamp": "2026-01-15T10:25:28Z"
            }
        ],

        "external_reference": {
            "system": "jira",
            "external_key": "PROJ-123",
            "external_id": "10234",
            "external_url": "https://company.atlassian.net/browse/PROJ-123",
            "synced_at": "2026-01-15T10:35:00Z",
            "sync_status": "synced"
        },

        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-15T14:20:00Z"
    }
}
```

---

### 3. Create Defect

Creates a new defect.

#### Endpoint
```
POST /api/v1/defects
```

#### Request Body
```json
{
    "title": "Login button not responding on mobile",
    "summary": "The login button fails to respond to touch events",
    "description": "## Problem\nWhen accessing the login page...",
    "type": "UI/Visual",
    "severity": "High",
    "priority": "P1",
    "status": "Open",
    "tags": ["mobile", "iOS", "regression"],
    "owner": "john.doe",
    "folder_id": "550e8400-e29b-41d4-a716-446655440001",
    "group_name": null,
    "notes": "",

    "test_context": {
        "browser": "Safari",
        "browser_version": "17.2",
        "os": "iOS",
        "os_version": "17.2",
        "viewport": "390x844",
        "initial_url": "https://app.example.com/login",
        "test_case": "ROOT/Mobile/LoginTest",
        "test_case_path": ["ROOT", "Mobile", "LoginTest"],
        "test_run_name": "Mobile Regression",
        "failed_step_number": 5,
        "total_steps": 12,
        "failed_action": "click",
        "failed_step_description": "Click login button",
        "expected_result": "User should be logged in",
        "actual_result": "Button did not respond"
    },

    "steps": [
        {
            "step_number": 1,
            "action": "navigate",
            "description": "Navigate to login page",
            "status": "passed",
            "duration_ms": 2150.5
        },
        {
            "step_number": 5,
            "action": "click",
            "description": "Click login button",
            "status": "failed",
            "duration_ms": 30000.0,
            "error_message": "Element not clickable"
        }
    ],

    "console_errors": [
        {
            "level": "error",
            "message": "TypeError: Cannot read property...",
            "source": "app.js",
            "line_number": 156
        }
    ],

    "network_errors": [
        {
            "url": "https://api.example.com/auth",
            "method": "POST",
            "status_code": 500
        }
    ]
}
```

#### Response (201 Created)
```json
{
    "success": true,
    "message": "Defect created successfully",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "defect_number": "00042",
        "upload_urls": {
            "screenshots": [
                {
                    "step_number": 1,
                    "upload_url": "https://storage.example.com/upload?token=xxx",
                    "screenshot_id": "screenshot-uuid-1"
                },
                {
                    "step_number": 5,
                    "upload_url": "https://storage.example.com/upload?token=yyy",
                    "screenshot_id": "screenshot-uuid-5"
                }
            ],
            "attachments": [
                {
                    "upload_url": "https://storage.example.com/upload?token=zzz",
                    "attachment_id": "attachment-uuid-1"
                }
            ]
        }
    }
}
```

---

### 4. Update Defect

Updates an existing defect.

#### Endpoint
```
PUT /api/v1/defects/{defect_id}
```

#### Request Body
```json
{
    "title": "Updated title",
    "severity": "Critical",
    "priority": "P1",
    "status": "In Progress",
    "tags": ["mobile", "iOS", "regression", "urgent"],
    "owner": "jane.doe",
    "notes": "Escalated to dev team"
}
```

#### Response (200 OK)
```json
{
    "success": true,
    "message": "Defect updated successfully",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "defect_number": "00042",
        "updated_at": "2026-01-15T15:00:00Z"
    }
}
```

---

### 5. Delete Defect

Deletes a defect and all related data.

#### Endpoint
```
DELETE /api/v1/defects/{defect_id}
```

#### Response (200 OK)
```json
{
    "success": true,
    "message": "Defect deleted successfully"
}
```

---

### 6. Batch Update Defects

Updates multiple defects at once.

#### Endpoint
```
PATCH /api/v1/defects/batch
```

#### Request Body
```json
{
    "defect_ids": [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
    ],
    "updates": {
        "status": "Closed",
        "tags_add": ["resolved"],
        "tags_remove": ["urgent"]
    }
}
```

#### Response (200 OK)
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

### 7. Batch Delete Defects

Deletes multiple defects at once.

#### Endpoint
```
DELETE /api/v1/defects/batch
```

#### Request Body
```json
{
    "defect_ids": [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001"
    ]
}
```

#### Response (200 OK)
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

## Screenshot & Attachment Operations

### 8. Upload Screenshot

Uploads a screenshot for a defect step.

#### Endpoint
```
POST /api/v1/defects/{defect_id}/screenshots
```

#### Request (multipart/form-data)
| Field | Type | Description |
|-------|------|-------------|
| file | File | Screenshot file (PNG/JPG) |
| step_number | integer | Step number |
| screenshot_type | string | step, failure, full_page, attachment |
| is_failed_step | boolean | Whether this is the failed step |
| caption | string | Optional caption |

#### Response (201 Created)
```json
{
    "success": true,
    "data": {
        "id": "screenshot-uuid-1",
        "filename": "step_0005.png",
        "url": "https://storage.example.com/screenshots/step_0005.png",
        "step_number": 5,
        "screenshot_type": "failure"
    }
}
```

---

### 9. Upload Attachment

Uploads an attachment (video, HAR, log, trace).

#### Endpoint
```
POST /api/v1/defects/{defect_id}/attachments
```

#### Request (multipart/form-data)
| Field | Type | Description |
|-------|------|-------------|
| file | File | Attachment file |
| attachment_type | string | video, har, log, trace, other |
| description | string | Optional description |

#### Response (201 Created)
```json
{
    "success": true,
    "data": {
        "id": "attachment-uuid-1",
        "filename": "test_recording.mp4",
        "url": "https://storage.example.com/attachments/test_recording.mp4",
        "attachment_type": "video",
        "file_size_bytes": 15234567
    }
}
```

---

### 10. Delete Screenshot

#### Endpoint
```
DELETE /api/v1/defects/{defect_id}/screenshots/{screenshot_id}
```

---

### 11. Delete Attachment

#### Endpoint
```
DELETE /api/v1/defects/{defect_id}/attachments/{attachment_id}
```

---

## Folder Operations

### 12. List Folders

#### Endpoint
```
GET /api/v1/defects/folders
```

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "folders": [
            {
                "id": "folder-uuid-1",
                "name": "ROOT",
                "parent_id": null,
                "defect_count": 45,
                "children": [
                    {
                        "id": "folder-uuid-2",
                        "name": "Auto-Generated",
                        "parent_id": "folder-uuid-1",
                        "defect_count": 23,
                        "children": []
                    },
                    {
                        "id": "folder-uuid-3",
                        "name": "Mobile Tests",
                        "parent_id": "folder-uuid-1",
                        "defect_count": 12,
                        "children": []
                    }
                ]
            }
        ]
    }
}
```

---

### 13. Create Folder

#### Endpoint
```
POST /api/v1/defects/folders
```

#### Request Body
```json
{
    "name": "Regression Tests",
    "parent_id": "folder-uuid-1"
}
```

---

### 14. Update Folder

#### Endpoint
```
PUT /api/v1/defects/folders/{folder_id}
```

---

### 15. Delete Folder

#### Endpoint
```
DELETE /api/v1/defects/folders/{folder_id}
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| cascade | boolean | Delete defects in folder (default: false, moves to root) |

---

## Filter Operations

### 16. List Filters

#### Endpoint
```
GET /api/v1/defects/filters
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| include_system | boolean | Include system filters (default: true) |
| favorites_only | boolean | Only favorites (default: false) |

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "filters": [
            {
                "id": "filter-uuid-1",
                "name": "Critical Open Defects",
                "description": "All critical severity defects that are open",
                "icon": "🔴",
                "conditions": [
                    {
                        "field": "severity",
                        "operator": "equals",
                        "value": "Critical"
                    },
                    {
                        "field": "status",
                        "operator": "equals",
                        "value": "Open"
                    }
                ],
                "is_default": false,
                "is_system": false,
                "is_favorite": true,
                "use_count": 45,
                "last_used": "2026-01-15T10:30:00Z",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ],
        "default_filter_id": "filter-uuid-all"
    }
}
```

---

### 17. Create Filter

#### Endpoint
```
POST /api/v1/defects/filters
```

#### Request Body
```json
{
    "name": "My Custom Filter",
    "description": "Filters high priority bugs from last week",
    "icon": "🎯",
    "conditions": [
        {
            "field": "priority",
            "operator": "is_one_of",
            "value": ["P1", "P2"]
        },
        {
            "field": "date_created",
            "operator": "in_last_days",
            "value": 7
        }
    ],
    "is_default": false,
    "is_favorite": false
}
```

---

### 18. Update Filter

#### Endpoint
```
PUT /api/v1/defects/filters/{filter_id}
```

---

### 19. Delete Filter

#### Endpoint
```
DELETE /api/v1/defects/filters/{filter_id}
```

---

### 20. Set Default Filter

#### Endpoint
```
POST /api/v1/defects/filters/{filter_id}/set-default
```

---

### 21. Toggle Favorite Filter

#### Endpoint
```
POST /api/v1/defects/filters/{filter_id}/toggle-favorite
```

---

### 22. Track Filter Usage

#### Endpoint
```
POST /api/v1/defects/filters/{filter_id}/track-usage
```

Updates `use_count` and `last_used` timestamp.

---

### 23. Import Filters

#### Endpoint
```
POST /api/v1/defects/filters/import
```

#### Request Body
```json
{
    "filters": [
        {
            "name": "Imported Filter",
            "conditions": [...]
        }
    ],
    "overwrite_existing": false
}
```

---

### 24. Export Filters

#### Endpoint
```
GET /api/v1/defects/filters/export
```

Returns all user filters in a portable format.

---

## Filter Templates

### 25. List Filter Templates

#### Endpoint
```
GET /api/v1/defects/filter-templates
```

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "templates": [
            {
                "id": "template-uuid-1",
                "name": "Critical Open Defects",
                "description": "Filter for critical severity open issues",
                "icon": "🔴",
                "category": "severity",
                "conditions": [
                    {
                        "field": "severity",
                        "operator": "equals",
                        "value": "Critical"
                    },
                    {
                        "field": "status",
                        "operator": "equals",
                        "value": "Open"
                    }
                ]
            },
            {
                "id": "template-uuid-2",
                "name": "High Priority Issues",
                "description": "P1 and P2 priority defects",
                "icon": "⚡",
                "category": "priority",
                "conditions": [
                    {
                        "field": "priority",
                        "operator": "is_one_of",
                        "value": ["P1", "P2"]
                    }
                ]
            },
            {
                "id": "template-uuid-3",
                "name": "Recent Defects",
                "description": "Defects created in the last 7 days",
                "icon": "📅",
                "category": "date",
                "conditions": [
                    {
                        "field": "date_created",
                        "operator": "in_last_days",
                        "value": 7
                    }
                ]
            },
            {
                "id": "template-uuid-4",
                "name": "UI/Visual Defects",
                "description": "All UI and visual issues",
                "icon": "🎨",
                "category": "type",
                "conditions": [
                    {
                        "field": "type",
                        "operator": "equals",
                        "value": "UI/Visual"
                    }
                ]
            },
            {
                "id": "template-uuid-5",
                "name": "Open Regression Issues",
                "description": "Open defects tagged as regression",
                "icon": "🔄",
                "category": "tags",
                "conditions": [
                    {
                        "field": "tags",
                        "operator": "has_any_of",
                        "value": ["regression", "Regression"]
                    },
                    {
                        "field": "status",
                        "operator": "equals",
                        "value": "Open"
                    }
                ]
            },
            {
                "id": "template-uuid-6",
                "name": "Performance Issues",
                "description": "Performance-related defects",
                "icon": "⏱️",
                "category": "type",
                "conditions": [
                    {
                        "field": "type",
                        "operator": "equals",
                        "value": "Performance"
                    }
                ]
            },
            {
                "id": "template-uuid-7",
                "name": "Security Vulnerabilities",
                "description": "Security-related defects",
                "icon": "🔒",
                "category": "type",
                "conditions": [
                    {
                        "field": "type",
                        "operator": "equals",
                        "value": "Security"
                    }
                ]
            },
            {
                "id": "template-uuid-8",
                "name": "In Progress Work",
                "description": "Defects currently being worked on",
                "icon": "🔧",
                "category": "status",
                "conditions": [
                    {
                        "field": "status",
                        "operator": "equals",
                        "value": "In Progress"
                    }
                ]
            }
        ]
    }
}
```

---

### 26. Create Filter from Template

#### Endpoint
```
POST /api/v1/defects/filters/from-template/{template_id}
```

#### Request Body (optional customization)
```json
{
    "name": "My Critical Issues",
    "is_favorite": true
}
```

---

## External Integration

### 27. Sync Defect to External System

#### Endpoint
```
POST /api/v1/defects/{defect_id}/sync
```

#### Request Body
```json
{
    "system": "jira",
    "include_screenshots": true,
    "max_screenshots": 5
}
```

#### Response (200 OK)
```json
{
    "success": true,
    "message": "Defect synced to Jira successfully",
    "data": {
        "external_reference": {
            "system": "jira",
            "external_key": "PROJ-456",
            "external_id": "10567",
            "external_url": "https://company.atlassian.net/browse/PROJ-456",
            "synced_at": "2026-01-15T11:00:00Z"
        }
    }
}
```

---

### 28. Get External Sync Status

#### Endpoint
```
GET /api/v1/defects/{defect_id}/sync-status
```

---

## Statistics & Analytics

### 29. Get Defect Statistics

#### Endpoint
```
GET /api/v1/defects/statistics
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| date_from | date | Start date |
| date_to | date | End date |
| folder_id | UUID | Filter by folder |

#### Response (200 OK)
```json
{
    "success": true,
    "data": {
        "total": 156,
        "by_status": {
            "Open": 45,
            "In Progress": 23,
            "Fixed": 12,
            "Closed": 76
        },
        "by_severity": {
            "Critical": 8,
            "High": 34,
            "Medium": 67,
            "Low": 47
        },
        "by_priority": {
            "P1": 12,
            "P2": 45,
            "P3": 56,
            "P4": 43
        },
        "by_type": {
            "Functional": 78,
            "UI/Visual": 34,
            "Performance": 12,
            "Security": 5,
            "Other": 27
        },
        "trends": {
            "created_last_7_days": 23,
            "closed_last_7_days": 18,
            "created_last_30_days": 67,
            "closed_last_30_days": 54
        },
        "auto_generated_count": 89
    }
}
```

---

## Export Operations

### 30. Export Defects to CSV

#### Endpoint
```
GET /api/v1/defects/export/csv
```

#### Query Parameters
Same as List Defects endpoint for filtering.

---

### 31. Export Defects to JSON

#### Endpoint
```
GET /api/v1/defects/export/json
```

---

## Pydantic Models

### Request Models

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Literal
from datetime import date, datetime
from uuid import UUID
from enum import Enum


# ==================== ENUMS ====================

class DefectType(str, Enum):
    FUNCTIONAL = "Functional"
    UI_VISUAL = "UI/Visual"
    PERFORMANCE = "Performance"
    SECURITY = "Security"
    USABILITY = "Usability"
    COMPATIBILITY = "Compatibility"
    OTHER = "Other"


class DefectSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class DefectPriority(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class DefectStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    FIXED = "Fixed"
    CLOSED = "Closed"
    RETEST = "Retest"
    REJECTED = "Rejected"
    RESOLVED = "Resolved"
    REOPENED = "Reopened"


class StepStatus(str, Enum):
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"


class ScreenshotType(str, Enum):
    STEP = "step"
    FAILURE = "failure"
    FULL_PAGE = "full_page"
    ATTACHMENT = "attachment"


class AttachmentType(str, Enum):
    VIDEO = "video"
    HAR = "har"
    LOG = "log"
    TRACE = "trace"
    OTHER = "other"


class ConsoleErrorLevel(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    LOG = "log"


class FilterOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    IS_ONE_OF = "is_one_of"
    HAS_ANY_OF = "has_any_of"
    HAS_ALL_OF = "has_all_of"
    HAS_NONE_OF = "has_none_of"
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"
    BEFORE = "before"
    AFTER = "after"
    BETWEEN = "between"
    IN_LAST_DAYS = "in_last_days"


class FilterField(str, Enum):
    PRIORITY = "priority"
    SEVERITY = "severity"
    STATUS = "status"
    TYPE = "type"
    TAGS = "tags"
    DATE_CREATED = "date_created"
    DATE_OPENED = "date_opened"


class ExternalSystem(str, Enum):
    JIRA = "jira"
    AZURE_DEVOPS = "azure_devops"
    CUSTOM = "custom"


# ==================== TEST CONTEXT ====================

class TestContextCreate(BaseModel):
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    viewport: Optional[str] = None
    screen_resolution: Optional[str] = None
    user_agent: Optional[str] = None
    initial_url: Optional[str] = None
    test_case: Optional[str] = None
    test_case_path: Optional[List[str]] = None
    test_run_name: Optional[str] = None
    execution_timestamp: Optional[datetime] = None
    failed_step_number: Optional[int] = None
    total_steps: Optional[int] = None
    failed_action: Optional[str] = None
    failed_step_description: Optional[str] = None
    element_selector: Optional[str] = None
    element_html: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    expected_result_readable: Optional[str] = None
    actual_result_readable: Optional[str] = None
    step_error_message: Optional[str] = None
    playwright_code: Optional[str] = None


# ==================== STEPS ====================

class DefectStepCreate(BaseModel):
    step_number: int = Field(..., ge=1)
    action: Optional[str] = None
    description: str
    status: Optional[StepStatus] = None
    duration_ms: Optional[float] = Field(None, ge=0)
    error_message: Optional[str] = None
    playwright_code: Optional[str] = None
    window_id: Optional[str] = None


# ==================== CONSOLE/NETWORK ERRORS ====================

class ConsoleErrorCreate(BaseModel):
    level: ConsoleErrorLevel
    message: str
    source: Optional[str] = None
    line_number: Optional[int] = None
    stack_trace: Optional[str] = None
    timestamp: Optional[datetime] = None
    step_index: Optional[int] = None
    formatted_message: Optional[str] = None


class NetworkErrorCreate(BaseModel):
    url: str
    method: Optional[str] = None
    status_code: Optional[int] = None
    status_message: Optional[str] = None
    error_message: Optional[str] = None
    request_timestamp: Optional[datetime] = None


# ==================== DEFECT CRUD ====================

class DefectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    summary: Optional[str] = None
    description: Optional[str] = None
    type: Optional[DefectType] = DefectType.FUNCTIONAL
    severity: Optional[DefectSeverity] = DefectSeverity.MEDIUM
    priority: Optional[DefectPriority] = DefectPriority.P2
    status: Optional[DefectStatus] = DefectStatus.OPEN
    tags: Optional[List[str]] = []
    owner: Optional[str] = None
    folder_id: Optional[UUID] = None
    group_name: Optional[str] = None
    notes: Optional[str] = None
    is_auto_generated: Optional[bool] = False

    # Related data
    test_context: Optional[TestContextCreate] = None
    steps: Optional[List[DefectStepCreate]] = None
    console_errors: Optional[List[ConsoleErrorCreate]] = None
    network_errors: Optional[List[NetworkErrorCreate]] = None


class DefectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    summary: Optional[str] = None
    description: Optional[str] = None
    type: Optional[DefectType] = None
    severity: Optional[DefectSeverity] = None
    priority: Optional[DefectPriority] = None
    status: Optional[DefectStatus] = None
    tags: Optional[List[str]] = None
    owner: Optional[str] = None
    folder_id: Optional[UUID] = None
    group_name: Optional[str] = None
    notes: Optional[str] = None


class DefectBatchUpdate(BaseModel):
    defect_ids: List[UUID]
    updates: Dict[str, Any]

    @validator('updates')
    def validate_updates(cls, v):
        allowed_fields = ['status', 'severity', 'priority', 'owner', 'tags_add', 'tags_remove']
        for field in v.keys():
            if field not in allowed_fields:
                raise ValueError(f'Field {field} not allowed in batch update')
        return v


class DefectBatchDelete(BaseModel):
    defect_ids: List[UUID]


# ==================== FOLDERS ====================

class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_id: Optional[UUID] = None


class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    parent_id: Optional[UUID] = None


# ==================== FILTERS ====================

class FilterCondition(BaseModel):
    field: FilterField
    operator: FilterOperator
    value: Any

    @validator('value')
    def validate_value_for_operator(cls, v, values):
        operator = values.get('operator')
        if operator in [FilterOperator.IS_EMPTY, FilterOperator.IS_NOT_EMPTY]:
            return None
        if operator == FilterOperator.IN_LAST_DAYS:
            if not isinstance(v, int) or v < 1:
                raise ValueError('in_last_days requires positive integer')
        if operator == FilterOperator.BETWEEN:
            if not isinstance(v, list) or len(v) != 2:
                raise ValueError('between requires array of 2 values')
        return v


class FilterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=10)
    conditions: List[FilterCondition]
    is_default: Optional[bool] = False
    is_favorite: Optional[bool] = False


class FilterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=10)
    conditions: Optional[List[FilterCondition]] = None
    is_default: Optional[bool] = None
    is_favorite: Optional[bool] = None


class FilterImport(BaseModel):
    filters: List[FilterCreate]
    overwrite_existing: Optional[bool] = False


# ==================== SCREENSHOTS & ATTACHMENTS ====================

class ScreenshotCreate(BaseModel):
    step_number: Optional[int] = None
    screenshot_type: Optional[ScreenshotType] = ScreenshotType.STEP
    is_failed_step: Optional[bool] = False
    caption: Optional[str] = None


class AttachmentCreate(BaseModel):
    attachment_type: Optional[AttachmentType] = AttachmentType.OTHER
    description: Optional[str] = None


# ==================== EXTERNAL SYNC ====================

class ExternalSyncRequest(BaseModel):
    system: ExternalSystem
    include_screenshots: Optional[bool] = True
    max_screenshots: Optional[int] = Field(5, ge=1, le=20)


# ==================== QUERY PARAMETERS ====================

class DefectListQuery(BaseModel):
    filter_id: Optional[UUID] = None
    status: Optional[DefectStatus] = None
    severity: Optional[DefectSeverity] = None
    priority: Optional[DefectPriority] = None
    type: Optional[DefectType] = None
    tags: Optional[List[str]] = None
    folder_id: Optional[UUID] = None
    search: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    page: Optional[int] = Field(1, ge=1)
    per_page: Optional[int] = Field(50, ge=1, le=200)
    sort_by: Optional[str] = "date_created"
    sort_order: Optional[str] = "desc"
```

### Response Models

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID


class PaginationInfo(BaseModel):
    page: int
    per_page: int
    total_items: int
    total_pages: int


class DefectStatistics(BaseModel):
    total: int
    open: int
    in_progress: int
    closed: int


class ExternalReferenceResponse(BaseModel):
    system: str
    external_key: str
    external_id: Optional[str]
    external_url: str
    synced_at: datetime
    sync_status: str


class DefectListItem(BaseModel):
    id: UUID
    defect_number: str
    title: str
    type: str
    severity: str
    priority: str
    status: str
    tags: List[str]
    owner: Optional[str]
    created_by: Optional[str]
    date_created: date
    date_opened: datetime
    is_auto_generated: bool
    folder_id: Optional[UUID]
    group_name: Optional[str]
    screenshot_count: int
    has_external_reference: bool
    external_reference: Optional[ExternalReferenceResponse]
    created_at: datetime
    updated_at: datetime


class DefectListResponse(BaseModel):
    success: bool
    data: Dict[str, Any]  # Contains defects, pagination, statistics


class TestContextResponse(BaseModel):
    browser: Optional[str]
    browser_version: Optional[str]
    os: Optional[str]
    os_version: Optional[str]
    viewport: Optional[str]
    screen_resolution: Optional[str]
    user_agent: Optional[str]
    initial_url: Optional[str]
    test_case: Optional[str]
    test_case_path: Optional[List[str]]
    test_run_name: Optional[str]
    execution_timestamp: Optional[datetime]
    failed_step_number: Optional[int]
    total_steps: Optional[int]
    failed_action: Optional[str]
    failed_step_description: Optional[str]
    element_selector: Optional[str]
    element_html: Optional[str]
    expected_result: Optional[str]
    actual_result: Optional[str]
    expected_result_readable: Optional[str]
    actual_result_readable: Optional[str]
    step_error_message: Optional[str]
    playwright_code: Optional[str]


class DefectStepResponse(BaseModel):
    id: UUID
    step_number: int
    action: Optional[str]
    description: str
    status: Optional[str]
    duration_ms: Optional[float]
    error_message: Optional[str]
    playwright_code: Optional[str]
    screenshot_url: Optional[str]


class ScreenshotResponse(BaseModel):
    id: UUID
    filename: str
    url: str
    screenshot_type: str
    step_number: Optional[int]
    is_failed_step: bool


class AttachmentResponse(BaseModel):
    id: UUID
    filename: str
    url: str
    attachment_type: str
    file_size_bytes: int
    mime_type: Optional[str]


class ConsoleErrorResponse(BaseModel):
    id: UUID
    level: str
    message: str
    source: Optional[str]
    line_number: Optional[int]
    stack_trace: Optional[str]
    timestamp: Optional[datetime]
    step_index: Optional[int]


class NetworkErrorResponse(BaseModel):
    id: UUID
    url: str
    method: Optional[str]
    status_code: Optional[int]
    status_message: Optional[str]
    request_timestamp: Optional[datetime]


class DefectDetailResponse(BaseModel):
    id: UUID
    defect_number: str
    title: str
    summary: Optional[str]
    description: Optional[str]
    type: str
    severity: str
    priority: str
    status: str
    tags: List[str]
    owner: Optional[str]
    created_by: Optional[str]
    date_created: date
    date_opened: datetime
    is_auto_generated: bool
    folder_id: Optional[UUID]
    group_name: Optional[str]
    notes: Optional[str]
    test_context: Optional[TestContextResponse]
    steps: List[DefectStepResponse]
    screenshots: List[ScreenshotResponse]
    attachments: List[AttachmentResponse]
    console_errors: List[ConsoleErrorResponse]
    network_errors: List[NetworkErrorResponse]
    external_reference: Optional[ExternalReferenceResponse]
    created_at: datetime
    updated_at: datetime


class FilterConditionResponse(BaseModel):
    field: str
    operator: str
    value: Any


class FilterResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    icon: Optional[str]
    conditions: List[FilterConditionResponse]
    is_default: bool
    is_system: bool
    is_favorite: bool
    use_count: int
    last_used: Optional[datetime]
    created_at: datetime


class FilterTemplateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    icon: Optional[str]
    category: Optional[str]
    conditions: List[FilterConditionResponse]


class FolderResponse(BaseModel):
    id: UUID
    name: str
    parent_id: Optional[UUID]
    defect_count: int
    children: List['FolderResponse']


class StatisticsResponse(BaseModel):
    total: int
    by_status: Dict[str, int]
    by_severity: Dict[str, int]
    by_priority: Dict[str, int]
    by_type: Dict[str, int]
    trends: Dict[str, int]
    auto_generated_count: int
```

---

## Implementation Notes

### 1. Sequential Defect Numbering

Each user has their own counter for defect numbers:

```python
async def get_next_defect_number(user_id: UUID) -> str:
    """Get next sequential defect number for user."""
    result = await db.execute(
        """
        INSERT INTO defect_counter (user_id, counter)
        VALUES ($1, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET counter = defect_counter.counter + 1
        RETURNING counter
        """,
        user_id
    )
    counter = result.fetchone()[0]
    return f"{counter:05d}"  # "00001", "00002", etc.
```

### 2. Screenshot Upload Flow

1. Create defect with step information
2. Receive pre-signed upload URLs in response
3. Client uploads screenshots directly to storage
4. Client confirms upload completion

```python
async def create_defect_with_upload_urls(defect_data: DefectCreate) -> DefectCreateResponse:
    # Create defect
    defect = await create_defect(defect_data)

    # Generate upload URLs for each step screenshot
    upload_urls = []
    for step in defect_data.steps or []:
        url = generate_presigned_upload_url(
            bucket="defect-screenshots",
            key=f"{defect.id}/step_{step.step_number:04d}.png"
        )
        upload_urls.append({
            "step_number": step.step_number,
            "upload_url": url,
            "screenshot_id": create_screenshot_record(defect.id, step.step_number)
        })

    return DefectCreateResponse(
        id=defect.id,
        defect_number=defect.defect_number,
        upload_urls=upload_urls
    )
```

### 3. Filter Condition Evaluation

```python
def evaluate_condition(defect: Defect, condition: FilterCondition) -> bool:
    """Evaluate a single filter condition against a defect."""
    field_value = getattr(defect, condition.field)

    match condition.operator:
        case "equals":
            return field_value == condition.value
        case "not_equals":
            return field_value != condition.value
        case "is_one_of":
            return field_value in condition.value
        case "has_any_of":
            return bool(set(field_value) & set(condition.value))
        case "has_all_of":
            return set(condition.value).issubset(set(field_value))
        case "has_none_of":
            return not bool(set(field_value) & set(condition.value))
        case "is_empty":
            return not field_value
        case "is_not_empty":
            return bool(field_value)
        case "before":
            return field_value < condition.value
        case "after":
            return field_value > condition.value
        case "between":
            return condition.value[0] <= field_value <= condition.value[1]
        case "in_last_days":
            cutoff = datetime.now() - timedelta(days=condition.value)
            return field_value >= cutoff.date()

    return False
```

### 4. External System Integration

```python
async def sync_to_jira(defect: Defect, config: JiraConfig, screenshots: List[str]) -> ExternalReference:
    """Sync defect to Jira."""
    jira_client = JiraClient(
        url=config.url,
        username=config.username,
        api_token=config.api_token
    )

    # Create issue
    issue = await jira_client.create_issue(
        project_key=config.project_key,
        issue_type=config.issue_type,
        summary=defect.title,
        description=format_jira_description(defect),
        priority=map_priority_to_jira(defect.priority),
        labels=defect.tags
    )

    # Attach screenshots
    for screenshot_url in screenshots[:5]:  # Max 5
        await jira_client.add_attachment(issue.key, screenshot_url)

    # Store reference
    return await create_external_reference(
        defect_id=defect.id,
        system="jira",
        external_key=issue.key,
        external_id=issue.id,
        external_url=f"{config.url}/browse/{issue.key}"
    )
```

### 5. Full-Text Search

```python
async def search_defects(user_id: UUID, query: str) -> List[Defect]:
    """Full-text search across defects."""
    return await db.fetch_all(
        """
        SELECT * FROM defects
        WHERE user_id = $1
        AND (
            defect_number ILIKE $2
            OR title ILIKE $2
            OR description ILIKE $2
            OR summary ILIKE $2
            OR $3 = ANY(tags)
        )
        ORDER BY date_created DESC
        """,
        user_id, f"%{query}%", query.lower()
    )
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Defect/Filter/Folder not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_FILTER` | 409 | Filter with name already exists |
| `EXTERNAL_SYNC_FAILED` | 502 | External system sync failed |
| `UPLOAD_FAILED` | 500 | Screenshot/attachment upload failed |
| `QUOTA_EXCEEDED` | 429 | Storage quota exceeded |

---

## Security Considerations

1. **User Isolation**: All queries filtered by `user_id`
2. **Input Validation**: All inputs validated with Pydantic
3. **File Upload Security**: Validate file types, scan for malware
4. **Rate Limiting**: Limit bulk operations and uploads
5. **External Credentials**: Never logged, encrypted at rest
6. **SQL Injection**: Use parameterized queries only

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Testr Team | Initial specification |
