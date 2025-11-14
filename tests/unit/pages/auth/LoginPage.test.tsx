import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/pages/auth/LoginPage";
import { useAuth } from "@/hooks/useAuth";
import type { LoginResponse } from "@/api/auth";

// Mock the useAuth hook
jest.mock("@/hooks/useAuth", () => ({
    useAuth: jest.fn(),
}));

describe("LoginPage", () => {
    const mockLogin = jest.fn();
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null,
            login: mockLogin,
            logout: jest.fn(),
        });
    });

    it("should render login form", () => {
        render(<LoginPage />);

        expect(screen.getByText("Sign in to AppGen")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    });

    it("should render description text", () => {
        render(<LoginPage />);

        expect(screen.getByText(/Continue designing and generating/i)).toBeInTheDocument();
    });

    it("should render signup link", () => {
        render(<LoginPage />);

        const signupLink = screen.getByText("Sign up");
        expect(signupLink).toBeInTheDocument();
        expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("should submit form with valid credentials", async () => {
        const user = userEvent.setup();
        const mockResponse: LoginResponse = {
            accessToken: "token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        };
        mockLogin.mockResolvedValue(mockResponse);

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
        });
    });

    it("should show success message on successful login", async () => {
        const user = userEvent.setup();
        const mockResponse: LoginResponse = {
            accessToken: "token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        };
        mockLogin.mockResolvedValue(mockResponse);

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Welcome back, test@example.com!/i)).toBeInTheDocument();
        });
    });

    it("should show error message on failed login", async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue({
            response: {
                data: {
                    detail: "Invalid credentials",
                },
            },
        });

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "wrongpassword");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        });
    });

    it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "invalid-email");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show validation error for short password", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "short");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should disable submit button while submitting", async () => {
        const user = userEvent.setup();
        mockLogin.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");

        const submitButton = screen.getByRole("button", { name: /Sign in/i });
        await user.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    it("should have correct input types", () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Password");

        expect(emailInput).toHaveAttribute("type", "email");
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have autocomplete attributes", () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Password");

        expect(emailInput).toHaveAttribute("autocomplete", "email");
        expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });

    it("should clear password field after successful login", async () => {
        const user = userEvent.setup();
        const mockResponse: LoginResponse = {
            accessToken: "token",
            user: {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                isActive: true,
            },
        };
        mockLogin.mockResolvedValue(mockResponse);

        render(<LoginPage />);

        const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(passwordInput.value).toBe("");
        });
    });

    it("should show default error message for network errors", async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error("Network error"));

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/Login failed. Please check your credentials/i)
            ).toBeInTheDocument();
        });
    });
});
