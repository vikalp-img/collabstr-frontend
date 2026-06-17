"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  IndianRupee, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  ShieldAlert, 
  ChevronRight, 
  CreditCard, 
  History, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Receipt
} from "lucide-react";
import Pagination from "@/components/Pagination";

// Human-readable labels for transaction sources
const SOURCE_LABELS = {
  service_purchase: "Service Purchase",
  platform_commission: "Platform Commission",
  escrow_refund: "Escrow Refund",
  wallet_topup: "Wallet Top-up",
  wallet_deposit: "Wallet Deposit",
  payout: "Payout",
};

const getSourceLabel = (source) => SOURCE_LABELS[source] || source?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Transaction";

export default function WalletPage() {
  const router = useRouter();
  const { user } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 10;

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.WALLET);
      setWalletData(response?.data?.data || response?.data);
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
      toast.error("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      setLoadingTransactions(true);
      const params = { page, limit: LIMIT };
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.TRANSACTIONS, { params });
      const data = response?.data?.data || response?.data;

      setTransactions(data?.transactions || []);
      setTotalPages(data?.totalPages || 1);
      setTotalCount(data?.totalCount || 0);
      setCurrentPage(data?.page || page);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      toast.error("Failed to load transaction history");
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions(1);
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      fetchTransactions(currentPage);
    }
  }, [currentPage]);

  if (loading) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Connecting to secure wallet..." />
        <Footer />
      </main>
    );
  }

  const handleWithdraw = () => {
    const kyc = user?.user_verify;
    
    // Check if KYC is not approved (1 is approved)
    if (!kyc || kyc.bank_verify !== 1) {
      if (kyc?.bank_verify === 0) {
        toast.info("Your bank verification is pending approval.");
      } else {
        toast.error("Please complete your identity verification to withdraw funds.");
        router.push("/creator/kyc");
      }
      return;
    }
    toast.info("Withdrawal functionality will be available soon!");
  };

  const stats = [
    {
      title: "Available Balance",
      value: `₹${Number(walletData?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      info: "Funds available for immediate withdrawal"
    },
    {
      title: "Pending Balance",
      value: `₹${Number(walletData?.pendingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      info: "Funds currently in escrow or processing"
    },
    {
      title: "Total Withdrawn",
      value: `₹${Number(walletData?.totalWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      color: "text-purple-600",
      bg: "bg-purple-50",
      info: "Total lifetime earnings withdrawn"
    }
  ];

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-8 md:pt-28 lg:px-0">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
            <Wallet className="h-4 w-4" /> Creator Wallet
          </div>
          <h1 className={`${theme.typography.h1} text-gray-900`}>
            Manage your earnings
          </h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-2xl mx-auto">
            Track your payments, monitor pending funds, and withdraw your hard-earned money with ease.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 lg:px-0">
        <div className="container mx-auto max-w-7xl space-y-8">
          
          {/* KYC Alert */}
          {user?.user_verify?.bank_verify !== 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">
                    {user?.user_verify?.bank_verify === 0 ? "KYC Verification Pending" : "KYC Verification Required"}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {user?.user_verify?.bank_verify === 0 
                      ? "Your documents are being reviewed by our team. This usually takes 24-48 hours."
                      : "To withdraw your balance to your bank account, please complete your identification process."}
                  </p>
                </div>
              </div>
              {user?.user_verify?.bank_verify !== 0 && (
                <button 
                  onClick={() => router.push("/creator/kyc")}
                  className="group flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 shadow-lg shadow-gray-200 shrink-0"
                >
                  Complete KYC
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-purple-50 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-2xl ${stat.bg} p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  {idx === 0 && !loading && (
                    <button 
                      onClick={handleWithdraw}
                      disabled={loading}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md transition ${
                        !loading && user?.user_verify?.bank_verify !== 1
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700"
                      } ${loading ? "opacity-50" : ""}`}
                     type="button">
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          {user?.user_verify?.bank_verify !== 1 && <CreditCard className="h-3 w-3" />}
                          {user?.user_verify?.bank_verify === 0 ? "Under Review" : user?.user_verify?.bank_verify === 1 ? "Withdraw" : "Verify to Withdraw"}
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="mt-1 text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400 font-medium">{stat.info}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transactions Section */}
          <div className="rounded-3xl border border-purple-50 bg-white shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <p className="text-sm text-gray-500">Your latest earnings and withdrawals.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push("/creator/transactions")}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-purple-600 hover:text-white transition-all shadow-sm border border-gray-100"
                  >
                    View All Transactions
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
            </div>

            <div className="overflow-x-auto relative">
              {loadingTransactions && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    <p className="text-sm font-bold text-gray-600">Updating activity...</p>
                  </div>
                </div>
              )}
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx._id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                            tx.type === 'debit' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {tx.type === 'debit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900">{getSourceLabel(tx.source)}</p>
                             <p className="text-[11px] font-bold text-gray-400 tracking-tight">Ref: {tx.transactionId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-sm font-bold text-gray-600">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <p className={`text-sm font-black ${tx.type === 'debit' ? 'text-red-500' : 'text-emerald-600'}`}>
                            {tx.type === 'debit' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                         </p>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && !loadingTransactions && (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                            <Receipt className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-base font-black text-gray-900">No recent activity</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {transactions.length > 5 && (
                <div className="p-4 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => router.push("/creator/transactions")}
                    className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    View all transactions
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Help Card */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <IndianRupee className="h-48 w-48" />
             </div>
              <div className="relative z-10 max-w-xl space-y-4">
                <h3 className="text-2xl md:text-3xl font-black leading-tight text-white">
                  How payments <span className="text-white/70">work?</span>
                </h3>
                <p className="text-purple-100 text-lg">
                  Once a brand approves your submission, the funds are moved from escrow to your available balance. You can then withdraw these funds to your linked bank account.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <button 
                    onClick={() => router.push("/creator/kyc")}
                    className="bg-white text-purple-700 font-bold px-6 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
                  >
                    Link Bank Account
                  </button>
                  <button className="bg-purple-500/30 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-purple-500/40 transition-colors border border-purple-400/30" type="button">
                    Contact Support
                  </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
