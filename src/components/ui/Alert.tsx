import type { ReactNode } from "react";

interface AlertProps {
    type: "error" | "success";
    children: ReactNode;
}

export function Alert({ type, children }: AlertProps) {
    const styles = {
        error: "border-error bg-error-light text-error-dark",
        success: "border-success bg-success-light text-success-dark",
    };

    return (
        <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
        >
            {children}
        </div>
    );
}
