import { api } from "@/api/client";
import type { SchemaProject, CreateSchemaPayload, UpdateSchemaPayload } from "@/types/schema";

export const schemas = {
    async getAll(): Promise<SchemaProject[]> {
        const response = await api.get<SchemaProject[]>("/schemas/");
        return response.data;
    },

    async getById(id: number): Promise<SchemaProject> {
        const response = await api.get<SchemaProject>(`/schemas/${id}`);
        return response.data;
    },

    async create(payload: CreateSchemaPayload): Promise<SchemaProject> {
        const response = await api.post<SchemaProject>("/schemas/", payload);
        return response.data;
    },

    async update(id: number, payload: UpdateSchemaPayload): Promise<SchemaProject> {
        const response = await api.put<SchemaProject>(`/schemas/${id}`, payload);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/schemas/${id}`);
    },
};
