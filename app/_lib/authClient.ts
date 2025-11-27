// app/_lib/authClient.ts

export type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";

export type UserResponse = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isActive?: boolean;
    emailVerified?: boolean;
    lastLogin?: string;
    createdAt?: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number;
    user: UserResponse;
};

export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
    timestamp?: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

// Base URL from .env.local
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Generic helper for making requests to the backend API
 */
async function request<T>(
    path: string,
    options: RequestInit
): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    let json: ApiResponse<T>;

    try {
        json = await response.json();
    } catch {
        throw new Error(`Invalid JSON response from ${path}`);
    }

    if (!response.ok || !json.success) {
        const msg = json.message || `Request failed with status ${response.status}`;
        throw new Error(msg);
    }

    return json;
}

// ---------------- PUBLIC FUNCTIONS ---------------- //

/**
 * Register new user
 */
export async function registerUser(
    payload: RegisterPayload
): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error("Empty response from server");
    return res.data;
}

/**
 * Log in existing user
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error("Empty response from server");
    return res.data;
}

/**
 * Fetch current logged-in user info (requires token)
 */
export async function getCurrentUser(
    accessToken: string
): Promise<UserResponse> {
    const res = await request<UserResponse>("/api/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!res.data) throw new Error("Empty response from server");
    return res.data;
}
