"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Star,
  Users
} from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { Popover } from "@base-ui/react/popover";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import InfluencerCard from "@/components/InfluencerCard";
import LoginModal from "@/components/LoginModal";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import PageLoader from "@/components/PageLoader";

const FILTER_ITEMS = [
  {
    key: "followers",
    label: "Followers",
    options: ["Any", "1k-10k", "10k-50k", "50k-200k", "200k+"],
  },
  {
    key: "price",
    label: "Price",
    options: ["Any", "<₹500", "₹500-₹1k", "₹1k-₹5k", "₹5k+"],
  },
  {
    key: "gender",
    label: "Gender",
    options: ["Any", "Female", "Male", "Non-binary", "Prefer not to say"],
  },

  {
    key: "ethnicity",
    label: "Ethnicity",
    options: ["Any", "Black", "Hispanic", "Asian", "White", "Multiracial"],
    premium: false,
  },
  {
    key: "language",
    label: "Language",
    options: ["Any", "English", "Spanish", "French", "German", "Hindi", "Arabic", "Mandarin", "Portuguese"],
    premium: false,
  },
];



const getInitialFilterValues = () =>
  FILTER_ITEMS.reduce((acc, filter) => {
    acc[filter.key] = filter.options[0] ?? "Any";
    return acc;
  }, {});

function CreatorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category");

  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryQuery, setCategoryQuery] = useState(initialCategory || "");
  const [platform, setPlatform] = useState("Any");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(getInitialFilterValues);
  const [platformOptions, setPlatformOptions] = useState(["Any", "Instagram", "TikTok", "YouTube", "Twitter"]);
  const [categoryOptions, setCategoryOptions] = useState(["Lifestyle", "Beauty", "Fashion", "Travel", "Health & Fitness"]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  
  // Fetch platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.PLATFORM.LIST);
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data)) {
          const names = data.map(p => p.name || p);
          setPlatformOptions(["Any", ...names]);
        }
      } catch (err) {
        console.error("Failed to fetch platforms:", err);
      }
    };
    fetchPlatforms();
  }, []);

  const checkAuth = (action) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem("userRole") : null;

    if (!token || userRole !== "brand") {
      setPendingAction(() => action);
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleProfileClick = (creatorId) => {
    const action = () => {
      window.location.href = `/creators/${creatorId}`;
    };

    if (checkAuth(action)) {
      action();
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.CATEGORY.LIST);
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data)) {
          // If we have an initialCategory (which is an ID), let's find the name to show in the UI
          if (initialCategory) {
            const found = data.find(c => c._id === initialCategory || c.id === initialCategory);
            if (found) {
              setCategoryQuery(found.name);
            }
          }
          const names = data.map(c => c.name || c);
          setCategoryOptions(names.length > 0 ? names : categoryOptions);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [initialCategory]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchCreators = async (pageArg = currentPage) => {
    setIsLoading(true);
    try {
      const params = { page: pageArg, limit: 12 };
      
      // Basic core filters
      if (platform !== "Any") params.platform = platform;
      
      // If categoryQuery matches a category name, we might want to send the ID if we have it, 
      // but the API seems to accept the name or ID. Based on current logic, we use categoryQuery.
      if (categoryQuery) {
        // We use the initialCategory from searchParams if it matches the current query, 
        // because it's an ID which is more reliable for filtering.
        if (initialCategory && categoryQuery === searchParams.get("category")) {
          params.category = initialCategory;
        } else {
          params.category = categoryQuery;
        }
      }
      
      // Map range-based filters
      const filterMappings = {
        followers: (value) => {
          if (!value || value === "Any" || platform === "Any") return {};
          if (value === "1k-10k") return { minFollowers: 1000, maxFollowers: 10000 };
          if (value === "10k-50k") return { minFollowers: 10000, maxFollowers: 50000 };
          if (value === "50k-200k") return { minFollowers: 50000, maxFollowers: 200000 };
          if (value === "200k+") return { minFollowers: 200000 };
          return {};
        },
        price: (value) => {
          if (!value || value === "Any") return {};
          if (value === "<₹500") return { minPrice: 0, maxPrice: 500 };
          if (value === "₹500-₹1k") return { minPrice: 500, maxPrice: 1000 };
          if (value === "₹1k-₹5k") return { minPrice: 1000, maxPrice: 5000 };
          if (value === "₹5k+") return { minPrice: 5000 };
          return {};
        }
      };

      // Add other filters to params
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (!value || value === "Any") return;
        
        if (filterMappings[key]) {
          const mapped = filterMappings[key](value);
          Object.assign(params, mapped);
        } else {
          // Standard categorical filters: gender, ethnicity, language
          if (key === "gender" && value) {
            params[key] = value.toLowerCase();
          } else {
            params[key] = value;
          }
        }
      });

      const isBrand = typeof window !== 'undefined' && localStorage.getItem("userRole") === "brand";
      const api = isBrand ? apiWithAuth : apiWithoutAuth;
      const response = await api.get(API_ENDPOINTS.USER.CREATORS_LIST, { params });
      const apiResponse = response.data;
      const data = apiResponse?.data || [];
      
      // Transform API data to match InfluencerCard expectations
      const mappedCreators = (Array.isArray(data) ? data : []).map(creator => ({
        id: creator._id || creator.id,
        name: creator.userName || creator.name || "Unknown Creator",
        avatar: creator.media?.url || creator.profile_image?.url || creator.profileImage || creator.avatar || 
          (String(creator.creatorProfile?.gender || "").toLowerCase() === "male" || String(creator.creatorProfile?.gender || "").toLowerCase() === "boy" || String(creator.creatorProfile?.gender || "").toLowerCase() === "men"
            ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
            : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"),
        rating: creator.rating || "5.0",
        badges: Array.isArray(creator.badges) ? creator.badges : [],
        bottomBadge: creator.socialAccount?.platform 
          ? { 
              type: creator.socialAccount.platformKey?.toLowerCase() || "instagram", 
              label: creator.socialAccount.followers > 1000 
                ? (creator.socialAccount.followers / 1000).toFixed(1) + "k" 
                : creator.socialAccount.followers || "0"
            }
          : { type: "UGC", label: "UGC" },
        gridImages: false,
        bio: creator.title || creator.creatorProfile?.bio || creator.bio || "",
        location: creator.location || creator.creatorProfile?.location?.city || (typeof creator.location === 'object' ? creator.location?.city : creator.location) || "Global",
        isFavorite: creator.isFavorite || false,
      }));

      setCreators(mappedCreators);
      setTotalPages(apiResponse?.totalPages || 1);
      setTotalResults(apiResponse?.total || 0);
      setCurrentPage(apiResponse?.page || 1);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch creators:", err);
      const apiErrorMessage = err.response?.data?.message || "Failed to load creators. Please try again later.";
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
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
        setCreators((prev) =>
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

  useEffect(() => {
    fetchCreators(currentPage);
    // Smooth scroll to top when page changes
    if (typeof window !== 'undefined') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [platform, categoryQuery, currentPage, selectedFilters]); 

  const handleFilterValueChange = (filterKey, value) => {
    const action = () => {
      setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }));
      setCurrentPage(1);
    };

    if (checkAuth(action)) {
      action();
    }
  };

  const handleClearAll = () => {
    setSelectedFilters(getInitialFilterValues());
    setCurrentPage(1);
    setPlatform("Any");
    setCategoryQuery("");
  };

  const totalSelectedFilters = useMemo(
    () =>
      FILTER_ITEMS.reduce((count, filter) => {
        const defaultValue = filter.options?.[0] ?? "Any";
        const selectedValue = selectedFilters[filter.key];
        return count + (selectedValue && selectedValue !== defaultValue ? 1 : 0);
      }, 0),
    [selectedFilters]
  );

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <div className="flex-1 w-full pt-24 sm:pt-32 pb-20 sm:pb-32">
        
        {/* Search Bar Container */}
        <div className="max-w-[1000px] mx-auto px-4 z-20 relative">
          <div className="flex items-center bg-white rounded-full shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 p-2 sm:pl-8 gap-2 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex items-center flex-1 min-w-0">
              <Menu.Root>
                <Menu.Trigger
                  className="flex flex-col flex-1 min-w-0 px-2 sm:px-0 py-2 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60"
                >
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-0.5">
                    Platform
                  </span>
                  <span className="text-[15px] text-gray-500 font-normal truncate">
                    {platform === "Any" ? "Choose a platform" : platform}
                  </span>
                </Menu.Trigger>

                <Menu.Portal>
                  <Menu.Positioner sideOffset={10} align="start" className="z-[120]">
                    <Menu.Popup className="w-[min(500px,calc(100vw-2rem))] max-h-[360px] overflow-auto rounded-3xl border border-gray-100 bg-white p-3 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
                      {platformOptions.map((option) => {
                        const isSelected = option === platform;
                        return (
                          <Menu.Item
                            key={option}
                            onClick={() => {
                              const action = () => {
                                setPlatform(option);
                                setCurrentPage(1);
                                if (option === "Any") {
                                  handleFilterValueChange("followers", "Any");
                                }
                              };
                              
                              if (checkAuth(action)) {
                                action();
                              }
                            }}
                            className={`w-full rounded-xl px-4 py-3 text-sm transition-colors focus-visible:outline-none ${
                              isSelected
                                ? "bg-gray-100 font-semibold text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option}
                          </Menu.Item>
                        );
                      })}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>

              <div className="w-px h-12 bg-gray-200 mx-1 sm:mx-2"></div>

              <Popover.Root open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <Popover.Trigger
                  className="flex flex-col flex-1 min-w-0 px-2 sm:px-0 py-2 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60"
                >
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-0.5">
                    Category
                  </span>
                  <span className="text-[15px] text-[#a1a1aa] font-normal truncate">
                    {categoryQuery || "Enter keywords, niches or categories"}
                  </span>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Positioner sideOffset={10} align="start" className="z-[120]">
                    <Popover.Popup className="w-[min(560px,calc(100vw-2rem))] max-h-[400px] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] focus-visible:outline-none">
                      <div className="mb-3 text-sm font-semibold text-gray-500">Popular</div>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              const action = () => {
                                setCategoryQuery(category);
                                setIsCategoryOpen(false);
                                setCurrentPage(1);
                              };

                              if (checkAuth(action)) {
                                action();
                              } else {
                                setIsCategoryOpen(false);
                              }
                            }}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>

            {/* Search Button */}
            <button 
              onClick={() => {
                const action = () => {
                  setCurrentPage(1);
                  fetchCreators(1);
                };
                
                if (checkAuth(action)) {
                  action();
                }
              }}
              className="w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] rounded-full bg-[#111111] hover:bg-black flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md m-0"
            >
              <Search className="w-[22px] h-[22px] text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-[1000px] mx-auto px-4 mt-6 sm:mt-8">
          <div className="flex gap-3 items-center overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible sm:justify-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_ITEMS.map((filter) => (
              <div key={filter.key} className="relative shrink-0">
                <FilterDropdown
                  label={filter.label}
                  options={filter.options}
                  value={selectedFilters[filter.key]}
                  onValueChange={(value) => handleFilterValueChange(filter.key, value)}
                  disabled={filter.key === "followers" && platform === "Any"}
                />
              </div>
            ))}
            <button
              onClick={handleClearAll}
              className="shrink-0 text-[14px] font-medium text-gray-800 hover:text-gray-900 underline underline-offset-4 sm:ml-2"
             type="button">
              Clear All {totalSelectedFilters ? `(${totalSelectedFilters})` : ""}
            </button>
          </div>
        </div>

        {/* Influencers Section */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-0 mt-16">
          <div className="flex justify-between items-end mb-8">
            <h1>Influencers</h1>
            {!isLoading && totalResults > 0 && (
              <p className="text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                Found {totalResults.toLocaleString()} creators
              </p>
            )}
          </div>
          
          {isLoading ? (
            <PageLoader message="Loading talented creators..." />
          ) : error ? (
            <div className="text-center py-24 px-4 bg-red-50/30 rounded-3xl border border-red-100 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-900 text-lg font-semibold mb-2">{error}</p>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {error.toLowerCase().includes("limit") 
                  ? "Upgrade your plan to unlock more monthly searches and find top creators for your brand." 
                  : "We encountered an issue while searching for creators. Please try again in a moment."}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {error.toLowerCase().includes("limit") && (
                  <button 
                    onClick={() => router.push("/pricing")}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#7c3aed] text-white font-bold rounded-full hover:bg-[#6d28d9] transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    Upgrade Plan
                  </button>
                )}
                <button 
                  onClick={() => fetchCreators()}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 font-bold border-2 border-gray-100 rounded-full hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all active:scale-95"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : creators.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {creators.map((creator) => (
                 <InfluencerCard 
                   key={creator.id} 
                   creator={creator} 
                   onFavorite={handleFavorite}
                   isFavorite={creator.isFavorite}
                   onProfileClick={handleProfileClick}
                 />
               ))}
             </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-gray-500 text-lg">No influencers found matching your criteria.</p>
              <button 
                onClick={handleClearAll}
                className="mt-4 text-purple-600 font-semibold hover:underline"
               type="button">
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && creators.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 mt-16 pb-16">
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
                  // Show current page, first, last, and pages around current
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

      </div>
      
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
          setCreators((prev) =>
            prev.map((c) => (c.id === creatorId ? { ...c, isFavorite: true } : c))
          );
        }}
      />
    </main>
  );
}

export default function Creators() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Loading search..." />
        <Footer />
      </main>
    }>
      <CreatorsContent />
    </Suspense>
  );
}
