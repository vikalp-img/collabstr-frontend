"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail,
  ChevronDown,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { theme } from "@/theme";
import { toast } from "sonner";
import Link from "next/link";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";



const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left transition-all hover:text-purple-600"
      >
        <span className="text-base font-bold text-gray-900">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-600" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "billing_payments",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [footerLinks, setFooterLinks] = useState(null);

  useEffect(() => {
    const fetchFooterLinks = async () => {
      try {
        const res = await apiWithoutAuth.get(API_ENDPOINTS.FOOTER_LINKS.LIST);
        if (res.data?.success) {
          setFooterLinks(res.data.data);
        }
      } catch {
        // Silently fail — fallback to defaults
      }
    };
    fetchFooterLinks();
  }, []);

  const contactEmail = footerLinks?.email?.value || "support@hiresphere.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        issueCategory: formData.category,
        message: formData.message
      };

      const response = await apiWithoutAuth.post(API_ENDPOINTS.SUPPORT.CREATE, payload);
      
      setIsSubmitted(true);
      toast.success(response?.data?.message || "Support ticket created! We'll contact you within 24 hours.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        category: "billing_payments",
        message: ""
      });
    } catch (error) {
      console.error("Support ticket error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const faqs = [
    {
      question: "How does the wallet system work?",
      answer: "Your wallet stores funds for future collaborations. When you hire a creator, the funds are moved to escrow. They are only released once you approve the final content submission."
    },
    {
      question: "What is the marketplace fee?",
      answer: "By default, there is a 10% marketplace fee on all collaborations. Brands on Pro or Premium subscriptions enjoy reduced or zero marketplace fees depending on their plan."
    },
    {
      question: "How do I request a refund?",
      answer: "Refunds can be requested if a creator fails to deliver within the agreed timeframe. Funds in escrow are automatically eligible for refund if the order is cancelled by mutual agreement or through our support team."
    },
    {
      question: "Can I switch between Creator and Brand roles?",
      answer: "Currently, each account is tied to a specific role. If you want to use HireSphere as both a brand and a creator, you will need to create separate accounts with different email addresses."
    }
  ];

  return (
    <main className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 border-b border-gray-100 bg-white overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-50 blur-[100px] opacity-60" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-pink-50 blur-[100px] opacity-60" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-black text-purple-700 shadow-sm border border-purple-200 uppercase tracking-widest mb-6">
            <HelpCircle className="h-4 w-4" /> Help Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
            Support and <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Contact</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto text-sm md:text-lg">
            Have questions or need assistance? Our dedicated support team is here to help you with any inquiries or platform issues.
          </p>
        </div>
      </section>

      {/* Support Form & FAQ */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            
            {/* Contact Form */}
            <div className="relative overflow-hidden rounded-[40px] border border-gray-100 bg-white p-8 md:p-12 shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Submit a Ticket</h2>
                    <p className="text-sm text-gray-500 font-medium">Average response time: 4-6 hours</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Request Received</h3>
                    <p className="text-gray-500 font-medium mb-8">
                      Your ticket has been created and sent to our support queue. A representative will contact you soon.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all"
                    >
                      Send Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Jane Smith"
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-medium text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="jane@company.com"
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-medium text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Issue Category</label>
                        <select 
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-medium text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition-all appearance-none"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          <option value="billing_payments">Billing & Payments</option>
                          <option value="account_access">Account Access</option>
                          <option value="escrow_dispute">Escrow Dispute</option>
                          <option value="technical_issue">Technical Issue</option>
                          <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                        <textarea 
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          placeholder="Tell us exactly what you need help with..."
                          className="w-full resize-none rounded-xl border border-gray-100 bg-gray-50 px-5 py-3.5 font-medium text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition-all"
                        />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-4.5 text-base font-bold text-white shadow-xl shadow-purple-200 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Ticket
                          <Send className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Quick answers to the most common questions from our community.
                </p>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 p-2 shadow-sm">
                <div className="divide-y divide-gray-50 px-6">
                  {faqs.map((faq, i) => (
                    <FAQItem key={i} {...faq} />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-10 text-white relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Mail className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl text-white leading-tight">Direct Support</h3>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-sm">
                    Prefer direct email? You can reach our finance and platform support teams directly.
                  </p>
                  <div className="pt-4 flex flex-col gap-3">
                    <p className="flex items-center gap-3 text-sm font-bold text-white">
                      <Mail className="h-4 w-4 text-purple-400" />
                      {contactEmail}
                    </p>
                    
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
