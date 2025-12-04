# ProtectedRoute.tsx

**Location:** `/src/components/ProtectedRoute.tsx`
**Type:** Route Guard Component

## Purpose

Protects routes that require authentication. Redirects unauthenticated users to the login page.

## Code

```typescript
import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type Props = {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);
    const location = useLocation();

    // Require both token and user for authenticated access
    if (!accessToken || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}
```

## How It Works

### 1. Check Authentication
```typescript
const accessToken = useAuthStore((s) => s.accessToken);
const user = useAuthStore((s) => s.user);
```

Retrieves auth state from authStore.

### 2. Redirect if Not Authenticated
```typescript
if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
}
```

**Requires BOTH:**
- Valid access token
- User object

**Redirect details:**
- `to="/login"` - Redirect destination
- `replace` - Replace history entry (back button skips this page)
- `state={{ from: location }}` - Save original destination for redirect after login

### 3. Render Children if Authenticated
```typescript
return <>{children}</>;
```

If authenticated, render the protected component.

## Usage

### In Router
```typescript
// App.tsx
{
  path: "/projects",
  element: (
    <ProtectedRoute>
      <ProjectsListPage />
    </ProtectedRoute>
  )
}
```

### Multiple Protected Routes
```typescript
const protectedRoutes = [
  { path: "/projects", component: ProjectsListPage },
  { path: "/builder", component: SchemaBuilder },
  { path: "/config", component: ConfigPage },
];

// In router
protectedRoutes.map(({ path, component: Component }) => ({
  path,
  element: (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  )
}))
```

## Redirect After Login

When redirected to login, the original URL is saved:

### Login Page
```typescript
import { useLocation, useNavigate } from 'react-router-dom';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/projects';

  const handleLogin = async (data) => {
    await login(data);
    navigate(from, { replace: true });  // Go back to original destination
  };
}
```

**Example Flow:**
```
1. User visits /builder (not logged in)
2. ProtectedRoute redirects to /login with state={{ from: { pathname: '/builder' } }}
3. User logs in
4. Redirected to /builder (original destination)
```

## Related Files

- [App.tsx](../App.tsx.md): Uses this component for protected routes
- [authStore.ts](../stores/authStore.ts.md): Source of auth state
- [PublicRoute.tsx](./PublicRoute.tsx.md): Opposite guard for public routes
- [LoginPage.tsx](../pages/auth/LoginPage.tsx.md): Redirect destination

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/stores/authStore');

test('redirects when not authenticated', () => {
  useAuthStore.mockReturnValue({
    accessToken: null,
    user: null
  });

  render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});

test('renders children when authenticated', () => {
  useAuthStore.mockReturnValue({
    accessToken: 'valid-token',
    user: { id: 1, username: 'test' }
  });

  render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
```
