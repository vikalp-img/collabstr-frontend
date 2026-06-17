"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Heart, Search, Loader2, FolderOpen, Calendar, Users, Trash2, Pencil } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { theme } from "@/theme";
import { toast } from "sonner";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditCollectionModal from "@/components/EditCollectionModal";

const FavoriteListCard = ({ list, onDelete, onEdit }) => {
  return (
    <div className="group relative">
      <Link 
        href={`/brand/favorites/${list._id}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-purple-100 group-hover:-translate-y-2">
          {list.firstImage ? (
            <img 
              src={list.firstImage} 
              alt={list.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
              <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm border border-white/50">
                <FolderOpen className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          )}
          
          {/* Count Badge Overlay */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20">
               <Users className="w-3 h-3" />
              {list.influencerCount || 0}
            </div>
          </div>

          {/* Gradient Overlay for Title Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
             <span className="text-white text-xs font-medium flex items-center gap-1.5">
               View Collection →
             </span>
          </div>
        </div>

        <div className="mt-5 px-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1">
              {list.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
               <span className="text-[11px] font-medium uppercase tracking-tight">
                {new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons (Delete & Edit) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(list);
          }}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-gray-900 hover:text-purple-600 transition-all shadow-lg border border-gray-100"
          title="Rename collection"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(list);
          }}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg border border-gray-100"
          title="Delete collection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function BrandFavoritesPage() {
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listToDelete, setListToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchFavoriteLists = async () => {
    setIsLoading(true);
    try {
      const response = await apiWithAuth.get(API_ENDPOINTS.FAVORITES.LIST);
      const data = response.data?.data || [];
      setFavoriteLists(data);
    } catch (err) {
      console.error("Failed to load favorite lists:", err);
      // Fallback for demo if API has issues
      toast.error("Could not fetch your favorite lists.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (list) => {
    setListToDelete(list);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setListToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!listToDelete) return;
    
    try {
      await apiWithAuth.delete(API_ENDPOINTS.FAVORITES.DELETE_LIST + listToDelete._id);
      toast.success(`Collection "${listToDelete.name}" deleted!`);
      // Update local state to remove the list
      setFavoriteLists((prev) => prev.filter(l => l._id !== listToDelete._id));
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete list:", err);
      toast.error("Failed to delete collection.");
    }
  };

  const openEditModal = (list) => {
    setListToEdit(list);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setListToEdit(null);
  };

  const handleEditSuccess = (updatedList) => {
    setFavoriteLists((prev) => 
      prev.map(l => (l._id === updatedList._id || l.id === updatedList.id) ? updatedList : l)
    );
  };

  useEffect(() => {
    fetchFavoriteLists();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50/50">
        <Header />
        <PageLoader message="Loading your collections..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      
      <div className="flex-1 w-full pt-28 sm:pt-36 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-4 py-2 mb-5">
                <Heart className="w-4 h-4 fill-purple-500 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Collections</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Your Saved <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Creators</span>
              </h1>
              <p className="mt-4 text-gray-500 text-lg sm:text-xl font-medium leading-relaxed">
                Organize your favorite talent into custom collections for easy access across projects.
              </p>
            </div>
            
            <Link 
              href="/creators"
              className="inline-flex items-center gap-2.5 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-600 transition-all hover:shadow-xl hover:shadow-purple-100 group"
            >
              <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Discover More
            </Link>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[1, 2, 3, 4].map((n) => (
                 <div key={n} className="animate-pulse">
                   <div className="aspect-square bg-gray-200 rounded-3xl mb-4" />
                   <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                   <div className="h-4 bg-gray-100 rounded w-1/2" />
                 </div>
               ))}
            </div>
          ) : favoriteLists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {favoriteLists.map((list) => (
                <FavoriteListCard 
                  key={list._id} 
                  list={list} 
                  onDelete={openDeleteModal}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-32 px-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
               <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                 <Heart className="w-12 h-12 text-pink-300" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-3">Your library is empty</h3>
               <p className="text-gray-500 text-center max-w-sm mb-10 text-lg font-medium">
                 Start building your network by favoriting creators that match your brand's vision.
               </p>
               <Link 
                 href="/creators"
                 className="inline-flex items-center gap-2.5 bg-white border-2 border-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
               >
                 <Search className="w-5 h-5" />
                 Browse Creators
               </Link>
             </div>
          )}
        </div>
      </div>
      
      <Footer />
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection?"
        message={listToDelete ? `Are you sure you want to delete "${listToDelete.name}"? This will remove all creator associations within this collection.` : "Are you sure you want to delete this collection?"}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      <EditCollectionModal 
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        list={listToEdit}
        onSuccess={handleEditSuccess}
      />
    </main>
  );
}

