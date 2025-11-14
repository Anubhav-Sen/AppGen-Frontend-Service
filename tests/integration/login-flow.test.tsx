import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/pages/auth/LoginPage";
import { auth } from "@/api/auth";
import type { LoginResponse } from "@/api/auth";

// Mock the API module
jest.mock("@/api/auth", () => ({
    auth: {
        login: jest.fn(),
    },
}));

// Mock zustand store
let mockUser: unknown = null;
let mockAccessToken: string | null = null;
const mockSetUser = jest.fn((user) => {
    mockUser = user;
});
const mockSetAccessToken = jest.fn((token) => {
    mockAccessToken = token;
});
const mockClearAuth = jest.fn(() => {
    mockUser = null;
    mockAccessToken = null;
});

jest.mock("@/stores/authStore", () => ({
    useAuthStore: jest.fn(() => ({
        user: mockUser,
        accessToken: mockAccessToken,
        setUser: mockSetUser,
        setAccessToken: mockSetAccessToken,
        clearAuth: mockClearAuth,
    })),
}));

describe("Login Flow Integration", () => {
    const mockAuth = auth as jest.Mocked<typeof auth>;
    let queryClient: QueryClient;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUser = null;
        mockAccessToken = null;
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    });

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
        );
    };

    it("should complete full login flow successfully", async () => {
        const user = userEvent.setup();
        const mockResponse: LoginResponse = {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: {
                id: 1,
                email: "john@example.com",
                username: "johndoe",
                isActive: true,
            },
        };

        mockAuth.login.mockResolvedValue(mockResponse);

        renderWithProviders(<LoginPage />);

        // User enters credentials
        await user.type(screen.getByLabelText("Email"), "john@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");

        // User submits form
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        // API should be called
        await waitFor(() => {
            expect(mockAuth.login).toHaveBeenCalledWith({
                email: "john@example.com",
                password: "password123",
            });
        });

        // Store should be updated
        expect(mockSetUser).toHaveBeenCalledWith(mockResponse.user);

        // Success message should be displayed
        await waitFor(() => {
            expect(screen.getByText(/Welcome back, john@example.com!/i)).toBeInTheDocument();
        });
    });

    it("should handle invalid credentials error", async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    detail: "Invalid email or password",
                },
                status: 401,
            },
        };

        mockAuth.login.mockRejectedValue(mockError);

        renderWithProviders(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "john@example.com");
        await user.type(screen.getByLabelText("Password"), "wrongpassword");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
        });

        // Store should not be updated on error
        expect(mockSetUser).not.toHaveBeenCalled();
    });

    it("should validate form before API call", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginPage />);

        // Try to submit with invalid data
        await user.type(screen.getByLabelText("Email"), "invalid-email");
        await user.type(screen.getByLabelText("Password"), "short");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        // Wait for validation errors
        await waitFor(() => {
            expect(screen.getByText(/valid email/i)).toBeInTheDocument();
        });

        // API should not be called
        expect(mockAuth.login).not.toHaveBeenCalled();

        // Both validation errors should be shown
        expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
    });

    it("should clear previous errors on new submission", async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    detail: "Server error",
                },
            },
        };

        mockAuth.login.mockRejectedValueOnce(mockError);

        renderWithProviders(<LoginPage />);

        // First submission with error
        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText("Server error")).toBeInTheDocument();
        });

        // Second submission - error should be cleared during submission
        const mockResponse: LoginResponse = {
            accessToken: "token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        };
        mockAuth.login.mockResolvedValue(mockResponse);

        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        // Eventually success message appears
        await waitFor(() => {
            expect(screen.queryByText("Server error")).not.toBeInTheDocument();
            expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
        });
    });

    it("should handle network errors gracefully", async () => {
        const user = userEvent.setup();
        mockAuth.login.mockRejectedValue(new Error("Network error"));

        renderWithProviders(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/Login failed. Please check your credentials/i)
            ).toBeInTheDocument();
        });
    });

    it("should show loading state during submission", async () => {
        const user = userEvent.setup();

        // Create a promise that we can control
        let resolveLogin: (value: LoginResponse) => void;
        const loginPromise = new Promise<LoginResponse>((resolve) => {
            resolveLogin = resolve;
        });

        mockAuth.login.mockReturnValue(loginPromise);

        renderWithProviders(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        // Should show loading state
        expect(screen.getByText("Signing in...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Signing in/i })).toBeDisabled();

        // Resolve the promise
        resolveLogin!({
            accessToken: "token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        });

        // Loading state should be gone
        await waitFor(() => {
            expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Sign in/i })).not.toBeDisabled();
        });
    });
});
