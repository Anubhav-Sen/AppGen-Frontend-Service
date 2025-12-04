# SchemaBuilder.tsx

**Location:** `/src/pages/SchemaBuilder.tsx`
**Type:** Main Schema Design Page Component

## Purpose

The visual schema design canvas where users create and manage database models, enums, and relationships using React Flow. Supports loading existing projects and real-time visual editing.

## Key Features

### 1. React Flow Canvas
- Visual node-based editor
- Drag-and-drop positioning
- Automatic edge routing between related models
- Background grid
- Minimap for navigation
- Zoom controls

### 2. Project Loading
```typescript
useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
        schemas.getById(Number(projectId)).then((project) => {
            // Load into projectStore
            loadProject(project);

            // Parse schema_data
            const spec = project.schema_data as FastAPIProjectSpec;

            // Load config
            loadConfig(spec.project, spec.git, spec.database, spec.security, spec.token);

            // Load models/enums with UI positions
            loadSchema(modelsWithUI, enumsWithUI, spec.schema.association_tables);
        });
    }
}, [searchParams]);
```

### 3. Custom Node Types
```typescript
const nodeTypes = {
    model: ModelNode,  // Database models
    enum: EnumNode,    // Enum types
} as NodeTypes;
```

### 4. Node/Edge Conversion
```typescript
const initialNodes = useMemo(() => {
    return [...modelsToNodes(models), ...enumsToNodes(enums)];
}, [models, enums]);

const initialEdges = useMemo(() => {
    return relationshipsToEdges(models);
}, [models]);
```

### 5. Position Updates
```typescript
const onNodeDragStop = useCallback((event: any, node: Node) => {
    if (node.type === 'model') {
        updateModelPosition(node.data.modelId, node.position);
    } else if (node.type === 'enum') {
        updateEnumPosition(node.data.enumId, node.position);
    }
}, [updateModelPosition, updateEnumPosition]);
```

## Component Structure

```typescript
export default function SchemaBuilder() {
    const models = useSchemaStore((state) => state.models);
    const enums = useSchemaStore((state) => state.enums);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    return (
        <div className="h-full w-full">
            <SchemaToolbar />  {/* Add Model, Enum, Export buttons */}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>

            {/* Modals */}
            <ModelEditor />
            <EnumEditor />
        </div>
    );
}
```

## Data Flow

### Loading Existing Project
```
URL: /builder?projectId=42
  ↓
useEffect detects projectId
  ↓
schemas.getById(42)
  ↓
Parse project.schema_data
  ↓
loadConfig() → configStore
loadSchema() → schemaStore
loadProject() → projectStore
  ↓
React Flow renders models/enums as nodes
```

### Creating New Project
```
User creates models/enums via editors
  ↓
Data saved to schemaStore
  ↓
useMemo converts to React Flow nodes/edges
  ↓
Canvas updates automatically
```

### Saving
```
User clicks Save in SchemaToolbar
  ↓
buildFastAPIProjectSpec() from stores
  ↓
schemas.create() or schemas.update()
  ↓
Saved to backend
```

## Related Files

- [SchemaToolbar.tsx](../components/schema/SchemaToolbar.tsx.md): Action buttons
- [ModelNode.tsx](../components/schema/nodes/ModelNode.tsx.md): Model visual
- [EnumNode.tsx](../components/schema/nodes/EnumNode.tsx.md): Enum visual
- [ModelEditor.tsx](../components/schema/editors/ModelEditor.tsx.md): Edit models
- [EnumEditor.tsx](../components/schema/editors/EnumEditor.tsx.md): Edit enums
- [flowConverter.ts](../lib/utils/flowConverter.ts.md): Conversion utilities
- [schemaStore.ts](../stores/schemaStore.ts.md): Schema state
- [projectStore.ts](../stores/projectStore.ts.md): Project context
- [schemas.ts (API)](../api/schemas.ts.md): Load/save functions

## React Flow Features Used

- **Background:** Grid pattern
- **Controls:** Zoom in/out, fit view
- **MiniMap:** Overview of entire canvas
- **Drag & Drop:** Reposition nodes
- **Edges:** Auto-routed connections
- **Node Selection:** Click to select/edit

## Usage

Accessed via protected route:
```typescript
{
  path: "/builder",
  element: (
    <ProtectedRoute>
      <SchemaBuilder />
    </ProtectedRoute>
  )
}
```

With optional projectId query parameter for editing existing projects.
