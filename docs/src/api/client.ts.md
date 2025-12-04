# client.ts

**Location:** `/src/api/client.ts`
**Type:** API Client Configuration

## Purpose

Creates and configures the Axios HTTP client with automatic authentication and token refresh. This is the **foundation of all API communication** in the application.

## Key Components

### 1. Base API Client
```typescript
export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // Send cookies with requests
});
```

- **Base URL**: `VITE_API_BASE_URL` from env (default: `http://localhost:8000/api`)
- **withCredentials**: Enables sending/receiving HTTP-only cookies (refresh token)

### 2. Request Interceptor (Add Auth Token)
```typescript
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Flow:**
1. Before every request, check if user has access token
2. If yes, add `Authorization: Bearer <token>` header
3. Server validates token and allows access

### 3. Response Interceptor (Auto Token Refresh)
```typescript
api.interceptors.response.use(
    (response) => response,  // Pass through successful responses
    async (error) => {
        if (error.response.status === 401 && !originalRequest._retry) {
            // Token expired, try to refresh
            const newToken = await refreshAccessToken();
            // Retry original request with new token
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);
```

**Flow When Token Expires:**
1. Request fails with 401 Unauthorized
2. Interceptor catches the error
3. Calls `/auth/refresh` with refresh token (httpOnly cookie)
4. Gets new access token
5. Updates store with new token
6. Retries original request with new token
7. User never notices the token refresh

### 4. Token Refresh Logic
```typescript
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}
```

**Singleton Pattern**: Ensures only ONE refresh happens even if multiple requests fail simultaneously.

**Without Singleton:**
```
Request A fails (401) → Refresh token
Request B fails (401) → Refresh token  ❌ (duplicate)
Request C fails (401) → Refresh token  ❌ (duplicate)
```

**With Singleton:**
```
Request A fails (401) → Starts refresh
Request B fails (401) → Waits for same refresh promise
Request C fails (401) → Waits for same refresh promise
All get new token when promise resolves ✓
```

## How It Fits Into The Application

### Authentication Flow

**Login:**
```
User logs in
  ↓
auth.login() → /auth/login
  ↓
Server returns: { access_token, user }
Server sets: HTTP-only cookie with refresh_token
  ↓
Store access_token in authStore
  ↓
All future requests include: Authorization: Bearer <access_token>
```

**Token Expiry:**
```
Access token expires (e.g., after 15 minutes)
  ↓
Next request fails with 401
  ↓
Response interceptor catches 401
  ↓
POST /auth/refresh (sends refresh token cookie)
  ↓
Get new access_token
  ↓
Retry original request
  ↓
User experience: seamless, no logout
```

### Used By All API Modules
Every API call uses this client:
- [auth.ts](./auth.ts.md): Login, register
- [schemas.ts](./schemas.ts.md): CRUD operations for projects
- [user.ts](./user.ts.md): User profile operations

## Security Features

### 1. Refresh Token in HTTP-Only Cookie
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests
- More secure than localStorage

### 2. Access Token in Memory/LocalStorage
- Short-lived (15-60 minutes)
- Stored in authStore (localStorage if "Remember Me")
- If stolen, expires quickly

### 3. Automatic Refresh Prevention
- Refresh endpoint doesn't trigger another refresh (infinite loop prevention)
- `_retry` flag prevents multiple refresh attempts

### 4. Logout on Refresh Failure
```typescript
catch (error) {
    clearAuth();  // Logout user if refresh fails
    return null;
}
```

## Error Handling

| Status Code | Action | User Impact |
|------------|--------|-------------|
| 401 (not refreshed yet) | Auto refresh token | None (seamless) |
| 401 (refresh failed) | Logout user | Redirected to login |
| 403 | Reject promise | "Access denied" error |
| 404 | Reject promise | "Not found" error |
| 500 | Reject promise | "Server error" message |

## Configuration

### Environment Variable
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Change this for different environments:
- Development: `http://localhost:8000/api`
- Production: `https://api.appgen.com/api`

## Common Issues & Solutions

### Issue: "Network Error"
- Backend not running
- CORS not configured
- Wrong API_BASE_URL

### Issue: Infinite 401 Loop
- Refresh token expired
- Refresh endpoint not working
- Solution: Clear cookies and re-login

### Issue: Token Not Sent
- `withCredentials: true` missing
- Access token not in store
- Request interceptor not running

## Related Files
- [authStore.ts](../stores/authStore.ts.md): Stores access token
- [auth.ts](./auth.ts.md): Uses this client for login/register
- [schemas.ts](./schemas.ts.md): Uses this client for CRUD
- [user.ts](./user.ts.md): Uses this client for user operations
