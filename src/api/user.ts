import { api } from "@/api/client";
import type { User } from "@/types/user";

export interface UpdateUserPayload {
    username?: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export async function getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/users/me");
    return data;
}

export async function updateUser(payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<User>("/users/me", payload);
    return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post("/users/me/change-password", payload);
}