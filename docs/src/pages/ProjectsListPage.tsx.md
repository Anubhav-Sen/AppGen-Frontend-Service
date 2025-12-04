# ProjectsListPage.tsx

**Location:** `/src/pages/ProjectsListPage.tsx`
**Type:** Project Management Page Component

## Purpose

Displays all user projects in a card grid with CRUD operations. Uses React Query for data fetching with automatic caching and optimistic updates.

## Features

### 1. Project List with React Query
```typescript
const { data: projects, isLoading, error } = useQuery({
    queryKey: ["schemas"],
    queryFn: schemas.getAll,
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Loading/error states
- Cache invalidation on mutations

### 2. Create New Project
```typescript
const handleCreateNew = () => {
    // Reset all stores when creating a new project
    resetConfig();
    clearSchema();
    clearProject();
    navigate("/config");
};
```

**Workflow:**
1. Clear all persisted state (config, schema, project)
2. Navigate to configuration wizard
3. User goes through: Config → Schema Builder → Save

### 3. Open Existing Project
```typescript
const handleProjectClick = (project: SchemaProject) => {
    navigate(`/builder?projectId=${project.id}`);
};
```

**Workflow:**
1. Navigate to schema builder with project ID
2. SchemaBuilder loads project data
3. Populates stores from project.schema_data

### 4. Delete Project with Mutation
```typescript
const deleteMutation = useMutation({
    mutationFn: (id: number) => schemas.delete(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schemas"] });
        setDeleteSuccess("Project deleted successfully");
        setTimeout(() => setDeleteSuccess(null), 3000);
    },
    onError: (error) => {
        setDeleteError(getErrorMessage(error, "Failed to delete project"));
    },
});

const handleDeleteProject = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();  // Prevent opening project
    if (window.confirm("Are you sure you want to delete this project?")) {
        deleteMutation.mutate(projectId);
    }
};
```

**Features:**
- Optimistic UI updates via cache invalidation
- Confirmation dialog before delete
- Success/error feedback
- Auto-dismiss success message after 3s

## Component Structure

```typescript
const ProjectsListPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const resetConfig = useConfigStore((state) => state.resetToDefaults);
    const clearSchema = useSchemaStore((state) => state.clearAll);
    const { clearProject } = useProjectStore();
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["schemas"],
        queryFn: schemas.getAll,
    });

    const deleteMutation = useMutation({ /* ... */ });

    return (
        <div className="h-full bg-secondary-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header with Create button */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1>Your Projects</h1>
                        <p>Create and manage your FastAPI backend projects</p>
                    </div>
                    <button onClick={handleCreateNew}>Create New Project</button>
                </div>

                {/* Error/Success Alerts */}
                {error && <Alert type="error">{getErrorMessage(error, "Failed to load projects")}</Alert>}
                {deleteError && <Alert type="error">{deleteError}</Alert>}
                {deleteSuccess && <Alert type="success">{deleteSuccess}</Alert>}

                {/* Loading State */}
                {isLoading && <div>Loading projects...</div>}

                {/* Empty State */}
                {!isLoading && !error && projects?.length === 0 && (
                    <div className="border-dashed border-2">
                        <h3>No projects yet</h3>
                        <p>Get started by creating your first FastAPI backend project</p>
                        <button onClick={handleCreateNew}>Create Your First Project</button>
                    </div>
                )}

                {/* Project Grid */}
                {!isLoading && !error && projects && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg border">
                                <button onClick={() => handleProjectClick(project)}>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            {/* Database icon */}
                                            <button onClick={(e) => handleDeleteProject(e, project.id)}>
                                                {/* Delete icon */}
                                            </button>
                                        </div>
                                        <h3>{project.name}</h3>
                                        {project.description && <p>{project.description}</p>}
                                        <div className="text-xs text-secondary-500">
                                            <span>Created {formatDate(project.created_at)}</span>
                                            {project.updated_at && <span>Updated {formatDate(project.updated_at)}</span>}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
```

## UI States

### Loading State
```typescript
{isLoading && (
    <div className="flex items-center justify-center py-20">
        <div>Loading projects...</div>
    </div>
)}
```

### Empty State
Encourages user to create first project with prominent CTA button.

### Error State
Shows user-friendly error message extracted from API response.

### Success State (Projects)
Responsive grid:
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

## Project Card

### Card Structure
```typescript
<div className="bg-white rounded-lg border hover:shadow-md hover:border-primary-300">
    <button onClick={() => handleProjectClick(project)}>
        <div className="p-6">
            {/* Icon + Delete Button */}
            <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg">
                    {/* Database icon */}
                </div>
                <button onClick={(e) => handleDeleteProject(e, project.id)}>
                    {/* Trash icon */}
                </button>
            </div>

            {/* Project Name */}
            <h3 className="text-lg font-semibold group-hover:text-primary-600">
                {project.name}
            </h3>

            {/* Description (if exists) */}
            {project.description && (
                <p className="text-sm text-secondary-600 line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Timestamps */}
            <div className="text-xs text-secondary-500 pt-4 border-t">
                <span>Created {formatDate(project.created_at)}</span>
                {project.updated_at && <span>Updated {formatDate(project.updated_at)}</span>}
            </div>
        </div>
    </button>
</div>
```

### Date Formatting
```typescript
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
// Example output: "Jan 15, 2025"
```

### Card Interactions
- **Click Card:** Open project in schema builder
- **Click Delete Icon:** Show confirmation, delete if confirmed
- **Hover Card:** Border color changes, shadow increases

## React Query Integration

### Cache Invalidation
After successful delete, invalidate cache to refetch:
```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["schemas"] });
}
```

### Automatic Refetch
Projects list automatically updates when cache is invalidated.

## Store Reset Pattern

When creating new project, reset ALL stores:
```typescript
resetConfig();      // Clear config (project, db, security, token, git)
clearSchema();      // Clear schema (models, enums, relationships)
clearProject();     // Clear project context
```

**Why?** Ensures clean slate for new project without old data.

## Error Handling

### Load Error
```typescript
{error && (
    <Alert type="error">
        {getErrorMessage(error, "Failed to load projects")}
    </Alert>
)}
```

### Delete Error
```typescript
{deleteError && <Alert type="error">{deleteError}</Alert>}
```

### Success Message
```typescript
{deleteSuccess && <Alert type="success">{deleteSuccess}</Alert>}
```

## Related Files

- [schemas.ts (API)](../api/schemas.ts.md): API functions (getAll, delete)
- [useFetchSchemas.ts](../hooks/useFetchSchemas.ts.md): Alternative React Query hook
- [schema.ts (types)](../types/schema.ts.md): SchemaProject type
- [configStore.ts](../stores/configStore.ts.md): Config reset
- [schemaStore.ts](../stores/schemaStore.ts.md): Schema reset
- [projectStore.ts](../stores/projectStore.ts.md): Project context
- [ConfigPage.tsx](./ConfigPage.tsx.md): Next page for new project
- [SchemaBuilder.tsx](./SchemaBuilder.tsx.md): Opens existing projects
- [Alert.tsx](../components/ui/Alert.tsx.md): Alert component

## Testing Example

```typescript
test('displays projects in grid', async () => {
    const mockProjects = [
        { id: 1, name: 'Project 1', created_at: '2025-01-01' },
        { id: 2, name: 'Project 2', created_at: '2025-01-02' },
    ];

    render(<ProjectsListPage />);

    await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
});

test('deletes project after confirmation', async () => {
    window.confirm = jest.fn(() => true);
    render(<ProjectsListPage />);

    const deleteButton = screen.getAllByTitle('Delete project')[0];
    await userEvent.click(deleteButton);

    await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
    });
});
```

## Accessibility

- Semantic HTML with proper headings
- Alt text for icons (via title attributes)
- Keyboard navigation support
- Focus indicators on interactive elements
- Confirmation dialogs for destructive actions
