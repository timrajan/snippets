 curl -X POST "http://localhost:8000/api/v1/folders" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMTgwNjZhZi1iZDYwLTQ2MzktYTE0NS00MGUxZTM2YWFkN2EiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0ci5sb2NhbCIsImV4cCI6MTc2ODU5NDU1NCwidHlwZSI6ImFjY2VzcyJ9.DO_yajaS8k0VItLKNE2TNdgP1CL43-Qiz6UvmFxGA70" \
    -d "{\"test_plan_id\": \"daea0da6-e37f-418c-8b96-6ccfb310cf07\", \"name\": \"api\"}"

  Or single line for Windows:

  curl -X POST "http://localhost:8000/api/v1/folders" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMTgwNjZhZi1iZDYwLTQ2MzktYTE0NS00MGUxZTM2YWFkN2EiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0ci5sb2NhbCIsImV4cCI6MTc2ODU5NDU1NCwidHlwZSI6ImFjY2VzcyJ9.DO_yajaS8k0VItLKNE2TNdgP1CL43-Qiz6UvmFxGA70" -d "{\"test_plan_id\": \"daea0da6-e37f-418c-8b96-6ccfb310cf07\", \"name\": \"api\"}"
