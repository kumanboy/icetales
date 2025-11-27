"use client";

import * as React from "react";
import { create } from "zustand";

type Toast = {
    id: string;
    message: string;
    type: "success" | "error";
    duration?: number;
};

type ToastStore = {
    toasts: Toast[];
    addToast: (message: string, type?: "success" | "error", duration?: number) => void;
    removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = "success", duration = 3000) => {
        const id = Math.random().toString(36).substring(2);
        set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
        setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), duration);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
    const { toasts } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`rounded-md px-4 py-2 shadow-md text-white ${
                        toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
