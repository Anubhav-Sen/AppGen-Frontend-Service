import { useState } from "react";
import { useSchemaStore } from "@/stores/schemaStore";

interface EnumEditorProps {
  enumId: string;
  onClose: () => void;
}

export default function EnumEditor({ enumId, onClose }: EnumEditorProps) {
  const enumDef = useSchemaStore((state) => state.enums.find((e) => e.id === enumId));
  const updateEnum = useSchemaStore((state) => state.updateEnum);
  const deleteEnum = useSchemaStore((state) => state.deleteEnum);

  const [newValue, setNewValue] = useState("");

  if (!enumDef) return null;

  const handleUpdateName = (name: string) => {
    updateEnum(enumId, { name });
  };

  const handleAddValue = () => {
    if (newValue && !enumDef.values.includes(newValue)) {
      updateEnum(enumId, { values: [...enumDef.values, newValue] });
      setNewValue("");
    }
  };

  const handleDeleteValue = (index: number) => {
    const updatedValues = enumDef.values.filter((_, i) => i !== index);
    updateEnum(enumId, { values: updatedValues });
  };

  const handleDelete = () => {
    if (confirm(`Delete enum "${enumDef.name}"?`)) {
      deleteEnum(enumId);
      onClose();
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l-2 border-secondary-300 overflow-y-auto shadow-xl">
      <div className="sticky top-0 bg-white border-b border-secondary-300 p-4 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-secondary-900">Edit Enum</h2>
        <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enum Name</label>
          <input
            type="text"
            value={enumDef.name}
            onChange={(e) => handleUpdateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Values</label>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddValue()}
              placeholder="New value..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddValue}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {enumDef.values.map((value, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-300 shadow-sm"
              >
                <span className="font-medium text-sm text-secondary-800">{value}</span>
                <button
                  onClick={() => handleDeleteValue(index)}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-secondary-200">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Enum
          </button>
        </div>
      </div>
    </div>
  );
}
