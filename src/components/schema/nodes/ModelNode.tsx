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
      {/* Multiple handles on each side for cleaner edge routing */}
      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-indigo-400" />
      <Handle type="target" position={Position.Right} id="right" className="w-2 h-2 !bg-indigo-400" />

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
                {column.foreign_key && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                    FK
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
            {model.relationships.slice(0, 3).map((rel: any) => {
              // Find the FK column for this relationship
              const fkColumn = model.columns.find((col: any) =>
                col.foreign_key && col.foreign_key.startsWith(rel.target.toLowerCase())
              );
              const sourceColumn = fkColumn ? fkColumn.name : '?';
              // Extract target column from foreign_key (format: tablename.column)
              const targetColumn = fkColumn?.foreign_key?.split('.')[1] || '?';

              return (
                <div key={rel.name} className="text-xs text-gray-600">
                  {model.tablename}.{sourceColumn} → {rel.target.toLowerCase()}.{targetColumn}
                </div>
              );
            })}
            {model.relationships.length > 3 && (
              <div className="text-xs text-gray-400 italic">
                +{model.relationships.length - 3} more...
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default memo(ModelNode);
