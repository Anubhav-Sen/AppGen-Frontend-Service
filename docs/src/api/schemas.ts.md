# schemas.ts

**Location:** `/src/api/schemas.ts`
**Type:** API Module

## Purpose

Provides CRUD API functions for schema projects. Wraps all schema project endpoints with type-safe functions.

## Exports

### `schemas` object

```typescript
export const schemas = {
    getAll(): Promise<SchemaProject[]>
    getById(id: number): Promise<SchemaProject>
    create(payload: CreateSchemaPayload): Promise<SchemaProject>
    update(id: number, payload: UpdateSchemaPayload): Promise<SchemaProject>
    delete(id: number): Promise<void>
}
```

## API Functions

### `getAll()`
```typescript
async getAll(): Promise<SchemaProject[]>
```

Fetch all schema projects for the current user.

**Returns:** Array of SchemaProject objects

**Usage:**
```typescript
import { schemas } from '@/api/schemas';

const projects = await schemas.getAll();
console.log(`Found ${projects.length} projects`);
```

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "E-commerce API",
    "schema_data": { /* FastAPI spec */ },
    "owner_id": 42,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-16T14:20:00Z"
  }
]
```

---

### `getById(id)`
```typescript
async getById(id: number): Promise<SchemaProject>
```

Fetch a single project by ID.

**Parameters:**
- `id` - Project ID

**Returns:** SchemaProject object

**Throws:** 404 if project not found or not owned by user

**Usage:**
```typescript
const project = await schemas.getById(42);
console.log(project.name);
```

---

### `create(payload)`
```typescript
async create(payload: CreateSchemaPayload): Promise<SchemaProject>
```

Create a new schema project.

**Parameters:**
```typescript
interface CreateSchemaPayload {
  name: string;
  schema_data: Record<string, unknown>;
}
```

**Returns:** Created SchemaProject with generated ID

**Usage:**
```typescript
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

const spec = buildFastAPIProjectSpec();
const newProject = await schemas.create({
  name: "My New Project",
  schema_data: spec
});

console.log(`Created project with ID: ${newProject.id}`);
```

---

### `update(id, payload)`
```typescript
async update(id: number, payload: UpdateSchemaPayload): Promise<SchemaProject>
```

Update an existing project.

**Parameters:**
- `id` - Project ID
- `payload`:
```typescript
interface UpdateSchemaPayload {
  name?: string;
  schema_data?: Record<string, unknown>;
}
```

**Returns:** Updated SchemaProject

**Usage:**
```typescript
const updatedProject = await schemas.update(42, {
  name: "Renamed Project",
  schema_data: newSpec
});
```

---

### `delete(id)`
```typescript
async delete(id: number): Promise<void>
```

Delete a project permanently.

**Parameters:**
- `id` - Project ID

**Returns:** void (204 No Content)

**Usage:**
```typescript
await schemas.delete(42);
// Project is permanently deleted
```

## How It Fits Into The Application

### Projects List Page
```typescript
import { useFetchSchemas } from '@/hooks/useFetchSchemas';
import { schemas } from '@/api/schemas';

function ProjectsListPage() {
  const { data: projects, refetch } = useFetchSchemas();

  const handleDelete = async (id: number) => {
    await schemas.delete(id);
    refetch(); // Refresh list
  };

  return (
    <div>
      {projects?.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### Schema Builder - Save Flow
```typescript
import { schemas } from '@/api/schemas';
import { useProjectStore } from '@/stores/projectStore';
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

function SchemaBuilder() {
  const { currentProject, isEditMode } = useProjectStore();

  const handleSave = async () => {
    const spec = buildFastAPIProjectSpec();

    if (isEditMode && currentProject) {
      // Update existing project
      await schemas.update(currentProject.id, {
        schema_data: spec
      });
    } else {
      // Create new project
      const newProject = await schemas.create({
        name: "New Project",
        schema_data: spec
      });
      console.log(`Saved as project #${newProject.id}`);
    }
  };
}
```

### Load Project for Editing
```typescript
import { schemas } from '@/api/schemas';
import { useProjectStore } from '@/stores/projectStore';

function loadProjectForEditing(projectId: number) {
  const project = await schemas.getById(projectId);

  // Load into stores
  useProjectStore.getState().loadProject(project);

  // Parse schema_data and populate schemaStore
  const spec = project.schema_data as FastAPIProjectSpec;
  // ... populate stores
}
```

## Integration with React Query

The `useFetchSchemas()` hook uses these API functions with React Query:

```typescript
import { useQuery } from '@tanstack/react-query';
import { schemas } from '@/api/schemas';

export function useFetchSchemas() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn: schemas.getAll, // Uses getAll() function
  });
}
```

**Cache Invalidation:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After create/update/delete
await schemas.create(payload);
queryClient.invalidateQueries({ queryKey: ['schemas'] });
// Triggers automatic refetch
```

## Error Handling

All functions use the HTTP client which handles token refresh automatically:

```typescript
try {
  const project = await schemas.getById(42);
} catch (error) {
  if (error.response?.status === 404) {
    console.error("Project not found");
  } else if (error.response?.status === 401) {
    // Token refresh happens automatically in client.ts
  } else {
    console.error("Failed to fetch project:", error);
  }
}
```

## API Endpoints

| Function | Method | Endpoint | Auth Required |
|----------|--------|----------|---------------|
| getAll() | GET | `/schemas/` | ✅ Yes |
| getById() | GET | `/schemas/{id}` | ✅ Yes |
| create() | POST | `/schemas/` | ✅ Yes |
| update() | PUT | `/schemas/{id}` | ✅ Yes |
| delete() | DELETE | `/schemas/{id}` | ✅ Yes |

## Related Files

- [client.ts](./client.ts.md): HTTP client with token refresh
- [schema.ts (types)](../types/schema.ts.md): SchemaProject type definitions
- [useFetchSchemas.ts](../hooks/useFetchSchemas.ts.md): React Query hook
- [ProjectsListPage.tsx](../pages/ProjectsListPage.tsx.md): Uses these functions
- [SchemaBuilder.tsx](../pages/SchemaBuilder.tsx.md): Save/load with these functions

## Testing

```typescript
import { schemas } from './schemas';
import { api } from './client';

jest.mock('./client');

describe('schemas API', () => {
  test('getAll returns projects', async () => {
    const mockProjects = [{ id: 1, name: 'Test' }];
    api.get.mockResolvedValue({ data: mockProjects });

    const result = await schemas.getAll();

    expect(api.get).toHaveBeenCalledWith('/schemas/');
    expect(result).toEqual(mockProjects);
  });

  test('create sends correct payload', async () => {
    const payload = { name: 'New', schema_data: {} };
    const mockResponse = { id: 42, ...payload };
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await schemas.create(payload);

    expect(api.post).toHaveBeenCalledWith('/schemas/', payload);
    expect(result.id).toBe(42);
  });
});
```

## Common Patterns

### Create → Navigate
```typescript
const handleCreate = async () => {
  const project = await schemas.create({
    name: "New Project",
    schema_data: buildFastAPIProjectSpec()
  });

  navigate(`/builder?projectId=${project.id}`);
};
```

### Update → Invalidate Cache
```typescript
const handleSave = async () => {
  await schemas.update(projectId, { schema_data: spec });
  queryClient.invalidateQueries({ queryKey: ['schemas'] });
  toast.success("Project saved!");
};
```

### Delete → Optimistic Update
```typescript
const mutation = useMutation({
  mutationFn: schemas.delete,
  onMutate: async (deletedId) => {
    // Optimistically remove from UI
    queryClient.setQueryData(['schemas'], (old) =>
      old.filter(p => p.id !== deletedId)
    );
  },
  onError: () => {
    // Rollback on error
    queryClient.invalidateQueries({ queryKey: ['schemas'] });
  }
});
```
