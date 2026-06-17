"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationModal from "@/components/ConfirmationModal";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { 
  ShoppingBag, 
  Search, 
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  Calendar,
  Filter,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Globe,
  Copy,
  Check,
  MapPin,
  Sparkles,
  Star,
  Trash2
} from "lucide-react";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import Pagination from "@/components/Pagination";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import OrderDetailModal from "@/components/OrderDetailModal";

export default function BrandOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const LIMIT = 10;
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFetchingCreator, setIsFetchingCreator] = useState(false);
  const [creatorDetail, setCreatorDetail] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: "",
    itemId: "",
    status: "",
    message: ""
  });
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    orderId: "",
    itemId: "",
    serviceName: "",
    creatorName: "",
    rating: 5,
    comment: "",
    isEditing: false,
    reviewId: ""
  });
  const [deleteReviewModal, setDeleteReviewModal] = useState({
    isOpen: false,
    reviewId: ""
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    order: null
  });

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

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const isFiltered = searchQuery !== "" || filterStatus !== "all" || startDate !== "" || endDate !== "";

  const fetchOrders = async (filters = {}) => {
    try {
      setLoading(true);
      const { search, status, start, end, page = currentPage } = filters;
      
      const params = {
        page,
        limit: LIMIT
      };
      if (search) params.search = search;
      if (status && status !== "all") params.status = status;
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      const response = await apiWithAuth.get(API_ENDPOINTS.ORDER.LIST, { params });
      const apiData = response?.data?.data || {};
      const ordersList = apiData.orders || [];
      setTotalPages(apiData.totalPages || 1);
      setTotalOrders(apiData.total || 0);
      setCurrentPage(apiData.page || page);

      // Map API response to UI structure, extraction of individual items
      const mappedOrders = ordersList.flatMap(order => {
        const items = Array.isArray(order.item) ? order.item : (order.item ? [order.item] : []);
        return items.map(item => {
          return {
            id: item?._id || order._id,
            orderObjectId: order._id,
            itemId: item?._id,
            displayOrderId: order.orderId,
            creatorName: item?.creatorDetails?.userName || "Creator",
          service: item?.serviceId?.serviceType?.title || item?.serviceId?.description || "Service",
          amount: Number(item?.totalPrice || item?.price || 0),
          status: item?.status || "pending",
          date: order.createdAt || new Date().toISOString(),
          image: item?.creatorDetails?.profile_image?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.creatorDetails?.userName || "C")}`,
          creatorEmail: item?.creatorDetails?.email || "N/A",
          creatorPhone: "Not Shared",
          creatorLocation: "Not Shared",
          creatorId: item?.creatorDetails?._id,
          revisionUsed: item?.revisionUsed || 0,
          isReviewed: item?.isReviewed || false,
          reviewId: item?.review?._id || item?.review?.id || item?.reviewId || item?.review_id || (typeof item?.review === 'string' ? item.review : null) || item?._id || item?.id || item?.itemId || item?.serviceId?._id || order?._id || null,
          reviewRating: item?.review?.rating || 5,
          reviewComment: item?.review?.comment || "",
          };
        });
      });
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load your orders");
      if (orders.length === 0) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders({
        search: searchQuery,
        status: filterStatus,
        start: startDate,
        end: endDate,
        page: 1 // Reset to page 1 on filter change
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, startDate, endDate]);

  useEffect(() => {
    // Only fetch if not the first page (handled by filters effect)
    // or if explicitly navigating pages
    if (currentPage > 1) {
      fetchOrders({
        search: searchQuery,
        status: filterStatus,
        start: startDate,
        end: endDate,
        page: currentPage
      });
    }
  }, [currentPage]);

  if (initialLoading) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Fetching your orders..." />
        <Footer />
      </main>
    );
  }

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("delivered"))
      return "bg-emerald-100 text-emerald-700";
    if (s.includes("progress") || s.includes("review"))
      return "bg-blue-100 text-blue-700";
    if (s.includes("pending"))
      return "bg-amber-100 text-amber-700";
    if (s.includes("rejected") || s.includes("refunded") || s.includes("cancelled"))
      return "bg-red-100 text-red-700";
    if (s.includes("accepted"))
      return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleShowContact = async (order) => {
    setSelectedOrder(order);
    setCreatorDetail(null);
    setIsContactModalOpen(true);
    

    console.log({order})
    
    if (order.creatorId) {
      try {
        setIsFetchingCreator(true);
        const urlToFetch = `${API_ENDPOINTS.USER.CREATOR_BY_ID}${order.creatorId}`;
        console.log("Fetching creator details from:", urlToFetch);
        
        let response;
        try {
          response = await apiWithAuth.get(urlToFetch);
        } catch (apiErr) {
          console.error("Singular API failed, trying plural fallback:", apiErr);
          const fallbackUrl = `${API_ENDPOINTS.USER.CREATOR_DETAILS}${order.creatorId}`;
          console.log("Fetching fallback from:", fallbackUrl);
          response = await apiWithAuth.get(fallbackUrl);
        }

        const data = response?.data?.data || response?.data;
        if (data) {
          setCreatorDetail(data);
        }
      } catch (err) {
        console.error("Both creator detail fetch attempts failed:", err);
        toast.error("Unable to load full contact details. Showing partial info.");
      } finally {
        setIsFetchingCreator(false);
      }
    } else {
      console.warn("No creatorId found for this order, skipping API call.");
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleReview = async () => {
    const { orderId, itemId, status, message } = reviewModal;
    
    if ((status === "rejected" || status === "revision" || status === "dispute") && !message.trim()) {
      toast.error(`Please provide a reason for ${status}`);
      return;
    }

    try {
      setUpdatingId(itemId || orderId);
      const payload = {
        orderId,
        itemId,
        status,
        ...((status === "rejected" || status === "revision" || status === "dispute") && { message })
      };

      const response = await apiWithAuth.post(API_ENDPOINTS.ORDER.REVIEW, payload);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success(`Action ${status} submitted successfully`);
        setReviewModal({ isOpen: false, orderId: "", itemId: "", status: "", message: "" });
        fetchOrders({
          search: searchQuery,
          status: filterStatus,
          start: startDate,
          end: endDate,
          page: currentPage
        });
      } else {
        throw new Error(response.data?.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Review failed:", err);
      toast.error(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      setUpdatingId(ratingModal.itemId || ratingModal.orderId);
      
      const payload = ratingModal.isEditing 
        ? {
            rating: ratingModal.rating,
            comment: ratingModal.comment
          }
        : {
            orderId: ratingModal.orderId,
            itemId: ratingModal.itemId,
            rating: ratingModal.rating,
            comment: ratingModal.comment
          };
      
      const endpoint = ratingModal.isEditing 
        ? `${API_ENDPOINTS.REVIEWS.EDIT}${ratingModal.reviewId}` 
        : API_ENDPOINTS.REVIEWS.ADD;

      const response = ratingModal.isEditing
        ? await apiWithAuth.put(endpoint, payload)
        : await apiWithAuth.post(endpoint, payload);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success(ratingModal.isEditing ? "Review updated successfully!" : "Thank you for your review!");
        setRatingModal({ 
          isOpen: false, 
          orderId: "", 
          itemId: "", 
          serviceName: "", 
          creatorName: "", 
          rating: 5, 
          comment: "",
          isEditing: false,
          reviewId: ""
        });
        
        fetchOrders({
          search: searchQuery,
          status: filterStatus,
          start: startDate,
          end: endDate,
          page: currentPage
        });
      } else {
        throw new Error(response.data?.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Rating submission failed:", err);
      toast.error(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReview = async () => {
    try {
      setUpdatingId(deleteReviewModal.reviewId);
      const response = await apiWithAuth.delete(`${API_ENDPOINTS.REVIEWS.DELETE}${deleteReviewModal.reviewId}`);

      if (response.data?.success || response.status === 200 || response.status === 204) {
        toast.success("Review deleted successfully");
        setDeleteReviewModal({ isOpen: false, reviewId: "" });
        fetchOrders({
          search: searchQuery,
          status: filterStatus,
          start: startDate,
          end: endDate,
          page: currentPage
        });
      } else {
        throw new Error(response.data?.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Delete review failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete review. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailModal = (order) => {
    setDetailModal({ isOpen: true, order });
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <ShoppingBag className="h-3.5 w-3.5" /> Order Management
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Manage <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Orders</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
                Track your active collaborations, manage payments, and view your order history with creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0 space-y-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by creator or order ID..."
                className="w-full pl-11 pr-4 !h-12 !rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all bg-white shadow-sm hover:border-purple-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Date Range Picker */}
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 !h-12 shadow-sm hover:border-purple-300 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all group w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2 shrink-0">
                  <Calendar className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <input 
                    type="date" 
                    className="bg-transparent border-none focus:outline-none text-xs font-bold text-gray-700 min-w-[100px] cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start"
                  />
                </div>
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest shrink-0">to</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none focus:outline-none text-xs font-bold text-gray-700 min-w-[100px] cursor-pointer text-right md:text-left"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End"
                />
              </div>

              {/* Status Select */}
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full !rounded-2xl border-gray-200 shadow-sm bg-white font-bold text-gray-700 !h-12 px-4 hover:border-purple-300 focus:ring-2 focus:ring-purple-500/20 transition-all">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                    {["all", "pending", "accepted", "delivered", "completed", "rejected"].map(status => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        className="rounded-xl my-1 mx-1 font-medium capitalize"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isFiltered && (
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 !h-12 !rounded-2xl bg-purple-50 text-purple-600 font-black text-xs uppercase tracking-wider hover:bg-purple-100 transition-all border border-purple-100 shadow-sm whitespace-nowrap"
                >
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden min-h-[400px] relative">
            {loading ? (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[32px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  <p className="text-sm font-bold text-gray-600">Updating orders...</p>
                </div>
              </div>
            ) : null}

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Creator</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-purple-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-gray-900 mb-1">{order.service}</p>
                            <p className="text-[11px] font-bold text-gray-400">ID: {order.displayOrderId || order.id}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={order.image} className="h-8 w-8 rounded-full object-cover shadow-sm bg-gray-100" alt={order.creatorName} />
                            <p className="text-sm font-bold text-gray-700">{order.creatorName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-600">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-gray-900">₹{order.amount.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              order.status.toLowerCase().includes('completed') || order.status.toLowerCase().includes('delivered') ? 'bg-emerald-500' : 
                              order.status.toLowerCase().includes('progress') || order.status.toLowerCase().includes('review') ? 'bg-blue-500' : 
                              order.status.toLowerCase().includes('pending') ? 'bg-amber-500' :
                              order.status.toLowerCase().includes('accepted') ? 'bg-purple-500' :
                              'bg-red-500'
                            }`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status.toLowerCase().includes("reviewing") ? (
                              <>
                                <button 
                                  onClick={() => setReviewModal({
                                    isOpen: true,
                                    orderId: order.orderObjectId,
                                    itemId: order.itemId,
                                    status: "completed",
                                    message: ""
                                  })}
                                  disabled={updatingId === order.itemId}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                                >
                                  {updatingId === order.itemId && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Accept
                                </button>
                                
                                <button 
                                  onClick={() => setReviewModal({
                                    isOpen: true,
                                    orderId: order.orderObjectId,
                                    itemId: order.itemId,
                                    status: "revision",
                                    message: ""
                                  })}
                                  disabled={updatingId === order.itemId || order.revisionUsed >= 3}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600 transition-all shadow-md shadow-amber-100 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                                  title={order.revisionUsed >= 3 ? "Maximum revisions reached" : `Demand Revision (${order.revisionUsed}/3 used)`}
                                >
                                  Revise
                                </button>

                                <button 
                                  onClick={() => setReviewModal({
                                    isOpen: true,
                                    orderId: order.orderObjectId,
                                    itemId: order.itemId,
                                    status: "dispute",
                                    message: ""
                                  })}
                                  disabled={updatingId === order.itemId}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-red-100 text-red-500 font-bold text-[10px] hover:bg-red-50 transition-all disabled:opacity-50"
                                >
                                  Report
                                </button>
                              </>
                            ) : order.status.toLowerCase().includes("accepted") ? (
                              <button 
                                onClick={() => handleShowContact(order)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all border border-purple-100/50 shadow-sm group/eye"
                                title="View Creator Contact Details"
                              >
                                <Eye className="h-3.5 w-3.5 group-hover/eye:scale-110 transition-transform" />
                                View Contact
                              </button>
                            ) : order.isReviewed ? (
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setRatingModal({
                                      isOpen: true,
                                      orderId: order.orderObjectId,
                                      itemId: order.itemId,
                                      serviceName: order.service,
                                      creatorName: order.creatorName,
                                      rating: order.reviewRating,
                                      comment: order.reviewComment,
                                      isEditing: true,
                                      reviewId: order.reviewId || order.itemId || order.id
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-600 font-bold text-xs hover:bg-purple-50 transition-all shadow-sm active:scale-95 group/star"
                                  >
                                    <Star className="h-3.5 w-3.5 fill-purple-600 group-hover/star:rotate-12 transition-transform" />
                                    Edit Review
                                  </button>
                                  <button 
                                    onClick={() => setDeleteReviewModal({
                                      isOpen: true,
                                      reviewId: order.reviewId || order.itemId || order.id
                                    })}
                                    disabled={updatingId === (order.reviewId || order.itemId || order.id)}
                                    className="p-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                                    title="Delete Review"
                                  >
                                    {updatingId === (order.reviewId || order.itemId || order.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </button>
                                </div>
                            ) : (order.status.toLowerCase().includes("completed") || order.status.toLowerCase().includes("delivered")) ? (
                              <button 
                                onClick={() => setRatingModal({
                                  isOpen: true,
                                  orderId: order.orderObjectId,
                                  itemId: order.itemId,
                                  serviceName: order.service,
                                  creatorName: order.creatorName,
                                  rating: 5,
                                  comment: "",
                                  isEditing: false,
                                  reviewId: ""
                                })}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${theme.colors.primaryGradient} text-white font-bold text-xs hover:shadow-lg hover:scale-105 transition-all shadow-md active:scale-95 group/star`}
                              >
                                <Star className="h-3.5 w-3.5 fill-white group-hover/star:rotate-12 transition-transform" />
                                Give Review
                              </button>
                            ) : (
                              <button 
                                onClick={() => openDetailModal(order)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all border border-gray-100 shadow-sm group/eye"
                                title="View Order Details"
                              >
                                <Eye className="h-3.5 w-3.5 group-hover/eye:scale-110 transition-transform" />
                                View Details
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading && (
              <div className="py-24 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 border border-gray-100">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">No orders found</p>
                  <p className="text-sm text-gray-500 font-medium">When you hire a creator, your orders will appear here.</p>
                </div>
                <Link 
                  href="/creators"
                  className="inline-flex items-center gap-2 text-purple-600 font-bold hover:underline"
                >
                  Browse Creators <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Pagination Component */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalOrders}
              itemsCount={orders.length}
              label="orders"
            />
          </div>
        </div>
      </section>

      <Footer />

      <OrderDetailModal 
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, order: null })}
        order={detailModal.order}
        role="brand"
      />

      {/* Creator Contact Modal */}
      {isContactModalOpen && selectedOrder && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsContactModalOpen(false)}
          />
          <div className="relative w-full max-w-[850px] overflow-hidden rounded-[40px] bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-300">
            <div className={`h-2 w-full ${theme.colors.primaryGradient}`} />
            
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="absolute right-8 top-8 z-20 rounded-full p-2.5 bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
              {isFetchingCreator ? (
                <div className="py-32 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-purple-600/50" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Unlocking Profile</p>
                    <p className="text-xs font-bold text-gray-400 animate-pulse">Establishing Secure Connection...</p>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_320px] gap-12">
                  {/* Left Column: Creator Identity & Info */}
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-3 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-xl" />
                        <img 
                          src={creatorDetail?.profileImage || selectedOrder.image} 
                          className="relative h-32 w-32 rounded-full object-cover border-4 border-white shadow-2xl ring-1 ring-gray-100" 
                          alt={creatorDetail?.userName || selectedOrder.creatorName} 
                        />
                        <div className="absolute bottom-1 right-1 bg-emerald-500 border-4 border-white h-8 w-8 rounded-full shadow-lg flex items-center justify-center">
                           <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="text-center md:text-left pt-2">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">
                          {creatorDetail?.userName || selectedOrder.creatorName}
                        </h3>
                        {creatorDetail?.title && (
                          <p className="text-base font-bold text-purple-600 uppercase tracking-widest mb-4">
                            {creatorDetail.title}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-gray-200">
                          <Check className="h-3 w-3" /> Partner Verified
                        </div>
                      </div>
                    </div>

                    {/* Bio Section */}
                    {creatorDetail?.bio && (
                      <div className="relative group">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-purple-100 rounded-full group-hover:bg-purple-600 transition-colors" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" /> Story & Vision
                        </p>
                        <p className="text-base text-gray-600 leading-relaxed font-medium pl-2">
                          {creatorDetail.bio}
                        </p>
                      </div>
                    )}

                    {/* Categories & Experience */}
                    <div className="grid sm:grid-cols-2 gap-8 pt-4">
                      {creatorDetail?.category?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Creative Niches</p>
                          <div className="flex flex-wrap gap-2">
                            {creatorDetail.category.map((cat, idx) => (
                              <span key={idx} className="px-4 py-1.5 rounded-xl bg-gray-50 text-gray-700 text-xs font-bold border border-gray-100 hover:bg-white hover:border-purple-200 transition-all cursor-default">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {creatorDetail?.language?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Communication</p>
                          <div className="flex flex-wrap gap-2">
                            {creatorDetail.language.map((lang, idx) => (
                              <span key={idx} className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100/50">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Footprint */}
                    {creatorDetail?.socialAccounts?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Social Ecosystem</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {creatorDetail.socialAccounts.map((social, idx) => (
                            <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-5 transition-all hover:bg-white hover:border-purple-200 hover:shadow-xl group/social">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                                  social.platform === 'Instagram' ? 'bg-pink-100 text-pink-600' : 'bg-gray-900 text-white'
                                }`}>
                                  {social.platform}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => copyToClipboard(social.handle, social.platform)}
                                    className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-50 text-gray-400 hover:bg-purple-600 hover:text-white transition-all shadow-sm group/copy"
                                    title={`Copy ${social.platform} handle`}
                                  >
                                    {copiedField === social.platform ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm font-black text-gray-900 mb-1">{social.handle}</p>
                              <p className="text-xs font-bold text-gray-400">{social.followers?.toLocaleString()}+ Quality Followers</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Premium Contact Card */}
                  <div className="relative lg:bg-purple-50/20 lg:-mr-12 lg:-my-12 lg:p-12 lg:border-l lg:border-purple-100 flex flex-col min-h-full">
                    <div className="sticky top-0 space-y-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em]">Secure Channels</p>
                          <p className="text-xs font-bold text-gray-400">Verified Contact Methods</p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        {/* Email */}
                        <div className="relative group">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">Email Connection</p>
                          <div className="flex items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-purple-100 transition-all ring-1 ring-gray-900/5">
                            <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                              <Mail className="h-4 w-4 text-purple-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate flex-1">
                              {creatorDetail?.email || selectedOrder.creatorEmail}
                            </p>
                            <button 
                              onClick={() => copyToClipboard(creatorDetail?.email || selectedOrder.creatorEmail, "Email")}
                              className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors bg-gray-50 group-hover/btn:scale-110"
                            >
                              {copiedField === "Email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="relative group">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">WhatsApp / Direct</p>
                          <div className="flex items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-purple-100 transition-all ring-1 ring-gray-900/5">
                            <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                              <Phone className="h-4 w-4 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 flex-1">
                              {creatorDetail?.phone || selectedOrder.creatorPhone || "Not Shared"}
                            </p>
                            {(creatorDetail?.phone || selectedOrder.creatorPhone) && (
                              <button 
                                onClick={() => copyToClipboard(creatorDetail?.phone || selectedOrder.creatorPhone, "Phone")}
                                className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors bg-gray-50"
                              >
                                {copiedField === "Phone" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Location Detail */}
                        <div className="relative group">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2">
                             Geographic Base
                          </p>
                          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-purple-100 transition-all ring-1 ring-gray-900/5 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors text-blue-600">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              {creatorDetail?.location 
                                ? typeof creatorDetail.location === 'object'
                                  ? `${creatorDetail.location.city || ""}${creatorDetail.location.state ? `, ${creatorDetail.location.state}` : ""}${creatorDetail.location.country ? ` (${creatorDetail.location.country})` : ""}` 
                                  : creatorDetail.location
                                : selectedOrder.creatorLocation}
                            </p>
                          </div>
                        </div>

                        <div className="pt-8">
                          <div className="rounded-[24px] bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 border border-amber-100 relative overflow-hidden group/safety">
                            <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover/safety:scale-110 group-hover/safety:-rotate-12 transition-all duration-500">
                              <ShoppingBag className="h-16 w-16 text-amber-600" />
                            </div>
                            <div className="relative">
                              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> Payment Security
                              </p>
                              <p className="text-[13px] font-bold text-amber-900/80 leading-relaxed max-w-[240px]">
                                For your protection, always process payments through the platform. External deals are not covered by our protection.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ConfirmationModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleReview}
        title={
          reviewModal.status === "completed" ? "Accept Content" : 
          reviewModal.status === "revision" ? "Request Revision" : 
          reviewModal.status === "dispute" ? "Report Creator" : 
          "Confirm Action"
        }
        message={
          reviewModal.status === "completed" ? "Are you sure you want to accept this delivery? This will mark the order as completed." : 
          reviewModal.status === "revision" ? "Please provide clear instructions for the revision requested." : 
          reviewModal.status === "dispute" ? "Please detail the issues you are facing with this creator. This will initiate a dispute resolution." : 
          "Confirm your action."
        }
        confirmText={
          reviewModal.status === "completed" ? "Accept Delivery" : 
          reviewModal.status === "revision" ? "Send Revision Request" : 
          reviewModal.status === "dispute" ? "Submit Report" : 
          "Confirm"
        }
        isDanger={reviewModal.status === "dispute"}
      >
        {(reviewModal.status === "revision" || reviewModal.status === "dispute") && (
          <div className="mt-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
              Feedback Message
            </label>
            <textarea
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all text-sm font-medium min-h-[120px] resize-none"
              placeholder={
                reviewModal.status === "revision" 
                ? "e.g. Please change the background color to white as discussed..." 
                : "e.g. The creator is not following instructions..."
              }
              value={reviewModal.message}
              onChange={(e) => setReviewModal(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        )}
      </ConfirmationModal>

      {/* Give Review Modal */}
      <ConfirmationModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleRatingSubmit}
        title="Share Your Experience"
        message={`Your feedback helps ${ratingModal.creatorName} improve and helps other brands make better decisions about ${ratingModal.serviceName}.`}
        confirmText="Submit Review"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-4">
             <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Service Being Reviewed</p>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{ratingModal.serviceName}</p>
             </div>
             <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Creator</p>
                <p className="text-sm font-bold text-gray-900">{ratingModal.creatorName}</p>
             </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Rate the collaboration
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingModal(prev => ({ ...prev, rating: star }))}
                  className="p-1 transition-all hover:scale-110 active:scale-90"
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      star <= ratingModal.rating 
                      ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
                      : "text-gray-200"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Feedback Comment
            </label>
            <textarea
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all text-sm font-medium min-h-[100px] resize-none shadow-inner"
              placeholder="Tell us what you liked or how they can improve..."
              value={ratingModal.comment}
              onChange={(e) => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Delete Review Modal */}
      <ConfirmationModal
        isOpen={deleteReviewModal.isOpen}
        onClose={() => setDeleteReviewModal({ isOpen: false, reviewId: "" })}
        onConfirm={handleDeleteReview}
        title="Delete Review?"
        message="This will permanently remove your feedback. You can always write a new review later."
        confirmText="Delete Review"
        isDanger={true}
      />
    </main>
  );
}