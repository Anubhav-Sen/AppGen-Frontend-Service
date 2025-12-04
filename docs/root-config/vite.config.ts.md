# vite.config.ts

**Location:** `/vite.config.ts`
**Type:** Build Configuration

## Purpose

Configures Vite, the build tool and development server. Vite provides lightning-fast hot module replacement (HMR) during development and optimized production builds.

## Configuration Breakdown

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Plugins

#### `@vitejs/plugin-react`
- Enables React Fast Refresh (instant component updates without page reload)
- Handles JSX transformation
- Optimizes React imports

### Path Aliases

#### `@` → `./src`
Allows importing from `src/` using the `@` shorthand:

```typescript
// Instead of:
import { Button } from '../../../components/Button';

// You can write:
import { Button } from '@/components/Button';
```

**Benefits:**
- Cleaner imports
- Easier refactoring (paths don't break when moving files)
- No need to count `../` levels

## How It Fits Into The Application

### Development Mode
When you run `npm run dev`:
1. Vite starts a dev server on `http://localhost:5173`
2. React plugin enables Fast Refresh
3. Path aliases are resolved automatically
4. Changes to files trigger instant updates

### Production Build
When you run `npm run build`:
1. TypeScript compiles first (`tsc -b`)
2. Vite bundles the app for production
3. Optimizations applied:
   - Code splitting
   - Tree shaking (removes unused code)
   - Minification
   - Asset optimization
4. Output goes to `/dist` folder

### Path Resolution Flow
```
Import: import { auth } from '@/api/auth'
         ↓
Vite:   Resolves @ to ./src
         ↓
Result: ./src/api/auth
```

## Key Features Used

### Why Vite?
- **Speed**: 10-100x faster than Webpack in development
- **Native ESM**: Uses browser's native ES modules
- **Optimized Builds**: Uses Rollup for production
- **Plugin Ecosystem**: Rich ecosystem of plugins

### React Plugin Benefits
- Zero-config React support
- Automatic JSX transformation
- Fast Refresh for instant feedback

## Environment Variables

Vite automatically loads environment variables from `.env` files:
- Variables prefixed with `VITE_` are exposed to client code
- Example: `VITE_API_BASE_URL` becomes `import.meta.env.VITE_API_BASE_URL`

## Related Files
- [package.json](./package.json.md): Defines Vite as a dependency
- [tsconfig.app.json](./tsconfig.app.json.md): TypeScript also uses the `@` path alias
- [jest.config.ts](./jest.config.ts.md): Jest needs the same path mapping for tests
- [index.html](../index.html.md): Entry point for Vite dev server

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Output Structure

After `npm run build`, the `dist/` folder contains:
```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js    # Main bundle (code split)
│   ├── index-[hash].css   # Styles
│   └── ...                # Images, fonts, etc.
└── vite.svg               # Static assets
```

## Performance Optimizations

Vite automatically:
- **Code Splits**: Large routes are loaded on demand
- **CSS Optimization**: Extracts and minifies CSS
- **Asset Hashing**: Enables long-term caching
- **Preload Directives**: Optimizes resource loading
