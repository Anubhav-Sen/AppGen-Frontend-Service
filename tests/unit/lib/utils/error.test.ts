import { getErrorMessage } from "@/lib/utils/error";

describe("getErrorMessage", () => {
    it("should return default message for non-object errors", () => {
        const result = getErrorMessage("string error", "Default message");
        expect(result).toBe("Default message");
    });

    it("should return default message for null errors", () => {
        const result = getErrorMessage(null, "Default message");
        expect(result).toBe("Default message");
    });

    it("should return default message for undefined errors", () => {
        const result = getErrorMessage(undefined, "Default message");
        expect(result).toBe("Default message");
    });

    it("should extract error detail from API response", () => {
        const error = {
            response: {
                data: {
                    detail: "Invalid credentials",
                },
            },
        };
        const result = getErrorMessage(error, "Default message");
        expect(result).toBe("Invalid credentials");
    });

    it("should return default message when response has no detail", () => {
        const error = {
            response: {
                data: {},
            },
        };
        const result = getErrorMessage(error, "Default message");
        expect(result).toBe("Default message");
    });

    it("should return default message when response has no data", () => {
        const error = {
            response: {},
        };
        const result = getErrorMessage(error, "Default message");
        expect(result).toBe("Default message");
    });

    it("should return default message for objects without response property", () => {
        const error = {
            message: "Some error",
        };
        const result = getErrorMessage(error, "Default message");
        expect(result).toBe("Default message");
    });

    it("should handle nested null/undefined values gracefully", () => {
        const error = {
            response: {
                data: {
                    detail: undefined,
                },
            },
        };
        const result = getErrorMessage(error, "Default message");
        expect(result).toBe("Default message");
    });
});
