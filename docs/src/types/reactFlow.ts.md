# reactFlow.ts

**Location:** `/src/types/reactFlow.ts`
**Type:** TypeScript Type Definitions

## Purpose

Defines TypeScript types for React Flow nodes and edges specific to the schema builder. These types bridge React Flow's generic types with our domain-specific model and enum data.

## Type Definitions

### `SchemaNodeType`
```typescript
type SchemaNodeType = "model" | "enum";
```

Two types of nodes in our schema builder:
- `"model"` - Database model/table
- `"enum"` - Enum definition

### `ModelNodeData`
```typescript
interface ModelNodeData extends Record<string, unknown> {
  modelId: string;       // UI-specific ID (from ModelWithUI.id)
  model: ModelWithUI;    // Complete model data
}
```

Data passed to ModelNode component.

**Example:**
```typescript
{
  modelId: "V1StGXR8_Z5jdHi",
  model: {
    id: "V1StGXR8_Z5jdHi",
    name: "User",
    tablename: "users",
    columns: [...],
    position: { x: 100, y: 100 }
  }
}
```

### `EnumNodeData`
```typescript
interface EnumNodeData extends Record<string, unknown> {
  enumId: string;        // UI-specific ID (from EnumWithUI.id)
  enum: EnumWithUI;      // Complete enum data
}
```

Data passed to EnumNode component.

**Example:**
```typescript
{
  enumId: "X2AtBbR9_K3mwCv",
  enum: {
    id: "X2AtBbR9_K3mwCv",
    name: "UserRole",
    values: ["ADMIN", "USER"],
    position: { x: 400, y: 100 }
  }
}
```

### `SchemaNodeData`
```typescript
type SchemaNodeData = ModelNodeData | EnumNodeData;
```

Union type for all node data types.

### `SchemaNode`
```typescript
type SchemaNode = Node<SchemaNodeData, SchemaNodeType>;
```

Complete React Flow node type for schema builder.

**Expanded:**
```typescript
{
  id: string;                    // Node ID (matches modelId or enumId)
  type: "model" | "enum";        // Node type
  position: { x: number; y: number };
  data: ModelNodeData | EnumNodeData;
  // ... other React Flow node properties
}
```

### `RelationshipEdgeData`
```typescript
interface RelationshipEdgeData extends Record<string, unknown> {
  relationshipName: string;      // e.g., "posts"
  sourceModel: string;           // e.g., "User"
  targetModel: string;           // e.g., "Post"
}
```

Data attached to edges representing relationships.

**Example:**
```typescript
{
  relationshipName: "posts",
  sourceModel: "User",
  targetModel: "Post"
}
```

### `SchemaEdge`
```typescript
type SchemaEdge = Edge<RelationshipEdgeData>;
```

Complete React Flow edge type for schema relationships.

**Expanded:**
```typescript
{
  id: string;                    // e.g., "user-123-posts-post-456"
  source: string;                // Source node ID
  target: string;                // Target node ID
  sourceHandle?: string;         // e.g., "right"
  targetHandle?: string;         // e.g., "left"
  type?: string;                 // e.g., "smoothstep"
  style?: object;                // CSS styles
  data: RelationshipEdgeData;
}
```

## How It Fits Into The Application

### Data Flow

```
schemaStore
  ↓
flowConverter.ts
  ↓
SchemaNode[] + SchemaEdge[]
  ↓
<ReactFlow nodes={nodes} edges={edges} />
  ↓
Custom node components receive typed data
```

### Usage in flowConverter.ts

```typescript
import type { SchemaNode, SchemaEdge } from '@/types/reactFlow';

export function modelsToNodes(models: ModelWithUI[]): SchemaNode[] {
  return models.map((model) => ({
    id: model.id,
    type: "model" as const,
    position: model.position || { x: 100, y: 100 },
    data: {
      modelId: model.id,
      model,
    },
  }));
}

export function relationshipsToEdges(models: ModelWithUI[]): SchemaEdge[] {
  const edges: SchemaEdge[] = [];
  // ... build edges
  return edges;
}
```

### Usage in Components

```typescript
import type { Node } from '@xyflow/react';
import type { ModelNodeData } from '@/types/reactFlow';

function ModelNode({ data }: { data: ModelNodeData }) {
  const { model } = data;  // TypeScript knows this is ModelWithUI

  return (
    <div>
      <h3>{model.name}</h3>
      {model.columns.map(col => (
        <div key={col.name}>{col.name}</div>
      ))}
    </div>
  );
}
```

### Usage in SchemaBuilder.tsx

```typescript
import type { SchemaNode, SchemaEdge } from '@/types/reactFlow';

const [nodes, setNodes] = useNodesState<SchemaNode>([]);
const [edges, setEdges] = useEdgesState<SchemaEdge>([]);

// TypeScript ensures correct types
const initialNodes: SchemaNode[] = [
  ...modelsToNodes(models),
  ...enumsToNodes(enums)
];
```

## Type Safety Benefits

### 1. Node Data Type Safety
```typescript
// In ModelNode component
function ModelNode({ data }: { data: ModelNodeData }) {
  // TypeScript knows data.model exists and is ModelWithUI
  console.log(data.model.name);  // ✓
  console.log(data.model.invalid);  // ✗ Error
}
```

### 2. Edge Data Type Safety
```typescript
// Edge label component
function EdgeLabel({ data }: { data: RelationshipEdgeData }) {
  return <div>{data.relationshipName}</div>;  // ✓
}
```

### 3. Node Type Discrimination
```typescript
function handleNodeClick(node: SchemaNode) {
  if (node.type === "model") {
    // TypeScript narrows to ModelNodeData
    const model = node.data.model;
  } else if (node.type === "enum") {
    // TypeScript narrows to EnumNodeData
    const enumDef = node.data.enum;
  }
}
```

## React Flow Generic Types

### Base Types
React Flow provides generic base types:
```typescript
type Node<Data = any, Type = string> = {
  id: string;
  type?: Type;
  position: { x: number; y: number };
  data: Data;
  // ... other properties
};

type Edge<Data = any> = {
  id: string;
  source: string;
  target: string;
  data?: Data;
  // ... other properties
};
```

### Our Specialization
We specialize these generics:
```typescript
// Node<SchemaNodeData, SchemaNodeType>
type SchemaNode = Node<
  ModelNodeData | EnumNodeData,  // Data
  "model" | "enum"                // Type
>;

// Edge<RelationshipEdgeData>
type SchemaEdge = Edge<{
  relationshipName: string;
  sourceModel: string;
  targetModel: string;
}>;
```

## Complete Example

### Creating Nodes
```typescript
const models: ModelWithUI[] = [
  {
    id: "user-123",
    name: "User",
    tablename: "users",
    columns: [
      { name: "id", type: { name: "integer" }, primary_key: true }
    ],
    position: { x: 100, y: 100 }
  }
];

const nodes: SchemaNode[] = models.map((model) => ({
  id: model.id,
  type: "model",
  position: model.position,
  data: {
    modelId: model.id,
    model
  }
}));
```

### Creating Edges
```typescript
const edges: SchemaEdge[] = [{
  id: "user-123-posts-post-456",
  source: "user-123",
  target: "post-456",
  sourceHandle: "right",
  targetHandle: "left",
  type: "smoothstep",
  data: {
    relationshipName: "posts",
    sourceModel: "User",
    targetModel: "Post"
  }
}];
```

### React Flow Rendering
```typescript
<ReactFlow<SchemaNode, SchemaEdge>
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
/>
```

## Related Files
- [fastapiSpec.ts](./fastapiSpec.ts.md): Base types (ModelWithUI, EnumWithUI)
- [flowConverter.ts](../lib/utils/flowConverter.ts.md): Creates SchemaNode and SchemaEdge
- [ModelNode.tsx](../components/schema/nodes/ModelNode.tsx.md): Renders ModelNodeData
- [EnumNode.tsx](../components/schema/nodes/EnumNode.tsx.md): Renders EnumNodeData
- [SchemaBuilder.tsx](../pages/SchemaBuilder.tsx.md): Uses all these types

## Why Separate Types?

**Could we use ModelWithUI directly in React Flow?**
No, because:
1. React Flow expects specific structure (`data` field)
2. We need to distinguish between model and enum nodes
3. Edges need relationship metadata
4. Separation of concerns (domain types vs UI types)

**Benefits:**
- Type safety at boundaries
- Clear transformation points
- Easier to change React Flow version
- Domain types remain clean
