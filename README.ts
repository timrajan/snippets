Variables Feature - API Specification Document
This document describes the Variables feature in the Testr application, intended to help design the server-side API for variable management.

Overview
Variables allow users to store reusable values that can be referenced in test cases using ${variableName} syntax. Variables have two scopes:

Global Variables: Available across ALL test cases in the project
Local Variables: Specific to a single test case (can override global variables with the same name)
Variable Data Model
Variable Object
{
  "id": "gvar_001",
  "name": "baseUrl",
  "type": "URL",
  "value": "https://api.example.com",
  "scope": "global",
  "created_at": "2026-01-17T12:00:00Z",
  "updated_at": "2026-01-17T12:30:00Z"
}
Fields
Field	Type	Required	Description
id	string	Yes (auto-generated)	Unique identifier. Format: gvar_001 for global, lvar_001 for local
name	string (1-64 chars)	Yes	Variable name. Must start with letter, alphanumeric + underscore only
type	enum	Yes	Variable type (see Variable Types below)
value	string	Yes	Variable value (validated based on type)
scope	enum	Yes	"global" or "local"
created_at	datetime	Yes (auto)	ISO 8601 timestamp
updated_at	datetime	Yes (auto)	ISO 8601 timestamp
Variable Types
Type	Description	Validation Rules
String	Plain text value	Any string allowed
Number	Numeric value	Must be valid integer or decimal (e.g., 123, 45.67, -10)
Boolean	True/false value	Accepts: true, false, 1, 0, yes, no (case-insensitive)
Date	Date value	Formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY
Email	Email address	Must match email pattern: user@domain.com
Phone	Phone number	7-20 characters, allows: digits, spaces, -, +, (), .
URL	Web URL	Must start with http:// or https://
Variable Scopes
Global Scope ("global")
Available to ALL test cases in the project
Stored at project level (not tied to any specific test case)
Use for: API base URLs, common credentials, environment settings, shared data
Local Scope ("local")
Available only to the specific test case where it's defined
Tied to a specific test_case_id
Overrides global variables with the same name (local takes priority)
Use for: Test-specific data, values that vary per test case
Variable Name Rules
Must start with a letter (a-z, A-Z)
Can contain: letters, numbers, underscores
Cannot contain: spaces, special characters, hyphens
Maximum length: 64 characters
Case-sensitive (userName and username are different)
Valid Names
baseUrl
user_name
API_KEY
testData1
Invalid Names
1variable (starts with number)
user-name (contains hyphen)
user name (contains space)
user@name (contains special character)
CRUD Operations
Global Variables
List All Global Variables
Purpose: Get all global variables for the project
Current Storage: config/global_variables.json
Get Global Variable by ID
Purpose: Get a specific global variable
Lookup: By id field
Get Global Variable by Name
Purpose: Find a global variable by name
Lookup: By name field
Create Global Variable
Required Fields: name, type, value
Auto-generated: id, scope (set to "global"), created_at, updated_at
Validation:
Name must be unique among global variables
Name must match naming rules
Value must pass type validation
Update Global Variable
Lookup: By id
Updatable Fields: name, type, value
Validation:
New name must not conflict with other global variables
Value must pass type validation for new/existing type
Delete Global Variable
Lookup: By id
Behavior: Permanent deletion
Local Variables
List Local Variables for Test Case
Purpose: Get all local variables for a specific test case
Required: test_case_id
Current Storage: recordings/{test_path}/test_details.json (in variables array)
Get Local Variable by ID
Purpose: Get a specific local variable
Required: test_case_id, variable_id
Get Local Variable by Name
Purpose: Find a local variable by name within a test case
Required: test_case_id, name
Create Local Variable
Required Fields: test_case_id, name, type, value
Auto-generated: id, scope (set to "local"), created_at, updated_at
Validation:
Name must be unique within the test case's local variables
Name must match naming rules
Value must pass type validation
Update Local Variable
Lookup: By test_case_id and variable_id
Updatable Fields: name, type, value
Validation:
New name must not conflict with other local variables in same test case
Value must pass type validation
Delete Local Variable
Lookup: By test_case_id and variable_id
Behavior: Permanent deletion
Combined Operations
Get All Variables for Test Case
Purpose: Get both global AND local variables for a test case
Required: test_case_id
Response:
{
  "global": [...],
  "local": [...]
}
Get Merged Variables
Purpose: Get all variables merged by name (local overrides global)
Required: test_case_id
Behavior: If a local variable has the same name as a global, the local value is returned
Use Case: Variable resolution during test execution
Find Variable by Name
Purpose: Find a variable by name, checking local first then global
Required: name, optional test_case_id
Behavior:
If test_case_id provided, search local variables first
If not found (or no test_case_id), search global variables
Return first match or null
Suggested API Endpoints
Global Variables
GET    /api/v1/variables/global                     # List all global variables
GET    /api/v1/variables/global/{variable_id}       # Get single global variable
POST   /api/v1/variables/global                     # Create global variable
PUT    /api/v1/variables/global/{variable_id}       # Update global variable
DELETE /api/v1/variables/global/{variable_id}       # Delete global variable
Local Variables (per Test Case)
GET    /api/v1/variables/test-case/{test_case_id}              # List local variables
GET    /api/v1/variables/test-case/{test_case_id}/{var_id}     # Get single local variable
POST   /api/v1/variables/test-case/{test_case_id}              # Create local variable
PUT    /api/v1/variables/test-case/{test_case_id}/{var_id}     # Update local variable
DELETE /api/v1/variables/test-case/{test_case_id}/{var_id}     # Delete local variable
Combined/Utility
GET    /api/v1/variables/test-case/{test_case_id}/all          # Get global + local
GET    /api/v1/variables/test-case/{test_case_id}/merged       # Get merged (local overrides global)
GET    /api/v1/variables/resolve?name={name}&test_case_id={id} # Find variable by name
Request/Response Examples
Create Global Variable
Request:

POST /api/v1/variables/global
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "apiBaseUrl",
  "type": "URL",
  "value": "https://api.example.com"
}
Response (201 Created):

{
  "id": "gvar_001",
  "name": "apiBaseUrl",
  "type": "URL",
  "value": "https://api.example.com",
  "scope": "global",
  "created_at": "2026-01-17T14:00:00Z",
  "updated_at": "2026-01-17T14:00:00Z"
}
Create Local Variable
Request:

POST /api/v1/variables/test-case/485854b9-690e-46b6-bea1-40f1c6d77561
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "testUsername",
  "type": "String",
  "value": "testuser@example.com"
}
Response (201 Created):

{
  "id": "lvar_001",
  "name": "testUsername",
  "type": "String",
  "value": "testuser@example.com",
  "scope": "local",
  "test_case_id": "485854b9-690e-46b6-bea1-40f1c6d77561",
  "created_at": "2026-01-17T14:00:00Z",
  "updated_at": "2026-01-17T14:00:00Z"
}
List All Variables for Test Case
Request:

GET /api/v1/variables/test-case/485854b9-690e-46b6-bea1-40f1c6d77561/all
Authorization: Bearer {token}
Response (200 OK):

{
  "global": [
    {
      "id": "gvar_001",
      "name": "apiBaseUrl",
      "type": "URL",
      "value": "https://api.example.com",
      "scope": "global",
      "created_at": "2026-01-17T14:00:00Z",
      "updated_at": "2026-01-17T14:00:00Z"
    }
  ],
  "local": [
    {
      "id": "lvar_001",
      "name": "testUsername",
      "type": "String",
      "value": "testuser@example.com",
      "scope": "local",
      "test_case_id": "485854b9-690e-46b6-bea1-40f1c6d77561",
      "created_at": "2026-01-17T14:00:00Z",
      "updated_at": "2026-01-17T14:00:00Z"
    }
  ]
}
Update Variable
Request:

PUT /api/v1/variables/global/gvar_001
Content-Type: application/json
Authorization: Bearer {token}

{
  "value": "https://staging-api.example.com"
}
Response (200 OK):

{
  "id": "gvar_001",
  "name": "apiBaseUrl",
  "type": "URL",
  "value": "https://staging-api.example.com",
  "scope": "global",
  "created_at": "2026-01-17T14:00:00Z",
  "updated_at": "2026-01-17T14:30:00Z"
}
Error Responses
Validation Error (400)
{
  "detail": "Variable name must start with a letter and contain only letters, numbers, and underscores"
}
Duplicate Name (409)
{
  "detail": "Global variable 'apiBaseUrl' already exists"
}
Not Found (404)
{
  "detail": "Variable not found: gvar_999"
}
Type Validation Error (400)
{
  "detail": "Invalid email format: not-an-email"
}
Usage in Tests
Variables are referenced in test cases using the ${variableName} syntax:

URL: ${apiBaseUrl}/users
Username: ${testUsername}
Password: ${testPassword}
During test execution:

The system looks up each variable by name
Local variables take priority over global variables
The value is substituted into the test step
Current Local Storage Format
Global Variables File
Location: config/global_variables.json

{
  "version": "1.0",
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T14:00:00Z",
  "variables": [
    {
      "id": "gvar_001",
      "name": "apiBaseUrl",
      "type": "URL",
      "value": "https://api.example.com",
      "scope": "global",
      "created_at": "2026-01-17T10:00:00Z",
      "updated_at": "2026-01-17T14:00:00Z"
    }
  ]
}
Local Variables (in test_details.json)
Location: recordings/{test_path}/test_details.json

{
  "name": "Login Test",
  "description": "Tests the login functionality",
  "tags": ["auth", "smoke"],
  "priority": "High",
  "variables": [
    {
      "id": "lvar_001",
      "name": "testUsername",
      "type": "Email",
      "value": "test@example.com",
      "scope": "local",
      "created_at": "2026-01-17T10:00:00Z",
      "updated_at": "2026-01-17T14:00:00Z"
    }
  ]
}
Summary
Scope	Storage	Availability	Override Priority
Global	Project-level	All test cases	Lower (can be overridden)
Local	Per test case	Single test case	Higher (overrides global)
Type	Example Values
String	"Hello World", "test123"
Number	42, 3.14, -100
Boolean	true, false, 1, 0
Date	2026-01-17, 01/17/2026
Email	user@example.com
Phone	+1-555-123-4567
URL	https://api.example.com
