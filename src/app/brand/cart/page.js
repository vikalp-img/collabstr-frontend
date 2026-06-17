"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Shield,
  CheckCircle2,
  Package,
  Clock,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationModal from "@/components/ConfirmationModal";
import PageLoader from "@/components/PageLoader";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { theme } from "@/theme";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    loading: cartLoading,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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

  if (cartLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Fetching your cart..." />
        <Footer />
      </main>
    );
  }

  const handleRemoveItem = (itemId) => {
    setRemovingId(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingId(null);
    }, 300);
  };

  const platformFeePercentage = user?.activeSubscription?.planId?.platform_fee_percentage ?? 5;
  const platformFee = cartTotal * (platformFeePercentage / 100);
  const grandTotal = cartTotal + platformFee;

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />

        <section className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            {/* Empty cart illustration */}
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="w-14 h-14 shrink-0 text-purple-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-black">0</span>
              </div>
            </div>

            <h1 className="text-3xl font-black mb-3 tracking-tight">
              Your cart is empty
            </h1>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed font-medium">
              Discover amazing creators and add their services to your cart to get started.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
              <Link
                href="/creators"
                className={theme.buttons.primary}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Hire Creators
              </Link>
              <Link
                href="/brand/home"
                className={`${theme.buttons.secondary} px-12 py-3.5 text-[15px] min-w-[220px] h-14`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-purple-50/20 to-white">
      <Header />

      <section className="flex-1 pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-3">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Your Cart
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Shopping Cart
              </h1>
              <p className="mt-2 text-gray-500 text-base sm:text-lg">
                {cartCount} {cartCount === 1 ? "service" : "services"} ready for checkout
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm group transition-colors"
              >
                <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
                Continue Browsing
              </Link>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cart Content */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`group rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300 ${
                    removingId === item.id
                      ? "opacity-0 scale-95 translate-x-8"
                      : "opacity-100 scale-100 translate-x-0"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Creator Avatar */}
                    <Link
                      href={`/creators/${item.creatorId}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all">
                        <Image
                          src={item.creatorAvatar}
                          alt={item.creatorName}
                          className="w-full h-full object-cover"
                         title="Image"  width={800}  height={800}  fetchPriority="auto" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <Link
                            href={`/creators/${item.creatorId}`}
                            className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {item.creatorName}
                          </Link>
                          <h3 className="text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                            {item.serviceTitle}
                          </h3>
                          {item.serviceDescription && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.serviceDescription}
                            </p>
                          )}
                          {item.platform && (
                            <span className="inline-flex mt-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/50">
                              {item.platform}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          <p className="text-2xl font-black text-gray-900 tracking-tight">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>

                        </div>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors group/remove"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover/remove:scale-110 transition-transform" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
              {/* Summary Card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl ring-1 ring-gray-100">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 shrink-0 text-purple-600" />
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-gray-600 font-medium truncate">
                          {item.serviceTitle}
                        </span>

                      </div>
                      <span className="text-gray-900 font-bold flex-shrink-0 ml-2">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      Platform Fee
                      <span className="text-[10px] text-gray-400">({platformFeePercentage}%)</span>
                    </span>
                    <span className="text-gray-900 font-bold">
                      ₹{platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-purple-100 mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-[15px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  PROCEED TO CHECKOUT
                </button>

                <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
                  Secure payment powered by escrow
                </p>
              </div>

              {/* Trust Badges */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-50 text-green-600">
                      <Shield className="h-4 w-4 shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Secure Escrow Payments</p>
                      <p className="text-xs text-gray-400">Funds released on approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Quality Guaranteed</p>
                      <p className="text-xs text-gray-400">Dispute resolution support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Clock className="h-4 w-4 shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Timely Delivery</p>
                      <p className="text-xs text-gray-400">Clear deadlines & milestones</p>
                    </div>
                  </div>
                </div>
              </div>


            </aside>
          </div>
        </div>
      </section>

      <Footer />

      {/* Clear Cart Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearCart}
        title="Clear Cart"
        message={`Are you sure you want to remove all ${cartCount} items from your cart?`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        isDanger={true}
      />

      {/* Checkout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={async () => {
          setIsPlacingOrder(true);
          try {
            await placeOrder();
            router.push("/brand/orders");
          } catch (err) {
            console.error("CartPage: Placement failed", err);
          } finally {
            setIsPlacingOrder(false);
            setIsCheckoutModalOpen(false);
          }
        }}
        title="Confirm Your Order"
        message="Please review your order details before final confirmation."
        confirmText={isPlacingOrder ? "Placing Order..." : "Confirm & Pay"}
        cancelText="Back to Cart"
      >
        <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">{item.serviceTitle}</p>

                </div>
                <p className="font-black text-gray-900 ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-dashed border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span>Platform Fee ({platformFeePercentage}%)</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-black text-gray-900">Final Total</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="rounded-xl bg-purple-50 p-3 flex items-start gap-3 border border-purple-100/50">
            <Shield className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
            <p className="text-[10px] font-bold text-purple-700 leading-tight">
              Your payment will be held securely in escrow until the creator delivers the work.
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </main>
  );
}
