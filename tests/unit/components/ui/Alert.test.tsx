import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/ui/Alert";

describe("Alert", () => {
    it("should render error alert with correct styling", () => {
        render(<Alert type="error">Error message</Alert>);

        const alert = screen.getByText("Error message");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass("border-error", "bg-error-light", "text-error-dark");
    });

    it("should render success alert with correct styling", () => {
        render(<Alert type="success">Success message</Alert>);

        const alert = screen.getByText("Success message");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass("border-success", "bg-success-light", "text-success-dark");
    });

    it("should render children content", () => {
        render(
            <Alert type="error">
                <span>Custom content</span>
            </Alert>
        );

        expect(screen.getByText("Custom content")).toBeInTheDocument();
    });

    it("should apply common styles to all alerts", () => {
        const { rerender } = render(<Alert type="error">Test</Alert>);

        let alert = screen.getByText("Test");
        expect(alert).toHaveClass("mb-4", "rounded-lg", "border", "px-4", "py-3", "text-sm");

        rerender(<Alert type="success">Test</Alert>);
        alert = screen.getByText("Test");
        expect(alert).toHaveClass("mb-4", "rounded-lg", "border", "px-4", "py-3", "text-sm");
    });

    it("should render complex children", () => {
        render(
            <Alert type="success">
                <div>
                    <strong>Success!</strong>
                    <p>Operation completed</p>
                </div>
            </Alert>
        );

        expect(screen.getByText("Success!")).toBeInTheDocument();
        expect(screen.getByText("Operation completed")).toBeInTheDocument();
    });
});
