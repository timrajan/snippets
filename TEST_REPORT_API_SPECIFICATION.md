# Test Report Module - API Specification

## Document Information
- **Version**: 1.0
- **Created**: 2026-01-17
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Purpose**: Complete API specification for Test Report management with dual storage support (local for guest users, server for authenticated users)

---

## Table of Contents
1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Data Models (Pydantic)](#3-data-models-pydantic)
4. [API Endpoints](#4-api-endpoints)
5. [Implementation Logic](#5-implementation-logic)
6. [File Storage Strategy](#6-file-storage-strategy)
7. [Migration Notes](#7-migration-notes)

---

## 1. Overview

### 1.1 Module Purpose
The Test Report module manages all test execution results, including:
- Suite-level reports (aggregated results from multiple test cases)
- Test case results (individual test execution outcomes)
- Step-level results (each action performed during test)
- Checkpoint results (verification points within steps)
- Execution artifacts (screenshots, logs, environment info)
- Historical execution tracking

### 1.2 Dual Storage Architecture
| User Type | Storage Location | Sync Behavior |
|-----------|------------------|---------------|
| Guest (Logged Out) | Local file system | No sync |
| Authenticated (Logged In) | PostgreSQL + Object Storage | Full sync |

### 1.3 Report Hierarchy
```
Suite Run
├── Suite Summary (aggregated metrics)
├── Test Case Result 1
│   ├── Step Result 1
│   │   ├── Screenshot
│   │   └── Checkpoint Results[]
│   ├── Step Result 2
│   │   └── ...
│   ├── Console Logs[]
│   ├── Network Logs[]
│   └── Environment Info
├── Test Case Result 2
│   └── ...
└── Test Case Result N
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram (Conceptual)
```
users (1) ──────────────── (N) suite_runs
suite_runs (1) ─────────── (N) test_case_results
test_case_results (1) ──── (N) step_results
step_results (1) ────────── (N) checkpoint_results
test_case_results (1) ──── (N) console_logs
test_case_results (1) ──── (N) network_logs
test_case_results (1) ──── (1) environment_info
test_case_results (1) ──── (N) script_results
```

### 2.2 Table Definitions

#### 2.2.1 `suite_runs` - Suite Execution Records
```sql
CREATE TABLE suite_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Suite Identification
    suite_name VARCHAR(255) NOT NULL,
    suite_path TEXT[] NOT NULL,  -- Array: ['ROOT', 'Regression', 'Smoke']
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE SET NULL,

    -- Execution Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms DOUBLE PRECISION,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'running',  -- running, completed, failed, cancelled

    -- Aggregated Metrics
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    failed_tests INTEGER NOT NULL DEFAULT 0,
    skipped_tests INTEGER NOT NULL DEFAULT 0,
    no_run_tests INTEGER NOT NULL DEFAULT 0,
    pass_rate DOUBLE PRECISION,  -- Calculated: (passed/total) * 100

    -- Browser/Environment (from first test)
    browser_name VARCHAR(50),
    browser_version VARCHAR(50),
    os_name VARCHAR(50),
    os_version VARCHAR(50),

    -- Metadata
    trigger_type VARCHAR(50) DEFAULT 'manual',  -- manual, scheduled, api
    trigger_source VARCHAR(255),  -- Schedule ID or API client
    tags TEXT[],
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_suite_runs_user_id ON suite_runs(user_id);
CREATE INDEX idx_suite_runs_status ON suite_runs(status);
CREATE INDEX idx_suite_runs_started_at ON suite_runs(started_at DESC);
CREATE INDEX idx_suite_runs_suite_name ON suite_runs(suite_name);
CREATE INDEX idx_suite_runs_test_plan_id ON suite_runs(test_plan_id);
```

#### 2.2.2 `test_case_results` - Individual Test Case Execution
```sql
CREATE TABLE test_case_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_run_id UUID NOT NULL REFERENCES suite_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Test Case Identification
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
    test_case_name VARCHAR(255) NOT NULL,
    test_case_path TEXT[] NOT NULL,  -- Array: ['ROOT', 'Auth', 'LoginTest']
    iteration_number INTEGER DEFAULT 1,  -- For data-driven tests

    -- Execution Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms DOUBLE PRECISION,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, running, passed, failed, skipped

    -- Step Metrics
    total_steps INTEGER NOT NULL DEFAULT 0,
    passed_steps INTEGER NOT NULL DEFAULT 0,
    failed_steps INTEGER NOT NULL DEFAULT 0,
    skipped_steps INTEGER NOT NULL DEFAULT 0,
    pass_rate DOUBLE PRECISION,

    -- Checkpoint Metrics
    total_checkpoints INTEGER DEFAULT 0,
    passed_checkpoints INTEGER DEFAULT 0,
    failed_checkpoints INTEGER DEFAULT 0,

    -- Error Information
    error_message TEXT,
    error_step_number INTEGER,
    failure_screenshot_url TEXT,  -- URL to failure screenshot

    -- Report URLs
    executive_report_url TEXT,
    detailed_report_url TEXT,

    -- Metadata
    base_url TEXT,  -- Starting URL for the test
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_test_case_results_suite_run_id ON test_case_results(suite_run_id);
CREATE INDEX idx_test_case_results_user_id ON test_case_results(user_id);
CREATE INDEX idx_test_case_results_test_case_id ON test_case_results(test_case_id);
CREATE INDEX idx_test_case_results_status ON test_case_results(status);
CREATE INDEX idx_test_case_results_started_at ON test_case_results(started_at DESC);
```

#### 2.2.3 `step_results` - Individual Step Execution
```sql
CREATE TABLE step_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Step Identification
    step_number INTEGER NOT NULL,

    -- Action Details
    action_type VARCHAR(50) NOT NULL,  -- goto, click, fill, select, wait, assertion, etc.
    description TEXT NOT NULL,
    target_selector TEXT,  -- CSS/XPath selector
    input_value TEXT,  -- For fill, select actions

    -- Execution Details
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms DOUBLE PRECISION,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, passed, failed, skipped

    -- Error Information
    error_message TEXT,
    error_type VARCHAR(100),  -- TimeoutError, AssertionError, ElementNotFound, etc.

    -- Screenshot
    screenshot_url TEXT,  -- URL to step screenshot
    screenshot_thumbnail_url TEXT,  -- Thumbnail for quick preview

    -- Code Executed
    playwright_code TEXT,  -- Actual code executed

    -- URL at time of step
    page_url TEXT,
    page_title VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_step_results_test_case_result_id ON step_results(test_case_result_id);
CREATE INDEX idx_step_results_step_number ON step_results(test_case_result_id, step_number);
CREATE INDEX idx_step_results_status ON step_results(status);

-- Ensure step numbers are unique per test case result
CREATE UNIQUE INDEX idx_step_results_unique_step ON step_results(test_case_result_id, step_number);
```

#### 2.2.4 `checkpoint_results` - Verification Points
```sql
CREATE TABLE checkpoint_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_result_id UUID NOT NULL REFERENCES step_results(id) ON DELETE CASCADE,
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Checkpoint Identification
    checkpoint_name VARCHAR(255) NOT NULL,
    checkpoint_type VARCHAR(50) NOT NULL,  -- element, screenshot, api, accessibility, custom

    -- Element Information (for element checkpoints)
    selector TEXT,
    element_tag VARCHAR(50),
    element_text TEXT,

    -- Verification Details
    property_name VARCHAR(100),  -- text, value, visible, enabled, attribute, etc.
    operator VARCHAR(50),  -- equals, contains, matches, greater_than, less_than, etc.
    expected_value TEXT,
    actual_value TEXT,

    -- Status
    passed BOOLEAN NOT NULL,

    -- Error Information
    error_message TEXT,

    -- Screenshot Comparison (for screenshot checkpoints)
    baseline_screenshot_url TEXT,
    actual_screenshot_url TEXT,
    diff_screenshot_url TEXT,
    similarity_score DOUBLE PRECISION,  -- 0.0 to 1.0

    -- API Checkpoint Data
    api_endpoint TEXT,
    api_method VARCHAR(10),
    api_request_body JSONB,
    api_response_status INTEGER,
    api_response_body JSONB,

    -- Timestamps
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_checkpoint_results_step_result_id ON checkpoint_results(step_result_id);
CREATE INDEX idx_checkpoint_results_test_case_result_id ON checkpoint_results(test_case_result_id);
CREATE INDEX idx_checkpoint_results_passed ON checkpoint_results(passed);
CREATE INDEX idx_checkpoint_results_type ON checkpoint_results(checkpoint_type);
```

#### 2.2.5 `console_logs` - Browser Console Output
```sql
CREATE TABLE console_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Log Entry
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    level VARCHAR(20) NOT NULL,  -- log, info, warn, error, debug
    message TEXT NOT NULL,

    -- Source Information
    source_url TEXT,
    source_line INTEGER,
    source_column INTEGER,

    -- Context
    step_number INTEGER,  -- Which step this log occurred during

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_console_logs_test_case_result_id ON console_logs(test_case_result_id);
CREATE INDEX idx_console_logs_level ON console_logs(level);
CREATE INDEX idx_console_logs_timestamp ON console_logs(timestamp);
```

#### 2.2.6 `network_logs` - Network Request/Response
```sql
CREATE TABLE network_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Request Information
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    method VARCHAR(10) NOT NULL,  -- GET, POST, PUT, DELETE, etc.
    url TEXT NOT NULL,
    request_headers JSONB,
    request_body TEXT,

    -- Response Information
    status_code INTEGER,
    status_text VARCHAR(100),
    response_headers JSONB,
    response_body_preview TEXT,  -- First 1000 chars or summary
    response_size_bytes INTEGER,

    -- Timing
    duration_ms DOUBLE PRECISION,

    -- Classification
    resource_type VARCHAR(50),  -- document, xhr, fetch, script, stylesheet, image, font, etc.
    is_error BOOLEAN DEFAULT FALSE,

    -- Context
    step_number INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_network_logs_test_case_result_id ON network_logs(test_case_result_id);
CREATE INDEX idx_network_logs_status_code ON network_logs(status_code);
CREATE INDEX idx_network_logs_is_error ON network_logs(is_error);
CREATE INDEX idx_network_logs_timestamp ON network_logs(timestamp);
```

#### 2.2.7 `environment_info` - Execution Environment Details
```sql
CREATE TABLE environment_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Browser Information
    browser_name VARCHAR(50),
    browser_version VARCHAR(50),
    user_agent TEXT,
    js_engine VARCHAR(50),

    -- Operating System
    os_name VARCHAR(50),
    os_version VARCHAR(50),
    os_architecture VARCHAR(20),
    kernel_version VARCHAR(100),

    -- Viewport/Device
    viewport_width INTEGER,
    viewport_height INTEGER,
    device_pixel_ratio DOUBLE PRECISION,
    screen_width INTEGER,
    screen_height INTEGER,
    zoom_level DOUBLE PRECISION,

    -- Locale
    language VARCHAR(20),
    timezone VARCHAR(100),
    country VARCHAR(50),

    -- Network
    is_online BOOLEAN,
    connection_type VARCHAR(50),

    -- Application
    app_version VARCHAR(50),
    qt_version VARCHAR(50),

    -- Custom Properties
    custom_properties JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_unique_env_per_result UNIQUE (test_case_result_id)
);

-- Index
CREATE INDEX idx_environment_info_test_case_result_id ON environment_info(test_case_result_id);
```

#### 2.2.8 `script_results` - Pre/Post Script Execution
```sql
CREATE TABLE script_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,

    -- Script Identification
    script_type VARCHAR(20) NOT NULL,  -- pre_script, post_script, on_demand
    script_name VARCHAR(255),

    -- Execution Details
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms DOUBLE PRECISION,

    -- Status
    status VARCHAR(20) NOT NULL,  -- passed, failed, skipped

    -- Script Content
    script_code TEXT,

    -- Output
    output TEXT,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_script_results_test_case_result_id ON script_results(test_case_result_id);
CREATE INDEX idx_script_results_script_type ON script_results(script_type);
```

#### 2.2.9 `accessibility_violations` - A11y Issues Found
```sql
CREATE TABLE accessibility_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,
    step_result_id UUID REFERENCES step_results(id) ON DELETE SET NULL,

    -- Violation Details
    rule_id VARCHAR(100) NOT NULL,  -- WCAG rule ID (e.g., 'color-contrast')
    rule_description TEXT,
    impact VARCHAR(20),  -- minor, moderate, serious, critical

    -- Element Information
    selector TEXT,
    element_html TEXT,

    -- WCAG Reference
    wcag_tags TEXT[],  -- ['wcag2a', 'wcag21aa']
    help_url TEXT,

    -- Remediation
    failure_summary TEXT,
    fix_suggestion TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_accessibility_violations_test_case_result_id ON accessibility_violations(test_case_result_id);
CREATE INDEX idx_accessibility_violations_impact ON accessibility_violations(impact);
CREATE INDEX idx_accessibility_violations_rule_id ON accessibility_violations(rule_id);
```

#### 2.2.10 `test_execution_history` - Quick Lookup for Test Case History
```sql
CREATE TABLE test_execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,

    -- Reference to full result
    test_case_result_id UUID NOT NULL REFERENCES test_case_results(id) ON DELETE CASCADE,
    suite_run_id UUID NOT NULL REFERENCES suite_runs(id) ON DELETE CASCADE,

    -- Quick Access Data
    suite_name VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration_ms DOUBLE PRECISION,
    pass_rate DOUBLE PRECISION,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_test_execution_history_user_test ON test_execution_history(user_id, test_case_id);
CREATE INDEX idx_test_execution_history_executed_at ON test_execution_history(executed_at DESC);

-- Limit to 50 most recent per test case (handled in application logic or trigger)
```

---

## 3. Data Models (Pydantic)

### 3.1 Enums

```python
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"

class SuiteRunStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TriggerType(str, Enum):
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    API = "api"

class LogLevel(str, Enum):
    LOG = "log"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"
    DEBUG = "debug"

class CheckpointType(str, Enum):
    ELEMENT = "element"
    SCREENSHOT = "screenshot"
    API = "api"
    ACCESSIBILITY = "accessibility"
    CUSTOM = "custom"

class ActionType(str, Enum):
    GOTO = "goto"
    CLICK = "click"
    FILL = "fill"
    SELECT = "select"
    CHECK = "check"
    UNCHECK = "uncheck"
    HOVER = "hover"
    WAIT = "wait"
    SCROLL = "scroll"
    PRESS = "press"
    SCREENSHOT = "screenshot"
    ASSERTION = "assertion"
    CUSTOM = "custom"

class ImpactLevel(str, Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    SERIOUS = "serious"
    CRITICAL = "critical"
```

### 3.2 Request Models

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# ─────────────────────────────────────────────────────────────
# Suite Run Models
# ─────────────────────────────────────────────────────────────

class SuiteRunCreate(BaseModel):
    suite_name: str
    suite_path: List[str]
    test_plan_id: Optional[UUID] = None
    trigger_type: TriggerType = TriggerType.MANUAL
    trigger_source: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class SuiteRunUpdate(BaseModel):
    status: Optional[SuiteRunStatus] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    total_tests: Optional[int] = None
    passed_tests: Optional[int] = None
    failed_tests: Optional[int] = None
    skipped_tests: Optional[int] = None
    no_run_tests: Optional[int] = None
    pass_rate: Optional[float] = None
    browser_name: Optional[str] = None
    browser_version: Optional[str] = None
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    notes: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# Test Case Result Models
# ─────────────────────────────────────────────────────────────

class TestCaseResultCreate(BaseModel):
    suite_run_id: UUID
    test_case_id: Optional[UUID] = None
    test_case_name: str
    test_case_path: List[str]
    iteration_number: int = 1
    base_url: Optional[str] = None
    tags: Optional[List[str]] = None

class TestCaseResultUpdate(BaseModel):
    status: Optional[ExecutionStatus] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    total_steps: Optional[int] = None
    passed_steps: Optional[int] = None
    failed_steps: Optional[int] = None
    skipped_steps: Optional[int] = None
    pass_rate: Optional[float] = None
    total_checkpoints: Optional[int] = None
    passed_checkpoints: Optional[int] = None
    failed_checkpoints: Optional[int] = None
    error_message: Optional[str] = None
    error_step_number: Optional[int] = None
    failure_screenshot_url: Optional[str] = None
    executive_report_url: Optional[str] = None
    detailed_report_url: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# Step Result Models
# ─────────────────────────────────────────────────────────────

class StepResultCreate(BaseModel):
    test_case_result_id: UUID
    step_number: int
    action_type: ActionType
    description: str
    target_selector: Optional[str] = None
    input_value: Optional[str] = None
    playwright_code: Optional[str] = None
    page_url: Optional[str] = None
    page_title: Optional[str] = None

class StepResultUpdate(BaseModel):
    status: Optional[ExecutionStatus] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    screenshot_url: Optional[str] = None
    screenshot_thumbnail_url: Optional[str] = None

class StepResultBulkCreate(BaseModel):
    """For creating multiple steps at once"""
    test_case_result_id: UUID
    steps: List[StepResultCreate]

# ─────────────────────────────────────────────────────────────
# Checkpoint Result Models
# ─────────────────────────────────────────────────────────────

class CheckpointResultCreate(BaseModel):
    step_result_id: UUID
    test_case_result_id: UUID
    checkpoint_name: str
    checkpoint_type: CheckpointType
    selector: Optional[str] = None
    element_tag: Optional[str] = None
    element_text: Optional[str] = None
    property_name: Optional[str] = None
    operator: Optional[str] = None
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    passed: bool
    error_message: Optional[str] = None
    # Screenshot checkpoint
    baseline_screenshot_url: Optional[str] = None
    actual_screenshot_url: Optional[str] = None
    diff_screenshot_url: Optional[str] = None
    similarity_score: Optional[float] = None
    # API checkpoint
    api_endpoint: Optional[str] = None
    api_method: Optional[str] = None
    api_request_body: Optional[Dict[str, Any]] = None
    api_response_status: Optional[int] = None
    api_response_body: Optional[Dict[str, Any]] = None

# ─────────────────────────────────────────────────────────────
# Log Models
# ─────────────────────────────────────────────────────────────

class ConsoleLogCreate(BaseModel):
    test_case_result_id: UUID
    timestamp: datetime
    level: LogLevel
    message: str
    source_url: Optional[str] = None
    source_line: Optional[int] = None
    source_column: Optional[int] = None
    step_number: Optional[int] = None

class ConsoleLogBulkCreate(BaseModel):
    test_case_result_id: UUID
    logs: List[ConsoleLogCreate]

class NetworkLogCreate(BaseModel):
    test_case_result_id: UUID
    timestamp: datetime
    method: str
    url: str
    request_headers: Optional[Dict[str, str]] = None
    request_body: Optional[str] = None
    status_code: Optional[int] = None
    status_text: Optional[str] = None
    response_headers: Optional[Dict[str, str]] = None
    response_body_preview: Optional[str] = None
    response_size_bytes: Optional[int] = None
    duration_ms: Optional[float] = None
    resource_type: Optional[str] = None
    is_error: bool = False
    step_number: Optional[int] = None

class NetworkLogBulkCreate(BaseModel):
    test_case_result_id: UUID
    logs: List[NetworkLogCreate]

# ─────────────────────────────────────────────────────────────
# Environment Info Model
# ─────────────────────────────────────────────────────────────

class EnvironmentInfoCreate(BaseModel):
    test_case_result_id: UUID
    # Browser
    browser_name: Optional[str] = None
    browser_version: Optional[str] = None
    user_agent: Optional[str] = None
    js_engine: Optional[str] = None
    # OS
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    os_architecture: Optional[str] = None
    kernel_version: Optional[str] = None
    # Viewport
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None
    device_pixel_ratio: Optional[float] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    zoom_level: Optional[float] = None
    # Locale
    language: Optional[str] = None
    timezone: Optional[str] = None
    country: Optional[str] = None
    # Network
    is_online: Optional[bool] = None
    connection_type: Optional[str] = None
    # App
    app_version: Optional[str] = None
    qt_version: Optional[str] = None
    custom_properties: Optional[Dict[str, Any]] = None

# ─────────────────────────────────────────────────────────────
# Script Result Model
# ─────────────────────────────────────────────────────────────

class ScriptResultCreate(BaseModel):
    test_case_result_id: UUID
    script_type: str  # pre_script, post_script, on_demand
    script_name: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    status: ExecutionStatus
    script_code: Optional[str] = None
    output: Optional[str] = None
    error_message: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# Accessibility Violation Model
# ─────────────────────────────────────────────────────────────

class AccessibilityViolationCreate(BaseModel):
    test_case_result_id: UUID
    step_result_id: Optional[UUID] = None
    rule_id: str
    rule_description: Optional[str] = None
    impact: ImpactLevel
    selector: Optional[str] = None
    element_html: Optional[str] = None
    wcag_tags: Optional[List[str]] = None
    help_url: Optional[str] = None
    failure_summary: Optional[str] = None
    fix_suggestion: Optional[str] = None

class AccessibilityViolationBulkCreate(BaseModel):
    test_case_result_id: UUID
    violations: List[AccessibilityViolationCreate]
```

### 3.3 Response Models

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# ─────────────────────────────────────────────────────────────
# Suite Run Response
# ─────────────────────────────────────────────────────────────

class SuiteRunResponse(BaseModel):
    id: UUID
    user_id: UUID
    suite_name: str
    suite_path: List[str]
    test_plan_id: Optional[UUID]
    started_at: datetime
    completed_at: Optional[datetime]
    duration_ms: Optional[float]
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    skipped_tests: int
    no_run_tests: int
    pass_rate: Optional[float]
    browser_name: Optional[str]
    browser_version: Optional[str]
    os_name: Optional[str]
    os_version: Optional[str]
    trigger_type: str
    trigger_source: Optional[str]
    tags: Optional[List[str]]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SuiteRunListResponse(BaseModel):
    total: int
    items: List[SuiteRunResponse]

class SuiteRunDetailResponse(SuiteRunResponse):
    """Extended response with test case results"""
    test_case_results: List["TestCaseResultSummary"]

# ─────────────────────────────────────────────────────────────
# Test Case Result Response
# ─────────────────────────────────────────────────────────────

class TestCaseResultSummary(BaseModel):
    """Summary for list views"""
    id: UUID
    test_case_id: Optional[UUID]
    test_case_name: str
    test_case_path: List[str]
    status: str
    duration_ms: Optional[float]
    pass_rate: Optional[float]
    total_steps: int
    passed_steps: int
    failed_steps: int
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class TestCaseResultResponse(BaseModel):
    id: UUID
    suite_run_id: UUID
    user_id: UUID
    test_case_id: Optional[UUID]
    test_case_name: str
    test_case_path: List[str]
    iteration_number: int
    started_at: datetime
    completed_at: Optional[datetime]
    duration_ms: Optional[float]
    status: str
    total_steps: int
    passed_steps: int
    failed_steps: int
    skipped_steps: int
    pass_rate: Optional[float]
    total_checkpoints: Optional[int]
    passed_checkpoints: Optional[int]
    failed_checkpoints: Optional[int]
    error_message: Optional[str]
    error_step_number: Optional[int]
    failure_screenshot_url: Optional[str]
    executive_report_url: Optional[str]
    detailed_report_url: Optional[str]
    base_url: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TestCaseResultDetailResponse(TestCaseResultResponse):
    """Full detail with all related data"""
    steps: List["StepResultResponse"]
    checkpoints: List["CheckpointResultResponse"]
    console_logs: List["ConsoleLogResponse"]
    network_logs: List["NetworkLogResponse"]
    environment: Optional["EnvironmentInfoResponse"]
    script_results: List["ScriptResultResponse"]
    accessibility_violations: List["AccessibilityViolationResponse"]

# ─────────────────────────────────────────────────────────────
# Step Result Response
# ─────────────────────────────────────────────────────────────

class StepResultResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    step_number: int
    action_type: str
    description: str
    target_selector: Optional[str]
    input_value: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_ms: Optional[float]
    status: str
    error_message: Optional[str]
    error_type: Optional[str]
    screenshot_url: Optional[str]
    screenshot_thumbnail_url: Optional[str]
    playwright_code: Optional[str]
    page_url: Optional[str]
    page_title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class StepResultDetailResponse(StepResultResponse):
    """Step with its checkpoints"""
    checkpoints: List["CheckpointResultResponse"]

# ─────────────────────────────────────────────────────────────
# Checkpoint Result Response
# ─────────────────────────────────────────────────────────────

class CheckpointResultResponse(BaseModel):
    id: UUID
    step_result_id: UUID
    test_case_result_id: UUID
    checkpoint_name: str
    checkpoint_type: str
    selector: Optional[str]
    element_tag: Optional[str]
    element_text: Optional[str]
    property_name: Optional[str]
    operator: Optional[str]
    expected_value: Optional[str]
    actual_value: Optional[str]
    passed: bool
    error_message: Optional[str]
    baseline_screenshot_url: Optional[str]
    actual_screenshot_url: Optional[str]
    diff_screenshot_url: Optional[str]
    similarity_score: Optional[float]
    api_endpoint: Optional[str]
    api_method: Optional[str]
    api_request_body: Optional[Dict[str, Any]]
    api_response_status: Optional[int]
    api_response_body: Optional[Dict[str, Any]]
    verified_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# Log Responses
# ─────────────────────────────────────────────────────────────

class ConsoleLogResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    timestamp: datetime
    level: str
    message: str
    source_url: Optional[str]
    source_line: Optional[int]
    source_column: Optional[int]
    step_number: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class NetworkLogResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    timestamp: datetime
    method: str
    url: str
    request_headers: Optional[Dict[str, str]]
    request_body: Optional[str]
    status_code: Optional[int]
    status_text: Optional[str]
    response_headers: Optional[Dict[str, str]]
    response_body_preview: Optional[str]
    response_size_bytes: Optional[int]
    duration_ms: Optional[float]
    resource_type: Optional[str]
    is_error: bool
    step_number: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# Environment Info Response
# ─────────────────────────────────────────────────────────────

class EnvironmentInfoResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    browser_name: Optional[str]
    browser_version: Optional[str]
    user_agent: Optional[str]
    js_engine: Optional[str]
    os_name: Optional[str]
    os_version: Optional[str]
    os_architecture: Optional[str]
    kernel_version: Optional[str]
    viewport_width: Optional[int]
    viewport_height: Optional[int]
    device_pixel_ratio: Optional[float]
    screen_width: Optional[int]
    screen_height: Optional[int]
    zoom_level: Optional[float]
    language: Optional[str]
    timezone: Optional[str]
    country: Optional[str]
    is_online: Optional[bool]
    connection_type: Optional[str]
    app_version: Optional[str]
    qt_version: Optional[str]
    custom_properties: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# Script Result Response
# ─────────────────────────────────────────────────────────────

class ScriptResultResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    script_type: str
    script_name: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_ms: Optional[float]
    status: str
    script_code: Optional[str]
    output: Optional[str]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# Accessibility Violation Response
# ─────────────────────────────────────────────────────────────

class AccessibilityViolationResponse(BaseModel):
    id: UUID
    test_case_result_id: UUID
    step_result_id: Optional[UUID]
    rule_id: str
    rule_description: Optional[str]
    impact: str
    selector: Optional[str]
    element_html: Optional[str]
    wcag_tags: Optional[List[str]]
    help_url: Optional[str]
    failure_summary: Optional[str]
    fix_suggestion: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# Execution History Response
# ─────────────────────────────────────────────────────────────

class TestExecutionHistoryResponse(BaseModel):
    id: UUID
    test_case_id: UUID
    test_case_result_id: UUID
    suite_run_id: UUID
    suite_name: str
    executed_at: datetime
    status: str
    duration_ms: Optional[float]
    pass_rate: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class TestExecutionHistoryListResponse(BaseModel):
    total: int
    items: List[TestExecutionHistoryResponse]
```

---

## 4. API Endpoints

### 4.1 Suite Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/suite-runs` | Create new suite run |
| GET | `/suite-runs` | List suite runs (with filters) |
| GET | `/suite-runs/{id}` | Get suite run details |
| PATCH | `/suite-runs/{id}` | Update suite run |
| DELETE | `/suite-runs/{id}` | Delete suite run (cascade) |
| GET | `/suite-runs/{id}/summary` | Get aggregated summary |
| GET | `/suite-runs/{id}/test-cases` | List test cases in run |

#### 4.1.1 POST `/suite-runs`
Create a new suite run.

**Request:**
```json
{
  "suite_name": "Regression Suite",
  "suite_path": ["ROOT", "Regression"],
  "test_plan_id": "uuid-optional",
  "trigger_type": "manual",
  "trigger_source": null,
  "tags": ["regression", "smoke"],
  "notes": "Nightly regression run"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "suite_name": "Regression Suite",
  "suite_path": ["ROOT", "Regression"],
  "started_at": "2026-01-17T10:00:00Z",
  "status": "running",
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": null,
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

#### 4.1.2 GET `/suite-runs`
List suite runs with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `test_plan_id` | uuid | Filter by test plan |
| `from_date` | datetime | Start date filter |
| `to_date` | datetime | End date filter |
| `search` | string | Search in suite_name |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 20, max: 100) |
| `sort_by` | string | Field to sort by |
| `sort_order` | string | asc or desc |

**Response:** `200 OK`
```json
{
  "total": 150,
  "items": [
    {
      "id": "uuid",
      "suite_name": "Regression Suite",
      "status": "completed",
      "started_at": "2026-01-17T10:00:00Z",
      "completed_at": "2026-01-17T10:30:00Z",
      "total_tests": 50,
      "passed_tests": 48,
      "failed_tests": 2,
      "pass_rate": 96.0
    }
  ]
}
```

#### 4.1.3 GET `/suite-runs/{id}`
Get suite run with full details.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "suite_name": "Regression Suite",
  "suite_path": ["ROOT", "Regression"],
  "status": "completed",
  "started_at": "2026-01-17T10:00:00Z",
  "completed_at": "2026-01-17T10:30:00Z",
  "duration_ms": 1800000,
  "total_tests": 50,
  "passed_tests": 48,
  "failed_tests": 2,
  "skipped_tests": 0,
  "no_run_tests": 0,
  "pass_rate": 96.0,
  "browser_name": "chromium",
  "browser_version": "120.0",
  "os_name": "macOS",
  "os_version": "14.0",
  "test_case_results": [
    {
      "id": "uuid",
      "test_case_name": "Login Test",
      "status": "passed",
      "duration_ms": 5000,
      "pass_rate": 100.0
    }
  ]
}
```

#### 4.1.4 PATCH `/suite-runs/{id}`
Update suite run (typically to update status and metrics).

**Request:**
```json
{
  "status": "completed",
  "completed_at": "2026-01-17T10:30:00Z",
  "duration_ms": 1800000,
  "total_tests": 50,
  "passed_tests": 48,
  "failed_tests": 2,
  "pass_rate": 96.0
}
```

**Response:** `200 OK`

#### 4.1.5 DELETE `/suite-runs/{id}`
Delete suite run and all related data (cascade delete).

**Response:** `200 OK`
```json
{
  "success": true,
  "deleted": {
    "suite_run": 1,
    "test_case_results": 50,
    "step_results": 500,
    "screenshots": 500
  }
}
```

---

### 4.2 Test Case Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/test-case-results` | Create test case result |
| GET | `/test-case-results/{id}` | Get test case result |
| PATCH | `/test-case-results/{id}` | Update test case result |
| DELETE | `/test-case-results/{id}` | Delete test case result |
| GET | `/test-case-results/{id}/full` | Get with all related data |
| GET | `/test-case-results/{id}/steps` | Get steps only |
| GET | `/test-case-results/{id}/checkpoints` | Get checkpoints only |
| GET | `/test-case-results/{id}/logs/console` | Get console logs |
| GET | `/test-case-results/{id}/logs/network` | Get network logs |

#### 4.2.1 POST `/test-case-results`
Create a new test case result within a suite run.

**Request:**
```json
{
  "suite_run_id": "uuid",
  "test_case_id": "uuid-optional",
  "test_case_name": "Login Test",
  "test_case_path": ["ROOT", "Auth", "Login Test"],
  "iteration_number": 1,
  "base_url": "https://example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "suite_run_id": "uuid",
  "test_case_name": "Login Test",
  "status": "pending",
  "started_at": "2026-01-17T10:00:00Z",
  "total_steps": 0
}
```

#### 4.2.2 GET `/test-case-results/{id}/full`
Get complete test case result with all related data.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "test_case_name": "Login Test",
  "test_case_path": ["ROOT", "Auth", "Login Test"],
  "status": "failed",
  "duration_ms": 15000,
  "total_steps": 10,
  "passed_steps": 8,
  "failed_steps": 1,
  "skipped_steps": 1,
  "pass_rate": 80.0,
  "error_message": "Element not found: #submit-button",
  "error_step_number": 9,
  "failure_screenshot_url": "https://storage/screenshots/uuid/step_0009.png",
  "steps": [
    {
      "step_number": 1,
      "action_type": "goto",
      "description": "Navigate to login page",
      "status": "passed",
      "duration_ms": 1500,
      "screenshot_url": "https://storage/screenshots/uuid/step_0001.png"
    }
  ],
  "checkpoints": [],
  "console_logs": [
    {
      "timestamp": "2026-01-17T10:00:05Z",
      "level": "error",
      "message": "Failed to load resource"
    }
  ],
  "network_logs": [],
  "environment": {
    "browser_name": "chromium",
    "browser_version": "120.0",
    "os_name": "macOS",
    "viewport_width": 1920,
    "viewport_height": 1080
  },
  "script_results": [],
  "accessibility_violations": []
}
```

---

### 4.3 Step Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/step-results` | Create step result |
| POST | `/step-results/bulk` | Create multiple steps |
| GET | `/step-results/{id}` | Get step result |
| PATCH | `/step-results/{id}` | Update step result |
| DELETE | `/step-results/{id}` | Delete step result |
| POST | `/step-results/{id}/screenshot` | Upload screenshot |

#### 4.3.1 POST `/step-results`
Create a single step result.

**Request:**
```json
{
  "test_case_result_id": "uuid",
  "step_number": 1,
  "action_type": "goto",
  "description": "Navigate to https://example.com",
  "target_selector": null,
  "input_value": "https://example.com",
  "playwright_code": "await page.goto('https://example.com')",
  "page_url": "https://example.com",
  "page_title": "Example Domain"
}
```

#### 4.3.2 POST `/step-results/bulk`
Create multiple step results at once.

**Request:**
```json
{
  "test_case_result_id": "uuid",
  "steps": [
    {
      "step_number": 1,
      "action_type": "goto",
      "description": "Navigate to login page"
    },
    {
      "step_number": 2,
      "action_type": "fill",
      "description": "Enter username",
      "target_selector": "#username",
      "input_value": "testuser"
    }
  ]
}
```

#### 4.3.3 POST `/step-results/{id}/screenshot`
Upload screenshot for a step.

**Request:** `multipart/form-data`
- `file`: PNG image file
- `is_thumbnail`: boolean (optional, default false)

**Response:** `200 OK`
```json
{
  "screenshot_url": "https://storage/screenshots/uuid/step_0001.png",
  "screenshot_thumbnail_url": "https://storage/screenshots/uuid/step_0001_thumb.png"
}
```

---

### 4.4 Checkpoint Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkpoint-results` | Create checkpoint result |
| POST | `/checkpoint-results/bulk` | Create multiple checkpoints |
| GET | `/checkpoint-results/{id}` | Get checkpoint result |
| DELETE | `/checkpoint-results/{id}` | Delete checkpoint result |

#### 4.4.1 POST `/checkpoint-results`
Create a checkpoint verification result.

**Request:**
```json
{
  "step_result_id": "uuid",
  "test_case_result_id": "uuid",
  "checkpoint_name": "VerifyLoginButton",
  "checkpoint_type": "element",
  "selector": "#login-btn",
  "element_tag": "button",
  "element_text": "Sign In",
  "property_name": "enabled",
  "operator": "equals",
  "expected_value": "true",
  "actual_value": "true",
  "passed": true
}
```

---

### 4.5 Logs (Console & Network)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/console-logs` | Create console log |
| POST | `/console-logs/bulk` | Bulk create console logs |
| GET | `/test-case-results/{id}/logs/console` | Get console logs |
| POST | `/network-logs` | Create network log |
| POST | `/network-logs/bulk` | Bulk create network logs |
| GET | `/test-case-results/{id}/logs/network` | Get network logs |

#### 4.5.1 POST `/console-logs/bulk`
Bulk create console logs (efficient for capturing during test).

**Request:**
```json
{
  "test_case_result_id": "uuid",
  "logs": [
    {
      "timestamp": "2026-01-17T10:00:01Z",
      "level": "log",
      "message": "Test started",
      "step_number": 1
    },
    {
      "timestamp": "2026-01-17T10:00:05Z",
      "level": "error",
      "message": "Failed to load image",
      "source_url": "https://example.com/app.js",
      "source_line": 125
    }
  ]
}
```

#### 4.5.2 GET `/test-case-results/{id}/logs/console`
Get console logs with filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | string | Filter by level (error, warn, etc.) |
| `step_number` | int | Filter by step |
| `search` | string | Search in message |
| `limit` | int | Max results (default: 100) |

---

### 4.6 Environment Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/environment-info` | Create environment info |
| GET | `/test-case-results/{id}/environment` | Get environment info |

#### 4.6.1 POST `/environment-info`
Create environment info for a test case result.

**Request:**
```json
{
  "test_case_result_id": "uuid",
  "browser_name": "chromium",
  "browser_version": "120.0.6099.109",
  "user_agent": "Mozilla/5.0...",
  "os_name": "macOS",
  "os_version": "14.0",
  "viewport_width": 1920,
  "viewport_height": 1080,
  "language": "en-US",
  "timezone": "America/New_York"
}
```

---

### 4.7 Accessibility Violations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accessibility-violations` | Create violation |
| POST | `/accessibility-violations/bulk` | Bulk create violations |
| GET | `/test-case-results/{id}/accessibility` | Get violations |

#### 4.7.1 POST `/accessibility-violations/bulk`
**Request:**
```json
{
  "test_case_result_id": "uuid",
  "violations": [
    {
      "rule_id": "color-contrast",
      "rule_description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
      "impact": "serious",
      "selector": "#main-content p",
      "wcag_tags": ["wcag2aa", "wcag143"],
      "failure_summary": "Element has insufficient color contrast of 3.5:1 (foreground color: #666666, background color: #ffffff, font size: 14.0pt, font weight: normal). Expected contrast ratio of 4.5:1",
      "fix_suggestion": "Increase contrast by darkening the text color"
    }
  ]
}
```

---

### 4.8 Test Execution History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test-cases/{id}/execution-history` | Get execution history |
| GET | `/execution-history/recent` | Get recent executions |

#### 4.8.1 GET `/test-cases/{id}/execution-history`
Get execution history for a specific test case.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 50) |
| `status` | string | Filter by status |

**Response:** `200 OK`
```json
{
  "total": 25,
  "items": [
    {
      "id": "uuid",
      "test_case_result_id": "uuid",
      "suite_run_id": "uuid",
      "suite_name": "Regression Suite",
      "executed_at": "2026-01-17T10:00:00Z",
      "status": "passed",
      "duration_ms": 5000,
      "pass_rate": 100.0
    }
  ]
}
```

---

### 4.9 Screenshots & Artifacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/artifacts/screenshots` | Upload screenshot |
| GET | `/artifacts/screenshots/{id}` | Get screenshot |
| DELETE | `/artifacts/screenshots/{id}` | Delete screenshot |
| POST | `/artifacts/reports` | Upload HTML report |
| GET | `/artifacts/reports/{id}` | Get report |

#### 4.9.1 POST `/artifacts/screenshots`
Upload a screenshot file.

**Request:** `multipart/form-data`
- `file`: Image file (PNG/JPEG)
- `test_case_result_id`: UUID
- `step_number`: int (optional)
- `type`: string (step, failure, baseline, actual, diff)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "url": "https://storage.example.com/screenshots/user-id/suite-run-id/test-case-result-id/step_0001.png",
  "thumbnail_url": "https://storage.example.com/screenshots/user-id/suite-run-id/test-case-result-id/step_0001_thumb.png",
  "size_bytes": 125000,
  "content_type": "image/png"
}
```

---

### 4.10 Report Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports/executive` | Generate executive report |
| POST | `/reports/detailed` | Generate detailed report |
| POST | `/reports/suite-summary` | Generate suite summary |
| GET | `/reports/{id}/download` | Download report |

#### 4.10.1 POST `/reports/executive`
Generate executive summary report for a test case.

**Request:**
```json
{
  "test_case_result_id": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "report_url": "https://storage/reports/uuid/executive_report.html",
  "generated_at": "2026-01-17T10:30:00Z"
}
```

---

## 5. Implementation Logic

### 5.1 Service Layer Structure

```
services/
├── report/
│   ├── __init__.py
│   ├── suite_run_service.py
│   ├── test_case_result_service.py
│   ├── step_result_service.py
│   ├── checkpoint_service.py
│   ├── log_service.py
│   ├── artifact_service.py
│   └── report_generator_service.py
```

### 5.2 Key Business Logic

#### 5.2.1 Suite Run Lifecycle
```python
# 1. Create suite run (status: running)
suite_run = await suite_run_service.create(data)

# 2. Execute tests and create test case results
for test in tests:
    tc_result = await test_case_result_service.create(suite_run.id, test)
    # ... execute test and update results

# 3. Update suite run metrics
await suite_run_service.calculate_metrics(suite_run.id)

# 4. Complete suite run
await suite_run_service.complete(suite_run.id)
```

#### 5.2.2 Metrics Calculation
```python
async def calculate_suite_metrics(suite_run_id: UUID):
    results = await db.query(TestCaseResult).filter_by(suite_run_id=suite_run_id).all()

    metrics = {
        "total_tests": len(results),
        "passed_tests": sum(1 for r in results if r.status == "passed"),
        "failed_tests": sum(1 for r in results if r.status == "failed"),
        "skipped_tests": sum(1 for r in results if r.status == "skipped"),
        "duration_ms": sum(r.duration_ms or 0 for r in results),
    }
    metrics["pass_rate"] = (metrics["passed_tests"] / metrics["total_tests"]) * 100 if metrics["total_tests"] > 0 else 0

    await suite_run_service.update(suite_run_id, metrics)
```

#### 5.2.3 Cascade Delete
```python
async def delete_suite_run(suite_run_id: UUID):
    # Delete in order to respect foreign keys
    # 1. Delete artifacts (screenshots, reports)
    await artifact_service.delete_for_suite(suite_run_id)

    # 2. Database cascade handles the rest
    await db.delete(SuiteRun).where(id=suite_run_id)

    # 3. Return summary
    return {"deleted": {...}}
```

### 5.3 Authorization
All endpoints require authentication. Users can only access their own data:
```python
@router.get("/suite-runs")
async def list_suite_runs(
    current_user: User = Depends(get_current_user),
    ...
):
    return await suite_run_service.list(user_id=current_user.id, ...)
```

---

## 6. File Storage Strategy

### 6.1 Object Storage Structure
```
{bucket}/
├── {user_id}/
│   ├── screenshots/
│   │   └── {suite_run_id}/
│   │       └── {test_case_result_id}/
│   │           ├── step_0001.png
│   │           ├── step_0001_thumb.png
│   │           ├── step_0002.png
│   │           └── failure.png
│   └── reports/
│       └── {suite_run_id}/
│           └── {test_case_result_id}/
│               ├── executive_report.html
│               └── detailed_report.html
```

### 6.2 Pre-signed URLs
For security, use pre-signed URLs with expiration:
```python
def get_screenshot_url(path: str) -> str:
    return storage.generate_presigned_url(path, expiration=3600)
```

---

## 7. Migration Notes

### 7.1 From Local to Server
When a guest user logs in and wants to migrate local data:
1. Create API endpoint: `POST /migrate/local-reports`
2. Client sends local report data in chunks
3. Server creates corresponding database records
4. Screenshots uploaded via `/artifacts/screenshots`

### 7.2 Database Migrations
Use Alembic for schema migrations:
```bash
alembic revision --autogenerate -m "Create test report tables"
alembic upgrade head
```

---

## 8. Summary

### 8.1 Total Endpoints: 35+
| Category | Count |
|----------|-------|
| Suite Runs | 7 |
| Test Case Results | 8 |
| Step Results | 6 |
| Checkpoint Results | 4 |
| Logs | 6 |
| Environment | 2 |
| Accessibility | 3 |
| History | 2 |
| Artifacts | 5 |
| Reports | 4 |

### 8.2 Database Tables: 10
1. `suite_runs`
2. `test_case_results`
3. `step_results`
4. `checkpoint_results`
5. `console_logs`
6. `network_logs`
7. `environment_info`
8. `script_results`
9. `accessibility_violations`
10. `test_execution_history`

### 8.3 Key Features
- Complete test execution tracking
- Step-by-step results with screenshots
- Checkpoint verification results
- Console and network log capture
- Environment information
- Accessibility violation tracking
- Execution history per test case
- Report generation (executive, detailed, suite summary)
- Artifact management (screenshots, reports)

---

**Document End**
