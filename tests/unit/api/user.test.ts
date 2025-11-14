import { getCurrentUser } from "@/api/user";
import { api } from "@/api/client";
import type { User } from "@/types/user";

// Mock the axios client
jest.mock("@/api/client", () => ({
    api: {
        get: jest.fn(),
    },
}));

describe("user API", () => {
    const mockApi = api as jest.Mocked<typeof api>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCurrentUser", () => {
        const mockUser: User = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
            isActive: true,
        };

        it("should call GET /users/me", async () => {
            mockApi.get.mockResolvedValue({ data: mockUser });

            await getCurrentUser();

            expect(mockApi.get).toHaveBeenCalledWith("/users/me");
            expect(mockApi.get).toHaveBeenCalledTimes(1);
        });

        it("should return user data", async () => {
            mockApi.get.mockResolvedValue({ data: mockUser });

            const result = await getCurrentUser();

            expect(result).toEqual(mockUser);
            expect(result.id).toBe(1);
            expect(result.username).toBe("testuser");
            expect(result.email).toBe("test@example.com");
        });

        it("should handle unauthorized errors", async () => {
            const mockError = {
                response: {
                    data: {
                        detail: "Not authenticated",
                    },
                    status: 401,
                },
            };

            mockApi.get.mockRejectedValue(mockError);

            await expect(getCurrentUser()).rejects.toEqual(mockError);
        });

        it("should handle network errors", async () => {
            const networkError = new Error("Network error");
            mockApi.get.mockRejectedValue(networkError);

            await expect(getCurrentUser()).rejects.toThrow("Network error");
        });

        it("should return user with all required fields", async () => {
            mockApi.get.mockResolvedValue({ data: mockUser });

            const result = await getCurrentUser();

            expect(result).toHaveProperty("id");
            expect(result).toHaveProperty("username");
            expect(result).toHaveProperty("email");
        });
    });
});
