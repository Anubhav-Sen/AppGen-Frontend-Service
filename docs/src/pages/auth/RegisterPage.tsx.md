# RegisterPage.tsx

**Location:** `/src/pages/auth/RegisterPage.tsx`
**Type:** Registration Page Component

## Purpose

Handles new user registration with comprehensive form validation including password confirmation. Redirects to login page after successful account creation.

## Features

### Form Fields
- **Email:** Required, valid email format
- **Username:** Required, 3-30 characters
- **Password:** Required, minimum 8 characters
- **Confirm Password:** Required, must match password

### Validation Schema
```typescript
import { registerSchema } from '@/lib/schemas/auth';

// Validates:
// - email: valid format, required
// - username: 3-30 characters
// - password: min 8 characters
// - confirmPassword: must match password
```

### Submit Handler
```typescript
const onSubmit = async (data: RegisterFormValues) => {
    try {
        await auth.register({
            email: data.email,
            username: data.username,
            password: data.password,
        });
        setServerSuccess("Account created successfully! Redirecting to login...");
        reset();
        setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
        setServerError(getErrorMessage(error, "Registration failed. Please try again."));
    }
};
```

**Flow:**
1. Call `auth.register()` (NOT auto-login)
2. Show success message
3. Clear form
4. After 2 seconds → Redirect to login

## Key Differences from LoginPage

| Feature | LoginPage | RegisterPage |
|---------|-----------|--------------|
| Fields | Email, Password, Checkbox | Email, Username, Password, Confirm |
| Validation | 2 fields | 4 fields + password match |
| After Success | Navigate to /projects | Navigate to /login |
| Auto-Login | Yes (via useAuth) | No (must login separately) |
| Redirect Delay | 500ms | 2000ms (time to read success) |

## Component Structure

```typescript
const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverSuccess, setServerSuccess] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl p-8">
                <h1>Create your account</h1>

                {serverError && <Alert type="error">{serverError}</Alert>}
                {serverSuccess && <Alert type="success">{serverSuccess}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormInput label="Email" type="email" error={errors.email} {...register("email")} />
                    <FormInput label="Username" error={errors.username} {...register("username")} />
                    <FormInput label="Password" type="password" error={errors.password} {...register("password")} />
                    <FormInput label="Confirm Password" type="password" error={errors.confirmPassword} {...register("confirmPassword")} />

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p>Already have an account? <a href="/login">Sign in</a></p>
            </div>
        </div>
    );
};
```

## User Flow

### Successful Registration
```
User fills all fields
  ↓
Click "Sign up"
  ↓
Validation passes
  ↓
API call: auth.register()
  ↓
Account created in backend
  ↓
Success message shown
  ↓
After 2s → Navigate to /login
  ↓
User logs in with new credentials
```

### Failed Registration
```
User fills form
  ↓
Click "Sign up"
  ↓
API returns error (e.g., email taken)
  ↓
Error message displayed
  ↓
User remains on register page
```

## Error Handling

### Common Errors

| Status | Cause | User Message |
|--------|-------|--------------|
| 400 | Invalid data | Field-specific validation message |
| 409 | Email/username taken | "Email already exists" |
| 500 | Server error | "Registration failed..." |

### Password Mismatch
Validated client-side before submission:
```typescript
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
```

## Validation Rules

### Email
- Must be valid email format
- Must be unique (checked by backend)

### Username
- Minimum: 3 characters
- Maximum: 30 characters
- Must be unique (checked by backend)

### Password
- Minimum: 8 characters
- Must match confirmation field

## Related Files

- [auth.ts (API)](../../api/auth.ts.md): auth.register() function
- [auth.ts (schemas)](../../lib/schemas/auth.ts.md): registerSchema validation
- [FormInput.tsx](../../components/ui/FormInput.tsx.md): Input component
- [Alert.tsx](../../components/ui/Alert.tsx.md): Alert component
- [error.ts](../../lib/utils/error.ts.md): Error extraction
- [PublicRoute.tsx](../../components/PublicRoute.tsx.md): Route wrapper

## Testing Example

```typescript
test('validates password confirmation', async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
});
```

## UX Considerations

- **No Auto-Login:** User sees success message and redirects to login (standard security practice)
- **2-Second Delay:** Gives user time to read success message
- **Form Reset:** Clears all fields after successful registration
- **Link to Login:** For users who already have an account
