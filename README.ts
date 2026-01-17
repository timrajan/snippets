  1. POST /variables/test-case/98fca6be-92fa-4018-8fc6-57ced0cf2aca -> 201 (Created successfully)                                                                                                              
  2. GET /variables/test-case/98fca6be-92fa-4018-8fc6-57ced0cf2aca -> 200 returns 2 variables   


Get all variables (global + local) for a test case:                                                                                                                                                                                                            SELECT
      v.id,                                                                                                                                                                                                                                                    
      v.name,
      v.type,
      v.value,
      v.scope,
      tc.name AS test_case_name
  FROM variables v
  LEFT JOIN test_cases tc ON v.test_case_id = tc.id
  WHERE v.scope = 'global'
     OR tc.name = 'your_test_case_name'
  ORDER BY v.scope DESC, v.name;

  Get merged variables (local overrides global with same name):
  SELECT DISTINCT ON (v.name)
      v.id,
      v.name,
      v.type,
      v.value,
      v.scope
  FROM variables v
  LEFT JOIN test_cases tc ON v.test_case_id = tc.id
  WHERE v.scope = 'global'
     OR tc.name = 'your_test_case_name'
  ORDER BY v.name, v.scope DESC;

  Get only local variables for a test case:
  SELECT v.id, v.name, v.type, v.value, v.scope
  FROM variables v
  JOIN test_cases tc ON v.test_case_id = tc.id
  WHERE tc.name = 'your_test_case_name'
    AND v.scope = 'local'
  ORDER BY v.name;

  Get only global variables:
  SELECT id, name, type, value, scope
  FROM variables
  WHERE scope = 'global'
  ORDER BY name;




Let me read the router files to provide comprehensive API documentation.                                                                                                                                                                                     
  
● Read(app\routers\test_runs.py)                                                                                                                                                                                                                                 ⎿  Read 1011 lines
                                                                                                                                                                                                                                                               
● Read(app\schemas\test_run.py)
  ⎿  Read 786 lines                                                                                                                                                                                                                                            
  
● Here is the complete API documentation for the Test Run module:                                                                                                                                                                                              
                                                                                                                                                                                                                                                                 ---                                                                                                                                                                                                                                                            Test Run Module - API Documentation                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                 Base URL: /api/v1

  Authentication: All endpoints require Bearer token in the Authorization header.

  ---
  1. Test Runs

  Create Test Run

  POST /api/v1/test-runs

  Request Body:
  {
    "run_name": "string (required, 1-255 chars)",
    "test_plan_id": "uuid (required)",
    "suite_path": ["string"] | null,
    "suite_name": "string" | null,
    "scheduled_at": "datetime" | null,
    "parallel_enabled": false,
    "parallel_count": 1,
    "retry_on_failure": false,
    "retry_count": 0,
    "browser_name": "string" | null,
    "viewport_width": 320-3840 | null,
    "viewport_height": 240-2160 | null,
    "tags": ["string"] | null,
    "notes": "string" | null
  }

  Response: 201 Created
  {
    "id": "uuid",
    "run_name": "string",
    "run_number": 1,
    "test_plan_id": "uuid",
    "created_by": "uuid",
    "suite_path": ["string"],
    "suite_name": "string",
    "status": "pending",
    "scheduled_at": "datetime",
    "started_at": null,
    "completed_at": null,
    "duration_ms": 0,
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "skipped_tests": 0,
    "no_run_tests": 0,
    "pass_rate": 0.00,
    "parallel_enabled": false,
    "parallel_count": 1,
    "retry_on_failure": false,
    "retry_count": 0,
    "browser_name": "string",
    "browser_version": null,
    "os_name": null,
    "os_version": null,
    "viewport_width": 1920,
    "viewport_height": 1080,
    "results_folder": null,
    "report_path": null,
    "tags": ["string"],
    "notes": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }

  ---
  List Test Runs

  GET /api/v1/test-runs

  Query Parameters:
  ┌──────────────┬──────────┬──────────────┬───────────────────────────────────────────────────────────────────────────┐
  │  Parameter   │   Type   │   Default    │                                Description                                │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ test_plan_id │ uuid     │ null         │ Filter by test plan                                                       │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ status       │ string   │ null         │ Filter by status (pending, queued, running, completed, cancelled, failed) │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ from_date    │ datetime │ null         │ Start date filter                                                         │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ to_date      │ datetime │ null         │ End date filter                                                           │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ search       │ string   │ null         │ Search in run_name                                                        │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ sort_by      │ string   │ "created_at" │ Sort field                                                                │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ sort_order   │ string   │ "desc"       │ Sort order (asc/desc)                                                     │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ limit        │ int      │ 20           │ Page size (1-100)                                                         │
  ├──────────────┼──────────┼──────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ offset       │ int      │ 0            │ Page offset                                                               │
  └──────────────┴──────────┴──────────────┴───────────────────────────────────────────────────────────────────────────┘
  Response: 200 OK
  {
    "items": [TestRunResponse],
    "total": 100,
    "limit": 20,
    "offset": 0
  }

  ---
  Get Test Run

  GET /api/v1/test-runs/{run_id}

  Response: 200 OK - TestRunResponse

  ---
  Update Test Run

  PUT /api/v1/test-runs/{run_id}

  Request Body:
  {
    "run_name": "string" | null,
    "status": "pending|queued|running|completed|cancelled|failed" | null,
    "scheduled_at": "datetime" | null,
    "started_at": "datetime" | null,
    "completed_at": "datetime" | null,
    "duration_ms": 0,
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "skipped_tests": 0,
    "no_run_tests": 0,
    "pass_rate": 0.00,
    "browser_name": "string",
    "browser_version": "string",
    "os_name": "string",
    "os_version": "string",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "results_folder": "string",
    "report_path": "string",
    "tags": ["string"],
    "notes": "string"
  }

  Response: 200 OK - TestRunResponse

  ---
  Delete Test Run

  DELETE /api/v1/test-runs/{run_id}

  Response: 204 No Content

  ---
  Start Test Run

  POST /api/v1/test-runs/{run_id}/start

  Request Body:
  {
    "browser_name": "chromium",
    "viewport_width": 1920,
    "viewport_height": 1080
  }

  Response: 200 OK
  {
    "id": "uuid",
    "status": "running",
    "started_at": "datetime",
    "message": "Test run started with 5 test cases"
  }

  ---
  Stop Test Run

  POST /api/v1/test-runs/{run_id}/stop

  Response: 200 OK - TestRunResponse

  ---
  Cancel Test Run

  POST /api/v1/test-runs/{run_id}/cancel

  Response: 200 OK - TestRunResponse

  ---
  Get Test Run Summary

  GET /api/v1/test-runs/{run_id}/summary

  Response: 200 OK
  {
    "id": "uuid",
    "run_name": "string",
    "status": "string",
    "started_at": "datetime",
    "completed_at": "datetime",
    "duration_ms": 0,
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
        "test_case_name": "Login Test",
        "status": "passed",
        "duration_ms": 5000,
        "pass_rate": 100.0,
        "error_message": null
      }
    ]
  }

  ---
  2. Test Run Items

  Add Single Test Case to Run

  POST /api/v1/test-runs/{run_id}/items

  Request Body:
  {
    "test_case_id": "uuid"
  }

  Response: 201 Created - TestRunItemResponse

  ---
  Add Multiple Test Cases (Bulk)

  POST /api/v1/test-runs/{run_id}/items/bulk

  Request Body:
  {
    "test_case_ids": ["uuid1", "uuid2", "uuid3"]
  }

  Response: 201 Created
  {
    "items": [TestRunItemResponse],
    "total_added": 3
  }

  ---
  List Items in Run

  GET /api/v1/test-runs/{run_id}/items

  Response: 200 OK - Array of TestRunItemResponse

  TestRunItemResponse:
  {
    "id": "uuid",
    "test_run_id": "uuid",
    "test_case_id": "uuid",
    "execution_order": 1,
    "status": "pending|queued|running|passed|failed|skipped|no_run",
    "started_at": "datetime",
    "completed_at": "datetime",
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
    "error_screenshot_path": null,
    "results_folder": null,
    "created_at": "datetime",
    "updated_at": "datetime"
  }

  ---
  Get Single Item

  GET /api/v1/test-runs/{run_id}/items/{item_id}

  Response: 200 OK - TestRunItemResponse

  ---
  Update Item

  PUT /api/v1/test-runs/{run_id}/items/{item_id}

  Request Body:
  {
    "execution_order": 1,
    "status": "passed",
    "started_at": "datetime",
    "completed_at": "datetime",
    "duration_ms": 5000,
    "total_steps": 10,
    "passed_steps": 9,
    "failed_steps": 1,
    "skipped_steps": 0,
    "total_checkpoints": 5,
    "passed_checkpoints": 4,
    "failed_checkpoints": 1,
    "error_message": "Element not found",
    "error_screenshot_path": "/path/to/screenshot.png",
    "results_folder": "/results/run1/item1"
  }

  Response: 200 OK - TestRunItemResponse

  ---
  Delete Item

  DELETE /api/v1/test-runs/{run_id}/items/{item_id}

  Response: 204 No Content

  ---
  Reorder Items

  POST /api/v1/test-runs/{run_id}/items/reorder

  Request Body:
  {
    "item_ids": ["uuid3", "uuid1", "uuid2"]
  }

  Response: 200 OK - Array of TestRunItemResponse (in new order)

  ---
  3. Test Run Results

  Create Test Result

  POST /api/v1/test-run-results

  Request Body:
  {
    "test_run_id": "uuid",
    "test_run_item_id": "uuid",
    "test_case_id": "uuid",
    "iteration_number": 1,
    "data_row_index": 0,
    "data_row_values": {"username": "test", "password": "123"},
    "status": "passed|failed|skipped",
    "started_at": "datetime",
    "completed_at": "datetime",
    "duration_ms": 5000,
    "total_steps": 10,
    "passed_steps": 9,
    "failed_steps": 1,
    "skipped_steps": 0,
    "pass_rate": 90.0,
    "total_checkpoints": 5,
    "passed_checkpoints": 4,
    "failed_checkpoints": 1,
    "checkpoint_pass_rate": 80.0,
    "error_message": null,
    "error_step_number": null,
    "initial_url": "https://example.com",
    "final_url": "https://example.com/dashboard",
    "results_folder": "/results/run1/item1/iter1",
    "report_path": "/reports/run1.html",
    "retry_attempt": 0,
    "environment_info": {"browser": "chromium", "os": "Windows"}
  }

  Response: 201 Created - TestRunResultResponse

  ---
  Get Test Result

  GET /api/v1/test-run-results/{result_id}

  Response: 200 OK - TestRunResultResponse

  ---
  List Results for Run

  GET /api/v1/test-runs/{run_id}/results

  Response: 200 OK - Array of TestRunResultResponse

  ---
  List Results for Item

  GET /api/v1/test-run-items/{item_id}/results

  Response: 200 OK - Array of TestRunResultResponse

  ---
  4. Step Results

  List Steps for Result

  GET /api/v1/test-run-results/{result_id}/steps

  Response: 200 OK
  [
    {
      "id": "uuid",
      "test_run_result_id": "uuid",
      "step_number": 1,
      "action": "click",
      "description": "Click login button",
      "status": "passed|failed|skipped",
      "started_at": "datetime",
      "completed_at": "datetime",
      "duration_ms": 500,
      "selector": "#login-btn",
      "element_html": "<button id=\"login-btn\">Login</button>",
      "input_value": null,
      "screenshot_path": "/screenshots/step1.png",
      "screenshot_url": "https://cdn.example.com/step1.png",
      "error_message": null,
      "playwright_code": "await page.click('#login-btn')",
      "window_id": "main",
      "window_title": "Login Page",
      "created_at": "datetime"
    }
  ]

  ---
  Add Single Step

  POST /api/v1/test-run-results/{result_id}/steps

  Request Body:
  {
    "step_number": 1,
    "action": "click",
    "description": "Click login button",
    "status": "passed",
    "started_at": "datetime",
    "completed_at": "datetime",
    "duration_ms": 500,
    "selector": "#login-btn",
    "element_html": "<button>Login</button>",
    "input_value": null,
    "screenshot_path": "/path/to/screenshot.png",
    "screenshot_url": null,
    "error_message": null,
    "playwright_code": "await page.click('#login-btn')",
    "window_id": "main",
    "window_title": "Login Page"
  }

  Response: 201 Created - TestStepResultResponse

  ---
  Add Multiple Steps (Bulk)

  POST /api/v1/test-run-results/{result_id}/steps/bulk

  Request Body:
  {
    "steps": [
      {
        "step_number": 1,
        "action": "navigate",
        "description": "Open login page",
        "status": "passed",
        "duration_ms": 1000
      },
      {
        "step_number": 2,
        "action": "fill",
        "description": "Enter username",
        "status": "passed",
        "selector": "#username",
        "input_value": "testuser",
        "duration_ms": 200
      }
    ]
  }

  Response: 201 Created - Array of TestStepResultResponse

  ---
  5. Checkpoint Results

  List Checkpoints for Result

  GET /api/v1/test-run-results/{result_id}/checkpoints

  Response: 200 OK
  [
    {
      "id": "uuid",
      "test_run_result_id": "uuid",
      "test_step_result_id": "uuid",
      "checkpoint_name": "Login Button Visible",
      "checkpoint_type": "element|screenshot|api|download",
      "status": "passed|failed|skipped",
      "selector": "#login-btn",
      "profile": "desktop",
      "expected_properties": {"visible": true, "enabled": true},
      "actual_properties": {"visible": true, "enabled": true},
      "failed_properties": [],
      "property_verifications": [
        {"property": "visible", "expected": true, "actual": true, "passed": true}
      ],
      "diff_percentage": null,
      "error_message": null,
      "created_at": "datetime"
    }
  ]

  ---
  Add Checkpoint Result

  POST /api/v1/test-run-results/{result_id}/checkpoints

  Request Body:
  {
    "test_step_result_id": "uuid",
    "checkpoint_name": "Login Button Check",
    "checkpoint_type": "element",
    "status": "passed",
    "selector": "#login-btn",
    "profile": "desktop",
    "expected_properties": {"visible": true, "enabled": true},
    "actual_properties": {"visible": true, "enabled": true},
    "failed_properties": [],
    "property_verifications": [
      {"property": "visible", "expected": true, "actual": true, "passed": true}
    ],
    "diff_percentage": null,
    "error_message": null
  }

  Response: 201 Created - CheckpointResultResponse

  ---
  6. Console Logs

  List Console Logs

  GET /api/v1/test-run-results/{result_id}/console-logs

  Response: 200 OK
  [
    {
      "id": "uuid",
      "test_run_result_id": "uuid",
      "log_level": "log|info|warn|error|debug",
      "message": "Page loaded successfully",
      "source": "https://example.com/app.js",
      "line_number": 42,
      "step_index": 1,
      "timestamp": "datetime",
      "created_at": "datetime"
    }
  ]

  ---
  Add Console Logs (Bulk)

  POST /api/v1/test-run-results/{result_id}/console-logs/bulk

  Request Body:
  {
    "logs": [
      {
        "log_level": "info",
        "message": "Application started",
        "source": "app.js",
        "line_number": 10,
        "step_index": 1,
        "timestamp": "datetime"
      },
      {
        "log_level": "error",
        "message": "Failed to load resource",
        "source": "network.js",
        "line_number": 55,
        "step_index": 3,
        "timestamp": "datetime"
      }
    ]
  }

  Response: 201 Created - Array of ConsoleLogResponse

  ---
  7. Network Logs

  List Network Logs

  GET /api/v1/test-run-results/{result_id}/network-logs

  Response: 200 OK
  [
    {
      "id": "uuid",
      "test_run_result_id": "uuid",
      "url": "https://api.example.com/login",
      "method": "POST",
      "status_code": 200,
      "status_text": "OK",
      "content_type": "application/json",
      "resource_type": "xhr",
      "timestamp": "datetime",
      "duration_ms": 250,
      "error_message": null,
      "step_index": 5,
      "created_at": "datetime"
    }
  ]

  ---
  Add Network Logs (Bulk)

  POST /api/v1/test-run-results/{result_id}/network-logs/bulk

  Request Body:
  {
    "logs": [
      {
        "url": "https://api.example.com/login",
        "method": "POST",
        "status_code": 200,
        "status_text": "OK",
        "content_type": "application/json",
        "resource_type": "xhr",
        "timestamp": "datetime",
        "duration_ms": 250,
        "step_index": 5
      }
    ]
  }

  Response: 201 Created - Array of NetworkLogResponse

  ---
  8. Script Results

  List Script Results

  GET /api/v1/test-run-results/{result_id}/scripts

  Response: 200 OK
  [
    {
      "id": "uuid",
      "test_run_result_id": "uuid",
      "test_script_id": "uuid",
      "script_name": "setup_data.py",
      "script_type": "pre-execution|post-execution|on-demand",
      "script_language": "python",
      "status": "passed|failed|skipped",
      "exit_code": 0,
      "duration_ms": 1500,
      "stdout": "Data setup complete",
      "stderr": null,
      "error_message": null,
      "is_critical": true,
      "executed_at": "datetime",
      "created_at": "datetime"
    }
  ]

  ---
  Add Script Result

  POST /api/v1/test-run-results/{result_id}/scripts

  Request Body:
  {
    "test_script_id": "uuid",
    "script_name": "cleanup.py",
    "script_type": "post-execution",
    "script_language": "python",
    "status": "passed",
    "exit_code": 0,
    "duration_ms": 500,
    "stdout": "Cleanup complete",
    "stderr": null,
    "error_message": null,
    "is_critical": false,
    "executed_at": "datetime"
  }

  Response: 201 Created - ScriptResultResponse

  ---
  9. Schedules

  Create Schedule

  POST /api/v1/schedules

  Request Body:
  {
    "schedule_name": "Daily Regression",
    "test_plan_id": "uuid",
    "suite_path": ["Regression", "Login"],
    "suite_name": "Login Suite",
    "test_case_ids": ["uuid1", "uuid2"],
    "scheduled_datetime": "2026-01-18T09:00:00Z",
    "timezone": "UTC",
    "repeat_type": "none|hourly|daily|weekly|monthly|custom",
    "repeat_interval": 1,
    "repeat_days_of_week": [1, 3, 5],
    "repeat_day_of_month": 15,
    "repeat_end_date": "2026-12-31T23:59:59Z",
    "max_occurrences": 100,
    "parallel_enabled": false,
    "parallel_count": 1,
    "retry_on_failure": true,
    "retry_count": 2,
    "notify_on_completion": true,
    "notify_on_failure": true,
    "notification_emails": ["test@example.com"]
  }

  Response: 201 Created - ScheduleResponse

  ---
  List Schedules

  GET /api/v1/schedules

  Query Parameters:
  ┌──────────────┬────────┬─────────────────────────────────────────────────────────┐
  │  Parameter   │  Type  │                       Description                       │
  ├──────────────┼────────┼─────────────────────────────────────────────────────────┤
  │ test_plan_id │ uuid   │ Filter by test plan                                     │
  ├──────────────┼────────┼─────────────────────────────────────────────────────────┤
  │ status       │ string │ Filter by status (active, paused, completed, cancelled) │
  ├──────────────┼────────┼─────────────────────────────────────────────────────────┤
  │ is_enabled   │ bool   │ Filter by enabled state                                 │
  ├──────────────┼────────┼─────────────────────────────────────────────────────────┤
  │ skip         │ int    │ Offset (default 0)                                      │
  ├──────────────┼────────┼─────────────────────────────────────────────────────────┤
  │ limit        │ int    │ Page size (default 100, max 1000)                       │
  └──────────────┴────────┴─────────────────────────────────────────────────────────┘
  Response: 200 OK
  {
    "items": [ScheduleResponse],
    "total": 50
  }

  ---
  Get Pending Schedules

  GET /api/v1/schedules/pending

  Query Parameters:
  ┌───────────┬──────────┬────────────────────────────────┐
  │ Parameter │   Type   │          Description           │
  ├───────────┼──────────┼────────────────────────────────┤
  │ before    │ datetime │ Schedules due before this time │
  └───────────┴──────────┴────────────────────────────────┘
  Response: 200 OK - Array of ScheduleResponse

  ---
  Get Schedule

  GET /api/v1/schedules/{schedule_id}

  Response: 200 OK - ScheduleResponse

  ---
  Update Schedule

  PUT /api/v1/schedules/{schedule_id}

  Request Body: Same as ScheduleCreate (all fields optional)

  Response: 200 OK - ScheduleResponse

  ---
  Delete Schedule

  DELETE /api/v1/schedules/{schedule_id}

  Response: 204 No Content

  ---
  Pause Schedule

  POST /api/v1/schedules/{schedule_id}/pause

  Response: 200 OK - ScheduleResponse

  ---
  Resume Schedule

  POST /api/v1/schedules/{schedule_id}/resume

  Response: 200 OK - ScheduleResponse

  ---
  Get Schedule Execution History

  GET /api/v1/schedules/{schedule_id}/history

  Query Parameters:
  ┌───────────┬──────┬─────────┬─────────────────────┐
  │ Parameter │ Type │ Default │     Description     │
  ├───────────┼──────┼─────────┼─────────────────────┤
  │ skip      │ int  │ 0       │ Offset              │
  ├───────────┼──────┼─────────┼─────────────────────┤
  │ limit     │ int  │ 50      │ Page size (max 100) │
  └───────────┴──────┴─────────┴─────────────────────┘
  Response: 200 OK
  [
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "test_run_id": "uuid",
      "scheduled_for": "datetime",
      "executed_at": "datetime",
      "status": "pending|running|completed|failed|missed|cancelled",
      "total_tests": 10,
      "passed_tests": 9,
      "failed_tests": 1,
      "duration_ms": 60000,
      "error_message": null,
      "created_at": "datetime"
    }
  ]

  ---
  10. Execution History

  Get Test Case Execution History

  GET /api/v1/test-cases/{test_case_id}/history

  Query Parameters:
  ┌───────────┬──────┬─────────┬─────────────────────────────┐
  │ Parameter │ Type │ Default │         Description         │
  ├───────────┼──────┼─────────┼─────────────────────────────┤
  │ limit     │ int  │ 10      │ Number of records (max 100) │
  └───────────┴──────┴─────────┴─────────────────────────────┘
  Response: 200 OK
  {
    "test_case_id": "uuid",
    "test_case_name": "Login Test",
    "history": [
      {
        "id": "uuid",
        "test_case_id": "uuid",
        "test_run_id": "uuid",
        "test_run_result_id": "uuid",
        "status": "passed",
        "executed_at": "datetime",
        "duration_ms": 5000,
        "total_steps": 10,
        "passed_steps": 10,
        "failed_steps": 0,
        "pass_rate": 100.0,
        "error_message": null,
        "run_name": "Daily Regression #5",
        "is_scheduled": true,
        "created_at": "datetime"
      }
    ],
    "total": 25,
    "statistics": {
      "total_executions": 25,
      "passed": 20,
      "failed": 5,
      "pass_rate": 80.0,
      "avg_duration_ms": 4500
    }
  }

  ---
  Status Enums

  TestRunStatus: pending, queued, running, completed, cancelled, failed

  TestRunItemStatus: pending, queued, running, passed, failed, skipped, no_run

  TestResultStatus: passed, failed, skipped

  ScheduleStatus: active, paused, completed, cancelled

  RepeatType: none, hourly, daily, weekly, monthly, custom

  LogLevel: log, info, warn, error, debug

  CheckpointType: element, screenshot, api, download
