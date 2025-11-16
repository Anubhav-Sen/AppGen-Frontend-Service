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
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-xl border border-secondary-300 space-y-1.5 w-52">
        <h2 className="text-sm font-semibold mb-2 text-secondary-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Schema Builder
        </h2>

        {saveError && <Alert type="error">{saveError}</Alert>}
        {saveSuccess && <Alert type="success">{saveSuccess}</Alert>}

        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <button
              onClick={handleAddModel}
              className="flex-1 px-2 py-1.5 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-1"
              title="Add a new model"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Model
            </button>

            <button
              onClick={handleAddEnum}
              className="flex-1 px-2 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors font-medium flex items-center justify-center gap-1"
              title="Add a new enum"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Enum
            </button>
          </div>

          <div className="border-t border-secondary-200 pt-1.5 mt-1.5 space-y-1">
            <button
              onClick={() => navigate("/config")}
              className="w-full px-2 py-1.5 bg-secondary-100 text-secondary-700 rounded text-xs hover:bg-secondary-200 transition-colors font-medium flex items-center gap-2"
              title="Edit project configuration"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuration
            </button>

            <div className="flex gap-1">
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 px-2 py-1.5 bg-secondary-100 text-secondary-700 rounded text-xs hover:bg-secondary-200 transition-colors font-medium flex items-center justify-center gap-1"
                title="Preview JSON output"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>

              <button
                onClick={handleExportJSON}
                className="flex-1 px-2 py-1.5 bg-secondary-100 text-secondary-700 rounded text-xs hover:bg-secondary-200 transition-colors font-medium flex items-center justify-center gap-1"
                title="Export as JSON file"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>

          <div className="border-t border-secondary-200 pt-1.5 mt-1.5 space-y-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-2 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Save project"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving ? "Saving..." : isEditMode ? "Save" : "Save Project"}
            </button>

            <button
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="w-full px-2 py-1.5 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Save and return to projects"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSaving ? "Saving..." : "Save & Exit"}
            </button>
          </div>

          <div className="border-t border-secondary-200 pt-1.5 mt-1.5">
            <button
              onClick={handleClearAll}
              className="w-full px-2 py-1.5 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-1"
              title="Clear all models and enums"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <JsonPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </>
  );
}
