# package.json

**Location:** `/package.json`
**Type:** Configuration File (NPM)

## Purpose

This file defines the project's metadata, dependencies, and available NPM scripts. It's the central configuration for the Node.js/NPM ecosystem.

## Key Information

### Project Metadata
- **Name:** appgen-frontend
- **Version:** 0.0.0 (development version)
- **Type:** module (ES modules)
- **Private:** true (not published to NPM)

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Starts development server on port 5173 with hot reload |
| `build` | `tsc -b && vite build` | Type-checks TypeScript and builds for production |
| `preview` | `vite preview` | Previews production build locally |
| `typecheck` | `tsc --noEmit` | Type-checks without emitting files |
| `lint` | `eslint . --ext .ts,.tsx` | Lints all TypeScript files |
| `lint:fix` | `eslint . --ext .ts,.tsx --fix` | Auto-fixes linting issues |
| `format` | `prettier --write .` | Formats code with Prettier |
| `format:check` | `prettier --check .` | Checks if code is formatted |
| `test` | `jest --passWithNoTests` | Runs Jest tests |
| `test:watch` | `jest --watch` | Runs tests in watch mode |

## Dependencies (Production)

### Core Framework
- **react** (19.2.0): Core React library
- **react-dom** (19.2.0): React DOM renderer

### Routing
- **react-router-dom** (7.9.5): Client-side routing

### State Management
- **zustand** (5.0.8): Lightweight state management
- **@tanstack/react-query** (5.90.7): Server state management (caching, fetching)

### Forms & Validation
- **react-hook-form** (7.66.0): Form state management
- **@hookform/resolvers** (5.2.2): Validation resolvers for react-hook-form
- **zod** (4.1.12): Schema validation

### HTTP Client
- **axios** (1.13.2): Promise-based HTTP client

### Visualization
- **@xyflow/react** (12.9.3): Modern React Flow library for node-based UIs
- **reactflow** (11.11.4): Legacy React Flow (for backwards compatibility)

## DevDependencies (Development)

### Build Tools
- **vite** (7.2.2): Fast build tool and dev server
- **@vitejs/plugin-react** (5.1.0): Vite plugin for React support
- **typescript** (5.9.3): TypeScript compiler

### Styling
- **tailwindcss** (4.1.17): Utility-first CSS framework
- **@tailwindcss/postcss** (4.1.17): Tailwind PostCSS plugin
- **postcss** (8.5.6): CSS transformation tool
- **autoprefixer** (10.4.22): Adds vendor prefixes

### Testing
- **jest** (30.2.0): JavaScript testing framework
- **@testing-library/react** (16.3.0): React testing utilities
- **@testing-library/jest-dom** (6.9.1): Custom Jest matchers
- **@testing-library/user-event** (14.6.1): User interaction simulation
- **jest-environment-jsdom** (30.2.0): DOM environment for Jest
- **ts-jest** (29.4.5): TypeScript preprocessor for Jest
- **identity-obj-proxy** (3.0.0): Mock CSS imports in tests

### Linting & Formatting
- **eslint** (9.39.1): JavaScript/TypeScript linter
- **@typescript-eslint/** packages: TypeScript-specific ESLint rules
- **eslint-plugin-react**: React-specific linting rules
- **eslint-plugin-react-hooks**: React hooks linting
- **eslint-plugin-jsx-a11y**: Accessibility linting
- **eslint-plugin-import**: Import/export linting
- **eslint-plugin-simple-import-sort**: Auto-sort imports
- **prettier** (3.6.2): Code formatter
- **eslint-config-prettier**: Disables conflicting ESLint rules

### Type Definitions
- **@types/react**, **@types/react-dom**, **@types/node**, **@types/jest**: TypeScript type definitions

## How It Fits Into The Application

1. **Dependency Management**: All external libraries are declared here and installed via `npm install`
2. **Script Automation**: Provides consistent commands for common tasks (dev, build, test)
3. **Build Configuration**: Vite uses this to understand project structure
4. **Type Safety**: TypeScript definitions ensure type checking works
5. **Development Workflow**: Scripts like `dev`, `lint`, `test` form the development loop

## Key Decisions

### Why These Dependencies?
- **React 19**: Latest React with improved performance
- **Vite 7**: Fastest build tool with great DX
- **Zustand**: Simpler than Redux, perfect for medium apps
- **React Query**: Best-in-class server state management
- **React Flow 12**: Visual node-based editor for schema design
- **Zod**: Type-safe validation that integrates with TypeScript

### Module Type
Set to `"module"` to use ES6 imports throughout the project.

### Private Flag
Set to `true` to prevent accidental publishing to NPM registry.

## Related Files
- [vite.config.ts](./vite.config.ts.md): Uses dependencies defined here
- [tsconfig.json](./tsconfig.json.md): TypeScript configuration
- [eslint.config.js](./eslint.config.js.md): Uses ESLint dependencies
- [jest.config.ts](./jest.config.ts.md): Uses testing dependencies
