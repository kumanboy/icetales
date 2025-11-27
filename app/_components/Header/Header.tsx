"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight, Globe, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "../Shared/Logo";
import { useCountry, CountryCode } from "@/app/_context/CountryContext";
import { useCart } from "@/app/_context/CartContext";
import { useAuth } from "@/app/_context/AuthContext";

const COUNTRY_ORDER: CountryCode[] = ["UZB", "KAZ", "GEO", "UKR", "CHN"];

export function Header() {
    const { country, setCountry } = useCountry();
    const { items } = useCart();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCountryChange: React.ChangeEventHandler<HTMLSelectElement> = (
        event
    ) => {
        const selected = event.target.value as CountryCode;
        if (COUNTRY_ORDER.includes(selected)) {
            setCountry(selected);
        }
    };

    const isAdminOrManager =
        user?.role === "ADMIN" || user?.role === "MANAGER";

    const handleLogoutClick = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="w-full bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6">
                    {/* Left: Logo */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <Link href="/" className="text-2xl font-bold">
                            <Logo />
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="hidden items-center gap-6 text-sm font-medium text-gray-900 md:flex">
                        <Link href="/" className="transition-colors hover:text-pink-500">
                            Home
                        </Link>
                        <Link
                            href="/menu"
                            className="transition-colors hover:text-pink-500"
                        >
                            Menu
                        </Link>
                        <Link
                            href="/cart"
                            className="transition-colors hover:text-pink-500"
                        >
                            Cart
                        </Link>
                        <Link
                            href="/checkout"
                            className="transition-colors hover:text-pink-500"
                        >
                            Checkout
                        </Link>

                        {/* Reports – only for ADMIN/MANAGER */}
                        {isAuthenticated && isAdminOrManager && (
                            <Link
                                href="/reports"
                                className="transition-colors hover:text-pink-500"
                            >
                                Reports
                            </Link>
                        )}
                    </nav>

                    {/* Right actions */}
                    <div className="ml-auto flex items-center gap-2 md:gap-4">
                        {/* Cart icon */}
                        <Link
                            href="/cart"
                            className="relative rounded-lg p-1.5 transition-colors hover:bg-gray-100 md:p-2"
                            aria-label="Open cart"
                        >
                            <ShoppingCart className="h-4 w-4 text-gray-600 md:h-5 md:w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white md:h-5 md:w-5 md:text-xs">
                  {cartCount}
                </span>
                            )}
                        </Link>

                        {/* Country switcher */}
                        <div className="rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm hover:border-pink-500 md:px-4">
                            <label htmlFor="country-select" className="sr-only">
                                Select country for pricing
                            </label>
                            <div className="flex items-center gap-2">
                                <Globe
                                    className="h-4 w-4 text-gray-600"
                                    aria-hidden="true"
                                />
                                <select
                                    id="country-select"
                                    value={country}
                                    onChange={handleCountryChange}
                                    className="bg-transparent text-xs font-medium text-gray-800 outline-none md:text-sm"
                                    aria-label="Select country for pricing and VAT"
                                >
                                    {COUNTRY_ORDER.map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Authentication area */}
                        {!isAuthenticated ? (
                            // Not logged in: Show Sign up button
                            <Link href="/auth/register" className="hidden sm:block">
                                <Button className="rounded-full bg-pink-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-pink-600 md:px-6 md:py-2 md:text-sm">
                                    Sign up
                                    <span className="ml-1 md:ml-2">
                    <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                  </span>
                                </Button>
                            </Link>
                        ) : (
                            // Logged in: show user name -> My Orders + Logout
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    href="/orders"
                                    className="inline-flex max-w-[180px] items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-800 hover:border-pink-500 hover:text-pink-500 md:text-sm"
                                >
                  <span className="truncate">
                    {user?.firstName || "My orders"}
                  </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    disabled={isLoggingOut || isLoading}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-500 hover:text-red-600 md:text-sm"
                                >
                                    <LogOut className="h-3 w-3" />
                                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </div>
                        )}

                        {/* Mobile burger */}
                        <button
                            type="button"
                            className="inline-flex items-center rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 md:hidden"
                            onClick={() => setIsMobileNavOpen((prev) => !prev)}
                            aria-label={
                                isMobileNavOpen
                                    ? "Close navigation menu"
                                    : "Open navigation menu"
                            }
                            aria-expanded={isMobileNavOpen}
                            aria-controls="mobile-nav"
                        >
                            {isMobileNavOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile nav panel */}
                {isMobileNavOpen && (
                    <nav
                        id="mobile-nav"
                        className="mt-3 flex flex-col gap-2 text-sm font-medium text-gray-900 md:hidden"
                    >
                        <Link
                            href="/"
                            className="rounded-lg px-2 py-1.5 transition-colors hover:bg-pink-50 hover:text-pink-500"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/menu"
                            className="rounded-lg px-2 py-1.5 transition-colors hover:bg-pink-50 hover:text-pink-500"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            Menu
                        </Link>
                        <Link
                            href="/cart"
                            className="rounded-lg px-2 py-1.5 transition-colors hover:bg-pink-50 hover:text-pink-500"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            Cart
                        </Link>
                        <Link
                            href="/checkout"
                            className="rounded-lg px-2 py-1.5 transition-colors hover:bg-pink-50 hover:text-pink-500"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            Checkout
                        </Link>

                        {/* Reports – only for ADMIN/MANAGER */}
                        {isAuthenticated && isAdminOrManager && (
                            <Link
                                href="/reports"
                                className="rounded-lg px-2 py-1.5 transition-colors hover:bg-pink-50 hover:text-pink-500"
                                onClick={() => setIsMobileNavOpen(false)}
                            >
                                Reports
                            </Link>
                        )}

                        {!isAuthenticated ? (
                            <Link
                                href="/auth/register"
                                className="rounded-lg px-2 py-1.5 text-pink-500 hover:bg-pink-50"
                                onClick={() => setIsMobileNavOpen(false)}
                            >
                                Sign up
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/orders"
                                    className="rounded-lg px-2 py-1.5 text-pink-500 hover:bg-pink-50"
                                    onClick={() => setIsMobileNavOpen(false)}
                                >
                                    {user?.firstName || "My orders"}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileNavOpen(false);
                                        handleLogoutClick();
                                    }}
                                    className="rounded-lg px-2 py-1.5 text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
