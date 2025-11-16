import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { ModelNodeData } from "@/types/reactFlow";

function ModelNode({ data, selected }: NodeProps) {
  const model = (data as ModelNodeData).model;

  return (
    <div
      className={`bg-white border-2 rounded-lg min-w-[200px] overflow-hidden transition-shadow ${
        selected ? "border-primary-500 shadow-lg shadow-primary-100" : "border-secondary-300 shadow-md hover:shadow-lg"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="bg-primary-50 px-4 py-2 border-b border-secondary-200">
        <div className="font-semibold text-secondary-800">{model.name}</div>
        <div className="text-xs text-secondary-500">{model.tablename}</div>
      </div>

      <div className="px-4 py-2">
        {model.columns.length === 0 ? (
          <div className="text-xs text-gray-400 italic">No columns</div>
        ) : (
          <div className="space-y-1">
            {model.columns.slice(0, 5).map((column: any) => (
              <div key={column.name} className="text-sm flex items-center gap-2">
                <span className="text-gray-700">{column.name}</span>
                <span className="text-xs text-gray-400">{column.type.name}</span>
                {column.primary_key && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                    PK
                  </span>
                )}
              </div>
            ))}
            {model.columns.length > 5 && (
              <div className="text-xs text-gray-400 italic">
                +{model.columns.length - 5} more...
              </div>
            )}
          </div>
        )}
      </div>

      {model.relationships && model.relationships.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium mb-1">Relationships</div>
          <div className="space-y-1">
            {model.relationships.slice(0, 3).map((rel: any) => (
              <div key={rel.name} className="text-xs text-gray-600">
                {rel.name} → {rel.target}
              </div>
            ))}
            {model.relationships.length > 3 && (
              <div className="text-xs text-gray-400 italic">
                +{model.relationships.length - 3} more...
              </div>
            )}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(ModelNode);
