import type { FastAPIProjectSpec, Model, Schema } from "@/types/fastapiSpec";
import { useSchemaStore } from "@/stores/schemaStore";
import { useConfigStore } from "@/stores/configStore";

export function buildFastAPIProjectSpec(): FastAPIProjectSpec & {
  _ui_metadata?: {
    models: Array<{ name: string; position: { x: number; y: number } }>;
    enums: Array<{ name: string; position: { x: number; y: number } }>;
  };
} {
  const schemaState = useSchemaStore.getState();
  const configState = useConfigStore.getState();

  const models: Model[] = schemaState.models.map((modelWithUI) => {
    const { id, position, ...model } = modelWithUI;
    return model;
  });

  const schema: Schema = {
    models,
  };

  if (schemaState.enums.length > 0) {
    schema.enums = schemaState.enums.map(({ id, position, ...enumDef }) => enumDef);
  }

  if (schemaState.associationTables.length > 0) {
    schema.association_tables = schemaState.associationTables;
  }

  return {
    project: configState.project,
    git: configState.git,
    database: configState.database,
    security: configState.security,
    token: configState.token,
    schema,
    _ui_metadata: {
      models: schemaState.models.map((m) => ({
        name: m.name,
        position: m.position || { x: 100, y: 100 },
      })),
      enums: schemaState.enums.map((e) => ({
        name: e.name,
        position: e.position || { x: 100, y: 100 },
      })),
    },
  };
}

export function getUIMetadata() {
  const schemaState = useSchemaStore.getState();

  return {
    models: schemaState.models.map((m) => ({
      id: m.id,
      position: m.position || { x: 0, y: 0 },
    })),
    enums: schemaState.enums.map((e) => ({
      id: e.id,
      position: e.position || { x: 0, y: 0 },
    })),
  };
}
