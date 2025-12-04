# App.tsx

**Location:** `/src/App.tsx`
**Type:** Root Application Component

## Purpose

The root component that sets up:
1. React Router with all application routes
2. React Query provider for data fetching
3. Layout structure with Navbar
4. Protected and public route guards

## Code Structure

```typescript
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
// ... page imports

const queryClient = new QueryClient();

function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [ /* routes */ ]
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

## Key Components

### 1. Query Client
```typescript
const queryClient = new QueryClient();
```

Creates React Query client for data fetching/caching.

**Wraps app:**
```typescript
<QueryClientProvider client={queryClient}>
  {/* App */}
</QueryClientProvider>
```

---

### 2. Layout Component
```typescript
function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

**Purpose:** Provides consistent layout with navbar for all pages.

**Structure:**
- Full height container (h-screen)
- Navbar at top (sticky)
- Main content area (flex-1, scrollable)
- `<Outlet />` renders child route components

---

### 3. Router Configuration

```typescript
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public routes
      { path: "/", element: <PublicRoute><HomePage /></PublicRoute> },
      { path: "/login", element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: "/signup", element: <PublicRoute><RegisterPage /></PublicRoute> },

      // Protected routes
      { path: "/projects", element: <ProtectedRoute><ProjectsListPage /></ProtectedRoute> },
      { path: "/config", element: <ProtectedRoute><ConfigPage /></ProtectedRoute> },
      { path: "/builder", element: <ProtectedRoute><SchemaBuilder /></ProtectedRoute> },
      { path: "/manage-account", element: <ProtectedRoute><ManageAccountPage /></ProtectedRoute> }
    ]
  }
]);
```

---

## Route Definitions

### Public Routes (Accessible when NOT logged in)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | HomePage | Landing page |
| `/login` | LoginPage | User login |
| `/signup` | RegisterPage | User registration |

**Behavior:**
- If user is logged in → Redirect to `/projects`
- If not logged in → Show page

---

### Protected Routes (Require authentication)

| Path | Component | Purpose |
|------|-----------|---------|
| `/projects` | ProjectsListPage | List all projects |
| `/config` | ConfigPage | Configure new project |
| `/builder` | SchemaBuilder | Visual schema builder |
| `/manage-account` | ManageAccountPage | User account settings |

**Behavior:**
- If user is logged in → Show page
- If not logged in → Redirect to `/login`

---

## Route Guards

### PublicRoute
```typescript
<PublicRoute>
  <HomePage />
</PublicRoute>
```

**Logic:**
- Check if `accessToken` and `user` exist in authStore
- If both exist → Redirect to `/projects`
- Otherwise → Render children

**Use case:** Login/register pages should redirect authenticated users away.

---

### ProtectedRoute
```typescript
<ProtectedRoute>
  <ProjectsListPage />
</ProtectedRoute>
```

**Logic:**
- Check if `accessToken` and `user` exist in authStore
- If both exist → Render children
- Otherwise → Redirect to `/login`

**Use case:** Protect pages that require authentication.

---

## Application Flow

### User Not Logged In
```
Visit /builder
  ↓
ProtectedRoute checks auth
  ↓
No token/user
  ↓
Redirect to /login
```

### User Logged In
```
Visit /
  ↓
PublicRoute checks auth
  ↓
Has token/user
  ↓
Redirect to /projects
```

### Successful Login
```
Submit login form
  ↓
auth.login() succeeds
  ↓
authStore updated (token + user)
  ↓
Navigate to /projects
  ↓
ProtectedRoute allows access
```

---

## Layout Behavior

### Full Height Layout
```typescript
<div className="h-screen flex flex-col overflow-hidden">
```

- `h-screen`: 100vh height
- `flex flex-col`: Vertical flex layout
- `overflow-hidden`: Prevent body scroll

### Navbar
```typescript
<Navbar />
```

Fixed at top, contains navigation links.

### Main Content
```typescript
<main className="flex-1 overflow-auto">
  <Outlet />
</main>
```

- `flex-1`: Takes remaining height
- `overflow-auto`: Scrollable content
- `<Outlet />`: Renders current route's component

---

## How Routes Work

### Nested Routes Example
```
URL: /builder
  ↓
Router matches: { element: <Layout />, children: [...] }
  ↓
Renders:
  <Layout>
    <Navbar />
    <main>
      <Outlet /> ← Replaced with <SchemaBuilder />
    </main>
  </Layout>
```

---

## Related Files

- [Navbar.tsx](../components/Navbar.tsx.md): Navigation component
- [ProtectedRoute.tsx](../components/ProtectedRoute.tsx.md): Auth guard for protected routes
- [PublicRoute.tsx](../components/PublicRoute.tsx.md): Guard for public routes
- [authStore.ts](../stores/authStore.ts.md): Authentication state
- [queryClient.ts](../lib/queryClient.ts.md): React Query configuration
- All page components (HomePage, LoginPage, etc.)

---

## Adding New Routes

### Add Public Route
```typescript
{
  path: "/about",
  element: (
    <PublicRoute>
      <AboutPage />
    </PublicRoute>
  )
}
```

### Add Protected Route
```typescript
{
  path: "/settings",
  element: (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  )
}
```

### Add Route Without Guards
```typescript
{
  path: "/public-page",
  element: <PublicPage />
}
```

---

## Common Patterns

### Navigation
```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/projects');
  };
}
```

### Get Current Route
```typescript
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  console.log(location.pathname); // "/builder"
}
```

### Route Parameters
```typescript
// Define route with param
{
  path: "/projects/:id",
  element: <ProtectedRoute><ProjectDetail /></ProtectedRoute>
}

// Access param in component
import { useParams } from 'react-router-dom';

function ProjectDetail() {
  const { id } = useParams();
  // id from URL
}
```

---

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders home page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
```

---

## Customization Examples

### Add 404 Page
```typescript
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // ... existing routes
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
```

### Add Loading State
```typescript
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes.map(route => ({
      ...route,
      loader: () => <LoadingSpinner />
    }))
  }
]);
```

### Add Error Boundary
```typescript
const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [...]
  }
]);
```
