import axios from "axios";

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string;
    refeshToken?: string;
    user: {
        id: string;
        email: string;
        name?: string;
    };
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
    withCredentials: true,
});

export const auth = {
    async login(payload: LoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>("/auth/login", payload);
        return response.data;
    },
};