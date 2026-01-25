# Payment Flow API Documentation

Complete API reference for Organization, Subscription, Team Management, and Authentication endpoints for the Testr Web Portal.

**Base URL:** `https://api.testr.io` (production) | `http://localhost:8000` (development)

**API Version:** v1

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Organization & Subscription](#2-organization--subscription)
3. [Team Management](#3-team-management)
4. [Organization Admin Management](#4-organization-admin-management)
5. [Billing Admin Management](#5-billing-admin-management)
6. [Payment Webhooks](#6-payment-webhooks)
7. [Data Models](#7-data-models)
8. [Error Codes](#8-error-codes)
9. [Flow Diagrams](#9-flow-diagrams)

---

## 1. Authentication

All endpoints (except webhooks) require JWT Bearer token authentication.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Lifecycle

| Token Type | Expiry | Purpose |
|------------|--------|---------|
| Access Token | 1 hour | API authentication |
| Refresh Token | 8 hours | Get new access token |

---

### 1.1 Register User

Create a new user account.

```
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

**Response:** `201 Created`

```json
{
  "message": "Registration successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": null,
    "email": "user@example.com",
    "full_name": null,
    "is_admin": false,
    "is_active": true,
    "is_paid": false,
    "email_verified": false,
    "must_change_password": false,
    "created_at": "2024-01-15T10:30:00Z",
    "last_login_at": null
  },
  "workspace": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Personal Workspace",
    "type": "PERSONAL",
    "max_test_cases": 5,
    "current_test_cases": 0
  }
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| 400 | Email already registered |
| 422 | Password doesn't meet requirements |

---

### 1.2 Login

Authenticate and get tokens.

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "is_paid": true,
    "must_change_password": false,
    "email_verified": true
  },
  "workspaces": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Personal Workspace",
      "type": "PERSONAL",
      "max_test_cases": 5,
      "current_test_cases": 2
    }
  ],
  "teams": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Engineering Team",
      "organization_id": "880e8400-e29b-41d4-a716-446655440003",
      "organization_name": "Acme Corp",
      "role": "member",
      "workspace_id": "990e8400-e29b-41d4-a716-446655440004"
    }
  ],
  "login_mode": "team"
}
```

**Login Modes:**

| Mode | Description | Next Step |
|------|-------------|-----------|
| `personal` | User has no team memberships | Use personal workspace |
| `team` | User has team memberships | Call `/select-workspace` |

**Error Responses:**

| Status | Detail |
|--------|--------|
| 401 | Incorrect email or password |
| 403 | User account is inactive |

---

### 1.3 Select Workspace (Team Users)

After login with `login_mode='team'`, select which team workspace to work in.

```
POST /api/v1/auth/select-workspace
```

**Request Body:**

```json
{
  "workspace_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "workspace_id": "770e8400-e29b-41d4-a716-446655440002",
  "workspace_name": "Engineering Team",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "organization_name": "Acme Corp"
}
```

**JWT Claims (embedded in new tokens):**

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "workspace_id": "770e8400-e29b-41d4-a716-446655440002",
  "workspace_type": "TEAM",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "role": "member"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| 403 | You are not a member of this team |
| 403 | This team is no longer active |
| 402 | Subscription expired |
| 404 | Team not found |

---

### 1.4 Refresh Token

Get new access token using refresh token.

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Security Features:**
- Old refresh token is revoked (one-time use)
- Subscription status is validated for team tokens
- Workspace context is preserved in new tokens

**Error Responses:**

| Status | Detail |
|--------|--------|
| 401 | Invalid refresh token |
| 401 | Refresh token has been revoked or expired |
| 402 | Subscription expired (for team workspace tokens) |

---

### 1.5 Logout

Revoke refresh tokens.

```
POST /api/v1/auth/logout
```

**Request Body (optional):**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "message": "Successfully logged out",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tokens_revoked": 1
}
```

**Behavior:**
- With `refresh_token`: Revokes only that specific token
- Without `refresh_token`: Revokes ALL user's tokens (logout from all devices)

---

### 1.6 Get Current User

Get authenticated user information.

```
GET /api/v1/auth/me
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_admin": false,
  "is_active": true,
  "is_paid": true,
  "email_verified": true,
  "must_change_password": false,
  "created_at": "2024-01-15T10:30:00Z",
  "last_login_at": "2024-01-20T08:15:00Z"
}
```

---

### 1.7 Change Password

Change the current user's password.

```
POST /api/v1/auth/change-password
```

**Request Body:**

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePass456!"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password changed successfully. Please login again.",
  "must_change_password": false
}
```

**Side Effects:**
- Password is updated
- `must_change_password` is set to `false`
- All existing refresh tokens are revoked

**Error Responses:**

| Status | Detail |
|--------|--------|
| 401 | Current password is incorrect |
| 400 | New password must be different from current password |

---

### 1.8 Forgot Password - Verify Email

Step 1 of password reset flow.

```
POST /api/v1/auth/forgot-password/verify-email
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

```json
{
  "message": "Email verified. You can now reset your password.",
  "email": "user@example.com"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| 404 | Email not found |
| 403 | Account is inactive |

---

### 1.9 Forgot Password - Reset

Step 2 of password reset flow.

```
POST /api/v1/auth/forgot-password/reset
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "new_password": "NewSecurePass456!"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## 2. Organization & Subscription

### 2.1 Get Subscription Details

Get subscription details for an organization.

```
GET /api/v1/subscriptions/organization/{organization_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| organization_id | UUID | Organization UUID |

**Response:** `200 OK`

```json
{
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "organization_name": "Acme Corp",
  "max_licenses": 50,
  "used_licenses": 23,
  "available_licenses": 27,
  "is_active": true,
  "plan_type": "professional",
  "billing_cycle": "monthly",
  "amount": 99.00,
  "currency": "USD",
  "started_at": "2024-01-01T00:00:00Z",
  "next_billing_date": "2024-02-01",
  "cancelled_at": null
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| 404 | Organization not found |
| 404 | Subscription not found |

---

### 2.2 Get Subscription Status

Get detailed subscription status including days remaining.

```
GET /api/v1/subscriptions/organization/{organization_id}/status
```

**Response:** `200 OK`

```json
{
  "status": "active",
  "days_remaining": 25,
  "is_active": true,
  "max_licenses": 50,
  "used_licenses": 23,
  "available_licenses": 27,
  "next_billing_date": "2024-02-01",
  "plan_type": "professional"
}
```

**Possible Status Values:**

| Status | Description |
|--------|-------------|
| `active` | Subscription is active and current |
| `expiring_soon` | Less than 7 days until expiration |
| `expired` | Subscription has expired |
| `cancelled` | Subscription was cancelled |
| `past_due` | Payment is past due |

---

### 2.3 Update License Count

Update maximum license count for subscription.

```
PUT /api/v1/subscriptions/organization/{organization_id}/licenses
```

**Permissions:** Billing Admin only

**Request Body:**

```json
{
  "max_licenses": 75
}
```

**Response:** `200 OK`

```json
{
  "status": "updated",
  "old_max_licenses": 50,
  "new_max_licenses": 75,
  "used_licenses": 23
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| 403 | Only billing admins can update license count |
| 400 | Cannot reduce licenses below current usage (23) |

---

### 2.4 Reactivate Subscription

Reactivate subscription after payment failure.

```
POST /api/v1/subscriptions/organization/{organization_id}/reactivate
```

**Permissions:** Billing Admin only

**Response:** `200 OK`

```json
{
  "status": "reactivated",
  "subscription_id": "990e8400-e29b-41d4-a716-446655440004",
  "affected_users": 23
}
```

**Side Effects:**
- `subscription.is_active = TRUE`
- `subscription.expired_at = NULL`
- `subscription.cancelled_at = NULL`
- All team members: `user.is_paid = TRUE`

**Error Responses:**

| Status | Detail |
|--------|--------|
| 403 | Only billing admins can reactivate subscriptions |
| 400 | Subscription is already active |

---

### 2.5 Get Current User's Subscriptions

Get subscription info for all organizations where user is admin.

```
GET /api/v1/subscriptions/user/current
```

**Response:** `200 OK`

```json
{
  "subscriptions": [
    {
      "organization_id": "880e8400-e29b-41d4-a716-446655440003",
      "organization_name": "Acme Corp",
      "role": "billing_admin",
      "max_licenses": 50,
      "used_licenses": 23,
      "is_active": true,
      "plan_type": "professional"
    },
    {
      "organization_id": "990e8400-e29b-41d4-a716-446655440004",
      "organization_name": "Beta Inc",
      "role": "org_admin",
      "max_licenses": 25,
      "used_licenses": 10,
      "is_active": true,
      "plan_type": "starter"
    }
  ]
}
```

---

## 3. Team Management

### 3.1 Create Team

Create a new team within an organization.

```
POST /api/v1/teams
```

**Permissions:** Organization Admin

**Request Body:**

```json
{
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "QA Team",
  "description": "Quality Assurance team"
}
```

**Response:** `201 Created`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "QA Team",
  "description": "Quality Assurance team",
  "workspace_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "is_active": true,
  "member_count": 0,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 3.2 Get Team

Get team by ID.

```
GET /api/v1/teams/{team_id}
```

**Response:** `200 OK`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "QA Team",
  "description": "Quality Assurance team",
  "workspace_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "is_active": true,
  "member_count": 5,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 3.3 List Teams in Organization

Get all teams in an organization.

```
GET /api/v1/teams/organization/{organization_id}
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| include_inactive | boolean | false | Include inactive teams |

**Response:** `200 OK`

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "organization_id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "QA Team",
    "description": "Quality Assurance team",
    "workspace_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "is_active": true,
    "member_count": 5,
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z"
  },
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "organization_id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Dev Team",
    "description": "Development team",
    "workspace_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "is_active": true,
    "member_count": 12,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-18T15:30:00Z"
  }
]
```

---

### 3.4 Update Team

Update team details.

```
PUT /api/v1/teams/{team_id}
```

**Permissions:** Organization Admin

**Request Body:**

```json
{
  "name": "Quality Assurance",
  "description": "Updated description",
  "is_active": true
}
```

**Response:** `200 OK`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Quality Assurance",
  "description": "Updated description",
  "workspace_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "is_active": true,
  "member_count": 5,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-21T09:00:00Z"
}
```

---

### 3.5 Delete Team

Delete a team and all its data.

```
DELETE /api/v1/teams/{team_id}
```

**Permissions:** Organization Admin

**Response:** `204 No Content`

**Warning:** This will delete all team members and workspace data.

---

### 3.6 Add Team Member

Add a user to a team.

```
POST /api/v1/teams/{team_id}/members
```

**Permissions:** Organization Admin

**Request Body:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "member"
}
```

**Available Roles:**

| Role | Description |
|------|-------------|
| `owner` | Full control, cannot be removed |
| `admin` | Can manage team members |
| `member` | Standard access |
| `viewer` | Read-only access |

**Response:** `201 Created`

```json
{
  "member_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "member",
  "status": "active",
  "joined_at": "2024-01-21T10:00:00Z"
}
```

**Side Effects:**
- `user.is_paid = TRUE`
- `subscription.used_licenses += 1`

**Validation:**
- License limit not exceeded
- User exists
- User not already in team
- Subscription is active

---

### 3.7 List Team Members

Get all members of a team.

```
GET /api/v1/teams/{team_id}/members
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| include_inactive | boolean | false | Include inactive members |

**Response:** `200 OK`

```json
[
  {
    "member_id": "dd0e8400-e29b-41d4-a716-446655440008",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "member",
    "status": "active",
    "joined_at": "2024-01-21T10:00:00Z"
  },
  {
    "member_id": "ee0e8400-e29b-41d4-a716-446655440009",
    "user_id": "ff0e8400-e29b-41d4-a716-44665544000a",
    "email": "admin@example.com",
    "full_name": "Jane Admin",
    "role": "admin",
    "status": "active",
    "joined_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 3.8 Update Team Member Role

Update a member's role in the team.

```
PUT /api/v1/teams/{team_id}/members/{user_id}
```

**Permissions:** Organization Admin

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response:** `200 OK`

```json
{
  "member_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "admin",
  "status": "active",
  "joined_at": "2024-01-21T10:00:00Z"
}
```

---

### 3.9 Remove Team Member

Remove a user from a team.

```
DELETE /api/v1/teams/{team_id}/members/{user_id}
```

**Permissions:** Organization Admin

**Response:** `204 No Content`

**Side Effects:**
- `user.is_paid = FALSE` (if no other team memberships)
- `subscription.used_licenses -= 1`

---

### 3.10 Get License Usage

Get license usage for an organization.

```
GET /api/v1/teams/organization/{organization_id}/licenses
```

**Response:** `200 OK`

```json
{
  "max_licenses": 50,
  "used_licenses": 23,
  "available_licenses": 27
}
```

---

## 4. Organization Admin Management

Organization admins are nominated during payment and can manage teams and members.

### 4.1 Organization Admin Schema

```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440010",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "email": "admin@example.com",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "can_manage_teams": true,
  "can_manage_members": true,
  "can_view_billing": false,
  "can_manage_billing": false,
  "nominated_by": "payer@example.com",
  "nominated_at": "2024-01-01T00:00:00Z",
  "activated_at": "2024-01-02T10:00:00Z"
}
```

### 4.2 Admin Permissions

| Permission | Description |
|------------|-------------|
| `can_manage_teams` | Create, update, delete teams |
| `can_manage_members` | Add, remove, update team members |
| `can_view_billing` | View subscription and billing info |
| `can_manage_billing` | Update payment methods, licenses |

### 4.3 Admin Status Values

| Status | Description |
|--------|-------------|
| `pending` | Nominated but not yet activated |
| `active` | Active admin |
| `inactive` | Deactivated |

---

## 5. Billing Admin Management

Billing admins manage subscriptions and payments.

### 5.1 Billing Admin Capabilities

- View subscription details
- Update license count
- Reactivate expired subscriptions
- Manage payment methods (via Stripe portal)
- View billing history

### 5.2 Billing Admin Creation

Billing admin is automatically created when:
1. Organization is created via payment webhook
2. The payer becomes the billing admin

---

## 6. Payment Webhooks

Stripe webhook endpoint for handling payment events.

### 6.1 Webhook Endpoint

```
POST /api/v1/webhooks/stripe
```

**Security:** In production, verify Stripe signature.

### 6.2 Handled Events

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Create organization + subscription |
| `invoice.payment_failed` | Deactivate subscription |
| `customer.subscription.deleted` | Cancel subscription |
| `customer.subscription.updated` | Update subscription details |

---

### 6.3 payment_intent.succeeded

Creates organization, subscription, and admin accounts.

**Required Metadata in payment_intent:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organization_name | string | Yes | Organization name |
| max_licenses | integer | No | Number of licenses (default: 10) |
| plan_type | string | No | Plan type (default: "professional") |
| billing_cycle | string | No | "monthly" or "annual" |
| amount | decimal | No | Amount charged (default: 99.00) |
| payer_email | string | Yes | Payer's email |
| payer_name | string | No | Payer's full name |
| admin_emails | string | No | Comma-separated admin emails (max 3) |
| payer_is_admin | string | No | "true" if payer is also admin |

**Example Stripe Metadata:**

```json
{
  "organization_name": "Acme Corp",
  "max_licenses": "50",
  "plan_type": "professional",
  "billing_cycle": "monthly",
  "amount": "499.00",
  "payer_email": "billing@acme.com",
  "payer_name": "John Billing",
  "admin_emails": "admin1@acme.com,admin2@acme.com",
  "payer_is_admin": "true"
}
```

**Response:**

```json
{
  "status": "success",
  "organization_id": "880e8400-e29b-41d4-a716-446655440003",
  "subscription_id": "990e8400-e29b-41d4-a716-446655440004",
  "admins_created": [
    {
      "email": "billing@acme.com",
      "user_id": "aa0e8400-e29b-41d4-a716-446655440010"
    },
    {
      "email": "admin1@acme.com",
      "user_id": "bb0e8400-e29b-41d4-a716-446655440011"
    }
  ]
}
```

**Side Effects:**
1. Creates organization with unique slug
2. Creates subscription with license limits
3. Creates billing admin record for payer
4. Creates org admin records for nominated admins
5. Auto-creates user accounts if they don't exist
6. Sets `must_change_password = TRUE` for auto-created accounts
7. Sets `is_paid = TRUE` for all admin users
8. Sends admin nomination emails
9. Sends payment confirmation email

---

### 6.4 invoice.payment_failed

Deactivates subscription when payment fails.

**Response:**

```json
{
  "status": "subscription_deactivated",
  "subscription_id": "990e8400-e29b-41d4-a716-446655440004",
  "affected_users": 23
}
```

**Side Effects:**
- `subscription.is_active = FALSE`
- `subscription.expired_at = now()`
- All team members: `user.is_paid = FALSE`
- Sends subscription expired email to billing admin

---

### 6.5 customer.subscription.deleted

Permanently cancels subscription.

**Response:**

```json
{
  "status": "subscription_cancelled",
  "subscription_id": "990e8400-e29b-41d4-a716-446655440004",
  "affected_users": 23
}
```

**Side Effects:**
- `subscription.is_active = FALSE`
- `subscription.cancelled_at = now()`
- All team members: `user.is_paid = FALSE`
- Sends subscription cancelled email to billing admin

---

### 6.6 Test Endpoint (Development Only)

Manual endpoint to test organization setup.

```
POST /api/v1/webhooks/test-organization-setup
```

**Request Body:**

```json
{
  "organization_name": "Test Org",
  "max_licenses": 10,
  "payer_email": "payer@example.com",
  "payer_name": "John Doe",
  "admin_emails": ["admin1@example.com", "admin2@example.com"],
  "payer_is_admin": true,
  "plan_type": "professional",
  "billing_cycle": "monthly",
  "amount": 99.00
}
```

---

## 7. Data Models

### 7.1 Organization

```json
{
  "id": "UUID",
  "name": "string (max 255)",
  "slug": "string (unique, max 100)",
  "owner_user_id": "UUID (FK to users)",
  "created_by": "UUID (FK to users)",
  "status": "string (active|suspended|cancelled)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 7.2 Subscription

```json
{
  "id": "UUID",
  "organization_id": "UUID (FK, unique)",
  "max_licenses": "integer",
  "used_licenses": "integer (default 0)",
  "is_active": "boolean (default true)",
  "payer_name": "string (max 255)",
  "payer_email": "string (max 255)",
  "billing_address": "text",
  "plan_type": "string (starter|professional|enterprise)",
  "billing_cycle": "string (monthly|annual)",
  "amount": "decimal(10,2)",
  "currency": "string (default USD)",
  "started_at": "datetime",
  "next_billing_date": "date",
  "cancelled_at": "datetime (nullable)",
  "expired_at": "datetime (nullable)",
  "stripe_customer_id": "string (max 255)",
  "stripe_subscription_id": "string (max 255)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 7.3 Team

```json
{
  "id": "UUID",
  "organization_id": "UUID (FK)",
  "name": "string (max 255)",
  "description": "string (max 1000)",
  "workspace_id": "UUID (FK)",
  "is_active": "boolean (default true)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 7.4 TeamMember

```json
{
  "id": "UUID",
  "team_id": "UUID (FK)",
  "user_id": "UUID (FK)",
  "role": "string (owner|admin|member|viewer)",
  "status": "string (active|inactive|removed)",
  "invited_by": "UUID (FK)",
  "joined_at": "datetime"
}
```

### 7.5 User

```json
{
  "id": "UUID",
  "email": "string (unique, max 255)",
  "username": "string (optional, max 100)",
  "full_name": "string (optional, max 255)",
  "password_hash": "string",
  "is_admin": "boolean (default false)",
  "is_active": "boolean (default true)",
  "is_paid": "boolean (default false)",
  "email_verified": "boolean (default false)",
  "must_change_password": "boolean (default false)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_login_at": "datetime (nullable)"
}
```

---

## 8. Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 402 | Payment Required - Subscription expired |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error message here"
}
```

### Validation Error Format

```json
{
  "detail": "Invalid request format. Please check your input fields.",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

---

## 9. Flow Diagrams

### 9.1 Payment & Organization Setup Flow

```
[Stripe Checkout]
       |
       v
[payment_intent.succeeded webhook]
       |
       +---> Create Organization
       |           |
       |           v
       +---> Create Subscription (with licenses)
       |           |
       |           v
       +---> Create/Find Payer User
       |           |
       |           v
       +---> Create Billing Admin Record
       |           |
       |           v
       +---> For each nominated admin:
       |           |
       |           +---> Create/Find User Account
       |           |
       |           +---> Create Org Admin Record
       |           |
       |           +---> Set is_paid = TRUE
       |           |
       |           +---> Set must_change_password = TRUE
       |
       v
[Send Emails]
       |
       +---> Admin Nomination Emails
       +---> Payment Confirmation Email
```

### 9.2 Team Login Flow

```
[User enters email/password]
       |
       v
[POST /auth/login]
       |
       +---> Validate credentials
       |
       +---> Check team memberships
       |           |
       |           +---> No teams? -> login_mode = "personal"
       |           |
       |           +---> Has teams? -> login_mode = "team"
       |
       v
[Return tokens + teams list]
       |
       v
[If login_mode = "team"]
       |
       +---> UI shows team dropdown
       |
       +---> User selects team
       |
       v
[POST /auth/select-workspace]
       |
       +---> Validate membership
       |
       +---> Check subscription active
       |
       +---> Generate workspace-scoped tokens
       |
       v
[Return new tokens with workspace context]
       |
       v
[Use new tokens for API calls]
```

### 9.3 Subscription Expiration Flow

```
[invoice.payment_failed webhook]
       |
       v
[Find subscription by stripe_subscription_id]
       |
       v
[subscription.is_active = FALSE]
       |
       v
[subscription.expired_at = now()]
       |
       v
[For each team in organization:]
       |
       +---> For each member:
       |           |
       |           +---> Check other org memberships
       |           |
       |           +---> If none: user.is_paid = FALSE
       |
       v
[Send subscription expired email]
       |
       v
[Users lose access on next token refresh]
```

### 9.4 Token Refresh with Subscription Check

```
[POST /auth/refresh with refresh_token]
       |
       v
[Validate JWT signature]
       |
       v
[Check token in database (not revoked)]
       |
       v
[If workspace_type = "TEAM":]
       |
       +---> Check subscription.is_active
       |           |
       |           +---> FALSE? -> 402 Payment Required
       |           |
       |           +---> TRUE? -> Continue
       |
       v
[Revoke old refresh token]
       |
       v
[Generate new token pair]
       |
       v
[Store new refresh token]
       |
       v
[Return new tokens]
```

---

## Quick Reference

### Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Login | No |
| POST | /auth/refresh | Refresh token | No |
| POST | /auth/logout | Logout | Yes |
| GET | /auth/me | Get current user | Yes |
| POST | /auth/select-workspace | Select team workspace | Yes |
| POST | /auth/change-password | Change password | Yes |
| POST | /auth/forgot-password/verify-email | Verify email for reset | No |
| POST | /auth/forgot-password/reset | Reset password | No |
| GET | /subscriptions/organization/{id} | Get subscription | Yes |
| GET | /subscriptions/organization/{id}/status | Get status | Yes |
| PUT | /subscriptions/organization/{id}/licenses | Update licenses | Billing Admin |
| POST | /subscriptions/organization/{id}/reactivate | Reactivate | Billing Admin |
| GET | /subscriptions/user/current | Get user's subscriptions | Yes |
| POST | /teams | Create team | Org Admin |
| GET | /teams/{id} | Get team | Yes |
| GET | /teams/organization/{id} | List teams | Yes |
| PUT | /teams/{id} | Update team | Org Admin |
| DELETE | /teams/{id} | Delete team | Org Admin |
| POST | /teams/{id}/members | Add member | Org Admin |
| GET | /teams/{id}/members | List members | Yes |
| PUT | /teams/{id}/members/{user_id} | Update member role | Org Admin |
| DELETE | /teams/{id}/members/{user_id} | Remove member | Org Admin |
| GET | /teams/organization/{id}/licenses | Get license usage | Yes |
| POST | /webhooks/stripe | Stripe webhook | Stripe Sig |

---

*Generated for Testr API v1.0.0*
