import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "../../api/auth";

const loginSchema = z.object({
    email: z.email("Please enter a valid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
}); 

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data: LoginFormValues) => { 
        setServerError(null);
        setServerSuccess(null);
        
        try {
            const response = await auth.login({
                email: data.email,
                password: data.password,
            });

            setServerSuccess(`Welcome back, ${response.user.email}!`);
            reset({ email: data.email, password: "" });

        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "response" in error) {
                
                const err = error as { response?: { data?: { detail?: string }}};

                setServerError(
                    err.response?.data?.detail ??
                    "Login failed. Please check your credentials and try again.",
                );
            } else {
                setServerError(
                    "Something went wrong while logging you in. Please try again.",
                );
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-2 border-secondary-300">
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Sign in to AppGen
            </h1>
            <p className="text-sm text-secondary-600 mb-6">
            Continue designing and generating your backends API's.
            </p>

            {serverError && (
            <div className="mb-4 rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error-dark">
                {serverError}
            </div>
            )}

            {serverSuccess && (
            <div className="mb-4 rounded-lg border border-success bg-success-light px-4 py-3 text-sm text-success-dark">
                {serverSuccess}
            </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
                <label
                htmlFor="email"
                className="text-sm font-medium text-secondary-900"
                >
                Email
                </label>
                <input
                id="email"
                type="email"
                autoComplete="email"
                className={`rounded-lg border bg-white px-3 py-2.5 text-sm text-secondary-900 outline-none transition focus:ring-2 ${
                    errors.email
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20"
                }`}
                {...register("email")}
                />
                {errors.email && (
                <p className="text-xs text-error mt-1">
                    {errors.email.message}
                </p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                htmlFor="password"
                className="text-sm font-medium text-secondary-900"
                >
                Password
                </label>
                <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`rounded-lg border bg-white px-3 py-2.5 text-sm text-secondary-900 outline-none transition focus:ring-2 ${
                    errors.password
                    ? "border-error focus:border-error focus:ring-error/20"
                    : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20"
                }`}
                {...register("password")}
                />
                {errors.password && (
                <p className="text-xs text-error mt-1">
                    {errors.password.message}
                </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            </form>

            <p className="mt-6 text-sm text-center text-secondary-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                Sign up
            </a>
            </p>
        </div>
        </div>
    );
}

export default LoginPage;
