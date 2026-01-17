Script Upload API Endpoint                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                 Create Script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  POST /api/v1/test-scripts                                                                                                                                                                                                                                      
  Required Headers

  Authorization: Bearer <token>
  Content-Type: application/json

  Request Body

  {
    "test_case_id": "3598cec8-8232-49e5-af7f-849c7a02f119",
    "script_name": "my_script.py",
    "script_type": "pre_execution",
    "script_language": "python",
    "file_path": "/path/to/script.py",
    "script_content": "# optional inline content",
    "timeout_ms": 30000,
    "enabled": true,
    "description": "Optional description"
  }

  Required Fields
  ┌──────────────┬───────────────┬──────────────────────────────────────────────────────────────────────┐
  │    Field     │     Type      │                             Description                              │
  ├──────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
  │ test_case_id │ string (UUID) │ The test case ID (for newday5: 3598cec8-8232-49e5-af7f-849c7a02f119) │
  ├──────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
  │ script_name  │ string        │ Name of the script                                                   │
  ├──────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤
  │ script_type  │ enum          │ pre_execution, post_execution, or on_demand                          │
  └──────────────┴───────────────┴──────────────────────────────────────────────────────────────────────┘
  Optional Fields
  ┌─────────────────┬────────┬─────────┬──────────────────────────────┐
  │      Field      │  Type  │ Default │         Description          │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ script_language │ enum   │ python  │ python, javascript, or shell │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ file_path       │ string │ null    │ Path to script file          │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ script_content  │ string │ null    │ Inline script content        │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ timeout_ms      │ int    │ 30000   │ Timeout (1000-300000 ms)     │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ enabled         │ bool   │ true    │ Enable/disable script        │
  ├─────────────────┼────────┼─────────┼──────────────────────────────┤
  │ description     │ string │ null    │ Script description           │
  └─────────────────┴────────┴─────────┴──────────────────────────────┘
  ---
  Other Script Endpoints
  ┌────────┬──────────────────────────────────────────────────┬─────────────────────────────────┐
  │ Method │                     Endpoint                     │           Description           │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ GET    │ /api/v1/test-scripts/{script_id}                 │ Get script by ID                │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ GET    │ /api/v1/test-scripts?test_case_id={id}           │ List scripts (with filter)      │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ GET    │ /api/v1/test-scripts/by-test-case/{test_case_id} │ Get all scripts for a test case │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ PUT    │ /api/v1/test-scripts/{script_id}                 │ Update script                   │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ DELETE │ /api/v1/test-scripts/{script_id}                 │ Delete script                   │
  ├────────┼──────────────────────────────────────────────────┼─────────────────────────────────┤
  │ POST   │ /api/v1/test-scripts/{script_id}/validate        │ Validate script                 │
  └────────┴──────────────────────────────────────────────────┴─────────────────────────────────┘
