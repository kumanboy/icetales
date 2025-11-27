import Carousel from "./Carousel";
import { fetchStoreProducts } from "@/app/_lib/productClient";

const CarouselSection = async () => {
    // Fetch from backend and map to frontend Product[]
    const products = await fetchStoreProducts();

    // Optional: show only first N items in carousel
    const featuredProducts = products.slice(0, 8);

    return (
        <section className="carousel-section bg-white py-12 sm:py-16 lg:py-24">
            <article className="mx-auto max-w-5xl px-4 text-center">
                <h2 className="font-berkshire text-3xl sm:text-4xl lg:text-6xl leading-tight">
                    Our <span className="text-pink-500">Classic</span> Favorites
                </h2>
                <p className="mt-3 text-sm sm:text-base md:text-lg font-archivo text-gray-600">
                    Check out our top products that our customers love.
                </p>
            </article>

            <div className="mt-8 sm:mt-10">
                <Carousel products={featuredProducts} />
            </div>
        </section>
    );
};

export default CarouselSection;
