# error.ts

**Location:** `/src/lib/utils/error.ts`
**Type:** Utility Function

## Purpose

Extracts user-friendly error messages from API error responses, handling both string errors and FastAPI validation errors.

## Function

```typescript
function getErrorMessage(error: unknown, defaultMessage: string): string
```

## Parameters

- `error` - The error object (typically from Axios)
- `defaultMessage` - Fallback message if extraction fails

## Returns

`string` - User-friendly error message

## Implementation Details

The function handles three types of error responses:

### 1. String Detail
```json
{
  "detail": "Invalid credentials"
}
```

### 2. Validation Error Array
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "Password must be at least 8 characters",
      "input": "short"
    }
  ]
}
```

### 3. Fallback
If neither format matches, returns the `defaultMessage`.

## Usage Examples

### Login Error Handling
```typescript
import { getErrorMessage } from '@/lib/utils/error';
import { auth } from '@/api/auth';

try {
  await auth.login({ email, password });
} catch (error) {
  const message = getErrorMessage(error, "Login failed");
  toast.error(message);
  // Shows: "Invalid credentials" or "Login failed"
}
```

### Form Validation Errors
```typescript
try {
  await schemas.create(payload);
} catch (error) {
  const message = getErrorMessage(error, "Failed to create project");
  setError(message);
  // Shows: "Project title is required" (first validation error)
}
```

### Generic API Errors
```typescript
try {
  await api.post('/some-endpoint', data);
} catch (error) {
  const message = getErrorMessage(error, "Something went wrong");
  console.error(message);
}
```

## Type Definitions

### ValidationError
```typescript
interface ValidationError {
    type: string;              // Error type (e.g., "string_too_short")
    loc: (string | number)[];  // Location path (e.g., ["body", "password"])
    msg: string;               // Human-readable message
    input?: unknown;           // The invalid input value
}
```

### ErrorResponse
```typescript
interface ErrorResponse {
    detail?: string | ValidationError[];
}
```

## FastAPI Error Formats

### Single String Error
Backend returns:
```python
raise HTTPException(status_code=400, detail="Invalid input")
```

Client receives:
```json
{
  "detail": "Invalid input"
}
```

Result: `"Invalid input"`

---

### Validation Errors
Backend uses Pydantic validation:
```python
class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
```

Client sends invalid data:
```json
{
  "email": "test@example.com",
  "password": "short"
}
```

Backend returns:
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "short",
      "ctx": {"min_length": 8}
    }
  ]
}
```

Result: `"String should have at least 8 characters"` (first error's msg)

## Integration with Components

### Login Form
```typescript
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/error';

function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    try {
      await login(data, data.rememberMe);
      navigate('/projects');
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed. Please try again.');
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}
      {/* form fields */}
    </form>
  );
}
```

### React Hook Form Integration
```typescript
import { getErrorMessage } from '@/lib/utils/error';

const onSubmit = async (data) => {
  try {
    await schemas.create(data);
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to create project');
    setError('root', { message }); // Set form-level error
  }
};
```

### Toast Notifications
```typescript
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';

try {
  await schemas.delete(projectId);
  toast.success('Project deleted');
} catch (error) {
  const message = getErrorMessage(error, 'Failed to delete project');
  toast.error(message);
}
```

## Common Error Messages

| Scenario | Backend Response | Extracted Message |
|----------|-----------------|-------------------|
| Invalid credentials | `{"detail": "Invalid credentials"}` | "Invalid credentials" |
| Password too short | Validation error array | "String should have at least 8 characters" |
| Email format invalid | Validation error array | "value is not a valid email address" |
| Missing field | Validation error array | "Field required" |
| Network error | No response | Default message |
| 500 Server Error | `{"detail": "Internal server error"}` | "Internal server error" |

## Edge Cases

### No Response Object
```typescript
try {
  await api.get('/endpoint');
} catch (error) {
  // Network error, no response
  const message = getErrorMessage(error, 'Network error');
  // Returns: "Network error"
}
```

### Empty Detail Array
```typescript
{
  "detail": []
}
```
Returns: `defaultMessage`

### Multiple Validation Errors
```json
{
  "detail": [
    {"msg": "Email is required"},
    {"msg": "Password is required"}
  ]
}
```
Returns: `"Email is required"` (only first error)

To show all errors, you'd need to modify:
```typescript
if (Array.isArray(detail) && detail.length > 0) {
  return detail.map(err => err.msg).join(', ');
}
```

## Related Files

- [client.ts](../../api/client.ts.md): HTTP client that throws these errors
- [auth.ts (API)](../../api/auth.ts.md): Login/register endpoints that use this
- [LoginPage.tsx](../../pages/auth/LoginPage.tsx.md): Uses getErrorMessage
- [RegisterPage.tsx](../../pages/auth/RegisterPage.tsx.md): Uses getErrorMessage

## Testing

```typescript
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  test('extracts string detail', () => {
    const error = {
      response: {
        data: {
          detail: 'Invalid credentials'
        }
      }
    };

    expect(getErrorMessage(error, 'Default')).toBe('Invalid credentials');
  });

  test('extracts validation error message', () => {
    const error = {
      response: {
        data: {
          detail: [
            { msg: 'Password too short' },
            { msg: 'Email invalid' }
          ]
        }
      }
    };

    expect(getErrorMessage(error, 'Default')).toBe('Password too short');
  });

  test('returns default message for unknown errors', () => {
    const error = new Error('Network error');
    expect(getErrorMessage(error, 'Default')).toBe('Default');
  });

  test('returns default for empty detail array', () => {
    const error = {
      response: {
        data: {
          detail: []
        }
      }
    };

    expect(getErrorMessage(error, 'Default')).toBe('Default');
  });
});
```

## Best Practices

### Always Provide Meaningful Defaults
```typescript
// ✅ Good
getErrorMessage(error, 'Failed to save project');

// ❌ Bad
getErrorMessage(error, 'Error');
```

### Use Context-Specific Messages
```typescript
// Login context
getErrorMessage(error, 'Login failed. Please check your credentials.');

// Save context
getErrorMessage(error, 'Failed to save project. Please try again.');

// Delete context
getErrorMessage(error, 'Failed to delete project.');
```

### Combine with Toast/Alert Components
```typescript
try {
  await performAction();
  toast.success('Action completed');
} catch (error) {
  const message = getErrorMessage(error, 'Action failed');
  toast.error(message);
}
```
