"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { Header } from "@/app/_components/Header/Header";
import { useCart } from "@/app/_context/CartContext";
import { useCountry } from "@/app/_context/CountryContext";
import { useAuth } from "@/app/_context/AuthContext";

// Base (internal) pricing config – in "base currency" units
const DISCOUNT_THRESHOLD_BASE = 50;
const DISCOUNT_PERCENT = 0.1;

// Coupon config
const COUPON_CODE = "TENTEN";
const COUPON_PERCENT = 0.1;

export default function CartPage() {
    const router = useRouter();
    const { items, addToCart, removeFromCart, clearCart } = useCart();
    const { config, formatPrice } = useCountry();
    const { user, isAuthenticated, logout } = useAuth();

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    // -------- Split available / unavailable items --------
    const { availableItems, unavailableItems } = useMemo(() => {
        const available: typeof items = [];
        const unavailable: typeof items = [];

        for (const item of items) {
            const isAvailable = item.product.available !== false;
            if (isAvailable) {
                available.push(item);
            } else {
                unavailable.push(item);
            }
        }

        return { availableItems: available, unavailableItems: unavailable };
    }, [items]);

    // -------- Totals / VAT / discounts (country aware) --------
    const totals = useMemo(() => {
        const subtotalBase = availableItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );

        // Automatic discount for big orders
        const autoDiscountBase =
            subtotalBase >= DISCOUNT_THRESHOLD_BASE
                ? subtotalBase * DISCOUNT_PERCENT
                : 0;

        // Extra coupon discount
        const couponDiscountBase =
            appliedCoupon === COUPON_CODE ? subtotalBase * COUPON_PERCENT : 0;

        const discountBase = autoDiscountBase + couponDiscountBase;

        const subtotalAfterDiscountBase = subtotalBase - discountBase;
        const vatAmountBase = subtotalAfterDiscountBase * config.vatRate;
        const grandTotalBase = subtotalAfterDiscountBase + vatAmountBase;

        return {
            subtotalBase,
            discountBase,
            autoDiscountBase,
            couponDiscountBase,
            vatAmountBase,
            grandTotalBase,
        };
    }, [availableItems, config.vatRate, appliedCoupon]);

    // -------- A11Y live announcement for totals --------
    const totalAnnouncement = useMemo(() => {
        if (availableItems.length === 0) {
            return "Cart is empty.";
        }

        return `Cart updated for ${config.label}. Subtotal ${formatPrice(
            totals.subtotalBase,
        )}, discount ${formatPrice(
            totals.discountBase,
        )}, VAT ${formatPrice(
            totals.vatAmountBase,
        )}, grand total ${formatPrice(totals.grandTotalBase)}.`;
    }, [
        availableItems.length,
        config.label,
        formatPrice,
        totals.subtotalBase,
        totals.discountBase,
        totals.vatAmountBase,
        totals.grandTotalBase,
    ]);

    const totalItemCount = availableItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const handleLogout = async () => {
        clearCart();
        await logout();
        router.push("/");
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setAppliedCoupon(null);
            setCouponError("Please enter a coupon code.");
            return;
        }

        const normalized = couponCode.trim().toUpperCase();

        if (normalized === COUPON_CODE) {
            setAppliedCoupon(COUPON_CODE);
            setCouponError(null);
        } else {
            setAppliedCoupon(null);
            setCouponError("Invalid coupon code.");
        }
    };

    const handleProceedToCheckout = () => {
        if (availableItems.length === 0) return;
        router.push("/checkout");
    };

    return (
        <>
            <Header />

            <main className="min-h-screen bg-white">
                <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
                    {/* Live region for screen readers */}
                    <p aria-live="polite" className="sr-only">
                        {totalAnnouncement}
                    </p>

                    {/* Header row */}
                    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                Shopping Cart
                            </h1>
                            {isAuthenticated && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Logged in as{" "}
                                    <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            ({totalItemCount.toString().padStart(2, "0")} Items)
                        </p>
                    </div>

                    {/* User profile info */}
                    {isAuthenticated && (
                        <section className="mb-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-800">
                            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Profile
                            </h2>
                            <div className="space-y-1">
                                <p>
                                    <span className="font-medium">Name: </span>
                                    {user?.firstName} {user?.lastName}
                                </p>
                                {user?.email && (
                                    <p>
                                        <span className="font-medium">Email: </span>
                                        {user.email}
                                    </p>
                                )}
                                {user?.phone && (
                                    <p>
                                        <span className="font-medium">Phone: </span>
                                        {user.phone}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                        {/* ---------------- LEFT: CART LIST ---------------- */}
                        <section
                            aria-label="Shopping cart items"
                            className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                        >
                            {/* Table header (desktop) */}
                            <div className="hidden grid-cols-[minmax(0,2.5fr)_repeat(3,minmax(0,1fr))_48px] border-b border-gray-100 px-6 py-3 text-xs font-semibold text-gray-400 md:grid">
                                <div>Product Details</div>
                                <div className="text-center">Price</div>
                                <div className="text-center">Quantity</div>
                                <div className="text-right">Total</div>
                                <div></div>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-100">
                                {items.length === 0 && (
                                    <div className="px-6 py-8 text-sm text-gray-500">
                                        Your cart is empty.
                                    </div>
                                )}

                                {items.map((item) => {
                                    const isAvailable = item.product.available !== false;
                                    const unitPriceBase = item.product.price;
                                    const lineTotalBase = unitPriceBase * item.quantity;

                                    return (
                                        <article
                                            key={item.product.id}
                                            className="grid gap-4 px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,2.5fr)_repeat(3,minmax(0,1fr))_48px] md:items-center"
                                            aria-label={`${item.product.name}${
                                                !isAvailable ? " (Unavailable)" : ""
                                            }`}
                                        >
                                            {/* Product details */}
                                            <div className="flex items-start gap-4">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-pink-50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-semibold text-gray-900">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.product.description}
                                                    </p>

                                                    {!isAvailable && (
                                                        <span
                                                            className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                                                            aria-label="This product is unavailable and will not be included in totals"
                                                        >
                              Unavailable
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between text-sm text-gray-700 md:justify-center">
                        <span className="text-xs text-gray-400 md:hidden">
                          Price
                        </span>
                                                <span
                                                    aria-label={`Unit price ${formatPrice(unitPriceBase)}`}
                                                >
                          {formatPrice(unitPriceBase)}
                        </span>
                                            </div>

                                            {/* Quantity controls */}
                                            <div className="flex items-center justify-between text-sm md:justify-center">
                        <span className="text-xs text-gray-400 md:hidden">
                          Quantity
                        </span>
                                                <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-1 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            isAvailable && removeFromCart(item.product.id)
                                                        }
                                                        className="h-6 w-6 rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100"
                                                        aria-label="Decrease quantity"
                                                        disabled={!isAvailable}
                                                        aria-disabled={!isAvailable}
                                                    >
                                                        −
                                                    </button>
                                                    <span
                                                        className="mx-2 min-w-[1.5rem] text-center"
                                                        aria-label={`Quantity ${item.quantity}`}
                                                    >
                            {item.quantity}
                          </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            isAvailable && addToCart(item.product)
                                                        }
                                                        className="h-6 w-6 rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100"
                                                        aria-label="Increase quantity"
                                                        disabled={!isAvailable}
                                                        aria-disabled={!isAvailable}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Line total */}
                                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900 md:justify-end">
                        <span className="text-xs text-gray-400 md:hidden">
                          Total
                        </span>
                                                <span
                                                    aria-label={`Line total ${formatPrice(lineTotalBase)}`}
                                                >
                          {formatPrice(lineTotalBase)}
                        </span>
                                            </div>

                                            {/* Remove line */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        for (let i = 0; i < item.quantity; i += 1) {
                                                            removeFromCart(item.product.id);
                                                        }
                                                    }}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-xs text-gray-400 hover:border-pink-500 hover:text-pink-500"
                                                    aria-label={`Remove ${item.product.name} from cart`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Continue shopping */}
                            <div className="flex items-center gap-2 px-6 py-4 text-sm text-pink-500">
                                <ArrowLeft className="h-4 w-4" />
                                <Link href="/menu" className="hover:underline">
                                    Continue Shopping
                                </Link>
                            </div>
                        </section>

                        {/* ---------------- RIGHT: ORDER SUMMARY ---------------- */}
                        <aside
                            aria-label="Order summary"
                            className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                        >
                            {/* Apply coupons */}
                            <div className="rounded-2xl bg-gray-50 p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Apply coupons"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="rounded-full bg-pink-500 px-4 py-2 text-xs font-medium text-white hover:bg-pink-600"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="mt-2 text-xs text-red-500" role="alert">
                                        {couponError}
                                    </p>
                                )}
                                {appliedCoupon === COUPON_CODE && !couponError && (
                                    <p className="mt-2 text-xs text-green-600">
                                        Coupon &quot;TENTEN&quot; applied: 10% off your subtotal.
                                    </p>
                                )}
                            </div>

                            {/* Product details / totals */}
                            <div className="space-y-3 text-sm text-gray-700">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Product Details
                                </h2>
                                <div className="flex justify-between">
                                    <span>Sub Total</span>
                                    <span>{formatPrice(totals.subtotalBase)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>
                    {totals.discountBase > 0
                        ? `− ${formatPrice(totals.discountBase)}`
                        : formatPrice(0)}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>VAT ({Math.round(config.vatRate * 100)}%)</span>
                                    <span>{formatPrice(totals.vatAmountBase)}</span>
                                </div>
                            </div>

                            <div className="my-2 h-px bg-gray-100" />

                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                                <span>Grand Total</span>
                                <span>{formatPrice(totals.grandTotalBase)}</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleProceedToCheckout}
                                disabled={availableItems.length === 0}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-pink-200 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                            >
                                Proceed to checkout
                            </button>

                            <p className="mt-2 text-[11px] leading-snug text-gray-400">
                                Safe and secure payments. Easy returns. 100% authentic products.
                            </p>

                            {unavailableItems.length > 0 && (
                                <p className="mt-1 text-[11px] text-gray-500">
                                    Some products are marked as unavailable and are not included in
                                    the totals.
                                </p>
                            )}
                        </aside>
                    </div>

                    {/* Order history placeholder */}
                    <section className="mt-8 rounded-2xl bg-gray-50 p-4 text-sm text-gray-800">
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Order history
                        </h2>
                        <p className="text-xs text-gray-500">
                            You have no previous orders yet. Your orders will appear here
                            after you place them.
                        </p>
                    </section>

                    {/* Logout button at bottom */}
                    {isAuthenticated && (
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:border-pink-500 hover:text-pink-500"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
