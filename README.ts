  UI TEAM - PROMPT: SINGLE-SESSION INTEGRATION

  Overview                                                                                                                                                                                                                                                        
  The API now implements single-session enforcement. Each user can only have ONE active session at a time. When a user logs in from a new device/browser, all previous sessions are automatically invalidated.                                                 
  
  ---
  WHAT CHANGED IN THE API

  1. Login Response Now Includes session_id

  {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 3600,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",  // NEW - MUST STORE THIS
    "user": {...},
    "workspaces": [...],
    "teams": [...],
    "login_mode": "personal"
  }

  2. Session Validation Happens on Every API Call

  - The session_id is embedded in the JWT token
  - Every authenticated API call validates the session is still active
  - If session was invalidated (user logged in elsewhere), API returns 401

  3. New Endpoints Available
  ┌────────┬───────────────────────────────┬─────────────────────────────────┐
  │ Method │           Endpoint            │           Description           │
  ├────────┼───────────────────────────────┼─────────────────────────────────┤
  │ POST   │ /api/v1/auth/validate-session │ Check if session is still valid │
  ├────────┼───────────────────────────────┼─────────────────────────────────┤
  │ GET    │ /api/v1/auth/session-info     │ Get current session details     │
  ├────────┼───────────────────────────────┼─────────────────────────────────┤
  │ GET    │ /api/v1/auth/session-history  │ Get login history               │
  └────────┴───────────────────────────────┴─────────────────────────────────┘
  ---
  REQUIRED UI CHANGES

  1. Store session_id After Login

  // After successful login
  const loginResponse = await api.post('/auth/login', credentials);

  // Store these values
  localStorage.setItem('access_token', loginResponse.access_token);
  localStorage.setItem('refresh_token', loginResponse.refresh_token);
  localStorage.setItem('session_id', loginResponse.session_id);  // NEW - IMPORTANT!

  2. Implement Session Validation (Periodic Check)

  Call /validate-session periodically (every 30-60 seconds) to detect if user was logged out from another location:

  // IMPORTANT: This is a POST request, NOT GET
  async function validateSession() {
    const sessionId = localStorage.getItem('session_id');
    const token = localStorage.getItem('access_token');

    if (!sessionId || !token) return;

    try {
      const response = await fetch('/api/v1/auth/validate-session', {
        method: 'POST',  // MUST BE POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId  // Send the stored session_id
        })
      });

      const data = await response.json();

      if (!data.valid) {
        // Session is no longer valid
        handleSessionInvalidated(data.message);
      }
    } catch (error) {
      console.error('Session validation failed:', error);
    }
  }

  // Run every 60 seconds
  setInterval(validateSession, 60000);

  3. Handle Session Invalidation

  When session is invalidated, show user-friendly message and redirect to login:

  function handleSessionInvalidated(message) {
    // Clear stored credentials
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_id');

    // Show message based on reason
    // Possible messages:
    // - "You have been logged in from another location"
    // - "Your session has expired"
    // - "You logged out from this session"

    // Show notification/modal to user
    showNotification({
      type: 'warning',
      title: 'Session Ended',
      message: message || 'Your session has ended. Please login again.'
    });

    // Redirect to login page
    window.location.href = '/login';
  }

  4. Handle 401 Errors Globally

  Update your API interceptor to handle 401 with session-specific messages:

  // Axios interceptor example
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        const detail = error.response.data?.detail || '';

        // Check for session-specific errors
        if (detail.includes('Session expired') ||
            detail.includes('logged in from another location')) {
          handleSessionInvalidated(detail);
          return Promise.reject(error);
        }

        // Other 401 errors (invalid token, etc.)
        handleSessionInvalidated('Authentication failed');
      }
      return Promise.reject(error);
    }
  );

  5. Update Logout to Clear Session

  async function logout(logoutAllDevices = false) {
    const token = localStorage.getItem('access_token');

    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logout_all_devices: logoutAllDevices  // true = logout from all devices
        })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Always clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_id');

    window.location.href = '/login';
  }

  ---
  VALIDATE-SESSION ENDPOINT DETAILS

  Request:
  POST /api/v1/auth/validate-session
  Content-Type: application/json
  Authorization: Bearer <access_token>

  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }

  Response (Valid Session):
  {
    "valid": true,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Session is active",
    "last_activity": "2026-01-26T12:34:56.789Z",
    "expires_at": "2026-01-26T20:34:56.789Z"
  }

  Response (Invalid Session):
  {
    "valid": false,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "You have been logged in from another location"
  }

  ---
  TESTING CHECKLIST

  - Login stores session_id in localStorage
  - /validate-session called with POST method (not GET)
  - Periodic session validation runs every 60 seconds
  - User sees friendly message when logged out from another location
  - 401 errors are handled and user redirected to login
  - Logout clears session_id from localStorage
  - "Logout from all devices" option works

  ---
  COMMON MISTAKES TO AVOID

  1. Using GET instead of POST for /validate-session - Returns 405 error
  2. Not storing session_id - Can't validate session later
  3. Not sending session_id in request body - Validation will fail
  4. Not handling 401 globally - User gets stuck on broken pages

  ---
  Questions? Share any error responses you receive and I'll help debug.
