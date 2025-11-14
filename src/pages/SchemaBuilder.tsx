import { useCallback, useMemo, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSchemaStore } from "@/stores/schemaStore";
import { useProjectStore } from "@/stores/projectStore";
import { schemas } from "@/api/schemas";
import ModelNode from "@/components/schema/nodes/ModelNode";
import EnumNode from "@/components/schema/nodes/EnumNode";
import { modelsToNodes, enumsToNodes, relationshipsToEdges } from "@/lib/utils/flowConverter";
import SchemaToolbar from "@/components/schema/SchemaToolbar";
import ModelEditor from "@/components/schema/editors/ModelEditor";
import EnumEditor from "@/components/schema/editors/EnumEditor";

const nodeTypes = {
  model: ModelNode,
  enum: EnumNode,
} as NodeTypes;

export default function SchemaBuilder() {
  const [searchParams] = useSearchParams();
  const models = useSchemaStore((state) => state.models);
  const enums = useSchemaStore((state) => state.enums);
  const updateModelPosition = useSchemaStore((state) => state.updateModelPosition);
  const updateEnumPosition = useSchemaStore((state) => state.updateEnumPosition);
  const { loadProject } = useProjectStore();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setIsLoading(true);
      schemas.getById(Number(projectId))
        .then((project) => {
          loadProject(project);
        })
        .catch((error) => {
          console.error("Failed to load project:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchParams, loadProject]);

  const initialNodes = useMemo(() => {
    return [...modelsToNodes(models), ...enumsToNodes(enums)];
  }, [models, enums]);

  const initialEdges = useMemo(() => {
    return relationshipsToEdges(models);
  }, [models]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes as any);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges as any);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: any) => {
      if (node.type === "model") {
        updateModelPosition(node.id, node.position);
      } else if (node.type === "enum") {
        updateEnumPosition(node.id, node.position);
      }
    },
    [updateModelPosition, updateEnumPosition]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="text-lg text-secondary-700 mb-2">Loading project...</div>
          <div className="text-sm text-secondary-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative flex">
      <div className="flex-1 relative">
        <SchemaToolbar />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {selectedNode && selectedNode.type === "model" && (
        <ModelEditor
          modelId={selectedNode.id}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {selectedNode && selectedNode.type === "enum" && (
        <EnumEditor
          enumId={selectedNode.id}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
