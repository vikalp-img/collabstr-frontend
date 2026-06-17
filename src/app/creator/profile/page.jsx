"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { useUser } from "@/context/UserContext";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import {
  Camera,
  MapPin,
  Languages,
  Tags,
  Link2,
  UserCircle2,
  Save,
  Instagram,
  Music2,
  Youtube,
  Twitter,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
  Plus,
  Trash2,
  Edit2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper to get platform icon
const getPlatformIcon = (key) => {
  switch (key?.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "tiktok":
      return Music2;
    case "youtube":
      return Youtube;
    case "twitter":
    case "x":
      return Twitter;
    default:
      return Link2;
  }
};

export default function CreatorProfilePage() {
  const router = useRouter();
  const { user, loading, fetchProfile } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userName: "",
    gender: "male",
    bio: "",
    title: "",
    ethnicity: "",
    languages: [],
    category: [],
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
  });
  const [allCategories, setAllCategories] = useState([]);
  const [currentSocialAccounts, setCurrentSocialAccounts] = useState([]);
  const [allPlatforms, setAllPlatforms] = useState([]);

  // social account modal state
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialFormData, setSocialFormData] = useState({
    _id: null,
    platform: "",
    handle: "",
    followers: "",
  });

  useEffect(() => {
    if (!user && !loading) {
      fetchProfile();
    }
  }, [user, loading, fetchProfile]);

  console.log({ loading, user });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiWithAuth.get(API_ENDPOINTS.CATEGORY.LIST);
        const cats =
          response.data?.categories ||
          response.data?.data ||
          (Array.isArray(response.data) ? response.data : []);
        setAllCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSocialAccounts = async () => {
      try {
        const response = await apiWithAuth.get(
          API_ENDPOINTS.SOCIAL_ACCOUNTS.LIST,
        );
        const data =
          response.data?.data ||
          (Array.isArray(response.data) ? response.data : []);
        setCurrentSocialAccounts(data);
      } catch (error) {
        console.error("Failed to fetch social accounts:", error);
      }
    };
    fetchSocialAccounts();
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await apiWithAuth.get(API_ENDPOINTS.PLATFORM.LIST);
        setAllPlatforms(response.data.data || response.data || []);
      } catch (error) {
        console.error("Failed to fetch platforms:", error);
      }
    };
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (user) {
      const creatorProfile = user.creatorProfile || user.profile || {};
      setFormData({
        userName: user.userName || user.name || "",
        gender: creatorProfile.gender || user.gender || "",
        bio: creatorProfile.bio || "",
        title: creatorProfile.title || "",
        ethnicity: creatorProfile.ethnicity || user.ethnicity || "",
        languages: creatorProfile.languages || [],
        category: creatorProfile.category || creatorProfile.categories || [],
        location: {
          address: creatorProfile.location?.address || "",
          city: creatorProfile.location?.city || "",
          state: creatorProfile.location?.state || "",
          country: creatorProfile.location?.country || "",
        },
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name, value) => {
    const arrayValues = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
    setFormData((prev) => ({ ...prev, [name]: arrayValues }));
  };

  const addCategory = (catName) => {
    if (!catName || formData.category.includes(catName)) return;
    setFormData((prev) => ({
      ...prev,
      category: [...prev.category, catName],
    }));
  };

  const fetchSocialAccounts = async () => {
    try {
      const response = await apiWithAuth.get(
        API_ENDPOINTS.SOCIAL_ACCOUNTS.LIST,
      );
      const data =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      setCurrentSocialAccounts(data);
    } catch (error) {
      console.error("Failed to fetch social accounts:", error);
    }
  };

  const handleSocialAccountAction = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        platform: socialFormData.platform,
        handle: socialFormData.handle,
        followers: Number(socialFormData.followers),
      };

      if (socialFormData._id) {
        // Edit
        await apiWithAuth.put(
          `${API_ENDPOINTS.SOCIAL_ACCOUNTS.LIST}/${socialFormData._id}`,
          payload,
        );
        toast.success("Social account updated!");
      } else {
        // Add
        await apiWithAuth.post(API_ENDPOINTS.SOCIAL_ACCOUNTS.LIST, payload);
        toast.success("Social account added!");
      }
      setIsSocialModalOpen(false);
      fetchSocialAccounts();
    } catch (error) {
      console.error("Social account action error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSocialAccount = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    setIsSaving(true);
    try {
      await apiWithAuth.delete(`${API_ENDPOINTS.SOCIAL_ACCOUNTS.LIST}/${id}`);
      toast.success("Social account deleted!");
      fetchSocialAccounts();
    } catch (error) {
      console.error("Social delete error:", error);
      toast.error("Failed to delete social account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiWithAuth.patch(
        API_ENDPOINTS.USER.EDIT_PROFILE,
        formData,
      );
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        fetchProfile(); // Refresh context data
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: local preview or basic type check
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const imageFormData = new FormData();
    imageFormData.append("profile_image", file);

    setIsUploadingImage(true);
    try {
      const response = await apiWithAuth.patch(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        imageFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.status === 200) {
        toast.success("Profile image updated successfully!");
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update profile image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (loading && !user) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Syncing your creative space..." />
        <Footer />
      </main>
    );
  }

  if (!user && !loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${theme.colors.pageBackground}`}
      >
        <div className="text-center max-w-md p-4 sm:p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Session Expired
          </h2>
          <p className="mt-3 text-gray-600">
            Please log in again to manage your creator profile.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-3.5 text-white font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const socialAccounts =
    currentSocialAccounts.length > 0
      ? currentSocialAccounts
      : user.socialAccounts || [];
  const services = user.services || [];
  const creatorProfile = user.creatorProfile || {};
  const profileImage =
    user.profile_image?.url ||
    user.profileImage ||
    user.avatar ||
    (String(creatorProfile?.gender || "").toLowerCase() === "male" || String(creatorProfile?.gender || "").toLowerCase() === "boy" || String(creatorProfile?.gender || "").toLowerCase() === "men"
      ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
      : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80");

  // Calculate total reach
  const totalFollowers = socialAccounts.reduce(
    (sum, acc) => sum + (acc.followers || 0),
    0,
  );
  const formattedReach =
    totalFollowers > 1000000
      ? (totalFollowers / 1000000).toFixed(1) + "M"
      : totalFollowers > 1000
        ? (totalFollowers / 1000).toFixed(1) + "K"
        : totalFollowers;

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}
    >
      <Header />

      <div className="flex-1 px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl space-y-10">
          {/* Page Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-gray-100 pb-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-600 border border-purple-100/50">
                <UserCircle2 className="h-3.5 w-3.5" />
                Live on Marketplace
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                Profile{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Settings
                </span>
              </h1>
              <p className="text-gray-500 max-w-lg text-lg leading-relaxed">
                Update your identity, location, and professional details to
                stand out to brands.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 active:scale-95 shadow-lg shadow-purple-200"
                   type="button">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 shadow-lg shadow-gray-200"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Profile Appearance */}
              <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="h-24 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="px-4 sm:px-6 pb-8 -mt-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-32 w-32 overflow-hidden rounded-3xl bg-white border-4 border-white shadow-xl ring-1 ring-gray-100">
                      <Image
                        src={profileImage}
                        alt={formData.userName}
                        className="h-full w-full object-cover"
                       title="Image"  width={800}  height={800}  fetchPriority="auto" />
                      <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-white text-[10px] font-bold opacity-0 transition-all hover:opacity-100 backdrop-blur-[2px]">
                        <Camera className="mr-2 h-4 w-4" />
                        Update Avatar
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleImageUpload}
                          accept="image/*"
                          disabled={isUploadingImage}
                        />
                      </label>
                      {isUploadingImage && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full">
                          <PageLoader message="" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-2 w-full">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                              Handle
                            </label>
                            <input
                              name="userName"
                              value={formData.userName}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              placeholder="johndoe123"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                              Tagline
                            </label>
                            <input
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              placeholder="e.g. Content Creator"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {formData.userName}
                          </h3>
                          <p className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-1 rounded-full inline-block">
                            {formData.title}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-gray-400 font-medium">
                        {user?.email}
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">
                          Total Reach
                        </p>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter">
                          {formattedReach}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">
                          Networks
                        </p>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter">
                          {socialAccounts.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Details Edit */}
              <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-8">
                {/* Gender & Ethnicity */}
                {isEditing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                        Gender
                      </label>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 !flex !h-[42px]">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                        Ethnicity
                      </label>
                      <input
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Asian"
                      />
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">
                      Office/Studio Location
                    </span>
                    <MapPin className="h-4 w-4 text-purple-500" />
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Address"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          placeholder="City"
                        />
                        <input
                          name="location.country"
                          value={formData.location.country}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-900 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                      {formData.location.city
                        ? `${formData.location.city}, ${formData.location.country}`
                        : "Global Creator"}
                    </p>
                  )}
                </div>

                {/* Content Taxonomy */}
                <div className="space-y-6 pt-4 border-t border-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">
                        Languages
                      </span>
                      <Languages className="h-4 w-4 text-purple-500" />
                    </div>
                    {isEditing ? (
                      <input
                        value={formData.languages.join(", ")}
                        onChange={(e) =>
                          handleArrayChange("languages", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        placeholder="English, Spanish (comma separated)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-50 text-purple-700 text-[11px] px-3 py-1.5 rounded-xl font-black border border-purple-100"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Bio / Professional Overview */}
              <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                    Professional Overview
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                    placeholder="Tell brands why you're the perfect partner..."
                  />
                ) : (
                  <p className="text-gray-500 leading-relaxed text-lg font-medium">
                    {formData.bio}
                  </p>
                )}
              </div>

              {/* Content Category Section */}
              <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                      Content Category
                    </h2>
                  </div>
                  {isEditing && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-pink-700 border border-pink-100 hover:bg-pink-100 transition-all active:scale-95">
                        <Plus className="h-3 w-3" /> Add Category
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 max-h-64 overflow-y-auto rounded-2xl p-2 shadow-xl border-gray-100 z-[100] bg-white"
                      >
                        {allCategories
                          .filter(
                            (c) => !formData.category.includes(c.name || c),
                          )
                          .map((c, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => addCategory(c.name || c)}
                              className="group flex cursor-pointer items-center rounded-xl px-3 py-2 text-[11px] font-bold text-gray-700 transition-all focus:bg-pink-50 focus:text-pink-700 outline-none"
                            >
                              {c.name || c}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.category.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-pink-50 text-pink-700 text-xs px-4 py-2 rounded-2xl font-bold border border-pink-100 flex items-center gap-2"
                    >
                      {cat}
                      {isEditing && (
                        <button
                          onClick={() => removeCategory(cat)}
                          className="hover:text-pink-900 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  ))}
                  {formData.category.length === 0 && (
                    <p className="text-gray-400 font-medium italic">
                      No categories selected.
                    </p>
                  )}
                </div>
              </div>

              {/* Connected Platforms */}
              <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                      Verified Channels
                    </h2>
                  </div>
                  {isEditing ? (
                    <button
                      onClick={() => {
                        setSocialFormData({
                          _id: null,
                          platform: allPlatforms[0]?.key || "",
                          handle: "",
                          followers: "",
                        });
                        setIsSocialModalOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-purple-700 border border-purple-100 hover:bg-purple-100 transition-all"
                    >
                      <Plus className="h-3 w-3" /> Connect Channel
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter text-green-700 border border-green-100">
                      <Check className="h-3 w-3" /> Fully Synced
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {socialAccounts.length > 0 ? (
                    socialAccounts.map((account) => {
                      const Icon = getPlatformIcon(account.platform?.key);
                      return (
                        <div
                          key={account._id}
                          className="group flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-transparent hover:border-purple-200 transition-all hover:bg-white hover:shadow-xl relative"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm transition-transform group-hover:scale-110">
                              <Icon className="h-5 w-5 text-gray-900" />
                            </div>
                            <div className="min-w-0 overflow-hidden">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                                {account.platform?.name}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-gray-900 truncate">
                                  {account.handle?.startsWith("@")
                                    ? account.handle
                                    : `@${account.handle}`}
                                </p>
                                {account.isVerified && (
                                  <div className="h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setSocialFormData({
                                      _id: account._id,
                                      platform:
                                        account.platform?.key ||
                                        account.platform?._id,
                                      handle: account.handle,
                                      followers: account.followers,
                                    });
                                    setIsSocialModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-100 transition-all"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteSocialAccount(account._id)
                                  }
                                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-right shrink-0">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                  Followers
                                </p>
                                <p className="font-black text-purple-600 text-lg leading-none mt-1">
                                  {account.followers?.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="sm:col-span-2 py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                      <p className="text-gray-400 font-bold italic">
                        No active channels discovered.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Catalog */}
              {!isEditing && (
                <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                        Active Packages
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <div
                          key={service._id}
                          className="group relative rounded-3xl border border-gray-100 p-8 transition-all hover:border-purple-200 hover:shadow-2xl bg-white flex flex-col justify-between h-full"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full ring-1 ring-purple-100">
                                {service.platform?.name}
                              </span>
                              <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                ₹{service.price}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
                              {service.serviceType?.title ||
                                service.title ||
                                "Custom Collaboration"}
                            </h4>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed italic line-clamp-3">
                              "
                              {service.description ||
                                "In-depth content creation designed to drive maximum brand ROI."}
                              "
                            </p>
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                  Turnaround
                                </span>
                                <span className="text-sm font-black text-gray-800 tracking-tight">
                                  {service.deliveryTime} Days
                                </span>
                              </div>
                            </div>
                           
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sm:col-span-2 py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold">
                          Launch your first package to start receiving bookings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Account Modal */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {socialFormData._id ? "Edit Channel" : "Connect Channel"}
              </h3>
              <button
                onClick={() => setIsSocialModalOpen(false)}
                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSocialAccountAction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                  Platform
                </label>
                <Select
                  required
                  value={socialFormData.platform}
                  onValueChange={(val) => setSocialFormData((prev) => ({ ...prev, platform: val }))}
                >
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 !flex !h-[48px]">
                    <SelectValue placeholder="Select Platform">
                      {socialFormData.platform ? (allPlatforms.find(p => p.key === socialFormData.platform)?.name || socialFormData.platform) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allPlatforms.map((p) => (
                      <SelectItem key={p._id} value={p.key}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                  Handle
                </label>
                <input
                  required
                  placeholder="@username"
                  value={socialFormData.handle}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({
                      ...prev,
                      handle: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                  Followers
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 10000"
                  value={socialFormData.followers}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({
                      ...prev,
                      followers: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="flex-1 px-6 py-3.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : socialFormData._id ? (
                    "Update"
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
