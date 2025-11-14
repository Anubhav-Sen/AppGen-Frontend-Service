import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    username: z.string().min(3, "Username must be at least 3 characters long").max(30, "Username must not exceed 30 characters"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
