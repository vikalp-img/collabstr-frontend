"use client";

import Link from "next/link";
import { Mail, Key, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";

export default function CreatorForgotPasswordPage() {
  return (
    <main className={`min-h-screen flex flex-col relative ${theme.colors.pageBackground}`}>
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div>
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100">
                <Key className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
              Reset your creator password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the email tied to your creator account and we will send reset instructions.
            </p>
          </div>

          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="space-y-4">
              <div>
                <label htmlFor="creator-email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="creator-email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:text-sm transition-all"
                    placeholder="creator@email.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <button type="button" className={`w-full !rounded-xl ${theme.buttons.primary}`}>
                Send reset link
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
