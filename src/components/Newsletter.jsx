"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await apiWithoutAuth.post(API_ENDPOINTS.LEADS.SUBSCRIBE, { email });
      if (response.data?.success) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(response.data?.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to subscribe. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-8 sm:p-16 border border-gray-700/50 shadow-2xl overflow-hidden relative">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Unlock Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Marketing Insights</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed font-medium">
              Join over 20,000+ marketers and creators getting our weekly roundup of the best tips, trends, and success stories.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-8 py-5 bg-gray-800/50 border border-gray-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium placeholder:text-gray-500 disabled:opacity-50"
              />
              <button 
                 type="submit"
                 disabled={isLoading}
                className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    Subscribing...
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-sm text-gray-500 font-medium">
              No spam, ever. Unsubscribe with one click anytime.
            </p>
          </div>
          {/* Abstract Design Element */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 pr-20">
            <div className="w-64 h-64 border-2 border-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-48 h-48 border-2 border-pink-500/20 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
