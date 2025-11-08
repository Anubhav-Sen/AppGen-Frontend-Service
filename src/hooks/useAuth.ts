import { useAuthStore } from "@/stores/authStore";
import { auth, type LoginPayload } from "@/api/auth";

export function useAuth() {
    const { user, setUser } = useAuthStore();

    async function login(payload: LoginPayload) {
        const response = await auth.login(payload);
        setUser(response.user);
        return response;
    }

    function logout() {
        setUser(null);
    }

    return { user, login, logout };
}