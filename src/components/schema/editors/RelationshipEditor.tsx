import { useState, useEffect } from "react";
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
  const [name, setName] = useState(relationship?.name || "");
  const [target, setTarget] = useState(relationship?.target || "");
  const [backPopulates, setBackPopulates] = useState(relationship?.back_populates || "");
  const [relationType, setRelationType] = useState<RelationType>(
    relationship?.uselist === false ? "many-to-one" : relationship?.uselist === true ? "one-to-many" : "one-to-one"
  );
  const [cascade, setCascade] = useState<CascadeOption[]>(relationship?.cascade || []);
  const [createForeignKey, setCreateForeignKey] = useState(!relationship); // Only auto-create FK for new relationships

  // Auto-generate relationship name based on target and type
  useEffect(() => {
    if (target && !relationship) {
      const targetLower = target.toLowerCase();
      if (relationType === "one-to-many") {
        setName(targetLower + "s");
      } else {
        setName(targetLower);
      }
    }
  }, [target, relationType, relationship]);

  const handleCascadeToggle = (option: CascadeOption) => {
    setCascade((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetModel = models.find((m) => m.name === target);
    const newRelationship: Relationship = {
      name,
      target,
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

    // Auto-create reverse relationship if back_populates is set and this is a new relationship
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

    // Auto-create FK column if enabled and this is a new relationship
    if (createForeignKey && targetModel && !relationship) {
      // Find the primary key of the referenced model
      const getPrimaryKeyColumn = (model: ModelWithUI) =>
        model.columns.find((c) => c.primary_key);

      if (relationType === "many-to-one" || relationType === "one-to-one") {
        // FK goes on current model, references target's PK
        const targetPK = getPrimaryKeyColumn(targetModel);
        if (targetPK) {
          result.fkColumn = {
            name: `${target.toLowerCase()}_id`,
            type: { name: targetPK.type.name },
            foreign_key: `${targetModel.tablename}.${targetPK.name}`,
            nullable: true,
          };
          result.fkTargetModelId = currentModelId;
        }
      } else if (relationType === "one-to-many" && currentTableName) {
        // FK goes on target model, references current model's PK
        const currentModel = models.find((m) => m.id === currentModelId);
        const currentPK = currentModel ? getPrimaryKeyColumn(currentModel) : undefined;
        if (currentPK) {
          result.fkColumn = {
            name: `${currentModelName?.toLowerCase()}_id`,
            type: { name: currentPK.type.name },
            foreign_key: `${currentTableName}.${currentPK.name}`,
            nullable: true,
          };
          result.fkTargetModelId = targetModel.id;
        }
      }
    }

    onSave(result);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-purple-50 rounded-lg border border-purple-300 shadow-sm space-y-2">
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
          {relationType === "one-to-many" && `${currentModelName || "This model"} has many ${target || "targets"}`}
          {relationType === "many-to-one" && `${currentModelName || "This model"} belongs to one ${target || "target"}`}
          {relationType === "one-to-one" && `${currentModelName || "This model"} has one ${target || "target"}`}
        </p>
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
        <label className="block text-xs font-medium text-gray-700 mb-1">Property Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={relationType === "one-to-many" ? "e.g., posts" : "e.g., author"}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <p className="mt-0.5 text-xs text-gray-500">Name used to access related object(s)</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Back Populates (optional)</label>
        <input
          type="text"
          value={backPopulates}
          onChange={(e) => setBackPopulates(e.target.value)}
          placeholder="Property name on target model"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <p className="mt-0.5 text-xs text-gray-500">
          {backPopulates && target && !relationship
            ? `Will auto-create "${backPopulates}" relationship on ${target}`
            : "Creates bidirectional relationship on target model"}
        </p>
      </div>

      {!relationship && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-300 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-medium text-blue-800">
            <input
              type="checkbox"
              checked={createForeignKey}
              onChange={(e) => setCreateForeignKey(e.target.checked)}
              className="rounded text-blue-600"
            />
            Auto-create foreign key column
          </label>
          {createForeignKey && target && (
            <p className="mt-1 text-xs text-blue-600">
              {relationType === "one-to-many"
                ? `Will add "${currentModelName?.toLowerCase()}_id" column to ${target}`
                : `Will add "${target.toLowerCase()}_id" column to ${currentModelName}`}
            </p>
          )}
        </div>
      )}

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
