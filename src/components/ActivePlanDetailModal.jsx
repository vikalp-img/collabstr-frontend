"use client";

import React from "react";
import { 
  X, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  Info,
  Zap,
  Star,
  ArrowRight
} from "lucide-react";
import { theme } from "@/theme";

/**
 * ActivePlanDetailModal - Displays current subscription plan details, realigned with HireSphere theme.
 */
const ActivePlanDetailModal = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  // Helper to check for unlimited features
  const isUnlimited = (limit, label) => {
    return limit >= 999 || label?.toLowerCase().includes("unlimited");
  };

  // Helper to clean label text for better presentation
  const getDisplayLabel = (label) => {
    return label?.replace(/\s*\(unlimited\)/i, "").trim() || "Feature";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-md transition-opacity duration-500" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[48px] bg-[#F8F9FD] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] transition-all animate-in fade-in zoom-in duration-500 border border-white/20">
        
        {/* HireSphere Brand Header */}
        <div className={`h-24 w-full ${theme.colors.primaryGradient} relative overflow-hidden flex items-center px-10`}>
          <div className="absolute inset-0 opacity-10 blur-xl scale-150 bg-white/20" />
          <div className="relative flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
               <Zap className="h-6 w-6" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-0.5">Subscription Overview</p>
               <h2 className="text-xl font-black text-white leading-none">
                 Active Plan Details
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
          
          {/* Main Plan Card */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
               <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2 leading-none">{plan.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Since Renewal
                    </span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                      ID: {plan.id?.slice(-8).toUpperCase()}
                    </span>
                  </div>
               </div>
               <p className="text-sm font-medium text-gray-500 max-w-xs transition-colors">
                  You are currently enjoying all the premium benefits included in our most powerful management tier.
               </p>
            </div>

            <div className="shrink-0 bg-gray-50 rounded-[32px] p-6 border border-gray-100/50 text-center min-w-[160px]">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Price Per Cycle</p>
               <p className="text-3xl font-black text-gray-900">
                 ₹{plan.price?.monthly || 0}<span className="text-sm text-gray-400 font-bold">.00</span>
               </p>
               <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Billed Monthly</p>
            </div>
          </div>

          {/* Privileges Grid */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your Privileges</p>
                <div className="flex items-center gap-2">
                   <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                   <span className="text-[10px] font-black text-gray-900 uppercase">Premium Benefits</span>
                </div>
             </div>
             
             <div className="grid gap-4">
               {plan.features?.filter(f => f.included).slice(0, 6).map((feature, idx) => {
                 const unlimited = isUnlimited(feature.limit, feature.label);
                 return (
                    <div key={idx} className="group flex items-center justify-between gap-4 bg-white p-5 rounded-[28px] border border-gray-100/50 shadow-sm transition-all hover:bg-white hover:shadow-md hover:border-purple-100">
                       <div className="flex items-center gap-4">
                          <div className={`h-9 w-9 rounded-2xl flex items-center justify-center transition-colors ${unlimited ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Check className="h-4 w-4 stroke-[4]" />
                          </div>
                          <span className="text-sm font-black text-gray-700">
                             {getDisplayLabel(feature.label)}
                          </span>
                       </div>
                       
                       {unlimited ? (
                         <span className="px-3 py-1 rounded-xl bg-purple-50 text-[10px] font-black uppercase tracking-widest text-purple-700 border border-purple-100/50">
                           Unlimited
                         </span>
                       ) : feature.limit ? (
                         <span className="px-3 py-1 rounded-xl bg-gray-50 text-[10px] font-black text-gray-900 border border-gray-100/50">
                           {feature.limit} Reserved
                         </span>
                       ) : null}
                    </div>
                 );
               })}
             </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 flex items-center justify-center">
            <button 
              onClick={onClose}
              className="group relative px-12 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-14 hover:shadow-2xl hover:bg-black active:scale-[0.95]"
            >
              <span className="relative z-10">Return Home</span>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ActivePlanDetailModal;
