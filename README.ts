 /api/v1/test-scripts                                                                                                                                                                                                                                         

  Authentication

  All endpoints require a Bearer token in the Authorization header.

  ---
  Create a Script

  POST /api/v1/test-scripts

  Request Body:
  {
    "test_case_id": "uuid-of-test-case",
    "script_name": "My Script",
    "script_type": "pre_execution",
    "script_language": "python",
    "script_content": "print('Hello World')",
    "file_path": null,
    "timeout_ms": 30000,
    "enabled": true,
    "description": "Optional description"
  }

  Fields:
  ┌─────────────────┬──────────────────────┬──────────┬─────────────────────────────────────────────┐
  │      Field      │         Type         │ Required │                 Description                 │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ test_case_id    │ string (UUID)        │ Yes      │ Test case this script belongs to            │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ script_name     │ string (1-255 chars) │ Yes      │ Script name                                 │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ script_type     │ enum                 │ Yes      │ pre_execution, post_execution, on_demand    │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ script_language │ enum                 │ No       │ python, javascript, shell (default: python) │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ script_content  │ string               │ No       │ Inline script content                       │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ file_path       │ string               │ No       │ Path to script file                         │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ timeout_ms      │ int                  │ No       │ Timeout in ms (1000-300000, default: 30000) │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ enabled         │ bool                 │ No       │ Whether script is enabled (default: true)   │
  ├─────────────────┼──────────────────────┼──────────┼─────────────────────────────────────────────┤
  │ description     │ string               │ No       │ Script description                          │
  └─────────────────┴──────────────────────┴──────────┴─────────────────────────────────────────────┘
  Response: 201 Created
  {
    "id": "generated-uuid",
    "test_case_id": "uuid-of-test-case",
    "script_name": "My Script",
    "script_type": "pre_execution",
    "script_language": "python",
    "script_content": "print('Hello World')",
    "file_path": null,
    "timeout_ms": 30000,
    "enabled": true,
    "description": "Optional description",
    "is_validated": false,
    "validation_error": null,
    "last_validated_at": null,
    "created_by": "user-uuid",
    "created_at": "2026-01-17T12:00:00Z",
    "updated_at": "2026-01-17T12:00:00Z"
  }

  ---
  Get Scripts by Test Case

  GET /api/v1/test-scripts/by-test-case/{test_case_id}

  ---
  Update a Script

  PUT /api/v1/test-scripts/{script_id}

  Request Body: (all fields optional)
  {
    "script_name": "Updated Name",
    "script_content": "updated code here",
    "enabled": false
  }

  ---
  Delete a Script

  DELETE /api/v1/test-scripts/{script_id}

  Response: 204 No Content

  ---
  Example cURL - Create Script

  curl -X POST "http://192.168.0.46:8000/api/v1/test-scripts" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "test_case_id": "485854b9-690e-46b6-bea1-40f1c6d77561",
      "script_name": "Login Test Script",
      "script_type": "pre_execution",
      "script_language": "javascript",
      "script_content": "const { test } = require(\"@playwright/test\");\ntest(\"login\", async ({ page }) => {\n  await page.goto(\"https://example.com\");\n});"
    }'
