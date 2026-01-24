I see the issue. The 422 error is intentional - it means:                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                 1. The test run with ID f68fdf7d-4a0a-4a14-9728-e7255eb42e3e either:                                                                                                                                                                                             - Doesn't exist, OR                                                                                                                                                                                                                                        
    - Is not in 'running' status (already completed/cancelled)                                                                                                                                                                                                   
  From the code at line 369-374:
  db_run = stop_test_run(db, run_id)
  if not db_run:
      raise HTTPException(
          status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
          detail="Cannot stop test run: not running or not found"
      )

  Summary of Issues
  ┌──────────────────────────────────┬────────┬──────────────────────────────────────────────┐
  │             Request              │ Status │                 Explanation                  │
  ├──────────────────────────────────┼────────┼──────────────────────────────────────────────┤
  │ GET /api/v1/suite-runs           │ 404    │ Wrong path - Use /api/v1/reports/suite-runs  │
  ├──────────────────────────────────┼────────┼──────────────────────────────────────────────┤
  │ POST /api/v1/test-runs/{id}/stop │ 422    │ Test run not found or not in 'running' state │
  ├──────────────────────────────────┼────────┼──────────────────────────────────────────────┤
  │ GET /api/v1/test-runs/{id}/stop  │ 405    │ Expected - stop is POST only                 │
  ├──────────────────────────────────┼────────┼──────────────────────────────────────────────┤
  │ GET /favicon.ico                 │ 404    │ Normal - no favicon served by API            │
  └──────────────────────────────────┴────────┴──────────────────────────────────────────────┘
  Correct Endpoints

  # Suite runs (test reports)
  GET  /api/v1/reports/suite-runs
  POST /api/v1/reports/suite-runs
  GET  /api/v1/reports/suite-runs/{id}

  # Test runs (execution management)
  GET  /api/v1/test-runs
  POST /api/v1/test-runs
  GET  /api/v1/test-runs/{id}
  POST /api/v1/test-runs/{id}/start
  POST /api/v1/test-runs/{id}/stop    # Only works if status='running'
  POST /api/v1/test-runs/{id}/cancel  # Only works if status='pending'
