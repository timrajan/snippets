Settings API Specification v2
Overview
This document specifies the REST API endpoints for synchronizing user settings between the Testr desktop application and the server. Settings allow logged-in users to persist their preferences, enabling consistent configuration across devices and sessions.

Workflow
1. Default Settings (Guest Mode)
When a user is not logged in, the application uses default settings stored locally in settings.json. These defaults are:

{
    "captures_per_minute": 60,
    "replay_speed_fps": 1,
    "autoplay": false,
    "loop": true,
    "show_actions_panel": false,
    "run_mode": "visible",
    "browser_window_mode": "maximised",
    "default_url": "https://www.google.com",
    "record_browser": "qtwebengine",
    "checkpoint_line_thickness": "1",
    "checkpoint_line_color": "#ff0000",
    "use_ai": false,
    "ai_api_endpoint": "",
    "ai_api_key": "",
    "ai_model": "llama-3.1-8b-instant",
    "console_capture_enabled": true,
    "network_capture_enabled": true,
    "environment_capture_enabled": true,
    "timing_capture_enabled": true,
    "auto_generate_defect": true,
    "auto_generate_detailed_defects": true,
    "parallel_enabled": true,
    "parallel_count": 2,
    "wcag_level": "A",
    "accessibility_enabled": true,
    "responsive_panel_devices": [
        "iPad Pro 12.9\"",
        "iPad Air",
        "Samsung S23 Ultra",
        "iPad Mini",
        "Galaxy Tab S9"
    ],
    "responsive_panel_resolutions": [
        "1920×1080 (FHD)",
        "1366×768 (HD)",
        "1536×864",
        "1440×900",
        "2560×1440 (QHD)"
    ],
    "integration_type": "none",
    "integration_auto_create_on_failure": true,
    "integration_attach_screenshots": true,
    "integration_max_screenshots": 5,
    "jira_url": "",
    "jira_username": "",
    "jira_project_key": "",
    "jira_issue_type": "Bug",
    "jira_severity_field": "",
    "azure_organization": "",
    "azure_project": "",
    "azure_work_item_type": "Bug"
}
2. User Login Flow
When a user logs in:

Application calls GET /api/v1/settings to fetch user settings from server
If settings exist on server, they are applied to the application
If no settings exist (first-time user), the default settings are used and synced to server via PUT /api/v1/settings
3. Auto-Sync on Settings Change
When a user changes any setting in the application:

Setting is immediately saved to local settings.json (as backup/cache)
If user is logged in, application calls PUT /api/v1/settings to sync the entire settings payload to server
Server stores the settings and returns success confirmation
4. User Logout Flow
When a user logs out:

Application stops syncing with server
Application reverts to local settings.json (which may retain last synced settings)
On next guest session, default settings can be restored via "Reset to Defaults" action
API Endpoints
Base URL
/api/v1/settings
All endpoints require authentication via Bearer token in the Authorization header.

1. Get User Settings
Retrieves all settings for the authenticated user.

Endpoint
GET /api/v1/settings
Headers
Authorization: Bearer <access_token>
Content-Type: application/json
Response
Success (200 OK) - Settings Exist
{
    "success": true,
    "data": {
        "captures_per_minute": 60,
        "replay_speed_fps": 1,
        "autoplay": false,
        "loop": true,
        "show_actions_panel": false,
        "run_mode": "visible",
        "browser_window_mode": "maximised",
        "default_url": "https://www.theage.com.au/",
        "record_browser": "qtwebengine",
        "checkpoint_line_thickness": "1",
        "checkpoint_line_color": "#ff0000",
        "use_ai": false,
        "ai_api_endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "ai_model": "llama-3.1-8b-instant",
        "console_capture_enabled": true,
        "network_capture_enabled": true,
        "environment_capture_enabled": true,
        "timing_capture_enabled": true,
        "auto_generate_defect": true,
        "auto_generate_detailed_defects": true,
        "parallel_enabled": true,
        "parallel_count": 2,
        "wcag_level": "A",
        "accessibility_enabled": true,
        "responsive_panel_devices": [
            "iPad Pro 12.9\"",
            "iPad Air",
            "Samsung S23 Ultra",
            "iPad Mini",
            "Galaxy Tab S9"
        ],
        "responsive_panel_resolutions": [
            "1920×1080 (FHD)",
            "1366×768 (HD)",
            "1536×864",
            "1440×900",
            "2560×1440 (QHD)"
        ],
        "integration_type": "none",
        "integration_auto_create_on_failure": true,
        "integration_attach_screenshots": true,
        "integration_max_screenshots": 5,
        "jira_url": "",
        "jira_username": "",
        "jira_project_key": "",
        "jira_issue_type": "Bug",
        "jira_severity_field": "",
        "azure_organization": "",
        "azure_project": "",
        "azure_work_item_type": "Bug"
    },
    "metadata": {
        "last_updated": "2026-01-24T10:30:00Z",
        "version": 1
    }
}
Success (200 OK) - No Settings (First-Time User)
{
    "success": true,
    "data": null,
    "message": "No settings found for user"
}
Error (401 Unauthorized)
{
    "success": false,
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
    }
}
2. Update/Create User Settings
Creates or updates all settings for the authenticated user. This is a full replacement - the entire settings object is stored.

Endpoint
PUT /api/v1/settings
Headers
Authorization: Bearer <access_token>
Content-Type: application/json
Request Body
{
    "captures_per_minute": 60,
    "replay_speed_fps": 1,
    "autoplay": false,
    "loop": true,
    "show_actions_panel": false,
    "run_mode": "visible",
    "browser_window_mode": "maximised",
    "default_url": "https://www.theage.com.au/",
    "record_browser": "qtwebengine",
    "checkpoint_line_thickness": "1",
    "checkpoint_line_color": "#ff0000",
    "use_ai": false,
    "ai_api_endpoint": "https://api.groq.com/openai/v1/chat/completions",
    "ai_api_key": "gsk_xxxxxxxxxxxxx",
    "ai_model": "llama-3.1-8b-instant",
    "console_capture_enabled": true,
    "network_capture_enabled": true,
    "environment_capture_enabled": true,
    "timing_capture_enabled": true,
    "auto_generate_defect": true,
    "auto_generate_detailed_defects": true,
    "parallel_enabled": true,
    "parallel_count": 2,
    "wcag_level": "A",
    "accessibility_enabled": true,
    "responsive_panel_devices": [
        "iPad Pro 12.9\"",
        "iPad Air",
        "Samsung S23 Ultra",
        "iPad Mini",
        "Galaxy Tab S9"
    ],
    "responsive_panel_resolutions": [
        "1920×1080 (FHD)",
        "1366×768 (HD)",
        "1536×864",
        "1440×900",
        "2560×1440 (QHD)"
    ],
    "integration_type": "jira",
    "integration_auto_create_on_failure": true,
    "integration_attach_screenshots": true,
    "integration_max_screenshots": 5,
    "jira_url": "https://company.atlassian.net",
    "jira_username": "user@company.com",
    "jira_api_token": "ATATT3xFfGF0xxxxx",
    "jira_project_key": "PROJ",
    "jira_issue_type": "Bug",
    "jira_severity_field": "customfield_10001",
    "azure_organization": "",
    "azure_project": "",
    "azure_pat": "",
    "azure_work_item_type": "Bug"
}
Response
Success (200 OK)
{
    "success": true,
    "message": "Settings saved successfully",
    "data": {
        "updated_at": "2026-01-24T10:35:00Z",
        "version": 2
    }
}
Error (400 Bad Request) - Validation Error
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid settings value",
        "details": [
            {
                "field": "parallel_count",
                "message": "Value must be between 1 and 10"
            },
            {
                "field": "checkpoint_line_color",
                "message": "Must be a valid hex color (e.g., #ff0000)"
            }
        ]
    }
}
3. Reset Settings to Defaults
Resets all settings to default values for the authenticated user.

Endpoint
POST /api/v1/settings/reset
Headers
Authorization: Bearer <access_token>
Content-Type: application/json
Request Body
{
    "confirm": true
}
Response
Success (200 OK)
{
    "success": true,
    "message": "Settings reset to defaults",
    "data": {
        "captures_per_minute": 60,
        "replay_speed_fps": 1,
        "autoplay": false,
        "loop": true,
        "show_actions_panel": false,
        "run_mode": "visible",
        "browser_window_mode": "maximised",
        "default_url": "https://www.google.com",
        "record_browser": "qtwebengine",
        "checkpoint_line_thickness": "1",
        "checkpoint_line_color": "#ff0000",
        "use_ai": false,
        "ai_api_endpoint": "",
        "ai_model": "llama-3.1-8b-instant",
        "console_capture_enabled": true,
        "network_capture_enabled": true,
        "environment_capture_enabled": true,
        "timing_capture_enabled": true,
        "auto_generate_defect": true,
        "auto_generate_detailed_defects": true,
        "parallel_enabled": true,
        "parallel_count": 2,
        "wcag_level": "A",
        "accessibility_enabled": true,
        "responsive_panel_devices": [
            "iPad Pro 12.9\"",
            "iPad Air",
            "Samsung S23 Ultra",
            "iPad Mini",
            "Galaxy Tab S9"
        ],
        "responsive_panel_resolutions": [
            "1920×1080 (FHD)",
            "1366×768 (HD)",
            "1536×864",
            "1440×900",
            "2560×1440 (QHD)"
        ],
        "integration_type": "none",
        "integration_auto_create_on_failure": true,
        "integration_attach_screenshots": true,
        "integration_max_screenshots": 5,
        "jira_url": "",
        "jira_username": "",
        "jira_project_key": "",
        "jira_issue_type": "Bug",
        "jira_severity_field": "",
        "azure_organization": "",
        "azure_project": "",
        "azure_work_item_type": "Bug"
    }
}
4. Test Integration Connection
Tests the connection to an external integration (Jira, Azure DevOps) using provided credentials.

Endpoint
POST /api/v1/settings/integrations/test
Headers
Authorization: Bearer <access_token>
Content-Type: application/json
Request Body - Jira
{
    "integration_type": "jira",
    "jira_url": "https://company.atlassian.net",
    "jira_username": "user@company.com",
    "jira_api_token": "ATATT3xFfGF0xxxxx"
}
Request Body - Azure DevOps
{
    "integration_type": "azure_devops",
    "azure_organization": "myorg",
    "azure_project": "MyProject",
    "azure_pat": "ghp_xxxx..."
}
Response
Success (200 OK) - Connected
{
    "success": true,
    "data": {
        "connected": true,
        "message": "Connected as: John Doe",
        "details": {
            "server_info": "Jira Cloud",
            "user_display_name": "John Doe",
            "permissions": ["CREATE_ISSUES", "ATTACH_FILES"]
        }
    }
}
Success (200 OK) - Connection Failed
{
    "success": true,
    "data": {
        "connected": false,
        "message": "Authentication failed - check username/API token",
        "error_code": "AUTH_FAILED"
    }
}
Settings Field Reference
Recording Settings
Field	Type	Default	Description	Constraints
captures_per_minute	integer	60	Screenshot capture frequency	1-120
replay_speed_fps	integer	1	Playback frames per second	1-60
autoplay	boolean	false	Auto-play recordings	-
loop	boolean	true	Loop playback	-
show_actions_panel	boolean	false	Show actions panel during recording	-
run_mode	string	"visible"	Test run mode	"visible", "headless"
browser_window_mode	string	"maximised"	Browser window state	"maximised", "windowed", "fullscreen"
default_url	string	"https://www.google.com"	Default start URL	Valid URL
record_browser	string	"qtwebengine"	Recording browser engine	"qtwebengine", "playwright_chromium", "playwright_firefox", "playwright_webkit"
Checkpoint Settings
Field	Type	Default	Description	Constraints
checkpoint_line_thickness	string	"1"	Visual checkpoint line thickness	"1"-"5"
checkpoint_line_color	string	"#ff0000"	Checkpoint highlight color	Valid hex color
AI/LLM Settings
Field	Type	Default	Description	Constraints
use_ai	boolean	false	Enable AI features	-
ai_api_endpoint	string	""	AI API endpoint URL	Valid URL or empty
ai_api_key	string	""	AI API key (encrypted at rest)	-
ai_model	string	"llama-3.1-8b-instant"	AI model identifier	-
Capture Settings
Field	Type	Default	Description	Constraints
console_capture_enabled	boolean	true	Capture browser console logs	-
network_capture_enabled	boolean	true	Capture network requests	-
environment_capture_enabled	boolean	true	Capture environment info	-
timing_capture_enabled	boolean	true	Capture timing metrics	-
Test Execution Settings
Field	Type	Default	Description	Constraints
auto_generate_defect	boolean	true	Auto-generate defects on failure	-
auto_generate_detailed_defects	boolean	true	Include detailed info in defects	-
parallel_enabled	boolean	true	Enable parallel test execution	-
parallel_count	integer	2	Number of parallel workers	1-10
wcag_level	string	"A"	WCAG accessibility level	"A", "AA", "AAA"
accessibility_enabled	boolean	true	Enable accessibility checks	-
Responsive Panel Settings
Field	Type	Default	Description
responsive_panel_devices	array[string]	["iPad Pro 12.9"", ...]	Device presets for responsive testing
responsive_panel_resolutions	array[string]	["1920×1080 (FHD)", ...]	Resolution presets
Integration Settings
Field	Type	Default	Description	Constraints
integration_type	string	"none"	Active integration	"none", "jira", "azure_devops"
integration_auto_create_on_failure	boolean	true	Auto-create defects on test failure	-
integration_attach_screenshots	boolean	true	Attach screenshots to defects	-
integration_max_screenshots	integer	5	Max screenshots per defect	1-20
Jira Integration
Field	Type	Default	Description
jira_url	string	""	Jira instance URL
jira_username	string	""	Jira username/email
jira_api_token	string	""	Jira API token (encrypted at rest)
jira_project_key	string	""	Default project key
jira_issue_type	string	"Bug"	Default issue type
jira_severity_field	string	""	Custom field ID for severity
Azure DevOps Integration
Field	Type	Default	Description
azure_organization	string	""	Azure DevOps organization
azure_project	string	""	Project name
azure_pat	string	""	Personal Access Token (encrypted at rest)
azure_work_item_type	string	"Bug"	Default work item type
Database Schema
Table: user_settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Settings stored as JSONB for flexibility
    settings JSONB NOT NULL DEFAULT '{}',

    -- Metadata
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id)
);

-- Index for fast lookup by user
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_timestamp
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
Table: user_credentials (Separate for Security)
Stores encrypted sensitive credentials (API tokens, passwords).

CREATE TABLE user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Credential type
    credential_type VARCHAR(50) NOT NULL, -- 'ai_api_key', 'jira_api_token', 'azure_pat'

    -- Encrypted value (use server-side encryption)
    encrypted_value BYTEA NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, credential_type)
);

CREATE INDEX idx_user_credentials_user ON user_credentials(user_id);
Pydantic Models (Python)
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime


class UserSettings(BaseModel):
    """Complete user settings model"""

    # Recording Settings
    captures_per_minute: int = Field(60, ge=1, le=120)
    replay_speed_fps: int = Field(1, ge=1, le=60)
    autoplay: bool = False
    loop: bool = True
    show_actions_panel: bool = False
    run_mode: Literal["visible", "headless"] = "visible"
    browser_window_mode: Literal["maximised", "windowed", "fullscreen"] = "maximised"
    default_url: str = "https://www.google.com"
    record_browser: Literal["qtwebengine", "playwright_chromium", "playwright_firefox", "playwright_webkit"] = "qtwebengine"

    # Checkpoint Settings
    checkpoint_line_thickness: str = Field("1", pattern=r"^[1-5]$")
    checkpoint_line_color: str = Field("#ff0000", pattern=r"^#[0-9a-fA-F]{6}$")

    # AI Settings
    use_ai: bool = False
    ai_api_endpoint: str = ""
    ai_api_key: Optional[str] = None  # Only for input, never returned
    ai_model: str = "llama-3.1-8b-instant"

    # Capture Settings
    console_capture_enabled: bool = True
    network_capture_enabled: bool = True
    environment_capture_enabled: bool = True
    timing_capture_enabled: bool = True

    # Test Execution Settings
    auto_generate_defect: bool = True
    auto_generate_detailed_defects: bool = True
    parallel_enabled: bool = True
    parallel_count: int = Field(2, ge=1, le=10)
    wcag_level: Literal["A", "AA", "AAA"] = "A"
    accessibility_enabled: bool = True

    # Responsive Panel Settings
    responsive_panel_devices: List[str] = [
        "iPad Pro 12.9\"",
        "iPad Air",
        "Samsung S23 Ultra",
        "iPad Mini",
        "Galaxy Tab S9"
    ]
    responsive_panel_resolutions: List[str] = [
        "1920×1080 (FHD)",
        "1366×768 (HD)",
        "1536×864",
        "1440×900",
        "2560×1440 (QHD)"
    ]

    # Integration Settings
    integration_type: Literal["none", "jira", "azure_devops"] = "none"
    integration_auto_create_on_failure: bool = True
    integration_attach_screenshots: bool = True
    integration_max_screenshots: int = Field(5, ge=1, le=20)

    # Jira Settings
    jira_url: str = ""
    jira_username: str = ""
    jira_api_token: Optional[str] = None  # Only for input
    jira_project_key: str = ""
    jira_issue_type: str = "Bug"
    jira_severity_field: str = ""

    # Azure DevOps Settings
    azure_organization: str = ""
    azure_project: str = ""
    azure_pat: Optional[str] = None  # Only for input
    azure_work_item_type: str = "Bug"

    @field_validator('checkpoint_line_color')
    @classmethod
    def validate_hex_color(cls, v):
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Must be a valid hex color (e.g., #ff0000)')
        return v.lower()


class SettingsResponse(BaseModel):
    """Response model for GET /settings"""
    success: bool
    data: Optional[UserSettings] = None
    message: Optional[str] = None
    metadata: Optional[dict] = None


class SettingsUpdateResponse(BaseModel):
    """Response model for PUT /settings"""
    success: bool
    message: str
    data: Optional[dict] = None


class SettingsResetRequest(BaseModel):
    """Request model for POST /settings/reset"""
    confirm: bool = True


class IntegrationTestRequest(BaseModel):
    """Request model for POST /settings/integrations/test"""
    integration_type: Literal["jira", "azure_devops"]

    # Jira fields
    jira_url: Optional[str] = None
    jira_username: Optional[str] = None
    jira_api_token: Optional[str] = None

    # Azure DevOps fields
    azure_organization: Optional[str] = None
    azure_project: Optional[str] = None
    azure_pat: Optional[str] = None


class IntegrationTestResponse(BaseModel):
    """Response model for integration test"""
    success: bool
    data: dict
Security Considerations
Credential Encryption: All sensitive fields (ai_api_key, jira_api_token, azure_pat) must be encrypted at rest using server-side encryption (e.g., AWS KMS, Vault)

Never Return Secrets: When returning settings via GET, sensitive fields should be omitted or replaced with indicators:

{
    "ai_api_key": null,
    "has_ai_api_key": true,
    "jira_api_token": null,
    "has_jira_api_token": true
}
Rate Limiting: Limit settings update frequency (e.g., 30 requests/minute per user)

Audit Logging: Log all settings changes with user ID and timestamp

Input Validation: Validate all settings against expected types, ranges, and patterns

Error Codes
Code	HTTP Status	Description
UNAUTHORIZED	401	Authentication required
FORBIDDEN	403	Insufficient permissions
VALIDATION_ERROR	400	Invalid settings value
NOT_FOUND	404	User settings not found
RATE_LIMITED	429	Too many requests
SERVER_ERROR	500	Internal server error
Revision History
Version	Date	Author	Changes
2.0.0	2026-01-24	Testr Team	Simplified flat structure matching app's settings.json
