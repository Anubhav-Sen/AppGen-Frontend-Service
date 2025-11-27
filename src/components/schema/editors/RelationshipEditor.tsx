import { useState } from "react";
import type { Relationship, ModelWithUI, CascadeOption, Column } from "@/types/fastapiSpec";
import { CascadeOption as CascadeOptions } from "@/types/fastapiSpec";

export interface RelationshipWithFK {
  relationship: Relationship;
  fkColumn?: Column;
  fkTargetModelId?: string; // Which model should receive the FK column
  reverseRelationship?: Relationship; // Bidirectional relationship to add to target model
  reverseTargetModelId?: string; // Target model ID for reverse relationship
}

interface RelationshipEditorProps {
  relationship?: Relationship;
  models: ModelWithUI[];
  currentModelId?: string;
  currentModelName?: string;
  currentTableName?: string;
  onSave: (result: RelationshipWithFK) => void;
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

type RelationType = "one-to-one" | "one-to-many" | "many-to-one";

export default function RelationshipEditor({
  relationship,
  models,
  currentModelId,
  currentModelName,
  currentTableName,
  onSave,
  onCancel,
}: RelationshipEditorProps) {
  // When editing a relationship, get the target
  const targetModelFromRel = relationship?.target || "";
  const [relationType, setRelationType] = useState<RelationType>(
    relationship?.uselist === false ? "many-to-one" : relationship?.uselist === true ? "one-to-many" : "one-to-one"
  );
  const [enableBackPopulates, setEnableBackPopulates] = useState(!!relationship?.back_populates);
  const [cascade, setCascade] = useState<CascadeOption[]>(relationship?.cascade || []);

  // Auto-generate relationship name based on target and type
  const name = targetModelFromRel ? (relationType === "one-to-many" ? targetModelFromRel.toLowerCase() + "s" : targetModelFromRel.toLowerCase()) : "";

  // Auto-generate back-populates name
  const backPopulates = enableBackPopulates && currentModelName
    ? (relationType === "one-to-many"
        ? currentModelName.toLowerCase()  // many-to-one on reverse
        : currentModelName.toLowerCase() + 's')  // one-to-many on reverse
    : "";

  // Get the foreign key info if this relationship is based on one
  const targetModel = models.find(m => m.name === targetModelFromRel);
  const currentModel = models.find(m => m.id === currentModelId);
  const fkColumn = currentModel?.columns.find(col =>
    col.foreign_key && col.foreign_key.startsWith(targetModel?.tablename || '')
  );
  const fkReference = fkColumn?.foreign_key || "";

  const handleCascadeToggle = (option: CascadeOption) => {
    setCascade((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRelationship: Relationship = {
      name,
      target: targetModelFromRel,
    };

    if (backPopulates) newRelationship.back_populates = backPopulates;
    // Set uselist based on relationship type
    if (relationType === "one-to-many") {
      newRelationship.uselist = true;
    } else if (relationType === "many-to-one") {
      newRelationship.uselist = false;
    }
    if (cascade.length > 0) newRelationship.cascade = cascade;

    const result: RelationshipWithFK = { relationship: newRelationship };

    // Auto-create reverse relationship if back_populates is enabled
    if (backPopulates && targetModel && !relationship) {
      // Check if the target model already has a relationship with this name
      const existingReverseRel = targetModel.relationships?.find(
        (r) => r.name === backPopulates
      );

      if (!existingReverseRel) {
        // Determine the reverse relationship type (inverse of current)
        const reverseUselist = relationType === "one-to-many"
          ? false  // one-to-many becomes many-to-one (uselist=false)
          : relationType === "many-to-one"
            ? true   // many-to-one becomes one-to-many (uselist=true)
            : undefined; // one-to-one stays one-to-one

        const reverseRelationship: Relationship = {
          name: backPopulates,
          target: currentModelName || "",
          back_populates: name, // Point back to the original relationship
        };

        if (reverseUselist !== undefined) {
          reverseRelationship.uselist = reverseUselist;
        }

        result.reverseRelationship = reverseRelationship;
        result.reverseTargetModelId = targetModel.id;
      }
    }

    onSave(result);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-purple-50 rounded-lg border border-purple-300 shadow-sm space-y-2">
      <div className="text-xs font-medium text-purple-800 mb-2">
        {relationship ? "Edit Relationship" : "Relationship Configuration"}
      </div>

      {fkReference && (
        <div className="mb-2 p-2 bg-purple-100 rounded">
          <p className="text-xs text-purple-700">
            <strong>Relationship Target:</strong> {currentTableName}.{fkColumn?.name} → {fkReference}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Property name: <strong>{name}</strong>
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Relationship Type</label>
        <select
          value={relationType}
          onChange={(e) => setRelationType(e.target.value as RelationType)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="one-to-one">One-to-One</option>
          <option value="one-to-many">One-to-Many (has many)</option>
          <option value="many-to-one">Many-to-One (belongs to)</option>
        </select>
        <p className="mt-0.5 text-xs text-gray-500">
          {relationType === "one-to-many" && `${currentModelName || "This model"} has many ${targetModelFromRel || "targets"}`}
          {relationType === "many-to-one" && `${currentModelName || "This model"} belongs to one ${targetModelFromRel || "target"}`}
          {relationType === "one-to-one" && `${currentModelName || "This model"} has one ${targetModelFromRel || "target"}`}
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <input
            type="checkbox"
            checked={enableBackPopulates}
            onChange={(e) => setEnableBackPopulates(e.target.checked)}
            className="rounded text-purple-600"
          />
          Bidirectional Relationship (Back-Populates)
        </label>
        {enableBackPopulates && backPopulates && (
          <p className="mt-1 text-xs text-purple-600">
            Will auto-create "<strong>{backPopulates}</strong>" relationship on {targetModelFromRel}
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