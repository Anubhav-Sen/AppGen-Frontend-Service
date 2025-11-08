export const ColumnTypeName = {
  INTEGER: "integer",
  STRING: "string",
  BOOLEAN: "boolean",
  FLOAT: "float",
  NUMERIC: "numeric",
  TEXT: "text",
  DATE_TIME: "date-time",
  DATE: "date",
  TIME: "time",
  JSON: "json",
  ENUM: "enum",
  LARGE_BINARY: "large-binary",
  INTERVAL: "interval",
  BIG_INTEGER: "big-integer",
  UUID: "uuid",
  CHAR: "char",
  VARCHAR: "varchar",
} as const;

export type ColumnTypeName = typeof ColumnTypeName[keyof typeof ColumnTypeName];

export const CascadeOption = {
  SAVE_UPDATE: "save-update",
  MERGE: "merge",
  EXPUNGE: "expunge",
  DELETE: "delete",
  DELETE_ORPHAN: "delete-orphan",
  REFRESH_EXPIRE: "refresh-expire",
  ALL: "all",
} as const;

export type CascadeOption = typeof CascadeOption[keyof typeof CascadeOption];

export const DBProvider = {
  POSTGRESQL: "postgresql",
  SQLITE: "sqlite",
  MYSQL: "mysql",
} as const;

export type DBProvider = typeof DBProvider[keyof typeof DBProvider];

export interface EnumDefinition {
  name: string;
  values: string[];
}

export interface ColumnType {
  name: ColumnTypeName;
  length?: number;
  precision?: number;
  scale?: number;
  enum_class?: string;
}

export interface Column {
  name: string;
  type: ColumnType;
  primary_key?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  autoincrement?: boolean;
  foreign_key?: string;
  default?: string | number | boolean | null;
  server_default?: string;
  info?: Record<string, unknown>;
}

export interface Relationship {
  name: string;
  target: string;
  back_populates?: string;
  backref?: string;
  secondary?: string;
  remote_side?: string[];
  cascade?: CascadeOption[];
  uselist?: boolean;
  order_by?: string;
}

export interface Model {
  name: string;
  tablename: string;
  columns: Column[];
  relationships?: Relationship[];
  is_user?: boolean;
  username_field?: string;
  password_field?: string;
}

export interface AssociationTable {
  name: string;
  tablename: string;
  columns: Column[];
}

export interface Schema {
  enums?: EnumDefinition[];
  association_tables?: AssociationTable[];
  models: Model[];
}

export interface GitConfig {
  username: string;
  repository: string;
  branch: string;
}

export interface DatabaseConfig {
  db_provider: DBProvider;
  db_name: string;
  db_host?: string;
  db_port?: number;
  db_username?: string;
  db_password?: string;
  db_driver?: string;
  db_options?: string;
  db_connect_args?: string;
}

export interface SecurityConfig {
  secret_key: string;
  algorithm: string;
}

export interface TokenConfig {
  access_token_expire_minutes: number;
  refresh_token_expire_days: number;
}

export interface ProjectConfig {
  title: string;
  author?: string;
  description?: string;
}

export interface FastAPIProjectSpec {
  project: ProjectConfig;
  git: GitConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  token: TokenConfig;
  schema: Schema;
}

export interface ModelWithUI extends Model {
  id: string;
  position?: { x: number; y: number };
}

export interface EnumWithUI extends EnumDefinition {
  id: string;
  position?: { x: number; y: number };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ProjectExport {
  version: string;
  spec: FastAPIProjectSpec;
  uiMetadata?: {
    models: Array<{ id: string; position: { x: number; y: number } }>;
    enums: Array<{ id: string; position: { x: number; y: number } }>;
  };
  createdAt: string;
  updatedAt: string;
}
