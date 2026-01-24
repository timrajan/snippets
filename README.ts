Testr Desktop Application - API Integration Report
Document Version: 1.0 Date: January 25, 2026 Application: Testr Desktop (PyQt6/QFluentWidgets)

Executive Summary
This document provides a comprehensive overview of all API endpoints consumed by the Testr Desktop application. The application is a PyQt6-based desktop testing tool that integrates with a backend API for user authentication, test management, execution tracking, and defect reporting.

Table of Contents
Recent Feature Additions
Authentication & Session Management
Workspace & Team Management
Test Plan Management
Test Run Management
Defect Management
Reports & Analytics
User Settings
Authentication Details
Error Handling
Summary Statistics
Recent Feature Additions
Phase 14: Subscription Expiry & Personal Workspace
Handle 402 subscription expired responses
Personal workspace mode when no team is selected
Subscription expired dialog with upgrade options
Phase 15: Password Change Flow for First Login
Auto-created admin accounts with must_change_password flag
Password change dialog with validation (8+ chars, uppercase, lowercase, number)
Admin welcome dialog showing organization context
Phase 17: Session Expiry & Token Refresh Handling
Automatic token refresh every 50 minutes (production)
Session inactivity monitoring (30-minute timeout with 5-minute warning)
Network connectivity monitoring
Graceful handling of 402 errors during token refresh
Auto-logout on inactivity with warning dialog
1. Authentication & Session Management
1.1 User Login
Field	Value
Endpoint	POST /auth/login
Description	Authenticate user and obtain JWT tokens
Request Body:

{
  "email": "string",
  "password": "string"
}
Response (200 OK):

{
  "access_token": "string (JWT)",
  "refresh_token": "string (JWT)",
  "expires_in": 3600,
  "user_id": "uuid",
  "email": "string",
  "username": "string",
  "is_active": true,
  "is_paid": true,
  "workspaces": [
    {
      "id": "uuid",
      "name": "string",
      "role": "ADMIN|MEMBER|VIEWER"
    }
  ],
  "must_change_password": false,
  "organization_name": "string (optional)"
}
Notes:

workspaces array is returned when user belongs to team workspaces
must_change_password: true indicates first-login admin that must change password
organization_name is returned when must_change_password is true
1.2 User Registration
Field	Value
Endpoint	POST /auth/register
Description	Register new user account
Request Body:

{
  "email": "string",
  "password": "string"
}
Response (201 Created):

{
  "id": "uuid",
  "email": "string",
  "username": "string"
}
1.3 Token Refresh
Field	Value
Endpoint	POST /auth/refresh
Description	Refresh access token before expiry
Request Body:

{
  "refresh_token": "string"
}
Response (200 OK):

{
  "access_token": "string (JWT)",
  "refresh_token": "string (JWT)",
  "expires_in": 3600
}
Error Responses:

401 Unauthorized: Refresh token expired or invalid
402 Payment Required: Subscription expired
Notes:

Desktop app refreshes token automatically every 50 minutes
On 402 response, app shows subscription expired dialog
On 401 response, app triggers session expiry flow
1.4 Logout
Field	Value
Endpoint	POST /auth/logout
Description	Revoke refresh token and end session
Request Body:

{
  "refresh_token": "string"
}
Response (200 OK):

{
  "success": true
}
1.5 Get Current User
Field	Value
Endpoint	GET /auth/me
Description	Get authenticated user's profile
Response (200 OK):

{
  "user_id": "uuid",
  "id": "uuid",
  "email": "string",
  "username": "string",
  "is_active": true,
  "is_paid": true
}
1.6 Change Password
Field	Value
Endpoint	POST /auth/change-password
Description	Change user password (requires authentication)
Request Body:

{
  "current_password": "string",
  "new_password": "string"
}
Response (200 OK):

{
  "success": true,
  "message": "Password changed successfully"
}
Validation Rules:

New password: minimum 8 characters
Must contain: uppercase, lowercase, and number
Notes:

For first-login admins (must_change_password: true), current_password may be the temporary password
After successful change, app continues with normal login flow
1.7 Forgot Password - Verify Email
Field	Value
Endpoint	POST /auth/forgot-password/verify-email
Description	Step 1: Verify email exists for password reset
Request Body:

{
  "email": "string"
}
Response (200 OK):

{
  "success": true
}
1.8 Forgot Password - Reset
Field	Value
Endpoint	POST /auth/forgot-password/reset
Description	Step 2: Reset password after email verification
Request Body:

{
  "email": "string",
  "new_password": "string"
}
Response (200 OK):

{
  "success": true
}
2. Workspace & Team Management
2.1 Get Workspace Limits
Field	Value
Endpoint	GET /workspace/limits
Description	Check workspace test case quotas
Response (200 OK):

{
  "max_test_cases": 100,
  "current_test_cases": 45,
  "can_add_more": true,
  "is_unlimited": false
}
Notes:

is_unlimited: true for paid/enterprise plans
Used to show limit warnings before creating test cases
Returns 403 when limit reached (app shows upgrade dialog)
3. Test Plan Management
3.1 List Test Plans
Field	Value
Endpoint	GET /test-plans
Description	Get all test plans for current workspace
Response (200 OK):

{
  "test_plans": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "is_active": true,
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ]
}
3.2 Create Test Plan
Field	Value
Endpoint	POST /test-plans
Description	Create new test plan
Request Body:

{
  "name": "string",
  "description": "string (optional)",
  "is_active": true
}
Response (201 Created):

{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "is_active": true,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
3.3 Get Test Plan
Field	Value
Endpoint	GET /test-plans/{plan_id}
Description	Get specific test plan details
Path Parameters:

plan_id: UUID of the test plan
Response (200 OK):

{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "is_active": true,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
3.4 Update Test Plan
Field	Value
Endpoint	PUT /test-plans/{plan_id}
Description	Update test plan metadata
Request Body:

{
  "name": "string (optional)",
  "description": "string (optional)",
  "is_active": "boolean (optional)"
}
3.5 Delete Test Plan
Field	Value
Endpoint	DELETE /test-plans/{plan_id}
Description	Delete test plan and all contents
3.6 Get Test Plan Tree
Field	Value
Endpoint	GET /test-plans/{plan_id}/tree
Description	Get complete hierarchical structure
Response (200 OK):

{
  "id": "uuid",
  "type": "root",
  "name": "string",
  "expanded": true,
  "children": [],
  "folders": [
    {
      "id": "uuid",
      "name": "string",
      "parent_folder_id": "uuid|null",
      "display_order": 0,
      "children": []
    }
  ],
  "root_test_cases": [
    {
      "id": "uuid",
      "name": "string",
      "folder_id": "uuid|null",
      "display_order": 0
    }
  ]
}
3.7 Sync Test Plan Tree
Field	Value
Endpoint	POST /test-plans/{plan_id}/tree/sync
Description	Sync tree structure changes (reorder, move)
Request Body:

{
  "tree": {
    "folders": [...],
    "test_cases": [...]
  }
}
3.8 Create Folder
Field	Value
Endpoint	POST /folders
Description	Create folder in test plan
Request Body:

{
  "test_plan_id": "uuid",
  "name": "string",
  "parent_folder_id": "uuid (optional)",
  "display_order": 0
}
3.9 Reorder Folders
Field	Value
Endpoint	POST /folders/reorder
Description	Update folder display order
Request Body:

[
  {"folder_id": "uuid", "display_order": 0},
  {"folder_id": "uuid", "display_order": 1}
]
3.10 Create Test Case
Field	Value
Endpoint	POST /test-cases
Description	Create new test case
Request Body:

{
  "test_plan_id": "uuid",
  "name": "string",
  "folder_id": "uuid (optional)",
  "description": "string",
  "priority": "HIGH|MEDIUM|LOW",
  "base_url": "string",
  "browser": "chromium|firefox|webkit",
  "tags": ["string"],
  "display_order": 0
}
Response (201 Created):

{
  "id": "uuid",
  "test_plan_id": "uuid",
  "name": "string",
  "folder_id": "uuid|null",
  "description": "string",
  "priority": "string",
  "base_url": "string",
  "browser": "string",
  "tags": [],
  "display_order": 0,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
3.11 Reorder Test Cases
Field	Value
Endpoint	POST /test-cases/reorder
Description	Update test case display order
Request Body:

[
  {"test_case_id": "uuid", "display_order": 0},
  {"test_case_id": "uuid", "display_order": 1}
]
3.12 Create Test Recording
Field	Value
Endpoint	POST /test-recordings
Description	Create test recording for test case
Request Body:

{
  "test_case_id": "uuid",
  "recording_data": "JSON blob"
}
3.13 Create Test Script
Field	Value
Endpoint	POST /test-scripts
Description	Create pre/post execution script
Request Body:

{
  "test_case_id": "uuid",
  "script_type": "pre|post",
  "script_language": "javascript|python",
  "script_content": "string"
}
3.14 Get Global Variables
Field	Value
Endpoint	GET /variables/global
Description	Get all global variables
3.15 Create Global Variable
Field	Value
Endpoint	POST /variables/global
Description	Create new global variable
Request Body:

{
  "name": "string",
  "value": "string",
  "scope": "GLOBAL|TEST_PLAN|TEST_CASE",
  "is_encrypted": false
}
3.16 Resolve Variables
Field	Value
Endpoint	GET /variables/resolve
Description	Resolve variable values at runtime
Query Parameters:

names: Comma-separated variable names
4. Test Run Management
4.1 Create Test Run
Field	Value
Endpoint	POST /test-runs
Description	Create new test run
Request Body:

{
  "run_name": "string",
  "test_plan_id": "uuid",
  "suite_path": "string",
  "suite_name": "string",
  "scheduled_at": "ISO8601 (optional)",
  "parallel_enabled": false,
  "parallel_count": 1,
  "retry_on_failure": false,
  "retry_count": 0,
  "browser_name": "chromium",
  "viewport_width": 1920,
  "viewport_height": 1080,
  "tags": [],
  "notes": "string"
}
Response (201 Created):

{
  "id": "uuid",
  "run_name": "string",
  "run_number": 1,
  "status": "PENDING|RUNNING|COMPLETED|FAILED|CANCELLED",
  "test_plan_id": "uuid",
  "scheduled_at": "ISO8601",
  "started_at": "ISO8601",
  "completed_at": "ISO8601",
  "duration_ms": 0,
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "pass_rate": 0.0,
  "browser_name": "string",
  "viewport_width": 1920,
  "viewport_height": 1080,
  "created_at": "ISO8601"
}
4.2 List Test Runs
Field	Value
Endpoint	GET /test-runs
Description	List test runs with filtering
Query Parameters:

test_plan_id: UUID (filter by test plan)
status: PENDING|RUNNING|COMPLETED|FAILED|CANCELLED
from_date: ISO8601
to_date: ISO8601
search: string
sort_by: created_at|run_name|status
sort_order: asc|desc
limit: integer (default 50)
offset: integer (default 0)
Response (200 OK):

{
  "items": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
4.3 Get Test Run
Field	Value
Endpoint	GET /test-runs/{run_id}
Description	Get specific test run details
4.4 Update Test Run
Field	Value
Endpoint	PUT /test-runs/{run_id}
Description	Update test run (typically for completion)
Request Body:

{
  "status": "COMPLETED",
  "completed_at": "ISO8601",
  "duration_ms": 12345,
  "total_tests": 10,
  "passed_tests": 8,
  "failed_tests": 2,
  "skipped_tests": 0,
  "pass_rate": 80.0,
  "results_folder": "string",
  "report_path": "string"
}
4.5 Delete Test Run
Field	Value
Endpoint	DELETE /test-runs/{run_id}
Description	Delete test run
4.6 Start Test Run
Field	Value
Endpoint	POST /test-runs/{run_id}/start
Description	Start executing test run
Request Body:

{
  "browser_name": "chromium",
  "viewport_width": 1920,
  "viewport_height": 1080
}
4.7 Stop Test Run
Field	Value
Endpoint	POST /test-runs/{run_id}/stop
Description	Stop a running test run
4.8 Cancel Test Run
Field	Value
Endpoint	POST /test-runs/{run_id}/cancel
Description	Cancel a test run
4.9 Get Test Run Summary
Field	Value
Endpoint	GET /test-runs/{run_id}/summary
Description	Get detailed statistics
4.10 Add Test Run Item
Field	Value
Endpoint	POST /test-runs/{run_id}/items
Description	Add single test case to run
Request Body:

{
  "test_case_id": "uuid"
}
4.11 Bulk Add Test Run Items
Field	Value
Endpoint	POST /test-runs/{run_id}/items/bulk
Description	Add multiple test cases to run
Request Body:

{
  "test_case_ids": ["uuid", "uuid"]
}
Response (200 OK):

{
  "items": [...],
  "total_added": 5
}
4.12 List Test Run Items
Field	Value
Endpoint	GET /test-runs/{run_id}/items
Description	Get all items in test run
4.13 Create Test Run Result
Field	Value
Endpoint	POST /test-run-results
Description	Record test case execution result
Request Body:

{
  "test_run_id": "uuid",
  "test_run_item_id": "uuid",
  "test_case_id": "uuid",
  "iteration_number": 1,
  "data_row_index": 0,
  "data_row_values": {},
  "status": "PASSED|FAILED|SKIPPED|ERROR",
  "duration_ms": 5000,
  "total_steps": 10,
  "passed_steps": 10,
  "failed_steps": 0,
  "skipped_steps": 0,
  "pass_rate": 100.0,
  "error_message": "string (optional)",
  "error_screenshot": "base64 (optional)",
  "start_url": "string",
  "final_url": "string",
  "browser_name": "string",
  "os_name": "string"
}
4.14 Create Schedule
Field	Value
Endpoint	POST /schedules
Description	Create scheduled test run
Request Body:

{
  "schedule_name": "string",
  "test_plan_id": "uuid",
  "status": "ACTIVE|PAUSED|COMPLETED",
  "is_enabled": true,
  "suite_path": "string",
  "suite_name": "string",
  "test_case_ids": ["uuid"],
  "scheduled_datetime": "ISO8601",
  "timezone": "UTC",
  "repeat_type": "NONE|DAILY|WEEKLY|MONTHLY",
  "repeat_interval": 1,
  "repeat_days_of_week": [1, 2, 3],
  "repeat_day_of_month": 15,
  "repeat_end_date": "ISO8601",
  "max_occurrences": 10,
  "parallel_enabled": false,
  "parallel_count": 1,
  "retry_on_failure": false,
  "retry_count": 0,
  "notify_on_failure": true,
  "notify_on_completion": false,
  "notification_emails": ["email@example.com"]
}
4.15 List Schedules
Field	Value
Endpoint	GET /schedules
Description	List schedules with filtering
Query Parameters:

test_plan_id: UUID
status: ACTIVE|PAUSED|COMPLETED
sort_by: string
sort_order: asc|desc
limit: integer
offset: integer
4.16 Get Pending Schedules
Field	Value
Endpoint	GET /schedules/pending
Description	Get schedules ready to execute
5. Defect Management
5.1 List Defects
Field	Value
Endpoint	GET /defects
Description	List defects with filtering
Query Parameters:

filter_id: UUID (saved filter)
status: OPEN|IN_PROGRESS|RESOLVED|CLOSED|DEFERRED
severity: CRITICAL|HIGH|MEDIUM|LOW
priority: P1|P2|P3|P4
type: BUG|ENHANCEMENT|TASK
tags: comma-separated
folder_id: UUID
search: string
date_from: ISO8601
date_to: ISO8601
page: integer
per_page: integer
sort_by: string
sort_order: asc|desc
Response (200 OK):

{
  "defects": [...],
  "total": 100,
  "page": 1,
  "per_page": 50
}
5.2 Get Defect
Field	Value
Endpoint	GET /defects/{defect_id}
Description	Get single defect with all details
Response includes:

Basic defect info
Steps to reproduce
Screenshots
Console errors
Network errors
Test context (test case, test run info)
5.3 Create Defect
Field	Value
Endpoint	POST /defects
Description	Create new defect
Request Body:

{
  "title": "string",
  "summary": "string",
  "description": "string",
  "type": "BUG|ENHANCEMENT|TASK",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "priority": "P1|P2|P3|P4",
  "status": "OPEN",
  "tags": ["string"],
  "owner": "string",
  "is_auto_generated": false,
  "test_context": {
    "test_case_id": "uuid",
    "test_run_id": "uuid",
    "step_number": 5
  },
  "steps": [
    {
      "step_number": 1,
      "description": "string",
      "expected_result": "string",
      "actual_result": "string"
    }
  ],
  "console_errors": ["string"],
  "network_errors": ["string"]
}
Response (201 Created):

{
  "id": "uuid",
  "defect_number": "DEF-001",
  ...
}
5.4 Bulk Update Defects
Field	Value
Endpoint	PATCH /defects/batch
Description	Update multiple defects at once
Request Body:

{
  "defect_ids": ["uuid", "uuid"],
  "status": "RESOLVED",
  "priority": "P2"
}
5.5 Bulk Delete Defects
Field	Value
Endpoint	DELETE /defects/batch
Description	Delete multiple defects
Request Body:

{
  "defect_ids": ["uuid", "uuid"]
}
5.6 Get Defect Statistics
Field	Value
Endpoint	GET /defects/statistics
Description	Get defect metrics
Query Parameters:

date_from: ISO8601
date_to: ISO8601
folder_id: UUID
5.7 List Defect Folders
Field	Value
Endpoint	GET /defects/folders
Description	Get defect folder structure
5.8 Create Defect Folder
Field	Value
Endpoint	POST /defects/folders
Description	Create defect folder
Request Body:

{
  "name": "string",
  "parent_id": "uuid (optional)"
}
5.9 List Saved Filters
Field	Value
Endpoint	GET /defects/filters
Description	Get saved defect filters
5.10 Create Saved Filter
Field	Value
Endpoint	POST /defects/filters
Description	Save defect filter
5.11 Get Filter Templates
Field	Value
Endpoint	GET /defects/filter-templates
Description	Get predefined filter templates
5.12 Export Defects
Field	Value
Endpoint	GET /defects/export/json
Description	Export defects as JSON
6. Reports & Analytics
6.1 Create Suite Run
Field	Value
Endpoint	POST /reports/suite-runs
Description	Create test suite run report
Request Body:

{
  "suite_name": "string",
  "suite_path": "string",
  "status": "PASSED|FAILED|ERROR",
  "total_tests": 10,
  "passed_tests": 8,
  "failed_tests": 2,
  "skipped_tests": 0,
  "duration_ms": 60000,
  "environment": "string",
  "tags": [],
  "metadata": {}
}
6.2 List Suite Runs
Field	Value
Endpoint	GET /reports/suite-runs
Description	List suite runs with filtering
6.3 Get Suite Run
Field	Value
Endpoint	GET /reports/suite-runs/{suite_run_id}
Description	Get single suite run details
7. User Settings
7.1 Get Settings
Field	Value
Endpoint	GET /settings
Description	Get all user settings
Response (200 OK):

{
  "recording_auto_pause": true,
  "recording_capture_screenshots": true,
  "checkpoint_auto_generate": false,
  "ai_enabled": true,
  "ai_suggestion_threshold": 0.7,
  "execution_timeout_seconds": 30,
  "execution_retry_count": 3,
  "jira_enabled": false,
  "jira_url": "",
  "azure_devops_enabled": false,
  ...
}
7.2 Update Settings
Field	Value
Endpoint	PUT /settings
Description	Update all user settings
7.3 Reset Settings
Field	Value
Endpoint	POST /settings/reset
Description	Reset to default settings
Request Body:

{
  "confirm": true
}
7.4 Test Integration
Field	Value
Endpoint	POST /settings/integrations/test
Description	Test Jira/Azure DevOps connection
8. Test Run Tree
8.1 Get Test Run Tree
Field	Value
Endpoint	GET /test-run-tree
Description	Get test run folder hierarchy
8.2 Create Test Run Folder
Field	Value
Endpoint	POST /test-run-tree/folders
Description	Create folder in test run tree
8.3 Organize Test Run
Field	Value
Endpoint	POST /test-run-tree/testruns
Description	Place test run in folder
Authentication Details
Token Type
Type: Bearer Token (JWT)
Header: Authorization: Bearer {access_token}
Token Lifetimes
Token	Lifetime	Refresh Strategy
Access Token	1 hour	Auto-refresh every 50 minutes
Refresh Token	8 hours	Session expires when this expires
Token Flow
1. POST /auth/login
   ├── Success: Receive access_token + refresh_token
   └── Save tokens securely

2. All API Requests
   └── Include: Authorization: Bearer {access_token}

3. Every 50 minutes (automatic)
   ├── POST /auth/refresh with refresh_token
   ├── Success: Update both tokens
   └── Failure (401/402): Trigger session expiry

4. POST /auth/logout
   └── Revoke refresh_token on server
Error Handling
HTTP Status Codes
Code	Meaning	Desktop App Behavior
200	Success	Process response
201	Created	Process response
400	Bad Request	Show validation error
401	Unauthorized	Trigger login flow
402	Payment Required	Show subscription expired dialog
403	Forbidden	Show limit reached dialog or access denied
404	Not Found	Show "not found" message
422	Validation Error	Show field-specific errors
500	Server Error	Show generic error + retry option
Error Response Format
{
  "error": "string",
  "message": "Human readable message",
  "details": {
    "field_name": ["error1", "error2"]
  }
}
Summary Statistics
Category	Count
Authentication Endpoints	8
Workspace Management	1
Test Plan Management	16
Test Run Management	16
Defect Management	12
Reports	3
Settings	4
Test Run Tree	3
Total Endpoints	63
HTTP Methods Used
GET (read operations)
POST (create operations)
PUT (full update operations)
PATCH (partial update operations)
DELETE (delete operations)
API Base URL Configuration
The desktop application uses environment-based API URL configuration:

Environment	Base URL
Development	http://localhost:8000/api/v1
Staging	https://staging-api.testr.app/api/v1
Production	https://api.testr.app/api/v1
Contact
For API-related questions or clarifications, please contact the Desktop Application team.

Document generated: January 25, 2026
