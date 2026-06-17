"use client";

import {
  ArrowUpRight,
  IndianRupee,
  Clock3,
  ShoppingBag,
  Star,
  Briefcase,
  MessageSquare,
  Mail,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";

const statCards = [
  {
    title: "Total earnings",
    value: "₹12,480",
    change: "+12.5%",
    icon: IndianRupee,
    accent: "from-green-500/80 to-emerald-500/80",
  },
  {
    title: "Pending earnings",
    value: "₹1,320",
    change: "Pending",
    icon: Clock3,
    accent: "from-amber-400/80 to-orange-500/80",
  },
  {
    title: "Total orders",
    value: "248",
    change: "+8 this week",
    icon: ShoppingBag,
    accent: "from-indigo-500/80 to-purple-500/80",
  },
  {
    title: "Average rating",
    value: "4.9",
    change: "112 reviews",
    icon: Star,
    accent: "from-yellow-400/80 to-amber-400/80",
  },
  {
    title: "Active services",
    value: "6",
    change: "2 drafts",
    icon: Briefcase,
    accent: "from-blue-500/80 to-cyan-500/80",
  },
];

const recentOrders = [
  {
    id: "#ORD-2381",
    brand: "GlowUp Cosmetics",
    service: "UGC Video (30s)",
    amount: "₹450",
    status: "In progress",
    date: "Mar 14",
  },
  {
    id: "#ORD-2376",
    brand: "Peak Nutrition",
    service: "IG Story Set",
    amount: "₹320",
    status: "Delivered",
    date: "Mar 12",
  },
  {
    id: "#ORD-2369",
    brand: "MoveFit",
    service: "TikTok (60s)",
    amount: "₹600",
    status: "In review",
    date: "Mar 10",
  },
];

const recentMessages = [
  {
    from: "Lena @ GlowUp",
    excerpt: "Can we add one more product shot?",
    time: "2h ago",
  },
  {
    from: "Tom @ Peak Nutrition",
    excerpt: "Approved! Sending final payment.",
    time: "5h ago",
  },
  {
    from: "Sara @ MoveFit",
    excerpt: "Loved the first cut, tiny edit needed.",
    time: "1d ago",
  },
];

const recentReviews = [
  {
    brand: "Peak Nutrition",
    rating: 5,
    note: "Super fast turnaround and on-brand content.",
    time: "1d ago",
  },
  {
    brand: "GlowUp Cosmetics",
    rating: 5,
    note: "Great communication and quality visuals.",
    time: "3d ago",
  },
  {
    brand: "MoveFit",
    rating: 4,
    note: "Solid draft, minor tweaks needed but overall great.",
    time: "5d ago",
  },
];

export default function CreatorDashboardPage() {
  const { user, loading: userLoading, fetchProfile } = useUser();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await apiWithAuth.get(API_ENDPOINTS.USER.DASHBOARD);
        setDashboardData(response?.data?.data || response?.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleReRequestApproval = async () => {
    try {
      setIsRequestingApproval(true);
      await apiWithAuth.post(API_ENDPOINTS.USER.RE_REQUEST_APPROVAL);
      toast.success("Account approval request sent successfully!");
      fetchProfile();
    } catch (err) {
      console.error("Failed to re-request approval:", err);
      toast.error(err?.response?.data?.message || "Failed to send approval request.");
    } finally {
      setIsRequestingApproval(false);
    }
  };

  // Map API data to UI structure
  const stats = dashboardData?.stats || {};
  const statCards = [
    {
      title: "Total earnings",
      value: `₹${Number(stats.totalEarnings || 0).toLocaleString()}`,
      change: "Lifetime",
      icon: IndianRupee,
      accent: "from-green-500/80 to-emerald-500/80",
    },
    {
      title: "Pending earnings",
      value: `₹${Number(stats.pendingEarnings || 0).toLocaleString()}`,
      change: "In escrow",
      icon: Clock3,
      accent: "from-amber-400/80 to-orange-500/80",
    },
    {
      title: "Total orders",
      value: `${stats.totalOrders || 0}`,
      change: stats.newThisWeek ? `+${stats.newThisWeek} this week` : "Total orders",
      icon: ShoppingBag,
      accent: "from-indigo-500/80 to-purple-500/80",
    },
    {
      title: "Average rating",
      value: `${stats.averageRating || "0.0"}`,
      change: `${stats.reviewCount || 0} reviews`, // Changed from reviewCount
      icon: Star,
      accent: "from-yellow-400/80 to-amber-400/80",
    },
    {
      title: "Services",
      value: `${stats.activeServices || 0}`,
      change: `${stats.draftServices || 0} drafts`,
      icon: Briefcase,
      accent: "from-blue-500/80 to-cyan-500/80",
    },
  ];

  // Map recent orders
  const recentOrders = (dashboardData?.recentOrders || []).map(order => ({
    id: order.displayOrderId || order.orderId,
    brand: order.brandName || "Brand",
    service: order.serviceTitle || "Service",
    amount: `₹${Number(order.totalPrice || 0).toLocaleString()}`,
    status: (order.status || "Pending").charAt(0).toUpperCase() + (order.status || "Pending").slice(1),
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A"
  }));

  const recentMessages = dashboardData?.recentMessages || []; // Fallback if added later
  const recentReviews = dashboardData?.recentReviews || []; // Fallback if added later

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}
    >
      <Header />

      <div className="flex-1 w-full pt-28 pb-24">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0 space-y-12">
          {/* Page header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-purple-600">
                Creator dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                Welcome back, {user?.name || user?.username || "Creator"}
              </h1>
              <p className="text-gray-600 mt-2">
                Track your performance, manage orders, and stay close to your
                brands.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/creator/services")}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Create new service
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </button>
              <button
                onClick={() => {
                  if (
                    user?.isStatus === false ||
                    user?.isStatus === undefined
                  ) {
                    toast.error("Please complete your KYC before withdrawing.");
                    router.push("/creator/kyc");
                  } else {
                    router.push("/creator/wallet");
                  }
                }}
                className="rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 hover:border-purple-200 hover:bg-purple-50 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Approval Status Alert */}
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Approval Status */}
            {!userLoading && user && Number(user.approvalStatus) === 0 ? (
              <div className="flex items-center gap-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 p-5 text-amber-800 shadow-sm backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 leading-none focus:outline-none">
                    Profile Under Review
                  </p>
                  <p className="text-sm text-amber-700/90 mt-1.5 focus:outline-none">
                    Your profile is currently under review by our admin team.
                    You'll be notified via email once your account is active.
                  </p>
                </div>
              </div>
            ) : !userLoading && user && Number(user.approvalStatus) === 2 ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50/50 border border-red-200/60 p-5 text-red-800 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 leading-none focus:outline-none">
                      Profile Rejected
                    </p>
                    <p className="text-sm text-red-700/90 mt-1.5 focus:outline-none">
                      {user.rejectReason ||
                        "Your profile has been rejected. Please update your profile information and try again."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReRequestApproval}
                  disabled={isRequestingApproval}
                  className="shrink-0 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                >
                  {isRequestingApproval ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      Re-request Approval
                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            ) : null}

            {/* KYC Status */}
            {!userLoading && user && user.user_verify?.bank_verify !== 1 && (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 p-5 text-indigo-800 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                  </div>
                  <div>
                    <p className="font-bold text-indigo-900 leading-none focus:outline-none">
                      {user.user_verify?.bank_verify === 0
                        ? "KYC Under Review"
                        : "Complete Your KYC"}
                    </p>
                    <p className="text-sm text-indigo-700/90 mt-1.5 focus:outline-none">
                      {user.user_verify?.bank_verify === 0
                        ? "We are currently verifying your digital identity. You'll be able to withdraw soon."
                        : "Identification is required to withdraw your earnings to your bank account."}
                    </p>
                  </div>
                </div>
                {user.user_verify?.bank_verify !== 0 && (
                  <button
                    onClick={() => router.push("/creator/kyc")}
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Verify Now
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white shadow-lg animate-pulse p-5">
                   <div className="flex justify-between items-center">
                      <div className="space-y-3">
                         <div className="h-4 w-24 bg-gray-100 rounded-full" />
                         <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                         <div className="h-3 w-20 bg-gray-100 rounded-full" />
                      </div>
                      <div className="h-11 w-11 bg-gray-100 rounded-xl" />
                   </div>
                </div>
              ))
            ) : (
              statCards.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-20`}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">
                        {card.value}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{card.change}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shadow-inner">
                      <card.icon className="h-5 w-5 shrink-0" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Widgets */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Recent orders */}
            <div className="rounded-2xl bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent orders
                    </h2>
                    <p className="text-sm text-gray-500">
                      Latest brand bookings and their status.
                    </p>
                  </div>
                  <Linkish href="/creator/orders">View all</Linkish>
                </div>
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <PageLoader message="Gathering insights..." />
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order, idx) => (
                      <div
                        key={`${order.id}-${idx}`}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.brand}
                          </p>
                          <p className="text-sm text-gray-500">{order.service}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.id} · {order.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {order.amount}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-500 text-sm">
                      No orders yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reviews */}
            <div className="rounded-2xl bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      Recent reviews
                      <Star className="h-5 w-5 shrink-0 text-amber-400 fill-amber-400" />
                    </h2>
                    <p className="text-sm text-gray-500">
                      Feedback from your collaborations.
                    </p>
                  </div>
                  <Linkish href="/creator/reviews">View all</Linkish>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-xl border border-gray-100 bg-gray-50/20 animate-pulse" />
                    ))
                  ) : recentReviews.length > 0 ? (
                    recentReviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 p-4 flex flex-col gap-2 hover:border-purple-100 hover:bg-purple-50/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">
                            {rev.brand}
                          </p>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 shrink-0 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-amber-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {rev.note}
                        </p>
                        <p className="text-xs text-gray-400">{rev.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-500 text-sm">
                      No reviews yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            {/* <div className="rounded-2xl bg-white shadow-lg p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent messages
                </h2>
                <Mail className="h-5 w-5 shrink-0 text-purple-500" />
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  <PageLoader message="Fetching orders..." />
                ) : recentMessages.length > 0 ? (
                  recentMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-100 p-3 hover:border-purple-100 hover:bg-purple-50/40 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {msg.from}
                      </p>
                      <p className="text-sm text-gray-600">{msg.excerpt}</p>
                      <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-gray-500 text-sm">
                    No recent messages.
                  </div>
                )}
              </div>
            </div> */}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

const Linkish = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-semibold text-purple-600 hover:text-purple-500 transition-colors"
  >
    {children}
  </a>
);
