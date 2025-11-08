import { api } from "@/api/client";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/users/me");
    return data;
}