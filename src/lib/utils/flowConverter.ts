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

// Determine best handles based on relative positions
function getBestHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number }
): { sourceHandle: string; targetHandle: string } {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal relationship
    if (dx > 0) {
      return { sourceHandle: "right", targetHandle: "left" };
    } else {
      return { sourceHandle: "left", targetHandle: "right" };
    }
  } else {
    // Vertical relationship
    if (dy > 0) {
      return { sourceHandle: "bottom", targetHandle: "top" };
    } else {
      return { sourceHandle: "top", targetHandle: "bottom" };
    }
  }
}

export function relationshipsToEdges(models: ModelWithUI[], enums: EnumWithUI[]): SchemaEdge[] {
  const edges: SchemaEdge[] = [];

  models.forEach((model) => {
    // Add relationship edges
    model.relationships?.forEach((rel) => {
      const targetModel = models.find((m) => m.name === rel.target);
      if (targetModel) {
        const sourcePos = model.position || { x: 0, y: 0 };
        const targetPos = targetModel.position || { x: 0, y: 0 };
        const { sourceHandle, targetHandle } = getBestHandles(sourcePos, targetPos);

        edges.push({
          id: `${model.id}-${rel.name}-${targetModel.id}`,
          source: model.id,
          target: targetModel.id,
          sourceHandle,
          targetHandle,
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

    // Add enum relationship edges
    model.columns.forEach((column) => {
      if (column.type.enum_class) {
        const targetEnum = enums.find((e) => e.name === column.type.enum_class);
        if (targetEnum) {
          const sourcePos = model.position || { x: 0, y: 0 };
          const targetPos = targetEnum.position || { x: 0, y: 0 };
          const { sourceHandle, targetHandle } = getBestHandles(sourcePos, targetPos);

          edges.push({
            id: `${model.id}-${column.name}-enum-${targetEnum.id}`,
            source: model.id,
            target: targetEnum.id,
            sourceHandle,
            targetHandle,
            type: "smoothstep",
            style: { stroke: "#a855f7", strokeWidth: 2, strokeDasharray: "5,5" },
            data: {
              relationshipName: column.name,
              sourceModel: model.name,
              targetModel: targetEnum.name,
            },
          });
        }
      }
    });
  });

  return edges;
}
