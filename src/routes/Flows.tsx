import "reactflow/dist/style.css";

import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";

const nodes: Node[] = [{ id: "1", position: { x: 0, y: 0 }, data: { label: "Hello" } }];
const edges: Edge[] = [];

export default function Flows() {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
