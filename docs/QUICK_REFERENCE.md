# Quick Reference Guide

**Reading Time:** 15 minutes
**Purpose:** Fast lookup for common development tasks

---

## Table of Contents

1. [Common Commands](#common-commands)
2. [State Management Recipes](#state-management-recipes)
3. [API Call Patterns](#api-call-patterns)
4. [Component Patterns](#component-patterns)
5. [Type Definitions](#type-definitions)
6. [Debugging Tips](#debugging-tips)
7. [Environment Variables](#environment-variables)

---

## Common Commands

### Development
```bash
# Start dev server (localhost:5173)
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint all files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format all files
npm run format

# Check formatting
npm run format:check
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Docker build
docker build -t appgen-frontend --build-arg VITE_API_BASE_URL=http://api.example.com/api .

# Docker run
docker run -p 3000:3000 appgen-frontend
```

---

## State Management Recipes

### Authentication

#### Check if user is logged in
```typescript
import { useAuthStore } from '@/stores/authStore';

const user = useAuthStore(state => state.user);
const isLoggedIn = user !== null;
```

#### Login user
```typescript
import { auth } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

const { setAuth, setRememberMe } = useAuthStore();

const response = await auth.login(
  { email, password },
  rememberMe
);

setRememberMe(rememberMe);
setAuth({
  accessToken: response.accessToken,
  user: response.user
});
```

#### Logout user
```typescript
const clearAuth = useAuthStore(state => state.clearAuth);
clearAuth();
// Then navigate to /login
```

#### Get current user
```typescript
const user = useAuthStore(state => state.user);
console.log(user?.username);
```

### Schema Management

#### Add a model
```typescript
import { useSchemaStore } from '@/stores/schemaStore';

const addModel = useSchemaStore(state => state.addModel);

const modelId = addModel({
  name: "User",
  tablename: "users",
  columns: [
    {
      name: "id",
      type: "Integer",
      primary_key: true,
      autoincrement: true
    },
    {
      name: "email",
      type: "String",
      unique: true,
      nullable: false
    }
  ],
  position: { x: 100, y: 100 }
});
```

#### Update a model
```typescript
const updateModel = useSchemaStore(state => state.updateModel);

updateModel(modelId, {
  name: "UpdatedUser",
  tablename: "updated_users"
});
```

#### Add a column to a model
```typescript
const addColumn = useSchemaStore(state => state.addColumn);

addColumn(modelId, {
  name: "created_at",
  type: "DateTime",
  default: "now()"
});
```

#### Delete a column
```typescript
const deleteColumn = useSchemaStore(state => state.deleteColumn);
deleteColumn(modelId, "column_name");
```

#### Add a relationship
```typescript
const addRelationship = useSchemaStore(state => state.addRelationship);

addRelationship(modelId, {
  name: "posts",
  type: "OneToMany",
  target_model: "Post",
  back_populates: "author"
});
```

#### Get all models
```typescript
const models = useSchemaStore(state => state.models);
console.log(`${models.length} models`);
```

#### Clear all schema data
```typescript
const clearAll = useSchemaStore(state => state.clearAll);
clearAll();
```

### Configuration

#### Set project config
```typescript
import { useConfigStore } from '@/stores/configStore';

const setProject = useConfigStore(state => state.setProject);

setProject({
  title: "My API",
  author: "John Doe",
  description: "API description"
});
```

#### Set database config
```typescript
const setDatabase = useConfigStore(state => state.setDatabase);

setDatabase({
  db_provider: "postgresql",
  db_name: "mydb",
  db_host: "localhost",
  db_port: 5432,
  db_username: "user",
  db_password: "password"
});
```

#### Reset config to defaults
```typescript
const resetToDefaults = useConfigStore(state => state.resetToDefaults);
resetToDefaults();
```

---

## API Call Patterns

### Authentication

#### Login
```typescript
import { auth } from '@/api/auth';

try {
  const response = await auth.login(
    { email: "user@example.com", password: "pass123" },
    true  // remember me
  );
  console.log(response.user);
} catch (error) {
  console.error(getErrorMessage(error));
}
```

#### Register
```typescript
import { auth } from '@/api/auth';

try {
  const user = await auth.register({
    email: "new@example.com",
    username: "newuser",
    password: "password123"
  });
  console.log(user.id);
} catch (error) {
  console.error(getErrorMessage(error));
}
```

### Schema Projects

#### Get all projects
```typescript
import { schemas } from '@/api/schemas';

const projects = await schemas.getAll();
console.log(projects.length);
```

#### Get project by ID
```typescript
const project = await schemas.getById(projectId);
console.log(project.name);
```

#### Create project
```typescript
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

const spec = buildFastAPIProjectSpec();
const project = await schemas.create({
  name: "My Project",
  spec: spec
});
```

#### Update project
```typescript
const spec = buildFastAPIProjectSpec();
const updated = await schemas.update(projectId, {
  name: "Updated Name",
  spec: spec
});
```

#### Delete project
```typescript
await schemas.delete(projectId);
```

### With React Query

#### Fetch schemas with caching
```typescript
import { useQuery } from '@tanstack/react-query';
import { schemas } from '@/api/schemas';

function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schemas'],
    queryFn: schemas.getAll,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

#### Mutation with cache invalidation
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function DeleteButton({ projectId }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => schemas.delete(projectId),
    onSuccess: () => {
      // Refetch projects list
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate()}>
      Delete
    </button>
  );
}
```

---

## Component Patterns

### Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await auth.login(data, false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Protected Route

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function ProtectedRoute({ children }) {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in App.tsx
<Route
  path="/projects"
  element={
    <ProtectedRoute>
      <ProjectsListPage />
    </ProtectedRoute>
  }
/>
```

### Modal Dialog

```typescript
function MyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2>Modal Title</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

### Custom React Flow Node

```typescript
import { Handle, Position } from '@xyflow/react';

function CustomNode({ data }) {
  return (
    <div className="px-4 py-2 shadow rounded bg-white border">
      <Handle type="target" position={Position.Top} />

      <div className="font-bold">{data.label}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Register in SchemaBuilder.tsx
const nodeTypes = {
  custom: CustomNode,
};

<ReactFlow nodeTypes={nodeTypes} ... />
```

---

## Type Definitions

### Common Types

```typescript
// User
interface User {
  id: number;
  email: string;
  username: string;
  isActive: boolean;
}

// Model (without UI fields)
interface Model {
  name: string;
  tablename?: string;
  columns: Column[];
  relationships?: Relationship[];
}

// Model with UI fields
interface ModelWithUI extends Model {
  id: string;
  position: { x: number; y: number };
}

// Column
interface Column {
  name: string;
  type: ColumnTypeName;
  primary_key?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  autoincrement?: boolean;
  default?: string | number | boolean;
  foreign_key?: {
    model: string;
    ondelete?: "CASCADE" | "SET NULL" | "RESTRICT";
  };
}

// Column types
type ColumnTypeName =
  | "Integer"
  | "String"
  | "Text"
  | "Boolean"
  | "Float"
  | "DateTime"
  | "Date"
  | "Time"
  | "JSON";

// Relationship
interface Relationship {
  name: string;
  type: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany";
  target_model: string;
  back_populates?: string;
  foreign_key?: string;
  association_table?: string;
}

// Enum
interface EnumDefinition {
  name: string;
  values: string[];
}

// FastAPI Project Spec
interface FastAPIProjectSpec {
  project: ProjectConfig;
  git: GitConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  token: TokenConfig;
  schema: Schema;
}
```

### Type Inference from Zod

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Infer TypeScript type from Zod schema
type LoginData = z.infer<typeof loginSchema>;
// Result: { email: string; password: string }
```

---

## Debugging Tips

### Check Zustand Store State

```javascript
// In browser console

// Auth store
JSON.parse(localStorage.getItem('auth-storage'))

// Schema store
JSON.parse(localStorage.getItem('schema-storage'))

// Config store
JSON.parse(localStorage.getItem('config-storage'))

// Or directly
useAuthStore.getState()
useSchemaStore.getState()
useConfigStore.getState()
```

### Clear All State

```javascript
// Clear localStorage
localStorage.clear()

// Or specific stores
localStorage.removeItem('auth-storage')
localStorage.removeItem('schema-storage')
localStorage.removeItem('config-storage')

// Then reload
window.location.reload()
```

### Debug API Calls

```javascript
// Check access token
useAuthStore.getState().accessToken

// Check if request is being sent
// Open Network tab in DevTools
// Look for Authorization header: Bearer <token>

// Manually refresh token
const { api } = await import('./src/api/client');
const response = await api.post('/auth/refresh');
console.log(response.data);
```

### Debug React Flow

```javascript
// Get all nodes
const nodes = useSchemaStore.getState().models;

// Check node positions
nodes.forEach(n => console.log(n.name, n.position));

// Count relationships
const relCount = nodes.reduce(
  (sum, m) => sum + (m.relationships?.length || 0),
  0
);
console.log(`${relCount} relationships`);
```

### TypeScript Errors

```bash
# Type check without building
npm run typecheck

# Check specific file
npx tsc --noEmit src/path/to/file.ts

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Vite Build Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist folder
rm -rf dist

# Rebuild
npm run build
```

---

## Environment Variables

### Development

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production

Set environment variable before build:
```bash
VITE_API_BASE_URL=https://api.production.com/api npm run build
```

### Docker

Pass as build argument:
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.production.com/api \
  -t appgen-frontend .
```

### Accessing in Code

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiUrl);  // "http://localhost:8000/api"

// With fallback
const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
```

### Important Notes

- **Prefix required**: All env vars must start with `VITE_`
- **Build time**: Values are embedded at build time, not runtime
- **No secrets**: Don't put secrets in client env vars (they're exposed)

---

## Path Aliases

### Using @ Alias

```typescript
// ❌ Don't do this
import { useAuth } from '../../../hooks/useAuth';

// ✅ Do this
import { useAuth } from '@/hooks/useAuth';
```

### Configured in:
- `vite.config.ts`: For Vite
- `tsconfig.app.json`: For TypeScript
- `jest.config.ts`: For tests

---

## Common Errors & Solutions

### Error: "Cannot find module '@/...'"
**Solution:** Restart dev server, check path alias config

### Error: Token refresh loop
**Solution:** Clear cookies, re-login, check backend

### Error: React Flow nodes not rendering
**Solution:** Check that models have `id` and `position` fields

### Error: TypeScript type mismatch
**Solution:** Update types in `src/types/` to match backend

### Error: CORS error
**Solution:** Check backend CORS config, ensure `withCredentials: true`

---

## Performance Tips

### Optimize Zustand Selectors

```typescript
// ❌ Bad: Re-renders on any state change
const store = useSchemaStore();

// ✅ Good: Only re-renders when models change
const models = useSchemaStore(state => state.models);
```

### Memoize Expensive Calculations

```typescript
const nodes = useMemo(() => {
  return modelsToNodes(models);
}, [models]);
```

### Lazy Load Routes

```typescript
import { lazy, Suspense } from 'react';

const SchemaBuilder = lazy(() => import('@/pages/SchemaBuilder'));

<Suspense fallback={<div>Loading...</div>}>
  <SchemaBuilder />
</Suspense>
```

---

## Testing Patterns

### Test Component

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Test with Zustand Store

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSchemaStore } from '@/stores/schemaStore';

test('adds model', () => {
  const { result } = renderHook(() => useSchemaStore());

  act(() => {
    result.current.addModel({ name: 'User', columns: [] });
  });

  expect(result.current.models).toHaveLength(1);
  expect(result.current.models[0].name).toBe('User');
});
```

---

**For detailed documentation, see [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)**
