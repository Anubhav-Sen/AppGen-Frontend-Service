# auth.ts

**Location:** `/src/lib/schemas/auth.ts`
**Type:** Zod Validation Schemas for Authentication Forms

## Purpose

Provides Zod schemas for validating login and registration forms with comprehensive validation rules and error messages.

## Exports

### `loginSchema`
```typescript
export const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
})
```

**Type:**
```typescript
export type LoginFormValues = z.infer<typeof loginSchema>;
// { email: string; password: string; }
```

**Validation Rules:**
- Email: Required, must be valid email format
- Password: Required, minimum 8 characters

**Usage:**
```typescript
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

### `registerSchema`
```typescript
export const registerSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must not exceed 30 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})
```

**Type:**
```typescript
export type RegisterFormValues = z.infer<typeof registerSchema>;
// {
//   email: string;
//   username: string;
//   password: string;
//   confirmPassword: string;
// }
```

**Validation Rules:**
- Email: Required, must be valid email format
- Username: Required, 3-30 characters
- Password: Required, minimum 8 characters
- Confirm Password: Required, must match password

**Usage:**
```typescript
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await auth.register({
      email: data.email,
      username: data.username,
      password: data.password
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('username')} placeholder="Username" />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register('confirmPassword')} type="password" placeholder="Confirm Password" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

---

## Key Features

### 1. Email Validation
```typescript
z.string().email("Please enter a valid email address")
```

**Valid:**
- user@example.com ✅
- john.doe@company.co.uk ✅
- test+filter@gmail.com ✅

**Invalid:**
- "not-an-email" ❌
- "user@" ❌
- "@example.com" ❌

---

### 2. Password Confirmation with `.refine()`
```typescript
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]  // Error appears on confirmPassword field
})
```

**Why important:**
- Prevents typos during registration
- Error appears on correct field (confirmPassword)
- Custom validation logic

---

### 3. Username Length Constraints
```typescript
z.string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must not exceed 30 characters")
```

Ensures username is within reasonable bounds.

---

## Error Messages

### Login Schema Errors

| Field | Condition | Error Message |
|-------|-----------|---------------|
| email | Empty | "Email is required" |
| email | Invalid format | "Please enter a valid email address" |
| password | Empty or < 8 chars | "Password must be at least 8 characters long" |

### Register Schema Errors

| Field | Condition | Error Message |
|-------|-----------|---------------|
| email | Empty | "Email is required" |
| email | Invalid format | "Please enter a valid email address" |
| username | < 3 chars | "Username must be at least 3 characters long" |
| username | > 30 chars | "Username must not exceed 30 characters" |
| password | < 8 chars | "Password must be at least 8 characters long" |
| confirmPassword | Empty | "Please confirm your password" |
| confirmPassword | Doesn't match | "Passwords do not match" |

---

## Integration with React Hook Form

### Login Form Example
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data, false);
      navigate('/projects');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Register Form Example
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/auth';
import { auth } from '@/api/auth';

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await auth.register({
        email: data.email,
        username: data.username,
        password: data.password
      });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input {...register('email')} type="email" />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <label>Username</label>
        <input {...register('username')} />
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input {...register('password')} type="password" />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input {...register('confirmPassword')} type="password" />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
}
```

---

## Manual Validation (Without React Hook Form)

### Parse and Validate
```typescript
import { loginSchema } from '@/lib/schemas/auth';

const formData = {
  email: "user@example.com",
  password: "mypassword123"
};

const result = loginSchema.safeParse(formData);

if (!result.success) {
  // Show errors
  result.error.issues.forEach(issue => {
    console.error(`${issue.path.join('.')}: ${issue.message}`);
  });
} else {
  // Valid data
  await login(result.data);
}
```

### Partial Validation
```typescript
// Validate just email
const emailResult = loginSchema.shape.email.safeParse("test@example.com");
if (emailResult.success) {
  console.log("Email is valid");
}
```

---

## Extending Schemas

### Add More Password Rules
```typescript
export const strongPasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const strictLoginSchema = loginSchema.extend({
  password: strongPasswordSchema
});
```

### Add Optional Fields
```typescript
export const extendedRegisterSchema = registerSchema.extend({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});
```

---

## Related Files

- [LoginPage.tsx](../../pages/auth/LoginPage.tsx.md): Uses loginSchema
- [RegisterPage.tsx](../../pages/auth/RegisterPage.tsx.md): Uses registerSchema
- [auth.ts (API)](../../api/auth.ts.md): API functions called after validation
- [useAuth.ts](../../hooks/useAuth.ts.md): Auth hook that uses validated data

---

## Testing

```typescript
import { loginSchema, registerSchema } from './auth';

describe('loginSchema', () => {
  test('validates valid login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('rejects invalid email', () => {
    const data = {
      email: 'not-an-email',
      password: 'password123'
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('valid email');
  });

  test('rejects short password', () => {
    const data = {
      email: 'test@example.com',
      password: 'short'
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('8 characters');
  });
});

describe('registerSchema', () => {
  test('validates matching passwords', () => {
    const data = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('rejects non-matching passwords', () => {
    const data = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'different'
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('do not match');
  });
});
```

---

## Best Practices

### Show Field-Level Errors
```typescript
{errors.email && (
  <span className="text-red-500 text-sm">{errors.email.message}</span>
)}
```

### Disable Submit While Invalid
```typescript
<button
  type="submit"
  disabled={!formState.isValid || isSubmitting}
>
  Submit
</button>
```

### Validate On Blur
```typescript
useForm({
  resolver: zodResolver(loginSchema),
  mode: 'onBlur'  // Validate when user leaves field
});
```
