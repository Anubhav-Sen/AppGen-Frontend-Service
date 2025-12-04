# user.ts

**Location:** `/src/api/user.ts`
**Type:** API Module

## Purpose

Provides API functions for user profile management including fetching current user, updating profile, and changing password.

## Exports

### Type Definitions

```typescript
export interface UpdateUserPayload {
    username?: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}
```

### API Functions

```typescript
export async function getCurrentUser(): Promise<User>
export async function updateUser(payload: UpdateUserPayload): Promise<User>
export async function changePassword(payload: ChangePasswordPayload): Promise<void>
```

## API Functions

### `getCurrentUser()`
```typescript
async function getCurrentUser(): Promise<User>
```

Fetch the current authenticated user's profile.

**Returns:** User object with id, username, email, isActive

**Usage:**
```typescript
import { getCurrentUser } from '@/api/user';

const user = await getCurrentUser();
console.log(`Logged in as ${user.username}`);
```

**Response Example:**
```json
{
  "id": 42,
  "username": "johndoe",
  "email": "john@example.com",
  "isActive": true
}
```

---

### `updateUser(payload)`
```typescript
async function updateUser(payload: UpdateUserPayload): Promise<User>
```

Update the current user's profile.

**Parameters:**
```typescript
interface UpdateUserPayload {
    username?: string; // New username (optional)
}
```

**Returns:** Updated User object

**Usage:**
```typescript
import { updateUser } from '@/api/user';

const updatedUser = await updateUser({
  username: "john_doe_2025"
});

console.log(`Username changed to ${updatedUser.username}`);
```

**Validation:**
- Username must be unique across all users
- Username typically has length/format requirements (see backend)

---

### `changePassword(payload)`
```typescript
async function changePassword(payload: ChangePasswordPayload): Promise<void>
```

Change the current user's password.

**Parameters:**
```typescript
interface ChangePasswordPayload {
    currentPassword: string; // Current password for verification
    newPassword: string;     // New password
}
```

**Returns:** void (204 No Content on success)

**Throws:**
- 401 if currentPassword is incorrect
- 400 if newPassword doesn't meet requirements

**Usage:**
```typescript
import { changePassword } from '@/api/user';

try {
  await changePassword({
    currentPassword: "oldpass123",
    newPassword: "newSecurePass456!"
  });
  toast.success("Password changed successfully");
} catch (error) {
  if (error.response?.status === 401) {
    toast.error("Current password is incorrect");
  } else {
    toast.error("Failed to change password");
  }
}
```

## How It Fits Into The Application

### Manage Account Page

```typescript
import { getCurrentUser, updateUser, changePassword } from '@/api/user';
import { useState, useEffect } from 'react';

function ManageAccountPage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updated = await updateUser({ username });
    setUser(updated);
    toast.success("Profile updated");
  };

  const handleChangePassword = async (data) => {
    await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    toast.success("Password changed");
  };

  return (
    <div>
      <h1>Manage Account</h1>
      <form onSubmit={handleUpdateProfile}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="New username"
        />
        <button type="submit">Update Profile</button>
      </form>

      <ChangePasswordForm onSubmit={handleChangePassword} />
    </div>
  );
}
```

### User Profile Dropdown

```typescript
import { getCurrentUser } from '@/api/user';
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="dropdown">
      <button>{user?.username}</button>
      <div className="dropdown-menu">
        <p>{user?.email}</p>
        <Link to="/manage-account">Settings</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
```

## Integration with Auth Store

When updating username, you may want to sync with authStore:

```typescript
import { updateUser } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';

const handleUpdateUsername = async (newUsername: string) => {
  const updatedUser = await updateUser({ username: newUsername });

  // Sync with auth store
  useAuthStore.getState().setUser(updatedUser);

  toast.success("Username updated");
};
```

## API Endpoints

| Function | Method | Endpoint | Auth Required |
|----------|--------|----------|---------------|
| getCurrentUser() | GET | `/users/me` | ✅ Yes |
| updateUser() | PUT | `/users/me` | ✅ Yes |
| changePassword() | POST | `/users/me/change-password` | ✅ Yes |

## Error Handling

All functions use the HTTP client with automatic token refresh:

```typescript
import { getErrorMessage } from '@/lib/utils/error';

try {
  await changePassword({ currentPassword, newPassword });
} catch (error) {
  const message = getErrorMessage(error, "Failed to change password");
  toast.error(message);
}
```

**Common Errors:**

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Validation error | Invalid payload (password too short, etc.) |
| 401 | Unauthorized | Current password incorrect or session expired |
| 409 | Conflict | Username already taken |

## React Query Integration

### Create a hook for current user:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api/user';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mutation for updating profile:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/api/user';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(['currentUser'], updatedUser);

      // Also update auth store
      useAuthStore.getState().setUser(updatedUser);
    }
  });
}
```

## Related Files

- [client.ts](./client.ts.md): HTTP client with token refresh
- [user.ts (types)](../types/user.ts.md): User type definition
- [authStore.ts](../stores/authStore.ts.md): Authentication state
- [ManageAccountPage.tsx](../pages/ManageAccountPage.tsx.md): Uses these functions
- [UserProfile.tsx](../components/UserProfile.tsx.md): Displays user info

## Security Considerations

### Password Change
- Always require current password verification
- Backend should enforce password strength requirements
- Consider adding password confirmation field in UI

### Username Update
- Validate username format before submission
- Handle duplicate username errors gracefully
- Consider rate limiting on username changes

### Token Refresh
- All endpoints automatically refresh expired tokens
- No manual token handling required
- See [client.ts](./client.ts.md) for details

## Testing

```typescript
import { getCurrentUser, updateUser, changePassword } from './user';
import { api } from './client';

jest.mock('./client');

describe('user API', () => {
  test('getCurrentUser returns user data', async () => {
    const mockUser = {
      id: 42,
      username: 'test',
      email: 'test@example.com',
      isActive: true
    };
    api.get.mockResolvedValue({ data: mockUser });

    const result = await getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockUser);
  });

  test('updateUser sends correct payload', async () => {
    const payload = { username: 'newname' };
    const mockUser = { id: 42, username: 'newname', email: 'test@example.com' };
    api.put.mockResolvedValue({ data: mockUser });

    const result = await updateUser(payload);

    expect(api.put).toHaveBeenCalledWith('/users/me', payload);
    expect(result.username).toBe('newname');
  });

  test('changePassword handles success', async () => {
    api.post.mockResolvedValue({});

    await changePassword({
      currentPassword: 'old',
      newPassword: 'new'
    });

    expect(api.post).toHaveBeenCalledWith('/users/me/change-password', {
      currentPassword: 'old',
      newPassword: 'new'
    });
  });
});
```

## Common Patterns

### Load User on Mount
```typescript
useEffect(() => {
  getCurrentUser().then(user => {
    setUserData(user);
  });
}, []);
```

### Update with Optimistic UI
```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    // Optimistically update UI
    queryClient.setQueryData(['currentUser'], (old) => ({
      ...old,
      ...newData
    }));
  },
  onError: () => {
    // Rollback on error
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }
});
```

### Password Change with Confirmation
```typescript
const handleSubmit = async (data) => {
  if (data.newPassword !== data.confirmPassword) {
    toast.error("Passwords don't match");
    return;
  }

  await changePassword({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword
  });

  toast.success("Password changed successfully");
  resetForm();
};
```
