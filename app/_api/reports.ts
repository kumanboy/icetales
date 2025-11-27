// app/_api/reports.ts

import { getAccessToken } from "../_lib/authStorage";

// --------------------
// TYPES (match backend DTOs)
// --------------------

export type RegionBucket = {
    region: string;        // e.g. "Central Asia"
    totalAmount: number;   // BigDecimal -> number
    ordersCount: number;
};

export type MonthBucket = {
    monthKey: string;      // "YYYY-MM", e.g. "2025-01"
    totalAmount: number;
    ordersCount: number;
};

// Match backend SalesReportResponse DTO
export type SalesReportResponse = {
    fromDate: string;          // LocalDate -> ISO "YYYY-MM-DD"
    toDate: string;

    totalSubtotal: number;
    totalVat: number;
    totalDiscount: number;
    totalDeliveryFee: number;
    totalAmount: number;

    averageCheck: number;
    ordersCount: number;

    regionBuckets: RegionBucket[];
    monthBuckets: MonthBucket[];
};

export type GetSalesReportParams = {
    fromDate?: string; // "YYYY-MM-DD"
    toDate?: string;   // "YYYY-MM-DD"
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return getAccessToken();
}

async function authFetch<T>(input: string, init: RequestInit = {}): Promise<T> {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${input}`, {
        ...init,
        headers,
    });

    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;

        try {
            const errorJson = await res.json();
            if (errorJson?.message) message = errorJson.message;
        } catch {
            // ignore JSON parse failures
        }

        throw new Error(message);
    }

    return (await res.json()) as T;
}

/**
 * GET /api/reports/sales?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
 * Both params are optional; backend has defaults.
 */
export async function getSalesReportApi(
    params: GetSalesReportParams = {}
): Promise<SalesReportResponse> {
    const search = new URLSearchParams();

    if (params.fromDate) search.set("fromDate", params.fromDate);
    if (params.toDate) search.set("toDate", params.toDate);

    const qs = search.toString();
    const path = qs ? `/api/reports/sales?${qs}` : "/api/reports/sales";

    return authFetch<SalesReportResponse>(path, {
        method: "GET",
    });
}
