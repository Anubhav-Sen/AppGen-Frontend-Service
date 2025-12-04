# main.tsx

**Location:** `/src/main.tsx`
**Type:** Application Entry Point

## Purpose

The entry point for the React application. Mounts the React app to the DOM with React 19's `StrictMode`.

## Code

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App.tsx";
import "./index.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## Breakdown

### 1. Imports
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
```

**React 19 Rendering:**
- Uses `createRoot` API (React 18+)
- Enables concurrent features
- Wraps app in `StrictMode` for development checks

---

### 2. Import App Component
```typescript
import App from "@/App.tsx";
```

The main `<App />` component that contains routing and providers.

---

### 3. Import Global Styles
```typescript
import "./index.css";
import "./styles/globals.css";
```

**index.css:** Tailwind directives (@tailwind base, components, utilities)
**globals.css:** Custom global styles, CSS variables

---

### 4. Mount to DOM
```typescript
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**Explanation:**
- `document.getElementById("root")` - Gets `<div id="root">` from `index.html`
- `createRoot()` - Creates React root (React 18+ API)
- `.render()` - Renders the app
- `!` - Non-null assertion (TypeScript trusts root exists)

---

## StrictMode

```typescript
<StrictMode>
  <App />
</StrictMode>
```

**What it does (Development only):**
- Detects unsafe lifecycle methods
- Warns about legacy string refs
- Warns about deprecated findDOMNode
- Detects unexpected side effects (double-invokes functions)
- Detects legacy context API

**Production:** No overhead - StrictMode checks are removed.

---

## HTML Entry Point

**public/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AppGen</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Vite injects the compiled `main.tsx` and renders the React app into `#root`.

---

## Application Flow

```
Browser loads index.html
  ↓
Vite injects main.tsx
  ↓
main.tsx runs:
  - Import styles (index.css, globals.css)
  - Import App component
  - createRoot(#root)
  - Render <StrictMode><App /></StrictMode>
  ↓
App.tsx runs:
  - QueryClientProvider setup
  - RouterProvider with routes
  ↓
User sees the application
```

---

## Related Files

- [App.tsx](./App.tsx.md): Main application component
- [index.html](../public/index.html): HTML template with `#root` div
- [vite.config.ts](../root-config/vite.config.ts.md): Vite build configuration
- [index.css](./index.css): Tailwind directives
- [globals.css](./styles/globals.css): Custom global styles

---

## Customization Examples

### Remove StrictMode
```typescript
createRoot(document.getElementById("root")!).render(<App />);
```

### Add Error Boundary
```typescript
import { ErrorBoundary } from 'react-error-boundary';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
```

### Add Dev Tools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
  </StrictMode>,
);
```

---

## Build Process

### Development
```bash
npm run dev
```
Vite serves `main.tsx` with hot module replacement.

### Production
```bash
npm run build
```
Vite compiles `main.tsx` → optimized bundle in `dist/`.

---

## Common Issues

### "Cannot find module '@/App.tsx'"
**Fix:** Check `tsconfig.app.json` and `vite.config.ts` have correct path alias:
```typescript
// vite.config.ts
resolve: {
  alias: { "@": path.resolve(__dirname, "./src") }
}
```

### "Element with id 'root' not found"
**Fix:** Ensure `index.html` has `<div id="root"></div>`

### Styles Not Loading
**Fix:** Check imports:
```typescript
import "./index.css";        // ✅
import "./styles/globals.css"; // ✅
```
