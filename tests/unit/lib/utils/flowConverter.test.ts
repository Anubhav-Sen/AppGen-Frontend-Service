import { describe, it, expect } from "@jest/globals";
import { modelsToNodes, enumsToNodes, relationshipsToEdges } from "@/lib/utils/flowConverter";
import { ColumnTypeName } from "@/types/fastapiSpec";
import type { ModelWithUI, EnumWithUI } from "@/types/fastapiSpec";

describe("flowConverter", () => {
  describe("modelsToNodes", () => {
    it("should convert models to React Flow nodes", () => {
      const models: ModelWithUI[] = [
        {
          id: "model-1",
          name: "User",
          tablename: "users",
          columns: [
            {
              name: "id",
              type: { name: ColumnTypeName.INTEGER },
              primary_key: true,
            },
          ],
          position: { x: 100, y: 200 },
        },
      ];

      const nodes = modelsToNodes(models);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe("model-1");
      expect(nodes[0].type).toBe("model");
      expect(nodes[0].position).toEqual({ x: 100, y: 200 });
      expect((nodes[0].data as any).modelId).toBe("model-1");
      expect((nodes[0].data as any).model.name).toBe("User");
    });

    it("should use default position if not provided", () => {
      const models: ModelWithUI[] = [
        {
          id: "model-1",
          name: "User",
          tablename: "users",
          columns: [],
        },
      ];

      const nodes = modelsToNodes(models);

      expect(nodes[0].position).toEqual({ x: 100, y: 100 });
    });
  });

  describe("enumsToNodes", () => {
    it("should convert enums to React Flow nodes", () => {
      const enums: EnumWithUI[] = [
        {
          id: "enum-1",
          name: "StatusType",
          values: ["active", "inactive"],
          position: { x: 300, y: 400 },
        },
      ];

      const nodes = enumsToNodes(enums);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe("enum-1");
      expect(nodes[0].type).toBe("enum");
      expect(nodes[0].position).toEqual({ x: 300, y: 400 });
      expect((nodes[0].data as any).enumId).toBe("enum-1");
      expect((nodes[0].data as any).enum.name).toBe("StatusType");
    });
  });

  describe("relationshipsToEdges", () => {
    it("should convert relationships to React Flow edges", () => {
      const models: ModelWithUI[] = [
        {
          id: "user-1",
          name: "User",
          tablename: "users",
          columns: [],
        },
        {
          id: "post-1",
          name: "Post",
          tablename: "posts",
          columns: [],
          relationships: [
            {
              name: "author",
              target: "User",
              back_populates: "posts",
            },
          ],
        },
      ];

      const edges = relationshipsToEdges(models);

      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe("post-1");
      expect(edges[0].target).toBe("user-1");
      expect(edges[0].data?.relationshipName).toBe("author");
      expect(edges[0].data?.sourceModel).toBe("Post");
      expect(edges[0].data?.targetModel).toBe("User");
    });

    it("should skip relationships with missing target models", () => {
      const models: ModelWithUI[] = [
        {
          id: "post-1",
          name: "Post",
          tablename: "posts",
          columns: [],
          relationships: [
            {
              name: "author",
              target: "NonExistentModel",
            },
          ],
        },
      ];

      const edges = relationshipsToEdges(models);

      expect(edges).toHaveLength(0);
    });

    it("should handle models with no relationships", () => {
      const models: ModelWithUI[] = [
        {
          id: "user-1",
          name: "User",
          tablename: "users",
          columns: [],
        },
      ];

      const edges = relationshipsToEdges(models);

      expect(edges).toHaveLength(0);
    });
  });
});
