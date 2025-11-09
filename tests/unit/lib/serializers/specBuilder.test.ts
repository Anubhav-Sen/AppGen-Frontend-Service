import { describe, it, expect, beforeEach } from "@jest/globals";
import { buildFastAPIProjectSpec, getUIMetadata } from "@/lib/serializers/specBuilder";
import { useSchemaStore } from "@/stores/schemaStore";
import { useConfigStore } from "@/stores/configStore";
import { ColumnTypeName, DBProvider } from "@/types/fastapiSpec";

describe("specBuilder", () => {
  beforeEach(() => {
    useSchemaStore.getState().clearAll();
    useConfigStore.getState().resetToDefaults();
  });

  describe("buildFastAPIProjectSpec", () => {
    it("should build complete spec from stores", () => {
      const schemaStore = useSchemaStore.getState();
      const configStore = useConfigStore.getState();

      schemaStore.addModel({
        name: "User",
        tablename: "users",
        columns: [
          {
            name: "id",
            type: { name: ColumnTypeName.INTEGER },
            primary_key: true,
          },
        ],
      });

      configStore.setProject({ title: "Test App" });
      configStore.setGit({ username: "testuser", repository: "test-repo", branch: "main" });
      configStore.setDatabase({ db_provider: DBProvider.POSTGRESQL, db_name: "testdb" });
      configStore.setSecurity({
        secret_key: "test-secret-key-at-least-32-chars-long",
        algorithm: "HS256",
      });
      configStore.setToken({ access_token_expire_minutes: 30, refresh_token_expire_days: 7 });

      const spec = buildFastAPIProjectSpec();

      expect(spec.project.title).toBe("Test App");
      expect(spec.schema.models).toHaveLength(1);
      expect(spec.schema.models[0].name).toBe("User");
      expect(spec.database.db_provider).toBe(DBProvider.POSTGRESQL);
    });

    it("should strip UI metadata from models", () => {
      const schemaStore = useSchemaStore.getState();

      schemaStore.addModel({
        name: "User",
        tablename: "users",
        columns: [],
        position: { x: 100, y: 200 },
      });

      const spec = buildFastAPIProjectSpec();

      expect(spec.schema.models[0]).not.toHaveProperty("id");
      expect(spec.schema.models[0]).not.toHaveProperty("position");
    });

    it("should include enums when present", () => {
      const schemaStore = useSchemaStore.getState();

      schemaStore.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      schemaStore.addEnum({
        name: "StatusType",
        values: ["active", "inactive"],
      });

      const spec = buildFastAPIProjectSpec();

      expect(spec.schema.enums).toHaveLength(1);
      expect(spec.schema.enums?.[0].name).toBe("StatusType");
    });

    it("should include association tables when present", () => {
      const schemaStore = useSchemaStore.getState();

      schemaStore.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      schemaStore.addAssociationTable({
        name: "user_roles",
        tablename: "user_roles",
        columns: [
          {
            name: "user_id",
            type: { name: ColumnTypeName.INTEGER },
          },
        ],
      });

      const spec = buildFastAPIProjectSpec();

      expect(spec.schema.association_tables).toHaveLength(1);
      expect(spec.schema.association_tables?.[0].name).toBe("user_roles");
    });
  });

  describe("getUIMetadata", () => {
    it("should extract UI metadata", () => {
      const schemaStore = useSchemaStore.getState();

      schemaStore.addModel({
        name: "User",
        tablename: "users",
        columns: [],
        position: { x: 100, y: 200 },
      });

      schemaStore.addEnum(
        {
          name: "StatusType",
          values: ["active"],
        },
        { x: 300, y: 400 }
      );

      const metadata = getUIMetadata();

      expect(metadata.models).toHaveLength(1);
      expect(metadata.models[0].position).toEqual({ x: 100, y: 200 });
      expect(metadata.enums).toHaveLength(1);
      expect(metadata.enums[0].position).toEqual({ x: 300, y: 400 });
    });
  });
});
