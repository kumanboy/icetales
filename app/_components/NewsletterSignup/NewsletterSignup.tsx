"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && agreed) {
      setSubmitted(true)
      setEmail("")
      setAgreed(false)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="relative py-16 md:py-24 px-4 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute w-20 h-20 bg-pink-500 rounded-full opacity-60"></div>
          <div className="absolute top-8 left-8 w-16 h-16 bg-pink-300 rounded-full opacity-40"></div>
        </div>
      </div>

      <div className="absolute right-0 top-8 w-24 h-24 opacity-30 pointer-events-none">
        <div className="w-full h-full bg-linear-to-br from-pink-400 to-purple-500 transform rotate-45 rounded-lg"></div>
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-berkshire mb-4 text-balance">
          Sign up For <span className="text-pink-500">Exclusive Deals</span> and Updates
        </h2>

        {/* Subheading */}
        <p className="text-gray-600 text-lg mb-8 font-archivo">
          Get 10% off your next order and stay updated with our latest offers.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 bg-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
            <button
              type="submit"
              disabled={!email || !agreed}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Subscribe
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Checkbox */}
          <div className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="privacy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-pink-500 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-gray-600 text-sm">
              I agree to the{" "}
              <a href="#" className="text-pink-500 font-semibold hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
        </form>

        {/* Success message */}
        {submitted && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            Thank you for subscribing!
          </div>
        )}
      </div>
    </section>
  )
}
