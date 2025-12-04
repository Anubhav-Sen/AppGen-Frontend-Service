# configStore.ts

**Location:** `/src/stores/configStore.ts`
**Type:** Zustand Store (Persisted)

## Purpose

Manages project configuration settings including project metadata, git config, database config, security config, and token config. This store is **persisted** to localStorage so configuration survives page refreshes.

## State Interface

```typescript
interface ConfigState {
  // Configuration sections
  project: ProjectConfig;
  git: GitConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  token: TokenConfig;

  // Actions
  setProject: (config: Partial<ProjectConfig>) => void;
  setGit: (config: Partial<GitConfig>) => void;
  setDatabase: (config: Partial<DatabaseConfig>) => void;
  setSecurity: (config: Partial<SecurityConfig>) => void;
  setToken: (config: Partial<TokenConfig>) => void;
  loadConfig: (project, git, database, security, token) => void;
  resetToDefaults: () => void;
}
```

## Configuration Sections

### 1. Project Configuration

```typescript
interface ProjectConfig {
  title: string;
  author: string;
  description: string;
}
```

**Default Values:**
```typescript
{
  title: "",
  author: "",
  description: ""
}
```

**Usage:**
- Project title (required for project creation)
- Author name for generated code comments
- Description for documentation

---

### 2. Git Configuration

```typescript
interface GitConfig {
  username: string;
  repository: string;
  branch: string;
}
```

**Default Values:**
```typescript
{
  username: "",
  repository: "",
  branch: "main"
}
```

**Usage:**
- Git username/organization for repository
- Repository name for code deployment
- Target branch for deployment (default: main)

---

### 3. Database Configuration

```typescript
interface DatabaseConfig {
  db_provider: DBProvider;  // "postgresql" | "sqlite" | "mysql"
  db_name: string;
  db_host: string;
  db_port: number;
  db_username: string;
  db_password: string;
}
```

**Default Values:**
```typescript
{
  db_provider: DBProvider.POSTGRESQL,
  db_name: "",
  db_host: "",
  db_port: 5432,
  db_username: "",
  db_password: ""
}
```

**Usage:**
- Database provider selection (PostgreSQL, SQLite, MySQL)
- Connection string parameters for generated FastAPI app
- SQLite requires only db_name (file path)
- PostgreSQL/MySQL require all connection parameters

---

### 4. Security Configuration

```typescript
interface SecurityConfig {
  secret_key: string;
  algorithm: string;
}
```

**Default Values:**
```typescript
{
  secret_key: "",
  algorithm: "HS256"
}
```

**Usage:**
- Secret key for JWT signing (should be 32+ characters)
- Algorithm for token encoding (HS256 is standard)

---

### 5. Token Configuration

```typescript
interface TokenConfig {
  access_token_expire_minutes: number;
  refresh_token_expire_days: number;
}
```

**Default Values:**
```typescript
{
  access_token_expire_minutes: 30,
  refresh_token_expire_days: 7
}
```

**Usage:**
- Access token lifetime (default: 30 minutes)
- Refresh token lifetime (default: 7 days)

## Actions

### `setProject(config)`
```typescript
setProject: (config: Partial<ProjectConfig>) => void
```

Update project configuration (partial update).

**Example:**
```typescript
const { setProject } = useConfigStore();

setProject({
  title: "E-Commerce API",
  author: "John Doe"
});
```

---

### `setGit(config)`
```typescript
setGit: (config: Partial<GitConfig>) => void
```

Update git configuration.

**Example:**
```typescript
setGit({
  username: "johndoe",
  repository: "my-api",
  branch: "develop"
});
```

---

### `setDatabase(config)`
```typescript
setDatabase: (config: Partial<DatabaseConfig>) => void
```

Update database configuration.

**Example:**
```typescript
setDatabase({
  db_provider: DBProvider.POSTGRESQL,
  db_name: "ecommerce_db",
  db_host: "localhost",
  db_port: 5432,
  db_username: "postgres",
  db_password: "secret"
});
```

---

### `setSecurity(config)`
```typescript
setSecurity: (config: Partial<SecurityConfig>) => void
```

Update security configuration.

**Example:**
```typescript
setSecurity({
  secret_key: "your-32-character-secret-key-here!",
  algorithm: "HS256"
});
```

---

### `setToken(config)`
```typescript
setToken: (config: Partial<TokenConfig>) => void
```

Update token configuration.

**Example:**
```typescript
setToken({
  access_token_expire_minutes: 60,  // 1 hour
  refresh_token_expire_days: 30     // 30 days
});
```

---

### `loadConfig(project, git, database, security, token)`
```typescript
loadConfig: (
  project: ProjectConfig,
  git: GitConfig,
  database: DatabaseConfig,
  security: SecurityConfig,
  token: TokenConfig
) => void
```

Load complete configuration (replaces all sections).

**Usage:**
```typescript
// When loading a saved project
const project = await schemas.getById(42);
const spec = project.schema_data as FastAPIProjectSpec;

useConfigStore.getState().loadConfig(
  spec.project,
  spec.git,
  spec.database,
  spec.security,
  spec.token
);
```

---

### `resetToDefaults()`
```typescript
resetToDefaults: () => void
```

Reset all configuration to default values.

**Usage:**
```typescript
// When starting a new project
const handleNewProject = () => {
  useProjectStore.getState().startNewProject();
  useConfigStore.getState().resetToDefaults();
  useSchemaStore.getState().clearAll();
  navigate('/config');
};
```

## How It Fits Into The Application

### Config Page Flow

```
User clicks "Create New Project"
  ↓
resetToDefaults() called
  ↓
Navigate to /config
  ↓
ConfigPage shows 5 tabs (Project, Database, Security, Token, Git)
  ↓
User fills out forms
  ↓
Each form calls setProject(), setDatabase(), etc.
  ↓
User clicks "Continue to Schema Builder"
  ↓
Configuration is saved to localStorage
  ↓
Navigate to /builder
```

### Usage in Config Forms

#### ProjectConfigForm.tsx
```typescript
import { useConfigStore } from '@/stores/configStore';

function ProjectConfigForm() {
  const { project, setProject } = useConfigStore();

  return (
    <form>
      <input
        value={project.title}
        onChange={(e) => setProject({ title: e.target.value })}
        placeholder="Project Title"
      />
      <input
        value={project.author}
        onChange={(e) => setProject({ author: e.target.value })}
        placeholder="Author Name"
      />
      <textarea
        value={project.description}
        onChange={(e) => setProject({ description: e.target.value })}
        placeholder="Project Description"
      />
    </form>
  );
}
```

#### DatabaseConfigForm.tsx
```typescript
import { useConfigStore } from '@/stores/configStore';
import { DBProvider } from '@/types/fastapiSpec';

function DatabaseConfigForm() {
  const { database, setDatabase } = useConfigStore();

  return (
    <form>
      <select
        value={database.db_provider}
        onChange={(e) => setDatabase({ db_provider: e.target.value })}
      >
        <option value={DBProvider.POSTGRESQL}>PostgreSQL</option>
        <option value={DBProvider.SQLITE}>SQLite</option>
        <option value={DBProvider.MYSQL}>MySQL</option>
      </select>

      <input
        value={database.db_name}
        onChange={(e) => setDatabase({ db_name: e.target.value })}
        placeholder="Database Name"
      />

      {/* Show connection fields only for non-SQLite */}
      {database.db_provider !== DBProvider.SQLITE && (
        <>
          <input
            value={database.db_host}
            onChange={(e) => setDatabase({ db_host: e.target.value })}
            placeholder="Host"
          />
          <input
            type="number"
            value={database.db_port}
            onChange={(e) => setDatabase({ db_port: Number(e.target.value) })}
            placeholder="Port"
          />
        </>
      )}
    </form>
  );
}
```

### Building FastAPI Spec

When exporting the project, all config sections are combined:

```typescript
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

function SchemaBuilder() {
  const handleExport = () => {
    const spec = buildFastAPIProjectSpec();
    // spec includes all config sections:
    // spec.project, spec.git, spec.database, spec.security, spec.token
  };
}
```

## Persistence

The store is persisted to localStorage under the key `"config-storage"`.

**Storage Format:**
```json
{
  "state": {
    "project": { "title": "My API", "author": "John", "description": "..." },
    "git": { "username": "johndoe", "repository": "my-api", "branch": "main" },
    "database": { "db_provider": "postgresql", "db_name": "mydb", ... },
    "security": { "secret_key": "...", "algorithm": "HS256" },
    "token": { "access_token_expire_minutes": 30, ... }
  },
  "version": 0
}
```

**Clear Storage:**
```typescript
// Clear persisted config
localStorage.removeItem('config-storage');
useConfigStore.getState().resetToDefaults();
```

## Validation

ConfigPage validates required fields before allowing navigation:

```typescript
function ConfigPage() {
  const config = useConfigStore();

  const isConfigValid = () => {
    // Project validation
    if (!config.project.title.trim()) return false;

    // Database validation
    if (!config.database.db_name.trim()) return false;
    if (config.database.db_provider !== "sqlite") {
      if (!config.database.db_host?.trim()) return false;
      if (!config.database.db_port) return false;
    }

    // Security validation
    if (!config.security.secret_key.trim()) return false;

    // Token validation
    if (config.token.access_token_expire_minutes <= 0) return false;
    if (config.token.refresh_token_expire_days <= 0) return false;

    return true;
  };

  return (
    <button
      onClick={handleContinue}
      disabled={!isConfigValid()}
    >
      Continue to Schema Builder
    </button>
  );
}
```

## Related Files

- [fastapiSpec.ts](../types/fastapiSpec.ts.md): Type definitions for all config interfaces
- [ConfigPage.tsx](../pages/ConfigPage.tsx.md): Main configuration UI
- [specBuilder.ts](../lib/serializers/specBuilder.ts.md): Exports config in spec
- [ProjectConfigForm.tsx](../components/config/ProjectConfigForm.tsx.md): Project form
- [DatabaseConfigForm.tsx](../components/config/DatabaseConfigForm.tsx.md): Database form
- [SecurityConfigForm.tsx](../components/config/SecurityConfigForm.tsx.md): Security form
- [TokenConfigForm.tsx](../components/config/TokenConfigForm.tsx.md): Token form
- [GitConfigForm.tsx](../components/config/GitConfigForm.tsx.md): Git form

## Common Operations

### Get Current Configuration
```typescript
const config = useConfigStore.getState();
console.log("Project:", config.project.title);
console.log("Database:", config.database.db_provider);
```

### Update Multiple Fields at Once
```typescript
const { setDatabase } = useConfigStore();

setDatabase({
  db_name: "mydb",
  db_host: "localhost",
  db_port: 5432
});
```

### Check if Configuration Complete
```typescript
const isComplete = () => {
  const { project, database, security } = useConfigStore.getState();
  return (
    project.title.trim() !== "" &&
    database.db_name.trim() !== "" &&
    security.secret_key.trim() !== ""
  );
};
```

## Security Notes

⚠️ **Secret Key Storage:**
- The secret key is stored in localStorage
- This is acceptable for development/demo purposes
- For production, consider:
  - Environment variables
  - Secure key management
  - Warning users about secret key security

⚠️ **Database Credentials:**
- Database passwords are stored in localStorage
- This is for generating configuration files
- Actual credentials should be in `.env` files in deployed apps

## Debugging

```typescript
// Check current config
console.log(useConfigStore.getState());

// Watch config changes
useConfigStore.subscribe((state) => {
  console.log("Config updated:", state);
});

// Reset to defaults
useConfigStore.getState().resetToDefaults();
```
