# schema.ts

**Location:** `/src/types/schema.ts`
**Type:** TypeScript Type Definitions

## Purpose

Defines types for schema project API responses and payloads. These types represent how the backend stores and returns project data.

## Type Definitions

### `Schema`
```typescript
interface Schema {
    id: string;
    name: string;
    modelCount: number;
}
```

Lightweight schema info (used for lists/previews).

**Usage:** Quick project cards or dropdowns.

### `SchemaProject`
```typescript
interface SchemaProject {
    id: number;                          // Database ID
    name: string;                        // Project name
    description: string | null;          // Optional description
    schema_data: Record<string, unknown>; // FastAPIProjectSpec JSON
    owner_id: number;                    // User ID
    created_at: string;                  // ISO timestamp
    updated_at: string | null;           // ISO timestamp
}
```

Complete project as returned by backend.

**Example:**
```typescript
{
  id: 42,
  name: "My Todo API",
  description: "A simple todo application",
  schema_data: {
    project: { title: "Todo API", ... },
    schema: { models: [...], ... }
  },
  owner_id: 1,
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-16T14:22:00Z"
}
```

### `CreateSchemaPayload`
```typescript
interface CreateSchemaPayload {
    name: string;                        // Project name
    description?: string;                // Optional description
    schema_data: Record<string, unknown>; // FastAPIProjectSpec
}
```

Data sent when creating a new project.

**Example:**
```typescript
{
  name: "Blog API",
  description: "Backend for blog platform",
  schema_data: {
    project: { title: "Blog API", author: "John" },
    database: { db_provider: "postgresql", db_name: "blog" },
    schema: { models: [...] }
  }
}
```

### `UpdateSchemaPayload`
```typescript
interface UpdateSchemaPayload {
    name?: string;                       // Update name
    description?: string;                // Update description
    schema_data?: Record<string, unknown>; // Update spec
}
```

Data sent when updating an existing project.

**All fields optional** - only send what changed.

## How It Fits Into The Application

### API Flow

```
Frontend                    Backend
   ↓                           ↓
buildFastAPIProjectSpec()
   ↓
CreateSchemaPayload
   ↓
POST /schemas              → Create project
   ↓                           ↓
                           SchemaProject (response)
   ↓                           ↓
Store in projectStore
```

### Full Lifecycle

#### 1. Create Project
```typescript
import { schemas } from '@/api/schemas';
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

const spec = buildFastAPIProjectSpec();

const payload: CreateSchemaPayload = {
  name: "My Project",
  description: "Project description",
  schema_data: spec
};

const project: SchemaProject = await schemas.create(payload);
console.log(project.id);  // 42
```

#### 2. Fetch Project
```typescript
const project: SchemaProject = await schemas.getById(42);

// Parse schema_data
const spec = project.schema_data as FastAPIProjectSpec;

// Load into stores
configStore.loadConfig(spec.project, spec.git, ...);
schemaStore.loadSchema(modelsWithUI, enumsWithUI, ...);
```

#### 3. Update Project
```typescript
const spec = buildFastAPIProjectSpec();

const payload: UpdateSchemaPayload = {
  name: "Updated Name",  // Optional
  schema_data: spec      // Optional
};

const updated: SchemaProject = await schemas.update(42, payload);
```

#### 4. List Projects
```typescript
const projects: SchemaProject[] = await schemas.getAll();

projects.forEach(p => {
  console.log(p.name, p.created_at);
});
```

#### 5. Delete Project
```typescript
await schemas.delete(42);
```

## Type Conversions

### Backend Response → Frontend State

```typescript
// API returns SchemaProject
const project: SchemaProject = await schemas.getById(42);

// Extract FastAPIProjectSpec
const spec = project.schema_data as FastAPIProjectSpec;

// Convert to UI types
const modelsWithUI: ModelWithUI[] = spec.schema.models.map(model => ({
  ...model,
  id: nanoid(),  // Add UI ID
  position: savedPosition || { x: 100, y: 100 }  // Add position
}));

// Load into store
schemaStore.loadSchema(modelsWithUI, enumsWithUI, associationTables);
```

### Frontend State → API Payload

```typescript
// Build spec from stores
const spec: FastAPIProjectSpec = buildFastAPIProjectSpec();

// Create payload
const payload: CreateSchemaPayload = {
  name: "My Project",
  description: "Description",
  schema_data: spec  // Includes _ui_metadata
};

// Send to API
const project = await schemas.create(payload);
```

## Snake Case vs Camel Case

**Backend uses snake_case:**
```typescript
{
  schema_data: { ... },
  owner_id: 1,
  created_at: "2025-01-15",
  updated_at: "2025-01-16"
}
```

**No conversion needed** - we keep backend naming in these types.

**Why?**
- These types represent API contracts
- Changing names would require transformation
- Better to match backend exactly

## Usage in Components

### ProjectsListPage
```typescript
import type { SchemaProject } from '@/types/schema';

const { data: projects } = useQuery<SchemaProject[]>({
  queryKey: ['schemas'],
  queryFn: schemas.getAll
});

projects?.map(project => (
  <div key={project.id}>
    <h3>{project.name}</h3>
    <p>{project.description}</p>
    <small>{formatDate(project.created_at)}</small>
  </div>
));
```

### SchemaBuilder
```typescript
const projectId = searchParams.get('projectId');

const project: SchemaProject = await schemas.getById(Number(projectId));

// Load into stores
loadProject(project);

const spec = project.schema_data as FastAPIProjectSpec;
loadConfig(spec.project, spec.git, ...);
```

## Related Files
- [schemas.ts](../api/schemas.ts.md): API functions using these types
- [fastapiSpec.ts](./fastapiSpec.ts.md): Types for schema_data field
- [projectStore.ts](../stores/projectStore.ts.md): Stores SchemaProject
- [ProjectsListPage.tsx](../pages/ProjectsListPage.tsx.md): Displays projects
- [SchemaBuilder.tsx](../pages/SchemaBuilder.tsx.md): Loads projects

## Type Safety Benefits

### API Call Type Checking
```typescript
// TypeScript ensures payload matches interface
const payload: CreateSchemaPayload = {
  name: "Project",
  // Error: Missing schema_data
};

// TypeScript ensures response matches interface
const project: SchemaProject = await schemas.create(payload);
console.log(project.id);  // ✓ TypeScript knows id exists
```

### Null Safety
```typescript
const project: SchemaProject = ...;

// TypeScript knows description can be null
if (project.description) {
  console.log(project.description.toUpperCase());  // ✓ Safe
}

// TypeScript knows updated_at can be null
const lastUpdate = project.updated_at ?? project.created_at;
```

## Complete Example

```typescript
import { schemas } from '@/api/schemas';
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';
import type { SchemaProject, CreateSchemaPayload } from '@/types/schema';

// Create project
async function createProject(name: string) {
  const spec = buildFastAPIProjectSpec();

  const payload: CreateSchemaPayload = {
    name,
    description: "My new project",
    schema_data: spec
  };

  const project: SchemaProject = await schemas.create(payload);
  return project.id;
}

// Load project
async function loadProject(id: number) {
  const project: SchemaProject = await schemas.getById(id);

  // Parse schema data
  const spec = project.schema_data as FastAPIProjectSpec;

  // Use project data
  console.log(`Loading ${project.name}`);
  console.log(`Created: ${new Date(project.created_at).toLocaleDateString()}`);

  return spec;
}

// Update project
async function updateProject(id: number, newName: string) {
  const spec = buildFastAPIProjectSpec();

  const updated: SchemaProject = await schemas.update(id, {
    name: newName,
    schema_data: spec
  });

  return updated;
}
```
