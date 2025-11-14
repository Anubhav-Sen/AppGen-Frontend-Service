import { useState } from "react";
import { useNavigate } from "react-router";
import { useSchemaStore } from "@/stores/schemaStore";
import { useProjectStore } from "@/stores/projectStore";
import { useConfigStore } from "@/stores/configStore";
import { ColumnTypeName } from "@/types/fastapiSpec";
import { buildFastAPIProjectSpec } from "@/lib/serializers/specBuilder";
import { schemas } from "@/api/schemas";
import { getErrorMessage } from "@/lib/utils/error";
import { Alert } from "@/components/ui/Alert";
import JsonPreviewModal from "./JsonPreviewModal";

export default function SchemaToolbar() {
  const navigate = useNavigate();
  const addModel = useSchemaStore((state) => state.addModel);
  const addEnum = useSchemaStore((state) => state.addEnum);
  const clearAll = useSchemaStore((state) => state.clearAll);
  const models = useSchemaStore((state) => state.models);
  const { currentProject, isEditMode, setCurrentProject } = useProjectStore();
  const configStore = useConfigStore();
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleAddModel = () => {
    const modelCount = models.length;
    addModel({
      name: `Model${modelCount + 1}`,
      tablename: `model_${modelCount + 1}`,
      columns: [
        {
          name: "id",
          type: { name: ColumnTypeName.INTEGER },
          primary_key: true,
          autoincrement: true,
        },
      ],
      position: { x: 100 + modelCount * 50, y: 100 + modelCount * 50 },
    });
  };

  const handleAddEnum = () => {
    const enumCount = useSchemaStore.getState().enums.length;
    addEnum(
      {
        name: `EnumType${enumCount + 1}`,
        values: ["value1", "value2"],
      },
      { x: 400 + enumCount * 50, y: 100 + enumCount * 50 }
    );
  };

  const handleExportJSON = () => {
    const spec = buildFastAPIProjectSpec();
    const json = JSON.stringify(spec, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fastapi-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all models and enums?")) {
      clearAll();
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      const spec = buildFastAPIProjectSpec();
      const projectName = configStore.project.title || "Untitled Project";
      const projectDescription = configStore.project.description || undefined;

      if (isEditMode && currentProject) {
        const updated = await schemas.update(currentProject.id, {
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
        setCurrentProject(updated);
        setSaveSuccess("Project saved successfully!");
      } else {
        const created = await schemas.create({
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
        setCurrentProject(created);
        setSaveSuccess("Project created successfully!");
      }

      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveError(getErrorMessage(error, "Failed to save project"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      const spec = buildFastAPIProjectSpec();
      const projectName = configStore.project.title || "Untitled Project";
      const projectDescription = configStore.project.description || undefined;

      if (isEditMode && currentProject) {
        await schemas.update(currentProject.id, {
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
      } else {
        await schemas.create({
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
      }

      navigate("/projects");
    } catch (error) {
      setSaveError(getErrorMessage(error, "Failed to save project"));
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg border border-secondary-200 space-y-2 max-w-xs">
        <h2 className="text-lg font-semibold mb-3 text-secondary-900">Schema Builder</h2>

        {saveError && <Alert type="error">{saveError}</Alert>}
        {saveSuccess && <Alert type="success">{saveSuccess}</Alert>}

        <div className="space-y-2">
          <button
            onClick={handleAddModel}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-sm"
          >
            + Add Model
          </button>

          <button
            onClick={handleAddEnum}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium shadow-sm"
          >
            + Add Enum
          </button>

          <div className="border-t border-secondary-200 pt-2 mt-2">
            <button
              onClick={() => navigate("/config")}
              className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
            >
              Edit Configuration
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium mt-2"
            >
              Preview JSON
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium mt-2"
            >
              Export JSON
            </button>
          </div>

          <div className="border-t border-secondary-200 pt-2 mt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Save Project"}
            </button>

            <button
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save & Go to Projects"}
            </button>
          </div>

          <div className="border-t border-secondary-200 pt-2 mt-2">
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <JsonPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </>
  );
}
