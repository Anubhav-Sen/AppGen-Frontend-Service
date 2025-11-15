import { api } from "@/api/client";
import type { User } from "@/types/user";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export interface RegisterPayload {
    email: string;
    username: string;
    password: string;
}

interface LoginResponseRaw {
    access_token: string;
    refresh_token?: string;
    user: {
        id: number;
        email: string;
        username: string;
        is_active: boolean;
    };
}

interface UserRaw {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
}

export const auth = {
    async login(payload: LoginPayload, rememberMe: boolean = false): Promise<LoginResponse> {
        const response = await api.post<LoginResponseRaw>("/auth/login", {
            email: payload.email,
            password: payload.password,
            remember_me: rememberMe,
        });
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            user: {
                id: response.data.user.id,
                email: response.data.user.email,
                username: response.data.user.username,
                isActive: response.data.user.is_active,
            },
        };
    },
    async register(payload: RegisterPayload): Promise<User> {
        const response = await api.post<UserRaw>("/auth/register", payload);
        return {
            id: response.data.id,
            email: response.data.email,
            username: response.data.username,
            isActive: response.data.is_active,
        };
    },
};