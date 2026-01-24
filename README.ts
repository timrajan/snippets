 API Alignment Report: Frontend vs Backend
                                                                                                                                                                                                                                                                 Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  After reviewing the frontend team's API Integration Report against the backend implementation, I found the APIs are largely aligned with a few notable discrepancies that need attention.                                                                      
  ---
  ✅ Well-Aligned Endpoints

  The following endpoint categories are fully aligned:
  ┌────────────┬────────────────────┬────────────┐
  │  Category  │   Backend Prefix   │   Status   │
  ├────────────┼────────────────────┼────────────┤
  │ Test Plans │ /api/v1/test-plans │ ✅ Aligned │
  ├────────────┼────────────────────┼────────────┤
  │ Test Cases │ /api/v1/test-cases │ ✅ Aligned │
  ├────────────┼────────────────────┼────────────┤
  │ Test Runs  │ /api/v1/test-runs  │ ✅ Aligned │
  ├────────────┼────────────────────┼────────────┤
  │ Defects    │ /api/v1/defects    │ ✅ Aligned │
  ├────────────┼────────────────────┼────────────┤
  │ Settings   │ /api/v1/settings   │ ✅ Aligned │
  ├────────────┼────────────────────┼────────────┤
  │ Schedules  │ /api/v1/schedules  │ ✅ Aligned │
  └────────────┴────────────────────┴────────────┘
  ---
  ⚠️ Discrepancies Found

  1. API Prefix

  All backend routes use /api/v1/ prefix. Ensure the frontend includes this prefix.

  ---
  2. Login Response Structure (POST /api/v1/auth/login)

  Frontend expects:
  {
    "access_token": "...",
    "refresh_token": "...",
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "is_paid": false
  }

  Backend returns:
  {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "is_paid": false,
      "must_change_password": false,
      ...
    },
    "workspaces": [...],
    "teams": [...],
    "login_mode": "personal"
  }

  Fix: Frontend should access user fields via response.user.id, response.user.email, etc.

  ---
  3. Register Response Structure (POST /api/v1/auth/register)

  Frontend expects:
  {
    "user_id": "uuid",
    "email": "user@example.com",
    "workspace_id": "uuid"
  }

  Backend returns:
  {
    "message": "Registration successful",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      ...
    },
    "workspace": {
      "id": "uuid",
      "name": "Personal Workspace",
      ...
    }
  }

  Fix: Frontend should access via response.user.id, response.workspace.id.

  ---
  4. Logout Response (POST /api/v1/auth/logout)

  Frontend expects:
  { "success": true }

  Backend returns:
  {
    "message": "Successfully logged out",
    "user_id": "uuid",
    "tokens_revoked": 1
  }

  Fix: Frontend should check for presence of message field or HTTP 200 status.

  ---
  5. Workspace Limits Endpoint

  Frontend expects: GET /workspace/limits
  {
    "current_count": 3,
    "max_count": 5,
    "remaining": 2,
    "can_create": true
  }

  Backend provides: GET /api/v1/workspaces/current/usage
  {
    "workspace_id": "uuid",
    "current_test_cases": 3,
    "max_test_cases": 5,
    "remaining": 2,
    "can_add": true,
    "is_unlimited": false
  }

  Discrepancies:
  - Different path: /workspace/limits vs /api/v1/workspaces/current/usage
  - Different field names: current_count → current_test_cases, max_count → max_test_cases, can_create → can_add

  ---
  6. Test Case Limit Endpoint

  Backend also has: GET /api/v1/test-cases/limit which returns similar data:
  {
    "current_test_cases": 3,
    "max_test_cases": 5,
    "can_add": true,
    "remaining": 2,
    "is_unlimited": false
  }

  ---
  Recommendations
  ┌───────────────────────────┬────────────────────────────────────────────────────────────────┐
  │           Issue           │                       Recommended Action                       │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ API prefix mismatch       │ Configure frontend base URL to include /api/v1                 │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Login response nesting    │ Update frontend to use response.user.id pattern                │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Register response nesting │ Update frontend to use response.user.id, response.workspace.id │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Logout response           │ Check HTTP status 200 or presence of message field             │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Workspace limits path     │ Update frontend to use /api/v1/workspaces/current/usage        │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Workspace limits fields   │ Map: current_count → current_test_cases, etc.                  │
  └───────────────────────────┴────────────────────────────────────────────────────────────────┘
  ---
  Additional Backend Endpoints Available

  The backend provides these endpoints that may be useful for the frontend:

  1. Team Selection (POST /api/v1/auth/select-workspace) - For team/organization users
  2. Password Change (POST /api/v1/auth/change-password)
  3. Forgot Password Flow (POST /api/v1/auth/forgot-password/verify-email, /reset)
  4. Test Plan Tree Sync (POST /api/v1/test-plans/{id}/tree/sync) - Batch update folder/case positions
  5. Test Case Parameterization (/api/v1/test-cases/{id}/parameterization) - Data-driven testing
  6. Test Case Audit Trail (/api/v1/test-cases/{id}/audit-trail)

  ---
  Conclusion

  The backend API is well-structured and covers all 63+ endpoints the frontend needs. The main integration work required is:

  1. Adjust response parsing for auth endpoints (nested user object)
  2. Update workspace limits endpoint path and field mapping
  3. Ensure /api/v1 prefix is used consistently
