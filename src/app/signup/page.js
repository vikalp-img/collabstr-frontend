"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Briefcase,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { theme } from "@/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  brandName: Yup.string().required("Brand name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions",
  ),
});

export default function BrandSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (token) {
        if (role === "creator") {
          router.push("/creator/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      brandName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          fullname: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email,
          password: values.password,
          brandname: values.brandName,
        };

        const response = await apiWithoutAuth.post(
          API_ENDPOINTS.USER.REGISTER_BRAND,
          payload,
        );

        const message =
          response?.data?.message || "Brand account registered successfully";
        toast.success(message);

        // Store token and role if provided
        const token = response?.data?.data?.token || response?.data?.token;
        const role =
          response?.data?.data?.role || response?.data?.role || "brand";

        if (token && typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userRole", role);
        }

        router.push("/brand/home");
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          "Unable to register brand. Please try again.";
        toast.error(apiMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getFieldClass = (name) => {
    const hasError = formik.touched[name] && formik.errors[name];
    return `block w-full rounded-xl border ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
    } py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`;
  };

  return (
    <main
      className={`min-h-screen flex flex-col relative ${theme.colors.pageBackground}`}
    >
      <Header />

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-1/4 h-96 w-96 ${theme.effects.blurOrbPurple}`}
        />
        <div
          className={`absolute bottom-0 left-1/4 h-96 w-96 ${theme.effects.blurOrbPink}`}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-lg space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl shrink-0">
                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/Logo.png`} alt="HireSphere Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Sign up as a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                brand
              </span>
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Find and hire top creators for your brand projects.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={getFieldClass("firstName")}
                    placeholder="Jane"
                    {...formik.getFieldProps("firstName")}
                  />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={getFieldClass("lastName")}
                    placeholder="Doe"
                    {...formik.getFieldProps("lastName")}
                  />
                </div>
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="brandName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Brand / Company Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="brandName"
                    name="brandName"
                    type="text"
                    required
                    className={getFieldClass("brandName")}
                    placeholder="Your Brand Name"
                    {...formik.getFieldProps("brandName")}
                  />
                </div>
                {formik.touched.brandName && formik.errors.brandName && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.brandName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={getFieldClass("email")}
                    placeholder="jane@company.com"
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={getFieldClass("password")}
                    placeholder="At least 6 characters"
                    {...formik.getFieldProps("password")}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={getFieldClass("confirmPassword")}
                    placeholder="Repeat your password"
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {formik.touched.terms && formik.errors.terms && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.terms}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className={`w-full !rounded-xl ${theme.buttons.primary} disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {formik.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Brand Account"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
            >
              Log in
            </Link>
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Are you a creator?
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <Link
              href="/creator/signup"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Sign up as a creator instead
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
