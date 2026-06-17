"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Mail, Briefcase, ShieldCheck, Edit2, Save, X, Loader2 } from "lucide-react";
import { theme } from "@/theme";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/PageLoader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

const validationSchema = Yup.object({
  fullname: Yup.string().required("Full name is required"),
  brandname: Yup.string().required("Company name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export default function BrandProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, fetchProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (!token) {
        router.push("/login");
      } else if (role !== "brand") {
        router.push(role === "creator" ? "/creator/dashboard" : "/login");
      }
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      fullname: user?.fullname || "",
      brandname: user?.brandname || "",
      email: user?.email || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsSaving(true);
      try {
        const response = await apiWithAuth.patch(API_ENDPOINTS.USER.EDIT_PROFILE, values);
        if (response.status === 200) {
          toast.success("Profile updated successfully!");
          setIsEditing(false);
          fetchProfile(); // Refresh context data
        }
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error(error?.response?.data?.message || "Failed to update profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
  });

  if (userLoading) {
    return <PageLoader message="Loading profile details..." />;
  }

  const getInputFieldClass = (name) => {
    const hasError = formik.touched[name] && formik.errors[name];
    return `w-full bg-gray-50 border ${hasError ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-500/10" : "focus:ring-purple-500/10"} transition-all`;
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <User className="h-3.5 w-3.5" /> Brand Identity
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                Your <span className={theme.colors.textGradient}>Brand</span> Profile
              </h1>
              <p className="text-gray-500 font-medium max-w-2xl text-sm md:text-lg">
                Manage your company identity and contact information on HireSphere.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      formik.resetForm();
                    }}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    onClick={formik.handleSubmit}
                    disabled={isSaving || !formik.dirty}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 active:scale-95 shadow-lg shadow-purple-200"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 shadow-lg"
                >
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 flex-1">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="space-y-12">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 shadow-sm">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500 font-medium">Full details associated with your brand account.</p>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Full Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <User className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</p>
                </div>
                {isEditing ? (
                  <div className="ml-6 space-y-1">
                    <input
                      name="fullname"
                      {...formik.getFieldProps("fullname")}
                      className={getInputFieldClass("fullname")}
                      placeholder="Your full name"
                    />
                    {formik.touched.fullname && formik.errors.fullname && (
                      <p className="text-[10px] text-red-500 font-bold">{formik.errors.fullname}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xl font-bold text-gray-900 ml-6 tracking-tight">{user?.fullname || "Not specified"}</p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <Briefcase className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company / Brand Name</p>
                </div>
                {isEditing ? (
                  <div className="ml-6 space-y-1">
                    <input
                      name="brandname"
                      {...formik.getFieldProps("brandname")}
                      className={getInputFieldClass("brandname")}
                      placeholder="Your brand or company name"
                    />
                    {formik.touched.brandname && formik.errors.brandname && (
                      <p className="text-[10px] text-red-500 font-bold">{formik.errors.brandname}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xl font-bold text-gray-900 ml-6 tracking-tight">{user?.brandname || "Not specified"}</p>
                )}
              </div>

              {/* Business Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <Mail className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Email</p>
                </div>
                {isEditing ? (
                  <div className="ml-6 space-y-1">
                    <input
                      name="email"
                      {...formik.getFieldProps("email")}
                      className={getInputFieldClass("email")}
                      placeholder="business@company.com"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-[10px] text-red-500 font-bold">{formik.errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xl font-bold text-gray-900 ml-6 tracking-tight">{user?.email || "Not specified"}</p>
                )}
              </div>
            </form>

            <div className="p-6 rounded-2xl bg-white/50 border border-purple-100 backdrop-blur-sm">
              <p className="text-xs text-purple-700 font-medium leading-relaxed">
                <span className="font-bold">Note:</span> These details are used for billing and communication purposes. {isEditing ? "Please ensure all information is accurate before saving." : "If you need to update any of this information, click the 'Edit Profile' button above."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
