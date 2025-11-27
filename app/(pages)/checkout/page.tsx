"use client";

import React, { useState } from "react";
import { Header } from "@/app/_components/Header/Header";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/_context/CartContext";
import { useCountry } from "@/app/_context/CountryContext";

import {
    createOrderApi,
    type CreateOrderRequest,
    type FulfillmentMethod as ApiFulfillmentMethod,
    type OrderItemRequest,
} from "@/app/_api/orders";

// ======================
// FIXED TYPES
// ======================
type FulfillmentMethod = "pickup" | "delivery" | "booking";

// UI payment values (unchanged)
type PaymentMethod = "card" | "cash_on_delivery";

interface TimeSlot {
    id: string;
    label: string;
    available: boolean;
}

// ======================
// CONSTANTS
// ======================
const timeSlots: TimeSlot[] = [
    { id: "10-1030", label: "10:00 – 10:30", available: true },
    { id: "1030-11", label: "10:30 – 11:00", available: true },
    { id: "11-1130", label: "11:00 – 11:30", available: false },
    { id: "1130-12", label: "11:30 – 12:00", available: true },
    { id: "12-1230", label: "12:00 – 12:30", available: true },
];

const pickupVenues = [
    { id: "venue-1", label: "Main Street Cafe" },
    { id: "venue-2", label: "Riverside Branch" },
    { id: "venue-3", label: "Uptown Corner" },
];

const deliveryZones = [
    { id: "zone-1", label: "Zone 1 (Near Center)", fee: 3.0 },
    { id: "zone-2", label: "Zone 2 (Citywide)", fee: 5.0 },
    { id: "zone-3", label: "Zone 3 (Outer Area)", fee: 7.5 },
];

// ======================
// MAIN PAGE
// ======================
export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart } = useCart();
    const { country, config, formatPrice } = useCountry();

    // --------------------------
    // BILLING FORM STATES
    // --------------------------
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");

    // --------------------------
    // ORDER / FULFILLMENT STATES
    // --------------------------
    const [fulfillmentMethod, setFulfillmentMethod] =
        useState<FulfillmentMethod>("pickup");

    const [orderDate, setOrderDate] = useState(
        () => new Date().toISOString().split("T")[0]
    );
    const [selectedVenue, setSelectedVenue] = useState("");
    const [deliveryZoneId, setDeliveryZoneId] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("");
    const [guests, setGuests] = useState("");

    // --------------------------
    // PAYMENT STATES
    // --------------------------
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [securityCode, setSecurityCode] = useState("");

    // --------------------------
    // SUBMIT / ERRORS
    // --------------------------
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] =
        useState<"idle" | "success" | "error">("idle");
    const [submitMessage, setSubmitMessage] = useState("");

    // ======================
    // CART CALCULATIONS
    // ======================
    const availableItems = items.filter(
        (item) => item.product.available !== false
    );

    const itemsSubtotal = availableItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const autoDiscount = 0;

    const selectedZone = deliveryZones.find((z) => z.id === deliveryZoneId);

    const deliveryFee =
        fulfillmentMethod === "delivery" && selectedZone
            ? selectedZone.fee
            : 0;

    const vatRate = config.vatRate;
    const vat = (itemsSubtotal - autoDiscount) * vatRate;

    const grandTotal = itemsSubtotal - autoDiscount + vat + deliveryFee;

    // ======================
    // VALIDATION
    // ======================
    function validateForm() {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) newErrors.firstName = "Required.";
        if (!lastName.trim()) newErrors.lastName = "Required.";
        if (!email.trim()) newErrors.email = "Required.";
        if (!stateVal.trim()) newErrors.stateVal = "Required.";
        if (!city.trim()) newErrors.city = "Required.";
        if (!zip.trim()) newErrors.zip = "Required.";
        if (!orderDate) newErrors.orderDate = "Required.";
        if (!selectedTimeSlotId) newErrors.selectedTimeSlotId = "Required.";

        if (fulfillmentMethod === "pickup" && !selectedVenue)
            newErrors.selectedVenue = "Required.";

        if (fulfillmentMethod === "delivery") {
            if (!deliveryZoneId) newErrors.deliveryZoneId = "Required.";
            if (!streetAddress.trim())
                newErrors.streetAddress = "Required.";
        }

        if (fulfillmentMethod === "booking" && !guests.trim())
            newErrors.guests = "Required.";

        if (paymentMethod === "card") {
            if (!cardNumber.trim()) newErrors.cardNumber = "Required.";
            if (!expiryMonth.trim()) newErrors.expiryMonth = "Required.";
            if (!expiryYear.trim()) newErrors.expiryYear = "Required.";
            if (!securityCode.trim()) newErrors.securityCode = "Required.";
        }

        if (availableItems.length === 0)
            newErrors.items = "Your cart is empty.";

        return newErrors;
    }

    const mapFulfillment = (method: FulfillmentMethod): ApiFulfillmentMethod =>
        method === "pickup"
            ? "PICKUP"
            : method === "delivery"
                ? "DELIVERY"
                : "BOOKING";

    // ======================
    // SUBMIT HANDLER
    // ======================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitStatus("idle");
        setSubmitMessage("");

        const validation = validateForm();
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            setSubmitStatus("error");
            setSubmitMessage("Fix highlighted fields.");
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        const orderItems: OrderItemRequest[] = availableItems.map((item) => {
            const productId = item.product.id;

            if (productId == null || Number.isNaN(productId)) {
                console.error("Invalid product id in cart item:", item);
                throw new Error(
                    "Cart contains invalid product. Please clear cart and try again."
                );
            }

            return {
                productId,
                quantity: item.quantity,
            };
        });

        const payload: CreateOrderRequest = {
            fulfillmentMethod: mapFulfillment(fulfillmentMethod),

            paymentMethod:
                paymentMethod === "card"
                    ? "CARD"
                    : "CASH_ON_DELIVERY",

            itemsSubtotal: Number(itemsSubtotal),
            discount: Number(autoDiscount),
            vatAmount: Number(vat),
            deliveryFee: Number(deliveryFee),

            orderDate: orderDate, // "YYYY-MM-DD"

            timeSlotId: selectedTimeSlotId || undefined,
            guests: fulfillmentMethod === "booking" ? Number(guests) : null,

            pickupVenueId:
                fulfillmentMethod === "pickup" ? selectedVenue : null,
            deliveryZoneId:
                fulfillmentMethod === "delivery" ? deliveryZoneId : null,

            deliveryAddressLine1:
                fulfillmentMethod === "delivery" ? streetAddress : null,
            deliveryAddressLine2:
                fulfillmentMethod === "delivery" ? apartment : null,
            deliveryCity: fulfillmentMethod === "delivery" ? city : null,
            deliveryState: fulfillmentMethod === "delivery" ? stateVal : null,
            deliveryZip: fulfillmentMethod === "delivery" ? zip : null,
            deliveryInstructions: null,

            items: orderItems,

            // NEW: send country code to backend so reports can group by region
            countryCode: country,
        };

        try {
            const res = await createOrderApi(payload);

            setSubmitStatus("success");
            setSubmitMessage(res.message ?? "Order placed successfully!");

            clearCart();
            setTimeout(() => router.push("/thank-you"), 800);
        } catch (err) {
            const msg =
                err instanceof Error && err.message
                    ? err.message
                    : "Unexpected error.";
            setSubmitStatus("error");
            setSubmitMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    // ======================
    // UI HELPERS
    // ======================
    const inputClass =
        "block w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:ring-pink-400 focus:border-pink-400";

    const sectionTitle = "text-sm font-semibold text-gray-900 mb-3";

    // ======================
    // FULL UI
    // ======================
    return (
        <>
            <Header />

            <main className="min-h-screen bg-white px-4 py-10">
                <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                    {/* LEFT: FULL FORM */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* BILLING ADDRESS */}
                        <section>
                            <h2 className={sectionTitle}>Billing Address:</h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-600 text-xs">
                                            {errors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-600 text-xs">
                                            {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-xs">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        State
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={stateVal}
                                        onChange={(e) =>
                                            setStateVal(e.target.value)
                                        }
                                    />
                                    {errors.stateVal && (
                                        <p className="text-red-600 text-xs">
                                            {errors.stateVal}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={city}
                                        onChange={(e) =>
                                            setCity(e.target.value)
                                        }
                                    />
                                    {errors.city && (
                                        <p className="text-red-600 text-xs">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        Zip / postal code
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                    />
                                    {errors.zip && (
                                        <p className="text-red-600 text-xs">
                                            {errors.zip}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* ORDER DETAILS */}
                        <section>
                            <h2 className={sectionTitle}>Order Details:</h2>

                            <div className="max-w-xs mb-4">
                                <label className="text-xs font-medium text-gray-700">
                                    Order / booking date
                                </label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={orderDate}
                                    onChange={(e) =>
                                        setOrderDate(e.target.value)
                                    }
                                />
                                {errors.orderDate && (
                                    <p className="text-red-600 text-xs">
                                        {errors.orderDate}
                                    </p>
                                )}
                            </div>

                            <fieldset>
                                <legend className="text-xs font-medium text-gray-700 mb-2">
                                    Order fulfillment method
                                </legend>

                                <div className="flex gap-3 flex-wrap">
                                    {["pickup", "delivery", "booking"].map(
                                        (method) => (
                                            <label
                                                key={method}
                                                className={`px-4 py-2 rounded-full border text-xs cursor-pointer ${
                                                    fulfillmentMethod ===
                                                    method
                                                        ? "border-pink-500 bg-pink-50 text-pink-700"
                                                        : "border-gray-200 text-gray-700"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="sr-only"
                                                    checked={
                                                        fulfillmentMethod ===
                                                        method
                                                    }
                                                    onChange={() =>
                                                        setFulfillmentMethod(
                                                            method as FulfillmentMethod
                                                        )
                                                    }
                                                />
                                                {method === "pickup"
                                                    ? "Pickup"
                                                    : method === "delivery"
                                                        ? "Delivery"
                                                        : "Table booking"}
                                            </label>
                                        )
                                    )}
                                </div>
                            </fieldset>

                            {fulfillmentMethod === "pickup" && (
                                <div className="max-w-md mt-4">
                                    <label className="text-xs font-medium text-gray-700">
                                        Pickup venue
                                    </label>
                                    <select
                                        className={`${inputClass} bg-white`}
                                        value={selectedVenue}
                                        onChange={(e) =>
                                            setSelectedVenue(e.target.value)
                                        }
                                    >
                                        <option value="">Select venue</option>
                                        {pickupVenues.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.selectedVenue && (
                                        <p className="text-red-600 text-xs">
                                            {errors.selectedVenue}
                                        </p>
                                    )}
                                </div>
                            )}

                            {fulfillmentMethod === "delivery" && (
                                <div className="mt-4 space-y-4 max-w-md">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">
                                            Delivery zone
                                        </label>
                                        <select
                                            className={`${inputClass} bg-white`}
                                            value={deliveryZoneId}
                                            onChange={(e) =>
                                                setDeliveryZoneId(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select zone
                                            </option>
                                            {deliveryZones.map((z) => (
                                                <option
                                                    key={z.id}
                                                    value={z.id}
                                                >
                                                    {z.label} (
                                                    {formatPrice(z.fee)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.deliveryZoneId && (
                                            <p className="text-red-600 text-xs">
                                                {errors.deliveryZoneId}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700">
                                            Street address
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={streetAddress}
                                            onChange={(e) =>
                                                setStreetAddress(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.streetAddress && (
                                            <p className="text-red-600 text-xs">
                                                {errors.streetAddress}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700">
                                            Apartment, floor, etc.
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={apartment}
                                            onChange={(e) =>
                                                setApartment(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {fulfillmentMethod === "booking" && (
                                <div className="max-w-xs mt-4">
                                    <label className="text-xs font-medium text-gray-700">
                                        Number of guests
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        className={inputClass}
                                        value={guests}
                                        onChange={(e) =>
                                            setGuests(e.target.value)
                                        }
                                    />
                                    {errors.guests && (
                                        <p className="text-red-600 text-xs">
                                            {errors.guests}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-6">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                    Time slot
                                </p>

                                <div className="grid gap-2 sm:grid-cols-3">
                                    {timeSlots.map((slot) => (
                                        <label
                                            key={slot.id}
                                            className={`px-3 py-2 rounded-full text-xs border cursor-pointer flex items-center justify-center ${
                                                !slot.available
                                                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                    : selectedTimeSlotId ===
                                                    slot.id
                                                        ? "border-pink-500 bg-pink-50 text-pink-700"
                                                        : "border-gray-200 text-gray-700"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                className="sr-only"
                                                disabled={!slot.available}
                                                checked={
                                                    selectedTimeSlotId ===
                                                    slot.id
                                                }
                                                onChange={() =>
                                                    slot.available &&
                                                    setSelectedTimeSlotId(
                                                        slot.id
                                                    )
                                                }
                                            />
                                            {slot.label}
                                        </label>
                                    ))}
                                </div>

                                {errors.selectedTimeSlotId && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.selectedTimeSlotId}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* PAYMENT */}
                        <section>
                            <h2 className={sectionTitle}>Payment Method:</h2>

                            <fieldset className="space-y-4">
                                {/* CARD */}
                                <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-full text-xs cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={paymentMethod === "card"}
                                        onChange={() =>
                                            setPaymentMethod("card")
                                        }
                                    />
                                    Credit card
                                </label>

                                {paymentMethod === "card" && (
                                    <div className="ml-7 space-y-4">
                                        <div className="max-w-md">
                                            <label className="text-xs font-medium text-gray-700">
                                                Card number
                                            </label>
                                            <input
                                                className={inputClass}
                                                value={cardNumber}
                                                onChange={(e) =>
                                                    setCardNumber(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {errors.cardNumber && (
                                                <p className="text-red-600 text-xs">
                                                    {errors.cardNumber}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid max-w-md gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Expiration month
                                                </label>
                                                <input
                                                    className={inputClass}
                                                    value={expiryMonth}
                                                    onChange={(e) =>
                                                        setExpiryMonth(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {errors.expiryMonth && (
                                                    <p className="text-red-600 text-xs">
                                                        {errors.expiryMonth}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Expiration year
                                                </label>
                                                <input
                                                    className={inputClass}
                                                    value={expiryYear}
                                                    onChange={(e) =>
                                                        setExpiryYear(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {errors.expiryYear && (
                                                    <p className="text-red-600 text-xs">
                                                        {errors.expiryYear}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="max-w-xs">
                                            <label className="text-xs font-medium text-gray-700">
                                                Security Code
                                            </label>
                                            <input
                                                type="password"
                                                className={inputClass}
                                                value={securityCode}
                                                onChange={(e) =>
                                                    setSecurityCode(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {errors.securityCode && (
                                                <p className="text-red-600 text-xs">
                                                    {errors.securityCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* COD */}
                                <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-full text-xs cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={
                                            paymentMethod ===
                                            "cash_on_delivery"
                                        }
                                        onChange={() =>
                                            setPaymentMethod(
                                                "cash_on_delivery"
                                            )
                                        }
                                    />
                                    Cash on Delivery
                                </label>
                            </fieldset>
                        </section>

                        {/* SUBMIT BUTTON */}
                        <section className="space-y-4">
                            {submitStatus !== "idle" && (
                                <div
                                    className={`rounded-lg px-4 py-3 text-xs border ${
                                        submitStatus === "success"
                                            ? "bg-green-50 border-green-200 text-green-800"
                                            : "bg-red-50 border-red-200 text-red-800"
                                    }`}
                                >
                                    {submitMessage}
                                </div>
                            )}

                            {errors.items && (
                                <p className="text-xs text-red-600">
                                    {errors.items}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-full bg-gradient-to-r from-pink-500 to-pink-400 px-8 py-3 text-sm text-white shadow-md disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Processing..."
                                    : "Place Order Now"}
                            </button>
                        </section>
                    </form>

                    {/* RIGHT: ORDER SUMMARY */}
                    <aside className="h-fit rounded-2xl bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-4">
                            <span>Items</span>
                            <span>Price</span>
                        </div>

                        <div className="space-y-3 text-xs text-gray-800">
                            {availableItems.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex justify-between gap-3"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {item.quantity} ×{" "}
                                            {item.product.name}
                                        </p>
                                        {item.product.description && (
                                            <p className="text-gray-500 text-[11px]">
                                                {item.product.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="whitespace-nowrap">
                                        {formatPrice(
                                            item.product.price *
                                            item.quantity
                                        )}
                                    </span>
                                </div>
                            ))}

                            <hr className="my-3 border-gray-100" />

                            <div className="flex justify-between text-[11px] text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(itemsSubtotal)}</span>
                            </div>

                            <div className="flex justify-between text-[11px] text-gray-600">
                                <span>VAT ({Math.round(vatRate * 100)}%)</span>
                                <span>{formatPrice(vat)}</span>
                            </div>

                            {fulfillmentMethod === "delivery" && (
                                <div className="flex justify-between text-[11px] text-gray-600">
                                    <span>Delivery fee</span>
                                    <span>{formatPrice(deliveryFee)}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-semibold text-xs mt-3">
                                <span>Grand Total</span>
                                <span className="text-pink-500">
                                    {formatPrice(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}
