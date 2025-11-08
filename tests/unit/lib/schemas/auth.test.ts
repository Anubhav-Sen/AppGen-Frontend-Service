import { loginSchema } from "@/lib/schemas/auth";

describe("loginSchema", () => {
    describe("email validation", () => {
        it("should accept valid email", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "password123",
            });
            expect(result.success).toBe(true);
        });

        it("should reject invalid email format", () => {
            const result = loginSchema.safeParse({
                email: "invalid-email",
                password: "password123",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain("valid email");
            }
        });

        it("should reject empty email", () => {
            const result = loginSchema.safeParse({
                email: "",
                password: "password123",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain("Email is required");
            }
        });
    });

    describe("password validation", () => {
        it("should accept password with 8 or more characters", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "password123",
            });
            expect(result.success).toBe(true);
        });

        it("should reject password with less than 8 characters", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "short",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain("8 characters");
            }
        });

        it("should reject empty password", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("complete validation", () => {
        it("should accept valid login credentials", () => {
            const result = loginSchema.safeParse({
                email: "user@domain.com",
                password: "securepass123",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe("user@domain.com");
                expect(result.data.password).toBe("securepass123");
            }
        });

        it("should reject when both fields are invalid", () => {
            const result = loginSchema.safeParse({
                email: "invalid",
                password: "short",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
            }
        });

        it("should reject when fields are missing", () => {
            const result = loginSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });
});
