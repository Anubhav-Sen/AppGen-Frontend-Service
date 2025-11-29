import { useState, useEffect } from "react";
import type { Column, ColumnType, ModelWithUI, EnumWithUI, Relationship, CascadeOption } from "@/types/fastapiSpec";
import { ColumnTypeName, CascadeOption as CascadeOptions } from "@/types/fastapiSpec";

export interface ColumnWithRelationship {
  column: Column;
  relationship?: Relationship;
  reverseRelationship?: Relationship;
  reverseTargetModelId?: string;
}

interface ColumnEditorProps {
  column?: Column;
  models?: ModelWithUI[];
  currentModelId?: string;
  currentModelName?: string;
  currentTableName?: string;
  enums?: EnumWithUI[];
  existingRelationship?: Relationship;
  onSave: (data: ColumnWithRelationship) => void;
  onCancel: () => void;
}

const cascadeOptionLabels: Record<CascadeOption, string> = {
  [CascadeOptions.SAVE_UPDATE]: "Save/Update",
  [CascadeOptions.MERGE]: "Merge",
  [CascadeOptions.EXPUNGE]: "Expunge",
  [CascadeOptions.DELETE]: "Delete",
  [CascadeOptions.DELETE_ORPHAN]: "Delete Orphan",
  [CascadeOptions.REFRESH_EXPIRE]: "Refresh/Expire",
  [CascadeOptions.ALL]: "All",
};

export default function ColumnEditor({ column, models = [], currentModelId, currentModelName, currentTableName, enums = [], existingRelationship, onSave, onCancel }: ColumnEditorProps) {
  const [name, setName] = useState(column?.name || "");
  const [typeName, setTypeName] = useState<string>(column?.type.name || ColumnTypeName.STRING);
  const [length, setLength] = useState(column?.type.length?.toString() || "");
  const [precision, setPrecision] = useState(column?.type.precision?.toString() || "");
  const [scale, setScale] = useState(column?.type.scale?.toString() || "");
  const [enumClass, setEnumClass] = useState(column?.type.enum_class || "");
  const [nullable, setNullable] = useState(column?.nullable || false);
  const [unique, setUnique] = useState(column?.unique || false);
  const [index, setIndex] = useState(column?.index || false);
  const [defaultValue, setDefaultValue] = useState(column?.default?.toString() || "");
  const [foreignKey, setForeignKey] = useState(column?.foreign_key || "");

  // Relationship configuration state
  const [createRelationship, setCreateRelationship] = useState(!!column?.foreign_key || !!existingRelationship);
  const [relationshipType, setRelationshipType] = useState<"one-to-one" | "many-to-one">(
    existingRelationship?.uselist === false ? "many-to-one" : "one-to-one"
  );
  const [backPopulates, setBackPopulates] = useState(existingRelationship?.back_populates || "");
  const [cascade, setCascade] = useState<CascadeOption[]>(existingRelationship?.cascade || []);

  // Auto-enable relationship creation when FK is selected
  useEffect(() => {
    if (foreignKey) {
      setCreateRelationship(true);
    }
  }, [foreignKey]);

  const handleCascadeToggle = (option: CascadeOption) => {
    setCascade((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const type: ColumnType = { name: typeName as any };
    if (length) type.length = parseInt(length);
    if (precision) type.precision = parseInt(precision);
    if (scale) type.scale = parseInt(scale);
    if (typeName === ColumnTypeName.ENUM && enumClass) type.enum_class = enumClass;

    // Match the foreign key type to the referenced column's type
    if (foreignKey) {
      const [targetTableName, targetColumnName] = foreignKey.split('.');
      const targetModel = models.find(m => m.tablename === targetTableName);
      const targetColumn = targetModel?.columns.find(c => c.name === targetColumnName);

      if (targetColumn) {
        // Use the same type as the referenced column (typically integer for PK)
        type.name = targetColumn.type.name;
        if (targetColumn.type.length) type.length = targetColumn.type.length;
        if (targetColumn.type.precision) type.precision = targetColumn.type.precision;
        if (targetColumn.type.scale) type.scale = targetColumn.type.scale;
      }
    }

    const newColumn: Column = {
      name,
      type,
    };

    // Preserve existing primary_key and autoincrement if editing
    if (column?.primary_key) newColumn.primary_key = true;
    if (column?.autoincrement) newColumn.autoincrement = true;

    if (nullable) newColumn.nullable = true;
    if (unique) newColumn.unique = true;
    if (index) newColumn.index = true;
    if (defaultValue) newColumn.default = defaultValue;
    if (foreignKey) newColumn.foreign_key = foreignKey;

    const result: ColumnWithRelationship = { column: newColumn };

    // Create relationship if FK is set and relationship creation is enabled
    if (foreignKey && createRelationship) {
      const [targetTableName] = foreignKey.split('.');
      const targetModel = models.find(m => m.tablename === targetTableName);

      if (targetModel && currentModelName) {
        // Auto-generate relationship name based on target model
        const relationshipName = targetModel.name.toLowerCase();

        const relationship: Relationship = {
          name: relationshipName,
          target: targetModel.name,
        };

        // Set uselist based on relationship type
        if (relationshipType === "many-to-one") {
          relationship.uselist = false;
        }

        if (cascade.length > 0) relationship.cascade = cascade;

        // Add back_populates if enabled
        if (backPopulates) {
          relationship.back_populates = backPopulates;

          // Create reverse relationship
          const reverseRelationship: Relationship = {
            name: backPopulates,
            target: currentModelName,
            back_populates: relationshipName,
          };

          // Reverse is one-to-many if current is many-to-one
          if (relationshipType === "many-to-one") {
            reverseRelationship.uselist = true;
          }

          result.reverseRelationship = reverseRelationship;
          result.reverseTargetModelId = targetModel.id;
        }

        result.relationship = relationship;
      }
    }

    onSave(result);
  };

  const typeNeedsLength = [ColumnTypeName.STRING, ColumnTypeName.VARCHAR, ColumnTypeName.CHAR].includes(typeName as any);
  const typeNeedsDecimal = [ColumnTypeName.NUMERIC].includes(typeName as any);
  const typeIsEnum = typeName === ColumnTypeName.ENUM;

  const isPrimaryKey = column?.primary_key || false;

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-blue-50 rounded-lg border border-blue-300 shadow-sm space-y-2">
      {isPrimaryKey && (
        <div className="p-2 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-xs text-yellow-800 font-medium">
            ⚠️ Primary key column - editing is restricted
          </p>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Column Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          pattern="^[a-z0-9_]+$"
          title="Column name must contain only lowercase letters, numbers, and underscores"
          disabled={isPrimaryKey}
          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isPrimaryKey ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        <p className="mt-0.5 text-xs text-gray-500">Only lowercase letters, numbers (0-9), and underscores allowed</p>
      </div>

      {!typeIsEnum && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Foreign Key Reference</label>
          <select
            value={foreignKey}
            onChange={(e) => setForeignKey(e.target.value)}
            disabled={isPrimaryKey}
            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isPrimaryKey ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">None</option>
            {models
              .filter((m) => m.id !== currentModelId)
              .map((model) => (
                <optgroup key={model.id} label={model.name}>
                  {model.columns
                    .filter((col) => col.primary_key || col.unique)
                    .map((col) => (
                      <option key={`${model.tablename}.${col.name}`} value={`${model.tablename}.${col.name}`}>
                        {model.tablename}.{col.name} ({col.type.name})
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
          <p className="mt-0.5 text-xs text-gray-500">Select a primary/unique key from another table</p>
        </div>
      )}

      {!foreignKey && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              disabled={isPrimaryKey}
              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isPrimaryKey ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              {Object.values(ColumnTypeName).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {typeNeedsLength && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {typeNeedsDecimal && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precision</label>
                <input
                  type="number"
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Scale</label>
                <input
                  type="number"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {typeIsEnum && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Enum Type</label>
              <select
                value={enumClass}
                onChange={(e) => setEnumClass(e.target.value)}
                required
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select enum...</option>
                {enums.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name} ({e.values.length} values)
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-xs text-gray-500">Use the toolbar button to create a new enum</p>
            </div>
          )}

          {!typeIsEnum && (
            <>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={nullable}
                    onChange={(e) => setNullable(e.target.checked)}
                    className="rounded"
                  />
                  Optional Values
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={unique}
                    onChange={(e) => setUnique(e.target.checked)}
                    className="rounded"
                  />
                  Unique Values
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={index}
                    onChange={(e) => setIndex(e.target.checked)}
                    className="rounded"
                  />
                  Searchable Values
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Default Value</label>
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </>
      )}

      {foreignKey && createRelationship && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-300 shadow-sm space-y-2">
          <div className="text-xs font-medium text-purple-800 mb-2">Relationship Configuration</div>

          {existingRelationship && (
            <div className="mb-2 p-2 bg-purple-100 rounded">
              <p className="text-xs text-purple-700">
                Editing relationship: <strong>{currentTableName}.{name}</strong> → <strong>{foreignKey}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship Type</label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as "one-to-one" | "many-to-one")}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="one-to-one">One-to-One</option>
              <option value="many-to-one">Many-to-One (belongs to)</option>
            </select>
            <p className="mt-0.5 text-xs text-gray-500">
              {relationshipType === "many-to-one" && `${currentModelName || "This model"} belongs to one ${foreignKey.split('.')[0]}`}
              {relationshipType === "one-to-one" && `${currentModelName || "This model"} has one ${foreignKey.split('.')[0]}`}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={!!backPopulates}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Auto-set back-populates name
                    const targetModel = models.find(m => m.tablename === foreignKey.split('.')[0]);
                    if (targetModel && currentModelName) {
                      const autoName = relationshipType === "many-to-one"
                        ? currentModelName.toLowerCase() + 's'  // one-to-many on the reverse side
                        : currentModelName.toLowerCase();  // one-to-one on reverse
                      setBackPopulates(autoName);
                    }
                  } else {
                    setBackPopulates("");
                  }
                }}
                className="rounded text-purple-600"
              />
              Bidirectional Relationship (Back-Populates)
            </label>
            {backPopulates && (
              <p className="mt-1 text-xs text-purple-600">
                Will auto-create "<strong>{backPopulates}</strong>" relationship on target model
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cascade Options</label>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(cascadeOptionLabels).map(([option, label]) => (
                <label key={option} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={cascade.includes(option as CascadeOption)}
                    onChange={() => handleCascadeToggle(option as CascadeOption)}
                    className="rounded text-purple-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select cascade behaviors for related objects</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
