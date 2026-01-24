 Issue: Suite runs not displaying despite successful creation

  Current Status:                         
  - POST /api/v1/reports/suite-runs → 201 Created (working)
  - POST /api/v1/reports/test-case-results → 201 Created (working)                                                                                                                                                                                               - GET /api/v1/reports/suite-runs → 200 OK but UI shows 0 results
                                                                                                                                                                                                                                                               
  Database Confirmed:
  - Records exist in suite_runs table with correct user_id
  - SQL query in server logs shows correct filter: WHERE user_id = '9e584a24-0151-4abe-aa47-9c790c25514b'::UUID

  Investigation Needed (UI Team):

  1. Check the actual HTTP response body in browser dev tools (Network tab):
    - What does the response JSON look like?
    - Is total > 0? Are there items in the items array?
  2. Expected response format:
  {
    "total": 5,
    "items": [
      { "id": "...", "suite_name": "...", ... }
    ]
  }
  3. Is the UI parsing the response correctly?
    - Field names: total and items
    - Is it expecting a different structure (e.g., data instead of items)?

  Parallel Server Investigation:
  We're adding debug logging to confirm what the API is actually returning. Will update once we have that info.
