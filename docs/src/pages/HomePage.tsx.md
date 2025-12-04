# HomePage.tsx

**Location:** `/src/pages/HomePage.tsx`
**Type:** Landing Page Component

## Purpose

The landing/home page that showcases the application features and provides a call-to-action for users to get started. Adapts based on authentication state.

## Features

### 1. Conditional "Get Started" Navigation
```typescript
const handleGetStarted = () => {
    if (user) {
        navigate("/projects");
    } else {
        navigate("/login");
    }
};
```

**Behavior:**
- Logged-in users → Navigate to `/projects`
- Logged-out users → Navigate to `/login`

### 2. Feature Cards (3 cards)

**Schema Management:**
- Icon: Document icon
- Description: "Create and manage your database schemas with ease"

**Rapid Development:**
- Icon: Lightning icon
- Description: "Generate code and APIs automatically from your schemas"

**Type Safe:**
- Icon: Shield icon
- Description: "Built with TypeScript for maximum type safety"

### 3. Getting Started Steps

Three-step process overview:
1. Define your data models and relationships
2. Generate backend code and API endpoints
3. Deploy and start building your application

## Component Structure

```typescript
export default function HomePage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const handleGetStarted = () => {
        if (user) {
            navigate("/projects");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="h-full bg-secondary-50">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <h1>Welcome to AppGen Frontend</h1>
                <p>Schema creation UI powered by React Flow</p>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 3 feature cards */}
                </div>

                {/* Getting Started Section */}
                <div className="bg-white rounded-lg">
                    <h2>Getting Started</h2>
                    {/* 3 numbered steps */}
                    <button onClick={handleGetStarted}>Get Started</button>
                </div>
            </div>
        </div>
    );
}
```

## Usage

This page is accessed via public route:
```typescript
// App.tsx
{
  path: "/",
  element: (
    <PublicRoute>
      <HomePage />
    </PublicRoute>
  )
}
```

## Styling

- **Responsive Grid:** 1 column on mobile, 3 columns on desktop (md:grid-cols-3)
- **Card Hover Effects:** shadow-sm → shadow-md on hover
- **Icon Backgrounds:** Primary color with opacity
- **CTA Button:** Primary color with shadow-primary-glow

## Related Files

- [PublicRoute.tsx](../components/PublicRoute.tsx.md): Route wrapper
- [authStore.ts](../stores/authStore.ts.md): User state source
- [App.tsx](../App.tsx.md): Route definition

## User Flows

### Scenario 1: Logged-Out User
```
Visit / (HomePage)
  ↓
Click "Get Started"
  ↓
Navigate to /login
  ↓
Login successful
  ↓
Redirected to /projects
```

### Scenario 2: Logged-In User
```
Visit / (HomePage)
  ↓
PublicRoute detects user
  ↓
Auto-redirect to /projects
```

Or if they manually access:
```
Visit / (HomePage)
  ↓
Click "Get Started"
  ↓
Navigate to /projects (skip login)
```

## Customization Examples

### Add More Feature Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {/* Existing 3 cards */}
    <div className="bg-white rounded-lg border p-6">
        <h3>New Feature</h3>
        <p>Description here</p>
    </div>
</div>
```

### Change CTA Based on Auth
```typescript
<button onClick={handleGetStarted}>
    {user ? "Go to Projects" : "Get Started"}
</button>
```
