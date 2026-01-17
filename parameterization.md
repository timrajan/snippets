# Parameterization API Specification

## Overview

This document specifies the API endpoints required for server-side parameterization data synchronization. Parameterization enables data-driven testing by mapping UI elements to Excel/CSV columns, allowing tests to run with multiple data sets.

---

## Base URL

```
{base_url}/api/v1
```

---

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

---

## Data Components

Parameterization consists of two main components:

1. **mapping.json** - Configuration file containing:
   - Parameterization mappings (element → column)
   - File upload mappings (file input → asset)
   - Export mappings (element → variable)

2. **Data File** - Excel (.xlsx, .xls) or CSV file containing test data rows

---

## Endpoints

### 1. Upload Parameterization Data

Upload or update the parameterization configuration and data file for a test case.

**Endpoint:**
```
POST /test-cases/{test_case_id}/parameterization
```

**Content-Type:** `multipart/form-data`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mapping | JSON string | Yes | The mapping.json content as JSON string |
| data_file | File | No | Excel (.xlsx, .xls) or CSV file with test data |

**Request Example:**
```
POST /test-cases/376754bc-c09e-4107-8521-7637572fc462/parameterization
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="mapping"

{
  "test_name": "LoginTest",
  "excel_file": "test_data.xlsx",
  "created_at": "2026-01-17T10:30:00",
  "parameterizations": [
    {
      "id": "param_001",
      "screenshot_index": 2,
      "rectangle_coords": {"x": 100, "y": 200, "width": 150, "height": 30},
      "element_selector": "#username",
      "original_recorded_value": "testuser",
      "excel_column": "Username",
      "parameterized": true,
      "created_at": "2026-01-17T10:30:00"
    }
  ],
  "file_uploads": [],
  "exports": []
}
------WebKitFormBoundary
Content-Disposition: form-data; name="data_file"; filename="test_data.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary file content>
------WebKitFormBoundary--
```

**Response:**

**Success (200 OK):**
```json
{
  "message": "Parameterization data uploaded successfully",
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "mapping_updated": true,
  "data_file_updated": true,
  "data_file_name": "test_data.xlsx",
  "data_file_size": 15234,
  "parameterization_count": 3,
  "file_upload_count": 1,
  "export_count": 2
}
```

**Test Case Not Found (404):**
```json
{
  "detail": "Test case not found"
}
```

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "mapping"],
      "msg": "Invalid JSON format",
      "type": "value_error"
    }
  ]
}
```

---

### 2. Get Parameterization Data

Retrieve the parameterization configuration and data file for a test case.

**Endpoint:**
```
GET /test-cases/{test_case_id}/parameterization
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| include_data_file | boolean | No | false | Whether to include the data file content (base64 encoded) |

**Response:**

**Success (200 OK) - Without data file:**
```json
{
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "has_parameterization": true,
  "mapping": {
    "test_name": "LoginTest",
    "excel_file": "test_data.xlsx",
    "created_at": "2026-01-17T10:30:00",
    "parameterizations": [
      {
        "id": "param_001",
        "screenshot_index": 2,
        "rectangle_coords": {"x": 100, "y": 200, "width": 150, "height": 30},
        "element_selector": "#username",
        "original_recorded_value": "testuser",
        "excel_column": "Username",
        "parameterized": true,
        "created_at": "2026-01-17T10:30:00"
      }
    ],
    "file_uploads": [
      {
        "id": "file_001",
        "screenshot_index": 3,
        "rectangle_coords": {"x": 200, "y": 300, "width": 100, "height": 25},
        "element_selector": "input[type='file']",
        "asset_filename": "document.pdf",
        "created_at": "2026-01-17T10:35:00"
      }
    ],
    "exports": [
      {
        "id": "export_001",
        "screenshot_index": 5,
        "rectangle_coords": {"x": 150, "y": 400, "width": 200, "height": 30},
        "element_selector": "#order-id",
        "variable_name": "generated_order_id",
        "created_at": "2026-01-17T10:40:00"
      }
    ]
  },
  "data_file_info": {
    "filename": "test_data.xlsx",
    "size": 15234,
    "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "uploaded_at": "2026-01-17T10:30:00"
  }
}
```

**Success (200 OK) - With data file (include_data_file=true):**
```json
{
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "has_parameterization": true,
  "mapping": { ... },
  "data_file_info": {
    "filename": "test_data.xlsx",
    "size": 15234,
    "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "uploaded_at": "2026-01-17T10:30:00"
  },
  "data_file_content": "UEsDBBQAAAAIAHdXe1k..."
}
```
Note: `data_file_content` is base64 encoded binary content.

**No Parameterization (200 OK):**
```json
{
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "has_parameterization": false,
  "mapping": null,
  "data_file_info": null
}
```

**Test Case Not Found (404):**
```json
{
  "detail": "Test case not found"
}
```

---

### 3. Download Data File

Download the parameterization data file directly (for large files).

**Endpoint:**
```
GET /test-cases/{test_case_id}/parameterization/data-file
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Response:**

**Success (200 OK):**
- Returns the file as binary stream
- Headers:
  - `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (or appropriate MIME type)
  - `Content-Disposition`: `attachment; filename="test_data.xlsx"`
  - `Content-Length`: File size in bytes

**No Data File (404):**
```json
{
  "detail": "No data file found for this test case"
}
```

---

### 4. Delete Parameterization Data

Remove all parameterization data for a test case.

**Endpoint:**
```
DELETE /test-cases/{test_case_id}/parameterization
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Response:**

**Success (200 OK):**
```json
{
  "message": "Parameterization data deleted successfully",
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462"
}
```

**No Parameterization Found (200 OK):**
```json
{
  "message": "No parameterization data found",
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462"
}
```

---

### 5. Update Mapping Only

Update just the mapping configuration without re-uploading the data file.

**Endpoint:**
```
PUT /test-cases/{test_case_id}/parameterization/mapping
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Request Body:**
```json
{
  "test_name": "LoginTest",
  "excel_file": "test_data.xlsx",
  "created_at": "2026-01-17T10:30:00",
  "parameterizations": [...],
  "file_uploads": [...],
  "exports": [...]
}
```

**Response:**

**Success (200 OK):**
```json
{
  "message": "Mapping updated successfully",
  "test_case_id": "376754bc-c09e-4107-8521-7637572fc462",
  "parameterization_count": 3,
  "file_upload_count": 1,
  "export_count": 2
}
```

---

## Data Models

### Parameterization Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (e.g., "param_001") |
| screenshot_index | integer | Yes | Index of the screenshot where element appears |
| rectangle_coords | RectangleCoords | Yes | Bounding box of the element |
| element_selector | string | No | CSS selector for the element |
| original_recorded_value | string | No | The value recorded during test recording |
| excel_column | string | Yes | Column name in the data file to use |
| parameterized | boolean | Yes | Whether parameterization is active |
| created_at | string (ISO 8601) | Yes | When the mapping was created |

### File Upload Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (e.g., "file_001") |
| screenshot_index | integer | Yes | Index of the screenshot where file input appears |
| rectangle_coords | RectangleCoords | Yes | Bounding box of the element |
| element_selector | string | No | CSS selector for the file input |
| asset_filename | string | Yes | Name of the asset file to upload |
| created_at | string (ISO 8601) | Yes | When the mapping was created |

### Export Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (e.g., "export_001") |
| screenshot_index | integer | Yes | Index of the screenshot where element appears |
| rectangle_coords | RectangleCoords | Yes | Bounding box of the element |
| element_selector | string | Yes | CSS selector for the element |
| variable_name | string | Yes | Name of the global variable to create |
| created_at | string (ISO 8601) | Yes | When the mapping was created |

### RectangleCoords

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| x | integer | Yes | X coordinate (left edge) |
| y | integer | Yes | Y coordinate (top edge) |
| width | integer | Yes | Width in pixels |
| height | integer | Yes | Height in pixels |

### Mapping (Complete Structure)

```json
{
  "test_name": "string",
  "excel_file": "string",
  "created_at": "string (ISO 8601)",
  "parameterizations": [Parameterization],
  "file_uploads": [FileUpload],
  "exports": [Export]
}
```

---

## Database Schema Suggestion

### Option A: JSON Storage (Simpler)

Add columns to the `test_cases` table:

```sql
ALTER TABLE test_cases
ADD COLUMN parameterization_mapping JSONB DEFAULT NULL,
ADD COLUMN parameterization_data_file_path VARCHAR(500) DEFAULT NULL,
ADD COLUMN parameterization_data_file_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN parameterization_data_file_size INTEGER DEFAULT NULL,
ADD COLUMN parameterization_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```

Store the actual data file in object storage (S3, GCS, or local filesystem).

### Option B: Separate Table (More Structured)

```sql
CREATE TABLE test_case_parameterizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    mapping JSONB NOT NULL,
    data_file_path VARCHAR(500),
    data_file_name VARCHAR(255),
    data_file_content_type VARCHAR(100),
    data_file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(test_case_id)
);

CREATE INDEX idx_param_test_case ON test_case_parameterizations(test_case_id);
```

---

## Supported File Types

| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | Excel 2007+ |
| .xls | application/vnd.ms-excel | Excel 97-2003 |
| .csv | text/csv | Comma-separated values |

**File Size Limit:** 10 MB (configurable)

---

## Client Sync Behavior

### On Test Case Load
1. Client calls `GET /test-cases/{id}/parameterization?include_data_file=true`
2. If `has_parameterization` is true:
   - Save mapping to local `data/mapping.json`
   - Decode and save data file to local `data/{filename}`
3. If false, check for local data (offline support)

### On Parameterization Change
1. User imports CSV/Excel file or modifies mappings
2. Client calls `POST /test-cases/{id}/parameterization` with:
   - Updated mapping JSON
   - Data file (if changed)
3. Server stores and returns confirmation

### On Mapping-Only Change
1. User adds/removes/modifies a parameterization mapping
2. Client calls `PUT /test-cases/{id}/parameterization/mapping`
3. Server updates mapping, keeps existing data file

---

## Example Workflow

### 1. User Imports CSV File

```
1. User clicks "Import CSV" in the UI
2. User selects "test_data.csv" containing:
   Username,Password,Expected
   john,secret123,Welcome John
   jane,pass456,Welcome Jane

3. Client uploads:
   POST /test-cases/{id}/parameterization
   - mapping: {"test_name": "LoginTest", "excel_file": "test_data.csv", ...}
   - data_file: test_data.csv

4. Server stores and returns success
```

### 2. User Maps Element to Column

```
1. User right-clicks on username field
2. Selects "Parameterize" → "Username" column
3. Client updates mapping locally
4. Client syncs:
   PUT /test-cases/{id}/parameterization/mapping
   - Updated mapping with new parameterization entry

5. Server updates and returns success
```

### 3. User Logs In on Different Machine

```
1. User logs in
2. Client loads test case
3. Client calls GET /test-cases/{id}/parameterization?include_data_file=true
4. Server returns mapping + data file
5. Client saves locally:
   - data/mapping.json
   - data/test_data.csv
6. Parameterization is restored and functional
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 200 | - | Success |
| 400 | BAD_REQUEST | Invalid request format |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | User doesn't have access to this test case |
| 404 | NOT_FOUND | Test case not found |
| 413 | PAYLOAD_TOO_LARGE | Data file exceeds size limit |
| 415 | UNSUPPORTED_MEDIA_TYPE | Unsupported file type |
| 422 | VALIDATION_ERROR | Request body validation failed |
| 500 | INTERNAL_ERROR | Server error |

---

## Questions for Backend Team

1. **File Storage**: Where should data files be stored? (S3, GCS, local filesystem, database BLOB?)
2. **Size Limits**: What's the maximum allowed file size?
3. **Versioning**: Should we keep history of parameterization changes?
4. **Sharing**: Can parameterization data be shared across test cases?
5. **Bulk Operations**: Need endpoint to export/import parameterization for multiple test cases?
