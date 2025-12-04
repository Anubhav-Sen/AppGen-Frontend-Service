# useFetchSchemas.ts

**Location:** `/src/hooks/useFetchSchemas.ts`
**Type:** React Custom Hook (React Query)

## Purpose

A React Query hook for fetching schema projects from the API with automatic caching, background refetching, and loading states.

## Hook Interface

```typescript
function useFetchSchemas(): UseQueryResult<SchemaProject[], Error>
```

## Implementation

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export function useFetchSchemas() {
    return useQuery({
        queryKey: ["schemas"],
        queryFn: async () => (await api.get("/schemas")).data,
    });
}
```

## Usage

```typescript
import { useFetchSchemas } from '@/hooks/useFetchSchemas';

function ProjectsList() {
  const { data, isLoading, error, refetch } = useFetchSchemas();

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {data?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## Return Values

```typescript
{
  data: SchemaProject[] | undefined,  // Projects data
  isLoading: boolean,                 // Initial load
  isFetching: boolean,                // Any fetch (including background)
  error: Error | null,                // Error object
  refetch: () => void,                // Manual refetch
  isSuccess: boolean,                 // Query succeeded
  isError: boolean,                   // Query failed
  // ... other React Query properties
}
```

## React Query Benefits

### 1. Automatic Caching
```typescript
// First component
function ComponentA() {
  const { data } = useFetchSchemas();  // Fetches from API
  // ...
}

// Second component
function ComponentB() {
  const { data } = useFetchSchemas();  // Uses cache!
  // ...
}
```

### 2. Background Refetching
React Query automatically refetches when:
- Window regains focus
- Network reconnects
- Manual refetch() call
- Query becomes stale

### 3. Loading States
```typescript
const { data, isLoading, isFetching } = useFetchSchemas();

if (isLoading) {
  return <Spinner />;  // Initial load
}

return (
  <div>
    {isFetching && <SmallSpinner />}  // Background refetch
    {data?.map(...)}
  </div>
);
```

### 4. Error Handling
```typescript
const { error, isError } = useFetchSchemas();

if (isError) {
  return <Alert>{error.message}</Alert>;
}
```

## Cache Configuration

Default React Query config (from [queryClient.ts](../lib/queryClient.ts.md)):
```typescript
{
  staleTime: 0,              // Data immediately stale
  cacheTime: 5 * 60 * 1000,  // Cache for 5 minutes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
}
```

### Custom Configuration
```typescript
export function useFetchSchemas() {
    return useQuery({
        queryKey: ["schemas"],
        queryFn: async () => (await api.get("/schemas")).data,
        staleTime: 60 * 1000,      // Fresh for 1 minute
        refetchInterval: 30 * 1000, // Auto-refetch every 30s
    });
}
```

## Query Key

`["schemas"]` - The cache key for this query.

**Why important?**
- Identifies cached data
- Used for invalidation
- Used for manual updates

## Invalidation

When a project is created/updated/deleted, invalidate the cache:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After creating a project
await schemas.create(payload);
queryClient.invalidateQueries({ queryKey: ['schemas'] });
// Triggers automatic refetch in all components using useFetchSchemas()
```

## How It Fits Into The Application

### ProjectsListPage
```typescript
function ProjectsListPage() {
  const { data: projects, isLoading, error } = useFetchSchemas();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Create/Update Flow
```typescript
function CreateProjectButton() {
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    await schemas.create(payload);
    // Invalidate cache → useFetchSchemas() refetches automatically
    queryClient.invalidateQueries({ queryKey: ['schemas'] });
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

## Comparison: React Query vs useState

### Without React Query (Manual)
```typescript
function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    schemas.getAll()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // No caching, no background updates, manual refetch
}
```

### With React Query (Automatic)
```typescript
function ProjectsList() {
  const { data: projects, isLoading, error } = useFetchSchemas();

  // Automatic caching, background updates, easy refetch
}
```

## Advanced Usage

### Dependent Queries
```typescript
function ProjectDetails({ projectId }) {
  const { data: projects } = useFetchSchemas();

  const project = projects?.find(p => p.id === projectId);

  // Only fetch if project found
  const { data: details } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: () => schemas.getById(projectId),
    enabled: !!project,  // Only run if project exists
  });
}
```

### Optimistic Updates
```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: schemas.delete,
  onMutate: async (deletedId) => {
    // Cancel ongoing fetches
    await queryClient.cancelQueries({ queryKey: ['schemas'] });

    // Snapshot current value
    const previous = queryClient.getQueryData(['schemas']);

    // Optimistically update
    queryClient.setQueryData(['schemas'], (old) =>
      old.filter(p => p.id !== deletedId)
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['schemas'], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure correct data
    queryClient.invalidateQueries({ queryKey: ['schemas'] });
  },
});
```

## Related Files
- [schemas.ts (API)](../api/schemas.ts.md): API functions
- [queryClient.ts](../lib/queryClient.ts.md): React Query config
- [ProjectsListPage.tsx](../pages/ProjectsListPage.tsx.md): Main usage
- [schema.ts (types)](../types/schema.ts.md): SchemaProject type

## Why Use This Hook?

✅ **Automatic caching** - No duplicate API calls
✅ **Background updates** - Data stays fresh
✅ **Loading states** - Built-in isLoading, isFetching
✅ **Error handling** - Automatic error states
✅ **Refetch control** - Manual and automatic
✅ **Optimistic updates** - Instant UI updates
✅ **Query invalidation** - Easy cache updates

## Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFetchSchemas } from './useFetchSchemas';

test('fetches schemas', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useFetchSchemas(), { wrapper });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toHaveLength(2);
});
```
