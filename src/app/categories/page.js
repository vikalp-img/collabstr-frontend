"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { apiWithoutAuth } from "@/lib/apiService";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, Users, TrendingUp, Heart, Camera, Palette, Briefcase, Dumbbell, Utensils, Plane, Music2, Video, Globe
} from "lucide-react";

const getCategoryIcon = (categoryName) => {
  const name = categoryName ? categoryName.toLowerCase() : "";
  if (name.includes("fashion")) return Camera;
  if (name.includes("beauty")) return Palette;
  if (name.includes("business") || name.includes("office")) return Briefcase;
  if (name.includes("fitness") || name.includes("gym") || name.includes("health")) return Dumbbell;
  if (name.includes("food") || name.includes("cooking")) return Utensils;
  if (name.includes("travel") || name.includes("adventure")) return Plane;
  if (name.includes("music")) return Music2;
  if (name.includes("gaming")) return Video;
  if (name.includes("lifestyle")) return Heart;
  if (name.includes("family") || name.includes("parenting")) return Users;
  if (name.includes("tech") || name.includes("technology") || name.includes("software")) return TrendingUp;
  if (name.includes("education") || name.includes("learning")) return Globe;
  return Zap;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchCategories = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiWithoutAuth.get(API_ENDPOINTS.CATEGORY.LIST, {
        params: { page, limit: 24 }
      });
      const responseData = response.data;
      setCategories(responseData?.data || []);
      if (responseData?.pagination) {
        setTotalPages(responseData.pagination.totalPages || 1);
        setTotalResults(responseData.pagination.total || 0);
        setCurrentPage(responseData.pagination.page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
    if (typeof window !== 'undefined') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 w-full pt-24 sm:pt-32 pb-20 sm:pb-32 max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Browse <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Categories</span>
          </h1>
          <p className="text-gray-600 text-lg">Find the perfect creators in your specific niche.</p>
        </div>

        {isLoading ? (
          <PageLoader message="Loading categories..." />
        ) : categories.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const hasIcon = !!category.icon?.url;
                return (
                  <Link
                    key={category._id || category.id}
                    href={`/creators?category=${category._id || category.id}`}
                    className="group relative block h-[180px] sm:h-[220px] cursor-pointer overflow-hidden rounded-3xl shadow-md transition-all hover:shadow-2xl hover:-translate-y-2"
                  >
                    {hasIcon ? (
                      <Image
                        src={category.icon.url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <Icon className="h-16 w-16 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-12">
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {category.name}
                      </h3>
                      <div className="mt-2 flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        Explore <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-4 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 sm:p-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full text-sm font-semibold transition-all ${
                            currentPage === page 
                            ? "bg-[#111111] text-white shadow-md scale-105" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && page > 1) || 
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return <span key={page} className="px-1 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 sm:p-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-8">
            <p className="text-gray-500 text-lg">No categories found.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
