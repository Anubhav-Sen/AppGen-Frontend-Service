# UserProfile.tsx

**Location:** `/src/components/UserProfile.tsx`
**Type:** Dropdown Component

## Purpose

User profile dropdown in navbar showing user info, account link, and logout button. Includes click-outside-to-close functionality.

## Key Features

### 1. Avatar with Initial
```typescript
const getInitial = () => {
  if (user.username) return user.username.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "U";
};

<button className="w-10 h-10 rounded-full bg-primary-500">
  {getInitial()}
</button>
```

Shows first letter of username/email as avatar.

### 2. Dropdown Menu
```typescript
{isOpen && (
  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg">
    {/* User info */}
    {/* Manage Account link */}
    {/* Logout button */}
  </div>
)}
```

### 3. Click Outside to Close
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isOpen]);
```

Closes dropdown when clicking outside.

### 4. Logout
```typescript
const handleLogout = () => {
  clearAuth();
  navigate("/login");
};
```

Clears auth state and redirects to login.

## Dropdown Contents

| Section | Content |
|---------|---------|
| Header | Username and email |
| Link | Manage Account (with settings icon) |
| Button | Logout (with logout icon, red text) |

## Related Files

- [Navbar.tsx](./Navbar.tsx.md): Parent component
- [authStore.ts](../stores/authStore.ts.md): Auth state source
- [ManageAccountPage.tsx](../pages/ManageAccountPage.tsx.md): Target of account link
