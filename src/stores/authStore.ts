import { create } from "zustand";
import type { User } from "@/types/user";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    setUser: (u: User | null) => void;
    setAccessToken: (token: string | null) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    setUser: (u) => set({ user: u }),
    setAccessToken: (token) => set({ accessToken: token }),
    clearAuth: () => set({ user: null, accessToken: null }),
}));