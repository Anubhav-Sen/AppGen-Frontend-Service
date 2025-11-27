import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { EnumNodeData } from "@/types/reactFlow";

function EnumNode({ data, selected }: NodeProps) {
  const enumDef = (data as EnumNodeData).enum;

  return (
    <div
      className={`bg-white border-2 rounded-lg min-w-[180px] overflow-hidden transition-shadow ${
        selected ? "border-purple-500 shadow-lg shadow-purple-100" : "border-secondary-300 shadow-md hover:shadow-lg"
      }`}
    >
      {/* Multiple handles on each side for cleaner edge routing */}
      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 !bg-purple-400" />
      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-purple-400" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-purple-400" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-purple-400" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-purple-400" />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-purple-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-purple-400" />
      <Handle type="target" position={Position.Right} id="right" className="w-2 h-2 !bg-purple-400" />

      <div className="bg-purple-50 px-4 py-2 border-b border-secondary-200">
        <div className="font-semibold text-secondary-800 flex items-center gap-2">
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
            ENUM
          </span>
          {enumDef.name}
        </div>
      </div>

      <div className="px-4 py-2">
        {enumDef.values.length === 0 ? (
          <div className="text-xs text-gray-400 italic">No values</div>
        ) : (
          <div className="space-y-1">
            {enumDef.values.slice(0, 5).map((value: string) => (
              <div key={value} className="text-sm text-gray-700">
                • {value}
              </div>
            ))}
            {enumDef.values.length > 5 && (
              <div className="text-xs text-gray-400 italic">
                +{enumDef.values.length - 5} more...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(EnumNode);
