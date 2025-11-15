import { useConfigStore } from "@/stores/configStore";
import { DBProvider } from "@/types/fastapiSpec";

describe("configStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useConfigStore.getState().resetToDefaults();
  });

  describe("resetToDefaults", () => {
    it("should reset project config to empty defaults", () => {
      // Set some values
      useConfigStore.getState().setProject({ title: "Test Project", author: "Test Author" });

      // Reset
      useConfigStore.getState().resetToDefaults();

      const state = useConfigStore.getState();
      expect(state.project.title).toBe("");
      expect(state.project.author).toBe("");
      expect(state.project.description).toBe("");
    });

    it("should reset database config to empty defaults", () => {
      useConfigStore.getState().setDatabase({ db_name: "test_db", db_host: "localhost" });

      useConfigStore.getState().resetToDefaults();

      const state = useConfigStore.getState();
      expect(state.database.db_name).toBe("");
      expect(state.database.db_host).toBe("");
      expect(state.database.db_provider).toBe(DBProvider.POSTGRESQL);
    });
  });

  describe("setProject", () => {
    it("should update project config", () => {
      useConfigStore.getState().setProject({ title: "New Project" });

      const state = useConfigStore.getState();
      expect(state.project.title).toBe("New Project");
    });
  });
});
