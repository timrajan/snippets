Here are the Asset API Endpoints:   
                                                                                                                                                              Base URL: /api/v1/assets                                                                                                                                    ┌────────┬──────────────────────────────────┬───────────────────────────────────┐                                                                         
  │ Method │             Endpoint             │            Description            │                                                                           ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ POST   │ /test-case/{test_case_id}/upload │ Upload a new asset                │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ GET    │ /{asset_id}                      │ Get asset metadata by ID          │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ GET    │ /{asset_id}/download             │ Download asset file               │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ GET    │ /test-case/{test_case_id}        │ List all assets for a test case   │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ PUT    │ /{asset_id}                      │ Update asset metadata             │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ DELETE │ /{asset_id}                      │ Delete an asset                   │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ DELETE │ /test-case/{test_case_id}        │ Delete all assets for a test case │
  ├────────┼──────────────────────────────────┼───────────────────────────────────┤
  │ POST   │ /{asset_id}/replace              │ Replace asset file                │
  └────────┴──────────────────────────────────┴───────────────────────────────────┘
  ---
  Endpoint Details

  1. Upload Asset

  POST /api/v1/assets/test-case/{test_case_id}/upload
  Content-Type: multipart/form-data

  Form Data:
  - file: (required) File to upload
  - asset_name: (optional) Custom name, defaults to filename
  - asset_type: (optional) excel, csv, json, text, other
  - description: (optional) Asset description

  Response: 201 Created
  {
    "id": "uuid",
    "test_case_id": "uuid",
    "asset_name": "data.xlsx",
    "asset_type": "excel",
    "file_path": "storage/assets/{test_case_id}/{uuid}.xlsx",
    "file_size_bytes": 12345,
    "mime_type": "application/vnd.ms-excel",
    "description": "Test data",
    "uploaded_by": "uuid",
    "uploaded_at": "2026-01-17T10:00:00Z"
  }

  2. Get Asset

  GET /api/v1/assets/{asset_id}

  Response: 200 OK
  { ...asset object... }

  3. Download Asset

  GET /api/v1/assets/{asset_id}/download

  Response: File download with original filename

  4. List Assets

  GET /api/v1/assets/test-case/{test_case_id}?asset_type=excel&skip=0&limit=100

  Response: 200 OK
  {
    "total": 5,
    "total_size_bytes": 123456,
    "items": [ ...array of assets... ]
  }

  5. Update Asset

  PUT /api/v1/assets/{asset_id}
  Content-Type: application/json

  {
    "asset_name": "new_name.xlsx",
    "asset_type": "excel",
    "description": "Updated description"
  }

  Response: 200 OK
  { ...updated asset object... }

  6. Delete Asset

  DELETE /api/v1/assets/{asset_id}?delete_file=true

  Response: 204 No Content

  7. Delete All Assets for Test Case

  DELETE /api/v1/assets/test-case/{test_case_id}?delete_files=true

  Response: 200 OK
  { "deleted_count": 3 }

  8. Replace Asset File

  POST /api/v1/assets/{asset_id}/replace
  Content-Type: multipart/form-data

  Form Data:
  - file: (required) New file

  Response: 200 OK
  { ...updated asset object... }
