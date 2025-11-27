import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SchemaProject } from "@/types/schema";

export type WorkflowStep =
    | "project-config"
    | "database-config"
    | "security-config"
    | "token-config"
    | "git-config"
    | "schema-builder"
    | "code-generation"
    | "complete";

interface ProjectStore {
    currentProject: SchemaProject | null;
    isEditMode: boolean;
    workflowStep: WorkflowStep;

    setCurrentProject: (project: SchemaProject | null) => void;
    setEditMode: (isEdit: boolean) => void;
    setWorkflowStep: (step: WorkflowStep) => void;
    startNewProject: () => void;
    loadProject: (project: SchemaProject) => void;
    clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
    persist(
        (set) => ({
            currentProject: null,
            isEditMode: false,
            workflowStep: "project-config",

            setCurrentProject: (project) => set({ currentProject: project }),
            setEditMode: (isEdit) => set({ isEditMode: isEdit }),
            setWorkflowStep: (step) => set({ workflowStep: step }),

            startNewProject: () =>
                set({
                    currentProject: null,
                    isEditMode: false,
                    workflowStep: "project-config",
                }),

            loadProject: (project) =>
                set({
                    currentProject: project,
                    isEditMode: true,
                }),

            clearProject: () =>
                set({
                    currentProject: null,
                    isEditMode: false,
                    workflowStep: "project-config",
                }),
        }),
        {
            name: "project-store",
        }
    )
);
