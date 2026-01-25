# Bookmark API Documentation

**Version:** 1.0.0
**Base URL:** `/api/v1`
**Last Updated:** 2026-01-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Response Format](#common-response-format)
4. [Personal Bookmarks](#personal-bookmarks)
5. [Team Bookmarks](#team-bookmarks)
6. [Bookmark Folders](#bookmark-folders)
7. [Tags System](#tags-system)
8. [Search](#search)
9. [Import/Export](#importexport)
10. [Analytics](#analytics)
11. [Sync API](#sync-api)
12. [Data Models](#data-models)
13. [Error Codes](#error-codes)

---

## Overview

The Bookmark API provides functionality for:
- **Personal Bookmarks**: User-owned bookmarks for private use
- **Team Bookmarks**: Shared bookmarks accessible to team members
- **Folders**: Hierarchical organization (nested folders supported)
- **Tags**: Categorization with up to 20 tags per bookmark
- **Sync**: Bidirectional synchronization for desktop clients
- **Import/Export**: Support for Chrome, Firefox, JSON, CSV formats
- **Analytics**: Usage statistics and insights

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Obtain tokens via `/api/v1/auth/login`.

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### List Response
```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "page_size": 50
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

---

## Personal Bookmarks

### List Personal Bookmarks

```
GET /bookmarks
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `folder_id` | UUID | null | Filter by folder |
| `include_deleted` | boolean | false | Include trashed bookmarks |
| `page` | integer | 1 | Page number |
| `page_size` | integer | 50 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "url": "https://example.com",
      "title": "Example Site",
      "description": "A useful website",
      "favicon_url": "https://example.com/favicon.ico",
      "tags": ["work", "reference"],
      "folder_id": "550e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "team_id": null,
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "full_name": "John Doe"
      },
      "sort_order": 0,
      "is_deleted": false,
      "is_shared": false,
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z",
      "deleted_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 50
}
```

---

### Create Personal Bookmark

```
POST /bookmarks
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Site",
  "description": "Optional description",
  "favicon_url": "https://example.com/favicon.ico",
  "tags": ["work", "reference"],
  "folder_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Field Constraints:**
| Field | Required | Max Length | Notes |
|-------|----------|------------|-------|
| `url` | Yes | 2048 | Must start with http:// or https:// |
| `title` | Yes | 500 | |
| `description` | No | 5000 | |
| `favicon_url` | No | 2048 | |
| `tags` | No | 20 items | Each tag max 50 chars, auto-lowercased |
| `folder_id` | No | - | Must be user's folder |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Bookmark created",
  "data": { ... }
}
```

**Errors:**
- `409 Conflict`: URL already bookmarked

---

### Get Bookmark by ID

```
GET /bookmarks/{bookmark_id}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Bookmark

```
PUT /bookmarks/{bookmark_id}
```

**Request Body:** (all fields optional)
```json
{
  "url": "https://new-url.com",
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new", "tags"],
  "folder_id": "new-folder-id",
  "sort_order": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bookmark updated",
  "data": { ... }
}
```

---

### Delete Bookmark

```
DELETE /bookmarks/{bookmark_id}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `permanent` | boolean | false | If true, permanently delete |

**Response:**
```json
{
  "success": true,
  "message": "Bookmark moved to trash"
}
```

---

### Restore Deleted Bookmark

```
POST /bookmarks/{bookmark_id}/restore
```

**Response:**
```json
{
  "success": true,
  "message": "Bookmark restored",
  "data": { ... }
}
```

---

### List Deleted Bookmarks (Trash)

```
GET /bookmarks/deleted
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `page_size` | integer | 50 | Items per page |

---

## Team Bookmarks

Team bookmarks are shared among all team members.

### List Team Bookmarks

```
GET /teams/{team_id}/bookmarks
```

**Query Parameters:** Same as personal bookmarks

**Authorization:** User must be an active team member

---

### Create Team Bookmark

```
POST /teams/{team_id}/bookmarks
```

**Request Body:** Same as personal bookmark

**Authorization:** User must be a team member

---

### Get Team Bookmark

```
GET /teams/{team_id}/bookmarks/{bookmark_id}
```

---

### Update Team Bookmark

```
PUT /teams/{team_id}/bookmarks/{bookmark_id}
```

**Authorization:** Any team member can update

---

### Delete Team Bookmark

```
DELETE /teams/{team_id}/bookmarks/{bookmark_id}
```

**Authorization:** Only creator OR team admin can delete

---

### Search Team Bookmarks

```
GET /teams/{team_id}/bookmarks/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (1-200 chars) |
| `tags` | string[] | No | Filter by tags |
| `page` | integer | No | Page number |
| `page_size` | integer | No | Items per page |

---

## Bookmark Folders

Folders support unlimited nesting depth (recommended max: 10 levels).

### Personal Folders

#### List Folders

```
GET /bookmarks/folders
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `parent_folder_id` | UUID | Filter by parent (null = root level) |

---

#### Get Folder Hierarchy (Tree)

```
GET /bookmarks/folders/hierarchy
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder-1",
      "name": "Work",
      "description": "Work-related bookmarks",
      "parent_folder_id": null,
      "level": 0,
      "bookmark_count": 15,
      "children": [
        {
          "id": "folder-2",
          "name": "Projects",
          "parent_folder_id": "folder-1",
          "level": 1,
          "bookmark_count": 8,
          "children": []
        }
      ]
    }
  ]
}
```

---

#### Create Folder

```
POST /bookmarks/folders
```

**Request Body:**
```json
{
  "name": "New Folder",
  "description": "Optional description",
  "parent_folder_id": "parent-uuid-or-null"
}
```

**Field Constraints:**
| Field | Required | Max Length |
|-------|----------|------------|
| `name` | Yes | 255 |
| `description` | No | 2000 |

**Errors:**
- `400`: Duplicate name in same parent folder
- `404`: Parent folder not found

---

#### Get Folder

```
GET /bookmarks/folders/{folder_id}
```

---

#### Update Folder

```
PUT /bookmarks/folders/{folder_id}
```

**Request Body:**
```json
{
  "name": "Renamed Folder",
  "description": "Updated description"
}
```

---

#### Move Folder

```
PATCH /bookmarks/folders/{folder_id}/move
```

**Request Body:**
```json
{
  "new_parent_id": "target-parent-uuid-or-null"
}
```

**Errors:**
- `400`: Cannot move folder into itself or its descendants (circular reference)
- `400`: Duplicate name in target location

---

#### Delete Folder

```
DELETE /bookmarks/folders/{folder_id}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `delete_bookmarks` | boolean | false | If true, delete all bookmarks. If false, move to parent. |

---

### Team Folders

Team folder endpoints mirror personal folders with team authorization:

```
POST   /teams/{team_id}/bookmarks/folders
GET    /teams/{team_id}/bookmarks/folders
GET    /teams/{team_id}/bookmarks/folders/hierarchy
GET    /teams/{team_id}/bookmarks/folders/{folder_id}
PUT    /teams/{team_id}/bookmarks/folders/{folder_id}
PATCH  /teams/{team_id}/bookmarks/folders/{folder_id}/move
DELETE /teams/{team_id}/bookmarks/folders/{folder_id}
```

**Authorization:**
- View: Any team member
- Create/Update/Delete: Team admin only

---

## Tags System

Tags provide flexible categorization. Each bookmark can have up to 20 tags.

### Get All Tags

```
GET /bookmarks/tags
```

Returns unique tags from personal bookmarks only.

**Response:**
```json
{
  "success": true,
  "data": ["documentation", "python", "tutorial", "work"],
  "total": 4
}
```

---

### Get All Tags (Personal + Team)

```
GET /bookmarks/all-tags
```

Returns combined unique tags from all accessible bookmarks.

---

### Get Team Tags

```
GET /teams/{team_id}/bookmarks/tags
```

---

### Search by Tags

```
GET /bookmarks/by-tags
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tags` | string | Required | Comma-separated tags |
| `match_all` | boolean | true | true=AND logic, false=OR logic |
| `page` | integer | 1 | Page number |
| `page_size` | integer | 50 | Items per page |

**Examples:**
```
# Bookmarks with BOTH "python" AND "tutorial" tags
GET /bookmarks/by-tags?tags=python,tutorial&match_all=true

# Bookmarks with EITHER "python" OR "javascript" tag
GET /bookmarks/by-tags?tags=python,javascript&match_all=false
```

---

### Add Tag to Bookmark

```
POST /bookmarks/{bookmark_id}/tags/{tag}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag 'python' added",
  "data": { ... }
}
```

**Errors:**
- `400`: Tag too long (max 50 chars)
- `400`: Max tags reached (20)
- `404`: Bookmark not found

---

### Remove Tag from Bookmark

```
DELETE /bookmarks/{bookmark_id}/tags/{tag}
```

---

### Team Bookmark Tags

```
POST   /teams/{team_id}/bookmarks/{bookmark_id}/tags/{tag}
DELETE /teams/{team_id}/bookmarks/{bookmark_id}/tags/{tag}
```

---

## Search

### Search Personal Bookmarks

```
GET /bookmarks/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search in title, URL, description |
| `tags` | string[] | No | Filter by tags (OR logic) |
| `include_deleted` | boolean | No | Include trashed bookmarks |
| `page` | integer | No | Page number |
| `page_size` | integer | No | Items per page |

**Example:**
```
GET /bookmarks/search?q=python&tags=tutorial&tags=docs
```

---

## Import/Export

### Import Bookmarks

```
POST /bookmarks/import
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | HTML, JSON, or CSV file (max 10MB) |
| `folder_id` | UUID | No | Import into specific folder |
| `skip_duplicates` | boolean | No | Skip existing URLs (default: true) |

**Supported Formats:**

1. **HTML** (Chrome/Firefox/Edge export)
   - Netscape Bookmark format
   - Preserves folder structure (in tags)

2. **JSON**
   ```json
   [
     {
       "url": "https://example.com",
       "title": "Example",
       "description": "Optional",
       "tags": ["tag1", "tag2"]
     }
   ]
   ```

3. **CSV**
   ```csv
   URL,Title,Description,Tags
   https://example.com,Example,Description,"tag1,tag2"
   ```

**Response:**
```json
{
  "success": true,
  "message": "Imported 45 bookmarks",
  "data": {
    "total": 50,
    "imported": 45,
    "skipped": 5,
    "errors": ["https://invalid-url: Invalid URL format"]
  }
}
```

---

### Preview Import

```
POST /bookmarks/import/preview
```

Preview what will be imported without actually importing.

**Response:**
```json
{
  "success": true,
  "data": {
    "format": "html",
    "total_found": 150,
    "preview": [ ... first 20 bookmarks ... ],
    "preview_count": 20
  }
}
```

---

### Export Bookmarks

```
GET /bookmarks/export
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `json`, `html`, or `csv` |
| `scope` | string | No | `all`, `personal`, or `team` (default: all) |
| `team_id` | UUID | No | Required if scope=team |
| `include_folders` | boolean | No | Include folder data (JSON only) |

**Response:** File download with appropriate Content-Type

**Examples:**
```
# Export all bookmarks as JSON
GET /bookmarks/export?format=json&scope=all

# Export personal bookmarks as HTML (browser-importable)
GET /bookmarks/export?format=html&scope=personal

# Export team bookmarks as CSV
GET /bookmarks/export?format=csv&scope=team&team_id=xxx
```

---

### Preview Export

```
GET /bookmarks/export/preview
```

Get counts before exporting.

**Response:**
```json
{
  "success": true,
  "data": {
    "scope": "all",
    "counts": {
      "personal_bookmarks": 50,
      "team_bookmarks": 25,
      "personal_folders": 5,
      "team_folders": 3
    },
    "total_bookmarks": 75,
    "total_folders": 8
  }
}
```

---

## Analytics

### Get Statistics

```
GET /bookmarks/analytics/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_bookmarks": 150,
    "personal_bookmarks": 100,
    "team_bookmarks": 50,
    "deleted_bookmarks": 5,
    "personal_folders": 10,
    "team_folders": 3,
    "total_folders": 13,
    "added_today": 3,
    "added_this_week": 15,
    "added_this_month": 42,
    "average_per_day": 1.5
  }
}
```

---

### Get Popular Tags

```
GET /bookmarks/analytics/popular-tags
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Max tags to return (1-50) |

**Response:**
```json
{
  "success": true,
  "data": [
    {"tag": "python", "count": 25},
    {"tag": "documentation", "count": 18},
    {"tag": "tutorial", "count": 12}
  ],
  "total": 3
}
```

---

### Get Recent Bookmarks

```
GET /bookmarks/analytics/recent
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Max bookmarks (1-50) |

---

### Get Top Domains

```
GET /bookmarks/analytics/domains
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"domain": "github.com", "count": 35},
    {"domain": "stackoverflow.com", "count": 28},
    {"domain": "docs.python.org", "count": 15}
  ]
}
```

---

### Get Activity Timeline

```
GET /bookmarks/analytics/activity
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Days to include (7-365) |

**Response:**
```json
{
  "success": true,
  "data": [
    {"date": "2026-01-20", "count": 5},
    {"date": "2026-01-21", "count": 3},
    {"date": "2026-01-22", "count": 8}
  ],
  "days": 30,
  "total_entries": 25
}
```

---

### Get Folder Statistics

```
GET /bookmarks/analytics/folders
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"id": null, "name": "Unfiled", "is_shared": false, "bookmark_count": 25},
    {"id": "uuid-1", "name": "Work", "is_shared": false, "bookmark_count": 42},
    {"id": "uuid-2", "name": "Team Resources", "is_shared": true, "bookmark_count": 18}
  ],
  "total_folders": 2
}
```

---

### Get Complete Summary

```
GET /bookmarks/analytics/summary
```

Returns all analytics in one call (efficient for dashboards).

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": { ... },
    "popular_tags": [ ... top 5 ... ],
    "top_domains": [ ... top 5 ... ],
    "recent_bookmarks": [ ... last 5 ... ]
  }
}
```

---

## Sync API

For desktop client synchronization. Uses delta sync with last-write-wins conflict resolution.

### Bidirectional Sync

```
POST /sync/
```

**Request Body:**
```json
{
  "last_sync": "2026-01-25T10:00:00Z",
  "client_changes": {
    "bookmarks": {
      "created": [
        {
          "id": "client-generated-uuid",
          "url": "https://example.com",
          "title": "New Bookmark",
          "user_id": "user-uuid",
          "created_by": "user-uuid",
          "tags": [],
          "sort_order": 0,
          "created_at": "2026-01-25T10:15:00Z",
          "updated_at": "2026-01-25T10:15:00Z"
        }
      ],
      "updated": [
        {
          "id": "existing-bookmark-uuid",
          "title": "Updated Title",
          "updated_at": "2026-01-25T10:20:00Z"
        }
      ],
      "deleted": ["bookmark-id-to-delete"]
    },
    "folders": {
      "created": [],
      "updated": [],
      "deleted": []
    }
  }
}
```

**Response:**
```json
{
  "server_changes": {
    "bookmarks": {
      "created": [ ... new server bookmarks ... ],
      "updated": [ ... updated server bookmarks ... ],
      "deleted": [
        {"id": "deleted-uuid", "deleted_at": "2026-01-25T10:30:00Z"}
      ]
    },
    "folders": {
      "created": [],
      "updated": [],
      "deleted": []
    },
    "sync_timestamp": "2026-01-25T11:00:00Z"
  },
  "conflicts": {
    "bookmarks": [
      {
        "id": "conflicting-uuid",
        "type": "concurrent_update",
        "client_version": { ... },
        "server_version": { ... }
      }
    ],
    "folders": []
  },
  "sync_timestamp": "2026-01-25T11:00:00Z"
}
```

**Conflict Types:**
| Type | Description | Resolution |
|------|-------------|------------|
| `duplicate_create` | Item with same ID exists | Server version kept |
| `concurrent_update` | Server has newer version | Server wins (last-write-wins) |
| `update_missing` | Item doesn't exist on server | Returned as conflict |
| `update_deleted` | Item was deleted on server | Returned as conflict |

**Sync Flow:**
1. Client sends `last_sync` timestamp + local changes
2. Server applies client changes (conflicts returned, not applied)
3. Server returns all changes since `last_sync`
4. Client applies server changes
5. Client stores new `sync_timestamp` for next sync

**Initial Sync:** Set `last_sync: null` to get all items.

---

### Get Sync Status

```
GET /sync/status
```

**Response:**
```json
{
  "user_id": "user-uuid",
  "counts": {
    "personal_bookmarks": 50,
    "personal_folders": 5,
    "team_bookmarks": 25,
    "team_folders": 3
  },
  "teams": ["team-uuid-1", "team-uuid-2"],
  "server_time": "2026-01-25T11:00:00Z"
}
```

---

### Force Full Sync

```
POST /sync/force-full
```

Returns all items regardless of timestamps. Use when client cache is corrupted.

---

## Data Models

### Bookmark

```typescript
interface Bookmark {
  id: string;                    // UUID
  url: string;                   // Max 2048 chars
  title: string;                 // Max 500 chars
  description: string | null;    // Max 5000 chars
  favicon_url: string | null;    // Max 2048 chars
  tags: string[];                // Max 20 items, each max 50 chars
  folder_id: string | null;      // UUID or null
  user_id: string | null;        // UUID (personal) or null (team)
  team_id: string | null;        // UUID (team) or null (personal)
  created_by: string;            // UUID of creator
  sort_order: number;            // For custom ordering
  is_deleted: boolean;           // Soft delete flag
  is_shared: boolean;            // True if team_id is set
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
  deleted_at: string | null;     // ISO 8601 timestamp or null
  sync_version: number;          // Incremented on each update
}
```

### Bookmark Folder

```typescript
interface BookmarkFolder {
  id: string;                    // UUID
  name: string;                  // Max 255 chars
  description: string | null;    // Max 2000 chars
  parent_folder_id: string | null; // UUID or null (root level)
  user_id: string | null;        // UUID (personal) or null (team)
  team_id: string | null;        // UUID (team) or null (personal)
  sort_order: number;            // For custom ordering
  is_shared: boolean;            // True if team_id is set
  bookmark_count: number;        // Number of bookmarks in folder
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
  sync_version: number;          // Incremented on each update
}
```

### Folder Tree Node (Hierarchy)

```typescript
interface FolderTreeNode extends BookmarkFolder {
  level: number;                 // Nesting depth (0 = root)
  children: FolderTreeNode[];    // Nested subfolders
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Not authorized for this resource |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate URL |
| `422` | Validation Error - Invalid field values |
| `500` | Server Error |

### Common Error Responses

**Validation Error (422):**
```json
{
  "detail": "Invalid request format. Please check your input fields.",
  "errors": [
    {
      "field": "body.url",
      "message": "URL must start with http:// or https://",
      "type": "value_error"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "detail": "Bookmark not found"
}
```

**Conflict (409):**
```json
{
  "detail": "URL already bookmarked: https://example.com"
}
```

---

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| General API | 100 requests/minute |
| Import | 10 requests/minute |
| Export | 20 requests/minute |
| Sync | 60 requests/minute |

---

## Best Practices

### For UI Implementation

1. **Pagination**: Always use pagination for list endpoints. Default page_size is 50.

2. **Optimistic Updates**: For better UX, update UI immediately and handle errors.

3. **Tag Autocomplete**: Use `GET /bookmarks/all-tags` to populate tag suggestions.

4. **Folder Tree**: Cache the hierarchy response and refresh when folders change.

5. **Search Debounce**: Debounce search input (300ms recommended) to reduce API calls.

6. **Sync Strategy**:
   - Store `sync_timestamp` from each sync response
   - Sync on app startup and periodically (every 5 minutes)
   - Handle conflicts by showing user both versions

7. **Error Handling**:
   - Show user-friendly messages for common errors
   - Retry failed requests with exponential backoff

8. **Import Large Files**:
   - Use preview endpoint first to show user what will be imported
   - Show progress during import
   - Handle partial failures gracefully

---

## Changelog

### v1.0.0 (2026-01-25)
- Initial release
- Personal and team bookmarks
- Folder management with nesting
- Tags system with search
- Import/Export (HTML, JSON, CSV)
- Analytics dashboard
- Bidirectional sync API
