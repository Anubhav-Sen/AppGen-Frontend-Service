import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import type { FieldError } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";

// Helper component to test FormInput with react-hook-form
function FormInputWrapper({
    defaultValue = "",
    error,
    label = "Test Label",
    ...props
}: {
    defaultValue?: string;
    error?: FieldError;
    label?: string;
    [key: string]: unknown;
}) {
    const { register } = useForm({
        defaultValues: { test: defaultValue },
    });

    return <FormInput label={label} error={error} {...register("test")} {...props} />;
}

describe("FormInput", () => {
    it("should render input with label", () => {
        render(<FormInputWrapper label="Email" />);

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should generate id from label when no id provided", () => {
        render(<FormInputWrapper label="Email Address" />);

        const input = screen.getByLabelText("Email Address");
        expect(input).toHaveAttribute("id", "email-address");
    });

    it("should use provided id when given", () => {
        render(<FormInputWrapper label="Email" id="custom-id" />);

        const input = screen.getByLabelText("Email");
        expect(input).toHaveAttribute("id", "custom-id");
    });

    it("should display error message when error prop is provided", () => {
        const error: FieldError = {
            type: "required",
            message: "This field is required",
        };

        render(<FormInputWrapper error={error} />);

        expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should apply error styles when error prop is provided", () => {
        const error: FieldError = {
            type: "required",
            message: "Error message",
        };

        render(<FormInputWrapper error={error} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveClass("border-error", "focus:border-error", "focus:ring-error/20");
    });

    it("should apply normal styles when no error", () => {
        render(<FormInputWrapper />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveClass(
            "border-secondary-300",
            "focus:border-primary-500",
            "focus:ring-primary-500/20"
        );
    });

    it("should accept user input", async () => {
        const user = userEvent.setup();
        render(<FormInputWrapper />);

        const input = screen.getByRole("textbox") as HTMLInputElement;
        await user.type(input, "test value");

        expect(input.value).toBe("test value");
    });

    it("should forward HTML input attributes", () => {
        render(
            <FormInputWrapper
                type="email"
                placeholder="Enter email"
                autoComplete="email"
            />
        );

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("type", "email");
        expect(input).toHaveAttribute("placeholder", "Enter email");
        expect(input).toHaveAttribute("autocomplete", "email");
    });

    it("should merge custom className with default classes", () => {
        render(<FormInputWrapper className="custom-class" />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveClass("custom-class", "rounded-lg", "border");
    });

    it("should render password input type", () => {
        render(<FormInputWrapper label="Password" type="password" />);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("type", "password");
    });

    it("should handle disabled state", () => {
        render(<FormInputWrapper disabled />);

        const input = screen.getByRole("textbox");
        expect(input).toBeDisabled();
    });

    it("should not show error message when no error", () => {
        render(<FormInputWrapper />);

        const errorElement = screen.queryByText(/required|error/i);
        expect(errorElement).not.toBeInTheDocument();
    });
});
