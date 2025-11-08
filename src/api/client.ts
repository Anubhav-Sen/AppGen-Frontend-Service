import axios, {
    type AxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/stores/authStore";

interface RefreshResponse {
    accessToken: string;
}

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

const REFRESH_ENDPOINT = "/auth/refresh";

let refreshPromise: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
    const { setAccessToken, clearAuth } = useAuthStore.getState();

    try {
        const response = await axios.post<RefreshResponse>(
            `${API_BASE_URL}${REFRESH_ENDPOINT}`,
            null,
            { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        return newAccessToken;
    } catch (error) {
        clearAuth();
        return null;
    }
}


function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}


export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});


api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },

    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfigWithRetry | undefined;

        if (!originalRequest || !error.response) {
            return Promise.reject(error);
        }

        const status = error.response.status;

        const isRefreshCall = originalRequest.url?.includes(REFRESH_ENDPOINT);

        if (status === 401 && !originalRequest._retry && !isRefreshCall) {
            originalRequest._retry = true;

            const newAccessToken = await refreshAccessToken();

            if (!newAccessToken) {
                return Promise.reject(error);
            }

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        }

        return Promise.reject(error);
    },
);

export default api;