import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { updateUser, changePassword } from "@/api/user";
import { getErrorMessage } from "@/lib/utils/error";
import { FormInput } from "@/components/ui/FormInput";
import { Alert } from "@/components/ui/Alert";

const updateProfileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must not exceed 30 characters"),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ManageAccountPage() {
    const { user, setUser } = useAuthStore();
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            username: user?.username || "",
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onUpdateProfile = async (data: UpdateProfileFormValues) => {
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const updatedUser = await updateUser({
                username: data.username,
            });
            setUser(updatedUser);
            setProfileSuccess("Profile updated successfully!");
            setTimeout(() => setProfileSuccess(null), 3000);
        } catch (error: unknown) {
            setProfileError(getErrorMessage(error, "Failed to update profile"));
        }
    };

    const onChangePassword = async (data: ChangePasswordFormValues) => {
        setPasswordError(null);
        setPasswordSuccess(null);

        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setPasswordSuccess("Password changed successfully!");
            resetPasswordForm();
            setTimeout(() => setPasswordSuccess(null), 3000);
        } catch (error: unknown) {
            setPasswordError(getErrorMessage(error, "Failed to change password"));
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Account Settings</h1>
                <p className="text-secondary-600 mb-8">Manage your account information and security</p>

                <div className="space-y-6">
                    {/* Profile Information Section */}
                    <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
                        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Profile Information</h2>

                        {profileError && <Alert type="error">{profileError}</Alert>}
                        {profileSuccess && <Alert type="success">{profileSuccess}</Alert>}

                        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-5" noValidate>
                            <FormInput
                                label="Username"
                                type="text"
                                autoComplete="username"
                                error={profileErrors.username}
                                {...registerProfile("username")}
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full rounded-lg border border-secondary-300 bg-secondary-100 px-4 py-2.5 text-secondary-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-secondary-500">Email cannot be changed as it is used for login</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmittingProfile}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmittingProfile ? "Updating..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
                        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Change Password</h2>

                        {passwordError && <Alert type="error">{passwordError}</Alert>}
                        {passwordSuccess && <Alert type="success">{passwordSuccess}</Alert>}

                        <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-5" noValidate>
                            <FormInput
                                label="Current Password"
                                type="password"
                                autoComplete="current-password"
                                error={passwordErrors.currentPassword}
                                {...registerPassword("currentPassword")}
                            />

                            <FormInput
                                label="New Password"
                                type="password"
                                autoComplete="new-password"
                                error={passwordErrors.newPassword}
                                {...registerPassword("newPassword")}
                            />

                            <FormInput
                                label="Confirm New Password"
                                type="password"
                                autoComplete="new-password"
                                error={passwordErrors.confirmPassword}
                                {...registerPassword("confirmPassword")}
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmittingPassword}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-primary-glow transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmittingPassword ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Account Info Section */}
                    <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6">
                        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Account Information</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-secondary-100">
                                <span className="text-secondary-600">Account Status</span>
                                <span className={`font-medium ${user?.isActive ? "text-green-600" : "text-red-600"}`}>
                                    {user?.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
