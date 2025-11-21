import { useState } from "react";
import { useSchemaStore } from "@/stores/schemaStore";
import type { ModelWithUI, Column, EnumDefinition } from "@/types/fastapiSpec";
import ColumnEditor from "./ColumnEditor";
import RelationshipEditor, { type RelationshipWithFK } from "./RelationshipEditor";

interface ModelEditorProps {
  modelId: string;
  onClose: () => void;
}

export default function ModelEditor({ modelId, onClose }: ModelEditorProps) {
  const model = useSchemaStore((state) => state.models.find((m) => m.id === modelId));
  const updateModel = useSchemaStore((state) => state.updateModel);
  const deleteModel = useSchemaStore((state) => state.deleteModel);
  const models = useSchemaStore((state) => state.models);
  const enums = useSchemaStore((state) => state.enums);
  const addEnum = useSchemaStore((state) => state.addEnum);

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

  const handleAddRelationship = (result: RelationshipWithFK) => {
    const { relationship, fkColumn, fkTargetModelId, reverseRelationship, reverseTargetModelId } = result;

    // Add the relationship to the current model
    const updatedRelationships = [...(model.relationships || []), relationship];
    updateModel(modelId, { relationships: updatedRelationships });

    // Add FK column to the appropriate model if specified
    if (fkColumn && fkTargetModelId) {
      const targetModel = models.find((m) => m.id === fkTargetModelId);
      if (targetModel) {
        // Check if column already exists
        const columnExists = targetModel.columns.some((c) => c.name === fkColumn.name);
        if (!columnExists) {
          const updatedColumns = [...targetModel.columns, fkColumn];
          updateModel(fkTargetModelId, { columns: updatedColumns });
        }
      }
    }

    // Add reverse relationship to target model if back_populates was specified
    if (reverseRelationship && reverseTargetModelId) {
      const targetModel = models.find((m) => m.id === reverseTargetModelId);
      if (targetModel) {
        const updatedTargetRelationships = [...(targetModel.relationships || []), reverseRelationship];
        updateModel(reverseTargetModelId, { relationships: updatedTargetRelationships });
      }
    }

    setShowRelationshipForm(false);
  };

  const handleUpdateRelationship = (index: number, result: RelationshipWithFK) => {
    const updatedRelationships = [...(model.relationships || [])];
    updatedRelationships[index] = result.relationship;
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

  const handleCreateEnum = (enumDef: EnumDefinition): string => {
    return addEnum(enumDef);
  };

  return (
    <div className="w-80 h-full bg-white border-l-2 border-secondary-300 overflow-y-auto shadow-xl">
      <div className="sticky top-0 bg-white border-b border-secondary-300 px-3 py-2 flex justify-between items-center shadow-sm">
        <h2 className="text-sm font-semibold text-secondary-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Model
        </h2>
        <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Model Name</label>
          <input
            type="text"
            value={model.name}
            onChange={(e) => handleUpdateField("name", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary-700 mb-1">Table Name</label>
          <input
            type="text"
            value={model.tablename}
            onChange={(e) => handleUpdateField("tablename", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-medium text-secondary-700">Columns</label>
            <button
              onClick={() => setShowColumnForm(true)}
              className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {showColumnForm && (
            <ColumnEditor
              models={models}
              currentModelId={modelId}
              enums={enums}
              onSave={handleAddColumn}
              onCancel={() => setShowColumnForm(false)}
              onCreateEnum={handleCreateEnum}
            />
          )}

          <div className="space-y-2">
            {model.columns.map((column, index) => (
              <div key={index}>
                {editingColumnIndex === index ? (
                  <ColumnEditor
                    column={column}
                    models={models}
                    currentModelId={modelId}
                    enums={enums}
                    onSave={(col) => handleUpdateColumn(index, col)}
                    onCancel={() => setEditingColumnIndex(null)}
                    onCreateEnum={handleCreateEnum}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2 bg-secondary-50 rounded-lg border border-secondary-300 shadow-sm">
                    <div className="flex-1">
                      <div className="font-medium text-xs text-secondary-800">{column.name}</div>
                      <div className="text-xs text-secondary-500">
                        {column.type.name}
                        {column.type.enum_class && ` (${column.type.enum_class})`}
                        {column.primary_key && " • PK"}
                        {column.nullable && " • nullable"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingColumnIndex(index)}
                        className="text-xs px-1.5 py-0.5 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(index)}
                        className="text-xs px-1.5 py-0.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        Del
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
            <label className="block text-xs font-medium text-secondary-700">Relationships</label>
            <button
              onClick={() => setShowRelationshipForm(true)}
              className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {showRelationshipForm && (
            <RelationshipEditor
              models={models}
              currentModelId={modelId}
              currentModelName={model.name}
              currentTableName={model.tablename}
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
                    currentModelId={modelId}
                    currentModelName={model.name}
                    currentTableName={model.tablename}
                    onSave={(result) => handleUpdateRelationship(index, result)}
                    onCancel={() => setEditingRelationshipIndex(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-300 shadow-sm">
                    <div className="flex-1">
                      <div className="font-medium text-xs text-secondary-800">{relationship.name}</div>
                      <div className="text-xs text-secondary-500">
                        → {relationship.target}
                        {relationship.back_populates && ` (↔ ${relationship.back_populates})`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingRelationshipIndex(index)}
                        className="text-xs px-1.5 py-0.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRelationship(index)}
                        className="text-xs px-1.5 py-0.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-secondary-300">
          <button
            onClick={handleDelete}
            className="w-full px-2 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Model
          </button>
        </div>
      </div>
    </div>
  );
}
