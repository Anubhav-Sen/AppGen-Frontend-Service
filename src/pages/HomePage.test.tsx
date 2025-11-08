import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

describe("HomePage", () => {
    it("should render welcome heading", () => {
        render(<HomePage />);

        expect(screen.getByText("Welcome to AppGen Frontend")).toBeInTheDocument();
    });

    it("should render description text", () => {
        render(<HomePage />);

        expect(screen.getByText(/Schema creation UI powered by React Flow/i)).toBeInTheDocument();
    });

    it("should render all feature cards", () => {
        render(<HomePage />);

        expect(screen.getByText("Schema Management")).toBeInTheDocument();
        expect(screen.getByText("Rapid Development")).toBeInTheDocument();
        expect(screen.getByText("Type Safe")).toBeInTheDocument();
    });

    it("should render feature descriptions", () => {
        render(<HomePage />);

        expect(screen.getByText(/Create and manage your database schemas/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate code and APIs automatically/i)).toBeInTheDocument();
        expect(screen.getByText(/Built with TypeScript/i)).toBeInTheDocument();
    });

    it("should render getting started section", () => {
        render(<HomePage />);

        expect(screen.getByText("Getting Started")).toBeInTheDocument();
    });

    it("should render getting started steps", () => {
        render(<HomePage />);

        expect(screen.getByText(/Define your data models and relationships/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate backend code and API endpoints/i)).toBeInTheDocument();
        expect(screen.getByText(/Deploy and start building your application/i)).toBeInTheDocument();
    });

    it("should render Get Started button", () => {
        render(<HomePage />);

        const button = screen.getByRole("button", { name: /Get Started/i });
        expect(button).toBeInTheDocument();
    });

    it("should render step numbers 1, 2, 3", () => {
        render(<HomePage />);

        const stepNumbers = screen.getAllByText(/^[123]$/);
        expect(stepNumbers).toHaveLength(3);
    });

    it("should have correct structure with max-width container", () => {
        const { container } = render(<HomePage />);

        const mainContainer = container.querySelector(".max-w-5xl");
        expect(mainContainer).toBeInTheDocument();
    });

    it("should render all SVG icons", () => {
        const { container } = render(<HomePage />);

        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
    });

    it("should have min-h-screen class on root element", () => {
        const { container } = render(<HomePage />);

        const rootDiv = container.firstChild;
        expect(rootDiv).toHaveClass("min-h-screen");
    });

    it("should render feature cards in a grid layout", () => {
        const { container } = render(<HomePage />);

        const grid = container.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-3");
    });
});
