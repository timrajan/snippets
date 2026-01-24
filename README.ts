# Test Report Implementation - Complete Technical Reference

## Overview

This document provides complete details of all changes made to implement the Test Report artifact storage feature, including all database schemas, API endpoints, field mappings, and data flow.

---

## 1. FILES MODIFIED/CREATED

### Modified Files
| File | Purpose |
|------|---------|
| `app/config.py` | Added artifact storage configuration |
| `app/models/test_report.py` | Added `TestArtifact` model, updated `StepResult` and `TestCaseResult` |
| `app/schemas/test_report.py` | Added artifact schemas, field aliases for client compatibility |
| `app/crud/test_report.py` | Added artifact CRUD operations, status normalization |
| `app/routers/test_report.py` | Added artifact endpoints, steps/bulk endpoint |
| `app/main.py` | Added request logging middleware |

### New Files Created
| File | Purpose |
|------|---------|
| `app/utils/artifact_storage.py` | File storage utility for artifacts |
| `sql/003_metadata_column_migration.sql` | Migration for `extra_data` JSONB column |
| `sql/test_artifact_schema.sql` | Migration for `test_artifacts` table |
| `run_artifact_migration.py` | Script to run artifact migration |
| `run_metadata_migration.py` | Script to run metadata migration |

---

## 2. CONFIGURATION SETTINGS

**File:** `app/config.py`

```python
# Artifact Storage Configuration
ARTIFACT_STORAGE_PATH: str = "storage/artifacts"
ARTIFACT_MAX_FILE_SIZE_MB: int = 10
ARTIFACT_MAX_BATCH_SIZE: int = 50
ARTIFACT_ALLOWED_MIME_TYPES: list = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/json",
]
```

---

## 3. DATABASE SCHEMA - ALL TABLES

### 3.1 Table: `suite_runs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `user_id` | UUID | NO | - | FK to users.id (CASCADE) |
| `suite_name` | VARCHAR(255) | NO | - | Name of the test suite |
| `suite_path` | TEXT[] | NO | - | Array of path segments |
| `test_plan_id` | UUID | YES | - | FK to test_plans.id (SET NULL) |
| `started_at` | TIMESTAMP(TZ) | NO | utcnow() | Execution start time |
| `completed_at` | TIMESTAMP(TZ) | YES | - | Execution end time |
| `duration_ms` | FLOAT | YES | - | Total duration in milliseconds |
| `status` | VARCHAR(20) | NO | "running" | running/completed/failed/cancelled |
| `total_tests` | INTEGER | NO | 0 | Total test count |
| `passed_tests` | INTEGER | NO | 0 | Passed test count |
| `failed_tests` | INTEGER | NO | 0 | Failed test count |
| `skipped_tests` | INTEGER | NO | 0 | Skipped test count |
| `no_run_tests` | INTEGER | NO | 0 | Not run test count |
| `pass_rate` | FLOAT | YES | - | Pass percentage |
| `browser_name` | VARCHAR(50) | YES | - | Browser name |
| `browser_version` | VARCHAR(50) | YES | - | Browser version |
| `os_name` | VARCHAR(50) | YES | - | Operating system name |
| `os_version` | VARCHAR(50) | YES | - | OS version |
| `trigger_type` | VARCHAR(50) | YES | "manual" | manual/scheduled/api |
| `trigger_source` | VARCHAR(255) | YES | - | Trigger source identifier |
| `tags` | TEXT[] | YES | - | Array of tags |
| `notes` | TEXT | YES | - | Free-form notes |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |
| `updated_at` | TIMESTAMP(TZ) | YES | utcnow() | Record update time |

**Indexes:** `user_id`, `test_plan_id`

---

### 3.2 Table: `test_case_results`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `suite_run_id` | UUID | NO | - | FK to suite_runs.id (CASCADE) |
| `user_id` | UUID | NO | - | FK to users.id (CASCADE) |
| `test_case_id` | UUID | YES | - | FK to test_cases.id (SET NULL) |
| `test_case_name` | VARCHAR(255) | NO | - | Name of the test case |
| `test_case_path` | TEXT[] | NO | - | Array of path segments |
| `iteration_number` | INTEGER | YES | 1 | Data-driven iteration number |
| `started_at` | TIMESTAMP(TZ) | NO | utcnow() | Execution start time |
| `completed_at` | TIMESTAMP(TZ) | YES | - | Execution end time |
| `duration_ms` | FLOAT | YES | - | Duration in milliseconds |
| `status` | VARCHAR(20) | NO | "pending" | pending/running/passed/failed/skipped/cancelled |
| `total_steps` | INTEGER | NO | 0 | Total step count |
| `passed_steps` | INTEGER | NO | 0 | Passed step count |
| `failed_steps` | INTEGER | NO | 0 | Failed step count |
| `skipped_steps` | INTEGER | NO | 0 | Skipped step count |
| `pass_rate` | FLOAT | YES | - | Step pass percentage |
| `total_checkpoints` | INTEGER | YES | 0 | Total checkpoint count |
| `passed_checkpoints` | INTEGER | YES | 0 | Passed checkpoint count |
| `failed_checkpoints` | INTEGER | YES | 0 | Failed checkpoint count |
| `error_message` | TEXT | YES | - | Error message if failed |
| `error_step_number` | INTEGER | YES | - | Step number where error occurred |
| `failure_screenshot_url` | TEXT | YES | - | URL to failure screenshot |
| `executive_report_url` | TEXT | YES | - | URL to executive report |
| `detailed_report_url` | TEXT | YES | - | URL to detailed report |
| `base_url` | TEXT | YES | - | Base URL for test execution |
| `tags` | TEXT[] | YES | - | Array of tags |
| `extra_data` | JSONB | YES | - | **NEW:** Arbitrary nested JSON data from client |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |
| `updated_at` | TIMESTAMP(TZ) | YES | utcnow() | Record update time |

**Indexes:** `suite_run_id`, `user_id`, `test_case_id`, `idx_test_case_results_extra_data` (GIN)

**Note:** The column is named `extra_data` in the database but exposed as `metadata` in the API schema (SQLAlchemy reserves `metadata`).

---

### 3.3 Table: `step_results`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `step_number` | INTEGER | NO | - | Sequential step number |
| `iteration_number` | INTEGER | YES | 1 | **NEW:** Data-driven iteration number |
| `action_type` | VARCHAR(50) | NO | - | goto/click/fill/select/check/uncheck/hover/wait/scroll/press/screenshot/assertion/custom |
| `description` | TEXT | NO | - | Human-readable step description |
| `target_selector` | TEXT | YES | - | CSS/XPath selector for target element |
| `input_value` | TEXT | YES | - | Input value for fill/select actions |
| `started_at` | TIMESTAMP(TZ) | YES | - | Step start time |
| `completed_at` | TIMESTAMP(TZ) | YES | - | Step end time |
| `duration_ms` | FLOAT | YES | - | Step duration in milliseconds |
| `status` | VARCHAR(20) | NO | "pending" | pending/running/passed/failed/skipped |
| `error_message` | TEXT | YES | - | Error message if failed |
| `error_type` | VARCHAR(100) | YES | - | Error type classification |
| `screenshot_url` | TEXT | YES | - | URL to step screenshot |
| `screenshot_thumbnail_url` | TEXT | YES | - | URL to thumbnail |
| `screenshot_artifact_id` | UUID | YES | - | **NEW:** FK to test_artifacts.id (SET NULL) |
| `playwright_code` | TEXT | YES | - | Generated Playwright code |
| `page_url` | TEXT | YES | - | Page URL at time of step |
| `page_title` | VARCHAR(500) | YES | - | Page title at time of step |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`, `screenshot_artifact_id`

---

### 3.4 Table: `test_artifacts` (NEW)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `step_result_id` | UUID | YES | - | FK to step_results.id (SET NULL) |
| `artifact_type` | VARCHAR(50) | NO | - | screenshot/log/video/har/trace/other |
| `file_name` | VARCHAR(255) | NO | - | Original filename |
| `file_size_bytes` | INTEGER | NO | - | File size in bytes |
| `mime_type` | VARCHAR(100) | NO | - | MIME type (e.g., image/png) |
| `checksum` | VARCHAR(64) | YES | - | SHA-256 hash of file content |
| `storage_path` | TEXT | NO | - | Relative path in storage directory |
| `step_number` | INTEGER | YES | - | Associated step number |
| `iteration_number` | INTEGER | YES | 1 | Data-driven iteration number |
| `captured_at` | TIMESTAMP(TZ) | YES | - | When the artifact was captured |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`, `step_result_id`

**Storage Path Format:** `YYYY/MM/DD/{test_case_result_id}/{unique_filename}`

---

### 3.5 Table: `report_checkpoint_results`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `step_result_id` | UUID | NO | - | FK to step_results.id (CASCADE) |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `checkpoint_name` | VARCHAR(255) | NO | - | Checkpoint identifier |
| `checkpoint_type` | VARCHAR(50) | NO | - | element/screenshot/api/accessibility/custom |
| `selector` | TEXT | YES | - | Element selector |
| `element_tag` | VARCHAR(50) | YES | - | HTML tag name |
| `element_text` | TEXT | YES | - | Element text content |
| `property_name` | VARCHAR(100) | YES | - | Property being checked |
| `operator` | VARCHAR(50) | YES | - | Comparison operator |
| `expected_value` | TEXT | YES | - | Expected value |
| `actual_value` | TEXT | YES | - | Actual value found |
| `passed` | BOOLEAN | NO | - | Whether checkpoint passed |
| `error_message` | TEXT | YES | - | Error message if failed |
| `baseline_screenshot_url` | TEXT | YES | - | Visual comparison baseline |
| `actual_screenshot_url` | TEXT | YES | - | Visual comparison actual |
| `diff_screenshot_url` | TEXT | YES | - | Visual comparison diff |
| `similarity_score` | FLOAT | YES | - | Image similarity score |
| `api_endpoint` | TEXT | YES | - | API endpoint for API checkpoints |
| `api_method` | VARCHAR(10) | YES | - | HTTP method |
| `api_request_body` | JSONB | YES | - | Request body |
| `api_response_status` | INTEGER | YES | - | Response status code |
| `api_response_body` | JSONB | YES | - | Response body |
| `verified_at` | TIMESTAMP(TZ) | YES | utcnow() | Verification timestamp |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `step_result_id`, `test_case_result_id`

---

### 3.6 Table: `report_console_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `timestamp` | TIMESTAMP(TZ) | NO | - | When the log was captured |
| `level` | VARCHAR(20) | NO | - | log/info/warn/error/debug |
| `message` | TEXT | NO | - | Log message content |
| `source_url` | TEXT | YES | - | Source file URL |
| `source_line` | INTEGER | YES | - | Source line number |
| `source_column` | INTEGER | YES | - | Source column number |
| `step_number` | INTEGER | YES | - | Associated step number |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`

---

### 3.7 Table: `report_network_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `timestamp` | TIMESTAMP(TZ) | NO | - | Request timestamp |
| `method` | VARCHAR(10) | NO | - | HTTP method |
| `url` | TEXT | NO | - | Request URL |
| `request_headers` | JSONB | YES | - | Request headers |
| `request_body` | TEXT | YES | - | Request body |
| `status_code` | INTEGER | YES | - | Response status code |
| `status_text` | VARCHAR(100) | YES | - | Response status text |
| `response_headers` | JSONB | YES | - | Response headers |
| `response_body_preview` | TEXT | YES | - | Truncated response body |
| `response_size_bytes` | INTEGER | YES | - | Response size |
| `duration_ms` | FLOAT | YES | - | Request duration |
| `resource_type` | VARCHAR(50) | YES | - | Resource type (document, xhr, etc.) |
| `is_error` | BOOLEAN | YES | FALSE | Whether request failed |
| `step_number` | INTEGER | YES | - | Associated step number |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`

---

### 3.8 Table: `environment_info`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) - UNIQUE |
| `browser_name` | VARCHAR(50) | YES | - | Browser name |
| `browser_version` | VARCHAR(50) | YES | - | Browser version |
| `user_agent` | TEXT | YES | - | Full user agent string |
| `js_engine` | VARCHAR(50) | YES | - | JavaScript engine |
| `os_name` | VARCHAR(50) | YES | - | Operating system |
| `os_version` | VARCHAR(50) | YES | - | OS version |
| `os_architecture` | VARCHAR(20) | YES | - | Architecture (x64, arm64) |
| `kernel_version` | VARCHAR(100) | YES | - | Kernel version |
| `viewport_width` | INTEGER | YES | - | Viewport width in pixels |
| `viewport_height` | INTEGER | YES | - | Viewport height in pixels |
| `device_pixel_ratio` | FLOAT | YES | - | Device pixel ratio |
| `screen_width` | INTEGER | YES | - | Screen width |
| `screen_height` | INTEGER | YES | - | Screen height |
| `zoom_level` | FLOAT | YES | - | Browser zoom level |
| `language` | VARCHAR(20) | YES | - | Browser language |
| `timezone` | VARCHAR(100) | YES | - | Timezone |
| `country` | VARCHAR(50) | YES | - | Country |
| `is_online` | BOOLEAN | YES | - | Network connectivity |
| `connection_type` | VARCHAR(50) | YES | - | Connection type |
| `app_version` | VARCHAR(50) | YES | - | Application version |
| `qt_version` | VARCHAR(50) | YES | - | Qt version (if applicable) |
| `custom_properties` | JSONB | YES | - | Additional custom properties |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id` (UNIQUE)

---

### 3.9 Table: `report_script_results`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `script_type` | VARCHAR(20) | NO | - | pre/post/custom |
| `script_name` | VARCHAR(255) | YES | - | Script name/identifier |
| `started_at` | TIMESTAMP(TZ) | YES | - | Execution start |
| `completed_at` | TIMESTAMP(TZ) | YES | - | Execution end |
| `duration_ms` | FLOAT | YES | - | Duration in milliseconds |
| `status` | VARCHAR(20) | NO | - | pending/running/passed/failed |
| `script_code` | TEXT | YES | - | Script source code |
| `output` | TEXT | YES | - | Script output |
| `error_message` | TEXT | YES | - | Error message if failed |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`

---

### 3.10 Table: `accessibility_violations`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `step_result_id` | UUID | YES | - | FK to step_results.id (SET NULL) |
| `rule_id` | VARCHAR(100) | NO | - | WCAG rule identifier |
| `rule_description` | TEXT | YES | - | Rule description |
| `impact` | VARCHAR(20) | YES | - | minor/moderate/serious/critical |
| `selector` | TEXT | YES | - | Element selector |
| `element_html` | TEXT | YES | - | Element HTML snippet |
| `wcag_tags` | TEXT[] | YES | - | WCAG criteria tags |
| `help_url` | TEXT | YES | - | URL to rule documentation |
| `failure_summary` | TEXT | YES | - | Failure summary |
| `fix_suggestion` | TEXT | YES | - | Suggested fix |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `test_case_result_id`, `step_result_id`

---

### 3.11 Table: `report_execution_history`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid4() | Primary key |
| `user_id` | UUID | NO | - | FK to users.id (CASCADE) |
| `test_case_id` | UUID | NO | - | FK to test_cases.id (CASCADE) |
| `test_case_result_id` | UUID | NO | - | FK to test_case_results.id (CASCADE) |
| `suite_run_id` | UUID | NO | - | FK to suite_runs.id (CASCADE) |
| `suite_name` | VARCHAR(255) | YES | - | Suite name for quick access |
| `executed_at` | TIMESTAMP(TZ) | NO | - | Execution timestamp |
| `status` | VARCHAR(20) | NO | - | Execution status |
| `duration_ms` | FLOAT | YES | - | Duration in milliseconds |
| `pass_rate` | FLOAT | YES | - | Pass rate |
| `created_at` | TIMESTAMP(TZ) | YES | utcnow() | Record creation time |

**Indexes:** `user_id`, `test_case_id`

---

## 4. API ENDPOINTS

### Base URL: `/api/v1/reports`

### 4.1 Suite Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/suite-runs` | Create new suite run |
| GET | `/suite-runs` | List suite runs with filtering/pagination |
| GET | `/suite-runs/{id}` | Get suite run with details |
| PATCH | `/suite-runs/{id}` | Update suite run |
| DELETE | `/suite-runs/{id}` | Delete suite run (cascades) |
| GET | `/suite-runs/{id}/test-cases` | Get test case results for suite |

### 4.2 Test Case Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/test-case-results` | Create new test case result |
| GET | `/test-case-results/{id}` | Get test case result |
| GET | `/test-case-results/{id}/full` | Get complete result with all related data |
| PATCH | `/test-case-results/{id}` | Update test case result |
| DELETE | `/test-case-results/{id}` | Delete test case result |
| GET | `/test-case-results/{id}/steps` | Get all steps |
| POST | `/test-case-results/{id}/steps/bulk` | **NEW:** Bulk create steps |
| GET | `/test-case-results/{id}/checkpoints` | Get all checkpoints |
| GET | `/test-case-results/{id}/logs/console` | Get console logs |
| GET | `/test-case-results/{id}/logs/network` | Get network logs |
| GET | `/test-case-results/{id}/environment` | Get environment info |
| GET | `/test-case-results/{id}/accessibility` | Get accessibility violations |

### 4.3 Artifacts (NEW)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/test-case-results/{id}/artifacts` | Upload single artifact |
| POST | `/test-case-results/{id}/artifacts/batch` | Batch upload (max 50) |
| GET | `/test-case-results/{id}/artifacts` | List artifacts |
| GET | `/artifacts/{id}` | Get artifact metadata |
| GET | `/artifacts/{id}/download` | Download artifact file |
| DELETE | `/artifacts/{id}` | Delete artifact |
| PATCH | `/steps/{id}/link-screenshot` | Link artifact to step |

### 4.4 Step Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/step-results` | Create step result |
| POST | `/step-results/bulk` | Bulk create steps |
| GET | `/step-results/{id}` | Get step result |
| PATCH | `/step-results/{id}` | Update step result |
| DELETE | `/step-results/{id}` | Delete step result |

### 4.5 Checkpoint Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkpoint-results` | Create checkpoint result |
| POST | `/checkpoint-results/bulk` | Bulk create checkpoints |
| GET | `/checkpoint-results/{id}` | Get checkpoint result |
| DELETE | `/checkpoint-results/{id}` | Delete checkpoint result |

### 4.6 Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/console-logs` | Create console log |
| POST | `/console-logs/bulk` | Bulk create console logs |
| POST | `/network-logs` | Create network log |
| POST | `/network-logs/bulk` | Bulk create network logs |

### 4.7 Environment & Scripts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/environment-info` | Create environment info |
| POST | `/script-results` | Create script result |

### 4.8 Accessibility

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accessibility-violations` | Create violation |
| POST | `/accessibility-violations/bulk` | Bulk create violations |

### 4.9 Execution History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test-cases/{id}/execution-history` | Get history for test case |
| GET | `/execution-history/recent` | Get recent executions |

---

## 5. FIELD MAPPINGS & ALIASES

### 5.1 StepResultCreate - Client Compatibility

The API accepts these client-friendly field names and maps them internally:

| Client Field | Internal Field | Description |
|--------------|----------------|-------------|
| `action` | `action_type` | Action type (with value mapping) |
| `element` | `target_selector` | CSS/XPath selector |
| `value` | `input_value` | Input value for fill/select |
| `timestamp` | `started_at` | Step start timestamp |
| `status` | `status` | Auto-normalized to lowercase |
| `screenshot_path` | `screenshot_url` | Screenshot path/URL |

**Action Type Mapping:**
```python
action_map = {
    "navigate": "goto",
    "goto": "goto",
    "click": "click",
    "fill": "fill",
    "type": "fill",
    "select": "select",
    "check": "check",
    "uncheck": "uncheck",
    "hover": "hover",
    "wait": "wait",
    "wait_for_load_state": "wait",
    "scroll": "scroll",
    "press": "press",
    "screenshot": "screenshot",
    "assertion": "assertion",
    "assert": "assertion",
}
```

### 5.2 Status Normalization

All status values are automatically normalized to lowercase:
- Client sends: `"Passed"`, `"PASSED"`, `"passed"`
- Server stores: `"passed"`

### 5.3 TestCaseResult Metadata Mapping

| API Field | Database Column | Notes |
|-----------|-----------------|-------|
| `metadata` | `extra_data` | SQLAlchemy reserves `metadata` attribute |

---

## 6. ENUMS

### ExecutionStatus
```
pending, running, passed, failed, skipped, cancelled
```

### SuiteRunStatus
```
running, completed, failed, cancelled
```

### TriggerType
```
manual, scheduled, api
```

### LogLevel
```
log, info, warn, error, debug
```

### CheckpointType
```
element, screenshot, api, accessibility, custom
```

### ActionType
```
goto, click, fill, select, check, uncheck, hover, wait, scroll, press, screenshot, assertion, custom
```

### ImpactLevel
```
minor, moderate, serious, critical
```

### ArtifactType
```
screenshot, log, video, har, trace, other
```

### ArtifactCategory
```
step_screenshot, error_screenshot, baseline, diff, debug
```

---

## 7. ARTIFACT STORAGE

### Storage Structure
```
storage/
  artifacts/
    YYYY/
      MM/
        DD/
          {test_case_result_id}/
            {uuid}.{ext}
            {uuid}.{ext}
```

### File Validation
- Max file size: 10 MB (configurable)
- Allowed MIME types: image/png, image/jpeg, image/gif, image/webp, application/pdf, text/plain, application/json
- Batch upload limit: 50 files per request

### Checksum
- SHA-256 hash computed and stored for each artifact
- Used for integrity verification

---

## 8. DATA FLOW - TEST RUN REPORT GENERATION

### Sequence of API Calls

```
1. POST /suite-runs
   └── Creates: suite_runs record
   └── Returns: suite_run_id

2. POST /test-case-results
   └── Input: suite_run_id, test_case_name, test_case_path, etc.
   └── Creates: test_case_results record
   └── Returns: test_case_result_id

3. POST /test-case-results/{id}/steps/bulk
   └── Input: Array of step objects
   └── Creates: step_results records
   └── Returns: step_ids

4. POST /test-case-results/{id}/artifacts/batch
   └── Input: Files + metadata JSON
   └── Creates: test_artifacts records + physical files
   └── Returns: artifact_ids

5. POST /environment-info
   └── Input: test_case_result_id, browser info, OS info, etc.
   └── Creates: environment_info record

6. POST /checkpoint-results/bulk (if applicable)
   └── Input: Array of checkpoint objects
   └── Creates: report_checkpoint_results records

7. POST /console-logs/bulk (if applicable)
   └── Input: Array of log objects
   └── Creates: report_console_logs records

8. POST /network-logs/bulk (if applicable)
   └── Input: Array of network request objects
   └── Creates: report_network_logs records

9. PATCH /test-case-results/{id}
   └── Input: status, completed_at, duration_ms, metrics
   └── Updates: test_case_results record
   └── Triggers: execution_history entry

10. PATCH /suite-runs/{id}
    └── Input: status, completed_at, metrics
    └── Updates: suite_runs record
```

---

## 9. SAMPLE REQUEST/RESPONSE

### Create Steps (Bulk)

**Request:**
```json
POST /api/v1/reports/test-case-results/{id}/steps/bulk

{
  "steps": [
    {
      "step_number": 1,
      "action": "navigate",
      "description": "Navigate to https://example.com",
      "element": null,
      "value": "https://example.com",
      "status": "Passed",
      "duration_ms": 1234.56,
      "timestamp": "2024-01-24T15:30:00Z",
      "screenshot_path": "/path/to/step_0001.png",
      "page_url": "https://example.com",
      "page_title": "Example Domain"
    },
    {
      "step_number": 2,
      "action": "click",
      "description": "Click on Login button",
      "element": "#login-btn",
      "value": null,
      "status": "Passed",
      "duration_ms": 234.5,
      "timestamp": "2024-01-24T15:30:02Z",
      "screenshot_path": "/path/to/step_0002.png"
    }
  ]
}
```

**Response:**
```json
{
  "created": 2,
  "step_ids": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  ]
}
```

### Upload Artifacts (Batch)

**Request:**
```http
POST /api/v1/reports/test-case-results/{id}/artifacts/batch
Content-Type: multipart/form-data

files: [file1.png, file2.png, ...]
metadata: [
  {"artifact_type": "screenshot", "step_number": 1, "iteration_number": 1},
  {"artifact_type": "screenshot", "step_number": 2, "iteration_number": 1}
]
```

**Response:**
```json
{
  "uploaded": 2,
  "failed": 0,
  "artifacts": [
    {
      "id": "...",
      "test_case_result_id": "...",
      "artifact_type": "screenshot",
      "file_name": "file1.png",
      "file_size_bytes": 12345,
      "file_size": 12345,
      "mime_type": "image/png",
      "checksum": "abc123...",
      "storage_path": "2024/01/24/{tcr_id}/uuid1.png",
      "download_url": "/api/v1/reports/artifacts/{id}/download",
      "step_number": 1,
      "iteration_number": 1,
      "created_at": "2024-01-24T15:30:00Z"
    }
  ],
  "errors": []
}
```

---

## 10. CASCADE DELETE BEHAVIOR

When a parent record is deleted, child records are automatically deleted:

```
suite_runs (DELETE)
  └── test_case_results (CASCADE)
       ├── step_results (CASCADE)
       │    ├── report_checkpoint_results (CASCADE)
       │    └── accessibility_violations (SET NULL)
       ├── test_artifacts (CASCADE)
       ├── report_console_logs (CASCADE)
       ├── report_network_logs (CASCADE)
       ├── environment_info (CASCADE)
       ├── report_script_results (CASCADE)
       └── accessibility_violations (CASCADE)
```

---

## 11. INDEX SUMMARY

| Table | Index | Columns |
|-------|-------|---------|
| suite_runs | idx_suite_runs_user_id | user_id |
| suite_runs | idx_suite_runs_test_plan_id | test_plan_id |
| test_case_results | idx_tcr_suite_run_id | suite_run_id |
| test_case_results | idx_tcr_user_id | user_id |
| test_case_results | idx_tcr_test_case_id | test_case_id |
| test_case_results | idx_tcr_extra_data | extra_data (GIN) |
| step_results | idx_sr_tcr_id | test_case_result_id |
| step_results | idx_sr_screenshot_artifact | screenshot_artifact_id |
| test_artifacts | idx_ta_tcr_id | test_case_result_id |
| test_artifacts | idx_ta_step_result_id | step_result_id |

---

## 12. AUTHENTICATION

All endpoints require Bearer token authentication:

```http
Authorization: Bearer <access_token>
```

Endpoints validate that the authenticated user owns the requested resources.

---

This document represents the complete implementation state as of the changes made.
