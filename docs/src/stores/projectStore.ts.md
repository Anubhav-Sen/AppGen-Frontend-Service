# projectStore.ts

**Location:** `/src/stores/projectStore.ts`
**Type:** Zustand Store

## Purpose

Manages the current project context and workflow state. This store is **NOT persisted** - it only exists during the current session.

## State Interface

```typescript
interface ProjectStore {
    currentProject: SchemaProject | null;
    isEditMode: boolean;
    workflowStep: "config" | "schema" | "complete";

    setCurrentProject: (project: SchemaProject | null) => void;
    setEditMode: (isEdit: boolean) => void;
    setWorkflowStep: (step: "config" | "schema" | "complete") => void;
    startNewProject: () => void;
    loadProject: (project: SchemaProject) => void;
    clearProject: () => void;
}
```

## State Properties

### `currentProject`
```typescript
currentProject: SchemaProject | null
```

The currently open project from the backend (if any).

**Null when:**
- No project loaded
- Creating a new project
- After clearProject()

### `isEditMode`
```typescript
isEditMode: boolean
```

Whether editing an existing project or creating new one.

- `true` - Editing existing project
- `false` - Creating new project

### `workflowStep`
```typescript
workflowStep: "config" | "schema" | "complete"
```

Current step in the project creation/edit workflow:

- `"config"` - Configuring project settings
- `"schema"` - Designing schema
- `"complete"` - Project saved

## Actions

### `setCurrentProject(project)`
```typescript
setCurrentProject: (project: SchemaProject | null) => void
```

Set the current project.

**Example:**
```typescript
const project = await schemas.getById(42);
setCurrentProject(project);
```

### `setEditMode(isEdit)`
```typescript
setEditMode: (isEdit: boolean) => void
```

Set whether in edit mode.

### `setWorkflowStep(step)`
```typescript
setWorkflowStep: (step: "config" | "schema" | "complete") => void
```

Set current workflow step.

### `startNewProject()`
```typescript
startNewProject: () => void
```

Reset to new project state.

**Sets:**
```typescript
{
    currentProject: null,
    isEditMode: false,
    workflowStep: "config"
}
```

**Usage:**
```typescript
// User clicks "Create New Project"
startNewProject();
navigate('/config');
```

### `loadProject(project)`
```typescript
loadProject: (project: SchemaProject) => void
```

Load an existing project for editing.

**Sets:**
```typescript
{
    currentProject: project,
    isEditMode: true,
    workflowStep: "schema"
}
```

**Usage:**
```typescript
// User clicks on a project
const project = await schemas.getById(42);
loadProject(project);
navigate(`/builder?projectId=${project.id}`);
```

### `clearProject()`
```typescript
clearProject: () => void
```

Clear all project state (same as startNewProject).

## How It Fits Into The Application

### New Project Workflow
```
ProjectsListPage
  ↓
User clicks "Create New"
  ↓
projectStore.startNewProject()
  { currentProject: null, isEditMode: false, workflowStep: "config" }
  ↓
Navigate to /config
  ↓
User configures project (configStore updated)
  ↓
projectStore.setWorkflowStep("schema")
  ↓
Navigate to /builder
  ↓
User designs schema (schemaStore updated)
  ↓
User clicks "Save"
  ↓
schemas.create()
  ↓
projectStore.setWorkflowStep("complete")
```

### Edit Existing Project
```
ProjectsListPage
  ↓
User clicks on project card
  ↓
const project = await schemas.getById(id)
projectStore.loadProject(project)
  { currentProject: project, isEditMode: true, workflowStep: "schema" }
  ↓
Parse project.schema_data into stores
  ↓
Navigate to /builder?projectId=42
  ↓
SchemaBuilder loads with existing data
```

### Usage in Components

#### SchemaBuilder
```typescript
import { useProjectStore } from '@/stores/projectStore';

function SchemaBuilder() {
  const currentProject = useProjectStore(state => state.currentProject);
  const isEditMode = useProjectStore(state => state.isEditMode);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      // Load project
      schemas.getById(Number(projectId)).then(loadProject);
    }
  }, []);

  const handleSave = async () => {
    const spec = buildFastAPIProjectSpec();

    if (isEditMode && currentProject) {
      await schemas.update(currentProject.id, { schema_data: spec });
    } else {
      await schemas.create({ name: "New Project", schema_data: spec });
    }
  };
}
```

#### ProjectsListPage
```typescript
import { useProjectStore } from '@/stores/projectStore';

function ProjectsListPage() {
  const { startNewProject, clearProject } = useProjectStore();

  const handleCreateNew = () => {
    startNewProject();
    // Also clear other stores
    configStore.resetToDefaults();
    schemaStore.clearAll();
    navigate('/config');
  };

  const handleProjectClick = (project) => {
    loadProject(project);
    navigate(`/builder?projectId=${project.id}`);
  };
}
```

#### ConfigPage
```typescript
import { useProjectStore } from '@/stores/projectStore';

function ConfigPage() {
  const setWorkflowStep = useProjectStore(state => state.setWorkflowStep);

  const handleNext = () => {
    setWorkflowStep("schema");
    navigate('/builder');
  };
}
```

## Why Not Persisted?

This store is **intentionally not persisted** because:

1. **Session Context** - Project context is per-session
2. **Avoid Stale Data** - Don't want old currentProject after page refresh
3. **Clean Start** - Each session starts fresh
4. **Explicit Loading** - Projects loaded via URL params or user action

## State Flow Diagram

```
┌─────────────────┐
│  startNewProject │
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│ currentProject: null│
│ isEditMode: false  │
│ workflowStep:config│
└────────┬───────────┘
         │
         ▼
    /config page
         │
         ▼
┌────────────────────┐
│ workflowStep:schema│
└────────┬───────────┘
         │
         ▼
    /builder page
         │
         ▼
    Design schema
         │
         ▼
    Save project
         │
         ▼
┌────────────────────────┐
│ workflowStep: complete │
└────────────────────────┘
```

## Related Files
- [schema.ts (types)](../types/schema.ts.md): SchemaProject type
- [SchemaBuilder.tsx](../pages/SchemaBuilder.tsx.md): Uses currentProject, isEditMode
- [ProjectsListPage.tsx](../pages/ProjectsListPage.tsx.md): Uses startNewProject, loadProject
- [ConfigPage.tsx](../pages/ConfigPage.tsx.md): Uses workflowStep

## Common Operations

```typescript
// Check if editing
const isEditMode = useProjectStore(state => state.isEditMode);
if (isEditMode) {
  console.log("Editing existing project");
} else {
  console.log("Creating new project");
}

// Get current project ID
const projectId = useProjectStore(state => state.currentProject?.id);

// Check workflow step
const step = useProjectStore(state => state.workflowStep);
if (step === "config") {
  // Show config form
} else if (step === "schema") {
  // Show schema builder
}

// Reset everything
useProjectStore.getState().clearProject();
```

## Debugging

```typescript
// Check current state
const state = useProjectStore.getState();
console.log("Current project:", state.currentProject?.name);
console.log("Edit mode:", state.isEditMode);
console.log("Workflow step:", state.workflowStep);
```
