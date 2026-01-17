# Audit Trail API Specification

## Overview

This document specifies the API endpoints required for server-side audit trail synchronization. The audit trail tracks all changes made to test cases, including who made the change, when, and what was modified.

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

## Endpoints

### 1. Get Audit Trail

Retrieve the complete audit trail for a test case.

**Endpoint:**
```
GET /test-cases/{test_case_id}/audit-trail
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Response:**

**Success (200 OK):**
```json
{
  "audit_trail": [
    {
      "timestamp": "2026-01-17T10:30:00.123456",
      "user": "john.doe@example.com",
      "action": "created",
      "changes": []
    },
    {
      "timestamp": "2026-01-17T11:45:30.789012",
      "user": "john.doe@example.com",
      "action": "modified",
      "changes": [
        {
          "field": "description",
          "old": "Original description",
          "new": "Updated description"
        },
        {
          "field": "priority",
          "old": "Medium",
          "new": "High"
        }
      ]
    }
  ]
}
```

**Empty Trail (200 OK):**
```json
{
  "audit_trail": []
}
```

**Test Case Not Found (404):**
```json
{
  "detail": "Test case not found"
}
```

---

### 2. Sync Audit Trail (Full Replace)

Replace the entire audit trail for a test case. This is used for full synchronization.

**Endpoint:**
```
POST /test-cases/{test_case_id}/audit-trail
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Request Body:**
```json
{
  "audit_trail": [
    {
      "timestamp": "2026-01-17T10:30:00.123456",
      "user": "john.doe@example.com",
      "action": "created",
      "changes": []
    },
    {
      "timestamp": "2026-01-17T11:45:30.789012",
      "user": "jane.smith@example.com",
      "action": "modified",
      "changes": [
        {
          "field": "name",
          "old": "Login Test",
          "new": "Login Test - Updated"
        }
      ]
    }
  ]
}
```

**Response:**

**Success (200 OK):**
```json
{
  "message": "Audit trail synced successfully",
  "count": 2
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
      "loc": ["body", "audit_trail", 0, "timestamp"],
      "msg": "invalid datetime format",
      "type": "value_error"
    }
  ]
}
```

---

### 3. Append Audit Entry (Optional - Recommended)

Append a single audit entry to the existing trail. This is more efficient than full sync when adding a single change.

**Endpoint:**
```
POST /test-cases/{test_case_id}/audit-trail/append
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| test_case_id | UUID | Yes | The unique identifier of the test case |

**Request Body:**
```json
{
  "timestamp": "2026-01-17T14:20:15.456789",
  "user": "john.doe@example.com",
  "action": "modified",
  "changes": [
    {
      "field": "tags",
      "old": ["smoke", "regression"],
      "new": ["smoke", "regression", "critical"]
    }
  ]
}
```

**Response:**

**Success (200 OK):**
```json
{
  "message": "Audit entry appended successfully",
  "total_entries": 5
}
```

**Test Case Not Found (404):**
```json
{
  "detail": "Test case not found"
}
```

---

## Data Models

### AuditEntry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | string (ISO 8601) | Yes | When the change occurred. Format: `YYYY-MM-DDTHH:MM:SS.ffffff` |
| user | string | Yes | Username or email of who made the change |
| action | string (enum) | Yes | Type of action: `created`, `modified`, `deleted` |
| changes | array[Change] | Yes | List of field changes (empty array for `created`/`deleted`) |

### Change

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | string | Yes | Name of the field that changed |
| old | any | Yes | Previous value (can be string, number, array, object, or null) |
| new | any | Yes | New value (can be string, number, array, object, or null) |

### Action Types

| Action | Description |
|--------|-------------|
| `created` | Test case was created. `changes` array is empty. |
| `modified` | Test case fields were updated. `changes` array contains the modifications. |
| `deleted` | Test case was deleted (soft delete). `changes` array is empty. |

---

## Tracked Fields

The following test case fields are tracked for changes:

| Field | Type | Example Old/New Values |
|-------|------|------------------------|
| name | string | `"Login Test"` → `"Login Test v2"` |
| description | string | `"Tests login flow"` → `"Tests login and logout flow"` |
| tags | array[string] | `["smoke"]` → `["smoke", "regression"]` |
| priority | string | `"Medium"` → `"High"` |

---

## Database Schema Suggestion

### Option A: JSON Column (Recommended for simplicity)

Add a JSON/JSONB column to the `test_cases` table:

```sql
ALTER TABLE test_cases
ADD COLUMN audit_trail JSONB DEFAULT '[]'::jsonb;
```

### Option B: Separate Table (Recommended for querying/reporting)

```sql
CREATE TABLE test_case_audit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'modified', 'deleted')),
    changes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_test_case ON test_case_audit_entries(test_case_id);
CREATE INDEX idx_audit_timestamp ON test_case_audit_entries(timestamp DESC);
```

---

## Example Audit Trail

Here's a complete example of an audit trail for a test case:

```json
{
  "audit_trail": [
    {
      "timestamp": "2026-01-15T09:00:00.000000",
      "user": "alice@example.com",
      "action": "created",
      "changes": []
    },
    {
      "timestamp": "2026-01-15T10:30:00.000000",
      "user": "alice@example.com",
      "action": "modified",
      "changes": [
        {
          "field": "description",
          "old": "",
          "new": "This test verifies the login functionality"
        }
      ]
    },
    {
      "timestamp": "2026-01-16T14:15:00.000000",
      "user": "bob@example.com",
      "action": "modified",
      "changes": [
        {
          "field": "priority",
          "old": "Medium",
          "new": "High"
        },
        {
          "field": "tags",
          "old": [],
          "new": ["critical", "smoke"]
        }
      ]
    },
    {
      "timestamp": "2026-01-17T11:00:00.000000",
      "user": "alice@example.com",
      "action": "modified",
      "changes": [
        {
          "field": "name",
          "old": "Login Test",
          "new": "Login Test - Production Ready"
        }
      ]
    }
  ]
}
```

---

## Client Implementation Notes

The client (Tester Browser) will:

1. **On Load**: Call `GET /test-cases/{id}/audit-trail` to fetch the audit trail
2. **On Save**:
   - Record the change locally first
   - Call `POST /test-cases/{id}/audit-trail` to sync the full trail
   - OR call `POST /test-cases/{id}/audit-trail/append` to add just the new entry (more efficient)

3. **Fallback**: If server returns empty or fails, client uses locally cached audit trail

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 200 | - | Success |
| 400 | BAD_REQUEST | Invalid request format |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | User doesn't have access to this test case |
| 404 | NOT_FOUND | Test case not found |
| 422 | VALIDATION_ERROR | Request body validation failed |
| 500 | INTERNAL_ERROR | Server error |

---

## Questions for Backend Team

1. **Storage preference**: JSON column on test_cases table or separate audit_entries table?
2. **Retention policy**: Should old audit entries be purged after a certain period?
3. **Size limits**: Maximum number of audit entries per test case?
4. **Permissions**: Should audit trail be read-only for non-owners?
