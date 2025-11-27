import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  type ModelWithUI,
  type EnumWithUI,
  type Column,
  type Relationship,
  type AssociationTable,
  type EnumDefinition,
} from "@/types/fastapiSpec";

interface SchemaState {
  models: ModelWithUI[];
  enums: EnumWithUI[];
  associationTables: AssociationTable[];
  hasUnsavedChanges: boolean;

  addModel: (model: Omit<ModelWithUI, "id">) => string;
  updateModel: (id: string, updates: Partial<ModelWithUI>) => void;
  deleteModel: (id: string) => void;
  getModel: (id: string) => ModelWithUI | undefined;

  addColumn: (modelId: string, column: Column) => void;
  updateColumn: (modelId: string, columnName: string, updates: Partial<Column>) => void;
  deleteColumn: (modelId: string, columnName: string) => void;

  addRelationship: (modelId: string, relationship: Relationship) => void;
  updateRelationship: (modelId: string, relationshipName: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (modelId: string, relationshipName: string) => void;

  addEnum: (enumDef: EnumDefinition, position?: { x: number; y: number }) => string;
  updateEnum: (id: string, updates: Partial<EnumWithUI>) => void;
  deleteEnum: (id: string) => void;

  addAssociationTable: (table: AssociationTable) => void;
  updateAssociationTable: (name: string, updates: Partial<AssociationTable>) => void;
  deleteAssociationTable: (name: string) => void;

  updateModelPosition: (id: string, position: { x: number; y: number }) => void;
  updateEnumPosition: (id: string, position: { x: number; y: number }) => void;

  loadSchema: (models: ModelWithUI[], enums: EnumWithUI[], associationTables: AssociationTable[]) => void;
  clearAll: () => void;
  markAsSaved: () => void;
}

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set, get) => ({
      models: [],
      enums: [],
      associationTables: [],
      hasUnsavedChanges: false,

  addModel: (model) => {
    const id = nanoid();
    const newModel: ModelWithUI = {
      ...model,
      id,
      position: model.position || { x: 100, y: 100 },
    };
    set((state) => ({
      models: [...state.models, newModel],
      hasUnsavedChanges: true,
    }));
    return id;
  },

  updateModel: (id, updates) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteModel: (id) => {
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
      hasUnsavedChanges: true,
    }));
  },

  getModel: (id) => {
    return get().models.find((m) => m.id === id);
  },

  addColumn: (modelId, column) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, columns: [...m.columns, column] }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  updateColumn: (modelId, columnName, updates) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              columns: m.columns.map((c) =>
                c.name === columnName ? { ...c, ...updates } : c
              ),
            }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteColumn: (modelId, columnName) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              columns: m.columns.filter((c) => c.name !== columnName),
            }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  addRelationship: (modelId, relationship) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              relationships: [...(m.relationships || []), relationship],
            }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  updateRelationship: (modelId, relationshipName, updates) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              relationships: (m.relationships || []).map((r) =>
                r.name === relationshipName ? { ...r, ...updates } : r
              ),
            }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteRelationship: (modelId, relationshipName) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              relationships: (m.relationships || []).filter(
                (r) => r.name !== relationshipName
              ),
            }
          : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  addEnum: (enumDef, position) => {
    const id = nanoid();
    const newEnum: EnumWithUI = {
      ...enumDef,
      id,
      position: position || { x: 100, y: 100 },
    };
    set((state) => ({
      enums: [...state.enums, newEnum],
      hasUnsavedChanges: true,
    }));
    return id;
  },

  updateEnum: (id, updates) => {
    set((state) => ({
      enums: state.enums.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      hasUnsavedChanges: true,
    }));
  },

  deleteEnum: (id) => {
    set((state) => ({
      enums: state.enums.filter((e) => e.id !== id),
      hasUnsavedChanges: true,
    }));
  },

  addAssociationTable: (table) => {
    set((state) => ({
      associationTables: [...state.associationTables, table],
      hasUnsavedChanges: true,
    }));
  },

  updateAssociationTable: (name, updates) => {
    set((state) => ({
      associationTables: state.associationTables.map((t) =>
        t.name === name ? { ...t, ...updates } : t
      ),
      hasUnsavedChanges: true,
    }));
  },

  deleteAssociationTable: (name) => {
    set((state) => ({
      associationTables: state.associationTables.filter((t) => t.name !== name),
      hasUnsavedChanges: true,
    }));
  },

  updateModelPosition: (id, position) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
      hasUnsavedChanges: true,
    }));
  },

  updateEnumPosition: (id, position) => {
    set((state) => ({
      enums: state.enums.map((e) => (e.id === id ? { ...e, position } : e)),
      hasUnsavedChanges: true,
    }));
  },

  loadSchema: (models, enums, associationTables) => {
    set({
      models,
      enums,
      associationTables,
      hasUnsavedChanges: false,
    });
  },

  clearAll: () => {
    set({
      models: [],
      enums: [],
      associationTables: [],
      hasUnsavedChanges: true,
    });
  },

  markAsSaved: () => {
    set({ hasUnsavedChanges: false });
  },
}),
    {
      name: "schema-storage",
    }
  )
);
