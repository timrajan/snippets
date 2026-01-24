
                                                                                                                                                                                                                                                             
● Write(get_tcr_owner.py)
  ⎿  Wrote 1 lines to get_tcr_owner.py                                                                                                                                                                                                                         
     from app.database import SessionLocal  
     from app.models.test_report import TestCaseResult                                                                                                                                                                                                         
     from app.models.user import User
     db = SessionLocal()                                                                                                                                                                                                                                          
     tcr = db.query(TestCaseResult).first()                                                                                                                                                                                                                         if tcr:
         user = db.query(User).filter(User.id == tcr.user_id).first()                                                                                                                                                                                          
         print(f"Test case result ID: {tcr.id}")
         print(f"Owner user ID: {tcr.user_id}")

● Bash(powershell.exe -Command "cd C:\api; .\venv\Scripts\python.exe get_tcr_owner.py")
  ⎿  2026-01-24 15:33:17,961 INFO sqlalchemy.engine.Engine select pg_catalog.version()
     2026-01-24 15:33:17,961 INFO sqlalchemy.engine.Engine [raw sql] {}
     2026-01-24 15:33:17,962 INFO sqlalchemy.engine.Engine select current_schema()
     … +25 lines (ctrl+o to expand)
                                                                                                                                                                                                                                                               
● Summary: Server IS NOT Receiving Steps/Artifacts      
                                                                                                                                                                                                                                                               
  Based on my investigation:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  Server Status                                                                                                                                                                                                                                                
  ┌────────────────────────────┬─────────────────────────────────────────────────┐                                                                                                                                                                               │           Check            │                     Result                      │
  ├────────────────────────────┼─────────────────────────────────────────────────┤                                                                                                                                                                             
  │ Endpoints exist            │ ✅ All 5 endpoints return 401 (auth required)   │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Database tables            │ ✅ step_results and test_artifacts tables exist │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Suite Runs                 │ ✅ 1 record                                     │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Test Case Results          │ ✅ 1 record (test2, ID: 313af830...)            │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Step Results               │ ❌ 0 records                                    │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Test Artifacts             │ ❌ 0 records                                    │
  ├────────────────────────────┼─────────────────────────────────────────────────┤
  │ Files in storage/artifacts │ ❌ Directory doesn't exist                      │
  └────────────────────────────┴─────────────────────────────────────────────────┘
  Conclusion: Client Issue

  The server endpoints are correctly implemented and accessible, but:
  - No steps are in the database → Client is NOT successfully calling the bulk steps endpoint
  - No artifacts are stored → Client is NOT successfully uploading files
  - Storage/artifacts folder doesn't exist → No uploads have been received

  What the Client Should Be Calling

  POST /api/v1/reports/test-case-results/{id}/steps/bulk
  Content-Type: application/json
  Authorization: Bearer <token>

  {
    "steps": [
      {
        "step_number": 1,
        "action": "navigate",        // or "action_type": "goto"
        "description": "Navigate to page",
        "status": "Passed",          // or "passed"
        "duration_ms": 1500,
        "error_message": null,
        "screenshot_path": "step_001.png"
      }
    ]
  }

  Questions for Client Team:

  1. Is the client actually calling POST .../steps/bulk after creating the test case result?
  2. What HTTP response is the client getting? (Check network logs)
  3. Is the client sending the auth token with the request?
  4. What exact URL and payload is the client sending?

  Would you like me to add request logging to the server to capture incoming requests and see what the client is sending (or not sending)?
