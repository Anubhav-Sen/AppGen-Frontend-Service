import { useState } from "react";
import type { Column, ColumnType, ModelWithUI, EnumWithUI, EnumDefinition } from "@/types/fastapiSpec";
import { ColumnTypeName } from "@/types/fastapiSpec";

interface ColumnEditorProps {
  column?: Column;
  models?: ModelWithUI[];
  currentModelId?: string;
  enums?: EnumWithUI[];
  onSave: (column: Column) => void;
  onCancel: () => void;
  onCreateEnum?: (enumDef: EnumDefinition) => string;
}

export default function ColumnEditor({ column, models = [], currentModelId, enums = [], onSave, onCancel, onCreateEnum }: ColumnEditorProps) {
  const [name, setName] = useState(column?.name || "");
  const [typeName, setTypeName] = useState<string>(column?.type.name || ColumnTypeName.STRING);
  const [length, setLength] = useState(column?.type.length?.toString() || "");
  const [precision, setPrecision] = useState(column?.type.precision?.toString() || "");
  const [scale, setScale] = useState(column?.type.scale?.toString() || "");
  const [enumClass, setEnumClass] = useState(column?.type.enum_class || "");
  const [primaryKey, setPrimaryKey] = useState(column?.primary_key || false);
  const [nullable, setNullable] = useState(column?.nullable || false);
  const [unique, setUnique] = useState(column?.unique || false);
  const [index, setIndex] = useState(column?.index || false);
  const [autoincrement, setAutoincrement] = useState(column?.autoincrement || false);
  const [defaultValue, setDefaultValue] = useState(column?.default?.toString() || "");
  const [foreignKey, setForeignKey] = useState(column?.foreign_key || "");

  // Inline enum creation state
  const [showEnumCreator, setShowEnumCreator] = useState(false);
  const [newEnumName, setNewEnumName] = useState("");
  const [newEnumValues, setNewEnumValues] = useState<string[]>([]);
  const [newEnumValue, setNewEnumValue] = useState("");

  const handleAddEnumValue = () => {
    if (newEnumValue && !newEnumValues.includes(newEnumValue)) {
      setNewEnumValues([...newEnumValues, newEnumValue]);
      setNewEnumValue("");
    }
  };

  const handleRemoveEnumValue = (index: number) => {
    setNewEnumValues(newEnumValues.filter((_, i) => i !== index));
  };

  const handleCreateEnum = () => {
    if (newEnumName && newEnumValues.length > 0 && onCreateEnum) {
      onCreateEnum({ name: newEnumName, values: newEnumValues });
      setEnumClass(newEnumName);
      setShowEnumCreator(false);
      setNewEnumName("");
      setNewEnumValues([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const type: ColumnType = { name: typeName as any };
    if (length) type.length = parseInt(length);
    if (precision) type.precision = parseInt(precision);
    if (scale) type.scale = parseInt(scale);
    if (typeName === ColumnTypeName.ENUM && enumClass) type.enum_class = enumClass;

    const newColumn: Column = {
      name,
      type,
    };

    if (primaryKey) newColumn.primary_key = true;
    if (nullable) newColumn.nullable = true;
    if (unique) newColumn.unique = true;
    if (index) newColumn.index = true;
    if (autoincrement) newColumn.autoincrement = true;
    if (defaultValue) newColumn.default = defaultValue;
    if (foreignKey) newColumn.foreign_key = foreignKey;

    onSave(newColumn);
  };

  const typeNeedsLength = [ColumnTypeName.STRING, ColumnTypeName.VARCHAR, ColumnTypeName.CHAR].includes(typeName as any);
  const typeNeedsDecimal = [ColumnTypeName.NUMERIC].includes(typeName as any);
  const typeIsEnum = typeName === ColumnTypeName.ENUM;

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-blue-50 rounded-lg border border-blue-300 shadow-sm space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Column Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
        <select
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div className="flex gap-2">
            <select
              value={enumClass}
              onChange={(e) => setEnumClass(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select enum...</option>
              {enums.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name} ({e.values.length} values)
                </option>
              ))}
            </select>
            {onCreateEnum && (
              <button
                type="button"
                onClick={() => setShowEnumCreator(!showEnumCreator)}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                {showEnumCreator ? "Cancel" : "New"}
              </button>
            )}
          </div>

          {showEnumCreator && (
            <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-300 shadow-sm space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Enum Name</label>
                <input
                  type="text"
                  value={newEnumName}
                  onChange={(e) => setNewEnumName(e.target.value)}
                  placeholder="e.g., Status, Priority"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Values</label>
                <div className="flex gap-1 mb-1">
                  <input
                    type="text"
                    value={newEnumValue}
                    onChange={(e) => setNewEnumValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddEnumValue())}
                    placeholder="Add value..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddEnumValue}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
                {newEnumValues.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newEnumValues.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => handleRemoveEnumValue(i)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreateEnum}
                disabled={!newEnumName || newEnumValues.length === 0}
                className="w-full px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Enum
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={primaryKey}
            onChange={(e) => setPrimaryKey(e.target.checked)}
            className="rounded"
          />
          Primary Key
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={nullable}
            onChange={(e) => setNullable(e.target.checked)}
            className="rounded"
          />
          Nullable
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="rounded"
          />
          Unique
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={index}
            onChange={(e) => setIndex(e.target.checked)}
            className="rounded"
          />
          Index
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={autoincrement}
            onChange={(e) => setAutoincrement(e.target.checked)}
            className="rounded"
          />
          Autoincrement
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

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Foreign Key Reference</label>
        <select
          value={foreignKey}
          onChange={(e) => setForeignKey(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
