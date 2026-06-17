"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InfluencerCard from "@/components/InfluencerCard";
import Link from "next/link";
import { ChevronLeft, Loader2, Heart, Search, Users, Sparkles, X } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

export default function FavoriteListDetailPage({ params }) {
  const unwrappedParams = use(params);
  const listId = unwrappedParams.id;
  
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listName, setListName] = useState("Loading...");

  const fetchCreatorsInList = async () => {
    setIsLoading(true);
    try {
      const response = await apiWithAuth.get(API_ENDPOINTS.FAVORITES.IN_LIST + listId);
      const data = response.data?.data || [];
      
      // If the API returns the list object first, then data might be inside something else
      // Usually favorite-in-list returns creators.
      
      const mappedCreators = (Array.isArray(data) ? data : []).map(item => {
        // Handle case where API might wrap creator object (e.g., creatorId property)
        const creator = item.creatorId || item.creator || item;
        
        return {
          id: creator._id || creator.id,
          name: creator.userName || creator.name || "Unknown Creator",
          avatar: (creator.media?.url || creator.profile_image?.url || creator.profileImage || creator.avatar || 
            (((creator.gender || creator.creatorProfile?.gender || creator.profile?.gender || "").toLowerCase() === "male")
              ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
              : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80")),
          gender: creator.gender || creator.creatorProfile?.gender || creator.profile?.gender || "",
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
          price: creator.price || "",
        };
      });
      
      setCreators(mappedCreators);
      
      // Optionally fetch list details if the API provides list name?
      // Since it's /favorites/in-list/:listId, we might not get the list name directly.
      // But we can try to guess it from the first item if the API wraps it or just use "Collection".
    } catch (err) {
      console.error("Failed to load creators in list:", err);
      toast.error("Error fetching creators for this collection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCreator = async (creatorId, creatorName) => {
    try {
      await apiWithAuth.post(API_ENDPOINTS.FAVORITES.REMOVE_FROM_LIST, {
        creatorId,
      });
      toast.success(`${creatorName} removed from collection!`);
      // Update local state
      setCreators(prev => prev.filter(c => c.id !== creatorId));
    } catch (err) {
      console.error("Failed to remove creator from list:", err);
      toast.error("Failed to remove creator from collection.");
    }
  };

  useEffect(() => {
    if (listId) {
      fetchCreatorsInList();
    }
  }, [listId]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/30">
      <Header />
      
      <div className="flex-1 w-full pt-28 sm:pt-36 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Navigation & Header */}
          <div className="mb-12">
            <Link 
              href="/brand/favorites" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors mb-6 font-semibold group"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </div>
              Back to Collections
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 border border-pink-100 rounded-full px-4 py-2 mb-4">
                  <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Curated Collection</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                   Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Favorites</span>
                </h1>
                <p className="mt-4 text-gray-500 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
                  {creators.length} {creators.length === 1 ? 'Creator' : 'Creators'} in this collection. Ready for your next collaboration.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {creators.slice(0, 4).map((c, i) => (
                    <img 
                      key={i}
                      src={c.avatar}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                      alt={c.name}
                    />
                  ))}
                  {creators.length > 4 && (
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 ring-2 ring-white">
                      +{creators.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <PageLoader message="Opening your collection..." />
          ) : creators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {creators.map((creator) => (
                <div key={creator.id} className="relative group transition-all duration-300">
                  <InfluencerCard 
                    creator={creator} 
                    isFavorite={true}
                  />
                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveCreator(creator.id, creator.name);
                    }}
                    className="absolute top-3 right-3 z-30 h-8 w-8 flex items-center justify-center rounded-xl bg-white/40 backdrop-blur-md border border-white/40 text-white hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    title={`Remove ${creator.name} from this collection`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-32 px-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-lg">
               <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                 <Users className="w-12 h-12 text-pink-300" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-3">No creators found</h3>
               <p className="text-gray-500 text-center max-w-sm mb-10 text-lg font-medium leading-relaxed">
                 This collection is currently empty. Start adding talented creators to organize them better!
               </p>
               <Link 
                 href="/creators"
                 className="inline-flex items-center gap-2.5 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-600 transition-all hover:scale-105 active:scale-95"
               >
                 <Search className="w-5 h-5" />
                 Browse All Creators
               </Link>
             </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
