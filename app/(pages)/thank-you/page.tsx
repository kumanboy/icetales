"use client";

import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="flex items-center justify-center h-[100vh] w-full bg-gradient-to-br from-[#EFD7EF] via-[#F5F9FC] to-[#F8EAE1]">
      <div className="text-center px-6">
        
        {/* Smiley Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-pink-400">
            <span className="text-[40px] text-pink-500">😊</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[52px] font-extrabold text-[#0F0200] leading-tight">
          Thank You!
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 mt-4 leading-relaxed max-w-xl mx-auto">
          We`re delighted you`ve decided to treat yourself to our delectable ice creams.  
          Your order has been received and is now being prepared with care.
        </p>

        {/* Button */}
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
