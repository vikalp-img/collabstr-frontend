"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { theme } from "@/theme";

export default function MobileInputModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialValue = "",
  loading = false 
}) {
  const [mobile, setMobile] = useState(initialValue);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setMobile(initialValue);
      setError("");
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
  }, [isOpen, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    onSubmit(mobile);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        animating ? "bg-gray-900/60 backdrop-blur-md" : "bg-gray-900/0 backdrop-blur-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white shadow-2xl transition-all duration-300 ease-out ${
          animating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1 w-full ${theme.colors.primaryGradient}`} />

        <div className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 ${theme.effects.blurOrbPurple}`} />
        <div className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 ${theme.effects.blurOrbPink}`} />

        <div className="relative px-8 py-10">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl bg-gray-100 p-2 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-900 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] ${theme.effects.logoGradient} ring-8 ring-purple-50 shadow-xl`}>
              <Smartphone className="h-8 w-8 text-white" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              Link Your Mobile
            </h3>
            <p className="mt-2 text-gray-500 font-medium text-sm leading-relaxed max-w-[280px]">
              Please enter your mobile number to receive a verification code.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-gray-400 font-bold text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobile(val);
                      setError("");
                    }}
                    placeholder="99999 99999"
                    className={`w-full bg-gray-50 border ${error ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-50'} rounded-2xl pl-12 pr-6 py-4 text-gray-900 font-bold text-lg transition-all focus:outline-none placeholder:text-gray-300`}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-[10px] text-red-500 font-bold px-1 uppercase tracking-wider">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className={`group relative w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
                  ${!loading && mobile.length === 10 ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-xl shadow-purple-200/50' : 'bg-gray-900'}
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Secure & Private</p>
        </div>
      </div>
    </div>
  );
}
