# tsconfig.app.json

**Location:** `/tsconfig.app.json`
**Type:** TypeScript Configuration

## Purpose

Configures TypeScript compiler settings specifically for application code (not tests or build tools). This enables type checking, IDE intelligence, and compile-time error detection.

## Key Compiler Options

### Target & Module
```json
{
  "target": "ES2022",           // Compile to ES2022 JavaScript
  "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "module": "ESNext",           // Use latest module system
  "moduleResolution": "bundler" // Let bundler (Vite) handle resolution
}
```

- **ES2022 Target**: Modern JavaScript features (async/await, optional chaining, etc.)
- **DOM Libraries**: TypeScript knows about browser APIs (document, window, etc.)
- **ESNext Modules**: Latest import/export syntax

### JSX Configuration
```json
{
  "jsx": "react-jsx"  // New JSX transform (no need to import React)
}
```

Enables React 17+ JSX without explicit React imports:
```tsx
// This works without: import React from 'react'
export function Button() {
  return <button>Click me</button>;
}
```

### Path Aliases
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Maps `@/` imports to `src/` directory (matches Vite config).

### Strict Type Checking
```json
{
  "strict": true,                      // Enable all strict checks
  "noUnusedLocals": true,              // Error on unused variables
  "noUnusedParameters": true,          // Error on unused function params
  "noFallthroughCasesInSwitch": true   // Error on missing break in switch
}
```

These settings catch bugs at compile time:
- Prevents `null`/`undefined` errors
- Ensures all code paths return values
- Catches typos and unused code

### Bundler Mode
```json
{
  "moduleResolution": "bundler",
  "allowImportingTsExtensions": true,   // Allow .ts in imports
  "verbatimModuleSyntax": true,         // Preserve import syntax
  "noEmit": true                        // Don't emit JS (Vite handles it)
}
```

Optimized for Vite bundler:
- Vite handles the actual compilation
- TypeScript only does type checking
- Can import `.ts` files directly

## Files Included/Excluded

### Included
```json
{
  "include": ["src"]
}
```
Only application code in `src/` folder.

### Excluded
```json
{
  "exclude": ["src/setupTests.ts", "**/*.test.ts", "**/*.test.tsx"]
}
```
Test files use separate config ([tsconfig.test.json](./tsconfig.test.json.md)).

## How It Fits Into The Application

### Development Flow
1. **IDE Integration**: VS Code uses this config for IntelliSense
   - Auto-completion
   - Type hints
   - Error highlighting

2. **Type Checking**: `npm run typecheck` runs `tsc --noEmit`
   - Validates all types
   - No output files (Vite handles compilation)

3. **Build Process**: `npm run build` runs `tsc -b` first
   - Ensures no type errors before building
   - Fails fast if types are wrong

### Benefits of Strict Mode

**Without Strict:**
```typescript
function getUser(id) {  // Any type, no safety
  return users[id];      // Could return undefined
}
const name = getUser(1).name;  // Runtime error if undefined
```

**With Strict:**
```typescript
function getUser(id: string): User | undefined {
  return users[id];
}
const user = getUser("1");
const name = user?.name;  // Type-safe, prevents errors
```

## Path Alias Example

**Without Alias:**
```typescript
import { Model } from '../../../../types/fastapiSpec';
import { useAuth } from '../../../hooks/useAuth';
```

**With Alias:**
```typescript
import { Model } from '@/types/fastapiSpec';
import { useAuth } from '@/hooks/useAuth';
```

## Type Safety Levels

| Setting | Strictness | Description |
|---------|-----------|-------------|
| `strict: true` | High | All strict checks enabled |
| `noUnusedLocals` | Medium | Catches dead code |
| `noUnusedParameters` | Medium | Catches unused args |
| `noFallthroughCasesInSwitch` | Low | Prevents switch bugs |

## Related Files
- [tsconfig.json](./tsconfig.json.md): Root config that references this file
- [tsconfig.node.json](./tsconfig.node.json.md): Config for build tools
- [tsconfig.test.json](./tsconfig.test.json.md): Config for test files
- [vite.config.ts](./vite.config.ts.md): Uses same path aliases
- [package.json](./package.json.md): `typecheck` script uses this

## Common TypeScript Commands

```bash
# Type check without emitting files
npm run typecheck

# Type check and build
npm run build

# Watch mode (IDE does this automatically)
tsc -b --watch
```

## Why These Settings?

- **ES2022**: Modern features without polyfills for recent browsers
- **Strict Mode**: Catch bugs early, better code quality
- **No Emit**: Vite is faster at transpilation
- **Bundler Resolution**: Works with Vite's module resolution
- **Path Aliases**: Cleaner imports, easier refactoring
