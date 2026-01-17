# Test Run API Documentation

**Base URL:** `http://localhost:8000/api/v1`
**Authentication:** Bearer Token (JWT) required for all endpoints

---

## Table of Contents
1. [Test Runs](#1-test-runs)
2. [Test Run Items](#2-test-run-items)
3. [Test Run Results](#3-test-run-results)
4. [Step Results](#4-step-results)
5. [Checkpoint Results](#5-checkpoint-results)
6. [Console Logs](#6-console-logs)
7. [Network Logs](#7-network-logs)
8. [Script Results](#8-script-results)
9. [Execution History](#9-execution-history)
10. [Test Run Tree](#10-test-run-tree)
11. [Enums Reference](#11-enums-reference)

---

## 1. Test Runs

### 1.1 Create Test Run

**Endpoint:** `POST /api/v1/test-runs`

**Description:** Create a new test run associated with a test plan.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "run_name": "Nightly Regression Run",
    "test_plan_id": "550e8400-e29b-41d4-a716-446655440000",
    "suite_path": ["Regression", "Login"],
    "suite_name": "Login Suite",
    "scheduled_at": null,
    "parallel_enabled": true,
    "parallel_count": 3,
    "retry_on_failure": true,
    "retry_count": 2,
    "browser_name": "chromium",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "tags": ["nightly", "regression"],
    "notes": "Automated nightly run"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| run_name | string | Yes | Name of the test run |
| test_plan_id | UUID | Yes | Associated test plan ID |
| suite_path | array | No | Hierarchical path |
| suite_name | string | No | Suite name |
| scheduled_at | datetime | No | Scheduled execution time |
| parallel_enabled | bool | No | Enable parallel execution |
| parallel_count | int | No | Number of parallel workers (1-10) |
| retry_on_failure | bool | No | Retry failed tests |
| retry_count | int | No | Number of retries (0-5) |
| browser_name | string | No | Browser to use |
| viewport_width | int | No | Viewport width (320-3840) |
| viewport_height | int | No | Viewport height (240-2160) |
| tags | array | No | Tags for categorization |
| notes | string | No | Additional notes |

**Response (201 Created):**
```json
{
  "id": "uuid",
  "run_name": "Nightly Regression Run",
  "run_number": 1,
  "test_plan_id": "uuid",
  "created_by": "uuid",
  "suite_path": ["Regression", "Login"],
  "suite_name": "Login Suite",
  "status": "pending",
  "scheduled_at": null,
  "started_at": null,
  "completed_at": null,
  "duration_ms": 0,
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": 0.0,
  "parallel_enabled": true,
  "parallel_count": 3,
  "retry_on_failure": true,
  "retry_count": 2,
  "browser_name": "chromium",
  "browser_version": null,
  "os_name": null,
  "os_version": null,
  "viewport_width": 1920,
  "viewport_height": 1080,
  "results_folder": null,
  "report_path": null,
  "tags": ["nightly", "regression"],
  "notes": "Automated nightly run",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

---

### 1.2 List Test Runs

**Endpoint:** `GET /api/v1/test-runs`

**Description:** List test runs with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| test_plan_id | UUID | - | Filter by test plan |
| status | string | - | Filter by status |
| from_date | datetime | - | Started after (ISO 8601) |
| to_date | datetime | - | Started before (ISO 8601) |
| search | string | - | Search in run_name |
| sort_by | string | "created_at" | Sort field |
| sort_order | string | "desc" | "asc" or "desc" |
| limit | int | 20 | Page size (1-100) |
| offset | int | 0 | Page offset |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs?status=completed&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "run_name": "Nightly Regression Run",
      "run_number": 1,
      "test_plan_id": "uuid",
      "status": "completed",
      "total_tests": 10,
      "passed_tests": 8,
      "failed_tests": 2,
      "pass_rate": 80.0,
      "duration_ms": 300000,
      "created_at": "2026-01-18T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

### 1.3 Get Test Run

**Endpoint:** `GET /api/v1/test-runs/{run_id}`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 1.4 Update Test Run

**Endpoint:** `PUT /api/v1/test-runs/{run_id}`

**cURL:**
```bash
curl -X PUT "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "completed_at": "2026-01-18T10:30:00Z",
    "duration_ms": 1800000,
    "total_tests": 10,
    "passed_tests": 8,
    "failed_tests": 2,
    "skipped_tests": 0,
    "pass_rate": 80.0,
    "browser_version": "120.0.0",
    "os_name": "Windows",
    "os_version": "11"
  }'
```

---

### 1.5 Delete Test Run

**Endpoint:** `DELETE /api/v1/test-runs/{run_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

### 1.6 Start Test Run

**Endpoint:** `POST /api/v1/test-runs/{run_id}/start`

**Description:** Start executing a test run.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/start" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "browser_name": "chromium",
    "viewport_width": 1920,
    "viewport_height": 1080
  }'
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "running",
  "started_at": "2026-01-18T10:00:00Z",
  "message": "Test run started with 10 test cases"
}
```

---

### 1.7 Stop Test Run

**Endpoint:** `POST /api/v1/test-runs/{run_id}/stop`

**Description:** Stop a running test run.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/stop" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 1.8 Cancel Test Run

**Endpoint:** `POST /api/v1/test-runs/{run_id}/cancel`

**Description:** Cancel a pending or queued test run.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 1.9 Get Test Run Summary

**Endpoint:** `GET /api/v1/test-runs/{run_id}/summary`

**Description:** Get detailed summary statistics for a test run.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "run_name": "Nightly Regression Run",
  "status": "completed",
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": "2026-01-18T10:30:00Z",
  "duration_ms": 1800000,
  "summary": {
    "total_tests": 10,
    "passed_tests": 8,
    "failed_tests": 2,
    "skipped_tests": 0,
    "pass_rate": 80.0,
    "total_steps": 50,
    "passed_steps": 45,
    "failed_steps": 5,
    "total_checkpoints": 20,
    "passed_checkpoints": 18,
    "failed_checkpoints": 2
  },
  "items": [
    {
      "id": "uuid",
      "test_case_name": "Valid Login",
      "status": "passed",
      "duration_ms": 45000,
      "pass_rate": 100.0,
      "error_message": null
    },
    {
      "id": "uuid",
      "test_case_name": "Invalid Password",
      "status": "failed",
      "duration_ms": 30000,
      "pass_rate": 60.0,
      "error_message": "Element not found: #error-message"
    }
  ]
}
```

---

## 2. Test Run Items

### 2.1 Add Test Case to Run

**Endpoint:** `POST /api/v1/test-runs/{run_id}/items`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_id": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_run_id": "uuid",
  "test_case_id": "uuid",
  "execution_order": 1,
  "status": "pending",
  "started_at": null,
  "completed_at": null,
  "duration_ms": 0,
  "total_steps": 0,
  "passed_steps": 0,
  "failed_steps": 0,
  "skipped_steps": 0,
  "total_checkpoints": 0,
  "passed_checkpoints": 0,
  "failed_checkpoints": 0,
  "is_data_driven": false,
  "total_iterations": 0,
  "passed_iterations": 0,
  "failed_iterations": 0,
  "retry_attempt": 0,
  "max_retries_exhausted": false,
  "error_message": null,
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

---

### 2.2 Add Multiple Test Cases (Bulk)

**Endpoint:** `POST /api/v1/test-runs/{run_id}/items/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_ids": [
      "660e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001",
      "660e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

**Response (201 Created):**
```json
{
  "items": [
    {
      "id": "uuid",
      "test_run_id": "uuid",
      "test_case_id": "uuid",
      "execution_order": 1,
      "status": "pending"
    }
  ],
  "total_added": 3
}
```

---

### 2.3 List Items in Run

**Endpoint:** `GET /api/v1/test-runs/{run_id}/items`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.4 Get Item in Run

**Endpoint:** `GET /api/v1/test-runs/{run_id}/items/{item_id}`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.5 Update Item in Run

**Endpoint:** `PUT /api/v1/test-runs/{run_id}/items/{item_id}`

**cURL:**
```bash
curl -X PUT "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "passed",
    "started_at": "2026-01-18T10:00:00Z",
    "completed_at": "2026-01-18T10:00:45Z",
    "duration_ms": 45000,
    "total_steps": 5,
    "passed_steps": 5,
    "failed_steps": 0,
    "total_checkpoints": 3,
    "passed_checkpoints": 3,
    "failed_checkpoints": 0
  }'
```

---

### 2.6 Remove Item from Run

**Endpoint:** `DELETE /api/v1/test-runs/{run_id}/items/{item_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

### 2.7 Reorder Items

**Endpoint:** `POST /api/v1/test-runs/{run_id}/items/reorder`

**Description:** Reorder test cases in a test run by providing the new order of item IDs.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/reorder" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_ids": [
      "660e8400-e29b-41d4-a716-446655440002",
      "660e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

---

## 3. Test Run Results

### 3.1 Create Test Result

**Endpoint:** `POST /api/v1/test-run-results`

**Description:** Create a test result for a specific iteration/execution.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_run_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_run_item_id": "660e8400-e29b-41d4-a716-446655440000",
    "test_case_id": "770e8400-e29b-41d4-a716-446655440000",
    "iteration_number": 1,
    "data_row_index": 0,
    "data_row_values": {"username": "testuser", "password": "***"},
    "status": "passed",
    "started_at": "2026-01-18T10:00:00Z",
    "completed_at": "2026-01-18T10:00:45Z",
    "duration_ms": 45000,
    "total_steps": 5,
    "passed_steps": 5,
    "failed_steps": 0,
    "pass_rate": 100.0,
    "total_checkpoints": 3,
    "passed_checkpoints": 3,
    "failed_checkpoints": 0,
    "checkpoint_pass_rate": 100.0,
    "initial_url": "https://app.example.com/login",
    "final_url": "https://app.example.com/dashboard",
    "environment_info": {
      "browser": "Chrome",
      "browser_version": "120.0.0",
      "os": "Windows 11"
    }
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_run_id": "uuid",
  "test_run_item_id": "uuid",
  "test_case_id": "uuid",
  "iteration_number": 1,
  "data_row_index": 0,
  "data_row_values": {"username": "testuser", "password": "***"},
  "status": "passed",
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": "2026-01-18T10:00:45Z",
  "duration_ms": 45000,
  "total_steps": 5,
  "passed_steps": 5,
  "failed_steps": 0,
  "skipped_steps": 0,
  "pass_rate": 100.0,
  "total_checkpoints": 3,
  "passed_checkpoints": 3,
  "failed_checkpoints": 0,
  "checkpoint_pass_rate": 100.0,
  "error_message": null,
  "error_step_number": null,
  "initial_url": "https://app.example.com/login",
  "final_url": "https://app.example.com/dashboard",
  "results_folder": null,
  "report_path": null,
  "retry_attempt": 0,
  "environment_info": {...},
  "created_at": "2026-01-18T10:00:45Z"
}
```

---

### 3.2 Get Test Result

**Endpoint:** `GET /api/v1/test-run-results/{result_id}`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3.3 List Results for Run

**Endpoint:** `GET /api/v1/test-runs/{run_id}/results`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3.4 List Results for Item

**Endpoint:** `GET /api/v1/test-run-items/{item_id}/results`

**Description:** Get all results for a test run item (useful for data-driven tests with multiple iterations).

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-items/550e8400-e29b-41d4-a716-446655440000/results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Step Results

### 4.1 Create Step Result

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/steps`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/steps" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 1,
    "action": "click",
    "description": "Click login button",
    "status": "passed",
    "started_at": "2026-01-18T10:00:40Z",
    "completed_at": "2026-01-18T10:00:42Z",
    "duration_ms": 2000,
    "selector": "#login-btn",
    "element_html": "<button id=\"login-btn\">Login</button>",
    "screenshot_path": "screenshots/step1.png",
    "screenshot_url": "/api/v1/screenshots/step1.png",
    "playwright_code": "await page.click(\"#login-btn\")"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_run_result_id": "uuid",
  "step_number": 1,
  "action": "click",
  "description": "Click login button",
  "status": "passed",
  "started_at": "2026-01-18T10:00:40Z",
  "completed_at": "2026-01-18T10:00:42Z",
  "duration_ms": 2000,
  "selector": "#login-btn",
  "element_html": "<button id=\"login-btn\">Login</button>",
  "input_value": null,
  "screenshot_path": "screenshots/step1.png",
  "screenshot_url": "/api/v1/screenshots/step1.png",
  "error_message": null,
  "playwright_code": "await page.click(\"#login-btn\")",
  "window_id": null,
  "window_title": null,
  "created_at": "2026-01-18T10:00:42Z"
}
```

---

### 4.2 Create Step Results (Bulk)

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/steps/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/steps/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      {
        "step_number": 1,
        "action": "goto",
        "description": "Navigate to login page",
        "status": "passed",
        "duration_ms": 1500
      },
      {
        "step_number": 2,
        "action": "fill",
        "description": "Enter username",
        "status": "passed",
        "selector": "#username",
        "input_value": "testuser",
        "duration_ms": 200
      },
      {
        "step_number": 3,
        "action": "fill",
        "description": "Enter password",
        "status": "passed",
        "selector": "#password",
        "input_value": "***",
        "duration_ms": 200
      },
      {
        "step_number": 4,
        "action": "click",
        "description": "Click login button",
        "status": "passed",
        "selector": "#login-btn",
        "duration_ms": 2000
      }
    ]
  }'
```

---

### 4.3 List Steps for Result

**Endpoint:** `GET /api/v1/test-run-results/{result_id}/steps`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/steps" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Checkpoint Results

### 5.1 Create Checkpoint Result

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/checkpoints`

**cURL (Element Checkpoint):**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/checkpoints" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_step_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "checkpoint_name": "Verify welcome message",
    "checkpoint_type": "element",
    "status": "passed",
    "selector": "#welcome-msg",
    "profile": "default",
    "expected_properties": {
      "text": "Welcome, testuser!",
      "visible": true
    },
    "actual_properties": {
      "text": "Welcome, testuser!",
      "visible": true
    },
    "failed_properties": []
  }'
```

**cURL (Screenshot Checkpoint):**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/checkpoints" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkpoint_name": "Dashboard visual check",
    "checkpoint_type": "screenshot",
    "status": "passed",
    "baseline_screenshot_path": "baselines/dashboard.png",
    "actual_screenshot_path": "actual/dashboard.png",
    "diff_screenshot_path": null,
    "diff_percentage": 0.5
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_run_result_id": "uuid",
  "test_step_result_id": "uuid",
  "checkpoint_name": "Verify welcome message",
  "checkpoint_type": "element",
  "status": "passed",
  "selector": "#welcome-msg",
  "profile": "default",
  "expected_properties": {...},
  "actual_properties": {...},
  "failed_properties": [],
  "diff_percentage": null,
  "error_message": null,
  "created_at": "2026-01-18T10:00:45Z"
}
```

---

### 5.2 List Checkpoints for Result

**Endpoint:** `GET /api/v1/test-run-results/{result_id}/checkpoints`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/checkpoints" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Console Logs

### 6.1 Create Console Logs (Bulk)

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/console-logs/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/console-logs/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "log_level": "log",
        "message": "Page loaded successfully",
        "timestamp": "2026-01-18T10:00:01Z",
        "step_index": 1
      },
      {
        "log_level": "warn",
        "message": "Deprecated API usage detected",
        "source": "https://app.example.com/js/app.js",
        "line_number": 234,
        "timestamp": "2026-01-18T10:00:02Z",
        "step_index": 2
      },
      {
        "log_level": "error",
        "message": "Uncaught TypeError: Cannot read property of null",
        "source": "https://app.example.com/js/utils.js",
        "line_number": 56,
        "stack_trace": "at handleClick (utils.js:56:5)...",
        "timestamp": "2026-01-18T10:00:03Z",
        "step_index": 3
      }
    ]
  }'
```

---

### 6.2 List Console Logs for Result

**Endpoint:** `GET /api/v1/test-run-results/{result_id}/console-logs`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/console-logs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "test_run_result_id": "uuid",
    "log_level": "error",
    "message": "Uncaught TypeError: Cannot read property of null",
    "source": "https://app.example.com/js/utils.js",
    "line_number": 56,
    "step_index": 3,
    "timestamp": "2026-01-18T10:00:03Z",
    "created_at": "2026-01-18T10:00:03Z"
  }
]
```

---

## 7. Network Logs

### 7.1 Create Network Logs (Bulk)

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/network-logs/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/network-logs/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "url": "https://api.example.com/auth/login",
        "method": "POST",
        "status_code": 200,
        "status_text": "OK",
        "content_type": "application/json",
        "resource_type": "xhr",
        "timestamp": "2026-01-18T10:00:05Z",
        "duration_ms": 150,
        "step_index": 4
      },
      {
        "url": "https://api.example.com/users/me",
        "method": "GET",
        "status_code": 401,
        "status_text": "Unauthorized",
        "content_type": "application/json",
        "resource_type": "xhr",
        "timestamp": "2026-01-18T10:00:06Z",
        "duration_ms": 50,
        "error_message": "Token expired",
        "step_index": 5
      }
    ]
  }'
```

---

### 7.2 List Network Logs for Result

**Endpoint:** `GET /api/v1/test-run-results/{result_id}/network-logs`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/network-logs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 8. Script Results

### 8.1 Create Script Result

**Endpoint:** `POST /api/v1/test-run-results/{result_id}/scripts`

**Description:** Record execution of custom scripts (setup, teardown, etc.).

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/scripts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_script_id": "660e8400-e29b-41d4-a716-446655440000",
    "script_name": "Setup Test Data",
    "script_type": "pre",
    "script_language": "javascript",
    "status": "passed",
    "exit_code": 0,
    "duration_ms": 3000,
    "stdout": "Test user created: user_123\nDatabase seeded",
    "stderr": null,
    "is_critical": true,
    "executed_at": "2026-01-18T09:59:57Z"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_run_result_id": "uuid",
  "test_script_id": "uuid",
  "script_name": "Setup Test Data",
  "script_type": "pre",
  "script_language": "javascript",
  "status": "passed",
  "exit_code": 0,
  "duration_ms": 3000,
  "stdout": "Test user created: user_123\nDatabase seeded",
  "stderr": null,
  "error_message": null,
  "is_critical": true,
  "executed_at": "2026-01-18T09:59:57Z",
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

### 8.2 List Script Results

**Endpoint:** `GET /api/v1/test-run-results/{result_id}/scripts`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-results/550e8400-e29b-41d4-a716-446655440000/scripts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 9. Execution History

### 9.1 Get Execution History for Test Case

**Endpoint:** `GET /api/v1/test-cases/{test_case_id}/history`

**Description:** Get execution history for a specific test case.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 10 | Max results (1-100) |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-cases/550e8400-e29b-41d4-a716-446655440000/history?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "test_case_id": "uuid",
  "test_case_name": "Valid Login Test",
  "history": [
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_run_id": "uuid",
      "test_run_result_id": "uuid",
      "status": "passed",
      "executed_at": "2026-01-18T10:00:00Z",
      "duration_ms": 45000,
      "total_steps": 5,
      "passed_steps": 5,
      "failed_steps": 0,
      "pass_rate": 100.0,
      "error_message": null,
      "run_name": "Nightly Regression",
      "is_scheduled": false,
      "created_at": "2026-01-18T10:00:45Z"
    },
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_run_id": "uuid",
      "test_run_result_id": "uuid",
      "status": "failed",
      "executed_at": "2026-01-17T10:00:00Z",
      "duration_ms": 30000,
      "total_steps": 5,
      "passed_steps": 3,
      "failed_steps": 2,
      "pass_rate": 60.0,
      "error_message": "Element not found",
      "run_name": "Nightly Regression",
      "is_scheduled": true,
      "created_at": "2026-01-17T10:00:30Z"
    }
  ],
  "total": 15,
  "statistics": {
    "total_executions": 15,
    "passed": 12,
    "failed": 3,
    "pass_rate": 80.0,
    "avg_duration_ms": 40000,
    "last_executed": "2026-01-18T10:00:00Z",
    "last_status": "passed"
  }
}
```

---

## 10. Test Run Tree

**Base URL:** `http://localhost:8000/api/v1/test-run-tree`

### 10.1 Get Full Tree

**Endpoint:** `GET /api/v1/test-run-tree`

**Description:** Get the full tree structure for the authenticated user.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/test-run-tree" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "structure": {
    "id": "root",
    "name": "Test Runs",
    "type": "folder",
    "expanded": true,
    "children": [
      {
        "id": "uuid",
        "name": "Regression",
        "type": "folder",
        "expanded": true,
        "children": [
          {
            "id": "uuid",
            "name": "Login Tests",
            "type": "testrun",
            "test_cases": ["tc-uuid-1", "tc-uuid-2"],
            "children": []
          }
        ]
      },
      {
        "id": "uuid",
        "name": "Smoke Tests",
        "type": "folder",
        "expanded": false,
        "children": []
      }
    ]
  }
}
```

---

### 10.2 Create Folder

**Endpoint:** `POST /api/v1/test-run-tree/folders`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-tree/folders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Folder",
    "parent_id": null
  }'
```

**cURL (Nested Folder):**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-tree/folders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Subfolder",
    "parent_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "New Folder",
  "type": "folder",
  "parent_id": null,
  "expanded": false,
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

### 10.3 Create Test Run in Tree

**Endpoint:** `POST /api/v1/test-run-tree/testruns`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-tree/testruns" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test Suite",
    "parent_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_cases": [
      "660e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Login Test Suite",
  "type": "testrun",
  "parent_id": "uuid",
  "test_cases": ["uuid-1", "uuid-2"],
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

### 10.4 Update Tree Item

**Endpoint:** `PATCH /api/v1/test-run-tree/items/{item_id}`

**Description:** Rename, move, or toggle expanded state.

**cURL (Rename):**
```bash
curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Renamed Item"
  }'
```

**cURL (Move):**
```bash
curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parent_id": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

**cURL (Toggle Expanded):**
```bash
curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expanded": true
  }'
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Renamed Item",
  "type": "folder",
  "parent_id": null,
  "expanded": true,
  "updated_at": "2026-01-18T10:05:00Z"
}
```

---

### 10.5 Delete Tree Item

**Endpoint:** `DELETE /api/v1/test-run-tree/items/{item_id}`

**Description:** Delete a folder or test run. Folders cascade delete all children.

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "deleted_count": 5
}
```

---

### 10.6 Copy Tree Item

**Endpoint:** `POST /api/v1/test-run-tree/items/{item_id}/copy`

**Description:** Deep copy a folder or test run.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000/copy" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_parent_id": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Login Test Suite (Copy)",
  "type": "testrun",
  "parent_id": "uuid"
}
```

---

### 10.7 Update Test Cases in Test Run

**Endpoint:** `PATCH /api/v1/test-run-tree/testruns/{testrun_id}/test-cases`

**cURL:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/testruns/550e8400-e29b-41d4-a716-446655440000/test-cases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_cases": [
      "660e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001",
      "660e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "test_cases": ["uuid-1", "uuid-2", "uuid-3"],
  "updated_at": "2026-01-18T10:05:00Z"
}
```

---

## 11. Enums Reference

### Test Run Status
| Value | Description |
|-------|-------------|
| pending | Not started |
| queued | Queued for execution |
| running | Currently running |
| completed | Completed successfully |
| cancelled | Cancelled by user |
| failed | Failed with errors |

### Test Run Item Status
| Value | Description |
|-------|-------------|
| pending | Not started |
| queued | Queued |
| running | Running |
| passed | Passed |
| failed | Failed |
| skipped | Skipped |
| no_run | Not executed |

### Test Result Status
| Value | Description |
|-------|-------------|
| passed | Test passed |
| failed | Test failed |
| skipped | Test skipped |

### Log Level
| Value | Description |
|-------|-------------|
| log | Standard log |
| info | Information |
| warn | Warning |
| error | Error |
| debug | Debug |

### Checkpoint Result Type
| Value | Description |
|-------|-------------|
| element | Element verification |
| screenshot | Visual comparison |
| api | API response check |
| download | Download verification |

### Tree Item Type
| Value | Description |
|-------|-------------|
| folder | Folder |
| testrun | Test Run |

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
  "detail": "Test run not found: {id}"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": "Cannot start test run: status is 'running'"
}
```

**400 Bad Request:**
```json
{
  "detail": "Cannot start test run: no test cases added"
}
```
