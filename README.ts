Checkpoint API Documentation      
                                                                                                                                                                                                                                                                 Base URL: /api/v1/checkpoints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  All endpoints require authentication.                                                                                                                                                                                                                          
  ---
  List checkpoints for a test case

  GET /api/v1/checkpoints/test-case/{test_case_id}
  Query params: skip (default 0), limit (default 100, max 1000)

  ---
  List checkpoints for a test step

  GET /api/v1/checkpoints/test-step/{test_step_id}

  ---
  List critical checkpoints only

  GET /api/v1/checkpoints/test-case/{test_case_id}/critical

  ---
  Get single checkpoint

  GET /api/v1/checkpoints/{checkpoint_id}

  ---
  Create checkpoint

  POST /api/v1/checkpoints/test-case/{test_case_id}
  Body:
  {
    "checkpoint_number": 1,
    "checkpoint_type": "element_visible",
    "name": "string",
    "description": "string",
    "validation_rules": {},
    "is_critical": false,
    "timeout_ms": 30000,
    "test_step_id": "uuid (optional)"
  }

  ---
  Bulk create checkpoints

  POST /api/v1/checkpoints/test-case/{test_case_id}/bulk
  Body: Array of checkpoint objects

  ---
  Update checkpoint

  PUT /api/v1/checkpoints/{checkpoint_id}

  ---
  Delete checkpoint

  DELETE /api/v1/checkpoints/{checkpoint_id}

  ---
  Delete all checkpoints for a test case

  DELETE /api/v1/checkpoints/test-case/{test_case_id}

  ---
  Reorder checkpoints

  POST /api/v1/checkpoints/test-case/{test_case_id}/reorder
  Body:
  {
    "checkpoint_ids": ["uuid1", "uuid2", "uuid3"]
  }

  ---
  Checkpoint types: element_visible, element_text, url, network, custom
