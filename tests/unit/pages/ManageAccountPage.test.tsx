import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ManageAccountPage from "@/pages/ManageAccountPage";
import { useAuthStore } from "@/stores/authStore";
import * as userApi from "@/api/user";

jest.mock("@/stores/authStore");
jest.mock("@/api/user");

const mockUseAuthStore = useAuthStore as unknown as jest.MockedFunction<typeof useAuthStore>;
const mockUpdateUser = userApi.updateUser as jest.MockedFunction<typeof userApi.updateUser>;
const mockChangePassword = userApi.changePassword as jest.MockedFunction<typeof userApi.changePassword>;
const mockSetUser = jest.fn();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("ManageAccountPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuthStore.mockReturnValue({
            user: { id: 1, username: "testuser", email: "test@example.com", isActive: true },
            setUser: mockSetUser,
        } as any);
    });

    it("renders the page with user information", () => {
        render(<ManageAccountPage />, { wrapper });

        expect(screen.getByText("Account Settings")).toBeInTheDocument();
        expect(screen.getByText("Profile Information")).toBeInTheDocument();
        expect(screen.getByText("Change Password")).toBeInTheDocument();
        expect(screen.getByText("Account Information")).toBeInTheDocument();
    });

    it("displays default user values in form", () => {
        render(<ManageAccountPage />, { wrapper });

        const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;
        const emailInput = screen.getByLabelText("Email") as HTMLInputElement;

        expect(usernameInput.value).toBe("testuser");
        expect(emailInput.value).toBe("test@example.com");
    });

    it("updates profile successfully", async () => {
        const updatedUser = { id: 1, username: "newusername", email: "new@example.com", isActive: true };
        mockUpdateUser.mockResolvedValue(updatedUser);

        render(<ManageAccountPage />, { wrapper });

        const usernameInput = screen.getByLabelText("Username");
        const updateButton = screen.getByRole("button", { name: /update profile/i });

        await userEvent.clear(usernameInput);
        await userEvent.type(usernameInput, "newusername");
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({
                username: "newusername",
                email: "test@example.com",
            });
            expect(mockSetUser).toHaveBeenCalledWith(updatedUser);
            expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
        });
    });

    it("changes password successfully", async () => {
        mockChangePassword.mockResolvedValue();

        render(<ManageAccountPage />, { wrapper });

        const currentPasswordInput = screen.getByLabelText("Current Password");
        const newPasswordInput = screen.getByLabelText("New Password");
        const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
        const changePasswordButton = screen.getByRole("button", { name: /change password/i });

        await userEvent.type(currentPasswordInput, "oldpassword123");
        await userEvent.type(newPasswordInput, "newpassword123");
        await userEvent.type(confirmPasswordInput, "newpassword123");
        fireEvent.click(changePasswordButton);

        await waitFor(() => {
            expect(mockChangePassword).toHaveBeenCalledWith({
                currentPassword: "oldpassword123",
                newPassword: "newpassword123",
            });
            expect(screen.getByText("Password changed successfully!")).toBeInTheDocument();
        });
    });

    it("validates password confirmation", async () => {
        render(<ManageAccountPage />, { wrapper });

        const currentPasswordInput = screen.getByLabelText("Current Password");
        const newPasswordInput = screen.getByLabelText("New Password");
        const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
        const changePasswordButton = screen.getByRole("button", { name: /change password/i });

        await userEvent.type(currentPasswordInput, "oldpassword123");
        await userEvent.type(newPasswordInput, "newpassword123");
        await userEvent.type(confirmPasswordInput, "differentpassword");
        fireEvent.click(changePasswordButton);

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
            expect(mockChangePassword).not.toHaveBeenCalled();
        });
    });

    it("displays account information", () => {
        render(<ManageAccountPage />, { wrapper });

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
    });
});
