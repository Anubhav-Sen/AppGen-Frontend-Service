# specBuilder.ts

**Location:** `/src/lib/serializers/specBuilder.ts`
**Type:** Serializer Module

## Purpose

Builds the complete FastAPI project specification by combining data from `schemaStore` and `configStore`. This is the **final step before saving or exporting** a project.

## Exported Functions

### `buildFastAPIProjectSpec()`
Combines all Zustand stores into a complete FastAPI project spec.

**Input:** None (reads directly from stores)

**Output:**
```typescript
FastAPIProjectSpec & {
  _ui_metadata?: {
    models: Array<{ name: string; position: { x: number; y: number } }>;
    enums: Array<{ name: string; position: { x: number; y: number } }>;
  };
}
```

**Complete Structure:**
```typescript
{
  // From configStore
  project: {
    title: "My API",
    author: "John Doe",
    description: "..."
  },
  git: {
    username: "johndoe",
    repository: "my-api",
    branch: "main"
  },
  database: {
    db_provider: "postgresql",
    db_name: "mydb",
    db_host: "localhost",
    db_port: 5432,
    db_username: "user",
    db_password: "pass"
  },
  security: {
    secret_key: "...",
    algorithm: "HS256"
  },
  token: {
    access_token_expire_minutes: 30,
    refresh_token_expire_days: 7
  },

  // From schemaStore
  schema: {
    models: [
      {
        name: "User",
        tablename: "users",
        columns: [...],
        relationships: [...]
      }
    ],
    enums: [
      {
        name: "UserRole",
        values: ["ADMIN", "USER"]
      }
    ],
    association_tables: [...]
  },

  // UI-only metadata (not used by backend code generation)
  _ui_metadata: {
    models: [
      { name: "User", position: { x: 100, y: 100 } }
    ],
    enums: [
      { name: "UserRole", position: { x: 400, y: 100 } }
    ]
  }
}
```

## Key Operations

### 1. Strip UI-Specific Fields
```typescript
const models: Model[] = schemaState.models.map((modelWithUI) => {
  const { id, position, ...model } = modelWithUI;
  return model;  // Only data needed for FastAPI code generation
});
```

**Before (ModelWithUI):**
```typescript
{
  id: "V1StGXR8_Z5jdHi",      // UI-only
  position: { x: 100, y: 100 },  // UI-only
  name: "User",                  // FastAPI needs this
  columns: [...]                 // FastAPI needs this
}
```

**After (Model):**
```typescript
{
  name: "User",
  columns: [...]
}
```

### 2. Conditional Schema Fields
```typescript
if (schemaState.enums.length > 0) {
  schema.enums = schemaState.enums.map(({ id, position, ...enumDef }) => enumDef);
}

if (schemaState.associationTables.length > 0) {
  schema.association_tables = schemaState.associationTables;
}
```

Empty arrays are omitted from the final spec (cleaner JSON).

### 3. Preserve UI Metadata
```typescript
_ui_metadata: {
  models: schemaState.models.map((m) => ({
    name: m.name,
    position: m.position || { x: 100, y: 100 },
  })),
  enums: schemaState.enums.map((e) => ({
    name: e.name,
    position: e.position || { x: 100, y: 100 },
  })),
}
```

Stored separately so the backend can ignore it, but frontend can restore node positions when loading a project.

## How It Fits Into The Application

### Save Project Flow
```
User clicks "Save" in SchemaToolbar
  ↓
const spec = buildFastAPIProjectSpec();
  ↓
schemas.update(projectId, spec)  // API call
  ↓
Backend stores spec in database
  ↓
Success toast notification
```

### Export JSON Flow
```
User clicks "Export JSON" in SchemaToolbar
  ↓
const spec = buildFastAPIProjectSpec();
  ↓
JSON.stringify(spec, null, 2)
  ↓
Display in JsonPreviewModal
  ↓
User can copy/download
```

### Load Project Flow
```
User opens project
  ↓
API returns saved spec
  ↓
Parse spec:
  - configStore.loadConfig(spec.project, spec.git, ...)
  - Add id and position to models/enums
  - schemaStore.loadSchema(modelsWithUI, enumsWithUI, ...)
  ↓
Canvas renders with restored positions
```

## Data Flow Diagram

```
┌──────────────┐
│ configStore  │
│ - project    │
│ - git        │
│ - database   │
│ - security   │
│ - token      │
└──────┬───────┘
       │
       │ buildFastAPIProjectSpec()
       │
       ▼
┌──────────────┐      ┌──────────────────┐
│ schemaStore  │─────>│ FastAPIProject   │
│ - models     │      │ Spec (complete)  │
│ - enums      │      │                  │
│ - assoc      │      │ + _ui_metadata   │
└──────────────┘      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │  schemas.update() │ → API
                      │  or Export JSON   │
                      └───────────────────┘
```

## Example Output

### Minimal Project
```json
{
  "project": {
    "title": "Todo API",
    "author": "John Doe",
    "description": ""
  },
  "git": {
    "username": "",
    "repository": "",
    "branch": "main"
  },
  "database": {
    "db_provider": "postgresql",
    "db_name": "todos",
    "db_host": "localhost",
    "db_port": 5432,
    "db_username": "user",
    "db_password": "pass"
  },
  "security": {
    "secret_key": "my-secret-key-12345",
    "algorithm": "HS256"
  },
  "token": {
    "access_token_expire_minutes": 30,
    "refresh_token_expire_days": 7
  },
  "schema": {
    "models": [
      {
        "name": "Todo",
        "tablename": "todos",
        "columns": [
          {
            "name": "id",
            "type": "Integer",
            "primary_key": true,
            "autoincrement": true
          },
          {
            "name": "title",
            "type": "String",
            "nullable": false
          },
          {
            "name": "completed",
            "type": "Boolean",
            "default": false
          }
        ]
      }
    ]
  },
  "_ui_metadata": {
    "models": [
      { "name": "Todo", "position": { "x": 100, "y": 100 } }
    ],
    "enums": []
  }
}
```

### Complex Project with Relationships
```json
{
  "project": { "title": "Blog API", "author": "..." },
  "git": { ... },
  "database": { ... },
  "security": { ... },
  "token": { ... },
  "schema": {
    "models": [
      {
        "name": "User",
        "columns": [
          { "name": "id", "type": "Integer", "primary_key": true }
        ],
        "relationships": [
          {
            "name": "posts",
            "type": "OneToMany",
            "target_model": "Post",
            "back_populates": "author"
          }
        ]
      },
      {
        "name": "Post",
        "columns": [
          { "name": "id", "type": "Integer", "primary_key": true },
          {
            "name": "author_id",
            "type": "Integer",
            "foreign_key": { "model": "User", "ondelete": "CASCADE" }
          }
        ],
        "relationships": [
          {
            "name": "author",
            "type": "ManyToOne",
            "target_model": "User",
            "back_populates": "posts"
          }
        ]
      }
    ],
    "enums": [
      {
        "name": "PostStatus",
        "values": ["DRAFT", "PUBLISHED", "ARCHIVED"]
      }
    ]
  },
  "_ui_metadata": {
    "models": [
      { "name": "User", "position": { "x": 100, "y": 100 } },
      { "name": "Post", "position": { "x": 400, "y: 100 } }
    ],
    "enums": [
      { "name": "PostStatus", "position": { "x": 250, y: 300 } }
    ]
  }
}
```

## Backend Code Generation

The backend receives this spec and generates:
1. **SQLAlchemy models** from `schema.models`
2. **Enum classes** from `schema.enums`
3. **Alembic migrations** for database tables
4. **FastAPI routers** for CRUD endpoints
5. **Pydantic schemas** for validation
6. **Database config** from `database` section
7. **JWT auth** from `security` and `token` sections

## getUIMetadata()

Helper function to extract only UI positions (not currently used much, but available):

```typescript
const metadata = getUIMetadata();
// Returns:
{
  models: [
    { id: "V1StGXR8", position: { x: 100, y: 100 } }
  ],
  enums: [
    { id: "X2AtBbR9", position: { x: 400, y: 100 } }
  ]
}
```

## Validation

The spec is validated by:
1. **Frontend**: Zod schema in [fastapiValidation.ts](../schemas/fastapiValidation.ts.md)
2. **Backend**: Pydantic models before code generation

## Related Files
- [schemaStore.ts](../../stores/schemaStore.ts.md): Source of schema data
- [configStore.ts](../../stores/configStore.ts.md): Source of config data
- [SchemaToolbar.tsx](../../components/schema/SchemaToolbar.tsx.md): Calls this on save
- [schemas.ts](../../api/schemas.ts.md): Sends spec to backend
- [fastapiSpec.ts](../../types/fastapiSpec.ts.md): Type definitions

## Usage Example

```typescript
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

// In a component
function SaveButton() {
  const handleSave = async () => {
    // Build complete spec from all stores
    const spec = buildFastAPIProjectSpec();

    // Send to backend
    await schemas.update(projectId, spec);

    console.log("Saved project with", spec.schema.models.length, "models");
  };

  return <button onClick={handleSave}>Save Project</button>;
}
```

## Testing

```typescript
import { buildFastAPIProjectSpec } from './specBuilder';
import { useSchemaStore } from '@/stores/schemaStore';
import { useConfigStore } from '@/stores/configStore';

// Setup test data
useSchemaStore.getState().addModel({
  name: "User",
  columns: [{ name: "id", type: "Integer", primary_key: true }]
});

useConfigStore.getState().setProject({ title: "Test API" });

// Build spec
const spec = buildFastAPIProjectSpec();

// Assertions
expect(spec.project.title).toBe("Test API");
expect(spec.schema.models).toHaveLength(1);
expect(spec.schema.models[0].name).toBe("User");
expect(spec.schema.models[0]).not.toHaveProperty("id");  // UI field stripped
expect(spec._ui_metadata.models).toHaveLength(1);
```
