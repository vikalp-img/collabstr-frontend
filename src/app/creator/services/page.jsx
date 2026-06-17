"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationModal from "@/components/ConfirmationModal";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import {
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  IndianRupee,
  Timer,
  ImageIcon,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Loader2,
  Package,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLoader from "@/components/PageLoader";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null);

  const [socialPlatformOptions, setSocialPlatformOptions] = useState([]);
  const [dynamicServices, setDynamicServices] = useState({});

  const [draft, setDraft] = useState({
    platform: "",
    serviceType: "",
    description: "",
    deliveryTime: "",
    price: "",
    quantity: 1,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiWithAuth.get(API_ENDPOINTS.SERVICE.LIST);
      const data = response?.data?.data || response?.data || [];
      if (Array.isArray(data)) {
        const mappedServices = data.map((s) => {
          const st = s.serviceType || s.title || "";
          const pf = s.platform || s.platformKey || "";

          // Capturing name if it's already an object, to avoid showing IDs on initial load
          const stName =
            typeof st === "object" ? st.name || st.title || "" : "";
          const pfName =
            typeof pf === "object" ? pf.name || pf.title || "" : "";

          return {
            id: s._id || s.id,
            serviceType:
              typeof st === "object" ? st._id || st.id || String(st) : st,
            serviceTypeName: stName,
            platform:
              typeof pf === "object" ? pf._id || pf.id || String(pf) : pf,
            platformName: pfName,
            description: s.description || "",
            price: s.price || "",
            deliveryTime: s.deliveryTime || s.delivery || "",
            quantity: s.quantity || 1,
            active: s.active !== undefined ? s.active : true,
            approvalStatus:
              s.approvalStatus === undefined ? 0 : s.approvalStatus,
          };
        });
        setServices(mappedServices);

        // Populate dynamicServices for all platforms present in the list
        const uniquePlatforms = [
          ...new Set(mappedServices.map((s) => s.platform).filter(Boolean)),
        ];
        uniquePlatforms.forEach((platformId) =>
          fetchServicesForPlatform(platformId),
        );
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await apiWithAuth.get(API_ENDPOINTS.PLATFORM.LIST);
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data)) {
          const formattedOptions = data.map((p) => ({
            id: typeof p === "string" ? p : p._id || p.id || String(p),
            name: typeof p === "string" ? p : p.name || p.title || String(p),
            key:
              typeof p === "string"
                ? p
                : p.key || p.name?.toLowerCase() || String(p).toLowerCase(),
          }));
          setSocialPlatformOptions(formattedOptions);
        }
      } catch (err) {
        console.error("Failed to load platforms", err);
      }
    };
    fetchPlatforms();
    fetchServices();
  }, []);

  const fetchServicesForPlatform = async (platformId) => {
    if (!platformId) return;
    
    const existing = dynamicServices[platformId];
    if (existing && existing.length > 0) return;

    try {
      const response = await apiWithAuth.get(`${API_ENDPOINTS.SERVICE.LIST}/${platformId}`);
      const data = response?.data?.data || response?.data || [];
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setDynamicServices((prev) => ({ ...prev, [platformId]: data }));
        }
      }
    } catch (err) {
      console.error(`Failed to fetch services for ${platformId}`, err);
    }
  };

  const getPlatformName = (platformId) => {
    if (!platformId) return "";
    const platform = socialPlatformOptions.find(
      (p) =>
        String(p.id).toLowerCase() === String(platformId).toLowerCase() ||
        String(p.key).toLowerCase() === String(platformId).toLowerCase(),
    );
    return platform ? platform.name : platformId;
  };

  const getServiceTypeName = (platformId, serviceId) => {
    if (!serviceId) return "";

    // If the ID doesn't look like a MongoDB ObjectId, it might already be the name
    if (
      typeof serviceId === "string" &&
      serviceId.length > 0 &&
      !/^[0-9a-fA-F]{24}$/.test(serviceId)
    ) {
      return serviceId;
    }

    const list = dynamicServices[platformId] || [];
    const service = list.find(
      (s) =>
        (typeof s === "object" &&
          String(s._id || s.id).toLowerCase() ===
            String(serviceId).toLowerCase()) ||
        (typeof s === "string" && s.toLowerCase() === serviceId.toLowerCase()),
    );

    if (typeof service === "object")
      return service.name || service.title || serviceId;
    return service || serviceId;
  };


  const handleDelete = (id) => {
    setServiceIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceIdToDelete) return;
    try {
      await apiWithAuth.delete(
        `${API_ENDPOINTS.SERVICE.LIST}/${serviceIdToDelete}`,
      );
      setServices((prev) => prev.filter((svc) => svc.id !== serviceIdToDelete));
      toast.success("Service deleted");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete service.");
    } finally {
      setIsDeleteModalOpen(false);
      setServiceIdToDelete(null);
    }
  };

  const handleAdd = async () => {
    if (!draft.serviceType || !draft.platform) {
      toast.error("Platform and Service Type are required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        platform: draft.platform,
        serviceType:
          getServiceTypeName(draft.platform, draft.serviceType) ||
          draft.serviceType,
        description: draft.description,
        deliveryTime: Number(draft.deliveryTime) || 0,
        price: Number(draft.price) || 0,
        quantity: Number(draft.quantity) || 1,
      };

      const response = await apiWithAuth.post(
        API_ENDPOINTS.SERVICE.LIST,
        payload,
      );
      const newServiceData = response?.data?.data || response?.data;

      const newService = {
        id: newServiceData?._id || newServiceData?.id || Date.now(),
        platform: draft.platform,
        serviceType: draft.serviceType,
        description: draft.description,
        price: draft.price,
        deliveryTime: draft.deliveryTime,
        quantity: draft.quantity,
        active: true,
        approvalStatus: 0,
      };

      setServices((prev) => [newService, ...prev]);
      setDraft({
        platform: "",
        serviceType: "",
        description: "",
        deliveryTime: "",
        price: "",
        quantity: 1,
      });
      toast.success("Service added successfully");
    } catch (err) {
      console.error("Add Service error", err);
      toast.error(
        err?.response?.data?.message || "Failed to add service via API.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}
    >
      <Header />

      <section className="relative px-4 pt-28 pb-12 md:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
            <ClipboardList className="h-4 w-4" /> Services
          </div>
          <h1 className={`${theme.typography.h1} text-gray-900`}>
            Manage your services
          </h1>
          <p className="text-lg text-gray-600 md:text-xl">
            Create, and edit offerings so brands can book you with confidence.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-xl border border-purple-50 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Add a service
                </p>
                <p className="text-sm text-gray-500">
                  Configure your platform offerings and pricing.
                </p>
              </div>
              <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                <Pencil className="h-3.5 w-3.5" /> New
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-6 items-start">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Platform
                </label>
                <Select
                  value={draft.platform}
                  onValueChange={(value) => {
                    setDraft((p) => ({
                      ...p,
                      platform: value,
                      serviceType: "",
                    }));
                    fetchServicesForPlatform(value);
                  }}
                >
                  <SelectTrigger className="w-full rounded-xl border border-gray-200 !h-[48px] px-4 focus:ring-purple-500/20 text-sm">
                    <SelectValue placeholder="Select Platform">
                      {draft.platform ? getPlatformName(draft.platform) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {socialPlatformOptions.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Service Type
                </label>
                <Select
                  value={draft.serviceType}
                  onValueChange={(val) =>
                    setDraft((p) => ({ ...p, serviceType: val }))
                  }
                  disabled={!draft.platform}
                >
                  <SelectTrigger className="w-full rounded-xl border border-gray-200 !h-[48px] px-4 focus:ring-purple-500/20 text-sm">
                    <SelectValue placeholder="Select Service">
                      {draft.serviceType ? getServiceTypeName(draft.platform, draft.serviceType) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(dynamicServices[draft.platform] || []).map((st) => {
                      const label =
                        typeof st === "string"
                          ? st
                          : st.name || st.title || String(st);
                      const value =
                        typeof st === "string"
                          ? st
                          : st._id || st.id || String(st);
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none h-[48px]"
                  placeholder="200"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none h-[48px]"
                  placeholder="1"
                  value={draft.quantity}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, quantity: e.target.value }))
                  }
                  min="1"
                />
              </div>

              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Delivery
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none h-[48px]"
                  placeholder="Days"
                  value={draft.deliveryTime}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, deliveryTime: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none h-[48px]"
                  placeholder="Describe your offer..."
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-1 flex items-end justify-end h-full">
                <button
                  onClick={handleAdd}
                  disabled={isSaving}
                  className="w-full flex h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                 type="button">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-purple-50 bg-white shadow-xl">
            {loading ? (
              <PageLoader message="Loading your services..." />
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="py-3 px-3 text-left font-semibold">
                      Service Type / Platform
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">
                      Prices & Qty
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">
                      Delivery
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="py-3 px-3 text-left font-semibold w-24">
                      Status
                    </th>
                    <th className="py-3 px-3 text-left font-semibold w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                {services.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-sm text-gray-500 bg-white"
                      >
                        No services yet. Add your first offer using the form
                        above.
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-purple-50/40">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-gray-900 border border-transparent px-2 py-1">
                            {svc.serviceTypeName ||
                              getServiceTypeName(svc.platform, svc.serviceType)}
                          </p>
                          <p className="text-xs text-gray-500 px-2 mt-0.5 uppercase tracking-wide font-bold">
                            {svc.platformName || getPlatformName(svc.platform)}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-2 py-1.5 w-max">
                              <IndianRupee className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 min-w-[40px]">
                                {svc.price}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-2 py-1.5 w-max">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 min-w-[40px]">
                                {svc.quantity}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-1.5">
                            <Timer className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500">
                              Del:
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                              {svc.deliveryTime}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="max-w-[250px] rounded-xl border border-gray-100 bg-gray-50/30 p-3 text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                            {svc.description || "No description provided."}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {svc.approvalStatus === 1 ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                              Approved
                            </span>
                          ) : svc.approvalStatus === 2 ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-2 items-start">
                            <button
                              onClick={() => handleDelete(svc.id)}
                              className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden xl:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setServiceIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </main>
  );
}
