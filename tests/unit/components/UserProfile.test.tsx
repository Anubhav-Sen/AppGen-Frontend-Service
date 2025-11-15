import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");

const mockUseAuthStore = useAuthStore as unknown as jest.MockedFunction<typeof useAuthStore>;
const mockClearAuth = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("UserProfile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns null when user is not logged in", () => {
        mockUseAuthStore.mockReturnValue({
            user: null,
            clearAuth: mockClearAuth,
        } as any);

        const { container } = render(
            <MemoryRouter>
                <UserProfile />
            </MemoryRouter>
        );

        expect(container.firstChild).toBeNull();
    });

    it("displays user initial from username", () => {
        mockUseAuthStore.mockReturnValue({
            user: { id: 1, username: "testuser", email: "test@example.com", isActive: true },
            clearAuth: mockClearAuth,
        } as any);

        render(
            <MemoryRouter>
                <UserProfile />
            </MemoryRouter>
        );

        expect(screen.getByText("T")).toBeInTheDocument();
    });

    it("opens dropdown when clicked", async () => {
        mockUseAuthStore.mockReturnValue({
            user: { id: 1, username: "testuser", email: "test@example.com", isActive: true },
            clearAuth: mockClearAuth,
        } as any);

        render(
            <MemoryRouter>
                <UserProfile />
            </MemoryRouter>
        );

        const button = screen.getByText("T");
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText("testuser")).toBeInTheDocument();
            expect(screen.getByText("test@example.com")).toBeInTheDocument();
            expect(screen.getByText("Manage Account")).toBeInTheDocument();
            expect(screen.getByText("Logout")).toBeInTheDocument();
        });
    });

    it("calls logout and navigates when logout is clicked", async () => {
        mockUseAuthStore.mockReturnValue({
            user: { id: 1, username: "testuser", email: "test@example.com", isActive: true },
            clearAuth: mockClearAuth,
        } as any);

        render(
            <MemoryRouter>
                <UserProfile />
            </MemoryRouter>
        );

        const button = screen.getByText("T");
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText("Logout")).toBeInTheDocument();
        });

        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(mockClearAuth).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
