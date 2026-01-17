# Test Run API Specification Document

This document provides a comprehensive specification for implementing the Test Run feature server-side API with PostgreSQL database.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Workflows](#workflows)
7. [Status Values & Enums](#status-values--enums)

---

## Overview

The Test Run feature manages:
- **Test Runs**: A collection of test cases executed together (batch run)
- **Test Run Items**: Individual test cases within a run
- **Test Results**: Execution results for each test
- **Step Results**: Per-step execution details
- **Checkpoint Results**: Verification results for each checkpoint
- **Schedules**: Scheduled/recurring test runs
- **Execution History**: Historical record of all executions

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Test Run** | A batch execution session containing one or more tests |
| **Test Run Item** | A single test case added to a test run |
| **Test Execution** | The actual running of a test, producing results |
| **Schedule** | A planned future execution (one-time or recurring) |
| **Suite** | A folder/group of test cases |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐
│   test_runs     │───────│   test_run_items     │
└─────────────────┘       └──────────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐       ┌──────────────────────┐
│ test_run_results│───────│  test_step_results   │
└─────────────────┘       └──────────────────────┘
        │                           │
        │                           ▼
        │                 ┌──────────────────────┐
        │                 │checkpoint_results    │
        │                 └──────────────────────┘
        │
        ▼
┌─────────────────┐       ┌──────────────────────┐
│  console_logs   │       │   network_logs       │
└─────────────────┘       └──────────────────────┘

┌─────────────────┐       ┌──────────────────────┐
│   schedules     │───────│  schedule_history    │
└─────────────────┘       └──────────────────────┘

┌─────────────────┐
│script_results   │
└─────────────────┘
```

---

### Table: `test_runs`

Represents a batch test execution session.

```sql
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    run_name VARCHAR(255) NOT NULL,
    run_number INTEGER NOT NULL,  -- Sequential: Run_001, Run_002

    -- Ownership
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    -- Suite/Folder Info
    suite_path TEXT[],  -- Array: ['ROOT', 'Regression', 'Smoke']
    suite_name VARCHAR(255),

    -- Execution Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Values: pending, queued, running, completed, cancelled, failed

    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,  -- When scheduled to run
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT DEFAULT 0,

    -- Summary Statistics
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    no_run_tests INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0.00,  -- Percentage: 85.50

    -- Configuration
    parallel_enabled BOOLEAN DEFAULT FALSE,
    parallel_count INTEGER DEFAULT 1,  -- 1-10 workers
    retry_count INTEGER DEFAULT 0,  -- Number of retries on failure
    retry_on_failure BOOLEAN DEFAULT FALSE,

    -- Environment
    browser_name VARCHAR(50),  -- chromium, firefox, webkit
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    viewport_width INTEGER,
    viewport_height INTEGER,

    -- Results Storage
    results_folder VARCHAR(500),  -- Path to results folder
    report_path VARCHAR(500),  -- Path to HTML report

    -- Metadata
    tags TEXT[],  -- Array of tags
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_test_runs_project ON test_runs(project_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX idx_test_runs_created_by ON test_runs(created_by);
```

---

### Table: `test_run_items`

Individual test cases added to a test run.

```sql
CREATE TABLE test_run_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,

    -- Order in Run
    execution_order INTEGER NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Values: pending, queued, running, passed, failed, skipped, no_run

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT DEFAULT 0,

    -- Quick Stats (copied for quick access)
    total_steps INTEGER DEFAULT 0,
    passed_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    skipped_steps INTEGER DEFAULT 0,

    -- Checkpoint Stats
    total_checkpoints INTEGER DEFAULT 0,
    passed_checkpoints INTEGER DEFAULT 0,
    failed_checkpoints INTEGER DEFAULT 0,

    -- Data-Driven Info
    is_data_driven BOOLEAN DEFAULT FALSE,
    total_iterations INTEGER DEFAULT 0,
    passed_iterations INTEGER DEFAULT 0,
    failed_iterations INTEGER DEFAULT 0,

    -- Retry Info
    retry_attempt INTEGER DEFAULT 0,  -- Which attempt succeeded (0 = first try)
    max_retries_exhausted BOOLEAN DEFAULT FALSE,

    -- Error Info
    error_message TEXT,
    error_screenshot_path VARCHAR(500),

    -- Results Location
    results_folder VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: one test case per run
    UNIQUE(test_run_id, test_case_id)
);

-- Indexes
CREATE INDEX idx_run_items_test_run ON test_run_items(test_run_id);
CREATE INDEX idx_run_items_test_case ON test_run_items(test_case_id);
CREATE INDEX idx_run_items_status ON test_run_items(status);
CREATE INDEX idx_run_items_order ON test_run_items(test_run_id, execution_order);
```

---

### Table: `test_run_results`

Detailed execution results for each test run item.

```sql
CREATE TABLE test_run_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent References
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    test_run_item_id UUID NOT NULL REFERENCES test_run_items(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES test_cases(id),

    -- For Data-Driven Tests
    iteration_number INTEGER,  -- NULL for non-data-driven, 1+ for iterations
    data_row_index INTEGER,  -- Excel row index
    data_row_values JSONB,  -- The actual data used: {"username": "test@example.com", "password": "xxx"}

    -- Execution Status
    status VARCHAR(50) NOT NULL,
    -- Values: passed, failed, skipped

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT DEFAULT 0,

    -- Step Statistics
    total_steps INTEGER DEFAULT 0,
    passed_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    skipped_steps INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Checkpoint Statistics
    total_checkpoints INTEGER DEFAULT 0,
    passed_checkpoints INTEGER DEFAULT 0,
    failed_checkpoints INTEGER DEFAULT 0,
    checkpoint_pass_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Script Statistics
    total_pre_scripts INTEGER DEFAULT 0,
    passed_pre_scripts INTEGER DEFAULT 0,
    failed_pre_scripts INTEGER DEFAULT 0,
    total_post_scripts INTEGER DEFAULT 0,
    passed_post_scripts INTEGER DEFAULT 0,
    failed_post_scripts INTEGER DEFAULT 0,
    total_on_demand_scripts INTEGER DEFAULT 0,
    passed_on_demand_scripts INTEGER DEFAULT 0,
    failed_on_demand_scripts INTEGER DEFAULT 0,
    pre_script_aborted BOOLEAN DEFAULT FALSE,  -- Critical pre-script failed

    -- Accessibility Statistics
    total_accessibility_violations INTEGER DEFAULT 0,
    accessibility_results JSONB,  -- Per-page a11y results

    -- Error Information
    error_message TEXT,
    error_step_number INTEGER,
    error_screenshot_path VARCHAR(500),

    -- URLs
    initial_url VARCHAR(2000),
    final_url VARCHAR(2000),

    -- Results Storage
    results_folder VARCHAR(500),
    report_path VARCHAR(500),

    -- Retry Information
    retry_attempt INTEGER DEFAULT 0,

    -- Racing Stats (for performance tracking)
    racing_stats JSONB,

    -- Environment (can differ per execution)
    environment_info JSONB,

    -- Downloads captured during test
    captured_downloads JSONB,
    downloads_folder VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_results_test_run ON test_run_results(test_run_id);
CREATE INDEX idx_results_item ON test_run_results(test_run_item_id);
CREATE INDEX idx_results_test_case ON test_run_results(test_case_id);
CREATE INDEX idx_results_status ON test_run_results(status);
CREATE INDEX idx_results_iteration ON test_run_results(test_run_item_id, iteration_number);
```

---

### Table: `test_step_results`

Per-step execution details.

```sql
CREATE TABLE test_step_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference
    test_run_result_id UUID NOT NULL REFERENCES test_run_results(id) ON DELETE CASCADE,

    -- Step Info
    step_number INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,  -- click, fill, navigate, wait, etc.
    description TEXT,

    -- Status
    status VARCHAR(50) NOT NULL,
    -- Values: passed, failed, skipped

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT DEFAULT 0,

    -- Target Element
    selector VARCHAR(1000),
    element_html TEXT,  -- HTML captured on failure

    -- Input Value (for fill actions)
    input_value TEXT,

    -- Screenshot
    screenshot_path VARCHAR(500),
    screenshot_url VARCHAR(500),  -- If stored in cloud storage

    -- Error Info
    error_message TEXT,
    error_stack_trace TEXT,

    -- Generated Code
    playwright_code TEXT,  -- Generated Playwright code for this step

    -- Multi-Window Tracking
    window_id VARCHAR(100),
    window_title VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_step_results_result ON test_step_results(test_run_result_id);
CREATE INDEX idx_step_results_number ON test_step_results(test_run_result_id, step_number);
CREATE INDEX idx_step_results_status ON test_step_results(status);
```

---

### Table: `checkpoint_results`

Results for element/screenshot verifications.

```sql
CREATE TABLE checkpoint_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference (can be at step level or result level)
    test_run_result_id UUID NOT NULL REFERENCES test_run_results(id) ON DELETE CASCADE,
    test_step_result_id UUID REFERENCES test_step_results(id) ON DELETE CASCADE,

    -- Checkpoint Info
    checkpoint_name VARCHAR(255) NOT NULL,
    checkpoint_type VARCHAR(50) NOT NULL,  -- element, screenshot, api, download

    -- Status
    status VARCHAR(50) NOT NULL,  -- passed, failed

    -- Element Info
    selector VARCHAR(1000),
    profile VARCHAR(50),  -- functional, visual, accessibility, full, custom

    -- Verification Details
    expected_properties JSONB,
    actual_properties JSONB,
    failed_properties TEXT[],  -- Array of property names that failed

    -- Property Verifications (detailed breakdown)
    property_verifications JSONB,
    /*
    [
      {
        "property_name": "text",
        "expected_value": "Submit",
        "actual_value": "Submit",
        "passed": true,
        "operator": "equals"
      }
    ]
    */

    -- Screenshot Info (for visual checkpoints)
    screenshot_index INTEGER,
    baseline_screenshot_path VARCHAR(500),
    actual_screenshot_path VARCHAR(500),
    diff_screenshot_path VARCHAR(500),
    diff_percentage DECIMAL(5,2),

    -- Error
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_checkpoint_result ON checkpoint_results(test_run_result_id);
CREATE INDEX idx_checkpoint_step ON checkpoint_results(test_step_result_id);
CREATE INDEX idx_checkpoint_status ON checkpoint_results(status);
```

---

### Table: `script_results`

Results for pre/post/on-demand script executions.

```sql
CREATE TABLE script_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference
    test_run_result_id UUID NOT NULL REFERENCES test_run_results(id) ON DELETE CASCADE,
    test_script_id UUID REFERENCES test_scripts(id) ON DELETE SET NULL,

    -- Script Info
    script_name VARCHAR(255) NOT NULL,
    script_type VARCHAR(50) NOT NULL,  -- pre_execution, post_execution, on_demand
    script_language VARCHAR(50),  -- python, javascript, shell

    -- Status
    status VARCHAR(50) NOT NULL,  -- passed, failed, skipped

    -- Execution Details
    exit_code INTEGER,
    duration_ms BIGINT DEFAULT 0,

    -- Output
    stdout TEXT,
    stderr TEXT,

    -- Error
    error_message TEXT,

    -- Critical Flag
    is_critical BOOLEAN DEFAULT FALSE,  -- If critical script fails, test aborts

    -- Step Association (for on-demand scripts)
    attached_to_step INTEGER,

    -- Timestamps
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_script_result_run ON script_results(test_run_result_id);
CREATE INDEX idx_script_result_type ON script_results(script_type);
```

---

### Table: `console_logs`

Browser console output captured during test execution.

```sql
CREATE TABLE console_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference
    test_run_result_id UUID NOT NULL REFERENCES test_run_results(id) ON DELETE CASCADE,

    -- Log Info
    log_level VARCHAR(20) NOT NULL,  -- log, info, warn, error, debug
    message TEXT NOT NULL,

    -- Source
    source VARCHAR(500),  -- JavaScript file source
    line_number INTEGER,
    column_number INTEGER,

    -- Stack Trace (for errors)
    stack_trace TEXT,

    -- Association
    step_index INTEGER,  -- Which step this log occurred during

    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_console_logs_result ON console_logs(test_run_result_id);
CREATE INDEX idx_console_logs_level ON console_logs(log_level);
CREATE INDEX idx_console_logs_timestamp ON console_logs(timestamp);
```

---

### Table: `network_logs`

Network requests captured during test execution.

```sql
CREATE TABLE network_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent Reference
    test_run_result_id UUID NOT NULL REFERENCES test_run_results(id) ON DELETE CASCADE,

    -- Request Info
    url VARCHAR(2000) NOT NULL,
    method VARCHAR(10) NOT NULL,  -- GET, POST, PUT, DELETE, etc.

    -- Response Info
    status_code INTEGER,
    status_text VARCHAR(100),

    -- Headers
    request_headers JSONB,
    response_headers JSONB,

    -- Body Previews (truncated for storage)
    request_body_preview TEXT,
    response_body_preview TEXT,

    -- Content Info
    content_type VARCHAR(200),
    content_length BIGINT,
    resource_type VARCHAR(50),  -- document, script, stylesheet, image, fetch, xhr

    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms BIGINT,
    ttfb_ms BIGINT,  -- Time to first byte

    -- Error
    error_message TEXT,

    -- Association
    step_index INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_network_logs_result ON network_logs(test_run_result_id);
CREATE INDEX idx_network_logs_status ON network_logs(status_code);
CREATE INDEX idx_network_logs_timestamp ON network_logs(timestamp);
```

---

### Table: `schedules`

Scheduled/recurring test runs.

```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    -- What to Run
    schedule_name VARCHAR(255) NOT NULL,
    suite_path TEXT[],  -- Array: ['ROOT', 'Regression']
    suite_name VARCHAR(255),
    test_case_ids UUID[],  -- Specific test cases (if not entire suite)

    -- When to Run
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Repeat Configuration
    repeat_type VARCHAR(50) NOT NULL DEFAULT 'none',
    -- Values: none, hourly, daily, weekly, monthly, custom
    repeat_interval INTEGER,  -- For custom: every N hours/days
    repeat_days_of_week INTEGER[],  -- For weekly: [1,3,5] = Mon,Wed,Fri
    repeat_day_of_month INTEGER,  -- For monthly
    repeat_end_date TIMESTAMP WITH TIME ZONE,  -- When to stop repeating
    max_occurrences INTEGER,  -- Max times to run

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- Values: active, paused, completed, cancelled
    is_enabled BOOLEAN DEFAULT TRUE,

    -- Execution Configuration
    parallel_enabled BOOLEAN DEFAULT FALSE,
    parallel_count INTEGER DEFAULT 1,
    retry_on_failure BOOLEAN DEFAULT FALSE,
    retry_count INTEGER DEFAULT 0,

    -- Notification Settings
    notify_on_completion BOOLEAN DEFAULT TRUE,
    notify_on_failure BOOLEAN DEFAULT TRUE,
    notification_emails TEXT[],

    -- Statistics
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    last_execution_status VARCHAR(50),
    next_execution_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_schedules_project ON schedules(project_id);
CREATE INDEX idx_schedules_next_exec ON schedules(next_execution_at) WHERE status = 'active';
CREATE INDEX idx_schedules_status ON schedules(status);
```

---

### Table: `schedule_executions`

History of scheduled test run executions.

```sql
CREATE TABLE schedule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent References
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,

    -- Execution Info
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) NOT NULL,
    -- Values: pending, running, completed, failed, missed, cancelled

    -- Results Summary
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    duration_ms BIGINT DEFAULT 0,

    -- Error
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_schedule_exec_schedule ON schedule_executions(schedule_id);
CREATE INDEX idx_schedule_exec_status ON schedule_executions(status);
CREATE INDEX idx_schedule_exec_date ON schedule_executions(scheduled_for DESC);
```

---

### Table: `test_execution_history`

Quick lookup for test case execution history.

```sql
CREATE TABLE test_execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
    test_run_result_id UUID REFERENCES test_run_results(id) ON DELETE SET NULL,

    -- Quick Access Fields
    status VARCHAR(50) NOT NULL,  -- passed, failed, skipped
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms BIGINT DEFAULT 0,

    -- Summary
    total_steps INTEGER DEFAULT 0,
    passed_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Error
    error_message TEXT,

    -- Run Context
    run_name VARCHAR(255),
    is_scheduled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exec_history_test_case ON test_execution_history(test_case_id);
CREATE INDEX idx_exec_history_date ON test_execution_history(executed_at DESC);
CREATE INDEX idx_exec_history_status ON test_execution_history(status);
```

---

## Data Models

### TestRun

```json
{
  "id": "uuid",
  "run_name": "Regression Run #42",
  "run_number": 42,
  "project_id": "uuid",
  "created_by": "uuid",
  "suite_path": ["ROOT", "Regression", "Smoke"],
  "suite_name": "Smoke",
  "status": "completed",
  "scheduled_at": "2026-01-17T10:00:00Z",
  "started_at": "2026-01-17T10:00:05Z",
  "completed_at": "2026-01-17T10:15:30Z",
  "duration_ms": 925000,
  "total_tests": 10,
  "passed_tests": 8,
  "failed_tests": 2,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": 80.00,
  "parallel_enabled": true,
  "parallel_count": 3,
  "retry_count": 1,
  "retry_on_failure": true,
  "browser_name": "chromium",
  "browser_version": "120.0.0",
  "os_name": "macOS",
  "os_version": "14.0",
  "viewport_width": 1920,
  "viewport_height": 1080,
  "results_folder": "/test_runs/ROOT/Smoke/Run_20260117_100000",
  "report_path": "/test_runs/ROOT/Smoke/Run_20260117_100000/report.html",
  "tags": ["regression", "nightly"],
  "notes": "Nightly regression run",
  "created_at": "2026-01-17T09:55:00Z",
  "updated_at": "2026-01-17T10:15:30Z"
}
```

### TestRunItem

```json
{
  "id": "uuid",
  "test_run_id": "uuid",
  "test_case_id": "uuid",
  "execution_order": 1,
  "status": "passed",
  "started_at": "2026-01-17T10:00:10Z",
  "completed_at": "2026-01-17T10:02:30Z",
  "duration_ms": 140000,
  "total_steps": 15,
  "passed_steps": 15,
  "failed_steps": 0,
  "skipped_steps": 0,
  "total_checkpoints": 5,
  "passed_checkpoints": 5,
  "failed_checkpoints": 0,
  "is_data_driven": false,
  "total_iterations": 0,
  "passed_iterations": 0,
  "failed_iterations": 0,
  "retry_attempt": 0,
  "max_retries_exhausted": false,
  "error_message": null,
  "results_folder": "/test_runs/ROOT/Smoke/Run_20260117_100000/TC001",
  "created_at": "2026-01-17T10:00:05Z",
  "updated_at": "2026-01-17T10:02:30Z"
}
```

### TestRunResult

```json
{
  "id": "uuid",
  "test_run_id": "uuid",
  "test_run_item_id": "uuid",
  "test_case_id": "uuid",
  "iteration_number": null,
  "data_row_index": null,
  "data_row_values": null,
  "status": "passed",
  "started_at": "2026-01-17T10:00:10Z",
  "completed_at": "2026-01-17T10:02:30Z",
  "duration_ms": 140000,
  "total_steps": 15,
  "passed_steps": 15,
  "failed_steps": 0,
  "skipped_steps": 0,
  "pass_rate": 100.00,
  "total_checkpoints": 5,
  "passed_checkpoints": 5,
  "failed_checkpoints": 0,
  "checkpoint_pass_rate": 100.00,
  "total_pre_scripts": 1,
  "passed_pre_scripts": 1,
  "failed_pre_scripts": 0,
  "total_post_scripts": 1,
  "passed_post_scripts": 1,
  "failed_post_scripts": 0,
  "total_on_demand_scripts": 0,
  "passed_on_demand_scripts": 0,
  "failed_on_demand_scripts": 0,
  "pre_script_aborted": false,
  "total_accessibility_violations": 2,
  "accessibility_results": [...],
  "error_message": null,
  "error_step_number": null,
  "initial_url": "https://example.com/login",
  "final_url": "https://example.com/dashboard",
  "results_folder": "/test_runs/ROOT/Smoke/Run_20260117_100000/TC001",
  "report_path": "/test_runs/ROOT/Smoke/Run_20260117_100000/TC001/result.html",
  "retry_attempt": 0,
  "environment_info": {...},
  "captured_downloads": [],
  "created_at": "2026-01-17T10:02:30Z"
}
```

### TestStepResult

```json
{
  "id": "uuid",
  "test_run_result_id": "uuid",
  "step_number": 1,
  "action": "navigate",
  "description": "Navigate to https://example.com/login",
  "status": "passed",
  "started_at": "2026-01-17T10:00:10Z",
  "completed_at": "2026-01-17T10:00:12Z",
  "duration_ms": 2000,
  "selector": null,
  "element_html": null,
  "input_value": null,
  "screenshot_path": "/screenshots/step_001.png",
  "screenshot_url": "https://storage.example.com/screenshots/step_001.png",
  "error_message": null,
  "playwright_code": "await page.goto('https://example.com/login');",
  "window_id": "main",
  "window_title": "Login - Example",
  "created_at": "2026-01-17T10:00:12Z"
}
```

### Schedule

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "created_by": "uuid",
  "schedule_name": "Nightly Regression",
  "suite_path": ["ROOT", "Regression"],
  "suite_name": "Regression",
  "test_case_ids": null,
  "scheduled_datetime": "2026-01-18T02:00:00Z",
  "timezone": "America/New_York",
  "repeat_type": "daily",
  "repeat_interval": null,
  "repeat_days_of_week": null,
  "repeat_end_date": null,
  "max_occurrences": null,
  "status": "active",
  "is_enabled": true,
  "parallel_enabled": true,
  "parallel_count": 5,
  "retry_on_failure": true,
  "retry_count": 2,
  "notify_on_completion": true,
  "notify_on_failure": true,
  "notification_emails": ["team@example.com"],
  "execution_count": 15,
  "last_executed_at": "2026-01-17T02:00:00Z",
  "last_execution_status": "completed",
  "next_execution_at": "2026-01-18T02:00:00Z",
  "created_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-17T02:15:00Z"
}
```

---

## API Endpoints

### Test Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/test-runs` | Create a new test run |
| `GET` | `/api/v1/test-runs` | List all test runs (with filters) |
| `GET` | `/api/v1/test-runs/{run_id}` | Get test run details |
| `PUT` | `/api/v1/test-runs/{run_id}` | Update test run |
| `DELETE` | `/api/v1/test-runs/{run_id}` | Delete test run |
| `POST` | `/api/v1/test-runs/{run_id}/start` | Start test run execution |
| `POST` | `/api/v1/test-runs/{run_id}/stop` | Stop test run execution |
| `POST` | `/api/v1/test-runs/{run_id}/cancel` | Cancel pending test run |
| `GET` | `/api/v1/test-runs/{run_id}/summary` | Get run summary/statistics |
| `GET` | `/api/v1/test-runs/{run_id}/report` | Get HTML report |

### Test Run Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/test-runs/{run_id}/items` | Add test case to run |
| `POST` | `/api/v1/test-runs/{run_id}/items/bulk` | Add multiple test cases |
| `GET` | `/api/v1/test-runs/{run_id}/items` | List items in run |
| `GET` | `/api/v1/test-runs/{run_id}/items/{item_id}` | Get item details |
| `PUT` | `/api/v1/test-runs/{run_id}/items/{item_id}` | Update item (reorder, etc.) |
| `DELETE` | `/api/v1/test-runs/{run_id}/items/{item_id}` | Remove item from run |
| `POST` | `/api/v1/test-runs/{run_id}/items/reorder` | Reorder items |

### Test Run Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/test-run-results` | Create result (internal) |
| `GET` | `/api/v1/test-run-results/{result_id}` | Get result details |
| `GET` | `/api/v1/test-runs/{run_id}/results` | List all results for run |
| `GET` | `/api/v1/test-run-items/{item_id}/results` | Get results for item |
| `GET` | `/api/v1/test-cases/{test_case_id}/history` | Get execution history |

### Test Step Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/test-run-results/{result_id}/steps` | List step results |
| `GET` | `/api/v1/test-run-results/{result_id}/steps/{step_number}` | Get specific step |
| `POST` | `/api/v1/test-run-results/{result_id}/steps` | Add step result (internal) |
| `POST` | `/api/v1/test-run-results/{result_id}/steps/bulk` | Add multiple steps |

### Checkpoint Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/test-run-results/{result_id}/checkpoints` | List checkpoints |
| `POST` | `/api/v1/test-run-results/{result_id}/checkpoints` | Add checkpoint result |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/test-run-results/{result_id}/console-logs` | Get console logs |
| `POST` | `/api/v1/test-run-results/{result_id}/console-logs/bulk` | Add console logs |
| `GET` | `/api/v1/test-run-results/{result_id}/network-logs` | Get network logs |
| `POST` | `/api/v1/test-run-results/{result_id}/network-logs/bulk` | Add network logs |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/schedules` | Create schedule |
| `GET` | `/api/v1/schedules` | List schedules |
| `GET` | `/api/v1/schedules/{schedule_id}` | Get schedule details |
| `PUT` | `/api/v1/schedules/{schedule_id}` | Update schedule |
| `DELETE` | `/api/v1/schedules/{schedule_id}` | Delete schedule |
| `POST` | `/api/v1/schedules/{schedule_id}/pause` | Pause schedule |
| `POST` | `/api/v1/schedules/{schedule_id}/resume` | Resume schedule |
| `GET` | `/api/v1/schedules/{schedule_id}/history` | Get execution history |
| `GET` | `/api/v1/schedules/pending` | Get schedules due to run |

### Script Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/test-run-results/{result_id}/scripts` | Get script results |
| `POST` | `/api/v1/test-run-results/{result_id}/scripts` | Add script result |

---

## Request/Response Examples

### Create Test Run

**Request:**
```http
POST /api/v1/test-runs
Content-Type: application/json
Authorization: Bearer {token}

{
  "run_name": "Smoke Test Run",
  "suite_path": ["ROOT", "Regression", "Smoke"],
  "suite_name": "Smoke",
  "parallel_enabled": true,
  "parallel_count": 3,
  "retry_on_failure": true,
  "retry_count": 1,
  "tags": ["smoke", "daily"],
  "notes": "Daily smoke test"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "run_name": "Smoke Test Run",
  "run_number": 1,
  "project_id": "project-uuid",
  "created_by": "user-uuid",
  "suite_path": ["ROOT", "Regression", "Smoke"],
  "suite_name": "Smoke",
  "status": "pending",
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": 0.00,
  "parallel_enabled": true,
  "parallel_count": 3,
  "retry_on_failure": true,
  "retry_count": 1,
  "tags": ["smoke", "daily"],
  "notes": "Daily smoke test",
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

### Add Test Cases to Run

**Request:**
```http
POST /api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/items/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
  "test_case_ids": [
    "tc-uuid-001",
    "tc-uuid-002",
    "tc-uuid-003"
  ]
}
```

**Response (201 Created):**
```json
{
  "items": [
    {
      "id": "item-uuid-001",
      "test_run_id": "550e8400-e29b-41d4-a716-446655440000",
      "test_case_id": "tc-uuid-001",
      "execution_order": 1,
      "status": "pending"
    },
    {
      "id": "item-uuid-002",
      "test_run_id": "550e8400-e29b-41d4-a716-446655440000",
      "test_case_id": "tc-uuid-002",
      "execution_order": 2,
      "status": "pending"
    },
    {
      "id": "item-uuid-003",
      "test_run_id": "550e8400-e29b-41d4-a716-446655440000",
      "test_case_id": "tc-uuid-003",
      "execution_order": 3,
      "status": "pending"
    }
  ],
  "total_added": 3
}
```

### Start Test Run

**Request:**
```http
POST /api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/start
Content-Type: application/json
Authorization: Bearer {token}

{
  "browser_name": "chromium",
  "viewport_width": 1920,
  "viewport_height": 1080
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "started_at": "2026-01-17T10:05:00Z",
  "message": "Test run started with 3 test cases"
}
```

### Submit Test Result

**Request:**
```http
POST /api/v1/test-run-results
Content-Type: application/json
Authorization: Bearer {token}

{
  "test_run_id": "550e8400-e29b-41d4-a716-446655440000",
  "test_run_item_id": "item-uuid-001",
  "test_case_id": "tc-uuid-001",
  "status": "passed",
  "started_at": "2026-01-17T10:05:05Z",
  "completed_at": "2026-01-17T10:07:30Z",
  "duration_ms": 145000,
  "total_steps": 15,
  "passed_steps": 15,
  "failed_steps": 0,
  "skipped_steps": 0,
  "pass_rate": 100.00,
  "total_checkpoints": 5,
  "passed_checkpoints": 5,
  "failed_checkpoints": 0,
  "checkpoint_pass_rate": 100.00,
  "initial_url": "https://example.com/login",
  "final_url": "https://example.com/dashboard",
  "environment_info": {
    "browser_name": "chromium",
    "browser_version": "120.0.0",
    "os_name": "macOS",
    "os_version": "14.0",
    "viewport_width": 1920,
    "viewport_height": 1080
  }
}
```

### Get Test Run Summary

**Request:**
```http
GET /api/v1/test-runs/550e8400-e29b-41d4-a716-446655440000/summary
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "run_name": "Smoke Test Run",
  "status": "completed",
  "started_at": "2026-01-17T10:05:00Z",
  "completed_at": "2026-01-17T10:15:30Z",
  "duration_ms": 630000,
  "summary": {
    "total_tests": 3,
    "passed_tests": 2,
    "failed_tests": 1,
    "skipped_tests": 0,
    "pass_rate": 66.67,
    "total_steps": 45,
    "passed_steps": 42,
    "failed_steps": 3,
    "total_checkpoints": 15,
    "passed_checkpoints": 14,
    "failed_checkpoints": 1
  },
  "items": [
    {
      "id": "item-uuid-001",
      "test_case_name": "Login Test",
      "status": "passed",
      "duration_ms": 145000,
      "pass_rate": 100.00
    },
    {
      "id": "item-uuid-002",
      "test_case_name": "Search Test",
      "status": "failed",
      "duration_ms": 200000,
      "pass_rate": 80.00,
      "error_message": "Element not found: #search-results"
    },
    {
      "id": "item-uuid-003",
      "test_case_name": "Checkout Test",
      "status": "passed",
      "duration_ms": 285000,
      "pass_rate": 100.00
    }
  ]
}
```

### Create Schedule

**Request:**
```http
POST /api/v1/schedules
Content-Type: application/json
Authorization: Bearer {token}

{
  "schedule_name": "Nightly Regression",
  "suite_path": ["ROOT", "Regression"],
  "suite_name": "Regression",
  "scheduled_datetime": "2026-01-18T02:00:00Z",
  "timezone": "America/New_York",
  "repeat_type": "daily",
  "parallel_enabled": true,
  "parallel_count": 5,
  "retry_on_failure": true,
  "retry_count": 2,
  "notify_on_failure": true,
  "notification_emails": ["team@example.com"]
}
```

**Response (201 Created):**
```json
{
  "id": "schedule-uuid",
  "schedule_name": "Nightly Regression",
  "suite_path": ["ROOT", "Regression"],
  "suite_name": "Regression",
  "scheduled_datetime": "2026-01-18T02:00:00Z",
  "timezone": "America/New_York",
  "repeat_type": "daily",
  "status": "active",
  "is_enabled": true,
  "next_execution_at": "2026-01-18T07:00:00Z",
  "created_at": "2026-01-17T10:00:00Z"
}
```

### List Test Runs with Filters

**Request:**
```http
GET /api/v1/test-runs?status=completed&from_date=2026-01-01&limit=20&offset=0
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "run-uuid-1",
      "run_name": "Smoke Test Run #42",
      "status": "completed",
      "total_tests": 10,
      "passed_tests": 9,
      "failed_tests": 1,
      "pass_rate": 90.00,
      "duration_ms": 600000,
      "started_at": "2026-01-17T10:00:00Z",
      "completed_at": "2026-01-17T10:10:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Get Execution History for Test Case

**Request:**
```http
GET /api/v1/test-cases/tc-uuid-001/history?limit=10
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "test_case_id": "tc-uuid-001",
  "test_case_name": "Login Test",
  "history": [
    {
      "id": "history-uuid-1",
      "test_run_id": "run-uuid-1",
      "run_name": "Smoke Test Run #42",
      "status": "passed",
      "executed_at": "2026-01-17T10:05:00Z",
      "duration_ms": 145000,
      "pass_rate": 100.00
    },
    {
      "id": "history-uuid-2",
      "test_run_id": "run-uuid-2",
      "run_name": "Nightly Regression",
      "status": "failed",
      "executed_at": "2026-01-16T02:00:00Z",
      "duration_ms": 95000,
      "pass_rate": 75.00,
      "error_message": "Login button not clickable"
    }
  ],
  "total": 25,
  "statistics": {
    "total_executions": 25,
    "passed": 22,
    "failed": 3,
    "overall_pass_rate": 88.00,
    "avg_duration_ms": 135000
  }
}
```

---

## Workflows

### 1. Manual Test Run Workflow

```
1. Client: POST /api/v1/test-runs (create run)
2. Client: POST /api/v1/test-runs/{id}/items/bulk (add tests)
3. Client: POST /api/v1/test-runs/{id}/start (start execution)
4. Server: Updates status to "running"
5. Client: Executes tests locally
6. Client: POST /api/v1/test-run-results (submit each result)
7. Client: POST /api/v1/test-run-results/{id}/steps/bulk (submit steps)
8. Client: POST /api/v1/test-run-results/{id}/checkpoints (submit checkpoints)
9. Client: POST /api/v1/test-run-results/{id}/console-logs/bulk (submit logs)
10. Server: Updates run statistics after each result
11. Server: When all items complete, marks run as "completed"
```

### 2. Scheduled Test Run Workflow

```
1. Client: POST /api/v1/schedules (create schedule)
2. Server: Stores schedule, calculates next_execution_at
3. Server: Scheduler job checks for due schedules
4. Server: When schedule is due, creates test_run automatically
5. Server: Notifies client via webhook/websocket
6. Client: Receives notification, starts execution
7. Client: Follows manual workflow for execution
8. Server: Updates schedule.last_executed_at, calculates next
9. Server: Creates schedule_execution record
10. Server: Sends notification if configured
```

### 3. Data-Driven Test Workflow

```
1. Normal test run creation
2. During execution, test is identified as data-driven
3. For each data row (iteration):
   - Create test_run_result with iteration_number and data_row_values
   - Execute and submit step results
   - Submit checkpoint results
4. Update test_run_item with:
   - is_data_driven = true
   - total_iterations, passed_iterations, failed_iterations
5. Status shows as "Pass (X/Y)" or "Fail (X/Y)"
```

---

## Status Values & Enums

### Test Run Status

| Status | Description |
|--------|-------------|
| `pending` | Created but not started |
| `queued` | Waiting in execution queue |
| `running` | Currently executing |
| `completed` | All tests finished |
| `cancelled` | Manually cancelled |
| `failed` | Run failed (infrastructure error) |

### Test Run Item Status

| Status | Description |
|--------|-------------|
| `pending` | Not yet executed |
| `queued` | Waiting for available worker |
| `running` | Currently executing |
| `passed` | All steps passed |
| `failed` | One or more steps failed |
| `skipped` | Skipped (dependency failed, etc.) |
| `no_run` | No recording exists |

### Test Result Status

| Status | Description |
|--------|-------------|
| `passed` | Test passed |
| `failed` | Test failed |
| `skipped` | Test was skipped |

### Step Result Status

| Status | Description |
|--------|-------------|
| `passed` | Step executed successfully |
| `failed` | Step failed |
| `skipped` | Step was skipped |

### Schedule Status

| Status | Description |
|--------|-------------|
| `active` | Schedule is active and will run |
| `paused` | Temporarily paused |
| `completed` | One-time schedule completed |
| `cancelled` | Permanently cancelled |

### Schedule Repeat Types

| Type | Description |
|------|-------------|
| `none` | One-time execution |
| `hourly` | Every hour |
| `daily` | Every day at same time |
| `weekly` | Every week on same day(s) |
| `monthly` | Every month on same day |
| `custom` | Custom interval |

### Log Levels

| Level | Description |
|-------|-------------|
| `log` | General log |
| `info` | Information |
| `warn` | Warning |
| `error` | Error |
| `debug` | Debug output |

### Checkpoint Types

| Type | Description |
|------|-------------|
| `element` | UI element verification |
| `screenshot` | Visual/screenshot comparison |
| `api` | API response verification |
| `download` | Downloaded file verification |

### Script Types

| Type | Description |
|------|-------------|
| `pre_execution` | Runs before test starts |
| `post_execution` | Runs after test completes |
| `on_demand` | Attached to specific steps |

---

## Query Parameters for List Endpoints

### GET /api/v1/test-runs

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `suite_path` | string | Filter by suite (comma-separated) |
| `from_date` | date | Start date filter |
| `to_date` | date | End date filter |
| `created_by` | uuid | Filter by creator |
| `tags` | string | Filter by tags (comma-separated) |
| `search` | string | Search in run_name |
| `sort_by` | string | Sort field (created_at, started_at, pass_rate) |
| `sort_order` | string | asc or desc |
| `limit` | integer | Page size (default: 20, max: 100) |
| `offset` | integer | Page offset |

### GET /api/v1/schedules

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `is_enabled` | boolean | Filter by enabled state |
| `repeat_type` | string | Filter by repeat type |
| `from_date` | date | Next execution from |
| `to_date` | date | Next execution to |

---

## Error Responses

### Validation Error (400)
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "parallel_count",
      "message": "Must be between 1 and 10"
    }
  ]
}
```

### Not Found (404)
```json
{
  "detail": "Test run not found: 550e8400-e29b-41d4-a716-446655440000"
}
```

### Conflict (409)
```json
{
  "detail": "Test case already exists in this run"
}
```

### Invalid State (422)
```json
{
  "detail": "Cannot start test run: status is 'completed'"
}
```

---

## Notes for Implementation

1. **Transactions**: Use database transactions when creating test runs with items to ensure consistency.

2. **Indexes**: Ensure proper indexes on frequently queried fields (status, dates, foreign keys).

3. **Cascading Deletes**: Configure ON DELETE CASCADE for child tables to maintain referential integrity.

4. **Pagination**: Always implement pagination for list endpoints to handle large datasets.

5. **Timestamps**: Use `TIMESTAMP WITH TIME ZONE` for all timestamp fields to handle multiple timezones.

6. **JSONB Fields**: Use PostgreSQL JSONB for flexible data like environment_info, data_row_values, etc.

7. **Soft Deletes**: Consider implementing soft deletes for audit purposes (add `deleted_at` column).

8. **Statistics Updates**: Update parent statistics (test_runs) when child results are submitted. Consider using triggers or application-level logic.

9. **Websockets**: Consider implementing websocket notifications for real-time status updates during test execution.

10. **File Storage**: For screenshots and reports, store file paths in database and actual files in cloud storage (S3, GCS, etc.).
