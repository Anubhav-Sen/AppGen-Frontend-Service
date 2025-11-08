import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/api/auth";
import type { LoginResponse } from "@/api/auth";

// Mock the API module
jest.mock("@/api/auth", () => ({
    auth: {
        login: jest.fn(),
    },
}));

// Mock zustand store
jest.mock("@/stores/authStore", () => ({
    useAuthStore: jest.fn(() => ({
        user: null,
        accessToken: null,
        setUser: jest.fn(),
        setAccessToken: jest.fn(),
        clearAuth: jest.fn(),
    })),
}));

describe("useAuth", () => {
    const mockLoginResponse: LoginResponse = {
        accessToken: "mock-token",
        refreshToken: "mock-refresh-token",
        user: {
            id: 1,
            email: "test@example.com",
            username: "testuser",
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return user and auth functions", () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current).toHaveProperty("user");
        expect(result.current).toHaveProperty("login");
        expect(result.current).toHaveProperty("logout");
        expect(typeof result.current.login).toBe("function");
        expect(typeof result.current.logout).toBe("function");
    });

    it("should call auth.login with correct payload", async () => {
        const mockAuth = auth as jest.Mocked<typeof auth>;
        mockAuth.login.mockResolvedValue(mockLoginResponse);

        const { result } = renderHook(() => useAuth());

        const loginPayload = {
            email: "test@example.com",
            password: "password123",
        };

        await act(async () => {
            await result.current.login(loginPayload);
        });

        expect(mockAuth.login).toHaveBeenCalledWith(loginPayload);
        expect(mockAuth.login).toHaveBeenCalledTimes(1);
    });

    it("should return login response", async () => {
        const mockAuth = auth as jest.Mocked<typeof auth>;
        mockAuth.login.mockResolvedValue(mockLoginResponse);

        const { result } = renderHook(() => useAuth());

        let response;
        await act(async () => {
            response = await result.current.login({
                email: "test@example.com",
                password: "password123",
            });
        });

        expect(response).toEqual(mockLoginResponse);
    });

    it("should handle login errors", async () => {
        const mockAuth = auth as jest.Mocked<typeof auth>;
        const mockError = new Error("Login failed");
        mockAuth.login.mockRejectedValue(mockError);

        const { result } = renderHook(() => useAuth());

        await expect(
            result.current.login({
                email: "test@example.com",
                password: "wrong-password",
            })
        ).rejects.toThrow("Login failed");
    });

    it("should have logout function available", () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.logout).toBeDefined();
        expect(typeof result.current.logout).toBe("function");
    });

    it("should call logout without errors", () => {
        const { result } = renderHook(() => useAuth());

        expect(() => {
            act(() => {
                result.current.logout();
            });
        }).not.toThrow();
    });
});
