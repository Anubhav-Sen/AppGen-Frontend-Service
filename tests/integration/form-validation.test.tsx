import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SampleForm from "@/components/SampleForm";
import LoginPage from "@/pages/auth/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the auth module
jest.mock("@/api/auth", () => ({
    auth: {
        login: jest.fn(),
    },
}));

// Mock the auth store
jest.mock("@/stores/authStore", () => ({
    useAuthStore: jest.fn(() => ({
        user: null,
        setUser: jest.fn(),
    })),
}));

describe("Form Validation Integration", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
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

    describe("SampleForm validation", () => {
        it("should validate all fields before submission", async () => {
            const user = userEvent.setup();
            render(<SampleForm />);

            // Submit without filling fields
            await user.click(screen.getByRole("button", { name: "Submit" }));

            await waitFor(() => {
                expect(screen.getByText("Required")).toBeInTheDocument();
            });
        });

        it("should validate email format", async () => {
            const user = userEvent.setup();
            render(<SampleForm />);

            await user.type(screen.getByLabelText("Name"), "John Doe");
            await user.type(screen.getByLabelText("Email"), "not-an-email");
            await user.click(screen.getByRole("button", { name: "Submit" }));

            await waitFor(() => {
                expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
            });
        });

        it("should allow submission with valid data", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            const user = userEvent.setup();
            render(<SampleForm />);

            await user.type(screen.getByLabelText("Name"), "John Doe");
            await user.type(screen.getByLabelText("Email"), "john@example.com");
            await user.click(screen.getByRole("button", { name: "Submit" }));

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith("FormData", {
                    name: "John Doe",
                    email: "john@example.com",
                });
            });

            consoleLogSpy.mockRestore();
        });
    });

    describe("LoginPage validation", () => {
        it("should validate email format", async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginPage />);

            const emailInput = screen.getByLabelText("Email");
            const passwordInput = screen.getByLabelText("Password");

            await user.type(emailInput, "invalid");
            await user.type(passwordInput, "password123");
            await user.click(screen.getByRole("button", { name: /Sign in/i }));

            await waitFor(
                () => {
                    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
                },
                { timeout: 5000 }
            );
        });

        it("should validate password length", async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginPage />);

            await user.type(screen.getByLabelText("Email"), "test@example.com");
            await user.type(screen.getByLabelText("Password"), "short");
            await user.click(screen.getByRole("button", { name: /Sign in/i }));

            await waitFor(() => {
                expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
            });
        });

        it("should validate both fields are required", async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginPage />);

            await user.click(screen.getByRole("button", { name: /Sign in/i }));

            await waitFor(() => {
                const errors = screen.queryAllByText(/required|valid email/i);
                expect(errors.length).toBeGreaterThan(0);
            });
        });

        it("should show required field errors", async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginPage />);

            await user.click(screen.getByRole("button", { name: /Sign in/i }));

            await waitFor(
                () => {
                    const errors = screen.queryAllByText(/required|valid email/i);
                    expect(errors.length).toBeGreaterThan(0);
                },
                { timeout: 5000 }
            );
        });
    });

});
