 Correct Endpoint                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                 POST /api/v1/reports/test-case-results                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                 Required Request Body

  {
    "suite_run_id": "uuid-of-suite-run",
    "test_case_name": "string (required)",
    "test_case_path": ["folder", "subfolder"]
  }

  Optional Fields
  ┌──────────────────┬──────────┬─────────┐
  │      Field       │   Type   │ Default │
  ├──────────────────┼──────────┼─────────┤
  │ test_case_id     │ UUID     │ null    │
  ├──────────────────┼──────────┼─────────┤
  │ iteration_number │ int      │ 1       │
  ├──────────────────┼──────────┼─────────┤
  │ base_url         │ string   │ null    │
  ├──────────────────┼──────────┼─────────┤
  │ tags             │ string[] │ null    │
  └──────────────────┴──────────┴─────────┘
  The GET /api/v1/reports/suite-runs/{id}/test-cases endpoint is only for reading test case results, not creating them.
