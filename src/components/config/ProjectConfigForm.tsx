import { useConfigStore } from "@/stores/configStore";

export default function ProjectConfigForm() {
  const projectConfig = useConfigStore((state) => state.project);
  const setProject = useConfigStore((state) => state.setProject);

  const handleChange = (field: string, value: string) => {
    setProject({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={projectConfig.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., E-Commerce API"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          A descriptive name for your FastAPI project
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Author
        </label>
        <input
          type="text"
          value={projectConfig.author || ""}
          onChange={(e) => handleChange("author", e.target.value)}
          placeholder="e.g., John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Your name or organization
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={projectConfig.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="e.g., A RESTful API for managing products, orders, and customers"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Brief description of what your API does
        </p>
      </div>
    </div>
  );
}
