"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { 
  History, 
  Search, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

// Human-readable labels for transaction sources
const SOURCE_LABELS = {
  service_purchase: "Service Purchase",
  platform_commission: "Platform Commission",
  escrow_refund: "Escrow Refund",
  wallet_topup: "Wallet Top-up",
  wallet_deposit: "Wallet Deposit",
  payout: "Payout",
  escrow_release: "Escrow Release",
};

const getSourceLabel = (source) => SOURCE_LABELS[source] || source?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Transaction";

export default function CreatorTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 10;

  const fetchTransactions = async (page = 1, search = searchQuery, type = typeFilter) => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.transactionId = search;
      if (type && type !== "all") params.type = type;

      const response = await apiWithAuth.get(API_ENDPOINTS.USER.TRANSACTIONS, { params });
      const data = response?.data?.data || response?.data;

      setTransactions(data?.transactions || []);
      setStats(data?.stats || null);
      setTotalPages(data?.totalPages || 1);
      setTotalCount(data?.totalCount || 0);
      setCurrentPage(data?.page || page);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1, searchQuery, typeFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter]);

  // Pagination effect
  useEffect(() => {
    if (currentPage > 1) {
      fetchTransactions(currentPage, searchQuery, typeFilter);
    }
  }, [currentPage]);

  if (loading && transactions.length === 0) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Loading transaction history..." />
        <Footer />
      </main>
    );
  }

  const handleExportStatement = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    try {
      const headers = ["Transaction ID", "Description", "Date", "Time", "Type", "Amount (INR)", "Opening Balance", "Closing Balance", "Status"];
      const csvRows = [headers.join(",")];

      transactions.forEach(tx => {
        const row = [
          `"${tx.transactionId || ""}"`,
          `"${getSourceLabel(tx.source)}"`,
          `"${new Date(tx.createdAt).toLocaleDateString()}"`,
          `"${new Date(tx.createdAt).toLocaleTimeString()}"`,
          `"${tx.type || ""}"`,
          tx.amount || 0,
          tx.openingBalance || 0,
          tx.closingBalance || 0,
          `"${tx.paymentStatus || "pending"}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `statement_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Quiet mode - no success toast as per user request
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to export statement");
    }
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          <div className="mb-6">
            <button 
              onClick={() => router.push("/creator/wallet")}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Wallet
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 uppercase tracking-wider">
                <History className="h-3.5 w-3.5" /> Earnings History
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                My <span className={theme.colors.textGradient}>Transactions</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
                View your detailed financial activity, including earnings, escrow releases, and payouts.
              </p>
            </div>
            
            <button 
              onClick={handleExportStatement}
              className="flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 shadow-lg"
            >
              <Receipt className="h-5 w-5" />
              Export Statement
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Total Transactions</p>
                  <p className="text-2xl font-black text-gray-900">{stats.totalCount || totalCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Total Credit</p>
                  <p className="text-2xl font-black text-emerald-600">₹{(stats.totalCredit || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-red-50/50 rounded-2xl p-5 border border-red-100/50">
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Total Debit</p>
                  <p className="text-2xl font-black text-red-500">₹{(stats.totalDebit || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0 space-y-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by ID or source..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {["all", "credit", "debit"].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border ${
                    typeFilter === type 
                      ? "bg-purple-600 text-white border-purple-600" 
                      : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {type === "credit" ? "Earnings" : type === "debit" ? "Withdrawals" : "All Activity"}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions UI */}
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[32px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  <p className="text-sm font-bold text-gray-600">Updating transactions...</p>
                </div>
              </div>
            )}

            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tx ID</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Balance</th>
                      <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-purple-50/30 transition-all group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm ${
                                 tx.type === 'debit' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                 {tx.type === 'debit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                              </div>
                              <div className="min-w-[140px]">
                                 <p className="text-sm font-black text-gray-900">{getSourceLabel(tx.source)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-[11px] font-black text-gray-400 uppercase tracking-tight bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 w-fit">{tx.transactionId}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-gray-600">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                           <p className="text-[11px] font-bold text-gray-400">{new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className={`text-base font-black ${tx.type === 'debit' ? 'text-red-500' : 'text-emerald-600'}`}>
                              {tx.type === 'debit' ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                           </p>
                        </td>
                        <td className="px-8 py-6">
                           <div>
                             <p className="text-sm font-bold text-gray-900">₹{(tx.closingBalance || 0).toLocaleString()}</p>
                             <p className="text-[11px] font-bold text-gray-400">from ₹{(tx.openingBalance || 0).toLocaleString()}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                              tx.paymentStatus === 'success' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : tx.paymentStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                           }`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${
                                 tx.paymentStatus === 'success' ? 'bg-emerald-500' : tx.paymentStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              {tx.paymentStatus || 'Pending'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading && (
              <div className="py-24 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 border border-gray-100">
                  <Receipt className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">No transactions recorded</p>
                  <p className="text-sm text-gray-500 font-medium">Your financial history will appear here.</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="border-t border-gray-100">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalCount}
                itemsCount={transactions.length}
                label="transactions"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
