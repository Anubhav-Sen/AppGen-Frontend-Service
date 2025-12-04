# user.ts

**Location:** `/src/types/user.ts`
**Type:** TypeScript Type Definitions

## Purpose

Defines the User type for authenticated users in the application.

## Type Definition

```typescript
interface User {
    id: number;              // User ID from database
    username: string;        // Username
    email: string;           // Email address
    isActive: boolean;       // Account active status
}
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique user ID from backend database |
| `username` | `string` | Display name for the user |
| `email` | `string` | User's email (used for login) |
| `isActive` | `boolean` | Whether account is active (not banned/suspended) |

## Example

```typescript
{
  id: 42,
  username: "johndoe",
  email: "john@example.com",
  isActive: true
}
```

## How It Fits Into The Application

### Storage
User object is stored in [authStore.ts](../stores/authStore.ts.md):
```typescript
const user = useAuthStore(state => state.user);  // User | null
```

### Login Flow
```typescript
import { auth } from '@/api/auth';

const response = await auth.login({
  email: "john@example.com",
  password: "password123"
});

const user: User = response.user;
// { id: 42, username: "johndoe", email: "john@example.com", isActive: true }
```

### Register Flow
```typescript
const newUser: User = await auth.register({
  email: "new@example.com",
  username: "newuser",
  password: "password123"
});
```

### Usage in Components
```typescript
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/user';

function UserProfile() {
  const user: User | null = useAuthStore(state => state.user);

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

### Protected Routes
```typescript
const user = useAuthStore(state => state.user);

if (!user) {
  return <Navigate to="/login" />;
}

if (!user.isActive) {
  return <div>Your account has been deactivated</div>;
}

return <ProjectsPage />;
```

## Backend Mapping

### Backend Response (snake_case)
```json
{
  "id": 42,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true
}
```

### Frontend Type (camelCase)
```typescript
{
  id: 42,
  username: "johndoe",
  email: "john@example.com",
  isActive: true  // ← Converted from is_active
}
```

### Conversion in API Layer
See [auth.ts](../api/auth.ts.md):
```typescript
// Backend → Frontend conversion
{
  id: response.data.user.id,
  email: response.data.user.email,
  username: response.data.user.username,
  isActive: response.data.user.is_active,  // ← Conversion
}
```

## Related Files
- [authStore.ts](../stores/authStore.ts.md): Stores User object
- [auth.ts](../api/auth.ts.md): Returns User from login/register
- [user.ts (API)](../api/user.ts.md): User profile operations
- [ProtectedRoute.tsx](../components/ProtectedRoute.tsx.md): Checks for user
- [UserProfile.tsx](../components/UserProfile.tsx.md): Displays user info

## Type Safety Examples

### Null Checking
```typescript
const user = useAuthStore(state => state.user);

// TypeScript forces null check
if (user) {
  console.log(user.username);  // ✓ Safe
}

console.log(user.username);  // ✗ Error: Object is possibly null
```

### Field Access
```typescript
const user: User = ...;

console.log(user.username);  // ✓
console.log(user.fullName);  // ✗ Error: Property doesn't exist
```

## Common Operations

### Check if Logged In
```typescript
const user = useAuthStore(state => state.user);
const isLoggedIn = user !== null;
```

### Get Username
```typescript
const username = useAuthStore(state => state.user?.username);
// Result: string | undefined
```

### Check if Active
```typescript
const user = useAuthStore(state => state.user);
const canUseApp = user?.isActive ?? false;
```

## Future Extensions

If you need to add more user fields:

```typescript
interface User {
    id: number;
    username: string;
    email: string;
    isActive: boolean;

    // New fields
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: 'admin' | 'user';
    createdAt?: string;
}
```

Remember to update:
1. Backend API response
2. Type definition (this file)
3. API conversion in [auth.ts](../api/auth.ts.md)
