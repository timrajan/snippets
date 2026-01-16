Here's the curl to create a test case under the "test" folder:

  curl -X POST "http://localhost:8000/api/v1/test-cases" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMTgwNjZhZi1iZDYwLTQ2MzktYTE0NS00MGUxZTM2YWFkN2EiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0ci5sb2NhbCIsImV4cCI6MTc2ODU5NjUxNSwidHlwZSI6ImFjY2VzcyJ9.hp61fWQuFuM8rfbdIW4F56OZROIuoZAo-du84HuoKOs" \
    -d '{
      "test_plan_id": "daea0da6-e37f-418c-8b96-6ccfb310cf07",
      "folder_id": "3ea41c71-5c50-45f4-9ce9-36e90a3285ae",
      "name": "My First Test Case"
    }'

  Single line for Windows:

  curl -X POST "http://localhost:8000/api/v1/test-cases" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMTgwNjZhZi1iZDYwLTQ2MzktYTE0NS00MGUxZTM2YWFkN2EiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0ci5sb2NhbCIsImV4cCI6MTc2ODU5NjUxNSwidHlwZSI6ImFjY2VzcyJ9.hp61fWQuFuM8rfbdIW4F56OZROIuoZAo-du84HuoKOs" -d "{\"test_plan_id\": \"daea0da6-e37f-418c-8b96-6ccfb310cf07\", \"folder_id\": \"3ea41c71-5c50-45f4-9ce9-36e90a3285ae\", \"name\": \"My First Test Case\"}"

  Required fields:
  - test_plan_id - the test plan UUID
  - name - test case name

  Optional fields:
  - folder_id - folder UUID (null for root level)
  - description - description text
  - priority - "Low", "Medium", "High", "Critical" (default: Medium)
  - status - "Active", "Inactive", "Draft", "Deprecated" (default: Draft)
  - base_url - base URL for test
  - browser - "chromium", "firefox", "webkit" (default: chromium)
  - tags - array of strings
