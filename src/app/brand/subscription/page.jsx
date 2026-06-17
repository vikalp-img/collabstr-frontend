"use client";

import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Sparkles, ShieldCheck, Clock, Zap, Loader2, ArrowRight, Star } from "lucide-react";
import { theme } from "@/theme";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/PageLoader";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";
import ActivePlanDetailModal from "@/components/ActivePlanDetailModal";

const DEFAULT_PLANS = [
  {
    name: "Basic",
    price: { monthly: 0, yearly: 0 },
    blurb: "For brands exploring the marketplace",
    cta: "Get Started",
    fee: "10% marketplace fee",
    features: [
      { label: "Search influencers on the marketplace", included: true },
      { label: "Track live analytics", included: false },
      {
        label: "Advanced filters for age, ethnicity, language & more",
        included: false,
      },
      {
        label: "Chat & negotiate with creators before hiring",
        included: false,
      },
      { label: "Influencer engagement & audience reports", included: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 299, yearly: 149 },
    blurb: "Best for teams hiring every month",
    cta: "Get Started",
    fee: "No marketplace fee on hires",
    mostPopular: true,
    features: [
      { label: "Everything in Basic", included: true },
      { label: "Track live analytics for 5 posts at a time", included: true },
      {
        label: "Advanced filters for age, ethnicity, language and more",
        included: true,
      },
      { label: "Chat & negotiate with creators before hiring", included: true },
      { label: "20 influencer engagement & audience reports", included: true },
    ],
  },
  {
    name: "Premium",
    price: { monthly: 399, yearly: 199 },
    blurb: "For brands scaling creator programs",
    cta: "Get Started",
    fee: "5% marketplace fee",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Track live analytics for 15 posts at a time", included: true },
      { label: "Priority customer support", included: true },
      { label: "50 influencer engagement & audience reports", included: true },
    ],
  },
];

const PricingCard = ({ plan, billing, onPurchase, isPurchasing, isCurrentPlan, isLesserPlan }) => {
  const price = plan.price[billing];
  const isFree = price === 0;
  const isPopular = plan.mostPopular;



  return (
    <div
      className={`relative flex h-full flex-col gap-6 rounded-3xl border bg-white p-4 sm:p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${isPopular
        ? "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white border-gray-800"
        : "border-gray-200"
        }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] whitespace-nowrap">
          Most popular
        </div>
      )}

      <div className="space-y-2 text-center">
        <p className={`text-xs font-black uppercase tracking-[0.2em] ${isPopular ? "text-purple-300" : "text-gray-400"}`}>
          {plan.name}
        </p>
        <p
          className={`text-5xl font-black tracking-tight ${isPopular ? "text-white" : "text-gray-900"}`}
        >
          {isFree ? "Free" : `₹${price}`}
          {!isFree && <span className="text-lg font-bold opacity-60">/mo</span>}
        </p>
        {!isFree && billing === "yearly" && (
          <p className={`text-xs font-bold ${isPopular ? "text-purple-200/70" : "text-purple-600/70"}`}>
            Billed annually at ₹{(price * 12).toLocaleString()} / year
          </p>
        )}
        <p
          className={`text-sm font-medium leading-relaxed ${isPopular ? "text-gray-300" : "text-gray-500"}`}
        >
          {plan.blurb}
        </p>
      </div>

      <div
        className={`rounded-2xl border px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-center ${isPopular
          ? "border-white/10 bg-white/5 text-purple-200"
          : "border-purple-100 bg-purple-50/50 text-purple-700"
          }`}
      >
        {plan.fee}
      </div>

      <ul className="space-y-4 text-sm flex-1">
        {plan.features.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-4 transition-colors duration-200 ${feature.included
              ? isPopular
                ? "text-gray-100"
                : "text-gray-700"
              : "text-gray-400 line-through"
              }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${feature.included
                ? isPopular
                  ? "border-purple-400/50 bg-purple-500/40 text-white"
                  : "border-purple-100 bg-purple-50 text-purple-600"
                : "border-gray-200 bg-gray-50"
                }`}
            >
              {feature.included ? (
                <Check
                  className={`h-3 w-3 stroke-[3] ${isPopular ? "text-white" : "text-purple-600"}`}
                />
              ) : (
                <span className="block h-1.5 w-1.5 rounded-full bg-gray-300" />
              )}
            </span>
            <span className="leading-tight font-medium">
              {feature.limit && feature.limit > 0 && (
                <span className={`font-bold mr-1.5 ${isPopular ? "text-purple-300" : "text-purple-600"}`}>
                  {feature.limit}
                </span>
              )}
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <button
          disabled={isPurchasing || isLesserPlan}
          onClick={() => onPurchase(plan.id)}
          className={`w-full rounded-full px-6 py-3 text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${isCurrentPlan
            ? "bg-emerald-100 text-emerald-700 cursor-pointer border border-emerald-200 hover:bg-emerald-200 shadow-sm"
            : isLesserPlan
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none hover:shadow-none hover:-translate-y-0"
              : isPopular
                ? "bg-white text-gray-900 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
            }`}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              Current Plan
            </>
          ) : isLesserPlan ? (
            "Unavailable"
          ) : (
            plan.cta
          )}
        </button>
        <p
          className={`text-center text-xs ${isPopular ? "text-gray-300" : "text-gray-500"}`}
        >
          Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default function BrandSubscriptionPage() {
  const router = useRouter();
  const { user, loading: userLoading, fetchProfile } = useUser();
  const [billing] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isActiveDetailOpen, setIsActiveDetailOpen] = useState(false);
  const [activePlanData, setActivePlanData] = useState(null);

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (!token) {
        router.push("/login");
      } else if (role === "creator") {
        router.push("/creator/dashboard");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const plansResponse = await apiWithoutAuth.get(API_ENDPOINTS.PLANS);
        const plansData = plansResponse.data?.data?.plans;

        if (plansData && Array.isArray(plansData)) {
          const mappedPlans = plansData.map(plan => ({
            id: plan._id,
            name: plan.name || "Unnamed Plan",
            price: {
              monthly: plan.price || 0,
              yearly: Math.round((plan.price || 0) / 2)
            },
            blurb: plan.description || "",
            cta: plan.cta_text || "Get Started",
            fee: plan.fee_text || (plan.platform_fee_percentage !== undefined ? (plan.platform_fee_percentage === 0 ? "No marketplace fee" : `${plan.platform_fee_percentage}% marketplace fee`) : (plan.price === 0 ? "10% marketplace fee" : "No marketplace fee")),
            mostPopular: plan.name === "Pro" || plan.name === "Standard",
            features: Array.isArray(plan.features) ? plan.features.map(f => ({
              label: f.value || f.featureId?.name || "Feature",
              limit: f.limit,
              included: true
            })) : []
          }));
          setPlans(mappedPlans);
        } else {
          setPlans(DEFAULT_PLANS);
        }
      } catch (error) {
        console.error("Failed to fetch plans data:", error);
        setPlans(DEFAULT_PLANS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePurchase = async (planId) => {
    if (!planId) return;

    setPurchasingPlanId(planId);
    try {
      const response = await apiWithAuth.post(API_ENDPOINTS.SUBSCRIPTION.PURCHASE, { planId });
      const message = response?.data?.message || "Successfully purchased subscription";

      toast.success(message);
      if (typeof fetchProfile === "function") {
        await fetchProfile();
      }

    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to purchase subscription. Please try again.";
      toast.error(errorMessage);
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const initiatePurchase = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const showActiveDetails = (plan) => {
    console.log({ plan }, "check is it clicking")
    setActivePlanData(plan);
    setIsActiveDetailOpen(true);
  };

  const heroStats = useMemo(
    () => [
      { label: "Brands trust", value: "330k+", icon: ShieldCheck },
      { label: "Avg. response time", value: "< 2 hrs", icon: Clock },
      { label: "Collaboration success", value: "94%", icon: Zap },
    ],
    [],
  );

  if (userLoading) {
    return <PageLoader message="Loading subscription details..." />;
  }

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Subscription Plans
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                Supercharge Your <span className={theme.colors.textGradient}>Brand</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-2xl text-sm md:text-lg">
                Flexible plans for every stage of your creator program. Start free and upgrade when you are ready to scale your influencer marketing.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="rounded-xl bg-white p-2.5 text-purple-600 shadow-sm border border-gray-100">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
              <p className="text-gray-500 font-bold">Loading awesome plans...</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan, idx) => {
                const currentPlanId = user?.activeSubscription?.planId?._id;
                const isCurrentPlan = currentPlanId === plan.id;
                const currentPlan = plans.find((p) => p.id === currentPlanId);
                const isLesserPlan = currentPlan ? plan.price.monthly < currentPlan.price.monthly : false;
                return (
                  <PricingCard
                    key={plan.name}
                    plan={plan}
                    billing={billing}
                    onPurchase={isCurrentPlan ? () => showActiveDetails(plan) : () => initiatePurchase(plan)}
                    isPurchasing={purchasingPlanId === plan.id}
                    isCurrentPlan={isCurrentPlan}
                    isLesserPlan={isLesserPlan}
                  />
                );
              })}
            </div>
          )}

          <div className="mt-20 rounded-[32px] bg-gray-900 p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px]" />

            <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-purple-300">
                  <ShieldCheck className="h-4 w-4" /> Why brands pick us
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  Built for collaboration <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">without risk</span>
                </h2>
                <p className="text-lg text-gray-300 font-medium">
                  Secure payments, vetted creators, and analytics in one place. Your team stays fast and compliant while creators deliver on time.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Escrow-style payments",
                    "Vetted influencers",
                    "Advanced analytics",
                    "Team permissions",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white leading-none">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-sm font-bold text-gray-100">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm space-y-8">
                <h3 className="text-2xl font-black text-white">
                  Need a custom solution?
                </h3>
                <p className="text-gray-300 font-medium leading-relaxed">
                  Our team will help you set up your first collaboration, shortlist creators, and share best practices to get results in week one.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handlePurchase(selectedPlan?.id)}
        title="Upgrade to Pro"
        message={`Are you sure you want to subscribe to the ${selectedPlan?.name} plan? You can cancel your subscription at any time.`}
        confirmText="Confirm Subscription"
        cancelText="Maybe Later"
      />
      <ActivePlanDetailModal
        isOpen={isActiveDetailOpen}
        onClose={() => setIsActiveDetailOpen(false)}
        plan={activePlanData}
      />
    </main>
  );
}
