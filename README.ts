
● Now let me provide a summary of what was fixed:        

  Summary of Fixes
                                          
  1. New Endpoint Added
                                                                                                                                                                                                                                                                 Added client-compatible bulk steps endpoint:
  POST /api/v1/reports/test-case-results/{result_id}/steps/bulk                                                                                                                                                                                                
  
  2. Schema Updates (StepResultCreate)

  - Made test_case_result_id optional (can be set from path)
  - Made action_type optional
  - Added action field (client compatibility alias)
  - Added status, duration_ms, error_message to create schema
  - Added screenshot_path field
  - Added get_action_type() method to map action names

  3. Schema Updates (StepResultResponse)

  - Added action field (populated from action_type)
  - Added screenshot_path field (populated from screenshot_url)

  4. Schema Updates (TestArtifactResponse)

  - Added file_size field (alias for file_size_bytes)
  - Added download_url field (auto-generated)

  5. CRUD Updates

  - Added normalize_status() to handle "Passed" → "passed" conversion
  - Updated create_step_result() to accept status, duration_ms, error_message
  - Updated create_step_results_bulk() with same changes

  Endpoint Summary
  ┌────────────────────────────────────────────┬──────────┐
  │                  Endpoint                  │  Status  │
  ├────────────────────────────────────────────┼──────────┤
  │ POST .../test-case-results/{id}/steps/bulk │ ADDED    │
  ├────────────────────────────────────────────┼──────────┤
  │ POST .../test-case-results/{id}/artifacts  │ ✅ Works │
  ├────────────────────────────────────────────┼──────────┤
  │ GET .../test-case-results/{id}/steps       │ ✅ Works │
  ├────────────────────────────────────────────┼──────────┤
  │ GET .../test-case-results/{id}/artifacts   │ ✅ Works │
  ├────────────────────────────────────────────┼──────────┤
  │ GET .../artifacts/{id}/download            │ ✅ Works │
  └────────────────────────────────────────────┴──────────┘
  Database Table Names

  - Steps: step_results (not test_step_results)
  - Artifacts: test_artifacts

  The client should now be able to:
  1. Create bulk steps with action or action_type field
  2. Send status as "Passed", "Failed", "Skipped" (any case)
  3. Include screenshot_path in step data
  4. Get steps with action and screenshot_path in response
  5. Get artifacts with download_url and file_size in response
