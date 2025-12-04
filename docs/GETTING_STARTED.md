# Getting Started with AppGen Frontend

**Reading Time:** 20 minutes
**Goal:** Get you productive with the codebase as quickly as possible

---

## 🎯 What You'll Learn

By the end of this guide, you'll:
1. Understand what AppGen does
2. Know how to navigate the codebase
3. Be able to make your first code change
4. Understand the core architectural patterns

---

## 📚 Documentation Structure

We've created comprehensive documentation for you:

```
docs/
├── README.md                    ⭐ START HERE - Master index (3-4 hours)
├── GETTING_STARTED.md           ⭐ This file (20 minutes)
├── ARCHITECTURE.md              Deep dive into system design (45 min)
├── QUICK_REFERENCE.md           Fast lookup for common tasks (15 min)
│
├── root-config/                 Build & config documentation
│   ├── package.json.md
│   ├── vite.config.ts.md
│   ├── tsconfig.app.json.md
│   └── jest.config.ts.md
│
└── src/                         Source code documentation
    ├── api/                     API client & endpoints
    │   ├── client.ts.md         ⭐ HTTP client with auto token refresh
    │   └── auth.ts.md
    ├── stores/                  State management
    │   ├── authStore.ts.md      ⭐ Authentication state
    │   ├── schemaStore.ts.md    ⭐ Schema design state (critical!)
    │   └── configStore.ts.md
    └── lib/
        ├── utils/
        │   └── flowConverter.ts.md   ⭐ Converts data to React Flow
        └── serializers/
            └── specBuilder.ts.md     ⭐ Builds final spec for export
```

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env
# VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173

### 4. Verify It Works
- You should see the landing page
- Click "Get Started" → Should redirect to login
- Create an account and log in

---

## 🏗️ What Is AppGen?

**AppGen is a visual schema builder for FastAPI applications.**

### The Problem It Solves
Developers spend hours writing boilerplate code for:
- Database models (SQLAlchemy)
- API endpoints (FastAPI)
- Relationships between models
- Authentication & configuration

### The Solution
AppGen provides a **drag-and-drop interface** where you:
1. Design database models visually
2. Define relationships by connecting nodes
3. Configure project settings (database, security, etc.)
4. Export a complete FastAPI specification

### The Backend (Separate Codebase)
The backend receives this spec and **generates a complete FastAPI project**:
- SQLAlchemy models
- CRUD endpoints
- Authentication system
- Database migrations
- Docker configuration

---

## 🎨 Visual Tour

### Main Interface: Schema Builder

```
┌────────────────────────────────────────────────────────┐
│ Navbar: [Logo] [Projects] [User Menu]                  │
├────────────────────────────────────────────────────────┤
│ Toolbar: [Add Model] [Add Enum] [Save] [Export JSON]  │
├────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐              ┌─────────────┐        │
│   │   User      │──────────────│   Post      │        │
│   ├─────────────┤  OneToMany   ├─────────────┤        │
│   │ id          │    posts     │ id          │        │
│   │ email       │─────────────▶│ title       │        │
│   │ username    │              │ body        │        │
│   │ created_at  │              │ author_id   │        │
│   └─────────────┘              └─────────────┘        │
│                                                         │
│                    ┌─────────────┐                     │
│                    │  UserRole   │                     │
│                    │ (Enum)      │                     │
│                    │ - ADMIN     │                     │
│                    │ - USER      │                     │
│                    │ - GUEST     │                     │
│                    └─────────────┘                     │
│                                                         │
│  [React Flow Canvas - Drag, zoom, pan]                │
└────────────────────────────────────────────────────────┘
```

### Workflow
```
1. Login/Register
   ↓
2. Projects List → Create new or open existing
   ↓
3. Schema Builder → Design models visually
   ↓
4. Configuration → Set up database, security, etc.
   ↓
5. Export → Save project or download JSON spec
```

---

## 🧠 Core Concepts (10 minutes)

### 1. State Management: Five Zustand Stores

Think of stores as "global variables with superpowers":

```typescript
// authStore: Who is logged in?
const user = useAuthStore(state => state.user);
const accessToken = useAuthStore(state => state.accessToken);

// schemaStore: What models exist? (THE BIG ONE)
const models = useSchemaStore(state => state.models);
const enums = useSchemaStore(state => state.enums);

// configStore: How is the project configured?
const database = useConfigStore(state => state.database);
const security = useConfigStore(state => state.security);

// projectStore: Which project is open?
const currentProject = useProjectStore(state => state.currentProject);

// uiStore: UI state (sidebar open?)
const sidebarOpen = useUiStore(state => state.sidebarOpen);
```

**Key Insight:** All application state lives in these 5 stores. No prop drilling!

### 2. React Flow: Visual Node Editor

**What is it?**
A library for building node-based UIs (like flowcharts, diagrams, etc.).

**How we use it:**
- Each **model** = a **node** on the canvas
- Each **relationship** = an **edge** (connection line)
- Users drag nodes around, we store positions

**The Magic:**
```typescript
// schemaStore has this:
{
  models: [
    { id: "1", name: "User", position: { x: 100, y: 100 }, ... }
  ]
}

// flowConverter turns it into this:
{
  nodes: [
    { id: "1", type: "model", position: { x: 100, y: 100 }, data: {...} }
  ]
}

// React Flow renders it visually ✨
```

### 3. Automatic Token Refresh

**Problem:** Access tokens expire (e.g., after 15 minutes).

**Old Solution:** Log user out → bad UX.

**Our Solution:** Automatic silent refresh!

```
API call fails (401 Unauthorized)
  ↓
Interceptor catches error
  ↓
POST /auth/refresh (sends httpOnly cookie)
  ↓
Get new access token
  ↓
Retry original request
  ↓
User never notices! ✨
```

**Implementation:** [src/api/client.ts](./src/api/client.ts.md)

### 4. Two-Way Data Binding

```
User drags ModelNode
  ↓
React Flow onNodesChange event
  ↓
schemaStore.updateModelPosition(id, newPos)
  ↓
Store updates → Component re-renders
  ↓
Node appears in new position
```

This happens in **real-time** as you drag!

### 5. Persistence

**What persists:**
- authStore → localStorage (if "Remember Me")
- schemaStore → localStorage (always)
- configStore → localStorage (always)

**What doesn't:**
- projectStore (session only)
- uiStore (session only)

**Why it matters:**
Refresh the page → Your work is still there!

---

## 📂 Navigating the Codebase

### Most Important Files (Read These First)

| File | Why It's Important | Time |
|------|-------------------|------|
| [src/api/client.ts](./src/api/client.ts.md) | All API calls go through here | 15 min |
| [src/stores/schemaStore.ts](./src/stores/schemaStore.ts.md) | The heart of the app - all schema data | 20 min |
| [src/stores/authStore.ts](./src/stores/authStore.ts.md) | Authentication state | 10 min |
| [src/lib/utils/flowConverter.ts](./src/lib/utils/flowConverter.ts.md) | Converts data to React Flow format | 15 min |
| [src/lib/serializers/specBuilder.ts](./src/lib/serializers/specBuilder.ts.md) | Builds final export spec | 10 min |

### Directory Guide

```
src/
├── api/                    ← Backend communication
│   └── client.ts          ← READ THIS FIRST
│
├── stores/                 ← Application state
│   └── schemaStore.ts     ← READ THIS SECOND
│
├── pages/                  ← Main routes/screens
│   ├── SchemaBuilder.tsx  ← The main editor
│   └── ProjectsListPage.tsx
│
├── components/
│   ├── schema/            ← Schema builder components
│   │   ├── nodes/        ← React Flow nodes
│   │   └── editors/      ← Edit modals
│   ├── config/           ← Configuration forms
│   └── ui/               ← Reusable components
│
├── lib/
│   ├── utils/            ← Helper functions
│   └── serializers/      ← Data transformation
│
└── types/                 ← TypeScript definitions
    └── fastapiSpec.ts    ← Central type definitions
```

---

## ✏️ Make Your First Change (5 minutes)

Let's add a welcome message to the homepage!

### Step 1: Find the File
```bash
# Open src/pages/HomePage.tsx
```

### Step 2: Edit the Component
Look for the main heading and add your message:

```typescript
// Around line 10-15
<h1 className="text-4xl font-bold">
  Welcome to AppGen!
  {/* Add this: */}
  <span className="text-blue-500"> - Let's build something!</span>
</h1>
```

### Step 3: See It Live
Save the file → Vite auto-reloads → See your change instantly!

### Step 4: Understand What Happened
1. You edited a React component
2. Vite detected the change
3. Hot Module Replacement (HMR) updated the page
4. No full reload needed!

---

## 🔍 Understanding a Full Feature Flow

Let's trace what happens when a user **adds a model**:

### 1. User Clicks "Add Model" Button
**File:** `src/components/schema/SchemaToolbar.tsx`
```typescript
<button onClick={() => {
  const id = schemaStore.addModel({
    name: "NewModel",
    columns: []
  });
}}>
  Add Model
</button>
```

### 2. Store Updates
**File:** `src/stores/schemaStore.ts`
```typescript
addModel: (model) => {
  const id = nanoid();  // Generate unique ID
  set((state) => ({
    models: [...state.models, { ...model, id }]
  }));
  return id;
}
```

### 3. localStorage Updates
Zustand's persist middleware automatically saves to localStorage.

### 4. Components Re-render
Any component using `useSchemaStore(state => state.models)` re-renders.

### 5. React Flow Updates
**File:** `src/pages/SchemaBuilder.tsx`
```typescript
const nodes = useMemo(() => {
  return modelsToNodes(models);  // Converts models to React Flow nodes
}, [models]);
```

### 6. New Node Appears
React Flow renders the new node on the canvas!

**Key Insight:** One user action → Cascade of updates → UI stays in sync.

---

## 🎓 Learning Paths

### Path 1: I Want to Add a Feature
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. Read [schemaStore.ts docs](./src/stores/schemaStore.ts.md) - Understand state
3. Look at existing components for patterns
4. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for code snippets

### Path 2: I Need to Fix a Bug
1. Reproduce the bug
2. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#debugging-tips) for debugging tips
3. Use browser DevTools + React DevTools
4. Check relevant store state in localStorage

### Path 3: I Want to Understand Everything
1. Read [README.md](./README.md) - Master index (3-4 hours)
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive (45 min)
3. Read file-by-file docs for areas you work on
4. Experiment with the code!

---

## 🛠️ Essential Tools

### Browser DevTools
```
F12 → Open DevTools
Console → Run commands, check errors
Network → See API calls
Application → View localStorage
```

### React DevTools
```
Install: https://react.dev/learn/react-developer-tools
View component tree, props, state
Profile performance
```

### VS Code Extensions (Recommended)
- **ESLint** - Linting
- **Prettier** - Formatting
- **TypeScript Vue Plugin (Volar)** - Better TS support
- **Tailwind CSS IntelliSense** - CSS autocomplete

---

## 🚨 Common Pitfalls

### 1. Forgetting @ Path Alias
```typescript
// ❌ Don't do this
import { useAuth } from '../../../hooks/useAuth';

// ✅ Do this
import { useAuth } from '@/hooks/useAuth';
```

### 2. Modifying State Directly
```typescript
// ❌ Don't do this
const models = useSchemaStore.getState().models;
models.push(newModel);  // Mutation! React won't detect change

// ✅ Do this
const addModel = useSchemaStore(state => state.addModel);
addModel(newModel);  // Immutable update
```

### 3. Over-Subscribing to Stores
```typescript
// ❌ Bad: Re-renders on ANY state change
const store = useSchemaStore();

// ✅ Good: Only re-renders when models change
const models = useSchemaStore(state => state.models);
```

### 4. Forgetting to Memoize Expensive Calculations
```typescript
// ❌ Recalculates on every render
const nodes = modelsToNodes(models);

// ✅ Only recalculates when models change
const nodes = useMemo(() => modelsToNodes(models), [models]);
```

---

## 📝 Next Steps

### Immediate (Today)
1. ✅ Read this guide
2. Run the app locally
3. Make a small change (add a console.log)
4. Browse the file structure

### Short Term (This Week)
1. Read [README.md](./README.md) - Get full overview
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand design
3. Pick a feature to add (start small!)
4. Ask questions when stuck

### Long Term (This Month)
1. Read all critical file docs
2. Understand React Flow deeply
3. Master Zustand patterns
4. Contribute meaningfully

---

## 💡 Tips for Success

### 1. Use the Documentation
Don't guess - we've documented everything! Use Ctrl+F to search.

### 2. Console.log is Your Friend
```typescript
const models = useSchemaStore(state => state.models);
console.log('Current models:', models);
```

### 3. Check localStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem('schema-storage'))
```

### 4. Read Error Messages
TypeScript errors are helpful! They tell you exactly what's wrong.

### 5. Experiment Fearlessly
You can't break anything permanently. Git has your back!

---

## 🤝 Getting Help

### Documentation
- [README.md](./README.md) - Master index
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Code snippets

### Code
- Read existing components for patterns
- Use TypeScript autocomplete (Ctrl+Space)
- Check tests for examples

### External Resources
- [React Docs](https://react.dev/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [React Flow Docs](https://reactflow.dev/)
- [Vite Docs](https://vitejs.dev/)

---

## 🎉 You're Ready!

You now have:
- ✅ A mental model of how AppGen works
- ✅ Knowledge of where to find things
- ✅ A working dev environment
- ✅ Confidence to make changes

**Next:** Open [README.md](./README.md) and dive deeper into specific areas!

---

**Happy Coding! 🚀**
