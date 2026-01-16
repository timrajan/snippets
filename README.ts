● The backend shows no recording data for auth1:

  steps: []
  screenshots: []
  total_steps: 0
  screenshot_count: 0

  The recording you see in the frontend is likely stored locally in the browser (IndexedDB or localStorage), not synced to the backend.

  The frontend needs to call the backend API to save the recording. When you stop/save a recording, it should:
  1. POST /api/v1/test-recordings - create recording metadata
  2. Update test case with steps via PUT /api/v1/test-cases/{id} or a dedicated steps endpoint
