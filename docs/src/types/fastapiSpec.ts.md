# fastapiSpec.ts

**Location:** `/src/types/fastapiSpec.ts`
**Type:** TypeScript Type Definitions

## Purpose

This is the **central type system** for the entire application. It defines all types related to FastAPI project specifications, database schemas, models, columns, relationships, and configurations. These types ensure type safety across the entire codebase.

## Key Type Categories

### 1. Column Types

#### `ColumnTypeName`
All supported database column types:
```typescript
{
  INTEGER: "integer",        // Whole numbers
  STRING: "string",          // Variable-length text
  BOOLEAN: "boolean",        // true/false
  FLOAT: "float",           // Decimal numbers
  NUMERIC: "numeric",       // Precise decimal
  TEXT: "text",             // Long text
  DATE_TIME: "date-time",   // Timestamp
  DATE: "date",             // Date only
  TIME: "time",             // Time only
  JSON: "json",             // JSON data
  ENUM: "enum",             // Enum type
  LARGE_BINARY: "large-binary",  // Binary data (files)
  INTERVAL: "interval",     // Time intervals
  BIG_INTEGER: "big-integer",    // Large integers
  UUID: "uuid",             // UUID type
  CHAR: "char",             // Fixed-length text
  VARCHAR: "varchar",       // Variable char
}
```

#### `ColumnType`
Full column type specification:
```typescript
interface ColumnType {
  name: ColumnTypeName;
  length?: number;          // For VARCHAR(255)
  precision?: number;       // For NUMERIC(10,2)
  scale?: number;           // For NUMERIC(10,2)
  enum_class?: string;      // Reference to enum name
}
```

### 2. Column Definition

#### `Column`
Complete column specification:
```typescript
interface Column {
  name: string;                    // Column name
  type: ColumnType;                // Column type
  primary_key?: boolean;           // Is primary key
  nullable?: boolean;              // Can be NULL
  unique?: boolean;                // Unique constraint
  index?: boolean;                 // Create index
  autoincrement?: boolean;         // Auto-increment
  foreign_key?: string;            // FK reference
  default?: string | number | boolean | null;  // Default value
  server_default?: string;         // SQL default expression
  info?: Record<string, unknown>;  // Additional metadata
}
```

**Example:**
```typescript
{
  name: "email",
  type: { name: "string" },
  nullable: false,
  unique: true,
  index: true
}
```

### 3. Relationships

#### `CascadeOption`
SQLAlchemy cascade options:
```typescript
{
  SAVE_UPDATE: "save-update",
  MERGE: "merge",
  EXPUNGE: "expunge",
  DELETE: "delete",
  DELETE_ORPHAN: "delete-orphan",
  REFRESH_EXPIRE: "refresh-expire",
  ALL: "all",
}
```

#### `Relationship`
Model relationship definition:
```typescript
interface Relationship {
  name: string;                    // Relationship name (e.g., "posts")
  target: string;                  // Target model name
  back_populates?: string;         // Reverse relationship name
  backref?: string;                // Alternative to back_populates
  secondary?: string;              // Association table (ManyToMany)
  remote_side?: string[];          // Remote column (self-referential)
  cascade?: CascadeOption[];       // Cascade behavior
  uselist?: boolean;               // Is collection (vs single)
  order_by?: string;               // Default ordering
}
```

**Example (OneToMany):**
```typescript
{
  name: "posts",
  target: "Post",
  back_populates: "author",
  cascade: ["delete"],
  uselist: true
}
```

### 4. Model Definition

#### `Model`
Database model/table:
```typescript
interface Model {
  name: string;                    // Model name (e.g., "User")
  tablename: string;               // Table name (e.g., "users")
  columns: Column[];               // Column definitions
  relationships?: Relationship[];  // Relationships
  is_user?: boolean;               // Is user auth model
  username_field?: string;         // Username column
  password_field?: string;         // Password column
}
```

**Example:**
```typescript
{
  name: "User",
  tablename: "users",
  columns: [
    { name: "id", type: { name: "integer" }, primary_key: true, autoincrement: true },
    { name: "email", type: { name: "string" }, unique: true }
  ],
  relationships: [
    { name: "posts", target: "Post", back_populates: "author" }
  ],
  is_user: true,
  username_field: "email",
  password_field: "password_hash"
}
```

### 5. UI-Enhanced Types

#### `ModelWithUI`
Model with UI-specific fields:
```typescript
interface ModelWithUI extends Model {
  id: string;                      // Frontend-only ID (nanoid)
  position?: { x: number; y: number };  // React Flow position
}
```

#### `EnumWithUI`
Enum with UI-specific fields:
```typescript
interface EnumWithUI extends EnumDefinition {
  id: string;                      // Frontend-only ID
  position?: { x: number; y: number };  // React Flow position
}
```

**Why separate types?**
- Backend doesn't need `id` or `position`
- Frontend needs them for React Flow rendering
- Clean separation of concerns

### 6. Enum Definition

#### `EnumDefinition`
Enum type definition:
```typescript
interface EnumDefinition {
  name: string;                    // Enum name (e.g., "UserRole")
  values: string[];                // Enum values
}
```

**Example:**
```typescript
{
  name: "UserRole",
  values: ["ADMIN", "USER", "GUEST"]
}
```

### 7. Association Tables

#### `AssociationTable`
Join table for ManyToMany relationships:
```typescript
interface AssociationTable {
  name: string;                    // Table name
  tablename: string;               // SQL table name
  columns: Column[];               // Usually two FKs
}
```

**Example:**
```typescript
{
  name: "UserGroupAssociation",
  tablename: "user_groups",
  columns: [
    {
      name: "user_id",
      type: { name: "integer" },
      foreign_key: "users.id"
    },
    {
      name: "group_id",
      type: { name: "integer" },
      foreign_key: "groups.id"
    }
  ]
}
```

### 8. Schema

#### `Schema`
Complete database schema:
```typescript
interface Schema {
  enums?: EnumDefinition[];           // Enum definitions
  association_tables?: AssociationTable[];  // Join tables
  models: Model[];                    // All models
}
```

### 9. Configuration Types

#### `ProjectConfig`
Project metadata:
```typescript
interface ProjectConfig {
  title: string;                   // Project title
  author?: string;                 // Author name
  description?: string;            // Description
}
```

#### `DatabaseConfig`
Database connection:
```typescript
interface DatabaseConfig {
  db_provider: DBProvider;         // "postgresql" | "sqlite" | "mysql"
  db_name: string;                 // Database name
  db_host?: string;                // Host (localhost)
  db_port?: number;                // Port (5432)
  db_username?: string;            // Username
  db_password?: string;            // Password
  db_driver?: string;              // SQLAlchemy driver
  db_options?: string;             // Connection options
  db_connect_args?: string;        // Connect arguments
}
```

#### `SecurityConfig`
Security settings:
```typescript
interface SecurityConfig {
  secret_key: string;              // JWT secret key
  algorithm: string;               // JWT algorithm (HS256, RS256, etc.)
}
```

#### `TokenConfig`
Token expiration:
```typescript
interface TokenConfig {
  access_token_expire_minutes: number;   // Access token TTL
  refresh_token_expire_days: number;     // Refresh token TTL
}
```

#### `GitConfig`
Git repository:
```typescript
interface GitConfig {
  username: string;                // GitHub username
  repository: string;              // Repo name
  branch: string;                  // Branch (main)
}
```

### 10. Complete Project Spec

#### `FastAPIProjectSpec`
The complete project specification:
```typescript
interface FastAPIProjectSpec {
  project: ProjectConfig;
  git: GitConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  token: TokenConfig;
  schema: Schema;
}
```

This is what gets saved to the backend and used for code generation.

### 11. Validation & Export

#### `ValidationError`
Form validation error:
```typescript
interface ValidationError {
  field: string;                   // Field name
  message: string;                 // Error message
  value?: unknown;                 // Invalid value
}
```

#### `ProjectExport`
Export with metadata:
```typescript
interface ProjectExport {
  version: string;                 // Spec version
  spec: FastAPIProjectSpec;        // Full spec
  uiMetadata?: {
    models: Array<{ id: string; position: { x, y } }>;
    enums: Array<{ id: string; position: { x, y } }>;
  };
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

## How It Fits Into The Application

### Type Flow

```
User Input
  ↓
Forms (validated with Zod)
  ↓
Zustand Stores (typed with these interfaces)
  ↓
specBuilder.ts (converts to FastAPIProjectSpec)
  ↓
API call (JSON serialized)
  ↓
Backend (validates and generates code)
```

### Usage Examples

#### In Components
```typescript
import type { ModelWithUI, Column } from '@/types/fastapiSpec';

function ModelEditor({ model }: { model: ModelWithUI }) {
  const addColumn = (column: Column) => {
    // TypeScript ensures column has all required fields
  };
}
```

#### In Stores
```typescript
import type { ModelWithUI, EnumWithUI } from '@/types/fastapiSpec';

interface SchemaState {
  models: ModelWithUI[];
  enums: EnumWithUI[];
}
```

#### In API
```typescript
import type { FastAPIProjectSpec } from '@/types/fastapiSpec';

async function saveProject(spec: FastAPIProjectSpec) {
  // TypeScript ensures spec has all required fields
  await api.post('/projects', spec);
}
```

## Type Safety Benefits

### 1. Autocomplete
IDE suggests available fields:
```typescript
const column: Column = {
  name: "email",
  type: { name: "string" },
  // IDE suggests: nullable, unique, index, etc.
};
```

### 2. Error Detection
Catches errors at compile time:
```typescript
const model: Model = {
  name: "User",
  // Error: Property 'tablename' is missing
};
```

### 3. Refactoring Safety
Change a type, find all usages:
```typescript
// Change Column interface
interface Column {
  name: string;
  columnType: ColumnType;  // Renamed from 'type'
}

// TypeScript shows errors everywhere Column is used
```

### 4. Documentation
Types serve as documentation:
```typescript
// What fields does a relationship have?
// Just hover over Relationship in your IDE!
```

## Const Enums Pattern

```typescript
export const ColumnTypeName = {
  INTEGER: "integer",
  STRING: "string",
} as const;

export type ColumnTypeName = typeof ColumnTypeName[keyof typeof ColumnTypeName];
```

**Benefits:**
- Runtime object for iteration: `Object.keys(ColumnTypeName)`
- Type for type checking: `type: ColumnTypeName`
- No enum duplication

**Usage:**
```typescript
// Runtime
console.log(ColumnTypeName.INTEGER);  // "integer"

// Type
const type: ColumnTypeName = "integer";  // ✓
const type: ColumnTypeName = "invalid";  // ✗ Error
```

## Related Files
- [schemaStore.ts](../stores/schemaStore.ts.md): Uses ModelWithUI, EnumWithUI
- [configStore.ts](../stores/configStore.ts.md): Uses config interfaces
- [specBuilder.ts](../lib/serializers/specBuilder.ts.md): Builds FastAPIProjectSpec
- [reactFlow.ts](./reactFlow.ts.md): Extends these types for React Flow

## Best Practices

### 1. Always Import Types
```typescript
import type { Model } from '@/types/fastapiSpec';
```
Use `type` keyword for type-only imports.

### 2. Use Partial for Updates
```typescript
function updateModel(id: string, updates: Partial<Model>) {
  // updates can have any subset of Model fields
}
```

### 3. Extend Types, Don't Modify
```typescript
// ✓ Good
interface ModelWithUI extends Model {
  id: string;
}

// ✗ Bad
interface Model {
  id: string;  // Don't modify shared types
}
```

### 4. Use Type Guards
```typescript
function isModel(obj: unknown): obj is Model {
  return typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'tablename' in obj;
}
```

## Type Hierarchy

```
FastAPIProjectSpec
├── ProjectConfig
├── GitConfig
├── DatabaseConfig (uses DBProvider)
├── SecurityConfig
├── TokenConfig
└── Schema
    ├── EnumDefinition[]
    ├── AssociationTable[]
    │   └── Column[]
    └── Model[]
        ├── Column[] (uses ColumnType)
        └── Relationship[] (uses CascadeOption)

ModelWithUI extends Model
  + id: string
  + position?: { x, y }

EnumWithUI extends EnumDefinition
  + id: string
  + position?: { x, y }
```

---

**This file is the foundation of type safety in the entire application.**
