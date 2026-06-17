"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationModal from "@/components/ConfirmationModal";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Video,
} from "lucide-react";

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.PORTFOLIO);
      const data = response?.data?.data || response?.data?.portfolio || response?.data || [];
      // Data might be an array of objects
      if (Array.isArray(data)) {
        setPortfolioItems(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.portfolio)) {
        setPortfolioItems(data.portfolio);
      } else {
        setPortfolioItems([]);
      }
    } catch (err) {
      console.error("Fetch portfolio error:", err);
      toast.error("Failed to load portfolio items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("media", files[i]); 
      }

      const response = await apiWithAuth.post(API_ENDPOINTS.USER.PORTFOLIO, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success(response?.data?.message || "Portfolio uploaded successfully!");
      fetchPortfolio();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.message || "Failed to upload file(s).");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiWithAuth.delete(`${API_ENDPOINTS.USER.PORTFOLIO}/${itemToDelete}`);
      toast.success("Item deleted");
      fetchPortfolio();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete item.");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative px-4 pt-28 pb-12 md:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
            <ImageIcon className="h-4 w-4" /> Portfolio
          </div>
          <h1 className={`${theme.typography.h1} text-gray-900`}>Your Creative Work</h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-2xl mx-auto">
            Showcase your best content to brands. High-quality examples increase your chances of booking collaborations.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 flex-1">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Upload Area */}
          <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-xl border border-purple-50 flex flex-col items-center justify-center min-h-[200px] text-center border-dashed cursor-pointer hover:bg-gray-50/50 transition relative">
            <input 
              type="file" 
              multiple
              accept="image/*,video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <PageLoader message="Uploading..." />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 inner-shadow">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Files</h3>
                <p className="text-sm">Drag & drop or click to upload your portfolio items.</p>
                <p className="text-xs text-gray-400 mt-2 mt-4 inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  JPG, PNG, MP4 up to 50MB
                </p>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              My Portfolio <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{portfolioItems.length} items</span>
            </h2>
            
            {loading ? (
              <PageLoader message="Bringing your works to light..." />
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No items yet</h3>
                <p className="text-gray-500 mt-1">Upload your first piece of content to start building your portfolio.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {portfolioItems.map((item, i) => {
                  const id = item._id || item.id || String(i);
                  const media = item.media || {};
                  const url = media.url || "";
                  const isVideo = media.resource_type === "video" || (url && typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i));

                  return (
                    <div key={id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition">
                      {isVideo ? (
                        <video src={url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <Image src={url} alt="Portfolio item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"  title="Image"  width={800}  height={800}  fetchPriority="auto" />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-3 right-3">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setItemToDelete(id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-full shadow-sm transition backdrop-blur-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {isVideo && (
                          <div className="absolute bottom-3 left-3 text-white">
                            <Video className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to remove this item from your portfolio? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </main>
  );
}
