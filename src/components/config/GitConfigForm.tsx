import { useConfigStore } from "@/stores/configStore";

export default function GitConfigForm() {
  const gitConfig = useConfigStore((state) => state.git);
  const setGit = useConfigStore((state) => state.setGit);

  const handleChange = (field: string, value: string) => {
    setGit({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Git Username
        </label>
        <input
          type="text"
          value={gitConfig.username}
          onChange={(e) => handleChange("username", e.target.value)}
          placeholder="your-username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repository
        </label>
        <input
          type="text"
          value={gitConfig.repository}
          onChange={(e) => handleChange("repository", e.target.value)}
          placeholder="my-fastapi-project"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Repository name
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Branch
        </label>
        <input
          type="text"
          value={gitConfig.branch}
          onChange={(e) => handleChange("branch", e.target.value)}
          placeholder="main"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
