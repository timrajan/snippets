# Settings API Specification

## Overview

This document specifies the REST API endpoints for managing user settings in the Testr application. Settings allow logged-in users to persist their preferences on the server, enabling consistent configuration across devices and sessions.

---

## Design Philosophy

### Dual Storage Architecture
- **Guest Users**: Settings stored locally in JSON files (`~/.testr/qa_panel_settings.json`, `settings.json`, etc.)
- **Logged-In Users**: Settings synced with server via API (complete replacement of local storage)

### Key Principles
1. **Single Source of Truth**: When logged in, server is the authoritative source
2. **Complete Separation**: No mixing between local and server settings
3. **Atomic Updates**: Settings are updated as complete sections to avoid partial states
4. **Sensible Defaults**: Server returns defaults for any missing settings

---

## Database Schema

### Table: `user_settings`

Stores all user settings as a JSONB document for flexibility.

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Settings Sections (JSONB for flexibility)
    general_settings JSONB DEFAULT '{}',
    capture_settings JSONB DEFAULT '{}',
    performance_settings JSONB DEFAULT '{}',
    advanced_settings JSONB DEFAULT '{}',
    ui_settings JSONB DEFAULT '{}',
    playback_settings JSONB DEFAULT '{}',
    integration_settings JSONB DEFAULT '{}',
    ai_settings JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_timestamp
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

### Table: `user_integration_credentials`

Stores encrypted integration credentials separately for security.

```sql
CREATE TABLE user_integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Integration Type
    integration_type VARCHAR(50) NOT NULL, -- 'jira', 'azure_devops', 'custom'

    -- Encrypted Credentials (encrypted at rest)
    credentials_encrypted BYTEA NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, integration_type)
);

CREATE INDEX idx_user_integration_credentials_user ON user_integration_credentials(user_id);
```

---

## API Endpoints

### Base URL
```
/api/v1/settings
```

---

## 1. Get All Settings

Retrieves all settings for the authenticated user.

### Endpoint
```
GET /api/v1/settings
```

### Authentication
Required. Bearer token in Authorization header.

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "data": {
        "general": {
            "auto_open_on_errors": true,
            "show_indicator": true,
            "always_expand_events": false,
            "default_dock_position": "bottom",
            "show_onboarding": true
        },
        "capture": {
            "max_events": 1000,
            "max_screenshots": 50,
            "auto_screenshot_network_errors": true,
            "auto_screenshot_console_errors": true,
            "auto_screenshot_warnings": false,
            "capture_request_body": true,
            "capture_response_body": true,
            "max_body_size_kb": 100
        },
        "performance": {
            "enable_virtual_scrolling": true,
            "lazy_load_screenshots": true,
            "event_batch_size": 100,
            "filter_debounce_ms": 200,
            "dom_max_depth": 100
        },
        "advanced": {
            "track_dom_mutations": false,
            "capture_websocket": true,
            "capture_sse": true,
            "enable_debug_logging": false,
            "memory_warning_mb": 100,
            "memory_critical_mb": 200
        },
        "ui": {
            "theme": "auto",
            "font_size": "medium",
            "compact_mode": false
        },
        "playback": {
            "execution": {
                "run_mode": "Headed",
                "replay_speed": "Normal",
                "step_delay_ms": 500,
                "stop_on_failure": true,
                "step_by_step": false,
                "loop_count": 1,
                "autoplay_next": false
            },
            "browser": {
                "type": "Chromium",
                "channel": "Default (Bundled)",
                "viewport_width": 1920,
                "viewport_height": 1080,
                "match_recorded_viewport": true,
                "device_preset": "None (Custom)",
                "device_scale_factor": 1.0,
                "is_mobile": false,
                "has_touch": false,
                "color_scheme": "Light"
            },
            "timeouts": {
                "action_timeout_sec": 30,
                "navigation_timeout_sec": 30,
                "global_timeout_sec": 0,
                "wait_for_idle": true,
                "idle_timeout_ms": 500
            },
            "verification": {
                "screenshot_compare_enabled": true,
                "pixel_threshold_percent": 1.0,
                "comparison_method": "Pixel-by-Pixel",
                "antialiasing_tolerance": 2,
                "element_verify_enabled": true,
                "verify_element_text": true,
                "verify_element_state": true,
                "position_tolerance_px": 10,
                "api_checkpoint_bandwidth": 2
            },
            "capture": {
                "screenshot_each_step": true,
                "screenshot_on_failure": true,
                "full_page_screenshot": false,
                "screenshot_format": "PNG",
                "jpeg_quality": 80,
                "hide_caret": true,
                "disable_animations": true,
                "record_video": false,
                "video_size_width": 1280,
                "video_size_height": 720,
                "save_trace": false,
                "trace_on_failure_only": true
            },
            "network": {
                "offline_mode": false,
                "throttle_preset": "None",
                "custom_download_speed": 1000,
                "custom_upload_speed": 500,
                "custom_latency_ms": 100,
                "ignore_https_errors": false,
                "proxy_enabled": false,
                "proxy_server": "",
                "proxy_bypass": ""
            },
            "locale": {
                "locale": "System Default",
                "timezone": "System Default",
                "geolocation_enabled": false,
                "geolocation_latitude": 0.0,
                "geolocation_longitude": 0.0,
                "geolocation_accuracy": 100
            },
            "permissions": {
                "geolocation": "Default",
                "notifications": "Default",
                "camera": "Default",
                "microphone": "Default",
                "clipboard_read": "Default",
                "clipboard_write": "Default"
            },
            "authentication": {
                "http_auth_enabled": false,
                "http_auth_username": "",
                "storage_state_enabled": false,
                "storage_state_file": "",
                "save_session_after": false,
                "extra_headers_enabled": false,
                "extra_headers": ""
            },
            "accessibility": {
                "enabled": false,
                "wcag_level": "WCAG 2.0 AA"
            },
            "advanced": {
                "javascript_enabled": true,
                "bypass_csp": false,
                "service_workers": "Allow",
                "user_agent_override": false,
                "user_agent_string": "",
                "reduced_motion": "No Preference",
                "forced_colors": "None",
                "open_devtools": false
            }
        },
        "recording": {
            "captures_per_minute": 60,
            "replay_speed_fps": 1,
            "autoplay": false,
            "loop": true,
            "show_actions_panel": false,
            "run_mode": "visible",
            "browser_window_mode": "maximised",
            "default_url": "https://www.google.com",
            "record_browser": "qtwebengine",
            "console_capture_enabled": true,
            "network_capture_enabled": true,
            "environment_capture_enabled": true,
            "timing_capture_enabled": true
        },
        "checkpoints": {
            "line_thickness": "1",
            "line_color": "#ff0000"
        },
        "test_execution": {
            "auto_generate_defect": true,
            "auto_generate_detailed_defects": true,
            "parallel_enabled": true,
            "parallel_count": 2,
            "accessibility_enabled": true,
            "wcag_level": "AA"
        },
        "responsive_panel": {
            "devices": ["iPad Pro", "iPad Air", "iPad Mini"],
            "resolutions": ["1920x1080", "1366x768", "1440x900"]
        },
        "ai": {
            "enabled": false,
            "api_endpoint": "",
            "model": "llama-3.1-8b-instant"
        },
        "integration": {
            "type": "none",
            "auto_create_on_failure": true,
            "attach_screenshots": true,
            "max_screenshots": 5,
            "jira": {
                "url": "",
                "username": "",
                "project_key": "",
                "issue_type": "Bug",
                "severity_field": ""
            },
            "azure_devops": {
                "organization": "",
                "project": "",
                "work_item_type": "Bug"
            },
            "custom": {
                "api_url": "",
                "auth_type": "bearer",
                "headers": {}
            }
        }
    },
    "metadata": {
        "last_updated": "2026-01-15T10:30:00Z"
    }
}
```

#### Error (401 Unauthorized)
```json
{
    "success": false,
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
    }
}
```

---

## 2. Update Settings

Updates settings for the authenticated user. Supports partial updates (only include sections you want to change).

### Endpoint
```
PUT /api/v1/settings
```

### Authentication
Required. Bearer token in Authorization header.

### Request Body
```json
{
    "general": {
        "auto_open_on_errors": false,
        "show_indicator": true
    },
    "ui": {
        "theme": "dark",
        "font_size": "large"
    },
    "playback": {
        "execution": {
            "run_mode": "Headless",
            "step_delay_ms": 1000
        },
        "browser": {
            "type": "Firefox",
            "viewport_width": 1440,
            "viewport_height": 900
        }
    }
}
```

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "Settings updated successfully",
    "data": {
        "updated_sections": ["general", "ui", "playback"],
        "updated_at": "2026-01-15T10:35:00Z"
    }
}
```

#### Error (400 Bad Request)
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid settings value",
        "details": [
            {
                "field": "playback.execution.step_delay_ms",
                "message": "Value must be between 0 and 10000"
            }
        ]
    }
}
```

---

## 3. Reset Settings to Defaults

Resets all or specific sections to default values.

### Endpoint
```
POST /api/v1/settings/reset
```

### Authentication
Required. Bearer token in Authorization header.

### Request Body

#### Reset All Settings
```json
{
    "reset_all": true
}
```

#### Reset Specific Sections
```json
{
    "sections": ["playback", "ui"]
}
```

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "Settings reset to defaults",
    "data": {
        "reset_sections": ["playback", "ui"],
        "updated_at": "2026-01-15T10:40:00Z"
    }
}
```

---

## 4. Get Integration Credentials

Retrieves integration configuration (without sensitive credentials).

### Endpoint
```
GET /api/v1/settings/integrations
```

### Authentication
Required. Bearer token in Authorization header.

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "data": {
        "type": "jira",
        "auto_create_on_failure": true,
        "attach_screenshots": true,
        "max_screenshots": 5,
        "jira": {
            "url": "https://company.atlassian.net",
            "username": "user@company.com",
            "project_key": "PROJ",
            "issue_type": "Bug",
            "severity_field": "customfield_10001",
            "has_api_token": true
        }
    }
}
```

Note: `has_api_token` indicates whether a token is stored, but never returns the actual token.

---

## 5. Update Integration Credentials

Updates integration configuration including sensitive credentials.

### Endpoint
```
PUT /api/v1/settings/integrations
```

### Authentication
Required. Bearer token in Authorization header.

### Request Body

#### Jira Integration
```json
{
    "type": "jira",
    "auto_create_on_failure": true,
    "attach_screenshots": true,
    "max_screenshots": 5,
    "jira": {
        "url": "https://company.atlassian.net",
        "username": "user@company.com",
        "api_token": "ATATT3xFfGF0...",
        "project_key": "PROJ",
        "issue_type": "Bug",
        "severity_field": "customfield_10001"
    }
}
```

#### Azure DevOps Integration
```json
{
    "type": "azure_devops",
    "auto_create_on_failure": true,
    "attach_screenshots": true,
    "max_screenshots": 5,
    "azure_devops": {
        "organization": "myorg",
        "project": "MyProject",
        "pat": "ghp_xxxx...",
        "work_item_type": "Bug"
    }
}
```

#### Custom Integration
```json
{
    "type": "custom",
    "auto_create_on_failure": true,
    "attach_screenshots": true,
    "max_screenshots": 5,
    "custom": {
        "api_url": "https://api.example.com/defects",
        "auth_type": "bearer",
        "api_token": "token_xxxx...",
        "headers": {
            "X-Custom-Header": "value"
        }
    }
}
```

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "Integration settings updated successfully",
    "data": {
        "type": "jira",
        "updated_at": "2026-01-15T10:45:00Z"
    }
}
```

---

## 6. Test Integration Connection

Tests the integration connection with provided or stored credentials.

### Endpoint
```
POST /api/v1/settings/integrations/test
```

### Authentication
Required. Bearer token in Authorization header.

### Request Body

#### Test with New Credentials
```json
{
    "type": "jira",
    "jira": {
        "url": "https://company.atlassian.net",
        "username": "user@company.com",
        "api_token": "ATATT3xFfGF0..."
    }
}
```

#### Test with Stored Credentials
```json
{
    "type": "jira",
    "use_stored_credentials": true
}
```

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "Connection successful",
    "data": {
        "type": "jira",
        "connected": true,
        "details": {
            "server_info": "Jira Cloud",
            "user": "user@company.com",
            "permissions": ["CREATE_ISSUES", "ATTACH_FILES"]
        }
    }
}
```

#### Connection Failed (200 OK with error details)
```json
{
    "success": true,
    "data": {
        "type": "jira",
        "connected": false,
        "error": {
            "code": "AUTH_FAILED",
            "message": "Invalid API token or credentials"
        }
    }
}
```

---

## 7. Delete Integration

Removes integration configuration and credentials.

### Endpoint
```
DELETE /api/v1/settings/integrations/{integration_type}
```

### Authentication
Required. Bearer token in Authorization header.

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| integration_type | string | `jira`, `azure_devops`, or `custom` |

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "Integration removed successfully"
}
```

---

## 8. Update AI Settings

Updates AI/LLM configuration (credentials stored securely).

### Endpoint
```
PUT /api/v1/settings/ai
```

### Authentication
Required. Bearer token in Authorization header.

### Request Body
```json
{
    "enabled": true,
    "api_endpoint": "https://api.groq.com/openai/v1/chat/completions",
    "api_key": "gsk_xxxx...",
    "model": "llama-3.1-8b-instant"
}
```

### Response

#### Success (200 OK)
```json
{
    "success": true,
    "message": "AI settings updated successfully",
    "data": {
        "enabled": true,
        "api_endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "model": "llama-3.1-8b-instant",
        "has_api_key": true
    }
}
```

---

## Pydantic Models

### Request Models

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Literal
from enum import Enum


# ==================== ENUMS ====================

class ThemeMode(str, Enum):
    AUTO = "auto"
    LIGHT = "light"
    DARK = "dark"

class FontSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class DockPosition(str, Enum):
    BOTTOM = "bottom"
    RIGHT = "right"
    LEFT = "left"
    TOP = "top"

class RunMode(str, Enum):
    HEADED = "Headed"
    HEADLESS = "Headless"

class ReplaySpeed(str, Enum):
    SLOW = "Slow"
    NORMAL = "Normal"
    FAST = "Fast"

class BrowserType(str, Enum):
    CHROMIUM = "Chromium"
    FIREFOX = "Firefox"
    WEBKIT = "WebKit"

class ColorScheme(str, Enum):
    LIGHT = "Light"
    DARK = "Dark"
    NO_PREFERENCE = "No Preference"

class ScreenshotFormat(str, Enum):
    PNG = "PNG"
    JPEG = "JPEG"

class ComparisonMethod(str, Enum):
    PIXEL_BY_PIXEL = "Pixel-by-Pixel"
    SSIM = "SSIM"
    PERCEPTUAL_HASH = "Perceptual Hash"

class WCAGLevel(str, Enum):
    A = "WCAG 2.0 A"
    AA = "WCAG 2.0 AA"
    AAA = "WCAG 2.0 AAA"

class PermissionState(str, Enum):
    DEFAULT = "Default"
    GRANT = "Grant"
    DENY = "Deny"

class ServiceWorkerMode(str, Enum):
    ALLOW = "Allow"
    BLOCK = "Block"

class IntegrationType(str, Enum):
    NONE = "none"
    JIRA = "jira"
    AZURE_DEVOPS = "azure_devops"
    CUSTOM = "custom"

class AuthType(str, Enum):
    BEARER = "bearer"
    BASIC = "basic"
    API_KEY = "api_key"


# ==================== SETTINGS SECTIONS ====================

class GeneralSettings(BaseModel):
    auto_open_on_errors: Optional[bool] = True
    show_indicator: Optional[bool] = True
    always_expand_events: Optional[bool] = False
    default_dock_position: Optional[DockPosition] = DockPosition.BOTTOM
    show_onboarding: Optional[bool] = True


class CaptureSettings(BaseModel):
    max_events: Optional[int] = Field(1000, ge=100, le=10000)
    max_screenshots: Optional[int] = Field(50, ge=10, le=200)
    auto_screenshot_network_errors: Optional[bool] = True
    auto_screenshot_console_errors: Optional[bool] = True
    auto_screenshot_warnings: Optional[bool] = False
    capture_request_body: Optional[bool] = True
    capture_response_body: Optional[bool] = True
    max_body_size_kb: Optional[int] = Field(100, ge=10, le=1000)


class PerformanceSettings(BaseModel):
    enable_virtual_scrolling: Optional[bool] = True
    lazy_load_screenshots: Optional[bool] = True
    event_batch_size: Optional[int] = Field(100, ge=10, le=500)
    filter_debounce_ms: Optional[int] = Field(200, ge=50, le=1000)
    dom_max_depth: Optional[int] = Field(100, ge=10, le=500)


class AdvancedCaptureSettings(BaseModel):
    track_dom_mutations: Optional[bool] = False
    capture_websocket: Optional[bool] = True
    capture_sse: Optional[bool] = True
    enable_debug_logging: Optional[bool] = False
    memory_warning_mb: Optional[int] = Field(100, ge=50, le=500)
    memory_critical_mb: Optional[int] = Field(200, ge=100, le=1000)


class UISettings(BaseModel):
    theme: Optional[ThemeMode] = ThemeMode.AUTO
    font_size: Optional[FontSize] = FontSize.MEDIUM
    compact_mode: Optional[bool] = False


# ==================== PLAYBACK SETTINGS ====================

class ExecutionSettings(BaseModel):
    run_mode: Optional[RunMode] = RunMode.HEADED
    replay_speed: Optional[ReplaySpeed] = ReplaySpeed.NORMAL
    step_delay_ms: Optional[int] = Field(500, ge=0, le=10000)
    stop_on_failure: Optional[bool] = True
    step_by_step: Optional[bool] = False
    loop_count: Optional[int] = Field(1, ge=1, le=100)
    autoplay_next: Optional[bool] = False


class BrowserSettings(BaseModel):
    type: Optional[BrowserType] = BrowserType.CHROMIUM
    channel: Optional[str] = "Default (Bundled)"
    viewport_width: Optional[int] = Field(1920, ge=320, le=3840)
    viewport_height: Optional[int] = Field(1080, ge=240, le=2160)
    match_recorded_viewport: Optional[bool] = True
    device_preset: Optional[str] = "None (Custom)"
    device_scale_factor: Optional[float] = Field(1.0, ge=1.0, le=3.0)
    is_mobile: Optional[bool] = False
    has_touch: Optional[bool] = False
    color_scheme: Optional[ColorScheme] = ColorScheme.LIGHT


class TimeoutSettings(BaseModel):
    action_timeout_sec: Optional[int] = Field(30, ge=1, le=300)
    navigation_timeout_sec: Optional[int] = Field(30, ge=1, le=300)
    global_timeout_sec: Optional[int] = Field(0, ge=0, le=3600)
    wait_for_idle: Optional[bool] = True
    idle_timeout_ms: Optional[int] = Field(500, ge=100, le=5000)


class VerificationSettings(BaseModel):
    screenshot_compare_enabled: Optional[bool] = True
    pixel_threshold_percent: Optional[float] = Field(1.0, ge=0.0, le=100.0)
    comparison_method: Optional[ComparisonMethod] = ComparisonMethod.PIXEL_BY_PIXEL
    antialiasing_tolerance: Optional[int] = Field(2, ge=0, le=10)
    element_verify_enabled: Optional[bool] = True
    verify_element_text: Optional[bool] = True
    verify_element_state: Optional[bool] = True
    position_tolerance_px: Optional[int] = Field(10, ge=0, le=100)
    api_checkpoint_bandwidth: Optional[int] = Field(2, ge=0, le=10)


class PlaybackCaptureSettings(BaseModel):
    screenshot_each_step: Optional[bool] = True
    screenshot_on_failure: Optional[bool] = True
    full_page_screenshot: Optional[bool] = False
    screenshot_format: Optional[ScreenshotFormat] = ScreenshotFormat.PNG
    jpeg_quality: Optional[int] = Field(80, ge=10, le=100)
    hide_caret: Optional[bool] = True
    disable_animations: Optional[bool] = True
    record_video: Optional[bool] = False
    video_size_width: Optional[int] = Field(1280, ge=640, le=1920)
    video_size_height: Optional[int] = Field(720, ge=480, le=1080)
    save_trace: Optional[bool] = False
    trace_on_failure_only: Optional[bool] = True


class NetworkSettings(BaseModel):
    offline_mode: Optional[bool] = False
    throttle_preset: Optional[str] = "None"
    custom_download_speed: Optional[int] = Field(1000, ge=0, le=100000)
    custom_upload_speed: Optional[int] = Field(500, ge=0, le=100000)
    custom_latency_ms: Optional[int] = Field(100, ge=0, le=5000)
    ignore_https_errors: Optional[bool] = False
    proxy_enabled: Optional[bool] = False
    proxy_server: Optional[str] = ""
    proxy_bypass: Optional[str] = ""


class LocaleSettings(BaseModel):
    locale: Optional[str] = "System Default"
    timezone: Optional[str] = "System Default"
    geolocation_enabled: Optional[bool] = False
    geolocation_latitude: Optional[float] = Field(0.0, ge=-90.0, le=90.0)
    geolocation_longitude: Optional[float] = Field(0.0, ge=-180.0, le=180.0)
    geolocation_accuracy: Optional[float] = Field(100, ge=0, le=10000)


class PermissionsSettings(BaseModel):
    geolocation: Optional[PermissionState] = PermissionState.DEFAULT
    notifications: Optional[PermissionState] = PermissionState.DEFAULT
    camera: Optional[PermissionState] = PermissionState.DEFAULT
    microphone: Optional[PermissionState] = PermissionState.DEFAULT
    clipboard_read: Optional[PermissionState] = PermissionState.DEFAULT
    clipboard_write: Optional[PermissionState] = PermissionState.DEFAULT


class AuthenticationSettings(BaseModel):
    http_auth_enabled: Optional[bool] = False
    http_auth_username: Optional[str] = ""
    http_auth_password: Optional[str] = ""  # Only for updates, never returned
    storage_state_enabled: Optional[bool] = False
    storage_state_file: Optional[str] = ""
    save_session_after: Optional[bool] = False
    extra_headers_enabled: Optional[bool] = False
    extra_headers: Optional[str] = ""


class AccessibilitySettings(BaseModel):
    enabled: Optional[bool] = False
    wcag_level: Optional[WCAGLevel] = WCAGLevel.AA


class AdvancedPlaybackSettings(BaseModel):
    javascript_enabled: Optional[bool] = True
    bypass_csp: Optional[bool] = False
    service_workers: Optional[ServiceWorkerMode] = ServiceWorkerMode.ALLOW
    user_agent_override: Optional[bool] = False
    user_agent_string: Optional[str] = ""
    reduced_motion: Optional[str] = "No Preference"
    forced_colors: Optional[str] = "None"
    open_devtools: Optional[bool] = False


class PlaybackSettings(BaseModel):
    execution: Optional[ExecutionSettings] = None
    browser: Optional[BrowserSettings] = None
    timeouts: Optional[TimeoutSettings] = None
    verification: Optional[VerificationSettings] = None
    capture: Optional[PlaybackCaptureSettings] = None
    network: Optional[NetworkSettings] = None
    locale: Optional[LocaleSettings] = None
    permissions: Optional[PermissionsSettings] = None
    authentication: Optional[AuthenticationSettings] = None
    accessibility: Optional[AccessibilitySettings] = None
    advanced: Optional[AdvancedPlaybackSettings] = None


# ==================== RECORDING SETTINGS ====================

class RecordingSettings(BaseModel):
    captures_per_minute: Optional[int] = Field(60, ge=1, le=120)
    replay_speed_fps: Optional[int] = Field(1, ge=1, le=60)
    autoplay: Optional[bool] = False
    loop: Optional[bool] = True
    show_actions_panel: Optional[bool] = False
    run_mode: Optional[str] = "visible"
    browser_window_mode: Optional[str] = "maximised"
    default_url: Optional[str] = "https://www.google.com"
    record_browser: Optional[str] = "qtwebengine"
    console_capture_enabled: Optional[bool] = True
    network_capture_enabled: Optional[bool] = True
    environment_capture_enabled: Optional[bool] = True
    timing_capture_enabled: Optional[bool] = True


class CheckpointSettings(BaseModel):
    line_thickness: Optional[str] = "1"
    line_color: Optional[str] = "#ff0000"

    @validator('line_color')
    def validate_hex_color(cls, v):
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Color must be a valid hex color (e.g., #ff0000)')
        return v


class TestExecutionSettings(BaseModel):
    auto_generate_defect: Optional[bool] = True
    auto_generate_detailed_defects: Optional[bool] = True
    parallel_enabled: Optional[bool] = True
    parallel_count: Optional[int] = Field(2, ge=1, le=10)
    accessibility_enabled: Optional[bool] = True
    wcag_level: Optional[str] = "AA"


class ResponsivePanelSettings(BaseModel):
    devices: Optional[List[str]] = ["iPad Pro", "iPad Air", "iPad Mini"]
    resolutions: Optional[List[str]] = ["1920x1080", "1366x768", "1440x900"]


# ==================== AI SETTINGS ====================

class AISettings(BaseModel):
    enabled: Optional[bool] = False
    api_endpoint: Optional[str] = ""
    api_key: Optional[str] = ""  # Only for updates, never returned
    model: Optional[str] = "llama-3.1-8b-instant"


# ==================== INTEGRATION SETTINGS ====================

class JiraConfig(BaseModel):
    url: Optional[str] = ""
    username: Optional[str] = ""
    api_token: Optional[str] = ""  # Only for updates
    project_key: Optional[str] = ""
    issue_type: Optional[str] = "Bug"
    severity_field: Optional[str] = ""


class AzureDevOpsConfig(BaseModel):
    organization: Optional[str] = ""
    project: Optional[str] = ""
    pat: Optional[str] = ""  # Only for updates
    work_item_type: Optional[str] = "Bug"


class CustomIntegrationConfig(BaseModel):
    api_url: Optional[str] = ""
    auth_type: Optional[AuthType] = AuthType.BEARER
    api_token: Optional[str] = ""  # Only for updates
    headers: Optional[Dict[str, str]] = {}


class IntegrationSettings(BaseModel):
    type: Optional[IntegrationType] = IntegrationType.NONE
    auto_create_on_failure: Optional[bool] = True
    attach_screenshots: Optional[bool] = True
    max_screenshots: Optional[int] = Field(5, ge=1, le=20)
    jira: Optional[JiraConfig] = None
    azure_devops: Optional[AzureDevOpsConfig] = None
    custom: Optional[CustomIntegrationConfig] = None


# ==================== MAIN SETTINGS MODEL ====================

class UserSettingsUpdate(BaseModel):
    """Request model for updating user settings (partial updates supported)"""
    general: Optional[GeneralSettings] = None
    capture: Optional[CaptureSettings] = None
    performance: Optional[PerformanceSettings] = None
    advanced: Optional[AdvancedCaptureSettings] = None
    ui: Optional[UISettings] = None
    playback: Optional[PlaybackSettings] = None
    recording: Optional[RecordingSettings] = None
    checkpoints: Optional[CheckpointSettings] = None
    test_execution: Optional[TestExecutionSettings] = None
    responsive_panel: Optional[ResponsivePanelSettings] = None
    ai: Optional[AISettings] = None
    integration: Optional[IntegrationSettings] = None


class SettingsResetRequest(BaseModel):
    """Request model for resetting settings"""
    reset_all: Optional[bool] = False
    sections: Optional[List[str]] = None

    @validator('sections')
    def validate_sections(cls, v):
        valid_sections = [
            'general', 'capture', 'performance', 'advanced', 'ui',
            'playback', 'recording', 'checkpoints', 'test_execution',
            'responsive_panel', 'ai', 'integration'
        ]
        if v:
            for section in v:
                if section not in valid_sections:
                    raise ValueError(f'Invalid section: {section}')
        return v


class IntegrationTestRequest(BaseModel):
    """Request model for testing integration connection"""
    type: IntegrationType
    use_stored_credentials: Optional[bool] = False
    jira: Optional[JiraConfig] = None
    azure_devops: Optional[AzureDevOpsConfig] = None
    custom: Optional[CustomIntegrationConfig] = None
```

### Response Models

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class SettingsMetadata(BaseModel):
    last_updated: datetime


class UserSettingsResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    metadata: SettingsMetadata


class SettingsUpdateResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: Dict[str, Any]


class IntegrationTestResult(BaseModel):
    type: str
    connected: bool
    details: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, str]] = None


class IntegrationTestResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: IntegrationTestResult
```

---

## Implementation Notes

### 1. Deep Merge Strategy

When updating settings, use a deep merge strategy to preserve unspecified nested values:

```python
def deep_merge(base: dict, updates: dict) -> dict:
    """Recursively merge updates into base dict."""
    result = base.copy()
    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result
```

### 2. Credential Encryption

All sensitive credentials (API tokens, passwords) must be encrypted at rest:

```python
from cryptography.fernet import Fernet

def encrypt_credential(credential: str, key: bytes) -> bytes:
    f = Fernet(key)
    return f.encrypt(credential.encode())

def decrypt_credential(encrypted: bytes, key: bytes) -> str:
    f = Fernet(key)
    return f.decrypt(encrypted).decode()
```

### 3. Settings Initialization on User Creation

When a new user is created, initialize their settings with defaults:

```python
async def create_user_settings(user_id: UUID):
    """Create default settings for a new user."""
    settings = UserSettings(
        user_id=user_id,
        general_settings=DEFAULT_GENERAL_SETTINGS,
        capture_settings=DEFAULT_CAPTURE_SETTINGS,
        # ... other defaults
    )
    db.add(settings)
    await db.commit()
```

### 4. Auth-Aware Client Integration

The desktop client should switch between local and server storage based on auth state:

```python
class SettingsManager:
    def get(self, key: str, default=None):
        if self._auth_service.is_logged_in:
            return self._get_from_server(key, default)
        else:
            return self._get_from_local(key, default)

    def save_settings(self):
        if self._auth_service.is_logged_in:
            self._sync_to_server()
        else:
            self._save_to_local_file()
```

### 5. Settings Sync on Login/Logout

```python
def on_user_logged_in(self):
    """Fetch settings from server and apply."""
    server_settings = self._fetch_settings_from_server()
    self._apply_settings(server_settings)
    self.settings_loaded.emit()

def on_user_logged_out(self):
    """Switch back to local settings."""
    local_settings = self._load_from_local_file()
    self._apply_settings(local_settings)
    self.settings_loaded.emit()
```

---

## Settings Categories Summary

| Category | Description | Key Settings |
|----------|-------------|--------------|
| **General** | QA Panel behavior | Auto-open, indicators, dock position |
| **Capture** | Event/screenshot capture | Max events, auto-screenshot triggers |
| **Performance** | Memory & rendering | Virtual scrolling, batch sizes |
| **UI** | Appearance | Theme, font size, compact mode |
| **Playback** | Test execution | Browser, timeouts, verification |
| **Recording** | Capture settings | FPS, browser selection, captures |
| **Test Execution** | Run configuration | Parallel, defect generation |
| **AI** | LLM integration | Endpoint, model, API key |
| **Integration** | External tools | Jira, Azure DevOps, custom |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid settings value |
| `NOT_FOUND` | 404 | Settings not found |
| `INTEGRATION_ERROR` | 400 | Integration connection failed |
| `ENCRYPTION_ERROR` | 500 | Credential encryption failed |

---

## Security Considerations

1. **Never return plaintext credentials** - Only indicate presence with `has_api_token: true`
2. **Encrypt at rest** - All API tokens and passwords encrypted in database
3. **Rate limiting** - Limit settings update frequency (e.g., 10 requests/minute)
4. **Audit logging** - Log all settings changes for security audit
5. **Input validation** - Validate all settings against expected types and ranges
6. **HTTPS only** - All API communication over TLS

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Testr Team | Initial specification |
