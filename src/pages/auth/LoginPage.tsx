import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "../../lib/schemas/auth";
import { getErrorMessage } from "../../lib/utils/error";
import { FormInput } from "../../components/ui/FormInput";
import { Alert } from "../../components/ui/Alert";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
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
            const response = await login(data);
            setServerSuccess(`Welcome back, ${response.user.email}!`);
            reset({ email: data.email, password: "" });
        } catch (error: unknown) {
            setServerError(
                getErrorMessage(
                    error,
                    "Login failed. Please check your credentials and try again."
                )
            );
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

                {serverError && <Alert type="error">{serverError}</Alert>}
                {serverSuccess && <Alert type="success">{serverSuccess}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FormInput
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email}
                        {...register("email")}
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        error={errors.password}
                        {...register("password")}
                    />

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
};

export default LoginPage;
