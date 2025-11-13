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
    <div className="w-96 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Edit Enum</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
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
                className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200"
              >
                <span className="font-medium text-sm">{value}</span>
                <button
                  onClick={() => handleDeleteValue(index)}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Enum
          </button>
        </div>
      </div>
    </div>
  );
}
