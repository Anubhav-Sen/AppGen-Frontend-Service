# authStore.ts

**Location:** `/src/stores/authStore.ts`
**Type:** Zustand Store

## Purpose

Manages authentication state (user, access token) with **conditional persistence** based on the "Remember Me" option. This is the single source of truth for authentication across the app.

## State Interface

```typescript
interface AuthState {
  user: User | null;              // Current user info
  accessToken: string | null;      // JWT access token
  rememberMe: boolean;             // Persistence flag

  setUser: (u: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setAuth: (data: { accessToken?, user? }) => void;
  clearAuth: () => void;
}
```

## Key Features

### 1. Conditional Token Persistence ⭐ CRITICAL

```typescript
partialize: (state) => ({
  user: state.user,
  rememberMe: state.rememberMe,
  // Only persist accessToken if rememberMe is true
  ...(state.rememberMe ? { accessToken: state.accessToken } : {})
})
```

**Behavior:**
- **Remember Me = false**: Only `user` and `rememberMe` persisted to localStorage
  - Access token **lost** on page refresh
  - User must re-login
- **Remember Me = true**: All three values persisted
  - Access token **survives** page refresh
  - User stays logged in

**Security Rationale:**
- Access tokens are sensitive
- If user doesn't check "Remember Me", token shouldn't survive browser close
- Reduces risk if someone else uses the computer

### 2. Actions

#### `setAuth(data)`
Updates user and/or access token:
```typescript
setAuth({
  accessToken: "new_token",
  user: { id: 1, username: "john", ... }
});
```
Used after successful login or token refresh.

#### `clearAuth()`
Resets all auth state:
```typescript
clearAuth();
// Result: { user: null, accessToken: null, rememberMe: false }
```
Used on logout or when token refresh fails.

#### `setRememberMe(remember)`
Updates the rememberMe flag:
```typescript
setRememberMe(true);  // Enable persistence
setRememberMe(false); // Disable persistence
```

## How It Fits Into The Application

### Login Flow
```
User submits login form
  ↓
auth.login(email, password, rememberMe)
  ↓
API returns { accessToken, user }
  ↓
authStore.setRememberMe(rememberMe)
authStore.setAuth({ accessToken, user })
  ↓
If rememberMe:
  localStorage stores: { user, accessToken, rememberMe: true }
Else:
  localStorage stores: { user, rememberMe: false }
```

### Page Refresh Behavior

**With Remember Me:**
```
Page refreshes
  ↓
authStore rehydrates from localStorage
  ↓
accessToken available
  ↓
API calls work immediately
  ↓
User stays logged in ✓
```

**Without Remember Me:**
```
Page refreshes
  ↓
authStore rehydrates from localStorage
  ↓
accessToken NOT available (undefined)
  ↓
First API call fails (401)
  ↓
Token refresh attempted (using httpOnly cookie)
  ↓
If refresh succeeds: User stays logged in
If refresh fails: User logged out
```

### Logout Flow
```
User clicks "Logout"
  ↓
authStore.clearAuth()
  ↓
localStorage cleared
  ↓
Navigate to /login
```

### Token Expiry
```
Access token expires
  ↓
API call returns 401
  ↓
client.ts interceptor triggers refresh
  ↓
New access token obtained
  ↓
authStore.setAccessToken(newToken)
  ↓
Original request retried
  ↓
User doesn't notice ✓
```

## Persistence Details

### Storage Key
```
localStorage key: "auth-storage"
```

### Stored Data Examples

**Remember Me = true:**
```json
{
  "state": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "rememberMe": true
  },
  "version": 0
}
```

**Remember Me = false:**
```json
{
  "state": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "isActive": true
    },
    "rememberMe": false
    // Note: NO accessToken stored
  },
  "version": 0
}
```

## Usage in Components

### Accessing State
```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.username}!</div>;
}
```

### Outside React Components
```typescript
import { useAuthStore } from '@/stores/authStore';

// Get current state
const token = useAuthStore.getState().accessToken;

// Update state
useAuthStore.getState().clearAuth();
```

Used in [client.ts](../api/client.ts.md) request interceptor.

## Security Considerations

### ✅ Good Practices
1. **Conditional persistence**: Respects user's privacy choice
2. **HTTP-only cookie for refresh**: More secure than localStorage
3. **Short-lived access tokens**: Limits damage if stolen
4. **Clear auth on errors**: Fails closed (logs out on issues)

### ⚠️ Limitations
1. **localStorage is vulnerable to XSS**: If attacker runs JS, can steal token
2. **Mitigation**: Strict CSP (Content Security Policy) on backend
3. **Access token in memory**: Lost on page refresh if rememberMe=false

## Related Files
- [client.ts](../api/client.ts.md): Reads `accessToken` for Authorization header
- [auth.ts](../api/auth.ts.md): Calls `setAuth()` after login
- [useAuth.ts](../hooks/useAuth.ts.md): Hook wrapper around this store
- [ProtectedRoute.tsx](../components/ProtectedRoute.tsx.md): Checks if user is logged in
- [LoginPage.tsx](../pages/auth/LoginPage.tsx.md): Updates store on login

## Common Operations

```typescript
// Check if user is logged in
const isLoggedIn = useAuthStore.getState().user !== null;

// Get current user
const user = useAuthStore.getState().user;

// Check if token is available
const hasToken = useAuthStore.getState().accessToken !== null;

// Logout
useAuthStore.getState().clearAuth();

// Update token after refresh
useAuthStore.getState().setAccessToken(newToken);
```

## Debugging Tips

### Check localStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem('auth-storage'))
```

### Clear auth manually
```javascript
localStorage.removeItem('auth-storage')
window.location.reload()
```

### Check if token is present
```javascript
useAuthStore.getState().accessToken  // Should be a long string or null
```
