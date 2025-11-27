import { useState } from "react";
import { useNavigate } from "react-router";
import { useProjectStore } from "@/stores/projectStore";
import { useConfigStore } from "@/stores/configStore";
import ProjectConfigForm from "@/components/config/ProjectConfigForm";
import DatabaseConfigForm from "@/components/config/DatabaseConfigForm";
import SecurityConfigForm from "@/components/config/SecurityConfigForm";
import TokenConfigForm from "@/components/config/TokenConfigForm";
import GitConfigForm from "@/components/config/GitConfigForm";

type Tab = "project" | "database" | "security" | "token" | "git";

export default function ConfigPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("project");
  const { setWorkflowStep } = useProjectStore();
  const config = useConfigStore();

  const tabs: { id: Tab; label: string }[] = [
    { id: "project", label: "Project" },
    { id: "database", label: "Database" },
    { id: "security", label: "Security" },
    { id: "token", label: "Token" },
    { id: "git", label: "Git" },
  ];

  const handleContinue = () => {
    setWorkflowStep("schema-builder");
    navigate("/builder");
  };

  const isConfigValid = () => {
    // Project validation
    if (!config.project.title.trim()) return false;

    // Database validation
    if (!config.database.db_name.trim()) return false;
    if (config.database.db_provider !== "sqlite") {
      if (!config.database.db_host?.trim()) return false;
      if (!config.database.db_port) return false;
    }

    // Security validation
    if (!config.security.secret_key.trim()) return false;

    // Token validation
    if (config.token.access_token_expire_minutes <= 0) return false;
    if (config.token.refresh_token_expire_days <= 0) return false;

    return true;
  };

  return (
    <div className="h-full bg-secondary-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Project Configuration</h1>
          <p className="text-secondary-600">
            Configure your FastAPI project settings before designing your schema
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-secondary-200">
          <div className="border-b border-secondary-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
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
            {activeTab === "project" && <ProjectConfigForm />}
            {activeTab === "database" && <DatabaseConfigForm />}
            {activeTab === "security" && <SecurityConfigForm />}
            {activeTab === "token" && <TokenConfigForm />}
            {activeTab === "git" && <GitConfigForm />}
          </div>

          <div className="border-t border-secondary-200 p-6 bg-secondary-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/projects")}
                className="px-6 py-2.5 rounded-lg font-medium text-secondary-700 hover:bg-secondary-100 transition focus:outline-none focus:ring-2 focus:ring-secondary-300"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!isConfigValid()}
                className="px-6 py-2.5 rounded-lg font-medium bg-primary-500 hover:bg-primary-600 text-white shadow-primary-glow transition focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue to Schema Builder
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
