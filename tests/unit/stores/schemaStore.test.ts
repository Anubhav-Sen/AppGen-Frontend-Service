import { describe, it, expect, beforeEach } from "@jest/globals";
import { useSchemaStore } from "@/stores/schemaStore";
import { ColumnTypeName } from "@/types/fastapiSpec";

describe("schemaStore", () => {
  beforeEach(() => {
    useSchemaStore.getState().clearAll();
  });

  describe("models", () => {
    it("should add a model", () => {
      const store = useSchemaStore.getState();
      const id = store.addModel({
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

      const updated = useSchemaStore.getState();
      expect(id).toBeTruthy();
      expect(updated.models).toHaveLength(1);
      expect(updated.models[0].name).toBe("User");
    });

    it("should update a model", () => {
      const store = useSchemaStore.getState();
      const id = store.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      store.updateModel(id, { tablename: "app_users" });

      const updated = useSchemaStore.getState().models[0];
      expect(updated.tablename).toBe("app_users");
    });

    it("should delete a model", () => {
      const store = useSchemaStore.getState();
      const id = store.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      store.deleteModel(id);

      expect(useSchemaStore.getState().models).toHaveLength(0);
    });

    it("should get a model by id", () => {
      const store = useSchemaStore.getState();
      const id = store.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      const model = store.getModel(id);

      expect(model).toBeDefined();
      expect(model?.name).toBe("User");
    });
  });

  describe("columns", () => {
    it("should add a column to a model", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      store.addColumn(modelId, {
        name: "email",
        type: { name: ColumnTypeName.STRING, length: 255 },
        unique: true,
      });

      const model = useSchemaStore.getState().models[0];
      expect(model.columns).toHaveLength(1);
      expect(model.columns[0].name).toBe("email");
    });

    it("should update a column", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "User",
        tablename: "users",
        columns: [
          {
            name: "email",
            type: { name: ColumnTypeName.STRING },
          },
        ],
      });

      store.updateColumn(modelId, "email", { unique: true });

      const model = useSchemaStore.getState().models[0];
      expect(model.columns[0].unique).toBe(true);
    });

    it("should delete a column", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "User",
        tablename: "users",
        columns: [
          {
            name: "email",
            type: { name: ColumnTypeName.STRING },
          },
        ],
      });

      store.deleteColumn(modelId, "email");

      const model = useSchemaStore.getState().models[0];
      expect(model.columns).toHaveLength(0);
    });
  });

  describe("relationships", () => {
    it("should add a relationship to a model", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "Post",
        tablename: "posts",
        columns: [],
      });

      store.addRelationship(modelId, {
        name: "author",
        target: "User",
        back_populates: "posts",
      });

      const model = useSchemaStore.getState().models[0];
      expect(model.relationships).toHaveLength(1);
      expect(model.relationships?.[0].name).toBe("author");
    });

    it("should update a relationship", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "Post",
        tablename: "posts",
        columns: [],
        relationships: [
          {
            name: "author",
            target: "User",
          },
        ],
      });

      store.updateRelationship(modelId, "author", { back_populates: "posts" });

      const model = useSchemaStore.getState().models[0];
      expect(model.relationships?.[0].back_populates).toBe("posts");
    });

    it("should delete a relationship", () => {
      const store = useSchemaStore.getState();
      const modelId = store.addModel({
        name: "Post",
        tablename: "posts",
        columns: [],
        relationships: [
          {
            name: "author",
            target: "User",
          },
        ],
      });

      store.deleteRelationship(modelId, "author");

      const model = useSchemaStore.getState().models[0];
      expect(model.relationships).toHaveLength(0);
    });
  });

  describe("enums", () => {
    it("should add an enum", () => {
      const store = useSchemaStore.getState();
      const id = store.addEnum({
        name: "StatusType",
        values: ["active", "inactive"],
      });

      const updated = useSchemaStore.getState();
      expect(id).toBeTruthy();
      expect(updated.enums).toHaveLength(1);
      expect(updated.enums[0].name).toBe("StatusType");
    });

    it("should update an enum", () => {
      const store = useSchemaStore.getState();
      const id = store.addEnum({
        name: "StatusType",
        values: ["active"],
      });

      store.updateEnum(id, { values: ["active", "inactive", "pending"] });

      const enumDef = useSchemaStore.getState().enums[0];
      expect(enumDef.values).toHaveLength(3);
    });

    it("should delete an enum", () => {
      const store = useSchemaStore.getState();
      const id = store.addEnum({
        name: "StatusType",
        values: ["active"],
      });

      store.deleteEnum(id);

      expect(useSchemaStore.getState().enums).toHaveLength(0);
    });
  });

  describe("positions", () => {
    it("should update model position", () => {
      const store = useSchemaStore.getState();
      const id = store.addModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      store.updateModelPosition(id, { x: 200, y: 300 });

      const model = useSchemaStore.getState().models[0];
      expect(model.position).toEqual({ x: 200, y: 300 });
    });

    it("should update enum position", () => {
      const store = useSchemaStore.getState();
      const id = store.addEnum({
        name: "StatusType",
        values: ["active"],
      });

      store.updateEnumPosition(id, { x: 150, y: 250 });

      const enumDef = useSchemaStore.getState().enums[0];
      expect(enumDef.position).toEqual({ x: 150, y: 250 });
    });
  });
});
