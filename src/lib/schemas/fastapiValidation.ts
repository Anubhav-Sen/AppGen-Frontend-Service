import { z } from "zod";
import {
  ColumnTypeName,
  CascadeOption,
  DBProvider,
} from "@/types/fastapiSpec";

const IdentifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SimpleNamePattern = /^[A-Za-z0-9_]+$/;
const ForeignKeyPattern = /^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/;

export const columnTypeNameSchema = z.enum([
  ColumnTypeName.INTEGER,
  ColumnTypeName.STRING,
  ColumnTypeName.BOOLEAN,
  ColumnTypeName.FLOAT,
  ColumnTypeName.NUMERIC,
  ColumnTypeName.TEXT,
  ColumnTypeName.DATE_TIME,
  ColumnTypeName.DATE,
  ColumnTypeName.TIME,
  ColumnTypeName.JSON,
  ColumnTypeName.ENUM,
  ColumnTypeName.LARGE_BINARY,
  ColumnTypeName.INTERVAL,
  ColumnTypeName.BIG_INTEGER,
  ColumnTypeName.UUID,
  ColumnTypeName.CHAR,
  ColumnTypeName.VARCHAR,
]);

export const cascadeOptionSchema = z.enum([
  CascadeOption.SAVE_UPDATE,
  CascadeOption.MERGE,
  CascadeOption.EXPUNGE,
  CascadeOption.DELETE,
  CascadeOption.DELETE_ORPHAN,
  CascadeOption.REFRESH_EXPIRE,
  CascadeOption.ALL,
]);

export const dbProviderSchema = z.enum([
  DBProvider.POSTGRESQL,
  DBProvider.SQLITE,
  DBProvider.MYSQL,
]);

export const enumDefinitionSchema = z.object({
  name: z
    .string()
    .min(1, "Enum name is required")
    .regex(IdentifierPattern, "Enum name must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  values: z
    .array(
      z
        .string()
        .min(1, "Enum value cannot be empty")
        .regex(SimpleNamePattern, "Enum values must match pattern [A-Za-z0-9_]+")
    )
    .min(1, "At least one enum value is required"),
});

export const columnTypeSchema = z.object({
  name: columnTypeNameSchema,
  length: z.number().int().positive().optional(),
  precision: z.number().int().positive().optional(),
  scale: z.number().int().nonnegative().optional(),
  enum_class: z.string().optional(),
});

export const columnSchema = z.object({
  name: z
    .string()
    .min(1, "Column name is required")
    .regex(SimpleNamePattern, "Column name must match pattern [A-Za-z0-9_]+"),
  type: columnTypeSchema,
  primary_key: z.boolean().optional(),
  nullable: z.boolean().optional(),
  unique: z.boolean().optional(),
  index: z.boolean().optional(),
  autoincrement: z.boolean().optional(),
  foreign_key: z
    .string()
    .regex(ForeignKeyPattern, "Foreign key must be format: ModelName.column_name")
    .optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  server_default: z.string().optional(),
  info: z.record(z.string(), z.unknown()).optional(),
});

export const relationshipSchema = z.object({
  name: z
    .string()
    .min(1, "Relationship name is required")
    .regex(SimpleNamePattern, "Relationship name must match pattern [A-Za-z0-9_]+"),
  target: z
    .string()
    .min(1, "Target model is required")
    .regex(IdentifierPattern, "Target model must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  back_populates: z.string().optional(),
  backref: z.string().optional(),
  secondary: z.string().optional(),
  remote_side: z.array(z.string()).optional(),
  cascade: z.array(cascadeOptionSchema).optional(),
  uselist: z.boolean().optional(),
  order_by: z.string().optional(),
});

export const modelSchema = z.object({
  name: z
    .string()
    .min(1, "Model name is required")
    .regex(IdentifierPattern, "Model name must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  tablename: z
    .string()
    .min(1, "Table name is required")
    .regex(SimpleNamePattern, "Table name must match pattern [A-Za-z0-9_]+"),
  columns: z.array(columnSchema).min(1, "Model must have at least one column"),
  relationships: z.array(relationshipSchema).optional(),
  is_user: z.boolean().optional(),
  username_field: z.string().optional(),
  password_field: z.string().optional(),
});

export const associationTableSchema = z.object({
  name: z
    .string()
    .min(1, "Association table name is required")
    .regex(IdentifierPattern, "Association table name must match pattern [A-Za-z_][A-Za-z0-9_]*"),
  tablename: z
    .string()
    .min(1, "Table name is required")
    .regex(SimpleNamePattern, "Table name must match pattern [A-Za-z0-9_]+"),
  columns: z.array(columnSchema).min(1, "Association table must have at least one column"),
});

export const schemaSchema = z.object({
  enums: z.array(enumDefinitionSchema).optional(),
  association_tables: z.array(associationTableSchema).optional(),
  models: z.array(modelSchema).min(1, "At least one model is required"),
});

export const projectConfigSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  author: z.string().optional(),
  description: z.string().optional(),
});

export const gitConfigSchema = z.object({
  username: z.string().min(1, "Git username is required"),
  repository: z.string().min(1, "Repository is required"),
  branch: z.string().min(1, "Branch is required"),
});

export const databaseConfigSchema = z.object({
  db_provider: dbProviderSchema,
  db_name: z.string().min(1, "Database name is required"),
  db_host: z.string().optional(),
  db_port: z.number().int().positive().optional(),
  db_username: z.string().optional(),
  db_password: z.string().optional(),
  db_driver: z.string().optional(),
  db_options: z.string().optional(),
  db_connect_args: z.string().optional(),
});

export const securityConfigSchema = z.object({
  secret_key: z.string().min(32, "Secret key must be at least 32 characters for security"),
  algorithm: z.string().min(1, "Algorithm is required"),
});

export const tokenConfigSchema = z.object({
  access_token_expire_minutes: z
    .number()
    .int()
    .positive("Access token expiry must be greater than 0"),
  refresh_token_expire_days: z
    .number()
    .int()
    .positive("Refresh token expiry must be greater than 0"),
});

export const fastAPIProjectSpecSchema = z.object({
  project: projectConfigSchema,
  git: gitConfigSchema,
  database: databaseConfigSchema,
  security: securityConfigSchema,
  token: tokenConfigSchema,
  schema: schemaSchema,
});

export function validateProjectSpec(spec: unknown) {
  return fastAPIProjectSpecSchema.safeParse(spec);
}

export function validateModel(model: unknown) {
  return modelSchema.safeParse(model);
}

export function validateColumn(column: unknown) {
  return columnSchema.safeParse(column);
}

export function validateRelationship(relationship: unknown) {
  return relationshipSchema.safeParse(relationship);
}

export function formatZodErrors(errors: z.ZodError): string[] {
  return errors.issues.map((err) => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });
}
