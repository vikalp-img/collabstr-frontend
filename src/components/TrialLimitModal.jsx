"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Zap, ChevronRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { theme } from "@/theme";

export default function TrialLimitModal({
  isOpen,
  onClose,
  message,
}) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
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
  }, [isOpen]);

  if (!visible) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        animating
          ? "bg-gray-900/60 backdrop-blur-md"
          : "bg-gray-900/0 backdrop-blur-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[440px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          animating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 translate-y-12"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Gradients */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Top accent gradient bar */}
        <div className={`h-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400`} />

        <div className="relative p-10 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon Header */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-200 rotate-3">
              <Zap className="h-12 w-12 fill-white animate-bounce-slow" />
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-purple-50">
                <Lock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              Limit Reached
            </h3>
            <div className="px-2">
              <p className="text-gray-600 font-medium leading-relaxed">
                {message || "You've reached your monthly limit for this feature. Upgrade your plan to continue growing your brand."}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-4">
            <button
              onClick={handleUpgrade}
              className="group relative w-full overflow-hidden rounded-2xl bg-gray-900 p-5 text-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-2 font-black text-lg">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span>Upgrade Now</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            <button
              onClick={onClose}
              className="w-full rounded-2xl border-2 border-gray-100 bg-white p-4 text-sm font-bold text-gray-500 transition-all hover:border-gray-200 hover:text-gray-900"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer perk */}
          <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
               Unlock unlimited collections & more
             </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .cubic-bezier {
           transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
