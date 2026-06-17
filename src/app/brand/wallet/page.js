"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  ArrowUpRight,
  AlertCircle,
  Loader2,
  TrendingUp,
  History,
  Plus,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Receipt,
  Info,
  X
} from "lucide-react";

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

export default function BrandWalletPage() {
  const router = useRouter();
  const { user } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.TRANSACTIONS, { 
        params: { limit: 5 } 
      });
      const data = response?.data?.data || response?.data;
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
        <Header />
        <PageLoader message="Loading your wallet data..." />
        <Footer />
      </main>
    );
  }

  const handleAddFunds = () => {
    setIsDepositModalOpen(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setIsDepositing(true);
      const response = await apiWithAuth.post(API_ENDPOINTS.USER.WALLET_ADD, { amount });
      
      if (response?.data?.success) {
        toast.success(`Successfully deposited ₹${amount.toFixed(2)} into your wallet!`);
        setIsDepositModalOpen(false);
        setDepositAmount("");
        fetchWalletData(); // Refresh balance
        fetchTransactions(); // Refresh transactions
      } else {
        toast.error(response?.data?.message || "Failed to add funds.");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      toast.error("An error occurred during the transaction. Please try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleExportStatement = async () => {
    try {
      setIsExporting(true);
      // Fetch all transactions (setting a high limit)
      const response = await apiWithAuth.get(API_ENDPOINTS.USER.TRANSACTIONS, { 
        params: { limit: 1000 } 
      });
      const data = response?.data?.data || response?.data;
      const allTransactions = data?.transactions || [];

      if (allTransactions.length === 0) {
        toast.error("No transactions found to export.");
        return;
      }

      // Create CSV content
      const headers = ["Description", "Transaction ID", "Date", "Amount", "Type", "Status"];
      const rows = allTransactions.map(tx => [
        `"${getSourceLabel(tx.source)}"`,
        `"${tx.transactionId || tx.id}"`,
        `"${new Date(tx.date || tx.createdAt).toLocaleDateString()}"`,
        tx.amount.toFixed(2),
        tx.type,
        tx.status || tx.paymentStatus
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `wallet_statement_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export statement.");
    } finally {
      setIsExporting(false);
    }
  };

  const walletStats = [
    {
      title: "Current Balance",
      value: `₹${Number(walletData?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
      info: "Funds available for your next collaboration"
    },
    {
      title: "Total Spent",
      value: `₹${Number(walletData?.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      info: "Total lifetime spend on creators"
    }
  ];

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />

      {/* Hero Header */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-12 border-b border-gray-100 bg-white">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 lg:px-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-sm border border-purple-200 uppercase tracking-wider">
                <Wallet className="h-3.5 w-3.5" /> Financial Dashboard
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Wallet</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm md:text-base">
                Manage your funds, track collaboration expenses, and download receipts for all your collaborations in one place.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                onClick={handleAddFunds}
                className="group flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 shadow-xl shadow-gray-200"
              >
                <Plus className="h-5 w-5" />
                Add Funds
              </button>

            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0 space-y-8">
          
          {/* Main Info Card for low balance */}
          {(Number(walletData?.balance || 0) < 50 && !loading) && (
            <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Low balance alert</h3>
                    <p className="text-gray-600 font-medium text-sm">
                      Your balance is currently low. Add funds to ensure your active collaborations continue running smoothly.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleAddFunds}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 transition shadow-lg shrink-0"
                >
                  Quick Recharge
                </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {walletStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-50 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className={`inline-flex rounded-2xl ${stat.bg} p-4 ${stat.color} mb-6`}>
                   <stat.icon className="h-7 w-7" />
                </div>
                
                <div>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                   <h3 className="mt-2 text-4xl font-black text-gray-900">
                     {loading ? (
                       <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-100" />
                     ) : (
                       stat.value
                     )}
                   </h3>
                   <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-bold bg-gray-50 p-2 rounded-lg">
                      <Info className="h-3 w-3" />
                      {stat.info}
                   </div>
                </div>

                {/* Background decorative path */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <stat.icon className="h-32 w-32" />
                </div>
              </div>
            ))}
          </div>

          {/* Transactions UI */}
          <div className="rounded-[40px] border border-gray-100 bg-white shadow-2xl overflow-hidden p-2">
            <div className="bg-gray-50/50 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 rounded-t-[38px]">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-purple-600">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-gray-900">Billing History</h3>
                     <p className="text-sm text-gray-500 font-medium">Detailed tracking of all deposits and payouts.</p>
                  </div>
               </div>
               
               <button 
                 onClick={handleExportStatement}
                 disabled={isExporting}
                 className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-wait"
               >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Receipt className="h-4 w-4" />
                  )}
                  {isExporting ? "Exporting..." : "Export Statement"}
               </button>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
               {transactionsLoading ? (
                 <PageLoader message="Loading history..." />
               ) : (
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-gray-50">
                          <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Description</th>
                          <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Date</th>
                          <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Amount</th>
                          <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {transactions?.length > 0 ? (
                         transactions.map((tx, idx) => (
                           <tr key={idx} className="hover:bg-purple-50/30 transition-all group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                                       tx.type === 'debit' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                                    } shadow-sm`}>
                                       {tx.type === 'debit' ? <ArrowUpRight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-gray-900">{getSourceLabel(tx.source) || (tx.type === 'debit' ? 'Creator Payout' : 'Wallet Deposit')}</p>
                                       <p className="text-xs text-gray-500 font-bold tracking-tight">Ref: {tx.transactionId || tx.id}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-bold text-gray-600">{new Date(tx.date || tx.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <p className={`text-base font-black ${tx.type === 'debit' ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {tx.type === 'debit' ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                                 </p>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                                    tx.paymentStatus === 'success' || tx.status === 'completed' || tx.status === 'success'
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : tx.paymentStatus === 'pending' || tx.status === 'pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                 }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${
                                       tx.paymentStatus === 'success' || tx.status === 'completed' || tx.status === 'success' ? 'bg-emerald-500' : tx.paymentStatus === 'pending' || tx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    {tx.paymentStatus || tx.status || 'Pending'}
                                 </span>
                              </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                            <td colSpan="4" className="px-8 py-24 text-center">
                               <div className="flex flex-col items-center gap-4">
                                  <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 border border-gray-100">
                                     <CreditCard className="h-10 w-10" />
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-lg font-black text-gray-900">No transactions recorded</p>
                                     <p className="text-sm text-gray-500 font-medium">Your wallet activity history will appear here.</p>
                                  </div>
                                  <button 
                                    onClick={handleAddFunds}
                                    className="mt-4 text-purple-600 font-bold text-sm hover:underline"
                                  >
                                    Add your first fund deposit
                                  </button>
                               </div>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               )}

               {transactions?.length > 0 && (
                 <div className="p-6 border-t border-gray-50 flex justify-center">
                    <button 
                      onClick={() => router.push('/brand/transactions')}
                      className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      View All Activity
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                 </div>
               )}
            </div>
          </div>
          
          {/* Bottom Security Info */}
          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-10 text-white relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                   <ShieldCheck className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-4">
                   <h3 className="text-2xl font-black leading-tight text-white">Secure Payments & <br/>Escrow Protection</h3>
                   <p className="text-gray-400 font-medium text-sm leading-relaxed">
                      All your transactions are protected. Funds are held securely in escrow and only released to creators after you approve their work submissions.
                   </p>
                   <div className="pt-4 flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-black text-purple-200/60 tracking-widest leading-none">
                         Trusted by 20k+ <br/> active brands
                      </span>
                   </div>
                </div>
             </div>

             <div className="bg-purple-100 rounded-[40px] p-10 flex flex-col justify-between border border-purple-200 relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Need assistance with billing?</h3>
                  <p className="text-purple-700/80 font-medium text-sm leading-relaxed">
                     Our finance team is here to help you with invoice requests, payment failures, or large wire transfers for enterprise accounts.
                  </p>
                  <Link href="/support">
                    <button className="bg-white text-gray-900 font-black px-10 py-3.5 rounded-2xl shadow-xl shadow-purple-200/50 hover:-translate-y-0.5 transition active:scale-95 text-sm">
                       Contact Support
                    </button>
                  </Link>
                </div>
                {/* Decorative lucide icon */}
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                   <CreditCard className="h-80 w-80" />
                </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Deposit Funds Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md scale-in-center overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all">
             <div className="relative p-8 text-center">
                <button 
                  onClick={() => setIsDepositModalOpen(false)}
                  className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  disabled={isDepositing}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <Plus className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">Deposit Funds</h3>
                <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                   Enter the amount you'd like to add to your wallet balance.
                </p>

                <form onSubmit={handleDeposit} className="space-y-6">
                   <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₹</div>
                      <input 
                        type="number"
                        step="0.01"
                        min="1"
                        autoFocus
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-5 pl-12 pr-6 text-2xl font-black text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                        disabled={isDepositing}
                        required
                      />
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      {[50, 100, 500].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt.toString())}
                          className="rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-600 hover:border-purple-600 hover:text-purple-600 transition active:scale-95"
                          disabled={isDepositing}
                        >
                          +₹{amt}
                        </button>
                      ))}
                   </div>

                   <button 
                    type="submit"
                    disabled={isDepositing || !depositAmount}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4.5 text-base font-bold text-white shadow-xl shadow-gray-200 transition-all hover:bg-black active:scale-95 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                   >
                     {isDepositing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing Transaction...
                        </>
                     ) : (
                        <>
                          Complete Deposit
                          <ChevronRight className="h-5 w-5" />
                        </>
                     )}
                   </button>
                   
                   <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                      <ShieldCheck className="h-3 w-3" />
                      Secure Instant Deposit
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}

    </main>
  );
}
