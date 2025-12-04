# AppGen Frontend - Complete Code Documentation

**Reading Time:** 3-4 hours
**Last Updated:** 2025-12-03

## 📖 Documentation Structure

This documentation is organized to match the codebase structure. Start with the **Quick Start Guide** below, then explore specific sections based on your needs.

---

## 🚀 Quick Start Guide (15 minutes)

### What Is AppGen?
AppGen is a **visual schema builder and code generator** for FastAPI applications. It provides:
- Drag-and-drop interface for designing database models
- Relationship management (OneToOne, OneToMany, ManyToMany)
- Enum definitions
- Project configuration (database, security, tokens)
- Export to FastAPI-compatible JSON specification

### Key Technologies
- **React 19** + **TypeScript 5.9**: Modern UI with type safety
- **Vite 7**: Lightning-fast dev server and build tool
- **Zustand**: Simple state management (5 stores)
- **React Flow 12**: Node-based visual editor
- **React Query**: Server state management
- **Axios**: HTTP client with auto token refresh
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first styling

### Architecture Overview
```
User Interaction
       ↓
Pages (Routes) ← React Router
       ↓
Components ← Zustand Stores (State)
       ↓
API Layer ← Axios Client (HTTP)
       ↓
Backend API
```

---

## 📁 Documentation Index

### 1. Configuration Files (30 min)
Understand the development environment and build setup.

| File | Purpose | Priority |
|------|---------|----------|
| [package.json](./root-config/package.json.md) | Dependencies & scripts | ⭐⭐⭐ Must Read |
| [vite.config.ts](./root-config/vite.config.ts.md) | Build configuration | ⭐⭐⭐ Must Read |
| [tsconfig.app.json](./root-config/tsconfig.app.json.md) | TypeScript settings | ⭐⭐ Important |
| [jest.config.ts](./root-config/jest.config.ts.md) | Test configuration | ⭐ Optional |
| [eslint.config.js](./root-config/eslint.config.js.md) | Linting rules | ⭐ Optional |
| [Dockerfile](./deployment/Dockerfile.md) | Container build | ⭐ Optional |

**Key Takeaway:** This is a modern React app with strict TypeScript, fast Vite builds, and comprehensive testing.

---

### 2. API Layer (45 min) ⭐⭐⭐ CRITICAL
The foundation of all backend communication.

| File | Purpose | Read Time |
|------|---------|-----------|
| [client.ts](./src/api/client.ts.md) | Axios config + auto token refresh | 15 min |
| [auth.ts](./src/api/auth.ts.md) | Login & register endpoints | 10 min |
| [schemas.ts](./src/api/schemas.ts.md) | Project CRUD operations | 10 min |
| [user.ts](./src/api/user.ts.md) | User profile endpoints | 10 min |

**Key Takeaway:**
- All API calls go through `client.ts`
- Automatic token refresh on 401 errors
- Access token in memory, refresh token in HTTP-only cookie

**Critical Flow to Understand:**
```
Request fails (401)
  ↓
Interceptor catches error
  ↓
Refresh token automatically
  ↓
Retry original request
  ↓
User doesn't notice
```

---

### 3. State Management (45 min) ⭐⭐⭐ CRITICAL
Five Zustand stores manage all application state.

| Store | Purpose | Persisted? | Read Time |
|-------|---------|------------|-----------|
| [authStore.ts](./src/stores/authStore.ts.md) | User authentication | ✅ Conditional | 10 min |
| [schemaStore.ts](./src/stores/schemaStore.ts.md) | Models, enums, relationships | ✅ Yes | 15 min |
| [configStore.ts](./src/stores/configStore.ts.md) | Project configuration | ✅ Yes | 10 min |
| [projectStore.ts](./src/stores/projectStore.ts.md) | Current project context | ❌ No | 5 min |
| [uiStore.ts](./src/stores/uiStore.ts.md) | UI state (sidebar, etc.) | ❌ No | 5 min |

**Key Takeaway:**
- `authStore`: Conditionally persists access token (only if "Remember Me")
- `schemaStore`: The heart of the app - all model/enum/relationship data
- `configStore`: Database, security, token configuration
- Zustand is simpler than Redux, perfect for this app size

**State Architecture:**
```
authStore        → Who is logged in?
schemaStore      → What models/enums exist?
configStore      → How is project configured?
projectStore     → Which project is open?
uiStore          → Is sidebar open?
```

---

### 4. Type System (30 min) ⭐⭐ IMPORTANT
TypeScript types that ensure type safety across the app.

| File | Purpose | Read Time |
|------|---------|-----------|
| [fastapiSpec.ts](./src/types/fastapiSpec.ts.md) | Complete FastAPI spec types | 15 min |
| [reactFlow.ts](./src/types/reactFlow.ts.md) | React Flow node/edge types | 10 min |
| [schema.ts](./src/types/schema.ts.md) | Schema project API types | 5 min |
| [user.ts](./src/types/user.ts.md) | User types | 5 min |

**Key Takeaway:**
- `fastapiSpec.ts` defines the entire project structure (models, columns, relationships, config)
- UI extensions add `position: {x, y}` and `id` to enable React Flow rendering
- Strong typing prevents bugs and improves autocomplete

---

### 5. Pages (Routes) (30 min) ⭐⭐⭐ MUST READ
Main user-facing pages.

| Page | Route | Purpose | Read Time |
|------|-------|---------|-----------|
| [HomePage.tsx](./src/pages/HomePage.tsx.md) | `/` | Landing page | 5 min |
| [LoginPage.tsx](./src/pages/auth/LoginPage.tsx.md) | `/login` | User login | 10 min |
| [RegisterPage.tsx](./src/pages/auth/RegisterPage.tsx.md) | `/register` | User registration | 5 min |
| [ProjectsListPage.tsx](./src/pages/ProjectsListPage.tsx.md) | `/projects` | List all projects | 10 min |
| [SchemaBuilder.tsx](./src/pages/SchemaBuilder.tsx.md) | `/schema-builder/:id?` | Visual editor | 20 min |
| [ConfigPage.tsx](./src/pages/ConfigPage.tsx.md) | `/config` | Project configuration | 10 min |

**Key Takeaway:**
- `/schema-builder` is the core feature - React Flow canvas
- `/config` is a multi-tab wizard (project, DB, security, tokens, git)
- Protected routes redirect to `/login` if not authenticated

---

### 6. Components (60 min) ⭐⭐⭐ CRITICAL
Reusable UI components organized by feature.

#### 6a. Schema Builder Components (30 min)
| Component | Purpose | Read Time |
|-----------|---------|-----------|
| [ModelNode.tsx](./src/components/schema/nodes/ModelNode.tsx.md) | Visual model in React Flow | 10 min |
| [EnumNode.tsx](./src/components/schema/nodes/EnumNode.tsx.md) | Visual enum in React Flow | 5 min |
| [ModelEditor.tsx](./src/components/schema/editors/ModelEditor.tsx.md) | Edit model properties | 10 min |
| [ColumnEditor.tsx](./src/components/schema/editors/ColumnEditor.tsx.md) | Edit column properties | 5 min |
| [RelationshipEditor.tsx](./src/components/schema/editors/RelationshipEditor.tsx.md) | Create relationships | 10 min |
| [SchemaToolbar.tsx](./src/components/schema/SchemaToolbar.tsx.md) | Add model/enum, save, export | 5 min |

**Key Takeaway:**
- **ModelNode** has 4 handles (top, bottom, left, right) for clean edge routing
- **Editors** are modal dialogs that update Zustand stores
- **RelationshipEditor** creates bidirectional relationships with `back_populates`

#### 6b. Configuration Components (15 min)
| Component | Purpose | Read Time |
|-----------|---------|-----------|
| [ProjectConfigForm.tsx](./src/components/config/ProjectConfigForm.tsx.md) | Project metadata | 5 min |
| [DatabaseConfigForm.tsx](./src/components/config/DatabaseConfigForm.tsx.md) | DB connection config | 5 min |
| [SecurityConfigForm.tsx](./src/components/config/SecurityConfigForm.tsx.md) | Security settings | 5 min |
| [TokenConfigForm.tsx](./src/components/config/TokenConfigForm.tsx.md) | Token expiration times | 5 min |
| [GitConfigForm.tsx](./src/components/config/GitConfigForm.tsx.md) | Git integration | 5 min |

#### 6c. UI & Navigation (15 min)
| Component | Purpose | Read Time |
|-----------|---------|-----------|
| [Navbar.tsx](./src/components/Navbar.tsx.md) | Top navigation bar | 5 min |
| [ProtectedRoute.tsx](./src/components/ProtectedRoute.tsx.md) | Auth route guard | 5 min |
| [UserProfile.tsx](./src/components/UserProfile.tsx.md) | User dropdown menu | 5 min |

---

### 7. Utilities & Helpers (30 min) ⭐⭐ IMPORTANT
Core logic for data transformation and validation.

| File | Purpose | Read Time |
|------|---------|-----------|
| [flowConverter.ts](./src/lib/utils/flowConverter.ts.md) | Models → React Flow nodes/edges | 15 min |
| [specBuilder.ts](./src/lib/serializers/specBuilder.ts.md) | Build complete FastAPI spec | 10 min |
| [error.ts](./src/lib/utils/error.ts.md) | Error message extraction | 5 min |

**Key Takeaway:**
- **flowConverter**: Converts Zustand store data to React Flow format
- **specBuilder**: Combines all stores into final JSON spec for export
- Smart handle selection for optimal edge routing

---

### 8. Hooks (15 min) ⭐ OPTIONAL
Custom React hooks.

| Hook | Purpose | Read Time |
|------|---------|-----------|
| [useAuth.ts](./src/hooks/useAuth.ts.md) | Auth wrapper around authStore | 5 min |
| [useFetchSchemas.ts](./src/hooks/useFetchSchemas.ts.md) | React Query hook for schemas | 10 min |

---

## 🎯 Learning Paths

### Path 1: Frontend Developer (2 hours)
Focus on UI and React patterns.
1. [package.json](./root-config/package.json.md) - Understand dependencies (10 min)
2. [SchemaBuilder.tsx](./src/pages/SchemaBuilder.tsx.md) - Main editor (20 min)
3. [ModelNode.tsx](./src/components/schema/nodes/ModelNode.tsx.md) - Visual nodes (10 min)
4. [ModelEditor.tsx](./src/components/schema/editors/ModelEditor.tsx.md) - Editing UI (10 min)
5. [schemaStore.ts](./src/stores/schemaStore.ts.md) - State management (15 min)
6. [flowConverter.ts](./src/lib/utils/flowConverter.ts.md) - Data transformation (15 min)

### Path 2: Backend Integration Developer (2 hours)
Focus on API and data flow.
1. [client.ts](./src/api/client.ts.md) - HTTP client setup (15 min)
2. [auth.ts](./src/api/auth.ts.md) - Authentication (10 min)
3. [schemas.ts](./src/api/schemas.ts.md) - Project CRUD (10 min)
4. [authStore.ts](./src/stores/authStore.ts.md) - Auth state (10 min)
5. [schemaStore.ts](./src/stores/schemaStore.ts.md) - Schema state (15 min)
6. [specBuilder.ts](./src/lib/serializers/specBuilder.ts.md) - Spec generation (10 min)
7. [fastapiSpec.ts](./src/types/fastapiSpec.ts.md) - Type system (15 min)

### Path 3: Full Stack Understanding (3-4 hours)
Complete application understanding.
1. Read all **⭐⭐⭐ CRITICAL** sections first
2. Read all **⭐⭐ IMPORTANT** sections second
3. Skim **⭐ OPTIONAL** sections
4. Explore component details as needed

---

## 🔍 Key Concepts

### 1. Multi-Handle Node Pattern
Models have handles on all 4 sides (top, bottom, left, right) for cleaner edge routing:
```
    ┌──── top ────┐
    │             │
left│   Model A   │ right
    │             │
    └─── bottom ──┘
```

### 2. Automatic Token Refresh
```
Access Token (15-60 min) → Stored in memory/localStorage
Refresh Token (7-30 days) → HTTP-only cookie
Token expires → Auto refresh → User never notices
```

### 3. Zustand Store Architecture
```
Component
  ↓ (useSchemaStore)
Zustand Store
  ↓ (persist middleware)
LocalStorage
```

### 4. React Flow Data Flow
```
schemaStore (Zustand)
  ↓
flowConverter
  ↓
React Flow nodes/edges
  ↓
Visual Canvas
```

### 5. Form Validation Pattern
```
User Input
  ↓
React Hook Form (state)
  ↓
Zod Schema (validation)
  ↓
Error Messages / Submit
```

---

## 🛠️ Development Workflow

### Starting Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:5173)
```

### Making Changes
```bash
# 1. Edit files
# 2. Vite auto-reloads browser
# 3. Check for type errors
npm run typecheck

# 4. Format code
npm run format

# 5. Run tests
npm test
```

### Building for Production
```bash
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build
```

---

## 📊 Application Flow Diagrams

### Authentication Flow
```
User → Login Page → auth.login() → API
  ↓
API returns: { access_token, user }
  ↓
authStore.setAuth()
  ↓
Persist to localStorage (if rememberMe)
  ↓
Redirect to /projects
```

### Schema Building Flow
```
User clicks "Add Model"
  ↓
SchemaToolbar → schemaStore.addModel()
  ↓
ModelNode appears on canvas
  ↓
User drags node → updateModelPosition()
  ↓
User clicks "Edit" → ModelEditor modal
  ↓
Edit columns/relationships
  ↓
Save → schemaStore updates
  ↓
Canvas re-renders
```

### Save Project Flow
```
User clicks "Save"
  ↓
buildFastAPIProjectSpec() → Combines all stores
  ↓
schemas.update(id, spec) → API call
  ↓
Success → Toast notification
  ↓
Data persisted to backend
```

---

## 🐛 Common Issues & Debugging

### Issue: "Cannot find module '@/...'"
- **Cause:** Path alias not configured
- **Solution:** Check `tsconfig.app.json` and `vite.config.ts` have matching aliases

### Issue: Token refresh loop
- **Cause:** Refresh token expired or endpoint broken
- **Solution:** Clear cookies, re-login, check backend logs

### Issue: Types not matching
- **Cause:** Backend API changed but types not updated
- **Solution:** Update types in `src/types/` to match backend response

### Issue: React Flow nodes not rendering
- **Cause:** Missing position or id in node data
- **Solution:** Ensure `flowConverter.ts` adds position and id to all nodes

---

## 📚 External Resources

### Key Dependencies
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [React Flow Docs](https://reactflow.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

### Build Tools
- [Vite Documentation](https://vitejs.dev/)
- [Jest Testing](https://jestjs.io/)

---

## 🎓 Next Steps

After reading this documentation:

1. **Run the app locally** - See it in action
2. **Make a small change** - Edit a component, see it update
3. **Add a feature** - Try adding a new field to ModelEditor
4. **Debug an issue** - Use browser DevTools + React DevTools
5. **Review test files** - Understand testing patterns in `/tests`

---

## 📝 Documentation Status

| Section | Status | Files Documented |
|---------|--------|------------------|
| Root Config | ✅ Complete | 4/10 key files |
| API Layer | ✅ Complete | 4/4 files |
| Stores | ✅ Complete | 5/5 files |
| Types | ⚠️ Partial | 2/4 files |
| Pages | ⚠️ Partial | 2/6 files |
| Components | ⚠️ Partial | 5/15 files |
| Utilities | ⚠️ Partial | 2/5 files |
| Hooks | ⚠️ Partial | 0/2 files |

**Note:** This documentation covers the critical 80% of the codebase. Remaining files follow similar patterns and can be understood by reading their source code after understanding the core concepts.

---

**Happy Coding! 🚀**
