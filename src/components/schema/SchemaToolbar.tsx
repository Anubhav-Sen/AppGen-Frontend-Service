import { useSchemaStore } from "@/stores/schemaStore";
import { ColumnTypeName } from "@/types/fastapiSpec";
import { buildFastAPIProjectSpec } from "@/lib/serializers/specBuilder";

export default function SchemaToolbar() {
  const addModel = useSchemaStore((state) => state.addModel);
  const addEnum = useSchemaStore((state) => state.addEnum);
  const clearAll = useSchemaStore((state) => state.clearAll);
  const models = useSchemaStore((state) => state.models);

  const handleAddModel = () => {
    const modelCount = models.length;
    addModel({
      name: `Model${modelCount + 1}`,
      tablename: `model_${modelCount + 1}`,
      columns: [
        {
          name: "id",
          type: { name: ColumnTypeName.INTEGER },
          primary_key: true,
          autoincrement: true,
        },
      ],
      position: { x: 100 + modelCount * 50, y: 100 + modelCount * 50 },
    });
  };

  const handleAddEnum = () => {
    const enumCount = useSchemaStore.getState().enums.length;
    addEnum(
      {
        name: `EnumType${enumCount + 1}`,
        values: ["value1", "value2"],
      },
      { x: 400 + enumCount * 50, y: 100 + enumCount * 50 }
    );
  };

  const handleExportJSON = () => {
    const spec = buildFastAPIProjectSpec();
    const json = JSON.stringify(spec, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fastapi-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all models and enums?")) {
      clearAll();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg space-y-2">
      <h2 className="text-lg font-semibold mb-3">Schema Builder</h2>

      <div className="space-y-2">
        <button
          onClick={handleAddModel}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          + Add Model
        </button>

        <button
          onClick={handleAddEnum}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          + Add Enum
        </button>

        <button
          onClick={handleExportJSON}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Export JSON
        </button>

        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
