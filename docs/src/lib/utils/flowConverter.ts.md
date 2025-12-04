# flowConverter.ts

**Location:** `/src/lib/utils/flowConverter.ts`
**Type:** Utility Module

## Purpose

Converts Zustand store data (models, enums, relationships) into React Flow format (nodes and edges). This is the **bridge between application state and visual representation**.

## Exported Functions

### 1. `modelsToNodes(models)`
Converts database models to React Flow nodes.

**Input:**
```typescript
models: ModelWithUI[]  // From schemaStore
```

**Output:**
```typescript
SchemaNode[]  // React Flow nodes
```

**Example:**
```typescript
// Input
[{
  id: "V1StGXR8_Z5jdHi",
  name: "User",
  columns: [...],
  position: { x: 100, y: 100 }
}]

// Output
[{
  id: "V1StGXR8_Z5jdHi",
  type: "model",
  position: { x: 100, y: 100 },
  data: {
    modelId: "V1StGXR8_Z5jdHi",
    model: { /* full model data */ }
  }
}]
```

### 2. `enumsToNodes(enums)`
Converts enum definitions to React Flow nodes.

**Input:**
```typescript
enums: EnumWithUI[]
```

**Output:**
```typescript
SchemaNode[]
```

**Example:**
```typescript
// Input
[{
  id: "X2AtBbR9_K3mwCv",
  name: "UserRole",
  values: ["ADMIN", "USER"],
  position: { x: 400, y: 100 }
}]

// Output
[{
  id: "X2AtBbR9_K3mwCv",
  type: "enum",
  position: { x: 400, y: 100 },
  data: {
    enumId: "X2AtBbR9_K3mwCv",
    enum: { /* full enum data */ }
  }
}]
```

### 3. `relationshipsToEdges(models)`
Converts model relationships to React Flow edges (connections).

**Input:**
```typescript
models: ModelWithUI[]  // Must include relationships array
```

**Output:**
```typescript
SchemaEdge[]  // React Flow edges
```

**Example:**
```typescript
// Input
[
  {
    id: "user-id",
    name: "User",
    position: { x: 100, y: 100 },
    relationships: [{
      name: "posts",
      type: "OneToMany",
      target: "Post"
    }]
  },
  {
    id: "post-id",
    name: "Post",
    position: { x: 400, y: 100 }
  }
]

// Output
[{
  id: "user-id-posts-post-id",
  source: "user-id",
  target: "post-id",
  sourceHandle: "right",    // Smart handle selection
  targetHandle: "left",
  type: "smoothstep",
  style: { stroke: "#6366f1", strokeWidth: 2 },
  data: {
    relationshipName: "posts",
    sourceModel: "User",
    targetModel: "Post"
  }
}]
```

## Key Algorithm: Smart Handle Selection

### `getBestHandles(sourcePos, targetPos)`
Determines optimal connection points based on node positions.

**Logic:**
```typescript
const dx = targetPos.x - sourcePos.x;  // Horizontal distance
const dy = targetPos.y - sourcePos.y;  // Vertical distance

if (Math.abs(dx) > Math.abs(dy)) {
  // Horizontal relationship (side-to-side)
  if (dx > 0) {
    return { sourceHandle: "right", targetHandle: "left" };
  } else {
    return { sourceHandle: "left", targetHandle: "right" };
  }
} else {
  // Vertical relationship (top-to-bottom)
  if (dy > 0) {
    return { sourceHandle: "bottom", targetHandle: "top" };
  } else {
    return { sourceHandle: "top", targetHandle: "bottom" };
  }
}
```

**Visual Examples:**

```
Case 1: Target is to the right (dx > 0, |dx| > |dy|)
┌────────┐                  ┌────────┐
│ User   ├─────────────────>│ Post   │
└────────┘ right      left  └────────┘

Case 2: Target is below (dy > 0, |dy| > |dx|)
┌────────┐
│ User   │
└────┬───┘
     │ bottom
     ▼
     │ top
┌────┴───┐
│ Post   │
└────────┘

Case 3: Target is to the left (dx < 0)
┌────────┐                  ┌────────┐
│ Post   │<─────────────────┤ User   │
└────────┘ left       right └────────┘

Case 4: Target is above (dy < 0)
┌────────┐
│ Post   │
└────┬───┘
     ▲ top
     │
     │ bottom
┌────┴───┐
│ User   │
└────────┘
```

**Why This Matters:**
- Clean, non-overlapping edges
- Intuitive visual layout
- Better readability for complex schemas

## How It Fits Into The Application

### React Flow Canvas Rendering
```
SchemaBuilder.tsx loads
  ↓
useEffect runs
  ↓
const models = useSchemaStore(state => state.models);
const enums = useSchemaStore(state => state.enums);
  ↓
const modelNodes = modelsToNodes(models);
const enumNodes = enumsToNodes(enums);
const edges = relationshipsToEdges(models);
  ↓
const nodes = [...modelNodes, ...enumNodes];
  ↓
<ReactFlow nodes={nodes} edges={edges} />
  ↓
Visual canvas renders
```

### User Interaction Flow
```
User drags "User" node from (100, 100) to (300, 200)
  ↓
React Flow onNodesChange event
  ↓
schemaStore.updateModelPosition("user-id", { x: 300, y: 200 })
  ↓
Store updates trigger re-render
  ↓
flowConverter runs again
  ↓
relationshipsToEdges() recalculates handle positions
  ↓
Edges smoothly adjust to new positions
```

## Edge Styling

All edges use consistent styling:
```typescript
{
  type: "smoothstep",              // Curved path with right angles
  style: {
    stroke: "#6366f1",             // Indigo color
    strokeWidth: 2                  // 2px width
  }
}
```

**Edge Types Available:**
- `"default"`: Straight line
- `"straight"`: Straight line (alias)
- `"smoothstep"`: Curved with right angles ✓ (used)
- `"step"`: Right angles, no curves
- `"simplebezier"`: Bezier curve

## Complete Data Flow Example

**Store State:**
```typescript
{
  models: [
    {
      id: "user-123",
      name: "User",
      position: { x: 100, y: 100 },
      columns: [
        { name: "id", type: "Integer", primary_key: true }
      ],
      relationships: [
        {
          name: "posts",
          type: "OneToMany",
          target: "Post"
        }
      ]
    },
    {
      id: "post-456",
      name: "Post",
      position: { x: 400, y: 100 }
    }
  ],
  enums: [
    {
      id: "role-789",
      name: "UserRole",
      values: ["ADMIN", "USER"],
      position: { x: 250, y: 300 }
    }
  ]
}
```

**After Conversion:**
```typescript
{
  nodes: [
    // Model nodes
    {
      id: "user-123",
      type: "model",
      position: { x: 100, y: 100 },
      data: { modelId: "user-123", model: {...} }
    },
    {
      id: "post-456",
      type: "model",
      position: { x: 400, y: 100 },
      data: { modelId: "post-456", model: {...} }
    },
    // Enum nodes
    {
      id: "role-789",
      type: "enum",
      position: { x: 250, y: 300 },
      data: { enumId: "role-789", enum: {...} }
    }
  ],
  edges: [
    // User → Post relationship
    {
      id: "user-123-posts-post-456",
      source: "user-123",
      target: "post-456",
      sourceHandle: "right",    // Calculated: dx=300, dy=0, horizontal
      targetHandle: "left",
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
      data: {
        relationshipName: "posts",
        sourceModel: "User",
        targetModel: "Post"
      }
    }
  ]
}
```

## Performance Considerations

### Memoization Opportunity
In SchemaBuilder.tsx, wrap conversions in `useMemo`:
```typescript
const nodes = useMemo(() => {
  return [
    ...modelsToNodes(models),
    ...enumsToNodes(enums)
  ];
}, [models, enums]);

const edges = useMemo(() => {
  return relationshipsToEdges(models);
}, [models]);
```

Prevents unnecessary recalculations on unrelated state changes.

### Handle Calculation Complexity
- **Time Complexity**: O(R) where R = total relationships across all models
- **Space Complexity**: O(R) for edges array
- Fast even for large schemas (100+ models)

## Related Files
- [schemaStore.ts](../../stores/schemaStore.ts.md): Source of models/enums data
- [SchemaBuilder.tsx](../../pages/SchemaBuilder.tsx.md): Uses these functions
- [ModelNode.tsx](../../components/schema/nodes/ModelNode.tsx.md): Custom node component
- [EnumNode.tsx](../../components/schema/nodes/EnumNode.tsx.md): Enum node component
- [reactFlow.ts](../../types/reactFlow.ts.md): Type definitions

## Testing

```typescript
import { modelsToNodes, relationshipsToEdges } from './flowConverter';

// Test model conversion
const models = [{
  id: "1",
  name: "User",
  columns: [],
  position: { x: 0, y: 0 }
}];

const nodes = modelsToNodes(models);
expect(nodes[0].type).toBe("model");
expect(nodes[0].data.model.name).toBe("User");

// Test handle selection
const models2 = [
  { id: "1", name: "A", position: { x: 0, y: 0 }, relationships: [
    { name: "rel", target: "B" }
  ]},
  { id: "2", name: "B", position: { x: 300, y: 0 } }
];

const edges = relationshipsToEdges(models2);
expect(edges[0].sourceHandle).toBe("right");
expect(edges[0].targetHandle).toBe("left");
```

## Debugging Tips

### Visualize handle selection
```typescript
const sourcePos = { x: 100, y: 100 };
const targetPos = { x: 400, y: 250 };

const dx = targetPos.x - sourcePos.x;  // 300
const dy = targetPos.y - sourcePos.y;  // 150

console.log({ dx, dy });
// |dx| = 300 > |dy| = 150 → Horizontal
// dx > 0 → Right direction
// Result: { sourceHandle: "right", targetHandle: "left" }
```

### Check edge count
```typescript
const edges = relationshipsToEdges(models);
console.log(`Generated ${edges.length} edges`);

// Should match total relationships across all models
const expectedCount = models.reduce(
  (sum, m) => sum + (m.relationships?.length || 0),
  0
);
console.log(`Expected ${expectedCount} edges`);
```
