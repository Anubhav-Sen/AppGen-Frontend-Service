# uiStore.ts

**Location:** `/src/stores/uiStore.ts`
**Type:** Zustand Store

## Purpose

Manages ephemeral UI state like sidebar open/close. This store is **NOT persisted** - resets on page refresh.

## State Interface

```typescript
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}
```

## State Properties

### `sidebarOpen`
```typescript
sidebarOpen: boolean
```

Whether the sidebar is currently open.

**Default:** `false`

## Actions

### `toggleSidebar()`
```typescript
toggleSidebar: () => void
```

Toggle sidebar open/closed state.

## Implementation

```typescript
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## Usage

```typescript
import { useUIStore } from '@/stores/uiStore';

function Sidebar() {
  const isOpen = useUIStore(state => state.sidebarOpen);
  const toggle = useUIStore(state => state.toggleSidebar);

  return (
    <div className={isOpen ? 'w-64' : 'w-0'}>
      <button onClick={toggle}>Toggle</button>
      {/* sidebar content */}
    </div>
  );
}
```

## Why Not Persisted?

UI state like sidebar open/closed is typically:
- User preference per session
- Not critical to persist
- Better UX to start fresh each session

If you want to persist it:
```typescript
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'ui-storage' }
  )
);
```

## Related Files
- Any component with sidebar/drawer UI
- Navbar.tsx (may have sidebar toggle)

## Common Pattern

```typescript
// In any component
const { sidebarOpen, toggleSidebar } = useUIStore();

return (
  <div>
    <button onClick={toggleSidebar}>
      {sidebarOpen ? 'Close' : 'Open'} Sidebar
    </button>
  </div>
);
```

## Future Extensions

Add more UI state as needed:
```typescript
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // New UI states
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}
```
