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
  CheckCircle,
  Info,
  Eye
} from "lucide-react";
import OrderDetailModal from "@/components/OrderDetailModal";
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

export default function CreatorOrdersPage() {
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
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Confirm",
  });
  const [disputeModal, setDisputeModal] = useState({
    isOpen: false,
    orderId: "",
    itemId: "",
    message: ""
  });
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    reason: ""
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    order: null
  });
  const LIMIT = 10;
 
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

      const mappedOrders = ordersList.map(order => {
        const item = order.item;
        return {
          rawOrderId: order._id,
          rawItemId: item?._id,
          id: item?._id || order._id,
          displayOrderId: order.orderId,
          brandName: order.brandDetails?.companyName || order.brandDetails?.userName || "Brand",
          service: item?.serviceId?.serviceType?.title || item?.serviceId?.description || "Service",
          amount: Number(item?.totalPrice || item?.price || 0),
          status: item?.status || "pending",
          date: order.createdAt || new Date().toISOString(),
          image: order.brandDetails?.profile_image?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.brandDetails?.companyName || order.brandDetails?.userName || "B")}`,
          actionReason: item?.actionReason || ""
        };
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
 
  const handleStatusUpdate = async (rawOrderId, rawItemId, newStatus = null) => {
    console.log({rawOrderId, rawItemId})
    try {
      setUpdatingId(rawItemId || rawOrderId);
      
      const payload = {
        orderId: rawOrderId,
        itemId: rawItemId
      };
      
      if (newStatus) {
        payload.status = newStatus;
        if (newStatus === "dispute" && arguments[3]) {
          payload.message = arguments[3];
        }
      }

      const response = newStatus 
        ? await apiWithAuth.patch(API_ENDPOINTS.ORDER.UPDATE_STATUS, payload)
        : await apiWithAuth.post(API_ENDPOINTS.ORDER.DELIVER, payload);

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        toast.success(`Order ${newStatus || "delivered"} successfully!`);
        // Refresh the list to show updated status
        fetchOrders({
          search: searchQuery,
          status: filterStatus,
          start: startDate,
          end: endDate,
          page: currentPage
        });
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error(err?.response?.data?.message || `Failed to ${newStatus || "deliver"} the order.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDispute = async () => {
    if (!disputeModal.message.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }
    
    await handleStatusUpdate(disputeModal.orderId, disputeModal.itemId, "dispute", disputeModal.message);
    setDisputeModal(prev => ({ ...prev, isOpen: false, message: "" }));
  };

  const openDetailModal = (order) => {
    setDetailModal({ isOpen: true, order });
  };
 
  if (initialLoading) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Fetching your bookings..." />
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
    return "bg-gray-100 text-gray-700";
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <ShoppingBag className="h-3.5 w-3.5" /> Booking Management
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Manage <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Bookings</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
                Track your active brand collaborations, manage deliveries, and view your booking history.
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
                placeholder="Search by brand or order ID..."
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
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <PageLoader message="Loading bookings..." />
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Booking Details</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Brand</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Earnings</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order?._id} className="hover:bg-purple-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-gray-900 mb-1">{order.service}</p>
                            <p className="text-[11px] font-bold text-gray-400">ID: {order.displayOrderId || order.id}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={order.image} className="h-8 w-8 rounded-full object-cover shadow-sm bg-gray-100" alt={order.brandName} />
                            <p className="text-sm font-bold text-gray-700">{order.brandName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-600">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-gray-900">₹{order.amount.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider h-fit w-fit ${getStatusColor(order.status)}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${
                                order.status.toLowerCase().includes('completed') || order.status.toLowerCase().includes('delivered') ? 'bg-emerald-500' : 
                                order.status.toLowerCase().includes('progress') || order.status.toLowerCase().includes('review') ? 'bg-blue-500' : 
                                order.status.toLowerCase().includes('pending') ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                              {order.status}
                            </span>
                            {order.actionReason && (
                              <button
                                onClick={() => setFeedbackModal({ isOpen: true, reason: order.actionReason })}
                                className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-wider transition-colors w-fit"
                              >
                                <Info className="h-3 w-3" /> View Feedback
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {order.status.toLowerCase() === "pending" ? (
                              <>
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: "Accept Booking",
                                    message: "Are you sure you want to accept this booking? You will be committed to delivering the service.",
                                    confirmText: "Accept",
                                    isDanger: false,
                                    onConfirm: () => handleStatusUpdate(order.rawOrderId, order.rawItemId, "accepted")
                                  })}
                                  disabled={updatingId === order.rawItemId || updatingId === order.rawOrderId}
                                  className="h-8 px-4 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md shadow-purple-100 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {updatingId === (order.rawItemId || order.rawOrderId) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Accept"
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: "Reject Booking",
                                    message: "Are you sure you want to reject this booking? This action cannot be undone.",
                                    confirmText: "Reject",
                                    isDanger: true,
                                    onConfirm: () => handleStatusUpdate(order.rawOrderId, order.rawItemId, "rejected")
                                  })}
                                  disabled={updatingId === order.rawItemId || updatingId === order.rawOrderId}
                                  className="h-8 px-4 rounded-xl bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (order.status.toLowerCase() === "accepted" || order.status.toLowerCase() === "revision") ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: order.status.toLowerCase() === "revision" ? "Resubmit Delivery" : "Deliver Service",
                                    message: order.status.toLowerCase() === "revision" 
                                      ? "Are you sure you have addressed the feedback and are ready to resubmit? This will notify the brand."
                                      : "Are you sure you have completed the service and are ready to mark it as delivered? This will notify the brand.",
                                    confirmText: order.status.toLowerCase() === "revision" ? "Resubmit" : "Deliver",
                                    isDanger: false,
                                    onConfirm: () => handleStatusUpdate(order.rawOrderId, order.rawItemId)
                                  })}
                                  disabled={updatingId === order.rawItemId || updatingId === order.rawOrderId}
                                  className="h-8 px-4 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {updatingId === (order.rawItemId || order.rawOrderId) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      {order.status.toLowerCase() === "revision" ? "Resubmit" : "Deliver"}
                                    </>
                                  )}
                                </button>
                                
                                {order.status.toLowerCase() === "revision" && (
                                  <button
                                    onClick={() => setDisputeModal({
                                      isOpen: true,
                                      orderId: order.rawOrderId,
                                      itemId: order.rawItemId,
                                      message: ""
                                    })}
                                    disabled={updatingId === order.rawItemId || updatingId === order.rawOrderId}
                                    className="h-8 px-4 rounded-xl bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-all disabled:opacity-50"
                                  >
                                    Report
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => openDetailModal(order)}
                                className="h-8 px-4 rounded-xl bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-wider border border-gray-100 hover:bg-gray-900 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                              >
                                <Eye className="h-3 w-3" />
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
            ) : (
              <div className="py-24 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 border border-gray-100">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">No bookings found</p>
                  <p className="text-sm text-gray-500 font-medium">When a brand hires you, your bookings will appear here.</p>
                </div>
                <Link 
                  href="/creator/services"
                  className="inline-flex items-center gap-2 text-purple-600 font-bold hover:underline"
                >
                  Manage Services <ChevronRight className="h-4 w-4" />
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
              label="bookings"
            />
          </div>
        </div>
      </section>

      <Footer />

      <OrderDetailModal 
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, order: null })}
        order={detailModal.order}
        role="creator"
      />
 
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />

      {/* Dispute Modal */}
      <ConfirmationModal
        isOpen={disputeModal.isOpen}
        onClose={() => setDisputeModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDispute}
        title="Report Brand / Initiate Dispute"
        message="Please provide clear details about why you are initiating a dispute. Our team will review the case."
        confirmText="Submit Report"
        isDanger={true}
      >
        <div className="mt-4">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
            Reason for Dispute
          </label>
          <textarea
            className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/50 transition-all text-sm font-medium min-h-[120px] resize-none"
            placeholder="e.g. The brand is requesting revisions outside the original scope or ignoring communication..."
            value={disputeModal.message}
            onChange={(e) => setDisputeModal(prev => ({ ...prev, message: e.target.value }))}
          />
        </div>
      </ConfirmationModal>

      {/* View Feedback Modal */}
      <ConfirmationModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        title="Revision Feedback"
        message="Instructions from the brand regarding your last submission:"
        confirmText="Got it"
        cancelText=""
      >
        <div className="mt-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-100/50 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
            "{feedbackModal.reason}"
          </p>
        </div>
      </ConfirmationModal>
    </main>
  );
}
