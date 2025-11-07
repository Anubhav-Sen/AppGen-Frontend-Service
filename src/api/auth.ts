import { api } from "./client";
import type { User } from "../types/user";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export const auth = {
    async login(payload: LoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>("/auth/login", payload);
        return response.data;
    },
};