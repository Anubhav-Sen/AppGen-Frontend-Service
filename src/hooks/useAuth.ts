import { useAuthStore } from "@/stores/authStore";
import { auth, type LoginPayload } from "@/api/auth";

export function useAuth() {
    const { user, setUser, setAccessToken, clearAuth, setRememberMe } = useAuthStore();

    async function login(payload: LoginPayload, rememberMe: boolean = false) {
        const response = await auth.login(payload, rememberMe);
        setUser(response.user);
        setAccessToken(response.accessToken);
        setRememberMe(rememberMe);
        return response;
    }

    function logout() {
        clearAuth();
    }

    return { user, login, logout };
}