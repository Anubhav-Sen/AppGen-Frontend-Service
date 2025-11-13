import type { Node, Edge } from "@xyflow/react";
import type { ModelWithUI, EnumWithUI } from "./fastapiSpec";

export type SchemaNodeType = "model" | "enum";

export interface ModelNodeData {
  modelId: string;
  model: ModelWithUI;
}

export interface EnumNodeData {
  enumId: string;
  enum: EnumWithUI;
}

export type SchemaNodeData = ModelNodeData | EnumNodeData;

export type SchemaNode = Node<SchemaNodeData, SchemaNodeType>;

export interface RelationshipEdgeData {
  relationshipName: string;
  sourceModel: string;
  targetModel: string;
}

export type SchemaEdge = Edge<RelationshipEdgeData>;
