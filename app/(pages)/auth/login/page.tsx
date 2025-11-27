"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/app/_components/Header/Header";
import { useAuth } from "@/app/_context/AuthContext";
import { useToastStore } from "@/components/ui/use-toast";

type LoginForm = {
    email: string;
    password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm | "general", string>>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const { addToast } = useToastStore();

    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<LoginErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof LoginForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

    const validate = (): LoginErrors => {
        const newErrors: LoginErrors = {};

        if (!form.email.trim()) {
            newErrors.email = "Email is required.";
        } else {
            const emailPattern = /^\S+@\S+\.\S+$/;
            if (!emailPattern.test(form.email.trim())) {
                newErrors.email = "Please enter a valid email address.";
            }
        }

        if (!form.password) {
            newErrors.password = "Password is required.";
        }

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
            await login({
                email: form.email.trim(),
                password: form.password,
            });

            addToast("Logged in successfully!", "success");

            const next = searchParams.get("next") || "/";
            router.push(next);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to log in.";
            setErrors((prev) => ({
                ...prev,
                general: message,
            }));
            addToast("Login failed: " + message, "error");
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
                            Log in
                        </h1>
                        <p className="mb-6 text-sm text-gray-500">
                            Enter your email and password.
                        </p>

                        {errors.general && (
                            <p className="mb-4 text-sm text-pink-500">
                                {errors.general}
                            </p>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                                    <p className="text-xs text-pink-500">
                                        {errors.email}
                                    </p>
                                )}
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
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.password
                                            ? "border-pink-500"
                                            : "border-gray-200 focus:border-pink-500"
                                    }`}
                                />
                                {errors.password && (
                                    <p className="text-xs text-pink-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? "Logging in..." : "Log in"}
                            </button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/auth/register")}
                                className="font-medium text-pink-500 hover:underline"
                            >
                                Create an account
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
