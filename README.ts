# Backend Analysis for Team Workspace Functionality

**Date:** 2026-01-25
**Purpose:** Complete analysis of existing backend implementation to inform team workspace feature planning

---

## Executive Summary

The backend has **partial infrastructure** for team workspaces:
- **Workspace model exists** with PERSONAL/TEAM enum but TEAM functionality is not implemented
- **User model has `is_paid` flag** for free tier enforcement
- **Free tier limit (5 test cases)** is implemented at workspace level
- **NO team/membership model** - must be created from scratch
- **NO RBAC** - only simple owner-based authorization
- **Data scoping is user_id-based** for most artifacts (good foundation)

**Estimated Effort:** Medium-High complexity due to missing team infrastructure

---

## Task 1: Artifact Types Inventory

### 1.1 Complete List of Artifacts (26 Types)

| # | Artifact Type | Model File | Table Name | Has user_id FK | Scoped By |
|---|--------------|------------|------------|----------------|-----------|
| 1 | Test Plan | `test_plan.py` | `test_plans` | `created_by` (SET NULL) | created_by |
| 2 | Test Plan Folder | `folder.py` | `test_plan_folders` | `created_by` (SET NULL) | test_plan_id |
| 3 | Test Case | `test_case.py` | `test_cases` | `created_by` (SET NULL) | test_plan_id |
| 4 | Test Step | `test_case.py` | `test_steps` | No | test_case_id |
| 5 | Test Checkpoint | `test_case.py` | `test_checkpoints` | No | test_case_id |
| 6 | Test Screenshot | `test_case.py` | `test_screenshots` | No | test_case_id |
| 7 | Test Variable | `test_case.py` | `test_variables` | No | test_case_id |
| 8 | Test Asset | `test_case.py` | `test_assets` | `uploaded_by` (SET NULL) | test_case_id |
| 9 | Test Script | `test_script.py` | `test_scripts` | `created_by` (SET NULL) | test_case_id |
| 10 | Test Recording | `test_recording.py` | `test_recordings` | `recorded_by` (SET NULL) | test_case_id |
| 11 | Test Dependency | `test_dependency.py` | `test_dependencies` | No | test_case_id |
| 12 | Test Run | `test_run.py` | `test_runs` | `created_by` (NOT NULL) | test_plan_id |
| 13 | Test Run Item | `test_run.py` | `test_run_items` | No | test_run_id |
| 14 | Test Run Result | `test_run.py` | `test_run_results` | No | test_run_id |
| 15 | Schedule | `test_run.py` | `schedules` | `created_by` (NOT NULL) | test_plan_id |
| 16 | Suite Run | `test_report.py` | `suite_runs` | `user_id` (CASCADE) | **user_id** |
| 17 | Test Case Result | `test_report.py` | `test_case_results` | `user_id` (CASCADE) | suite_run_id & **user_id** |
| 18 | Test Artifact | `test_report.py` | `test_artifacts` | No | test_case_result_id |
| 19 | Defect | `defects.py` | `defects` | `user_id` (CASCADE) | **user_id** |
| 20 | Defect Folder | `defects.py` | `defect_folders` | `user_id` (CASCADE) | **user_id** |
| 21 | Defect Filter | `defects.py` | `defect_filters` | `user_id` (CASCADE) | **user_id** |
| 22 | User Settings | `settings.py` | `user_settings` | `user_id` (CASCADE) | **user_id** |
| 23 | User Credentials | `settings.py` | `user_credentials` | No (via settings) | user_settings_id |
| 24 | Variable | `variable.py` | `variables` | No | test_case_id |
| 25 | Workspace | `workspace.py` | `workspaces` | `owner_id` (CASCADE) | **owner_id** |
| 26 | Audit Log | `audit_log.py` | `audit_logs` | `performed_by_user_id` | test_case_id |

### 1.2 Scoping Hierarchy

```
User
  └── Workspace (owner_id) [PERSONAL or TEAM]
        └── Test Plan (???) [NOT LINKED TO WORKSPACE YET]
              └── Test Plan Folder
              └── Test Case
                    ├── Test Step
                    ├── Test Checkpoint
                    ├── Test Screenshot
                    ├── Test Variable
                    ├── Test Asset
                    ├── Test Script
                    ├── Test Recording
                    └── Test Dependency
              └── Test Run
                    └── Test Run Item
                    └── Test Run Result
              └── Schedule
        └── Suite Run (user_id)
              └── Test Case Result (user_id)
                    └── Test Artifact
                    └── Step Result
        └── Defect (user_id)
              └── Defect Folder (user_id)
        └── Defect Filter (user_id)
  └── User Settings (user_id)
        └── User Credentials
```

---

## Task 2: Database Schema Analysis

### 2.1 Current Schema Structure

**Total Tables:** ~50+ tables across all modules

**Core Tables:**
```sql
-- USERS
users (
    id UUID PK,
    username VARCHAR(100) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,  -- Free tier flag
    email_verified BOOLEAN DEFAULT FALSE,
    created_at, updated_at, last_login_at
)

-- WORKSPACES
workspaces (
    id UUID PK,
    name VARCHAR(255) NOT NULL,
    type workspace_type ('PERSONAL', 'TEAM'),
    owner_id UUID FK -> users(id) CASCADE,
    max_test_cases INTEGER DEFAULT 5,
    current_test_cases INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at, updated_at
)

-- TEST PLANS (NO workspace_id!)
test_plans (
    id UUID PK,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID FK -> users(id) SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at, updated_at
)
```

### 2.2 Key Observations

| Issue | Impact | Required Change |
|-------|--------|-----------------|
| **Test Plans not linked to Workspace** | Cannot scope test plans per workspace/team | Add `workspace_id` FK to `test_plans` |
| **No Team Membership table** | Cannot implement team sharing | Create `team_members` table |
| **No Role table** | Cannot implement RBAC | Create `roles` table with permissions |
| **Defects scoped only to user** | Cannot share defects in team | Add optional `workspace_id` to defects |
| **Suite Runs scoped only to user** | Cannot share test reports | Add optional `workspace_id` to suite_runs |

---

## Task 3: Existing Team/Workspace Infrastructure

### 3.1 What EXISTS

```python
# app/models/workspace.py
class WorkspaceType(str, enum.Enum):
    PERSONAL = "PERSONAL"
    TEAM = "TEAM"  # Enum exists but not used!

class Workspace(Base):
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(WorkspaceType), default=WorkspaceType.PERSONAL)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    max_test_cases = Column(Integer, default=5)
    current_test_cases = Column(Integer, default=0)

    def can_add_test_case(self) -> bool:
        if self.max_test_cases == -1:  # Unlimited for paid
            return True
        return self.current_test_cases < self.max_test_cases
```

### 3.2 What's MISSING

| Missing Component | Description |
|-------------------|-------------|
| **TeamMember model** | No way to add users to a team workspace |
| **TeamRole model** | No role definitions (owner, admin, member, viewer) |
| **TeamInvite model** | No invitation system |
| **workspace_id on TestPlan** | Test plans not linked to workspace |
| **Team creation endpoint** | Only personal workspace auto-created |
| **Team management endpoints** | No CRUD for team members |
| **Team scoping middleware** | No way to scope queries by team |

---

## Task 4: User Model Analysis

### 4.1 Current User Model

```python
# app/models/user.py
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=True)  # Optional
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_paid = Column(Boolean, default=False)  # FREE TIER FLAG
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
    last_login_at = Column(DateTime(timezone=True))

    # Relationships
    workspaces = relationship("Workspace", back_populates="owner")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
```

### 4.2 User Fields for Team Feature

| Field | Status | Notes |
|-------|--------|-------|
| `is_paid` | EXISTS | Controls free tier (5 test cases) |
| `is_admin` | EXISTS | System admin, NOT team admin |
| `team_memberships` | MISSING | Relationship to TeamMember |
| `current_team_id` | MISSING | Active team context (optional) |

---

## Task 5: Authentication & Authorization Analysis

### 5.1 Current Authentication

```python
# app/utils/dependencies.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """JWT-based auth - returns User object"""
    token = credentials.credentials
    payload = decode_token(token)
    user = db.query(User).filter(User.id == payload["sub"]).first()
    return user
```

**Token Structure:**
- Access Token: 1 hour expiry, type="access"
- Refresh Token: 8 hours expiry, type="refresh", stored in DB

### 5.2 Current Authorization

**SIMPLE OWNERSHIP MODEL:**
```python
# Example from defects CRUD
def get_defect(db: Session, defect_id: UUID, user_id: UUID):
    return db.execute(
        select(Defect).where(
            Defect.id == defect_id,
            Defect.user_id == user_id  # Owner check only
        )
    ).scalar_one_or_none()
```

### 5.3 What's MISSING

| Feature | Status | Required For |
|---------|--------|--------------|
| Team-aware auth middleware | MISSING | Team context in requests |
| Role-based permissions | MISSING | Team member roles |
| Resource ownership check | PARTIAL | Only owner check, no team check |
| Permission decorator | MISSING | `@require_permission("edit")` |

---

## Task 6: Current Artifact API Endpoints

### 6.1 API Endpoint Inventory

| Router | Prefix | Key Endpoints |
|--------|--------|---------------|
| auth | `/api/v1/auth` | login, register, refresh, logout, me |
| test_plans | `/api/v1/test-plans` | CRUD for test plans |
| folders | `/api/v1/folders` | CRUD for test plan folders |
| test_cases | `/api/v1/test-cases` | CRUD, clone, move, parameterization |
| test_scripts | `/api/v1/test-scripts` | CRUD for scripts |
| test_recordings | `/api/v1/test-recordings` | CRUD for recordings |
| test_runs | `/api/v1/test-runs` | Create, list, update status, results |
| schedules | `/api/v1/schedules` | Schedule management |
| test_report | `/api/v1/reports` | Suite runs, test case results, artifacts |
| defects | `/api/v1/defects` | CRUD, filters, folders, sync |
| settings | `/api/v1/settings` | User settings (flat structure) |
| assets | `/api/v1/test-cases/{id}/assets` | File uploads for test cases |
| checkpoints | `/api/v1/checkpoints` | Checkpoint management |

### 6.2 Endpoint Authorization Patterns

**Pattern 1: Direct User Scope**
```python
# Used by: defects, suite_runs, defect_filters
@router.get("")
def list_defects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.list_defects(db, user_id=current_user.id, ...)
```

**Pattern 2: Resource Lookup (No User Check!)**
```python
# Used by: test_cases, test_plans (SECURITY GAP!)
@router.get("/{test_case_id}")
def get_test_case(
    test_case_id: UUID,
    current_user: User = Depends(get_current_user),  # Auth only
    db: Session = Depends(get_db)
):
    # No check that current_user owns this test case!
    return crud_get_test_case(db, test_case_id)
```

---

## Task 7: Data Scoping Logic

### 7.1 Current Scoping Patterns

**Direct User Scoping:**
```python
# Defects - properly scoped
query = db.query(Defect).filter(Defect.user_id == user_id)

# Suite Runs - properly scoped
query = db.query(SuiteRun).filter(SuiteRun.user_id == user_id)

# User Settings - properly scoped
query = db.query(UserSettings).filter(UserSettings.user_id == user_id)
```

**Indirect Scoping (via Test Plan):**
```python
# Test Cases - scoped via test_plan_id, NOT user!
query = db.query(TestCase).filter(TestCase.test_plan_id == test_plan_id)
# ISSUE: No check that user owns the test_plan!
```

### 7.2 Scoping Gaps

| Module | Issue | Risk |
|--------|-------|------|
| Test Plans | No user_id check on GET/UPDATE/DELETE | Any user can access any test plan |
| Test Cases | No ownership verification | Cross-user access possible |
| Test Runs | Only created_by check | No team scoping |
| Artifacts | Via test_case_result only | Inherits parent's scoping |

---

## Task 8: Workspace Model Check

### 8.1 Current Implementation

```python
# Workspace model EXISTS with these features:
- PERSONAL/TEAM type enum
- owner_id foreign key
- max_test_cases limit (5 default, -1 unlimited)
- current_test_cases counter
- can_add_test_case() method
- increment/decrement methods
```

### 8.2 What Workspace is Used For

1. **Auto-created on signup:**
```python
# auth.py register endpoint
workspace = create_personal_workspace(db=db, owner_id=user.id)
```

2. **Returned on login:**
```python
workspaces = get_workspaces_by_owner(db, user.id)
# Included in LoginResponse
```

3. **NOT enforced on test case creation!**
```python
# Test case creation does NOT check workspace limits
# The workspace counter is NOT incremented
```

---

## Task 9: Free Tier Limits Check

### 9.1 Current Free Tier Implementation

| Limit | Defined | Enforced | Location |
|-------|---------|----------|----------|
| 5 test cases per workspace | YES | **NOT ENFORCED** | `workspace.max_test_cases = 5` |
| Unlimited for paid users | YES | **NOT ENFORCED** | `max_test_cases = -1` |

### 9.2 Free Tier Code (Not Used)

```python
# workspace.py - methods exist but not called
def can_add_test_case(self) -> bool:
    if self.max_test_cases == -1:
        return True
    return self.current_test_cases < self.max_test_cases

# crud/workspace.py
def can_add_test_case(db: Session, workspace_id: UUID) -> bool:
    workspace = get_workspace_by_id(db, workspace_id)
    if workspace.max_test_cases == -1:
        return True
    return workspace.current_test_cases < workspace.max_test_cases
```

### 9.3 Required Implementation

```python
# Should be called in test_cases.py create endpoint:
if not can_add_test_case(db, workspace_id):
    raise HTTPException(
        status_code=403,
        detail="Test case limit reached. Upgrade to paid plan for unlimited test cases."
    )
```

---

## Task 10: Payment/Subscription Infrastructure

### 10.1 Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `User.is_paid` field | EXISTS | Boolean flag |
| Subscription model | MISSING | No subscription tracking |
| Payment integration | MISSING | No Stripe/payment gateway |
| Plan tiers table | MISSING | No plan definitions |
| Usage tracking | PARTIAL | `current_test_cases` counter |
| Billing history | MISSING | No transaction records |

### 10.2 What Exists

```python
# User model
is_paid = Column(Boolean, default=False)

# Workspace model
max_test_cases = Column(Integer, default=5)  # 5 for free, -1 for paid

# Workspace upgrade function
def upgrade_workspace_to_unlimited(db: Session, workspace_id: UUID):
    workspace.max_test_cases = -1  # Unlimited
```

---

## Task 11: Multi-tenancy Preparedness

### 11.1 Current Architecture Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Data isolation | PARTIAL | User-scoped but not team-scoped |
| Cross-tenant queries | POSSIBLE | No middleware prevents it |
| Tenant context | MISSING | No X-Team-ID header |
| Database schema | SINGLE | No schema-per-tenant |
| Row-level security | NO | Not using Postgres RLS |

### 11.2 Required for Multi-tenancy

1. **Team context middleware** - inject team_id into all queries
2. **Row-level security** - Postgres RLS policies (optional)
3. **Tenant validation** - verify user belongs to requested team
4. **Cascading permissions** - team -> workspace -> test_plan -> test_case

---

## Task 12: Database Migration Status

### 12.1 Existing Migrations

| Migration | Status | Description |
|-----------|--------|-------------|
| `001_user_workspace_migration.sql` | APPLIED | Users + Workspaces |
| `002_refresh_tokens_migration.sql` | APPLIED | Token table |
| `003_metadata_column_migration.sql` | APPLIED | Test report metadata |
| `004_settings_v2_migration.sql` | APPLIED | Settings flat structure |

### 12.2 Required New Migrations

```sql
-- 005_team_workspace_migration.sql (NEEDED)
CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50) NOT NULL,  -- 'owner', 'admin', 'member', 'viewer'
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Add workspace_id to test_plans
ALTER TABLE test_plans
ADD COLUMN workspace_id UUID REFERENCES workspaces(id);

-- Add workspace_id to defects (optional)
ALTER TABLE defects
ADD COLUMN workspace_id UUID REFERENCES workspaces(id);
```

---

## Task 13: RBAC Check

### 13.1 Current Authorization

| Check Type | Implemented | Notes |
|------------|-------------|-------|
| Authentication | YES | JWT Bearer tokens |
| User active check | YES | `User.is_active` |
| Resource ownership | PARTIAL | Only some modules |
| Role-based access | NO | No role system |
| Permission-based | NO | No permission checks |
| Team membership | NO | No team validation |

### 13.2 Suggested RBAC Model

```python
class TeamRole(str, Enum):
    OWNER = "owner"      # Full control, can delete team
    ADMIN = "admin"      # Manage members, all artifacts
    MEMBER = "member"    # Create/edit own artifacts
    VIEWER = "viewer"    # Read-only access

ROLE_PERMISSIONS = {
    "owner": ["*"],
    "admin": ["read", "write", "delete", "manage_members"],
    "member": ["read", "write"],
    "viewer": ["read"]
}
```

---

## Task 14: Current Relationships Analysis

### 14.1 Entity Relationship Diagram (Text)

```
User (1) ──owns──> (N) Workspace
User (1) ──creates──> (N) TestPlan [NOT via workspace!]
User (1) ──creates──> (N) Defect
User (1) ──owns──> (1) UserSettings

Workspace (1) ──contains──> (?) TestPlan [RELATIONSHIP MISSING]

TestPlan (1) ──contains──> (N) TestPlanFolder
TestPlan (1) ──contains──> (N) TestCase
TestPlan (1) ──has──> (N) TestRun
TestPlan (1) ──has──> (N) Schedule

TestCase (1) ──has──> (N) TestStep
TestCase (1) ──has──> (N) TestCheckpoint
TestCase (1) ──has──> (N) TestScreenshot
TestCase (1) ──has──> (N) TestVariable
TestCase (1) ──has──> (N) TestAsset
TestCase (1) ──has──> (N) TestScript
TestCase (1) ──has──> (N) TestRecording
```

### 14.2 Missing Relationships

| From | To | Type | Status |
|------|-----|------|--------|
| Workspace | TestPlan | 1:N | MISSING |
| Workspace | TeamMember | 1:N | MISSING (table doesn't exist) |
| User | TeamMember | 1:N | MISSING |
| Workspace | Defect | 1:N | MISSING (optional) |

---

## Task 15: API Response Formats

### 15.1 Standard Response Patterns

**Success Response (List):**
```json
{
    "items": [...],
    "pagination": {
        "page": 1,
        "page_size": 20,
        "total_items": 150,
        "total_pages": 8
    }
}
```

**Success Response (Single):**
```json
{
    "id": "uuid",
    "name": "...",
    "created_at": "2026-01-25T00:00:00Z",
    ...
}
```

**Settings Response (Wrapper):**
```json
{
    "success": true,
    "data": { ... },
    "metadata": {
        "last_updated": "...",
        "version": 1
    }
}
```

**Error Response:**
```json
{
    "detail": "Error message"
}
```

**Validation Error Response:**
```json
{
    "detail": "Invalid request format",
    "errors": [
        {
            "field": "body.name",
            "message": "field required",
            "type": "value_error"
        }
    ]
}
```

---

## Gap Analysis Summary

### Critical Gaps (Must Fix)

| Gap | Impact | Effort |
|-----|--------|--------|
| No TeamMember model | Cannot implement teams | High |
| TestPlan not linked to Workspace | Cannot scope test plans | Medium |
| No workspace_id on TestPlan | Teams can't share test plans | Medium |
| Free tier limits not enforced | Users can exceed 5 test cases | Low |
| No authorization on test plans/cases | Security vulnerability | Medium |

### Moderate Gaps (Should Fix)

| Gap | Impact | Effort |
|-----|--------|--------|
| No RBAC system | All team members equal | High |
| No team invitation system | Manual member adding only | Medium |
| Defects not shareable in teams | No collaborative defect tracking | Low |

### Minor Gaps (Nice to Have)

| Gap | Impact | Effort |
|-----|--------|--------|
| No subscription management | Manual is_paid flag | Medium |
| No billing integration | External payment needed | High |
| No activity logs for teams | No audit trail | Low |

---

## Recommended Implementation Order

1. **Phase 1: Team Foundation**
   - Create TeamMember model
   - Add workspace_id to TestPlan
   - Create team CRUD endpoints
   - Add team context middleware

2. **Phase 2: Authorization**
   - Implement role-based permissions
   - Add authorization checks to all endpoints
   - Create permission decorators

3. **Phase 3: Free Tier Enforcement**
   - Enforce test case limits
   - Add upgrade workflow
   - Create limit exceeded responses

4. **Phase 4: Team Features**
   - Team invitation system
   - Team settings
   - Activity logs

---

**Document Created:** 2026-01-25
**Total Models Analyzed:** 26 artifact types
**Total Tables:** ~50+ tables
**Ready for Team Implementation:** Partial (workspace model exists)
