"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/_components/Header/Header";
import { useAuth } from "@/app/_context/AuthContext";
import { useToastStore } from "@/components/ui/use-toast";

type RegisterForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm | "general", string>>;

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const { addToast } = useToastStore();

    const [form, setForm] = useState<RegisterForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<RegisterErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof RegisterForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
            general: undefined,
        }));
    };

    const validate = (): RegisterErrors => {
        const newErrors: RegisterErrors = {};

        if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
        if (!form.email.trim()) newErrors.email = "Email is required.";
        else {
            const emailPattern = /^\S+@\S+\.\S+$/;
            if (!emailPattern.test(form.email.trim()))
                newErrors.email = "Please enter a valid email address.";
        }
        if (!form.password)
            newErrors.password = "Password is required.";
        else if (form.password.length < 8)
            newErrors.password = "Password must be at least 8 characters.";
        if (!form.confirmPassword)
            newErrors.confirmPassword = "Please confirm your password.";
        else if (form.confirmPassword !== form.password)
            newErrors.confirmPassword = "Passwords do not match.";

        return newErrors;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors((prev) => ({ ...prev, general: undefined }));

        try {
            await register({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                password: form.password,
                confirmPassword: form.confirmPassword,
            });

            addToast("Account created successfully!", "success");
            router.push("/");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to create account.";
            setErrors((prev) => ({ ...prev, general: message }));
            addToast("Registration failed: " + message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            <main className="min-h-screen bg-white">
                <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 lg:px-0">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <h1 className="mb-2 text-xl font-semibold text-gray-900">
                            Create an account
                        </h1>
                        <p className="mb-6 text-sm text-gray-500">
                            Fill in your details to register.
                        </p>

                        {errors.general && (
                            <p className="mb-4 text-sm text-pink-500">{errors.general}</p>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                            {/* First name */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="firstName"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    value={form.firstName}
                                    onChange={(e) => handleChange("firstName", e.target.value)}
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.firstName
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-pink-500">{errors.firstName}</p>
                                )}
                            </div>

                            {/* Last name */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="lastName"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    value={form.lastName}
                                    onChange={(e) => handleChange("lastName", e.target.value)}
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.lastName
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-pink-500">{errors.lastName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.email
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-pink-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="phone"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Phone number{" "}
                                    <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.password
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                <p className="text-xs text-gray-400">At least 8 characters.</p>
                                {errors.password && (
                                    <p className="text-xs text-pink-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={(e) =>
                                        handleChange("confirmPassword", e.target.value)
                                    }
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.confirmPassword
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-pink-500">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? "Creating account..." : "Sign up"}
                            </button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/auth/login")}
                                className="font-medium text-pink-500 hover:underline"
                            >
                                Log in
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
