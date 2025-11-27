"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    loginUser,
    registerUser,
    getCurrentUser,
    type LoginPayload,
    type RegisterPayload,
    type UserResponse,
    type AuthResponse,
} from "../_lib/authClient";
import {
    saveAuth,
    getAccessToken,
    getStoredUser,
    clearAuth,
} from "../_lib/authStorage";

type AuthContextValue = {
    user: UserResponse | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<AuthResponse>;
    register: (payload: RegisterPayload) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Restore auth state from localStorage on first mount
    useEffect(() => {
        const token = getAccessToken();
        const storedUser = getStoredUser();

        if (token && storedUser) {
            setAccessToken(token);
            setUser(storedUser);
        }

        setIsLoading(false);
    }, []);

    const isAuthenticated = !!user && !!accessToken;

    async function handleLogin(payload: LoginPayload): Promise<AuthResponse> {
        setIsLoading(true);
        try {
            const auth = await loginUser(payload);
            // persist in localStorage
            saveAuth(auth);
            // update state
            setAccessToken(auth.accessToken);
            setUser(auth.user);
            return auth;
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister(
        payload: RegisterPayload
    ): Promise<AuthResponse> {
        setIsLoading(true);
        try {
            const auth = await registerUser(payload);
            // backend returns tokens + user, treat same as login
            saveAuth(auth);
            setAccessToken(auth.accessToken);
            setUser(auth.user);
            return auth;
        } finally {
            setIsLoading(false);
        }
    }

    async function handleLogout() {
        // If you later add backend /api/auth/logout, call it here with accessToken
        clearAuth();
        setAccessToken(null);
        setUser(null);
    }

    async function refreshUser() {
        const token = getAccessToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const current = await getCurrentUser(token);
            setUser(current);
        } catch (error) {
            console.warn("Failed to refresh user", error);
            clearAuth();
            setAccessToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    const value: AuthContextValue = {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for consuming context
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
