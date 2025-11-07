import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, id, className = "", ...props }, ref) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-secondary-900"
                >
                    {label}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    className={`rounded-lg border bg-white px-3 py-2.5 text-sm text-secondary-900 outline-none transition focus:ring-2 ${
                        error
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-error mt-1">{error.message}</p>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
