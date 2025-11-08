import { useAuthStore } from "@/stores/authStore";
import { auth, type LoginPayload } from "@/api/auth";

export function useAuth() {
    const { user, setUser, setAccessToken, clearAuth } = useAuthStore();

    async function login(payload: LoginPayload) {
        const response = await auth.login(payload);
        setUser(response.user);
        setAccessToken(response.accessToken);
        return response;
    }

    function logout() {
        clearAuth();
    }

    return { user, login, logout };
}