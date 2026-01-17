Here are the cURL commands for the authentication endpoints:                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                 1. Register (Create Account)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  curl -X POST http://localhost:8000/api/v1/auth/register \                                                                                                                                                                                                        -H "Content-Type: application/json" \
    -d '{
      "username": "john_doe",
      "email": "john.doe@example.com",
      "password": "SecurePassword123!",
      "full_name": "John Doe"
    }'

  Response (201 Created):
  {
    "id": "uuid-here",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_admin": false,
    "is_active": true,
    "created_at": "2026-01-17T10:00:00Z",
    "last_login_at": null
  }

  ---
  2. Login

  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "john_doe",
      "password": "SecurePassword123!"
    }'

  Response (200 OK):
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  }

  ---
  3. Logout

  curl -X POST http://localhost:8000/api/v1/auth/logout \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

  Response (200 OK):
  {
    "message": "Successfully logged out",
    "user_id": "uuid-here"
  }

  ---
  4. Refresh Token

  curl -X POST http://localhost:8000/api/v1/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{
      "refresh_token": "YOUR_REFRESH_TOKEN"
    }'

  ---
  5. Get Current User Info

  curl -X GET http://localhost:8000/api/v1/auth/me \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

  ---
  Password Requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*(),.?":{}|<>)
