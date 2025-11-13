import { useConfigStore } from "@/stores/configStore";

export default function SecurityConfigForm() {
  const securityConfig = useConfigStore((state) => state.security);
  const setSecurity = useConfigStore((state) => state.setSecurity);

  const handleChange = (field: string, value: string) => {
    setSecurity({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secret Key
        </label>
        <input
          type="text"
          value={securityConfig.secret_key || ""}
          onChange={(e) => handleChange("secret_key", e.target.value)}
          placeholder="your-secret-key-min-32-characters"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Minimum 32 characters. Use environment variable in production.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Algorithm
        </label>
        <select
          value={securityConfig.algorithm || "HS256"}
          onChange={(e) => handleChange("algorithm", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="HS256">HS256</option>
          <option value="HS384">HS384</option>
          <option value="HS512">HS512</option>
          <option value="RS256">RS256</option>
          <option value="RS384">RS384</option>
          <option value="RS512">RS512</option>
        </select>
      </div>

    </div>
  );
}
