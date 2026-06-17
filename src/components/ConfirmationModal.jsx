"use client";

import { useEffect, useState, useCallback } from "react";
import { X, LogOut, Info } from "lucide-react";
import { theme } from "@/theme";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  children,
}) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 250);
  }, [onClose]);

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
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, close]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        animating
          ? "bg-gray-900/40 backdrop-blur-sm"
          : "bg-gray-900/0 backdrop-blur-0"
      }`}
      onClick={close}
    >
      {/* Modal card — uses same rounded-2xl + shadow-lg as theme.cards.base */}
      <div
        className={`relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 ease-out ${
          animating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-6"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent — matches theme primaryGradient (purple-600 → pink-600) */}
        <div className={`h-1 w-full ${theme.colors.primaryGradient}`} />

        {/* Theme blur orbs — same as theme.effects */}
        <div
          className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 ${theme.effects.blurOrbPurple}`}
        />
        <div
          className={`pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 ${theme.effects.blurOrbPink}`}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center px-8 pt-8 pb-7 text-center">
          {/* Close */}
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-300 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600 hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon — uses theme logoGradient */}
          <div
            className={`mb-5 flex h-16 w-16 items-center justify-center rounded-xl ${theme.effects.logoGradient} ring-8 ring-purple-50 shadow-lg`}
          >
            {isDanger ? (
              <LogOut className="h-7 w-7 text-white" />
            ) : (
              <Info className="h-7 w-7 text-white" />
            )}
          </div>

          {/* Title — same weight as theme.typography.h3 */}
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>

          {/* Message */}
          <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-gray-600">
            {message}
          </p>

          {children && (
            <div className="mt-6 w-full text-left">
              {children}
            </div>
          )}

          {/* Buttons */}
            <div className={`mt-7 flex w-full items-center gap-3 ${!cancelText ? 'justify-center' : ''}`}>
              {cancelText && (
                <button
                  type="button"
                  onClick={close}
                  className={`flex-1 ${theme.buttons.secondary}`}
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  close();
                }}
                className={`${!cancelText ? 'w-full' : 'flex-1'} ${theme.buttons.primary}`}
              >
                {confirmText}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
