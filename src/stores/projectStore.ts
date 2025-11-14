import { create } from "zustand";
import type { SchemaProject } from "@/types/schema";

interface ProjectStore {
    currentProject: SchemaProject | null;
    isEditMode: boolean;
    workflowStep: "config" | "schema" | "complete";

    setCurrentProject: (project: SchemaProject | null) => void;
    setEditMode: (isEdit: boolean) => void;
    setWorkflowStep: (step: "config" | "schema" | "complete") => void;
    startNewProject: () => void;
    loadProject: (project: SchemaProject) => void;
    clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    currentProject: null,
    isEditMode: false,
    workflowStep: "config",

    setCurrentProject: (project) => set({ currentProject: project }),
    setEditMode: (isEdit) => set({ isEditMode: isEdit }),
    setWorkflowStep: (step) => set({ workflowStep: step }),

    startNewProject: () =>
        set({
            currentProject: null,
            isEditMode: false,
            workflowStep: "config",
        }),

    loadProject: (project) =>
        set({
            currentProject: project,
            isEditMode: true,
            workflowStep: "schema",
        }),

    clearProject: () =>
        set({
            currentProject: null,
            isEditMode: false,
            workflowStep: "config",
        }),
}));
