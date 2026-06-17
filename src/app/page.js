"use client";
import Image from "next/image";

// app/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { Loader2 } from "lucide-react";
import {
  Star,
  Users,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Instagram,
  Youtube,
  Music2,
  Video,
  TrendingUp,
  Globe,
  Heart,
  Camera,
  Palette,
  Briefcase,
  Dumbbell,
  Utensils,
  Plane,
  Search,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InfluencerCard from "@/components/InfluencerCard";
import LoginModal from "@/components/LoginModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import { toast } from "sonner";

import { theme } from "@/theme";
import PageLoader from "@/components/PageLoader";
import Newsletter from "@/components/Newsletter";

const HeroCards = {
  UGC: () => (
    <div className="h-32 w-[200px] md:w-full flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-5 text-white shadow-lg transition-transform hover:scale-105">
      <Camera className="h-8 w-8 shrink-0 mb-3" />
      <p className="text-sm font-bold">UGC Creators</p>
      <p className="text-[10px] text-white/80 mt-1 line-clamp-2">
        High-converting authentic content for your brand
      </p>
      <div className="mt-3 h-1 w-12 rounded-full bg-white/30" />
    </div>
  ),
  Fashionista: ({ Instagram }) => (
    <div className="h-32 w-[180px] md:w-full flex-shrink-0 flex flex-col justify-center group rounded-2xl bg-gray-50 p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:bg-white">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
          <Instagram className="h-4 w-4 shrink-0 text-pink-600" />
        </div>
        <div>
          <span className="block text-sm font-bold text-gray-900 leading-tight">
            @fashionista
          </span>
          <span className="text-[10px] text-gray-500">250k followers</span>
        </div>
      </div>
    </div>
  ),
  Talents: ({ Users }) => (
    <div className="h-32 w-[180px] md:w-full flex-shrink-0 flex flex-col justify-center rounded-2xl bg-white p-4 border border-gray-100 shadow-sm transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <Users className="h-6 w-6 shrink-0 text-purple-600" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Active Talents
        </span>
      </div>
      <div className="flex -space-x-3">
        {[
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        ].map((url, i) => (
          <Image
            key={i}
            src={url}
            alt="Talent"
            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
            title="Image"
            width={800}
            height={800}
            fetchPriority="auto"
          />
        ))}
        <div className="h-10 w-10 rounded-full border-2 border-white bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
          +2k
        </div>
      </div>
    </div>
  ),
  Dancer: ({ Music2 }) => (
    <div className="h-32 w-[180px] md:w-full flex-shrink-0 flex flex-col justify-center group rounded-2xl bg-gray-50 p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:bg-white">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Music2 className="h-4 w-4 shrink-0 text-purple-600" />
        </div>
        <div>
          <span className="block text-sm font-bold text-gray-900 leading-tight">
            @dancerlife
          </span>
          <span className="text-[10px] text-gray-500">1.2M followers</span>
        </div>
      </div>
    </div>
  ),
  Video: () => (
    <div className="h-32 w-[200px] md:w-full flex-shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-5 text-white shadow-lg transition-transform hover:scale-105">
      <Youtube className="h-8 w-8 shrink-0 mb-3" />
      <p className="text-sm font-bold">Video Creators</p>
      <p className="text-[10px] text-white/80 mt-1 line-clamp-2">
        Professional creators for Long & Short form video
      </p>
      <div className="mt-3 h-1 w-12 rounded-full bg-white/30" />
    </div>
  ),
  ROI: ({ TrendingUp }) => (
    <div className="h-32 w-[180px] md:w-full flex-shrink-0 flex flex-col justify-center rounded-2xl bg-white p-4 border border-gray-100 shadow-sm transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
          Results
        </span>
        <TrendingUp className="h-4 w-4 shrink-0 text-green-500" />
      </div>
      <p className="text-xs font-bold text-gray-900">Project ROI</p>
      <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
      </div>
    </div>
  ),
};

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const router = useRouter();

  const handleHireClick = (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    if (token) {
      router.push("/creators");
    } else {
      setPendingAction(() => () => router.push("/creators"));
      setShowLoginModal(true);
    }
  };

  const handleProfileClick = (creatorId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    if (token) {
      router.push(`/creators/${creatorId}`);
    } else {
      setPendingAction(() => () => router.push(`/creators/${creatorId}`));
      setShowLoginModal(true);
    }
  };

  const handleFavorite = async (creator) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    if (!token) {
      // User is not logged in, show login modal
      setPendingAction(() => () => handleFavorite(creator));
      setShowLoginModal(true);
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

  const handleLoginSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Helper to get icon for category
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ensure currentIndex is valid when changing viewports (mobile/desktop)
  useEffect(() => {
    const itemsPerView = isMobile ? 1 : 3;
    if (
      testimonials.length > 0 &&
      currentIndex > testimonials.length - itemsPerView
    ) {
      setCurrentIndex(Math.max(0, testimonials.length - itemsPerView));
    }
  }, [isMobile, testimonials.length, currentIndex]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await apiWithoutAuth.get(
          API_ENDPOINTS.TESTIMONIAL.LIST,
        );
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          // Fallback static data
          setTestimonials([
            {
              userName: "Emily Chen",
              description:
                "HireSphere changed how we approach influencer marketing. The vetting process is top-notch!",
              rating: 5,
              role: "Marketing Director @ GlowUp",
              userImage: {
                url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
              },
            },
            {
              userName: "Marcus Thorne",
              description:
                "As a creator, this platform gives me the security I need to focus on what I do best—creating content.",
              rating: 5,
              role: "UGC Content Creator",
              userImage: {
                url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
              },
            },
            {
              userName: "Sarah Williams",
              description:
                "The support team and the ease of use makes this the best influencer marketplace out there.",
              rating: 5,
              role: "Brand Owner @ Zenith",
              userImage: {
                url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
              },
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.CATEGORY.LIST, {
          params: { page: 1, limit: 12 },
        });
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          // Fallback static data
          setCategories([
            { name: "Fashion & Style", id: "cat_1" },
            { name: "Tech & Gadgets", id: "cat_2" },
            { name: "Beauty & Grooming", id: "cat_3" },
            { name: "Travel & Adventure", id: "cat_4" },
            { name: "Health & Fitness", id: "cat_5" },
            { name: "Food & Cooking", id: "cat_6" },
            { name: "Gaming & eSports", id: "cat_7" },
            { name: "Home Decor", id: "cat_8" },
            { name: "Lifestyle", id: "cat_9" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchFeaturedCreators = async () => {
      try {
        const isBrand = typeof window !== 'undefined' && localStorage.getItem("userRole") === "brand";
        const api = isBrand ? apiWithAuth : apiWithoutAuth;
        const response = await api.get(
          API_ENDPOINTS.USER.CREATORS_LIST,
          {
            params: { isFeatured: true, limit: 4 },
          },
        );
        const data = response.data?.data || [];

        let mappedCreators = (Array.isArray(data) ? data : []).map(
          (creator) => ({
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
                  type:
                    creator.socialAccount.platformKey?.toLowerCase() ||
                    "instagram",
                  label:
                    creator.socialAccount.followers >= 1000
                      ? (creator.socialAccount.followers / 1000).toFixed(1) +
                        "k"
                      : creator.socialAccount.followers || "0",
                }
              : { type: "UGC", label: "UGC" },
            gridImages: false,
            bio:
              creator.title || creator.creatorProfile?.bio || creator.bio || "",
            location:
              creator.location ||
              creator.creatorProfile?.location?.city ||
              "Global",
            isFavorite: creator.isFavorite || false,
          }),
        );

        if (mappedCreators.length === 0) {
          // Fallback static creators
          mappedCreators = [
            {
              id: "f1",
              name: "Alex J.",
              avatar:
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
              rating: "5.0",
              badges: ["lifestyle", "tech"],
              bottomBadge: { type: "instagram", label: "450k" },
              bio: "Capturing life's moments through premium lens.",
              location: "USA",
            },
            {
              id: "f2",
              name: "Maria G.",
              avatar:
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
              rating: "4.9",
              badges: ["Beauty", "Fashion"],
              bottomBadge: { type: "tiktok", label: "1.2M" },
              bio: "Beauty enthusiast and fashion storyteller.",
              location: "UK",
            },
            {
              id: "f3",
              name: "Chris W.",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              rating: "5.0",
              badges: ["Gaming", "Tech"],
              bottomBadge: { type: "youtube", label: "850k" },
              bio: "Full-time gamer and tech reviewer.",
              location: "Canada",
            },
            {
              id: "f4",
              name: "Sofia L.",
              avatar:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
              rating: "4.8",
              badges: ["Travel", "Food"],
              bottomBadge: { type: "instagram", label: "220k" },
              bio: "Exploring the world and its hidden culinary gems.",
              location: "Spain",
            },
          ];
        }

        setFeaturedCreators(mappedCreators);
      } catch (err) {
        console.error("Failed to fetch featured creators", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeaturedCreators();
  }, []);

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    const itemsPerView = isMobile ? 1 : 3;
    if (testimonials.length <= itemsPerView) return;

    setCurrentIndex((prevIndex) => {
      if (prevIndex >= testimonials.length - itemsPerView) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    const itemsPerView = isMobile ? 1 : 3;
    if (testimonials.length <= itemsPerView) return;

    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, testimonials.length - itemsPerView);
      }
      return prevIndex - 1;
    });
  };

  useEffect(() => {
    if (testimonials.length === 0) return;
    const itemsPerView = isMobile ? 1 : 3;
    if (testimonials.length <= itemsPerView) return;

    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [testimonials, currentIndex, isMobile]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden px-4 lg:px-0 lg:pt-28 pt:0  pb-10 lg:pt-24 lg:pb-0">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-pink-200/30 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-xs md:text-sm font-medium text-purple-600">
                <Zap className="h-4 w-4 shrink-0" />
                Trusted by 330,000+ brands
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-6xl break-words">
                Find and hire top
                <span className="relative block sm:inline-block sm:ml-2">
                  <span className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-words">
                    influencers
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-purple-200 to-pink-200 hidden sm:block" />
                </span>
              </h1>

              <p className="text-gray-600">
                Connect with thousands of vetted Instagram, TikTok, and YouTube
                creators. Get authentic content that converts.
              </p>

              <div className="flex gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={handleHireClick}
                  className={theme.buttons.primary}
                >
                  Hire creators
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href="/creator/signup"
                  className={theme.buttons.secondary}
                >
                  <Users className="h-5 w-5 shrink-0" />
                  Join as creator
                </Link>
              </div>
            </div>

            <div className="relative xl:ml-auto">
              <div className="relative h-auto w-full max-w-[850px] mx-auto md:rounded-3xl md:bg-gradient-to-br md:from-purple-100 md:to-pink-100 md:p-2 md:shadow-2xl">
                <div className="relative h-full w-full md:rounded-2xl bg-transparent md:bg-white p-0 md:p-6 overflow-hidden">
                  {/* Desktop Grid View */}
                  <div className="hidden md:grid h-full grid-cols-3 gap-4">
                    <div className="space-y-4">
                      <HeroCards.UGC />
                      <HeroCards.Fashionista Instagram={Instagram} />
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                        {["Fashion", "Beauty"].map((cat) => (
                          <span
                            key={cat}
                            className="text-[8px] font-bold text-gray-400 border border-gray-100 rounded-full px-2 py-0.5 uppercase"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <HeroCards.Dancer Music2={Music2} />
                      <HeroCards.Video Youtube={Youtube} />
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                        {["Travel", "Tech"].map((cat) => (
                          <span
                            key={cat}
                            className="text-[8px] font-bold text-gray-400 border border-gray-100 rounded-full px-2 py-0.5 uppercase"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <HeroCards.Talents Users={Users} />
                      <HeroCards.ROI TrendingUp={TrendingUp} />
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                        {["Food", "Gaming"].map((cat) => (
                          <span
                            key={cat}
                            className="text-[8px] font-bold text-gray-400 border border-gray-100 rounded-full px-2 py-0.5 uppercase"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Marquee View */}
                  <div className="md:hidden marquee-container overflow-hidden py-4">
                    <div className="animate-marquee flex gap-4 items-center">
                      <HeroCards.UGC />
                      <HeroCards.Dancer Music2={Music2} />
                      <HeroCards.Fashionista Instagram={Instagram} />
                      <HeroCards.Video Youtube={Youtube} />
                      <HeroCards.Talents Users={Users} />
                      <HeroCards.ROI TrendingUp={TrendingUp} />
                      {/* Duplicate for infinite effect */}
                      <HeroCards.UGC />
                      <HeroCards.Dancer Music2={Music2} />
                      <HeroCards.Fashionista Instagram={Instagram} />
                      <HeroCards.Video Youtube={Youtube} />
                      <HeroCards.Talents Users={Users} />
                      <HeroCards.ROI TrendingUp={TrendingUp} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Brands */}
          <div className="mt-2 border-t border-gray-100 pt-4">
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
              Trusted by leading brands worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {["VELVET", "LUMINA", "ARKTOS", "ZENITH", "ELITE"].map(
                (brand) => (
                  <span
                    key={brand}
                    className="text-2xl font-black text-gray-400 tracking-tighter hover:text-purple-600 transition-colors cursor-default"
                  >
                    {brand}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-4 lg:px-0 py-10 md:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2>
              How it{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="mt-4 text-gray-600">
              Post, hire, and get content in three simple steps.
            </p>
          </div>

          <div className="flex -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid gap-8 md:grid-cols-3 snap-x snap-mandatory scrollbar-hide pt-10 pb-12 md:pt-4 md:pb-8">
            {[
              {
                title: "Post or search",
                description:
                  "Publish a brief or browse creators by platform, niche, and price to find the perfect fit.",
                image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/how_it_works_1.png`,
              },
              {
                title: "Chat & hire securely",
                description:
                  "Message creators, confirm deliverables, and pay through HireSphere's secure checkout.",
                image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/how_it_works_2.png`,
              },
              {
                title: "Approve & download",
                description:
                  "Review drafts, request edits, and release payment when you're happy with the content.",
                image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/how_it_works_3.png`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="w-[85%] min-w-[280px] md:w-full md:min-w-0 snap-center"
              >
                <div className="group relative h-full rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-purple-50">
                  {/* Step Image */}
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

                  <h3 className="text-xl font-bold mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured creators */}
      <section className="px-4 lg:px-0 py-10 md:py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2>
              Featured{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                creators
              </span>
            </h2>
            <p className="mt-4 text-gray-600">
              Work with top influencers across all platforms
            </p>
          </div>

          <div className="min-h-[400px]">
            {loadingFeatured ? (
              <PageLoader message="Loading top talent..." />
            ) : (
              <div className="flex -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid gap-6 md:grid-cols-2 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide pt-10 pb-10 md:py-0 md:pb-0">
                {featuredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="w-[85%] min-w-[300px] md:w-full md:min-w-0 snap-center"
                  >
                    <InfluencerCard
                      creator={creator}
                      onFavorite={handleFavorite}
                      isFavorite={creator.isFavorite}
                      onProfileClick={handleProfileClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
                if (token) {
                  router.push("/creators");
                } else {
                  setPendingAction(() => () => router.push("/creators"));
                  setShowLoginModal(true);
                }
              }}
              className={theme.buttons.secondary}
            >
              View all creators
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 lg:px-0 py-10 md:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2>
              Browse by{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                category
              </span>
            </h2>
            <p className="mt-4 text-gray-600">Find creators in your niche</p>
          </div>

          <div className="min-h-[200px]">
            {loadingCategories ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                <p className="text-gray-500 font-medium">
                  Loading categories...
                </p>
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-8">
                <div className="flex -mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid gap-4 md:grid-cols-4 lg:grid-cols-6 snap-x snap-mandatory scrollbar-hide pt-10 pb-10 md:pt-4 md:pb-8">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const hasIcon = !!category.icon?.url;
                    return (
                      <div
                        key={category._id || category.id}
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
                              alt={category.name}
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
                            <h3 className="text-[15px]  text-center font-semibold text-white leading-snug">
                              {category.name}
                            </h3>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-6">
                  <Link
                    href="/categories"
                    className={theme.buttons.secondary}
                  >
                    <div className="flex items-center justify-center">
                      Explore more categories
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500">No categories found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-10 md:py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2>
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                creators & brands
              </span>
            </h2>
            <p className="mt-4 text-gray-600">
              See what our community says about us
            </p>
          </div>

          <div className="relative group">
            {loadingTestimonials ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : testimonials.length > 0 ? (
              <>
                <div className="overflow-hidden px-4   py-4 ">
                  <div
                    className="   flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentIndex * (isMobile ? 100 : 33.333)}%)`,
                    }}
                  >
                    {testimonials.map((testimonial, i) => (
                      <div
                        key={testimonial._id || i}
                        className="w-full shrink-0 px-4 md:w-1/3"
                      >
                        <div className="relative h-full rounded-2xl bg-white p-4 sm:p-6 shadow-lg">
                          <div className="relative z-10 flex h-full flex-col">
                            <div className="mb-4 flex gap-1">
                              {[...Array(Number(testimonial.rating) || 5)].map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="h-5 w-5 shrink-0 fill-yellow-400 text-yellow-400"
                                  />
                                ),
                              )}
                            </div>

                            <p className="mb-6 flex-grow text-gray-700">
                              {testimonial.description}
                            </p>

                            <div className="flex items-center gap-4">
                              {testimonial.userImage?.url ? (
                                <Image
                                  src={testimonial.userImage.url}
                                  alt={testimonial.userName}
                                  className="h-12 w-12 rounded-full object-cover"
                                  title="Image"
                                  width={800}
                                  height={800}
                                  fetchPriority="auto"
                                />
                              ) : (
                                <div
                                  className={`h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold`}
                                >
                                  {testimonial.userName?.charAt(0) || "U"}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-gray-900 line-clamp-1">
                                  {testimonial.userName}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {testimonial.role || "Client"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-purple-50 hover:scale-110 active:scale-95 z-20 hidden md:flex"
                >
                  <ChevronLeft className="h-6 w-6 shrink-0 text-purple-600" />
                </button>
                <button
                  onClick={nextSlide}
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-purple-50 hover:scale-110 active:scale-95 z-20 hidden md:flex"
                >
                  <ChevronRight className="h-6 w-6 shrink-0 text-purple-600" />
                </button>

                {/* Dots Indicator */}
                {(() => {
                  const itemsPerView = isMobile ? 1 : 3;
                  const totalDots = Math.max(
                    0,
                    testimonials.length - itemsPerView + 1,
                  );

                  if (totalDots <= 1) return null;

                  return (
                    <div className="mt-10 flex justify-center gap-3">
                      {[...Array(totalDots)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentIndex(i)}
                          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                            currentIndex === i
                              ? "w-10 bg-purple-600 shadow-[0_4px_12px_rgba(147,51,234,0.3)]"
                              : "w-2.5 bg-purple-200 hover:bg-purple-300 hover:w-4"
                          }`}
                          aria-label={`Go to testimonial group ${i + 1}`}
                        />
                      ))}
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No testimonials available at this time.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-10 md:py-20">
        <div className="container mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-8 py-12 text-center text-white"
            style={{
              backgroundImage: `url("${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/ready_to_start.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Background overlay for readability */}
            <div className="absolute inset-0 bg-purple-900/60 transition-opacity group-hover:opacity-70" />

            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -left-4 -top-4 h-40 w-40 rounded-full bg-white transition-transform hover:scale-110" />
              <div className="absolute -right-4 -bottom-4 h-60 w-60 rounded-full bg-white transition-transform hover:scale-110" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl text-white">
                Ready to start collaborating?
              </h2>
              <p className="mb-10 text-purple-100">
                Join thousands of brands and creators already growing on
                HireSphere
              </p>

              <div className="flex justify-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={handleHireClick}
                  className={theme.buttons.white}
                >
                  Hire creators
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href="/creator/signup"
                  className={theme.buttons.outlineWhite}
                >
                  <Users className="h-5 w-5 shrink-0" />
                  Join as creator
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0 text-purple-200" />
                  <span className="text-sm font-medium">
                    No credit card required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-200" />
                  <span className="text-sm font-medium">Free to browse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-200" />
                  <span className="text-sm font-medium">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      <Footer />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
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
