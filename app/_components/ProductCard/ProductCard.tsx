"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, useCart } from "../../_context/CartContext";
import { Heart, ShoppingCart } from "lucide-react";
import { useCountry } from "@/app/_context/CountryContext";
import { useAuth } from "@/app/_context/AuthContext";

type Props = {
    product: Product;
};

export const ProductCard: React.FC<Props> = ({ product }) => {
    const { addToCart } = useCart();
    const { formatPrice } = useCountry();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);

    const handleToggleFavorite = () => {
        setIsFavorite((prev) => !prev);
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        addToCart(product);
    };

    // ---- IMAGE FIX ----
    // Ensures URL always starts with "/"
    const imageSrc = product.imageUrl?.startsWith("/")
        ? product.imageUrl
        : "/" + product.imageUrl;

    return (
        <div className="flex h-[453px] w-full flex-col justify-between rounded-[28px] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            {/* Top section: heart + image */}
            <div className="relative mb-4 flex justify-center">
                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
                    aria-pressed={isFavorite}
                >
                    <Heart
                        className="h-4 w-4"
                        color={isFavorite ? "#F83D8E" : "#0F0200"}
                        fill={isFavorite ? "#F83D8E" : "none"}
                    />
                </button>

                <div className="flex h-[244px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F7F2F7]">
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        width={300}
                        height={244}
                        className="h-full w-full object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Name, rating, description */}
            <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-extrabold leading-tight text-[#0F0200]">
                        {product.name}
                    </h3>
                    <div className="mt-[2px] flex items-center gap-1 text-xs text-[#0F0200]">
                        <span className="text-[#FBB800]">★</span>
                        <span>{product.rating?.toFixed(1)}/5</span>
                    </div>
                </div>

                <p className="mt-1 text-sm text-slate-500">{product.description}</p>
            </div>

            {/* Price + Add to cart */}
            <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#F83D8E]">
                    {formatPrice(product.price)}
                </p>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#683292] text-white shadow-lg hover:bg-[#542574]"
                >
                    <ShoppingCart className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
