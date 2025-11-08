import { describe, it, expect } from "@jest/globals";
import {
  ColumnTypeName,
  CascadeOption,
  DBProvider,
  type Column,
  type Model,
  type FastAPIProjectSpec,
  type EnumDefinition,
} from "@/types/fastapiSpec";

describe("fastapiSpec types", () => {
  describe("Enums", () => {
    it("should have correct ColumnTypeName values", () => {
      expect(ColumnTypeName.INTEGER).toBe("integer");
      expect(ColumnTypeName.STRING).toBe("string");
      expect(ColumnTypeName.BOOLEAN).toBe("boolean");
    });

    it("should have correct CascadeOption values", () => {
      expect(CascadeOption.ALL).toBe("all");
      expect(CascadeOption.DELETE).toBe("delete");
      expect(CascadeOption.DELETE_ORPHAN).toBe("delete-orphan");
      expect(CascadeOption.REFRESH_EXPIRE).toBe("refresh-expire");
    });

    it("should have correct DBProvider values", () => {
      expect(DBProvider.POSTGRESQL).toBe("postgresql");
      expect(DBProvider.SQLITE).toBe("sqlite");
      expect(DBProvider.MYSQL).toBe("mysql");
    });
  });

  describe("Column", () => {
    it("should accept valid column structure", () => {
      const column: Column = {
        name: "user_id",
        type: {
          name: ColumnTypeName.INTEGER,
        },
        primary_key: true,
        nullable: false,
      };

      expect(column.name).toBe("user_id");
      expect(column.type.name).toBe("integer");
    });

    it("should accept column with foreign key", () => {
      const column: Column = {
        name: "author_id",
        type: { name: ColumnTypeName.INTEGER },
        foreign_key: "User.id",
      };

      expect(column.foreign_key).toBe("User.id");
    });
  });

  describe("Model", () => {
    it("should accept valid model structure", () => {
      const model: Model = {
        name: "User",
        tablename: "users",
        columns: [
          {
            name: "id",
            type: { name: ColumnTypeName.INTEGER },
            primary_key: true,
          },
          {
            name: "username",
            type: { name: ColumnTypeName.STRING, length: 50 },
            unique: true,
          },
        ],
      };

      expect(model.name).toBe("User");
      expect(model.columns).toHaveLength(2);
    });

    it("should accept model with relationships", () => {
      const model: Model = {
        name: "Post",
        tablename: "posts",
        columns: [
          { name: "id", type: { name: ColumnTypeName.INTEGER }, primary_key: true },
        ],
        relationships: [
          {
            name: "author",
            target: "User",
            back_populates: "posts",
          },
        ],
      };

      expect(model.relationships).toHaveLength(1);
      expect(model.relationships?.[0].target).toBe("User");
    });
  });

  describe("EnumDefinition", () => {
    it("should accept valid enum", () => {
      const enumDef: EnumDefinition = {
        name: "StatusType",
        values: ["active", "inactive", "pending"],
      };

      expect(enumDef.name).toBe("StatusType");
      expect(enumDef.values).toHaveLength(3);
    });
  });

  describe("FastAPIProjectSpec", () => {
    it("should accept complete valid spec", () => {
      const spec: FastAPIProjectSpec = {
        project: {
          title: "MyApp",
          description: "Test App",
        },
        git: {
          username: "testuser",
          repository: "test-repo",
          branch: "main",
        },
        database: {
          db_provider: DBProvider.POSTGRESQL,
          db_name: "testdb",
          db_host: "localhost",
          db_port: 5432,
        },
        security: {
          secret_key: "test-secret-key-at-least-32-chars-long",
          algorithm: "HS256",
        },
        token: {
          access_token_expire_minutes: 30,
          refresh_token_expire_days: 7,
        },
        schema: {
          models: [
            {
              name: "User",
              tablename: "users",
              columns: [
                {
                  name: "id",
                  type: { name: ColumnTypeName.INTEGER },
                  primary_key: true,
                },
              ],
            },
          ],
        },
      };

      expect(spec.project.title).toBe("MyApp");
      expect(spec.database.db_provider).toBe("postgresql");
      expect(spec.schema.models).toHaveLength(1);
    });
  });
});
