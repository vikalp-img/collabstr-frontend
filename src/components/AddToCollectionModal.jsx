"use client";

import { useEffect, useState, useCallback } from "react";
import { X, FolderPlus, Plus, Check, Loader2, Folder, Heart, Sparkles } from "lucide-react";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import TrialLimitModal from "./TrialLimitModal";

export default function AddToCollectionModal({
  isOpen,
  onClose,
  creator,
  onSuccess,
}) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiWithAuth.get(API_ENDPOINTS.FAVORITES.LIST);
      setLists(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch favorite lists:", err);
      // toast.error("Failed to load your collections.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      fetchLists();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = "hidden";
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 250);
      document.body.style.overflow = "unset";
      return () => clearTimeout(t);
    }
  }, [isOpen, fetchLists]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const response = await apiWithAuth.post(API_ENDPOINTS.FAVORITES.CREATE, {
        name: newListName.trim(),
      });
      const newList = response.data?.data || response.data;
      if (newList) {
        const listId = newList._id || newList.id;
        if (!listId) throw new Error("No list ID returned from API");
        
        setLists((prev) => [newList, ...prev]);
        setNewListName("");
        toast.success(`Collection "${newList.name}" created!`);
        
        // Automatically add creator to the new list
        await handleAddToList(listId);
      }
    } catch (err) {
      console.error("Failed to create list:", err);
      toast.error("Failed to create collection.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToList = async (listId) => {
    if (!creator) return;
    setAddingToListId(listId);
    try {
      await apiWithAuth.post(API_ENDPOINTS.FAVORITES.ADD_TO_LIST, {
        creatorId: creator.id || creator._id,
        listId: listId,
      });
      toast.success(`Added ${creator.name} to collection!`);
      if (onSuccess) onSuccess(creator.id || creator._id);
      onClose();
    } catch (err) {
      console.error("Failed to add to list:", err);
      // Check for quota limits
      if (err.response?.status === 403 && (err.response?.data?.message?.toLowerCase().includes("limit") || err.response?.data?.message?.toLowerCase().includes("shortlisting"))) {
        setLimitMessage(err.response?.data?.message);
        setIsLimitModalOpen(true);
        return;
      }
      
      // Check if already in list
      if (err.response?.status === 400 || err.response?.data?.message?.includes("already")) {
        toast.info(`${creator.name} is already in this collection.`);
      } else {
        toast.error("Failed to add creator to collection.");
      }
    } finally {
      setAddingToListId(null);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        animating
          ? "bg-gray-900/40 backdrop-blur-sm"
          : "bg-gray-900/0 backdrop-blur-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-white shadow-2xl transition-all duration-300 ease-out ${
          animating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-6"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className={`h-1.5 w-full ${theme.colors.primaryGradient}`} />

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-50/50 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-pink-50/50 blur-3xl pointer-events-none" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200">
                <Heart className="h-6 w-6 fill-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Save Creator</h3>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">Add to Collection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Collection Input */}
          <form onSubmit={handleCreateList} className="mb-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Create new collection..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full h-14 pl-5 pr-14 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400 group-hover:border-purple-200"
              />
              <button
                type="submit"
                disabled={isCreating || !newListName.trim()}
                className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-gray-900 text-white transition-all hover:bg-purple-600 disabled:opacity-50 disabled:bg-gray-300 shadow-sm"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>

          {/* Collections List */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Your Collections</span>
               {isLoading && <Loader2 className="h-3 w-3 animate-spin text-purple-600" />}
             </div>

             <div className="max-h-[260px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
               {isLoading && lists.length === 0 ? (
                 <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Loading your collections...</p>
                 </div>
               ) : lists.length > 0 ? (
                 lists.map((list) => (
                   <button
                     key={list._id || list.id}
                     onClick={() => handleAddToList(list._id || list.id)}
                     disabled={addingToListId !== null}
                     className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50 group transition-all text-left"
                   >
                     <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors border border-gray-50 group-hover:border-purple-100">
                         <Folder className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                           {list.name}
                         </p>
                         <p className="text-[10px] text-gray-500 font-medium">{list.influencerCount || 0} creators</p>
                       </div>
                     </div>
                     <div className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-purple-300 group-hover:bg-white transition-all shadow-sm">
                        {addingToListId === (list._id || list.id) ? (
                          <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                        ) : (
                          <Plus className="h-3 w-3 text-gray-400 group-hover:text-purple-500" />
                        )}
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <Sparkles className="h-8 w-8 text-purple-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-bold mb-1">No collections yet</p>
                    <p className="text-xs text-gray-400 font-medium px-4">Create your first collection using the input above to organize creators.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      <TrialLimitModal 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        message={limitMessage}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
