# ManageAccountPage.tsx

**Location:** `/src/pages/ManageAccountPage.tsx`
**Type:** User Settings Page Component

## Purpose

Allows users to manage their account settings including updating their username and changing their password. Features two separate forms with validation and error handling.

## Features

### 1. Update Profile Form

**Fields:**
- Username (editable, min 3, max 30 characters)
- Email (read-only, cannot be changed)

**Validation Schema:**
```typescript
const updateProfileSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must not exceed 30 characters"),
});
```

**Form Handler:**
```typescript
const onUpdateProfile = async (data: UpdateProfileFormValues) => {
    try {
        const updatedUser = await updateUser({ username: data.username });
        setUser(updatedUser);  // Update authStore
        setProfileSuccess("Profile updated successfully!");
        setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error) {
        setProfileError(getErrorMessage(error, "Failed to update profile"));
    }
};
```

### 2. Change Password Form

**Fields:**
- Current Password (required for verification)
- New Password (min 8 characters)
- Confirm New Password (must match)

**Validation Schema:**
```typescript
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
```

**Form Handler:**
```typescript
const onChangePassword = async (data: ChangePasswordFormValues) => {
    try {
        await changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
        setPasswordSuccess("Password changed successfully!");
        resetPasswordForm();  // Clear form after success
        setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (error) {
        setPasswordError(getErrorMessage(error, "Failed to change password"));
    }
};
```

### 3. Account Information Display

**Shows:**
- Account Status (Active/Inactive)
- Status color coding (green for active, red for inactive)

## Component Structure

```typescript
export default function ManageAccountPage() {
    const { user, setUser } = useAuthStore();
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // React Hook Form setup for profile
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: { username: user?.username || "" },
    });

    // React Hook Form setup for password
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    return (
        <div className="h-full bg-secondary-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <h1>Account Settings</h1>

                {/* Profile Information Section */}
                <div className="bg-white rounded-lg p-6">
                    <h2>Profile Information</h2>
                    {profileError && <Alert type="error">{profileError}</Alert>}
                    {profileSuccess && <Alert type="success">{profileSuccess}</Alert>}
                    <form onSubmit={handleSubmitProfile(onUpdateProfile)}>
                        <FormInput label="Username" {...registerProfile("username")} />
                        <input value={user?.email} disabled />
                        <button type="submit">Update Profile</button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-lg p-6">
                    <h2>Change Password</h2>
                    {passwordError && <Alert type="error">{passwordError}</Alert>}
                    {passwordSuccess && <Alert type="success">{passwordSuccess}</Alert>}
                    <form onSubmit={handleSubmitPassword(onChangePassword)}>
                        <FormInput label="Current Password" type="password" {...registerPassword("currentPassword")} />
                        <FormInput label="New Password" type="password" {...registerPassword("newPassword")} />
                        <FormInput label="Confirm New Password" type="password" {...registerPassword("confirmPassword")} />
                        <button type="submit">Change Password</button>
                    </form>
                </div>

                {/* Account Information Section */}
                <div className="bg-white rounded-lg p-6">
                    <h2>Account Information</h2>
                    <div>
                        <span>Account Status</span>
                        <span className={user?.isActive ? "text-green-600" : "text-red-600"}>
                            {user?.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

## Key Features

### Separate Form State
Two independent React Hook Form instances prevent interference between forms:
```typescript
// Profile form
const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm(...);

// Password form
const { register: registerPassword, handleSubmit: handleSubmitPassword } = useForm(...);
```

### Auth Store Sync
When username is updated, it syncs with authStore:
```typescript
const updatedUser = await updateUser({ username: data.username });
setUser(updatedUser);  // Keep authStore in sync
```

### Auto-Dismiss Success Messages
Success messages disappear after 3 seconds:
```typescript
setProfileSuccess("Profile updated successfully!");
setTimeout(() => setProfileSuccess(null), 3000);
```

### Form Reset After Password Change
Password form clears after successful change:
```typescript
await changePassword({ ... });
resetPasswordForm();  // Clear all password fields
```

## Usage

Accessed via protected route:
```typescript
// App.tsx
{
  path: "/manage-account",
  element: (
    <ProtectedRoute>
      <ManageAccountPage />
    </ProtectedRoute>
  )
}
```

## Error Handling

### Common Errors

| Error | Cause | User Message |
|-------|-------|--------------|
| 400 | Validation error | Field-specific message |
| 401 | Wrong current password | "Current password is incorrect" |
| 409 | Username taken | "Username already exists" |
| 500 | Server error | "Failed to update profile" |

### Error Display
```typescript
{profileError && <Alert type="error">{profileError}</Alert>}
```

Errors extracted using `getErrorMessage()` utility for user-friendly messages.

## Related Files

- [user.ts (API)](../api/user.ts.md): updateUser, changePassword functions
- [authStore.ts](../stores/authStore.ts.md): User state management
- [FormInput.tsx](../components/ui/FormInput.tsx.md): Form input component
- [Alert.tsx](../components/ui/Alert.tsx.md): Alert component
- [error.ts](../lib/utils/error.ts.md): Error extraction utility
- [UserProfile.tsx](../components/UserProfile.tsx.md): Links to this page

## Validation Rules

### Username
- Minimum: 3 characters
- Maximum: 30 characters
- Must be unique across all users

### Password
- Minimum: 8 characters
- Must match confirmation field
- Current password required for verification

## Testing Examples

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageAccountPage from './ManageAccountPage';

test('updates username successfully', async () => {
    render(<ManageAccountPage />);

    const input = screen.getByLabelText(/username/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'newusername');

    const button = screen.getByRole('button', { name: /update profile/i });
    await userEvent.click(button);

    await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
});

test('validates password confirmation', async () => {
    render(<ManageAccountPage />);

    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'different');

    const button = screen.getByRole('button', { name: /change password/i });
    await userEvent.click(button);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
});
```

## UX Considerations

### Email Disabled
Email is read-only with explanation:
```typescript
<input
    type="email"
    value={user?.email || ""}
    disabled
    className="cursor-not-allowed bg-secondary-100"
/>
<p className="text-xs text-secondary-500">
    Email cannot be changed as it is used for login
</p>
```

### Loading States
Buttons show loading state during submission:
```typescript
<button disabled={isSubmittingProfile}>
    {isSubmittingProfile ? "Updating..." : "Update Profile"}
</button>
```

### Success Feedback
Clear visual feedback for successful operations with auto-dismiss.
