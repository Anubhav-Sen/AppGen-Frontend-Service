import { describe, it, expect } from "@jest/globals";
import {
  validateModel,
  validateColumn,
  validateProjectSpec,
  formatZodErrors,
  modelSchema,
  columnSchema,
} from "@/lib/schemas/fastapiValidation";
import { ColumnTypeName, DBProvider } from "@/types/fastapiSpec";

describe("fastapiValidation", () => {
  describe("validateColumn", () => {
    it("should accept valid column", () => {
      const result = validateColumn({
        name: "user_id",
        type: { name: ColumnTypeName.INTEGER },
        primary_key: true,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid column name pattern", () => {
      const result = validateColumn({
        name: "user-id",
        type: { name: ColumnTypeName.INTEGER },
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid foreign key format", () => {
      const result = validateColumn({
        name: "author_id",
        type: { name: ColumnTypeName.INTEGER },
        foreign_key: "User.id",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid foreign key format", () => {
      const result = validateColumn({
        name: "author_id",
        type: { name: ColumnTypeName.INTEGER },
        foreign_key: "User",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("validateModel", () => {
    it("should accept valid model", () => {
      const result = validateModel({
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

      expect(result.success).toBe(true);
    });

    it("should reject model without columns", () => {
      const result = validateModel({
        name: "User",
        tablename: "users",
        columns: [],
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid model name pattern", () => {
      const result = validateModel({
        name: "user-model",
        tablename: "users",
        columns: [
          {
            name: "id",
            type: { name: ColumnTypeName.INTEGER },
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it("should accept model with relationships", () => {
      const result = validateModel({
        name: "Post",
        tablename: "posts",
        columns: [
          {
            name: "id",
            type: { name: ColumnTypeName.INTEGER },
            primary_key: true,
          },
        ],
        relationships: [
          {
            name: "author",
            target: "User",
            back_populates: "posts",
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("validateProjectSpec", () => {
    it("should accept complete valid spec", () => {
      const result = validateProjectSpec({
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
        },
        security: {
          secret_key: "test-secret-key-at-least-32-characters-long",
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
      });

      expect(result.success).toBe(true);
    });

    it("should reject spec with short secret key", () => {
      const result = validateProjectSpec({
        project: { title: "MyApp" },
        git: { username: "user", repository: "repo", branch: "main" },
        database: { db_provider: DBProvider.SQLITE, db_name: "test.db" },
        security: { secret_key: "short", algorithm: "HS256" },
        token: { access_token_expire_minutes: 30, refresh_token_expire_days: 7 },
        schema: {
          models: [
            {
              name: "User",
              tablename: "users",
              columns: [{ name: "id", type: { name: ColumnTypeName.INTEGER } }],
            },
          ],
        },
      });

      expect(result.success).toBe(false);
    });

    it("should reject spec with invalid token expiry", () => {
      const result = validateProjectSpec({
        project: { title: "MyApp" },
        git: { username: "user", repository: "repo", branch: "main" },
        database: { db_provider: DBProvider.SQLITE, db_name: "test.db" },
        security: {
          secret_key: "test-secret-key-at-least-32-characters",
          algorithm: "HS256",
        },
        token: { access_token_expire_minutes: -5, refresh_token_expire_days: 7 },
        schema: {
          models: [
            {
              name: "User",
              tablename: "users",
              columns: [{ name: "id", type: { name: ColumnTypeName.INTEGER } }],
            },
          ],
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe("formatZodErrors", () => {
    it("should format validation errors", () => {
      const result = columnSchema.safeParse({
        name: "invalid-name",
        type: { name: "invalid" },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted[0]).toContain(":");
      }
    });
  });
});
