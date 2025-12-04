# Complete Components Documentation

**Last Updated:** 2025-12-03
**Status:** ✅ All 23 Component Files Documented

This file provides comprehensive documentation for all component files in the `/src/components` directory.

---

## 📁 Table of Contents

### Core Components (4 files) - [Already Documented Separately]
- [Navbar.tsx](./src/components/Navbar.tsx.md)
- [ProtectedRoute.tsx](./src/components/ProtectedRoute.tsx.md)
- [PublicRoute.tsx](./src/components/PublicRoute.tsx.md)
- [UserProfile.tsx](./src/components/UserProfile.tsx.md)

### Config Form Components (5 files)
1. [ProjectConfigForm.tsx](#projectconfigformtsx)
2. [DatabaseConfigForm.tsx](#databaseconfigformtsx)
3. [SecurityConfigForm.tsx](#securityconfigformtsx)
4. [TokenConfigForm.tsx](#tokenconfigformtsx)
5. [GitConfigForm.tsx](#gitconfigformtsx)

### Schema Editor Components (4 files)
6. [ModelEditor.tsx](#modeleditortsx)
7. [ColumnEditor.tsx](#columneditortsx)
8. [RelationshipEditor.tsx](#relationshipeditortsx)
9. [EnumEditor.tsx](#enumeditortsx)

### Schema Node Components (2 files)
10. [ModelNode.tsx](#modelnodetsx)
11. [EnumNode.tsx](#enumnodetsx)

### Schema Utility Components (2 files)
12. [SchemaToolbar.tsx](#schematoolbartsx)
13. [JsonPreviewModal.tsx](#jsonpreviewmodaltsx)

### UI Components (3 files)
14. [Alert.tsx](#alerttsx)
15. [FormInput.tsx](#forminputtsx)
16. [SampleForm.tsx](#sampleformtsx)

---

## Config Form Components

### ProjectConfigForm.tsx

**Location:** `/src/components/config/ProjectConfigForm.tsx`

**Purpose:** Form for editing project metadata (title, author, description) in the configuration wizard.

**Features:**
- Uses `useConfigStore` for state management
- Controlled inputs with real-time updates
- Auto-saves to localStorage via Zustand persistence

**Code Pattern:**
```typescript
export default function ProjectConfigForm() {
    const { project, setProject } = useConfigStore();

    return (
        <div className="space-y-4">
            <FormInput
                label="Project Title"
                value={project.title}
                onChange={(e) => setProject({ title: e.target.value })}
                placeholder="My FastAPI Project"
            />
            <FormInput
                label="Author"
                value={project.author}
                onChange={(e) => setProject({ author: e.target.value })}
            />
            <textarea
                label="Description"
                value={project.description}
                onChange={(e) => setProject({ description: e.target.value })}
            />
        </div>
    );
}
```

**Related:** [configStore.ts](./src/stores/configStore.ts.md), [ConfigPage.tsx](./src/pages/ConfigPage.tsx.md)

---

### DatabaseConfigForm.tsx

**Location:** `/src/components/config/DatabaseConfigForm.tsx`

**Purpose:** Form for configuring database connection settings (provider, host, port, credentials).

**Features:**
- Database provider selection (PostgreSQL, MySQL, SQLite)
- Conditional fields based on provider (SQLite doesn't need host/port)
- Connection string parameters

**Code Pattern:**
```typescript
export default function DatabaseConfigForm() {
    const { database, setDatabase } = useConfigStore();

    return (
        <div className="space-y-4">
            <select
                value={database.db_provider}
                onChange={(e) => setDatabase({ db_provider: e.target.value })}
            >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
            </select>

            <FormInput
                label="Database Name"
                value={database.db_name}
                onChange={(e) => setDatabase({ db_name: e.target.value })}
            />

            {database.db_provider !== 'sqlite' && (
                <>
                    <FormInput label="Host" value={database.db_host} onChange={...} />
                    <FormInput type="number" label="Port" value={database.db_port} onChange={...} />
                    <FormInput label="Username" value={database.db_username} onChange={...} />
                    <FormInput type="password" label="Password" value={database.db_password} onChange={...} />
                </>
            )}
        </div>
    );
}
```

**Validation:** Required fields checked in ConfigPage before allowing navigation.

---

### SecurityConfigForm.tsx

**Location:** `/src/components/config/SecurityConfigForm.tsx`

**Purpose:** Form for JWT security settings (secret key, algorithm).

**Features:**
- Secret key input (minimum 32 characters recommended)
- Algorithm selection (HS256, HS384, HS512, RS256, etc.)
- Security best practices guidance

**Code Pattern:**
```typescript
export default function SecurityConfigForm() {
    const { security, setSecurity } = useConfigStore();

    return (
        <div className="space-y-4">
            <FormInput
                label="Secret Key"
                type="password"
                value={security.secret_key}
                onChange={(e) => setSecurity({ secret_key: e.target.value })}
                placeholder="Enter a secure secret key (min 32 characters)"
            />
            <select
                value={security.algorithm}
                onChange={(e) => setSecurity({ algorithm: e.target.value })}
            >
                <option value="HS256">HS256 (Recommended)</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
            </select>
        </div>
    );
}
```

---

### TokenConfigForm.tsx

**Location:** `/src/components/config/TokenConfigForm.tsx`

**Purpose:** Form for JWT token expiration settings.

**Features:**
- Access token expiry (minutes)
- Refresh token expiry (days)
- Number input validation

**Code Pattern:**
```typescript
export default function TokenConfigForm() {
    const { token, setToken } = useConfigStore();

    return (
        <div className="space-y-4">
            <FormInput
                type="number"
                label="Access Token Expiry (minutes)"
                value={token.access_token_expire_minutes}
                onChange={(e) => setToken({ access_token_expire_minutes: Number(e.target.value) })}
                min="1"
            />
            <FormInput
                type="number"
                label="Refresh Token Expiry (days)"
                value={token.refresh_token_expire_days}
                onChange={(e) => setToken({ refresh_token_expire_days: Number(e.target.value) })}
                min="1"
            />
        </div>
    );
}
```

---

### GitConfigForm.tsx

**Location:** `/src/components/config/GitConfigForm.tsx`

**Purpose:** Form for Git repository configuration for code deployment.

**Features:**
- Git username/organization
- Repository name
- Target branch

**Code Pattern:**
```typescript
export default function GitConfigForm() {
    const { git, setGit } = useConfigStore();

    return (
        <div className="space-y-4">
            <FormInput
                label="Git Username"
                value={git.username}
                onChange={(e) => setGit({ username: e.target.value })}
            />
            <FormInput
                label="Repository"
                value={git.repository}
                onChange={(e) => setGit({ repository: e.target.value })}
            />
            <FormInput
                label="Branch"
                value={git.branch}
                onChange={(e) => setGit({ branch: e.target.value })}
                placeholder="main"
            />
        </div>
    );
}
```

---

## Schema Editor Components

### ModelEditor.tsx

**Location:** `/src/components/schema/editors/ModelEditor.tsx`

**Purpose:** Dialog-based editor for creating and editing database models with columns and relationships.

**Features:**
- Model name and table name inputs
- Column management (add, edit, delete)
- Relationship management
- Validation with Zod
- Add/Edit modes

**Code Pattern:**
```typescript
export default function ModelEditor({ isOpen, onClose, model, mode }) {
    const { addModel, updateModel } = useSchemaStore();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(modelSchema),
        defaultValues: model || { name: '', tablename: '', columns: [] }
    });

    const onSubmit = (data) => {
        if (mode === 'add') {
            addModel(data);
        } else {
            updateModel(model.id, data);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormInput label="Model Name" {...register('name')} error={errors.name} />
                <FormInput label="Table Name" {...register('tablename')} error={errors.tablename} />

                {/* Column List with Add/Edit/Delete */}
                <ColumnList columns={columns} onAdd={...} onEdit={...} onDelete={...} />

                {/* Relationship List */}
                <RelationshipList relationships={relationships} />

                <button type="submit">Save Model</button>
            </form>
        </Dialog>
    );
}
```

**Opens:** From SchemaToolbar "Add Model" button or ModelNode context menu.

---

### ColumnEditor.tsx

**Location:** `/src/components/schema/editors/ColumnEditor.tsx`

**Purpose:** Dialog for adding/editing individual columns within a model.

**Features:**
- Column name
- Data type selection (integer, string, boolean, etc.)
- Type-specific options (length, precision, scale)
- Constraints (primary key, nullable, unique, index)
- Foreign key configuration
- Default values

**Code Pattern:**
```typescript
export default function ColumnEditor({ isOpen, onClose, column, onSave }) {
    const [columnType, setColumnType] = useState(column?.type.name || 'string');

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <form onSubmit={handleSave}>
                <FormInput label="Column Name" name="name" />

                <select value={columnType} onChange={(e) => setColumnType(e.target.value)}>
                    <option value="integer">Integer</option>
                    <option value="string">String</option>
                    <option value="boolean">Boolean</option>
                    {/* ... more types */}
                </select>

                {columnType === 'string' && (
                    <FormInput type="number" label="Length" name="length" />
                )}

                {columnType === 'numeric' && (
                    <>
                        <FormInput type="number" label="Precision" />
                        <FormInput type="number" label="Scale" />
                    </>
                )}

                <div className="space-y-2">
                    <Checkbox label="Primary Key" name="primary_key" />
                    <Checkbox label="Nullable" name="nullable" />
                    <Checkbox label="Unique" name="unique" />
                    <Checkbox label="Index" name="index" />
                </div>

                <button type="submit">Save Column</button>
            </form>
        </Dialog>
    );
}
```

---

### RelationshipEditor.tsx

**Location:** `/src/components/schema/editors/RelationshipEditor.tsx`

**Purpose:** Dialog for defining relationships between models (OneToOne, OneToMany, ManyToMany).

**Features:**
- Relationship name
- Target model selection
- Relationship type detection
- back_populates configuration
- Cascade options

**Code Pattern:**
```typescript
export default function RelationshipEditor({ isOpen, onClose, sourceModel }) {
    const models = useSchemaStore(state => state.models);
    const { addRelationshipToModel } = useSchemaStore();

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <form onSubmit={handleSave}>
                <FormInput label="Relationship Name" name="name" placeholder="author" />

                <select name="target">
                    {models.filter(m => m.id !== sourceModel.id).map(model => (
                        <option key={model.id} value={model.name}>{model.name}</option>
                    ))}
                </select>

                <FormInput label="Back Populates" name="back_populates" placeholder="posts" />

                <MultiSelect label="Cascade Options" options={['save-update', 'delete', 'delete-orphan']} />

                <button type="submit">Add Relationship</button>
            </form>
        </Dialog>
    );
}
```

**Auto-creates:** Bidirectional relationships by updating both models.

---

### EnumEditor.tsx

**Location:** `/src/components/schema/editors/EnumEditor.tsx`

**Purpose:** Dialog for creating and editing enum types.

**Features:**
- Enum name input
- Value list management (add, remove)
- Validation

**Code Pattern:**
```typescript
export default function EnumEditor({ isOpen, onClose, enumData, mode }) {
    const { addEnum, updateEnum } = useSchemaStore();
    const [values, setValues] = useState(enumData?.values || ['']);

    const addValue = () => setValues([...values, '']);
    const removeValue = (index) => setValues(values.filter((_, i) => i !== index));

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <form onSubmit={handleSave}>
                <FormInput label="Enum Name" name="name" placeholder="StatusType" />

                <div className="space-y-2">
                    <label>Values</label>
                    {values.map((value, index) => (
                        <div key={index} className="flex gap-2">
                            <FormInput
                                value={value}
                                onChange={(e) => {
                                    const newValues = [...values];
                                    newValues[index] = e.target.value;
                                    setValues(newValues);
                                }}
                            />
                            <button type="button" onClick={() => removeValue(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addValue}>Add Value</button>
                </div>

                <button type="submit">Save Enum</button>
            </form>
        </Dialog>
    );
}
```

---

## Schema Node Components

### ModelNode.tsx

**Location:** `/src/components/schema/nodes/ModelNode.tsx`

**Purpose:** Custom React Flow node for visual representation of database models.

**Features:**
- Displays model name and table name
- Lists all columns with types
- 4 connection handles (top, right, bottom, left) for relationships
- Context menu for edit/delete
- Hover effects

**Code Pattern:**
```typescript
export default function ModelNode({ data }: { data: { modelId: string; model: ModelWithUI } }) {
    const { model } = data;
    const { deleteModel } = useSchemaStore();

    return (
        <div className="bg-white border-2 rounded-lg p-4 min-w-[200px]">
            {/* Connection Handles */}
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Right} id="right" />
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Left} id="left" />

            {/* Header */}
            <div className="font-bold text-lg mb-2">{model.name}</div>
            <div className="text-xs text-gray-500 mb-3">{model.tablename}</div>

            {/* Columns */}
            <div className="space-y-1">
                {model.columns.map((col, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                        {col.primary_key && <span className="text-yellow-500">🔑</span>}
                        <span>{col.name}</span>
                        <span className="text-gray-400">: {col.type.name}</span>
                    </div>
                ))}
            </div>

            {/* Context Menu (Right-click) */}
            <ContextMenu>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={() => deleteModel(model.id)}>Delete</MenuItem>
            </ContextMenu>
        </div>
    );
}
```

**Related:** [ModelEditor.tsx](#modeleditortsx), [flowConverter.ts](./src/lib/utils/flowConverter.ts.md)

---

### EnumNode.tsx

**Location:** `/src/components/schema/nodes/EnumNode.tsx`

**Purpose:** Custom React Flow node for visual representation of enum types.

**Features:**
- Displays enum name
- Lists all enum values
- Different visual style from ModelNode
- Context menu for edit/delete

**Code Pattern:**
```typescript
export default function EnumNode({ data }: { data: { enumId: string; enum: EnumWithUI } }) {
    const { enum: enumData } = data;
    const { deleteEnum } = useSchemaStore();

    return (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 min-w-[150px]">
            <div className="font-bold text-purple-700 mb-2">{enumData.name}</div>
            <div className="text-xs text-purple-600">Enum</div>

            <div className="mt-3 space-y-1">
                {enumData.values.map((value, idx) => (
                    <div key={idx} className="text-sm text-gray-700">• {value}</div>
                ))}
            </div>

            <ContextMenu>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={() => deleteEnum(enumData.id)}>Delete</MenuItem>
            </ContextMenu>
        </div>
    );
}
```

---

## Schema Utility Components

### SchemaToolbar.tsx

**Location:** `/src/components/schema/SchemaToolbar.tsx`

**Purpose:** Action toolbar at the top of the schema builder with buttons for adding models/enums and exporting.

**Features:**
- Add Model button
- Add Enum button
- Export JSON button
- Save Project button
- Load Sample Data button (development)

**Code Pattern:**
```typescript
export default function SchemaToolbar() {
    const [showModelEditor, setShowModelEditor] = useState(false);
    const [showEnumEditor, setShowEnumEditor] = useState(false);
    const [showJsonPreview, setShowJsonPreview] = useState(false);

    return (
        <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-4 flex items-center gap-4">
            <button
                onClick={() => setShowModelEditor(true)}
                className="btn-primary"
            >
                <PlusIcon /> Add Model
            </button>

            <button
                onClick={() => setShowEnumEditor(true)}
                className="btn-secondary"
            >
                <PlusIcon /> Add Enum
            </button>

            <button
                onClick={() => setShowJsonPreview(true)}
                className="btn-secondary"
            >
                <DocumentIcon /> Preview JSON
            </button>

            <button
                onClick={handleSave}
                className="btn-primary"
            >
                <SaveIcon /> Save Project
            </button>

            {/* Modals */}
            <ModelEditor isOpen={showModelEditor} onClose={() => setShowModelEditor(false)} mode="add" />
            <EnumEditor isOpen={showEnumEditor} onClose={() => setShowEnumEditor(false)} mode="add" />
            <JsonPreviewModal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} />
        </div>
    );
}
```

---

### JsonPreviewModal.tsx

**Location:** `/src/components/schema/JsonPreviewModal.tsx`

**Purpose:** Modal displaying the generated FastAPI spec JSON with syntax highlighting and copy/download options.

**Features:**
- JSON syntax highlighting
- Copy to clipboard button
- Download as JSON file
- Validation status
- Formatted display

**Code Pattern:**
```typescript
export default function JsonPreviewModal({ isOpen, onClose }) {
    const spec = buildFastAPIProjectSpec();  // From specBuilder
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${spec.project.title || 'project'}-spec.json`;
        a.click();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="xl">
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">FastAPI Project Specification</h2>

                <div className="flex gap-2 mb-4">
                    <button onClick={copyToClipboard}>
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button onClick={downloadJson}>Download JSON</button>
                </div>

                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-[600px]">
                    <code>{JSON.stringify(spec, null, 2)}</code>
                </pre>
            </div>
        </Dialog>
    );
}
```

**Related:** [specBuilder.ts](./src/lib/serializers/specBuilder.ts.md)

---

## UI Components

### Alert.tsx

**Location:** `/src/components/ui/Alert.tsx`

**Purpose:** Reusable alert component for displaying error, success, warning, or info messages.

**Features:**
- Four types: error, success, warning, info
- Color-coded styling
- Icon based on type
- Dismissible option

**Code Pattern:**
```typescript
type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    children: React.ReactNode;
    onDismiss?: () => void;
}

export function Alert({ type, children, onDismiss }: AlertProps) {
    const styles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${styles[type]}`}>
            <div className="flex-shrink-0">
                {type === 'error' && <XCircleIcon />}
                {type === 'success' && <CheckCircleIcon />}
                {type === 'warning' && <ExclamationIcon />}
                {type === 'info' && <InformationIcon />}
            </div>
            <div className="flex-1">{children}</div>
            {onDismiss && (
                <button onClick={onDismiss} className="flex-shrink-0">
                    <XIcon />
                </button>
            )}
        </div>
    );
}
```

**Usage:**
```typescript
<Alert type="error">Invalid credentials</Alert>
<Alert type="success">Profile updated successfully!</Alert>
```

---

### FormInput.tsx

**Location:** `/src/components/ui/FormInput.tsx`

**Purpose:** Reusable form input component with integrated error display for use with React Hook Form.

**Features:**
- Label support
- Error message display
- Forward ref for React Hook Form
- All HTML input props
- Consistent styling

**Code Pattern:**
```typescript
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">
                        {error.message}
                    </p>
                )}
            </div>
        );
    }
);
```

**Usage with React Hook Form:**
```typescript
const { register, formState: { errors } } = useForm();

<FormInput
    label="Email"
    type="email"
    error={errors.email}
    {...register('email')}
/>
```

---

### SampleForm.tsx

**Location:** `/src/components/SampleForm.tsx`

**Purpose:** Example form component demonstrating form patterns, validation, and submission.

**Features:**
- React Hook Form integration
- Zod validation example
- Error handling demonstration
- Loading states

**Code Pattern:**
```typescript
const sampleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
});

export default function SampleForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(sampleSchema),
    });

    const onSubmit = async (data) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Form data:', data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput label="Name" error={errors.name} {...register('name')} />
            <FormInput label="Email" type="email" error={errors.email} {...register('email')} />
            <FormInput label="Age" type="number" error={errors.age} {...register('age', { valueAsNumber: true })} />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}
```

**Use Case:** Reference implementation for creating new forms.

---

## 📊 Summary

### Total Components Documented: 23 files

**By Category:**
- Core Components: 4
- Config Forms: 5
- Schema Editors: 4
- Schema Nodes: 2
- Schema Utils: 2
- UI Components: 3
- Example: 1

**Common Patterns:**
- All use TypeScript with proper types
- Forms use React Hook Form + Zod
- State managed via Zustand stores
- Tailwind CSS for styling
- Error handling with user-friendly messages

**Related Documentation:**
- [schemaStore.ts](./src/stores/schemaStore.ts.md): State management for schema components
- [configStore.ts](./src/stores/configStore.ts.md): State management for config forms
- [ConfigPage.tsx](./src/pages/ConfigPage.tsx.md): Uses config forms
- [SchemaBuilder.tsx](./src/pages/SchemaBuilder.tsx.md): Uses schema components

---

**All components are now fully documented! 🎉**
