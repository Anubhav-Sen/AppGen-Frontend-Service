import { auth } from "@/api/auth";
import { api } from "@/api/client";
import type { LoginPayload, LoginResponse } from "@/api/auth";

// Mock the axios client
jest.mock("@/api/client", () => ({
    api: {
        post: jest.fn(),
    },
}));

describe("auth API", () => {
    const mockApi = api as jest.Mocked<typeof api>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("login", () => {
        const loginPayload: LoginPayload = {
            email: "test@example.com",
            password: "password123",
        };

        const mockRawResponse = {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                is_active: true,
            },
        };

        const mockExpectedResponse: LoginResponse = {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        };

        it("should call POST /auth/login with correct payload", async () => {
            mockApi.post.mockResolvedValue({ data: mockRawResponse });

            await auth.login(loginPayload);

            expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
                email: loginPayload.email,
                password: loginPayload.password,
            });
            expect(mockApi.post).toHaveBeenCalledTimes(1);
        });

        it("should return login response data", async () => {
            mockApi.post.mockResolvedValue({ data: mockRawResponse });

            const result = await auth.login(loginPayload);

            expect(result).toEqual(mockExpectedResponse);
            expect(result.accessToken).toBe("mock-access-token");
            expect(result.user.email).toBe("test@example.com");
        });

        it("should handle API errors", async () => {
            const mockError = {
                response: {
                    data: {
                        detail: "Invalid credentials",
                    },
                    status: 401,
                },
            };

            mockApi.post.mockRejectedValue(mockError);

            await expect(auth.login(loginPayload)).rejects.toEqual(mockError);
        });

        it("should handle network errors", async () => {
            const networkError = new Error("Network error");
            mockApi.post.mockRejectedValue(networkError);

            await expect(auth.login(loginPayload)).rejects.toThrow("Network error");
        });

        it("should pass user object with correct structure", async () => {
            mockApi.post.mockResolvedValue({ data: mockRawResponse });

            const result = await auth.login(loginPayload);

            expect(result.user).toHaveProperty("id");
            expect(result.user).toHaveProperty("email");
            expect(result.user).toHaveProperty("username");
        });

        it("should handle response without refreshToken", async () => {
            const rawResponseWithoutRefresh = {
                access_token: "mock-token",
                user: {
                    id: 1,
                    email: "test@example.com",
                    username: "testuser",
                    is_active: true,
                },
            };

            mockApi.post.mockResolvedValue({ data: rawResponseWithoutRefresh });

            const result = await auth.login(loginPayload);

            expect(result.accessToken).toBe("mock-token");
            expect(result.refreshToken).toBeUndefined();
        });
    });
});
