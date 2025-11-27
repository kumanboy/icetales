"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    ReactNode,
} from "react";

export type CountryCode = "UZB" | "KAZ" | "GEO" | "UKR" | "CHN";

type CountryConfig = {
    code: CountryCode;
    label: string;
    currency: string; // ISO code for Intl.NumberFormat
    symbol: string;
    vatRate: number; // 0.12 = 12%
    conversionRate: number; // multiplier from base USD -> local currency
};

// Base config with fallback conversion rates (approx values)
const BASE_COUNTRY_CONFIG: Record<CountryCode, CountryConfig> = {
    UZB: {
        code: "UZB",
        label: "Uzbekistan",
        currency: "UZS",
        symbol: "so'm",
        vatRate: 0.12,
        conversionRate: 12500, // fallback: 1 USD ≈ 12 500 UZS
    },
    KAZ: {
        code: "KAZ",
        label: "Kazakhstan",
        currency: "KZT",
        symbol: "₸",
        vatRate: 0.1,
        conversionRate: 480, // fallback
    },
    GEO: {
        code: "GEO",
        label: "Georgia",
        currency: "GEL",
        symbol: "₾",
        vatRate: 0.08,
        conversionRate: 2.7, // fallback
    },
    UKR: {
        code: "UKR",
        label: "Ukraine",
        currency: "UAH",
        symbol: "₴",
        vatRate: 0.2,
        conversionRate: 40, // fallback
    },
    CHN: {
        code: "CHN",
        label: "China",
        currency: "CNY",
        symbol: "¥",
        vatRate: 0.13,
        conversionRate: 7.2, // fallback
    },
};

type CountryContextValue = {
    country: CountryCode;
    config: CountryConfig;
    setCountry: (code: CountryCode) => void;
    formatPrice: (amountInBaseUsd: number) => string;
};

const CountryContext = createContext<CountryContextValue | undefined>(
    undefined,
);

const STORAGE_KEY = "icyTales:selectedCountry";
// Open, no-key API (rate-limited but fine for this use case)
const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest/USD";

export function CountryProvider({ children }: { children: ReactNode }) {
    // 1) Selected country (from localStorage if possible)
    const [country, setCountryState] = useState<CountryCode>(() => {
        if (typeof window === "undefined") return "UZB";
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY) as
                | CountryCode
                | null;
            if (stored && BASE_COUNTRY_CONFIG[stored]) {
                return stored;
            }
        } catch {
            // ignore storage errors
        }
        return "UZB";
    });

    // 2) Dynamically loaded rates from API (optional override)
    const [dynamicRates, setDynamicRates] = useState<
        Partial<Record<CountryCode, number>>
    >({});

    // Fetch latest rates once on client
    useEffect(() => {
        if (typeof window === "undefined") return;

        let cancelled = false;

        async function fetchRates() {
            try {
                const res = await fetch(EXCHANGE_API_URL);
                if (!res.ok) return;

                const data: { rates?: Record<string, number> } = await res.json();
                if (!data.rates || cancelled) return;

                setDynamicRates({
                    UZB: data.rates.UZS,
                    KAZ: data.rates.KZT,
                    GEO: data.rates.GEL,
                    UKR: data.rates.UAH,
                    CHN: data.rates.CNY,
                });
            } catch {
                // If API fails we keep fallback conversionRate values
            }
        }

        fetchRates();

        return () => {
            cancelled = true;
        };
    }, []);

    // 3) Current config = base config + dynamic rate override
    const config: CountryConfig = useMemo(() => {
        const base = BASE_COUNTRY_CONFIG[country];
        const overrideRate = dynamicRates[country];
        return {
            ...base,
            conversionRate: overrideRate && overrideRate > 0
                ? overrideRate
                : base.conversionRate,
        };
    }, [country, dynamicRates]);

    // 4) Setter that also persists to localStorage
    const setCountry = useCallback((code: CountryCode) => {
        setCountryState(code);
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(STORAGE_KEY, code);
            } catch {
                // ignore storage errors
            }
        }
    }, []);

    // 5) Price formatter – called everywhere in UI
    const formatPrice = useCallback(
        (amountInBaseUsd: number) => {
            const converted = amountInBaseUsd * config.conversionRate;

            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: config.currency,
                maximumFractionDigits: 2,
            }).format(converted);
        },
        [config.conversionRate, config.currency],
    );

    const value: CountryContextValue = useMemo(
        () => ({
            country,
            config,
            setCountry,
            formatPrice,
        }),
        [country, config, setCountry, formatPrice],
    );

    return (
        <CountryContext.Provider value={value}>
            {/* Live region so screen readers hear “prices updated” when country changes */}
            <p aria-live="polite" className="sr-only">
                Prices updated for {config.label}. Currency {config.currency}.
            </p>
            {children}
        </CountryContext.Provider>
    );
}

export function useCountry() {
    const ctx = useContext(CountryContext);
    if (!ctx) {
        throw new Error("useCountry must be used within a CountryProvider");
    }
    return ctx;
}
