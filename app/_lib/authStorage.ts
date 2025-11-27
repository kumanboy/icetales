// app/_lib/authStorage.ts

import type { AuthResponse, UserResponse } from "./authClient";

const ACCESS_TOKEN_KEY = "cafe_accessToken";
const REFRESH_TOKEN_KEY = "cafe_refreshToken";
const USER_KEY = "cafe_authUser";

function isBrowser() {
    return typeof window !== "undefined";
}

/**
 * Save tokens + user to localStorage
 */
export function saveAuth(auth: AuthResponse) {
    if (!isBrowser()) return;

    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): UserResponse | null {
    if (!isBrowser()) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as UserResponse;
    } catch {
        console.warn("Failed to parse stored user");
        return null;
    }
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth() {
    if (!isBrowser()) return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
