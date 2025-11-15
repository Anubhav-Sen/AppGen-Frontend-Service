import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import PublicRoute from "@/components/PublicRoute";

jest.mock("@/stores/authStore", () => ({
    useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe("PublicRoute", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders children when user is not authenticated", () => {
        mockUseAuthStore.mockImplementation((selector: any) => selector({ accessToken: null }));

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <div>Login Page</div>
                            </PublicRoute>
                        }
                    />
                    <Route path="/projects" element={<div>Projects Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Projects Page")).not.toBeInTheDocument();
    });

    it("redirects to /projects when user is authenticated", () => {
        mockUseAuthStore.mockImplementation((selector: any) => selector({ accessToken: "fake-token" }));

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <div>Login Page</div>
                            </PublicRoute>
                        }
                    />
                    <Route path="/projects" element={<div>Projects Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Projects Page")).toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });
});
