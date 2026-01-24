These GET endpoints already exist! Looking at the router I read earlier:

  Existing Endpoints
                                          
  1. GET /api/v1/reports/test-case-results/{result_id}/checkpoints (Lines 300-312)
  @router.get("/test-case-results/{result_id}/checkpoints", response_model=List[CheckpointResultResponse])                                                                                                                                                       def get_test_case_checkpoints(
      result_id: UUID,                                                                                                                                                                                                                                         
      db: Session = Depends(get_db),     
      current_user: User = Depends(get_current_user)
  ):
      """Get all checkpoints for a test case result."""
      result = get_test_case_result(db, result_id, current_user.id)
      if not result:
          raise HTTPException(status_code=404, detail="Test case result not found")

      checkpoints = get_checkpoints_by_test_case(db, result_id)
      return [CheckpointResultResponse.model_validate(c) for c in checkpoints]

  2. GET /api/v1/reports/test-case-results/{result_id}/environment (Lines 353-367)
  @router.get("/test-case-results/{result_id}/environment", response_model=EnvironmentInfoResponse)
  def get_test_case_environment(
      result_id: UUID,
      db: Session = Depends(get_db),
      current_user: User = Depends(get_current_user)
  ):
      """Get environment info for a test case result."""
      result = get_test_case_result(db, result_id, current_user.id)
      if not result:
          raise HTTPException(status_code=404, detail="Test case result not found")

      env = get_environment_info(db, result_id)
      if not env:
          raise HTTPException(status_code=404, detail="Environment info not found")
      return env

  Response Schemas

  CheckpointResultResponse:
  {
    "id": "uuid",
    "step_result_id": "uuid",
    "test_case_result_id": "uuid",
    "checkpoint_name": "string",
    "checkpoint_type": "element|screenshot|api|accessibility|custom",
    "selector": "string",
    "element_tag": "string",
    "element_text": "string",
    "property_name": "string",
    "operator": "string",
    "expected_value": "string",
    "actual_value": "string",
    "passed": true,
    "error_message": "string",
    "baseline_screenshot_url": "string",
    "actual_screenshot_url": "string",
    "diff_screenshot_url": "string",
    "similarity_score": 0.95,
    "verified_at": "2024-01-24T15:30:00Z",
    "created_at": "2024-01-24T15:30:00Z"
  }

  EnvironmentInfoResponse:
  {
    "id": "uuid",
    "test_case_result_id": "uuid",
    "browser_name": "Chrome",
    "browser_version": "120.0.0",
    "user_agent": "Mozilla/5.0...",
    "os_name": "Windows",
    "os_version": "11",
    "os_architecture": "x64",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "device_pixel_ratio": 1.0,
    "screen_width": 1920,
    "screen_height": 1080,
    "language": "en-US",
    "timezone": "America/New_York",
    "is_online": true,
    "app_version": "1.0.0",
    "custom_properties": {},
    "created_at": "2024-01-24T15:30:00Z"
  }

  The client should be able to call these endpoints. Is the client getting errors when trying to fetch this data?
