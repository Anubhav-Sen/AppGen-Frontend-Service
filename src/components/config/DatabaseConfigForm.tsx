import { useConfigStore } from "@/stores/configStore";
import { DBProvider } from "@/types/fastapiSpec";

export default function DatabaseConfigForm() {
  const databaseConfig = useConfigStore((state) => state.database);
  const setDatabase = useConfigStore((state) => state.setDatabase);

  const handleChange = (field: string, value: string | number) => {
    setDatabase({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Database Provider
        </label>
        <select
          value={databaseConfig.db_provider}
          onChange={(e) => handleChange("db_provider", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DBProvider).map((provider) => (
            <option key={provider} value={provider}>
              {provider.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Database Host
        </label>
        <input
          type="text"
          value={databaseConfig.db_host || ""}
          onChange={(e) => handleChange("db_host", e.target.value)}
          placeholder="localhost"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Database Port
        </label>
        <input
          type="number"
          value={databaseConfig.db_port || ""}
          onChange={(e) => handleChange("db_port", parseInt(e.target.value) || 5432)}
          placeholder="5432"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Database Name
        </label>
        <input
          type="text"
          value={databaseConfig.db_name}
          onChange={(e) => handleChange("db_name", e.target.value)}
          placeholder="myapp"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          value={databaseConfig.db_username || ""}
          onChange={(e) => handleChange("db_username", e.target.value)}
          placeholder="postgres"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password (for development only)
        </label>
        <input
          type="password"
          value={databaseConfig.db_password || ""}
          onChange={(e) => handleChange("db_password", e.target.value)}
          placeholder="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Use environment variables in production
        </p>
      </div>
    </div>
  );
}
