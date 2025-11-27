"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/app/_components/Header/Header";
import { useCountry } from "@/app/_context/CountryContext";
import {
    getMyOrdersApi,
    type ApiOrder,
    type ApiResponse,
    type MyOrdersResponse,
} from "@/app/_api/orders";

type LoadingState = "idle" | "loading" | "success" | "error";

export default function MyOrdersPage() {
    const { formatPrice } = useCountry();

    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [status, setStatus] = useState<LoadingState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadOrders() {
            setStatus("loading");
            setErrorMessage(null);

            try {
                const res: ApiResponse<MyOrdersResponse> = await getMyOrdersApi();

                if (!isMounted) return;

                setOrders(res.data ?? []);
                setStatus("success");
            } catch (err) {
                if (!isMounted) return;

                const msg =
                    err instanceof Error && err.message
                        ? err.message
                        : "Failed to load orders.";
                setErrorMessage(msg);
                setStatus("error");
            }
        }

        loadOrders();

        return () => {
            isMounted = false;
        };
    }, []);

    function formatDate(iso: string) {
        if (!iso) return "-";
        const d = new Date(iso);
        return d.toLocaleString();
    }

    function statusBadgeClasses(status: string): string {
        switch (status) {
            case "NEW":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "IN_PROGRESS":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "COMPLETED":
                return "bg-green-50 text-green-700 border-green-200";
            case "CANCELLED":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    }

    return (
        <>
            <Header />

            <main className="min-h-screen bg-white px-4 py-10">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-xl font-semibold text-gray-900">
                            My Orders
                        </h1>
                        <p className="text-xs text-gray-500">
                            All your past orders in one place.
                        </p>
                    </div>

                    {/* Loading / Error states */}
                    {status === "loading" && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                            Loading your orders...
                        </div>
                    )}

                    {status === "error" && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {errorMessage ?? "Failed to load orders."}
                        </div>
                    )}

                    {/* Empty state */}
                    {status === "success" && orders.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-600">
                            You don’t have any orders yet.
                            <br />
                            <span className="text-gray-500 text-xs">
                Start by adding some items to your cart and checking out.
              </span>
                        </div>
                    )}

                    {/* Orders list */}
                    {status === "success" && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Order Number</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {order.orderNumber}
                                            </p>
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                      <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadgeClasses(
                              order.status
                          )}`}
                      >
                        {order.status}
                      </span>

                                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700">
                        {order.fulfillmentMethod}
                      </span>

                                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700">
                        {order.paymentMethod}
                      </span>

                                            <span className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
