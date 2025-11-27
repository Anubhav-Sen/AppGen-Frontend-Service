import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore, type WorkflowStep } from "@/stores/projectStore";
import { useConfigStore } from "@/stores/configStore";
import { useSchemaStore } from "@/stores/schemaStore";
import { schemas } from "@/api/schemas";
import { getErrorMessage } from "@/lib/utils/error";
import { buildFastAPIProjectSpec } from "@/lib/serializers/specBuilder";
import ProjectConfigForm from "@/components/config/ProjectConfigForm";
import DatabaseConfigForm from "@/components/config/DatabaseConfigForm";
import SecurityConfigForm from "@/components/config/SecurityConfigForm";
import TokenConfigForm from "@/components/config/TokenConfigForm";
import GitConfigForm from "@/components/config/GitConfigForm";
import SchemaBuilder from "./SchemaBuilder";

const WORKFLOW_STEPS: { id: WorkflowStep; label: string; order: number }[] = [
  { id: "project-config", label: "Project Settings", order: 1 },
  { id: "database-config", label: "Database", order: 2 },
  { id: "security-config", label: "Security", order: 3 },
  { id: "token-config", label: "Token", order: 4 },
  { id: "git-config", label: "Git", order: 5 },
  { id: "schema-builder", label: "Schema Design", order: 6 },
  { id: "code-generation", label: "Generate Code", order: 7 },
];

export default function ProjectWorkflowPage() {
  const navigate = useNavigate();
  const { workflowStep, setWorkflowStep, currentProject, setCurrentProject, isEditMode } = useProjectStore();
  const config = useConfigStore();
  const { markAsSaved } = useSchemaStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === workflowStep);
  const currentStep = WORKFLOW_STEPS[currentStepIndex];

  const canGoNext = () => {
    switch (workflowStep) {
      case "project-config":
        return config.project.title.trim() !== "";
      case "database-config":
        if (config.database.db_provider === "sqlite") return config.database.db_name.trim() !== "";
        return (
          config.database.db_name.trim() !== "" &&
          config.database.db_host?.trim() !== "" &&
          config.database.db_port !== undefined
        );
      case "security-config":
        return config.security.secret_key.trim() !== "";
      case "token-config":
        return config.token.access_token_expire_minutes > 0 && config.token.refresh_token_expire_days > 0;
      case "git-config":
        return true;
      case "schema-builder":
        return true;
      case "code-generation":
        return false;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Auto-save when moving between steps
    await handleSaveProgress();

    if (currentStepIndex < WORKFLOW_STEPS.length - 1) {
      setWorkflowStep(WORKFLOW_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setWorkflowStep(WORKFLOW_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleSaveProgress = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const spec = buildFastAPIProjectSpec();
      const projectName = config.project.title || "Untitled Project";
      const projectDescription = config.project.description || undefined;

      if (isEditMode && currentProject) {
        const updated = await schemas.update(currentProject.id, {
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
        setCurrentProject(updated);
      } else {
        const created = await schemas.create({
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
        setCurrentProject(created);
      }

      markAsSaved();
    } catch (error) {
      setSaveError(getErrorMessage(error, "Failed to save progress"));
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSaveProgress();
      navigate("/projects");
    } catch (error) {
      // Error already handled in handleSaveProgress
    }
  };

  const handleFinish = async () => {
    try {
      await handleSaveProgress();
      setWorkflowStep("complete");
      navigate(`/project?projectId=${currentProject?.id}`);
    } catch (error) {
      // Error already handled in handleSaveProgress
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-secondary-200 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
              title="Back to projects"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h1>
              <p className="text-sm text-secondary-600">
                Step {currentStep.order} of {WORKFLOW_STEPS.length}: {currentStep.label}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setWorkflowStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                    index === currentStepIndex
                      ? "text-primary-600"
                      : index < currentStepIndex
                      ? "text-green-600 hover:text-green-700"
                      : "text-secondary-400 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      index === currentStepIndex
                        ? "bg-primary-500 text-white"
                        : index < currentStepIndex
                        ? "bg-green-500 text-white"
                        : "bg-secondary-200 text-secondary-400"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.order
                    )}
                  </div>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      index < currentStepIndex ? "bg-green-500" : "bg-secondary-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto">
        {workflowStep === "schema-builder" ? (
          <div className="h-full">
            <SchemaBuilder />
          </div>
        ) : workflowStep === "code-generation" ? (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Generate Your FastAPI Project
              </h2>

              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Code Generation Coming Soon</h3>
                <p className="text-secondary-600 max-w-md mx-auto mb-8">
                  This feature will generate a complete, production-ready FastAPI project based on your schema and configuration. For now, you can export your schema as JSON and use it with our code generation API.
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleFinish}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium shadow-primary-glow"
                  >
                    Finish & View Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 px-4">
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {saveError}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
              {workflowStep === "project-config" && <ProjectConfigForm />}
              {workflowStep === "database-config" && <DatabaseConfigForm />}
              {workflowStep === "security-config" && <SecurityConfigForm />}
              {workflowStep === "token-config" && <TokenConfigForm />}
              {workflowStep === "git-config" && <GitConfigForm />}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {workflowStep !== "schema-builder" && (
        <div className="bg-white border-t border-secondary-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2.5 rounded-lg font-medium text-secondary-700 hover:bg-secondary-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg font-medium text-secondary-700 hover:bg-secondary-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save & Exit"}
            </button>

            <button
              onClick={workflowStep === "code-generation" ? handleFinish : handleNext}
              disabled={!canGoNext() || isSaving}
              className="px-6 py-2.5 rounded-lg font-medium bg-primary-500 hover:bg-primary-600 text-white shadow-primary-glow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {workflowStep === "code-generation" ? "Finish" : "Next"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}