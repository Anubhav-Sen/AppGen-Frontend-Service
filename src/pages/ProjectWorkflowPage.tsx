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

      if (currentProject) {
        // Update existing project (whether in edit mode or after first creation)
        const updated = await schemas.update(currentProject.id, {
          name: projectName,
          description: projectDescription,
          schema_data: spec as unknown as Record<string, unknown>,
        });
        setCurrentProject(updated);
      } else {
        // Create new project only if no current project exists
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
            <SchemaBuilder
              isWorkflowMode={true}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        ) : workflowStep === "code-generation" ? (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Generate Your FastAPI Project
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Ready to Generate</h3>
                  <p className="text-sm text-blue-700">
                    Your project configuration and schema are complete. Click the button below to generate your FastAPI project code.
                  </p>
                </div>

                <div className="border-t border-secondary-200 pt-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">What will be generated?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-secondary-900">SQLAlchemy Models</div>
                        <div className="text-sm text-secondary-600">Database models with relationships and constraints</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-secondary-900">Pydantic Schemas</div>
                        <div className="text-sm text-secondary-600">Request/response validation schemas</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-secondary-900">API Routes & CRUD Operations</div>
                        <div className="text-sm text-secondary-600">RESTful endpoints for all models</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-secondary-900">Authentication & Security</div>
                        <div className="text-sm text-secondary-600">JWT tokens, password hashing, and protected routes</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-secondary-900">Database Migrations</div>
                        <div className="text-sm text-secondary-600">Alembic configuration and initial migration</div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-secondary-200 pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <strong>Note:</strong> Code generation is currently in development. This button will trigger the generation API in the future.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        alert("Code generation API will be integrated here. For now, you can export your schema as JSON from the Schema Builder.");
                      }}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Generate Project Code
                    </button>
                    <button
                      onClick={handleFinish}
                      className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium shadow-primary-glow"
                    >
                      Skip & Finish
                    </button>
                  </div>
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