"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mail, ShieldCheck, Loader2, ArrowRight, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { theme } from "@/theme";

export default function OTPModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  identifier,
  type = "email", // "email" or "mobile"
  onResend
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = "hidden";
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimer(30);
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 250);
      document.body.style.overflow = "unset";
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    
    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      await onVerify(otpString);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await onResend();
      setTimer(30);
      toast.success("OTP Resent successfully!");
    } catch (err) {
      toast.error("Failed to resend OTP.");
    }
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
        className={`relative w-full max-w-[380px] overflow-hidden rounded-[28px] bg-white shadow-2xl transition-all duration-300 ease-out ${
          animating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Top */}
        <div className={`h-1 w-full ${theme.colors.primaryGradient}`} />

        {/* Decorative Background Elements */}
        <div className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 ${theme.effects.blurOrbPurple}`} />
        <div className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 ${theme.effects.blurOrbPink}`} />

        <div className="relative px-6 py-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl bg-gray-50 p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Header Icon */}
            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] ${theme.effects.logoGradient} ring-6 ring-purple-50 shadow-xl`}>
              {type === "email" ? (
                <Mail className="h-8 w-8 text-white" />
              ) : (
                <Smartphone className="h-8 w-8 text-white" />
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              Verify Your {type === "email" ? "Email" : "Mobile"}
            </h3>
            <p className="mt-2 text-gray-500 font-medium text-sm leading-relaxed max-w-[240px]">
              We just sent a 6-digit verification code to <br />
              <span className="text-purple-600 font-bold">{identifier}</span>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-xl font-black transition-all focus:outline-none 
                      ${error 
                        ? 'border-red-200 bg-red-50 text-red-600 focus:border-red-500 ring-4 ring-red-50' 
                        : digit 
                          ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100/50 text-purple-600' 
                          : 'border-gray-100 bg-gray-50/50 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-50'}`}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-1 w-1 rounded-full bg-red-500" />
                  <p className="text-sm font-bold text-red-500 uppercase tracking-wider text-[10px]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className={`group relative w-full overflow-hidden rounded-xl bg-gray-900 py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
                  ${!loading && otp.join("").length === 6 ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-xl shadow-purple-200/50' : 'bg-gray-900'}
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify Now
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>

              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-gray-500">
                  Didn&apos;t receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0}
                  className={`text-xs font-bold transition-all ${
                    timer > 0 ? "text-gray-300 cursor-not-allowed" : "text-purple-600 hover:text-purple-700 hover:underline"
                  }`}
                >
                  {timer > 0 ? `Resend Code in ${timer}s` : "Resend Code"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Secure Verification</p>
        </div>
      </div>
    </div>
  );
}
