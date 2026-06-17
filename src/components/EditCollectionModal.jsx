"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2, Pencil, Sparkles } from "lucide-react";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

export default function EditCollectionModal({
  isOpen,
  onClose,
  list,
  onSuccess,
}) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [name, setName] = useState(list?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setName(list?.name || "");
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
  }, [isOpen, list]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || name === list?.name) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiWithAuth.patch(API_ENDPOINTS.FAVORITES.EDIT_LIST + (list._id || list.id), {
        name: name.trim(),
      });
      
      const updatedList = response.data?.data || response.data;
      if (onSuccess) onSuccess(updatedList);
      toast.success("Collection renamed successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to rename collection:", err);
      toast.error("Failed to rename collection.");
    } finally {
      setIsLoading(false);
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
        className={`relative w-full max-w-[400px] overflow-hidden rounded-[2rem] bg-white shadow-2xl transition-all duration-300 ease-out ${
          animating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-6"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full ${theme.colors.primaryGradient}`} />

        <div className="relative p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Pencil className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rename Collection</h3>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">Edit Name</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Name</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Collection name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full h-14 pl-5 pr-5 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 ${theme.buttons.secondary}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim() || name === list?.name}
                className={`flex-1 ${theme.buttons.primary}`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
