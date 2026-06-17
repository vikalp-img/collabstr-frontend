"use client";

import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { theme } from "@/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResetPasswordPage() {
  return (
    <main className={`min-h-screen flex flex-col relative ${theme.colors.pageBackground}`}>
      <Header />
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute bottom-1/4 left-1/4 h-96 w-96 ${theme.effects.blurOrbPink}`} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center mb-6 mt-4">
            <div className={`flex items-center justify-center h-16 w-16 rounded-full bg-pink-100`}>
              <ShieldCheck className="h-8 w-8 text-pink-600" />
            </div>
          </div>
          <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Set new password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your new password must be different to previously used passwords.
          </p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input id="password" name="password" type="password" autoComplete="new-password" required className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:text-sm transition-all" placeholder="New password" />
              </div>
              <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:text-sm transition-all" placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          <div>
            <button type="button" className={`w-full !rounded-xl ${theme.buttons.primary}`}>
              Set new password
            </button>
          </div>
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to log in
            </Link>
          </div>
        </form>
      </div>
     </div>
     <Footer />
    </main>
  );
}
