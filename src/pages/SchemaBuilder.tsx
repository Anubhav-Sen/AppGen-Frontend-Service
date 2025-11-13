import { useCallback, useMemo, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSchemaStore } from "@/stores/schemaStore";
import ModelNode from "@/components/schema/nodes/ModelNode";
import EnumNode from "@/components/schema/nodes/EnumNode";
import { modelsToNodes, enumsToNodes, relationshipsToEdges } from "@/lib/utils/flowConverter";
import { loadSampleData } from "@/lib/utils/sampleData";

const nodeTypes = {
  model: ModelNode,
  enum: EnumNode,
} as NodeTypes;

export default function SchemaBuilder() {
  const models = useSchemaStore((state) => state.models);
  const enums = useSchemaStore((state) => state.enums);
  const updateModelPosition = useSchemaStore((state) => state.updateModelPosition);
  const updateEnumPosition = useSchemaStore((state) => state.updateEnumPosition);

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

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Schema Builder</h2>
        <button
          onClick={loadSampleData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Sample Data
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
