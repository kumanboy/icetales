"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Category = {
    id: number;
    name: string;
    image: string;
};

const categories: Category[] = [
    {
        id: 1,
        name: "Sundaes",
        image: "/images/red-sorbet-ice-cream-in-white-bowl.jpg",
    },
    {
        id: 2,
        name: "Ice Cream Cones",
        image: "/images/colorful-ice-cream-cones.jpg",
    },
    {
        id: 3,
        name: "Milkshakes",
        image: "/images/pink-strawberry-milkshake.jpg",
    },
    {
        id: 4,
        name: "Seasonal Flavors",
        image: "/images/pink-ice-cream-scoops-bowl.jpg",
    },
];

export function CategoriesSection() {
    return (
        <section className="w-full bg-linear-to-b from-white to-pink-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-berkshire mb-4">
                        Explore Our <span className="text-pink-500">Categories</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto font-archivo">
                        Browse through our different categories to find your favorite ice cream treats.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/menu?categoryId=${category.id}`}
                            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            aria-label={`Explore ${category.name}`}
                        >
                            {/* Image Container */}
                            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-200">
                                <Image
                                    src={category.image || "/placeholder.svg"}
                                    alt={category.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>

                            {/* Category Name and Arrow */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/40 to-transparent p-4 flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg">{category.name}</h3>
                                <div className="bg-pink-500 group-hover:bg-pink-600 text-white rounded-full p-3 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
