Settings API Documentation
                                                                                                                                                                                                                                                               
  Base URL: http://localhost:8000/api/v1/settings
  Authentication: Bearer Token (JWT) required for all endpoints

  ---
  1. Get All User Settings

  Endpoint: GET /api/v1/settings

  Description: Retrieves all settings for the authenticated user. Returns default values if no settings exist.

  cURL:
  curl -X GET "http://localhost:8000/api/v1/settings" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"

  Response (200 OK):
  {
    "general": {
      "theme": "system",
      "language": "en",
      "date_format": "MM/DD/YYYY",
      "time_format": "12h",
      "auto_save": true,
      "notifications_enabled": true
    },
    "capture": {
      "screenshot_quality": 80,
      "screenshot_format": "png",
      "capture_console_logs": true,
      "capture_network_requests": true,
      "capture_performance_metrics": false,
      "highlight_elements": true,
      "mask_sensitive_data": false
    },
    "performance": {
      "max_concurrent_tests": 5,
      "default_timeout_ms": 30000,
      "retry_failed_steps": true,
      "max_retries": 3,
      "parallel_execution": false
    },
    "playback": {
      "default_speed": 1.0,
      "pause_on_failure": true,
      "take_screenshots_on_failure": true,
      "continue_on_error": false,
      "headless_mode": false,
      "default_viewport_width": 1920,
      "default_viewport_height": 1080
    },
    "recording": {
      "auto_detect_assertions": true,
      "record_hover_events": false,
      "record_scroll_events": true,
      "smart_wait_enabled": true,
      "default_wait_timeout_ms": 5000
    },
    "ai": {
      "ai_enabled": true,
      "auto_healing_enabled": true,
      "smart_locators_enabled": true,
      "natural_language_enabled": false,
      "ai_model": "default",
      "confidence_threshold": 0.8
    },
    "integrations": {
      "jira": null,
      "azure_devops": null,
      "custom_integrations": []
    }
  }

  ---
  2. Update User Settings

  Endpoint: PUT /api/v1/settings

  Description: Updates user settings. Only include sections you want to update (partial updates supported).

  cURL (Update General Settings):
  curl -X PUT "http://localhost:8000/api/v1/settings" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "general": {
        "theme": "dark",
        "language": "en",
        "notifications_enabled": false
      }
    }'

  cURL (Update Multiple Sections):
  curl -X PUT "http://localhost:8000/api/v1/settings" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "general": {
        "theme": "dark",
        "auto_save": true
      },
      "playback": {
        "default_speed": 1.5,
        "headless_mode": true,
        "default_viewport_width": 1280,
        "default_viewport_height": 720
      },
      "performance": {
        "max_concurrent_tests": 10,
        "parallel_execution": true
      }
    }'

  Response (200 OK):
  {
    "message": "Settings updated successfully",
    "settings": { /* full settings object */ }
  }

  ---
  3. Reset Settings to Defaults

  Endpoint: POST /api/v1/settings/reset

  Description: Resets all settings to default values. Optionally reset only specific sections.

  cURL (Reset All):
  curl -X POST "http://localhost:8000/api/v1/settings/reset" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}'

  cURL (Reset Specific Sections):
  curl -X POST "http://localhost:8000/api/v1/settings/reset" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "sections": ["general", "playback"]
    }'

  Response (200 OK):
  {
    "message": "Settings reset successfully",
    "sections_reset": ["general", "playback"],
    "settings": { /* full settings object */ }
  }

  ---
  4. Get Integration Settings

  Endpoint: GET /api/v1/settings/integrations

  Description: Retrieves integration settings (Jira, Azure DevOps, custom integrations).

  cURL:
  curl -X GET "http://localhost:8000/api/v1/settings/integrations" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"

  Response (200 OK):
  {
    "jira": {
      "enabled": true,
      "server_url": "https://company.atlassian.net",
      "project_key": "TEST",
      "default_issue_type": "Bug",
      "auto_create_defects": false
    },
    "azure_devops": null,
    "custom_integrations": []
  }

  ---
  5. Update Integration Settings

  Endpoint: PUT /api/v1/settings/integrations

  Description: Updates integration settings including credentials.

  cURL (Configure Jira):
  curl -X PUT "http://localhost:8000/api/v1/settings/integrations" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "jira": {
        "enabled": true,
        "server_url": "https://company.atlassian.net",
        "username": "user@company.com",
        "api_token": "your-jira-api-token",
        "project_key": "TEST",
        "default_issue_type": "Bug",
        "auto_create_defects": true
      }
    }'

  cURL (Configure Azure DevOps):
  curl -X PUT "http://localhost:8000/api/v1/settings/integrations" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "azure_devops": {
        "enabled": true,
        "organization_url": "https://dev.azure.com/company",
        "project_name": "TestProject",
        "personal_access_token": "your-pat-token",
        "default_work_item_type": "Bug",
        "auto_create_defects": false
      }
    }'

  cURL (Add Custom Integration):
  curl -X PUT "http://localhost:8000/api/v1/settings/integrations" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "custom_integrations": [
        {
          "name": "Slack Notifications",
          "type": "webhook",
          "enabled": true,
          "webhook_url": "https://hooks.slack.com/services/xxx/yyy/zzz",
          "events": ["test_completed", "test_failed"]
        }
      ]
    }'

  Response (200 OK):
  {
    "message": "Integration settings updated successfully",
    "integrations": { /* integration settings object */ }
  }

  ---
  6. Test Integration Connection

  Endpoint: POST /api/v1/settings/integrations/test

  Description: Tests connection to an integration service.

  cURL (Test Jira):
  curl -X POST "http://localhost:8000/api/v1/settings/integrations/test" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "integration_type": "jira"
    }'

  cURL (Test Azure DevOps):
  curl -X POST "http://localhost:8000/api/v1/settings/integrations/test" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "integration_type": "azure_devops"
    }'

  Response (200 OK):
  {
    "success": true,
    "message": "Connection successful",
    "integration_type": "jira"
  }

  Response (400 Bad Request - Connection Failed):
  {
    "detail": "Connection test failed: Invalid credentials"
  }

  ---
  7. Delete Integration

  Endpoint: DELETE /api/v1/settings/integrations/{integration_type}

  Description: Removes an integration configuration and its credentials.

  cURL (Delete Jira):
  curl -X DELETE "http://localhost:8000/api/v1/settings/integrations/jira" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"

  cURL (Delete Azure DevOps):
  curl -X DELETE "http://localhost:8000/api/v1/settings/integrations/azure_devops" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"

  Response (200 OK):
  {
    "message": "Integration deleted successfully",
    "integration_type": "jira"
  }

  ---
  8. Update AI Settings

  Endpoint: PUT /api/v1/settings/ai

  Description: Updates AI-specific settings.

  cURL:
  curl -X PUT "http://localhost:8000/api/v1/settings/ai" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "ai_enabled": true,
      "auto_healing_enabled": true,
      "smart_locators_enabled": true,
      "natural_language_enabled": true,
      "ai_model": "gpt-4",
      "confidence_threshold": 0.85
    }'

  Response (200 OK):
  {
    "message": "AI settings updated successfully",
    "ai_settings": {
      "ai_enabled": true,
      "auto_healing_enabled": true,
      "smart_locators_enabled": true,
      "natural_language_enabled": true,
      "ai_model": "gpt-4",
      "confidence_threshold": 0.85
    }
  }

  ---
  Settings Schema Reference

  GeneralSettings
  ┌───────────────────────┬─────────┬──────────────┬────────────────────────────────────┐
  │         Field         │  Type   │   Default    │            Description             │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ theme                 │ string  │ "system"     │ Options: "light", "dark", "system" │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ language              │ string  │ "en"         │ Language code                      │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ date_format           │ string  │ "MM/DD/YYYY" │ Date display format                │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ time_format           │ string  │ "12h"        │ Options: "12h", "24h"              │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ auto_save             │ boolean │ true         │ Auto-save changes                  │
  ├───────────────────────┼─────────┼──────────────┼────────────────────────────────────┤
  │ notifications_enabled │ boolean │ true         │ Enable notifications               │
  └───────────────────────┴─────────┴──────────────┴────────────────────────────────────┘
  CaptureSettings
  ┌─────────────────────────────┬─────────┬─────────┬─────────────────────────────────┐
  │            Field            │  Type   │ Default │           Description           │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ screenshot_quality          │ integer │ 80      │ Quality 1-100                   │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ screenshot_format           │ string  │ "png"   │ Options: "png", "jpeg", "webp"  │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ capture_console_logs        │ boolean │ true    │ Capture browser console         │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ capture_network_requests    │ boolean │ true    │ Capture network activity        │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ capture_performance_metrics │ boolean │ false   │ Capture performance data        │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ highlight_elements          │ boolean │ true    │ Highlight during recording      │
  ├─────────────────────────────┼─────────┼─────────┼─────────────────────────────────┤
  │ mask_sensitive_data         │ boolean │ false   │ Mask passwords/sensitive fields │
  └─────────────────────────────┴─────────┴─────────┴─────────────────────────────────┘
  PlaybackSettings
  ┌─────────────────────────────┬─────────┬─────────┬───────────────────────────┐
  │            Field            │  Type   │ Default │        Description        │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ default_speed               │ float   │ 1.0     │ Playback speed multiplier │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ pause_on_failure            │ boolean │ true    │ Pause when step fails     │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ take_screenshots_on_failure │ boolean │ true    │ Screenshot on failure     │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ continue_on_error           │ boolean │ false   │ Continue after errors     │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ headless_mode               │ boolean │ false   │ Run browser headless      │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ default_viewport_width      │ integer │ 1920    │ Default viewport width    │
  ├─────────────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ default_viewport_height     │ integer │ 1080    │ Default viewport height   │
  └─────────────────────────────┴─────────┴─────────┴───────────────────────────┘
  PerformanceSettings
  ┌──────────────────────┬─────────┬─────────┬───────────────────────────┐
  │        Field         │  Type   │ Default │        Description        │
  ├──────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ max_concurrent_tests │ integer │ 5       │ Max parallel tests        │
  ├──────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ default_timeout_ms   │ integer │ 30000   │ Default timeout (ms)      │
  ├──────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ retry_failed_steps   │ boolean │ true    │ Retry failed steps        │
  ├──────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ max_retries          │ integer │ 3       │ Max retry attempts        │
  ├──────────────────────┼─────────┼─────────┼───────────────────────────┤
  │ parallel_execution   │ boolean │ false   │ Enable parallel execution │
  └──────────────────────┴─────────┴─────────┴───────────────────────────┘
  AISettings
  ┌──────────────────────────┬─────────┬───────────┬────────────────────────────────┐
  │          Field           │  Type   │  Default  │          Description           │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ ai_enabled               │ boolean │ true      │ Enable AI features             │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ auto_healing_enabled     │ boolean │ true      │ Auto-heal broken locators      │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ smart_locators_enabled   │ boolean │ true      │ Use smart locator strategies   │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ natural_language_enabled │ boolean │ false     │ Natural language test creation │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ ai_model                 │ string  │ "default" │ AI model to use                │
  ├──────────────────────────┼─────────┼───────────┼────────────────────────────────┤
  │ confidence_threshold     │ float   │ 0.8       │ Min confidence for AI actions  │
  └──────────────────────────┴─────────┴───────────┴────────────────────────────────┘
  ---
  Error Responses

  All endpoints may return:

  401 Unauthorized:
  {
    "detail": "Not authenticated"
  }

  404 Not Found:
  {
    "detail": "Resource not found"
  }

  422 Validation Error:
  {
    "detail": [
      {
        "loc": ["body", "general", "theme"],
        "msg": "value is not a valid enumeration member",
        "type": "type_error.enum"
      }
    ]
  }
