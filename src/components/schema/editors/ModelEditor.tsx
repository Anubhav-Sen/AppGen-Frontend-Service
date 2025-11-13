import { useState } from "react";
import { useSchemaStore } from "@/stores/schemaStore";
import type { ModelWithUI, Column, Relationship } from "@/types/fastapiSpec";
import ColumnEditor from "./ColumnEditor";
import RelationshipEditor from "./RelationshipEditor";

interface ModelEditorProps {
  modelId: string;
  onClose: () => void;
}

export default function ModelEditor({ modelId, onClose }: ModelEditorProps) {
  const model = useSchemaStore((state) => state.models.find((m) => m.id === modelId));
  const updateModel = useSchemaStore((state) => state.updateModel);
  const deleteModel = useSchemaStore((state) => state.deleteModel);
  const models = useSchemaStore((state) => state.models);

  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [editingRelationshipIndex, setEditingRelationshipIndex] = useState<number | null>(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);

  if (!model) return null;

  const handleUpdateField = (field: keyof ModelWithUI, value: any) => {
    updateModel(modelId, { [field]: value });
  };

  const handleAddColumn = (column: Column) => {
    const updatedColumns = [...model.columns, column];
    updateModel(modelId, { columns: updatedColumns });
    setShowColumnForm(false);
  };

  const handleUpdateColumn = (index: number, column: Column) => {
    const updatedColumns = [...model.columns];
    updatedColumns[index] = column;
    updateModel(modelId, { columns: updatedColumns });
    setEditingColumnIndex(null);
  };

  const handleDeleteColumn = (index: number) => {
    const updatedColumns = model.columns.filter((_, i) => i !== index);
    updateModel(modelId, { columns: updatedColumns });
  };

  const handleAddRelationship = (relationship: Relationship) => {
    const updatedRelationships = [...(model.relationships || []), relationship];
    updateModel(modelId, { relationships: updatedRelationships });
    setShowRelationshipForm(false);
  };

  const handleUpdateRelationship = (index: number, relationship: Relationship) => {
    const updatedRelationships = [...(model.relationships || [])];
    updatedRelationships[index] = relationship;
    updateModel(modelId, { relationships: updatedRelationships });
    setEditingRelationshipIndex(null);
  };

  const handleDeleteRelationship = (index: number) => {
    const updatedRelationships = (model.relationships || []).filter((_, i) => i !== index);
    updateModel(modelId, { relationships: updatedRelationships });
  };

  const handleDelete = () => {
    if (confirm(`Delete model "${model.name}"?`)) {
      deleteModel(modelId);
      onClose();
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Edit Model</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
          <input
            type="text"
            value={model.name}
            onChange={(e) => handleUpdateField("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
          <input
            type="text"
            value={model.tablename}
            onChange={(e) => handleUpdateField("tablename", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Columns</label>
            <button
              onClick={() => setShowColumnForm(true)}
              className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add
            </button>
          </div>

          {showColumnForm && (
            <ColumnEditor
              onSave={handleAddColumn}
              onCancel={() => setShowColumnForm(false)}
            />
          )}

          <div className="space-y-2">
            {model.columns.map((column, index) => (
              <div key={index}>
                {editingColumnIndex === index ? (
                  <ColumnEditor
                    column={column}
                    onSave={(col) => handleUpdateColumn(index, col)}
                    onCancel={() => setEditingColumnIndex(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{column.name}</div>
                      <div className="text-xs text-gray-500">
                        {column.type.name}
                        {column.primary_key && " • PK"}
                        {column.nullable && " • nullable"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingColumnIndex(index)}
                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(index)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Relationships</label>
            <button
              onClick={() => setShowRelationshipForm(true)}
              className="text-sm px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              + Add
            </button>
          </div>

          {showRelationshipForm && (
            <RelationshipEditor
              models={models}
              onSave={handleAddRelationship}
              onCancel={() => setShowRelationshipForm(false)}
            />
          )}

          <div className="space-y-2">
            {(model.relationships || []).map((relationship, index) => (
              <div key={index}>
                {editingRelationshipIndex === index ? (
                  <RelationshipEditor
                    relationship={relationship}
                    models={models}
                    onSave={(rel) => handleUpdateRelationship(index, rel)}
                    onCancel={() => setEditingRelationshipIndex(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{relationship.name}</div>
                      <div className="text-xs text-gray-500">→ {relationship.target}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingRelationshipIndex(index)}
                        className="text-xs px-2 py-1 text-purple-600 hover:bg-purple-100 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRelationship(index)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Model
          </button>
        </div>
      </div>
    </div>
  );
}
