import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SampleForm from "@/components/SampleForm";

describe("SampleForm", () => {
    it("should render form with name and email fields", () => {
        render(<SampleForm />);

        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
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

    it("should show validation error for empty name", async () => {
        const user = userEvent.setup();
        render(<SampleForm />);

        await user.type(screen.getByLabelText("Email"), "test@example.com");
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
            expect(screen.getByText("Required")).toBeInTheDocument();
        });
    });

    it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        render(<SampleForm />);

        const nameInput = screen.getByLabelText("Name");
        const emailInput = screen.getByLabelText("Email");

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "invalid-email");
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
            // Zod email validation message shows "Invalid email"
            expect(screen.getByText("Invalid email")).toBeInTheDocument();
        });
    });

    it("should show multiple validation errors", async () => {
        const user = userEvent.setup();
        render(<SampleForm />);

        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
            expect(screen.getByText("Required")).toBeInTheDocument();
        });
    });

    it("should clear errors when valid input is provided", async () => {
        const user = userEvent.setup();
        render(<SampleForm />);

        // Trigger validation error
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
            expect(screen.getByText("Required")).toBeInTheDocument();
        });

        // Fix the error
        await user.type(screen.getByLabelText("Name"), "John Doe");
        await user.type(screen.getByLabelText("Email"), "john@example.com");

        await waitFor(() => {
            expect(screen.queryByText("Required")).not.toBeInTheDocument();
        });
    });

    it("should have correct input placeholders", () => {
        render(<SampleForm />);

        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });

    it("should have email input type for email field", () => {
        render(<SampleForm />);

        const emailInput = screen.getByLabelText("Email");
        expect(emailInput).toHaveAttribute("type", "email");
    });
});
