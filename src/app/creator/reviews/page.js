"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/PageLoader";
import { Star, MessageSquare, Briefcase, Calendar, ChevronRight, User, AlertCircle } from "lucide-react";

export default function CreatorReviewsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (!token) {
        router.push("/login");
      } else if (role === "brand") {
        router.push("/brand/home");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?._id) return;
      try {
        setIsLoading(true);
        const response = await apiWithAuth.get(`${API_ENDPOINTS.REVIEWS.GET_BY_CREATOR}${user._id}`);
        const apiData = response?.data?.data || {};
        setReviews(apiData.reviews || []);
        setAverageRating(apiData.averageRating || 0);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchReviews();
    }
  }, [user]);

  if (userLoading || (isLoading && reviews.length === 0)) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Loading reviews..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-sm border border-purple-200 uppercase tracking-wider">
                <Star className="h-3.5 w-3.5 fill-purple-700" /> Reviews & Feedback
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Ratings</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
                See what brands say about your work, check ratings, and build your digital reputation.
              </p>
            </div>

            {/* Overall Rating Card */}
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-3xl p-6 shadow-sm min-w-[240px]">
              <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Star className="h-7 w-7 fill-amber-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Average Rating</p>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                  {Number(averageRating || 0).toFixed(1)} / 5.0
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">{reviews.length} total reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((rev) => (
                <div 
                  key={rev._id}
                  className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    {/* Brand Info & Rating Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100/50 overflow-hidden shrink-0">
                          {rev.brandProfileImage ? (
                            <img src={rev.brandProfileImage} alt={rev.brandName} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{rev.brandName || "Brand"}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client partner</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 text-amber-600 font-black text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                        {Number(rev.rating).toFixed(1)}
                      </div>
                    </div>

                    {/* Review Note */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 relative">
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{rev.comment || "No comment provided."}"
                      </p>
                    </div>
                  </div>

                  {/* Service details and Date */}
                  <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      <span>Service: <span className="text-gray-700">{rev.serviceName || "Custom Package"}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[40px] border border-gray-100 bg-white p-16 md:p-24 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
              <div className="h-24 w-24 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mx-auto shadow-inner">
                <MessageSquare className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">No reviews yet</h3>
                <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
                  Your feedback history is currently empty. Deliver collaborations to start getting ratings from brands.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
