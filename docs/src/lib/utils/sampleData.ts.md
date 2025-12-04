# sampleData.ts

**Location:** `/src/lib/utils/sampleData.ts`
**Type:** Utility Function

## Purpose

Provides sample data (User and Post models with relationship) to quickly populate the schema builder for testing, demos, or learning purposes.

## Function

```typescript
export function loadSampleData(): { userId: string; postId: string }
```

## Returns

Object with generated IDs:
- `userId` - ID of created User model
- `postId` - ID of created Post model

## Sample Data Structure

### User Model
```typescript
{
  name: "User",
  tablename: "users",
  columns: [
    {
      name: "id",
      type: { name: ColumnTypeName.INTEGER },
      primary_key: true,
      autoincrement: true
    },
    {
      name: "username",
      type: { name: ColumnTypeName.STRING, length: 50 },
      unique: true,
      nullable: false
    },
    {
      name: "email",
      type: { name: ColumnTypeName.STRING, length: 255 },
      unique: true,
      nullable: false
    },
    {
      name: "password_hash",
      type: { name: ColumnTypeName.STRING, length: 255 },
      nullable: false
    }
  ],
  position: { x: 100, y: 100 }
}
```

### Post Model
```typescript
{
  name: "Post",
  tablename: "posts",
  columns: [
    {
      name: "id",
      type: { name: ColumnTypeName.INTEGER },
      primary_key: true,
      autoincrement: true
    },
    {
      name: "title",
      type: { name: ColumnTypeName.STRING, length: 200 },
      nullable: false
    },
    {
      name: "content",
      type: { name: ColumnTypeName.TEXT }
    },
    {
      name: "author_id",
      type: { name: ColumnTypeName.INTEGER },
      foreign_key: "User.id",
      nullable: false
    },
    {
      name: "created_at",
      type: { name: ColumnTypeName.DATE_TIME },
      nullable: false
    }
  ],
  relationships: [
    {
      name: "author",
      target: "User",
      back_populates: "posts"
    }
  ],
  position: { x: 400, y: 100 }
}
```

### StatusType Enum
```typescript
{
  name: "StatusType",
  values: ["active", "inactive", "pending"],
  position: { x: 250, y: 400 }
}
```

## Usage

### Load Sample Data on Button Click
```typescript
import { loadSampleData } from '@/lib/utils/sampleData';

function SchemaBuilder() {
  const handleLoadSample = () => {
    loadSampleData();
    toast.success('Sample data loaded!');
  };

  return (
    <button onClick={handleLoadSample}>
      Load Sample Data
    </button>
  );
}
```

### Development/Testing
```typescript
// Load sample data for development
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const schemaStore = useSchemaStore.getState();
    if (schemaStore.models.length === 0) {
      loadSampleData();
    }
  }
}, []);
```

### Demo Mode
```typescript
function DemoButton() {
  const navigate = useNavigate();

  const handleDemo = () => {
    // Clear existing data
    useSchemaStore.getState().clearAll();

    // Load sample data
    loadSampleData();

    // Navigate to builder
    navigate('/builder');
  };

  return <button onClick={handleDemo}>Try Demo</button>;
}
```

## What Gets Created

After calling `loadSampleData()`, the schema store contains:

1. **User Model** (at position x:100, y:100)
   - Primary key: id
   - Unique fields: username, email
   - 4 columns total

2. **Post Model** (at position x:400, y:100)
   - Primary key: id
   - Foreign key: author_id → User.id
   - Relationship to User
   - 5 columns total

3. **StatusType Enum** (at position x:250, y:400)
   - 3 values: active, inactive, pending

4. **Visual Edge** (automatically created by flowConverter)
   - Connects Post → User via author relationship

## React Flow Visualization

When rendered in SchemaBuilder:

```
┌─────────────┐                    ┌─────────────┐
│   User      │                    │    Post     │
├─────────────┤                    ├─────────────┤
│ id (PK)     │◄───────────────────│ id (PK)     │
│ username    │      author        │ title       │
│ email       │                    │ content     │
│ password    │                    │ author_id   │
└─────────────┘                    │ created_at  │
                                   └─────────────┘

              ┌──────────────┐
              │ StatusType   │
              │ (Enum)       │
              ├──────────────┤
              │ • active     │
              │ • inactive   │
              │ • pending    │
              └──────────────┘
```

## Use Cases

### 1. Testing Schema Builder
Quickly verify all features work:
- Model rendering
- Relationship edges
- Column types
- Enum nodes

### 2. Demos & Screenshots
Show potential users a working example immediately.

### 3. Learning
New users can explore a pre-built schema before creating their own.

### 4. Development
Developers can test features without manually creating models.

## Relationship Details

The relationship between User and Post:

**Post.author → User:**
```typescript
{
  name: "author",        // Relationship name on Post
  target: "User",        // Target model
  back_populates: "posts" // Inverse relationship name on User
}
```

**Generates bidirectional relationship:**
- Post has `.author` (OneToMany User)
- User has `.posts` (ManyToOne Post collection)

## Clearing Sample Data

```typescript
// Clear all models, enums, and relationships
useSchemaStore.getState().clearAll();
```

## Customizing Sample Data

To create your own sample data loader:

```typescript
export function loadEcommerceSample() {
  const store = useSchemaStore.getState();

  const productId = store.addModel({
    name: "Product",
    tablename: "products",
    columns: [
      { name: "id", type: { name: "integer" }, primary_key: true },
      { name: "name", type: { name: "string", length: 100 } },
      { name: "price", type: { name: "numeric", precision: 10, scale: 2 } }
    ],
    position: { x: 100, y: 100 }
  });

  const orderId = store.addModel({
    name: "Order",
    tablename: "orders",
    columns: [
      { name: "id", type: { name: "integer" }, primary_key: true },
      { name: "product_id", type: { name: "integer" }, foreign_key: "Product.id" }
    ],
    position: { x: 400, y: 100 }
  });

  return { productId, orderId };
}
```

## Related Files

- [schemaStore.ts](../../stores/schemaStore.ts.md): Store methods used (addModel, addEnum)
- [fastapiSpec.ts](../../types/fastapiSpec.ts.md): Column types and interfaces
- [flowConverter.ts](./flowConverter.ts.md): Converts models to React Flow nodes
- [SchemaBuilder.tsx](../../pages/SchemaBuilder.tsx.md): Where sample data appears

## Testing

```typescript
import { loadSampleData } from './sampleData';
import { useSchemaStore } from '@/stores/schemaStore';

describe('loadSampleData', () => {
  beforeEach(() => {
    useSchemaStore.getState().clearAll();
  });

  test('creates User and Post models', () => {
    const { userId, postId } = loadSampleData();

    const state = useSchemaStore.getState();

    expect(state.models).toHaveLength(2);
    expect(state.models.find(m => m.id === userId)?.name).toBe('User');
    expect(state.models.find(m => m.id === postId)?.name).toBe('Post');
  });

  test('creates StatusType enum', () => {
    loadSampleData();

    const state = useSchemaStore.getState();

    expect(state.enums).toHaveLength(1);
    expect(state.enums[0].name).toBe('StatusType');
    expect(state.enums[0].values).toEqual(['active', 'inactive', 'pending']);
  });

  test('creates relationship between Post and User', () => {
    loadSampleData();

    const post = useSchemaStore.getState().models.find(m => m.name === 'Post');

    expect(post?.relationships).toHaveLength(1);
    expect(post?.relationships[0]).toMatchObject({
      name: 'author',
      target: 'User',
      back_populates: 'posts'
    });
  });
});
```

## Best Practices

### Don't Overwrite Existing Data
```typescript
const handleLoadSample = () => {
  const hasData = useSchemaStore.getState().models.length > 0;

  if (hasData) {
    if (confirm('This will replace existing data. Continue?')) {
      useSchemaStore.getState().clearAll();
      loadSampleData();
    }
  } else {
    loadSampleData();
  }
};
```

### Provide UI Feedback
```typescript
const handleLoadSample = () => {
  loadSampleData();
  toast.success('Sample schema loaded: User, Post, StatusType');
};
```
