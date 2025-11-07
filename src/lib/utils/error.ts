export function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { detail?: string } } };
        return err.response?.data?.detail ?? defaultMessage;
    }
    return defaultMessage;
}
