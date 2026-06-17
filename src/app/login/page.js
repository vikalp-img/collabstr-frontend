"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { theme } from "@/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (token) {
        if (role === "creator") {
          router.push("/creator/dashboard");
        } else if (role === "brand") {
          router.push("/brand/home");
        } else {
          router.push("/");
        }
      }
    }
  }, [router]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await apiWithoutAuth.post(
          API_ENDPOINTS.USER.LOGIN,
          values,
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

        if (role === "creator") {
          router.push("/creator/dashboard");
        } else if (role === "brand") {
          router.push("/brand/home");
        } else {
          router.push("/");
        }
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        toast.error(apiMessage || "Unable to sign in. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main
      className={`min-h-screen flex flex-col relative ${theme.colors.pageBackground}`}
    >
      <Header />

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 h-96 w-96 ${theme.effects.blurOrbPurple}`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 h-96 w-96 ${theme.effects.blurOrbPink}`}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div>
            <div className="flex justify-center mb-6">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl shrink-0">
                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/Logo.png`} alt="HireSphere Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter your details to sign in.
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full rounded-xl border ${formik.touched.email && formik.errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"} py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`block w-full rounded-xl border ${formik.touched.password && formik.errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"} py-3 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full !rounded-xl ${theme.buttons.primary}`}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
