import { useConfigStore } from "@/stores/configStore";

export default function TokenConfigForm() {
  const tokenConfig = useConfigStore((state) => state.token);
  const setToken = useConfigStore((state) => state.setToken);

  const handleChange = (field: string, value: number) => {
    setToken({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Access Token Expire (minutes)
        </label>
        <input
          type="number"
          value={tokenConfig.access_token_expire_minutes || 30}
          onChange={(e) => handleChange("access_token_expire_minutes", parseInt(e.target.value))}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          How long access tokens are valid (typically 15-60 minutes)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Refresh Token Expire (days)
        </label>
        <input
          type="number"
          value={tokenConfig.refresh_token_expire_days || 7}
          onChange={(e) => handleChange("refresh_token_expire_days", parseInt(e.target.value))}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          How long refresh tokens are valid (typically 7-30 days)
        </p>
      </div>

    </div>
  );
}
