  Variables API Endpoints
                                                                                                                                                                                                                                                                 Get All Variables (Global + Local) for a Test Case
                                                                                                                                                                                                                                                               
  GET /api/v1/variables/test-case/{test_case_id}/all                                                                                                                                                                                                           

  curl "http://192.168.0.46:8000/api/v1/variables/test-case/7ce98331-6c3c-4b1a-b162-47861f2806e2/all" \
    -H "Authorization: Bearer YOUR_TOKEN"

  Response:
  {
    "global": [...],
    "local": [...]
  }

  Get Only Global Variables

  GET /api/v1/variables/global

  Get Only Local Variables for a Test Case

  GET /api/v1/variables/test-case/{test_case_id}

  ---
  Now let me complete the Test Runs implementation by creating the Schedules router and registering everything in main.py.



Variables API Documentation                                                                                                                                                                                                                                  
  
  Base URL                                                                                                                                                                                                                                                        
  /api/v1/variables                                                                                                                                                                                                                                            
  
  Authentication

  All endpoints require a Bearer token in the Authorization header.

  ---
  Variable Types
  ┌─────────┬───────────────┬─────────────────────────────────────────────────┐
  │  Type   │  Description  │                   Validation                    │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ String  │ Plain text    │ Any string                                      │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ Number  │ Numeric value │ Integer or decimal (e.g., 123, 45.67, -10)      │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ Boolean │ True/false    │ true, false, 1, 0, yes, no                      │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ Date    │ Date value    │ YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY  │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ Email   │ Email address │ Must match user@domain.com pattern              │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ Phone   │ Phone number  │ 7-20 chars, allows: digits, spaces, -, +, (), . │
  ├─────────┼───────────────┼─────────────────────────────────────────────────┤
  │ URL     │ Web URL       │ Must start with http:// or https://             │
  └─────────┴───────────────┴─────────────────────────────────────────────────┘
  ---
  Variable Name Rules

  - Must start with a letter (a-z, A-Z)
  - Can contain: letters, numbers, underscores
  - Cannot contain: spaces, special characters, hyphens
  - Maximum length: 64 characters
  - Case-sensitive

  ---
  Global Variables

  List All Global Variables

  GET /api/v1/variables/global

  Query Parameters:
  ┌───────┬──────┬─────────┬──────────────────────┐
  │ Param │ Type │ Default │     Description      │
  ├───────┼──────┼─────────┼──────────────────────┤
  │ skip  │ int  │ 0       │ Records to skip      │
  ├───────┼──────┼─────────┼──────────────────────┤
  │ limit │ int  │ 100     │ Max records (1-1000) │
  └───────┴──────┴─────────┴──────────────────────┘
  Response: 200 OK
  [
    {
      "id": "gvar_001",
      "name": "baseUrl",
      "type": "URL",
      "value": "https://api.example.com",
      "scope": "global",
      "test_case_id": null,
      "created_at": "2026-01-17T12:00:00Z",
      "updated_at": "2026-01-17T12:00:00Z"
    }
  ]

  ---
  Get Single Global Variable

  GET /api/v1/variables/global/{variable_id}

  Response: 200 OK
  {
    "id": "gvar_001",
    "name": "baseUrl",
    "type": "URL",
    "value": "https://api.example.com",
    "scope": "global",
    "test_case_id": null,
    "created_at": "2026-01-17T12:00:00Z",
    "updated_at": "2026-01-17T12:00:00Z"
  }

  ---
  Create Global Variable

  POST /api/v1/variables/global

  Request Body:
  {
    "name": "baseUrl",
    "type": "URL",
    "value": "https://api.example.com"
  }

  Fields:
  ┌───────┬─────────────────────┬──────────┬──────────────────────────────────────────────────┐
  │ Field │        Type         │ Required │                   Description                    │
  ├───────┼─────────────────────┼──────────┼──────────────────────────────────────────────────┤
  │ name  │ string (1-64 chars) │ Yes      │ Variable name (unique among global)              │
  ├───────┼─────────────────────┼──────────┼──────────────────────────────────────────────────┤
  │ type  │ enum                │ Yes      │ String, Number, Boolean, Date, Email, Phone, URL │
  ├───────┼─────────────────────┼──────────┼──────────────────────────────────────────────────┤
  │ value │ string              │ Yes      │ Variable value (validated by type)               │
  └───────┴─────────────────────┴──────────┴──────────────────────────────────────────────────┘
  Response: 201 Created
  {
    "id": "gvar_001",
    "name": "baseUrl",
    "type": "URL",
    "value": "https://api.example.com",
    "scope": "global",
    "test_case_id": null,
    "created_at": "2026-01-17T12:00:00Z",
    "updated_at": "2026-01-17T12:00:00Z"
  }

  ---
  Update Global Variable

  PUT /api/v1/variables/global/{variable_id}

  Request Body: (all fields optional)
  {
    "name": "newName",
    "type": "String",
    "value": "new value"
  }

  Response: 200 OK

  ---
  Delete Global Variable

  DELETE /api/v1/variables/global/{variable_id}

  Response: 204 No Content

  ---
  Local Variables (per Test Case)

  List Local Variables

  GET /api/v1/variables/test-case/{test_case_id}

  Response: 200 OK
  [
    {
      "id": "lvar_001",
      "name": "username",
      "type": "Email",
      "value": "test@example.com",
      "scope": "local",
      "test_case_id": "7ce98331-6c3c-4b1a-b162-47861f2806e2",
      "created_at": "2026-01-17T12:00:00Z",
      "updated_at": "2026-01-17T12:00:00Z"
    }
  ]

  ---
  Get Single Local Variable

  GET /api/v1/variables/test-case/{test_case_id}/{variable_id}

  ---
  Create Local Variable

  POST /api/v1/variables/test-case/{test_case_id}

  Request Body:
  {
    "name": "username",
    "type": "Email",
    "value": "test@example.com"
  }

  Response: 201 Created
  {
    "id": "lvar_001",
    "name": "username",
    "type": "Email",
    "value": "test@example.com",
    "scope": "local",
    "test_case_id": "7ce98331-6c3c-4b1a-b162-47861f2806e2",
    "created_at": "2026-01-17T12:00:00Z",
    "updated_at": "2026-01-17T12:00:00Z"
  }

  ---
  Update Local Variable

  PUT /api/v1/variables/test-case/{test_case_id}/{variable_id}

  Request Body: (all fields optional)
  {
    "name": "newName",
    "type": "String",
    "value": "new value"
  }

  Response: 200 OK

  ---
  Delete Local Variable

  DELETE /api/v1/variables/test-case/{test_case_id}/{variable_id}

  Response: 204 No Content

  ---
  Combined/Utility Endpoints

  Get All Variables (Global + Local)

  GET /api/v1/variables/test-case/{test_case_id}/all

  Response: 200 OK
  {
    "global": [
      {
        "id": "gvar_001",
        "name": "baseUrl",
        "type": "URL",
        "value": "https://api.example.com",
        "scope": "global",
        "test_case_id": null,
        "created_at": "2026-01-17T12:00:00Z",
        "updated_at": "2026-01-17T12:00:00Z"
      }
    ],
    "local": [
      {
        "id": "lvar_001",
        "name": "username",
        "type": "Email",
        "value": "test@example.com",
        "scope": "local",
        "test_case_id": "7ce98331-6c3c-4b1a-b162-47861f2806e2",
        "created_at": "2026-01-17T12:00:00Z",
        "updated_at": "2026-01-17T12:00:00Z"
      }
    ]
  }

  ---
  Get Merged Variables (Local Overrides Global)

  GET /api/v1/variables/test-case/{test_case_id}/merged

  Returns all variables merged by name. If a local variable has the same name as a global variable, the local value is returned.

  Response: 200 OK
  {
    "variables": [
      {
        "name": "baseUrl",
        "type": "URL",
        "value": "https://api.example.com",
        "source": "global"
      },
      {
        "name": "username",
        "type": "Email",
        "value": "test@example.com",
        "source": "local"
      }
    ]
  }

  ---
  Resolve Variable by Name

  GET /api/v1/variables/resolve?name={name}&test_case_id={id}

  Finds a variable by name, checking local first then global.

  Query Parameters:
  ┌──────────────┬────────┬──────────┬─────────────────────────────────┐
  │    Param     │  Type  │ Required │           Description           │
  ├──────────────┼────────┼──────────┼─────────────────────────────────┤
  │ name         │ string │ Yes      │ Variable name to find           │
  ├──────────────┼────────┼──────────┼─────────────────────────────────┤
  │ test_case_id │ UUID   │ No       │ If provided, checks local first │
  └──────────────┴────────┴──────────┴─────────────────────────────────┘
  Response: 200 OK
  {
    "found": true,
    "variable": {
      "id": "lvar_001",
      "name": "username",
      "type": "Email",
      "value": "test@example.com",
      "scope": "local",
      "test_case_id": "7ce98331-6c3c-4b1a-b162-47861f2806e2",
      "created_at": "2026-01-17T12:00:00Z",
      "updated_at": "2026-01-17T12:00:00Z"
    }
  }

  ---
  Error Responses

  Validation Error (400)
  {
    "detail": "Variable name must start with a letter and contain only letters, numbers, and underscores (max 64 chars)"
  }

  Type Validation Error (400)
  {
    "detail": "Invalid email format: not-an-email"
  }

  Duplicate Name (409)
  {
    "detail": "Global variable 'baseUrl' already exists"
  }

  Not Found (404)
  {
    "detail": "Variable not found: gvar_999"
  }

  ---
  Example cURL Commands

  Create Global Variable

  curl -X POST "http://192.168.0.46:8000/api/v1/variables/global" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "baseUrl",
      "type": "URL",
      "value": "https://api.example.com"
    }'

  Create Local Variable

  curl -X POST "http://192.168.0.46:8000/api/v1/variables/test-case/7ce98331-6c3c-4b1a-b162-47861f2806e2" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "username",
      "type": "Email",
      "value": "test@example.com"
    }'

  Get All Variables for Test Case

  curl "http://192.168.0.46:8000/api/v1/variables/test-case/7ce98331-6c3c-4b1a-b162-47861f2806e2/all" \
    -H "Authorization: Bearer YOUR_TOKEN"

  Resolve Variable

  curl "http://192.168.0.46:8000/api/v1/variables/resolve?name=username&test_case_id=7ce98331-6c3c-4b1a-b162-47861f2806e2" \
    -H "Authorization: Bearer YOUR_TOKEN"
