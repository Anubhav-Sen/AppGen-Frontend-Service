import type { SchemaNode, SchemaEdge, ModelNodeData, EnumNodeData } from "@/types/reactFlow";
import type { ModelWithUI, EnumWithUI } from "@/types/fastapiSpec";

export function modelsToNodes(models: ModelWithUI[]): SchemaNode[] {
  return models.map((model) => ({
    id: model.id,
    type: "model" as const,
    position: model.position || { x: 100, y: 100 },
    data: {
      modelId: model.id,
      model,
    } as ModelNodeData,
  }));
}

export function enumsToNodes(enums: EnumWithUI[]): SchemaNode[] {
  return enums.map((enumDef) => ({
    id: enumDef.id,
    type: "enum" as const,
    position: enumDef.position || { x: 100, y: 100 },
    data: {
      enumId: enumDef.id,
      enum: enumDef,
    } as EnumNodeData,
  }));
}

export function relationshipsToEdges(models: ModelWithUI[]): SchemaEdge[] {
  const edges: SchemaEdge[] = [];

  models.forEach((model) => {
    model.relationships?.forEach((rel) => {
      const targetModel = models.find((m) => m.name === rel.target);
      if (targetModel) {
        edges.push({
          id: `${model.id}-${rel.name}-${targetModel.id}`,
          source: model.id,
          target: targetModel.id,
          type: "smoothstep",
          style: { stroke: "#6366f1", strokeWidth: 2 },
          data: {
            relationshipName: rel.name,
            sourceModel: model.name,
            targetModel: targetModel.name,
          },
        });
      }
    });
  });

  return edges;
}
