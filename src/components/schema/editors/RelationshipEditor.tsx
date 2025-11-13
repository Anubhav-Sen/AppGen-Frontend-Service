import { useState } from "react";
import type { Relationship, ModelWithUI } from "@/types/fastapiSpec";

interface RelationshipEditorProps {
  relationship?: Relationship;
  models: ModelWithUI[];
  onSave: (relationship: Relationship) => void;
  onCancel: () => void;
}

export default function RelationshipEditor({
  relationship,
  models,
  onSave,
  onCancel,
}: RelationshipEditorProps) {
  const [name, setName] = useState(relationship?.name || "");
  const [target, setTarget] = useState(relationship?.target || "");
  const [backPopulates, setBackPopulates] = useState(relationship?.back_populates || "");
  const [uselist, setUselist] = useState(relationship?.uselist);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRelationship: Relationship = {
      name,
      target,
    };

    if (backPopulates) newRelationship.back_populates = backPopulates;
    if (uselist !== undefined) newRelationship.uselist = uselist;

    onSave(newRelationship);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-purple-50 rounded border border-purple-200 space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Relationship Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Target Model</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="">Select model...</option>
          {models.map((model) => (
            <option key={model.id} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Back Populates</label>
        <input
          type="text"
          value={backPopulates}
          onChange={(e) => setBackPopulates(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={uselist || false}
            onChange={(e) => setUselist(e.target.checked ? true : undefined)}
            className="rounded"
          />
          Use List (one-to-many)
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
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
