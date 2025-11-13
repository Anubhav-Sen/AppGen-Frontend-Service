import { useState } from "react";
import type { Column, ColumnType } from "@/types/fastapiSpec";
import { ColumnTypeName } from "@/types/fastapiSpec";

interface ColumnEditorProps {
  column?: Column;
  onSave: (column: Column) => void;
  onCancel: () => void;
}

export default function ColumnEditor({ column, onSave, onCancel }: ColumnEditorProps) {
  const [name, setName] = useState(column?.name || "");
  const [typeName, setTypeName] = useState<string>(column?.type.name || ColumnTypeName.STRING);
  const [length, setLength] = useState(column?.type.length?.toString() || "");
  const [precision, setPrecision] = useState(column?.type.precision?.toString() || "");
  const [scale, setScale] = useState(column?.type.scale?.toString() || "");
  const [primaryKey, setPrimaryKey] = useState(column?.primary_key || false);
  const [nullable, setNullable] = useState(column?.nullable || false);
  const [unique, setUnique] = useState(column?.unique || false);
  const [index, setIndex] = useState(column?.index || false);
  const [autoincrement, setAutoincrement] = useState(column?.autoincrement || false);
  const [defaultValue, setDefaultValue] = useState(column?.default?.toString() || "");
  const [foreignKey, setForeignKey] = useState(column?.foreign_key || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const type: ColumnType = { name: typeName as any };
    if (length) type.length = parseInt(length);
    if (precision) type.precision = parseInt(precision);
    if (scale) type.scale = parseInt(scale);

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

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-blue-50 rounded border border-blue-200 space-y-2">
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
        <label className="block text-xs font-medium text-gray-700 mb-1">Foreign Key (table.column)</label>
        <input
          type="text"
          value={foreignKey}
          onChange={(e) => setForeignKey(e.target.value)}
          placeholder="e.g., users.id"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
