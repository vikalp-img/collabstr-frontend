"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { useUser } from "@/context/UserContext";
import { Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function CreatorPortalLanding() {
  const { user } = useUser();

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm ring-1 ring-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            Creator Portal
          </div>
          
          {user ? (
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Welcome back, {user.name || user.userName || "Creator"}
              </h1>
              <p className="text-lg text-gray-600">
                Manage your profile, showcase your work, and collaborate with brands.
              </p>
              
              {/* Approval Status Alert */}
              <div className="max-w-md mx-auto">
                {Number(user.approvalStatus) === 0 ? (
                  <div className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-amber-800 shadow-sm text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 leading-none">Profile Under Review</p>
                      <p className="text-sm text-amber-700 mt-1.5 focus:outline-none">
                        Your profile is currently under review by our admin team.
                      </p>
                    </div>
                  </div>
                ) : Number(user.approvalStatus) === 2 ? (
                  <div className="flex items-center gap-4 rounded-2xl bg-red-50 border border-red-200 p-5 text-red-800 shadow-sm text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900 leading-none">Profile Rejected</p>
                      <p className="text-sm text-red-700 mt-1.5 focus:outline-none">
                        {user.rejectReason || "Your profile has been rejected. Please update your information and try again."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-center pt-4">
                <Link
                  href="/creator/dashboard"
                  className={`w-full sm:w-auto px-12 py-3.5 rounded-xl text-base font-bold text-white shadow-lg transition-all active:scale-95 ${theme.buttons.primary}`}
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Sign in or get started as a Creator
              </h1>
              <p className="text-lg text-gray-600">
                Manage your profile, showcase your work, and collaborate with brands. Pick an option below to continue.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl text-base font-semibold text-white ${theme.buttons.primary}`}
                >
                  Login
                </Link>
                <Link
                  href="/creator/signup"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-base font-semibold text-purple-700 bg-purple-50 ring-1 ring-purple-100 hover:bg-purple-100 transition-colors"
                >
                  Create Creator Account
                </Link>
              </div>
            </>
          )}

          <p className="text-sm text-gray-500">
            Looking for brand access instead? Use the main Login or Signup pages.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
