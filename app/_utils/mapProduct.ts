// app/_utils/mapProduct.ts
import type { Product } from "../_context/CartContext";
import type { ProductApiResponse } from "../_api/products";

export function mapProduct(api: ProductApiResponse): Product {
    return {
        id: api.id,
        name: api.name,
        description: api.description,
        price: api.basePrice, // 🔥 mapping basePrice → price
        imageUrl: api.imageUrl,
        rating: api.rating,
        category: api.categoryName, // 🔥 mapping categoryName → category
        available: true, // backend does not provide availability (optional)
    };
}
