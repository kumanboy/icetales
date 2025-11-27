"use client";

import { ProductCard } from "../ProductCard/ProductCard";
import type { Product } from "@/app/_context/CartContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

type CarouselProps = {
    products: Product[];
};

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    adaptiveHeight: true,
    swipeToSlide: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
        {
            breakpoint: 1200, // large tablets / small desktops
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            },
        },
        {
            breakpoint: 992, // tablets
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            },
        },
        {
            breakpoint: 640, // mobile
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
};

const Carousel = ({ products }: CarouselProps) => {
    if (!products.length) return null;

    return (
        <div className="mx-auto max-w-6xl px-4">
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="px-2 sm:px-3">
                        <ProductCard product={product} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Carousel;
