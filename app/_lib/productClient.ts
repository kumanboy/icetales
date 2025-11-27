// app/_lib/productClient.ts
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type ProductDto = {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    imageUrl?: string | null;
    categoryId: number;
    categoryName?: string;
    isActive?: boolean;
    rating?: number | null;
    ratingCount?: number | null;
};

import type { Product } from "../_context/CartContext";

// ✅ Map backend ProductDto -> frontend Product
export function mapProductDtoToProduct(dto: ProductDto): Product {
    return {
        id: dto.id,                        // 🔥 FIXED (was String(dto.id))
        name: dto.name,
        description: dto.description ?? "",
        price: dto.basePrice,
        imageUrl: dto.imageUrl ?? "/images/brownie.png",

        // Use real rating (fallback to 0)
        rating:
            dto.rating !== null && dto.rating !== undefined
                ? Number(dto.rating)
                : 0,

        // Use category name or fallback
        category: dto.categoryName ?? "Other",

        // Available defaults to isActive for future logic
        available: dto.isActive ?? true,
    };
}

// Low–level fetch: raw DTOs
export async function fetchProductsFromApi(): Promise<ProductDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch products");
    }

    return (await response.json()) as ProductDto[];
}

// High–level helper: returns frontend Product[]
export async function fetchStoreProducts(): Promise<Product[]> {
    const dtos = await fetchProductsFromApi();
    return dtos.map(mapProductDtoToProduct);  // 🔥 now returns correct Product[]
}
