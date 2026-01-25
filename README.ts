Found the issue! The UI team is using the wrong endpoint paths. Here's the correct information:                                                                                                                                                              
                                                                                                                                                                                                                                                               
  ---                                                                                                                                                                                                                                                            Reply to UI Team: Bookmark Folders API - Correct Endpoints                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                 Hi UI Team,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  The bookmark folder endpoints ARE implemented, but you're using the wrong paths. The folders are under /bookmarks/folders, not /bookmark-folders.                                                                                                              
  Correct Endpoint Mapping
  ┌───────────────────────────────┬────────┬────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┐
  │            Feature            │ Method │                   ❌ Wrong Path                    │                   ✅ Correct Path                   │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Create personal folder        │ POST   │ /api/v1/bookmark-folders                           │ /api/v1/bookmarks/folders                           │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ List personal folders         │ GET    │ /api/v1/bookmark-folders                           │ /api/v1/bookmarks/folders                           │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Get personal folder hierarchy │ GET    │ /api/v1/bookmark-folders/hierarchy                 │ /api/v1/bookmarks/folders/hierarchy                 │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Get specific folder           │ GET    │ -                                                  │ /api/v1/bookmarks/folders/{folder_id}               │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Update folder                 │ PUT    │ -                                                  │ /api/v1/bookmarks/folders/{folder_id}               │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Move folder                   │ PATCH  │ -                                                  │ /api/v1/bookmarks/folders/{folder_id}/move          │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Delete folder                 │ DELETE │ -                                                  │ /api/v1/bookmarks/folders/{folder_id}               │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Create team folder            │ POST   │ /api/v1/teams/{team_id}/bookmark-folders           │ /api/v1/teams/{team_id}/bookmarks/folders           │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ List team folders             │ GET    │ /api/v1/teams/{team_id}/bookmark-folders           │ /api/v1/teams/{team_id}/bookmarks/folders           │
  ├───────────────────────────────┼────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Get team folder hierarchy     │ GET    │ /api/v1/teams/{team_id}/bookmark-folders/hierarchy │ /api/v1/teams/{team_id}/bookmarks/folders/hierarchy │
  └───────────────────────────────┴────────┴────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
  Request/Response Formats

  1. Create Folder
  POST /api/v1/bookmarks/folders
  Authorization: Bearer <token>

  {
    "name": "My Folder",
    "parent_folder_id": null,       // or UUID for nested folders
    "description": "Optional desc"
  }

  Response:
  {
    "success": true,
    "message": "Folder created",
    "data": {
      "id": "uuid",
      "name": "My Folder",
      "description": "Optional desc",
      "parent_folder_id": null,
      "bookmark_count": 0,
      "subfolder_count": 0,
      "created_at": "2026-01-26T...",
      "updated_at": "2026-01-26T..."
    }
  }

  2. List Folders (flat)
  GET /api/v1/bookmarks/folders?parent_id=<uuid-or-omit>
  Authorization: Bearer <token>

  Response:
  {
    "success": true,
    "data": [...folders],
    "total": 5
  }

  3. Get Folder Hierarchy (nested)
  GET /api/v1/bookmarks/folders/hierarchy
  Authorization: Bearer <token>

  Response:
  {
    "success": true,
    "data": [
      {
        "id": "folder-uuid",
        "name": "Parent Folder",
        "description": "...",
        "children": [
          {
            "id": "child-uuid",
            "name": "Child Folder",
            "children": []
          }
        ]
      }
    ],
    "total": 2
  }

  4. Move Bookmark to Folder

  When creating or updating a bookmark, include folder_id:

  POST /api/v1/bookmarks
  {
    "name": "My Bookmark",
    "url": "https://example.com",
    "folder_id": "folder-uuid"  // <-- Associate with folder
  }

  Or update existing bookmark:
  PUT /api/v1/bookmarks/{bookmark_id}
  {
    "folder_id": "new-folder-uuid"  // Move to different folder
  }

  ---
  Summary: Just change bookmark-folders → bookmarks/folders in all your endpoints.
