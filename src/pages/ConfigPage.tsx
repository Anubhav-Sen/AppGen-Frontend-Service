import { useState } from "react";
import ProjectConfigForm from "@/components/config/ProjectConfigForm";
import DatabaseConfigForm from "@/components/config/DatabaseConfigForm";
import SecurityConfigForm from "@/components/config/SecurityConfigForm";
import TokenConfigForm from "@/components/config/TokenConfigForm";
import GitConfigForm from "@/components/config/GitConfigForm";

type Tab = "project" | "database" | "security" | "token" | "git";

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>("project");

  const tabs: { id: Tab; label: string }[] = [
    { id: "project", label: "Project" },
    { id: "database", label: "Database" },
    { id: "security", label: "Security" },
    { id: "token", label: "Token" },
    { id: "git", label: "Git" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuration</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
        </div>
      </div>
    </div>
  );
}
