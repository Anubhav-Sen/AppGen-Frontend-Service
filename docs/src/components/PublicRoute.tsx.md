# PublicRoute.tsx

**Location:** `/src/components/PublicRoute.tsx`
**Type:** Route Guard Component

## Purpose

Guards public routes (login, register, home) by redirecting already-authenticated users to the main application.

## Code

```typescript
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type Props = {
    children: ReactNode;
}

export default function PublicRoute({ children }: Props) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    // Only redirect if both token and user exist (valid session)
    if (accessToken && user) {
        return <Navigate to="/projects" replace />;
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

### 2. Redirect if Authenticated
```typescript
if (accessToken && user) {
    return <Navigate to="/projects" replace />;
}
```

**Only redirects if BOTH exist:**
- Valid access token
- User object

**Why?** Prevents logged-in users from seeing login/register pages.

### 3. Render Children if Not Authenticated
```typescript
return <>{children}</>;
```

If not authenticated, show the public page (login, register, home).

## Usage

### In Router
```typescript
// App.tsx
{
  path: "/login",
  element: (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  )
},
{
  path: "/signup",
  element: (
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  )
},
{
  path: "/",
  element: (
    <PublicRoute>
      <HomePage />
    </PublicRoute>
  )
}
```

## User Flow Examples

### Already Logged In
```
1. User logged in, visits /login
2. PublicRoute detects accessToken + user
3. Redirects to /projects
```

### Not Logged In
```
1. User not logged in, visits /login
2. PublicRoute detects no token
3. Shows LoginPage
```

### After Logout
```
1. User clicks logout
2. authStore cleared (no token, no user)
3. User can now visit /login, /signup, /
```

## Why Both Token AND User?

```typescript
if (accessToken && user) {
    // Only redirect if BOTH exist
}
```

**Prevents edge cases:**
- Token exists but user is null → Not valid session
- User exists but token is null → Not valid session
- Both must exist for authenticated state

## Difference from ProtectedRoute

| ProtectedRoute | PublicRoute |
|----------------|-------------|
| Requires auth | No auth required |
| Redirects to `/login` if not authed | Redirects to `/projects` if authed |
| Used for: projects, builder, settings | Used for: login, register, home |
| Shows page if authenticated | Shows page if NOT authenticated |

## Related Files

- [App.tsx](../App.tsx.md): Uses this component for public routes
- [authStore.ts](../stores/authStore.ts.md): Source of auth state
- [ProtectedRoute.tsx](./ProtectedRoute.tsx.md): Opposite guard for protected routes
- [LoginPage.tsx](../pages/auth/LoginPage.tsx.md): Public route example
- [RegisterPage.tsx](../pages/auth/RegisterPage.tsx.md): Public route example
- [HomePage.tsx](../pages/HomePage.tsx.md): Public route example

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/stores/authStore');

test('renders children when not authenticated', () => {
  useAuthStore.mockReturnValue({
    accessToken: null,
    user: null
  });

  render(
    <MemoryRouter>
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    </MemoryRouter>
  );

  expect(screen.getByText('Public Content')).toBeInTheDocument();
});

test('redirects when authenticated', () => {
  useAuthStore.mockReturnValue({
    accessToken: 'valid-token',
    user: { id: 1, username: 'test' }
  });

  render(
    <MemoryRouter>
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    </MemoryRouter>
  );

  expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
});
```

## Common Use Cases

### Landing Page
```typescript
// Show landing page to anonymous users
// Redirect logged-in users to app
<PublicRoute>
  <HomePage />
</PublicRoute>
```

### Login Page
```typescript
// Show login form to anonymous users
// Redirect logged-in users to projects
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

### Registration
```typescript
// Show signup form to anonymous users
// Redirect logged-in users to projects
<PublicRoute>
  <RegisterPage />
</PublicRoute>
```
