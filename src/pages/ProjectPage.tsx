import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProjectStore, type WorkflowStep } from "@/stores/projectStore";
import { useConfigStore } from "@/stores/configStore";
import { schemas } from "@/api/schemas";
import { nanoid } from "nanoid";
import type { FastAPIProjectSpec, ModelWithUI, EnumWithUI } from "@/types/fastapiSpec";
import { useSchemaStore } from "@/stores/schemaStore";
import ProjectConfigForm from "@/components/config/ProjectConfigForm";
import DatabaseConfigForm from "@/components/config/DatabaseConfigForm";
import SecurityConfigForm from "@/components/config/SecurityConfigForm";
import TokenConfigForm from "@/components/config/TokenConfigForm";
import GitConfigForm from "@/components/config/GitConfigForm";
import SchemaBuilder from "./SchemaBuilder";

type Tab = "overview" | "config" | "schema" | "generate";
type ConfigTab = "project" | "database" | "security" | "token" | "git";

const WORKFLOW_LABELS: Record<WorkflowStep, string> = {
  "project-config": "Project Settings",
  "database-config": "Database Configuration",
  "security-config": "Security Configuration",
  "token-config": "Token Configuration",
  "git-config": "Git Configuration",
  "schema-builder": "Schema Design",
  "code-generation": "Code Generation",
  "complete": "Complete",
};

export default function ProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeConfigTab, setActiveConfigTab] = useState<ConfigTab>("project");
  const [isLoading, setIsLoading] = useState(false);

  const { currentProject, loadProject, workflowStep } = useProjectStore();
  const { loadConfig } = useConfigStore();
  const { loadSchema } = useSchemaStore();

  const handleContinueWorkflow = () => {
    navigate("/project/new");
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "config", label: "Configuration", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { id: "schema", label: "Schema Builder", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
    { id: "generate", label: "Code Generation", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  ];

  const configTabs: { id: ConfigTab; label: string }[] = [
    { id: "project", label: "Project" },
    { id: "database", label: "Database" },
    { id: "security", label: "Security" },
    { id: "token", label: "Token" },
    { id: "git", label: "Git" },
  ];

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setIsLoading(true);
      schemas.getById(Number(projectId))
        .then((project) => {
          loadProject(project);

          const spec = project.schema_data as unknown as FastAPIProjectSpec & {
            _ui_metadata?: {
              models: Array<{ name: string; position: { x: number; y: number } }>;
              enums: Array<{ name: string; position: { x: number; y: number } }>;
            };
          };

          if (spec) {
            if (spec.project) {
              loadConfig(spec.project, spec.git, spec.database, spec.security, spec.token);
            }

            if (spec.schema) {
              const uiMetadata = spec._ui_metadata;

              const modelsWithUI: ModelWithUI[] = spec.schema.models.map((model) => {
                const savedPosition = uiMetadata?.models.find((m) => m.name === model.name)?.position;
                return {
                  ...model,
                  id: nanoid(),
                  position: savedPosition || { x: 100, y: 100 },
                };
              });

              const enumsWithUI: EnumWithUI[] = (spec.schema.enums || []).map((enumDef) => {
                const savedPosition = uiMetadata?.enums.find((e) => e.name === enumDef.name)?.position;
                return {
                  ...enumDef,
                  id: nanoid(),
                  position: savedPosition || { x: 100, y: 100 },
                };
              });

              loadSchema(modelsWithUI, enumsWithUI, spec.schema.association_tables || []);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load project:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams, loadProject, loadConfig, loadSchema]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="text-lg text-secondary-700 mb-2">Loading project...</div>
          <div className="text-sm text-secondary-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-secondary-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
              title="Back to projects"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <nav className="flex -mb-px flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Project Overview</h2>

              {currentProject ? (
                <div className="space-y-6">
                  {/* Project Progress */}
                  {workflowStep !== "complete" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-blue-900">Project Setup In Progress</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Current Step: {WORKFLOW_LABELS[workflowStep]}
                          </p>
                        </div>
                        <button
                          onClick={handleContinueWorkflow}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Continue Setup
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-blue-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((Object.keys(WORKFLOW_LABELS).indexOf(workflowStep) / (Object.keys(WORKFLOW_LABELS).length - 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{
                              width: `${(Object.keys(WORKFLOW_LABELS).indexOf(workflowStep) / (Object.keys(WORKFLOW_LABELS).length - 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {workflowStep === "complete" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-sm font-semibold text-green-900">Project Setup Complete</h3>
                          <p className="text-sm text-green-700">All configuration steps have been completed.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Project Name</label>
                    <div className="text-lg text-secondary-900">{currentProject.name}</div>
                  </div>

                  {currentProject.description && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                      <div className="text-secondary-900">{currentProject.description}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Created</label>
                    <div className="text-secondary-900">
                      {new Date(currentProject.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {currentProject.updated_at && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Last Updated</label>
                      <div className="text-secondary-900">
                        {new Date(currentProject.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <p>No project loaded. Please select a project from the projects list.</p>
                  <button
                    onClick={() => navigate("/projects")}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                  >
                    Go to Projects
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Project Configuration</h2>
              <p className="text-secondary-600">
                Configure your FastAPI project settings
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-secondary-200">
              <div className="border-b border-secondary-200">
                <nav className="flex -mb-px">
                  {configTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveConfigTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeConfigTab === tab.id
                          ? "border-primary-500 text-primary-600"
                          : "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeConfigTab === "project" && <ProjectConfigForm />}
                {activeConfigTab === "database" && <DatabaseConfigForm />}
                {activeConfigTab === "security" && <SecurityConfigForm />}
                {activeConfigTab === "token" && <TokenConfigForm />}
                {activeConfigTab === "git" && <GitConfigForm />}
              </div>
            </div>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="h-full">
            <SchemaBuilder />
          </div>
        )}

        {activeTab === "generate" && (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code Generation
              </h2>

              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Coming Soon</h3>
                <p className="text-secondary-600 max-w-md mx-auto">
                  Code generation functionality will be available soon. This feature will allow you to generate a complete FastAPI project based on your schema and configuration.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}