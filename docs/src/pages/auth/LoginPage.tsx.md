# LoginPage.tsx

**Location:** `/src/pages/auth/LoginPage.tsx`
**Type:** Authentication Page Component

## Purpose

Handles user login with form validation, error handling, and "Stay signed in" functionality. Redirects to projects page on successful authentication.

## Features

### 1. Form Fields
- **Email:** Required, valid email format
- **Password:** Required, minimum 8 characters
- **Stay Signed In:** Checkbox for persistent login

### 2. Validation Schema
```typescript
import { loginSchema } from '@/lib/schemas/auth';

// Schema validates:
// - email: valid email format, required
// - password: min 8 characters
```

### 3. Form Setup with React Hook Form
```typescript
const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
} = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
});
```

**Mode Details:**
- `onSubmit`: Validate when form is submitted
- `reValidateMode: "onChange"`: Re-validate on change after first submit

### 4. Submit Handler
```typescript
const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setServerSuccess(null);

    try {
        const response = await login(data, staySignedIn);
        setServerSuccess(`Welcome back, ${response.user.email}!`);
        reset({ email: data.email, password: "" });  // Clear password only
        setTimeout(() => navigate("/projects"), 500);
    } catch (error: unknown) {
        setServerError(
            getErrorMessage(
                error,
                "Login failed. Please check your credentials and try again."
            )
        );
    }
};
```

**Flow:**
1. Clear previous errors/success messages
2. Call `login()` hook with credentials and rememberMe flag
3. On success: Show welcome message, clear password, redirect
4. On error: Show user-friendly error message

### 5. "Stay Signed In" Feature
```typescript
const [staySignedIn, setStaySignedIn] = React.useState<boolean>(false);

<input
    id="stay-signed-in"
    type="checkbox"
    checked={staySignedIn}
    onChange={(e) => setStaySignedIn(e.target.checked)}
/>
```

**Behavior:**
- `true`: Access token persists in localStorage
- `false`: Access token cleared on page refresh

Passed to `login()` hook:
```typescript
await login(data, staySignedIn);
```

## Component Structure

```typescript
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);
    const [staySignedIn, setStaySignedIn] = React.useState<boolean>(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h1>Sign in to AppGen</h1>

                {serverError && <Alert type="error">{serverError}</Alert>}
                {serverSuccess && <Alert type="success">{serverSuccess}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Email" type="email" error={errors.email} {...register("email")} />
                    <FormInput label="Password" type="password" error={errors.password} {...register("password")} />

                    <input type="checkbox" checked={staySignedIn} onChange={(e) => setStaySignedIn(e.target.checked)} />
                    <label>Stay signed in</label>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p>
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    );
};
```

## Usage

Accessed via public route:
```typescript
// App.tsx
{
  path: "/login",
  element: (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  )
}
```

**PublicRoute behavior:** Redirects to `/projects` if already logged in.

## User Flow

### Successful Login
```
User enters email + password
  ↓
Click "Sign in"
  ↓
Validation passes
  ↓
API call: auth.login()
  ↓
authStore updated (token + user)
  ↓
Success message shown
  ↓
After 500ms → Navigate to /projects
```

### Failed Login
```
User enters invalid credentials
  ↓
Click "Sign in"
  ↓
API call returns 401
  ↓
Error extracted via getErrorMessage()
  ↓
User-friendly error displayed
  ↓
User remains on login page
```

## Error Handling

### Common Errors

| Status | Error | User Message |
|--------|-------|--------------|
| 400 | Validation error | Field-specific message |
| 401 | Invalid credentials | "Invalid email or password" (from API) |
| 500 | Server error | "Login failed. Please check your credentials..." |
| Network | No response | "Login failed. Please check your credentials..." |

### Error Display
```typescript
{serverError && <Alert type="error">{serverError}</Alert>}
```

## Validation

### Client-Side (Zod)
```typescript
// From loginSchema
email: z.string().email("Please enter a valid email address").min(1, "Email is required")
password: z.string().min(8, "Password must be at least 8 characters long")
```

**Errors shown below input fields:**
```typescript
<FormInput
    error={errors.email}  // Shows validation error if any
    {...register("email")}
/>
```

### Server-Side
Backend validates credentials and returns 401 if invalid.

## Related Files

- [useAuth.ts](../../hooks/useAuth.ts.md): login() hook
- [auth.ts (API)](../../api/auth.ts.md): auth.login() API call
- [auth.ts (schemas)](../../lib/schemas/auth.ts.md): loginSchema validation
- [authStore.ts](../../stores/authStore.ts.md): Auth state storage
- [FormInput.tsx](../../components/ui/FormInput.tsx.md): Input component
- [Alert.tsx](../../components/ui/Alert.tsx.md): Alert component
- [error.ts](../../lib/utils/error.ts.md): Error extraction
- [PublicRoute.tsx](../../components/PublicRoute.tsx.md): Route wrapper

## Styling

- **Centered Layout:** `flex items-center justify-center`
- **Card Design:** White background, rounded corners, shadow
- **Max Width:** 28rem (max-w-md)
- **Primary Button:** Primary color with shadow-primary-glow
- **Disabled State:** Reduced opacity, cursor-not-allowed

## Testing Examples

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const renderLoginPage = () => {
    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    );
};

test('renders login form', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('validates email format', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
});

test('validates password length', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/8 characters/i)).toBeInTheDocument();
});

test('handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
        user: { email: 'test@example.com' }
    });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
});
```

## Security Considerations

### Password Field
- Type="password" hides input
- Autocomplete="current-password" for password managers

### HTTPS Required
Access tokens should only be transmitted over HTTPS in production.

### Stay Signed In Checkbox
Users should understand:
- Checked: Token persists (convenient but less secure on shared devices)
- Unchecked: Token cleared on page refresh (more secure)

## Accessibility

- **Labels:** All inputs have associated labels
- **Error Messages:** Announced to screen readers
- **Keyboard Navigation:** Tab through form elements
- **Focus States:** Visible focus indicators (focus:ring-2)
- **noValidate:** Prevents browser default validation for custom error messages
