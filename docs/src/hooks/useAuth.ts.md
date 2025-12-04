# useAuth.ts

**Location:** `/src/hooks/useAuth.ts`
**Type:** React Custom Hook

## Purpose

Provides a convenient wrapper around authStore for authentication operations. Simplifies login and logout logic in components.

## Hook Interface

```typescript
function useAuth(): {
  user: User | null;
  login: (payload: LoginPayload, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: () => void;
}
```

## Exports

### `useAuth()`
Returns authentication state and methods.

**Returns:**
```typescript
{
  user: User | null,           // Current user (null if not logged in)
  login: Function,             // Login function
  logout: Function             // Logout function
}
```

## Implementation

```typescript
export function useAuth() {
    const { user, setUser, setAccessToken, clearAuth, setRememberMe } = useAuthStore();

    async function login(payload: LoginPayload, rememberMe: boolean = false) {
        const response = await auth.login(payload, rememberMe);
        setUser(response.user);
        setAccessToken(response.accessToken);
        setRememberMe(rememberMe);
        return response;
    }

    function logout() {
        clearAuth();
    }

    return { user, login, logout };
}
```

## Usage Examples

### Login
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await login(
        { email: data.email, password: data.password },
        data.rememberMe
      );
      navigate('/projects');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Logout
```typescript
import { useAuth } from '@/hooks/useAuth';

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <p>Logged in as {user?.username}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Check Auth Status
```typescript
function MyComponent() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.username}!</div>;
}
```

## How It Fits Into The Application

### Component Flow
```
LoginPage
  ↓
useAuth()
  ↓
login(email, password, rememberMe)
  ↓
auth.login() API call
  ↓
authStore updated (user, accessToken, rememberMe)
  ↓
Navigate to /projects
```

### Logout Flow
```
UserMenu
  ↓
useAuth()
  ↓
logout()
  ↓
authStore.clearAuth()
  ↓
Navigate to /login
```

## Why Use This Hook?

### Without Hook (Verbose)
```typescript
function LoginPage() {
  const setUser = useAuthStore(state => state.setUser);
  const setAccessToken = useAuthStore(state => state.setAccessToken);
  const setRememberMe = useAuthStore(state => state.setRememberMe);

  const handleLogin = async (data) => {
    const response = await auth.login(data, data.rememberMe);
    setUser(response.user);
    setAccessToken(response.accessToken);
    setRememberMe(data.rememberMe);
  };

  // ...
}
```

### With Hook (Clean)
```typescript
function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (data) => {
    await login(data, data.rememberMe);
  };

  // ...
}
```

## Type Safety

```typescript
import type { User } from '@/types/user';
import type { LoginPayload, LoginResponse } from '@/api/auth';

const { user, login, logout } = useAuth();

// TypeScript knows:
const username: string | undefined = user?.username;  // ✓
await login({ email: "...", password: "..." });       // ✓
await login({ invalid: "data" });                     // ✗ Error
logout();                                              // ✓
```

## Error Handling

The hook doesn't handle errors - components should:

```typescript
const { login } = useAuth();

try {
  await login({ email, password }, rememberMe);
  // Success - navigate or show success message
} catch (error) {
  // Error - show error message
  const message = getErrorMessage(error);
  setError(message);
}
```

Common errors:
- **401**: Invalid credentials
- **400**: Validation error (empty fields, etc.)
- **500**: Server error
- **Network error**: API not reachable

## Comparison: Hook vs Direct Store Access

### Use Hook When:
- ✅ Performing login/logout
- ✅ Need simple auth operations
- ✅ Want cleaner component code

### Use Store Directly When:
- ✅ Need granular store actions (setAccessToken only)
- ✅ Outside React components (API client)
- ✅ Complex state updates

## Related Files
- [authStore.ts](../stores/authStore.ts.md): Underlying store
- [auth.ts (API)](../api/auth.ts.md): API functions called by hook
- [LoginPage.tsx](../pages/auth/LoginPage.tsx.md): Uses login()
- [UserProfile.tsx](../components/UserProfile.tsx.md): Uses logout()

## Advanced Usage

### With React Query
```typescript
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string; rememberMe: boolean }) =>
      login(data, data.rememberMe),
    onSuccess: () => {
      navigate('/projects');
    },
    onError: (error) => {
      setError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ email, password, rememberMe });
    }}>
      {mutation.isPending && <Spinner />}
      {mutation.isError && <Alert>{mutation.error.message}</Alert>}
      {/* form fields */}
    </form>
  );
}
```

### Auto-Redirect on Logout
```typescript
function useAutoLogout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return logout;
}
```

## Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

test('login updates user', async () => {
  const { result } = renderHook(() => useAuth());

  expect(result.current.user).toBeNull();

  await act(async () => {
    await result.current.login({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  expect(result.current.user).not.toBeNull();
  expect(result.current.user?.email).toBe('test@example.com');
});

test('logout clears user', () => {
  const { result } = renderHook(() => useAuth());

  act(() => {
    result.current.logout();
  });

  expect(result.current.user).toBeNull();
});
```
