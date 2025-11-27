"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

export type Product = {
    id: number;              // FIXED (was string)
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    rating: number;
    category: string;
    available?: boolean;
};

export type CartItem = {
    product: Product;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;          // FIXED
    setItemQuantity: (productId: number, quantity: number) => void; // FIXED
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "icytales_cart_v2";

type ProviderProps = {
    children: ReactNode;
};

export function CartProvider({ children }: ProviderProps) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return [];

        try {
            const raw = window.localStorage.getItem(CART_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw) as CartItem[];
            if (!Array.isArray(parsed)) return [];
            return parsed;
        } catch {
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // ignore
        }
    }, [items]);

    const addToCart = useCallback((product: Product) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.product.id === product.id
            );

            if (existingIndex === -1) {
                return [...prev, { product, quantity: 1 }];
            }

            const next = [...prev];
            next[existingIndex] = {
                ...next[existingIndex],
                quantity: next[existingIndex].quantity + 1,
            };
            return next;
        });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.product.id === productId
            );
            if (existingIndex === -1) return prev;

            const current = prev[existingIndex];
            if (current.quantity <= 1) {
                return prev.filter((item) => item.product.id !== productId);
            }

            const next = [...prev];
            next[existingIndex] = {
                ...current,
                quantity: current.quantity - 1,
            };
            return next;
        });
    }, []);

    const setItemQuantity = useCallback(
        (productId: number, quantity: number) => {
            setItems((prev) => {
                if (quantity <= 0) {
                    return prev.filter((item) => item.product.id !== productId);
                }

                const existingIndex = prev.findIndex(
                    (item) => item.product.id === productId
                );
                if (existingIndex === -1) return prev;

                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    quantity,
                };
                return next;
            });
        },
        []
    );

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const value: CartContextValue = {
        items,
        addToCart,
        removeFromCart,
        setItemQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return ctx;
}
