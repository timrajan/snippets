Yes, you have all the endpoints for variables and checkpoints, and they're registered in the app.

  Variables Endpoints (/api/v1/variables)
  ┌────────┬────────────────────────────────┬──────────────────────────────────────┐
  │ Method │            Endpoint            │             Description              │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}      │ Create a variable                    │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ GET    │ /{variable_id}                 │ Get variable by ID                   │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ GET    │ /test-case/{test_case_id}      │ List all variables for a test case   │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ PUT    │ /{variable_id}                 │ Update a variable                    │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ DELETE │ /{variable_id}                 │ Delete a variable                    │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}/bulk │ Bulk create variables                │
  ├────────┼────────────────────────────────┼──────────────────────────────────────┤
  │ DELETE │ /test-case/{test_case_id}      │ Delete all variables for a test case │
  └────────┴────────────────────────────────┴──────────────────────────────────────┘
  Checkpoints Endpoints (/api/v1/checkpoints)
  ┌────────┬────────────────────────────────────┬────────────────────────────────────────┐
  │ Method │              Endpoint              │              Description               │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}          │ Create a checkpoint                    │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ GET    │ /{checkpoint_id}                   │ Get checkpoint by ID                   │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ GET    │ /test-case/{test_case_id}          │ List all checkpoints for a test case   │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ GET    │ /test-step/{test_step_id}          │ List checkpoints for a specific step   │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ GET    │ /test-case/{test_case_id}/critical │ List critical checkpoints only         │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ PUT    │ /{checkpoint_id}                   │ Update a checkpoint                    │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ DELETE │ /{checkpoint_id}                   │ Delete a checkpoint                    │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}/reorder  │ Reorder checkpoints                    │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}/bulk     │ Bulk create checkpoints                │
  ├────────┼────────────────────────────────────┼────────────────────────────────────────┤
  │ DELETE │ /test-case/{test_case_id}          │ Delete all checkpoints for a test case │
