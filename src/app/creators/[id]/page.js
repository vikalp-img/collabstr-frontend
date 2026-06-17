"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import {
  Globe,
  MapPin,
  Star,
  Heart,
  ShoppingBag,
  ShoppingCart,
  BriefcaseBusiness,
  Instagram,
  Video,
  Users,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Music2,
  Youtube,
  Twitter,
  Layout,
  Sparkles,
  X,
  Check,
  Zap,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Maximize2,
  Package,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import { useCart } from "@/context/CartContext";
import { theme } from "@/theme";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";

export default function CreatorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [activePlatformFilter, setActivePlatformFilter] = useState("All");

  // Cart
  const { addToCart, isInCart } = useCart();
  const [isBrand, setIsBrand] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setIsBrand(role === "brand");
    }
  }, []);

  const openPortfolio = (index) => {
    setCurrentPortfolioIndex(index);
    setIsModalOpen(true);
  };

  const nextPortfolio = (e) => {
    e?.stopPropagation();
    setCurrentPortfolioIndex((prev) => (prev + 1) % creator.portfolio.length);
  };

  const prevPortfolio = (e) => {
    e?.stopPropagation();
    setCurrentPortfolioIndex(
      (prev) =>
        (prev - 1 + creator.portfolio.length) % creator.portfolio.length,
    );
  };

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const isBrand = typeof window !== 'undefined' && localStorage.getItem("userRole") === "brand";
        const api = isBrand ? apiWithAuth : apiWithoutAuth;
        const response = await api.get(
          `${API_ENDPOINTS.USER.CREATOR_DETAILS}${id}`,
        );
        const data = response.data?.data || response.data;

        if (!data) {
          setError("Creator not found");
          return;
        }

        // Transform API data to match UI expectations
        const mappedCreator = {
          id: data._id,
          name: data.userName || "Unknown Creator",
          coverImage:
            data.portfolio?.[0]?.media?.url ||
            data.profile_image?.url ||
            (String(data.creatorProfile?.gender || "").toLowerCase() === "male" || String(data.creatorProfile?.gender || "").toLowerCase() === "boy" || String(data.creatorProfile?.gender || "").toLowerCase() === "men"
              ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
              : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"),
          avatar:
            data.profile_image?.url ||
            (String(data.creatorProfile?.gender || "").toLowerCase() === "male" || String(data.creatorProfile?.gender || "").toLowerCase() === "boy" || String(data.creatorProfile?.gender || "").toLowerCase() === "men"
              ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
              : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"),
          rating: data.creatorProfile?.rating || "5.0",
          bio: data.creatorProfile?.bio || "No bio available.",
          title: data.creatorProfile?.title || "",
          location: data.creatorProfile?.location?.city
            ? `${data.creatorProfile.location.city}${data.creatorProfile.location.country ? `, ${data.creatorProfile.location.country}` : ""}`
            : "Global",
          languages: data.creatorProfile?.languages || ["English"],
          categories: data.creatorProfile?.category || [],
          engagementRate: data.engagementRate || "4.5%",
          socialAccounts: (data.socialAccounts || []).map((acc) => ({
            platform: acc.platform?.name || "",
            platformKey: acc.platform?.key || "",
            handle: acc.handle || "",
            followers:
              acc.followers >= 1000
                ? (acc.followers / 1000).toFixed(1) + "k"
                : acc.followers || "0",
          })),
          portfolio: data.portfolio || [],
          services: (data.services || []).map((svc) => ({
            id: svc._id,
            title:
              typeof svc.serviceType === "object"
                ? svc.serviceType.title
                : svc.serviceType || svc.title,
            price: `₹${svc.price || 0}`,
            rawPrice: svc.price || 0,
            description: svc.description || "",
            platform:
              typeof svc.platform === "object"
                ? svc.platform.name
                : svc.platform,
            platformKey:
              typeof svc.platform === "object"
                ? svc.platform.key
                : (svc.platform || "").toLowerCase(),
            quantity: svc.quantity,
          })),
          reviews: data.reviews || [
            {
              author: "Recent Brand",
              rating: "5.0",
              comment:
                "Excellent content quality and professional communication.",
            },
            {
              author: "Marketing Manager",
              rating: "5.0",
              comment: "Delivered exactly what was requested on time.",
            },
          ],
          isFavorite: data.isFavorite || false,
        };

        setCreator(mappedCreator);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch creator details:", err);
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message || "";
        
        if (status === 403 && message.toLowerCase().includes("limit")) {
          setIsQuotaExceeded(true);
          setError(message);
        } else {
          setError("Failed to load creator details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setIsReviewsLoading(true);
      try {
        const isBrand = typeof window !== 'undefined' && localStorage.getItem("userRole") === "brand";
        const api = isBrand ? apiWithAuth : apiWithoutAuth;
        const response = await api.get(`${API_ENDPOINTS.REVIEWS.GET_BY_CREATOR}${id}`);
        const rawData = response.data?.data.reviews || response.data || [];
        const reviewsData = Array.isArray(rawData) ? rawData : [];


        
        const mappedReviews = reviewsData.map(r => ({
          author: r.brandName || r.brandId?.userName || r.userId?.userName || r.author || "Anonymous Brand",
          avatar: r.brandProfileImage || r.brandId?.profile_image?.url || r.userId?.profile_image?.url || null,
          rating: r.rating ? Number(r.rating).toFixed(1) : "5.0",
          comment: r.comment || "",
          date: r.createdAt
        }));

        setReviews(mappedReviews);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setIsReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);
  
  const toggleFavorite = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    if (!token) {
      toast.error("Please login to favorite creators");
      router.push("/login");
      return;
    }

    if (creator.isFavorite) {
      try {
        await apiWithAuth.post(API_ENDPOINTS.FAVORITES.REMOVE_FROM_LIST, {
          creatorId: creator.id,
        });
        toast.success("Removed from favorites");
        setCreator((prev) => ({ ...prev, isFavorite: false }));
      } catch (err) {
        console.error("Failed to remove from favorites:", err);
        toast.error("Failed to remove from favorites");
      }
    } else {
      setIsFavoriteModalOpen(true);
    }
  };

  const getPlatformIcon = (platformKey) => {
    switch (platformKey?.toLowerCase()) {
      case "instagram":
        return Instagram;
      case "tiktok":
        return Music2;
      case "youtube":
        return Youtube;
      case "twitter":
      case "x":
        return Twitter;
      default:
        return Globe;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Loading creator's universe..." />
        <Footer />
      </main>
    );
  }

  if (error || !creator) {
    const isQuotaError = isQuotaExceeded || (error && error.toLowerCase().includes("limit"));
    
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 px-4 text-center">
          <div className={`w-20 h-20 ${isQuotaError ? "bg-purple-50" : "bg-red-50"} rounded-full flex items-center justify-center mb-6`}>
            {isQuotaError ? (
              <Zap className="h-10 w-10 shrink-0 text-purple-600" />
            ) : (
              <Globe className="h-10 w-10 shrink-0 text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isQuotaError ? "Quota Limit Reached" : "Something went wrong"}
          </h1>
          <p className="text-gray-500 max-w-md mb-8">
            {error || "We couldn't find the creator you're looking for."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isQuotaError && (
              <button
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Upgrade Plan
              </button>
            )}
            <button
              onClick={() => router.push("/creators")}
              className={`${theme.buttons.primary} ${isQuotaError ? "bg-gray-100 text-gray-900 border-none shadow-none hover:bg-gray-200" : ""}`}
            >
              Back to Explore
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const totalAudience = (creator.socialAccounts || []).reduce((acc, curr) => {
    const followersStr = String(curr.followers || "0");
    const val =
      parseFloat(followersStr.replace(/[kK]/g, "")) *
      (followersStr.toLowerCase().includes("k") ? 1000 : 1);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const formattedTotalAudience =
    totalAudience >= 1000000
      ? (totalAudience / 1000000).toFixed(1) + "M"
      : totalAudience >= 1000
        ? (totalAudience / 1000).toFixed(1) + "k"
        : totalAudience;

  // Service selection and platform filter
  const uniquePlatforms = ["All", ...new Set((creator.services || []).map(s => s.platform).filter(Boolean))];
  const filteredServices = activePlatformFilter === "All"
    ? (creator.services || [])
    : (creator.services || []).filter(s => s.platform === activePlatformFilter);
  const selectedService = filteredServices[selectedServiceIndex];
  const totalSelectedPrice = selectedService?.rawPrice || 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
      <Header />

      <section className="mx-auto max-w-7xl px-4 lg:px-0 pb-16 pt-28">
        {/* Profile Hero Card */}
        <div className="rounded-3xl border border-purple-100 bg-gradient-to-r from-white via-purple-50/30 to-pink-50/40 p-4 shadow-[0_20px_70px_-45px_rgba(107,33,168,0.45)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-center">
            <div className="mx-auto w-full max-w-[320px] relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative rounded-2xl bg-white p-2 shadow-inner ring-1 ring-purple-100/50">
                <Image
                  src={creator.coverImage}
                  alt={creator.name}
                  className="h-[360px] w-full rounded-xl object-cover shadow-sm"
                 title="Image"  width={800}  height={800}  fetchPriority="auto" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                      {creator.name}
                    </h1>
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100/50">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      Verified
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm font-medium text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400 border-none" />
                      <span className="text-gray-900 font-bold">
                        {creator.rating}
                      </span>{" "}
                      rating
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0 text-purple-600" />
                      {creator.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-4 w-4 shrink-0 text-purple-600" />
                      {(creator.languages || []).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">


                  <button 
                    onClick={toggleFavorite}
                    className="inline-flex items-center justify-center p-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" 
                    type="button"
                  >
                    <Heart className={`h-4 w-4 shrink-0 ${creator.isFavorite ? "fill-purple-600 text-purple-600" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Engagement
                  </p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {creator.engagementRate}
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Audience
                  </p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {formattedTotalAudience}
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Reviews
                  </p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {reviews.length}+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            {/* About Section */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-purple-600"></div>
                About Creator
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium italic">
                "{creator.bio}"
              </p>
              <div className="flex flex-wrap gap-2">
                {(creator.languages || []).map((language) => (
                  <span
                    key={language}
                    className="rounded-xl bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 border border-purple-100"
                  >
                    {language}
                  </span>
                ))}
                {(creator.categories || []).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-xl bg-pink-50 px-4 py-2 text-xs font-bold text-pink-700 border border-pink-100"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Accounts */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-purple-600"></div>
                Connected Platforms
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(creator.socialAccounts || []).map((account) => {
                  const Icon = getPlatformIcon(account.platformKey);
                  return (
                    <div
                      key={`${account.platform}-${account.handle}`}
                      className="group rounded-2xl border border-gray-50 bg-gray-50/50 px-4 sm:px-6 py-5 transition-all hover:bg-white hover:border-purple-100 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                            <Icon className="h-5 w-5 shrink-0 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {account.platform}
                            </p>
                            <p className="font-bold text-gray-900">
                              {account.handle.startsWith("@")
                                ? account.handle
                                : `@${account.handle}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Followers
                          </p>
                          <p className="text-lg font-black text-purple-700 leading-none mt-0.5">
                            {account.followers}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Section */}
            {(creator.portfolio || []).length > 0 && (
              <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                  <div className="h-6 w-1 rounded-full bg-purple-600"></div>
                  Creative Portfolio
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(creator.portfolio || []).map((item, idx) => {
                    const mediaUrl =
                      typeof item === "object"
                        ? item.media?.url || item.url || item.media
                        : item;
                    const isImageUrl =
                      typeof mediaUrl === "string" &&
                      (mediaUrl.startsWith("http") ||
                        mediaUrl.startsWith("https"));

                    return (
                      <div
                        key={idx}
                        onClick={() => openPortfolio(idx)}
                        className="group aspect-video rounded-2xl bg-gray-100 overflow-hidden relative cursor-pointer"
                      >
                        {isImageUrl ? (
                          <Image
                            src={mediaUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                           title="Image"  width={800}  height={800}  fetchPriority="auto" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <Layout className="h-8 w-8 shrink-0 text-gray-300 mb-3" />
                            <p className="text-xs font-bold text-gray-500 line-clamp-2">
                              {typeof item === "object"
                                ? item.title || "Portfolio Item"
                                : item}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold px-4 py-2 border border-white/40 rounded-full backdrop-blur-sm">
                            View Work
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services Section */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-purple-600"></div>
                Packages
              </h2>

              {/* Platform Filter Tabs */}
              {uniquePlatforms.length > 2 && (
                <div className="flex items-center gap-1 border-b border-gray-100 mb-2">
                  {uniquePlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setActivePlatformFilter(p); }}
                      className={`px-4 py-3 text-sm font-bold transition-all relative ${
                        activePlatformFilter === p
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {p}
                      {activePlatformFilter === p && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Service List */}
              <div className="divide-y divide-gray-100">
                {filteredServices.map((service, idx) => {
                  const isSelected = selectedServiceIndex === idx;
                  const PlatformIcon = getPlatformIcon(service.platformKey);

                  return (
                    <div
                      key={service.id || idx}
                      onClick={() => setSelectedServiceIndex(idx)}
                      className={`flex items-start gap-4 py-5 px-4 cursor-pointer transition-all rounded-xl ${
                        isSelected
                          ? "bg-white border border-gray-200 shadow-sm my-1 -mx-1 px-5"
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="mt-0.5 p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 shrink-0">
                        <PlatformIcon className="h-5 w-5 text-gray-700" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-bold text-gray-900 tracking-tight">
                            {service.quantity || 1} {service.title}
                          </h3>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-gray-900">{service.price}</span>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isSelected ? "border-purple-600 bg-purple-600" : "border-gray-300"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1.5 line-clamp-1 font-medium">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-purple-600"></div>
                Reviews & Feedback
              </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {isReviewsLoading ? (
                    <div className="col-span-full py-20 flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4 sm:p-6 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {review.avatar ? (
                              <Image 
                                src={review.avatar} 
                                alt={review.author} 
                                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-100"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center font-bold text-purple-600 shadow-sm border border-white">
                                {review.author.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 tracking-tight">
                                {review.author}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Verified Purchase
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-100">
                            <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-700">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
                          "{review.comment}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium italic">
                      No reviews yet. Be the first to collaborate!
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Right Sticky Column */}
          <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
            {/* Service Action Card */}
            {filteredServices.length > 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl ring-1 ring-gray-100">
                {/* Total Price */}
                <p className="text-3xl font-black text-gray-900 tracking-tight">
                  ₹{totalSelectedPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-1 mb-6">
                  {selectedService ? '1 service selected' : 'No service selected'}
                </p>

                {/* Selected Services Summary */}
                {selectedService && (() => {
                  const Icon = getPlatformIcon(selectedService.platformKey);
                  return (
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                        <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                        <span className="flex-1 font-medium text-gray-700 truncate">{selectedService.quantity || 1} {selectedService.title}</span>
                        <span className="font-bold text-gray-900 shrink-0">{selectedService.price}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Add to Cart Button (Brands Only) */}
                {isBrand ? (() => {
                  const formattedTitle = selectedService ? `${selectedService.quantity || 1} ${selectedService.platform} ${selectedService.title}` : "";
                  const allInCart = selectedService && isInCart(creator.id, formattedTitle, selectedService.platform);
                  const noneSelected = !selectedService;

                  return (
                    <button
                      onClick={async () => {
                        if (selectedService && !allInCart) {
                          await addToCart({
                            serviceId: selectedService.id,
                            creatorId: creator.id,
                            creatorName: creator.name,
                            creatorAvatar: creator.avatar,
                            serviceTitle: formattedTitle,
                            serviceDescription: selectedService.description,
                            platform: selectedService.platform,
                            price: selectedService.rawPrice || parseFloat(String(selectedService.price).replace(/[^0-9.]/g, "")) || 0,
                          });
                          router.push("/brand/cart");
                        }
                      }}
                      disabled={allInCart || noneSelected}
                      className={`w-full py-4 rounded-xl text-sm font-bold transition-all ${
                        allInCart
                          ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                          : noneSelected
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                      type="button"
                    >
                      {allInCart ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Added to Cart
                        </span>
                      ) : noneSelected ? (
                        "Select a Service"
                      ) : (
                        `Add to Cart`
                      )}
                    </button>
                  );
                })() : (
                  <Link
                    href="/login"
                    className="block w-full text-center py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Login as Brand to Hire
                  </Link>
                )}

                {/* How does it work */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <button type="button" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    How does it work?
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl ring-1 ring-gray-100 text-center py-12">
                <p className="text-sm text-gray-400 font-medium">No services available yet.</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {isBrand && (
                <Link
                  href="/brand/cart"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" /> View Cart
                </Link>
              )}
              <button
                onClick={toggleFavorite}
                className={`flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors ${!isBrand ? "col-span-2" : ""}`}
                type="button"
              >
                <Heart className={`h-4 w-4 shrink-0 ${creator.isFavorite ? "fill-purple-600 text-purple-600" : ""}`} />
                {creator.isFavorite ? "In Favorites" : "Favorite"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
              <div className="space-y-3 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Trust Badges
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                    <div className="p-1 rounded bg-white shadow-sm ring-1 ring-black/5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    </div>
                    Verified profile
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                    <div className="p-1 rounded bg-white shadow-sm ring-1 ring-black/5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    </div>
                    Secure payments
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                    <div className="p-1 rounded bg-white shadow-sm ring-1 ring-black/5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    </div>
                    Review-backed delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Why brands book card */}
            <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-colors"></div>
              <div className="relative z-10">
                <h4 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 shrink-0 text-purple-400" />
                  Brand Verdict
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <p className="text-xs text-gray-300 font-medium leading-relaxed">
                      Consistently high CTR on beauty & wellness content.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <p className="text-xs text-gray-300 font-medium leading-relaxed">
                      Exceptional creative direction for short-form video.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Portfolio Modal Carousel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10 transition-all duration-300">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <X className="h-6 w-6 shrink-0" />
          </button>

          <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center">
            <button
              onClick={prevPortfolio}
              className="absolute left-0 sm:-left-20 z-[110] p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-20"
              disabled={(creator.portfolio || []).length <= 1}
             type="button">
              <ChevronLeftIcon className="h-8 w-8 shrink-0" />
            </button>

            <div className="w-full h-full relative group flex items-center justify-center">
              {(() => {
                const item = creator.portfolio[currentPortfolioIndex];
                const mediaUrl =
                  typeof item === "object"
                    ? item.media?.url || item.url || item.media
                    : item;
                const isImageUrl =
                  typeof mediaUrl === "string" &&
                  (mediaUrl.startsWith("http") || mediaUrl.startsWith("https"));

                return isImageUrl ? (
                  <Image
                    src={mediaUrl}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    alt=""
                   title="Image"  width={800}  height={800}  fetchPriority="auto" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-3xl p-12 text-center">
                    <Layout className="h-20 w-20 shrink-0 text-gray-700 mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {typeof item === "object"
                        ? item.title || "Portfolio Work"
                        : "Portfolio Work"}
                    </h4>
                    <p className="text-gray-400 max-w-md">
                      {typeof item === "object"
                        ? item.description || item.title
                        : item}
                    </p>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={nextPortfolio}
              className="absolute right-0 sm:-right-20 z-[110] p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-20"
              disabled={(creator.portfolio || []).length <= 1}
             type="button">
              <ChevronRightIcon className="h-8 w-8 shrink-0" />
            </button>

            {/* Index indicator */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <span className="text-white/60 text-sm font-bold tracking-widest">
                {currentPortfolioIndex + 1} / {(creator.portfolio || []).length}
              </span>
              <div className="flex gap-1.5">
                {(creator.portfolio || []).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPortfolioIndex ? "w-8 bg-purple-500" : "w-1.5 bg-white/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <AddToCollectionModal
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        creator={creator}
        onSuccess={() => {
          setCreator((prev) => ({ ...prev, isFavorite: true }));
        }}
      />
    </main>
  );
}
