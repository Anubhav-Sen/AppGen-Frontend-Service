import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    rememberMe: boolean;
    setUser: (u: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setRememberMe: (rememberMe: boolean) => void;
    setAuth: (data: { accessToken?: string; user?: User }) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            rememberMe: false,

            setUser: (u) => set({ user: u }),

            setAccessToken: (token) => set({ accessToken: token }),

            setRememberMe: (rememberMe) => set({ rememberMe }),

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
                    rememberMe: false,
                });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                rememberMe: state.rememberMe,
                // Only persist accessToken if rememberMe is true
                ...(state.rememberMe ? { accessToken: state.accessToken } : {})
            }),
            storage: createJSONStorage(() => localStorage),
        }
    )
);