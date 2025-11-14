import React from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { schemas } from "@/api/schemas";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/utils/error";
import type { SchemaProject } from "@/types/schema";

const ProjectsListPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["schemas"],
        queryFn: schemas.getAll,
    });

    const handleCreateNew = () => {
        navigate("/config");
    };

    const handleProjectClick = (project: SchemaProject) => {
        navigate(`/builder?projectId=${project.id}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                            Your Projects
                        </h1>
                        <p className="text-secondary-600">
                            Create and manage your FastAPI backend projects
                        </p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-primary-glow transition focus:outline-none focus:ring-2 focus:ring-primary-500/50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Project
                    </button>
                </div>

                {error && (
                    <Alert type="error">
                        {getErrorMessage(error, "Failed to load projects")}
                    </Alert>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-secondary-600">Loading projects...</div>
                    </div>
                )}

                {!isLoading && !error && projects && projects.length === 0 && (
                    <div className="bg-white rounded-lg border-2 border-dashed border-secondary-300 p-12 text-center">
                        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            No projects yet
                        </h3>
                        <p className="text-secondary-600 mb-6">
                            Get started by creating your first FastAPI backend project
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-primary-glow transition focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                            Create Your First Project
                        </button>
                    </div>
                )}

                {!isLoading && !error && projects && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => handleProjectClick(project)}
                                className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition text-left group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition">
                                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition">
                                    {project.name}
                                </h3>
                                {project.description && (
                                    <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-secondary-500 pt-4 border-t border-secondary-100">
                                    <span>Created {formatDate(project.created_at)}</span>
                                    {project.updated_at && (
                                        <span>Updated {formatDate(project.updated_at)}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsListPage;
