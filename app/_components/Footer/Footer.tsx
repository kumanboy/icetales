import { Facebook, Instagram } from "lucide-react"
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-linear-to-r from-purple-600 to-purple-700 text-white pt-12 pb-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M 50 30 Q 40 60 50 90 Q 60 110 80 100 Q 90 70 80 40 Q 70 20 50 30 Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo Section */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍦</span>
              <span className="text-xl font-bold">
                <span className="text-pink-400">icy</span>
                <span>Tales</span>
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Shop
                </a>
              </li>
            </ul>
          </div>

          {/* Additional Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 opacity-0">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-pink-400 mt-1">📍</span>
                <div>
                  <p className="font-semibold text-sm">Address:</p>
                  <p className="text-sm text-gray-200">121 King Street Melbourne, 3000, Australia</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-pink-400 mt-1">📧</span>
                <div>
                  <p className="font-semibold text-sm">Email:</p>
                  <p className="text-sm text-gray-200">info@example.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-400 mt-1">📞</span>
                <div>
                  <p className="font-semibold text-sm">+123456780123</p>
                  <p className="text-xs text-gray-200">Got Questions? Call us 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-purple-500"></div>

        {/* Copyright */}
        <div className="text-center mt-6 text-sm text-gray-300">
            <p>Copyright © 2025 <Link href={"https://t.me/+lqNGWh5e2wtjMWYy"} target={"_blank"}>Ice Cream Land</Link>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
