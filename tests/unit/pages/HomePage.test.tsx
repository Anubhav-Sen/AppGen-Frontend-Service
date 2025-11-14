import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("HomePage", () => {
    it("should render welcome heading", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText("Welcome to AppGen Frontend")).toBeInTheDocument();
    });

    it("should render description text", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText(/Schema creation UI powered by React Flow/i)).toBeInTheDocument();
    });

    it("should render all feature cards", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText("Schema Management")).toBeInTheDocument();
        expect(screen.getByText("Rapid Development")).toBeInTheDocument();
        expect(screen.getByText("Type Safe")).toBeInTheDocument();
    });

    it("should render feature descriptions", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText(/Create and manage your database schemas/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate code and APIs automatically/i)).toBeInTheDocument();
        expect(screen.getByText(/Built with TypeScript/i)).toBeInTheDocument();
    });

    it("should render getting started section", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText("Getting Started")).toBeInTheDocument();
    });

    it("should render getting started steps", () => {
        renderWithRouter(<HomePage />);

        expect(screen.getByText(/Define your data models and relationships/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate backend code and API endpoints/i)).toBeInTheDocument();
        expect(screen.getByText(/Deploy and start building your application/i)).toBeInTheDocument();
    });

    it("should render Get Started button", () => {
        renderWithRouter(<HomePage />);

        const button = screen.getByRole("button", { name: /Get Started/i });
        expect(button).toBeInTheDocument();
    });

    it("should render step numbers 1, 2, 3", () => {
        renderWithRouter(<HomePage />);

        const stepNumbers = screen.getAllByText(/^[123]$/);
        expect(stepNumbers).toHaveLength(3);
    });

    it("should have correct structure with max-width container", () => {
        const { container } = renderWithRouter(<HomePage />);

        const mainContainer = container.querySelector(".max-w-5xl");
        expect(mainContainer).toBeInTheDocument();
    });

    it("should render all SVG icons", () => {
        const { container } = renderWithRouter(<HomePage />);

        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
    });

    it("should have min-h-screen class on root element", () => {
        const { container } = renderWithRouter(<HomePage />);

        const rootDiv = container.firstChild;
        expect(rootDiv).toHaveClass("min-h-screen");
    });

    it("should render feature cards in a grid layout", () => {
        const { container } = renderWithRouter(<HomePage />);

        const grid = container.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-3");
    });
});
