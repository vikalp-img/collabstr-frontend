"use client";

import React from "react";
import { 
  X, 
  ShoppingBag, 
  Calendar, 
  IndianRupee, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  UserCircle2,
  Share2,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { theme } from "@/theme";

const OrderDetailModal = ({ isOpen, onClose, order, role = "brand" }) => {
  if (!isOpen || !order) return null;

  const getStatusInfo = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("delivered"))
      return { color: "bg-emerald-500", text: "Completed", icon: CheckCircle2, bg: "bg-emerald-50", textColor: "text-emerald-700", border: "border-emerald-100" };
    if (s.includes("progress") || s.includes("review"))
      return { color: "bg-blue-500", text: "In Review", icon: Clock, bg: "bg-blue-50", textColor: "text-blue-700", border: "border-blue-100" };
    if (s.includes("pending"))
      return { color: "bg-amber-500", text: "Pending", icon: Clock, bg: "bg-amber-50", textColor: "text-amber-700", border: "border-amber-100" };
    if (s.includes("rejected") || s.includes("refunded") || s.includes("cancelled"))
      return { color: "bg-red-500", text: "Rejected", icon: AlertTriangle, bg: "bg-red-50", textColor: "text-red-700", border: "border-red-100" };
    if (s.includes("accepted"))
      return { color: "bg-purple-500", text: "Accepted", icon: CheckCircle2, bg: "bg-purple-50", textColor: "text-purple-700", border: "border-purple-100" };
    return { color: "bg-gray-500", text: status, icon: CheckCircle2, bg: "bg-gray-50", textColor: "text-gray-700", border: "border-gray-100" };
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-md transition-opacity duration-500" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[48px] bg-[#F8F9FD] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] transition-all animate-in fade-in zoom-in duration-500 border border-white/20">
        {/* Top Gradient Header */}
        <div className={`h-24 w-full ${theme.colors.primaryGradient} relative overflow-hidden flex items-center px-10`}>
          <div className="absolute inset-0 opacity-10 blur-xl scale-150 bg-white/20" />
          <div className="relative flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
               <ShoppingBag className="h-6 w-6" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-0.5">Order Management</p>
               <h2 className="text-xl font-black text-white leading-none">
                 Transaction Summary
               </h2>
             </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute right-8 rounded-full p-2.5 bg-white/10 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-110 shadow-lg border border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 md:p-10 space-y-8 max-h-[75vh] overflow-y-auto hidden-scrollbar">
          {/* Section 1: Hero Info */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{order.service}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.textColor} border ${statusInfo.border} text-[10px] font-black uppercase tracking-wider`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${statusInfo.color}`} />
                      {statusInfo.text}
                    </span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      ID: {order.displayOrderId || order.id}
                    </span>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                 </div>
               </div>
            </div>

            <div className="shrink-0 bg-gray-50 rounded-[32px] p-6 border border-gray-100/50 text-center min-w-[160px]">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Amount</p>
               <p className="text-3xl font-black text-gray-900">
                 ₹{order.amount.toFixed(0)}<span className="text-sm text-gray-400 font-bold">.00</span>
               </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Participant Card */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100/50 flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {role === "brand" ? "Creative Partner" : "Client Brand"}
                  </p>
                  <ArrowRight className="h-4 w-4 text-gray-200" />
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-[24px] blur-lg scale-110" />
                    <img 
                      src={order.image} 
                      className="relative h-16 w-16 rounded-[24px] object-cover border-4 border-white shadow-xl" 
                      alt={role === "brand" ? order.creatorName : order.brandName} 
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight">
                      {role === "brand" ? order.creatorName : order.brandName}
                    </h4>
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-lg w-fit mt-1">
                      Verified Member
                    </p>
                  </div>
               </div>
               
               <button className="w-full py-3 rounded-2xl bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all border border-gray-100">
                 View Full Profile
               </button>
            </div>

            {/* Workflow Card */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100/50 flex flex-col justify-between relative h-full">
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Collaboration Health</p>
                    {(() => {
                      const s = order.status.toLowerCase();
                      const revs = order.revisionUsed || 0;
                      
                      if (s.includes("completed") || s.includes("delivered")) 
                        return <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">Success</span>;
                      if (s.includes("rejected") || s.includes("refunded") || s.includes("cancelled"))
                        return <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100/50">Stalled</span>;
                      if (s.includes("revision") && revs >= 2)
                        return <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50">Needs Attention</span>;
                      if (s.includes("accepted"))
                        return <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">On Track</span>;
                      return <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50">Initiated</span>;
                    })()}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black text-gray-700">Revisions Progress</span>
                      <span className="text-[11px] font-black text-gray-900">{order.revisionUsed || 0} / 3</span>
                    </div>
                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        style={{ width: `${Math.max(10, ((order.revisionUsed || 0) / 3) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50 mt-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                       Professional standard delivery includes up to 3 revision cycles for final adjustments.
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 flex items-center justify-center">
            <button 
              onClick={onClose}
              className="group relative px-12 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-14 hover:shadow-2xl hover:bg-black active:scale-95"
            >
              <span className="relative z-10">Close Record</span>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrderDetailModal;
