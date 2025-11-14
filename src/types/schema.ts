export interface Schema {
    id: string;
    name: string;
    modelCount: number;
}

export interface SchemaProject {
    id: number;
    name: string;
    description: string | null;
    schema_data: Record<string, unknown>;
    owner_id: number;
    created_at: string;
    updated_at: string | null;
}

export interface CreateSchemaPayload {
    name: string;
    description?: string;
    schema_data: Record<string, unknown>;
}

export interface UpdateSchemaPayload {
    name?: string;
    description?: string;
    schema_data?: Record<string, unknown>;
}