# queryClient.ts

**Location:** `/src/lib/queryClient.ts`
**Type:** React Query Configuration

## Purpose

Creates and configures the React Query client with application-wide defaults for data fetching, caching, and refetching behavior.

## Configuration

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Don't refetch when window regains focus
      staleTime: 5 * 60_000,         // Data stays fresh for 5 minutes
    },
  },
});
```

## Configuration Options

### `refetchOnWindowFocus: false`

**Default Behavior:** React Query normally refetches data when the browser tab regains focus.

**Why disabled:**
- Reduces unnecessary API calls
- Better for apps with frequently changing focus
- User can manually refresh if needed

**Re-enable if needed:**
```typescript
refetchOnWindowFocus: true
```

---

### `staleTime: 5 * 60_000` (5 minutes)

**Meaning:** Data is considered "fresh" for 5 minutes after fetching.

**Implications:**
- Within 5 minutes: No automatic refetch, uses cache
- After 5 minutes: Data is "stale" but still served from cache
- Next render triggers background refetch to update

**Example Timeline:**
```
0:00 - Fetch data from API
0:30 - Component re-renders → Uses cache (data is fresh)
5:00 - Data becomes stale
5:30 - Component re-renders → Uses cache but refetches in background
```

## Usage in Application

### In main App.tsx
```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### In Hooks
```typescript
import { useQuery } from '@tanstack/react-query';

// Inherits default config (staleTime: 5min, no refetch on focus)
function useFetchSchemas() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn: fetchSchemas,
    // Can override defaults here
  });
}
```

## Cache Behavior Examples

### Example 1: Projects List

```typescript
function ProjectsListPage() {
  const { data } = useFetchSchemas(); // Uses queryClient config

  // Timeline:
  // 1. First render: Fetches from API
  // 2. Navigate away and back within 5 min: Instant (cache)
  // 3. After 5 min: Shows cached data, refetches in background
}
```

### Example 2: Manual Invalidation

```typescript
const queryClient = useQueryClient();

// After creating a project
await schemas.create(payload);

// Force refetch (ignores staleTime)
queryClient.invalidateQueries({ queryKey: ['schemas'] });
```

## Override Default Config

### Per-Query Override
```typescript
useQuery({
  queryKey: ['schemas'],
  queryFn: fetchSchemas,
  staleTime: 0,                    // Always stale
  refetchOnWindowFocus: true,      // Refetch on focus
});
```

### Different Stale Times
```typescript
// Rarely changing data
useQuery({
  queryKey: ['user'],
  queryFn: getCurrentUser,
  staleTime: 30 * 60 * 1000,  // 30 minutes
});

// Frequently changing data
useQuery({
  queryKey: ['notifications'],
  queryFn: getNotifications,
  staleTime: 10 * 1000,  // 10 seconds
  refetchInterval: 30 * 1000,  // Auto-refetch every 30s
});
```

## Additional Options Available

While the app uses minimal config, React Query supports many options:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,

      // Additional options you can add:
      // cacheTime: 10 * 60_000,          // Cache for 10 min after unused
      // refetchOnReconnect: true,        // Refetch when network reconnects
      // retry: 3,                        // Retry failed queries 3 times
      // retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Mutation defaults
      // retry: 1,
    },
  },
});
```

## Cache Inspection (DevTools)

Install React Query DevTools for debugging:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Related Files

- [App.tsx](../../App.tsx.md): Provides QueryClientProvider
- [useFetchSchemas.ts](../../hooks/useFetchSchemas.ts.md): Uses this client config
- [schemas.ts (API)](../../api/schemas.ts.md): API functions called by queries

## Why These Defaults?

### No refetch on focus
- Schema builder app: User spends time designing, doesn't want interruptions
- Reduces unnecessary network traffic
- User can manually refresh if needed

### 5-minute stale time
- Balance between freshness and performance
- Projects don't change extremely frequently
- Background updates after 5 minutes provide fresh data
- Better UX than always showing loading states

## Common Operations

### Manual Refetch
```typescript
const { refetch } = useFetchSchemas();
<button onClick={() => refetch()}>Refresh</button>
```

### Invalidate Cache
```typescript
queryClient.invalidateQueries({ queryKey: ['schemas'] });
```

### Clear All Cache
```typescript
queryClient.clear();
```

### Prefetch Data
```typescript
await queryClient.prefetchQuery({
  queryKey: ['project', projectId],
  queryFn: () => schemas.getById(projectId),
});
```
