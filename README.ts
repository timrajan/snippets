# Test Report API Documentation

**Base URL:** `http://localhost:8000/api/v1/reports`
**Authentication:** Bearer Token (JWT) required for all endpoints

---

## Table of Contents
1. [Suite Runs](#1-suite-runs)
2. [Test Case Results](#2-test-case-results)
3. [Step Results](#3-step-results)
4. [Checkpoint Results](#4-checkpoint-results)
5. [Console Logs](#5-console-logs)
6. [Network Logs](#6-network-logs)
7. [Environment Info](#7-environment-info)
8. [Script Results](#8-script-results)
9. [Accessibility Violations](#9-accessibility-violations)
10. [Execution History](#10-execution-history)
11. [Enums Reference](#11-enums-reference)

---

## 1. Suite Runs

### 1.1 Create Suite Run

**Endpoint:** `POST /api/v1/reports/suite-runs`

**Description:** Create a new suite run to track a test execution session.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/suite-runs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suite_name": "Login Test Suite",
    "suite_path": ["Authentication", "Login"],
    "test_plan_id": "550e8400-e29b-41d4-a716-446655440000",
    "trigger_type": "manual",
    "trigger_source": "UI",
    "tags": ["regression", "smoke"],
    "notes": "Nightly regression run"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| suite_name | string | Yes | Name of the test suite |
| suite_path | array | Yes | Hierarchical path to the suite |
| test_plan_id | UUID | No | Associated test plan ID |
| trigger_type | string | No | "manual", "scheduled", "api" |
| trigger_source | string | No | Source that triggered the run |
| tags | array | No | Tags for categorization |
| notes | string | No | Additional notes |

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "suite_name": "Login Test Suite",
  "suite_path": ["Authentication", "Login"],
  "test_plan_id": "uuid",
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": null,
  "duration_ms": null,
  "status": "running",
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": null,
  "browser_name": null,
  "browser_version": null,
  "os_name": null,
  "os_version": null,
  "trigger_type": "manual",
  "trigger_source": "UI",
  "tags": ["regression", "smoke"],
  "notes": "Nightly regression run",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

---

### 1.2 List Suite Runs

**Endpoint:** `GET /api/v1/reports/suite-runs`

**Description:** List suite runs with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status |
| test_plan_id | UUID | - | Filter by test plan |
| from_date | datetime | - | Started after (ISO 8601) |
| to_date | datetime | - | Started before (ISO 8601) |
| search | string | - | Search in suite name |
| page | int | 1 | Page number |
| page_size | int | 20 | Items per page (max 100) |
| sort_by | string | "started_at" | Sort field |
| sort_order | string | "desc" | "asc" or "desc" |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/suite-runs?status=completed&page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "total": 45,
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "suite_name": "Login Test Suite",
      "suite_path": ["Authentication", "Login"],
      "started_at": "2026-01-18T10:00:00Z",
      "completed_at": "2026-01-18T10:15:00Z",
      "duration_ms": 900000,
      "status": "completed",
      "total_tests": 10,
      "passed_tests": 8,
      "failed_tests": 2,
      "skipped_tests": 0,
      "no_run_tests": 0,
      "pass_rate": 80.0,
      "browser_name": "Chrome",
      "browser_version": "120.0.0",
      "os_name": "Windows",
      "os_version": "11",
      "trigger_type": "manual",
      "tags": ["regression"],
      "created_at": "2026-01-18T10:00:00Z",
      "updated_at": "2026-01-18T10:15:00Z"
    }
  ]
}
```

---

### 1.3 Get Suite Run Detail

**Endpoint:** `GET /api/v1/reports/suite-runs/{suite_run_id}`

**Description:** Get suite run with full details including test case results summary.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/suite-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "suite_name": "Login Test Suite",
  "suite_path": ["Authentication", "Login"],
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": "2026-01-18T10:15:00Z",
  "duration_ms": 900000,
  "status": "completed",
  "total_tests": 10,
  "passed_tests": 8,
  "failed_tests": 2,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": 80.0,
  "browser_name": "Chrome",
  "browser_version": "120.0.0",
  "os_name": "Windows",
  "os_version": "11",
  "trigger_type": "manual",
  "tags": ["regression"],
  "test_case_results": [
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_case_name": "Valid Login",
      "test_case_path": ["Authentication", "Login", "Valid Login"],
      "status": "passed",
      "duration_ms": 45000,
      "pass_rate": 100.0,
      "total_steps": 5,
      "passed_steps": 5,
      "failed_steps": 0,
      "error_message": null,
      "started_at": "2026-01-18T10:00:00Z",
      "completed_at": "2026-01-18T10:00:45Z"
    },
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_case_name": "Invalid Password",
      "test_case_path": ["Authentication", "Login", "Invalid Password"],
      "status": "failed",
      "duration_ms": 30000,
      "pass_rate": 60.0,
      "total_steps": 5,
      "passed_steps": 3,
      "failed_steps": 2,
      "error_message": "Element not found: #error-message",
      "started_at": "2026-01-18T10:00:45Z",
      "completed_at": "2026-01-18T10:01:15Z"
    }
  ],
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:15:00Z"
}
```

---

### 1.4 Update Suite Run

**Endpoint:** `PATCH /api/v1/reports/suite-runs/{suite_run_id}`

**Description:** Update a suite run (typically to mark completion or update metrics).

**cURL:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/reports/suite-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "completed_at": "2026-01-18T10:15:00Z",
    "duration_ms": 900000,
    "total_tests": 10,
    "passed_tests": 8,
    "failed_tests": 2,
    "skipped_tests": 0,
    "no_run_tests": 0,
    "pass_rate": 80.0,
    "browser_name": "Chrome",
    "browser_version": "120.0.0",
    "os_name": "Windows",
    "os_version": "11"
  }'
```

**Response (200 OK):** Returns updated suite run object.

---

### 1.5 Delete Suite Run

**Endpoint:** `DELETE /api/v1/reports/suite-runs/{suite_run_id}`

**Description:** Delete suite run and all related data (test results, steps, logs, etc.).

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/reports/suite-runs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "deleted": {
    "suite_run": 1,
    "test_case_results": 10,
    "step_results": 50,
    "checkpoint_results": 25,
    "console_logs": 100,
    "network_logs": 200
  }
}
```

---

### 1.6 Get Suite Test Cases

**Endpoint:** `GET /api/v1/reports/suite-runs/{suite_run_id}/test-cases`

**Description:** Get all test case results for a suite run.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/suite-runs/550e8400-e29b-41d4-a716-446655440000/test-cases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):** Array of test case result summaries.

---

## 2. Test Case Results

### 2.1 Create Test Case Result

**Endpoint:** `POST /api/v1/reports/test-case-results`

**Description:** Create a new test case result within a suite run.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/test-case-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suite_run_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_case_id": "660e8400-e29b-41d4-a716-446655440000",
    "test_case_name": "Valid Login Test",
    "test_case_path": ["Authentication", "Login", "Valid Login"],
    "iteration_number": 1,
    "base_url": "https://app.example.com",
    "tags": ["smoke", "critical"]
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "suite_run_id": "uuid",
  "user_id": "uuid",
  "test_case_id": "uuid",
  "test_case_name": "Valid Login Test",
  "test_case_path": ["Authentication", "Login", "Valid Login"],
  "iteration_number": 1,
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": null,
  "duration_ms": null,
  "status": "running",
  "total_steps": 0,
  "passed_steps": 0,
  "failed_steps": 0,
  "skipped_steps": 0,
  "pass_rate": null,
  "total_checkpoints": null,
  "passed_checkpoints": null,
  "failed_checkpoints": null,
  "error_message": null,
  "error_step_number": null,
  "failure_screenshot_url": null,
  "base_url": "https://app.example.com",
  "tags": ["smoke", "critical"],
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

---

### 2.2 Get Test Case Result

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}`

**Description:** Get a test case result.

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.3 Get Test Case Result (Full Detail)

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/full`

**Description:** Get complete test case result with all related data (steps, checkpoints, logs, environment, etc.).

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/full" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "suite_run_id": "uuid",
  "test_case_name": "Valid Login Test",
  "test_case_path": ["Authentication", "Login"],
  "status": "passed",
  "duration_ms": 45000,
  "total_steps": 5,
  "passed_steps": 5,
  "failed_steps": 0,
  "steps": [
    {
      "id": "uuid",
      "step_number": 1,
      "action_type": "goto",
      "description": "Navigate to login page",
      "status": "passed",
      "duration_ms": 1500,
      "screenshot_url": "screenshots/step1.png"
    }
  ],
  "checkpoints": [
    {
      "id": "uuid",
      "checkpoint_name": "Verify login button visible",
      "checkpoint_type": "element",
      "passed": true,
      "selector": "#login-btn",
      "expected_value": "visible",
      "actual_value": "visible"
    }
  ],
  "console_logs": [
    {
      "id": "uuid",
      "level": "log",
      "message": "Page loaded successfully",
      "timestamp": "2026-01-18T10:00:01Z"
    }
  ],
  "network_logs": [
    {
      "id": "uuid",
      "method": "GET",
      "url": "https://app.example.com/login",
      "status_code": 200,
      "duration_ms": 150
    }
  ],
  "environment": {
    "browser_name": "Chrome",
    "browser_version": "120.0.0",
    "os_name": "Windows",
    "os_version": "11",
    "viewport_width": 1920,
    "viewport_height": 1080
  },
  "script_results": [],
  "accessibility_violations": []
}
```

---

### 2.4 Update Test Case Result

**Endpoint:** `PATCH /api/v1/reports/test-case-results/{result_id}`

**Description:** Update a test case result (typically to mark completion).

**cURL:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "passed",
    "completed_at": "2026-01-18T10:00:45Z",
    "duration_ms": 45000,
    "total_steps": 5,
    "passed_steps": 5,
    "failed_steps": 0,
    "skipped_steps": 0,
    "pass_rate": 100.0,
    "total_checkpoints": 3,
    "passed_checkpoints": 3,
    "failed_checkpoints": 0
  }'
```

---

### 2.5 Delete Test Case Result

**Endpoint:** `DELETE /api/v1/reports/test-case-results/{result_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

### 2.6 Get Test Case Steps

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/steps`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/steps" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.7 Get Test Case Checkpoints

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/checkpoints`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/checkpoints" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.8 Get Test Case Console Logs

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/logs/console`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| level | string | - | Filter by log level |
| step_number | int | - | Filter by step number |
| search | string | - | Search in message |
| limit | int | 100 | Max results (1-1000) |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/logs/console?level=error&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.9 Get Test Case Network Logs

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/logs/network`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status_code | int | - | Filter by HTTP status |
| is_error | bool | - | Filter errors only |
| resource_type | string | - | Filter by resource type |
| limit | int | 100 | Max results (1-1000) |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/logs/network?is_error=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.10 Get Test Case Environment

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/environment`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/environment" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.11 Get Test Case Accessibility Violations

**Endpoint:** `GET /api/v1/reports/test-case-results/{result_id}/accessibility`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-case-results/550e8400-e29b-41d4-a716-446655440000/accessibility" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Step Results

### 3.1 Create Step Result

**Endpoint:** `POST /api/v1/reports/step-results`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/step-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "step_number": 1,
    "action_type": "goto",
    "description": "Navigate to login page",
    "target_selector": null,
    "input_value": null,
    "playwright_code": "await page.goto(\"https://app.example.com/login\")",
    "page_url": "https://app.example.com/login",
    "page_title": "Login - App"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_case_result_id": "uuid",
  "step_number": 1,
  "action_type": "goto",
  "description": "Navigate to login page",
  "target_selector": null,
  "input_value": null,
  "started_at": null,
  "completed_at": null,
  "duration_ms": null,
  "status": "pending",
  "error_message": null,
  "error_type": null,
  "screenshot_url": null,
  "screenshot_thumbnail_url": null,
  "playwright_code": "await page.goto(\"https://app.example.com/login\")",
  "page_url": "https://app.example.com/login",
  "page_title": "Login - App",
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

### 3.2 Create Step Results (Bulk)

**Endpoint:** `POST /api/v1/reports/step-results/bulk`

**Description:** Create multiple step results at once.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/step-results/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "steps": [
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "step_number": 1,
        "action_type": "goto",
        "description": "Navigate to login page"
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "step_number": 2,
        "action_type": "fill",
        "description": "Enter username",
        "target_selector": "#username",
        "input_value": "testuser"
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "step_number": 3,
        "action_type": "fill",
        "description": "Enter password",
        "target_selector": "#password",
        "input_value": "***"
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "step_number": 4,
        "action_type": "click",
        "description": "Click login button",
        "target_selector": "#login-btn"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "created": 4,
  "step_ids": [
    "uuid-1",
    "uuid-2",
    "uuid-3",
    "uuid-4"
  ]
}
```

---

### 3.3 Get Step Result

**Endpoint:** `GET /api/v1/reports/step-results/{step_id}`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/step-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3.4 Update Step Result

**Endpoint:** `PATCH /api/v1/reports/step-results/{step_id}`

**cURL:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/reports/step-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "passed",
    "started_at": "2026-01-18T10:00:00Z",
    "completed_at": "2026-01-18T10:00:02Z",
    "duration_ms": 2000,
    "screenshot_url": "screenshots/step1.png"
  }'
```

---

### 3.5 Delete Step Result

**Endpoint:** `DELETE /api/v1/reports/step-results/{step_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/reports/step-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

## 4. Checkpoint Results

### 4.1 Create Checkpoint Result

**Endpoint:** `POST /api/v1/reports/checkpoint-results`

**cURL (Element Checkpoint):**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/checkpoint-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_case_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "checkpoint_name": "Verify login button is visible",
    "checkpoint_type": "element",
    "selector": "#login-btn",
    "element_tag": "button",
    "element_text": "Login",
    "property_name": "visibility",
    "operator": "equals",
    "expected_value": "visible",
    "actual_value": "visible",
    "passed": true
  }'
```

**cURL (Screenshot Checkpoint):**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/checkpoint-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_case_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "checkpoint_name": "Visual comparison - Login page",
    "checkpoint_type": "screenshot",
    "passed": true,
    "baseline_screenshot_url": "baselines/login.png",
    "actual_screenshot_url": "actual/login.png",
    "diff_screenshot_url": null,
    "similarity_score": 99.5
  }'
```

**cURL (API Checkpoint):**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/checkpoint-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_case_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "checkpoint_name": "Verify auth API response",
    "checkpoint_type": "api",
    "passed": true,
    "api_endpoint": "/api/auth/login",
    "api_method": "POST",
    "api_request_body": {"username": "test", "password": "***"},
    "api_response_status": 200,
    "api_response_body": {"token": "jwt...", "user": {...}}
  }'
```

---

### 4.2 Create Checkpoint Results (Bulk)

**Endpoint:** `POST /api/v1/reports/checkpoint-results/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/checkpoint-results/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "checkpoints": [
      {
        "step_result_id": "uuid-1",
        "test_case_result_id": "uuid",
        "checkpoint_name": "Check 1",
        "checkpoint_type": "element",
        "passed": true
      },
      {
        "step_result_id": "uuid-2",
        "test_case_result_id": "uuid",
        "checkpoint_name": "Check 2",
        "checkpoint_type": "element",
        "passed": false,
        "error_message": "Element not found"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "created": 2
}
```

---

### 4.3 Get Checkpoint Result

**Endpoint:** `GET /api/v1/reports/checkpoint-results/{checkpoint_id}`

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/checkpoint-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4.4 Delete Checkpoint Result

**Endpoint:** `DELETE /api/v1/reports/checkpoint-results/{checkpoint_id}`

**cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/reports/checkpoint-results/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

## 5. Console Logs

### 5.1 Create Console Log

**Endpoint:** `POST /api/v1/reports/console-logs`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/console-logs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-18T10:00:01Z",
    "level": "error",
    "message": "Uncaught TypeError: Cannot read property of null",
    "source_url": "https://app.example.com/js/app.js",
    "source_line": 234,
    "source_column": 15,
    "step_number": 3
  }'
```

---

### 5.2 Create Console Logs (Bulk)

**Endpoint:** `POST /api/v1/reports/console-logs/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/console-logs/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "logs": [
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2026-01-18T10:00:01Z",
        "level": "log",
        "message": "Page loaded"
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2026-01-18T10:00:02Z",
        "level": "warn",
        "message": "Deprecated API usage"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "created": 2
}
```

---

## 6. Network Logs

### 6.1 Create Network Log

**Endpoint:** `POST /api/v1/reports/network-logs`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/network-logs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-18T10:00:01Z",
    "method": "POST",
    "url": "https://api.example.com/auth/login",
    "request_headers": {
      "Content-Type": "application/json"
    },
    "request_body": "{\"username\":\"test\"}",
    "status_code": 200,
    "status_text": "OK",
    "response_headers": {
      "Content-Type": "application/json"
    },
    "response_body_preview": "{\"token\":\"jwt...\"}",
    "response_size_bytes": 256,
    "duration_ms": 150,
    "resource_type": "xhr",
    "is_error": false,
    "step_number": 4
  }'
```

---

### 6.2 Create Network Logs (Bulk)

**Endpoint:** `POST /api/v1/reports/network-logs/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/network-logs/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "logs": [
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2026-01-18T10:00:01Z",
        "method": "GET",
        "url": "https://app.example.com/login",
        "status_code": 200,
        "duration_ms": 100,
        "resource_type": "document",
        "is_error": false
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2026-01-18T10:00:02Z",
        "method": "GET",
        "url": "https://api.example.com/users/me",
        "status_code": 401,
        "duration_ms": 50,
        "resource_type": "xhr",
        "is_error": true
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "created": 2
}
```

---

## 7. Environment Info

### 7.1 Create Environment Info

**Endpoint:** `POST /api/v1/reports/environment-info`

**Description:** Create environment info for a test case result.

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/environment-info" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "browser_name": "Chrome",
    "browser_version": "120.0.6099.109",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "js_engine": "V8",
    "os_name": "Windows",
    "os_version": "11",
    "os_architecture": "x64",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "device_pixel_ratio": 1.0,
    "screen_width": 1920,
    "screen_height": 1080,
    "zoom_level": 100,
    "language": "en-US",
    "timezone": "America/New_York",
    "is_online": true,
    "connection_type": "wifi",
    "app_version": "2.5.0",
    "custom_properties": {
      "test_env": "staging",
      "feature_flags": ["new-ui", "dark-mode"]
    }
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_case_result_id": "uuid",
  "browser_name": "Chrome",
  "browser_version": "120.0.6099.109",
  "user_agent": "Mozilla/5.0...",
  "os_name": "Windows",
  "os_version": "11",
  "viewport_width": 1920,
  "viewport_height": 1080,
  "language": "en-US",
  "timezone": "America/New_York",
  "custom_properties": {...},
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

## 8. Script Results

### 8.1 Create Script Result

**Endpoint:** `POST /api/v1/reports/script-results`

**Description:** Record execution of custom scripts (setup, teardown, etc.).

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/script-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "script_type": "setup",
    "script_name": "Initialize test data",
    "started_at": "2026-01-18T09:59:55Z",
    "completed_at": "2026-01-18T09:59:58Z",
    "duration_ms": 3000,
    "status": "passed",
    "script_code": "await createTestUser(); await seedDatabase();",
    "output": "Test user created: user_123\nDatabase seeded with 10 records",
    "error_message": null
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_case_result_id": "uuid",
  "script_type": "setup",
  "script_name": "Initialize test data",
  "started_at": "2026-01-18T09:59:55Z",
  "completed_at": "2026-01-18T09:59:58Z",
  "duration_ms": 3000,
  "status": "passed",
  "output": "Test user created...",
  "error_message": null,
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

## 9. Accessibility Violations

### 9.1 Create Accessibility Violation

**Endpoint:** `POST /api/v1/reports/accessibility-violations`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/accessibility-violations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "step_result_id": "660e8400-e29b-41d4-a716-446655440000",
    "rule_id": "color-contrast",
    "rule_description": "Elements must have sufficient color contrast",
    "impact": "serious",
    "selector": "#submit-btn",
    "element_html": "<button id=\"submit-btn\" style=\"color: #777\">Submit</button>",
    "wcag_tags": ["wcag2aa", "wcag143"],
    "help_url": "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
    "failure_summary": "Element has insufficient color contrast of 3.5:1 (foreground color: #777777, background color: #ffffff, font size: 14.0pt, font weight: normal). Expected contrast ratio of 4.5:1",
    "fix_suggestion": "Change text color to #595959 or darker for sufficient contrast"
  }'
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "test_case_result_id": "uuid",
  "step_result_id": "uuid",
  "rule_id": "color-contrast",
  "rule_description": "Elements must have sufficient color contrast",
  "impact": "serious",
  "selector": "#submit-btn",
  "wcag_tags": ["wcag2aa", "wcag143"],
  "help_url": "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
  "failure_summary": "Element has insufficient color contrast...",
  "fix_suggestion": "Change text color to #595959 or darker",
  "created_at": "2026-01-18T10:00:00Z"
}
```

---

### 9.2 Create Accessibility Violations (Bulk)

**Endpoint:** `POST /api/v1/reports/accessibility-violations/bulk`

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/accessibility-violations/bulk" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
    "violations": [
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "rule_id": "color-contrast",
        "impact": "serious",
        "selector": "#btn1"
      },
      {
        "test_case_result_id": "550e8400-e29b-41d4-a716-446655440000",
        "rule_id": "image-alt",
        "impact": "critical",
        "selector": "img.logo"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "created": 2
}
```

---

## 10. Execution History

### 10.1 Get Test Case Execution History

**Endpoint:** `GET /api/v1/reports/test-cases/{test_case_id}/execution-history`

**Description:** Get execution history for a specific test case.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status |
| limit | int | 50 | Max results (1-100) |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/test-cases/550e8400-e29b-41d4-a716-446655440000/execution-history?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "total": 15,
  "items": [
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_case_result_id": "uuid",
      "suite_run_id": "uuid",
      "suite_name": "Login Suite",
      "executed_at": "2026-01-18T10:00:00Z",
      "status": "passed",
      "duration_ms": 45000,
      "pass_rate": 100.0,
      "created_at": "2026-01-18T10:00:00Z"
    },
    {
      "id": "uuid",
      "test_case_id": "uuid",
      "test_case_result_id": "uuid",
      "suite_run_id": "uuid",
      "suite_name": "Login Suite",
      "executed_at": "2026-01-17T10:00:00Z",
      "status": "failed",
      "duration_ms": 30000,
      "pass_rate": 60.0,
      "created_at": "2026-01-17T10:00:00Z"
    }
  ]
}
```

---

### 10.2 Get Recent Execution History

**Endpoint:** `GET /api/v1/reports/execution-history/recent`

**Description:** Get recent execution history across all test cases.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 20 | Max results (1-100) |

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/reports/execution-history/recent?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 11. Enums Reference

### Execution Status
| Value | Description |
|-------|-------------|
| pending | Not yet started |
| running | Currently executing |
| passed | Completed successfully |
| failed | Completed with failures |
| skipped | Skipped execution |
| cancelled | Cancelled by user |

### Suite Run Status
| Value | Description |
|-------|-------------|
| running | Suite is running |
| completed | Suite completed |
| failed | Suite failed |
| cancelled | Suite cancelled |

### Trigger Type
| Value | Description |
|-------|-------------|
| manual | Manual trigger |
| scheduled | Scheduled execution |
| api | API triggered |

### Log Level
| Value | Description |
|-------|-------------|
| log | Standard log |
| info | Information |
| warn | Warning |
| error | Error |
| debug | Debug |

### Checkpoint Type
| Value | Description |
|-------|-------------|
| element | Element verification |
| screenshot | Visual comparison |
| api | API response check |
| accessibility | Accessibility check |
| custom | Custom checkpoint |

### Action Type
| Value | Description |
|-------|-------------|
| goto | Navigate to URL |
| click | Click element |
| fill | Fill input field |
| select | Select dropdown option |
| check | Check checkbox |
| uncheck | Uncheck checkbox |
| hover | Hover over element |
| wait | Wait for condition |
| scroll | Scroll page/element |
| press | Press key |
| screenshot | Take screenshot |
| assertion | Make assertion |
| custom | Custom action |

### Impact Level (Accessibility)
| Value | Description |
|-------|-------------|
| minor | Minor impact |
| moderate | Moderate impact |
| serious | Serious impact |
| critical | Critical impact |

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
  "detail": "Suite run not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "suite_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
