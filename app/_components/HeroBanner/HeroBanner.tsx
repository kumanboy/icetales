"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 items-center gap-12">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            {/* Decorative element */}
            <div className="w-24 h-24 opacity-10">
              <div className="text-6xl">🍦</div>
            </div>

            {/* Main Heading */}
            <div>
              <p className="text-gray-700 text-lg mb-2">
                <span className="border-l-4 border-purple-600 pl-3 font-berkshire">Welcome to The</span>
              </p>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight font-berkshire">
                Discover <span className="text-pink-500">Sweet</span> Delights!
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg max-w-md font-archivo">
              Relish the timeless taste of handcrafted ice cream, made with passion and the finest ingredients.
            </p>

            {/* CTA Button */}
            <div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-base font-medium">
                <Link href={"/menu"}> Browse Our Classic Flavors</Link>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Content - Ice Cream Image */}
          <div className="flex justify-center items-center">
            <div className="relative w-80 h-96">
              {/* Gray circular background */}
              <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 rounded-full blur-3xl opacity-60" />

              {/* Ice cream illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/ice-cream.png"
                  alt="Ice cream cone with colorful scoops"
                  className="w-full h-full object-contain drop-shadow-lg"
                  width={670}
                  height={780}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
