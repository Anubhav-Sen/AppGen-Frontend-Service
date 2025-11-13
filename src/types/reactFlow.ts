import type { Node, Edge } from "@xyflow/react";
import type { ModelWithUI, EnumWithUI } from "./fastapiSpec";

export type SchemaNodeType = "model" | "enum";

export interface ModelNodeData extends Record<string, unknown> {
  modelId: string;
  model: ModelWithUI;
}

export interface EnumNodeData extends Record<string, unknown> {
  enumId: string;
  enum: EnumWithUI;
}

export type SchemaNodeData = ModelNodeData | EnumNodeData;

export type SchemaNode = Node<SchemaNodeData, SchemaNodeType>;

export interface RelationshipEdgeData extends Record<string, unknown> {
  relationshipName: string;
  sourceModel: string;
  targetModel: string;
}

export type SchemaEdge = Edge<RelationshipEdgeData>;
