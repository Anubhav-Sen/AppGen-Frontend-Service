import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";
import { getErrorMessage } from "@/lib/utils/error";
import { FormInput } from "@/components/ui/FormInput";
import { Alert } from "@/components/ui/Alert";
import { auth } from "@/api/auth";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setServerError(null);
        setServerSuccess(null);

        try {
            await auth.register({
                email: data.email,
                username: data.username,
                password: data.password,
            });
            setServerSuccess("Account created successfully! Redirecting to login...");
            reset();
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: unknown) {
            setServerError(
                getErrorMessage(
                    error,
                    "Registration failed. Please try again."
                )
            );
        }
    };

    return (
        <div className="h-full flex items-center justify-center bg-secondary-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-2 border-secondary-300">
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                    Create your account
                </h1>
                <p className="text-sm text-secondary-600 mb-6">
                    Start designing and generating your backend APIs.
                </p>

                {serverError && <Alert type="error">{serverError}</Alert>}
                {serverSuccess && <Alert type="success">{serverSuccess}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <FormInput
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email}
                        {...register("email")}
                    />

                    <FormInput
                        label="Username"
                        type="text"
                        autoComplete="username"
                        error={errors.username}
                        {...register("username")}
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        error={errors.password}
                        {...register("password")}
                    />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        autoComplete="new-password"
                        error={errors.confirmPassword}
                        {...register("confirmPassword")}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center text-secondary-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
