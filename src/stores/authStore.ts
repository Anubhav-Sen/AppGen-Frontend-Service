import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    setUser: (u: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setAuth: (data: { accessToken?: string; user?: User }) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,

            setUser: (u) => set({ user: u }),

            setAccessToken: (token) => set({ accessToken: token }),

            setAuth: (data) => {
                set((state) => ({
                    accessToken: data.accessToken ?? state.accessToken,
                    user: data.user ?? state.user,
                }));
            },

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),
            storage: createJSONStorage(() => localStorage),
        }
    )
);