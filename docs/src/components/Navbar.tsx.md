# Navbar.tsx

**Location:** `/src/components/Navbar.tsx`
**Type:** Navigation Component

## Purpose

Top navigation bar that adapts based on authentication state, showing appropriate links for logged-in and logged-out users.

## Code

```typescript
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserProfile } from "./UserProfile";

export function Navbar() {
    const { user } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-secondary-300 px-6 py-4 shadow-md">
            <Link to="/" className="text-xl font-bold text-secondary-900 hover:text-primary-600 transition-colors">
                AppGen
            </Link>
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to="/projects" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Projects
                        </Link>
                        <UserProfile />
                    </>
                ) : (
                    <>
                        <Link to="/" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/login" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Login
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
```

## Features

### Conditional Rendering Based on Auth
```typescript
const { user } = useAuthStore();

{user ? (
  // Logged in: Show Projects + UserProfile
) : (
  // Logged out: Show Home + Login
)}
```

### Logged-In State
- **AppGen Logo** (links to home)
- **Projects** link
- **UserProfile** dropdown (avatar, manage account, logout)

### Logged-Out State
- **AppGen Logo** (links to home)
- **Home** link
- **Login** link

## Styling

### Sticky Positioning
```typescript
className="sticky top-0 z-50"
```

Navbar stays at top when scrolling.

### Layout
```typescript
className="flex items-center justify-between"
```

Logo on left, links on right.

## Usage in App

```typescript
// App.tsx
function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />  {/* Always visible */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
```

## Related Files

- [UserProfile.tsx](./UserProfile.tsx.md): Dropdown component in navbar
- [authStore.ts](../stores/authStore.ts.md): Source of user state
- [App.tsx](../App.tsx.md): Layout that includes navbar
