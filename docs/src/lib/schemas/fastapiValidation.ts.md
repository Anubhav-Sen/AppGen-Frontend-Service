# fastapiValidation.ts

**Location:** `/src/lib/schemas/fastapiValidation.ts`
**Type:** Zod Validation Schemas

## Purpose

Provides comprehensive Zod validation schemas for the entire FastAPI project specification, ensuring data integrity before submission to backend or export.

## Validation Patterns

### Identifier Patterns
```typescript
const IdentifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/
// Matches: MyModel, user_model, _private
// Fails: 123model, my-model, my.model

const SimpleNamePattern = /^[A-Za-z0-9_]+$/
// Matches: users, my_table, Table123
// Fails: my-table, my.table, my table

const ForeignKeyPattern = /^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/
// Matches: User.id, post.author_id
// Fails: User, User., .id, User.id.extra
```

## Exported Schemas

### Enum Schemas

#### `columnTypeNameSchema`
```typescript
z.enum([
  "integer", "string", "boolean", "float", "numeric",
  "text", "date_time", "date", "time", "json",
  "enum", "large_binary", "interval", "big_integer",
  "uuid", "char", "varchar"
])
```

Validates column type names.

---

#### `cascadeOptionSchema`
```typescript
z.enum([
  "save-update", "merge", "expunge", "delete",
  "delete-orphan", "refresh-expire", "all"
])
```

Validates SQLAlchemy cascade options.

---

#### `dbProviderSchema`
```typescript
z.enum(["postgresql", "sqlite", "mysql"])
```

Validates database provider choices.

---

### Object Schemas

#### `enumDefinitionSchema`
```typescript
z.object({
  name: z.string()
    .min(1, "Enum name is required")
    .regex(IdentifierPattern, "Enum name must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  values: z.array(
    z.string()
      .min(1, "Enum value cannot be empty")
      .regex(SimpleNamePattern, "Enum values must match pattern [A-Za-z0-9_]+")
  ).min(1, "At least one enum value is required")
})
```

**Usage:**
```typescript
const result = enumDefinitionSchema.safeParse({
  name: "StatusType",
  values: ["active", "inactive", "pending"]
});
// ✅ Success

const invalid = enumDefinitionSchema.safeParse({
  name: "123Invalid",
  values: []
});
// ❌ Fails: Invalid name pattern, empty values array
```

---

#### `columnTypeSchema`
```typescript
z.object({
  name: columnTypeNameSchema,
  length: z.number().int().positive().optional(),
  precision: z.number().int().positive().optional(),
  scale: z.number().int().nonnegative().optional(),
  enum_class: z.string().optional()
})
```

**Example:**
```typescript
// String column
{ name: "string", length: 255 }

// Numeric column
{ name: "numeric", precision: 10, scale: 2 }

// Enum column
{ name: "enum", enum_class: "StatusType" }
```

---

#### `columnSchema`
```typescript
z.object({
  name: z.string()
    .min(1, "Column name is required")
    .regex(SimpleNamePattern, "Column name must match pattern [A-Za-z0-9_]+"),
  type: columnTypeSchema,
  primary_key: z.boolean().optional(),
  nullable: z.boolean().optional(),
  unique: z.boolean().optional(),
  index: z.boolean().optional(),
  autoincrement: z.boolean().optional(),
  foreign_key: z.string()
    .regex(ForeignKeyPattern, "Foreign key must be format: ModelName.column_name")
    .optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  server_default: z.string().optional(),
  info: z.record(z.string(), z.unknown()).optional()
})
```

**Example:**
```typescript
const column = {
  name: "email",
  type: { name: "string", length: 255 },
  nullable: false,
  unique: true,
  index: true
};

const result = columnSchema.safeParse(column);
// ✅ Valid column definition
```

---

#### `relationshipSchema`
```typescript
z.object({
  name: z.string()
    .min(1, "Relationship name is required")
    .regex(SimpleNamePattern, "Relationship name must match pattern [A-Za-z0-9_]+"),
  target: z.string()
    .min(1, "Target model is required")
    .regex(IdentifierPattern, "Target model must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  back_populates: z.string().optional(),
  backref: z.string().optional(),
  secondary: z.string().optional(),
  remote_side: z.array(z.string()).optional(),
  cascade: z.array(cascadeOptionSchema).optional(),
  uselist: z.boolean().optional(),
  order_by: z.string().optional()
})
```

**Example:**
```typescript
const relationship = {
  name: "author",
  target: "User",
  back_populates: "posts",
  cascade: ["save-update", "delete"]
};

const result = relationshipSchema.safeParse(relationship);
// ✅ Valid relationship
```

---

#### `modelSchema`
```typescript
z.object({
  name: z.string()
    .min(1, "Model name is required")
    .regex(IdentifierPattern, "Model name must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  tablename: z.string()
    .min(1, "Table name is required")
    .regex(SimpleNamePattern, "Table name must match pattern [A-Za-z0-9_]+"),
  columns: z.array(columnSchema).min(1, "Model must have at least one column"),
  relationships: z.array(relationshipSchema).optional(),
  is_user: z.boolean().optional(),
  username_field: z.string().optional(),
  password_field: z.string().optional()
})
```

**Example:**
```typescript
const model = {
  name: "User",
  tablename: "users",
  columns: [
    { name: "id", type: { name: "integer" }, primary_key: true }
  ],
  is_user: true,
  username_field: "email",
  password_field: "password_hash"
};

const result = modelSchema.safeParse(model);
// ✅ Valid model
```

---

### Configuration Schemas

#### `projectConfigSchema`
```typescript
z.object({
  title: z.string().min(1, "Project title is required"),
  author: z.string().optional(),
  description: z.string().optional()
})
```

---

#### `gitConfigSchema`
```typescript
z.object({
  username: z.string().min(1, "Git username is required"),
  repository: z.string().min(1, "Repository is required"),
  branch: z.string().min(1, "Branch is required")
})
```

---

#### `databaseConfigSchema`
```typescript
z.object({
  db_provider: dbProviderSchema,
  db_name: z.string().min(1, "Database name is required"),
  db_host: z.string().optional(),
  db_port: z.number().int().positive().optional(),
  db_username: z.string().optional(),
  db_password: z.string().optional(),
  db_driver: z.string().optional(),
  db_options: z.string().optional(),
  db_connect_args: z.string().optional()
})
```

---

#### `securityConfigSchema`
```typescript
z.object({
  secret_key: z.string().min(32, "Secret key must be at least 32 characters for security"),
  algorithm: z.string().min(1, "Algorithm is required")
})
```

---

#### `tokenConfigSchema`
```typescript
z.object({
  access_token_expire_minutes: z.number()
    .int()
    .positive("Access token expiry must be greater than 0"),
  refresh_token_expire_days: z.number()
    .int()
    .positive("Refresh token expiry must be greater than 0")
})
```

---

### Complete Spec Schema

#### `fastAPIProjectSpecSchema`
```typescript
z.object({
  project: projectConfigSchema,
  git: gitConfigSchema,
  database: databaseConfigSchema,
  security: securityConfigSchema,
  token: tokenConfigSchema,
  schema: schemaSchema
})
```

Validates the entire project specification.

---

## Validation Functions

### `validateProjectSpec(spec)`
```typescript
function validateProjectSpec(spec: unknown): SafeParseReturnType
```

Validates complete project spec.

**Usage:**
```typescript
import { validateProjectSpec, formatZodErrors } from '@/lib/schemas/fastapiValidation';
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

const spec = buildFastAPIProjectSpec();
const result = validateProjectSpec(spec);

if (!result.success) {
  const errors = formatZodErrors(result.error);
  console.error('Validation errors:', errors);
  // ["project.title: Project title is required"]
} else {
  console.log('Spec is valid!');
}
```

---

### `validateModel(model)`
```typescript
function validateModel(model: unknown): SafeParseReturnType
```

Validates a single model.

**Usage:**
```typescript
const model = { name: "User", tablename: "users", columns: [...] };
const result = validateModel(model);

if (!result.success) {
  const errors = formatZodErrors(result.error);
  toast.error(errors.join(', '));
}
```

---

### `validateColumn(column)`
```typescript
function validateColumn(column: unknown): SafeParseReturnType
```

Validates a single column.

**Usage:**
```typescript
const column = {
  name: "email",
  type: { name: "string", length: 255 }
};

const result = validateColumn(column);
if (result.success) {
  // Add to model
  addColumnToModel(result.data);
}
```

---

### `validateRelationship(relationship)`
```typescript
function validateRelationship(relationship: unknown): SafeParseReturnType
```

Validates a single relationship.

---

### `formatZodErrors(errors)`
```typescript
function formatZodErrors(errors: z.ZodError): string[]
```

Converts Zod errors to user-friendly messages.

**Usage:**
```typescript
const result = validateProjectSpec(spec);

if (!result.success) {
  const messages = formatZodErrors(result.error);
  // [
  //   "project.title: Project title is required",
  //   "security.secret_key: Secret key must be at least 32 characters"
  // ]

  messages.forEach(msg => toast.error(msg));
}
```

---

## Integration with Application

### Before Export
```typescript
import { validateProjectSpec, formatZodErrors } from '@/lib/schemas/fastapiValidation';
import { buildFastAPIProjectSpec } from '@/lib/serializers/specBuilder';

function SchemaBuilder() {
  const handleExport = () => {
    const spec = buildFastAPIProjectSpec();
    const result = validateProjectSpec(spec);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      toast.error(`Validation failed:\n${errors.join('\n')}`);
      return;
    }

    // Export valid spec
    downloadJSON(spec, 'project-spec.json');
  };
}
```

### Before Saving to Backend
```typescript
const handleSave = async () => {
  const spec = buildFastAPIProjectSpec();
  const result = validateProjectSpec(spec);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    setValidationErrors(errors);
    return;
  }

  // Save validated spec
  await schemas.create({
    name: project.title,
    schema_data: result.data
  });
};
```

### Form Validation
```typescript
import { validateModel } from '@/lib/schemas/fastapiValidation';

function ModelEditor() {
  const handleSubmit = (formData) => {
    const result = validateModel(formData);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      setError(errors[0]); // Show first error
      return;
    }

    // Add valid model
    schemaStore.addModel(result.data);
    closeDialog();
  };
}
```

## Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Model name must match pattern [A-Za-z_][A-Za-z0-9_]*" | Model name starts with number or has special chars | Use valid identifier (MyModel, user_model) |
| "Column name must match pattern [A-Za-z0-9_]+" | Column name has hyphens or dots | Use snake_case (email_address) |
| "Foreign key must be format: ModelName.column_name" | Wrong FK format | Use "User.id" not "User" or "id" |
| "Secret key must be at least 32 characters" | Security key too short | Generate longer key |
| "At least one model is required" | Empty schema | Add at least one model |
| "Model must have at least one column" | Empty column array | Add at least one column |

## Pattern Validation Examples

### Valid Identifiers ✅
```typescript
// Models/Enums
"User" ✅
"BlogPost" ✅
"_Private" ✅
"user_model" ✅

// Columns/Tables
"users" ✅
"blog_posts" ✅
"User123" ✅
```

### Invalid Identifiers ❌
```typescript
// Models/Enums
"123User" ❌  // Starts with number
"User-Model" ❌  // Has hyphen
"User.Model" ❌  // Has dot

// Columns/Tables
"user-name" ❌  // Has hyphen
"user.name" ❌  // Has dot
```

### Valid Foreign Keys ✅
```typescript
"User.id" ✅
"BlogPost.author_id" ✅
"Comment.post_id" ✅
```

### Invalid Foreign Keys ❌
```typescript
"User" ❌  // Missing column
"User." ❌  // Missing column
".id" ❌  // Missing model
"User.id.extra" ❌  // Too many parts
```

## Related Files

- [fastapiSpec.ts](../../types/fastapiSpec.ts.md): Type definitions these schemas validate
- [specBuilder.ts](../serializers/specBuilder.ts.md): Builds specs validated by these schemas
- [schemaStore.ts](../../stores/schemaStore.ts.md): Stores data validated by these schemas
- [ModelEditor.tsx](../../components/schema/editors/ModelEditor.tsx.md): Uses validateModel
- [ColumnEditor.tsx](../../components/schema/editors/ColumnEditor.tsx.md): Uses validateColumn

## Testing

```typescript
import { validateModel, validateColumn, formatZodErrors } from './fastapiValidation';

describe('fastapiValidation', () => {
  test('validates valid model', () => {
    const model = {
      name: "User",
      tablename: "users",
      columns: [
        { name: "id", type: { name: "integer" }, primary_key: true }
      ]
    };

    const result = validateModel(model);
    expect(result.success).toBe(true);
  });

  test('rejects invalid model name', () => {
    const model = {
      name: "123Invalid",
      tablename: "users",
      columns: [{ name: "id", type: { name: "integer" } }]
    };

    const result = validateModel(model);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('pattern');
  });

  test('formats errors correctly', () => {
    const result = validateColumn({ name: "", type: { name: "invalid" } });

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      expect(errors).toContain('name: Column name is required');
    }
  });
});
```
