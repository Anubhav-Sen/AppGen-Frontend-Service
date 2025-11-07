import { useAuthStore } from "../stores/authStore";
import { getCurrentUser } from "../api/user";

export function useAuth() {
    const { user, setUser } = useAuthStore();

    async function login(username: string, password: string) {
        console.log(`Logging in ${username}`);
        const loggedIn = await getCurrentUser();
        setUser(loggedIn);
    }

    return {user, login };
}