// app/_api/orders.ts

import { getAccessToken } from "../_lib/authStorage";

// --------------------
// TYPES (Strict)
// --------------------

export type FulfillmentMethod = "PICKUP" | "DELIVERY" | "BOOKING";

// MATCH backend enum EXACTLY
export type PaymentMethod = "CARD" | "CASH_ON_DELIVERY";

export interface OrderItemRequest {
    productId: number;
    quantity: number;
    selectedModifiers?: Record<string, string>;
    removedIngredients?: string[];
}

export interface CreateOrderRequest {
    fulfillmentMethod: FulfillmentMethod;
    paymentMethod: PaymentMethod;

    itemsSubtotal: number;

    discount: number;
    vatAmount: number;
    deliveryFee: number;

    orderDate: string;
    timeSlotId?: string;
    guests?: number | null;

    pickupVenueId?: string | null;

    deliveryZoneId?: string | null;
    deliveryAddressLine1?: string | null;
    deliveryAddressLine2?: string | null;
    deliveryCity?: string | null;
    deliveryState?: string | null;
    deliveryZip?: string | null;
    deliveryInstructions?: string | null;

    items: OrderItemRequest[];

    // --------------------
    // NEW FIELD (ONLY CHANGE)
    // --------------------
    countryCode: string;   // e.g. "UZB", "KAZ", "GEO", "UKR", "CHN"
}

// --------------------
// RESPONSE TYPES (STRICT)
// --------------------

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ApiOrder {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    fulfillmentMethod: FulfillmentMethod;
    paymentMethod: PaymentMethod;
}

// My Orders response → array of orders
export type MyOrdersResponse = ApiOrder[];

// --------------------
// Token Helper
// --------------------

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return getAccessToken();
}

// --------------------
// Fetch Helper
// --------------------

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

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

// --------------------
// Public API
// --------------------

export async function createOrderApi(
    payload: CreateOrderRequest
): Promise<ApiResponse<ApiOrder>> {
    return authFetch<ApiResponse<ApiOrder>>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getMyOrdersApi(): Promise<ApiResponse<MyOrdersResponse>> {
    return authFetch<ApiResponse<MyOrdersResponse>>("/api/orders/my", {
        method: "GET",
    });
}
