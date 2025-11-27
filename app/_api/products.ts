export type ProductApiResponse = {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    rating: number;
    categoryName: string;
};

export async function fetchProducts(): Promise<ProductApiResponse[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to load products from backend");
    }

    return res.json();
}
