"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  ChevronRight,
  TrendingUp,
  Users,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
  MessageSquare,
  Shield,
  Heart,
  Filter,
  BarChart3,
  Clock,
  CheckCircle2,
  Camera,
  Palette,
  Briefcase,
  Dumbbell,
  Utensils,
  Plane,
  Music2,
  Video,
  Globe,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InfluencerCard from "@/components/InfluencerCard";
import { useUser } from "@/context/UserContext";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import { theme } from "@/theme";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import PageLoader from "@/components/PageLoader";

export default function BrandHomePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentCreatorIndex, setCurrentCreatorIndex] = useState(0);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Auth guard — redirect if not brand
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (!token) {
        router.push("/login");
      } else if (role === "creator") {
        router.push("/creator/dashboard");
      }
    }
  }, [router]);

  // Fetch featured creators
  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoadingCreators(true);
      try {
        const response = await apiWithAuth.get(API_ENDPOINTS.USER.CREATORS_LIST, {
          params: { page: 1, limit: 8 ,isFeatured:true},
        });
        const apiResponse = response.data;
        const data = apiResponse?.data || [];

        const mappedCreators = (Array.isArray(data) ? data : []).map((creator) => ({
          id: creator._id || creator.id,
          name: creator.userName || creator.name || "Unknown Creator",
          avatar:
            creator.media?.url ||
            creator.profile_image?.url ||
            creator.profileImage ||
            creator.avatar ||
            (((creator.gender || creator.creatorProfile?.gender || creator.profile?.gender || "").toLowerCase() === "male")
              ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
              : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"),
          gender: creator.gender || creator.creatorProfile?.gender || creator.profile?.gender || "",
          rating: creator.rating || "5.0",
          badges: Array.isArray(creator.badges) ? creator.badges : [],
          bottomBadge: creator.socialAccount?.platform
            ? {
                type: creator.socialAccount.platformKey?.toLowerCase() || "instagram",
                label:
                  creator.socialAccount.followers > 1000
                    ? (creator.socialAccount.followers / 1000).toFixed(1) + "k"
                    : creator.socialAccount.followers || "0",
              }
            : { type: "UGC", label: "UGC" },
          gridImages: false,
          bio: creator.title || creator.creatorProfile?.bio || creator.bio || "",
          location:
            creator.location ||
            creator.creatorProfile?.location?.city ||
            (typeof creator.location === "object" ? creator.location?.city : creator.location) ||
            "Global",
          isFavorite: creator.isFavorite || false,
        }));

        setFeaturedCreators(mappedCreators);
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setIsLoadingCreators(false);
      }
    };
    fetchCreators();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.CATEGORY.LIST);
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 12));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await apiWithAuth.get(API_ENDPOINTS.USER.WALLET);
        const balance = response?.data?.data?.balance || response?.data?.balance || 0;
        setWalletBalance(balance);
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      }
    };
    fetchWallet();
  }, []);

  const handleFavorite = async (creator) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    if (!token) {
      // In this version of the page, we assume the user is a brand because of the guard,
      // but if the token is missing for some reason, we handle it.
      return;
    }

    if (creator.isFavorite) {
      try {
        await apiWithAuth.post(API_ENDPOINTS.FAVORITES.REMOVE_FROM_LIST, {
          creatorId: creator.id,
        });
        toast.success("Removed from favorites");
        setFeaturedCreators((prev) =>
          prev.map((c) => (c.id === creator.id ? { ...c, isFavorite: false } : c))
        );
      } catch (err) {
        console.error("Failed to remove from favorites:", err);
        toast.error("Failed to remove from favorites");
      }
    } else {
      setSelectedCreator(creator);
      setIsFavoriteModalOpen(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/creators?category=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/creators");
    }
  };

  // Helper to get icon for category (synced with home page)
  const getCategoryIcon = (categoryName) => {
    const name = categoryName ? categoryName.toLowerCase() : "";
    if (name.includes("fashion")) return Camera;
    if (name.includes("beauty")) return Palette;
    if (name.includes("business") || name.includes("office")) return Briefcase;
    if (
      name.includes("fitness") ||
      name.includes("gym") ||
      name.includes("health")
    )
      return Dumbbell;
    if (name.includes("food") || name.includes("cooking")) return Utensils;
    if (name.includes("travel") || name.includes("adventure")) return Plane;
    if (name.includes("music")) return Music2;
    if (name.includes("gaming")) return Video;
    if (name.includes("lifestyle")) return Heart;
    if (name.includes("family") || name.includes("parenting")) return Users;
    if (
      name.includes("tech") ||
      name.includes("technology") ||
      name.includes("software")
    )
      return TrendingUp;
    if (name.includes("education") || name.includes("learning")) return Globe;
    return Zap; // Default icon
  };

  const brandName = user?.brandname || user?.fullname?.split(" ")[0] || "there";



  const howItWorks = [
    {
      step: "01",
      title: "Search & Discover",
      description: "Browse thousands of creators filtered by platform, niche, audience size, and price.",
      icon: Search,
      gradient: "from-purple-500 to-purple-700",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/love_by_creator_1.png`,
    },
    {
      step: "02",
      title: "Connect & Collaborate",
      description: "Send direct messages to creators, discuss collaboration details, and align on deliverables.",
      icon: MessageSquare,
      gradient: "from-pink-500 to-rose-600",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/love_by_creator_2.png`,
    },
    {
      step: "03",
      title: "Pay Securely",
      description: "Use our secure escrow payment system. Funds are released only when you approve the work.",
      icon: Shield,
      gradient: "from-blue-500 to-cyan-600",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/love_by_creator_3.png`,
    },
    {
      step: "04",
      title: "Track & Measure",
      description: "Monitor collaboration performance with real-time analytics and detailed reporting dashboards.",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/love_by_creator_4.png`,
    },
  ];



  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* ───────── HERO SECTION ───────── */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 pb-6 sm:pb-8">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/60 via-pink-50/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-blue-50/50 via-purple-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-50/20 to-transparent rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-0">
          {/* Welcome badge & Wallet */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-full px-5 py-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                Welcome back, {brandName}!
              </span>
            </div>
            
            {walletBalance !== null && (
              <Link 
                href="/brand/wallet"
                className="inline-flex items-center gap-2 bg-white border border-emerald-100 rounded-full px-5 py-2 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Wallet className="h-3 w-3" />
                </div>
                <span className="text-sm font-bold text-gray-700">
                  Wallet: <span className="text-emerald-600 font-black">₹{Number(walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </span>
              </Link>
            )}
          </div>

          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Find the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              perfect creators
            </span>
            <br className="hidden sm:block" /> for your brand
          </h1>

          <p className="mt-5 text-center text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover, connect, and collaborate with top influencers and content creators across every platform and niche.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-2 pl-6 gap-3 transition-all hover:shadow-[0_8px_35px_-4px_rgba(0,0,0,0.12)] focus-within:shadow-[0_8px_35px_-4px_rgba(147,51,234,0.15)] focus-within:border-purple-200">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by category, niche, or creator name..."
                className="flex-1 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className={theme.buttons.primary}
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Instagram", "TikTok", "YouTube", "UGC"].map((platform) => (
              <button
                key={platform}
                onClick={() => router.push(`/creators?category=${platform}`)}
                className="text-sm font-medium text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-100 hover:border-purple-200 px-4 py-2 rounded-full transition-all"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* ───────── FEATURED CREATORS ───────── */}
      <section className="px-4 py-8 md:py-12 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>

              <h2>
                Featured{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  creators
                </span>
              </h2>
              <p className="mt-2 text-gray-500 text-base sm:text-lg max-w-lg">
                Handpicked creators ready to amplify your brand's reach and engagement.
              </p>
            </div>
            <Link
              href="/creators"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm group transition-colors self-start sm:self-auto"
            >
              View all creators
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoadingCreators ? (
            <PageLoader message="Finding tailored talent..." />
          ) : featuredCreators.length > 0 ? (
            <div className="space-y-4">
              <div
                id="creators-swiper"
                className="flex -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide pt-2 pb-8 md:pb-0 scroll-smooth"
                onScroll={(e) => {
                  if (window.innerWidth < 768) {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const itemWidth = e.currentTarget.offsetWidth * 0.85 + 16;
                    const index = Math.round(scrollLeft / itemWidth);
                    if (index !== currentCreatorIndex) {
                      setCurrentCreatorIndex(index);
                    }
                  }
                }}
              >
                {featuredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="w-[85%] min-w-[280px] md:w-full md:min-w-0 snap-center"
                  >
                    <InfluencerCard
                      creator={creator}
                      onFavorite={handleFavorite}
                      isFavorite={creator.isFavorite}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination dots (mobile only) */}
              <div className="flex justify-center gap-2 mt-2 md:hidden">
                {featuredCreators.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const container = document.getElementById("creators-swiper");
                      if (container) {
                        const itemWidth = container.offsetWidth * 0.85 + 16;
                        container.scrollTo({
                          left: idx * itemWidth,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentCreatorIndex === idx
                        ? "w-6 bg-purple-600 shadow-sm"
                        : "w-1.5 bg-purple-200"
                    }`}
                    aria-label={`Go to creator ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-gray-500 text-lg">
              No creators available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* ───────── BROWSE BY CATEGORY ───────── */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="text-center mb-10">
            <h2>
              Browse by{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                category
              </span>
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              Find creators specialised in your industry or project goals.
            </p>
          </div>

          <div className="min-h-[200px]">
            {isLoadingCategories ? (
              <PageLoader message="Loading categories..." />
            ) : categories.length > 0 ? (
              <div className="space-y-8">
                <div
                  id="categories-swiper"
                  className="flex -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid gap-4 md:grid-cols-4 lg:grid-cols-6 snap-x snap-mandatory scrollbar-hide pt-10 pb-10 scroll-smooth"
                  onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const itemWidth = 180 + 16; // width + gap
                    const index = Math.round(scrollLeft / itemWidth);
                    if (index !== currentCategoryIndex) {
                      setCurrentCategoryIndex(index);
                    }
                  }}
                >
                  {categories.map((category, idx) => {
                    const name = category.name || "";
                    const Icon = getCategoryIcon(name);
                    const hasIcon = !!category.icon?.url;

                    return (
                      <div
                        key={category._id || category.id || idx}
                        className="w-[180px] min-w-[150px] md:w-full md:min-w-0 snap-center"
                      >
                        <Link
                          href={`/creators?category=${category._id || category.id}`}
                          className="group relative block h-[160px] sm:h-[180px] cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                          {/* Background image or gradient fallback */}
                          {hasIcon ? (
                            <Image
                              src={category.icon.url}
                              alt={name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Icon className="h-12 w-12 text-white/60" />
                            </div>
                          )}

                          {/* Bottom gradient overlay with title */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-10">
                            <h3 className="text-[15px] text-center font-semibold text-white leading-snug">
                              {name}
                            </h3>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination dots (mobile only) */}
                <div className="flex justify-center gap-2 mt-2 mb-8 md:hidden">
                  {categories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const container = document.getElementById("categories-swiper");
                        if (container) {
                          const itemWidth = 180 + 16;
                          container.scrollTo({
                            left: idx * itemWidth,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentCategoryIndex === idx
                          ? "w-6 bg-purple-600 shadow-sm"
                          : "w-1.5 bg-purple-200"
                      }`}
                      aria-label={`Go to category ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href="/categories"
                    className={theme.buttons.secondary}
                  >
                    Explore all categories
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="px-4 py-8 md:py-12" id="how-it-works-brand">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-3">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              Launch your influencer marketing projects in four easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <div
                key={idx}
                className="group relative h-full rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-purple-50"
              >
                {/* Step Image */}
                {item.image && (
                  <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      title="Step Preview"
                    />
                  </div>
                )}



                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA SECTION ───────── */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
            {/* Background Image */}
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/ready_to_grow_brand.png`}
              alt="Ready to grow your brand"
              fill
              unoptimized
              className="absolute inset-0 object-cover opacity-60 pointer-events-none"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-pink-900/40" />
            
            <div className="relative z-10 p-10 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to grow your brand?
              </h2>
              <p className="text-purple-100 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Start discovering the perfect creators for your next project. Search, connect, and collaborate — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/creators"
                  className={theme.buttons.white}
                >
                  <Search className="w-5 h-5" />
                  Browse Creators
                </Link>
                <Link
                  href="/pricing"
                  className={theme.buttons.outlineWhite}
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <AddToCollectionModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        creator={selectedCreator}
        onSuccess={(creatorId) => {
          setFeaturedCreators((prev) =>
            prev.map((c) => (c.id === creatorId ? { ...c, isFavorite: true } : c))
          );
        }}
      />
    </main>
  );
}
