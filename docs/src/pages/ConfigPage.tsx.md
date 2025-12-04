# ConfigPage.tsx

**Location:** `/src/pages/ConfigPage.tsx`
**Type:** Page Component

## Purpose

Multi-tab configuration wizard for setting up FastAPI project settings before designing the schema. Validates configuration completeness before allowing navigation to schema builder.

## Features

### 1. Five Configuration Tabs
- **Project**: Title, author, description
- **Database**: Provider, connection details
- **Security**: Secret key, algorithm
- **Token**: Access/refresh token expiry
- **Git**: Username, repository, branch

### 2. Form Validation
```typescript
const isConfigValid = () => {
  if (!config.project.title.trim()) return false;
  if (!config.database.db_name.trim()) return false;
  if (config.database.db_provider !== "sqlite") {
    if (!config.database.db_host?.trim()) return false;
    if (!config.database.db_port) return false;
  }
  if (!config.security.secret_key.trim()) return false;
  if (config.token.access_token_expire_minutes <= 0) return false;
  if (config.token.refresh_token_expire_days <= 0) return false;
  return true;
};
```

**Required fields:**
- Project title
- Database name
- Database host/port (if not SQLite)
- Secret key
- Positive token expiry values

### 3. Tab Navigation
```typescript
const [activeTab, setActiveTab] = useState<Tab>("project");

const tabs: { id: Tab; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "database", label: "Database" },
  { id: "security", label: "Security" },
  { id: "token", label: "Token" },
  { id: "git", label: "Git" },
];
```

### 4. Continue Button
```typescript
const handleContinue = () => {
  setWorkflowStep("schema");
  navigate("/builder");
};

<button
  onClick={handleContinue}
  disabled={!isConfigValid()}
>
  Continue to Schema Builder
</button>
```

Disabled until all required fields are filled.

## Tab Components

Each tab renders a specific form component:

| Tab | Component | Purpose |
|-----|-----------|---------|
| project | ProjectConfigForm | Project metadata |
| database | DatabaseConfigForm | Database connection |
| security | SecurityConfigForm | JWT security settings |
| token | TokenConfigForm | Token expiry settings |
| git | GitConfigForm | Git repository details |

## User Flow

```
User clicks "Create New Project"
  ↓
Navigate to /config
  ↓
Default tab: "project"
  ↓
User fills out each tab
  ↓
"Continue" button enables when valid
  ↓
Click "Continue"
  ↓
setWorkflowStep("schema")
  ↓
Navigate to /builder
```

## Configuration State

Uses `useConfigStore` for persistent state:
```typescript
const config = useConfigStore();

// Each form updates the store
config.setProject({ title: "My API" });
config.setDatabase({ db_name: "mydb" });
// ...
```

State persists across page refreshes via localStorage.

## Validation Logic

### SQLite Special Case
```typescript
if (config.database.db_provider !== "sqlite") {
  if (!config.database.db_host?.trim()) return false;
  if (!config.database.db_port) return false;
}
```

SQLite doesn't require host/port.

### Minimum Requirements
- All text fields must not be empty/whitespace
- Numeric fields must be positive

## Related Files

- [configStore.ts](../stores/configStore.ts.md): Configuration state
- [projectStore.ts](../stores/projectStore.ts.md): Workflow step management
- [ProjectConfigForm.tsx](../components/config/ProjectConfigForm.tsx.md): Project tab
- [DatabaseConfigForm.tsx](../components/config/DatabaseConfigForm.tsx.md): Database tab
- [SecurityConfigForm.tsx](../components/config/SecurityConfigForm.tsx.md): Security tab
- [TokenConfigForm.tsx](../components/config/TokenConfigForm.tsx.md): Token tab
- [GitConfigForm.tsx](../components/config/GitConfigForm.tsx.md): Git tab
- [SchemaBuilder.tsx](./SchemaBuilder.tsx.md): Next page in workflow

## UI Layout

```
┌─────────────────────────────────────┐
│ Project Configuration               │
│ Configure your FastAPI project...  │
├─────────────────────────────────────┤
│ [Project] [Database] [Security]     │
│           [Token] [Git]             │
├─────────────────────────────────────┤
│                                     │
│     {Active Form Component}         │
│                                     │
├─────────────────────────────────────┤
│ [Cancel]  [Continue to Builder →]  │
└─────────────────────────────────────┘
```

## Usage Example

The page is accessed via:
```typescript
// App.tsx
{
  path: "/config",
  element: (
    <ProtectedRoute>
      <ConfigPage />
    </ProtectedRoute>
  )
}
```
