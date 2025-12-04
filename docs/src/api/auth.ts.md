# auth.ts

**Location:** `/src/api/auth.ts`
**Type:** API Module

## Purpose

Provides authentication API endpoints (login and register) with snake_case to camelCase transformation for frontend/backend communication.

## Exports

### `auth.login(payload, rememberMe)`
Authenticates user with email and password.

**Parameters:**
```typescript
payload: {
  email: string;
  password: string;
}
rememberMe: boolean = false
```

**Returns:**
```typescript
{
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    username: string;
    isActive: boolean;
  }
}
```

**Backend Request:**
```typescript
POST /auth/login
{
  email: "user@example.com",
  password: "password123",
  remember_me: false
}
```

**Backend Response:**
```typescript
{
  access_token: "jwt...",
  refresh_token: "jwt...",  // Optional, may be in httpOnly cookie
  user: {
    id: 1,
    email: "user@example.com",
    username: "johndoe",
    is_active: true
  }
}
```

### `auth.register(payload)`
Creates a new user account.

**Parameters:**
```typescript
payload: {
  email: string;
  username: string;
  password: string;
}
```

**Returns:**
```typescript
{
  id: number;
  email: string;
  username: string;
  isActive: boolean;
}
```

## Key Features

### 1. Case Transformation
Backend uses snake_case, frontend uses camelCase:
```typescript
// Backend sends
{ access_token, is_active }

// Frontend receives
{ accessToken, isActive }
```

### 2. Remember Me
- If `rememberMe: true` → Server may set longer-lived refresh token
- Token persistence handled by [authStore.ts](../stores/authStore.ts.md)

### 3. Automatic Token Attachment
Uses `api` client from [client.ts](./client.ts.md), which automatically:
- Sends cookies (for refresh token)
- Adds Authorization header (for protected endpoints)

## How It Fits Into The Application

### Login Flow
```
LoginPage.tsx
  ↓
useAuth.login()
  ↓
auth.login(email, password, rememberMe)
  ↓
API: POST /auth/login
  ↓
authStore.setAuth({ accessToken, user })
  ↓
authStore conditionally persists token (if rememberMe)
  ↓
Navigate to /projects
```

### Register Flow
```
RegisterPage.tsx
  ↓
auth.register({ email, username, password })
  ↓
API: POST /auth/register
  ↓
User created
  ↓
Redirect to /login
  ↓
User logs in
```

## Error Handling

Errors are caught by calling components:
```typescript
try {
  await auth.login({ email, password });
} catch (error) {
  // Display error message from getErrorMessage(error)
}
```

Common errors:
- **401**: Invalid credentials
- **400**: Validation error (weak password, email taken, etc.)
- **500**: Server error

## Security Considerations

### Password Transmission
- Passwords sent over HTTPS only
- Never logged or stored in frontend

### Token Storage
- Access token: Memory or localStorage (based on rememberMe)
- Refresh token: HTTP-only cookie (safer, cannot be accessed by JS)

## Related Files
- [client.ts](./client.ts.md): HTTP client used for requests
- [authStore.ts](../stores/authStore.ts.md): Stores returned auth data
- [useAuth.ts](../hooks/useAuth.ts.md): React hook wrapper
- [LoginPage.tsx](../pages/auth/LoginPage.tsx.md): Uses login endpoint
- [RegisterPage.tsx](../pages/auth/RegisterPage.tsx.md): Uses register endpoint

## Example Usage

```typescript
import { auth } from '@/api/auth';

// Login
const response = await auth.login(
  { email: 'user@example.com', password: 'pass123' },
  true  // remember me
);
console.log(response.user.username);  // "johndoe"

// Register
const newUser = await auth.register({
  email: 'new@example.com',
  username: 'newuser',
  password: 'securePass123',
});
console.log(newUser.id);  // 42
```
