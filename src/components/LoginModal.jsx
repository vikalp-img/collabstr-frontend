"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { theme } from "@/theme";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useRouter } from "next/navigation";
import Link from "next/link";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await apiWithoutAuth.post(
          API_ENDPOINTS.USER.LOGIN,
          values
        );
        const message = response?.data?.message;
        const hasSuccessFlag = typeof response?.data?.success === "boolean";
        const isSuccess = hasSuccessFlag ? response?.data?.success : true;

        if (!isSuccess) {
          toast.error(message || "Unable to sign in. Please try again.");
          return;
        }

        const token = response?.data?.data?.token;
        const role = response?.data?.data?.role || response?.data?.role;

        if (typeof window !== "undefined") {
          if (token) localStorage.setItem("authToken", token);
          if (role) localStorage.setItem("userRole", role);
        }

        toast.success(message || "Logged in successfully");
        
        if (onSuccess) {
          onSuccess();
        }
        close();
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        toast.error(apiMessage || "Unable to sign in. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

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
      <div
        className={`relative w-full max-w-[450px] overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 ease-out ${
          animating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-6"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full ${theme.colors.primaryGradient}`} />

        <div className="relative p-8">
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
           type="button">
            <X className="h-5 w-5 shrink-0" />
          </button>

          <div className="mb-8 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${theme.effects.logoGradient} shadow-lg ring-8 ring-purple-50`}>
              <LogIn className="h-8 w-8 shrink-0 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to favorite creators and unlock more features.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-5 w-5 shrink-0 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  className={`block w-full rounded-xl border-2 py-3 pl-11 pr-4 text-sm transition-all focus:outline-none ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-100 bg-red-50/30 ring-red-500"
                      : "border-gray-100 bg-gray-50/30 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  }`}
                  placeholder="name@example.com"
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-5 w-5 shrink-0 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full rounded-xl border-2 py-3 pl-11 pr-11 text-sm transition-all focus:outline-none ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-100 bg-red-50/30 ring-red-500"
                      : "border-gray-100 bg-gray-50/30 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 shrink-0" /> : <Eye className="h-5 w-5 shrink-0" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 ${theme.colors.primaryGradient}`}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                onClick={close}
                className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
              >
                Sign up instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
