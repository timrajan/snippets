Found the Problem!
                                                                                                                                                                                                                                                                 The log shows the server IS receiving requests, but only for suite runs and test case results:                                                                                                                                                                 ┌────────────────────────────────────────────┬────────────────┐
  │                  Request                   │     Status     │                                                                                                                                                                                              
  ├────────────────────────────────────────────┼────────────────┤                                                                                                                                                                                                │ POST /api/v1/reports/suite-runs            │ ✅ 201 Created │
  ├────────────────────────────────────────────┼────────────────┤                                                                                                                                                                                              
  │ POST /api/v1/reports/test-case-results     │ ✅ 201 Created │                                                                                                                                                                                              
  ├────────────────────────────────────────────┼────────────────┤
  │ POST .../test-case-results/{id}/steps/bulk │ ❌ NOT CALLED  │
  ├────────────────────────────────────────────┼────────────────┤
  │ POST .../test-case-results/{id}/artifacts  │ ❌ NOT CALLED  │
  └────────────────────────────────────────────┴────────────────┘
  Conclusion: Client is NOT Sending Steps/Artifacts

  The client successfully:
  1. Creates a suite run with suite_name: "Sat", total_tests: 1, failed_tests: 1
  2. Creates a test case result with test_case_name: "test2", total_steps: 6

  But then stops - it never calls the endpoints to upload:
  - The 6 steps it claims to have (total_steps: 6)
  - Any screenshots/artifacts

  This is a Client-Side Issue

  The server endpoints are working correctly. The client code needs to be updated to:

  1. After creating the test case result, get the returned id
  2. Call POST /api/v1/reports/test-case-results/{id}/steps/bulk with the step data
  3. Call POST /api/v1/reports/test-case-results/{id}/artifacts for each screenshot

  The client is reporting metadata about steps (total_steps: 6) but not actually sending the step details.
