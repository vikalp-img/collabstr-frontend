"use client";

import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Sparkles, ShieldCheck, Clock, Zap, Loader2 } from "lucide-react";
import { theme } from "@/theme";
import { apiWithoutAuth, apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

const BILLING = [
  { id: "monthly", label: "Bill Monthly" },
  { id: "yearly", label: "Bill Yearly", badge: "Save 50%" },
];

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
      className={`relative flex h-full flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-4 sm:p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
        isPopular
          ? "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white border-gray-800"
          : ""
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
        className={`rounded-2xl border px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-center ${
          isPopular
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
            className={`flex items-start gap-4 transition-colors duration-200 ${
              feature.included
                ? isPopular
                  ? "text-gray-100"
                  : "text-gray-700"
                : "text-gray-400 line-through"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                feature.included
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
          onClick={isCurrentPlan ? undefined : () => onPurchase(plan.id)}
          disabled={isPurchasing || isLesserPlan}
          className={`w-full rounded-full px-6 py-3 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 ${
            isCurrentPlan
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default hover:translate-y-0 shadow-sm hover:shadow-sm"
              : isLesserPlan
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 hover:translate-y-0 shadow-none hover:shadow-none"
              : isPopular
              ? "bg-white text-gray-900"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          } ${isPurchasing ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isPurchasing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isCurrentPlan ? (
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

export default function PricingPage() {
  const router = useRouter();
  const { user, fetchProfile } = useUser();
  const [billing, setBilling] = useState("monthly");
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);

  const handlePurchase = async (planId) => {
    // Check authentication
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to purchase a plan");
      router.push("/login?redirect=/pricing");
      return;
    }

    // Check user role (optional but recommended)
    const role = localStorage.getItem("userRole");
    if (role !== "brand") {
      toast.error("Only brand accounts can purchase subscription plans");
      return;
    }

    try {
      setPurchasingId(planId);
      const response = await apiWithAuth.post(API_ENDPOINTS.SUBSCRIPTION.PURCHASE, { planId });
      
      if (response.data?.success) {
        toast.success(response.data?.message || "Successfully purchased plan!");
        if (typeof fetchProfile === "function") {
          await fetchProfile();
        }
        // Redirect to dashboard or refresh status
        router.push("/brand/home");
      } else {
        toast.error(response.data?.message || "Failed to purchase plan. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error?.response?.data?.message || "An error occurred during purchase");
    } finally {
      setPurchasingId(null);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.PLANS);
        const plansData = response.data?.data?.plans;
        
        if (plansData && Array.isArray(plansData)) {
          // Map API data to component structure
          const mappedPlans = plansData.map(plan => ({
            id: plan._id, // Store original API ID
            name: plan.name || "Unnamed Plan",
            price: {
              monthly: plan.price || 0,
              // If duration is monthly but user toggles yearly, we show 50% off of monthly * 12?
              // The original logic had Pro: 299(m)/149(y). 149 is approx 50% of 299.
              // So yearly = monthly / 2 (since badge says Save 50%)
              yearly: Math.round((plan.price || 0) / 2)
            },
            blurb: plan.description || "",
            cta: plan.cta_text || "Get Started",
            fee: plan.fee_text || (plan.platform_fee_percentage !== undefined ? (plan.platform_fee_percentage === 0 ? "No marketplace fee" : `${plan.platform_fee_percentage}% marketplace fee`) : (plan.price === 0 ? "10% marketplace fee" : "No marketplace fee")),
            mostPopular: plan.name === "Pro" || plan.name === "Standard", // Assuming Pro is most popular like before
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
        console.error("Failed to fetch plans:", error);
        setPlans(DEFAULT_PLANS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "Brands trust", value: "330k+", icon: ShieldCheck },
      { label: "Avg. response time", value: "< 2 hrs", icon: Clock },
      { label: "Collaboration success", value: "94%", icon: Zap },
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/40 to-white">
      <Header />

      <section className="relative px-4 pt-28 pb-16 md:pt-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Transparent pricing, no surprises
          </div>
          <h1 className={`${theme.typography.h1} text-gray-900`}>
            Supercharge your influencer marketing
          </h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-3xl mx-auto">
            Flexible plans for every stage of your creator program. Start free
            and upgrade when you are ready to scale.
          </p>

          <div className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-lg w-fit mx-auto mt-8">
            {BILLING.map((option) => (
              <button
                key={option.id}
                onClick={() => setBilling(option.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billing === option.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                    : "text-gray-600 hover:text-purple-700"
                }`}
              >
                {option.label}
                {option.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                    {option.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Pricing Plans Swiper for Mobile, Grid for Desktop */}
          <div className="relative mt-16 group/swiper">
            <div
              id="plans-swiper"
              className=" py-6  flex -mx-4 gap-6 px-4 overflow-x-auto md:mx-0 md:px-0 md:grid md:grid-cols-3 snap-x snap-mandatory scrollbar-hide pb-8 md:pb-0 scroll-smooth"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const containerWidth = e.currentTarget.offsetWidth;
                const cardWidth = containerWidth * 0.85; // 85% of viewport as defined in cards
                const index = Math.round(scrollLeft / (cardWidth + 24)); // 24 is gap-6
                if (index !== currentPlanIndex) {
                  setCurrentPlanIndex(index);
                }
              }}
            >
              {isLoading ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                  <p className="text-gray-500 font-medium font-sans">Loading awesome plans...</p>
                </div>
              ) : (
                plans.map((plan, idx) => {
                  const currentPlanId = user?.activeSubscription?.planId?._id;
                  const isCurrentPlan = currentPlanId === plan.id;
                  const currentPlan = plans.find((p) => p.id === currentPlanId);
                  const isLesserPlan = currentPlan ? plan.price.monthly < currentPlan.price.monthly : false;

                  return (
                    <div
                      key={plan.name}
                      className="w-[85%] min-w-[280px] flex-shrink-0 snap-start md:w-auto md:min-w-0"
                    >
                      <PricingCard 
                        plan={plan} 
                        billing={billing} 
                        onPurchase={handlePurchase}
                        isPurchasing={purchasingId === plan.id}
                        isCurrentPlan={isCurrentPlan}
                        isLesserPlan={isLesserPlan}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination dots (mobile only) */}
            <div className="flex justify-center gap-3 mt-4 md:hidden">
              {plans.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const container = document.getElementById("plans-swiper");
                    if (container) {
                      const containerWidth = container.offsetWidth;
                      const cardWidth = containerWidth * 0.85 + 24;
                      container.scrollTo({
                        left: idx * cardWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentPlanIndex === idx
                      ? "w-8 bg-purple-600 shadow-sm"
                      : "w-2.5 bg-purple-200"
                  }`}
                  aria-label={`Go to plan ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-4 rounded-3xl border border-purple-100 bg-white/70 p-4 sm:p-8 shadow-md md:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-start gap-4 rounded-2xl border border-gray-100 bg-white/80 p-5 md:justify-center"
              >
                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${theme.layout.section} bg-gradient-to-b from-white to-purple-50`}
      >
        <div
          className={`${theme.layout.container} grid gap-12 lg:grid-cols-2 items-center`}
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
              <ShieldCheck className="h-4 w-4" />
              Why brands pick us
            </div>
            <h2 className={theme.typography.h2}>
              Built for collaboration without risk
            </h2>
            <p className={theme.typography.subtitle}>
              Secure payments, vetted creators, and analytics in one place. Your
              team stays fast and compliant while creators deliver on time.
            </p>
            <ul className="space-y-4 text-gray-700">
              {[
                "Escrow-style payments release only after approvals",
                "Screen influencers by audience demographics and authenticity",
                "Share workspaces with teammates and keep permissions tight",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-pink-600 p-8 sm:p-12 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white blur-2xl" />
              <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-white blur-2xl" />
            </div>
            <div className="relative space-y-8">
              <h3 className="text-3xl font-bold text-white ">
                Ramp up with Pro onboarding
              </h3>
              <p className="text-lg text-purple-100/90 leading-relaxed">
                New to HireSphere? Our team will help you set up your first
                collaboration, shortlist creators, and share best practices to
                get results in week one.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Onboarding call",
                  "First brief template",
                  "Creator shortlist",
                  "Measurement checklist",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
