"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-[100vh] w-full bg-gradient-to-br from-[#EFD7EF] via-[#F5F9FC] to-[#EAF8F9]">
      <div className="text-center px-6">
        <h1 className="text-[96px] font-extrabold text-[#0F0200] leading-none">
          404
        </h1>

        <p className="text-2xl font-semibold text-[#0F0200] mt-4">
          Sorry! The Page Not Found ;
        </p>

        <p className="text-gray-600 max-w-md mx-auto mt-3 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-[#F83D8E] to-[#FF6AC9] text-white font-semibold shadow-lg hover:shadow-xl transition hover:-translate-y-1"
        >
          Back to Home →
        </Link>
      </div>
    </div>
  );
}
