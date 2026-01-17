Test Run Tree API Documentation                                                                                                                                                                                                                              
  
  Base URL: /api/v1/test-run-tree                                                                                                                                                                                                                                 
  Authentication: Bearer token required in all requests                                                                                                                                                                                                        
  
  ---
  1. Get Full Tree

  GET /api/v1/test-run-tree

  curl:
  curl -X GET "http://localhost:8000/api/v1/test-run-tree" \
    -H "Authorization: Bearer YOUR_TOKEN"

  Response: 200 OK
  {
    "structure": {
      "id": "root",
      "name": "ROOT",
      "type": "folder",
      "expanded": true,
      "children": [
        {
          "id": "uuid-1",
          "name": "Regression Suite",
          "type": "folder",
          "expanded": true,
          "children": [
            {
              "id": "uuid-2",
              "name": "Test Run 2026-01-17 #1",
              "type": "testrun",
              "test_cases": ["tc-uuid-1", "tc-uuid-2"]
            }
          ]
        },
        {
          "id": "uuid-3",
          "name": "Smoke Tests",
          "type": "folder",
          "expanded": false,
          "children": []
        }
      ]
    }
  }

  ---
  2. Create Folder

  POST /api/v1/test-run-tree/folders

  curl:
  curl -X POST "http://localhost:8000/api/v1/test-run-tree/folders" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Regression Suite",
      "parent_id": null
    }'

  Request Body:
  {
    "name": "string (required, 1-255 chars)",
    "parent_id": "uuid | null"
  }
  ┌───────────┬─────────────┬──────────┬─────────────────────────────────────────┐
  │   Field   │    Type     │ Required │               Description               │
  ├───────────┼─────────────┼──────────┼─────────────────────────────────────────┤
  │ name      │ string      │ Yes      │ Folder name (1-255 chars)               │
  ├───────────┼─────────────┼──────────┼─────────────────────────────────────────┤
  │ parent_id │ string/null │ No       │ Parent folder UUID, null for root level │
  └───────────┴─────────────┴──────────┴─────────────────────────────────────────┘
  Response: 201 Created
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Regression Suite",
    "type": "folder",
    "parent_id": null,
    "expanded": false,
    "created_at": "2026-01-17T21:06:40.784Z"
  }

  ---
  3. Create Test Run

  POST /api/v1/test-run-tree/testruns

  curl:
  curl -X POST "http://localhost:8000/api/v1/test-run-tree/testruns" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Run 2026-01-17 #1",
      "parent_id": "550e8400-e29b-41d4-a716-446655440000",
      "test_cases": ["tc-uuid-1", "tc-uuid-2"]
    }'

  Request Body:
  {
    "name": "string (required)",
    "parent_id": "uuid (required)",
    "test_cases": ["uuid"]
  }
  ┌────────────┬──────────┬──────────┬───────────────────────────────┐
  │   Field    │   Type   │ Required │          Description          │
  ├────────────┼──────────┼──────────┼───────────────────────────────┤
  │ name       │ string   │ Yes      │ Test run name (1-255 chars)   │
  ├────────────┼──────────┼──────────┼───────────────────────────────┤
  │ parent_id  │ string   │ Yes      │ Parent folder UUID (required) │
  ├────────────┼──────────┼──────────┼───────────────────────────────┤
  │ test_cases │ string[] │ No       │ List of test case UUIDs       │
  └────────────┴──────────┴──────────┴───────────────────────────────┘
  Response: 201 Created
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Test Run 2026-01-17 #1",
    "type": "testrun",
    "parent_id": "550e8400-e29b-41d4-a716-446655440000",
    "test_cases": ["tc-uuid-1", "tc-uuid-2"],
    "created_at": "2026-01-17T21:10:00.000Z"
  }

  ---
  4. Update Item (Rename/Move/Toggle Expanded)

  PATCH /api/v1/test-run-tree/items/{item_id}

  curl - Rename:
  curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Renamed Folder"
    }'

  curl - Move to another folder:
  curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "parent_id": "new-parent-uuid"
    }'

  curl - Toggle expanded:
  curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "expanded": true
    }'

  Request Body: (all fields optional)
  {
    "name": "string | null",
    "parent_id": "uuid | null",
    "expanded": "boolean | null"
  }
  ┌───────────┬─────────┬──────────┬───────────────────────────────┐
  │   Field   │  Type   │ Required │          Description          │
  ├───────────┼─────────┼──────────┼───────────────────────────────┤
  │ name      │ string  │ No       │ New name                      │
  ├───────────┼─────────┼──────────┼───────────────────────────────┤
  │ parent_id │ string  │ No       │ New parent UUID for moving    │
  ├───────────┼─────────┼──────────┼───────────────────────────────┤
  │ expanded  │ boolean │ No       │ Expanded state (folders only) │
  └───────────┴─────────┴──────────┴───────────────────────────────┘
  Response: 200 OK
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Renamed Folder",
    "type": "folder",
    "parent_id": "new-parent-uuid",
    "expanded": true,
    "updated_at": "2026-01-17T21:15:00.000Z"
  }

  ---
  5. Delete Item

  DELETE /api/v1/test-run-tree/items/{item_id}

  curl:
  curl -X DELETE "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000" \
    -H "Authorization: Bearer YOUR_TOKEN"

  Response: 200 OK
  {
    "success": true,
    "deleted_count": 3
  }
  ┌───────────────┬─────────────────────────────────────────────────────────┐
  │     Field     │                       Description                       │
  ├───────────────┼─────────────────────────────────────────────────────────┤
  │ success       │ Always true if successful                               │
  ├───────────────┼─────────────────────────────────────────────────────────┤
  │ deleted_count │ Number of items deleted (includes children for folders) │
  └───────────────┴─────────────────────────────────────────────────────────┘
  ---
  6. Copy Item

  POST /api/v1/test-run-tree/items/{item_id}/copy

  curl:
  curl -X POST "http://localhost:8000/api/v1/test-run-tree/items/550e8400-e29b-41d4-a716-446655440000/copy" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "target_parent_id": "target-folder-uuid"
    }'

  Request Body:
  {
    "target_parent_id": "uuid | null"
  }
  ┌──────────────────┬─────────────┬──────────┬───────────────────────────────────┐
  │      Field       │    Type     │ Required │            Description            │
  ├──────────────────┼─────────────┼──────────┼───────────────────────────────────┤
  │ target_parent_id │ string/null │ No       │ Target folder UUID, null for root │
  └──────────────────┴─────────────┴──────────┴───────────────────────────────────┘
  Response: 201 Created
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Copy of Regression Suite",
    "type": "folder",
    "parent_id": "target-folder-uuid"
  }

  ---
  7. Update Test Cases in Test Run

  PATCH /api/v1/test-run-tree/testruns/{testrun_id}/test-cases

  curl:
  curl -X PATCH "http://localhost:8000/api/v1/test-run-tree/testruns/660e8400-e29b-41d4-a716-446655440001/test-cases" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "test_cases": ["tc-uuid-1", "tc-uuid-2", "tc-uuid-3"]
    }'

  Request Body:
  {
    "test_cases": ["uuid-1", "uuid-2", "uuid-3"]
  }
  ┌────────────┬──────────┬──────────┬──────────────────────────────────┐
  │   Field    │   Type   │ Required │           Description            │
  ├────────────┼──────────┼──────────┼──────────────────────────────────┤
  │ test_cases │ string[] │ Yes      │ Complete list of test case UUIDs │
  └────────────┴──────────┴──────────┴──────────────────────────────────┘
  Response: 200 OK
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "test_cases": ["tc-uuid-1", "tc-uuid-2", "tc-uuid-3"],
    "updated_at": "2026-01-17T21:20:00.000Z"
  }

  ---
  Data Types

  TreeItemType:
  - folder - A folder that can contain other folders or test runs
  - testrun - A test run that contains test cases

  ---
  Error Responses

  404 Not Found:
  {
    "detail": "Item not found: {item_id}"
  }

  400 Bad Request:
  {
    "detail": "Parent must be a folder"
  }

  422 Validation Error:
  {
    "detail": [
      {
        "loc": ["body", "name"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }

  ---
  Summary Table
  ┌────────┬────────────────────────────────────────────────┬───────────────────────────────────┐
  │ Method │                    Endpoint                    │            Description            │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ GET    │ /api/v1/test-run-tree                          │ Get full tree structure           │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ POST   │ /api/v1/test-run-tree/folders                  │ Create folder                     │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ POST   │ /api/v1/test-run-tree/testruns                 │ Create test run                   │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ PATCH  │ /api/v1/test-run-tree/items/{id}               │ Update item (rename/move/expand)  │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ DELETE │ /api/v1/test-run-tree/items/{id}               │ Delete item (cascade for folders) │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ POST   │ /api/v1/test-run-tree/items/{id}/copy          │ Copy item (deep copy for folders) │
  ├────────┼────────────────────────────────────────────────┼───────────────────────────────────┤
  │ PATCH  │ /api/v1/test-run-tree/testruns/{id}/test-cases │ Update test cases                 │
  └────────┴────────────────────────────────────────────────┴───────────────────────────────────┘
