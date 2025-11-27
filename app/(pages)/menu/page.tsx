"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/app/_components/ProductCard/ProductCard";
import { Header } from "@/app/_components/Header/Header";
import type { Product } from "@/app/_context/CartContext";
import { fetchStoreProducts } from "@/app/_lib/productClient";


type SortOption = "default" | "price-asc" | "rating-desc";

// These now match your backend categories
const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "Canned Ice Cream", label: "Canned Ice Cream" },
    { id: "Frozen Yogurt", label: "Frozen Yogurt" },
    { id: "Ice Cream Cakes", label: "Ice Cream Cakes" },
    { id: "Milkshakes", label: "Milkshakes" },
    { id: "Popsicles", label: "Popsicles" },
    { id: "Sundaes", label: "Sundaes" },
] as const;

// Map backend categoryId (from /menu?categoryId=...) to filter id (category name)
const CATEGORY_ID_TO_FILTER: Record<string, string> = {
    "1": "Canned Ice Cream",
    "2": "Frozen Yogurt",
    "3": "Ice Cream Cakes",
    "4": "Milkshakes",
    "5": "Popsicles",
    "6": "Sundaes",
};

// Reusable Filters block (same content for desktop + mobile overlay)
type FiltersProps = {
    search: string;
    onSearchChange: (value: string) => void;
    category: string;
    onCategoryChange: (id: string) => void;
    minPrice: string;
    maxPrice: string;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    sort: SortOption;
    onSortChange: (value: SortOption) => void;
    onReset: () => void;
};

function Filters({
                     search,
                     onSearchChange,
                     category,
                     onCategoryChange,
                     minPrice,
                     maxPrice,
                     onMinPriceChange,
                     onMaxPriceChange,
                     sort,
                     onSortChange,
                     onReset,
                 }: FiltersProps) {
    return (
        <div className="space-y-12">
            {/* Search */}
            <div className="space-y-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
            </div>

            {/* Categories */}
            <div className="space-y-3 pt-4">
                <h3 className="text-sm font-semibold text-gray-800">Categories</h3>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 text-sm text-gray-700 hover:bg-pink-300"
                        >
                            <input
                                type="radio"
                                name="category"
                                value={cat.id}
                                checked={category === cat.id}
                                onChange={() => onCategoryChange(cat.id)}
                                className="h-5 w-5 accent-pink-500"
                            />
                            <span>{cat.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price range */}
            <div className="space-y-3 pt-1">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Filter by Price
                </h3>
                <p className="mb-3 text-sm text-gray-500">Enter min and max price</p>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        step="1"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => onMinPriceChange(e.target.value)}
                        className="h-10 w-20 rounded-full border border-gray-200 px-3 py-1 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                    <span className="text-xs text-gray-500">to</span>
                    <input
                        type="number"
                        step="1"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => onMaxPriceChange(e.target.value)}
                        className="h-10 w-20 rounded-full border border-gray-200 px-3 py-1 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                </div>
            </div>

            {/* Sort + Reset */}
            <div className="space-y-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-800">Sort</h3>
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="rating-desc">Rating: High → Low</option>
                </select>

                <button
                    type="button"
                    onClick={onReset}
                    className="w-full rounded-full border border-gray-200 bg-pink-500 px-4 py-2 text-sm font-medium text-white"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}

export default function MenuPage() {
    const searchParams = useSearchParams();
    const categoryIdFromQuery = searchParams.get("categoryId") ?? undefined;

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [sort, setSort] = useState<SortOption>("default");
    const [page, setPage] = useState<number>(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const pageSize = 8;

    // Load products from backend on mount
    useEffect(() => {
        let mounted = true;

        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                const data = await fetchStoreProducts();
                if (!mounted) return;
                setProducts(data);
            } catch (error) {
                if (!mounted) return;
                const message =
                    error instanceof Error ? error.message : "Failed to load products";
                setLoadError(message);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();
        return () => {
            mounted = false;
        };
    }, []);

    // When coming from home categories (/menu?categoryId=1..6), select related filter
    useEffect(() => {
        if (!categoryIdFromQuery) return;
        const mapped = CATEGORY_ID_TO_FILTER[categoryIdFromQuery];
        if (mapped) {
            setCategory(mapped);
            setPage(1);
        }
    }, [categoryIdFromQuery]);

    // ---------- FILTERING ----------
    let filteredProducts = products;

    if (search.trim()) {
        const q = search.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q),
        );
    }

    if (category !== "all") {
        filteredProducts = filteredProducts.filter(
            (p) => p.category === category,
        );
    }

    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;

    if (min !== undefined && !Number.isNaN(min)) {
        filteredProducts = filteredProducts.filter((p) => p.price >= min);
    }

    if (max !== undefined && !Number.isNaN(max)) {
        filteredProducts = filteredProducts.filter((p) => p.price <= max);
    }

    // ---------- SORTING ----------
    if (sort === "price-asc") {
        filteredProducts = [...filteredProducts].sort(
            (a, b) => a.price - b.price,
        );
    } else if (sort === "rating-desc") {
        // rating is 0 for now (backend does not provide it yet),
        // but we keep logic so it works when rating is added later.
        filteredProducts = [...filteredProducts].sort(
            (a, b) => b.rating - a.rating,
        );
    }

    // ---------- PAGINATION ----------
    const totalResults = filteredProducts.length;
    const pageCount =
        totalResults === 0 ? 1 : Math.ceil(totalResults / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalResults);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Handlers that also reset page to 1
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategoryChange = (id: string) => {
        setCategory(id);
        setPage(1);
    };

    const handleMinPriceChange = (value: string) => {
        setMinPrice(value);
        setPage(1);
    };

    const handleMaxPriceChange = (value: string) => {
        setMaxPrice(value);
        setPage(1);
    };

    const handleSortChange = (value: SortOption) => {
        setSort(value);
        setPage(1);
    };

    const handleReset = () => {
        setSearch("");
        setCategory("all");
        setMinPrice("");
        setMaxPrice("");
        setSort("default");
        setPage(1);
    };

    return (
        <>
            <Header />

            <main className="min-h-screen bg-white">
                <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
                    {/* Mobile / Tablet filter button */}
                    <div className="mb-4 flex justify-end lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-pink-500 hover:text-pink-500"
                        >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                  <path
                      d="M3 4h14M6 9h8M8 14h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                  />
                </svg>
              </span>
                            <span>Filters</span>
                        </button>
                    </div>

                    <div className="flex gap-4">
                        {/* LEFT: FILTERS (desktop only) */}
                        <aside className="hidden w-64 flex-shrink-0 lg:block">
                            <Filters
                                search={search}
                                onSearchChange={handleSearchChange}
                                category={category}
                                onCategoryChange={handleCategoryChange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onMinPriceChange={handleMinPriceChange}
                                onMaxPriceChange={handleMaxPriceChange}
                                sort={sort}
                                onSortChange={handleSortChange}
                                onReset={handleReset}
                            />
                        </aside>

                        {/* RIGHT: PRODUCTS */}
                        <section className="flex-1 space-y-8">
                            {/* Results info / loading / error */}
                            <div className="flex items-center justify-between">
                                {isLoading ? (
                                    <p className="text-sm text-gray-600">Loading products...</p>
                                ) : loadError ? (
                                    <p className="text-sm text-pink-500">
                                        Failed to load products: {loadError}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        {totalResults === 0
                                            ? "Showing 0 results"
                                            : `Showing ${startIndex + 1}–${endIndex} of ${totalResults} results`}
                                    </p>
                                )}
                            </div>

                            {/* Products grid – 4 columns */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {!isLoading &&
                                    !loadError &&
                                    paginatedProducts.map((product, index) => (
                                        <ProductCard
                                            key={`${product.id}-${index}`}
                                            product={product}
                                        />
                                    ))}
                                {!isLoading &&
                                    !loadError &&
                                    paginatedProducts.length === 0 && (
                                        <p className="col-span-full text-center text-sm text-gray-500">
                                            No products match these filters.
                                        </p>
                                    )}
                            </div>

                            {/* Pagination */}
                            {!isLoading &&
                                !loadError &&
                                totalResults > pageSize && (
                                    <div className="mt-2 flex justify-center gap-2">
                                        {Array.from(
                                            { length: pageCount },
                                            (_, i) => i + 1,
                                        ).map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setPage(pageNumber)}
                                                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                                                    pageNumber === page
                                                        ? "border-pink-500 bg-pink-500 text-white"
                                                        : "border-gray-200 text-gray-700 hover:border-pink-500 hover:text-pink-500"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </section>
                    </div>
                </div>

                {/* Mobile / Tablet Filter Overlay */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 bg-white lg:hidden">
                        <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-pink-500 hover:text-pink-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg
                                        viewBox="0 0 20 20"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M5 5l10 10M15 5L5 15"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <Filters
                                    search={search}
                                    onSearchChange={handleSearchChange}
                                    category={category}
                                    onCategoryChange={handleCategoryChange}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    onMinPriceChange={handleMinPriceChange}
                                    onMaxPriceChange={handleMaxPriceChange}
                                    sort={sort}
                                    onSortChange={handleSortChange}
                                    onReset={handleReset}
                                />
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Show results
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
