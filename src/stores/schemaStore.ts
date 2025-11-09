import { create } from "zustand";
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

  clearAll: () => void;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  models: [],
  enums: [],
  associationTables: [],

  addModel: (model) => {
    const id = nanoid();
    const newModel: ModelWithUI = {
      ...model,
      id,
      position: model.position || { x: 100, y: 100 },
    };
    set((state) => ({
      models: [...state.models, newModel],
    }));
    return id;
  },

  updateModel: (id, updates) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  deleteModel: (id) => {
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
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
    }));
    return id;
  },

  updateEnum: (id, updates) => {
    set((state) => ({
      enums: state.enums.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteEnum: (id) => {
    set((state) => ({
      enums: state.enums.filter((e) => e.id !== id),
    }));
  },

  addAssociationTable: (table) => {
    set((state) => ({
      associationTables: [...state.associationTables, table],
    }));
  },

  updateAssociationTable: (name, updates) => {
    set((state) => ({
      associationTables: state.associationTables.map((t) =>
        t.name === name ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteAssociationTable: (name) => {
    set((state) => ({
      associationTables: state.associationTables.filter((t) => t.name !== name),
    }));
  },

  updateModelPosition: (id, position) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
    }));
  },

  updateEnumPosition: (id, position) => {
    set((state) => ({
      enums: state.enums.map((e) => (e.id === id ? { ...e, position } : e)),
    }));
  },

  clearAll: () => {
    set({
      models: [],
      enums: [],
      associationTables: [],
    });
  },
}));
