interface ValidationError {
    type: string;
    loc: (string | number)[];
    msg: string;
    input?: unknown;
}

interface ErrorResponse {
    detail?: string | ValidationError[];
}

export function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: ErrorResponse } };
        const detail = err.response?.data?.detail;

        if (typeof detail === "string") {
            return detail;
        }

        if (Array.isArray(detail) && detail.length > 0) {
            const firstError = detail[0];
            return firstError.msg || defaultMessage;
        }
    }
    return defaultMessage;
}
